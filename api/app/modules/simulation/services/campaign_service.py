import secrets
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
from datetime import datetime

from app.modules.simulation.models.campaign import Campaign, CampaignTarget
from app.modules.simulation.schemas.campaign import CampaignCreate
from app.core.models.user import User

class CampaignService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_campaign(self, campaign_data: CampaignCreate, user_id: UUID, org_id: UUID) -> Campaign:
        """
        Create a new phishing campaign and generate targets.
        """
        # 1. Create Campaign
        campaign = Campaign(
            **campaign_data.model_dump(),
            org_id=org_id,
            created_by=user_id,
            status="draft"
        )
        self.db.add(campaign)
        await self.db.flush() # Get ID
        
        # 2. Resolve Targets based on target_type
        # TODO: Handle 'department' and 'custom' filtering
        # For 'all', select all users in org
        query = select(User.id).filter(User.org_id == org_id)
        
        if campaign_data.target_type == 'department' and 'departments' in campaign_data.target_config:
             query = query.filter(User.department.in_(campaign_data.target_config['departments']))
             
        result = await self.db.execute(query)
        user_ids = result.scalars().all()
        
        # 3. Create Campaign Targets
        targets = []
        for uid in user_ids:
            target = CampaignTarget(
                campaign_id=campaign.id,
                user_id=uid,
                tracking_id=secrets.token_urlsafe(16), # Random secure tracking ID
                status='pending'
            )
            targets.append(target)
            
        self.db.add_all(targets)
        
        # Update stats count
        campaign.total_targets = len(targets)
        
        await self.db.commit()
        await self.db.refresh(campaign)
        return campaign

    async def launch_campaign(self, campaign_id: UUID) -> Campaign:
        """
        Start a campaign: sending emails to all pending targets.
        """
        from app.core.services.email import get_email_provider, EmailMessage
        from app.core.config import settings

        # 1. Fetch Campaign with Template and Targets
        query = select(Campaign).filter(Campaign.id == campaign_id)
        result = await self.db.execute(query)
        campaign = result.scalar_one_or_none()
        
        if not campaign:
            raise ValueError("Campaign not found")
            
        if campaign.status != 'draft':
            raise ValueError(f"Campaign is already {campaign.status}")
            
        # Explicit eager load for async
        # (In a real app, use .options(selectinload(...)) in the query above)
        # For now, let's fetch targets separately to be safe with async
        target_query = select(CampaignTarget, User).join(User).filter(CampaignTarget.campaign_id == campaign_id, CampaignTarget.status == 'pending')
        result = await self.db.execute(target_query)
        targets_with_users = result.all() # list of (CampaignTarget, User)
        
        # Get Template
        template_query = select(Campaign).join(Campaign.template).filter(Campaign.id == campaign_id)
        # Note: We need to fetch template data. 
        # Simpler: Just fetch template by ID stored in campaign
        from app.modules.simulation.models.template import Template
        t_result = await self.db.execute(select(Template).filter(Template.id == campaign.template_id))
        template = t_result.scalar_one()

        email_provider = get_email_provider()
        
        campaign.status = "running"
        campaign.scheduled_start = datetime.utcnow()
        sent_count = 0
        
        # 2. Iterate and Send
        # Base URL for tracking links (e.g., https://phishguard.com/click?id=...)
        # We'll use a local placeholder for now
        base_tracking_url = f"http://localhost:8000/api/v1/track"
        
        messages = []
        updates = []
        
        for target, user in targets_with_users:
            # Generate personalized link
            tracking_link = f"{base_tracking_url}/{target.tracking_id}"
            
            # Replace variables
            # TODO: robust template engine (Jinja2)
            body = template.body_html.replace("{{link}}", tracking_link)
            body = body.replace("{{name}}", user.name)
            
            msg = EmailMessage(
                to_email=user.email,
                subject=template.subject,
                body_html=body,
                body_text=template.body_text or "Please enable HTML to view this message.",
                from_name=template.brand_name,  # Impersonation
                from_email=f"security@{template.brand_name.lower().replace(' ', '')}.com", # Fake sender
                campaign_id=str(campaign.id),
                tracking_id=target.tracking_id
            )
            
            # We'll send one by one for now to update status easily
            try:
                await email_provider.send_email(msg)
                target.status = 'sent'
                target.sent_at = datetime.utcnow()
                sent_count += 1
            except Exception as e:
                print(f"Failed to send to {user.email}: {e}")
                target.status = 'failed'
                
            updates.append(target)
            
        campaign.emails_sent = sent_count
        await self.db.commit()
        await self.db.refresh(campaign)
        
        return campaign
