from functools import lru_cache
from app.core.config import settings
from app.core.services.email.base import EmailProvider, EmailMessage
from app.core.services.email.logger import LoggerEmailProvider

@lru_cache()
def get_email_provider() -> EmailProvider:
    """
    Factory to get the configured email provider.
    In the future, switch on settings.EMAIL_PROVIDER (e.g. 'logger', 'msgraph', 'smtp')
    """
    return LoggerEmailProvider()
