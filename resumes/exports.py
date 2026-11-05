import json
import re
import unicodedata
from io import BytesIO
from xml.sax.saxutils import escape

from django.forms.models import model_to_dict
from docx import Document
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
    TEMPLATE_CATALOG,
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
        values.extend(resume.links.get(key, "") for key in ("linkedin", "github", "portfolio"))
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


# ---------------------------------------------------------------------------
# DOCX: mirrors the on-screen preview (ResumeDocument.tsx / ResumeDocument.css).
# ---------------------------------------------------------------------------

INK = "1A202C"
MUTED = "4A5568"
RULE = "D6DBE2"
# Sections that move into the side column on sidebar and split layouts (ASIDE_KEYS).
ASIDE_TITLES = {"Skills", "Education", "Certifications"}


def split_skills(text):
    """Python twin of splitSkills() in src/components/resume/resumeUtils.ts."""
    items, current, depth = [], "", 0
    for char in text:
        if char in "([":
            depth += 1
        if char in ")]":
            depth = max(0, depth - 1)
        if depth == 0 and char in ",;\n|":
            items.append(current)
            current = ""
        else:
            current += char
    items.append(current)
    return [item.strip().lstrip("•-*·").strip() for item in items if item.strip().lstrip("•-*·").strip()]


def _blend(accent, amount):
    """Mix accent with white, like color-mix(in srgb, accent amount%, #fff)."""
    channels = [int(accent[i : i + 2], 16) for i in (0, 2, 4)]
    return "".join(f"{round(255 + (c - 255) * amount):02X}" for c in channels)


def _on_accent(accent):
    red, green, blue = (int(accent[i : i + 2], 16) for i in (0, 2, 4))
    return "111827" if (red * 299 + green * 587 + blue * 114) / 1000 > 150 else "FFFFFF"


def _border(element_pr, tag, sides, color, size=6, space=1):
    borders = OxmlElement(tag)
    for side in sides:
        edge = OxmlElement(f"w:{side}")
        edge.set(qn("w:val"), "single")
        edge.set(qn("w:sz"), str(size))
        edge.set(qn("w:space"), str(space))
        edge.set(qn("w:color"), color)
        borders.append(edge)
    element_pr.append(borders)


def _shade(element_pr, fill):
    shading = OxmlElement("w:shd")
    shading.set(qn("w:val"), "clear")
    shading.set(qn("w:color"), "auto")
    shading.set(qn("w:fill"), fill)
    element_pr.append(shading)


def _para(container, text, font, *, size=10, color=INK, bold=False, align=None, before=0, after=4):
    paragraph = container.add_paragraph()
    if align is not None:
        paragraph.alignment = align
    fmt = paragraph.paragraph_format
    fmt.space_before, fmt.space_after, fmt.line_spacing = Pt(before), Pt(after), 1.15
    lines = str(text).split("\n")
    for index, line in enumerate(lines):
        run = paragraph.add_run(line)
        set_docx_font(run, font)
        run.font.size, run.font.bold = Pt(size), bold
        run.font.color.rgb = RGBColor.from_string(color)
        if index < len(lines) - 1:
            run.add_break()
    return paragraph


def _first_para(cell, *args, **kwargs):
    """Write into a table cell's built-in empty paragraph instead of adding a blank line."""
    paragraph = _para(cell, *args, **kwargs)
    first = cell.paragraphs[0]
    if first is not paragraph and not first.text:
        first._p.getparent().remove(first._p)
    return paragraph


class _Style:
    def __init__(self, layout, accent, font):
        self.layout, self.font = layout, font
        self.accent = INK if layout == "ats" else accent
        self.soft = _blend(self.accent, 0.07)
        self.compact = layout == "compact"
        self.base = 9.5 if self.compact else 10


