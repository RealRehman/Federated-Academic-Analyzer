
import numpy as np

from app.federated.strategies.fedavg import fedavg_aggregate


client_updates = [
    {
        "parameters": {
            "weights": np.array([1.0, 2.0]),
            "bias": 0.5
        },
        "num_samples": 100
    },
    {
        "parameters": {
            "weights": np.array([3.0, 4.0]),
            "bias": 1.0
        },
        "num_samples": 200
    },
    {
        "parameters": {
            "weights": np.array([5.0, 6.0]),
            "bias": 1.5
        },
        "num_samples": 300
    }
]

global_parameters = fedavg_aggregate(client_updates)

print("Aggregated weights:", global_parameters["weights"])
print("Aggregated bias:", global_parameters["bias"])

print("\nExpected weights: [3.6667, 4.6667]")
print("Expected bias: 1.1667")

assert np.allclose(
    global_parameters["weights"],
    [3.6666667, 4.6666667]
)

assert np.isclose(
    global_parameters["bias"],
    1.1666667
)

print("\nFedAvg aggregation test PASSED!")

