from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user_id, require_role
from app.modules.simulation.models.template import Template
from app.modules.simulation.schemas.template import TemplateResponse, TemplateCreate

router = APIRouter()

@router.get("/", response_model=List[TemplateResponse])
async def get_templates(
    country: str = None,
    category: str = None,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    List all templates. 
    Filters:
    - country: MY, SG, etc.
    - category: banking, government, etc.
    """
    query = select(Template).filter(Template.is_active == True)
    
    if country:
        query = query.filter(Template.country_code == country)
    
    if category:
        query = query.filter(Template.brand_category == category)
        
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(
    template_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get specific template details.
    """
    result = await db.execute(select(Template).filter(Template.id == template_id))
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
        
    return template
