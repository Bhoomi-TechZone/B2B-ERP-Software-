from beanie import Document
from pydantic import Field, EmailStr
from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID, uuid4
import enum

# ==========================================
# ENUMS
# ==========================================

class LeadSource(str, enum.Enum):
    email = "email"
    ppc_google = "ppc_google"
    meta_ads = "meta_ads"
    local_listing = "local_listing"
    web_form = "web_form"
    referral = "referral"
    linkedin = "linkedin"
    manual = "manual"

class LeadStatus(str, enum.Enum):
    new = "new"
    contacted = "contacted"
    qualified = "qualified"
    demo_scheduled = "demo_scheduled"
    demo_done = "demo_done"
    proposal_sent = "proposal_sent"
    negotiation = "negotiation"
    won = "won"
    lost = "lost"
    dormant = "dormant"
    converted = "converted"

class Priority(str, enum.Enum):
    hot = "hot"
    warm = "warm"
    cold = "cold"

class OpportunityStage(str, enum.Enum):
    qualified = "qualified"
    demo_scheduled = "demo_scheduled"
    demo_done = "demo_done"
    proposal_sent = "proposal_sent"
    negotiation = "negotiation"
    contract_sent = "contract_sent"
    under_review = "under_review"
    approved = "approved"
    signed = "signed"
    won = "won"
    lost = "lost"

class ActivityType(str, enum.Enum):
    call = "call"
    email = "email"
    meeting = "meeting"
    demo = "demo"
    note = "note"
    task = "task"

# ==========================================
# MODELS
# ==========================================

class CrmLead(Document):
    """Lead captured for the B2B HRMS platform"""
    id: UUID = Field(default_factory=uuid4, alias="_id")
    tenant_id: UUID
    
    # Contact Details
    first_name: str = Field(..., max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    job_title: Optional[str] = Field(None, max_length=100)
    
    # Company Details
    company_name: str = Field(..., max_length=200)
    company_size: Optional[str] = Field(None, max_length=50) # e.g. "1-10", "11-50"
    industry: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=100) # e.g. US, UK, IN, Uttar Pradesh
    
    # Source & Attribution
    source: LeadSource = Field(default=LeadSource.manual)
    source_detail: Optional[str] = Field(None, max_length=200)
    campaign_id: Optional[str] = None
    ad_id: Optional[str] = None
    ad_group_id: Optional[str] = None
    gclid: Optional[str] = None
    fb_lead_id: Optional[str] = None
    li_lead_id: Optional[str] = None
    
    # UTM
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_content: Optional[str] = None
    utm_term: Optional[str] = None
    
    referrer_tenant_id: Optional[UUID] = None
    
    # Status & Assignment
    status: LeadStatus = Field(default=LeadStatus.new)
    assigned_to: Optional[UUID] = None # FK to internal users
    assignment_history: List[Dict[str, Any]] = Field(default_factory=list)
    priority: Optional[Priority] = None
    notes: Optional[str] = None
    deal_value: Optional[float] = Field(default=0.0)
    estimated_value: Optional[float] = Field(default=0.0)
    
    # Qualification (BANT)
    budget_confirmed: bool = False
    budget_notes: Optional[str] = None
    authority_confirmed: bool = False
    authority_notes: Optional[str] = None
    pain_points: List[str] = Field(default_factory=list)
    timeline: Optional[str] = None
    estimated_headcount: Optional[int] = None
    current_solution: Optional[str] = None
    qualification_score: int = Field(default=0)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "crm_leads"
        indexes = ["tenant_id", "email", "status", "assigned_to", "source"]

