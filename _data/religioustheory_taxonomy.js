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
	return { tags: [], tagCounts: {}, authors: [] };
}
