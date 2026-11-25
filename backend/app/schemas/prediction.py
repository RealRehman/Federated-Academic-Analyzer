
from typing import Any, Literal

from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    dataset: Literal["graduate_dropout", "pass_fail"]
    method: Literal["centralized", "fedavg", "fedprox"]
    features: dict[str, Any] = Field(
        ...,
        description="Original student input features"
    )


class PredictionResponse(BaseModel):
    dataset: str
    method: str
    prediction: str
    probabilities: dict[str, float]
