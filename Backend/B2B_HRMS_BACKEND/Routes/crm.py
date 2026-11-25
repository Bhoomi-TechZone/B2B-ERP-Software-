from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Dict, Any, List, Optional
from uuid import UUID
import logging

from Schema.crm import (
    WebFormLeadRequest, LeadManualCreateRequest, LeadQualifyRequest,
    DemoScheduleRequest, DemoCompleteRequest, ProposalCreateRequest,
    OpportunityWonRequest, OpportunityLostRequest, LeadUpdateRequest,
    LeadAssignRequest, LeadEmailRequest, LeadActivityCreateRequest
)
from Services.crm_service import CrmService
from Utility.auth_helpers import get_current_user, verify_crm_access

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/crm", tags=["CRM"])

@router.get("/leads", summary="List Leads")
async def list_leads(
    status: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    assigned_to: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user = Depends(verify_crm_access)
):
    try:
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        leads = await CrmService.get_leads(
            tenant_id,
            status=status,
            source=source,
            priority=priority,
            assigned_to=assigned_to,
            search=search
        )
        return leads
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/opportunities", summary="List Opportunities")
async def list_opportunities(current_user = Depends(verify_crm_access)):
    try:
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        opportunities = await CrmService.get_opportunities(tenant_id)
        return opportunities
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sales-agents", summary="List Sales Agents")
async def list_sales_agents(current_user = Depends(verify_crm_access)):
    try:
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        agents = await CrmService.get_sales_agents(tenant_id)
        return [{"id": str(a.id), "name": f"{a.first_name} {a.last_name}", "email": a.email} for a in agents]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/leads/assign", summary="Assign Leads")
