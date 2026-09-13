# SolveSphere 🌐

**Tagline:** "From societal problems to measurable solutions."

SolveSphere is an end-to-end, AI-assisted platform built for **Smart India Hackathon (SIH 26043)** that converts citizen-observed societal problems into verified, expertise-matched, collaborative, trackable, and measurable innovation projects.

---

## 🏛️ Ecosystem Workflow

```
CITIZEN → AI ANALYSIS → GOVERNMENT VALIDATION → UNIVERSITY MATCHING
        → INDUSTRY COLLABORATION → PROJECT → PROTOTYPE → PILOT
        → DEPLOYMENT → IMPACT → CITIZEN FEEDBACK
```

---

## 🛠️ Technology Stack & Architecture

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, Leaflet Map integration.
- **Backend:** Python 3.12, FastAPI, Pydantic v2, Async SQLAlchemy 2.0, Alembic migrations.
- **Database & Vector Search:** PostgreSQL + `pgvector` with 384-dimensional `Vector(384)` embedding columns and SQL cosine similarity search (`ORDER BY embedding <=> :query_vector`).
- **AI & Embedding Engine:** `SentenceTransformer("all-MiniLM-L6-v2")` generating 384-D normalized vector embeddings for challenge semantic duplicate detection, priority scoring, domain categorization, and university/industry matching. Includes process-independent deterministic fallback routines.
- **AI Observability & Benchmarks:** Dynamic multiclass evaluation via `sklearn.metrics` (`accuracy_score`, `precision_recall_fscore_support`), prompt injection defense (`<UNTRUSTED_CHALLENGE_TEXT>` delimiters), and `/api/v1/health/ai` diagnostic endpoints.
- **Security & Authorization:**
  - JWT Authentication with single-use hashed Refresh Token Rotation (`RefreshToken` DB model) and Token Family Reuse Detection Revocation.
  - Strict Object-Level Ownership Authorization on milestones (`PUT /api/v1/projects/{id}/milestones/{id}`), private media downloads (`GET /api/v1/media/download/{id}`), and citizen feedback submission (`POST /api/v1/challenges/{id}/feedback`).
  - Strict file safety transparency: file magic byte verification and SHA-256 checksum hashing with explicit `scan_status = "NOT_SCANNED"`.
  - Rate limiting via `slowapi` returning `HTTP 429` on threshold exhaustion.
  - Full state transition audit logging (`AuditLog` records).

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
- **API Docs:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/api/v1/health/live
- **AI Diagnostics:** http://localhost:8000/api/v1/health/ai

### 2. Running Test Suite
```bash
cd backend
pytest tests/ -v
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run build
npm run dev
```
- **Web Application:** http://localhost:5173

---

## 🐳 Docker Deployment
```bash
docker-compose up -d --build
```
- **Frontend:** http://localhost
- **Backend API:** http://localhost:8000

---

## 🧪 Verification & Security Compliance

- **End-to-End Vector Embeddings:** Generated using `sentence-transformers` (`all-MiniLM-L6-v2`).
- **Database Integration:** Real `pgvector` SQLAlchemy mappings (`Vector(384)`) with Alembic migration script `001_add_pgvector.py`.
- **IDOR Protection:** Verified private media download restrictions and submitter-only challenge feedback checks.
- **Token Security:** Hashed single-use refresh token rotation with family revocation on reuse.
