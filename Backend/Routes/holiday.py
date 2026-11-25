from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from bson import ObjectId
from beanie import PydanticObjectId
from datetime import datetime, date
import logging
import os
import jwt
from uuid import UUID
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from Models.holiday import Holiday
from Schema.holiday import HolidayCreate, HolidayUpdate
from Utility.auth_helpers import get_current_user

logger = logging.getLogger(__name__)

optional_security = HTTPBearer(auto_error=False)

router = APIRouter(
    prefix="/api/holidays",
    tags=["Holidays"]
)


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security)
) -> Optional[dict]:
    if not credentials or not credentials.credentials:
        return None
    try:
        secret_key = os.getenv("SECRET_KEY", "dev-secret-key-12345")
        payload = jwt.decode(
            credentials.credentials,
            secret_key,
            algorithms=["HS256"]
        )
        return payload
    except Exception:
        return None


def verify_holiday_manage_role(current_user: dict):
    user_type = current_user.get("user_type", "")
    role = (current_user.get("role") or "").lower().strip()
    is_authorized = (
        user_type in ["platform_admin", "tenant_admin", "admin"] or
        role in ["admin", "tenant_admin", "super_admin", "hr", "hr_admin", "hr_manager"]
    )
    if not is_authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin or HR role required to manage holidays."
        )


def parse_holiday_date(val) -> datetime:
    if isinstance(val, datetime):
        return val
    if isinstance(val, date):
        return datetime.combine(val, datetime.min.time())
    if isinstance(val, str):
        val_clean = val.strip()
        for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S", "%d-%m-%Y", "%d/%m/%Y", "%m/%d/%Y"):
            try:
                return datetime.strptime(val_clean, fmt)
            except ValueError:
                pass
        try:
            return datetime.fromisoformat(val_clean.replace("Z", "+00:00")).replace(tzinfo=None)
        except Exception:
            pass
    raise HTTPException(status_code=400, detail=f"Invalid date format: {val}")


async def get_holiday_by_id(id_str: str) -> Optional[Holiday]:
    if ObjectId.is_valid(id_str):
        try:
            h = await Holiday.get(PydanticObjectId(id_str))
            if h:
                return h
        except Exception:
            pass
        try:
            h = await Holiday.get(id_str)
            if h:
                return h
        except Exception:
            pass
    return None


# -----------------------------
# ✅ GET ALL HOLIDAYS
# -----------------------------
@router.get("", status_code=status.HTTP_200_OK)
@router.get("/", status_code=status.HTTP_200_OK, include_in_schema=False)
async def get_holidays(
    current_user: Optional[dict] = Depends(get_optional_user)
):
    try:
        if current_user:
            user_type = current_user.get("user_type", "")
            tid = current_user.get("tid") or current_user.get("tenant_id")
            if tid and user_type != "platform_admin":
                tenant_id = UUID(str(tid))
                holidays = await Holiday.find(
                    {"$or": [{"tenant_id": tenant_id}, {"tenant_id": None}]}
                ).to_list()
                return {
                    "success": True,
                    "data": holidays
                }
        holidays = await Holiday.find_all().to_list()
        return {
            "success": True,
            "data": holidays
        }
    except Exception as e:
        logger.error(f"Get holidays failed: {str(e)}", exc_info=True)
        return {
            "success": True,
            "data": []
        }


# -----------------------------
# ✅ CREATE HOLIDAY
# -----------------------------
@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED, include_in_schema=False)
async def create_holiday(
    data: HolidayCreate,
    current_user: dict = Depends(get_current_user)
):
    try:
        verify_holiday_manage_role(current_user)

        tid = current_user.get("tid") or current_user.get("tenant_id")
        tenant_id = UUID(str(tid)) if tid else None

        holiday_dict = data.model_dump() if hasattr(data, "model_dump") else data.dict()
        holiday_dict["holiday_date"] = parse_holiday_date(holiday_dict["holiday_date"])

        holiday = Holiday(
            **holiday_dict,
            tenant_id=tenant_id
        )

        await holiday.insert()

        return {
            "success": True,
            "message": "Holiday Created Successfully",
            "data": holiday
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create holiday failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create holiday: {str(e)}"
        )


# -----------------------------
# ✅ UPDATE HOLIDAY
# -----------------------------
@router.put("/{id}", status_code=status.HTTP_200_OK)
@router.put("/{id}/", status_code=status.HTTP_200_OK, include_in_schema=False)
async def update_holiday(
    id: str,
    data: HolidayUpdate,
    current_user: dict = Depends(get_current_user)
):
    verify_holiday_manage_role(current_user)

    holiday = await get_holiday_by_id(id)
    if not holiday:
        raise HTTPException(status_code=404, detail="Holiday not found")

    user_type = current_user.get("user_type", "")
    tid = current_user.get("tid") or current_user.get("tenant_id")
    if tid and holiday.tenant_id and user_type != "platform_admin":
        if str(holiday.tenant_id) != str(tid):
            raise HTTPException(status_code=403, detail="Not authorized to edit holiday of another workspace")

    update_data = data.model_dump(exclude_unset=True) if hasattr(data, "model_dump") else data.dict(exclude_unset=True)

    if "holiday_date" in update_data and update_data["holiday_date"] is not None:
        update_data["holiday_date"] = parse_holiday_date(update_data["holiday_date"])

    await holiday.set(update_data)
    await holiday.save()

    return {
        "success": True,
        "message": "Holiday updated successfully",
        "data": holiday
    }


# -----------------------------
# ✅ DELETE HOLIDAY
# -----------------------------
@router.delete("/{id}", status_code=status.HTTP_200_OK)
@router.delete("/{id}/", status_code=status.HTTP_200_OK, include_in_schema=False)
async def delete_holiday(
    id: str,
    current_user: dict = Depends(get_current_user)
):
    verify_holiday_manage_role(current_user)

    holiday = await get_holiday_by_id(id)
    if not holiday:
        raise HTTPException(status_code=404, detail="Holiday not found")

    user_type = current_user.get("user_type", "")
    tid = current_user.get("tid") or current_user.get("tenant_id")
    if tid and holiday.tenant_id and user_type != "platform_admin":
        if str(holiday.tenant_id) != str(tid):
            raise HTTPException(status_code=403, detail="Not authorized to delete holiday of another workspace")

    await holiday.delete()

    return {
        "success": True,
        "message": "Holiday deleted successfully"
    }
