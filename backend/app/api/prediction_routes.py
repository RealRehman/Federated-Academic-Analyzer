
from fastapi import APIRouter

from app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse
)

from app.services.prediction_service import generate_prediction


router = APIRouter(
    prefix="/api/predictions",
    tags=["Predictions"]
)


@router.post("/", response_model=PredictionResponse)
def predict_student(request: PredictionRequest):

    result = generate_prediction(
        dataset=request.dataset,
        method=request.method,
        features=request.features
    )

    return result