def _heading(container, title, st, *, on_accent=None):
    color = on_accent or st.accent
    p = _para(container, title.upper(), st.font, size=8.5, color=color, bold=True, before=10, after=4)
    p.paragraph_format.keep_with_next = True
    ppr = p._p.get_or_add_pPr()
    if on_accent:
        _border(ppr, "w:pBdr", ["bottom"], on_accent, size=4, space=2)
    elif st.layout == "modern":
        _border(ppr, "w:pBdr", ["left"], st.accent, size=18, space=6)
    elif st.layout == "compact":
        _border(ppr, "w:pBdr", ["left"], st.accent, size=18, space=4)
        _shade(ppr, st.soft)
    elif st.layout in {"classic", "banner", "ats"}:
        _border(ppr, "w:pBdr", ["bottom"], INK if st.layout == "ats" else RULE, size=4, space=2)
    return p


def _section(container, title, text, st, *, on_accent=None, column=False):
    p_head = _heading(container, title, st, on_accent=on_accent)
    color = on_accent or INK
    if title == "Skills":
        skills = split_skills(text)
        if st.layout == "ats":
            body = _para(container, ", ".join(skills), st.font, size=st.base, color=color)
        elif column:
            body = None
            for skill in skills:
                body = _para(container, f"• {skill}", st.font, size=st.base - 0.5, color=color, after=1)
        else:
            body = _para(container, "   •   ".join(skills), st.font, size=st.base, color=color)
    else:
        body = _para(container, text, st.font, size=st.base, color=color)
    if st.layout == "timeline" and not on_accent:
        for p in (p_head, body):
            if p is not None:
                p.paragraph_format.left_indent = Inches(0.2)
                _border(p._p.get_or_add_pPr(), "w:pBdr", ["left"], RULE, size=12, space=10)
    return body


def _identity(container, resume, st, *, align=None, name_color=None, text_color=None, first=False):
    write = _first_para if first else _para
    name_size = 20 if st.compact else 24
    color = name_color or (st.accent if st.layout in {"modern", "sidebar-right", "split", "timeline"} else INK)
    write(container, _clean(resume.name) or "Your Name", st.font, size=name_size, color=color,
          bold=True, align=align, after=2)
    if _clean(resume.headline):
        _para(container, _clean(resume.headline), st.font, size=11, color=text_color or MUTED,
              align=align, after=3)


def _contact_line(container, resume, st, *, align=None, color=None, after=6):
    if _contact(resume):
        return _para(container, "   ·   ".join(_contact_items(resume)), st.font, size=8.5,
                     color=color or MUTED, align=align, after=after)
    return None


def _table(document, widths):
    table = document.add_table(rows=1, cols=len(widths))
    table.autofit = False
    tbl_pr = table._tbl.tblPr
    layout = OxmlElement("w:tblLayout")
    layout.set(qn("w:type"), "fixed")
    tbl_pr.append(layout)
    for cell, width in zip(table.rows[0].cells, widths):
        cell.width = Inches(width)
        margins = OxmlElement("w:tcMar")
        for side in ("top", "left", "bottom", "right"):
            edge = OxmlElement(f"w:{side}")
            edge.set(qn("w:w"), "200")
            edge.set(qn("w:type"), "dxa")
            margins.append(edge)
        cell._tc.get_or_add_tcPr().append(margins)
    return table.rows[0].cells


def _rule_after(paragraph, color, size):
    if paragraph is not None:
        _border(paragraph._p.get_or_add_pPr(), "w:pBdr", ["bottom"], color, size=size, space=8)


