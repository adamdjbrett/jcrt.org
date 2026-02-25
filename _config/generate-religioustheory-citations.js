import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import crypto from "node:crypto";

const PUBLICATION_TITLE = "Religious theory by JCRT";
const CACHE_DIR = path.join(process.cwd(), ".cache");
const MANIFEST_PATH = path.join(CACHE_DIR, "religioustheory-citations-manifest.json");

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

function splitAuthors(value) {
	if (!value) return [];
	if (Array.isArray(value)) return value.flatMap(splitAuthors);
	return String(value)
		.split(";")
		.flatMap((part) => part.split(/\s+\band\b\s+/i))
		.map((s) => s.trim())
		.filter(Boolean);
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
	lines.push(`T2  - ${PUBLICATION_TITLE}`);
	lines.push(`DA  - ${entry.year ? `${entry.year}///` : ""}`);
	lines.push(`PY  - ${entry.year}`);
	lines.push("VL  - ");
	lines.push("IS  - ");
	lines.push("SP  - ");
	lines.push("EP  - ");
	lines.push(`J2  - ${PUBLICATION_TITLE}`);
	lines.push("PB  - ");
	lines.push("SN  - ");
	lines.push(`UR  - ${escapeRIS(entry.url)}`);
	lines.push("ER  -");
	return `${lines.join("\n")}\n`;
}

function makeJSON(entry, id) {
	const obj = {
		id,
		type: "article-journal",
		title: entry.title || id,
		"container-title": PUBLICATION_TITLE,
		URL: entry.url,
	};

	const authorList = entry.authors
		.map(parseAuthorName)
		.filter(Boolean);
	if (authorList.length > 0) obj.author = authorList;
	if (entry.year) obj.issued = { "date-parts": [[Number(entry.year)]] };

	return `${JSON.stringify([obj], null, 2)}\n`;
}

export default async function generateReligiousTheoryCitations(baseUrl) {
	const repoRoot = process.cwd();
	const postsRoot = path.join(repoRoot, "content", "religioustheory", "posts");
	const outRoot = path.join(repoRoot, "public", "citations", "religioustheory");

	fs.mkdirSync(outRoot, { recursive: true });
	const priorManifest = loadManifest();
	const nextManifestItems = {};
	const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
	const citationVersion = sha256(`v1|${normalizedBaseUrl}`);

	const files = fs
		.readdirSync(postsRoot, { withFileTypes: true })
		.filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
		.map((entry) => path.join(postsRoot, entry.name));

	let generated = 0;
	let skipped = 0;
	let deleted = 0;
	for (const filePath of files) {
		const fileSlug = path.basename(filePath, ".md");
		const content = fs.readFileSync(filePath, "utf8");
		const signature = sha256(`${citationVersion}|${fileSlug}|${content}`);
		nextManifestItems[fileSlug] = signature;
		const risOutPath = path.join(outRoot, `${fileSlug}.ris`);
		const jsonOutPath = path.join(outRoot, `${fileSlug}.json`);
		const upToDate =
			priorManifest.items?.[fileSlug] === signature &&
			fileExists(risOutPath) &&
			fileExists(jsonOutPath);
		if (upToDate) {
			skipped += 1;
			continue;
		}

		const data = parseFrontMatter(content);

		const pagePath = `/religioustheory/posts/${fileSlug}/`;
		const entry = {
			title: String(data.title || fileSlug).trim(),
			authors: splitAuthors(data.author),
			year: parseYear(data),
			url: toAbsoluteUrl(baseUrl, pagePath),
		};

		const citationId = `religioustheory-${fileSlug}`.replace(/[^a-zA-Z0-9_.-]/g, "-");
		fs.writeFileSync(risOutPath, makeRIS(entry), "utf8");
		fs.writeFileSync(jsonOutPath, makeJSON(entry, citationId), "utf8");
		generated += 1;
	}

	for (const key of Object.keys(priorManifest.items || {})) {
		if (key in nextManifestItems) continue;
		const removedRis = removeIfExists(path.join(outRoot, `${key}.ris`));
		const removedJson = removeIfExists(path.join(outRoot, `${key}.json`));
		const removed = removedRis || removedJson;
		if (removed) deleted += 1;
	}

	saveManifest({ version: 1, generatedAt: new Date().toISOString(), items: nextManifestItems });
	const total = Object.keys(nextManifestItems).length;
	console.log(
		`[Citations] ReligiousTheory RIS/JSON: total=${total}, generated=${generated}, skipped=${skipped}, deleted=${deleted}`
	);
}
