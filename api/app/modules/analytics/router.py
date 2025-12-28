from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_org_id, require_role
from app.modules.analytics.schemas import AnalyticsResponse
from app.modules.analytics.service import AnalyticsService

router = APIRouter()

@router.get("/dashboard", response_model=AnalyticsResponse)
async def get_dashboard_data(
    db: AsyncSession = Depends(get_db),
    org_id: str = Depends(get_current_org_id)
):
    """
    Get aggregated analytics for the organization dashboard.
    """
    service = AnalyticsService(db)
    return await service.get_dashboard_summary(UUID(org_id))
