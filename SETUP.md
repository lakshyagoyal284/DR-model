# DR Detection System — Setup Guide

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| [Node.js](https://nodejs.org/) | ≥ 18 | Run the frontend |
| [Python](https://www.python.org/) | ≥ 3.10 | Run the backend |
| [PostgreSQL](https://www.postgresql.org/) | ≥ 14 | Database |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Latest | *(Optional)* Run everything in containers |

---

## Quick Start (Docker — Recommended)

The easiest way to run everything at once.

```bash
# 1. Clone the project and cd into it
cd path/to/project

# 2. Copy the environment template
cp .env.example .env

# 3. Start all services
docker compose up --build
```

This starts:
- **Frontend** → http://localhost:3000
- **Backend API** → http://localhost:8000
- **API Docs** → http://localhost:8000/docs
- **PostgreSQL** → localhost:5432

### Stop services

```bash
docker compose down
```

To also delete the database data:
```bash
docker compose down -v
```

---

## Manual Setup (Development)

### 1. Environment Variables

Copy the template and edit if needed:

```bash
cp .env.example .env
```

Default `.env` values:

```env
DATABASE_URL=postgresql://dr_user:dr_pass@localhost:5432/dr_detection
CLASSIFIER_MODEL_PATH=saved_models/dr_classifier.h5
SEGMENTER_MODEL_PATH=saved_models/dr_segmenter.h5
SECRET_KEY=change-me-to-a-random-secret
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 2. Start the Database

```bash
docker run -d \
  --name dr-postgres \
  -e POSTGRES_USER=dr_user \
  -e POSTGRES_PASSWORD=dr_pass \
  -e POSTGRES_DB=dr_detection \
  -p 5432:5432 \
  postgres:16-alpine
```

> **Or** if you have PostgreSQL installed natively, create a database named `dr_detection` and update `DATABASE_URL` in `.env`.

### 3. Start the Backend

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate it
# Windows (Command Prompt):
venv\Scripts\activate
# Windows (PowerShell):
venv\Scripts\Activate.ps1
# macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Place your model files
# Copy dr_classifier.h5 → backend/saved_models/dr_classifier.h5
# Copy dr_segmenter.h5  → backend/saved_models/dr_segmenter.h5

# Start the server (with auto-reload)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend is now running at **http://localhost:8000**.

- API docs (Swagger UI): http://localhost:8000/docs
- Alternative docs (ReDoc): http://localhost:8000/redoc
- Health check: http://localhost:8000/api/health

### 4. Start the Frontend

Open a **new terminal** (keep the backend running):

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend is now running at **http://localhost:5173**.

> The dev server proxies `/api` requests to the backend at `http://localhost:8000` (configured in `vite.config.ts`).

---

## Project Structure

```
.
├── backend/                  # FastAPI Python backend
│   ├── app/
│   │   ├── main.py           # App entry point
│   │   ├── config.py         # Settings & environment
│   │   ├── routers/          # API route handlers
│   │   ├── models/           # DR classifier + segmenter
│   │   ├── schemas/          # Pydantic request/response models
│   │   └── services/         # Preprocessor, database
│   ├── saved_models/         # Place .h5 model files here
│   └── requirements.txt
│
├── frontend/                 # React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── pages/            # Landing, Predict, Dashboard, History, Report
│   │   ├── components/       # Reusable UI components
│   │   ├── api/client.ts     # API client
│   │   └── types/index.ts    # TypeScript type definitions
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml        # Orchestrates all services
├── nginx/                    # Nginx config for frontend Docker
├── .env.example              # Environment variable template
└── SETUP.md                  # This file
```

## Available Frontend Commands

```bash
npm run dev      # Start dev server (port 5173)
npm run build    # Type-check + production build → dist/
npm run preview  # Preview the production build locally
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/predict/` | Upload image → AI analysis |
| GET | `/api/predict/{id}` | Get prediction by ID |
| GET | `/api/history/` | List all predictions (paginated) |

---

## Troubleshooting

### "Module not found" errors (backend)
Make sure you activated the virtual environment and installed requirements:
```bash
cd backend
venv\Scripts\activate    # Windows
pip install -r requirements.txt
```

### "TensorFlow not found" or model loading fails
Ensure your `.h5` model files are placed in `backend/saved_models/`.

### Port already in use
```bash
# Check what's using the port
# Windows:
netstat -ano | findstr :8000
# macOS / Linux:
lsof -i :8000
```

### Frontend can't reach the backend
- Confirm the backend is running on port 8000
- The Vite dev server proxies `/api/*` to `http://localhost:8000` (see `vite.config.ts`)
- For Docker, the Nginx config proxies to `http://backend:8000`
