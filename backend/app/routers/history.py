from fastapi import APIRouter, Query

from app.routers.predict import PredictionRecord

router = APIRouter()


@router.get("/")
async def get_history(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=1000),
):
    """Return paginated prediction history."""
    all_records = PredictionRecord.list_all()
    start = (page - 1) * per_page
    end = start + per_page
    page_records = all_records[start:end]

    return {
        "total": len(all_records),
        "page": page,
        "per_page": per_page,
        "predictions": page_records,
    }
