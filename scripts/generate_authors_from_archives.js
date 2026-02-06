#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { authorSlug, splitAuthors } from "../_config/authorSlug.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const archivesRoot = path.join(projectRoot, "content", "archives");
const authorsRoot = path.join(projectRoot, "content", "authors");

function hasLowercase(value) {
	return /[a-z]/.test(value);
}

function hasNonAscii(value) {
	return /[^\x00-\x7F]/.test(value);
}

function isAllCaps(value) {
	return /[A-Z]/.test(value) && !hasLowercase(value);
}

function titleCaseAllCaps(value) {
	if (!isAllCaps(value)) return value;
	return value
		.toLowerCase()
		.split(" ")
		.map((word) =>
			word
				.split("-")
				.map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
				.join("-")
		)
		.join(" ")
		.replace(/\s+/g, " ")
		.trim();
}

function displayScore(value) {
	let score = 0;
	if (hasLowercase(value)) score += 10;
	if (hasNonAscii(value)) score += 3;
	if (/\./.test(value)) score += 1;
	if (/-/.test(value)) score += 1;
	score += Math.min(value.length, 80) / 80;
	return score;
}

function pickBestDisplayName(variants) {
	const items = [...variants].map((v) => v.trim()).filter(Boolean);
	if (!items.length) return "";

	items.sort((a, b) => displayScore(b) - displayScore(a) || b.length - a.length);
	return titleCaseAllCaps(items[0]);
}

async function walk(dir) {
	const dirents = await fs.readdir(dir, { withFileTypes: true });
	const out = [];
	for (const ent of dirents) {
		const full = path.join(dir, ent.name);
		if (ent.isDirectory()) {
			out.push(...(await walk(full)));
		} else if (ent.isFile() && ent.name.toLowerCase().endsWith(".md")) {
			out.push(full);
		}
	}
	return out;
}

function makeAuthorFrontmatter(name) {
	return [
		"---",
		`name: ${name}`,
		"affiliation:",
		"bio:",
		"social:",
		'  - title: "website"',
		'    url: ""',
		"    icon: fa-solid fa-link",
		"---",
		"",
	].join("\n");
}

function parseArgs(argv) {
	return {
		write: argv.includes("--write"),
		dryRun: !argv.includes("--write"),
	};
}

async function main() {
	const args = parseArgs(process.argv.slice(2));

	const archiveFiles = await walk(archivesRoot);
	const bySlug = new Map(); // slug -> Set(nameVariants)

	for (const file of archiveFiles) {
		const raw = await fs.readFile(file, "utf8");
		let data;
		try {
			({ data } = matter(raw));
		} catch {
			continue;
		}

		const authorField = data?.author;
		for (const authorName of splitAuthors(authorField)) {
			const slug = authorSlug(authorName);
			if (!slug) continue;
			const existing = bySlug.get(slug) ?? new Set();
			existing.add(String(authorName).trim());
			bySlug.set(slug, existing);
		}
	}

	await fs.mkdir(authorsRoot, { recursive: true });

	const slugs = [...bySlug.keys()].sort();
	let created = 0;
	let skipped = 0;
	let collisions = 0;

	for (const slug of slugs) {
		const variants = bySlug.get(slug) ?? new Set();
		if (variants.size > 1) collisions += 1;

		const name = pickBestDisplayName(variants);
		if (!name) continue;

		const outPath = path.join(authorsRoot, `${slug}.md`);
		try {
			await fs.access(outPath);
			skipped += 1;
			continue;
		} catch {
			// file does not exist
		}

		if (args.write) {
			await fs.writeFile(outPath, makeAuthorFrontmatter(name), "utf8");
		}
		created += 1;
	}

	const mode = args.write ? "WROTE" : "DRY-RUN";
	console.log(
		`${mode}: archiveFiles=${archiveFiles.length} uniqueAuthors=${slugs.length} created=${created} skippedExisting=${skipped} slugsWithVariants=${collisions}`
	);
}

await main();

