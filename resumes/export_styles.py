import json
from pathlib import Path

from docx.oxml import OxmlElement
from docx.oxml.ns import qn


BASE_DIR = Path(__file__).resolve().parents[1]
TEMPLATE_CATALOG = json.loads((BASE_DIR / "shared" / "templates.json").read_text(encoding="utf-8"))
TEMPLATE_COLORS = {
    template["id"]: template["colors"][0].removeprefix("#").upper() for template in TEMPLATE_CATALOG
}
ALLOWED_COLORS = {
    color.removeprefix("#").upper() for template in TEMPLATE_CATALOG for color in template["colors"]
}
DEFAULT_ACCENT = TEMPLATE_COLORS["template1"]


# New layouts use the closest existing layout for the Word export, which cannot
# reproduce every on-screen effect anyway.
LAYOUT_BASE = {
    "minimal": "classic",
    "bold": "modern",
    "elegant": "classic",
    "tech": "compact",
    "ribbon": "banner",
}


def base_layout(layout):
    return LAYOUT_BASE.get(layout, layout)


class UnsupportedPdfLanguageError(ValueError):
    pass


def resolve_export_style(template_id, accent_color=None):
    template = next(
        (item for item in TEMPLATE_CATALOG if item["id"] == template_id),
        TEMPLATE_CATALOG[0],
    )
    default_color = template["colors"][0].removeprefix("#").upper()
    selected_color = accent_color.removeprefix("#").upper() if isinstance(accent_color, str) else ""
    accent = selected_color if selected_color in ALLOWED_COLORS else default_color
    font = "Georgia" if template["font"] == "serif" else "Arial"
    return accent, font


def set_docx_font(run, font):
    run.font.name = font
    run_properties = run._element.get_or_add_rPr()
    fonts = run_properties.rFonts
    if fonts is None:
        fonts = OxmlElement("w:rFonts")
        run_properties.insert(0, fonts)
    fonts.set(qn("w:eastAsia"), font)
    fonts.set(qn("w:cs"), font)


def ensure_pdf_text_supported(*values):
    if any(ord(character) > 255 for value in values for character in value):
        raise UnsupportedPdfLanguageError("Use the Download PDF button for this language.")
