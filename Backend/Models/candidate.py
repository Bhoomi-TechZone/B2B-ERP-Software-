from beanie import Document
from pydantic import Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from uuid import UUID


class Candidate(Document):
    tenant_id: UUID
    candidate_id: Optional[str] = None  # e.g. CAN-001
    name: str
    email: str
    phone: str = ""
    location: str = ""
    experience: str = ""
    skills: List[str] = []
    source: str = "Website"  # LinkedIn, Website, Referral, Indeed, Naukri, Agency
    status: str = "applied"  # applied, screening, shortlisted, interview, offer, hired, rejected
    rating: int = 0
    tags: List[str] = []
    avatar: str = ""
    avatar_color: str = "bg-blue-500"
    applied_for: str = ""
    last_active: str = "Just now"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "recruitment_candidates"


class CandidateInterview(Document):
    tenant_id: UUID
    interview_id: Optional[str] = None  # e.g. INT-001
    candidate: str
    candidate_id: Optional[str] = None
    role: str
    round: str
    interviewer: str
    interviewer_avatar: str = ""
    date: str
    time: str
    duration: str = "60 min"
    mode: str = "Video Call"  # Video Call, Onsite, Phone
    status: str = "scheduled"  # scheduled, completed, cancelled
    feedback: Optional[Dict[str, Any]] = None  # { rating: 4, comments: "...", decision: "pass" }
    avatar_color: str = "bg-blue-500"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "recruitment_interviews"


class CandidateOffer(Document):
    tenant_id: UUID
    offer_id: Optional[str] = None  # e.g. OFR-001
    candidate_id: Optional[str] = None
    candidate: str
    role: str
    avatar: str = ""
    avatar_color: str = "bg-emerald-500"
    ctc: str  # e.g. "₹16,50,000 LPA"
    joining_date: str
    status: str = "draft"  # draft, pending, accepted, rejected
    sent_on: Optional[str] = None
    expires_on: Optional[str] = None
    hm: str = ""
    notice: str = "30 days"
    breakdown: Optional[Dict[str, Any]] = None  # { basic: ..., hra: ..., ... }
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "recruitment_offers"
