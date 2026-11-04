import json
import re
import unicodedata
from io import BytesIO
from xml.sax.saxutils import escape

from django.forms.models import model_to_dict
from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

from .export_styles import (
    TEMPLATE_COLORS as TEMPLATE_COLORS,
    ensure_pdf_text_supported,
    resolve_export_style,
    set_docx_font,
)


def _clean(value):
    if value is None:
        return ""
    text = value if isinstance(value, str) else str(value)
    return re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text).strip()


def safe_filename(name, suffix):
    ascii_name = unicodedata.normalize("NFKD", str(name)).encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^A-Za-z0-9]+", "_", ascii_name).strip("_")
    return f"{slug or 'resume'}_{suffix}"


def _sections(resume):
    if resume.user_type == "school":
        sections = [
            ("Career Objective", resume.summary),
            ("Education", resume.education),
            ("Skills", resume.skills),
            ("Achievements / Activities", resume.achievements),
        ]
    elif resume.user_type == "college":
        sections = [
            ("Career Objective", resume.summary),
            ("Education", resume.education),
            ("Skills", resume.skills),
            ("Projects", resume.projects),
            ("Internships", resume.internships),
            ("Certifications", resume.certifications),
            ("Achievements", resume.achievements),
        ]
    else:
        sections = [
            ("Professional Summary", resume.summary),
            ("Experience", resume.experience),
            ("Skills", resume.skills),
            ("Certifications", resume.certifications),
            ("Education", resume.education),
            ("Projects", resume.projects),
        ]
    return [(heading, _clean(text)) for heading, text in sections if _clean(text)]


def _contact_items(resume):
    values = [resume.email, resume.phone, resume.location]
    if isinstance(resume.links, dict):
        values.extend(
            resume.links.get(key, "")
            for key in ("linkedin", "github", "portfolio")
        )
    return [_clean(value) for value in values if _clean(value)]


def _contact(resume):
    return " | ".join(_contact_items(resume))


def _accent(resume, accent_color=None):
    accent, _font = resolve_export_style(resume.template, accent_color or resume.accent_color)
    return accent


def _sanitize(value):
    if isinstance(value, str):
        return _clean(value)
    if isinstance(value, list):
        return [_sanitize(item) for item in value]
    if isinstance(value, dict):
        return {key: _sanitize(item) for key, item in value.items()}
    return value


def _docx_paragraph(
    document,
    text,
    font,
    *,
    size=10,
    color="1A202C",
    bold=False,
    alignment=None,
    before=0,
    after=4,
):
    paragraph = document.add_paragraph()
    if alignment is not None:
        paragraph.alignment = alignment
    paragraph.paragraph_format.space_before = Pt(before)
    paragraph.paragraph_format.space_after = Pt(after)
    paragraph.paragraph_format.line_spacing = 1.08
    run = paragraph.add_run(str(text))
    set_docx_font(run, font)
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = RGBColor.from_string(color)
    return paragraph


def _docx_sections(document, sections, accent, font):
    for title, text in sections:
        heading = _docx_paragraph(
            document,
            title.upper(),
            font,
            size=9,
            color=accent,
            bold=True,
            before=10,
            after=3,
        )
        borders = OxmlElement("w:pBdr")
        bottom = OxmlElement("w:bottom")
        bottom.set(qn("w:val"), "single")
        bottom.set(qn("w:sz"), "5")
        bottom.set(qn("w:space"), "3")
        bottom.set(qn("w:color"), accent)
        borders.append(bottom)
        heading._p.get_or_add_pPr().append(borders)
        _docx_paragraph(document, text, font, size=10, after=4)


