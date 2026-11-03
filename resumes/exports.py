import json
import re
from io import BytesIO
from xml.sax.saxutils import escape

from django.forms.models import model_to_dict
from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_ROW_HEIGHT_RULE
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


# Default accent colours for the 20 templates. Keep in sync with
# src/components/resume/templateCatalog.ts (professional palette only).
DEFAULT_ACCENT = "1F3A5F"

TEMPLATE_COLORS = {
    "template1": "1F3A5F",
    "template2": "2D3436",
    "template3": "1F3A5F",
    "template4": "4A5568",
    "template5": "1F3A5F",
    "template6": "2D3436",
    "template7": "4A5568",
    "template8": "1F3A5F",
    "template9": "1F3A5F",
    "template10": "2D3436",
    "template11": "2F5D8A",
    "template12": "1F3A5F",
    "template13": "2D3436",
    "template14": "4A5568",
    "template15": "2F5D8A",
    "template16": "4A5568",
    "template17": "111111",
    "template18": "111111",
    "template19": "1F3A5F",
    "template20": "2D3436",
}


def _clean(value):
    if not isinstance(value, str):
        return value
    return re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", value).strip()


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


def _layout(resume):
    try:
        number = int(resume.template.removeprefix("template"))
    except (AttributeError, ValueError):
        number = 1
    layouts = {
        1: "classic", 2: "classic", 3: "modern", 4: "modern",
        5: "sidebar-left", 6: "sidebar-left", 7: "sidebar-right", 8: "sidebar-right",
        9: "banner", 10: "banner", 11: "split", 12: "split",
        13: "compact", 14: "compact", 15: "timeline", 16: "timeline",
        17: "ats", 18: "ats", 19: "framed", 20: "framed",
    }
    return layouts.get(number, "classic")


def _accent(resume, accent_color=None):
    if _layout(resume) == "ats":
        return "111111"
    if isinstance(accent_color, str) and re.fullmatch(r"#[0-9a-fA-F]{6}", accent_color):
        return accent_color[1:].upper()
    return TEMPLATE_COLORS.get(resume.template, DEFAULT_ACCENT)


def _serif(resume):
    try:
        number = int(resume.template.removeprefix("template"))
    except (AttributeError, ValueError):
        return False
    return number in {1, 4, 6, 8, 10, 12, 14, 16, 18, 20}


def _contact_items(resume):
    values = [resume.email, resume.phone, resume.location]
    if isinstance(resume.links, dict):
        values.extend(resume.links.get(key, "") for key in ("linkedin", "github", "portfolio"))
    return [_clean(value) for value in values if _clean(value)]


def _split_sections(resume):
    sections = _sections(resume)
    aside_names = {"Skills", "Education", "Certifications"}
    aside = [item for item in sections if item[0] in aside_names]
    main = [item for item in sections if item[0] not in aside_names]
    return main, aside


def _contact(resume):
    return " | ".join(_contact_items(resume))


def _sanitize(value):
    if isinstance(value, str):
        return _clean(value)
    if isinstance(value, list):
        return [_sanitize(item) for item in value]
    if isinstance(value, dict):
        return {key: _sanitize(item) for key, item in value.items()}
    return value


def _shade_cell(cell, fill):
    shading = OxmlElement("w:shd")
    shading.set(qn("w:fill"), fill)
    cell._tc.get_or_add_tcPr().append(shading)


def _remove_table_borders(table):
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        border = OxmlElement(f"w:{edge}")
        border.set(qn("w:val"), "nil")
        borders.append(border)
    table._tbl.tblPr.append(borders)


