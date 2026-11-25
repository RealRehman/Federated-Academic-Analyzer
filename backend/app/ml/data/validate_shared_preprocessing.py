
from pathlib import Path
import json

import joblib
import numpy as np
import pandas as pd
from scipy.sparse import issparse


PROJECT_ROOT = Path(__file__).resolve().parents[4]

DEPARTMENTS = [
    "department_01",
    "department_02",
    "department_03",
    "department_04",
    "department_05"
]

DATASETS = {
    "graduate_dropout": {
        "target": "Target"
    },
    "pass_fail": {
        "target": "PassFail"
    }
}


def validate_dataset(dataset_name, config):

    print("\n" + "=" * 65)
    print(f"VALIDATING SHARED FEATURES: {dataset_name}")
    print("=" * 65)

    artifact_dir = PROJECT_ROOT / "models" / "preprocessors"

    preprocessor = joblib.load(
        artifact_dir / f"{dataset_name}_preprocessor.joblib"
    )

    with open(
        artifact_dir / f"{dataset_name}_schema.json"
    ) as file:
        schema = json.load(file)

    expected_features = schema["transformed_features"]
    expected_count = schema["transformed_feature_count"]

    target = config["target"]

    for department in DEPARTMENTS:

        file_path = (
            PROJECT_ROOT
            / "simulation"
            / "departments"
            / department
            / "data"
            / f"{dataset_name}.csv"
        )

        df = pd.read_csv(file_path)

        X = df.drop(columns=[target])

        # Enforce the exact shared input feature order
        X = X[schema["input_features"]]

        transformed = preprocessor.transform(X)

        actual_count = transformed.shape[1]

        values = (
            transformed.data
            if issparse(transformed)
            else transformed
        )

        assert actual_count == expected_count, (
            f"Feature count mismatch in {department}"
        )

        assert np.isfinite(values).all(), (
            f"Invalid numerical values in {department}"
        )

        assert (
            preprocessor.get_feature_names_out().tolist()
            == expected_features
        )

        print(f"\n{department}")
        print(f"Records: {len(X)}")
        print(f"Transformed features: {actual_count}")
        print("Feature ordering: MATCHED")
        print("Numerical values: VALID")

    # Validate the independent test dataset too
    test_path = (
        PROJECT_ROOT
        / "simulation"
        / "test"
        / f"{dataset_name}_test.csv"
    )

    test_df = pd.read_csv(test_path)
    X_test = test_df.drop(columns=[target])
    X_test = X_test[schema["input_features"]]

    transformed_test = preprocessor.transform(X_test)

    assert transformed_test.shape[1] == expected_count

    print("\nIndependent test dataset")
    print(f"Records: {len(X_test)}")
    print(f"Transformed features: {transformed_test.shape[1]}")

    print(f"\n{dataset_name}: VALIDATION PASSED")


if __name__ == "__main__":

    for name, config in DATASETS.items():
        validate_dataset(name, config)

    print("\nALL SHARED PREPROCESSING VALIDATIONS PASSED!")