def export_docx(resume, accent_color=None):
    document = Document()
    page = document.sections[0]
    page.page_width = Inches(8.27)
    page.page_height = Inches(11.69)
    page.top_margin = Inches(0.6)
    page.bottom_margin = Inches(0.6)
    page.left_margin = Inches(0.65)
    page.right_margin = Inches(0.65)
    accent, font = resolve_export_style(
        resume.template,
        accent_color or resume.accent_color,
    )

    _docx_paragraph(
        document,
        _clean(resume.name) or "Your Name",
        font,
        size=22,
        color=accent,
        bold=True,
        after=2,
    )
    if _clean(resume.headline):
        _docx_paragraph(
            document,
            _clean(resume.headline),
            font,
            size=10,
            color="4A5568",
            after=4,
        )
    if _contact(resume):
        _docx_paragraph(document, _contact(resume), font, size=8.5, color="4A5568", after=8)
    _docx_sections(document, _sections(resume), accent, font)

    buffer = BytesIO()
    document.save(buffer)
    buffer.seek(0)
    return buffer


def _pdf_paragraph(text, style):
    return Paragraph(escape(str(text)).replace("\n", "<br/>"), style)


def export_pdf(resume, accent_color=None):
    sections = _sections(resume)
    contact = _contact(resume)
    title = _clean(resume.title) or f"{_clean(resume.name)} Resume"
    ensure_pdf_text_supported(
        _clean(resume.name),
        _clean(resume.headline),
        contact,
        title,
        *(text for _heading, text in sections),
    )
    accent, font = resolve_export_style(
        resume.template,
        accent_color or resume.accent_color,
    )
    family = "Times-Roman" if font == "Georgia" else "Helvetica"
    bold_family = "Times-Bold" if font == "Georgia" else "Helvetica-Bold"
    styles = getSampleStyleSheet()
    name_style = ParagraphStyle(
        "ResumeNameExport",
        parent=styles["Title"],
        fontName=bold_family,
        fontSize=22,
        leading=26,
        textColor=colors.HexColor(f"#{accent}"),
        alignment=TA_LEFT,
        spaceAfter=2,
    )
    headline_style = ParagraphStyle(
        "ResumeHeadlineExport",
        parent=styles["Normal"],
        fontName=family,
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#4A5568"),
        spaceAfter=4,
    )
    contact_style = ParagraphStyle(
        "ResumeContactExport",
        parent=styles["Normal"],
        fontName=family,
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#4A5568"),
        spaceAfter=9,
    )
    heading_style = ParagraphStyle(
        "ResumeSectionHeadingExport",
        parent=styles["Heading2"],
        fontName=bold_family,
        fontSize=9,
        leading=12,
        textColor=colors.HexColor(f"#{accent}"),
        spaceBefore=10,
        spaceAfter=3,
        keepWithNext=True,
    )
    body_style = ParagraphStyle(
        "ResumeBodyExport",
        parent=styles["BodyText"],
        fontName=family,
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#1A202C"),
        spaceAfter=4,
    )
    story = [_pdf_paragraph(_clean(resume.name) or "Your Name", name_style)]
    if _clean(resume.headline):
        story.append(_pdf_paragraph(_clean(resume.headline), headline_style))
    if contact:
        story.append(_pdf_paragraph(contact, contact_style))
    story.append(Spacer(1, 4))
    for section_heading, text in sections:
        story.append(_pdf_paragraph(section_heading.upper(), heading_style))
        story.append(_pdf_paragraph(text, body_style))

    buffer = BytesIO()
    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=13 * mm,
        bottomMargin=13 * mm,
        title=title,
        author=_clean(resume.name),
    )
    document.build(story)
    buffer.seek(0)
    return buffer


def export_json(resume, accent_color=None):
    data = _sanitize(model_to_dict(resume, exclude=("user",)))
    data["created_at"] = resume.created_at.isoformat()
    data["updated_at"] = resume.updated_at.isoformat()
    data["accent_color"] = f"#{_accent(resume, accent_color)}"
    return BytesIO(
        json.dumps(data, ensure_ascii=False, indent=2, default=_clean).encode("utf-8")
    )


def export_txt(resume):
    lines = [_clean(resume.name), _contact(resume)]
    if _clean(resume.headline):
        lines.append(_clean(resume.headline))
    for title, text in _sections(resume):
        lines.extend(("", title.upper(), text))
    return BytesIO("\n".join(lines).encode("utf-8"))
