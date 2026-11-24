
import numpy as np
from scipy.sparse import issparse
from sklearn.model_selection import train_test_split

from app.ml.data.graduate_dropout_preprocessing import (
    prepare_graduate_dropout_data
)

from app.ml.data.pass_fail_preprocessing import (
    prepare_pass_fail_data
)


def test_pipeline(name, X, y, preprocessor):
    print("\n" + "=" * 60)
    print(f"TESTING: {name}")
    print("=" * 60)

    # Split before fitting preprocessing
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    # Fit only on training data
    X_train_processed = preprocessor.fit_transform(X_train)

    # Transform test data without fitting again
    X_test_processed = preprocessor.transform(X_test)

    # Check for valid numerical values
    train_values = (
        X_train_processed.data
        if issparse(X_train_processed)
        else X_train_processed
    )

    test_values = (
        X_test_processed.data
        if issparse(X_test_processed)
        else X_test_processed
    )

    assert np.isfinite(train_values).all()
    assert np.isfinite(test_values).all()

    assert X_train_processed.shape[1] == X_test_processed.shape[1]

    print(f"Original records: {len(X)}")
    print(f"Training records: {len(X_train)}")
    print(f"Testing records: {len(X_test)}")

    print(f"Processed training shape: {X_train_processed.shape}")
    print(f"Processed testing shape: {X_test_processed.shape}")

    print(f"Training labels: {len(y_train)}")
    print(f"Testing labels: {len(y_test)}")

    print(f"Sparse matrix: {issparse(X_train_processed)}")
    print("NaN / Infinity check: PASSED")
    print("Feature dimension consistency: PASSED")

    print(f"\n{name}: ALL TESTS PASSED")


if __name__ == "__main__":

    # Graduate / Dropout
    X1, y1, preprocessor1, encoder = (
        prepare_graduate_dropout_data()
    )

    test_pipeline(
        "Graduate / Dropout",
        X1,
        y1,
        preprocessor1
    )

    # Pass / Fail
    X2, y2, preprocessor2 = prepare_pass_fail_data()

    test_pipeline(
        "Pass / Fail",
        X2,
        y2,
        preprocessor2
    )

    print("\nALL PREPROCESSING TESTS COMPLETED SUCCESSFULLY!")
