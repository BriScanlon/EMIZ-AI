import json
import re


def split_message_object(message_obj):
    """
    Splits the given message object into a structured format with `message` and `node_graph` fields.

    Args:
        message_obj (dict): A dictionary containing a `message` key with both text and JSON content.

    Returns:
        dict: A dictionary with separate `message` and `node_graph` fields.
    """

    # Extract JSON block using regex
    json_match = re.search(r"```json\n(.*?)\n```", message_obj, re.DOTALL)

    if json_match:
        json_str = json_match.group(1)
        try:
            node_graph = json.loads(json_str)
        except json.JSONDecodeError:
            node_graph = {}

        # Remove JSON part from the message
        text_message = re.sub(
            r"```json\n.*?\n```", "", message_obj, flags=re.DOTALL
        ).strip()
    else:
        node_graph = {}
        text_message = message_obj.strip()

    return {"message": text_message, "node_graph": node_graph}
