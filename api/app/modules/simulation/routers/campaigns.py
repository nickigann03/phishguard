from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user_id, get_current_org_id
from app.modules.simulation.schemas.campaign import CampaignCreate, CampaignResponse
from app.modules.simulation.services.campaign_service import CampaignService

router = APIRouter()

@router.post("/", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    campaign_data: CampaignCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
    org_id: str = Depends(get_current_org_id)
):
    """
    Create a new phishing campaign.
    """
    service = CampaignService(db)
    # Convert string IDs to UUIDs
    return await service.create_campaign(
        campaign_data, 
        UUID(user_id), 
        UUID(org_id)
    )

@router.post("/{campaign_id}/launch", response_model=CampaignResponse)
async def launch_campaign(
    campaign_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Launch a campaign immediately.
    """
    service = CampaignService(db)
    try:
        return await service.launch_campaign(UUID(campaign_id))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
