from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Dict, Any, List, Optional
from uuid import UUID
from datetime import datetime, timezone
import logging
from pydantic import BaseModel, Field

from Models.candidate import Candidate, CandidateInterview, CandidateOffer
from Models.employee import Employee
from Models.tenant_user import User
from Utility.auth_helpers import get_current_user, verify_tenant_admin

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/recruitment", tags=["Recruitment & ATS"])

# ── Pydantic Request Schemas ──────────────────────────────────────────────────
class CandidateCreateRequest(BaseModel):
    name: str
    email: str
    phone: str = ""
    location: str = ""
    experience: str = ""
    skills: List[str] = []
    source: str = "Website"
    status: str = "applied"
    rating: int = 0
    tags: List[str] = []
    applied_for: str = ""

class CandidateUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    experience: Optional[str] = None
    skills: Optional[List[str]] = None
    source: Optional[str] = None
    status: Optional[str] = None
    rating: Optional[int] = None
    tags: Optional[List[str]] = None
    applied_for: Optional[str] = None

class CandidateStageUpdateRequest(BaseModel):
    stage: str  # applied, screening, shortlisted, interview, offer, hired, rejected

class InterviewCreateRequest(BaseModel):
    candidate: str
    candidate_id: Optional[str] = None
    role: str
    round: str
    interviewer: str
    date: str
    time: str
    duration: str = "60 min"
    mode: str = "Video Call"
    status: str = "scheduled"

class InterviewUpdateRequest(BaseModel):
    status: Optional[str] = None
    feedback: Optional[Dict[str, Any]] = None

class OfferCreateRequest(BaseModel):
    candidate: str
    candidate_id: Optional[str] = None
    role: str
    ctc: str
    joining_date: str
    status: str = "draft"
    notice: str = "30 days"
    breakdown: Optional[Dict[str, Any]] = None

class OfferUpdateRequest(BaseModel):
    status: Optional[str] = None
    ctc: Optional[str] = None
    joining_date: Optional[str] = None
    breakdown: Optional[Dict[str, Any]] = None

# ── Seed Initial Real Candidates Helper ────────────────────────────────────────
async def _seed_initial_recruitment_data(tenant_id: UUID):
    """Seed initial realistic recruitment data if none exists for this tenant"""
    count = await Candidate.find(Candidate.tenant_id == tenant_id).count()
    if count == 0:
        seed_candidates = [
            Candidate(
                tenant_id=tenant_id,
                candidate_id="CAN-001",
                name="Priya Sharma",
                email="priya.sharma@example.com",
                phone="+91 98765 43210",
                location="Bengaluru, KA",
                experience="5+ years",
                skills=["React", "Node.js", "TypeScript", "Tailwind CSS"],
                source="LinkedIn",
                status="interview",
                rating=5,
                tags=["Frontend", "Senior", "Immediate"],
                avatar_color="bg-purple-600",
                applied_for="Senior Frontend Engineer"
            ),
            Candidate(
                tenant_id=tenant_id,
                candidate_id="CAN-002",
                name="Rahul Verma",
                email="rahul.verma@example.com",
                phone="+91 98112 34567",
                location="Mumbai, MH",
                experience="4 years",
                skills=["Python", "FastAPI", "MongoDB", "Docker"],
                source="Website",
                status="shortlisted",
                rating=4,
                tags=["Backend", "FastAPI"],
                avatar_color="bg-blue-600",
                applied_for="Backend Developer"
            ),
            Candidate(
                tenant_id=tenant_id,
                candidate_id="CAN-003",
                name="Ananya Desai",
                email="ananya.desai@example.com",
                phone="+91 99001 23456",
                location="Pune, MH",
                experience="3 years",
                skills=["Figma", "UI/UX", "User Research", "Prototyping"],
                source="Referral",
                status="offer",
                rating=5,
                tags=["Design", "Top Talent"],
                avatar_color="bg-emerald-600",
                applied_for="UI/UX Designer"
            ),
            Candidate(
                tenant_id=tenant_id,
                candidate_id="CAN-004",
                name="Vikram Singh",
                email="vikram.singh@example.com",
                phone="+91 97234 56789",
                location="Delhi NCR",
                experience="6 years",
                skills=["AWS", "Kubernetes", "CI/CD", "Terraform"],
                source="Naukri",
                status="screening",
                rating=4,
                tags=["DevOps", "Cloud"],
                avatar_color="bg-amber-600",
                applied_for="DevOps Engineer"
            ),
            Candidate(
                tenant_id=tenant_id,
                candidate_id="CAN-005",
                name="Kavita Iyer",
                email="kavita.iyer@example.com",
                phone="+91 96543 21098",
                location="Chennai, TN",
                experience="2 years",
                skills=["Product Roadmaps", "Agile", "Jira", "Analytics"],
                source="Website",
                status="applied",
                rating=3,
                tags=["Product", "Associate"],
                avatar_color="bg-rose-600",
                applied_for="Product Manager"
            )
        ]
        for c in seed_candidates:
            await c.insert()

        # Seed 1 interview
        intv = CandidateInterview(
            tenant_id=tenant_id,
            interview_id="INT-001",
            candidate="Priya Sharma",
            candidate_id="CAN-001",
            role="Senior Frontend Engineer",
            round="Technical Round 2",
            interviewer="Tech Lead",
            date=datetime.now().strftime("%Y-%m-%d"),
            time="02:30 PM",
            duration="60 min",
            mode="Video Call",
            status="scheduled",
            avatar_color="bg-purple-600"
        )
        await intv.insert()

        # Seed 1 offer
        ofr = CandidateOffer(
            tenant_id=tenant_id,
            offer_id="OFR-001",
            candidate="Ananya Desai",
            candidate_id="CAN-003",
            role="UI/UX Designer",
            ctc="₹14,50,000 LPA",
            joining_date=datetime.now().strftime("%Y-12-01"),
            status="pending",
            sent_on=datetime.now().strftime("%Y-%m-%d"),
            hm="Product Director",
            notice="30 days",
            breakdown={"basic": 700000, "hra": 350000, "special_allowance": 400000}
        )
        await ofr.insert()

