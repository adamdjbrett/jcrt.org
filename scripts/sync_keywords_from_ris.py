#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import unicodedata
from dataclasses import dataclass
from pathlib import Path


@dataclass
class RisEntry:
    volume: str
    issue: str
    title: str
    title_norm: str
    authors: list[str]
    first_author_norm: str
    start_page: str
    end_page: str
    keywords: list[str]


FIELD_RE = re.compile(r"^([A-Z0-9]{2})  -\s*(.*)\s*$")


def _norm_text(value: str) -> str:
    value = unicodedata.normalize("NFKD", value or "")
    value = (
        value.replace("\u2019", "'")
        .replace("\u2018", "'")
        .replace("\u201c", '"')
        .replace("\u201d", '"')
    )
    value = value.strip().strip('"')
    value = re.sub(r"\s+", " ", value)
    value = re.sub(r"[^0-9A-Za-z]+", " ", value)
    value = re.sub(r"\s+", " ", value).strip().lower()
    return value


def _norm_author(value: str) -> str:
    value = unicodedata.normalize("NFKD", value or "")
    value = re.sub(r"\s+", " ", value.strip().lower())
    value = re.sub(r"[^0-9a-z, ]+", "", value)
    value = re.sub(r"\s+", " ", value).strip()
    return value


def _slugify_keyword(value: str) -> str:
    value = unicodedata.normalize("NFKD", value or "").strip().lower()
    value = re.sub(r"\s+", " ", value)
    # Turn any run of non-alphanumerics into a single hyphen.
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-{2,}", "-", value).strip("-")
    return value


def parse_ris(path: Path) -> list[RisEntry]:
    records: list[list[str]] = []
    cur: list[str] = []
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        cur.append(line)
        if line.startswith("ER  -"):
            records.append(cur)
            cur = []
    if cur and any(l.strip() for l in cur):
        records.append(cur)

    merged: dict[tuple[str, str, str, str], RisEntry] = {}
    for rec in records:
        fields: dict[str, list[str]] = {}
        for line in rec:
            m = FIELD_RE.match(line)
            if not m:
                continue
            key, val = m.group(1), m.group(2).strip()
            fields.setdefault(key, []).append(val)

        title = (fields.get("TI") or [""])[0].strip()
        volume = (fields.get("VL") or [""])[0].strip()
        issue = (fields.get("IS") or [""])[0].strip()
        authors = [a for a in (fields.get("AU") or []) if a.strip()]
        first_author_norm = _norm_author(authors[0]) if authors else ""
        start_page = (fields.get("SP") or [""])[0].strip()
        end_page = (fields.get("EP") or [""])[0].strip()
        keywords = [k for k in (fields.get("KW") or []) if k.strip()]

        entry = RisEntry(
            volume=volume,
            issue=issue,
            title=title,
            title_norm=_norm_text(title),
            authors=authors,
            first_author_norm=first_author_norm,
            start_page=start_page,
            end_page=end_page,
            keywords=keywords,
        )

        # Deduplicate known duplicates in the RIS by grouping on:
        # (volume, issue, normalized title, normalized first author)
        key = (entry.volume, entry.issue, entry.title_norm, entry.first_author_norm)
        existing = merged.get(key)
        if existing is None:
            merged[key] = entry
            continue

        # Prefer non-empty pages, union keywords.
        if not existing.start_page and entry.start_page:
            existing.start_page = entry.start_page
        if not existing.end_page and entry.end_page:
            existing.end_page = entry.end_page
        seen = set(existing.keywords)
        existing.keywords.extend([k for k in entry.keywords if k not in seen])

    return list(merged.values())


def parse_frontmatter(md: str) -> tuple[list[str], list[str], str]:
    if not md.startswith("---"):
        raise ValueError("No frontmatter")
    parts = md.split("---", 2)
    if len(parts) < 3:
        raise ValueError("Unterminated frontmatter")
    before = ["---"]
    fm_lines = parts[1].splitlines()
    # `split("---", 2)` leaves leading newline(s) before the first key; drop them.
    while fm_lines and fm_lines[0] == "":
        fm_lines = fm_lines[1:]
    rest = parts[2]
    return before, fm_lines, rest


def _parse_scalar(value: str) -> str:
    value = value.strip()
    if (value.startswith('"') and value.endswith('"')) or (
        value.startswith("'") and value.endswith("'")
    ):
        return value[1:-1]
    return value


def extract_md_meta(fm_lines: list[str]) -> dict[str, str]:
    meta: dict[str, str] = {}
    for line in fm_lines:
        if ":" not in line:
            continue
        key, val = line.split(":", 1)
        key = key.strip()
        val = val.strip()
        if key in {"title", "author", "volume", "issue", "pages", "keywords"}:
            meta[key] = val
    return meta


