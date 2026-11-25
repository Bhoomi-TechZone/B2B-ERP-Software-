from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import logging
from uuid import UUID, uuid4

from Models.crm import (
    CrmLead, CrmOpportunity, CrmTask, CrmActivity, CrmProposal, CrmClient,
    LeadStatus, LeadSource, OpportunityStage, Priority, ActivityType
)
from Schema.crm import (
    WebFormLeadRequest, LeadManualCreateRequest, LeadQualifyRequest,
    DemoScheduleRequest, DemoCompleteRequest, ProposalCreateRequest,
    OpportunityWonRequest, OpportunityLostRequest, LeadUpdateRequest
)
from Models.tenant_user import Tenant, User, TenantStatus, UserType
from Services.registration_service import RegistrationService

logger = logging.getLogger(__name__)

class CrmService:
    
    @staticmethod
    async def capture_web_lead(data: WebFormLeadRequest, tenant_id: UUID) -> CrmLead:
        """Capture lead from website form"""
        lead = CrmLead(
            tenant_id=tenant_id,
            first_name=data.first_name,
            last_name=data.last_name,
            email=data.email.lower(),
            phone=data.phone,
            company_name=data.company_name,
            company_size=data.company_size,
            industry=data.industry,
            region=data.region,
            source=LeadSource.web_form,
            utm_source=data.utm_source,
            utm_medium=data.utm_medium,
            utm_campaign=data.utm_campaign,
            notes=data.notes,
            status=LeadStatus.new,
            deal_value=data.deal_value if data.deal_value is not None else (data.estimated_value or 0.0),
            estimated_value=data.deal_value if data.deal_value is not None else (data.estimated_value or 0.0)
        )
        await lead.insert()
        logger.info(f"New web lead captured: {lead.email}")
        return lead
        
    @staticmethod
    async def create_manual_lead(data: LeadManualCreateRequest, created_by: UUID, tenant_id: UUID) -> CrmLead:
        initial_history = []
        if data.assigned_to:
            agent = await User.find_one(User.id == data.assigned_to)
            agent_name = f"{agent.first_name} {agent.last_name}".strip() if agent else "Sales Agent"
            initial_history.append({
                "id": str(uuid4()),
                "action": "Assigned",
                "from": None,
                "to": agent_name,
                "date": datetime.utcnow().strftime("%b %d, %Y, %I:%M %p"),
                "assigned_by": "Admin"
            })

        lead = CrmLead(
            tenant_id=tenant_id,
            first_name=data.first_name,
            last_name=data.last_name,
            email=data.email.lower(),
            phone=data.phone,
            company_name=data.company_name,
            company_size=data.company_size,
            industry=data.industry,
            region=data.region,
            source=data.source,
            priority=data.priority,
            assigned_to=data.assigned_to,
            assignment_history=initial_history,
            notes=data.notes,
            status=LeadStatus.new,
            deal_value=data.deal_value if data.deal_value is not None else (data.estimated_value or 0.0),
            estimated_value=data.deal_value if data.deal_value is not None else (data.estimated_value or 0.0)
        )
        await lead.insert()
        return lead
        
    @staticmethod
    async def qualify_lead(lead_id: UUID, data: LeadQualifyRequest, user_id: UUID, tenant_id: UUID) -> Dict[str, Any]:
        """Qualify a lead and optionally create an opportunity"""
        lead = await CrmLead.find_one(CrmLead.id == lead_id, CrmLead.tenant_id == tenant_id)
        if not lead:
            raise ValueError("Lead not found")
            
        # Calculate BANT score
        score = 0
        if data.budget_confirmed: score += 25
        if data.authority_confirmed: score += 25
        if data.timeline in ["Immediate (<1 month)", "Short-term (1-3M)"]: score += 25
        elif data.timeline: score += 10
        if len(data.pain_points) > 0: score += 25
        
        lead.budget_confirmed = data.budget_confirmed
        lead.budget_notes = data.budget_notes
        lead.authority_confirmed = data.authority_confirmed
        lead.authority_notes = data.authority_notes
        lead.pain_points = data.pain_points
        lead.timeline = data.timeline
        lead.estimated_headcount = data.estimated_headcount
        lead.current_solution = data.current_solution
        lead.qualification_score = score
        
        opportunity = None
        if score >= 60:
            lead.status = LeadStatus.qualified
            # Create Opportunity
            opportunity = CrmOpportunity(
                tenant_id=tenant_id,
                lead_id=lead.id,
                name=f"{lead.company_name} - HRMS Deal",
                stage=OpportunityStage.qualified,
                headcount_estimate=data.estimated_headcount,
                assigned_to=lead.assigned_to or user_id,
                probability_pct=20
            )
            await opportunity.insert()
        else:
            lead.status = LeadStatus.contacted
            
        lead.updated_at = datetime.utcnow()
        await lead.save()
        
        return {
            "lead": lead,
            "opportunity": opportunity,
            "score": score,
            "qualified": score >= 60
        }
        
    @staticmethod
    async def schedule_demo(opportunity_id: UUID, data: DemoScheduleRequest, tenant_id: UUID) -> CrmOpportunity:
        opp = await CrmOpportunity.find_one(CrmOpportunity.id == opportunity_id, CrmOpportunity.tenant_id == tenant_id)
        if not opp:
            raise ValueError("Opportunity not found")
            
        opp.demo_type = data.demo_type
        opp.demo_date = data.demo_date
        opp.demo_duration = data.demo_duration
        opp.demo_meeting_link = data.demo_meeting_link
        opp.demo_focus_areas = data.demo_focus_areas
        opp.stage = OpportunityStage.demo_scheduled
        opp.probability_pct = 40
        
        # Also update lead status
        lead = await CrmLead.find_one(CrmLead.id == opp.lead_id)
        if lead:
            lead.status = LeadStatus.demo_scheduled
            await lead.save()
            
        opp.updated_at = datetime.utcnow()
        await opp.save()
        return opp

    @staticmethod
    async def complete_demo(opportunity_id: UUID, data: DemoCompleteRequest, tenant_id: UUID) -> CrmOpportunity:
        opp = await CrmOpportunity.find_one(CrmOpportunity.id == opportunity_id, CrmOpportunity.tenant_id == tenant_id)
        if not opp:
            raise ValueError("Opportunity not found")
        
        logger.info(f"Completing demo for opportunity {opportunity_id}")
        logger.info(f"Demo outcome: {data.demo_outcome}")
        logger.info(f"Current stage before update: {opp.stage}")
            
        opp.demo_notes = data.demo_notes
        opp.demo_outcome = data.demo_outcome
        
        # Stay at demo_done stage - user will manually send proposal
        opp.stage = OpportunityStage.demo_done
        opp.probability_pct = 50
        logger.info(f"Staying at Demo Done stage - waiting for manual proposal send")
        
        if data.follow_up_date:
            # Create a task for follow up
            task = CrmTask(
                tenant_id=tenant_id,
                opportunity_id=opp.id,
                lead_id=opp.lead_id,
                title="Demo Follow-up",
                due_date=datetime.combine(data.follow_up_date, datetime.min.time()),
                assigned_to=opp.assigned_to
            )
            await task.insert()
            
        # Update lead - stay at demo_done until proposal is sent
        lead = await CrmLead.find_one(CrmLead.id == opp.lead_id)
        if lead:
            lead.status = LeadStatus.demo_done
            await lead.save()
            
        opp.updated_at = datetime.utcnow()
        await opp.save()
        return opp
        
    @staticmethod
    async def create_proposal(opportunity_id: UUID, data: ProposalCreateRequest, tenant_id: UUID) -> CrmProposal:
        opp = await CrmOpportunity.find_one(CrmOpportunity.id == opportunity_id, CrmOpportunity.tenant_id == tenant_id)
        if not opp:
            raise ValueError("Opportunity not found")
            
        opp.plan_id = data.plan_id
        opp.stage = OpportunityStage.proposal_sent
        opp.probability_pct = 80
        await opp.save()
        
        # Update lead
        lead = await CrmLead.find_one(CrmLead.id == opp.lead_id)
        if lead:
            lead.status = LeadStatus.proposal_sent
            await lead.save()
            
        # Base pricing calculation mock
        value = data.employees_count * 10 * 100 # $10 per employee mock
        if data.contract_duration == "annual":
            value *= 12
        
        proposal = CrmProposal(
            tenant_id=tenant_id,
            opportunity_id=opp.id,
            template_id=data.template_id,
            value=value,
            currency="USD",
            terms_months=12 if data.contract_duration == "annual" else 1,
            discount_pct=data.discount_pct,
            sent_at=datetime.utcnow()
        )
        await proposal.insert()
        return proposal

    @staticmethod
    async def mark_won(opportunity_id: UUID, data: OpportunityWonRequest, user_id: UUID, tenant_id: UUID) -> Dict[str, Any]:
        opp = await CrmOpportunity.find_one(CrmOpportunity.id == opportunity_id, CrmOpportunity.tenant_id == tenant_id)
        if not opp:
            raise ValueError("Opportunity not found")
            
        opp.contract_signed_date = data.contract_signed_date
        opp.go_live_date = data.go_live_date
        opp.assigned_csm = data.assigned_csm
        opp.won_reason = data.won_reason
        opp.stage = OpportunityStage.won
        opp.probability_pct = 100
        opp.updated_at = datetime.utcnow()
        await opp.save()
        
        lead = await CrmLead.find_one(CrmLead.id == opp.lead_id)
        if lead:
            lead.status = LeadStatus.won
            await lead.save()
            
        tenant = None
        if data.auto_provision_tenant and lead:
            # Mock tenant auto provisioning
            tenant_slug = RegistrationService._generate_tenant_slug(lead.company_name)
            tenant = Tenant(
                name=lead.company_name,
                slug=tenant_slug,
                subdomain=tenant_slug,
                status=TenantStatus.active,
                plan_id=opp.plan_id,
                primary_region="US",
                primary_currency="USD",
                billing_cycle="yearly",
                company_size=lead.company_size,
                industry=lead.industry
            )
            await tenant.insert()
            
        return {
            "opportunity": opp,
            "tenant_provisioned": tenant is not None,
            "tenant_id": str(tenant.id) if tenant else None
        }

    @staticmethod
    async def mark_lost(opportunity_id: UUID, data: OpportunityLostRequest, tenant_id: UUID) -> CrmOpportunity:
        opp = await CrmOpportunity.find_one(CrmOpportunity.id == opportunity_id, CrmOpportunity.tenant_id == tenant_id)
        if not opp:
            raise ValueError("Opportunity not found")
            
        opp.lost_reason = data.lost_reason
        opp.competitor_chosen = data.competitor_chosen
        opp.lost_notes = data.lost_notes
        opp.reengage_date = data.reengage_date
        opp.stage = OpportunityStage.lost
        opp.probability_pct = 0
        opp.updated_at = datetime.utcnow()
        await opp.save()
        
        lead = await CrmLead.find_one(CrmLead.id == opp.lead_id)
        if lead:
            lead.status = LeadStatus.lost
            await lead.save()
            
        return opp

    @staticmethod
    async def get_leads(
        tenant_id: UUID,
        status: Optional[str] = None,
        source: Optional[str] = None,
        priority: Optional[str] = None,
        assigned_to: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[CrmLead]:
        find_query = {"tenant_id": tenant_id}
        if status and status != "all":
            find_query["status"] = status
        if source and source != "all":
            # Map website alias to web_form or match either
            if source in ["website", "web_form"]:
                find_query["source"] = {"$in": ["web_form", "website"]}
            else:
                find_query["source"] = source
        if priority and priority != "all":
            p_map = {"low": "cold", "medium": "warm", "high": "hot"}
            normalized_p = p_map.get(priority.lower(), priority.lower())
            find_query["priority"] = {"$in": [normalized_p, priority.capitalize(), priority.lower()]}
        if assigned_to and assigned_to != "all":
            if assigned_to == "unassigned":
                find_query["assigned_to"] = None
            else:
                try:
                    find_query["assigned_to"] = UUID(assigned_to)
                except Exception:
                    pass
        
        if search:
            search_regex = {"$regex": search, "$options": "i"}
            find_query["$or"] = [
                {"company_name": search_regex},
                {"first_name": search_regex},
                {"last_name": search_regex},
                {"email": search_regex},
                {"phone": search_regex}
            ]
        
        return await CrmLead.find(find_query).sort(-CrmLead.created_at).to_list()

    @staticmethod
    async def get_lead_by_id(lead_id: UUID, tenant_id: UUID) -> Optional[CrmLead]:
        return await CrmLead.find_one(CrmLead.id == lead_id)

    @staticmethod
    async def update_lead(lead_id: UUID, data: LeadUpdateRequest, tenant_id: UUID) -> CrmLead:
        lead = await CrmLead.find_one(CrmLead.id == lead_id, CrmLead.tenant_id == tenant_id)
        if not lead:
            raise ValueError("Lead not found")
        
        update_data = data.model_dump(exclude_unset=True)
        if "deal_value" in update_data and update_data["deal_value"] is not None:
            update_data["estimated_value"] = update_data["deal_value"]
        elif "estimated_value" in update_data and update_data["estimated_value"] is not None:
            update_data["deal_value"] = update_data["estimated_value"]
        for key, val in update_data.items():
            setattr(lead, key, val)
        
        lead.updated_at = datetime.utcnow()
        await lead.save()
        return lead

    @staticmethod
    async def delete_lead(lead_id: UUID, tenant_id: UUID) -> bool:
        lead = await CrmLead.find_one(CrmLead.id == lead_id, CrmLead.tenant_id == tenant_id)
        if not lead:
            raise ValueError("Lead not found")
        await lead.delete()
        return True

    @staticmethod
    async def assign_leads(lead_ids: List[UUID], assigned_to: Optional[UUID], tenant_id: UUID) -> List[CrmLead]:
        updated_leads = []
        new_agent = await User.find_one(User.id == assigned_to) if assigned_to else None
        new_agent_name = f"{new_agent.first_name} {new_agent.last_name}".strip() if new_agent else "Unassigned"

        for lead_id in lead_ids:
            lead = await CrmLead.find_one(CrmLead.id == lead_id, CrmLead.tenant_id == tenant_id)
            if lead:
                if lead.assignment_history is None:
                    lead.assignment_history = []

                old_assigned_to = lead.assigned_to

                if old_assigned_to:
                    old_agent = await User.find_one(User.id == old_assigned_to)
                    old_agent_name = f"{old_agent.first_name} {old_agent.last_name}".strip() if old_agent else "Previous Agent"

                    lead.assignment_history.insert(0, {
                        "id": str(uuid4()),
                        "action": "Reassigned",
                        "from": old_agent_name,
                        "to": new_agent_name,
                        "date": datetime.utcnow().strftime("%b %d, %Y, %I:%M %p"),
                        "assigned_by": "Admin"
                    })
                elif not old_assigned_to and assigned_to:
                    lead.assignment_history.insert(0, {
                        "id": str(uuid4()),
                        "action": "Assigned",
                        "from": None,
                        "to": new_agent_name,
                        "date": datetime.utcnow().strftime("%b %d, %Y, %I:%M %p"),
                        "assigned_by": "Admin"
                    })

                lead.assigned_to = assigned_to
                lead.updated_at = datetime.utcnow()
                await lead.save()
                updated_leads.append(lead)
        return updated_leads

    @staticmethod
    async def get_sales_agents(tenant_id: UUID) -> List[User]:
        # Return all platform admins or all system users who can be agents
        # Here we'll return all platform_admin users
        return await User.find(User.tenant_id == tenant_id).to_list()

    @staticmethod
    async def get_opportunities(tenant_id: UUID) -> List[Dict[str, Any]]:
        opps = await CrmOpportunity.find(CrmOpportunity.tenant_id == tenant_id).sort(-CrmOpportunity.created_at).to_list()
        res = []
        for opp in opps:
            lead = await CrmLead.find_one(CrmLead.id == opp.lead_id)
            agent_name = None
            if opp.assigned_to:
                agent = await User.find_one(User.id == opp.assigned_to)
                if agent:
                    agent_name = f"{agent.first_name} {agent.last_name}"
            
            res.append({
                "opportunity": opp,
                "lead": lead,
                "agent_name": agent_name
            })
        return res

    @staticmethod
    async def update_opportunity_stage(opportunity_id: UUID, stage: OpportunityStage, tenant_id: UUID) -> CrmOpportunity:
        opp = await CrmOpportunity.find_one(CrmOpportunity.id == opportunity_id, CrmOpportunity.tenant_id == tenant_id)
        if not opp:
            raise ValueError("Opportunity not found")
        opp.stage = stage
        opp.updated_at = datetime.utcnow()
        await opp.save()
        
        lead = await CrmLead.find_one(CrmLead.id == opp.lead_id)
        if lead:
            stage_map = {
                OpportunityStage.qualified: LeadStatus.qualified,
                OpportunityStage.demo_scheduled: LeadStatus.demo_scheduled,
                OpportunityStage.demo_done: LeadStatus.demo_done,
                OpportunityStage.proposal_sent: LeadStatus.proposal_sent,
                OpportunityStage.negotiation: LeadStatus.negotiation,
                OpportunityStage.won: LeadStatus.won,
                OpportunityStage.lost: LeadStatus.lost,
            }
            if stage in stage_map:
                lead.status = stage_map[stage]
                await lead.save()
        return opp

    @staticmethod
    async def send_lead_email(
        lead_id: UUID,
        subject: str,
        message: str,
        template: Optional[str],
        user_id: UUID,
        tenant_id: UUID,
        reply_to: Optional[str] = None,
        sender_name: Optional[str] = None,
        attachments: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        lead = await CrmLead.find_one(CrmLead.id == lead_id, CrmLead.tenant_id == tenant_id)
        if not lead:
            raise ValueError("Lead not found")
        
        # Trigger real email sending via SMTP Utility
        delivery_success = False
        delivery_message = ""
        try:
            from Utility.email_service import EmailService
            delivery_success, delivery_message = EmailService.send_custom_email(
                to_email=lead.email,
                subject=subject,
                body_text=message,
                reply_to=reply_to,
                sender_name=sender_name,
                attachments=attachments
            )
            if delivery_success:
                logger.info(f"Real SMTP email successfully sent to {lead.email}")
            else:
                logger.warning(f"SMTP delivery failed to {lead.email}: {delivery_message}")
        except Exception as smtp_err:
            delivery_message = str(smtp_err)
            logger.error(f"SMTP execution failed to send real email to {lead.email}: {smtp_err}", exc_info=True)

        att_summary = f"\n\nAttachments: {', '.join([a.get('filename', 'file') for a in attachments])}" if attachments else ""
        delivery_note = f"\nStatus: {'Sent via SMTP' if delivery_success else f'SMTP Delivery note: {delivery_message}'}"
        
        activity = CrmActivity(
            tenant_id=tenant_id,
            lead_id=lead.id,
            activity_type=ActivityType.email,
            subject=subject,
            body=f"Template: {template or 'Custom'}\n\n{message}{att_summary}{delivery_note}",
            direction="outbound",
            completed_at=datetime.utcnow(),
            created_by=user_id
        )
        await activity.insert()
        
        if lead.status == LeadStatus.new:
            lead.status = LeadStatus.contacted
            lead.updated_at = datetime.utcnow()
            await lead.save()
            
        logger.info(f"Email activity logged successfully to lead: {lead.email} with subject: {subject}")
        return {
            "activity_id": str(activity.id),
            "delivery_success": delivery_success,
            "delivery_message": delivery_message
        }

    @staticmethod
    async def get_lead_activities(lead_id: UUID, tenant_id: UUID) -> List[CrmActivity]:
        activities = await CrmActivity.find(CrmActivity.lead_id == lead_id, CrmActivity.tenant_id == tenant_id).sort(-CrmActivity.completed_at).to_list()
        return activities

    @staticmethod
    async def log_lead_activity(lead_id: UUID, req, user_id: UUID, tenant_id: UUID) -> CrmActivity:
        lead = await CrmLead.find_one(CrmLead.id == lead_id, CrmLead.tenant_id == tenant_id)
        if not lead:
            raise ValueError("Lead not found")
        
        activity = CrmActivity(
            tenant_id=tenant_id,
            lead_id=lead.id,
            activity_type=req.activity_type,
            subject=req.subject,
            body=req.body,
            outcome=req.outcome,
            direction=req.direction or "inbound",
            duration=req.duration,
            scheduled_at=req.scheduled_at,
            completed_at=req.completed_at or datetime.utcnow(),
            created_by=user_id
        )
        await activity.insert()
        
        if lead.status == LeadStatus.new:
            lead.status = LeadStatus.contacted
            lead.updated_at = datetime.utcnow()
            await lead.save()
            
        logger.info(f"Activity of type {req.activity_type} manually logged for lead {lead.id}")
        return activity

    @staticmethod
    async def create_client(data: Dict[str, Any], tenant_id: UUID) -> CrmClient:
        """Create a new client from a won opportunity"""
        client = CrmClient(
            tenant_id=tenant_id,
            company_name=data.get('company_name', ''),
            industry=data.get('industry'),
            region=data.get('location'),
            contact_name=data.get('contact_name', ''),
            email=data.get('email', ''),
            phone=data.get('phone'),
            location=data.get('location'),
            deal_value=data.get('deal_value', 0),
            currency=data.get('currency', 'USD'),
            opportunity_id=UUID(data['opportunity_id']) if isinstance(data.get('opportunity_id'), str) else data.get('opportunity_id'),
            lead_id=UUID(data['lead_id']) if isinstance(data.get('lead_id'), str) else data.get('lead_id'),
            assigned_csm=UUID(data['assigned_csm']) if isinstance(data.get('assigned_csm'), str) else data.get('assigned_csm'),
            contract_signed_date=data.get('contract_signed_date'),
            go_live_date=data.get('go_live_date'),
            account_status=data.get('status', 'active'),
            notes=data.get('notes'),
            custom_fields=data.get('custom_fields', {})
        )
        await client.insert()
        logger.info(f"New client created from opportunity: {client.company_name}")
        return client

    @staticmethod
    async def get_clients(tenant_id: UUID) -> List[Dict[str, Any]]:
        """Get all clients"""
        clients = await CrmClient.find(CrmClient.tenant_id == tenant_id).sort(-CrmClient.created_at).to_list()
        result = []
        for client in clients:
            result.append({
                "id": str(client.id),
                "company_name": client.company_name,
                "industry": client.industry,
                "region": client.region,
                "contact_name": client.contact_name,
                "email": client.email,
                "phone": client.phone,
                "location": client.location,
                "deal_value": client.deal_value,
                "currency": client.currency,
                "assigned_csm": str(client.assigned_csm) if client.assigned_csm else None,
                "account_status": client.account_status,
                "notes": client.notes,
                "custom_fields": client.custom_fields or {},
                "contract_signed_date": client.contract_signed_date.isoformat() if hasattr(client.contract_signed_date, "isoformat") else str(client.contract_signed_date) if client.contract_signed_date else None,
                "go_live_date": client.go_live_date.isoformat() if hasattr(client.go_live_date, "isoformat") else str(client.go_live_date) if client.go_live_date else None,
                "created_at": client.created_at.isoformat() if hasattr(client.created_at, "isoformat") else str(client.created_at) if client.created_at else None,
                "updated_at": client.updated_at.isoformat() if hasattr(client.updated_at, "isoformat") else str(client.updated_at) if client.updated_at else None,
            })
        return result

    @staticmethod
    async def get_client_by_id(client_id: UUID, tenant_id: UUID) -> Optional[Dict[str, Any]]:
        """Get client details by ID"""
        client = await CrmClient.find_one(CrmClient.id == client_id, CrmClient.tenant_id == tenant_id)
        if not client:
            return None
        return {
            "id": str(client.id),
            "company_name": client.company_name,
            "industry": client.industry,
            "region": client.region,
            "contact_name": client.contact_name,
            "email": client.email,
            "phone": client.phone,
            "location": client.location,
            "deal_value": client.deal_value,
            "currency": client.currency,
            "assigned_csm": str(client.assigned_csm) if client.assigned_csm else None,
            "account_status": client.account_status,
            "notes": client.notes,
            "custom_fields": client.custom_fields or {},
            "contract_signed_date": client.contract_signed_date.isoformat() if hasattr(client.contract_signed_date, "isoformat") else str(client.contract_signed_date) if client.contract_signed_date else None,
            "go_live_date": client.go_live_date.isoformat() if hasattr(client.go_live_date, "isoformat") else str(client.go_live_date) if client.go_live_date else None,
            "created_at": client.created_at.isoformat() if hasattr(client.created_at, "isoformat") else str(client.created_at) if client.created_at else None,
            "updated_at": client.updated_at.isoformat() if hasattr(client.updated_at, "isoformat") else str(client.updated_at) if client.updated_at else None,
        }

    @staticmethod
    async def update_client(client_id: UUID, data: Dict[str, Any], tenant_id: UUID) -> Dict[str, Any]:
        """Update an existing client details and merge custom fields"""
        client = await CrmClient.find_one(CrmClient.id == client_id, CrmClient.tenant_id == tenant_id)
        if not client:
            raise ValueError("Client not found")
        
        # Core fields updates
        if 'company_name' in data: client.company_name = data['company_name']
        if 'industry' in data: client.industry = data['industry']
        if 'region' in data: client.region = data['region']
        if 'contact_name' in data: client.contact_name = data['contact_name']
        if 'email' in data: client.email = data['email']
        if 'phone' in data: client.phone = data['phone']
        if 'location' in data: client.location = data['location']
        if 'deal_value' in data: client.deal_value = data['deal_value']
        if 'currency' in data: client.currency = data['currency']
        if 'account_status' in data: client.account_status = data['account_status']
        if 'notes' in data: client.notes = data['notes']
        
        # Dates
        if 'contract_signed_date' in data:
            if isinstance(data['contract_signed_date'], str):
                client.contract_signed_date = datetime.strptime(data['contract_signed_date'][:10], "%Y-%m-%d")
            else:
                client.contract_signed_date = data['contract_signed_date']
        if 'go_live_date' in data:
            if isinstance(data['go_live_date'], str):
                client.go_live_date = datetime.strptime(data['go_live_date'][:10], "%Y-%m-%d")
            else:
                client.go_live_date = data['go_live_date']
        
        # Merge custom fields
        if 'custom_fields' in data:
            if client.custom_fields is None:
                client.custom_fields = {}
            for key, val in data['custom_fields'].items():
                client.custom_fields[key] = val
                
        client.updated_at = datetime.utcnow()
        await client.save()
        
        # Return transformed client dict
        return {
            "id": str(client.id),
            "company_name": client.company_name,
            "industry": client.industry,
            "region": client.region,
            "contact_name": client.contact_name,
            "email": client.email,
            "phone": client.phone,
            "location": client.location,
            "deal_value": client.deal_value,
            "currency": client.currency,
            "assigned_csm": str(client.assigned_csm) if client.assigned_csm else None,
            "account_status": client.account_status,
            "notes": client.notes,
            "custom_fields": client.custom_fields or {},
            "contract_signed_date": client.contract_signed_date.isoformat() if hasattr(client.contract_signed_date, "isoformat") else str(client.contract_signed_date) if client.contract_signed_date else None,
            "go_live_date": client.go_live_date.isoformat() if hasattr(client.go_live_date, "isoformat") else str(client.go_live_date) if client.go_live_date else None,
            "created_at": client.created_at.isoformat() if hasattr(client.created_at, "isoformat") else str(client.created_at) if client.created_at else None,
            "updated_at": client.updated_at.isoformat() if hasattr(client.updated_at, "isoformat") else str(client.updated_at) if client.updated_at else None,
        }


    # ── Deals/Opportunities Management ────────────────────────────────────────
    
    @staticmethod
    async def get_deals_by_stage(tenant_id: UUID) -> Dict[str, List[Dict[str, Any]]]:
        """Get all deals grouped by stage for kanban view"""
        opps = await CrmOpportunity.find(CrmOpportunity.tenant_id == tenant_id).sort(-CrmOpportunity.created_at).to_list()
        result = {}
        
        for stage in OpportunityStage:
            result[stage.value] = []
        
        for opp in opps:
            lead = await CrmLead.find_one(CrmLead.id == opp.lead_id)
            agent_name = None
            if opp.assigned_to:
                agent = await User.find_one(User.id == opp.assigned_to)
                if agent:
                    agent_name = f"{agent.first_name} {agent.last_name}"
            
            # Get activities for this opportunity
            activities = await CrmActivity.find(CrmActivity.opportunity_id == opp.id).sort(-CrmActivity.completed_at).to_list()
            
            deal_data = {
                "id": str(opp.id),
                "company": lead.company_name if lead else opp.name,
                "contact": f"{lead.first_name} {lead.last_name}" if lead else "",
                "email": lead.email if lead else "",
                "phone": lead.phone if lead else "",
                "location": lead.region if lead else "",
                "value": opp.deal_value,
                "currency": opp.currency,
                "priority": opp.priority or "medium",
                "source": lead.source.value if lead else opp.source,
                "assignedTo": agent_name,
                "createdDate": opp.created_at.strftime("%Y-%m-%d") if opp.created_at else "",
                "expectedCloseDate": opp.close_date.strftime("%Y-%m-%d") if opp.close_date else "",
                "daysInStage": opp.days_in_stage,
                "stage": opp.stage.value,
                "contract": {
                    "status": opp.contract_status,
                    "sentDate": opp.contract_sent_date.strftime("%Y-%m-%d") if opp.contract_sent_date else None,
                    "signedDate": opp.contract_signed_date.strftime("%Y-%m-%d") if opp.contract_signed_date else None,
                    "file": opp.contract_file,
                    "version": opp.contract_version,
                },
                "pricing": {
                    "basePrice": opp.base_price,
                    "discountPct": opp.discount_pct,
                    "finalPrice": opp.final_price,
                    "breakdown": opp.pricing_breakdown,
                },
                "paymentTerms": {
                    "type": opp.payment_type,
                    "schedule": opp.payment_schedule,
                },
                "legal": {
                    "reviewStatus": opp.legal_review_status,
                    "reviewer": opp.legal_reviewer,
                    "notes": opp.legal_notes,
                    "reviewedDate": opp.legal_reviewed_date.strftime("%Y-%m-%d") if opp.legal_reviewed_date else None,
                },
                "approval": {
                    "status": opp.approval_status,
                    "approvers": opp.approvers,
                },
                "activities": [
                    {
                        "id": str(a.id),
                        "type": a.activity_type.value,
                        "description": a.subject,
                        "date": a.completed_at.strftime("%Y-%m-%d %I:%M %p") if a.completed_at else "",
                        "by": str(a.created_by),
                    }
                    for a in activities
                ],
                "notes": [],
                "files": [],
            }
            
            if opp.stage.value in result:
                result[opp.stage.value].append(deal_data)
        
        return result

    @staticmethod
    async def create_deal(data: Dict[str, Any], user_id: UUID, tenant_id: UUID) -> CrmOpportunity:
        """Create a new deal/opportunity"""
        # First create or find lead
        lead_data = data.get("lead", {})
        if lead_data.get("email"):
            existing_lead = await CrmLead.find_one(CrmLead.email == lead_data["email"].lower())
            if existing_lead:
                lead = existing_lead
            else:
                lead = CrmLead(
                    tenant_id=tenant_id,
                    first_name=lead_data.get("first_name", ""),
                    last_name=lead_data.get("last_name", ""),
                    email=lead_data["email"].lower(),
                    phone=lead_data.get("phone"),
                    company_name=lead_data.get("company_name", data.get("company", "")),
                    company_size=lead_data.get("company_size"),
                    industry=lead_data.get("industry"),
                    region=lead_data.get("region"),
                    source=LeadSource.manual,
                    status=LeadStatus.qualified,
                )
                await lead.insert()
        else:
            raise ValueError("Lead email is required")
        
        # Create opportunity
        opp = CrmOpportunity(
            tenant_id=tenant_id,
            lead_id=lead.id,
            name=data.get("name", f"{lead.company_name} - Deal"),
            stage=OpportunityStage(data.get("stage", "contract_sent")),
            deal_value=data.get("value", 0),
            currency=data.get("currency", "USD"),
            close_date=datetime.strptime(data["expectedCloseDate"], "%Y-%m-%d") if data.get("expectedCloseDate") else None,
            assigned_to=data.get("assigned_to"),
            probability_pct=data.get("probability_pct", 20),
            # Contract details
            contract_status=data.get("contract", {}).get("status"),
            contract_sent_date=datetime.strptime(data["contract"]["sentDate"], "%Y-%m-%d") if data.get("contract", {}).get("sentDate") else None,
            contract_file=data.get("contract", {}).get("file"),
            contract_version=data.get("contract", {}).get("version"),
            # Pricing
            base_price=data.get("pricing", {}).get("basePrice", 0),
            discount_pct=data.get("pricing", {}).get("discountPct", 0),
            final_price=data.get("pricing", {}).get("finalPrice", 0),
            pricing_breakdown=data.get("pricing", {}).get("breakdown", []),
            # Payment terms
            payment_type=data.get("paymentTerms", {}).get("type"),
            payment_schedule=data.get("paymentTerms", {}).get("schedule", []),
            # Legal
            legal_review_status=data.get("legal", {}).get("reviewStatus"),
            legal_reviewer=data.get("legal", {}).get("reviewer"),
            legal_notes=data.get("legal", {}).get("notes"),
            # Approval
            approval_status=data.get("approval", {}).get("status"),
            approvers=data.get("approval", {}).get("approvers", []),
            # Metadata
            source=data.get("source"),
            priority=data.get("priority"),
            days_in_stage=0,
        )
        await opp.insert()
        logger.info(f"New deal created: {opp.name}")
        return opp

    @staticmethod
    async def update_deal(deal_id: UUID, data: Dict[str, Any], tenant_id: UUID) -> CrmOpportunity:
        """Update an existing deal"""
        opp = await CrmOpportunity.find_one(CrmOpportunity.id == deal_id)
        if not opp:
            raise ValueError("Deal not found")
        
        # Update basic fields
        if "value" in data:
            opp.deal_value = data["value"]
        if "currency" in data:
            opp.currency = data["currency"]
        if "close_date" in data:
            opp.close_date = datetime.strptime(data["close_date"], "%Y-%m-%d") if data["close_date"] else None
        if "assigned_to" in data:
            opp.assigned_to = data["assigned_to"]
        if "priority" in data:
            opp.priority = data["priority"]
        if "probability_pct" in data:
            opp.probability_pct = data["probability_pct"]
        
        # Update contract details
        if "contract" in data:
            contract = data["contract"]
            if "status" in contract:
                opp.contract_status = contract["status"]
            if "sentDate" in contract:
                opp.contract_sent_date = datetime.strptime(contract["sentDate"], "%Y-%m-%d") if contract["sentDate"] else None
            if "signedDate" in contract:
                opp.contract_signed_date = datetime.strptime(contract["signedDate"], "%Y-%m-%d") if contract["signedDate"] else None
            if "file" in contract:
                opp.contract_file = contract["file"]
            if "version" in contract:
                opp.contract_version = contract["version"]
        
        # Update pricing
        if "pricing" in data:
            pricing = data["pricing"]
            if "basePrice" in pricing:
                opp.base_price = pricing["basePrice"]
            if "discountPct" in pricing:
                opp.discount_pct = pricing["discountPct"]
            if "finalPrice" in pricing:
                opp.final_price = pricing["finalPrice"]
            if "breakdown" in pricing:
                opp.pricing_breakdown = pricing["breakdown"]
        
        # Update payment terms
        if "paymentTerms" in data:
            payment = data["paymentTerms"]
            if "type" in payment:
                opp.payment_type = payment["type"]
            if "schedule" in payment:
                opp.payment_schedule = payment["schedule"]
        
        # Update legal
        if "legal" in data:
            legal = data["legal"]
            if "reviewStatus" in legal:
                opp.legal_review_status = legal["reviewStatus"]
            if "reviewer" in legal:
                opp.legal_reviewer = legal["reviewer"]
            if "notes" in legal:
                opp.legal_notes = legal["notes"]
            if "reviewedDate" in legal:
                opp.legal_reviewed_date = datetime.strptime(legal["reviewedDate"], "%Y-%m-%d") if legal["reviewedDate"] else None
        
        # Update approval
        if "approval" in data:
            approval = data["approval"]
            if "status" in approval:
                opp.approval_status = approval["status"]
            if "approvers" in approval:
                opp.approvers = approval["approvers"]
        
        opp.updated_at = datetime.utcnow()
        await opp.save()
        return opp

    @staticmethod
    async def move_deal_stage(deal_id: UUID, new_stage: str, tenant_id: UUID) -> CrmOpportunity:
        """Move a deal to a different stage"""
        opp = await CrmOpportunity.find_one(CrmOpportunity.id == deal_id, CrmOpportunity.tenant_id == tenant_id)
        if not opp:
            raise ValueError("Deal not found")
        
        try:
            stage_enum = OpportunityStage(new_stage)
        except ValueError:
            raise ValueError(f"Invalid stage: {new_stage}")
        
        opp.stage = stage_enum
        opp.days_in_stage = 0
        opp.updated_at = datetime.utcnow()
        await opp.save()
        
        # Update lead status accordingly
        lead = await CrmLead.find_one(CrmLead.id == opp.lead_id)
        if lead:
            stage_map = {
                OpportunityStage.qualified: LeadStatus.qualified,
                OpportunityStage.demo_scheduled: LeadStatus.demo_scheduled,
                OpportunityStage.demo_done: LeadStatus.demo_done,
                OpportunityStage.proposal_sent: LeadStatus.proposal_sent,
                OpportunityStage.negotiation: LeadStatus.negotiation,
                OpportunityStage.contract_sent: LeadStatus.proposal_sent,
                OpportunityStage.under_review: LeadStatus.negotiation,
                OpportunityStage.approved: LeadStatus.negotiation,
                OpportunityStage.signed: LeadStatus.negotiation,
                OpportunityStage.won: LeadStatus.won,
                OpportunityStage.lost: LeadStatus.lost,
            }
            if stage_enum in stage_map:
                lead.status = stage_map[stage_enum]
                await lead.save()
        
        return opp

    @staticmethod
    async def delete_deal(deal_id: UUID, tenant_id: UUID) -> bool:
        """Delete a deal"""
        opp = await CrmOpportunity.find_one(CrmOpportunity.id == deal_id, CrmOpportunity.tenant_id == tenant_id)
        if not opp:
            raise ValueError("Deal not found")
        
        # Delete associated activities
        await CrmActivity.find(CrmActivity.opportunity_id == deal_id).delete()
        
        # Delete the opportunity
        await opp.delete()
        return True

    @staticmethod
    async def add_deal_activity(deal_id: UUID, activity_data: Dict[str, Any], user_id: UUID, tenant_id: UUID) -> CrmActivity:
        """Add an activity to a deal"""
        opp = await CrmOpportunity.find_one(CrmOpportunity.id == deal_id, CrmOpportunity.tenant_id == tenant_id)
        if not opp:
            raise ValueError("Deal not found")
        
        activity = CrmActivity(
            tenant_id=tenant_id,
            opportunity_id=opp.id,
            lead_id=opp.lead_id,
            activity_type=ActivityType(activity_data.get("type", "note")),
            subject=activity_data.get("description", ""),
            body=activity_data.get("body"),
            completed_at=datetime.utcnow(),
            created_by=user_id
        )
        await activity.insert()
        return activity