async def assign_leads(data: LeadAssignRequest, current_user = Depends(verify_crm_access)):
    try:
        if not data.lead_ids:
            raise HTTPException(status_code=400, detail="No lead IDs provided")
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        leads = await CrmService.assign_leads(data.lead_ids, data.assigned_to, tenant_id)
        return {"message": "Leads assigned successfully", "count": len(leads)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/leads/{lead_id}", summary="Get Lead Details")
async def get_lead_details(lead_id: str, current_user = Depends(verify_crm_access)):
    try:
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        lead = await CrmService.get_lead_by_id(UUID(lead_id), tenant_id)
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        return lead
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid lead ID format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/leads/{lead_id}", summary="Update Lead Details")
async def update_lead_details(lead_id: str, data: LeadUpdateRequest, current_user = Depends(verify_crm_access)):
    try:
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        lead = await CrmService.update_lead(UUID(lead_id), data, tenant_id)
        return lead
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/leads/{lead_id}", summary="Delete Lead")
async def delete_lead(lead_id: str, current_user = Depends(verify_crm_access)):
    try:
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        await CrmService.delete_lead(UUID(lead_id), tenant_id)
        return {"message": "Lead deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/leads/web-form", summary="Capture Lead from Web Form", status_code=status.HTTP_201_CREATED)
async def capture_web_lead(data: WebFormLeadRequest):
    """Public endpoint for web form lead capture"""
    try:
        lead = await CrmService.capture_web_lead(data)
        return {"message": "Lead captured successfully", "lead_id": str(lead.id)}
    except Exception as e:
        logger.error(f"Failed to capture web lead: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/leads", summary="Manual Lead Entry", status_code=status.HTTP_201_CREATED)
async def create_manual_lead(data: LeadManualCreateRequest, current_user = Depends(verify_crm_access)):
    """Internal CRM users create manual leads"""
    try:
        user_id = UUID(current_user.get('sub'))
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        lead = await CrmService.create_manual_lead(data, user_id, tenant_id)
        return {"message": "Lead created successfully", "lead_id": str(lead.id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/leads/{lead_id}/qualify", summary="Qualify Lead (BANT)")
async def qualify_lead(lead_id: str, data: LeadQualifyRequest, current_user = Depends(verify_crm_access)):
    """Qualify lead and potentially create an opportunity"""
    try:
        user_id = UUID(current_user.get('sub'))
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        result = await CrmService.qualify_lead(UUID(lead_id), data, user_id, tenant_id)
        return {"message": "Lead qualification processed", "result": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/opportunities/{opp_id}/demo/schedule", summary="Schedule Demo")
async def schedule_demo(opp_id: str, data: DemoScheduleRequest, current_user = Depends(verify_crm_access)):
    try:
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        opp = await CrmService.schedule_demo(UUID(opp_id), data, tenant_id)
        return {"message": "Demo scheduled", "opportunity_id": str(opp.id)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/opportunities/{opp_id}/demo/complete", summary="Complete Demo")
async def complete_demo(opp_id: str, data: DemoCompleteRequest, current_user = Depends(verify_crm_access)):
    try:
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        opp = await CrmService.complete_demo(UUID(opp_id), data, tenant_id)
        return {"message": "Demo completed", "opportunity_id": str(opp.id)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/opportunities/{opp_id}/proposals", summary="Create Proposal")
async def create_proposal(opp_id: str, data: ProposalCreateRequest, current_user = Depends(verify_crm_access)):
    try:
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        proposal = await CrmService.create_proposal(UUID(opp_id), data, tenant_id)
        return {"message": "Proposal created", "proposal_id": str(proposal.id)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/opportunities/{opp_id}/won", summary="Mark Opportunity as Won")
async def mark_opportunity_won(opp_id: str, data: OpportunityWonRequest, current_user = Depends(verify_crm_access)):
    try:
        user_id = UUID(current_user.get('sub'))
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        result = await CrmService.mark_won(UUID(opp_id), data, user_id, tenant_id)
        return {"message": "Opportunity won", "result": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/opportunities/{opp_id}/lost", summary="Mark Opportunity as Lost")
async def mark_opportunity_lost(opp_id: str, data: OpportunityLostRequest, current_user = Depends(verify_crm_access)):
    try:
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        opp = await CrmService.mark_lost(UUID(opp_id), data, tenant_id)
        return {"message": "Opportunity lost", "opportunity_id": str(opp.id)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/opportunities/{opp_id}/stage", summary="Update Opportunity Stage")
async def update_opportunity_stage(opp_id: str, stage: str = Query(...), current_user = Depends(verify_crm_access)):
    try:
        from Models.crm import OpportunityStage
        if stage not in [s.value for s in OpportunityStage]:
            raise HTTPException(status_code=400, detail=f"Invalid stage: {stage}")
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        opp = await CrmService.update_opportunity_stage(UUID(opp_id), OpportunityStage(stage), tenant_id)
        return opp
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/leads/{lead_id}/email", summary="Send Email to Lead")
async def send_lead_email(lead_id: str, data: LeadEmailRequest, current_user = Depends(verify_crm_access)):
    try:
        user_id = UUID(current_user.get('sub'))
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        user_email = current_user.get('email')
        user_name = current_user.get('name') or current_user.get('first_name')
        att_list = [att.model_dump() for att in data.attachments] if data.attachments else None
        
        result = await CrmService.send_lead_email(
            lead_id=UUID(lead_id),
            subject=data.subject,
            message=data.message,
            template=data.template,
            user_id=user_id,
            tenant_id=tenant_id,
            reply_to=user_email,
            sender_name=user_name,
            attachments=att_list
        )
        return {
            "message": "Email sent successfully" if result.get("delivery_success") else "Email logged in CRM (SMTP delivery note below)",
            "delivery_success": result.get("delivery_success", False),
            "delivery_message": result.get("delivery_message", ""),
            "activity_id": result.get("activity_id")
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/leads/{lead_id}/activities", summary="Get Activities for Lead")
async def get_lead_activities(lead_id: str, current_user = Depends(verify_crm_access)):
    try:
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        activities = await CrmService.get_lead_activities(UUID(lead_id), tenant_id)
        return activities
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/leads/{lead_id}/activities", summary="Log Activity for Lead")
async def log_lead_activity(lead_id: str, data: LeadActivityCreateRequest, current_user = Depends(verify_crm_access)):
    try:
        user_id = UUID(current_user.get('sub'))
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        activity = await CrmService.log_lead_activity(UUID(lead_id), data, user_id, tenant_id)
        return {"message": "Activity logged successfully", "activity_id": str(activity.id)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/clients", summary="Create Client from Opportunity")
async def create_client(data: Dict[str, Any], current_user = Depends(verify_crm_access)):
    """Create a new client from a won opportunity"""
    try:
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        client = await CrmService.create_client(data, tenant_id)
        return {"message": "Client created successfully", "client_id": str(client.id)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/clients", summary="Get All Clients")
async def get_clients(current_user = Depends(verify_crm_access)):
    """Get all clients"""
    try:
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        clients = await CrmService.get_clients(tenant_id)
        return clients
    except Exception as e:
        import traceback
        err_msg = traceback.format_exc()
        raise HTTPException(status_code=500, detail=f"{repr(e)} | Trace: {err_msg}")

@router.get("/clients/{client_id}", summary="Get Client Details")
async def get_client_details(client_id: str, current_user = Depends(verify_crm_access)):
    """Get details for a specific client"""
    try:
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        client = await CrmService.get_client_by_id(UUID(client_id), tenant_id)
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        return client
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid client ID format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/clients/{client_id}", summary="Update Client Details")
async def update_client_details(client_id: str, data: Dict[str, Any], current_user = Depends(verify_crm_access)):
    """Update details/custom_fields for a specific client"""
    try:
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        client = await CrmService.update_client(UUID(client_id), data, tenant_id)
        return client
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# ── Deals/Opportunities Management ─────────────────────────────────────────────

@router.get("/deals", summary="Get All Deals Grouped by Stage")
async def get_deals(current_user = Depends(verify_crm_access)):
    """Get all deals grouped by stage for kanban view"""
    try:
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        deals = await CrmService.get_deals_by_stage(tenant_id)
        return deals
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/deals/{deal_id}", summary="Get Deal Details")
async def get_deal_details(deal_id: str, current_user = Depends(verify_crm_access)):
    try:
        from Services.crm_service import CrmService
        from Models.crm import CrmOpportunity
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        opp = await CrmOpportunity.find_one(CrmOpportunity.id == UUID(deal_id), CrmOpportunity.tenant_id == tenant_id)
        if not opp:
            raise HTTPException(status_code=404, detail="Deal not found")
        
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        deals = await CrmService.get_deals_by_stage(tenant_id)
        for stage_deals in deals.values():
            for deal in stage_deals:
                if deal["id"] == deal_id:
                    return deal
        raise HTTPException(status_code=404, detail="Deal not found")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid deal ID format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/deals", summary="Create New Deal", status_code=status.HTTP_201_CREATED)
async def create_deal(data: Dict[str, Any], current_user = Depends(verify_crm_access)):
    try:
        user_id = UUID(current_user.get('sub'))
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        deal = await CrmService.create_deal(data, user_id, tenant_id)
        return {"message": "Deal created successfully", "deal_id": str(deal.id)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/deals/{deal_id}", summary="Update Deal")
async def update_deal(deal_id: str, data: Dict[str, Any], current_user = Depends(verify_crm_access)):
    try:
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        deal = await CrmService.update_deal(UUID(deal_id), data, tenant_id)
        return {"message": "Deal updated successfully", "deal_id": str(deal.id)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/deals/{deal_id}/stage", summary="Move Deal to Different Stage")
async def move_deal_stage(deal_id: str, stage: str = Query(...), current_user = Depends(verify_crm_access)):
    try:
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        deal = await CrmService.move_deal_stage(UUID(deal_id), stage, tenant_id)
        return {"message": "Deal stage updated successfully", "deal_id": str(deal.id), "new_stage": deal.stage.value}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/deals/{deal_id}", summary="Delete Deal")
async def delete_deal(deal_id: str, current_user = Depends(verify_crm_access)):
    try:
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        await CrmService.delete_deal(UUID(deal_id), tenant_id)
        return {"message": "Deal deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/deals/{deal_id}/activities", summary="Add Activity to Deal", status_code=status.HTTP_201_CREATED)
async def add_deal_activity(deal_id: str, data: Dict[str, Any], current_user = Depends(verify_crm_access)):
    try:
        user_id = UUID(current_user.get('sub'))
        tenant_id = UUID(current_user.get('tid') or current_user.get('tenant_id'))
        activity = await CrmService.add_deal_activity(UUID(deal_id), data, user_id, tenant_id)
        return {"message": "Activity added successfully", "activity_id": str(activity.id)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

