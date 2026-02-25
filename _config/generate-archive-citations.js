import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const JOURNAL_TITLE = "Journal for Cultural & Religious Theory";
const JOURNAL_ABBR = "JCRT";
const PUBLISHER = "Whitestone Foundation";
const ISSN = "1530-5228";
const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const LEGACY_DATE_LOOKUP_PATH = path.resolve(MODULE_DIR, "..", "_data", "legacy-ris-dates.json");
const CACHE_DIR = path.resolve(MODULE_DIR, "..", ".cache");
const MANIFEST_PATH = path.join(CACHE_DIR, "archive-citations-manifest.json");

function sha256(input) {
	return crypto.createHash("sha256").update(String(input)).digest("hex");
}

function fileExists(filePath) {
	try {
		fs.accessSync(filePath, fs.constants.F_OK);
		return true;
	} catch {
		return false;
	}
}

function removeIfExists(filePath) {
	try {
		fs.rmSync(filePath, { force: true });
		return true;
	} catch {
		return false;
	}
}

function cleanupEmptyDirs(startDir, stopDir) {
	let current = startDir;
	while (current && current.startsWith(stopDir)) {
		if (current === stopDir) break;
		try {
			if (fs.readdirSync(current).length > 0) break;
			fs.rmdirSync(current);
		} catch {
			break;
		}
		current = path.dirname(current);
	}
}

function loadManifest() {
	try {
		const raw = fs.readFileSync(MANIFEST_PATH, "utf8");
		const parsed = JSON.parse(raw);
		if (parsed && typeof parsed === "object" && parsed.items && typeof parsed.items === "object") {
			return parsed;
		}
	} catch {
		// ignore missing/invalid cache
	}
	return { version: 1, items: {} };
}

