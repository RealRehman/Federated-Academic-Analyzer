
import pickle


def calculate_payload_size(payload):
    """
    Calculate the serialized size of a model payload in bytes.
    """
    return len(pickle.dumps(payload))


def calculate_round_communication(global_parameters, client_updates):
    """
    Calculate communication cost for one federated round.

    Downlink: Global model sent to each client.
    Uplink: Each client's model update sent to the server.
    """

    downlink_per_client = calculate_payload_size(global_parameters)

    uplink_per_client = [
        calculate_payload_size(update["parameters"])
        for update in client_updates
    ]

    total_downlink = downlink_per_client * len(client_updates)
    total_uplink = sum(uplink_per_client)

    total_communication = total_downlink + total_uplink

    return {
        "downlink_bytes": total_downlink,
        "uplink_bytes": total_uplink,
        "total_bytes": total_communication,
        "downlink_kb": round(total_downlink / 1024, 4),
        "uplink_kb": round(total_uplink / 1024, 4),
        "total_kb": round(total_communication / 1024, 4)
    }
