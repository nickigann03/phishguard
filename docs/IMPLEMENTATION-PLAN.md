# PhishGuard Implementation Plan
## Professional Development Roadmap

*Based on current codebase analysis - you have: FastAPI skeleton, Docker Compose setup*

---

# RECOMMENDED DEVELOPMENT APPROACH

## Phase 0: Foundation & Infrastructure (Week 1-2) ← **START HERE**

### What You Have
✅ Basic FastAPI app  
✅ Docker Compose (PostgreSQL, Redis)  
✅ Project structure started  

### What's Missing (Foundation Layer)
❌ Database models & migrations  
❌ Configuration management  
❌ Authentication system  
❌ Core utilities  
❌ Testing framework  

---

## SPRINT 1: Core Infrastructure (5-7 days)

### Day 1-2: Database & Config Setup

**Priority 1: Configuration Management**
```
Create:
├── api/app/core/config.py          # Pydantic settings
├── api/app/core/database.py        # SQLAlchemy setup
└── api/app/core/security.py        # JWT, password hashing
```

**Tasks:**
- [ ] Set up Pydantic Settings with environment variables
- [ ] Configure SQLAlchemy async engine
- [ ] Set up Alembic for migrations
- [ ] Create initial database connection

**Files to create:**
1. `api/app/core/config.py` - Centralized config
2. `api/app/core/database.py` - Database connection
3. `api/alembic.ini` - Migration config
4. `api/migrations/env.py` - Alembic environment

---

### Day 3-4: Core Models (Organizations & Users)

**Priority 2: Foundational Database Models**
```
Create:
├── api/app/core/models/
│   ├── __init__.py
│   ├── base.py                    # Base model class
│   ├── organization.py            # Organization model
│   └── user.py                    # User model
```

**Tasks:**
- [ ] Create base SQLAlchemy model
- [ ] Implement Organization model
- [ ] Implement User model with relationships
- [ ] Create first Alembic migration
- [ ] Run migration to create tables

**Why these first?**
- Every other module depends on Organization & User
- Multi-tenancy starts here
- Auth system needs User model

---

### Day 5: Authentication System

**Priority 3: JWT Authentication**
```
Create:
├── api/app/core/security.py       # Password hashing, JWT
├── api/app/core/dependencies.py   # FastAPI dependencies
└── api/app/modules/auth/
    ├── __init__.py
    ├── router.py                  # Auth endpoints
    ├── schemas.py                 # Login/Register schemas
    └── service.py                 # Auth business logic
```

**Tasks:**
- [ ] Implement password hashing (bcrypt)
- [ ] Create JWT token generation/validation
- [ ] Build login endpoint
- [ ] Build token refresh endpoint
- [ ] Create `get_current_user` dependency

**Endpoints to implement:**
```
POST /api/v1/auth/login
POST /api/v1/auth/refresh
GET  /api/v1/auth/me
```

---

### Day 6-7: Testing & Documentation

**Priority 4: Testing Framework**
```
Create:
├── api/tests/
│   ├── conftest.py               # Pytest fixtures
│   ├── test_config.py
│   ├── test_database.py
│   └── test_auth.py
```

**Tasks:**
- [ ] Set up pytest with async support
- [ ] Create test database fixture
- [ ] Write tests for auth endpoints
- [ ] Set up test coverage reporting
- [ ] Document API with proper OpenAPI tags

---

## SPRINT 2: Simulation Module - Phase 1 (Week 2)

**Why Simulation Module First?**
- It's the core value proposition
- Other modules (Training, Analytics) depend on simulation data
- Can demonstrate value quickly

### Module Structure
```
api/app/modules/simulation/
├── __init__.py
├── models/
│   ├── __init__.py
│   ├── campaign.py
│   ├── template.py
│   └── landing_page.py
├── schemas/
│   ├── __init__.py
│   ├── campaign.py
│   └── template.py
├── repositories/
│   ├── __init__.py
│   ├── campaign.py
│   └── template.py
├── services/
│   ├── __init__.py
│   ├── campaign.py
│   └── template.py
└── routers/
    ├── __init__.py
    ├── campaigns.py
    └── templates.py
```

### Day 1-2: Template System

**Tasks:**
- [ ] Create Template model
- [ ] Create LandingPage model
- [ ] Seed Malaysia template library
- [ ] Build template CRUD endpoints
- [ ] Test template management

**Endpoints:**
```
GET    /api/v1/templates
POST   /api/v1/templates
GET    /api/v1/templates/{id}
PUT    /api/v1/templates/{id}
DELETE /api/v1/templates/{id}
GET    /api/v1/templates/library/MY
```

---

### Day 3-5: Campaign Management

**Tasks:**
- [ ] Create Campaign model
- [ ] Create CampaignTarget model
- [ ] Create CampaignEvent model
- [ ] Build campaign CRUD endpoints
- [ ] Implement campaign launch logic
- [ ] Add campaign statistics

