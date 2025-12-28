# PhishGuard: Complete Build Guide
## Everything You Need to Build the Platform

*This document contains all specifications, architecture, schemas, and implementation details to build PhishGuard from scratch.*

---

# TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Core Features](#3-core-features)
4. [Database Schema](#4-database-schema)
5. [API Specification](#5-api-specification)
6. [Module Specifications](#6-module-specifications)
7. [AI Services](#7-ai-services)
8. [Geo-Localization](#8-geo-localization)
9. [Multi-Channel System](#9-multi-channel-system)
10. [Gamification](#10-gamification)
11. [Security & Compliance](#11-security--compliance)
12. [Deployment](#12-deployment)
13. [Implementation Roadmap](#13-implementation-roadmap)
14. [Getting Started](#14-getting-started)

---

# 1. EXECUTIVE SUMMARY

## What is PhishGuard?

PhishGuard is an **AI-native, geo-localized security awareness platform** that combines:

### Original 5 Core Modules
1. **Phishing Simulation** - Multi-channel campaign management, payload delivery, tracking
2. **Security Training** - Adaptive learning modules with gamification
3. **Email Detection** - ML-based threat detection and classification
4. **Sandbox Analysis** - Malware analysis and detonation
5. **Analytics & Reporting** - Risk scoring, behavioral psychology, compliance reports

### 6 Unique Differentiators
1. **Geo-Localized Templates** - Malaysia, Singapore, Indonesia, Philippines, Thailand specific attacks
2. **Multi-Channel Attacks** - Email, SMS, WhatsApp, Voice phishing
3. **AI Copilot** - Natural language campaign builder
4. **Gamification** - XP, achievements, leaderboards, challenges
5. **Behavioral Psychology** - Cognitive bias profiling
6. **Enterprise Integrations** - SIEM, Slack, Teams, HR systems

## Competitive Positioning

| Feature | PhishGuard | KnowBe4 | GoPhish |
|---------|------------|---------|---------|
| Geo-Localized | ✅ SEA Focus | ❌ Western | ❌ Generic |
| Multi-Channel | ✅ Email+SMS+WhatsApp+Voice | ⚠️ Email+SMS | ❌ Email Only |
| AI Copilot | ✅ NL Interface | ❌ | ❌ |
| Gamification | ✅ Full System | ⚠️ Basic | ❌ |
| Behavioral AI | ✅ Psychology Analysis | ⚠️ Basic | ❌ |
| Self-Hosted | ✅ | ❌ SaaS Only | ✅ |
| Price | $3-5/user | $20+/user | Free |

---

# 2. SYSTEM ARCHITECTURE

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Load Balancer                            │
│                    (Nginx/CloudFlare/AWS ALB)                    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │       API Gateway         │
                │ (Auth, Rate Limit, Route) │
                │         FastAPI           │
                └─────────────┬─────────────┘
                              │
    ┌─────────────────────────┼─────────────────────────┐
    │                         │                         │
    ▼                         ▼                         ▼
┌─────────┐              ┌─────────┐              ┌──────────┐
│   Web   │              │   API   │              │ Tracking │
│ Next.js │              │ FastAPI │              │  Server  │
│  :3000  │              │  :8000  │              │  :8001   │
└─────────┘              └────┬────┘              └──────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
    ┌─────────┐          ┌─────────┐          ┌─────────┐
    │ Celery  │          │   AI    │          │  Event  │
    │ Workers │          │ Service │          │   Bus   │
    └─────────┘          └─────────┘          └─────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
    ┌──────────┐         ┌─────────┐         ┌─────────┐
    │PostgreSQL│         │  Redis  │         │S3/MinIO │
    │    16    │         │    7    │         │         │
    └──────────┘         └─────────┘         └─────────┘
```

## Module Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      PhishGuard Platform                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Simulation  │  │   Training   │  │  Analytics   │          │
│  │    Engine    │  │    Center    │  │   Dashboard  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Gamification │  │  AI Copilot  │  │Multi-Channel │          │
│  │    System    │  │              │  │   Attacks    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Detection   │  │   Sandbox    │  │ Integrations │          │
│  │    Engine    │  │   Analysis   │  │     Hub      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                  Core Services (Event Bus, Auth)                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# 3. CORE FEATURES

## 3.1 Phishing Simulation

### Campaign Types
- **Single Email**: One-time phishing attack
- **Multi-Stage**: APT simulation over days/weeks
- **Spear Phishing**: AI-researched targeted attacks
- **Credential Harvest**: Fake login pages
- **Malware Simulation**: Fake malicious attachments
- **BEC/CEO Fraud**: Executive impersonation
- **QR Phishing**: Malicious QR codes

### Difficulty Levels
```python
BEGINNER = {
    "indicators": ["spelling_errors", "suspicious_sender", "generic_greeting", "mismatched_urls"],
    "description": "Easy to spot - multiple red flags"
}

INTERMEDIATE = {
    "indicators": ["slight_url_mismatch", "similar_sender_domain", "minor_grammar"],
    "description": "Realistic - requires attention"
}

ADVANCED = {
    "indicators": ["perfect_grammar", "legitimate_sender", "contextually_relevant"],
    "description": "Highly convincing - expert level"
}

ADAPTIVE = {
    "description": "AI adjusts difficulty based on user performance history"
}
```

## 3.2 Security Training

### Content Types
- Video courses
- Interactive simulations
- Quizzes with explanations
- Micro-learning (2-5 min)
- Scenario-based training

### Auto-Assignment Logic
```python
TRIGGER_MAPPING = {
    "simulation.link.clicked": ["phishing_basics"],
    "simulation.credentials.submitted": ["phishing_basics", "email_red_flags", "password_security"],
    "simulation.bec.responded": ["bec_awareness", "wire_transfer_validation"],
    "simulation.attachment.opened": ["malware_awareness"],
    "simulation.phishing.reported": None,  # Award XP, no training needed
}
```

## 3.3 Email Detection

### ML Models
```python
DETECTION_MODELS = {
    "phishing_classifier": {
        "type": "binary_classification",
        "features": [
            "url_analysis",           # Domain age, WHOIS, redirects
            "sender_reputation",      # SPF, DKIM, DMARC
            "content_analysis",       # Keywords, urgency, sentiment
            "header_anomalies",       # Reply-to mismatch, spoofing
            "link_mismatch",          # Display vs actual URL
        ],
        "model": "XGBoost / Random Forest / BERT fine-tuned",
        "accuracy_target": "95%+",
    },
    
    "bec_detector": {
        "type": "anomaly_detection",
        "features": [
            "sender_behavior",        # Deviation from normal
            "request_patterns",       # Unusual requests
            "urgency_indicators",     # Time pressure language
            "financial_keywords",     # Wire transfer, invoice
        ],
        "model": "Isolation Forest + LLM verification",
        "accuracy_target": "90%+",
    },
    
    "malware_predictor": {
        "type": "binary_classification",
        "features": [
            "attachment_analysis",    # File type, macros, entropy
            "url_reputation",         # VirusTotal, threat feeds
            "sandbox_results",        # Behavioral analysis
        ],
        "model": "Ensemble (RF + XGB + Neural Net)",
        "accuracy_target": "98%+",
    }
}
```

## 3.4 Sandbox Analysis

### Supported Analysis
- **File Detonation**: Execute in isolated VM
- **URL Crawling**: Visit and analyze web pages
- **Behavior Monitoring**: System calls, network activity
- **IOC Extraction**: IPs, domains, file hashes

### Integration Options
```python
SANDBOX_PROVIDERS = {
    "self_hosted": {
        "name": "Cuckoo Sandbox",
        "pros": ["Full control", "No API costs", "Privacy"],
        "cons": ["Maintenance overhead", "Resource intensive"],
    },
    "cloud": {
        "name": "Any.Run / Joe Sandbox",
        "pros": ["Easy integration", "No maintenance"],
        "cons": ["API costs", "Data leaves premises"],
    },
    "hybrid": {
        "name": "VirusTotal (quick) + Cuckoo (deep)",
        "pros": ["Best of both worlds"],
        "cons": ["Complexity"],
    }
}
```

## 3.5 Analytics & Reporting

### Risk Scoring Algorithm
```python
def calculate_user_risk_score(user_id: UUID) -> float:
    """
    Multi-factor risk assessment
    
    Components (weighted):
    - Click rate (40%): % of phishing simulations clicked
    - Submission rate (25%): % with credential submission
    - Report rate (20%): Phishing reports (inverse - higher is better)
    - Training completion (10%): % of assigned training completed
    - Trend (5%): Improving, stable, or declining
    
    Returns: 0.0 (low risk) to 1.0 (high risk)
    
    Weighting by recency:
    - Last 30 days: 50%
    - 31-90 days: 30%
    - 91-365 days: 20%
    """
    
    # Get user's simulation history
    history = get_simulation_history(user_id, days=365)
    
    # Calculate click rate with recency weighting
    recent_clicks = weighted_average(
        history.clicks,
        weights=recency_weights(history.dates)
    )
    
    # Calculate submission rate
    recent_submissions = weighted_average(
        history.submissions,
        weights=recency_weights(history.dates)
    )
    
    # Calculate report rate (inverse)
    recent_reports = weighted_average(
        history.reports,
        weights=recency_weights(history.dates)
    )
    report_score = 1.0 - recent_reports  # Inverse
    
    # Training completion
    training_score = get_training_completion_rate(user_id)
    
    # Trend analysis
    trend_modifier = calculate_trend(history)
    
    # Final score
    risk_score = (
        recent_clicks * 0.40 +
        recent_submissions * 0.25 +
        report_score * 0.20 +
        (1 - training_score) * 0.10 +
        trend_modifier * 0.05
    )
    
    return min(max(risk_score, 0.0), 1.0)
```

### Report Types
```python
REPORT_TYPES = {
    "campaign_summary": {
        "frequency": "per_campaign",
        "sections": [
            "executive_summary",      # High-level results
            "target_breakdown",       # Who clicked, who reported
            "timeline_analysis",      # When events occurred
            "top_failures",           # Users who need training
            "recommendations",        # Next steps
        ],
        "formats": ["pdf", "xlsx", "html"],
        "audience": "Security team, Management",
    },
    
    "monthly_executive": {
        "frequency": "monthly",
        "sections": [
            "risk_score_trend",       # Organization-wide trend
            "campaign_results",       # All campaigns this month
            "training_completion",    # % completed
            "top_risks",              # High-risk users/departments
            "industry_comparison",    # vs benchmark
            "roi_analysis",           # Value delivered
        ],
        "formats": ["pdf", "pptx"],
        "audience": "C-suite, Board",
    },
    
    "compliance": {
        "frequency": "quarterly",
        "sections": [
            "pdpa_compliance",        # Malaysia data protection
            "iso27001_mapping",       # Security controls
            "training_records",       # Proof of training
            "audit_log",              # All admin actions
        ],
        "formats": ["pdf"],
        "audience": "Compliance, Auditors",
    },
    
    "user_performance": {
        "frequency": "on_demand",
        "sections": [
            "individual_risk_profile",
            "simulation_history",
            "training_progress",
            "improvement_plan",
        ],
        "formats": ["pdf"],
        "audience": "HR, Managers",
    }
}
```

---

# 4. DATABASE SCHEMA

## Core Tables

### Organizations
```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    
    -- Localization
    country_code VARCHAR(2) NOT NULL DEFAULT 'MY',
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kuala_Lumpur',
    primary_language VARCHAR(10) NOT NULL DEFAULT 'en',
    
    -- Configuration
    settings JSONB NOT NULL DEFAULT '{}',
    subscription_tier VARCHAR(20) NOT NULL DEFAULT 'free',
    features JSONB NOT NULL DEFAULT '[]',
    
    -- Limits (based on subscription)
    max_users INTEGER NOT NULL DEFAULT 25,
    max_campaigns_per_month INTEGER NOT NULL DEFAULT 2,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(domain)
);

CREATE INDEX idx_orgs_tier ON organizations(subscription_tier);
CREATE INDEX idx_orgs_active ON organizations(is_active);
```

### Users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Identity
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),  -- NULL if OAuth only
    
    -- Profile
    role VARCHAR(50) NOT NULL DEFAULT 'employee',
    department VARCHAR(100),
    job_title VARCHAR(100),
    location VARCHAR(100),
    manager_id UUID REFERENCES users(id),
    
    -- Gamification
    xp_total INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    streak_days INTEGER NOT NULL DEFAULT 0,
    last_streak_date DATE,
    
    -- Risk
    risk_score FLOAT NOT NULL DEFAULT 0.5,
    risk_trend VARCHAR(20) DEFAULT 'stable',
    last_simulation_at TIMESTAMPTZ,
    
    -- Training
    training_completed JSONB NOT NULL DEFAULT '[]',
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(org_id, email),
    CHECK (risk_score >= 0 AND risk_score <= 1)
);

CREATE INDEX idx_users_org ON users(org_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_risk ON users(risk_score DESC);
CREATE INDEX idx_users_xp ON users(xp_total DESC);
```

## Simulation Tables

### Templates
```sql
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,  -- NULL = system template
    
    -- Localization
    country_code VARCHAR(2) NOT NULL,
    language VARCHAR(10) NOT NULL,
    
    -- Brand impersonation
    brand_category VARCHAR(50) NOT NULL,  -- banking, government, ecommerce, etc.
    brand_name VARCHAR(100) NOT NULL,
    brand_logo_url TEXT,
    brand_colors JSONB,
    
    -- Content
    name VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(500) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    
    -- Classification
    attack_type VARCHAR(50) NOT NULL,  -- credential_harvest, malware, bec, etc.
    difficulty VARCHAR(20) NOT NULL,   -- beginner, intermediate, advanced
    psychological_triggers VARCHAR[] NOT NULL DEFAULT '{}',  -- urgency, authority, fear, greed
    tags VARCHAR[] NOT NULL DEFAULT '{}',
    
    -- Landing page
    landing_page_id UUID REFERENCES landing_pages(id),
    
    -- Seasonal relevance
    seasonal_months INTEGER[],  -- [3,4] for tax season
    seasonal_events VARCHAR[],  -- ["11.11", "raya", "cny"]
    
    -- Statistics
    times_used INTEGER NOT NULL DEFAULT 0,
    avg_click_rate FLOAT,
    avg_submission_rate FLOAT,
    avg_report_rate FLOAT,
    
    -- AI
    ai_generated BOOLEAN NOT NULL DEFAULT false,
    ai_prompt_used TEXT,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_templates_country ON templates(country_code);
CREATE INDEX idx_templates_brand ON templates(brand_category, brand_name);
CREATE INDEX idx_templates_difficulty ON templates(difficulty);
```

### Landing Pages
```sql
CREATE TABLE landing_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    page_type VARCHAR(30) NOT NULL,  -- credential_form, download, awareness, redirect
    html_content TEXT NOT NULL,
    
    -- For credential forms
    capture_fields VARCHAR[] DEFAULT '{}',  -- ["email", "password", "otp"]
    
    -- Redirect URL (for awareness or after submission)
    redirect_url TEXT,
    redirect_delay_seconds INTEGER DEFAULT 0,
    
    -- Training integration
    auto_assign_training BOOLEAN DEFAULT true,
    training_module_ids UUID[],
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Campaigns
```sql
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Basic info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',  -- draft, scheduled, running, paused, completed, cancelled
    
    -- Template
    template_id UUID REFERENCES templates(id),
    
    -- Targeting
    target_type VARCHAR(20) NOT NULL,  -- all, department, custom, role
    target_config JSONB NOT NULL DEFAULT '{}',
    
    -- Scheduling
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    send_window_start TIME,  -- e.g., 09:00
    send_window_end TIME,    -- e.g., 17:00
    send_strategy VARCHAR(20) NOT NULL DEFAULT 'staggered',  -- burst, staggered, random
    timezone VARCHAR(50) NOT NULL,
    
    -- AI settings
    ai_personalization BOOLEAN NOT NULL DEFAULT false,
    difficulty_mode VARCHAR(20) NOT NULL DEFAULT 'fixed',  -- fixed, adaptive
    
    -- Multi-channel
    channels VARCHAR[] NOT NULL DEFAULT '{email}',  -- email, sms, whatsapp, voice
    
    -- Aggregated statistics (denormalized for performance)
    total_targets INTEGER NOT NULL DEFAULT 0,
    
    emails_sent INTEGER NOT NULL DEFAULT 0,
    emails_delivered INTEGER NOT NULL DEFAULT 0,
    emails_bounced INTEGER NOT NULL DEFAULT 0,
    emails_opened INTEGER NOT NULL DEFAULT 0,
    
    links_clicked INTEGER NOT NULL DEFAULT 0,
    credentials_submitted INTEGER NOT NULL DEFAULT 0,
    attachments_downloaded INTEGER NOT NULL DEFAULT 0,
    
    phishing_reported INTEGER NOT NULL DEFAULT 0,
    
    -- Metadata
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_campaigns_org ON campaigns(org_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_scheduled ON campaigns(scheduled_start);
```

### Campaign Targets
```sql
CREATE TABLE campaign_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Tracking
    tracking_id VARCHAR(32) UNIQUE NOT NULL,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending, sent, delivered, bounced, failed
    
    -- Event timestamps
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    bounced_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    reported_at TIMESTAMPTZ,
    
    -- First occurrence tracking
    first_open_at TIMESTAMPTZ,
    first_click_at TIMESTAMPTZ,
    
    -- Counts (for multiple opens/clicks)
    open_count INTEGER NOT NULL DEFAULT 0,
    click_count INTEGER NOT NULL DEFAULT 0,
    
    -- AI personalization
    personalized_subject VARCHAR(500),
    personalized_content JSONB,
    
    -- Error tracking
    error_message TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_targets_campaign ON campaign_targets(campaign_id);
CREATE INDEX idx_targets_user ON campaign_targets(user_id);
CREATE INDEX idx_targets_tracking ON campaign_targets(tracking_id);
CREATE INDEX idx_targets_status ON campaign_targets(status);
```

### Campaign Events (Immutable Log)
```sql
CREATE TABLE campaign_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES campaign_targets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    event_type VARCHAR(30) NOT NULL,  -- sent, delivered, bounced, opened, clicked, submitted, reported
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(20),  -- desktop, mobile, tablet
    browser VARCHAR(50),
    os VARCHAR(50),
    location_city VARCHAR(100),
    location_country VARCHAR(2),
    
    -- Additional metadata
    metadata JSONB NOT NULL DEFAULT '{}',
    
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_campaign ON campaign_events(campaign_id);
CREATE INDEX idx_events_target ON campaign_events(target_id);
CREATE INDEX idx_events_user ON campaign_events(user_id);
CREATE INDEX idx_events_type ON campaign_events(event_type);
CREATE INDEX idx_events_timestamp ON campaign_events(timestamp DESC);

-- Partitioning by month for performance
CREATE TABLE campaign_events_y2025m01 PARTITION OF campaign_events
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

## Training Tables

### Training Modules
```sql
CREATE TABLE training_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    
    -- Content
    content_type VARCHAR(30) NOT NULL,  -- video, interactive, quiz, article, scenario
    content_url TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    
    -- Localization
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    
    -- Auto-assignment triggers
    auto_assign_on_events VARCHAR[] NOT NULL DEFAULT '{}',
    
    -- Prerequisites
    prerequisite_module_ids UUID[],
    
    -- Tags
    tags VARCHAR[] NOT NULL DEFAULT '{}',
    
    -- Statistics
    times_assigned INTEGER NOT NULL DEFAULT 0,
    avg_completion_rate FLOAT,
    avg_score FLOAT,
    avg_time_to_complete_minutes INTEGER,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_training_language ON training_modules(language);
CREATE INDEX idx_training_active ON training_modules(is_active);
```

### Training Assignments
```sql
CREATE TABLE training_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
    
    -- Assignment context
    assigned_reason TEXT,
    assigned_by UUID REFERENCES users(id),
    
    -- Triggering event (if auto-assigned)
    triggered_by_campaign_id UUID REFERENCES campaigns(id),
    triggered_by_event VARCHAR(50),
    
    -- Deadlines
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ,
    
    -- Progress
    status VARCHAR(20) NOT NULL DEFAULT 'assigned',  -- assigned, in_progress, completed, overdue, skipped
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    time_spent_minutes INTEGER DEFAULT 0,
    
    -- Results
    score FLOAT,
    passed BOOLEAN,
    
    -- Feedback
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback TEXT,
    
    UNIQUE(user_id, module_id, assigned_at)
);

CREATE INDEX idx_assignments_user ON training_assignments(user_id);
CREATE INDEX idx_assignments_module ON training_assignments(module_id);
CREATE INDEX idx_assignments_status ON training_assignments(status);
CREATE INDEX idx_assignments_due ON training_assignments(due_date);
```

### Quiz Questions
```sql
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
    
    question_text TEXT NOT NULL,
    question_type VARCHAR(30) NOT NULL,  -- multiple_choice, true_false, multi_select, image_identify
    
    -- Options (for MCQ)
    options JSONB NOT NULL,  -- [{"id": "a", "text": "...", "is_correct": true}, ...]
    
    -- Correct answer
    correct_answer VARCHAR(255),  -- For true/false or single correct
    correct_answers VARCHAR[],     -- For multi-select
    
    -- Explanation
    explanation TEXT NOT NULL,
    
    -- Media
    image_url TEXT,
    
    -- Order
    sort_order INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quiz_module ON quiz_questions(module_id);
```

## Gamification Tables

### Achievements
```sql
CREATE TABLE achievement_definitions (
    key VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(10),  -- Emoji or icon name
    category VARCHAR(30) NOT NULL,  -- reporting, training, streak, special
    xp_reward INTEGER NOT NULL,
    
    -- Unlock criteria
    criteria JSONB NOT NULL,
    
    -- Rarity
    rarity VARCHAR(20) DEFAULT 'common',  -- common, uncommon, rare, epic, legendary
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_key VARCHAR(50) NOT NULL REFERENCES achievement_definitions(key),
    
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Context
    earned_from_campaign_id UUID REFERENCES campaigns(id),
    earned_from_event VARCHAR(50),
    
    UNIQUE(user_id, achievement_key)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_earned ON user_achievements(earned_at DESC);
```

### XP Transactions
```sql
CREATE TABLE xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    amount INTEGER NOT NULL,  -- Can be negative for penalties
    reason VARCHAR(100) NOT NULL,
    
    -- Context
    campaign_id UUID REFERENCES campaigns(id),
    training_id UUID REFERENCES training_assignments(id),
    achievement_key VARCHAR(50) REFERENCES achievement_definitions(key),
    
    -- Balance after transaction
    balance_after INTEGER NOT NULL,
    
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_xp_user ON xp_transactions(user_id);
CREATE INDEX idx_xp_timestamp ON xp_transactions(timestamp DESC);
```

### Leaderboard (Materialized View)
```sql
CREATE MATERIALIZED VIEW leaderboard AS
SELECT 
    u.id as user_id,
    u.org_id,
    u.department,
    u.name,
    u.xp_total,
    u.level,
    u.streak_days,
    
    RANK() OVER (PARTITION BY u.org_id ORDER BY u.xp_total DESC) as org_rank,
    RANK() OVER (PARTITION BY u.org_id, u.department ORDER BY u.xp_total DESC) as dept_rank,
    RANK() OVER (ORDER BY u.xp_total DESC) as global_rank,
    
    COUNT(ua.id) as total_achievements,
    
    NOW() as last_updated
FROM users u
LEFT JOIN user_achievements ua ON ua.user_id = u.id
WHERE u.is_active = true
GROUP BY u.id;

CREATE UNIQUE INDEX idx_leaderboard_user ON leaderboard(user_id);
CREATE INDEX idx_leaderboard_org ON leaderboard(org_id, org_rank);
CREATE INDEX idx_leaderboard_dept ON leaderboard(org_id, department, dept_rank);

-- Refresh periodically
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard;
END;
$$ LANGUAGE plpgsql;
```

## Analytics Tables

### User Risk Profiles
```sql
CREATE TABLE user_risk_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Overall scores (0.0 - 1.0)
    overall_risk_score FLOAT NOT NULL,
    click_susceptibility FLOAT NOT NULL,
    submission_susceptibility FLOAT NOT NULL,
    reporting_score FLOAT NOT NULL,  -- Higher is better
    training_score FLOAT NOT NULL,
    
    -- Historical statistics
    total_simulations_received INTEGER NOT NULL DEFAULT 0,
    total_emails_sent INTEGER NOT NULL DEFAULT 0,
    total_emails_opened INTEGER NOT NULL DEFAULT 0,
    total_links_clicked INTEGER NOT NULL DEFAULT 0,
    total_credentials_submitted INTEGER NOT NULL DEFAULT 0,
    total_phishing_reported INTEGER NOT NULL DEFAULT 0,
    
    -- Rates
    click_rate FLOAT,
    submission_rate FLOAT,
    report_rate FLOAT,
    
    -- Cognitive biases (detected patterns)
    vulnerable_to_authority BOOLEAN DEFAULT false,
    vulnerable_to_urgency BOOLEAN DEFAULT false,
    vulnerable_to_fear BOOLEAN DEFAULT false,
    vulnerable_to_greed BOOLEAN DEFAULT false,
    vulnerable_to_social_proof BOOLEAN DEFAULT false,
    
    -- Trend
    risk_trend VARCHAR(20) DEFAULT 'stable',  -- improving, stable, declining
    trend_direction INTEGER DEFAULT 0,  -- -1, 0, +1
    
    -- Recommendations
    recommended_training UUID[],
    
    -- Timestamps
    last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CHECK (overall_risk_score >= 0 AND overall_risk_score <= 1)
);

CREATE INDEX idx_risk_org ON user_risk_profiles(org_id);
CREATE INDEX idx_risk_score ON user_risk_profiles(overall_risk_score DESC);
CREATE INDEX idx_risk_trend ON user_risk_profiles(risk_trend);
```

### Organization Metrics
```sql
CREATE TABLE org_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    period DATE NOT NULL,  -- First day of month
    
    -- Simulation metrics
    campaigns_run INTEGER NOT NULL DEFAULT 0,
    total_emails_sent INTEGER NOT NULL DEFAULT 0,
    total_clicks INTEGER NOT NULL DEFAULT 0,
    total_submissions INTEGER NOT NULL DEFAULT 0,
    total_reports INTEGER NOT NULL DEFAULT 0,
    
    -- Rates
    overall_click_rate FLOAT,
    overall_submission_rate FLOAT,
    overall_report_rate FLOAT,
    
    -- Training metrics
    training_assignments_created INTEGER NOT NULL DEFAULT 0,
    training_completions INTEGER NOT NULL DEFAULT 0,
    training_completion_rate FLOAT,
    avg_quiz_score FLOAT,
    
    -- Risk
    avg_risk_score FLOAT,
    high_risk_users INTEGER NOT NULL DEFAULT 0,
    medium_risk_users INTEGER NOT NULL DEFAULT 0,
    low_risk_users INTEGER NOT NULL DEFAULT 0,
    
    -- Department breakdown
    department_metrics JSONB,
    
    -- Industry comparison
    industry_benchmark_click_rate FLOAT,
    percentile_rank INTEGER,  -- Where org stands vs industry
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(org_id, period)
);

CREATE INDEX idx_org_metrics_org ON org_metrics(org_id);
CREATE INDEX idx_org_metrics_period ON org_metrics(period DESC);
```

---

# 5. API SPECIFICATION

## Authentication

All API endpoints (except tracking) require authentication via JWT.

### Auth Endpoints
```
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
GET    /api/v1/auth/me
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password

# OAuth
GET    /api/v1/auth/oauth/microsoft
GET    /api/v1/auth/oauth/microsoft/callback
GET    /api/v1/auth/oauth/google
GET    /api/v1/auth/oauth/google/callback
```

### JWT Payload
```python
{
    "sub": "user_id_uuid",
    "org_id": "org_id_uuid",
    "email": "user@example.com",
    "role": "admin" | "manager" | "employee",
    "permissions": ["campaigns:create", "users:read", ...],
    "exp": 1234567890,
    "iat": 1234567890
}
```

## Complete API Routes

```
/api/v1/

# Organizations
GET    /organizations                     # List all orgs (super admin)
POST   /organizations                     # Create organization
GET    /organizations/{org_id}            # Get organization
PUT    /organizations/{org_id}            # Update organization
DELETE /organizations/{org_id}            # Delete organization
GET    /organizations/{org_id}/settings   # Get settings
PUT    /organizations/{org_id}/settings   # Update settings
GET    /organizations/{org_id}/stats      # Organization statistics

# Users
GET    /users                             # List users (paginated, filterable)
POST   /users                             # Create user
POST   /users/bulk                        # Bulk import (CSV)
GET    /users/{user_id}                   # Get user
PUT    /users/{user_id}                   # Update user
DELETE /users/{user_id}                   # Delete user
GET    /users/{user_id}/risk-profile      # Get risk profile
GET    /users/{user_id}/simulation-history # Simulation history
GET    /users/{user_id}/training-history   # Training history
GET    /users/{user_id}/achievements       # User achievements
GET    /users/{user_id}/xp-history         # XP transaction history

# Templates
GET    /templates                         # List templates
POST   /templates                         # Create template
GET    /templates/{id}                    # Get template
PUT    /templates/{id}                    # Update template
DELETE /templates/{id}                    # Delete template
POST   /templates/{id}/clone              # Clone template
GET    /templates/library                 # Browse system templates
GET    /templates/library/{country}       # Filter by country

# Campaigns
GET    /campaigns                         # List campaigns
POST   /campaigns                         # Create campaign
GET    /campaigns/{id}                    # Get campaign details
PUT    /campaigns/{id}                    # Update campaign
DELETE /campaigns/{id}                    # Delete campaign
POST   /campaigns/{id}/launch             # Launch campaign
POST   /campaigns/{id}/pause              # Pause campaign
POST   /campaigns/{id}/resume             # Resume campaign
POST   /campaigns/{id}/cancel             # Cancel campaign
GET    /campaigns/{id}/targets            # List all targets
GET    /campaigns/{id}/targets/{target_id} # Get specific target
GET    /campaigns/{id}/events             # Event stream
GET    /campaigns/{id}/stats              # Real-time statistics
GET    /campaigns/{id}/timeline           # Timeline visualization data
POST   /campaigns/{id}/test               # Send test email

# AI Services
POST   /ai/generate-template              # Generate template from prompt
POST   /ai/personalize-email              # Personalize email for target
POST   /ai/suggest-campaigns              # Get campaign suggestions
POST   /ai/natural-language               # Natural language campaign builder
POST   /ai/analyze-threat                 # Analyze email for threats

# Training
GET    /training/modules                  # List training modules
POST   /training/modules                  # Create module
GET    /training/modules/{id}             # Get module
PUT    /training/modules/{id}             # Update module
DELETE /training/modules/{id}             # Delete module
GET    /training/modules/{id}/questions   # Get quiz questions
POST   /training/modules/{id}/questions   # Add quiz question

GET    /training/assignments              # List assignments
POST   /training/assignments              # Create assignment
GET    /training/assignments/{id}         # Get assignment
PUT    /training/assignments/{id}/start   # Mark as started
PUT    /training/assignments/{id}/complete # Mark as completed
POST   /training/assignments/{id}/submit-quiz # Submit quiz answers

# Analytics
GET    /analytics/dashboard               # Dashboard summary
GET    /analytics/org-metrics             # Organization metrics
GET    /analytics/user-risks              # All user risk scores
GET    /analytics/user-risks/{user_id}    # Specific user risk
GET    /analytics/department-breakdown    # By department
GET    /analytics/campaign-comparison     # Compare campaigns
GET    /analytics/trends                  # Trend analysis
GET    /analytics/psychology              # Cognitive bias analysis

# Reports
POST   /reports/generate                  # Generate report
GET    /reports                           # List generated reports
GET    /reports/{id}                      # Get report
GET    /reports/{id}/download             # Download report file
DELETE /reports/{id}                      # Delete report

# Gamification
GET    /gamification/leaderboard          # Leaderboard
GET    /gamification/leaderboard/department/{dept} # Department leaderboard
GET    /gamification/achievements         # All achievement definitions
GET    /gamification/challenges           # Active challenges
GET    /gamification/user-stats           # Current user stats

# Phishing Reporter
POST   /reporting/report-phishing         # Report phishing email
GET    /reporting/stats                   # Reporting statistics

# Integrations
GET    /integrations                      # List available integrations
POST   /integrations/microsoft/setup      # Setup Microsoft 365
POST   /integrations/google/setup         # Setup Google Workspace
POST   /integrations/slack/setup          # Setup Slack
POST   /integrations/teams/setup          # Setup Teams
GET    /integrations/status               # Integration health status

# Webhooks
GET    /webhooks                          # List webhooks
POST   /webhooks                          # Create webhook
GET    /webhooks/{id}                     # Get webhook
PUT    /webhooks/{id}                     # Update webhook
DELETE /webhooks/{id}                     # Delete webhook
POST   /webhooks/{id}/test                # Test webhook

# Tracking (Public, No Auth)
GET    /t/{tracking_id}/px.gif            # Open tracking pixel
GET    /t/{tracking_id}/click             # Click tracking & redirect
POST   /t/{tracking_id}/submit            # Credential submission
GET    /t/{tracking_id}/info              # Get campaign info (for landing page)
```

## Common Request/Response Patterns

### Pagination
```json
{
  "items": [...],
  "total": 150,
  "page": 1,
  "page_size": 25,
  "pages": 6
}
```

### Filtering
```
GET /api/v1/users?department=Engineering&role=employee&sort=-xp_total&page=1&page_size=50
```

### Error Responses
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid"
    }
  }
}
```

---

# 6. MODULE SPECIFICATIONS

[Content continues in next section due to length...]
