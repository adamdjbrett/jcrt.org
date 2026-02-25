import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { fileURLToPath } from "node:url";

const JOURNAL_TITLE = "Journal for Cultural & Religious Theory";
const JOURNAL_ABBR = "JCRT";
const PUBLISHER = "Whitestone Foundation";
const ISSN = "1530-5228";
const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const LEGACY_DATE_LOOKUP_PATH = path.resolve(MODULE_DIR, "..", "_data", "legacy-ris-dates.json");

function parseFrontMatter(content) {
	if (!content.startsWith("---")) return {};
	const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/);
	if (!match) return {};
	try {
		return yaml.load(match[1]) || {};
	} catch {
		return {};
	}
}

function splitAuthors(value) {
	if (!value) return [];
	if (Array.isArray(value)) return value.flatMap(splitAuthors);
	return String(value)
		.split(";")
		.map((s) => s.trim())
		.filter(Boolean);
}

function parsePages(pages) {
	const raw = String(pages || "").trim();
	if (!raw) return { startPage: "", endPage: "" };
	const normalized = raw.replace(/\s+/g, "").replace(/–/g, "-").replace(/—/g, "-");
	const [sp = "", ep = ""] = normalized.split("-", 2);
	return { startPage: sp, endPage: ep };
}

function parseYear(data) {
	if (data?.year != null && String(data.year).trim()) {
		const y = String(data.year).trim();
		const m = y.match(/\d{4}/);
		if (m) return m[0];
	}
	if (data?.date) {
		const d = new Date(data.date);
		if (!Number.isNaN(d.getTime())) return String(d.getUTCFullYear());
	}
	return "";
}

function normalizeNumericString(value) {
	const raw = String(value || "").trim();
	if (!raw) return "";
	const n = Number.parseInt(raw, 10);
	if (Number.isNaN(n)) return raw;
	return String(n);
}

function normalizeTitle(value) {
	return String(value || "")
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, " ")
		.trim();
}

