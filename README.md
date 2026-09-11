# SOLVESPHERE

> **Tagline**: *"From societal problems to measurable solutions."*  
> **Smart India Hackathon (SIH) Prototype** • **Problem Statement 26043**

---

## 🚀 Overview

**SolveSphere** is a complete, working, demo-ready web application designed for Smart India Hackathon (SIH) Problem Statement 26043. It is **not** a static UI mockup. SolveSphere turns real-world societal problems reported by citizens into validated, collaborative, and deployable multi-stakeholder projects.

The platform bridges four critical sectors:
1. **CITIZENS**: Report challenges with evidence, track resolution progress, upvote issues, and submit post-pilot feedback.
2. **GOVERNMENT**: AI-assisted verification queue, duplicate complaint resolution, pilot project approval, and closed-loop impact monitoring.
3. **UNIVERSITIES**: SBERT AI matching of verified challenges to faculty expertise, research domains, and student engineering teams.
4. **INDUSTRY / STARTUPS / CSR**: Publish CSR support grants (hardware sensors, funding, mentorship, cloud telemetry) and join active pilot projects.

---

## ⚡ The Ecosystem Workflow

```
Citizen Submits Problem
        ↓
AI Analysis (SBERT Classifier + Priority Score + Vector Duplicate Detection)
        ↓
Government Official Validation (Verify / Reject / Merge)
        ↓
University Faculty & Student Team Matching (e.g. ABC University 94% Match)
        ↓
Industry & CSR Collaboration (SmartCity Technologies 87% Match)
        ↓
Multi-Stakeholder Project Workspace (Milestone Tracking)
        ↓
Field Prototype & Pilot Testing
        ↓
Closed-Loop Impact Measurement (Before / After Metrics)
        ↓
Citizen Feedback & Municipal Monitoring
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Glassmorphism, custom civic color system)
- **Icons**: Lucide React
- **Geospatial Map**: Interactive Leaflet GIS challenge map

### Backend
- **Framework**: Python FastAPI
- **Data Validation & Schemas**: Pydantic v2
- **Database ORM**: SQLAlchemy 2.0
- **Security & Auth**: JWT Tokens, Passlib (Bcrypt hashing), Role-Based Access Control (RBAC)

### AI / ML Engine
- **Sentence Embeddings**: `sentence-transformers` (SBERT `all-MiniLM-L6-v2` 384-d embeddings)
- **Cosine Similarity**: Semantic duplicate detection (>80% similarity flagged as `POTENTIAL_DUPLICATE`)
- **Explainable Priority Engine**: $0.4 \times Impact + 0.3 \times Urgency + 0.3 \times EvidenceQuality$ (Normalized 0–100)
- **Domain Classifier**: Multi-domain categorization across 12 civic sectors
- **Fallback Engine**: Fast TF-IDF heuristic vectorizer if PyTorch / SBERT models are offline

### Database & Caching
- **Database**: PostgreSQL with `pgvector` extension (with automatic SQLite fallback for zero-dependency local dev)
- **Cache**: Redis

### DevOps & Packaging
- **Containers**: Docker & Docker Compose (`docker-compose.yml`)

---

## 🔑 One-Click Demo Mode

For SIH presentation, SolveSphere provides **One-Click Persona Logins** directly on `/login` and via the persistent top **SIH DEMO MODE** banner:

| Role Persona | Email | Full Name & Persona |
| :--- | :--- | :--- |
| **CITIZEN** | `citizen@solvesphere.gov.in` | Ramesh Kumar (Citizen) |
| **GOVERNMENT** | `gov@solvesphere.gov.in` | Anita Verma (Municipal Commissioner) |
| **UNIVERSITY** | `university@solvesphere.gov.in` | Dr. Rajesh Sharma (Faculty Advisor) |
| **INDUSTRY** | `industry@solvesphere.gov.in` | Vikram Mehta (CSR Lead, SmartCity Tech) |

> **Password for all demo accounts**: `demo1234`

---

## 📁 Project Structure

```
solvesphere/
├── backend/
│   ├── app/
│   │   ├── api/          # REST API Routers (Auth, Challenges, Universities, Industry, Projects, Impact, Feedback, Notifications, Audit)
│   │   ├── ai/           # SBERT Classifier, Priority Scoring, Vector Embeddings, Matching Engine
│   │   ├── auth/         # JWT Token Handler & RBAC RoleChecker Middleware
│   │   ├── core/         # Config & Database Engine
│   │   ├── models/       # SQLAlchemy ORM Models & Pydantic Schemas
│   │   ├── seed/         # Demo Data Seeder (20 challenges featuring SS-1042)
│   │   └── main.py       # FastAPI Application Entrypoint
│   ├── tests/            # Pytest suite for Auth, Challenges, and RBAC
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── app/              # Next.js 15 App Router Pages (Landing, Citizen, Gov, Uni, Industry, Projects)
│   ├── components/       # UI Components (Navbar, Footer, EcosystemFlow, InteractiveMap, DemoBanner)
│   ├── lib/              # API Client & Auth Helpers
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 📦 Local Setup Instructions

### 1. Backend Setup (FastAPI & Python)

```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python app/main.py
```
> The backend automatically creates SQLite tables and seeds full SIH demonstration data on startup! The server runs at `http://localhost:8000`. API Documentation is available at `http://localhost:8000/docs`.

### 2. Frontend Setup (Next.js & React)

```bash
cd frontend
npm install
npm run dev
```
> The frontend web app runs at `http://localhost:3000`.

### 3. Docker Compose Setup (Optional Full Container Stack)

```bash
docker-compose up --build
```
> Starts PostgreSQL with `pgvector`, Redis, FastAPI Backend, and Next.js Frontend simultaneously.

---

## 🧪 Testing

Run backend pytest test suite:

```bash
cd backend
pytest tests/ -v
```

Tests cover:
- JWT Authentication & Demo Login
- Challenge AI Analysis & Priority Calculation
- Government Verification Workflow
- RBAC Enforcement (Citizens cannot verify challenges; Government officers can; University/Industry can accept/join projects)

---

## 🎯 Main Demo Scenario (SS-1042)

To demonstrate the full working chain during an SIH presentation:
1. **Login as Citizen**: View challenge `SS-1042` (*Urban Waterlogging Near ABC School*).
2. **Submit New Problem**: Fill out the report form; watch SBERT AI analyze domain (*Environment / Urban Drainage*), score priority (*HIGH - 85.5*), and flag semantic duplicate `SS-9821`.
3. **Switch to Government Persona**: Open `/government/challenges`; review AI insights and click **VERIFY**.
4. **Switch to University Persona**: Open `/university/matches`; see *ABC University (94% Match)* and click **ACCEPT PROJECT**.
5. **Switch to Industry Persona**: Open `/industry/opportunities`; see *SmartCity Technologies (87% Match)* and click **JOIN PROJECT**.
6. **Project Workspace (`SS-P-1042`)**: Advance milestones (*Prototype* → *Pilot* → *Deployment*).
7. **Impact Dashboard (`/government/impact`)**: View empirical before/after metrics (76% flood reduction, 500 → 120 incidents/month, ₹3.8 Lakhs saved) labeled as **Demo Data**.
8. **Citizen Feedback**: Submit citizen post-pilot rating and confirmation.
