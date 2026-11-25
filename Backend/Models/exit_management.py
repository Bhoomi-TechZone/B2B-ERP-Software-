from beanie import Document
from pydantic import Field
from typing import Optional
from datetime import datetime, timezone
from uuid import UUID


class ExitRequest(Document):
    tenant_id: UUID
    exit_id: Optional[str] = None  # e.g. EXIT001
    employee_id: str
    name: str
    department: str
    role: str
    avatar: str = ""
    avatar_color: str = "bg-teal-600"
    exit_date: str
    notice_period: str = "30 days"
    reason: str
    status: str = "Notice Period"  # Initiated, Notice Period, Completed, Cancelled
    initiated_by: str = "HR Admin"
    initiated_on: str = Field(default_factory=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%d"))
    assets_returned: bool = False
    fnf_processed: bool = False
    access_revoked: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "exit_requests"