def export_docx(resume, accent_color=None):
    from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
    from docx.enum.text import WD_ALIGN_PARAGRAPH

    document = Document()
    page = document.sections[0]
    page.page_width, page.page_height = Inches(8.27), Inches(11.69)
    page.top_margin = page.bottom_margin = Inches(0.55)
    page.left_margin = page.right_margin = Inches(0.6)
    content_width = 8.27 - 1.2

    template = next((t for t in TEMPLATE_CATALOG if t["id"] == resume.template), TEMPLATE_CATALOG[0])
    accent, font = resolve_export_style(resume.template, accent_color or resume.accent_color)
    st = _Style(template["layout"], accent, font)
    sections = _sections(resume)
    aside = [s for s in sections if s[0] in ASIDE_TITLES]
    main = [s for s in sections if s[0] not in ASIDE_TITLES]
    center = WD_ALIGN_PARAGRAPH.CENTER

    if st.layout in {"sidebar-left", "sidebar-right"}:
        side_w = round(content_width * 0.33, 2)
        widths = [side_w, content_width - side_w]
        if st.layout == "sidebar-right":
            widths.reverse()
        cells = _table(document, widths)
        side, body = (cells[0], cells[1]) if st.layout == "sidebar-left" else (cells[1], cells[0])
        on = _on_accent(st.accent) if st.layout == "sidebar-left" else None
        _shade(side._tc.get_or_add_tcPr(), st.accent if on else st.soft)
        if not on:
            _border(side._tc.get_or_add_tcPr(), "w:tcBorders", ["left"], RULE, size=4)
        for cell in cells:
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP
        items = _contact_items(resume)
        _first_para(side, "\n".join(items) or " ", st.font, size=8.5, color=on or MUTED, after=6)
        for title, text in aside:
            _section(side, title, text, st, on_accent=on, column=True)
        _identity(body, resume, st, first=True)
        _rule_after(body.paragraphs[-1], RULE, 4)
        for title, text in main:
            _section(body, title, text, st)
    else:
        if st.layout == "banner":
            (cell,) = _table(document, [content_width])
            on = _on_accent(st.accent)
            _shade(cell._tc.get_or_add_tcPr(), st.accent)
            _identity(cell, resume, st, name_color=on, text_color=on, first=True)
            _contact_line(cell, resume, st, color=on, after=2)
            _para(document, "", st.font, size=4, after=2)
        elif st.layout == "framed":
            first = _para(document, "", st.font, size=2, after=10)
            _border(first._p.get_or_add_pPr(), "w:pBdr", ["top"], st.accent, size=48, space=0)
            left, right = _table(document, [content_width * 0.6, content_width * 0.4])
            _identity(left, resume, st, name_color=st.accent, first=True)
            items = _contact_items(resume)
            _first_para(right, "\n".join(items) or " ", st.font, size=8.5, color=MUTED,
                        align=WD_ALIGN_PARAGRAPH.RIGHT)
            right.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.BOTTOM
            _rule_after(_para(document, "", st.font, size=2, after=6), RULE, 4)
        else:
            align = center if st.layout == "classic" else None
            _identity(document, resume, st, align=align)
            line = _contact_line(document, resume, st, align=align, after=8)
            rule = {"classic": (st.accent, 12), "split": (st.accent, 18), "ats": (INK, 4)}.get(
                st.layout, (RULE, 4) if st.layout in {"modern", "compact"} else None
            )
            if rule:
                _rule_after(line or document.paragraphs[-1], *rule)

        if st.layout == "split":
            body, side = _table(document, [round(content_width * 0.655, 2), round(content_width * 0.345, 2)])
            _shade(side._tc.get_or_add_tcPr(), st.soft)
            _border(side._tc.get_or_add_tcPr(), "w:tcBorders", ["top", "left", "bottom", "right"], RULE, 4)
            body.vertical_alignment = side.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP
            first = True
            for title, text in main:
                _section(body, title, text, st)
                if first:
                    body.paragraphs[0]._p.getparent().remove(body.paragraphs[0]._p)
                    first = False
            first = True
            for title, text in aside:
                _section(side, title, text, st, column=True)
                if first:
                    side.paragraphs[0]._p.getparent().remove(side.paragraphs[0]._p)
                    first = False
        else:
            for title, text in sections:
                _section(document, title, text, st)

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
    return BytesIO(json.dumps(data, ensure_ascii=False, indent=2, default=_clean).encode("utf-8"))


def export_txt(resume):
    lines = [_clean(resume.name), _contact(resume)]
    if _clean(resume.headline):
        lines.append(_clean(resume.headline))
    for title, text in _sections(resume):
        lines.extend(("", title.upper(), text))
    return BytesIO("\n".join(lines).encode("utf-8"))
