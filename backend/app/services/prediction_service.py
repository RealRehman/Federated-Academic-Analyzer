
import json
from pathlib import Path

import joblib
import pandas as pd

from fastapi import HTTPException

from app.ml.models.federated_logistic import (
    predict as federated_predict,
    predict_probabilities
)


PROJECT_ROOT = Path(__file__).resolve().parents[3]
MODEL_DIR = PROJECT_ROOT / "models"

DATASET_LABELS = {
    "graduate_dropout": {
        0: "Dropout",
        1: "Graduate"
    },
    "pass_fail": {
        0: "Fail",
        1: "Pass"
    }
}


def load_artifacts(dataset, method):
    """Load the saved preprocessor, schema and selected model."""

    preprocessor_path = (
        MODEL_DIR / "preprocessors"
        / f"{dataset}_preprocessor.joblib"
    )

    schema_path = (
        MODEL_DIR / "preprocessors"
        / f"{dataset}_schema.json"
    )

    if method == "centralized":
        model_path = (
            MODEL_DIR / "centralized"
            / dataset / "centralized_model.joblib"
        )
    else:
        model_path = (
            MODEL_DIR / "federated"
            / method / dataset / "global_model.joblib"
        )

    for path in [preprocessor_path, schema_path, model_path]:
        if not path.exists():
            raise HTTPException(
                status_code=500,
                detail=f"Required model artifact not found: {path.name}"
            )

    try:
        preprocessor = joblib.load(preprocessor_path)
        model = joblib.load(model_path)

        with open(schema_path) as file:
            schema = json.load(file)

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not load prediction artifacts: {str(exc)}"
        )

    return preprocessor, schema, model


def validate_features(features, schema):
    """Validate and arrange incoming features in training order."""

    expected = schema["input_features"]

    missing = [field for field in expected if field not in features]
    extra = [field for field in features if field not in expected]

    if missing or extra:
        raise HTTPException(
            status_code=422,
            detail={
                "missing_features": missing,
                "unexpected_features": extra
            }
        )

    ordered_features = {
        field: features[field] for field in expected
    }

    df = pd.DataFrame([ordered_features])

    for column in schema["numerical_features"]:
        if df[column].notna().any():
            try:
                df[column] = pd.to_numeric(
                    df[column], errors="raise"
                )
            except (ValueError, TypeError):
                raise HTTPException(
                    status_code=422,
                    detail=f"Feature '{column}' must be numerical"
                )

    return df


def generate_prediction(dataset, method, features):
    """Preprocess student data and generate a model prediction."""

    if dataset not in DATASET_LABELS:
        raise HTTPException(
            status_code=404,
            detail="Unsupported dataset"
        )

    if method not in ["centralized", "fedavg", "fedprox"]:
        raise HTTPException(
            status_code=404,
            detail="Unsupported prediction method"
        )

    preprocessor, schema, model = load_artifacts(dataset, method)

    df = validate_features(features, schema)

    try:
        X = preprocessor.transform(df)

        if method == "centralized":
            predicted_class = model.predict(X)[0]
            raw_probabilities = model.predict_proba(X)[0]

            probabilities = {
                DATASET_LABELS[dataset][int(label)]: float(probability)
                for label, probability in zip(
                    model.classes_, raw_probabilities
                )
            }

            prediction = DATASET_LABELS[dataset][int(predicted_class)]

        else:
            raw_probabilities = predict_probabilities(X, model)
            predicted_class = int(
                federated_predict(X, model)[0]
            )

            probabilities = {
                label: float(
                    raw_probabilities[0]
                    if class_id == 1
                    else 1 - raw_probabilities[0]
                )
                for class_id, label in DATASET_LABELS[dataset].items()
            }

            prediction = DATASET_LABELS[dataset][predicted_class]

        return {
            "dataset": dataset,
            "method": method,
            "prediction": prediction,
            "probabilities": probabilities
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(exc)}"
        )
