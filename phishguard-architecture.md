# PhishGuard: Email Security Platform
## Architecture Design Document v1.0

---

## 1. Executive Summary

PhishGuard is a modular, AI-enhanced email security platform comprising:
- **Phishing Simulation** - Campaign management, payload delivery, tracking
- **Security Training** - Adaptive learning modules post-simulation
- **Email Detection** - ML-based threat detection and classification
- **Sandbox Analysis** - Malware analysis and detonation
- **Analytics & Reporting** - Risk scoring, dashboards, compliance reports

**Design Principles:**
- Plugin architecture - modules are independent and swappable
- Event-driven communication - loose coupling between modules
- AI-first design - AI services layer accessible to all modules
- Multi-tenant - single deployment serves multiple organizations
- Malaysia-focused - localized templates, threats, and compliance

---

## 2. System Architecture Overview

```
                            ┌─────────────────────────────┐
                            │      Load Balancer          │
                            │        (Nginx/AWS ALB)      │
                            └─────────────┬───────────────┘
                                          │
                            ┌─────────────▼───────────────┐
                            │       API Gateway           │
                            │  (Auth, Rate Limit, Route)  │
                            │        FastAPI              │
                            └─────────────┬───────────────┘
                                          │
         ┌────────────┬───────────┬───────┴────┬───────────┬────────────┐
         ▼            ▼           ▼            ▼           ▼            ▼
    ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
    │Simulation│ │Templates│ │Training │ │Detection│ │ Sandbox │ │Analytics│
    │ Module   │ │ Module  │ │ Module  │ │ Module  │ │ Module  │ │ Module  │
    └────┬─────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
         │            │           │            │           │            │
         └────────────┴───────────┴─────┬──────┴───────────┴────────────┘
                                        │
                      ┌─────────────────┼─────────────────┐
                      ▼                 ▼                 ▼
              ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
              │  Event Bus  │   │ AI Services │   │    Core     │
              │   (Redis)   │   │   Layer     │   │  Services   │
              └─────────────┘   └─────────────┘   └─────────────┘
                                        │
                      ┌─────────────────┼─────────────────┐
                      ▼                 ▼                 ▼
              ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
              │ PostgreSQL  │   │    Redis    │   │ Object Store│
              │  (Primary)  │   │   (Cache)   │   │  (S3/Minio) │
              └─────────────┘   └─────────────┘   └─────────────┘
```

---

## 3. Tech Stack

| Layer | Technology | Rationale |
|-------------------|-----------|-----------|
| **API Framework** | FastAPI (Python 3.11+) | Async, type hints, auto OpenAPI docs |
| **Database** | PostgreSQL 15+ | JSONB for flexible schemas, strong consistency |
| **Cache/Queue** | Redis 7+ | Event pub/sub, caching, rate limiting |
| **Task Queue** | Celery + Redis | Background jobs, scheduled campaigns |
| **Frontend** | React 18 + TypeScript | Component ecosystem, type safety |
| **UI Framework** | Tailwind + shadcn/ui | Rapid development, consistent design |
| **AI/LLM** | Claude API / OpenAI | Content generation, analysis |
| **ML Framework** | scikit-learn, PyTorch | Custom detection models |
| **Email Integration** | Microsoft Graph API, Google Workspace API | Direct injection |
| **Container** | Docker + Docker Compose | Local dev and deployment |
| **Orchestration** | Kubernetes (production) | Scaling, resilience |

---

## 4. Module Specifications

### 4.1 Core Module (Foundation)

**Responsibility:** Shared services used by all modules

**Components:**
- Authentication (JWT + OAuth2)
- Organization/Tenant management
- User management
- Permission/RBAC system
- Audit logging
- Configuration management

**Database Models:**
```python
# core/models.py

class Organization(Base):
    id: UUID
    name: str
    domain: str  # e.g., "company.com.my"
    settings: JSONB  # Flexible org settings
    subscription_tier: Enum  # free, pro, enterprise
    created_at: datetime

class User(Base):
    id: UUID
    org_id: UUID  # FK -> Organization
    email: str
    name: str
    role: Enum  # admin, manager, employee
    department: str
    risk_score: float  # 0.0 - 1.0, updated by analytics
    last_simulation_at: datetime
    training_completed: JSONB  # List of completed module IDs
    created_at: datetime

class AuditLog(Base):
    id: UUID
    org_id: UUID
    user_id: UUID
    action: str
    resource_type: str
    resource_id: UUID
    metadata: JSONB
    timestamp: datetime
```

---

### 4.2 Simulation Module (Phase 1 Priority)

**Responsibility:** Create, execute, and track phishing campaigns

**Components:**
- Campaign management
- Target list management
- Email injection engine
- Click/open tracking
- Landing page serving

