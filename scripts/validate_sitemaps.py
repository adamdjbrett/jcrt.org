#!/usr/bin/env python3
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlparse
import xml.etree.ElementTree as ET


@dataclass(frozen=True)
class LocIssue:
	file: str
	loc: str
	issue: str


def is_http_url(value: str) -> bool:
	try:
		u = urlparse(value)
	except Exception:
		return False
	return u.scheme in ("http", "https") and bool(u.netloc)


def url_path(loc: str) -> str | None:
	if not is_http_url(loc):
		return None
	u = urlparse(loc)
	return u.path or "/"


def resolve_to_output(site_dir: Path, loc: str) -> Path | None:
	p = url_path(loc)
	if not p:
		return None
	# strip leading slash for filesystem path
	rel = p.lstrip("/")
	fp = site_dir / rel
	# directory URLs should map to index.html
	if p.endswith("/"):
		return fp / "index.html"
	# allow direct file hits (.xml, .pdf, etc)
	if fp.suffix:
		return fp
	# fallback: treat as dir
	return fp / "index.html"


def parse_xml(path: Path) -> ET.Element:
	text = path.read_text(encoding="utf-8")
	if not text.startswith("<?xml"):
		raise ValueError("XML declaration must be first character")
	return ET.fromstring(text)


def main() -> int:
	site_dir = Path("_site")
	if not site_dir.exists():
		print("ERROR: `_site/` not found. Run `npm run build` first.")
		return 2

	sitemap_files = sorted(site_dir.rglob("*sitemap*.xml"))
	if not sitemap_files:
		print("ERROR: no `*sitemap*.xml` files found under `_site/`.")
		return 2

	issues: list[LocIssue] = []
	xml_parse_failures: list[str] = []

	ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}

	for xml_file in sitemap_files:
		try:
			root = parse_xml(xml_file)
		except Exception as e:
			xml_parse_failures.append(f"{xml_file}: {e}")
			continue

		# sitemapindex: <sitemap><loc>...<loc></sitemap>
		for loc_el in root.findall(".//sm:sitemap/sm:loc", ns):
			loc = (loc_el.text or "").strip()
			if not loc:
				issues.append(LocIssue(str(xml_file), loc, "empty loc"))
				continue
			if not is_http_url(loc):
				issues.append(LocIssue(str(xml_file), loc, "loc is not http(s) absolute"))
				continue
			fp = resolve_to_output(site_dir, loc)
			if not fp or not fp.exists():
				issues.append(LocIssue(str(xml_file), loc, "referenced sitemap does not exist in _site"))

		# urlset: <url><loc>...<loc></url>
		for loc_el in root.findall(".//sm:url/sm:loc", ns):
			loc = (loc_el.text or "").strip()
			if not loc:
				issues.append(LocIssue(str(xml_file), loc, "empty loc"))
				continue
			if not is_http_url(loc):
				issues.append(LocIssue(str(xml_file), loc, "loc is not http(s) absolute"))
				continue
			fp = resolve_to_output(site_dir, loc)
			if not fp or not fp.exists():
				issues.append(LocIssue(str(xml_file), loc, "target does not exist in _site"))

	if xml_parse_failures:
		print("XML parse failures:")
		for line in xml_parse_failures:
			print("-", line)

	if issues:
		print(f"Found {len(issues)} broken/invalid <loc> entries:")
		for issue in issues[:200]:
			print(f"- {issue.file}: {issue.loc} ({issue.issue})")
		if len(issues) > 200:
			print(f"... and {len(issues) - 200} more")
		return 1

	print(f"OK: validated {len(sitemap_files)} sitemap XML files and all <loc> targets exist in `_site/`.")
	return 0


if __name__ == "__main__":
	raise SystemExit(main())

