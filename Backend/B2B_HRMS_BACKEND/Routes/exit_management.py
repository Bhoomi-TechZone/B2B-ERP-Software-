from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime, timezone
import random
import logging

from Models.exit_management import ExitRequest
from Utility.auth_helpers import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/exit-requests", tags=["Exit & Offboarding Management"])

class ExitRequestCreate(BaseModel):
    employee_id: str
    name: str
    department: str
    role: str
    avatar: Optional[str] = None
    avatar_color: Optional[str] = "bg-teal-600"
    exit_date: str
    notice_period: Optional[str] = "30 days"
    reason: str
    initiated_by: Optional[str] = "HR Admin"

class ExitRequestUpdate(BaseModel):
    status: Optional[str] = None
    assets_returned: Optional[bool] = None
    fnf_processed: Optional[bool] = None
    access_revoked: Optional[bool] = None
    exit_date: Optional[str] = None
    reason: Optional[str] = None

DEFAULT_SAMPLE_EXITS = [
    {
        "exit_id": "EXIT001",
        "employee_id": "EMP-101",
        "name": "Rohan Gupta",
        "department": "Engineering",
        "role": "Backend Developer",
        "avatar": "RG",
        "avatar_color": "bg-indigo-600",
        "exit_date": "2026-12-15",
        "notice_period": "30 days",
        "reason": "Better Opportunity / Career Growth",
        "status": "Notice Period",
        "initiated_by": "HR Admin",
        "assets_returned": True,
        "fnf_processed": False,
        "access_revoked": False,
    },
    {
        "exit_id": "EXIT002",
        "employee_id": "EMP-104",
        "name": "Ananya Sen",
        "department": "Design",
        "role": "UI/UX Designer",
        "avatar": "AS",
        "avatar_color": "bg-pink-600",
        "exit_date": "2026-11-30",
        "notice_period": "45 days",
        "reason": "Higher Studies",
        "status": "Notice Period",
        "initiated_by": "HR Admin",
        "assets_returned": False,
        "fnf_processed": False,
        "access_revoked": False,
    },
    {
        "exit_id": "EXIT003",
        "employee_id": "EMP-108",
        "name": "Karan Mehra",
        "department": "Sales",
        "role": "Account Executive",
        "avatar": "KM",
        "avatar_color": "bg-emerald-600",
        "exit_date": "2026-10-31",
        "notice_period": "30 days",
        "reason": "Relocation — Personal",
        "status": "Completed",
        "initiated_by": "HR Admin",
        "assets_returned": True,
        "fnf_processed": True,
        "access_revoked": True,
    }
]