**Endpoints:**
```
POST   /api/v1/campaigns
GET    /api/v1/campaigns
GET    /api/v1/campaigns/{id}
POST   /api/v1/campaigns/{id}/launch
GET    /api/v1/campaigns/{id}/stats
```

---

### Day 6-7: Email Injection (Microsoft Graph)

**Tasks:**
- [ ] Implement Microsoft Graph OAuth flow
- [ ] Create email injection service
- [ ] Build Celery tasks for sending
- [ ] Implement tracking ID generation
- [ ] Test email delivery

**New Files:**
```
api/app/modules/simulation/injection/
├── __init__.py
├── base.py
└── microsoft.py

api/app/worker/
├── __init__.py
└── tasks.py
```

---

## SPRINT 3: Tracking Server (Week 3)

### Separate Tracking Service

**Why separate?**
- Different scaling requirements
- Public endpoints (no auth)
- Can be CDN-cached

```
api/app/tracking/
├── __init__.py
├── main.py                # Separate FastAPI app
├── models.py
└── handlers.py
```

**Tasks:**
- [ ] Create tracking endpoints
- [ ] Implement pixel tracking
- [ ] Implement click redirect
- [ ] Implement credential capture
- [ ] Event logging to database
- [ ] Event publishing to Redis

**Endpoints:**
```
GET  /t/{tracking_id}/px.gif
GET  /t/{tracking_id}/click
POST /t/{tracking_id}/submit
```

---

## SPRINT 4: Frontend MVP (Week 3-4)

### Next.js Setup
```
web/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Landing page
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   └── (dashboard)/
│       ├── layout.tsx        # Dashboard layout
│       ├── campaigns/
│       ├── templates/
│       └── analytics/
├── components/
│   ├── ui/                   # shadcn components
│   ├── campaign-card.tsx
│   ├── template-browser.tsx
│   └── stats-dashboard.tsx
└── lib/
    ├── api.ts               # API client
    └── auth.ts              # Auth helpers
```

**Tasks:**
- [ ] Set up Next.js 14 with App Router
- [ ] Install shadcn/ui components
- [ ] Build authentication flow
- [ ] Create campaign management UI
- [ ] Create template browser
- [ ] Build real-time stats dashboard

---

## SPRINT 5: Analytics Module (Week 5)

### Risk Scoring Engine

**Tasks:**
- [ ] Create UserRiskProfile model
- [ ] Implement risk calculation algorithm
- [ ] Build scheduled risk recalculation (Celery)
- [ ] Create analytics endpoints
- [ ] Build dashboard widgets

**Files:**
```
api/app/modules/analytics/
├── models/
│   └── risk_profile.py
├── services/
│   └── risk_calculator.py
└── routers/
    └── analytics.py
```

---

## SPRINT 6: Training Module (Week 6)

### Auto-Assignment System

**Tasks:**
- [ ] Create TrainingModule model
- [ ] Create TrainingAssignment model
- [ ] Implement event listeners
- [ ] Build auto-assignment logic
- [ ] Create training content endpoints

**Event Flow:**
```
Campaign Event → Event Bus → Training Listener → Auto-Assign
```

---

## SPRINT 7: Gamification (Week 7)

### XP & Achievement System

**Tasks:**
- [ ] Create Achievement models
- [ ] Create XP transaction model
- [ ] Implement XP reward logic
- [ ] Build leaderboard (materialized view)
- [ ] Create gamification endpoints

---

## SPRINT 8: AI Integration (Week 8)

### LLM Service

**Tasks:**
- [ ] Create AI service wrapper
- [ ] Implement template generation
- [ ] Build campaign personalization
- [ ] Add natural language interface

---

# DEVELOPMENT WORKFLOW (Professional Practices)

## 1. Git Branching Strategy

```
main                    # Production-ready code
  └── develop           # Integration branch
      ├── feature/auth-system
      ├── feature/campaign-crud
      └── feature/template-library
```

**Workflow:**
1. Create feature branch from `develop`
2. Implement feature with tests
3. PR to `develop` (requires review)
4. After sprint, merge `develop` → `main`

---

## 2. Code Review Checklist

Before merging:
- [ ] All tests pass
- [ ] Code coverage > 80%
- [ ] Type hints added
- [ ] Docstrings added
- [ ] API documented in OpenAPI
- [ ] Database migrations created
- [ ] No secrets in code

---

## 3. Testing Strategy

**Unit Tests:**
```python
# tests/test_services/test_campaign_service.py
async def test_create_campaign(db_session, mock_user):
    service = CampaignService(db_session)
    campaign = await service.create(...)
    assert campaign.id is not None
```

**Integration Tests:**
```python
# tests/test_api/test_campaigns.py
async def test_create_campaign_endpoint(client, auth_headers):
    response = await client.post("/api/v1/campaigns", headers=auth_headers, json={...})
    assert response.status_code == 201
```