def _set_cell_margins(cell, top=180, start=180, bottom=180, end=180):
    tc_pr = cell._tc.get_or_add_tcPr()
    margins = tc_pr.first_child_found_in("w:tcMar")
    if margins is None:
        margins = OxmlElement("w:tcMar")
        tc_pr.append(margins)
    for edge, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = margins.find(qn(f"w:{edge}"))
        if node is None:
            node = OxmlElement(f"w:{edge}")
            margins.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def _docx_paragraph(container, text="", *, size=10, color="1A202C", bold=False, align=None,
                    font="Arial", before=0, after=4):
    existing = getattr(container, "paragraphs", ())
    if getattr(container, "_tc", None) is not None and len(existing) == 1 and not existing[0].text and not existing[0].runs:
        paragraph = existing[0]
    else:
        paragraph = container.add_paragraph()
    if align is not None:
        paragraph.alignment = align
    paragraph.paragraph_format.space_before = Pt(before)
    paragraph.paragraph_format.space_after = Pt(after)
    paragraph.paragraph_format.line_spacing = 1.08
    run = paragraph.add_run(str(text))
    run.font.name = font
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = RGBColor.from_string(color)
    return paragraph


def _docx_heading_rule(paragraph, color):
    p_pr = paragraph._p.get_or_add_pPr()
    borders = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), "6")
    bottom.set(qn("w:space"), "3")
    bottom.set(qn("w:color"), color)
    borders.append(bottom)
    p_pr.append(borders)


def _docx_identity(container, resume, accent, font, *, centered=False, inverse=False, contact=True):
    on_accent = "FFFFFF" if inverse else "1A202C"
    alignment = WD_ALIGN_PARAGRAPH.CENTER if centered else None
    _docx_paragraph(
        container, _clean(resume.name) or "Your Name", size=22, color=on_accent,
        bold=True, align=alignment, font=font, after=2,
    )
    if _clean(resume.job_title_target):
        _docx_paragraph(
            container, _clean(resume.job_title_target), size=10,
            color="E8EEF6" if inverse else "4A5568", align=alignment, font=font, after=4,
        )
    contact_color = "F0F4F8" if inverse else "4A5568"
    if contact and _contact(resume):
        _docx_paragraph(
            container, _contact(resume), size=8.5, color=contact_color,
            align=alignment, font=font, after=0,
        )


def _docx_sections(
    container, sections, accent, font, *, aside=False, dark_aside=False,
    compact=False, timeline=False, underlined_heading=False,
):
    for title, text in sections:
        heading_color = "FFFFFF" if dark_aside else accent
        heading = _docx_paragraph(
            container, f"•  {title}" if timeline else title.upper(),
            size=8 if compact else 9, color=heading_color, bold=True, font=font,
            before=7 if compact else 11, after=3,
        )
        if underlined_heading:
            _docx_heading_rule(heading, heading_color)
        _docx_paragraph(
            container, text.replace(",", " · ") if title == "Skills" else text,
            size=9 if compact else 10,
            color="F7FAFC" if dark_aside else "1A202C",
            font=font, after=2,
        )


