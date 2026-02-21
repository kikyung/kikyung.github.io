#!/usr/bin/env python3
"""
Add slug and redirect_from to Jekyll posts in _posts/ that don't already have slug.
Slug format: YYYYMMDD-N (N = 1, 2, 3... per day).
redirect_from: old URL built from filename so old links still work.
"""
import re
from pathlib import Path
from collections import defaultdict

POSTS_DIR = Path(__file__).resolve().parent.parent / "_posts"
FILENAME_PATTERN = re.compile(r"^(\d{4})-(\d{2})-(\d{2})-(.+)\.md$")


def parse_filename(name: str) -> tuple[str, str, str, str] | None:
    m = FILENAME_PATTERN.match(name)
    if not m:
        return None
    year, month, day, old_slug = m.groups()
    return year, month, day, old_slug


def main() -> None:
    posts_dir = POSTS_DIR
    if not posts_dir.is_dir():
        raise SystemExit(f"Not a directory: {posts_dir}")

    # Collect (year, month, day, old_slug) per file, then assign sequence per day
    files_with_meta: list[tuple[Path, str, str, str, str]] = []
    for path in sorted(posts_dir.glob("*.md")):
        meta = parse_filename(path.name)
        if not meta:
            continue
        year, month, day, old_slug = meta
        files_with_meta.append((path, year, month, day, old_slug))

    # Assign slug YYYYMMDD-N per day
    day_count: dict[tuple[str, str, str], int] = defaultdict(int)
    file_slugs: list[tuple[Path, str, str, str, str, str]] = []
    for path, year, month, day, old_slug in files_with_meta:
        key = (year, month, day)
        day_count[key] += 1
        n = day_count[key]
        new_slug = f"{year}{month}{day}-{n}"
        file_slugs.append((path, year, month, day, old_slug, new_slug))

    for path, year, month, day, old_slug, new_slug in file_slugs:
        content = path.read_text(encoding="utf-8")
        if "slug:" in content.split("---")[1] if "---" in content else "":
            continue
        if not content.strip().startswith("---"):
            continue
        parts = content.split("---", 2)
        if len(parts) < 3:
            continue
        _, front, body = parts
        old_url = f"/posts/{year}/{month}/{old_slug}/"
        new_lines = f'slug: "{new_slug}"\nredirect_from:\n  - "{old_url}"\n'
        new_front = new_lines + front.lstrip()
        new_content = "---\n" + new_front + "---" + body
        path.write_text(new_content, encoding="utf-8")
        print(f"  {path.name} -> slug={new_slug}")

    print(f"Done. Processed {len(file_slugs)} posts.")


if __name__ == "__main__":
    main()
