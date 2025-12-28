from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, case
from typing import List, Dict
from uuid import UUID

from app.modules.simulation.models.campaign import Campaign, CampaignTarget
from app.core.models.user import User
from app.modules.analytics.schemas import (
    DashboardSummary, 
    CampaignStats, 
    DepartmentRisk, 
    AnalyticsResponse,
    TimeSeriesPoint
)

class AnalyticsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_dashboard_summary(self, org_id: UUID) -> AnalyticsResponse:
        """
        Aggregate all analytics for the main dashboard.
        """
        # 1. Summary Stats
        # Calculate totals
        campaigns_query = select(
            func.count(Campaign.id).label('total'),
            func.sum(case((Campaign.status == 'running', 1), else_=0)).label('active'),
            func.sum(Campaign.total_targets).label('total_targets'),
            func.sum(Campaign.links_clicked).label('total_clicks'),
            func.sum(Campaign.emails_sent).label('total_sent')
        ).filter(Campaign.org_id == org_id)
        
        result = await self.db.execute(campaigns_query)
        stats = result.one()
        
        total_campaigns = stats.total or 0
        active_campaigns = stats.active or 0
        total_targets = stats.total_targets or 0
        total_clicks = stats.total_clicks or 0
        total_sent = stats.total_sent or 0
        
        # Avoid division by zero
        avg_click_rate = (total_clicks / total_sent * 100) if total_sent > 0 else 0.0
        # NOTE: open rate tracking requires pixel implementation, assuming 'emails_opened' is tracked
        # For now we use the campaign computed fields or sum them up
        
        summary = DashboardSummary(
            total_campaigns=total_campaigns,
            active_campaigns=active_campaigns,
            total_targets_simulated=total_targets,
            avg_click_rate=round(avg_click_rate, 2),
            avg_open_rate=0.0, # Placeholder
            risk_score_trend="stable" # Placeholder logic
        )
        
        # 2. Recent Campaigns
        query_recent = select(Campaign).filter(
            Campaign.org_id == org_id
        ).order_by(desc(Campaign.created_at)).limit(5)
        
        recent_res = await self.db.execute(query_recent)
        recent_campaigns_models = recent_res.scalars().all()
        
        recent_campaigns = []
        for c in recent_campaigns_models:
            sent = c.emails_sent or 0
            clicks = c.links_clicked or 0
            ctr = (clicks / sent * 100) if sent > 0 else 0.0
            opr = (c.emails_opened / sent * 100) if sent > 0 else 0.0
            
            recent_campaigns.append(CampaignStats(
                campaign_id=c.id,
                name=c.name,
                status=c.status,
                total_targets=c.total_targets or 0,
                emails_sent=sent,
                emails_opened=c.emails_opened or 0,
                links_clicked=clicks,
                credentials_submitted=c.credentials_submitted or 0,
                click_rate=round(ctr, 2),
                open_rate=round(opr, 2)
            ))

        # 3. Department Risk (Mocking complexity for now, usually requires joining User table and grouping)
        # Use simple aggregation
        dept_risk = [] 
        
        # 4. Click Trends (Last 7 days)
        # Group CampaignTarget.clicked_at by date
        # This requires PostgreSQL date_trunc or similar
        
        # Return full response
        return AnalyticsResponse(
            summary=summary,
            recent_campaigns=recent_campaigns,
            risk_by_department=[], # TODO: Implement grouping logic
            click_trend=[] # TODO: Implement time series
        )