def export_docx(resume, accent_color=None):
    document = Document()
    page = document.sections[0]
    page.page_width = Inches(8.27)
    page.page_height = Inches(11.69)
    page.top_margin = Inches(0.55)
    page.bottom_margin = Inches(0.55)
    page.left_margin = Inches(0.6)
    page.right_margin = Inches(0.6)
    accent = _accent(resume, accent_color)
    layout = _layout(resume)
    font = "Georgia" if _serif(resume) else "Arial"
    main, aside = _split_sections(resume)

    if layout == "banner":
        banner = document.add_table(rows=1, cols=1)
        _remove_table_borders(banner)
        cell = banner.cell(0, 0)
        _shade_cell(cell, accent)
        _set_cell_margins(cell, top=320, start=360, bottom=320, end=360)
        _docx_identity(cell, resume, accent, font, inverse=True)
        _docx_sections(document, _sections(resume), accent, font)
    elif layout in {"sidebar-left", "sidebar-right", "split"}:
        if layout == "split":
            _docx_identity(document, resume, accent, font)
        columns = document.add_table(rows=1, cols=2)
        _remove_table_borders(columns)
        columns.autofit = False
        left, right = columns.rows[0].cells
        if layout == "sidebar-left":
            column_widths = (2.33, 4.74)
        elif layout == "sidebar-right":
            column_widths = (4.74, 2.33)
        else:
            column_widths = (4.55, 2.52)
        for column, width in zip(columns.columns, column_widths):
            column.width = Inches(width)
        left.width, right.width = (Inches(width) for width in column_widths)
        left.vertical_alignment = right.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP
        _set_cell_margins(left, top=300, start=230, bottom=250, end=230)
        _set_cell_margins(right, top=250, start=300, bottom=250, end=300)

        if layout == "sidebar-left":
            sidebar, content = left, right
            _shade_cell(sidebar, accent)
            _docx_identity(content, resume, accent, font, contact=False)
            _docx_sections(sidebar, [("Contact", _contact(resume))] if _contact(resume) else [], accent, font, aside=True, dark_aside=True)
            _docx_sections(sidebar, aside, accent, font, aside=True, dark_aside=True)
            _docx_sections(content, main, accent, font)
        elif layout == "sidebar-right":
            content, sidebar = left, right
            _shade_cell(sidebar, "EEF1F5")
            _docx_identity(content, resume, accent, font, contact=False)
            _docx_sections(content, main, accent, font)
            if _contact(resume):
                _docx_sections(sidebar, [("Contact", _contact(resume))], accent, font, aside=True)
            _docx_sections(sidebar, aside, accent, font, aside=True)
        else:
            _docx_sections(left, main, accent, font)
            _shade_cell(right, "F1F4F8")
            _docx_sections(right, aside, accent, font, aside=True)
    else:
        if layout == "framed":
            rule = document.add_table(rows=1, cols=1)
            _remove_table_borders(rule)
            rule.autofit = False
            rule.columns[0].width = Inches(7.07)
            _shade_cell(rule.cell(0, 0), accent)
            _set_cell_margins(rule.cell(0, 0), top=0, start=0, bottom=0, end=0)
            rule.rows[0].height = Pt(6)
            rule.rows[0].height_rule = WD_ROW_HEIGHT_RULE.EXACTLY

            header = document.add_table(rows=1, cols=2)
            _remove_table_borders(header)
            header.autofit = False
            identity_cell, contact_cell = header.rows[0].cells
            identity_cell.width = Inches(4.8)
            contact_cell.width = Inches(2.27)
            _set_cell_margins(identity_cell, top=150, start=0, bottom=120, end=100)
            _set_cell_margins(contact_cell, top=150, start=100, bottom=120, end=0)
            _docx_identity(identity_cell, resume, accent, font, contact=False)
            for value in _contact_items(resume):
                _docx_paragraph(
                    contact_cell, value, size=8.5, color="4A5568",
                    align=WD_ALIGN_PARAGRAPH.RIGHT, font=font, after=2,
                )
            header.rows[0].cells[0].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.BOTTOM
            header.rows[0].cells[1].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.BOTTOM
            document.add_paragraph().paragraph_format.space_after = Pt(0)
        else:
            _docx_identity(
                document, resume, accent, font,
                centered=layout == "classic",
            )
        _docx_sections(
            document, _sections(resume), accent, font,
            compact=layout == "compact", timeline=layout == "timeline",
            underlined_heading=layout in {"classic", "framed", "ats"},
        )

    buffer = BytesIO()
    document.save(buffer)
    buffer.seek(0)
    return buffer


