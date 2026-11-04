from io import BytesIO
import re
from xml.sax.saxutils import escape

from docx import Document
from docx.shared import Inches, Pt, RGBColor
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

from resumes.export_styles import (
    ensure_pdf_text_supported,
    resolve_export_style,
    set_docx_font,
)


def _safe_text(value):
    return re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", value).strip()


def render_cover_letter(name, content, extension):
    clean_name = _safe_text(name)
    clean_content = _safe_text(content)
    accent, font = resolve_export_style("template1")
    if extension == "docx":
        document = Document()
        section = document.sections[0]
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        title = document.add_paragraph()
        run = title.add_run(clean_name)
        set_docx_font(run, font)
        run.bold = True
        run.font.size = Pt(20)
        run.font.color.rgb = RGBColor.from_string(accent)
        for paragraph in clean_content.splitlines():
            body = document.add_paragraph()
            body_run = body.add_run(paragraph)
            set_docx_font(body_run, font)
        result = BytesIO()
        document.save(result)
    else:
        ensure_pdf_text_supported(clean_name, clean_content)
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "LetterTitle",
            parent=styles["Title"],
            textColor=colors.HexColor(f"#{accent}"),
            fontName="Times-Bold",
        )
        body_style = ParagraphStyle(
            "LetterBody",
            parent=styles["BodyText"],
            fontName="Times-Roman",
            fontSize=10,
            leading=15,
            spaceAfter=8,
        )
        story = [Paragraph(escape(clean_name), title_style), Spacer(1, 8)]
        story.extend(
            Paragraph(escape(paragraph), body_style)
            for paragraph in clean_content.splitlines()
            if paragraph.strip()
        )
        result = BytesIO()
        document = SimpleDocTemplate(
            result,
            pagesize=A4,
            rightMargin=22 * mm,
            leftMargin=22 * mm,
            topMargin=20 * mm,
            bottomMargin=20 * mm,
        )
        document.build(story)
    result.seek(0)
    return result
