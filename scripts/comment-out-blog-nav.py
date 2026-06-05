#!/usr/bin/env python3
"""Remove or properly hide Blog nav items in headers and footers."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "food-crisis"

OPEN_MARKER = "<!-- BLOG-NAV-HIDDEN -->"
CLOSE_MARKER = "<!-- /BLOG-NAV-HIDDEN -->"


def find_li_bounds(html, start_pos):
    li_start = html.rfind("<li", 0, start_pos + 1)
    if li_start == -1:
        return None
    depth = 0
    i = li_start
    n = len(html)
    while i < n:
        if html.startswith("<li", i):
            depth += 1
            i += 3
            continue
        if html.startswith("</li>", i):
            depth -= 1
            if depth == 0:
                return li_start, i + 5
            i += 5
            continue
        i += 1
    return None


def fix_broken_comment_wrappers(html):
    """Fix two-marker comments that leave <li> visible in the DOM."""
    changed = False
    while OPEN_MARKER in html:
        open_idx = html.find(OPEN_MARKER)
        close_idx = html.find(CLOSE_MARKER, open_idx)
        if close_idx == -1:
            break
        block_start = open_idx
        block_end = close_idx + len(CLOSE_MARKER)
        inner = html[open_idx + len(OPEN_MARKER) : close_idx]
        inner = inner.strip("\n\r\t ")
        replacement = f"<!-- BLOG-NAV-HIDDEN\n{inner}\n-->"
        html = html[:block_start] + replacement + html[block_end:]
        changed = True
    return html, changed


def remove_blog_nav_items(html):
    """Delete header/footer blog <li> blocks not already inside a comment."""
    changed = False

    # Remove by menu id (header submenus)
    search = 0
    while True:
        pos = html.find("menu-item-35085", search)
        if pos == -1:
            break
        # Skip if inside an HTML comment
        last_comment_open = html.rfind("<!--", 0, pos)
        last_comment_close = html.rfind("-->", 0, pos)
        if last_comment_open > last_comment_close:
            search = pos + 1
            continue

        bounds = find_li_bounds(html, pos)
        if not bounds:
            search = pos + 1
            continue

        start, end = bounds
        html = html[:start] + "<!-- BLOG-NAV-HIDDEN\n" + html[start:end] + "\n-->" + html[end:]
        changed = True
        search = start + 20

    # Remove footer blog links
    search = 0
    while True:
        pos = html.find("blog-page", search)
        if pos == -1:
            break

        last_comment_open = html.rfind("<!--", 0, pos)
        last_comment_close = html.rfind("-->", 0, pos)
        if last_comment_open > last_comment_close:
            search = pos + 1
            continue

        bounds = find_li_bounds(html, pos)
        if not bounds:
            search = pos + 1
            continue

        block = html[bounds[0] : bounds[1]]
        if "elementor-icon-list-item" not in block:
            search = pos + 1
            continue

        start, end = bounds
        html = html[:start] + "<!-- BLOG-NAV-HIDDEN\n" + html[start:end] + "\n-->" + html[end:]
        changed = True
        search = start + 20

    return html, changed


def process_file(path):
    original = path.read_text(encoding="utf-8", errors="replace")
    if "blog-page" not in original and "menu-item-35085" not in original:
        return False

    html = original
    changed = False

    html, fixed = fix_broken_comment_wrappers(html)
    changed = changed or fixed

    html, removed = remove_blog_nav_items(html)
    changed = changed or removed

    if changed and html != original:
        path.write_text(html, encoding="utf-8")
        return True
    return False


def main():
    changed = []
    for path in sorted(ROOT.rglob("*.html")):
        if process_file(path):
            changed.append(path.relative_to(ROOT.parent))

    print(f"Updated {len(changed)} files")
    for p in changed:
        print(f"  - {p}")


if __name__ == "__main__":
    main()
