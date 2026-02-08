import {
	IdAttributePlugin,
	InputPathToUrlTransformPlugin,
	HtmlBasePlugin,
} from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginNavigation from "@11ty/eleventy-navigation";
import yaml from "js-yaml";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import markdownItFootnote from "markdown-it-footnote";
import markdownItAttrs from "markdown-it-attrs";
import markdownItTableOfContents from "markdown-it-table-of-contents";
import pluginTOC from "eleventy-plugin-toc";
import pluginFilters from "./_config/filters.js";
import { authorSlug, splitAuthors } from "./_config/authorSlug.js";
import fs from "fs";
import path from "path";

function archiveIssueSortKey(inputPath, url) {
	// Prefer the directory segment under `content/archives/`.
	// Examples:
	// - content/archives/08.3/index.njk  => major=8, minor=3
	// - content/archives/15/index.njk    => major=15, minor=0
	const raw =
		typeof inputPath === "string" && inputPath.includes("content/archives/")
			? inputPath.split("content/archives/")[1]?.split("/")[0]
			: null;
	const issue = (raw || "")
		.trim()
		.replace(/[^0-9.]/g, "");
	if (!issue) return { major: 0, minor: 0, issue: "", url: url || "" };
	const parts = issue.split(".");
	const major = Number.parseInt(parts[0] || "0", 10) || 0;
	const minor = Number.parseInt(parts[1] || "0", 10) || 0;
	return { major, minor, issue, url: url || "" };
}

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {
	const filePath = path.resolve("_data/theory_archive.json");
	const isFastBuild = Boolean(process.env.FAST_BUILD);
	eleventyConfig.addGlobalData("isFastBuild", isFastBuild);

	// Removed manual authors.json loading. Eleventy will auto-load _data/authors.yaml and _data/authors.json as global data.
	eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
		if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
			return false;
		}
	});

	// dev mode
	if (process.env.QUICK_DEV) {
		eleventyConfig.addPreprocessor("collections", "limit-dev", (collections) => {
			const folders = ["archives", "blog", "religioustheory"];
			folders.forEach((name) => {
				if (collections[name]) collections[name] = collections[name].slice(0, 5);
			});

			if (collections.all) {
				Object.keys(collections).forEach((tagName) => {
					if (Array.isArray(collections[tagName])) {
						collections[tagName] = collections[tagName].slice(0, 5);
					}
				});
			}
		});
		eleventyConfig.addGlobalData("theory_archive", () => {
			try {
				const data = JSON.parse(
					fs.readFileSync("./_data/theory_archive.json", "utf-8")
				);
				return { ...data, posts: data.posts.slice(0, 5) };
			} catch (e) {
				return { posts: [] };
			}
		});
		console.log("🚀 QUICK_DEV MODE: Active (Everything limited to 5)");
		console.log("🔗 Open: http://localhost:4000");
	}

	// Pagefind runs once in `npm run build` (after `_site` is built).
	// If use sveltia cms
	eleventyConfig.addPassthroughCopy("sveltia.config.js");
	eleventyConfig.addDataExtension("yaml", (contents) => yaml.load(contents));
	eleventyConfig
		.addPassthroughCopy({
			"./public/": "/",
		})
		.addPassthroughCopy("./content/feed/pretty-atom-feed.xsl");

	eleventyConfig.addWatchTarget("css/**/*.css");
	eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpg,jpeg,gif}");

	if (!isFastBuild) {
		eleventyConfig.addBundle("css", {
			toFileDirectory: "dist",
			bundleHtmlContentFromSelector: "style",
		});
		eleventyConfig.addBundle("js", {
			toFileDirectory: "dist",
			bundleHtmlContentFromSelector: 'script[type="module"]',
		});
	} else {
		// Templates reference `{% getBundle "css" %}` / `{% getBundle "js" %}`.
		// In fast builds we skip bundling entirely for speed, so provide a no-op.
		eleventyConfig.addShortcode("getBundle", () => "");
	}

	eleventyConfig.addPlugin(pluginSyntaxHighlight, {
		preAttributes: { tabindex: 0 },
	});
	eleventyConfig.addPlugin(pluginNavigation);
	// HTML transforms are expensive; CI sets `FAST_BUILD=1` to skip these.
	if (!isFastBuild) {
		eleventyConfig.addPlugin(HtmlBasePlugin);
		eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);
	}
	const md = new markdownIt({
		html: true,
		breaks: true,
		linkify: true,
	});
	eleventyConfig.addFilter("md", function (content) {
		return md.render(content);
	});

	let options = {
		html: true,
		breaks: true,
		linkify: true,
		permalink: true,
		typographer: true,
		permalinkClass: "direct-link",
		permalinkSymbol: "#",
	};

	let markdownLib = markdownIt(options)
		.use(markdownItAttrs)
		.use(markdownItFootnote)
		.use(markdownItTableOfContents);
	eleventyConfig.setLibrary("md", markdownLib);
	eleventyConfig.amendLibrary("md", (mdLib) => {
		mdLib.use(markdownItAnchor, {
			permalink: markdownItAnchor.permalink.ariaHidden({
				placement: "after",
				class: "header-anchor",
				symbol: "",
				ariaHidden: false,
			}),
			level: [1, 2, 3, 4],
			slugify: eleventyConfig.getFilter("slugify"),
		});
	});
	eleventyConfig.addPlugin(pluginTOC, {
		tags: ["h2", "h3", "h4", "h5"],
		id: "toci",
		class: "list-group",
		ul: true,
		flat: true,
		wrapper: "div",
	});

	if (!isFastBuild) {
		eleventyConfig.addPlugin(IdAttributePlugin, {
			slugify: (text) => {
				const slug = eleventyConfig.getFilter("slugify")(text);
				return `print-${slug}`;
			},
		});
	}

	eleventyConfig.addFilter("authorSlug", authorSlug);
	eleventyConfig.addFilter("splitAuthors", splitAuthors);
	eleventyConfig.addFilter("xmlEscape", function (value) {
		if (value === null || value === undefined) return "";
		return String(value)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");
	});
	eleventyConfig.addFilter("htmlEntityDecode", function (value) {
		if (value === null || value === undefined) return "";
		let s = String(value);

		// Fast path for the common entities we see in URLs.
		s = s
			.replace(/&amp;/g, "&")
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&quot;/g, '"')
			.replace(/&apos;/g, "'")
			.replace(/&#39;/g, "'");

		// Decode numeric entities.
		s = s
			.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
				try {
					return String.fromCodePoint(parseInt(hex, 16));
				} catch {
					return _;
				}
			})
			.replace(/&#([0-9]+);/g, (_, num) => {
				try {
					return String.fromCodePoint(parseInt(num, 10));
				} catch {
					return _;
				}
			});
		return s;
	});

	eleventyConfig.addGlobalData("sitemapBaseUrl", () => process.env.SITE_URL || null);

	const authorLookupCache = new WeakMap();
	function getAuthorLookupMap(authorsCollection) {
		if (!Array.isArray(authorsCollection)) return null;

		let lookup = authorLookupCache.get(authorsCollection);
		if (lookup) return lookup;

		lookup = new Map();
		for (const author of authorsCollection) {
			if (!author) continue;
			const directKey = (author.data?.key || author.fileSlug || "").trim();
			if (directKey) lookup.set(directKey, author);

			const fileSlug = (author.fileSlug || "").trim();
			if (fileSlug) lookup.set(fileSlug, author);

			const name = (author.data?.name || author.data?.title || "").trim();
			const nameSlug = authorSlug(name);
			if (nameSlug) lookup.set(nameSlug, author);

			const keySlug = authorSlug(directKey);
			if (keySlug) lookup.set(keySlug, author);
		}

		authorLookupCache.set(authorsCollection, lookup);
		return lookup;
	}

	eleventyConfig.addFilter("getAuthorObj", (authorsCollection, authorKey) => {
		if (!authorKey || !authorsCollection) return null;
		const lookup = getAuthorLookupMap(authorsCollection);
		if (!lookup) return null;

		const rawKey = String(authorKey).trim();
		if (!rawKey) return null;

		return lookup.get(rawKey) || lookup.get(authorSlug(rawKey)) || null;
	});
	const postsByAuthorCache = new WeakMap();
	eleventyConfig.addFilter("getPostsByAuthor", (allPosts, authorKey) => {
		if (!Array.isArray(allPosts) || !authorKey) return [];

		const rawKey = String(authorKey).trim();
		if (!rawKey) return [];

		let perCollection = postsByAuthorCache.get(allPosts);
		if (!perCollection) {
			perCollection = new Map();
			postsByAuthorCache.set(allPosts, perCollection);
		}
		const cacheKey = authorSlug(rawKey) || rawKey.toLowerCase();
		if (perCollection.has(cacheKey)) {
			return perCollection.get(cacheKey);
		}

		const normalizedKey = rawKey.toLowerCase();
		const normalizedSlug = authorSlug(rawKey);

		const postsByAuthor = allPosts.filter((post) => {
			const authorField = post?.data?.author;
			if (!authorField) return false;

			const raw = String(authorField);
			const parts = raw.includes(";") ? raw.split(";") : raw.split(",");

			for (const part of parts) {
				const name = String(part).trim();
				if (!name) continue;

				if (name.toLowerCase() === normalizedKey) return true;
				if (authorSlug(name) === normalizedSlug) return true;
			}
			return false;
		});

		const groups = {
			archives: [],
			religioustheory: [],
			blog: [],
			other: [],
		};

		for (const post of postsByAuthor) {
			const url = post?.url || "";
			const inputPath = post?.inputPath || "";

			if (url.startsWith("/archives/") || inputPath.includes("/content/archives/")) {
				groups.archives.push(post);
			} else if (
				url.startsWith("/religioustheory/") ||
				inputPath.includes("/content/religioustheory/")
			) {
				groups.religioustheory.push(post);
			} else if (url.startsWith("/blog/") || inputPath.includes("/content/blog/")) {
				groups.blog.push(post);
			} else {
				groups.other.push(post);
			}
		}

		const sortByDateDesc = (a, b) => {
			const aTime = a?.date instanceof Date ? a.date.getTime() : 0;
			const bTime = b?.date instanceof Date ? b.date.getTime() : 0;
			return bTime - aTime;
		};

		groups.archives.sort(sortByDateDesc);
		groups.religioustheory.sort(sortByDateDesc);
		groups.blog.sort(sortByDateDesc);
		groups.other.sort(sortByDateDesc);

		const result = [
			...groups.archives,
			...groups.religioustheory,
			...groups.blog,
			...groups.other,
		];
		perCollection.set(cacheKey, result);
		return result;
	});
	eleventyConfig.addCollection("authors", function (collectionApi) {
		return collectionApi
			.getFilteredByGlob("content/authors/*.md")
			.sort((a, b) => {
				const nameA = (a.data.name || a.data.title || "").toLowerCase();
				const nameB = (b.data.name || b.data.title || "").toLowerCase();
				return nameA.localeCompare(nameB);
			});
	});
	eleventyConfig.addPassthroughCopy({ "public/js": "js" });
	// Archives contain PDFs/scans that need to be copied, but the markdown is built into HTML.
	// CI can pre-copy these via scripts/pre-copy-assets.sh (hardlinks), so allow skipping passthrough copy.
	if (!process.env.PRECOPY_ARCHIVES) {
		eleventyConfig.addPassthroughCopy("content/archives/**/*.pdf");
		eleventyConfig.addPassthroughCopy("content/archives/**/*.jpg");
		eleventyConfig.addPassthroughCopy("content/archives/**/*.jpeg");
		eleventyConfig.addPassthroughCopy("content/archives/**/*.tif");
		eleventyConfig.addPassthroughCopy("content/archives/**/*.tiff");
	}
	eleventyConfig.addCollection("archives", function (collectionApi) {
		return collectionApi.getFilteredByGlob("content/archives/**/*.md");
	});

	eleventyConfig.addCollection("archivesToc", function (collectionApi) {
		const items = collectionApi
			.getAll()
			.filter((p) => {
				const ip = String(p?.inputPath || "");
				return ip.startsWith("./content/archives/") && ip.endsWith("/index.njk") && p?.url;
			})
			.map((p) => {
				const key = archiveIssueSortKey(p.inputPath, p.url);
				return { p, key };
			});

		items.sort((a, b) => {
			if (a.key.major !== b.key.major) return a.key.major - b.key.major;
			if (a.key.minor !== b.key.minor) return a.key.minor - b.key.minor;
			return String(a.key.url).localeCompare(String(b.key.url));
		});

		return items.map((x) => x.p);
	});

	eleventyConfig.addCollection("feed", function (collectionApi) {
		const byMtimeDesc = (items) => {
			const withMtime = items.map((item) => {
				const inputPath = String(item?.inputPath || "");
				const rel = inputPath.startsWith("./") ? inputPath.slice(2) : inputPath;
				let mtimeMs = 0;
				try {
					mtimeMs = fs.statSync(path.join(process.cwd(), rel)).mtimeMs;
				} catch {
					mtimeMs = 0;
				}
				return { item, mtimeMs };
			});
			withMtime.sort((a, b) => b.mtimeMs - a.mtimeMs);
			return withMtime.map((x) => x.item);
		};

		const byDateDesc = (items) => {
			const toTime = (d) => (d instanceof Date ? d.getTime() : 0);
			return [...items].sort((a, b) => toTime(b.date) - toTime(a.date));
		};

		const archives = byMtimeDesc(
			collectionApi
				.getFilteredByGlob("content/archives/**/*.md")
				.filter((p) => p?.url && p.url.startsWith("/archives/"))
		).slice(0, 25);

		const blog = byDateDesc(
			collectionApi
				.getFilteredByGlob("content/blog/*.md")
				.filter((p) => p?.url && p.url.startsWith("/blog/"))
		).slice(0, 25);

		const ensureTitle = (item, fallbackTitle) => {
			const title = item?.data?.title ? String(item.data.title) : "";
			if (title.trim()) return item;

			return {
				url: item?.url,
				date: item?.date,
				data: { ...(item?.data || {}), title: fallbackTitle },
				templateContent: item?.templateContent,
			};
		};

		// Religious Theory: build feed items directly from theory_archive.json
		// (faster + avoids relying on paginated template pages being present in collections).
		let religioustheory = [];
		try {
			const theoryPath = path.join(process.cwd(), "_data/theory_archive.json");
			const raw = JSON.parse(fs.readFileSync(theoryPath, "utf-8"));
			const posts = Array.isArray(raw?.posts) ? raw.posts : [];
			const mdForFeed = markdownIt({ html: true, breaks: true, linkify: true });
			religioustheory = posts.slice(0, 25).map((post) => {
				const slug = String(post?.slug || "").trim();
				const title = String(post?.title || "").trim() || slug || "Religious Theory";
				const url = `/religioustheory/posts/${encodeURIComponent(slug)}/`;
				const date = post?.date ? new Date(post.date) : new Date();
				const bodyHtml = mdForFeed.render(String(post?.content || ""));
				const contentHtml = `<h1>${title}</h1>\n${bodyHtml}`;
				return {
					url,
					date,
					data: { title },
					templateContent: contentHtml,
				};
			});
		} catch {
			religioustheory = [];
		}

		// Priority order in the feed:
		// 1) /archives/ (25)
		// 2) /blog/ (25)
		// 3) /religioustheory/ posts (25)
		// Feed plugin template reverses the collection before rendering entries.
		// Return items in the inverse order so the final output order is:
		//   archives (newest→oldest), then blog (newest→oldest), then religioustheory (newest→oldest).
		const safeArchivesNewestFirst = archives.map((a) =>
			ensureTitle(a, a?.fileSlug || a?.url || "Archive")
		);
		const archivesOldestFirst = [...safeArchivesNewestFirst].reverse();
		const blogOldestFirst = [...blog].reverse();
		const religioustheoryOldestFirst = [...religioustheory].reverse();
		return [...religioustheoryOldestFirst, ...blogOldestFirst, ...archivesOldestFirst];
	});
	const mdLib = markdownIt({
		html: true,
		breaks: true,
		linkify: true,
	});
	eleventyConfig.addFilter("md", (content) => mdLib.render(content || ""));
	eleventyConfig.addFilter("markdownify", (content) => {
		if (!content) return "";
		return md.render(String(content));
	});

	// creativitas code

	eleventyConfig.addPlugin(feedPlugin, {
		type: "atom", // or "rss", "json"
		outputPath: "/feed/feed.xml",
		stylesheet: "pretty-atom-feed.xsl",
		templateData: {
			eleventyNavigation: {
				key: "Feed",
				order: 10,
			},
		},
		collection: {
			name: "feed",
			limit: 75,
		},
		metadata: {
			language: "en",
			title: "Editorial",
			subtitle: "Editorial 11ty.",
			base: "https://www.example.com/",
			author: {
				name: "adamdjbrett",
			},
		},
	});

	eleventyConfig.addFilter("getKeywordsFromJSON", (pageTitle, theoryArchive) => {
		if (!theoryArchive || !pageTitle) return "";

		const posts = theoryArchive.posts || [];

		const entry = posts.find(
			(item) =>
				item.title &&
				item.title.toLowerCase().trim() === pageTitle.toLowerCase().trim()
		);

		if (entry) {
			const keywords = entry.categories || entry.keywords;
			if (keywords) {
				return Array.isArray(keywords) ? keywords.join(", ") : keywords;
			}
		}
		return "";
	});
	eleventyConfig.addPlugin(pluginFilters);

	eleventyConfig.watchIgnores.add("_data/theory_archive.json");
	eleventyConfig.ignores.add("_drafts/**");
	eleventyConfig.ignores.add("submissions/**");

	eleventyConfig.addShortcode("currentBuildDate", () => {
		return new Date().toISOString();
	});
}

export const config = {
	templateFormats: ["md", "njk", "html", "liquid", "css", "11ty.js"],

	markdownTemplateEngine: "njk",

	htmlTemplateEngine: "njk",

	dir: {
		input: "content", // default: "."
		includes: "../_includes", // default: "_includes" (`input` relative)
		data: "../_data", // default: "_data" (`input` relative)
		output: "_site",
	},
};
