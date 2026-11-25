from sklearn.model_selection import train_test_split
from pathlib import Path

import numpy as np
import pandas as pd

from app.ml.data.graduate_dropout_preprocessing import (
    prepare_graduate_dropout_data
)
from app.ml.data.pass_fail_preprocessing import (
    prepare_pass_fail_data
)


PROJECT_ROOT = Path(__file__).resolve().parents[4]

N_CLIENTS = 5
DIRICHLET_ALPHA = 0.5
MIN_RECORDS = 20
RANDOM_SEED = 42


def dirichlet_partition(X, y, n_clients=5, alpha=0.5,
                        min_size=20, seed=42):
    """
    Divide records among clients using Dirichlet partitioning.

    Each client receives a different class distribution.
    Every client must have at least min_size records and
    examples from every target class.
    """

    y = np.asarray(y)
    rng = np.random.default_rng(seed)

    classes = np.unique(y)

    for attempt in range(1000):
        client_indices = [[] for _ in range(n_clients)]

        for class_label in classes:
            class_indices = np.where(y == class_label)[0]
            rng.shuffle(class_indices)

            proportions = rng.dirichlet(
                np.repeat(alpha, n_clients)
            )

            split_points = (
                np.cumsum(proportions) * len(class_indices)
            ).astype(int)[:-1]

            class_chunks = np.split(
                class_indices, split_points
            )

            for client_id, chunk in enumerate(class_chunks):
                client_indices[client_id].extend(
                    chunk.tolist()
                )

        valid = True

        for indices in client_indices:
            if len(indices) < min_size:
                valid = False
                break

            # Require at least 5 examples of every class
            class_counts = pd.Series(y[indices]).value_counts()

            if any(class_counts.get(label, 0) < 5 for label in classes):
                valid = False
                break

        if valid:
            partitions = []

            for indices in client_indices:
                rng.shuffle(indices)
                partitions.append(X.iloc[indices].copy())

            return partitions

    raise RuntimeError(
        "Could not create valid client partitions. "
        "Try increasing alpha or reducing min_size."
    )



def save_department_datasets(name, X, y, target_name):
    """
    Split benchmark data into training and testing sets.

    Distribute only training records among departments.
    Keep testing records separate for final evaluation.
    """

    X = X.reset_index(drop=True)
    y = np.asarray(y)

    # 80% training, 20% testing
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    # Save independent test dataset
    test_path = PROJECT_ROOT / "simulation" / "test"
    test_path.mkdir(parents=True, exist_ok=True)

    test_data = X_test.reset_index(drop=True).copy()
    test_data[target_name] = y_test

    test_data.to_csv(
        test_path / f"{name}_test.csv",
        index=False
    )

    # Reset training indexes for safe positional alignment
    X_train = X_train.reset_index(drop=True)

    print(f"\nPartitioning: {name}")
    print(f"Training records: {len(X_train)}")
    print(f"Testing records: {len(X_test)}")

    partitions = dirichlet_partition(
        X=X_train,
        y=y_train,
        n_clients=N_CLIENTS,
        alpha=DIRICHLET_ALPHA,
        min_size=MIN_RECORDS,
        seed=RANDOM_SEED
    )

    for client_id, partition in enumerate(partitions, start=1):

        client_path = (
            PROJECT_ROOT
            / "simulation"
            / "departments"
            / f"department_{client_id:02d}"
            / "data"
        )

        client_path.mkdir(parents=True, exist_ok=True)

        local_data = partition.copy()

        # Indexes now refer to positions in y_train
        local_data[target_name] = y_train[
            partition.index.to_numpy()
        ]

        output_file = client_path / f"{name}.csv"
        local_data.to_csv(output_file, index=False)

        print(f"\nDepartment {client_id:02d}")
        print(f"Records: {len(local_data)}")
        print("Class distribution:")
        print(
            local_data[target_name]
            .value_counts()
            .to_string()
        )

    print(f"\nIndependent test file saved: {test_path}")


if __name__ == "__main__":

    # Model 1: Graduate / Dropout
    X1, y1, _, encoder = prepare_graduate_dropout_data()

    save_department_datasets(
        name="graduate_dropout",
        X=X1,
        y=encoder.inverse_transform(y1),
        target_name="Target"
    )

    # Model 2: Pass / Fail
    X2, y2, _ = prepare_pass_fail_data()

    save_department_datasets(
        name="pass_fail",
        X=X2,
        y=y2,
        target_name="PassFail"
    )

    print("\nAll department datasets created successfully!")
