import logging
from typing import List, Dict
from app.core.services.email.base import EmailProvider, EmailMessage

logger = logging.getLogger("app.email")

class LoggerEmailProvider(EmailProvider):
    """
    Development email provider that just logs the email content
    instead of actually sending it.
    """
    
    async def send_email(self, message: EmailMessage) -> bool:
        print("\n" + "="*60)
        print(f"📧 [EMAIL SIMULATION] To: {message.to_email}")
        print(f"Subject: {message.subject}")
        print(f"From: {message.from_name} <{message.from_email or 'default'}>")
        print("-" * 60)
        print(message.body_text or "HTML Content Only")
        print("="*60 + "\n")
        
        logger.info(f"Simulated sending email to {message.to_email} (Campaign: {message.campaign_id})")
        return True

    async def send_bulk(self, messages: List[EmailMessage]) -> Dict[str, bool]:
        results = {}
        for msg in messages:
            # In a real async implementation we'd gather these
            results[msg.to_email] = await self.send_email(msg)
        return results
