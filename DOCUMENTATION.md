# DR Detection System — Full Documentation

> **An AI-powered platform for automated Diabetic Retinopathy (DR) screening, lesion segmentation, and clinical reporting.**
>
> Built with FastAPI (Python) backend + React (TypeScript) frontend + TensorFlow ML models.

---

## Table of Contents

1. [What We Built](#1-what-we-built)
2. [System Architecture](#2-system-architecture)
3. [DR Models — Full Description](#3-dr-models--full-description)
4. [Model Export (Requires Kaggle Access)](#4-model-export-requires-kaggle-access)
5. [Backend — File-by-File Explanation](#5-backend--file-by-file-explanation)
6. [Frontend — File-by-File Explanation](#6-frontend--file-by-file-explanation)
7. [Infrastructure Files](#7-infrastructure-files)
8. [Data Flow — End-to-End](#8-data-flow--end-to-end)
9. [Environment Variables](#9-environment-variables)

---

## 1. What We Built

### The Problem

Diabetic Retinopathy (DR) is a leading cause of blindness in working-age adults. Manual grading of retinal (fundus) images requires trained ophthalmologists and is time-consuming. This system automates the process using deep learning.

### The Solution

A full-stack web application that:

| Feature | Description |
|---------|-------------|
| **AI DR Grading** | Upload a fundus image → receives a DR grade (0–4) with per-class confidence scores |
| **Lesion Segmentation** | AI identifies and highlights retinal lesions (microaneurysms, hemorrhages, exudates) |
| **Interactive Comparison** | Drag-to-slide overlay comparing original vs. segmentation |
| **Clinical Reports** | Printable PDF reports with clinical findings and recommendations |
| **Dashboard** | Screening statistics and grade distribution analytics |
| **History** | Searchable, paginated history of all screening results |
| **Landing Page** | Welcome page with feature cards and CTAs |
| **Toast Notifications** | Success/error feedback on actions |
| **Page Transitions** | Smooth animated transitions between routes |
| **Loading Skeletons** | Page-specific loading placeholders |
| **Confetti Celebration** | Visual celebration on successful analysis |
| **Animated Counters** | Smooth counting animation for dashboard stats |

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER (Browser)                               │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Landing  │  │  Predict  │  │Dashboard │  │ History  │          │
│  │   Page   │  │   Page    │  │  Page    │  │  Page    │          │
│  └──────────┘  └─────┬─────┘  └──────────┘  └────┬─────┘          │
│                      │                            │                 │
│                 ┌────▼────┐                 ┌─────▼─────┐          │
│                 │ Upload  │                 │  Reports  │          │
│                 │  Image  │                 │   Page    │          │
│                 └────┬────┘                 └─────┬─────┘          │
│                      │                            │                 │
│                 ┌────▼────────────────────────────▼─────┐           │
│                 │        React Router + App Shell        │           │
│                 │  (Sidebar, AnimatedBackground, Toast)  │           │
│                 └──────────────────┬─────────────────────┘           │
│                                    │ HTTP /api/*                      │
└────────────────────────────────────┼─────────────────────────────────┘
                                     │
┌────────────────────────────────────┼─────────────────────────────────┐
│                           NGINX / Vite Proxy                        │
│                           (dev: Vite, prod: Nginx)                  │
└────────────────────────────────────┼─────────────────────────────────┘
                                     │
┌────────────────────────────────────┼─────────────────────────────────┐
│                          FastAPI Backend                            │
│                                                                            │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                  │
│  │ /api/predict  │  │ /api/history  │  │ /api/auth     │                  │
│  │    Router     │  │    Router     │  │    Router     │                  │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘                  │
│          │                  │                   │                          │
│          ▼                  ▼                   ▼                          │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                  │
│  │ Preprocessor  │  │ SQLAlchemy    │  │ JWT Auth      │                  │
│  │ (circle-crop, │  │ + PostgreSQL  │  │ (stub)        │                  │
│  │  CLAHE)       │  │               │  │               │                  │
│  └───────┬───────┘  └───────────────┘  └───────────────┘                  │
│          │                                                                │
│          ▼                                                                │
│  ┌───────────────┐  ┌───────────────┐                                    │
│  │  DRClassifier │  │  DRSegmenter  │                                    │
│  │  (.h5 model)  │  │  (.h5 model)  │                                    │
│  └───────┬───────┘  └───────┬───────┘                                    │
│          │                  │                                             │
│          ▼                  ▼                                             │
│  ┌───────────────┐  ┌───────────────┐                                    │
│  │ TensorFlow    │  │ TensorFlow    │                                    │
│  │ Keras Model   │  │ U-Net Model   │                                    │
│  └───────┬───────┘  └───────┬───────┘                                    │
│          │                  │                                             │
│          ▼                  ▼                                             │
│  ┌─────────────────────────────────────────┐                              │
│  │   Mock Mode (when .h5 files missing)    │                              │
│  │   • Random weighted predictions         │                              │
│  │   • Simulated lesion masks              │                              │
│  └─────────────────────────────────────────┘                              │
└──────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | React 19 + TypeScript | UI components and routing |
| **Build Tool** | Vite 6 | Fast dev server and bundling |
| **Styling** | Tailwind CSS 3.4 | Utility-first CSS framework |
| **Animation** | framer-motion 12 | Page transitions, skeleton shimmer, confetti |
| **Icons** | lucide-react | Icon library |
| **Charts** | recharts 2 | Confidence bar chart |
| **Backend Framework** | FastAPI 0.115 (Python) | REST API server |
| **ML Framework** | TensorFlow 2.19 | Model loading and inference |
| **Image Processing** | OpenCV | Circle-crop, CLAHE, resize |
| **ORM** | SQLAlchemy 2.0 | Database ORM (stub) |
| **Database** | PostgreSQL 16 | Data persistence |
| **Containerization** | Docker + Docker Compose | Multi-service deployment |
| **Reverse Proxy** | Nginx | Frontend serving + API proxy in production |

---

## 3. DR Models — Full Description

### 3.1 DR Classifier (Grading Model)

**Purpose:** Classifies a fundus image into one of 5 DR severity grades.

**Input:**
- RGB image, resized to 224×224 pixels
- Values: float32 in range [0, 255] (before normalization)
- Preprocessing: circle-crop → CLAHE → resize

**Architecture (trained in notebooks):**
- Option A: EfficientNetB0 (transfer learning)
- Option B: MobileNetV2 (lightweight)
- Option C: Custom CNN

**Output:**
- Shape: `(5,)` — softmax probabilities
- Index 0 = No DR, 1 = Mild, 2 = Moderate, 3 = Severe, 4 = Proliferative

**Inference Flow (`classifier.py`):**
1. Lazy-load `.h5` model from disk (singleton pattern)
2. If `.h5` not found → falls back to mock predictions
3. Normalize image: divide by 255.0, add batch dimension
4. Run `model.predict(batch)` → get `(5,)` softmax vector
5. Argmax for grade, corresponding value for confidence
6. Return dict: `{grade, class_name, confidence, scores: {...}}`

**Mock Mode (Development):**
- Weighted random selection (35% No DR, 10% Mild, 30% Moderate, 15% Severe, 10% Proliferative)
- Realistic Dirichlet-distributed confidence scores
- No TensorFlow required — works without GPU or model files

### 3.2 DR Segmenter (Lesion Segmentation Model)

**Purpose:** Generates a binary lesion mask highlighting areas of retinal damage.

**Input:**
- RGB image, resized to 384×384 pixels
- Values: float32 in range [0, 255] (before normalization)
- Preprocessing: circle-crop → CLAHE → resize

**Architecture:**
- U-Net (trained on IDRiD dataset)
- Encoder-decoder with skip connections

**Output:**
- Binary mask: pixels > 0.5 threshold = lesion (255), else background (0)
- Resized back to original image dimensions

**Inference Flow (`segmenter.py`):**
1. Lazy-load `.h5` model from disk (singleton pattern)
2. If `.h5` not found → generates simulated mock mask
3. Resize image to 384×384, normalize, add batch dimension
4. Run `model.predict(batch)` → get raw mask output
5. Threshold at 0.5 → binary mask
6. Resize mask back to original image dimensions
7. Encode mask as base64 PNG
8. Create red-tinted overlay: `overlay[R] = 255 where mask > 0`
9. Return: `{mask: base64, overlay: base64, width, height}`

**Mock Mode (Development):**
- Draws 1–4 random elliptical blobs to simulate lesions
- Valid base64 PNG output for frontend testing
- No TensorFlow required

### 3.3 Preprocessing Pipeline

All preprocessing is handled by `preprocessor.py`:

```python
image_bytes → decode → BGR→RGB → circle_crop → resize → CLAHE → float32
```

**Step Details:**

| Step | Function | Description |
|------|----------|-------------|
| 1. Decode | `cv2.imdecode()` | Raw image bytes → OpenCV array (BGR) |
| 2. Color Convert | `cv2.COLOR_BGR2RGB` | BGR → RGB for consistency |
| 3. Circle Crop | `circle_crop()` | Removes black borders by finding the circular retina region via grayscale threshold |
| 4. Resize | `cv2.resize()` | To 224×224 (classifier) or 384×384 (segmenter) using `INTER_AREA` interpolation |
| 5. CLAHE | `clahe_rgb()` | Contrast-Limited Adaptive Histogram Equalization on L channel of LAB — enhances local contrast without over-amplifying noise |
| 6. Type Cast | `.astype(np.float32)` | Final array values in [0, 255] |

### 3.4 Grade Classification Schema

| Grade | Class Name | Severity | Clinical Significance |
|-------|-----------|----------|---------------------|
| 0 | No DR | None | Healthy retina — no referral needed |
| 1 | Mild | Mild NPDR | Microaneurysms only — annual monitoring |
| 2 | Moderate | Moderate NPDR | More microaneurysms, hemorrhages, exudates — 6-month follow-up |
| 3 | Severe | Severe NPDR | Widespread hemorrhages, venous beading — urgent referral |
| 4 | Proliferative | PDR | Abnormal new vessels — emergent treatment needed |

---

## 4. Model Export (Requires Kaggle Access)

### ⚠️ This section describes work that CANNOT be done in this environment.
It requires **Kaggle** (with GPU) or a machine with a compatible NVIDIA GPU and TensorFlow installed.

### 4.1 What Needs to Be Done

Two TensorFlow `.h5` model files need to be trained and exported:

| File | Source | Dataset |
|------|--------|---------|
| `backend/saved_models/dr_classifier.h5` | Notebook 2 (recommended) or Notebook 1 | APTOS 2019 (3,662 images) or IDRiD |
| `backend/saved_models/dr_segmenter.h5` | Notebook 1 | IDRiD (81 images) |

### 4.2 Training Notebooks

**Notebook 1 — IDRiD Classifier + Segmenter**
- **File:** `notebook564044cd83 (1).ipynb`
- **Dataset:** `aaryapatel98/indian-diabetic-retinopathy-image-dataset`
- **Task:** 5-class DR grading + lesion segmentation
- **Limitation:** IDRiD has only 413 grading images — results are modest (val ~0.66)

**Notebook 2 — APTOS 2019 Classifier (PUBLISHABLE)**
- **File:** `notebook564044cd83 (3).ipynb`
- **Dataset:** `mariaherrerot/aptos2019`
- **Task:** 5-class DR grading
- **Architectures:** EfficientNetB0, MobileNetV2, Lightweight-MobileNetV2
- **Expected QWK:** ~0.88–0.91
- **Novelty:** circle-crop + CLAHE, lightweight models, cross-domain validation

### 4.3 Export Steps

```python
# At the end of each notebook, run:
model.save(f"{OUT}/dr_classifier.h5")   # or dr_segmenter.h5
print(f"Model saved to {OUT}/dr_classifier.h5")
```

Then download the `.h5` files from Kaggle working directory and place in:

```
backend/
└── saved_models/
    ├── dr_classifier.h5      # ← Place here
    └── dr_segmenter.h5       # ← Place here
```

### 4.4 Requirements for Training

- Kaggle account (free) or local NVIDIA GPU
- TensorFlow 2.19+
- ~15–20 min per model on Kaggle T4 GPU
- Internet connection to download datasets

---

## 5. Backend — File-by-File Explanation

### `backend/app/main.py`
**FastAPI application entry point.** Creates the app instance, configures CORS middleware, and registers all routers. Exposes Swagger docs at `/docs` and ReDoc at `/redoc`. Health check endpoint at `/health`.

### `backend/app/config.py`
**Central configuration.** Reads environment variables (with sensible defaults) for database URL, model paths, image sizes, auth settings, and CORS origins. Uses `python-dotenv` to load `.env` file.

### `backend/app/routers/predict.py`
**Prediction API.** Contains:
- `POST /api/predict/` — Accepts multipart form upload (image file + optional patient_id + notes). Runs preprocessing → classification → segmentation. Returns grade, confidence, scores, mask, overlay, and original image as base64. Stores in `PredictionRecord` (in-memory store).
- `GET /api/predict/{id}` — Retrieves a specific prediction by ID.
- `PredictionRecord` — Simple in-memory class-based storage (to be replaced with database).

### `backend/app/routers/auth.py`
**Authentication stub.** Simple login endpoint with hardcoded credentials (`doctor / password`). Returns a dummy JWT token. Placeholder for proper auth implementation.

### `backend/app/routers/history.py`
**History API.** `GET /api/history/` with pagination support (page + per_page params). Returns total count and paginated prediction records from `PredictionRecord`.

### `backend/app/models/classifier.py`
**DR Classifier wrapper.** Singleton class (`DRClassifier`) that:
- Lazy-loads the `.h5` model from disk
- Falls back to mock predictions if model not found
- Preprocesses input (normalize, batch dimension)
- Runs inference and formats output
- Mock mode uses weighted random selection with Dirichlet confidence distribution

### `backend/app/models/segmenter.py`
**DR Segmenter wrapper.** Singleton class (`DRSegmenter`) that:
- Lazy-loads the U-Net `.h5` model
- Falls back to simulated lesion masks (random ellipses)
- Runs inference, thresholds, resizes back, encodes to base64 PNG
- Creates red-tinted overlay image

### `backend/app/services/preprocessor.py`
**Image preprocessing service.** Functions:
- `preprocess_fundus()` — Main pipeline: decode → color convert → circle crop → resize → optional CLAHE
- `circle_crop()` — Crops to retina region using grayscale threshold mask
- `clahe_rgb()` — CLAHE on L channel of LAB color space

### `backend/app/services/database.py`
**Database service (stub).** SQLAlchemy engine and session factory configured for PostgreSQL. `Base` class for ORM models. `get_db()` dependency for FastAPI. Ready for model definitions to be added.

### `backend/requirements.txt`
**Python dependencies.** FastAPI, uvicorn, TensorFlow, numpy, OpenCV, SQLAlchemy, psycopg2, etc.

### `backend/Dockerfile`
**Backend Docker image.** Python 3.10-slim base. Installs pip dependencies, copies app code, exposes port 8000, runs uvicorn.

---

## 6. Frontend — File-by-File Explanation

### `frontend/src/App.tsx`
**Root application component.** Contains:
- `Sidebar` — Navigation sidebar with brand, nav items (Home, Predict, Dashboard, History), and status footer. Responsive: overlay on mobile, fixed on desktop.
- `PageTransition` — framer-motion wrapper for route exit/enter animations.
- `MobileTopBar` — Mobile-only header with hamburger menu and brand.
- `AnimatedBackground` — 4 floating gradient orbs with continuous animation.
- `AppLayout` — Combines sidebar + background + routes with `AnimatePresence`.
- Routes: `/` (Landing), `/predict`, `/dashboard`, `/history`, `/report/:id`.

### `frontend/src/main.tsx`
**React entry point.** Renders `<App />` inside `StrictMode`.

### `frontend/src/index.css`
**Global styles.** Tailwind directives, custom scrollbar, print styles, and utility classes (dot-pattern, grid-pattern, gradient text, glow effects).

### `frontend/tailwind.config.js`
**Tailwind configuration.** Custom animations (fade-in, slide-up, gradient-shift, float-slow, pulse-soft), box shadows (soft, glow), DR grade colors, and Inter font family.

### `frontend/vite.config.ts`
**Vite configuration.** React plugin, dev server on port 5173, proxy `/api` to backend at `localhost:8000`.

### `frontend/index.html`
**HTML entry point.** Google Fonts (Inter), meta tags, and root div.

### `frontend/src/pages/Landing.tsx`
**Welcome page at `/`.** Animated hero section with CTA buttons, stats bar (5 DR Grades, 98% Accuracy, <3s Analysis, PDF Reports), and 3 feature cards navigating to Predict, Dashboard, History.

### `frontend/src/pages/PredictPage.tsx`
**Main prediction page.** Features:
- Animated hero section with floating medical icons (gradient background, grid overlay)
- Drag-and-drop image upload via `ImageUpload` component
- Image preview with "Analyze" button
- Results display: `ResultCard`, `ConfidenceChart`, `SegmentationOverlay`
- Confetti celebration on success, toast notifications
- Full report link, new analysis button

### `frontend/src/pages/Dashboard.tsx`
**Analytics dashboard.** Fetches prediction history, displays:
- 3 animated stat cards (total scans, normal count, severe cases with percentage)
- Grade distribution with horizontal progress bars and legend
- Loading skeleton state, empty state

### `frontend/src/pages/History.tsx`
**Prediction history.** Fetches paginated history, displays:
- Search bar (filters by grade, patient ID, or prediction ID)
- Table with columns: #, Grade (color-coded badge), Confidence (bar), Patient ID, Notes, Report button
- Pagination with intelligent page number display
- Empty state with CTA to Predict page

### `frontend/src/pages/ReportPage.tsx`
**Clinical report page.** Route: `/report/:id`. Fetches single prediction by ID, displays:
- Print/PDF toolbar and back button
- Report header with date, patient ID, report number
- Before/after image comparison (original vs. lesion segmentation)
- Diagnosis summary (Grade, Confidence, Assessment)
- Per-class confidence chart
- Clinical findings with severity-appropriate recommendations
- Clinician notes section
- Image zoom modal

### `frontend/src/components/ImageUpload.tsx`
**Drag-and-drop upload zone.** Accepts image files (JPG/PNG) up to 20 MB. Drag-over state with visual feedback. Error messages for invalid files. Loading state.

### `frontend/src/components/ResultCard.tsx`
**DR grade result card.** Color-coded by grade (green/yellow/orange/red/purple). Shows grade name, confidence percentage bar, and severity assessment text.

### `frontend/src/components/ConfidenceChart.tsx`
**Per-class confidence bar chart.** Uses recharts `BarChart`. Custom tooltip with grade name and percentage. Color-coded bars with the highest confidence highlighted at full opacity.

### `frontend/src/components/SegmentationOverlay.tsx`
**Interactive before/after slider.** Drag the slider handle left/right to compare original fundus image with lesion segmentation overlay. Labels for "Original" and "Segmentation". Fallback state when no overlay is available.

### `frontend/src/components/Toast.tsx`
**Toast notification system.** Context-based (`ToastProvider` + `useToast()`). Supports 4 types (success, error, info, warning) with distinct colors and icons. Auto-dismiss with configurable duration. framer-motion enter/exit animations. Timer cleanup on unmount.

### `frontend/src/components/Skeleton.tsx`
**Loading skeleton system.** Reusable base component with shimmer animation. Composed shapes: Line, Heading, Avatar, Card, Bar, TableRow. Page-specific skeletons: `Skeleton.Dashboard`, `Skeleton.History`, `Skeleton.Report`.

### `frontend/src/components/AnimatedCounter.tsx`
**Animated number counter.** Uses `requestAnimationFrame` with ease-out cubic easing. Configurable duration, decimals, and suffix. Re-animates when target value changes.

### `frontend/src/components/Confetti.tsx`
**Confetti celebration.** 60 particles with random colors, shapes (circle, square, star SVG), sizes, and animation paths. framer-motion `AnimatePresence` for enter/exit. Auto-hides after configurable duration.

### `frontend/src/api/client.ts`
**API client.** Functions: `uploadImage()` (multipart form), `fetchHistory()` (paginated), `fetchPrediction()` (by ID), `healthCheck()`. All routes prefixed with `/api`.

### `frontend/src/types/index.ts`
**TypeScript type definitions.** `PredictionResult` (id, grade, class_name, confidence, scores, mask, overlay, image_data, patient_id, notes, created_at) and `HistoryResponse`.

---

## 7. Infrastructure Files

### `docker-compose.yml`
**Multi-service orchestration.** Defines 3 services:
- `backend` — FastAPI on port 8000 with PostgreSQL dependency
- `frontend` — Nginx-served React build on port 80
- `db` — PostgreSQL 16 with persistent volume

### `nginx/default.conf`
**Nginx configuration.** Serves frontend static files, handles SPA routing (`try_files $uri /index.html`), proxies `/api/` requests to backend.

### `.env.example`
**Environment template.** Documents all required environment variables: `DATABASE_URL`, `CLASSIFIER_MODEL_PATH`, `SEGMENTER_MODEL_PATH`, `SECRET_KEY`, `CORS_ORIGINS`.

### `frontend/Dockerfile`
**Frontend Docker image.** Multi-stage build: Node 20 for building, Nginx Alpine for serving.

### `backend/Dockerfile`
**Backend Docker image.** Python 3.10-slim with pip dependencies.

---

## 8. Data Flow — End-to-End

```
1. User opens app → Landing page at /
2. User clicks "Start Screening" → Navigates to /predict
3. User drags fundus image onto upload zone
   │
   ├── Frontend: FileReader reads image → displays preview
   │
4. User clicks "Analyze Image"
   │
   ├── Frontend: FormData POST to /api/predict/
   │         └── file, patient_id (optional), notes (optional)
   │
   ├── Backend: FastAPI receives upload
   │   ├── Validates file type (must be image)
   │   ├── Reads raw bytes, encodes as base64 for storage
   │   ├── Preprocess for classifier: preprocess_fundus(raw, size=224)
   │   │   └── decode → circle-crop → resize → CLAHE → float32
   │   ├── Classifier: model.predict(image/255.0) → grade + confidence + scores
   │   ├── Preprocess for segmenter: preprocess_fundus(raw, size=384)
   │   ├── Segmenter: model.predict(image/255.0) → binary mask
   │   │   └── threshold → resize back → encode PNG base64
   │   └── Returns JSON: {id, grade, class_name, confidence, scores, mask, overlay, ...}
   │
   └── Frontend receives response
       ├── Success toast notification
       ├── Confetti celebration
       ├── ResultCard: shows grade with color-coded badge
       ├── ConfidenceChart: bar chart of all 5 class scores
       ├── SegmentationOverlay: slider to compare original vs. lesion mask
       └── Buttons: "View Full Report" → /report/{id} or "New analysis"

5. (Optional) User views Dashboard → /dashboard
   ├── Fetches GET /api/history/?page=1&per_page=100
   └── Displays stat cards + grade distribution

6. (Optional) User views History → /history
   ├── Fetches GET /api/history/
   └── Displays paginated table with search

7. (Optional) User views Report → /report/{id}
   ├── Fetches GET /api/predict/{id}
   └── Displays full clinical report with print/PDF support
```

---

## 9. Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://dr_user:dr_pass@localhost:5432/dr_detection` | PostgreSQL connection string |
| `CLASSIFIER_MODEL_PATH` | `saved_models/dr_classifier.h5` | Path to classifier `.h5` file |
| `SEGMENTER_MODEL_PATH` | `saved_models/dr_segmenter.h5` | Path to segmenter `.h5` file |
| `SECRET_KEY` | `change-me-in-production` | JWT signing secret |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Allowed CORS origins |
| `CLS_IMG_SIZE` | 224 | Classifier input size (pixels) |
| `SEG_IMG_SIZE` | 384 | Segmenter input size (pixels) |
| `USE_CLAHE` | True | Enable CLAHE preprocessing |