**Database Models:**
```python
# simulation/models.py

class Campaign(Base):
    id: UUID
    org_id: UUID
    name: str
    status: Enum  # draft, scheduled, running, completed, cancelled
    template_id: UUID  # FK -> Template
    
    # Targeting
    target_type: Enum  # all, department, custom_list
    target_config: JSONB  # {"departments": [...]} or {"user_ids": [...]}
    
    # Scheduling
    scheduled_start: datetime
    scheduled_end: datetime
    send_window_start: time  # e.g., 09:00
    send_window_end: time    # e.g., 17:00
    timezone: str            # e.g., "Asia/Kuala_Lumpur"
    
    # AI Enhancement
    ai_personalization: bool  # Use AI to personalize each email
    difficulty_level: Enum    # easy, medium, hard, adaptive
    
    # Results (denormalized for quick access)
    total_targets: int
    emails_sent: int
    emails_opened: int
    links_clicked: int
    credentials_submitted: int
    reported_count: int
    
    created_by: UUID
    created_at: datetime

class CampaignTarget(Base):
    id: UUID
    campaign_id: UUID
    user_id: UUID
    
    # Tracking
    tracking_id: str  # Unique token for this target
    status: Enum  # pending, sent, delivered, bounced
    
    # Events (timestamps)
    sent_at: datetime
    opened_at: datetime
    clicked_at: datetime
    submitted_at: datetime  # If credentials entered
    reported_at: datetime   # If user reported phishing
    
    # AI personalization data
    personalized_content: JSONB  # Stored generated content
    
class CampaignEvent(Base):
    """Immutable event log for detailed tracking"""
    id: UUID
    campaign_id: UUID
    target_id: UUID
    event_type: Enum  # sent, delivered, opened, clicked, submitted, reported
    metadata: JSONB   # IP, user agent, etc.
    timestamp: datetime
```

**API Endpoints:**
```
POST   /api/v1/campaigns                 # Create campaign
GET    /api/v1/campaigns                 # List campaigns
GET    /api/v1/campaigns/{id}            # Get campaign details
PUT    /api/v1/campaigns/{id}            # Update campaign
DELETE /api/v1/campaigns/{id}            # Delete campaign
POST   /api/v1/campaigns/{id}/launch     # Start campaign
POST   /api/v1/campaigns/{id}/pause      # Pause campaign
POST   /api/v1/campaigns/{id}/cancel     # Cancel campaign

GET    /api/v1/campaigns/{id}/targets    # List targets + status
GET    /api/v1/campaigns/{id}/events     # Event stream
GET    /api/v1/campaigns/{id}/stats      # Aggregated statistics

# Tracking endpoints (public, no auth)
GET    /t/{tracking_id}/px.gif          # Open tracking pixel
GET    /t/{tracking_id}/click           # Link click redirect
POST   /t/{tracking_id}/submit          # Credential submission
```

**Events Emitted:**
```python
# simulation/events.py

class SimulationEvents:
    CAMPAIGN_CREATED = "simulation.campaign.created"
    CAMPAIGN_LAUNCHED = "simulation.campaign.launched"
    CAMPAIGN_COMPLETED = "simulation.campaign.completed"
    
    EMAIL_SENT = "simulation.email.sent"
    EMAIL_OPENED = "simulation.email.opened"
    LINK_CLICKED = "simulation.link.clicked"
    CREDENTIALS_SUBMITTED = "simulation.credentials.submitted"
    PHISHING_REPORTED = "simulation.phishing.reported"

# Event payload example
{
    "event": "simulation.link.clicked",
    "timestamp": "2025-01-15T10:30:00Z",
    "data": {
        "org_id": "uuid",
        "campaign_id": "uuid",
        "user_id": "uuid",
        "tracking_id": "abc123",
        "metadata": {
            "ip": "1.2.3.4",
            "user_agent": "...",
            "click_url": "..."
        }
    }
}
```

---

### 4.3 Template Module

**Responsibility:** Manage phishing email templates

**Database Models:**
```python
# templates/models.py

class Template(Base):
    id: UUID
    org_id: UUID | None  # None = system template
    
    name: str
    description: str
    category: Enum  # credential_harvest, malware, bec, smishing, vishing
    
    # Content
    subject: str          # Supports variables: {{name}}, {{company}}
    body_html: str
    body_text: str
    
    # Landing page
    landing_page_id: UUID | None
    
    # Metadata
    difficulty: Enum      # easy, medium, hard
    tags: List[str]       # ["malaysia", "banking", "lhdn"]
    locale: str           # "en-MY", "ms-MY"
    
    # AI Generation
    ai_generated: bool
    ai_prompt_used: str | None
    
    # Stats
    times_used: int
    avg_click_rate: float
    
    is_active: bool
    created_at: datetime

class LandingPage(Base):
    id: UUID
    org_id: UUID | None
    
    name: str
    page_type: Enum  # credential_form, download, awareness
    html_content: str
    
    # For credential forms
    capture_fields: List[str]  # ["email", "password", "otp"]
    
    # Redirect after submission
    redirect_url: str  # Usually to training module

class TemplateVariable(Base):
    """Available variables for template personalization"""
    name: str           # e.g., "name", "company", "department"
    description: str
    source: str         # How to resolve: "user.name", "org.name", "ai_generate"
```

