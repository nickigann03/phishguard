from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr

class EmailMessage(BaseModel):
    to_email: EmailStr
    subject: str
    body_html: str
    body_text: Optional[str] = None
    from_name: str
    from_email: Optional[str] = None # If None, use default
    reply_to: Optional[str] = None
    
    # Metadata for tracking
    tracking_id: Optional[str] = None
    campaign_id: Optional[str] = None


class EmailProvider(ABC):
    """Abstract base class for email providers"""
    
    @abstractmethod
    async def send_email(self, message: EmailMessage) -> bool:
        """Send a single email"""
        pass
        
    @abstractmethod
    async def send_bulk(self, messages: List[EmailMessage]) -> Dict[str, bool]:
        """Send multiple emails (provider implementation can optimize)"""
        pass