**E2E Tests:**
```python
# tests/test_e2e/test_campaign_flow.py
async def test_full_campaign_flow(client):
    # 1. Create campaign
    # 2. Launch campaign
    # 3. Simulate user click
    # 4. Check stats updated
```

---

## 4. Documentation Standards

**Code Documentation:**
```python
async def calculate_risk_score(user_id: UUID) -> float:
    """
    Calculate user's phishing risk score.
    
    Args:
        user_id: UUID of the user
        
    Returns:
        float: Risk score between 0.0 (low risk) and 1.0 (high risk)
        
    Raises:
        UserNotFound: If user doesn't exist
        
    Example:
        >>> score = await calculate_risk_score(user_id)
        >>> print(f"Risk: {score:.2%}")
    """
```

**API Documentation:**
- Use FastAPI's OpenAPI auto-generation
- Add detailed descriptions to endpoints
- Include request/response examples
- Tag endpoints by module

---

## 5. Environment Management

```bash
# .env.development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/phishguard_dev
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=dev_secret_key
AI_API_KEY=your_claude_api_key

# .env.testing
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/phishguard_test
REDIS_URL=redis://localhost:6379/1

# .env.production (never commit!)
DATABASE_URL=postgresql://...
SECRET_KEY=...  # Generated, 32+ chars
```

---

## 6. CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
      - name: Install dependencies
        run: pip install -r requirements-dev.txt
      - name: Run tests
        run: pytest --cov=app tests/
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

---

# QUICK START CHECKLIST

## Week 1 Tasks (Foundation)

- [ ] **Day 1:** Set up `config.py` and `database.py`
- [ ] **Day 2:** Create Alembic migrations, initial schema
- [ ] **Day 3:** Build Organization & User models
- [ ] **Day 4:** Implement authentication system
- [ ] **Day 5:** Write tests for auth
- [ ] **Day 6:** Set up CI/CD
- [ ] **Day 7:** Documentation review

## Week 2 Tasks (Simulation MVP)

- [ ] **Day 1-2:** Template system + Malaysia library
- [ ] **Day 3-4:** Campaign CRUD
- [ ] **Day 5-6:** Email injection (Microsoft Graph)
- [ ] **Day 7:** Integration testing

## Week 3 Tasks (Tracking + Frontend)

- [ ] **Day 1-2:** Tracking server
- [ ] **Day 3-5:** Next.js dashboard
- [ ] **Day 6-7:** E2E testing

---

# WHAT TO BUILD FIRST (IMMEDIATE NEXT STEPS)

## Step 1: Configuration & Database (Start Today!)

**Create these files in order:**

### 1. `api/app/core/config.py`
```python
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # App
    APP_NAME: str = "PhishGuard"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str
    
    # Redis
    REDIS_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # AI
    AI_API_KEY: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
```

### 2. `api/app/core/database.py`
```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"),
    echo=settings.DEBUG,
    future=True
)

# Session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Base model
Base = declarative_base()

# Dependency for FastAPI routes
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
```

### 3. Initialize Alembic
```bash
cd api
alembic init migrations
```

### 4. Update `migrations/env.py`
```python
from app.core.database import Base
from app.core.config import settings

# Import all models
from app.core.models import *

target_metadata = Base.metadata
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
```

---

## Step 2: First Models (Organization + User)

Create `api/app/core/models/organization.py` and `user.py` using schemas from BUILD-GUIDE.md

---

## Step 3: First Migration

```bash
alembic revision --autogenerate -m "Create organizations and users tables"
alembic upgrade head
```

---

## Step 4: Authentication

Implement JWT auth in `api/app/modules/auth/`

---

# DEBUGGING & TROUBLESHOOTING

## Common Issues

**Database Connection Fails:**
```bash
# Check if PostgreSQL is running
docker-compose ps

# Check connection
docker-compose exec db psql -U postgres -d phishguard -c "SELECT 1;"
```

**Alembic Migration Issues:**
```bash
# Check current version
alembic current

# Downgrade one version
alembic downgrade -1

# Upgrade to latest
alembic upgrade head
```

**Import Errors:**
```bash
# Ensure PYTHONPATH is set
export PYTHONPATH="${PYTHONPATH}:/app"
```

---

# SUCCESS METRICS

## Week 1 Definition of Done
- [ ] API starts without errors
- [ ] Database migrations work
- [ ] Can create organization
- [ ] Can create user
- [ ] Can login and get JWT token
- [ ] `/api/docs` shows auth endpoints
- [ ] At least 10 tests passing

## Week 2 Definition of Done
- [ ] Can create campaign
- [ ] Can select Malaysia template
- [ ] Can launch simulation
- [ ] Email sends successfully
- [ ] `/api/docs` shows campaign endpoints
- [ ] At least 25 tests passing

---

**RECOMMENDED: Start with Step 1 (Configuration & Database) tomorrow. Get that foundation rock solid before moving to other modules.**