def _pdf_styles(accent, font, layout):
    styles = getSampleStyleSheet()
    family = "Times-Roman" if font == "Georgia" else "Helvetica"
    bold_family = "Times-Bold" if font == "Georgia" else "Helvetica-Bold"
    compact = layout == "compact"
    ats = layout == "ats"
    ink = colors.HexColor("#111111" if ats else "#1A202C")
    accent_color = colors.HexColor(f"#{accent}")
    name_style = ParagraphStyle(
        "ResumeNameExport",
        parent=styles["Title"],
        fontName=bold_family,
        fontSize=19 if compact else 22,
        leading=23 if compact else 26,
        textColor=colors.white if layout == "banner" else accent_color if layout in {"modern", "split", "sidebar-right"} else ink,
        alignment=TA_CENTER if layout == "classic" else TA_LEFT,
        spaceAfter=3,
    )
    headline_style = ParagraphStyle(
        "ResumeHeadlineExport",
        parent=styles["Normal"],
        fontName=family,
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#E8EEF6") if layout == "banner" else colors.HexColor("#4A5568"),
    )
    contact_style = ParagraphStyle(
        "ResumeContactExport",
        parent=styles["Normal"],
        fontName=family,
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#F0F4F8") if layout == "banner" else colors.HexColor("#4A5568"),
        alignment=TA_CENTER if layout == "classic" else TA_LEFT,
    )
    heading_style = ParagraphStyle(
        "ResumeSectionExport",
        parent=styles["Heading2"],
        fontName=bold_family,
        fontSize=8 if compact else 9,
        leading=11,
        textColor=ink if ats else accent_color,
        spaceBefore=8 if compact else 12,
        spaceAfter=3,
    )
    body_style = ParagraphStyle(
        "ResumeBodyExport",
        parent=styles["BodyText"],
        fontName=family,
        fontSize=8.5 if compact else 9.5,
        leading=11 if compact else 13,
        textColor=ink,
        spaceAfter=3,
    )
    aside_heading_style = ParagraphStyle(
        "ResumeAsideHeadingExport", parent=heading_style,
        textColor=accent_color,
    )
    aside_body_style = ParagraphStyle(
        "ResumeAsideBodyExport", parent=body_style,
        textColor=ink,
    )
    dark_aside_heading_style = ParagraphStyle(
        "ResumeDarkAsideHeadingExport", parent=aside_heading_style, textColor=colors.white,
    )
    dark_aside_body_style = ParagraphStyle(
        "ResumeDarkAsideBodyExport", parent=aside_body_style, textColor=colors.white,
    )
    return {
        "name": name_style,
        "headline": headline_style,
        "contact": contact_style,
        "heading": heading_style,
        "body": body_style,
        "aside_heading": aside_heading_style,
        "aside_body": aside_body_style,
        "dark_aside_heading": dark_aside_heading_style,
        "dark_aside_body": dark_aside_body_style,
        "family": family,
        "bold_family": bold_family,
        "accent": accent_color,
    }


def _pdf_paragraph(text, style):
    return Paragraph(escape(str(text)).replace("\n", "<br/>"), style)


def _pdf_identity(resume, styles, *, contact=True):
    result = [_pdf_paragraph(_clean(resume.name) or "Your Name", styles["name"])]
    if _clean(resume.job_title_target):
        result.append(_pdf_paragraph(_clean(resume.job_title_target), styles["headline"]))
    if contact and _contact(resume):
        result.append(_pdf_paragraph(_contact(resume), styles["contact"]))
    return result


def _pdf_sections(sections, styles, *, aside=False, dark_aside=False, timeline=False):
    result = []
    heading_style = (
        styles["dark_aside_heading"] if dark_aside
        else styles["aside_heading"] if aside
        else styles["heading"]
    )
    body_style = (
        styles["dark_aside_body"] if dark_aside
        else styles["aside_body"] if aside
        else styles["body"]
    )
    for title, text in sections:
        label = f"●  {title}" if timeline else title.upper()
        result.extend([
            _pdf_paragraph(label, heading_style),
            _pdf_paragraph(text.replace(",", " · ") if title == "Skills" else text, body_style),
        ])
    return result


