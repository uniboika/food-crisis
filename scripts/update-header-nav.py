#!/usr/bin/env python3
"""Update header nav labels and move Contact us to last position."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "food-crisis"

# Menu label spans in header nav / offcanvas only
MENU_TEXT_CLASSES = (
    "elementor-widget-cmsmasters-nav-menu__item-text",
    "elementor-widget-cmsmasters-offcanvas__item-text",
)

def _menu_text_pattern(label_pattern: str) -> re.Pattern:
    classes = "|".join(re.escape(c) for c in MENU_TEXT_CLASSES)
    return re.compile(
        rf'(<span\s+class="(?:{classes})">)\s*{label_pattern}\s*(</span>)',
        re.IGNORECASE | re.DOTALL,
    )


WHO_ARE = _menu_text_pattern(r"Who\s+We\s+Are")
GET_INVOLVED = _menu_text_pattern(r"Get\s+Involved")


def find_li_bounds(html, marker):
    pos = html.find(marker)
    if pos == -1:
        return None
    start = html.rfind("<li", 0, pos)
    if start == -1:
        return None
    depth = 0
    i = start
    n = len(html)
    while i < n:
        if html.startswith("<li", i):
            depth += 1
            i += 3
            continue
        if html.startswith("</li>", i):
            depth -= 1
            if depth == 0:
                return start, i + 5
            i += 5
            continue
        i += 1
    return None


def find_ul_bounds(html, marker_class):
    """Find bounds of a <ul> that contains marker_class in its class attribute."""
    search = 0
    while True:
        pos = html.find("<ul", search)
        if pos == -1:
            return None
        end_tag = html.find(">", pos)
        if end_tag == -1:
            return None
        tag = html[pos : end_tag + 1]
        if marker_class not in tag:
            search = pos + 3
            continue
        depth = 0
        i = pos
        n = len(html)
        while i < n:
            if html.startswith("<ul", i):
                depth += 1
                i += 3
                continue
            if html.startswith("</ul>", i):
                depth -= 1
                if depth == 0:
                    return pos, i + 5
                i += 5
                continue
            i += 1
        search = pos + 3


def reorder_contact_in_ul(ul_html):
    if "menu-item-35109" not in ul_html or "menu-item-36146" not in ul_html:
        return ul_html

    contact_bounds = find_li_bounds(ul_html, "menu-item-35109")
    pages_bounds = find_li_bounds(ul_html, "menu-item-36146")
    if not contact_bounds or not pages_bounds:
        return ul_html

    c_start, c_end = contact_bounds
    _, p_end = pages_bounds

    if c_start >= p_end:
        return ul_html

    contact_li = ul_html[c_start:c_end]
    without = ul_html[:c_start] + ul_html[c_end:]
    pages_bounds = find_li_bounds(without, "menu-item-36146")
    if not pages_bounds:
        return ul_html
    _, p_end = pages_bounds
    return without[:p_end] + contact_li + without[p_end:]


def reorder_menus(html):
    """Reorder contact item to last in each header/offcanvas menu <ul>."""
    for ul_class in (
        "elementor-widget-cmsmasters-nav-menu__container-inner",
        "elementor-widget-cmsmasters-offcanvas__menu-inner",
    ):
        while True:
            bounds = find_ul_bounds(html, ul_class)
            if not bounds:
                break
            start, end = bounds
            ul_html = html[start:end]
            new_ul = reorder_contact_in_ul(ul_html)
            if new_ul == ul_html:
                break
            html = html[:start] + new_ul + html[end:]
    return html


def update_labels(html: str) -> str:
    html = WHO_ARE.sub(r"\1About us\2", html)
    html = GET_INVOLVED.sub(r"\1Contact us\2", html)
    return html


def process_file(path: Path) -> bool:
    original = path.read_text(encoding="utf-8", errors="replace")
    if "menu-item-35109" not in original and "Who" not in original and "Involved" not in original:
        return False

    updated = update_labels(original)
    updated = reorder_menus(updated)

    if updated != original:
        path.write_text(updated, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = []
    for path in sorted(ROOT.rglob("*.html")):
        if path.suffix != ".html":
            continue
        if process_file(path):
            changed.append(path.relative_to(ROOT.parent))

    print(f"Updated {len(changed)} files")
    for p in changed[:20]:
        print(f"  - {p}")
    if len(changed) > 20:
        print(f"  ... and {len(changed) - 20} more")


if __name__ == "__main__":
    main()
