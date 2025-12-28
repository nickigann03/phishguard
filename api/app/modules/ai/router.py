from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user_id
from app.modules.ai.schemas import GenerateTemplateRequest, GeneratedTemplateContent
from app.modules.ai.service import AIService

router = APIRouter()

@router.post("/generate-template", response_model=GeneratedTemplateContent)
async def generate_template(
    request: GenerateTemplateRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Generate a phishing template using AI.
    """
    service = AIService()
    return await service.generate_template(request)
