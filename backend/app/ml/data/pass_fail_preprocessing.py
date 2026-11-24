
from pathlib import Path

import pandas as pd

from app.ml.data.preprocessing_utils import build_preprocessor


def prepare_pass_fail_data(dataset_name="student-mat.csv"):
    """
    Prepare the Student Performance dataset.

    Prediction timing:
        After the first grading period.

    G1: Included as an early academic indicator.
    G2: Excluded.
    G3: Used only to generate Pass/Fail labels.
    """

    project_root = Path(__file__).resolve().parents[4]

    dataset_path = (
        project_root
        / "datasets"
        / "raw"
        / "pass_fail"
        / dataset_name
    )

    if not dataset_path.exists():
        raise FileNotFoundError(
            f"Dataset not found: {dataset_path}"
        )

    df = pd.read_csv(dataset_path, sep=";")

    # Clean column names
    df.columns = df.columns.str.strip()

    # Generate binary target
    y = (df["G3"] >= 10).astype(int)

    # Remove future grades and target from features
    excluded_columns = ["G2", "G3"]

    X = df.drop(columns=excluded_columns).copy()

    # Identify categorical and numerical columns
    categorical = X.select_dtypes(
        include=["object", "category"]
    ).columns.tolist()

    numerical = X.select_dtypes(
        include=["number"]
    ).columns.tolist()

    # Build preprocessing pipeline
    preprocessor = build_preprocessor(
        numerical_features=numerical,
        categorical_features=categorical
    )

    # Validation
    assert len(X) == len(y)
    assert "G1" in X.columns
    assert "G2" not in X.columns
    assert "G3" not in X.columns

    print("\nPass / Fail dataset prepared successfully!")
    print(f"Dataset: {dataset_name}")
    print(f"Records: {len(X)}")
    print(f"Features: {len(X.columns)}")
    print(f"Categorical features: {len(categorical)}")
    print(f"Numerical features: {len(numerical)}")

    print("\nTarget distribution:")
    print(y.map({0: "Fail", 1: "Pass"}).value_counts().to_string())

    return X, y, preprocessor


if __name__ == "__main__":
    X, y, preprocessor = prepare_pass_fail_data()