@router.get("", summary="List Exit Requests")
async def list_exit_requests(current_user: dict = Depends(get_current_user)):
    try:
        tenant_id = UUID(current_user.get("tid"))
        exits = await ExitRequest.find(ExitRequest.tenant_id == tenant_id).to_list()

        if not exits:
            # Auto-seed default sample records for this tenant
            for sample in DEFAULT_SAMPLE_EXITS:
                doc = ExitRequest(
                    tenant_id=tenant_id,
                    exit_id=sample["exit_id"],
                    employee_id=sample["employee_id"],
                    name=sample["name"],
                    department=sample["department"],
                    role=sample["role"],
                    avatar=sample["avatar"],
                    avatar_color=sample["avatar_color"],
                    exit_date=sample["exit_date"],
                    notice_period=sample["notice_period"],
                    reason=sample["reason"],
                    status=sample["status"],
                    initiated_by=sample["initiated_by"],
                    assets_returned=sample["assets_returned"],
                    fnf_processed=sample["fnf_processed"],
                    access_revoked=sample["access_revoked"],
                )
                await doc.insert()
            exits = await ExitRequest.find(ExitRequest.tenant_id == tenant_id).to_list()

        results = []
        for e in exits:
            results.append({
                "id": str(e.id),
                "exitId": e.exit_id or f"EXIT-{str(e.id)[:6].upper()}",
                "employeeId": e.employee_id,
                "name": e.name,
                "department": e.department,
                "role": e.role,
                "avatar": e.avatar or "".join(part[0].upper() for part in e.name.split() if part)[:2],
                "avatarColor": e.avatar_color or "bg-teal-600",
                "exitDate": e.exit_date,
                "noticePeriod": e.notice_period,
                "reason": e.reason,
                "status": e.status,
                "initiatedBy": e.initiated_by,
                "initiatedOn": e.initiated_on,
                "assetsReturned": e.assets_returned,
                "fnfProcessed": e.fnf_processed,
                "accessRevoked": e.access_revoked,
            })
        return results
    except Exception as e:
        logger.error(f"Failed to list exit requests: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("", summary="Initiate Exit Request", status_code=status.HTTP_201_CREATED)
async def create_exit_request(data: ExitRequestCreate, current_user: dict = Depends(get_current_user)):
    try:
        tenant_id = UUID(current_user.get("tid"))
        count = await ExitRequest.find(ExitRequest.tenant_id == tenant_id).count()
        exit_code = f"EXIT{count + 1:03d}"

        avatar = data.avatar or "".join(part[0].upper() for part in data.name.split() if part)[:2]
        avatar_colors = ["bg-indigo-600", "bg-purple-600", "bg-rose-600", "bg-teal-600", "bg-amber-600"]
        avatar_color = data.avatar_color or random.choice(avatar_colors)

        doc = ExitRequest(
            tenant_id=tenant_id,
            exit_id=exit_code,
            employee_id=data.employee_id,
            name=data.name,
            department=data.department,
            role=data.role,
            avatar=avatar,
            avatar_color=avatar_color,
            exit_date=data.exit_date,
            notice_period=data.notice_period or "30 days",
            reason=data.reason,
            status="Notice Period",
            initiated_by=data.initiated_by or "HR Admin",
            assets_returned=False,
            fnf_processed=False,
            access_revoked=False,
        )
        await doc.insert()

        return {
            "id": str(doc.id),
            "exitId": doc.exit_id,
            "employeeId": doc.employee_id,
            "name": doc.name,
            "department": doc.department,
            "role": doc.role,
            "avatar": doc.avatar,
            "avatarColor": doc.avatar_color,
            "exitDate": doc.exit_date,
            "noticePeriod": doc.notice_period,
            "reason": doc.reason,
            "status": doc.status,
            "initiatedBy": doc.initiated_by,
            "initiatedOn": doc.initiated_on,
            "assetsReturned": doc.assets_returned,
            "fnfProcessed": doc.fnf_processed,
            "accessRevoked": doc.access_revoked,
        }
    except Exception as e:
        logger.error(f"Failed to create exit request: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.patch("/{exit_id}", summary="Update Exit Request Checklist or Status")
async def update_exit_request(exit_id: str, data: ExitRequestUpdate, current_user: dict = Depends(get_current_user)):
    try:
        tenant_id = UUID(current_user.get("tid"))
        doc = None
        # Try finding by exit_id or MongoDB UUID _id
        try:
            doc = await ExitRequest.find_one(ExitRequest.id == UUID(exit_id), ExitRequest.tenant_id == tenant_id)
        except Exception:
            pass
        if not doc:
            doc = await ExitRequest.find_one(ExitRequest.exit_id == exit_id, ExitRequest.tenant_id == tenant_id)
        if not doc:
            raise HTTPException(status_code=404, detail="Exit request not found")

        if data.status is not None:
            doc.status = data.status
        if data.assets_returned is not None:
            doc.assets_returned = data.assets_returned
        if data.fnf_processed is not None:
            doc.fnf_processed = data.fnf_processed
        if data.access_revoked is not None:
            doc.access_revoked = data.access_revoked
        if data.exit_date is not None:
            doc.exit_date = data.exit_date
        if data.reason is not None:
            doc.reason = data.reason

        # If all 3 checklist items are complete, mark status as Completed
        if doc.assets_returned and doc.fnf_processed and doc.access_revoked and doc.status == "Notice Period":
            doc.status = "Completed"

        doc.updated_at = datetime.now(timezone.utc)
        await doc.save()

        return {
            "id": str(doc.id),
            "exitId": doc.exit_id,
            "status": doc.status,
            "assetsReturned": doc.assets_returned,
            "fnfProcessed": doc.fnf_processed,
            "accessRevoked": doc.access_revoked,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update exit request: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{exit_id}", summary="Delete Exit Request")
async def delete_exit_request(exit_id: str, current_user: dict = Depends(get_current_user)):
    try:
        tenant_id = UUID(current_user.get("tid"))
        doc = None
        try:
            doc = await ExitRequest.find_one(ExitRequest.id == UUID(exit_id), ExitRequest.tenant_id == tenant_id)
        except Exception:
            pass
        if not doc:
            doc = await ExitRequest.find_one(ExitRequest.exit_id == exit_id, ExitRequest.tenant_id == tenant_id)
        if not doc:
            raise HTTPException(status_code=404, detail="Exit request not found")

        await doc.delete()
        return {"message": "Exit request deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete exit request: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")