**Malaysia-Specific Template Categories:**
```python
MALAYSIA_TEMPLATES = {
    "banking": [
        "Maybank TAC Verification",
        "CIMB Secure Login Alert",
        "Public Bank Account Suspended",
        "RHB Online Banking Update",
    ],
    "government": [
        "LHDN Tax Refund Notification",
        "KWSP i-Sinar Withdrawal",
        "MySejahtera Health Alert",
        "JPJ Summons Payment",
        "JPN MyKad Renewal",
    ],
    "ecommerce": [
        "Shopee Order Confirmation",
        "Lazada Delivery Failed",
        "Grab Reward Points Expiring",
        "Touch n Go eWallet Verification",
    ],
    "corporate": [
        "HR Bonus Announcement",
        "IT Password Expiry",
        "CEO Wire Transfer Request (BEC)",
        "Microsoft 365 Storage Full",
    ],
    "logistics": [
        "Pos Malaysia Delivery Attempt",
        "J&T Express Package Held",
        "DHL Customs Clearance",
    ]
}
```

---

### 4.4 Training Module

**Responsibility:** Deliver security awareness training

**Database Models:**
```python
# training/models.py

class TrainingModule(Base):
    id: UUID
    name: str
    description: str
    
    content_type: Enum  # video, interactive, quiz, article
    content_url: str    # S3 path or external URL
    
    duration_minutes: int
    difficulty: Enum
    
    # Triggers
    auto_assign_on: List[str]  # Events that trigger assignment
    # e.g., ["simulation.link.clicked", "simulation.credentials.submitted"]
    
    tags: List[str]
    locale: str
    is_active: bool

class TrainingAssignment(Base):
    id: UUID
    user_id: UUID
    module_id: UUID
    
    assigned_reason: str  # "Failed campaign X" or "Mandatory annual"
    assigned_at: datetime
    due_date: datetime
    
    status: Enum  # assigned, in_progress, completed, overdue
    started_at: datetime
    completed_at: datetime
    score: float  # Quiz score if applicable
    
    # Link to triggering event
    triggered_by_campaign_id: UUID | None
    triggered_by_event: str | None

class QuizQuestion(Base):
    id: UUID
    module_id: UUID
    question_text: str
    question_type: Enum  # multiple_choice, true_false, image_identify
    options: JSONB
    correct_answer: str
    explanation: str
```

**Events Consumed:**
```python
# Training module listens for these events
LISTENED_EVENTS = [
    "simulation.link.clicked",       # Assign basic training
    "simulation.credentials.submitted",  # Assign advanced training
]
```

---

### 4.5 Analytics Module

**Responsibility:** Aggregate data, calculate risk scores, generate reports

**Database Models:**
```python
# analytics/models.py

class UserRiskProfile(Base):
    user_id: UUID
    org_id: UUID
    
    # Calculated scores (0.0 - 1.0)
    overall_risk_score: float
    click_susceptibility: float
    reporting_score: float  # Higher = better at reporting
    training_completion_rate: float
    
    # Historical stats
    total_simulations_received: int
    total_clicks: int
    total_submissions: int
    total_reported: int
    
    # Trend
    risk_trend: Enum  # improving, stable, declining
    last_calculated: datetime

class OrgSecurityMetrics(Base):
    org_id: UUID
    period: date  # Monthly aggregation
    
    # Simulation metrics
    campaigns_run: int
    total_emails_sent: int
    overall_click_rate: float
    overall_report_rate: float
    
    # Training metrics
    training_completion_rate: float
    avg_quiz_score: float
    
    # Department breakdown
    department_metrics: JSONB
    
    # Comparison
    industry_benchmark_percentile: float

class Report(Base):
    id: UUID
    org_id: UUID
    
    report_type: Enum  # campaign_summary, monthly_executive, compliance
    parameters: JSONB  # Date range, filters, etc.
    
    generated_at: datetime
    file_url: str  # S3 path to PDF/Excel
    generated_by: UUID
```

**Risk Scoring Algorithm:**
```python
def calculate_user_risk_score(user_id: UUID) -> float:
    """
    Risk score components:
    - Click rate (40%): % of simulations clicked
    - Submission rate (30%): % of simulations with credential submission
    - Report rate (20%): Inverse - higher reporting = lower risk
    - Training (10%): Completion and quiz scores
    
    Weighted by recency - recent events matter more
    """
    # Implementation details...
```

---

### 4.6 Detection Module (Future Phase)

**Responsibility:** ML-based email threat detection

**Components:**
- Email ingestion pipeline
- Feature extraction
- ML classification models
- Threat intelligence integration
- Alert management

**ML Models:**
```python
DETECTION_MODELS = {
    "phishing_classifier": {
        "type": "binary_classification",
        "features": ["url_analysis", "sender_reputation", "content_analysis", "header_anomalies"],
        "model": "RandomForest / XGBoost / BERT fine-tuned"
    },
    "bec_detector": {
        "type": "anomaly_detection",
        "features": ["sender_behavior", "request_patterns", "urgency_indicators"],
        "model": "Isolation Forest + LLM verification"
    },
    "malware_predictor": {
        "type": "binary_classification", 
        "features": ["attachment_analysis", "url_reputation", "sandbox_results"],
        "model": "Ensemble"
    }
}
```

