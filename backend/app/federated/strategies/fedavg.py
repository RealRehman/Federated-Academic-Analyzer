
import numpy as np


def fedavg_aggregate(client_updates):
    """
    Aggregate local model parameters using FedAvg.

    client_updates format:

    [
        {
            "parameters": {
                "weights": numpy_array,
                "bias": float
            },
            "num_samples": int
        }
    ]
    """

    if not client_updates:
        raise ValueError("No client updates received.")

    total_samples = sum(
        update["num_samples"]
        for update in client_updates
    )

    if total_samples <= 0:
        raise ValueError("Total sample count must be positive.")

    reference_weights = client_updates[0]["parameters"]["weights"]

    global_weights = np.zeros_like(reference_weights)
    global_bias = 0.0

    for update in client_updates:

        parameters = update["parameters"]
        num_samples = update["num_samples"]

        weights = np.asarray(parameters["weights"])

        if weights.shape != reference_weights.shape:
            raise ValueError(
                "Client model dimensions do not match."
            )

        if num_samples <= 0:
            raise ValueError(
                "Each client must have positive sample count."
            )

        contribution = num_samples / total_samples

        global_weights += contribution * weights
        global_bias += contribution * parameters["bias"]

    return {
        "weights": global_weights,
        "bias": float(global_bias)
    }