function loadLegacyDateLookup() {
	try {
		const raw = fs.readFileSync(LEGACY_DATE_LOOKUP_PATH, "utf8");
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

function resolveLegacyDate(entry, lookup) {
	if (!lookup) return { py: "", da: "" };
	const key = [entry.volume || "", entry.issue || "", entry.startPage || "", entry.endPage || ""].join("|");
	const exact = lookup?.byVolIsSpEp?.[key];
	if (Array.isArray(exact) && exact.length > 0) {
		return { py: String(exact[0].py || "").trim(), da: String(exact[0].da || "").trim() };
	}
	const byTitle = lookup?.byTitle?.[normalizeTitle(entry.title)];
	if (!Array.isArray(byTitle) || byTitle.length === 0) return { py: "", da: "" };
	const scoped = byTitle.find((r) => String(r.vl || "") === String(entry.volume || "") && String(r.is || "") === String(entry.issue || ""));
	const hit = scoped || byTitle[0];
	return { py: String(hit.py || "").trim(), da: String(hit.da || "").trim() };
}

function normalizeBaseUrl(baseUrl) {
	const v = String(baseUrl || "").trim();
	if (!v) return "http://localhost:8080";
	return v.replace(/\/+$/, "");
}

function toAbsoluteUrl(baseUrl, urlPath) {
	if (!urlPath) return "";
	if (/^https?:\/\//i.test(urlPath)) return urlPath;
	const cleanPath = String(urlPath).startsWith("/") ? urlPath : `/${urlPath}`;
	return `${normalizeBaseUrl(baseUrl)}${cleanPath}`;
}

function resolvePdfPath(pdf, issueSlug, fileSlug) {
	const pdfRaw = String(pdf || "").trim();
	if (!pdfRaw) return "";
	if (/^https?:\/\//i.test(pdfRaw)) return pdfRaw;
	if (pdfRaw.startsWith("/")) return pdfRaw;
	return `/archives/${issueSlug}/${pdfRaw || `${fileSlug}.pdf`}`;
}

function escapeRIS(value) {
	return String(value || "").replace(/\r?\n/g, " ").trim();
}

function parseAuthorName(author) {
	const raw = String(author || "").trim();
	if (!raw) return null;
	if (raw.includes(",")) {
		const [family, ...rest] = raw.split(",");
		return { family: family.trim(), given: rest.join(",").trim() };
	}
	const parts = raw.split(/\s+/);
	if (parts.length === 1) return { literal: raw };
	const family = parts.pop();
	return { family, given: parts.join(" ") };
}

function makeRIS(entry) {
	const lines = [];
	lines.push("TY  - JOUR");
	lines.push(`TI  - ${escapeRIS(entry.title)}`);
	if (entry.authors.length > 0) {
		for (const author of entry.authors) lines.push(`AU  - ${escapeRIS(author)}`);
	} else {
		lines.push("AU  - ");
	}
	lines.push(`T2  - ${JOURNAL_TITLE}`);
	lines.push(`DA  - ${entry.da || (entry.year ? `${entry.year}///` : "")}`);
	lines.push(`PY  - ${entry.py || entry.year}`);
	lines.push(`VL  - ${escapeRIS(entry.volume)}`);
	lines.push(`IS  - ${escapeRIS(entry.issue)}`);
	lines.push(`SP  - ${escapeRIS(entry.startPage)}`);
	lines.push(`EP  - ${escapeRIS(entry.endPage)}`);
	lines.push(`J2  - ${JOURNAL_ABBR}`);
	lines.push(`PB  - ${PUBLISHER}`);
	lines.push(`SN  - ${ISSN}`);
	lines.push(`UR  - ${escapeRIS(entry.url)}`);
	lines.push("ER  -");
	return `${lines.join("\n")}\n`;
}

function makeCSL(entry, id) {
	const obj = {
		id,
		type: "article-journal",
		title: entry.title || id,
		"container-title": JOURNAL_TITLE,
		"short-container-title": JOURNAL_ABBR,
		publisher: PUBLISHER,
		ISSN,
		URL: entry.url,
	};

	const authorList = entry.authors
		.map(parseAuthorName)
		.filter(Boolean);
	if (authorList.length > 0) obj.author = authorList;
	if (entry.py) obj.issued = { "date-parts": [[Number(entry.py)]] };
	if (entry.volume) obj.volume = String(entry.volume);
	if (entry.issue) obj.issue = String(entry.issue);
	if (entry.startPage && entry.endPage) obj.page = `${entry.startPage}-${entry.endPage}`;
	else if (entry.startPage) obj.page = entry.startPage;

	return `${JSON.stringify([obj], null, 2)}\n`;
}

export default async function generateArchiveCitations(baseUrl) {
	const repoRoot = process.cwd();
	const archivesRoot = path.join(repoRoot, "content", "archives");
	const outRoot = path.join(repoRoot, "public", "citations", "archives");

	fs.rmSync(outRoot, { recursive: true, force: true });
	fs.mkdirSync(outRoot, { recursive: true });

	const walk = (dir) => {
		const items = [];
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			const full = path.join(dir, entry.name);
			if (entry.isDirectory()) items.push(...walk(full));
			else if (entry.isFile() && entry.name.endsWith(".md")) items.push(full);
		}
		return items;
	};

	const files = walk(archivesRoot);
	const legacyLookup = loadLegacyDateLookup();
	let count = 0;

	for (const filePath of files) {
		const rel = path.relative(archivesRoot, filePath);
		const parts = rel.split(path.sep);
		if (parts.length < 2) continue;
		const issueSlug = parts[0];
		const fileSlug = path.basename(parts[parts.length - 1], ".md");
		if (!issueSlug.includes(".")) continue;
		if (fileSlug.toLowerCase() === "index") continue;

		const content = fs.readFileSync(filePath, "utf8");
		const data = parseFrontMatter(content);

		const pagePath = `/archives/${issueSlug}/${fileSlug}/`;
		const pageUrl = toAbsoluteUrl(baseUrl, pagePath);
		const pdfPath = resolvePdfPath(data.pdf, issueSlug, fileSlug);
		const pdfUrl = pdfPath ? toAbsoluteUrl(baseUrl, pdfPath) : "";
		const url = pdfUrl || pageUrl;

		const { startPage, endPage } = parsePages(data.pages);
		const year = parseYear(data);
		const volume = normalizeNumericString(data.volume || issueSlug.split(".")[0] || "");
		const issue = normalizeNumericString(data.issue || issueSlug.split(".")[1] || "");
		const title = String(data.title || fileSlug).trim();
		const authors = splitAuthors(data.author);

		const entry = {
			title,
			authors,
			year,
			volume,
			issue,
			startPage,
			endPage,
			url,
		};
		const legacyDate = resolveLegacyDate(entry, legacyLookup);
		entry.py = year || legacyDate.py || "";
		entry.da = legacyDate.da || (entry.py ? `${entry.py}///` : "");

		const issueOutDir = path.join(outRoot, issueSlug);
		fs.mkdirSync(issueOutDir, { recursive: true });
		const citationId = `archives-${issueSlug}-${fileSlug}`.replace(/[^a-zA-Z0-9_.-]/g, "-");
		fs.writeFileSync(path.join(issueOutDir, `${fileSlug}.ris`), makeRIS(entry), "utf8");
		fs.writeFileSync(path.join(issueOutDir, `${fileSlug}.csl.json`), makeCSL(entry, citationId), "utf8");
		count += 1;
	}

	console.log(`[Citations] Generated ${count} archive RIS/CSL files in public/citations/archives`);
}
