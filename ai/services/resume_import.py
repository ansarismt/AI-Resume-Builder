from io import BytesIO
import os
from zipfile import BadZipFile

from docx import Document
from docx.opc.exceptions import PackageNotFoundError
from pypdf.errors import PyPdfError
from pypdf import PdfReader


def extract_resume_text(upload):
    extension = os.path.splitext(upload.name)[1].lower()
    content = upload.read()
    try:
        if extension == ".pdf":
            reader = PdfReader(BytesIO(content))
            if len(reader.pages) > 50:
                raise ValueError("Resume PDFs must contain 50 pages or fewer.")
            text = "\n".join(page.extract_text() or "" for page in reader.pages)
        elif extension == ".docx":
            from zipfile import ZipFile

            with ZipFile(BytesIO(content)) as archive:
                entries = archive.infolist()
                expanded_limit = 20 * 1024 * 1024
                if len(entries) > 1000:
                    raise ValueError("The DOCX file contains too much expanded content.")
                expanded_size = 0
                for entry in entries:
                    if entry.is_dir():
                        continue
                    remaining = expanded_limit - expanded_size
                    with archive.open(entry) as stream:
                        chunk = stream.read(remaining + 1)
                    expanded_size += len(chunk)
                    if expanded_size > expanded_limit:
                        raise ValueError("The DOCX file contains too much expanded content.")
            document = Document(BytesIO(content))
            paragraphs = [paragraph.text for paragraph in document.paragraphs]
            tables = [
                cell.text
                for table in document.tables
                for row in table.rows
                for cell in row.cells
            ]
            text = "\n".join(paragraphs + tables)
        else:
            raise ValueError("Upload a PDF or DOCX file.")
    except (PyPdfError, PackageNotFoundError, BadZipFile, KeyError) as error:
        raise ValueError("The uploaded document could not be read.") from error
    cleaned = "\n".join(line.strip() for line in text.splitlines() if line.strip())
    return cleaned[:50000]
