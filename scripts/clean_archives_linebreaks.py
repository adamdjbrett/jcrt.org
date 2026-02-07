#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ARCHIVES_DIR = ROOT / "content" / "archives"


@dataclass(frozen=True)
class Result:
    path: Path
    changed: bool


_BLANK_RUN_RE = re.compile(r"\n{3,}")


def _split_front_matter(text: str) -> tuple[str | None, str]:
    """
    Returns (front_matter_block_including_delimiters_or_None, rest_after_front_matter).
    """
    if not text.startswith("---\n"):
        return None, text
    # Find the closing delimiter on its own line.
    lines = text.splitlines(keepends=True)
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            front = "".join(lines[: i + 1])
            rest = "".join(lines[i + 1 :])
            return front, rest
    return None, text


def _clean_after_front_matter(rest: str) -> str:
    """
    Removes redundant horizontal rule separators immediately after front matter.
    e.g. sequences like:
      \\n---\\n\\n---\\n---\\n
    become a single blank line.
    """
    lines = rest.splitlines(keepends=True)
    i = 0
    # Skip leading blank lines
    while i < len(lines) and lines[i].strip() == "":
        i += 1
    # If we see one or more '---' lines (possibly separated by blank lines), remove them.
    removed_any = False
    while True:
        # skip blanks between separators
        while i < len(lines) and lines[i].strip() == "":
            removed_any = True
            i += 1
        if i < len(lines) and lines[i].strip() == "---":
            removed_any = True
            i += 1
            continue
        break

    if not removed_any:
        return rest

    remaining = "".join(lines[i:]).lstrip("\n")
    return "\n\n" + remaining if remaining else "\n"


def _normalize_blank_runs(text: str) -> str:
    # Treat whitespace-only lines as blank, then collapse consecutive blank lines.
    # Important: preserve trailing spaces on non-blank lines (Markdown uses them).
    lines = text.splitlines()
    out: list[str] = []
    blank_run = 0
    prev_sig: str | None = None  # last non-blank "signature" line (currently only tracks '---')
    for line in lines:
        if line.strip() == "":
            blank_run += 1
            if blank_run > 1:
                continue
            out.append("")
            continue
        if line.strip() == "---":
            # Collapse redundant horizontal rules (often introduced by conversion).
            if prev_sig == "---":
                blank_run = 0
                continue
            prev_sig = "---"
            blank_run = 0
            out.append("---")
            continue
        blank_run = 0
        prev_sig = None
        out.append(line)

    normalized = "\n".join(out)
    # Also reduce any remaining raw \n\n\n runs (e.g. from already-empty lines).
    normalized = _BLANK_RUN_RE.sub("\n\n", normalized)
    return normalized


def _clean_file(path: Path) -> Result:
    original = path.read_text(encoding="utf-8")
    text = original.replace("\r\n", "\n")

    front, rest = _split_front_matter(text)
    if front is not None:
        rest = _clean_after_front_matter(rest)
        text = front.rstrip("\n") + rest

    text = _normalize_blank_runs(text)
    text = text.rstrip() + "\n"

    changed = text != original
    if changed:
        path.write_text(text, encoding="utf-8")
    return Result(path=path, changed=changed)


def main() -> int:
    p = argparse.ArgumentParser(description="Clean unnecessary linebreaks in content/archives markdown files.")
    p.add_argument("--dry-run", action="store_true", help="Report changes without writing files.")
    args = p.parse_args()

    if not ARCHIVES_DIR.is_dir():
        raise SystemExit(f"missing: {ARCHIVES_DIR}")

    md_files = sorted(ARCHIVES_DIR.rglob("*.md"))
    changed_paths: list[Path] = []
    for md in md_files:
        original = md.read_text(encoding="utf-8")
        text = original.replace("\r\n", "\n")
        front, rest = _split_front_matter(text)
        if front is not None:
            rest = _clean_after_front_matter(rest)
            text = front.rstrip("\n") + rest
        text = _normalize_blank_runs(text)
        text = text.rstrip() + "\n"

        if text != original:
            changed_paths.append(md)
            if not args.dry_run:
                md.write_text(text, encoding="utf-8")

    print(f"Scanned: {len(md_files)} files")
    print(f"Would change: {len(changed_paths)} files" if args.dry_run else f"Changed: {len(changed_paths)} files")
    for md in changed_paths[:25]:
        print(str(md.relative_to(ROOT)))
    if len(changed_paths) > 25:
        print(f"... and {len(changed_paths) - 25} more")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
