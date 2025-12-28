from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from app.core.database import get_db
from app.modules.simulation.models.campaign import CampaignTarget, Campaign

router = APIRouter()

async def record_click_event(tracking_id: str, db: AsyncSession):
    """
    Background task to record the click statistics.
    """
    # Re-fetch because we are in a background task (or pass session? No, background tasks should manage their own or use the passed one carefully. 
    # Actually, Dependency Injection session might be closed. Better to simple update synchronously for MVP or manage session properly.)
    
    # For MVP simplicity, let's do it in the main request flow to ensure it works, 
    # realizing this adds latency. In prod, use a queue (Redis/Celery).
    pass 

@router.get("/{tracking_id}", response_class=HTMLResponse)
async def track_click(
    tracking_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    The tracking pixel/link endpoint.
    1. Records the click.
    2. Updates campaign stats.
    3. Serves the landing page (Simulation).
    """
    
    # 1. Find Target
    query = select(CampaignTarget).filter(CampaignTarget.tracking_id == tracking_id)
    result = await db.execute(query)
    target = result.scalar_one_or_none()
    
    if not target:
        # Invalid link, maybe 404 or just ignore to prevent scanning
        return HTMLResponse("<h1>Page Not Found</h1>", status_code=404)
    
    # 2. Update Stats (Idempotent-ish: record first click or every click?)
    # Usually record first click for "Clicked" status, but update counts
    current_time = datetime.utcnow()
    
    if not target.clicked_at:
        target.clicked_at = current_time
        target.status = 'clicked'
        
        # Update Campaign Stats
        # (Naive counter increment - race conditions possible but acceptable for MVP)
        campaign_result = await db.execute(select(Campaign).filter(Campaign.id == target.campaign_id))
        campaign = campaign_result.scalar_one()
        campaign.links_clicked += 1
        
        await db.commit()
    else:
        # Already clicked, maybe just log it?
        pass

    # 3. Render "You've been phished" Landing Page
    # In real app, fetch the LandingPage model linked to Campaign -> Template.
    # For now, hardcoded Education Page.
    
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Security Alert Test</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f7fafc; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 500px; text-align: center; }
            h1 { color: #e53e3e; }
            p { color: #4a5568; line-height: 1.5; }
            .btn { background-color: #3182ce; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>⚠️ Oops! You clicked it.</h1>
            <p><strong>This was a Phishing Simulation provided by your organization.</strong></p>
            <p>If this had been a real attack, hackers could have stolen your password or infected your computer.</p>
            <p>Please remember to always check the sender address and link URL before clicking.</p>
            <a href="#" class="btn">Continue to Training</a>
        </div>
    </body>
    </html>
    """
    
    return HTMLResponse(content=html_content)
