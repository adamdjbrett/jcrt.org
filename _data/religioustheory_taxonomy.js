import fs from "fs";
import path from "path";

function toTagSlug(value) {
	return String(value || "")
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/&/g, " and ")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.replace(/-{2,}/g, "-");
}

function computePostTagsFromArchive(post) {
	const tags = new Set();

	tags.add("religion");

	const categoriesRaw = Array.isArray(post?.categories) ? post.categories.map(String) : [];
	const categoriesText = categoriesRaw.join(" ").toLowerCase();
	if (!/\b(conferences?|announcements?)\b/.test(categoriesText)) {
		tags.add("culture");
	}

	const contentText = `${post?.title || ""} ${post?.content || ""} ${categoriesText}`.toLowerCase();
	const looksPolitical =
		/\b(politic|democra|state|nation|govern|neoliber|capital|insurrec|election|war)\b/.test(
			contentText
		);
	const looksAesthetic =
		/\b(aesthetic|art|literature|poet|visual|music|film|image|beauty)\b/.test(
			contentText
		);

	if (looksPolitical) tags.add("politics");
	if (!looksPolitical) tags.add("aesthetics");
	if (looksAesthetic) tags.add("aesthetics");

	for (const c of categoriesRaw) {
		const slug = toTagSlug(c);
		if (slug) tags.add(slug);
	}

	if (Array.isArray(post?.tags)) {
		for (const t of post.tags) {
			const slug = toTagSlug(t);
			if (slug) tags.add(slug);
		}
	}

	return [...tags];
}

export default function () {
	const dataPath = path.join(process.cwd(), "_data/theory_archive.json");
	if (!fs.existsSync(dataPath)) {
		return { tags: [], tagCounts: {}, authors: [] };
	}

	let data;
	try {
		data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
	} catch {
		return { tags: [], tagCounts: {}, authors: [] };
	}

	const posts = Array.isArray(data?.posts) ? data.posts : [];

	const tagCounts = new Map();
	const authorsSet = new Set();

	for (const post of posts) {
		for (const tag of computePostTagsFromArchive(post)) {
			if (!tag) continue;
			tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
		}

		const authorName = String(post?.authorData?.name || post?.author || "Editors").trim();
		if (authorName) authorsSet.add(authorName);
	}

	const tags = [...tagCounts.keys()].sort((a, b) => {
		const ca = tagCounts.get(a) || 0;
		const cb = tagCounts.get(b) || 0;
		return cb - ca || a.localeCompare(b);
	});
	const authors = [...authorsSet].sort((a, b) => a.localeCompare(b));
	return { tags, tagCounts: Object.fromEntries(tagCounts), authors };
}
