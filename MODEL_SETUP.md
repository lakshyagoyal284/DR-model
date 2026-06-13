# DR Detection — Model Training & Export Setup

This document explains the two deep learning models powering the DR Detection system: the **DR Classifier** (5-class grading) and the **DR Segmenter** (lesion segmentation), including how to train, export, and deploy them.

---

## Model Overview

| Model | Task | Input Size | Output | Weight File |
|-------|------|-----------|--------|------------|
| **DR Classifier** | Diabetic retinopathy grading (5 classes) | 224×224×3 | Grade (0–4), confidence, per-class scores | `saved_models/dr_classifier.h5` |
| **DR Segmenter** | Lesion segmentation (U-Net) | 384×384×3 | Binary lesion mask + overlay (base64 PNG) | `saved_models/dr_segmenter.h5` |

### DR Grades

| Grade | Class Name |
|-------|-----------|
| 0 | No DR |
| 1 | Mild |
| 2 | Moderate |
| 3 | Severe |
| 4 | Proliferative |

---

## 1. Training the Models

Two Jupyter notebooks are included for training. Both are designed to run on [Kaggle](https://kaggle.com) with GPU (NVIDIA Tesla T4).

### Notebook 1 — IDRiD Classifier + Segmenter (v5)

**File:** `notebook564044cd83 (1).ipynb`

- **Dataset:** Indian Diabetic Retinopathy Image Dataset (IDRiD)
- **Task:** 5-class DR grading + lesion segmentation on the same dataset
- **Architecture:** Custom CNN classifier + U-Net segmenter
- **Limitations:** IDRiD has only ~413 grading images and 81 segmentation images — results are modest (val acc ~0.66)
- **Key fixes (v5):** Eliminated stale-cache pipeline bugs, single `load_fundus` function for all splits, segmentation diagnostics included

**Run instructions:**
1. Go to [Kaggle](https://kaggle.com) and create a new notebook
2. Add the dataset: `aaryapatel98/indian-diabetic-retinopathy-image-dataset`
3. Enable GPU (Settings → Accelerator → NVIDIA T4)
4. Copy the notebook contents in
5. Run `Restart & Run All` (do NOT re-run cells individually to avoid cache bugs)

### Notebook 2 — APTOS 2019 Classifier (Publishable Pipeline)

**File:** `notebook564044cd83 (3).ipynb`

- **Dataset:** APTOS 2019 Blindness Detection (3,662 images)
- **Task:** 5-class DR grading
- **Architectures:** EfficientNetB0, MobileNetV2, Lightweight-MobileNetV2
- **Metric:** Quadratic Weighted Kappa (QWK) — expected ~0.88–0.91
- **Novelty:** 
  - Circle-crop + CLAHE preprocessing
  - Lightweight backbone comparison (sub-1M-param model)
  - Cross-domain validation (train on APTOS, test on IDRiD without retraining)

**Run instructions:**
1. Go to [Kaggle](https://kaggle.com) and create a new notebook
2. Add the dataset: `mariaherrerot/aptos2019`
3. Optionally also add: `aaryapatel98/indian-diabetic-retinopathy-image-dataset` (for cross-domain validation)
4. Enable GPU
5. Copy the notebook contents in
6. Run all cells

---

## 2. Exporting the Trained Model

After training, the notebook will save the model weights as `.h5` files. The exact save commands are at the end of each training notebook.

### Default Export Commands

For the **classifier** (from the APTOS notebook):
```python
model.save(f"{OUT}/dr_classifier.h5")
print(f"Model saved to {OUT}/dr_classifier.h5")
```

For the **segmenter** (from the IDRiD notebook):
```python
segmenter_model.save(f"{OUT}/dr_segmenter.h5")
print(f"Segmenter saved to {OUT}/dr_segmenter.h5")
```

On Kaggle, `OUT` is `/kaggle/working/`. Download the `.h5` files from the Kaggle notebook output.

---

## 3. Deploying the Models

### File Placement

Place the exported `.h5` files in the `backend/saved_models/` directory:

```
backend/
├── saved_models/
│   ├── dr_classifier.h5      # ← Place classifier weights here
│   └── dr_segmenter.h5       # ← Place segmenter weights here
├── app/
│   ├── models/
│   │   ├── classifier.py     # Loads dr_classifier.h5
│   │   └── segmenter.py      # Loads dr_segmenter.h5
│   └── config.py             # Model paths configured here
```

### Configuration

Model paths are configured in `backend/app/config.py` via environment variables:

```python
# Default values (can be overridden via .env):
CLASSIFIER_MODEL_PATH = os.getenv("CLASSIFIER_MODEL_PATH", "saved_models/dr_classifier.h5")
SEGMENTER_MODEL_PATH = os.getenv("SEGMENTER_MODEL_PATH", "saved_models/dr_segmenter.h5")
```

To use custom paths, add to your `.env` file:
```env
CLASSIFIER_MODEL_PATH=saved_models/dr_classifier.h5
SEGMENTER_MODEL_PATH=saved_models/dr_segmenter.h5
```

---

## 4. Model Architecture Details

### DR Classifier

The classifier expects:
- **Input shape:** `(224, 224, 3)` — RGB image, float32, values 0–255
- **Preprocessing:** Circle crop → resize to 224×224 → optional CLAHE contrast enhancement
- **Output:** Shape `(5,)` — softmax probabilities for each DR grade
- **Prediction logic** (`classifier.py`):
  1. Image is divided by 255.0 before feeding to the model
  2. Model output is the index of the highest probability (`argmax`)
  3. Confidence is the probability value at that index

### DR Segmenter

The segmenter expects:
- **Input shape:** `(384, 384, 3)` — RGB image, float32, values 0–255
- **Preprocessing:** Circle crop → resize to 384×384 → optional CLAHE
- **Output:** Shape `(H, W, 1)` — binary mask (values > 0.5 become lesion pixels)
- **Postprocessing:** 
  - Mask resized back to original image dimensions
  - Encoded as base64 PNG
  - Overlay created by tinting lesion pixels red on the original image

---

## 5. Mock Mode (Development Without Models)

If `.h5` model files are not found, the system falls back to **mock predictions** so you can develop and test without a trained model:

### Mock Classifier
- Uses weighted random selection (biased toward "No DR" and "Moderate" — the most common in practice)
- Generates realistic-looking confidence scores using Dirichlet distribution
- You get full response data without needing TensorFlow or GPU

### Mock Segmenter
- Generates random elliptical blobs to simulate lesion masks
- Produces valid base64-encoded PNG masks and overlays
- Useful for testing the frontend UI without a trained segmenter

The mock mode logs a warning on startup:
```
[classifier] Model not found at saved_models/dr_classifier.h5 — using MOCK predictions
[segmenter] Model not found at saved_models/dr_segmenter.h5 — using MOCK segmentation
```

---

## 6. Preprocessing Pipeline

Both models share the same preprocessing function in `backend/app/services/preprocessor.py`:

```python
def preprocess_fundus(image_bytes: bytes, size: int | None = None) -> np.ndarray:
```

**Steps:**
1. Decode raw image bytes → OpenCV BGR format
2. Convert BGR → RGB
3. **Circle crop** — crops to the circular retina region (removes black borders)
4. **Resize** — to the target size (224 for classifier, 384 for segmenter)
5. **CLAHE** — optional contrast-limited adaptive histogram equalization on the L channel of LAB color space (enabled by default via `USE_CLAHE=True` in settings)

**Important:** The preprocessing during inference must match the preprocessing used during training. Both notebooks use the same `load_fundus()` function with circle-crop + CLAHE, ensuring consistency.

---

## 7. Dependencies

For training (in notebooks):
- TensorFlow 2.19+
- NumPy, Pandas, OpenCV
- scikit-learn
- Matplotlib

For inference (in backend):
```txt
tensorflow==2.19.0
numpy==1.26.4
opencv-python-headless==4.10.0.84
```

---

## 8. Quick Start — Getting Models Running

```bash
# 1. Train or download the .h5 model files (see Section 1 & 2)

# 2. Create the saved_models directory
mkdir -p backend/saved_models

# 3. Copy the model files
cp /path/to/dr_classifier.h5 backend/saved_models/
cp /path/to/dr_segmenter.h5  backend/saved_models/

# 4. Verify the backend loads them (check for mock warnings)
cd backend
python -c "from app.models.classifier import DRClassifier; c = DRClassifier(); c.load(); print('Classifier OK')"
python -c "from app.models.segmenter import DRSegmenter; s = DRSegmenter(); s.load(); print('Segmenter OK')"

# 5. Start the backend — models will be loaded on first prediction
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
