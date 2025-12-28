# PhishGuard API - Backend Setup

## 1. Overview
The backend is built with **FastAPI** (Python), using **PostgreSQL** for data and **Redis** for caching. It runs fully containerized via **Docker**.

## 2. Core Modules
| Module | Description | Status |
| ... | ... | ... |
| **Auth** | User registration, Login, JWT Tokens (Argon2 hashing) | ✅ Complete |
| **Simulation** | Campaigns, Targets, Email Simulation | ✅ Complete |
| **Templates** | Phishing templates with localization support (MY/SG) | ✅ Complete |
| **Tracking** | Click tracking pixel/link + Educational Landing Page | ✅ Complete |
| **Analytics** | Dashboard aggregation (Open/Click rates) | ✅ Complete |

## 3. Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.11+ (optional, for local dev)

### Running the Server
```bash
cd api
# Create .env file (copy from .env.example)
cp .env.example .env

# Start Services (DB, Redis, API)
docker-compose up -d --build

# Access API Documentation
http://localhost:8000/api/docs
```

### AI Configuration (Recommended)
We use **Groq** (Free Tier) for ultra-fast template generation with Llama 3.

1. Get a key at [console.groq.com/keys](https://console.groq.com/keys)
2. Update `.env`:
```env
AI_PROVIDER=groq
AI_API_KEY=gsk_your_key_here
```
*(Gemini is also supported by setting AI_PROVIDER=gemini)*

### Key Endpoints
- **POST** `/api/v1/auth/register` - Create new admin account
- **POST** `/api/v1/auth/login` - Get Access Token
- **POST** `/api/v1/campaigns` - Create phishing campaign
- **POST** `/api/v1/campaigns/{id}/launch` - Send emails (Simulated in logs)
- **GET** `/api/v1/analytics/dashboard` - View stats

## 4. Development Notes
- **Email Sending**: Currently uses `LoggerEmailProvider` which prints to Docker logs. To use real email, implement an SMTP or MS Graph provider in `app/core/services/email/`.
- **Database**: Async SQLAlchemy with Alembic for migrations.
    - New migration: `docker-compose exec api alembic revision --autogenerate -m "msg"`
    - Apply: `docker-compose exec api alembic upgrade head`

## 5. Next Steps (Roadmap)
1. **AI Integration**: Implement `GeminiService` to generate templates automatically.
2. **Frontend**: Build React Dashboard.
3. **Real Email**: Connect SMTP/SendGrid/MS Graph.
