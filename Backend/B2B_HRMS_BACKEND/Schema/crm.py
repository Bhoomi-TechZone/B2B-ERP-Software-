from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID
from Models.crm import LeadSource, LeadStatus, Priority, OpportunityStage, ActivityType

def _normalize_lead_source(v):
    if isinstance(v, str):
        v_clean = v.strip().lower()
        mapping = {
            "website": LeadSource.web_form,
            "web": LeadSource.web_form,
            "web_form": LeadSource.web_form,
            "cold_call": LeadSource.manual,
            "call": LeadSource.manual,
            "manual": LeadSource.manual,
            "email_campaign": LeadSource.email,
            "campaign": LeadSource.email,
            "email": LeadSource.email,
            "event": LeadSource.local_listing,
            "partner": LeadSource.referral,
            "referral": LeadSource.referral,
            "linkedin": LeadSource.linkedin,
            "google": LeadSource.ppc_google,
            "ppc_google": LeadSource.ppc_google,
            "ads": LeadSource.meta_ads,
            "meta_ads": LeadSource.meta_ads,
            "local_listing": LeadSource.local_listing,
        }
        if v_clean in mapping:
            return mapping[v_clean]
    return v

def _normalize_lead_priority(v):
    if isinstance(v, str):
        v_clean = v.strip().lower()
        mapping = {
            "low": Priority.cold,
            "cold": Priority.cold,
            "medium": Priority.warm,
            "median": Priority.warm,
            "warm": Priority.warm,
            "high": Priority.hot,
            "hot": Priority.hot,
        }
        if v_clean in mapping:
            return mapping[v_clean]
    return v

class WebFormLeadRequest(BaseModel):
    first_name: str = Field(..., max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    company_name: str = Field(..., max_length=200)
    company_size: Optional[str] = None
    industry: Optional[str] = None
    region: Optional[str] = None
    
    # UTM
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    
    notes: Optional[str] = None
    deal_value: Optional[float] = None
    estimated_value: Optional[float] = None

class LeadManualCreateRequest(WebFormLeadRequest):
    source: LeadSource = Field(default=LeadSource.manual)
    priority: Optional[Priority] = None
    assigned_to: Optional[UUID] = None

    @field_validator("source", mode="before")
    @classmethod
    def validate_source(cls, v):
        return _normalize_lead_source(v)

    @field_validator("priority", mode="before")
    @classmethod
    def validate_priority(cls, v):
        return _normalize_lead_priority(v)

class LeadQualifyRequest(BaseModel):
    budget_confirmed: bool
    budget_notes: Optional[str] = None
    authority_confirmed: bool
    authority_notes: Optional[str] = None
    pain_points: List[str] = Field(default_factory=list)
    timeline: str
    estimated_headcount: int
    required_regions: List[str] = Field(default_factory=list)
    current_solution: Optional[str] = None

class DemoScheduleRequest(BaseModel):
    demo_type: str
    demo_date: datetime
    demo_duration: int
    demo_meeting_link: str
    internal_attendees: List[UUID] = Field(default_factory=list)
    demo_focus_areas: List[str] = Field(default_factory=list)

class DemoCompleteRequest(BaseModel):
    demo_notes: str
    demo_outcome: str
    follow_up_date: Optional[date] = None
    next_action: Optional[str] = None
    key_concerns: Optional[str] = None
    decision_timeline: Optional[str] = None
    competitors_mentioned: Optional[str] = None

class ProposalCreateRequest(BaseModel):
    plan_id: UUID
    employees_count: int
    contract_duration: str # monthly, annual, 2-year
    discount_pct: float = 0.0
    addons: List[str] = Field(default_factory=list)
    template_id: str

class OpportunityWonRequest(BaseModel):
    contract_signed_date: date
    go_live_date: date
    assigned_csm: UUID
    won_reason: List[str] = Field(default_factory=list)
    auto_provision_tenant: bool = True

class OpportunityLostRequest(BaseModel):
    lost_reason: str
    competitor_chosen: Optional[str] = None
    features_gap: Optional[str] = None
    reengage_date: Optional[date] = None
    lost_notes: str

class LeadUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None
    company_size: Optional[str] = None
    industry: Optional[str] = None
    region: Optional[str] = None
    source: Optional[LeadSource] = None
    priority: Optional[Priority] = None
    assigned_to: Optional[UUID] = None
    status: Optional[LeadStatus] = None
    notes: Optional[str] = None
    deal_value: Optional[float] = None
    estimated_value: Optional[float] = None

    @field_validator("source", mode="before")
    @classmethod
    def validate_source(cls, v):
        return _normalize_lead_source(v)

    @field_validator("priority", mode="before")
    @classmethod
    def validate_priority(cls, v):
        return _normalize_lead_priority(v)

class LeadAssignRequest(BaseModel):
    assigned_to: Optional[UUID] = None
    lead_ids: Optional[List[UUID]] = None

class EmailAttachment(BaseModel):
    filename: str
    content: str
    size: Optional[int] = None

class LeadEmailRequest(BaseModel):
    subject: str
    message: str
    template: Optional[str] = None
    attachments: Optional[List[EmailAttachment]] = None

class LeadActivityCreateRequest(BaseModel):
    activity_type: ActivityType
    subject: str
    body: Optional[str] = None
    outcome: Optional[str] = None
    direction: Optional[str] = None
    duration: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

