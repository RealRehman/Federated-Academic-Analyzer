
from pathlib import Path
import pandas as pd

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
        "target": "Target",
        "expected_records": 2904,
        "expected_classes": {"Graduate", "Dropout"}
    },
    "pass_fail": {
        "target": "PassFail",
        "expected_records": 316,
        "expected_classes": {0, 1}
    }
}


def validate_dataset(dataset_name, config):
    print("\n" + "=" * 65)
    print(f"VALIDATING: {dataset_name}")
    print("=" * 65)

    total_records = 0
    distributions = []

    for department in DEPARTMENTS:
        file_path = (
            PROJECT_ROOT
            / "simulation"
            / "departments"
            / department
            / "data"
            / f"{dataset_name}.csv"
        )

        assert file_path.exists(), f"Missing file: {file_path}"

        df = pd.read_csv(file_path)

        target = config["target"]

        assert target in df.columns
        assert len(df) > 20
        assert df[target].notna().all()

        classes = set(df[target].unique())

        assert classes == config["expected_classes"], (
            f"Unexpected classes in {department}: {classes}"
        )

        total_records += len(df)

        counts = df[target].value_counts(normalize=True)

        distributions.append(counts)

        print(f"\n{department}")
        print(f"Records: {len(df)}")
        print("Class distribution (%):")
        print((counts * 100).round(2).to_string())

    assert total_records == config["expected_records"], (
        f"Expected {config['expected_records']} records, "
        f"found {total_records}"
    )

    combined = pd.concat(distributions, axis=1).fillna(0)

    # Check whether at least one class has different
    # proportions across the departments.
    non_iid_detected = (
        combined.max(axis=1) - combined.min(axis=1)
    ).max() > 0.01

    print(f"\nTotal records: {total_records}")
    print(f"Expected records: {config['expected_records']}")
    print(f"Non-IID variation detected: {non_iid_detected}")
    print("Dataset validation: PASSED")


if __name__ == "__main__":
    for name, config in DATASETS.items():
        validate_dataset(name, config)

    print("\nALL DEPARTMENT DATASETS VALIDATED SUCCESSFULLY!")
