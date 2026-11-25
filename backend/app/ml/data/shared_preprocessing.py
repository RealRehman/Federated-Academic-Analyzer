
from pathlib import Path

import json
import joblib
import pandas as pd

from app.ml.data.preprocessing_utils import build_preprocessor
from app.ml.data.graduate_dropout_preprocessing import (
    CATEGORICAL_FEATURES,
    NUMERICAL_FEATURES
)


PROJECT_ROOT = Path(__file__).resolve().parents[4]

DEPARTMENTS = [
    "department_01",
    "department_02",
    "department_03",
    "department_04",
    "department_05"
]


def load_training_data(dataset_name):
    """
    Load only department training records.

    Independent test datasets are never used here.
    """

    department_data = []

    for department in DEPARTMENTS:

        file_path = (
            PROJECT_ROOT
            / "simulation"
            / "departments"
            / department
            / "data"
            / f"{dataset_name}.csv"
        )

        if not file_path.exists():
            raise FileNotFoundError(file_path)

        df = pd.read_csv(file_path)
        department_data.append(df)

    return pd.concat(department_data, ignore_index=True)


def create_shared_preprocessor(dataset_name):

    print(f"\nPreparing shared schema: {dataset_name}")

    # Load training records from all departments
    df = load_training_data(dataset_name)

    if dataset_name == "graduate_dropout":

        X = df.drop(columns=["Target"])

        categorical = [
            column.strip() for column in CATEGORICAL_FEATURES
        ]

        numerical = [
            column.strip() for column in NUMERICAL_FEATURES
        ]

    elif dataset_name == "pass_fail":

        X = df.drop(columns=["PassFail", "G2", "G3"],
                    errors="ignore")

        categorical = X.select_dtypes(
            include=["object", "category"]
        ).columns.tolist()

        numerical = X.select_dtypes(
            include=["number"]
        ).columns.tolist()

    else:
        raise ValueError(f"Unknown dataset: {dataset_name}")

    # Create and fit shared preprocessing pipeline
    preprocessor = build_preprocessor(
        numerical_features=numerical,
        categorical_features=categorical
    )

    preprocessor.fit(X)

    # Get identical transformed feature names
    feature_names = preprocessor.get_feature_names_out().tolist()

    # Save shared preprocessing artifacts
    output_dir = PROJECT_ROOT / "models" / "preprocessors"
    output_dir.mkdir(parents=True, exist_ok=True)

    joblib.dump(
        preprocessor,
        output_dir / f"{dataset_name}_preprocessor.joblib"
    )

    metadata = {
        "dataset": dataset_name,
        "input_features": X.columns.tolist(),
        "categorical_features": categorical,
        "numerical_features": numerical,
        "transformed_feature_count": len(feature_names),
        "transformed_features": feature_names,
        "training_records_used": len(X),
        "departments": DEPARTMENTS
    }

    with open(
        output_dir / f"{dataset_name}_schema.json",
        "w"
    ) as file:
        json.dump(metadata, file, indent=4)

    print(f"Training records: {len(X)}")
    print(f"Input features: {len(X.columns)}")
    print(f"Categorical features: {len(categorical)}")
    print(f"Numerical features: {len(numerical)}")
    print(f"Transformed features: {len(feature_names)}")

    print("Shared preprocessing schema saved successfully!")

    return preprocessor


if __name__ == "__main__":

    create_shared_preprocessor("graduate_dropout")

    create_shared_preprocessor("pass_fail")

    print("\nALL SHARED SCHEMAS CREATED SUCCESSFULLY!")

