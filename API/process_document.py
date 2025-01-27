import logging
from PyPDF2 import PdfReader
import docx  # python-docx for DOCX handling
from io import BytesIO


def extract_tables_from_page(page_text):
    """
    Extracts simple table-like structures from page text.

    Args:
        page_text (str): The text content of a PDF page.

    Returns:
        list: A list of table-like structures, each represented as a list of rows.
    """
    tables = []
    try:
        # Split text into lines
        lines = page_text.splitlines()

        # Look for lines with consistent column-like spacing (e.g., using tabs or multiple spaces)
        table = []
        for line in lines:
            # Detect potential table rows (e.g., lines with multiple spaces or tab delimiters)
            if "\t" in line or "  " in line:
                # Split the row into columns based on tabs or spaces
                columns = line.split("\t") if "\t" in line else line.split()
                table.append(columns)
            elif table:  # If we find a line not part of the table, save the current table
                tables.append(table)
                table = []  # Reset for the next table

        # Append the last table if still active
        if table:
            tables.append(table)

    except Exception as e:
        logging.warning(f"Failed to extract tables from page: {e}")

    return tables


def process_pdf(file_content):
    """
    Processes a PDF file and extracts metadata, text, and tables.

    Args:
        file_content (bytes): The binary content of the PDF file.

    Returns:
        dict: A dictionary containing metadata, text, and tables.
    """
    logging.debug("Starting PDF processing.")
    try:
        # Open the PDF from binary content using PyPDF2
        pdf_reader = PdfReader(BytesIO(file_content))
        metadata = pdf_reader.metadata  # Extract metadata
        logging.debug(f"Extracted metadata: {metadata}")

        # Initialize extracted data structure
        extracted_data = {"metadata": metadata, "text": "", "tables": []}

        # Iterate over pages in the PDF
        for page_num, page in enumerate(pdf_reader.pages):
            logging.debug(f"Processing page {page_num + 1}/{len(pdf_reader.pages)}")

            # Extract plain text
            try:
                page_text = page.extract_text()
                if page_text:
                    extracted_data["text"] += page_text + "\n"
                    logging.debug(f"Extracted text from page {page_num + 1}")
            except Exception as e:
                logging.warning(f"Failed to extract text from page {page_num + 1}: {e}")

            # Extract structured text for tables
            try:
                tables = extract_tables_from_page(page_text)  # Pass plain text to the function
                extracted_data["tables"].append(tables)
                logging.debug(f"Extracted tables from page {page_num + 1}")
            except Exception as e:
                logging.warning(f"Failed to extract tables from page {page_num + 1}: {e}")

        logging.debug("Completed PDF processing.")
        return extracted_data

    except Exception as e:
        logging.error(f"Error processing PDF: {e}")
        return None


def process_docx(file_content):
    """
    Processes a DOCX file and extracts text.

    Args:
        file_content (bytes): The binary content of the DOCX file.

    Returns:
        dict: A dictionary containing the extracted text.
    """
    logging.debug("Starting DOCX processing.")
    try:
        doc = docx.Document(BytesIO(file_content))
        full_text = [para.text for para in doc.paragraphs]
        return {"text": "\n".join(full_text).strip()}
    except Exception as e:
        logging.error(f"Error processing DOCX: {e}")
        return None


def process_txt(file_content):
    """
    Processes a TXT file and extracts text.

    Args:
        file_content (bytes): The binary content of the TXT file.

    Returns:
        dict: A dictionary containing the extracted text.
    """
    logging.debug("Starting TXT processing.")
    try:
        text = file_content.decode("utf-8").strip()
        return {"text": text} if text else None
    except Exception as e:
        logging.error(f"Error processing TXT: {e}")
        return None


def process_document(file, file_extension):
    """
    Processes a document based on its file extension.

    Args:
        file (bytes): The binary content of the document.
        file_extension (str): The file extension (e.g., "pdf", "docx", "txt").

    Returns:
        dict: A dictionary containing the extracted content or None if an error occurs.
    """
    logging.debug(f"Processing document of type: {file_extension}")
    try:
        if file_extension == "pdf":
            return process_pdf(file)
        elif file_extension == "docx":
            return process_docx(file)
        elif file_extension == "txt":
            return process_txt(file)
        else:
            logging.error(f"Unsupported file type: {file_extension}")
            return None
    except Exception as e:
        logging.error(f"Error processing document: {e}")
        return None
