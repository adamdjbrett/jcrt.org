import EleventyFetch from "@11ty/eleventy-fetch";
import matter from "gray-matter";
import path from "path";
import fs from "fs";
import yaml from "js-yaml";
import AdmZip from "adm-zip";

let memoryCachedData = null;
let memoryCachedMtimeMs = null;

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

function getAcademicFallbackTags(post, limit = 3) {
	const text = `${post?.title || ""}\n${post?.content || ""}`
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/`[^`]*`/g, " ")
		.replace(/<[^>]+>/g, " ")
		.replace(/\[[^\]]*\]\([^)]+\)/g, " ")
		.replace(/[^A-Za-z0-9\s-]/g, " ")
		.toLowerCase();

	const stop = new Set([
		"the",
		"and",
		"for",
		"with",
		"that",
		"this",
		"from",
		"into",
		"their",
		"there",
		"where",
		"which",
		"when",
		"what",
		"about",
		"also",
		"have",
		"has",
		"had",
		"were",
		"was",
		"are",
		"been",
		"being",
		"not",
		"can",
		"will",
		"may",
		"might",
		"these",
		"those",
		"such",
		"more",
		"most",
		"some",
		"than",
		"then",
		"them",
		"they",
		"your",
		"you",
		"our",
		"its",
		"but",
		"his",
		"her",
		"she",
		"him",
		"who",
		"whom",
		"one",
		"two",
		"three",
		"part",
		"parts",
		"review",
		"essay",
		"interview",
		"conversation",
		"conversations",
		"religious",
		"religion",
		"culture",
		"aesthetic",
		"aesthetics",
		"politic",
		"politics",
		"theory",
		"theology",
		"philosophy",
	]);

	const nounish = (w) =>
		/(tion|sion|ment|ness|ity|ism|logy|ship|hood|tude|ance|ence|acy|cracy)$/.test(w);

	const counts = new Map();
	for (const raw of text.split(/\s+/g)) {
		const word = raw.trim();
		if (!word || word.length < 6) continue;
		if (stop.has(word)) continue;
		if (!/^[a-z0-9-]+$/.test(word)) continue;
		const score = (counts.get(word) || 0) + (nounish(word) ? 2 : 1);
		counts.set(word, score);
	}

	return [...counts.entries()]
		.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
		.slice(0, limit)
		.map(([w]) => toTagSlug(w))
		.filter(Boolean);
}

function computePostTags(post) {
	const tags = new Set();

	// Desired most-common tags (high-level).
	tags.add("religion");

	// Make "culture" very common, but not necessarily universal.
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

	// Ensure these show up frequently in RT.
	if (looksPolitical) tags.add("politics");
	if (!looksPolitical) tags.add("aesthetics");
	if (looksAesthetic) tags.add("aesthetics");

	// Add normalized category tags for more specificity (cap to avoid explosion).
	for (const c of categoriesRaw) {
		const slug = toTagSlug(c);
		if (slug) tags.add(slug);
	}

	// If upstream tags exist, include them too.
	if (Array.isArray(post?.tags)) {
		for (const t of post.tags) {
			const slug = toTagSlug(t);
			if (slug) tags.add(slug);
		}
	}

	// Edge case: if everything failed, derive 3 tags from content.
	if (tags.size === 0) {
		for (const t of getAcademicFallbackTags(post, 3)) tags.add(t);
	}

	return [...tags];
}

function normalizeTheoryData(data) {
	if (!data || typeof data !== "object") return { posts: [], pages: [], authors: {} };

	// Some upstream "pages" embed Nunjucks templates in markdown. Those must be real
	// Eleventy templates in this repo, otherwise the Nunjucks shows up as literal text.
	const excludedPageSlugs = new Set(["archive", "blog"]);
	const pages = Array.isArray(data.pages)
		? data.pages.filter((p) => p && !excludedPageSlugs.has(String(p.slug || "").toLowerCase()))
		: [];

	const posts = Array.isArray(data.posts)
		? data.posts.map((post) => ({
				...post,
				tags: computePostTags(post),
			}))
		: [];

	return { ...data, posts, pages };
}

function readCachedTheory(dataPath) {
	const stat = fs.statSync(dataPath);
	if (memoryCachedData && memoryCachedMtimeMs === stat.mtimeMs) {
		return memoryCachedData;
	}
	memoryCachedData = JSON.parse(fs.readFileSync(dataPath, "utf8"));
	memoryCachedMtimeMs = stat.mtimeMs;
	return memoryCachedData;
}

export default async function () {
	const dataPath = path.join(process.cwd(), "_data/theory_archive.json");

	const shouldUseCachedTheory =
		process.env.USE_CACHED_THEORY === "1" ||
		process.env.ELEVENTY_RUN_MODE === "serve" ||
		Boolean(process.env.FAST_BUILD);

	// In `--serve` we prefer the existing cache to avoid re-downloading/unzipping/parsing
	// the upstream repo on every rebuild (big perf + memory win).
	if (shouldUseCachedTheory && fs.existsSync(dataPath)) {
		const mode = process.env.ELEVENTY_RUN_MODE || "unknown";
		console.log(`[Theory] Using cached theory_archive.json (${mode} mode)`);
		return normalizeTheoryData(readCachedTheory(dataPath));
	}
    
    const metadataPath = path.join(process.cwd(), "_data/metadata.yaml");
    const metadata = yaml.load(fs.readFileSync(metadataPath, "utf8"));
    const { github_user: OWNER, github_repo: REPO, branch: BRANCH = "main" } = metadata;
    const zipUrl = `https://github.com/${OWNER}/${REPO}/archive/refs/heads/${BRANCH}.zip`;

    try {
        // 1. Download ZIP (Cache 1 hari)
        const zipBuffer = await EleventyFetch(zipUrl, {
            duration: "1d",
            type: "buffer"
        });

        const zip = new AdmZip(zipBuffer);
        const zipEntries = zip.getEntries();

        let posts = [];
        let pages = [];
        const usedSlugs = new Set();

        // 2. Proses Ekstraksi
        zipEntries.forEach((entry) => {
            const entryPath = entry.entryName;
            
            if (entryPath.endsWith(".md") && !entry.isDirectory && !path.basename(entryPath).startsWith("._")) {
                let rawContent = entry.getData().toString("utf8")
                    .replace(/\u2028/g, '\n')
                    .replace(/\u2029/g, '\n')
                    .replace(/\r\n/g, '\n');

                const { data, content } = matter(rawContent);
                
                // Ambil slug dasar
                let baseSlug = path.basename(entryPath, ".md");

                // Jamin keunikan slug (Solusi Fatal Error Duplicate Permalink)
                let finalSlug = baseSlug;
                let counter = 1;
                while (usedSlugs.has(finalSlug)) {
                    finalSlug = `${baseSlug}-${counter}`;
                    counter++;
                }
                usedSlugs.add(finalSlug);

                const item = { 
                    ...data, 
                    content: content.trim(), 
                    slug: finalSlug, 
                    path: entryPath 
                };

                if (entryPath.includes("/content/posts/")) {
                    posts.push(item);
                } else if (entryPath.includes("/content/pages/")) {
                    pages.push(item);
                }
            }
        });

        // 3. Mapping Author
        const authorsPath = path.join(process.cwd(), "_data/authors.json");
        const authors = fs.existsSync(authorsPath) ? JSON.parse(fs.readFileSync(authorsPath, "utf8")) : {};

        const formattedPosts = posts.map(post => ({
            ...post,
            authorData: authors[post.author] || { name: post.author || "Editors" }
        })).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

        const nextData = {
            posts: formattedPosts,
            pages: pages,
            authors: authors,
        };

        // Avoid rewriting the cache file on every watch/build—this prevents noisy git diffs
        // and reduces the chance of rebuild loops.
        if (fs.existsSync(dataPath)) {
	            try {
	                const previous = JSON.parse(fs.readFileSync(dataPath, "utf8"));
	                const prevComparable = {
	                    posts: previous?.posts || [],
	                    pages: previous?.pages || [],
                    authors: previous?.authors || {},
                };

	                if (JSON.stringify(prevComparable) === JSON.stringify(nextData)) {
	                    console.log(`[Theory] No changes: using existing theory_archive.json.`);
	                    return normalizeTheoryData(previous);
	                }
	            } catch {
	                // ignore parse errors and overwrite below
	            }
	        }

	        const finalData = { ...nextData, lastUpdated: new Date().toISOString() };
	        fs.writeFileSync(dataPath, JSON.stringify(finalData, null, 2));

	        console.log(`[Theory] Updated: ${formattedPosts.length} posts saved to archive.`);
			memoryCachedData = finalData;
			memoryCachedMtimeMs = fs.statSync(dataPath).mtimeMs;
	        return normalizeTheoryData(finalData);

	    } catch (error) {
	        console.error("[Theory] Error, menggunakan data lama:", error.message);
	        if (fs.existsSync(dataPath)) {
	            return normalizeTheoryData(readCachedTheory(dataPath));
	        }
	        return { posts: [], pages: [], authors: {} };
	    }
	}
