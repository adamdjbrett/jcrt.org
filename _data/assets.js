import fs from "node:fs/promises";
import path from "node:path";

const IMAGE_EXTS = new Set([
	".avif",
	".gif",
	".ico",
	".jpeg",
	".jpg",
	".png",
	".svg",
	".webp",
]);

const PDF_EXTS = new Set([".pdf"]);

let serveCache = null;

function normalizeSlashes(p) {
	return p.replace(/\\/g, "/");
}

async function walkFiles(dirAbs) {
	const out = [];
	const entries = await fs.readdir(dirAbs, { withFileTypes: true });
	for (const ent of entries) {
		if (ent.name.startsWith(".")) continue;
		const full = path.join(dirAbs, ent.name);
		if (ent.isDirectory()) {
			out.push(...(await walkFiles(full)));
		} else if (ent.isFile()) {
			out.push(full);
		}
	}
	return out;
}

function toAssetList({ baseDir, urlPrefix }, filesAbs) {
	const baseAbs = path.join(process.cwd(), baseDir);
	return filesAbs
		.map((absPath) => {
			const relInside = path.relative(baseAbs, absPath);
			const relFromRoot = path.join(baseDir, relInside);
			const ext = path.extname(absPath).toLowerCase();
			return {
				ext,
				path: normalizeSlashes(relFromRoot),
				url: normalizeSlashes(path.posix.join(urlPrefix, relInside)),
			};
		})
		.filter((item) => item.url && !item.url.includes("/._"));
}

export default async function () {
	const isServeLike =
		process.env.ELEVENTY_RUN_MODE === "serve" || Boolean(process.env.FAST_BUILD);
	if (isServeLike && serveCache) {
		return serveCache;
	}

	const roots = [
		{ baseDir: "public", urlPrefix: "/" },
		{ baseDir: "content/archives", urlPrefix: "/archives/" },
	];

	let images = [];
	let pdfs = [];

	for (const root of roots) {
		const dirAbs = path.join(process.cwd(), root.baseDir);
		try {
			const filesAbs = await walkFiles(dirAbs);
			const items = toAssetList(root, filesAbs);

			images.push(...items.filter((i) => IMAGE_EXTS.has(i.ext)));
			pdfs.push(...items.filter((i) => PDF_EXTS.has(i.ext)));
		} catch {
			// ignore missing directories
		}
	}

	// Deduplicate by URL (same asset can exist in multiple roots theoretically).
	const dedupeByUrl = (list) => {
		const seen = new Set();
		return list.filter((item) => {
			if (seen.has(item.url)) return false;
			seen.add(item.url);
			return true;
		});
	};

	images = dedupeByUrl(images).sort((a, b) => a.url.localeCompare(b.url));
	pdfs = dedupeByUrl(pdfs).sort((a, b) => a.url.localeCompare(b.url));

	const result = { images, pdfs };
	if (isServeLike) {
		serveCache = result;
	}
	return result;
}
