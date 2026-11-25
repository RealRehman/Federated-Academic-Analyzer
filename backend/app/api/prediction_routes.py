
from fastapi import APIRouter

import json
from pathlib import Path
from fastapi import HTTPException

from app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse
)
import pandas as pd
from app.services.prediction_service import generate_prediction


router = APIRouter(
    prefix="/api/predictions",
    tags=["Predictions"]
)

PROJECT_ROOT = Path(__file__).resolve().parents[3]
SCHEMA_DIR = PROJECT_ROOT / "models" / "preprocessors"


@router.get("/{dataset}/schema")
def get_prediction_schema(dataset: str):

    if dataset not in ["graduate_dropout", "pass_fail"]:
        raise HTTPException(
            status_code=404,
            detail="Unsupported dataset"
        )

    schema_path = SCHEMA_DIR / f"{dataset}_schema.json"

    if not schema_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Dataset schema not found"
        )

    with open(schema_path) as file:
        schema = json.load(file)

    return {
        "dataset": dataset,
        "input_features": schema["input_features"],
        "categorical_features": schema["categorical_features"],
        "numerical_features": schema["numerical_features"]
    }

@router.get("/{dataset}/sample")
def get_sample_student(dataset: str):
    """Return a sample student using features from the independent test set."""

    if dataset not in ["graduate_dropout", "pass_fail"]:
        raise HTTPException(
            status_code=404,
            detail="Unsupported dataset"
        )

    test_file = (
        PROJECT_ROOT
        / "simulation"
        / "test"
        / f"{dataset}_test.csv"
    )

    if not test_file.exists():
        raise HTTPException(
            status_code=404,
            detail="Test dataset not found"
        )

    try:
        df = pd.read_csv(test_file)

        with open(SCHEMA_DIR / f"{dataset}_schema.json") as file:
            schema = json.load(file)

        expected_features = schema["input_features"]

        missing = [
            field for field in expected_features
            if field not in df.columns
        ]

        if missing:
            raise HTTPException(
                status_code=500,
                detail=f"Test dataset is missing features: {missing}"
            )

        # Select only model input features.
        # Target columns are deliberately excluded.
        sample = df.iloc[0][expected_features].to_dict()

        # Convert NumPy values into JSON-compatible Python values.
        features = {
            key: (
                None if pd.isna(value)
                else value.item() if hasattr(value, "item")
                else value
            )
            for key, value in sample.items()
        }

        return {
            "dataset": dataset,
            "sample": True,
            "features": features
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not load sample student: {str(exc)}"
        )

@router.post("/", response_model=PredictionResponse)
def predict_student(request: PredictionRequest):

    result = generate_prediction(
        dataset=request.dataset,
        method=request.method,
        features=request.features
    )

    return result
