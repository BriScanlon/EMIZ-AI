def canned_response():
    """
    Returns a structured canned response.
    This is used for debugging and fallback responses.
    """
    nodes = [
        {"id": "1", "name": "DHC-8-402 Dash 8, G-JEDI", "category": "Aircraft"},
        {"id": "2", "name": "AC Electrical System", "category": "System"},
        {"id": "3", "name": "Wiring Loom", "category": "Component"},
        {"id": "4", "name": "Chafing due to blind rivet", "category": "FailureMode"},
        {"id": "5", "name": "AC bus and generator warnings", "category": "Symptom"},
        {"id": "6", "name": "Replace blind rivets with solid rivets", "category": "Resolution"},
        {"id": "7", "name": "Incident: AC System Failure", "category": "Incident"},
    ]

    links = [
        {"source": "1", "target": "7", "label": "OCCURRED_ON"},
        {"source": "2", "target": "3", "label": "PART_OF"},
        {"source": "4", "target": "2", "label": "AFFECTS"},
        {"source": "4", "target": "5", "label": "LEADS_TO"},
        {"source": "4", "target": "6", "label": "RESOLVED_BY"},
    ]

    categories = [
        {"name": "Aircraft"},
        {"name": "System"},
        {"name": "Component"},
        {"name": "FailureMode"},
        {"name": "Symptom"},
        {"name": "Resolution"},
        {"name": "Incident"},
    ]

    messages = [
        "Hello! I'm a friendly AI, here's a node graph for you.",
        "Hey! This message has no graph, just checking in!",
        "Heres another graph! Let me know what you think.",
        "Hope you're enjoying this! No graph this time.",
        "Here's a final graph to wrap things up!"
    ]

    responses = []

    for i, msg in enumerate(messages):
        response = {"message": msg}

        # Only add a graph if `i` is even
        if i % 2 == 0:
            response["graph"] = {
                "nodes": nodes,
                "links": links,
                "categories": categories,
            }

        responses.append(response)

    return responses