---

### 4.7 Sandbox Module (Future Phase)

**Responsibility:** Safe execution and analysis of suspicious attachments/URLs

**Components:**
- File detonation (VM-based)
- URL crawling
- Behavior analysis
- IOC extraction

**Integration Options:**
- Self-hosted: Cuckoo Sandbox
- Cloud: Any.Run API, Joe Sandbox, Hybrid Analysis
- Hybrid: Quick checks via VirusTotal, deep analysis on-demand

---

## 5. AI Services Layer

### 5.1 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Services Layer                         │
├─────────────────┬──────────────────┬────────────────────────┤
│   LLM Service   │   ML Pipeline    │   Analysis Service     │
│                 │                  │                        │
│ - Generate      │ - Train models   │ - Malware analysis     │
│   phishing      │ - Run inference  │ - URL reputation       │
│   content       │ - Feature        │ - Threat intelligence  │
│ - Personalize   │   extraction     │                        │
│   emails        │                  │                        │
│ - Analyze       │                  │                        │
│   responses     │                  │                        │
└────────┬────────┴────────┬─────────┴───────────┬────────────┘
         │                 │                     │
         ▼                 ▼                     ▼
    ┌─────────┐      ┌──────────┐         ┌──────────┐
    │ Claude  │      │ Custom   │         │ External │
    │ OpenAI  │      │ ML Models│         │   APIs   │
    │ Local   │      │ (S3/MLflow)        │(VirusTotal│
    │ LLM     │      └──────────┘         │ etc.)    │
    └─────────┘                           └──────────┘
```

### 5.2 LLM Service Interface

```python
# ai_services/llm_service.py

class LLMService:
    """Unified interface for LLM operations"""
    
    async def generate_phishing_email(
        self,
        template_type: str,
        target_context: TargetContext,
        difficulty: str,
        locale: str = "en-MY"
    ) -> GeneratedEmail:
        """
        Generate personalized phishing email content.
        
        TargetContext includes:
        - name, email, department, role
        - company info
        - recent company news (if available)
        - LinkedIn data (if available)
        """
        
    async def analyze_email_threat(
        self,
        email: EmailContent
    ) -> ThreatAnalysis:
        """
        Use LLM to analyze email for phishing indicators.
        Returns confidence score and reasoning.
        """
        
    async def generate_training_content(
        self,
        failed_scenario: str,
        user_profile: UserProfile
    ) -> TrainingContent:
        """
        Generate personalized training based on what the user fell for.
        """
        
    async def generate_campaign_suggestions(
        self,
        org_context: OrgContext,
        recent_threats: List[ThreatIntel]
    ) -> List[CampaignSuggestion]:
        """
        Suggest relevant phishing campaigns based on:
        - Organization industry
        - Current threat landscape
        - User risk profiles
        """
```

### 5.3 AI-Powered Features by Module

| Module | AI Feature | Implementation |
|--------|-----------|----------------|
| **Simulation** | Personalized payload generation | LLM with target context |
| **Simulation** | Adaptive difficulty | ML model on user history |
| **Simulation** | Campaign suggestions | LLM + threat intel |
| **Templates** | Template generation | LLM with category/locale |
| **Training** | Personalized learning path | ML recommendation |
| **Training** | Dynamic quiz generation | LLM |
| **Detection** | Email classification | Custom ML models |
| **Detection** | BEC detection | LLM + anomaly detection |
| **Analytics** | Risk prediction | ML regression |
| **Analytics** | Report summarization | LLM |

---

## 6. Event System

### 6.1 Event Bus Architecture

Using Redis Pub/Sub for simplicity, with option to migrate to RabbitMQ/Kafka for scale.

```python
# core/events.py

class EventBus:
    def __init__(self, redis_client):
        self.redis = redis_client
        self.handlers: Dict[str, List[Callable]] = {}
    
    async def publish(self, event: Event):
        """Publish event to all subscribers"""
        await self.redis.publish(
            event.type,
            event.json()
        )
        # Also store in event log for replay
        await self.store_event(event)
    
    def subscribe(self, event_type: str, handler: Callable):
        """Register handler for event type"""
        if event_type not in self.handlers:
            self.handlers[event_type] = []
        self.handlers[event_type].append(handler)

