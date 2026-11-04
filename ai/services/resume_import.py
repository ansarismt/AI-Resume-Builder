from io import BytesIO
import os
from zipfile import BadZipFile, ZipFile

from docx import Document
from docx.opc.exceptions import PackageNotFoundError
from pypdf.errors import PyPdfError
from pypdf import PdfReader


MAX_PDF_PAGES = 50
MAX_DOCX_ENTRIES = 1000
MAX_DOCX_EXPANDED_SIZE = 20 * 1024 * 1024
MAX_EXTRACTED_TEXT_LENGTH = 50000


def extract_resume_text(upload):
    extension = os.path.splitext(upload.name)[1].lower()
    content = upload.read()
    try:
        if extension == ".pdf":
            reader = PdfReader(BytesIO(content))
            if len(reader.pages) > MAX_PDF_PAGES:
                raise ValueError(f"Resume PDFs must contain {MAX_PDF_PAGES} pages or fewer.")
            text = "\n".join(page.extract_text() or "" for page in reader.pages)
        elif extension == ".docx":
            with ZipFile(BytesIO(content)) as archive:
                entries = archive.infolist()
                if len(entries) > MAX_DOCX_ENTRIES:
                    raise ValueError("The DOCX file contains too much expanded content.")
                expanded_size = 0
                for entry in entries:
                    if entry.is_dir():
                        continue
                    remaining = MAX_DOCX_EXPANDED_SIZE - expanded_size
                    with archive.open(entry) as stream:
                        expanded_size += len(stream.read(remaining + 1))
                    if expanded_size > MAX_DOCX_EXPANDED_SIZE:
                        raise ValueError("The DOCX file contains too much expanded content.")
            document = Document(BytesIO(content))
            paragraphs = [paragraph.text for paragraph in document.paragraphs]
            tables = [
                cell.text for table in document.tables for row in table.rows for cell in row.cells
            ]
            text = "\n".join(paragraphs + tables)
        else:
            raise ValueError("Upload a PDF or DOCX file.")
    except (PyPdfError, PackageNotFoundError, BadZipFile, KeyError) as error:
        raise ValueError("The uploaded document could not be read.") from error
    cleaned = "\n".join(line.strip() for line in text.splitlines() if line.strip())
    return cleaned[:MAX_EXTRACTED_TEXT_LENGTH]
