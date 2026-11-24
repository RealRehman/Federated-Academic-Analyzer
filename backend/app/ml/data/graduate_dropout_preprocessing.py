
import pandas as pd

# Columns representing categorical information.
CATEGORICAL_FEATURES = [
    "Marital status",
    "Application mode",
    "Application order",
    "Course",
    "Daytime/evening attendance\t",
    "Previous qualification",
    "Nacionality",
    "Mother's qualification",
    "Father's qualification",
    "Mother's occupation",
    "Father's occupation",
    "Displaced",
    "Educational special needs",
    "Debtor",
    "Tuition fees up to date",
    "Gender",
    "Scholarship holder",
    "International"
]

# Columns representing numerical measurements.
NUMERICAL_FEATURES = [
    "Previous qualification (grade)",
    "Admission grade",
    "Age at enrollment",
    "Curricular units 1st sem (credited)",
    "Curricular units 1st sem (enrolled)",
    "Curricular units 1st sem (evaluations)",
    "Curricular units 1st sem (approved)",
    "Curricular units 1st sem (grade)",
    "Curricular units 1st sem (without evaluations)",
    "Unemployment rate",
    "Inflation rate",
    "GDP"
]


def inspect_feature_types(df: pd.DataFrame):
    """
    Display the selected numerical and categorical features.
    """

    print("\nCategorical features:", len(CATEGORICAL_FEATURES))
    for column in CATEGORICAL_FEATURES:
        print(" -", column)

    print("\nNumerical features:", len(NUMERICAL_FEATURES))
    for column in NUMERICAL_FEATURES:
        print(" -", column)

    selected = CATEGORICAL_FEATURES + NUMERICAL_FEATURES

    missing_columns = set(selected) - set(df.columns)

    if missing_columns:
        raise ValueError(
            f"Columns not found in dataset: {missing_columns}"
        )

    print("\nAll selected features exist in the dataset.")


from pathlib import Path
from sklearn.preprocessing import LabelEncoder

from app.ml.data.preprocessing_utils import build_preprocessor


def prepare_graduate_dropout_data():
    """
    Load and prepare the Graduate / Dropout dataset.

    - Remove Enrolled records.
    - Normalize column names.
    - Exclude second-semester information.
    - Separate features and target.
    - Return an unfitted preprocessing pipeline.
    """

    project_root = Path(__file__).resolve().parents[4]

    dataset_path = (
        project_root
        / "datasets"
        / "raw"
        / "graduate_dropout"
        / "data.csv"
    )

    # Load dataset
    df = pd.read_csv(dataset_path, sep=";")

    # Clean column names
    df.columns = df.columns.str.strip()

    # Remove Enrolled records
    df = df[df["Target"].isin(["Graduate", "Dropout"])].copy()

    # Prepare target labels
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(df["Target"])

    # Normalize feature lists
    categorical = [c.strip() for c in CATEGORICAL_FEATURES]
    numerical = [c.strip() for c in NUMERICAL_FEATURES]

    # Select allowed first-semester features
    feature_columns = categorical + numerical
    X = df[feature_columns].copy()

    # Build preprocessing pipeline
    preprocessor = build_preprocessor(
        numerical_features=numerical,
        categorical_features=categorical
    )

    # Validation
    assert len(X) == len(y)
    assert "Target" not in X.columns
    assert not any("2nd sem" in c for c in X.columns)

    print("\nGraduate / Dropout dataset prepared successfully!")
    print(f"Records: {len(X)}")
    print(f"Features: {len(feature_columns)}")
    print(f"Categorical features: {len(categorical)}")
    print(f"Numerical features: {len(numerical)}")
    print("\nTarget mapping:")
    print(dict(zip(label_encoder.classes_,
                   label_encoder.transform(label_encoder.classes_))))

    print("\nClass distribution:")
    print(df["Target"].value_counts().to_string())

    return X, y, preprocessor, label_encoder
