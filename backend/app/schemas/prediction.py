from datetime import datetime

from pydantic import BaseModel


class PredictionRequest(BaseModel):
    """Metadata sent alongside (or after) the image upload."""
    patient_id: str | None = None
    notes: str | None = None


class PredictionResponse(BaseModel):
    id: int
    grade: int
    class_name: str
    confidence: float
    scores: dict[str, float]
    mask: str | None = None       # base64 PNG
    overlay: str | None = None    # base64 PNG
    image_data: str | None = None  # base64-encoded original image
    patient_id: str | None = None
    notes: str | None = None
    created_at: str | None = None

    model_config = {"from_attributes": True}


class PredictionHistoryResponse(BaseModel):
    total: int
    predictions: list[PredictionResponse]
