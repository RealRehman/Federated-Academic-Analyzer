
import numpy as np

from app.ml.models.federated_logistic import (
    initialize_parameters,
    train_local_model
)

# Small simulated binary dataset
X = np.array([
    [1.0, 2.0],
    [2.0, 1.0],
    [3.0, 2.0],
    [4.0, 3.0],
    [5.0, 4.0],
    [6.0, 5.0]
])

y = np.array([0, 0, 0, 1, 1, 1])

global_parameters = initialize_parameters(2)

# Give the global model non-zero parameters
global_parameters["weights"] = np.array([0.5, -0.3])
global_parameters["bias"] = 0.2

# FedAvg: mu = 0
fedavg_parameters, _ = train_local_model(
    X=X,
    y=y,
    initial_parameters=global_parameters,
    learning_rate=0.05,
    epochs=20,
    l2=0.001,
    mu=0.0
)

# FedProx: mu = 0.01
fedprox_parameters, _ = train_local_model(
    X=X,
    y=y,
    initial_parameters=global_parameters,
    global_parameters=global_parameters,
    learning_rate=0.05,
    epochs=20,
    l2=0.001,
    mu=0.01
)

difference = np.linalg.norm(
    fedavg_parameters["weights"] -
    fedprox_parameters["weights"]
)

print("FedAvg weights:", fedavg_parameters["weights"])
print("FedProx weights:", fedprox_parameters["weights"])
print("Weight difference:", difference)

if difference > 0:
    print("PASS: FedProx proximal penalty affects training.")
else:
    print("FAIL: No difference detected.")

