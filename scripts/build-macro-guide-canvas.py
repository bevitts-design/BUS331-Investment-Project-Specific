#!/usr/bin/env python3
"""Build a Canvas page fragment from the maintained Phase 1 macro guide."""

from pathlib import Path
from urllib.parse import urljoin, urlparse
import re
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "project" / "macro-analysis.html"
OUTPUT = ROOT / "canvas" / "phase-1-macro-step-by-step-page.html"
PUBLIC_GUIDE = (
    "https://bevitts-design.github.io/"
    "BUS331-Investment-Project-Specific/project/macro-analysis.html"
)

BASE_STYLES = {
    "a": "color:#0B625F;text-decoration:underline;",
    "blockquote": "margin:10px 0 0;padding:0;color:#172033;line-height:1.55;",
    "code": "font-family:Menlo,Consolas,monospace;overflow-wrap:anywhere;",
    "h1": "margin:0 0 12px;color:#ffffff;font-size:30px;line-height:1.2;",
    "h2": "margin:0 0 12px;color:#0B1F3A;font-size:23px;line-height:1.3;",
    "h3": "margin:0 0 6px;color:#0B1F3A;font-size:19px;line-height:1.3;",
    "li": "margin:8px 0;",
    "p": "margin:0 0 12px;line-height:1.55;",
    "ul": "margin:8px 0 0;padding-left:24px;",
}

CLASS_STYLES = {
    "page-hero": "background:#0B1F3A;color:#ffffff;border-top:8px solid #C99A2E;padding:26px;border-radius:14px;",
    "eyebrow": "margin:0 0 8px;color:#F1D48E;font-size:13px;font-weight:bold;letter-spacing:.06em;text-transform:uppercase;",
    "macro-guide-actions": "margin:20px 0 0;",
    "button": "display:inline-block;margin:0 10px 8px 0;padding:10px 14px;border-radius:8px;font-weight:bold;text-decoration:none;",
    "button-primary": "background:#C99A2E;color:#0B1F3A;",
    "button-secondary": "background:#ffffff;color:#0B1F3A;",
    "page-shell": "padding:22px 0;",
    "macro-guide-intro": "padding:18px 20px;border:1px solid #D8D2C4;border-radius:12px;background:#F7F4EC;",
    "section-kicker": "margin:0 0 6px;color:#0B625F;font-size:13px;font-weight:bold;letter-spacing:.06em;text-transform:uppercase;",
    "macro-guide-deliverable": "margin:14px 0 0;padding:14px 16px;border-left:6px solid #187C78;background:#ffffff;",
    "callout": "margin:18px 0;padding:16px 18px;border:1px solid #D8D2C4;border-left:6px solid #187C78;border-radius:10px;background:#F7F4EC;",
    "macro-guide-section": "margin:26px 0;",
    "macro-steps": "margin:0;padding:0;",
    "macro-step": "margin:14px 0;padding:18px;border:1px solid #D8D2C4;border-radius:10px;background:#ffffff;",
    "macro-step-tab": "margin:0 0 12px;color:#526071;font-size:14px;font-weight:bold;",
    "macro-step-output": "margin:14px 0 0;padding:10px 12px;border-left:4px solid #187C78;background:#EEF7F5;",
    "macro-guide-example": "margin:14px 0;padding:14px;border-left:4px solid #C99A2E;background:#FFF9EB;",
    "macro-guide-prompt": "margin:14px 0;padding:14px;border-left:4px solid #C99A2E;background:#FFF9EB;",
}


def classes(node):
    return node.get("class", "").split()


def merge_styles(*chunks):
    declarations = {}
    for chunk in chunks:
        for declaration in chunk.split(";"):
            if ":" not in declaration:
                continue
            property_name, value = declaration.split(":", 1)
            declarations[property_name.strip()] = value.strip()
    return ";".join(f"{name}:{value}" for name, value in declarations.items()) + ";"


def simplify_step_headers(root):
    for head in root.iter():
        if "macro-step-head" not in classes(head):
            continue
        number = next((child for child in head if "macro-step-number" in classes(child)), None)
        details = next((child for child in head if child.tag == "div"), None)
        if number is None or details is None:
            raise ValueError("Macro guide step heading is missing its number or text")
        heading = details.find("h3")
        if heading is None:
            raise ValueError("Macro guide step heading has no h3")
        heading.text = f"Step {number.text}: {heading.text or ''}"
        head.remove(number)
        head.remove(details)
        for child in list(details):
            details.remove(child)
            head.append(child)


def remove_jump_navigation(root):
    for parent in root.iter():
        for child in list(parent):
            if child.tag == "nav" and "macro-guide-jump" in classes(child):
                parent.remove(child)