function saveManifest(manifest) {
	fs.mkdirSync(CACHE_DIR, { recursive: true });
	fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

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

function parseSeason(data) {
	const raw = String(data?.season || "").trim();
	if (!raw) return "";
	return raw.toLowerCase();
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
	const risDate =
		entry.da ||
		(entry.py
			? (entry.season ? `${entry.py}/${entry.season}//` : `${entry.py}///`)
			: "");
	lines.push(`DA  - ${risDate}`);
	lines.push(`PY  - ${entry.py || entry.year}`);
	lines.push(`VL  - ${escapeRIS(entry.volume)}`);
	lines.push(`IS  - ${escapeRIS(entry.issue)}`);
	lines.push(`C6  - ${escapeRIS(entry.season)}`);
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
	if (entry.season) obj.season = String(entry.season);
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
	const legacyLookupRaw = fileExists(LEGACY_DATE_LOOKUP_PATH)
		? fs.readFileSync(LEGACY_DATE_LOOKUP_PATH, "utf8")
		: "";
	const issueMetaCache = new Map();
	const issueMetaRawCache = new Map();
	const priorManifest = loadManifest();
	const nextManifestItems = {};
	const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
	const citationVersion = sha256(`v1|${normalizedBaseUrl}|${legacyLookupRaw}`);

	function getIssueMeta(issueSlug) {
		if (issueMetaCache.has(issueSlug)) return issueMetaCache.get(issueSlug);
		const indexPath = path.join(archivesRoot, issueSlug, "index.njk");
		let meta = {};
		try {
			const raw = fs.readFileSync(indexPath, "utf8");
			meta = parseFrontMatter(raw) || {};
		} catch {
			meta = {};
		}
		issueMetaCache.set(issueSlug, meta);
		return meta;
	}

	function getIssueMetaRaw(issueSlug) {
		if (issueMetaRawCache.has(issueSlug)) return issueMetaRawCache.get(issueSlug);
		const indexPath = path.join(archivesRoot, issueSlug, "index.njk");
		let raw = "";
		try {
			raw = fs.readFileSync(indexPath, "utf8");
		} catch {
			raw = "";
		}
		issueMetaRawCache.set(issueSlug, raw);
		return raw;
	}

	let generated = 0;
	let skipped = 0;
	let deleted = 0;

	for (const filePath of files) {
		const rel = path.relative(archivesRoot, filePath);
		const parts = rel.split(path.sep);
		if (parts.length < 2) continue;
		const issueSlug = parts[0];
		const fileSlug = path.basename(parts[parts.length - 1], ".md");
		if (!issueSlug.includes(".")) continue;
		if (fileSlug.toLowerCase() === "index") continue;

		const content = fs.readFileSync(filePath, "utf8");
		if (!content.startsWith("---")) continue;
		const signature = sha256(
			`${citationVersion}|${issueSlug}|${fileSlug}|${getIssueMetaRaw(issueSlug)}|${content}`
		);
		const manifestKey = `${issueSlug}/${fileSlug}`;
		nextManifestItems[manifestKey] = signature;
		const issueOutDir = path.join(outRoot, issueSlug);
		const risOutPath = path.join(issueOutDir, `${fileSlug}.ris`);
		const cslOutPath = path.join(issueOutDir, `${fileSlug}.csl.json`);
		const upToDate =
			priorManifest.items?.[manifestKey] === signature &&
			fileExists(risOutPath) &&
			fileExists(cslOutPath);
		if (upToDate) {
			skipped += 1;
			continue;
		}

		const data = parseFrontMatter(content);
		const issueMeta = getIssueMeta(issueSlug);

		const pagePath = `/archives/${issueSlug}/${fileSlug}/`;
		const pageUrl = toAbsoluteUrl(baseUrl, pagePath);
		const pdfPath = resolvePdfPath(data.pdf, issueSlug, fileSlug);
		const pdfUrl = pdfPath ? toAbsoluteUrl(baseUrl, pdfPath) : "";
		const url = pdfUrl || pageUrl;

		const { startPage, endPage } = parsePages(data.pages);
		const year = parseYear(data) || parseYear(issueMeta);
		const season = parseSeason(data) || parseSeason(issueMeta);
		const volume = normalizeNumericString(data.volume || issueMeta.volume || issueSlug.split(".")[0] || "");
		const issue = normalizeNumericString(data.issue || issueMeta.issue || issueSlug.split(".")[1] || "");
		const title = String(data.title || fileSlug).trim();
		const authors = splitAuthors(data.author);

		const entry = {
			title,
			authors,
			year,
			volume,
			issue,
			season,
			startPage,
			endPage,
			url,
		};
		const legacyDate = resolveLegacyDate(entry, legacyLookup);
		entry.season = entry.season || "unknown";
		entry.py = year || legacyDate.py || String(new Date().getUTCFullYear());
		entry.da = entry.py ? `${entry.py}/${entry.season}//` : "";

		fs.mkdirSync(issueOutDir, { recursive: true });
		const citationId = `archives-${issueSlug}-${fileSlug}`.replace(/[^a-zA-Z0-9_.-]/g, "-");
		fs.writeFileSync(risOutPath, makeRIS(entry), "utf8");
		fs.writeFileSync(cslOutPath, makeCSL(entry, citationId), "utf8");
		generated += 1;
	}

	for (const key of Object.keys(priorManifest.items || {})) {
		if (key in nextManifestItems) continue;
		const [issueSlug, fileSlug] = key.split("/");
		if (!issueSlug || !fileSlug) continue;
		const issueOutDir = path.join(outRoot, issueSlug);
		const removedRis = removeIfExists(path.join(issueOutDir, `${fileSlug}.ris`));
		const removedCsl = removeIfExists(path.join(issueOutDir, `${fileSlug}.csl.json`));
		const removed = removedRis || removedCsl;
		if (removed) {
			deleted += 1;
			cleanupEmptyDirs(issueOutDir, outRoot);
		}
	}

	saveManifest({ version: 1, generatedAt: new Date().toISOString(), items: nextManifestItems });
	const total = Object.keys(nextManifestItems).length;
	console.log(
		`[Citations] Archive RIS/CSL: total=${total}, generated=${generated}, skipped=${skipped}, deleted=${deleted}`
	);
}