class CrmOpportunity(Document):
    id: UUID = Field(default_factory=uuid4, alias="_id")
    tenant_id: UUID
    lead_id: UUID
    name: str = Field(..., max_length=200)
    stage: OpportunityStage = Field(default=OpportunityStage.qualified)
    
    deal_value: int = 0 # cents/paise
    currency: str = Field(default="USD", max_length=3)
    plan_id: Optional[UUID] = None
    headcount_estimate: Optional[int] = None
    
    close_date: Optional[datetime] = None
    probability_pct: int = Field(default=0, ge=0, le=100)
    assigned_to: Optional[UUID] = None
    
    # Demo Management
    demo_type: Optional[str] = None
    demo_date: Optional[datetime] = None
    demo_duration: Optional[int] = None # minutes
    demo_meeting_link: Optional[str] = None
    demo_focus_areas: List[str] = Field(default_factory=list)
    demo_notes: Optional[str] = None
    demo_outcome: Optional[str] = None
    
    # Won/Lost Details
    contract_signed_date: Optional[datetime] = None
    go_live_date: Optional[datetime] = None
    assigned_csm: Optional[UUID] = None
    won_reason: List[str] = Field(default_factory=list)
    
    lost_reason: Optional[str] = None
    competitor_chosen: Optional[str] = None
    lost_notes: Optional[str] = None
    reengage_date: Optional[datetime] = None
    
    # Contract Details
    contract_status: Optional[str] = None  # sent, under-review, approved, signed, rejected
    contract_sent_date: Optional[datetime] = None
    contract_signed_date: Optional[datetime] = None
    contract_file: Optional[str] = None
    contract_version: Optional[str] = None
    
    # Pricing Details
    base_price: int = 0
    discount_pct: float = 0.0
    final_price: int = 0
    pricing_breakdown: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Payment Terms
    payment_type: Optional[str] = None  # milestone, net30, net60, upfront, installment
    payment_schedule: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Legal Review
    legal_review_status: Optional[str] = None  # pending, in-review, approved, rejected
    legal_reviewer: Optional[str] = None
    legal_notes: Optional[str] = None
    legal_reviewed_date: Optional[datetime] = None
    
    # Approval Workflow
    approval_status: Optional[str] = None  # pending, in-progress, in-review, approved, rejected
    approvers: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Additional metadata
    days_in_stage: int = 0
    source: Optional[str] = None
    priority: Optional[str] = None  # high, medium, low
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "crm_opportunities"
        indexes = ["tenant_id", "lead_id", "stage", "assigned_to"]

class CrmActivity(Document):
    id: UUID = Field(default_factory=uuid4, alias="_id")
    tenant_id: UUID
    lead_id: Optional[UUID] = None
    opportunity_id: Optional[UUID] = None
    
    activity_type: ActivityType
    subject: str = Field(..., max_length=200)
    body: Optional[str] = None
    outcome: Optional[str] = None
    direction: Optional[str] = None # inbound/outbound
    duration: Optional[str] = None
    
    scheduled_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_by: UUID
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "crm_activities"
        indexes = ["tenant_id", "lead_id", "opportunity_id"]

class CrmTask(Document):
    id: UUID = Field(default_factory=uuid4, alias="_id")
    tenant_id: UUID
    lead_id: Optional[UUID] = None
    opportunity_id: Optional[UUID] = None
    
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Priority = Field(default=Priority.warm)
    assigned_to: UUID
    
    status: str = Field(default="pending") # pending, completed
    reminder_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "crm_tasks"
        indexes = ["tenant_id", "assigned_to", "status", "lead_id"]

class CrmProposal(Document):
    id: UUID = Field(default_factory=uuid4, alias="_id")
    tenant_id: UUID
    opportunity_id: UUID
    
    template_id: Optional[str] = None
    status: str = Field(default="draft") # draft, sent, viewed, signed, rejected
    
    value: int
    currency: str = Field(..., max_length=3)
    terms_months: int = 12
    discount_pct: float = 0.0
    
    sent_at: Optional[datetime] = None
    viewed_at: Optional[datetime] = None
    signed_at: Optional[datetime] = None
    
    file_url: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "crm_proposals"
        indexes = ["tenant_id", "opportunity_id"]

class CrmClient(Document):
    """Client created from won opportunity"""
    id: UUID = Field(default_factory=uuid4, alias="_id")
    tenant_id: UUID
    
    # Company Details
    company_name: str = Field(..., max_length=200)
    industry: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=100)
    
    # Contact Details
    contact_name: str = Field(..., max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    location: Optional[str] = Field(None, max_length=100)
    
    # Deal Details
    deal_value: int = 0  # cents/paise
    currency: str = Field(default="USD", max_length=3)
    opportunity_id: Optional[UUID] = None  # FK to Opportunity
    lead_id: Optional[UUID] = None  # FK to Lead
    
    # Account Management
    assigned_csm: Optional[UUID] = None  # Customer Success Manager
    account_status: str = Field(default="active")  # active, onboarding, churned
    
    # Dates
    contract_signed_date: Optional[datetime] = None
    go_live_date: Optional[datetime] = None
    renewal_date: Optional[datetime] = None
    
    # Additional Details
    notes: Optional[str] = None
    custom_fields: Dict[str, Any] = Field(default_factory=dict)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "crm_clients"
        indexes = ["tenant_id", "email", "opportunity_id", "lead_id", "account_status"]