# ── CANDIDATE ENDPOINTS ────────────────────────────────────────────────────────
@router.get("/candidates", summary="List All Candidates")
async def list_candidates(
    status: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user = Depends(get_current_user)
):
    try:
        tenant_id = UUID(current_user.get("tid"))
        await _seed_initial_recruitment_data(tenant_id)
        
        query = {"tenant_id": tenant_id}
        target_status = stage or status
        if target_status and target_status.lower() != "all":
            query["status"] = target_status.lower()
            
        candidates = await Candidate.find(query).sort("-created_at").to_list()
        
        if search:
            s = search.lower()
            candidates = [
                c for c in candidates 
                if s in c.name.lower() or s in c.email.lower() or s in c.applied_for.lower() or any(s in sk.lower() for sk in c.skills)
            ]
            
        return [
            {
                "id": str(c.id),
                "candidate_id": c.candidate_id or f"CAN-{str(c.id)[-4:]}",
                "name": c.name,
                "email": c.email,
                "phone": c.phone,
                "location": c.location,
                "experience": c.experience,
                "skills": c.skills,
                "source": c.source,
                "status": c.status,
                "stage": c.status,
                "rating": c.rating,
                "tags": c.tags,
                "applied_for": c.applied_for,
                "avatar": c.avatar,
                "avatar_color": c.avatar_color,
                "created_at": c.created_at.isoformat() if c.created_at else None
            }
            for c in candidates
        ]
    except Exception as e:
        logger.error(f"Failed to list candidates: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/candidates", summary="Create Candidate", status_code=status.HTTP_201_CREATED)
async def create_candidate(
    data: CandidateCreateRequest,
    current_user = Depends(verify_tenant_admin)
):
    try:
        tenant_id = UUID(current_user.get("tid"))
        count = await Candidate.find(Candidate.tenant_id == tenant_id).count()
        candidate_code = f"CAN-{count + 1:03d}"
        
        candidate = Candidate(
            tenant_id=tenant_id,
            candidate_id=candidate_code,
            name=data.name,
            email=data.email,
            phone=data.phone,
            location=data.location,
            experience=data.experience,
            skills=data.skills,
            source=data.source,
            status=data.status.lower(),
            rating=data.rating,
            tags=data.tags,
            applied_for=data.applied_for,
            avatar_color="bg-blue-600"
        )
        await candidate.insert()
        return {
            "success": True,
            "message": "Candidate created successfully",
            "candidate": {
                "id": str(candidate.id),
                "candidate_id": candidate.candidate_id,
                "name": candidate.name,
                "email": candidate.email,
                "status": candidate.status,
                "applied_for": candidate.applied_for
            }
        }
    except Exception as e:
        logger.error(f"Failed to create candidate: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/candidates/{candidate_id}/stage", summary="Update Candidate Pipeline Stage")
