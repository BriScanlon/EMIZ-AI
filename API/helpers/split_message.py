import json
import re

def split_message_object(message_obj):
    """
    Splits the given message object into a structured format with `message` and `node_graph` fields.

    Args:
        message_obj (dict or str): A dictionary containing a `message` key with both text and JSON content,
                                   or a plain string containing the text and JSON.

    Returns:
        dict: A dictionary with separate `message` and `node_graph` fields.
    """

    # Ensure we are working with a string
    if isinstance(message_obj, dict):
        message_obj = message_obj.get("message", "")

    # Extract JSON block using regex (supports both '''json and ```json)
    json_match = re.search(r"['`]{3}json\s*(.*?)\s*['`]{3}", message_obj, re.DOTALL)

    if json_match:
        json_str = json_match.group(1).strip()
        try:
            node_graph = json.loads(json_str)  # Convert JSON string to Python dict
        except json.JSONDecodeError:
            node_graph = {}

        # Remove JSON part from the message
        text_message = re.sub(r"['`]{3}json\s*.*?\s*['`]{3}", "", message_obj, flags=re.DOTALL).strip()
    else:
        node_graph = {}
        text_message = message_obj.strip()

    return {"message": text_message, "node_graph": node_graph}
