# DR Detection App — Implementation Plan

## Project Overview

Build a **web application** where doctors can upload retinal (fundus) images and get:

1. **DR Grade** (No DR / Mild / Moderate / Severe / Proliferative) with confidence scores
2. **Lesion segmentation masks** overlaid on the image (microaneurysms, haemorrhages, hard/soft exudates)
3. **Patient history** tracking

**Already done:** ML models trained in Kaggle notebooks (need to export `.h5` files)
**To build:** Backend API + Frontend UI + Database

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| **Backend** | Python + FastAPI |
| **Frontend** | React + TypeScript + Tailwind CSS |
| **Database** | PostgreSQL |
| **Model Serving** | TensorFlow Keras |
| **Containerization** | Docker + Docker Compose |

---

## User Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        USER FLOW                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐    ┌──────────────┐    ┌──────────────────┐    │
│  │ Doctor  │───▶│ Upload       │───▶│ Backend          │    │
│  │ opens   │    │ fundus image │    │ Preprocess       │    │
│  │ web app │    │ (drag & drop)│    │ (circle-crop,    │    │
│  └─────────┘    └──────────────┘    │ CLAHE, resize)   │    │
│                                      └───────┬──────────┘    │
│                                              │               │
│                  ┌───────────────────────────┘               │
│                  ▼                                           │
│         ┌────────────────┐                                   │
│         │ Classification │────▶ DR Grade + Confidence Scores │
│         │ Model          │                                   │
│         └───────┬────────┘                                   │
│                 │                                            │
│         ┌───────▼────────┐                                   │
│         │ Segmentation   │────▶ Lesion Mask (base64 image)  │
│         │ Model (U-Net)  │                                   │
│         └───────┬────────┘                                   │
│                 │                                            │
│                 ▼                                            │
│         ┌──────────────────────────────────────────────┐    │
│         │          Frontend Displays:                   │    │
│         │  • DR Grade (color-coded)                     │    │
│         │  • Confidence bar chart                       │    │
│         │  • Lesion overlay on image                    │    │
│         │  • Option to save to patient record           │    │
│         └──────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## What to Build (Simplified)

### Backend (FastAPI)

| Component | What It Does |
|-----------|-------------|
| `preprocessor.py` | circle-crop → CLAHE → resize to 224×224 |
| `classifier.py` | Loads `.h5` model → predicts DR grade 0–4 |
| `segmenter.py` | Loads U-Net → generates lesion mask |
| `predict.py` (router) | `POST /predict` → returns grade + mask |
| `database.py` | Stores patient records & prediction history |

**API Endpoints:**
- `POST /predict` — Upload image → get grade + confidence + segmentation mask
- `GET /history` — View past predictions
- `POST /auth/login` — Doctor login

### Frontend (React)

| Page | What It Shows |
|------|---------------|
| **Predict Page** | Drag & drop upload → grade result + confidence chart + segmentation overlay |
| **Dashboard** | Summary stats (total scans, grade distribution) |
| **History** | Table of past predictions with search/filter |

### Key Frontend Components
1. **ImageUpload** — Drag & drop zone with preview
2. **ResultCard** — DR grade name + color + severity bar
3. **ConfidenceChart** — Bar chart of all 5 class probabilities
4. **SegmentationOverlay** — Original image with lesion mask on top

---

## First Steps

1. **Export models** — Save trained models from notebooks as `.h5` files
2. **Create backend** — FastAPI with preprocessing + model loading
3. **Build frontend** — React with upload → display results
4. **Connect** — Wire frontend to backend API
5. **Deploy** — Docker Compose for local or cloud deployment
