import re

def slugify(text):
    return re.sub(r"[^a-zA-Z0-9_-]", "", text.replace(" ", "_")).lower()

