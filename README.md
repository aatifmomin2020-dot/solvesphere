# SolveSphere 🌐

**Tagline:** "From societal problems to measurable solutions."

SolveSphere is an end-to-end, AI-assisted platform created for **Smart India Hackathon (SIH 26043)** that converts citizen-observed societal problems into verified, expertise-matched, collaborative, trackable, and measurable innovation projects.

---

## 🏛️ Ecosystem Workflow

```
CITIZEN → AI ANALYSIS → GOVERNMENT VALIDATION → UNIVERSITY MATCHING
        → INDUSTRY COLLABORATION → PROJECT → PROTOTYPE → PILOT
        → DEPLOYMENT → IMPACT → CITIZEN FEEDBACK
```

---

## 🛠️ Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, Leaflet
- **Backend:** Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic
- **Database:** PostgreSQL + `pgvector` (with SQLite fallback for zero-dependency local dev)
- **Background Processing:** Redis + Worker queue
- **AI Engine:** `sentence-transformers` for local semantic duplicate detection, structured rule-based priority engine, deterministic fallbacks
- **Security:** JWT Auth with Refresh Tokens, RBAC, Object-level authorization, Rate limiting, Secure Headers, File Upload validation & hashing, Audit Logs

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/api/v1/health/live

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Web Application: http://localhost:5173

---

## 🐳 Docker Deployment
```bash
docker-compose up -d --build
```
- Frontend: http://localhost
- Backend API: http://localhost:8000
