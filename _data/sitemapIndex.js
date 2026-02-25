import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import yaml from "js-yaml";

const ROOT = path.join(process.cwd(), "content", "sitemaps");

function walk(dir) {
	const out = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) out.push(...walk(full));
		else if (entry.isFile() && entry.name.endsWith(".xml.njk")) out.push(full);
	}
	return out;
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

function toDateOnly(value) {
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "";
	return d.toISOString().slice(0, 10);
}

function getFallbackLastmod() {
	try {
		const raw = execSync("git log -1 --format=%cI", {
			cwd: process.cwd(),
			stdio: ["ignore", "pipe", "ignore"],
			encoding: "utf8",
		}).trim();
		return toDateOnly(raw) || toDateOnly(new Date());
	} catch {
		return toDateOnly(new Date());
	}
}

export default function sitemapIndex() {
	let files = [];
	try {
		files = walk(ROOT);
	} catch {
		return [];
	}

	const fallbackLastmod = getFallbackLastmod();
	const entries = [];
	for (const filePath of files) {
		const raw = fs.readFileSync(filePath, "utf8");
		const fm = parseFrontMatter(raw);
		const permalink = String(fm.permalink || "").trim();
		if (!permalink || !permalink.endsWith(".xml")) continue;
		let lastmod = "";
		try {
			const stat = fs.statSync(filePath);
			lastmod = toDateOnly(stat.mtime);
		} catch {
			lastmod = "";
		}
		entries.push({
			path: permalink,
			lastmod: lastmod || fallbackLastmod,
		});
	}

	const unique = new Map();
	for (const item of entries) {
		if (!unique.has(item.path)) unique.set(item.path, item);
	}
	return [...unique.values()].sort((a, b) => a.path.localeCompare(b.path));
}