def export_pdf(resume, accent_color=None):
    accent = _accent(resume, accent_color)
    layout = _layout(resume)
    styles = _pdf_styles(accent, "Georgia" if _serif(resume) else "Arial", layout)
    main, aside = _split_sections(resume)
    story = []

    if layout == "banner":
        banner = Table([[_pdf_identity(resume, styles)]], colWidths=[174 * mm])
        banner.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), styles["accent"]),
            ("TEXTCOLOR", (0, 0), (-1, -1), colors.white),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ("TOPPADDING", (0, 0), (-1, -1), 13),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 13),
        ]))
        story.extend([banner, Spacer(1, 8)])
        story.extend(_pdf_sections(_sections(resume), styles))
    elif layout in {"sidebar-left", "sidebar-right", "split"}:
        left_width, right_width = (57 * mm, 117 * mm) if layout != "split" else (112 * mm, 62 * mm)
        if layout == "sidebar-left":
            aside_content = _pdf_sections(aside, styles, aside=True, dark_aside=True)
            if _contact(resume):
                aside_content.insert(0, _pdf_paragraph(_contact(resume), styles["dark_aside_body"]))
            main_content = _pdf_identity(resume, styles, contact=False) + _pdf_sections(main, styles)
            row = [aside_content, main_content]
            widths = [left_width, right_width]
            aside_fill = styles["accent"]
        elif layout == "sidebar-right":
            main_content = _pdf_identity(resume, styles, contact=False) + _pdf_sections(main, styles)
            aside_content = _pdf_sections(aside, styles, aside=True)
            if _contact(resume):
                aside_content.insert(0, _pdf_paragraph(_contact(resume), styles["aside_body"]))
            row = [main_content, aside_content]
            widths = [right_width, left_width]
            aside_fill = colors.HexColor("#EEF1F5")
        else:
            story.extend(_pdf_identity(resume, styles))
            row = [_pdf_sections(main, styles), _pdf_sections(aside, styles, aside=True)]
            widths = [left_width, right_width]
            aside_fill = colors.HexColor("#F1F4F8")
        columns = Table([row], colWidths=widths, splitInRow=1, hAlign="LEFT")
        if layout == "sidebar-left":
            aside_column = 0
        else:
            aside_column = 1
        columns.setStyle(TableStyle([
            ("BACKGROUND", (aside_column, 0), (aside_column, -1), aside_fill),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 9),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
        ]))
        story.append(columns)
    else:
        if layout == "framed":
            story.append(HRFlowable(width="100%", thickness=6, color=styles["accent"], spaceAfter=10))
            identity = _pdf_identity(resume, styles, contact=False)
            contact_items = [_pdf_paragraph(value, styles["contact"]) for value in _contact_items(resume)]
            header = Table([[identity, contact_items]], colWidths=[110 * mm, 64 * mm])
            header.setStyle(TableStyle([
                ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
                ("ALIGN", (1, 0), (1, 0), "RIGHT"),
                ("LINEBELOW", (0, 0), (-1, -1), 0.7, colors.HexColor("#D6DBE2")),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ]))
            story.extend([header, Spacer(1, 5)])
        else:
            header = _pdf_identity(resume, styles)
            if layout == "classic":
                story.extend(header)
                story.append(HRFlowable(width="100%", thickness=1.5, color=styles["accent"], spaceAfter=5))
            else:
                story.extend(header)
                if layout in {"modern", "ats"}:
                    story.append(HRFlowable(
                        width="100%", thickness=1 if layout == "modern" else 0.8,
                        color=styles["accent"], spaceAfter=5,
                    ))
        story.extend(_pdf_sections(
            _sections(resume), styles, timeline=layout == "timeline"
        ))

    buffer = BytesIO()
    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=13 * mm,
        bottomMargin=13 * mm,
        title=_clean(resume.title) or f"{_clean(resume.name)} Resume",
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
    buffer = BytesIO(
        json.dumps(data, ensure_ascii=False, indent=2, default=_clean).encode("utf-8")
    )
    return buffer


def export_txt(resume):
    lines = [_clean(resume.name), _contact(resume)]
    if _clean(resume.job_title_target):
        lines.append(_clean(resume.job_title_target))
    for title, text in _sections(resume):
        lines.extend(("", title.upper(), text))
    return BytesIO("\n".join(lines).encode("utf-8"))