async def update_candidate_stage(
    candidate_id: str,
    data: CandidateStageUpdateRequest,
    current_user = Depends(verify_tenant_admin)
):
    try:
        tenant_id = UUID(current_user.get("tid"))
        candidate = None
        # Try finding by candidate_id or by DB id
        try:
            from beanie import PydanticObjectId
            candidate = await Candidate.find_one(Candidate.id == PydanticObjectId(candidate_id), Candidate.tenant_id == tenant_id)
        except Exception:
            pass
        if not candidate:
            candidate = await Candidate.find_one(Candidate.candidate_id == candidate_id, Candidate.tenant_id == tenant_id)
            
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
            
        candidate.status = data.stage.lower()
        candidate.updated_at = datetime.now(timezone.utc)
        await candidate.save()
        return {"success": True, "message": f"Candidate moved to {data.stage}", "stage": candidate.status}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update candidate stage: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/candidates/{candidate_id}", summary="Delete Candidate")
async def delete_candidate(
    candidate_id: str,
    current_user = Depends(verify_tenant_admin)
):
    try:
        tenant_id = UUID(current_user.get("tid"))
        candidate = None
        try:
            from beanie import PydanticObjectId
            candidate = await Candidate.find_one(Candidate.id == PydanticObjectId(candidate_id), Candidate.tenant_id == tenant_id)
        except Exception:
            pass
        if not candidate:
            candidate = await Candidate.find_one(Candidate.candidate_id == candidate_id, Candidate.tenant_id == tenant_id)
            
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
            
        await candidate.delete()
        return {"success": True, "message": "Candidate deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete candidate: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# ── INTERVIEW ENDPOINTS ───────────────────────────────────────────────────────
@router.get("/interviews", summary="List All Interviews")
async def list_interviews(current_user = Depends(get_current_user)):
    try:
        tenant_id = UUID(current_user.get("tid"))
        interviews = await CandidateInterview.find(CandidateInterview.tenant_id == tenant_id).sort("-created_at").to_list()
        return [
            {
                "id": str(i.id),
                "interview_id": i.interview_id or f"INT-{str(i.id)[-4:]}",
                "candidate": i.candidate,
                "candidate_id": i.candidate_id,
                "role": i.role,
                "round": i.round,
                "interviewer": i.interviewer,
                "interviewer_avatar": i.interviewer_avatar,
                "date": i.date,
                "time": i.time,
                "duration": i.duration,
                "mode": i.mode,
                "status": i.status,
                "feedback": i.feedback,
                "avatar_color": i.avatar_color
            }
            for i in interviews
        ]
    except Exception as e:
        logger.error(f"Failed to list interviews: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/interviews", summary="Schedule Interview", status_code=status.HTTP_201_CREATED)
async def schedule_interview(
    data: InterviewCreateRequest,
    current_user = Depends(verify_tenant_admin)
):
    try:
        tenant_id = UUID(current_user.get("tid"))
        count = await CandidateInterview.find(CandidateInterview.tenant_id == tenant_id).count()
        code = f"INT-{count + 1:03d}"
        
        interview = CandidateInterview(
            tenant_id=tenant_id,
            interview_id=code,
            candidate=data.candidate,
            candidate_id=data.candidate_id,
            role=data.role,
            round=data.round,
            interviewer=data.interviewer,
            date=data.date,
            time=data.time,
            duration=data.duration,
            mode=data.mode,
            status=data.status
        )
        await interview.insert()
        return {"success": True, "message": "Interview scheduled successfully", "interview": interview}
    except Exception as e:
        logger.error(f"Failed to schedule interview: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# ── OFFER ENDPOINTS ───────────────────────────────────────────────────────────
@router.get("/offers", summary="List All Candidate Offers")
async def list_offers(current_user = Depends(get_current_user)):
    try:
        tenant_id = UUID(current_user.get("tid"))
        offers = await CandidateOffer.find(CandidateOffer.tenant_id == tenant_id).sort("-created_at").to_list()
        return [
            {
                "id": str(o.id),
                "offer_id": o.offer_id or f"OFR-{str(o.id)[-4:]}",
                "candidate": o.candidate,
                "candidate_id": o.candidate_id,
                "role": o.role,
                "ctc": o.ctc,
                "joining_date": o.joining_date,
                "status": o.status,
                "sent_on": o.sent_on,
                "expires_on": o.expires_on,
                "hm": o.hm,
                "notice": o.notice,
                "breakdown": o.breakdown,
                "avatar_color": o.avatar_color
            }
            for o in offers
        ]
    except Exception as e:
        logger.error(f"Failed to list offers: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/offers", summary="Create Candidate Offer", status_code=status.HTTP_201_CREATED)
async def create_offer(
    data: OfferCreateRequest,
    current_user = Depends(verify_tenant_admin)
):
    try:
        tenant_id = UUID(current_user.get("tid"))
        count = await CandidateOffer.find(CandidateOffer.tenant_id == tenant_id).count()
        code = f"OFR-{count + 1:03d}"
        
        offer = CandidateOffer(
            tenant_id=tenant_id,
            offer_id=code,
            candidate=data.candidate,
            candidate_id=data.candidate_id,
            role=data.role,
            ctc=data.ctc,
            joining_date=data.joining_date,
            status=data.status,
            notice=data.notice,
            breakdown=data.breakdown or {"basic": 500000, "hra": 250000, "allowance": 250000},
            sent_on=datetime.now().strftime("%Y-%m-%d")
        )
        await offer.insert()
        return {"success": True, "message": "Offer created successfully", "offer": offer}
    except Exception as e:
        logger.error(f"Failed to create offer: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# ── RECRUITMENT STATS & CONVERSION ────────────────────────────────────────────
@router.get("/stats", summary="Recruitment Dashboard Stats")
async def get_recruitment_stats(current_user = Depends(get_current_user)):
    try:
        tenant_id = UUID(current_user.get("tid"))
        await _seed_initial_recruitment_data(tenant_id)
        
        total = await Candidate.find(Candidate.tenant_id == tenant_id).count()
        applied = await Candidate.find(Candidate.tenant_id == tenant_id, Candidate.status == "applied").count()
        screening = await Candidate.find(Candidate.tenant_id == tenant_id, Candidate.status == "screening").count()
        shortlisted = await Candidate.find(Candidate.tenant_id == tenant_id, Candidate.status == "shortlisted").count()
        interview = await Candidate.find(Candidate.tenant_id == tenant_id, Candidate.status == "interview").count()
        offer = await Candidate.find(Candidate.tenant_id == tenant_id, Candidate.status == "offer").count()
        hired = await Candidate.find(Candidate.tenant_id == tenant_id, Candidate.status == "hired").count()
        
        interviews_count = await CandidateInterview.find(CandidateInterview.tenant_id == tenant_id).count()
        offers_count = await CandidateOffer.find(CandidateOffer.tenant_id == tenant_id).count()
        
        return {
            "total_candidates": total,
            "pipeline": {
                "applied": applied,
                "screening": screening,
                "shortlisted": shortlisted,
                "interview": interview,
                "offer": offer,
                "hired": hired
            },
            "interviews_count": interviews_count,
            "offers_count": offers_count
        }
    except Exception as e:
        logger.error(f"Failed to get recruitment stats: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/candidates/{candidate_id}/convert-to-employee", summary="Convert Hired Candidate to Employee")
async def convert_candidate_to_employee(
    candidate_id: str,
    current_user = Depends(verify_tenant_admin)
):
    try:
        tenant_id = UUID(current_user.get("tid"))
        candidate = None
        try:
            from beanie import PydanticObjectId
            candidate = await Candidate.find_one(Candidate.id == PydanticObjectId(candidate_id), Candidate.tenant_id == tenant_id)
        except Exception:
            pass
        if not candidate:
            candidate = await Candidate.find_one(Candidate.candidate_id == candidate_id, Candidate.tenant_id == tenant_id)
            
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
            
        candidate.status = "hired"
        await candidate.save()
        
        # Check if employee already exists with this email
        existing_emp = await Employee.find_one(Employee.tenant_id == tenant_id, Employee.work_email == candidate.email)
        if existing_emp:
            return {"success": True, "message": "Candidate marked as hired. Employee already exists.", "employee_id": existing_emp.employee_id}
            
        # Create new Employee
        emp_count = await Employee.find(Employee.tenant_id == tenant_id).count()
        new_emp_id = f"EMP-{emp_count + 1:04d}"
        
        names = candidate.name.split(" ", 1)
        first_name = names[0]
        last_name = names[1] if len(names) > 1 else ""
        
        new_employee = Employee(
            tenant_id=tenant_id,
            employee_id=new_emp_id,
            first_name=first_name,
            last_name=last_name,
            work_email=candidate.email,
            phone=candidate.phone,
            department="Engineering",
            job_title=candidate.applied_for or "Software Engineer",
            employment_status="Active"
        )
        await new_employee.insert()
        
        return {
            "success": True,
            "message": f"Successfully converted candidate {candidate.name} to employee {new_emp_id}!",
            "employee_id": new_emp_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to convert candidate to employee: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
