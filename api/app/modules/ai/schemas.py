from pydantic import BaseModel
from typing import Optional, List

class GenerateTemplateRequest(BaseModel):
    prompt: str
    country_code: Optional[str] = "MY"
    language: Optional[str] = "en"
    brand_category: Optional[str] = "general" # gov, banking, etc

class GeneratedTemplateContent(BaseModel):
    subject: str
    body_html: str
    body_text: str
    difficulty: str 
    estimated_success_rate: str
