
from pathlib import Path
import json

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[4]

DATASETS = [
    "graduate_dropout",
    "pass_fail"
]

METHODS = [
    "fedavg",
    "fedprox"
]

METRICS = [
    "accuracy",
    "macro_precision",
    "macro_recall",
    "macro_f1"
]


def load_json(path):
    with open(path) as file:
        return json.load(file)


def compare_dataset(dataset_name):

    print("\n" + "=" * 75)
    print(f"EXPERIMENT COMPARISON: {dataset_name}")
    print("=" * 75)

    rows = []

    # 1. Independent local baselines
    baseline_path = (
        PROJECT_ROOT
        / "models"
        / "evaluation"
        / f"{dataset_name}_baseline.json"
    )

    baselines = load_json(baseline_path)

    baseline_metrics = []

    for result in baselines:

        row = {
            "dataset": dataset_name,
            "method": "Local Baseline",
            "department": result["department"]
        }

        for metric in METRICS:
            row[metric] = result[metric]

        rows.append(row)
        baseline_metrics.append(result)

    # Calculate average baseline performance
    average_row = {
        "dataset": dataset_name,
        "method": "Local Baseline Average",
        "department": "All departments"
    }

    for metric in METRICS:
        average_row[metric] = round(
            sum(r[metric] for r in baseline_metrics)
            / len(baseline_metrics),
            4
        )

    rows.append(average_row)

# 2. Centralized model
    centralized_path = (
        PROJECT_ROOT
        / "models"
        / "evaluation"
        / f"{dataset_name}_centralized.json"
    )

    centralized_result = load_json(centralized_path)

    rows.append({
        "dataset": dataset_name,
        "method": "Centralized",
        "department": "Global Model",
        **{
            metric: centralized_result[metric]
            for metric in METRICS
        }
    })

# 3. Federated methods
    for method in METHODS:

        history_path = (
            PROJECT_ROOT
            / "models"
            / "federated"
            / method
            / dataset_name
            / "training_history.json"
        )

        history = load_json(history_path)

        final_result = history[-1]

        rows.append({
            "dataset": dataset_name,
            "method": method.upper(),
            "department": "Global Model",
            **{
                metric: final_result[metric]
                for metric in METRICS
            }
        })

    return rows


if __name__ == "__main__":

    all_results = []

    for dataset_name in DATASETS:
        all_results.extend(
            compare_dataset(dataset_name)
        )

    results_df = pd.DataFrame(all_results)

    output_dir = PROJECT_ROOT / "models" / "evaluation"
    output_dir.mkdir(parents=True, exist_ok=True)

    csv_path = output_dir / "experiment_comparison.csv"
    json_path = output_dir / "experiment_comparison.json"

    results_df.to_csv(csv_path, index=False)

    with open(json_path, "w") as file:
        json.dump(all_results, file, indent=4)

    # Display comparison
    for dataset_name in DATASETS:

        print("\n\n" + "#" * 75)
        print(f"FINAL RESULTS: {dataset_name.upper()}")
        print("#" * 75)

        dataset_results = results_df[
            results_df["dataset"] == dataset_name
        ]

        print(
            dataset_results[
                ["method", "department"] + METRICS
            ].to_string(index=False)
        )

    print("\nComparison files saved:")
    print(csv_path)
    print(json_path)

    print("\nEXPERIMENT COMPARISON COMPLETED!")
