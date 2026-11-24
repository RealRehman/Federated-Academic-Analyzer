
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parents[4]
DATASETS = ROOT / "datasets" / "raw"

FILES = {
    "Graduate / Dropout": (
        DATASETS / "graduate_dropout" / "data.csv",
        "Target"
    ),
    "Student Performance - Mathematics": (
        DATASETS / "pass_fail" / "student-mat.csv",
        "G3"
    ),
    "Student Performance - Portuguese": (
        DATASETS / "pass_fail" / "student-por.csv",
        "G3"
    ),
}


def inspect_dataset(name, file_path, target):
    print("\n" + "=" * 70)
    print(name)
    print("=" * 70)

    if not file_path.exists():
        print(f"FILE NOT FOUND: {file_path}")
        return

    df = pd.read_csv(file_path, sep=";")

    print(f"\nFile: {file_path.name}")
    print(f"Shape: {df.shape[0]} rows × {df.shape[1]} columns")

    print("\nColumns:")
    print(df.columns.tolist())

    print("\nData types:")
    print(df.dtypes.to_string())

    print("\nMissing values:")
    missing = df.isnull().sum()
    print(missing[missing > 0].to_string() if missing.any()
          else "No missing values found.")

    print(f"\nTarget distribution ({target}):")
    print(df[target].value_counts(dropna=False).to_string())

    if target == "G3":
        print("\nDerived Pass/Fail distribution (G3 >= 10 = Pass):")
        result = df[target].apply(
            lambda grade: "Pass" if grade >= 10 else "Fail"
        )
        print(result.value_counts().to_string())


if __name__ == "__main__":
    for name, (file_path, target) in FILES.items():
        inspect_dataset(name, file_path, target)