def focus_on_macro_assignment(root):
    """Omit later client-workbook handoffs from this assignment-only Canvas page."""
    removed_callouts = 0
    removed_handoffs = 0
    for parent in root.iter():
        for child in list(parent):
            content = "".join(child.itertext()).strip()
            if "callout" in classes(child) and content.startswith("Two workbooks, two jobs"):
                parent.remove(child)
                removed_callouts += 1
            elif child.tag == "p" and content.startswith("Carry this submitted forecast into Part 2."):
                parent.remove(child)
                removed_handoffs += 1
    if removed_callouts != 1 or removed_handoffs != 1:
        raise ValueError("The Canvas-only client-workbook content has changed")

    old_intro = (
        "This assignment produces one shared 12-month forecast; "
        "the separate client-analysis assignment uses that submitted forecast later."
    )
    replaced_intro = 0
    for node in root.iter():
        for attribute in ("text", "tail"):
            value = getattr(node, attribute)
            if value and old_intro in value:
                setattr(node, attribute, value.replace(old_intro, "This assignment produces one shared 12-month forecast."))
                replaced_intro += 1
    if replaced_intro != 1:
        raise ValueError("The macro-only introduction has changed")

    closing = next((node for node in root.iter() if "macro-guide-next" in classes(node)), None)
    if closing is None:
        raise ValueError("The macro submission callout is missing")
    paragraph = closing.find("p")
    links = paragraph.findall("a") if paragraph is not None else []
    if len(links) != 2 or " Use " not in (links[0].tail or ""):
        raise ValueError("The macro submission links have changed")
    links[0].tail = links[0].tail.replace(" Use ", "")
    paragraph.remove(links[1])


def style_tree(node, in_hero=False, in_deliverable=False):
    names = classes(node)
    in_hero = in_hero or "page-hero" in names
    in_deliverable = in_deliverable or "macro-guide-deliverable" in names
    if node.tag in {"main", "section", "aside"}:
        node.tag = "div"
    if node.tag == "ol" and "macro-steps" in names:
        node.tag = "div"
        node.attrib.pop("start", None)
    if node.tag == "li" and "macro-step" in names:
        node.tag = "div"

    style_chunks = [BASE_STYLES.get(node.tag, "")]
    style_chunks.extend(CLASS_STYLES.get(name, "") for name in names)
    if in_hero and node.tag == "p" and "eyebrow" not in names:
        style_chunks.append("color:#ffffff;")
    if in_deliverable and node.tag in {"strong", "code", "span"}:
        style_chunks.append("display:block;margin:0 0 5px;")
    if any(style_chunks):
        node.set("style", merge_styles(*style_chunks))

    if node.tag == "a":
        href = node.get("href", "")
        absolute = urljoin(PUBLIC_GUIDE, href)
        if urlparse(absolute).scheme not in {"https", "http"}:
            raise ValueError(f"Canvas link is not a public web URL: {href}")
        node.set("href", absolute)
    node.attrib.pop("class", None)
    node.attrib.pop("id", None)
    node.attrib.pop("aria-labelledby", None)
    for child in node:
        style_tree(child, in_hero, in_deliverable)


def main():
    source = SOURCE.read_text(encoding="utf-8")
    match = re.search(r'<main id="main-content">.*?</main>', source, re.DOTALL)
    if not match:
        raise ValueError("Could not locate the maintained macro guide main content")
    root = ET.fromstring(match.group(0))
    remove_jump_navigation(root)
    focus_on_macro_assignment(root)
    simplify_step_headers(root)
    style_tree(root)
    root.set(
        "style",
        "max-width:980px;margin:0 auto;color:#172033;"
        "font-family:Arial,Helvetica,sans-serif;line-height:1.55;",
    )
    if hasattr(ET, "indent"):
        ET.indent(root, space="  ")
    html = (
        ET.tostring(root, encoding="unicode", method="html")
        .encode("ascii", "xmlcharrefreplace")
        .decode("ascii")
    )
    if html.count("Step 1:") != 1 or html.count("Step 9:") != 1:
        raise ValueError("Canvas guide is missing a step")
    if any(term in html for term in ("Two workbooks, two jobs", "Decision Record", "Part 2", "client-analysis")):
        raise ValueError("Canvas guide contains a later assignment handoff")
    if re.search(r'href="(?!https?://)', html):
        raise ValueError("Canvas guide contains a relative link")
    OUTPUT.write_text(
        "<!-- Generated from project/macro-analysis.html by scripts/build-macro-guide-canvas.py. -->\n"
        + html
        + "\n",
        encoding="utf-8",
    )
    print(f"Built {OUTPUT.relative_to(ROOT)} from {SOURCE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
