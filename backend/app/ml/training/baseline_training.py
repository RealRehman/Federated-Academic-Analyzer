
from pathlib import Path
import json

import joblib
import pandas as pd

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix
)

from app.ml.models.logistic_model import (
    create_logistic_regression_model
)


PROJECT_ROOT = Path(__file__).resolve().parents[4]

DEPARTMENTS = [
    "department_01",
    "department_02",
    "department_03"
]

DATASETS = {
    "graduate_dropout": {
        "target": "Target"
    },
    "pass_fail": {
        "target": "PassFail"
    }
}


def train_local_baselines(dataset_name, config):

    target = config["target"]

    print("\n" + "=" * 65)
    print(f"LOCAL BASELINE TRAINING: {dataset_name}")
    print("=" * 65)

    artifact_dir = PROJECT_ROOT / "models" / "preprocessors"

    # Load shared preprocessing artifacts
    preprocessor = joblib.load(
        artifact_dir / f"{dataset_name}_preprocessor.joblib"
    )

    with open(
        artifact_dir / f"{dataset_name}_schema.json"
    ) as file:
        schema = json.load(file)

    # Load independent test data
    test_path = (
        PROJECT_ROOT
        / "simulation"
        / "test"
        / f"{dataset_name}_test.csv"
    )

    test_df = pd.read_csv(test_path)

    X_test = test_df[schema["input_features"]]
    y_test = test_df[target]

    # Transform test data using the already fitted preprocessor
    X_test_processed = preprocessor.transform(X_test)

    results = []

    for department in DEPARTMENTS:

        print(f"\nTraining {department}...")

        local_path = (
            PROJECT_ROOT
            / "simulation"
            / "departments"
            / department
            / "data"
            / f"{dataset_name}.csv"
        )

        local_df = pd.read_csv(local_path)

        X_train = local_df[schema["input_features"]]
        y_train = local_df[target]

        # Transform local training data
        X_train_processed = preprocessor.transform(X_train)

        # Create and train independent local model
        model = create_logistic_regression_model()

        model.fit(X_train_processed, y_train)

        # Evaluate on the same independent test dataset
        predictions = model.predict(X_test_processed)

        accuracy = accuracy_score(y_test, predictions)
        precision = precision_score(
            y_test, predictions,
            average="macro",
            zero_division=0
        )
        recall = recall_score(
            y_test, predictions,
            average="macro",
            zero_division=0
        )
        f1 = f1_score(
            y_test, predictions,
            average="macro",
            zero_division=0
        )

        labels = model.classes_

        matrix = confusion_matrix(
            y_test,
            predictions,
            labels=labels
        )

        # Save trained model
        output_dir = (
            PROJECT_ROOT
            / "models"
            / "local_baselines"
            / dataset_name
        )

        output_dir.mkdir(parents=True, exist_ok=True)

        model_path = output_dir / f"{department}.joblib"

        joblib.dump(model, model_path)

        result = {
            "department": department,
            "training_records": len(X_train),
            "test_records": len(X_test),
            "accuracy": round(float(accuracy), 4),
            "macro_precision": round(float(precision), 4),
            "macro_recall": round(float(recall), 4),
            "macro_f1": round(float(f1), 4),
            "confusion_matrix": matrix.tolist(),
            "classes": [str(label) for label in labels],
            "model_path": str(model_path)
        }

        results.append(result)

        print(f"Training records: {len(X_train)}")
        print(f"Accuracy: {accuracy:.4f}")
        print(f"Macro Precision: {precision:.4f}")
        print(f"Macro Recall: {recall:.4f}")
        print(f"Macro F1: {f1:.4f}")
        print("Confusion Matrix:")
        print(matrix)

    # Save baseline evaluation results
    results_dir = PROJECT_ROOT / "models" / "evaluation"
    results_dir.mkdir(parents=True, exist_ok=True)

    results_path = results_dir / f"{dataset_name}_baseline.json"

    with open(results_path, "w") as file:
        json.dump(results, file, indent=4)

    print(f"\nResults saved: {results_path}")

    return results


if __name__ == "__main__":

    for dataset_name, config in DATASETS.items():
        train_local_baselines(dataset_name, config)

    print("\nALL LOCAL BASELINE TRAINING COMPLETED!")
