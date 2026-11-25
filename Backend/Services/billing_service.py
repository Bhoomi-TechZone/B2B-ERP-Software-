"""
Billing and subscription management service
"""
from typing import Optional, List, Dict, Any, Tuple
from uuid import UUID
from datetime import datetime, date, timedelta
from decimal import Decimal

from Models.billing import (
    TenantSubscription, BillingEvent, Invoice, Refund, TenantModule, SSOConfiguration,
    BillingCycle, SubscriptionStatus, InvoiceStatus, BillingEventType, RefundReason,
    PaymentMethod
)
from Models.tenant_user import Tenant
from Models.plan import Plan
from Utility.exceptions import ValidationError, NotFoundError

class BillingService:
    """Service for managing tenant billing and subscriptions"""
    
    @staticmethod
    def get_plan_price(plan: Plan, currency: Optional[str], cycle: Any) -> float:
        """Resolve correct plan pricing based on tenant currency and billing cycle"""
        curr = (currency or "USD").upper()
        cycle_str = str(cycle.value if hasattr(cycle, 'value') else cycle).lower()
        is_yearly = cycle_str in ["yearly", "annual"]

        if curr == "INR":
            price = plan.price_yearly_inr if is_yearly else plan.price_monthly_inr
        elif curr == "GBP":
            price = plan.price_yearly_gbp if is_yearly else plan.price_monthly_gbp
        elif curr == "EUR":
            price = plan.price_yearly_eur if is_yearly else plan.price_monthly_eur
        else:  # USD / default
            price = plan.price_yearly_usd if is_yearly else plan.price_monthly_usd

        return float(price if price is not None else 0)

    @staticmethod
    async def get_tenant_subscription(tenant_id: UUID) -> Optional[TenantSubscription]:
        """Get current subscription for tenant, with auto-healing and currency/cycle synchronization"""
        sub = await TenantSubscription.find_one(
            TenantSubscription.tenant_id == tenant_id
        )
        if not sub:
            try:
                sub = await TenantSubscription.find_one(
                    TenantSubscription.tenant_id == str(tenant_id)
                )
            except Exception:
                pass

        if not sub:
            return await BillingService._auto_provision_subscription(tenant_id)

        # Synchronize subscription price and cycle with tenant's chosen currency & cycle
        try:
            tenant = await Tenant.find_one(Tenant.id == tenant_id)
            if tenant:
                plan = await Plan.find_one(Plan.id == sub.plan_id)
                if not plan:
                    try:
                        plan = await Plan.find_one({"_id": sub.plan_id})
                    except Exception:
                        pass
                
                if plan:
                    expected_currency = (tenant.primary_currency or sub.currency or "USD").upper()
                    raw_cycle = sub.billing_cycle or tenant.billing_cycle
                    raw_cycle_str = str(raw_cycle.value if hasattr(raw_cycle, 'value') else raw_cycle).lower()
                    expected_cycle = BillingCycle.yearly if raw_cycle_str in ["annual", "yearly"] else BillingCycle.monthly
                    
                    correct_price = BillingService.get_plan_price(plan, expected_currency, expected_cycle)
                    
                    needs_update = False
                    if sub.currency != expected_currency:
                        sub.currency = expected_currency
                        needs_update = True
                    
                    if sub.billing_cycle != expected_cycle:
                        sub.billing_cycle = expected_cycle
                        needs_update = True

                    if sub.base_price != correct_price:
                        sub.base_price = correct_price
                        discount = getattr(sub, 'discount_percentage', 0.0) or 0.0
                        sub.final_price = correct_price * (1 - discount / 100)
                        needs_update = True

                    if needs_update:
                        sub.updated_at = datetime.utcnow()
                        await sub.save()
        except Exception as sync_err:
            pass

        return sub

    @staticmethod
    async def _auto_provision_subscription(tenant_id: UUID) -> Optional[TenantSubscription]:
        """Auto-create a subscription for an existing tenant if one does not exist"""
        try:
            tenant = await Tenant.find_one(Tenant.id == tenant_id)
            if not tenant:
                try:
                    tenant = await Tenant.find_one(Tenant.id == str(tenant_id))
                except Exception:
                    pass
            if not tenant:
                return None

            # Find matching plan
            plan = None
            if tenant.plan_id:
                plan = await Plan.find_one(Plan.id == tenant.plan_id)
                if not plan:
                    try:
                        plan = await Plan.find_one({"_id": tenant.plan_id})
                    except Exception:
                        pass

            if not plan:
                plan = await Plan.find_one(Plan.is_active == True)
            if not plan:
                plan = await Plan.find_one()

            if not plan:
                return None

            cycle = BillingCycle.monthly
            if tenant.billing_cycle:
                try:
                    val = tenant.billing_cycle.value if hasattr(tenant.billing_cycle, 'value') else str(tenant.billing_cycle)
                    cycle = BillingCycle(val.lower())
                except Exception:
                    cycle = BillingCycle.monthly

            now = datetime.utcnow()
            trial_days = None
            if tenant.trial_ends_at:
                t_end = tenant.trial_ends_at.replace(tzinfo=None) if tenant.trial_ends_at.tzinfo else tenant.trial_ends_at
                if t_end > now:
                    trial_days = max(1, (t_end - now).days)
                else:
                    trial_days = None
            elif getattr(plan, "has_trial", True):
                trial_days = getattr(plan, "trial_days", 14)

            return await BillingService.create_subscription(
                tenant_id=tenant.id,
                plan_id=plan.id,
                billing_cycle=cycle,
                trial_days=trial_days
            )
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Error auto-provisioning subscription for tenant {tenant_id}: {e}")
            return None
    
    @staticmethod
    async def create_subscription(
        tenant_id: UUID,
        plan_id: UUID,
        billing_cycle: BillingCycle,
        stripe_customer_id: Optional[str] = None,
        trial_days: Optional[int] = None,
        promo_code: Optional[str] = None,
        discount_percentage: float = 0.0,
        created_by: Optional[UUID] = None
    ) -> TenantSubscription:
        """Create a new subscription for tenant"""
        
        # Get plan details
        plan = await Plan.find_one(Plan.id == plan_id)
        if not plan:
            try:
                plan = await Plan.find_one({"_id": plan_id})
            except Exception:
                pass
        if not plan:
            raise NotFoundError("Plan not found")
        
        # Resolve tenant currency
        currency = "USD"
        try:
            tenant = await Tenant.find_one(Tenant.id == tenant_id)
            if tenant and tenant.primary_currency:
                currency = tenant.primary_currency.upper()
        except Exception:
            pass

        # Calculate pricing based on tenant currency and billing cycle
        base_price = BillingService.get_plan_price(plan, currency, billing_cycle)
        final_price = base_price * (1 - discount_percentage / 100)
        
        # Set subscription period
        now = datetime.utcnow()
        if trial_days and trial_days > 0:
            trial_ends_at = now + timedelta(days=trial_days)
            current_period_start = trial_ends_at
            status = SubscriptionStatus.trialing
        else:
            trial_ends_at = None
            current_period_start = now
            status = SubscriptionStatus.active
        
        # Calculate period end
        is_yearly = str(billing_cycle.value if hasattr(billing_cycle, 'value') else billing_cycle).lower() in ["yearly", "annual"]
        if is_yearly:
            current_period_end = current_period_start + timedelta(days=365)
        else:
            current_period_end = current_period_start + timedelta(days=30)

        subscription = TenantSubscription(
            tenant_id=tenant_id,
            plan_id=plan_id,
            plan_name=plan.name,
            billing_cycle=billing_cycle,
            status=status,
            current_period_start=current_period_start,
            current_period_end=current_period_end,
            trial_ends_at=trial_ends_at,
            base_price=base_price,
            discount_percentage=discount_percentage,
            promo_code=promo_code,
            final_price=final_price,
            currency=currency,
            max_employees=plan.max_employees if plan.max_employees > 0 else 50,
            max_admin_users=plan.max_admin_users if plan.max_admin_users > 0 else 5,
            stripe_customer_id=stripe_customer_id,
            next_billing_date=current_period_end,
            created_by=created_by
        )
        
        await subscription.insert()
        
        # Log billing event
        await BillingService._log_billing_event(
            tenant_id=tenant_id,
            subscription_id=subscription.id,
            event_type=BillingEventType.subscription_created,
            description=f"Subscription created for plan {plan.name}",
            amount=final_price,
            performed_by=created_by
        )
        
        return subscription
    
    @staticmethod
    async def change_plan(
        tenant_id: UUID,
        new_plan_id: UUID,
        change_immediately: bool = True,
        performed_by: Optional[UUID] = None
    ) -> TenantSubscription:
        """Change subscription plan"""
        
        subscription = await BillingService.get_tenant_subscription(tenant_id)
        if not subscription:
            raise NotFoundError("Subscription not found")
        
        new_plan = await Plan.find_one(Plan.id == new_plan_id)
        if not new_plan:
            raise NotFoundError("Plan not found")
        
        old_plan_name = subscription.plan_name
        old_price = subscription.final_price
        
        # Calculate new pricing based on subscription currency
        curr = getattr(subscription, "currency", "USD") or "USD"
        base_price = BillingService.get_plan_price(new_plan, curr, subscription.billing_cycle)
        new_final_price = base_price * (1 - subscription.discount_percentage / 100)
        
        if change_immediately:
            # Update subscription immediately
            subscription.plan_id = new_plan_id
            subscription.plan_name = new_plan.name
            subscription.base_price = base_price
            subscription.final_price = new_final_price
            subscription.max_employees = new_plan.max_employees
            subscription.max_admin_users = new_plan.max_admin_users
            subscription.updated_at = datetime.utcnow()
            subscription.updated_by = performed_by
            
            await subscription.save()

            # Synchronize tenant.plan_id on the Tenant document as well
            db_tenant = await Tenant.find_one(Tenant.id == tenant_id)
            if db_tenant:
                db_tenant.plan_id = new_plan_id
                db_tenant.updated_at = datetime.utcnow()
                await db_tenant.save()

            # Refresh TenantModule plan defaults if present
            tenant_module = await TenantModule.find_one(TenantModule.tenant_id == tenant_id)
            if tenant_module and tenant_module.use_plan_defaults:
                from Services.module_service import ModuleService
                await ModuleService._apply_plan_defaults(tenant_module, tenant_id, new_plan)
                await tenant_module.save()
            
            # Log billing event
            await BillingService._log_billing_event(
                tenant_id=tenant_id,
                subscription_id=subscription.id,
                event_type=BillingEventType.plan_changed,
                description=f"Plan changed from {old_plan_name} to {new_plan.name} (immediate)",
                amount=new_final_price - old_price,
                performed_by=performed_by,
                metadata={
                    "old_plan": old_plan_name,
                    "new_plan": new_plan.name,
                    "price_change": new_final_price - old_price
                }
            )
        else:
            # Schedule plan change for next billing period
            await BillingService._log_billing_event(
                tenant_id=tenant_id,
                subscription_id=subscription.id,
                event_type=BillingEventType.plan_changed,
                description=f"Plan change scheduled from {old_plan_name} to {new_plan.name} (at period end)",
                amount=new_final_price - old_price,
                performed_by=performed_by,
                metadata={
                    "old_plan": old_plan_name,
                    "new_plan": new_plan.name,
                    "scheduled_for": subscription.current_period_end.isoformat(),
                    "price_change": new_final_price - old_price
                }
            )
        
        return subscription
    
    @staticmethod
    async def apply_discount(
        tenant_id: UUID,
        discount_percentage: float,
        reason: str,
        performed_by: UUID
    ) -> TenantSubscription:
        """Apply discount to subscription"""
        
        if discount_percentage < 0 or discount_percentage > 100:
            raise ValidationError("Discount percentage must be between 0 and 100")
        
        subscription = await BillingService.get_tenant_subscription(tenant_id)
        if not subscription:
            raise NotFoundError("Subscription not found")
        
        old_discount = subscription.discount_percentage
        old_price = subscription.final_price
        
        # Update discount
        subscription.discount_percentage = discount_percentage
        subscription.discount_reason = reason
        subscription.final_price = subscription.base_price * (1 - discount_percentage / 100)
        subscription.updated_at = datetime.utcnow()
        subscription.updated_by = performed_by
        
        await subscription.save()
        
        # Log billing event
        await BillingService._log_billing_event(
            tenant_id=tenant_id,
            subscription_id=subscription.id,
            event_type=BillingEventType.discount_applied,
            description=f"Discount changed from {old_discount}% to {discount_percentage}%",
            amount=subscription.final_price - old_price,
            performed_by=performed_by,
            reason=reason,
            metadata={
                "old_discount": old_discount,
                "new_discount": discount_percentage,
                "price_change": subscription.final_price - old_price
            }
        )
        
        return subscription
    
    @staticmethod
    async def extend_trial(
        tenant_id: UUID,
        extension_days: int,
        reason: str,
        performed_by: UUID
    ) -> TenantSubscription:
        """Extend trial period"""
        
        if extension_days <= 0 or extension_days > 60:
            raise ValidationError("Trial extension must be between 1 and 60 days")
        
        subscription = await BillingService.get_tenant_subscription(tenant_id)
        if not subscription:
            raise NotFoundError("Subscription not found")
        
        if subscription.status != SubscriptionStatus.trialing:
            raise ValidationError("Subscription is not in trial status")
        
        old_trial_end = subscription.trial_ends_at
        new_trial_end = subscription.trial_ends_at + timedelta(days=extension_days)
        
        subscription.trial_ends_at = new_trial_end
        subscription.current_period_start = new_trial_end
        subscription.current_period_end = new_trial_end + (
            timedelta(days=30) if subscription.billing_cycle == BillingCycle.monthly 
            else timedelta(days=365)
        )
        subscription.next_billing_date = subscription.current_period_end
        subscription.updated_at = datetime.utcnow()
        subscription.updated_by = performed_by
        
        await subscription.save()
        
        # Log billing event
        await BillingService._log_billing_event(
            tenant_id=tenant_id,
            subscription_id=subscription.id,
            event_type=BillingEventType.trial_extended,
            description=f"Trial extended by {extension_days} days",
            performed_by=performed_by,
            reason=reason,
            metadata={
                "extension_days": extension_days,
                "old_trial_end": old_trial_end.isoformat() if old_trial_end else None,
                "new_trial_end": new_trial_end.isoformat()
            }
        )
        
        return subscription
    
    @staticmethod
    async def update_subscription_status(
        tenant_id: UUID,
        new_status: SubscriptionStatus,
        reason: Optional[str] = None,
        performed_by: Optional[UUID] = None
    ) -> TenantSubscription:
        """Update subscription status"""
        
        subscription = await BillingService.get_tenant_subscription(tenant_id)
        if not subscription:
            raise NotFoundError("Subscription not found")
        
        old_status = subscription.status
        subscription.status = new_status
        subscription.updated_at = datetime.utcnow()
        subscription.updated_by = performed_by
        
        # Handle specific status changes
        if new_status == SubscriptionStatus.cancelled:
            subscription.cancel_at_period_end = True
        elif new_status == SubscriptionStatus.suspended:
            # Immediate suspension
            pass
        elif new_status == SubscriptionStatus.active and old_status in [SubscriptionStatus.suspended, SubscriptionStatus.cancelled]:
            # Reactivation
            subscription.cancel_at_period_end = False
        
        await subscription.save()
        
        # Determine event type
        if new_status == SubscriptionStatus.suspended:
            event_type = BillingEventType.subscription_suspended
        elif new_status == SubscriptionStatus.cancelled:
            event_type = BillingEventType.subscription_cancelled
        elif new_status == SubscriptionStatus.active and old_status in [SubscriptionStatus.suspended, SubscriptionStatus.cancelled]:
            event_type = BillingEventType.subscription_reactivated
        else:
            event_type = BillingEventType.subscription_updated
        
        # Log billing event
        await BillingService._log_billing_event(
            tenant_id=tenant_id,
            subscription_id=subscription.id,
            event_type=event_type,
            description=f"Subscription status changed from {old_status} to {new_status}",
            performed_by=performed_by,
            reason=reason,
            metadata={
                "old_status": old_status,
                "new_status": new_status
            }
        )
        
        return subscription
    
    @staticmethod
    async def get_billing_history(
        tenant_id: UUID,
        page: int = 1,
        per_page: int = 20
    ) -> Tuple[List[Invoice], int]:
        """Get billing history for tenant"""
        
        skip = (page - 1) * per_page
        
        invoices = await Invoice.find(
            Invoice.tenant_id == tenant_id
        ).sort("-created_at").skip(skip).limit(per_page).to_list()
        
        # Use motor collection directly for count to avoid Beanie version issues
        collection = Invoice.get_motor_collection()
        total = await collection.count_documents({"tenant_id": str(tenant_id)})
        
        return invoices, total
    
    @staticmethod
    async def create_manual_invoice(
        tenant_id: UUID,
        amount: float,
        description: str,
        created_by: UUID,
        due_days: int = 30
    ) -> Invoice:
        """Create a manual invoice"""
        
        # Generate invoice number
        collection = Invoice.get_motor_collection()
        invoice_count = await collection.count_documents({"tenant_id": str(tenant_id)})
        invoice_number = f"INV-{tenant_id.hex[:8].upper()}-{invoice_count + 1:04d}"
        
        invoice = Invoice(
            tenant_id=tenant_id,
            invoice_number=invoice_number,
            status=InvoiceStatus.open,
            subtotal=amount,
            total_amount=amount,
            issue_date=date.today(),
            due_date=date.today() + timedelta(days=due_days),
            is_manual=True,
            line_items=[{
                "description": description,
                "amount": amount,
                "quantity": 1
            }]
        )
        
        await invoice.insert()
        
        # Log billing event
        await BillingService._log_billing_event(
            tenant_id=tenant_id,
            event_type=BillingEventType.manual_invoice_created,
            description=f"Manual invoice created: {description}",
            amount=amount,
            performed_by=created_by,
            invoice_id=invoice.id
        )
        
        return invoice
    
    @staticmethod
    async def issue_refund(
        tenant_id: UUID,
        invoice_id: UUID,
        amount: float,
        reason: RefundReason,
        processed_by: UUID,
        reason_description: Optional[str] = None
    ) -> Refund:
        """Issue a refund"""
        
        invoice = await Invoice.find_one(
            Invoice.id == invoice_id,
            Invoice.tenant_id == tenant_id
        )
        if not invoice:
            raise NotFoundError("Invoice not found")
        
        if amount <= 0 or amount > invoice.total_amount:
            raise ValidationError("Invalid refund amount")
        
        # Get admin user name
        from Models.tenant_user import User
        admin_user = await User.find_one(User.id == processed_by)
        admin_name = f"{admin_user.first_name} {admin_user.last_name}" if admin_user else "Unknown"
        
        refund = Refund(
            tenant_id=tenant_id,
            invoice_id=invoice_id,
            amount=amount,
            reason=reason,
            reason_description=reason_description,
            processed_by=processed_by,
            processed_by_name=admin_name,
            status="succeeded"  # Assuming immediate success for manual refunds
        )
        
        await refund.insert()
        
        # Update invoice status
        if amount == invoice.total_amount:
            invoice.status = InvoiceStatus.refunded
        else:
            invoice.status = InvoiceStatus.partially_refunded
        await invoice.save()
        
        # Log billing event
        await BillingService._log_billing_event(
            tenant_id=tenant_id,
            event_type=BillingEventType.refund_issued,
            description=f"Refund issued: ${amount} for {reason.value}",
            amount=-amount,  # Negative amount for refund
            performed_by=processed_by,
            invoice_id=invoice_id,
            reason=reason_description,
            metadata={
                "refund_id": str(refund.id),
                "refund_reason": reason.value,
                "original_amount": invoice.total_amount
            }
        )
        
        return refund
    
    @staticmethod
    async def get_billing_events(
        tenant_id: UUID,
        page: int = 1,
        per_page: int = 50
    ) -> Tuple[List[BillingEvent], int]:
        """Get billing events for tenant"""
        
        skip = (page - 1) * per_page
        
        events = await BillingEvent.find(
            BillingEvent.tenant_id == tenant_id
        ).sort("-created_at").skip(skip).limit(per_page).to_list()
        
        # Use motor collection directly for count
        collection = BillingEvent.get_motor_collection()
        total = await collection.count_documents({"tenant_id": str(tenant_id)})
        
        return events, total
    
    @staticmethod
    async def _log_billing_event(
        tenant_id: UUID,
        event_type: BillingEventType,
        description: str,
        subscription_id: Optional[UUID] = None,
        amount: Optional[float] = None,
        performed_by: Optional[UUID] = None,
        reason: Optional[str] = None,
        invoice_id: Optional[UUID] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Log a billing event"""
        
        # Get performer name if available
        performed_by_name = None
        if performed_by:
            from Models.tenant_user import User
            user = await User.find_one(User.id == performed_by)
            if user:
                performed_by_name = f"{user.first_name} {user.last_name}"
        
        event = BillingEvent(
            tenant_id=tenant_id,
            subscription_id=subscription_id,
            event_type=event_type,
            description=description,
            amount=amount,
            performed_by=performed_by,
            performed_by_name=performed_by_name,
            reason=reason,
            invoice_id=invoice_id,
            metadata=metadata or {}
        )
        
        await event.insert()