class Event(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    type: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    org_id: UUID
    data: Dict[str, Any]
    metadata: Dict[str, Any] = {}
```

### 6.2 Event Catalog

```yaml
# All events in the system

simulation:
  - simulation.campaign.created
  - simulation.campaign.launched
  - simulation.campaign.completed
  - simulation.campaign.cancelled
  - simulation.email.sent
  - simulation.email.delivered
  - simulation.email.bounced
  - simulation.email.opened
  - simulation.link.clicked
  - simulation.credentials.submitted
  - simulation.phishing.reported

training:
  - training.module.assigned
  - training.module.started
  - training.module.completed
  - training.quiz.submitted

detection:
  - detection.email.scanned
  - detection.threat.detected
  - detection.alert.created
  - detection.alert.resolved

analytics:
  - analytics.risk_score.updated
  - analytics.report.generated

user:
  - user.created
  - user.updated
  - user.risk_level.changed
```

### 6.3 Event Handlers Matrix

| Event | Analytics | Training | Notification |
|-------|-----------|----------|--------------|
| `simulation.link.clicked` | Update click stats | Assign basic training | Alert admin (optional) |
| `simulation.credentials.submitted` | Update submission stats | Assign advanced training | Alert admin |
| `simulation.phishing.reported` | Update report stats | Award points | - |
| `training.module.completed` | Update training stats | - | Notify manager |
| `detection.threat.detected` | Log threat | - | Alert SOC |

---

## 7. API Design

### 7.1 API Structure

```
/api/v1/
├── /auth
│   ├── POST /login
│   ├── POST /logout
│   ├── POST /refresh
│   └── POST /oauth/{provider}/callback
│
├── /organizations
│   ├── GET /
│   ├── POST /
│   ├── GET /{org_id}
│   ├── PUT /{org_id}
│   └── GET /{org_id}/settings
│
├── /users
│   ├── GET /
│   ├── POST /
│   ├── GET /{user_id}
│   ├── PUT /{user_id}
│   ├── GET /{user_id}/risk-profile
│   └── GET /{user_id}/training-history
│
├── /campaigns
│   ├── GET /
│   ├── POST /
│   ├── GET /{campaign_id}
│   ├── PUT /{campaign_id}
│   ├── DELETE /{campaign_id}
│   ├── POST /{campaign_id}/launch
│   ├── POST /{campaign_id}/pause
│   ├── GET /{campaign_id}/targets
│   ├── GET /{campaign_id}/events
│   └── GET /{campaign_id}/stats
│
├── /templates
│   ├── GET /
│   ├── POST /
│   ├── GET /{template_id}
│   ├── PUT /{template_id}
│   ├── DELETE /{template_id}
│   ├── POST /{template_id}/clone
│   └── POST /generate  # AI generation
│
├── /training
│   ├── GET /modules
│   ├── GET /modules/{module_id}
│   ├── GET /assignments
│   ├── POST /assignments
│   └── PUT /assignments/{id}/complete
│
├── /analytics
│   ├── GET /dashboard
│   ├── GET /org-metrics
│   ├── GET /user-risk-scores
│   ├── GET /campaign-comparison
│   └── POST /reports/generate
│
├── /ai
│   ├── POST /generate-email
│   ├── POST /personalize-campaign
│   ├── POST /suggest-campaigns
│   └── POST /analyze-threat
│
└── /tracking (public, no auth)
    ├── GET /t/{tracking_id}/px.gif
    ├── GET /t/{tracking_id}/click
    └── POST /t/{tracking_id}/submit
```

### 7.2 Authentication

```python
# JWT-based with refresh tokens
# OAuth2 for Microsoft/Google integration

class TokenPayload(BaseModel):
    sub: UUID          # User ID
    org_id: UUID       # Organization ID
    role: str          # User role
    permissions: List[str]
    exp: datetime
    iat: datetime
```

### 7.3 Multi-tenancy

All queries automatically scoped by `org_id` from JWT:

```python
# Dependency injection for org scoping
async def get_current_org(token: TokenPayload = Depends(get_token)):
    return token.org_id

# All repository methods include org_id
class CampaignRepository:
    async def list(self, org_id: UUID, filters: CampaignFilters):
        return await self.db.query(Campaign).filter(
            Campaign.org_id == org_id,
            # ... other filters
        ).all()
```

---

## 8. Email Injection Architecture

### 8.1 Supported Methods

```python
class EmailInjectionMethod(Enum):
    MICROSOFT_GRAPH = "microsoft_graph"  # O365/Exchange Online
    GOOGLE_WORKSPACE = "google_workspace"  # Gmail
    SMTP_RELAY = "smtp_relay"  # On-prem or fallback
```

### 8.2 Microsoft Graph API Integration

```python
# simulation/injection/microsoft.py

class MicrosoftGraphInjector:
    """
    Direct message injection via Microsoft Graph API.
    Requires admin consent for Mail.ReadWrite application permission.
    """
    
    GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0"
    
    async def inject_email(
        self,
        target_email: str,
        subject: str,
        body_html: str,
        sender_display: str,
        tracking_headers: Dict[str, str]
    ) -> InjectionResult:
        """
        Inject email directly into user's inbox.
        
        Uses: POST /users/{id}/mailFolders/inbox/messages
        
        Benefits over SMTP:
        - Bypasses spam filters (whitelisted)
        - Appears as internal email
        - No SPF/DKIM issues
        - Full control over headers
        """
        
        message = {
            "subject": subject,
            "body": {
                "contentType": "HTML",
                "content": body_html
            },
            "from": {
                "emailAddress": {
                    "name": sender_display,
                    "address": self.simulation_sender
                }
            },
            "toRecipients": [{
                "emailAddress": {"address": target_email}
            }],
            "internetMessageHeaders": [
                {"name": "X-PhishGuard-Campaign", "value": tracking_headers["campaign_id"]},
                {"name": "X-PhishGuard-Tracking", "value": tracking_headers["tracking_id"]},
            ],
            "isRead": False
        }
        
        # Inject directly to inbox
        response = await self.client.post(
            f"{self.GRAPH_BASE_URL}/users/{target_email}/mailFolders/inbox/messages",
            json=message,
            headers={"Authorization": f"Bearer {self.access_token}"}
        )
        
        return InjectionResult(
            success=response.status_code == 201,
            message_id=response.json().get("id"),
            method="microsoft_graph"
        )

    async def setup_organization(self, org_id: UUID) -> SetupResult:
        """
        Guide for setting up Graph API access:
        1. Register app in Azure AD
        2. Request Mail.ReadWrite permission
        3. Admin grants consent
        4. Store client credentials securely
        """
```

### 8.3 Google Workspace Integration

```python
# simulation/injection/google.py

class GoogleWorkspaceInjector:
    """
    Email injection via Gmail API with domain-wide delegation.
    Requires: Gmail API + domain-wide delegation setup
    """
    
    async def inject_email(
        self,
        target_email: str,
        subject: str,
        body_html: str,
        sender_display: str,
        tracking_headers: Dict[str, str]
    ) -> InjectionResult:
        """
        Insert email into user's inbox using Gmail API.
        Uses: POST /gmail/v1/users/{userId}/messages/insert
        """
        
        # Build MIME message
        message = MIMEMultipart('alternative')
        message['Subject'] = subject
        message['From'] = f"{sender_display} <{self.simulation_sender}>"
        message['To'] = target_email
        
        # Add tracking headers
        for key, value in tracking_headers.items():
            message[f'X-PhishGuard-{key}'] = value
        
        message.attach(MIMEText(body_html, 'html'))
        
        # Encode and insert
        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
        
        response = await self.service.users().messages().insert(
            userId=target_email,
            body={'raw': raw},
            internalDateSource='receivedTime'
        ).execute()
        
        return InjectionResult(
            success=True,
            message_id=response['id'],
            method="google_workspace"
        )
```

### 8.4 Tracking Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Phishing Email                                │
│                                                                  │
│  Subject: Your Maybank TAC is expiring                          │
│                                                                  │
│  Dear {{name}},                                                  │
│                                                                  │
│  Your TAC device needs verification...                          │
│                                                                  │
│  [Verify Now] ─────────────────────────────────────────────┐    │
│       │                                                     │    │
│       │  href="https://phishguard.io/t/abc123/click"       │    │
│       │           │                                         │    │
│       │           └─► Tracking ID (unique per target)       │    │
│                                                                  │
│  <img src="https://phishguard.io/t/abc123/px.gif" />  ◄── Open │
│                                                        Tracking  │
└─────────────────────────────────────────────────────────────────┘

                              │
                              ▼
              
┌─────────────────────────────────────────────────────────────────┐
│                    Tracking Server                               │
│                                                                  │
│  GET /t/{tracking_id}/px.gif                                    │
│    → Log open event with IP, User-Agent, timestamp              │
│    → Return 1x1 transparent GIF                                 │
│                                                                  │
│  GET /t/{tracking_id}/click?url={encoded_destination}           │
│    → Log click event                                            │
│    → Redirect to landing page OR real URL (for advanced tests)  │
│                                                                  │
│  POST /t/{tracking_id}/submit                                   │
│    → Log credential submission (DO NOT store actual creds)      │
│    → Redirect to training module                                │
└─────────────────────────────────────────────────────────────────┘
```

```python
# simulation/tracking.py

@router.get("/t/{tracking_id}/px.gif")
async def track_open(
    tracking_id: str,
    request: Request,
    bg_tasks: BackgroundTasks
):
    """Track email open via invisible pixel"""
    
    # Fire-and-forget event logging
    bg_tasks.add_task(
        log_tracking_event,
        tracking_id=tracking_id,
        event_type="opened",
        ip=request.client.host,
        user_agent=request.headers.get("user-agent"),
        timestamp=datetime.utcnow()
    )
    
    # Return 1x1 transparent GIF
    return Response(
        content=TRANSPARENT_GIF_BYTES,
        media_type="image/gif",
        headers={"Cache-Control": "no-store, no-cache, must-revalidate"}
    )

@router.get("/t/{tracking_id}/click")
async def track_click(
    tracking_id: str,
    request: Request,
    bg_tasks: BackgroundTasks
):
    """Track link click and redirect to landing page"""
    
    # Get campaign target info
    target = await get_target_by_tracking_id(tracking_id)
    
    if not target:
        raise HTTPException(404)
    
    # Log click event
    bg_tasks.add_task(
        log_tracking_event,
        tracking_id=tracking_id,
        event_type="clicked",
        ip=request.client.host,
        user_agent=request.headers.get("user-agent"),
        timestamp=datetime.utcnow()
    )
    
    # Emit event for other modules
    await event_bus.publish(Event(
        type="simulation.link.clicked",
        org_id=target.org_id,
        data={
            "campaign_id": str(target.campaign_id),
            "user_id": str(target.user_id),
            "tracking_id": tracking_id
        }
    ))
    
    # Redirect to landing page
    landing_url = await get_landing_page_url(target.campaign_id, tracking_id)
    return RedirectResponse(url=landing_url, status_code=302)
```

---

## 9. Security Considerations

### 9.1 Platform Security

| Concern | Mitigation |
|---------|------------|
| **Credential Storage** | NEVER store actual credentials from simulations. Log only that submission occurred. |
| **Multi-tenancy Isolation** | All queries scoped by org_id. Row-level security in PostgreSQL. |
| **API Security** | JWT + rate limiting + input validation |
| **Tracking Data** | Hash IPs after 30 days. Comply with PDPA (Malaysia). |
| **Secrets Management** | Use Vault or AWS Secrets Manager for API keys |
| **Audit Trail** | Immutable audit log for all admin actions |

### 9.2 Ethical Safeguards

```python
# Prevent misuse of the platform

class CampaignValidator:
    """Ensure campaigns are used ethically"""
    
    async def validate(self, campaign: Campaign, org: Organization):
        # 1. Only target users within the organization
        targets = await self.get_targets(campaign)
        for target in targets:
            if not target.email.endswith(f"@{org.domain}"):
                raise ValidationError("Cannot target external users")
        
        # 2. Require explicit authorization
        if not org.settings.get("simulation_authorized"):
            raise ValidationError("Organization must authorize simulations")
        
        # 3. Rate limit campaigns
        recent_campaigns = await self.count_recent_campaigns(org.id)
        if recent_campaigns > org.subscription.campaign_limit:
            raise ValidationError("Campaign limit exceeded")
        
        # 4. Prohibit truly malicious payloads
        if await self.contains_actual_malware(campaign.template):
            raise ValidationError("Actual malware not permitted")
```

### 9.3 Compliance (Malaysia Focus)

```python
COMPLIANCE_REQUIREMENTS = {
    "pdpa_malaysia": {
        "data_retention_days": 730,  # 2 years max
        "require_consent": True,
        "right_to_access": True,
        "right_to_delete": True,
        "cross_border_restrictions": True
    },
    "bnm_rmit": {
        # Bank Negara Malaysia - Risk Management in Technology
        "security_awareness_required": True,
        "phishing_testing_recommended": True,
        "incident_reporting": True
    }
}
```

---

## 10. Deployment Architecture

### 10.1 Development Environment

```yaml
# docker-compose.yml

version: '3.8'

services:
  api:
    build: ./api
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/phishguard
      - REDIS_URL=redis://redis:6379
      - AI_API_KEY=${AI_API_KEY}
    depends_on:
      - db
      - redis
    volumes:
      - ./api:/app

  worker:
    build: ./api
    command: celery -A app.worker worker -l info
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/phishguard
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  scheduler:
    build: ./api
    command: celery -A app.worker beat -l info
    depends_on:
      - worker

  web:
    build: ./web
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    volumes:
      - ./web:/app

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=phishguard
      - POSTGRES_PASSWORD=postgres
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

### 10.2 Production Architecture (AWS)

```
┌─────────────────────────────────────────────────────────────────┐
│                         CloudFront                               │
│                    (CDN + WAF + DDoS Protection)                │
└─────────────────────────────┬───────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│   Application Load      │     │      S3 + CloudFront    │
│      Balancer           │     │    (Static Frontend)    │
└───────────┬─────────────┘     └─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        EKS Cluster                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  API Pods   │  │ Worker Pods │  │ Scheduler   │              │
│  │  (FastAPI)  │  │  (Celery)   │  │   Pod       │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────┬───────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  RDS         │      │ ElastiCache  │      │     S3       │
│ (PostgreSQL) │      │   (Redis)    │      │  (Storage)   │
│  Multi-AZ    │      │   Cluster    │      │              │
└──────────────┘      └──────────────┘      └──────────────┘
```

---

## 11. Project Structure

```
phishguard/
├── api/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI app entry
│   │   ├── config.py               # Settings management
│   │   ├── database.py             # DB connection
│   │   │
│   │   ├── core/                   # Shared foundation
│   │   │   ├── __init__.py
│   │   │   ├── models.py           # Base models (Org, User)
│   │   │   ├── auth.py             # JWT, OAuth
│   │   │   ├── permissions.py      # RBAC
│   │   │   ├── events.py           # Event bus
│   │   │   └── exceptions.py
│   │   │
│   │   ├── modules/
│   │   │   ├── simulation/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── models.py       # Campaign, Target models
│   │   │   │   ├── schemas.py      # Pydantic schemas
│   │   │   │   ├── repository.py   # Database queries
│   │   │   │   ├── service.py      # Business logic
│   │   │   │   ├── router.py       # API endpoints
│   │   │   │   ├── events.py       # Event definitions
│   │   │   │   ├── tasks.py        # Celery tasks
│   │   │   │   └── injection/
│   │   │   │       ├── base.py
│   │   │   │       ├── microsoft.py
│   │   │   │       └── google.py
│   │   │   │
│   │   │   ├── templates/
│   │   │   │   ├── models.py
│   │   │   │   ├── schemas.py
│   │   │   │   ├── repository.py
│   │   │   │   ├── service.py
│   │   │   │   └── router.py
│   │   │   │
│   │   │   ├── training/
│   │   │   ├── analytics/
│   │   │   ├── detection/
│   │   │   └── sandbox/
│   │   │
│   │   ├── ai_services/
│   │   │   ├── __init__.py
│   │   │   ├── llm_service.py      # LLM wrapper
│   │   │   ├── ml_pipeline.py      # ML inference
│   │   │   └── prompts/
│   │   │       ├── phishing_generation.py
│   │   │       └── threat_analysis.py
│   │   │
│   │   └── worker.py               # Celery app
│   │
│   ├── migrations/                  # Alembic migrations
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
│
├── web/                             # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/               # API client
│   │   └── store/                  # State management
│   ├── package.json
│   └── Dockerfile
│
├── docs/
│   ├── architecture.md
│   ├── api-reference.md
│   └── deployment.md
│
├── scripts/
│   ├── seed_templates.py           # Load Malaysia templates
│   └── setup_dev.sh
│
├── docker-compose.yml
├── docker-compose.prod.yml
└── README.md
```

---

## 12. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Project setup (Docker, FastAPI, PostgreSQL, Redis)
- [ ] Core module: Auth, Org, User models
- [ ] Event bus implementation
- [ ] Basic API structure

### Phase 2: Simulation MVP (Weeks 3-5)
- [ ] Campaign CRUD
- [ ] Template CRUD with Malaysia templates
- [ ] Microsoft Graph API integration
- [ ] Tracking endpoints (pixel, click, submit)
- [ ] Basic campaign execution (Celery)

### Phase 3: Dashboard (Weeks 6-7)
- [ ] React app setup
- [ ] Campaign management UI
- [ ] Real-time campaign stats
- [ ] Template library browser

### Phase 4: AI Integration (Weeks 8-9)
- [ ] LLM service wrapper
- [ ] AI-powered template generation
- [ ] Campaign personalization
- [ ] Prompt engineering for Malaysia context

### Phase 5: Training Module (Weeks 10-11)
- [ ] Training content models
- [ ] Auto-assignment on failure
- [ ] Training completion tracking
- [ ] Basic quiz functionality

### Phase 6: Analytics (Weeks 12-13)
- [ ] Risk scoring algorithm
- [ ] Dashboard widgets
- [ ] Report generation
- [ ] Export functionality

### Phase 7: Polish & Production (Weeks 14-16)
- [ ] Security audit
- [ ] Performance optimization
- [ ] Documentation
- [ ] Production deployment

---

## 13. Getting Started

```bash
# Clone and setup
git clone https://github.com/your-org/phishguard.git
cd phishguard

# Copy environment template
cp .env.example .env
# Edit .env with your API keys

# Start development environment
docker-compose up -d

# Run migrations
docker-compose exec api alembic upgrade head

# Seed Malaysia templates
docker-compose exec api python scripts/seed_templates.py

# Access
# API: http://localhost:8000/docs
# Web: http://localhost:3000
```

---

## Appendix A: Malaysia Phishing Template Examples

```python
MALAYSIA_TEMPLATE_SEEDS = [
    {
        "name": "Maybank TAC Verification",
        "category": "credential_harvest",
        "difficulty": "medium",
        "locale": "en-MY",
        "tags": ["banking", "maybank", "malaysia"],
        "subject": "Urgent: Your Maybank2u TAC Device Requires Verification",
        "body_html": """
        <div style="font-family: Arial, sans-serif;">
            <img src="{{maybank_logo}}" alt="Maybank" style="height: 40px;">
            <p>Dear {{name}},</p>
            <p>We noticed unusual activity on your Maybank2u account. 
            To ensure your account security, please verify your TAC device immediately.</p>
            <p>Your account access will be limited if verification is not completed within 24 hours.</p>
            <p><a href="{{tracking_url}}" style="background: #ffc629; color: #000; 
                padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Verify Now
            </a></p>
            <p>Thank you for banking with Maybank.</p>
            <p style="color: #666; font-size: 12px;">
                This is an automated message. Please do not reply.
            </p>
        </div>
        """
    },
    {
        "name": "LHDN Tax Refund",
        "category": "credential_harvest", 
        "difficulty": "easy",
        "locale": "en-MY",
        "tags": ["government", "lhdn", "tax", "malaysia"],
        "subject": "LHDN: You Have a Pending Tax Refund of RM {{amount}}",
        "body_html": """..."""
    },
    # ... more templates
]
```

---

*Document Version: 1.0*
*Last Updated: January 2025*
*Author: PhishGuard Architecture Team*