import base64

from datetime import datetime, timezone

from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from app.services.preprocessor import preprocess_fundus
from app.models.classifier import DRClassifier, CLASS_NAMES
from app.models.segmenter import DRSegmenter

router = APIRouter()
classifier = DRClassifier()
segmenter = DRSegmenter()


class PredictionRecord:
    """Minimal in-memory record until DB models are set up."""
    __id_counter = 0
    _store: list[dict] = []

    @classmethod
    def create(cls, data: dict) -> dict:
        cls.__id_counter += 1
        record = {"id": cls.__id_counter, **data}
        cls._store.append(record)
        return record

    @classmethod
    def list_all(cls) -> list[dict]:
        return list(cls._store)

    @classmethod
    def get_by_id(cls, pred_id: int) -> dict | None:
        for record in cls._store:
            if record["id"] == pred_id:
                return record
        return None


@router.post("/")
async def predict(
    file: UploadFile = File(...),
    patient_id: str = Form(None),
    notes: str = Form(None),
):
    """
    Upload a fundus image → preprocess → classify (DR grade) → segment (lesions).
    Returns grade, confidence, scores, and lesion mask.
    Stores the original image as base64 so reports persist.
    """
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, detail="File must be an image")

    raw = await file.read()
    if len(raw) == 0:
        raise HTTPException(400, detail="Empty file")

    # Encode original image as base64 for storage
    image_b64 = base64.b64encode(raw).decode("utf-8")

    # Preprocess for classifier (224×224)
    cls_img = preprocess_fundus(raw, size=224)

    # Run classification
    cls_result = classifier.predict(cls_img)

    # Preprocess for segmenter (384×384)
    seg_img = preprocess_fundus(raw, size=384)

    # Run segmentation
    try:
        seg_result = segmenter.predict(seg_img)
    except Exception:
        seg_result = {"mask": None, "overlay": None, "width": 0, "height": 0}

    # Build response with original image stored for report
    result = {
        "grade": cls_result["grade"],
        "class_name": cls_result["class_name"],
        "confidence": cls_result["confidence"],
        "scores": cls_result["scores"],
        "mask": seg_result.get("mask"),
        "overlay": seg_result.get("overlay"),
        "image_data": image_b64,
        "patient_id": patient_id,
        "notes": notes,
    }

    # Persist (in-memory for now; swap to DB later)
    # Store created_at timestamp
    result["created_at"] = datetime.now(timezone.utc).isoformat()

    record = PredictionRecord.create(result)
    return record


@router.get("/{pred_id}")
async def get_prediction(pred_id: int):
    """Return a single prediction record by ID, including the original image."""
    record = PredictionRecord.get_by_id(pred_id)
    if record is None:
        raise HTTPException(404, detail="Prediction not found")
    return record
