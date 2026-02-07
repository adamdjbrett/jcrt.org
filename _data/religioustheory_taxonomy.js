import fs from "fs";
import path from "path";

export default function () {
	const dataPath = path.join(process.cwd(), "_data/theory_archive.json");
	if (!fs.existsSync(dataPath)) {
		return { tags: [], authors: [] };
	}

	let data;
	try {
		data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
	} catch {
		return { tags: [], authors: [] };
	}

	const posts = Array.isArray(data?.posts) ? data.posts : [];

	const tagsSet = new Set();
	const authorsSet = new Set();

	for (const post of posts) {
		// "theory_archive.json" currently carries `categories` for Religious Theory posts
		// (and often no `tags`). For sitemap + tag pages we treat categories as tags.
		const tags = []
			.concat(Array.isArray(post?.tags) ? post.tags : [])
			.concat(Array.isArray(post?.categories) ? post.categories : []);
		for (const t of tags) {
			const tag = String(t || "").trim();
			if (tag) tagsSet.add(tag);
		}

		const authorName = String(post?.authorData?.name || post?.author || "Editors").trim();
		if (authorName) authorsSet.add(authorName);
	}

	const tags = [...tagsSet].sort((a, b) => a.localeCompare(b));
	const authors = [...authorsSet].sort((a, b) => a.localeCompare(b));
	return { tags, authors };
}
