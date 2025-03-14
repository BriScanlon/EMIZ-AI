import re
import os
import json
import logging

# Set a default root directory for file storage
DEFAULT_FILE_LOCATION = "."

def slugify(text):
    """Convert text into a safe filename-friendly format."""
    return re.sub(r"[^a-zA-Z0-9_-]", "", text.replace(" ", "_")).lower()
0000
def save_file(contents, file_name, file_location=DEFAULT_FILE_LOCATION):
    """
    Saves contents to a file.
    
    :param contents: Data to save (dict, list, or string)
    :param file_name: Name of the file (including extension)
    :param file_location: Directory where the file will be saved
    """
    os.makedirs(file_location, exist_ok=True)  # Ensure directory exists
    file_path = os.path.join(file_location, file_name)

    try:
        # Determine save format based on type
        if isinstance(contents, (dict, list)):
            with open(file_path, "w", encoding="utf-8") as file:
                json.dump(contents, file, indent=4)  # Save as JSON
        elif isinstance(contents, str):
            with open(file_path, "w", encoding="utf-8") as file:
                file.write(contents)  # Save as text
        else:
            raise ValueError("Unsupported file content type")

    except Exception as e:
        logging.error(f"Error saving file {file_path}: {e}")
        return False

    return True  # Indicate success

def load_file(file_name, file_location=DEFAULT_FILE_LOCATION):
    """
    Loads contents from a file.
    Returns a dictionary, list, or string, depending on file type.
    Ensures a valid return type to prevent 'NoneType' errors.
    """
    file_path = os.path.join(file_location, file_name)

    if not os.path.exists(file_path):
        logging.warning(f"⚠️ File {file_path} not found.")
        return []  # Always return a valid type

    try:
        with open(file_path, "r", encoding="utf-8") as file:
            try:
                data = json.load(file)
                return data if isinstance(data, (dict, list)) else []
            except json.JSONDecodeError:
                return file.read().strip() or ""  # Ensure text files return a string

    except Exception as e:
        logging.error(f"❌ Error loading file {file_path}: {e}")
        return []  # Always return an empty list if file load fails
