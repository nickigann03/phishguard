# PhishGuard: Email Security Platform
## Architecture Design Document v1.0

PhishGuard is a modular, AI-enhanced email security platform comprising of 
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
