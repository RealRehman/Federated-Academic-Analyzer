
from pathlib import Path
import json

import joblib
import numpy as np
import pandas as pd

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)

from app.federated.communication.communication_metrics import (
    calculate_round_communication
)

from app.ml.models.federated_logistic import (
    initialize_parameters,
    train_local_model,
    predict
)

from app.federated.strategies.fedavg import (
    fedavg_aggregate
)


PROJECT_ROOT = Path(__file__).resolve().parents[4]

DEPARTMENTS = [
    "department_01",
    "department_02",
    "department_03",
    "department_04",
    "department_05"
]

CONFIG = {
    "rounds": 10,
    "local_epochs": 20,
    "learning_rate": 0.05,
    "l2": 0.001
}


def load_department_data(dataset_name, department, schema):

    file_path = (
        PROJECT_ROOT
        / "simulation"
        / "departments"
        / department
        / "data"
        / f"{dataset_name}.csv"
    )

    df = pd.read_csv(file_path)

    X = df[schema["input_features"]]

    if dataset_name == "graduate_dropout":
        y = df["Target"].map({
            "Dropout": 0,
            "Graduate": 1
        })
    else:
        y = df["PassFail"].astype(int)

    if y.isna().any():
        raise ValueError(f"Invalid target values in {department}")

    return X, y.to_numpy(dtype=np.int64)


def load_test_data(dataset_name, schema):

    file_path = (
        PROJECT_ROOT
        / "simulation"
        / "test"
        / f"{dataset_name}_test.csv"
    )

    df = pd.read_csv(file_path)

    X = df[schema["input_features"]]

    if dataset_name == "graduate_dropout":
        y = df["Target"].map({
            "Dropout": 0,
            "Graduate": 1
        })
    else:
        y = df["PassFail"].astype(int)

    if y.isna().any():
        raise ValueError("Invalid test target values.")

    return X, y.to_numpy(dtype=np.int64)


def evaluate_global_model(parameters, X_test, y_test):

    predictions = predict(X_test, parameters)

    return {
        "accuracy": round(
            float(accuracy_score(y_test, predictions)), 4
        ),
        "macro_precision": round(
            float(precision_score(
                y_test, predictions,
                average="macro",
                zero_division=0
            )), 4
        ),
        "macro_recall": round(
            float(recall_score(
                y_test, predictions,
                average="macro",
                zero_division=0
            )), 4
        ),
        "macro_f1": round(
            float(f1_score(
                y_test, predictions,
                average="macro",
                zero_division=0
            )), 4
        )
    }


def run_fedavg(dataset_name):

    print("\n" + "=" * 70)
    print(f"FEDAVG TRAINING: {dataset_name}")
    print("=" * 70)

    artifact_dir = PROJECT_ROOT / "models" / "preprocessors"

    preprocessor = joblib.load(
        artifact_dir / f"{dataset_name}_preprocessor.joblib"
    )

    with open(
        artifact_dir / f"{dataset_name}_schema.json"
    ) as file:
        schema = json.load(file)

    # Load and transform the independent test data
    X_test, y_test = load_test_data(dataset_name, schema)

    X_test_processed = preprocessor.transform(X_test)

    # Initialize one global model
    global_parameters = initialize_parameters(
        X_test_processed.shape[1]
    )

    history = []

    for round_number in range(1, CONFIG["rounds"] + 1):

        print(f"\nCommunication Round {round_number}")

        client_updates = []

        # Send the same global parameters to every department
        for department in DEPARTMENTS:

            X_local, y_local = load_department_data(
                dataset_name,
                department,
                schema
            )

            X_local_processed = preprocessor.transform(X_local)

            updated_parameters, local_loss = train_local_model(
                X=X_local_processed,
                y=y_local,
                initial_parameters=global_parameters,
                learning_rate=CONFIG["learning_rate"],
                epochs=CONFIG["local_epochs"],
                l2=CONFIG["l2"]
            )

            client_updates.append({
                "parameters": updated_parameters,
                "num_samples": len(y_local)
            })

            print(
                f"{department}: "
                f"samples={len(y_local)}, "
                f"local_loss={local_loss:.4f}"
            )

        # Central server aggregates client parameters
        
        communication_metrics = calculate_round_communication(
            global_parameters,
            client_updates
        )
        
        global_parameters = fedavg_aggregate(client_updates)

        # Evaluate the updated global model
        metrics = evaluate_global_model(
            global_parameters,
            X_test_processed,
            y_test
        )

        round_result = {
            "round": round_number,
            **metrics,
            "communication": communication_metrics
        }

        history.append(round_result)

        print(
            f"Global accuracy: {metrics['accuracy']:.4f} | "
            f"Macro F1: {metrics['macro_f1']:.4f}"
        )

    # Save final global model
    output_dir = (
        PROJECT_ROOT
        / "models"
        / "federated"
        / "fedavg"
        / dataset_name
    )

    output_dir.mkdir(parents=True, exist_ok=True)

    joblib.dump(
        global_parameters,
        output_dir / "global_model.joblib"
    )

    with open(output_dir / "training_history.json", "w") as file:
        json.dump(history, file, indent=4)

    print("\nFEDAVG TRAINING COMPLETED")
    print("Final evaluation:")
    print(json.dumps(history[-1], indent=4))

    return history


if __name__ == "__main__":

    run_fedavg("graduate_dropout")

    run_fedavg("pass_fail")

    print("\nBOTH FEDAVG EXPERIMENTS COMPLETED!")
