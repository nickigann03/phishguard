from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime, date
from uuid import UUID

class TimeSeriesPoint(BaseModel):
    date: date
    count: int

class CampaignStats(BaseModel):
    campaign_id: UUID
    name: str
    status: str
    total_targets: int
    emails_sent: int
    emails_opened: int
    links_clicked: int
    credentials_submitted: int
    
    # Computed rates
    open_rate: float
    click_rate: float
    
    class Config:
        from_attributes = True

class DashboardSummary(BaseModel):
    total_campaigns: int
    active_campaigns: int
    total_targets_simulated: int
    avg_click_rate: float
    avg_open_rate: float
    risk_score_trend: str # increasing, decreasing, stable

class DepartmentRisk(BaseModel):
    department: str
    risk_score: float
    click_rate: float
    user_count: int

class AnalyticsResponse(BaseModel):
    summary: DashboardSummary
    recent_campaigns: List[CampaignStats]
    risk_by_department: List[DepartmentRisk]
    click_trend: List[TimeSeriesPoint]
