
import json
from pathlib import Path

from fastapi import APIRouter, HTTPException


router = APIRouter(
    prefix="/api/experiments",
    tags=["Experiments"]
)

PROJECT_ROOT = Path(__file__).resolve().parents[3]

EVALUATION_DIR = PROJECT_ROOT / "models" / "evaluation"
FEDERATED_DIR = PROJECT_ROOT / "models" / "federated"

DATASETS = ["graduate_dropout", "pass_fail"]
METHODS = ["fedavg", "fedprox"]


def load_json(path):
    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Result file not found: {path.name}"
        )

    try:
        with open(path) as file:
            return json.load(file)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail=f"Invalid JSON file: {path.name}"
        )


@router.get("/")
def list_experiments():
    return {
        "available_datasets": DATASETS,
        "available_methods": [
            "local_baseline",
            "centralized",
            "fedavg",
            "fedprox"
        ]
    }


@router.get("/{dataset_name}")
def get_experiment_results(dataset_name: str):

    if dataset_name not in DATASETS:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found"
        )

    path = EVALUATION_DIR / "experiment_comparison.json"

    all_results = load_json(path)

    dataset_results = [
        result for result in all_results
        if result["dataset"] == dataset_name
    ]

    return {
        "dataset": dataset_name,
        "results": dataset_results
    }


@router.get("/{dataset_name}/history")
def get_training_history(dataset_name: str):

    if dataset_name not in DATASETS:
        raise HTTPException(
            status_code=404,
            detail="Dataset not found"
        )

    histories = {}

    for method in METHODS:

        path = (
            FEDERATED_DIR
            / method
            / dataset_name
            / "training_history.json"
        )

        histories[method] = load_json(path)

    return {
        "dataset": dataset_name,
        "histories": histories
    }