def parse_keywords_block(fm_lines: list[str]) -> tuple[int, int, list[str]]:
    """
    Return (start_idx, end_idx_exclusive, parsed_keywords).
    If not found, returns (-1, -1, []).
    """
    for i, line in enumerate(fm_lines):
        if not line.startswith("keywords:"):
            continue
        rhs = line.split(":", 1)[1].strip()
        if rhs.startswith("[") and rhs.endswith("]"):
            inner = rhs[1:-1].strip()
            if not inner:
                return i, i + 1, []
            items = [x.strip().strip('"').strip("'") for x in inner.split(",")]
            items = [x for x in items if x]
            return i, i + 1, items
        if rhs in {"[]", ""}:
            # May be an empty list or a multi-line list.
            j = i + 1
            items: list[str] = []
            while j < len(fm_lines):
                nxt = fm_lines[j]
                if re.match(r"^[A-Za-z0-9_]+:\s*", nxt):
                    break
                m = re.match(r"^\s*-\s+(.*)\s*$", nxt)
                if m:
                    items.append(m.group(1).strip().strip('"').strip("'"))
                j += 1
            return i, j, items
        # Scalar value on same line (treat as 1 keyword if present)
        return i, i + 1, [rhs] if rhs else []
    return -1, -1, []


def choose_ris_entry(
    candidates: list[RisEntry], title_norm: str, pages: str, author: str
) -> RisEntry | None:
    if not candidates:
        return None
    if len(candidates) == 1:
        return candidates[0]

    pages = _parse_scalar(pages or "")
    author_norm = _norm_text(_parse_scalar(author or ""))

    # Try disambiguate by pages.
    if pages and "-" in pages:
        sp, ep = [p.strip() for p in pages.split("-", 1)]
        by_pages = [
            c
            for c in candidates
            if (c.start_page and c.end_page and c.start_page == sp and c.end_page == ep)
        ]
        if len(by_pages) == 1:
            return by_pages[0]

    # Fallback to author last name containment.
    if author_norm:
        author_words = set(author_norm.split())
        by_author = []
        for c in candidates:
            if not c.authors:
                continue
            # RIS author is usually "Last, First ..."; check last name.
            last = c.authors[0].split(",", 1)[0]
            last_norm = _norm_text(last)
            if last_norm and last_norm in author_words:
                by_author.append(c)
        if len(by_author) == 1:
            return by_author[0]

    # Prefer the entry with the most keywords.
    candidates = sorted(candidates, key=lambda c: len(c.keywords), reverse=True)
    return candidates[0]


def sync_keywords(
    archives_root: Path, ris_entries: list[RisEntry], write: bool
) -> tuple[int, int, int]:
    by_vititle: dict[tuple[str, str, str], list[RisEntry]] = {}
    for e in ris_entries:
        by_vititle.setdefault((e.volume, e.issue, e.title_norm), []).append(e)

    changed = 0
    matched = 0
    unmatched = 0

    for md_path in sorted(archives_root.rglob("*.md")):
        text = md_path.read_text(encoding="utf-8", errors="replace")
        if not text.startswith("---"):
            continue

        try:
            before, fm_lines, rest = parse_frontmatter(text)
        except ValueError:
            continue

        meta = extract_md_meta(fm_lines)
        title_raw = _parse_scalar(meta.get("title", ""))
        if not title_raw:
            continue

        volume = _parse_scalar(meta.get("volume", "")).strip()
        issue = _parse_scalar(meta.get("issue", "")).strip()
        pages = meta.get("pages", "")
        author = meta.get("author", "")

        title_norm = _norm_text(title_raw)
        candidates = by_vititle.get((volume, issue, title_norm), [])
        entry = choose_ris_entry(candidates, title_norm=title_norm, pages=pages, author=author)
        if entry is None:
            unmatched += 1
            continue
        matched += 1

        start, end, existing_keywords = parse_keywords_block(fm_lines)
        if start == -1:
            # Shouldn't happen in this repo, but keep it safe.
            continue

        combined: list[str] = []
        for k in existing_keywords + entry.keywords:
            slug = _slugify_keyword(_parse_scalar(k))
            if not slug:
                continue
            if slug not in combined:
                combined.append(slug)

        if combined:
            new_block = ["keywords:"] + [f"  - {k}" for k in combined]
        else:
            new_block = ["keywords: []"]

        new_fm = fm_lines[:start] + new_block + fm_lines[end:]
        new_text = "\n".join(before + new_fm + ["---"]) + rest

        if new_text != text:
            changed += 1
            if write:
                md_path.write_text(new_text, encoding="utf-8")

    return changed, matched, unmatched


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Sync RIS KW fields into archives markdown frontmatter keywords lists."
    )
    parser.add_argument(
        "--ris",
        default="jcrt.org/_data/import/JCRT.ris",
        help="Path to RIS file",
    )
    parser.add_argument(
        "--archives",
        default="jcrt.org/content/archives",
        help="Archives root containing markdown files",
    )
    parser.add_argument("--write", action="store_true", help="Write changes in place")
    args = parser.parse_args()

    ris_path = Path(args.ris)
    archives_root = Path(args.archives)

    entries = parse_ris(ris_path)
    changed, matched, unmatched = sync_keywords(
        archives_root=archives_root, ris_entries=entries, write=args.write
    )

    mode = "WROTE" if args.write else "DRY-RUN"
    print(f"{mode}: matched={matched} changed={changed} unmatched={unmatched}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
