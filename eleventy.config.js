import "./_config/polyfills.js";

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
import generateArchiveCitations from "./_config/generate-archive-citations.js";
import generateReligiousTheoryCitations from "./_config/generate-religioustheory-citations.js";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

function archiveIssueSortKey(inputPath, url) {
	// Prefer the directory segment under `content/archives/`.
	// Examples:
	// - content/archives/08.3/index.njk  => major=8, minor=3
	// - content/archives/15/index.njk    => major=15, minor=0
	const raw =
		typeof inputPath === "string" && inputPath.includes("content/archives/")
			? inputPath.split("content/archives/")[1]?.split("/")[0]
			: null;
	const issue = (raw || "").trim().replace(/[^0-9.]/g, "");
	if (!issue) return { major: 0, minor: 0, issue: "", url: url || "" };
	const parts = issue.split(".");
	const major = Number.parseInt(parts[0] || "0", 10) || 0;
	const minor = Number.parseInt(parts[1] || "0", 10) || 0;
	return { major, minor, issue, url: url || "" };
}

async function ensureFavicons() {
	// `@11ty/eleventy-img` requires Node versions that implement `os.availableParallelism()`.
	// If you run the build on an older Node (e.g. v18.12.x), skip generation.
	if (typeof os.availableParallelism !== "function") return;

	const sourceSvg = path.join(process.cwd(), "public/img/logos/JCRT.svg");
	const outputDir = path.join(process.cwd(), "public/img/logos");

	const sizesToName = new Map([
		[16, "favicon-16x16"],
		[32, "favicon-32x32"],
		[48, "favicon-48x48"],
		[96, "favicon-96x96"],
		[180, "apple-touch-icon"],
		[192, "android-chrome-192x192"],
		[512, "android-chrome-512x512"],
	]);

	try {
		const srcStat = fs.statSync(sourceSvg);
		const outputs = [...sizesToName.values()].map((base) =>
			path.join(outputDir, `${base}.png`)
		);
		const allFresh = outputs.every((p) => {
			try {
				return fs.statSync(p).mtimeMs >= srcStat.mtimeMs;
			} catch {
				return false;
			}
		});
		if (allFresh) return;
	} catch {
		// If the source icon doesn't exist, do nothing.
		return;
	}

	const { default: Image } = await import("@11ty/eleventy-img");
	await Image(sourceSvg, {
		widths: [...sizesToName.keys()],
		formats: ["png"],
		outputDir,
		urlPath: "/img/logos",
		filenameFormat: function (_id, _src, width, format) {
			const base = sizesToName.get(width) || `favicon-${width}x${width}`;
			return `${base}.${format}`;
		},
	});
}

function isPublishedItem(data = {}, runMode = process.env.ELEVENTY_RUN_MODE) {
	// Explicit publish flag has highest priority.
	if (data.published === false) return false;
	if (data.published === true) return true;
	// Keep existing draft behavior for build mode.
	if (data.draft === true && runMode === "build") return false;
	return true;
}

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {
	eleventyConfig.addPlugin(pluginFilters);
	const isFastBuild = Boolean(process.env.FAST_BUILD);
	eleventyConfig.addGlobalData("isFastBuild", isFastBuild);

	eleventyConfig.on("eleventy.before", async () => {
		const runMode = process.env.ELEVENTY_RUN_MODE;
		// In serve mode, skip heavyweight pre-build generation to prevent
		// repeated high-memory rebuild cycles.
		if (runMode !== "serve") {
			await generateArchiveCitations(process.env.SITE_URL || "https://jcrt.org");
			await generateReligiousTheoryCitations(process.env.SITE_URL || "https://jcrt.org");
			await ensureFavicons();
		}
	});

	// Removed manual authors.json loading. Eleventy will auto-load _data/authors.yaml and _data/authors.json as global data.
	eleventyConfig.addPreprocessor("drafts", "*", (data) => {
		if (!isPublishedItem(data)) return false;
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
	// NOTE: HtmlBasePlugin and InputPathToUrlTransformPlugin are Eleventy 3.x features
	// if (!isFastBuild) {
	// 	eleventyConfig.addPlugin(HtmlBasePlugin);
	// 	eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);
	// }
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

	// NOTE: IdAttributePlugin is an Eleventy 3.x feature
	// if (!isFastBuild) {
	// 	eleventyConfig.addPlugin(IdAttributePlugin, {
	// 		slugify: (text) => {
	// 			const slug = eleventyConfig.getFilter("slugify")(text);
	// 			return `print-${slug}`;
	// 		},
	// 	});
	// }

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
			if (!isPublishedItem(post?.data)) return false;
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
			.filter((item) => isPublishedItem(item?.data))
			.sort((a, b) => {
				const nameA = (a.data.name || a.data.title || "").toLowerCase();
				const nameB = (b.data.name || b.data.title || "").toLowerCase();
				return nameA.localeCompare(nameB);
			});
	});
	eleventyConfig.addCollection("theoryPosts", function(collectionApi) {
	  return collectionApi.getFilteredByGlob("content/religioustheory/**/*")
	    .filter(item => {
	      if (!isPublishedItem(item?.data)) return false;
	      const isRootIndex = item.inputPath.endsWith("religioustheory/index.html") || 
	                          item.inputPath.endsWith("religioustheory/index.njk") ||
	                          item.inputPath.endsWith("religioustheory/index.md");     
	      const validExtensions = [".md", ".njk", ".html"];
	      const isFile = validExtensions.some(ext => item.inputPath.endsWith(ext));
	      const hasTag = item.data.tags && item.data.tags.includes("theoryPosts");
	      return !isRootIndex && isFile && hasTag;
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
		// change folder 
		eleventyConfig.addPassthroughCopy("content/religioustheory/posts/*.{pdf,docx,png,jpg}");
		eleventyConfig.addPassthroughCopy("content/archives/**/*.tiff");
	}
	eleventyConfig.addCollection("archives", function (collectionApi) {
		return collectionApi
			.getFilteredByGlob("content/archives/**/*.md")
			.filter((item) => isPublishedItem(item?.data));
	});

	eleventyConfig.addCollection("archivesToc", function (collectionApi) {
		const items = collectionApi
			.getAll()
			.filter((p) => {
				if (!isPublishedItem(p?.data)) return false;
				const ip = String(p?.inputPath || "");
				return /^\.\/content\/archives\/[^/]+\/index\.njk$/.test(ip) && p?.url;
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
		const getDataDateMs = (item) => {
			const raw = item?.data?.date;
			if (!raw) return 0;
			const d = raw instanceof Date ? raw : new Date(raw);
			const ms = d.getTime();
			return Number.isFinite(ms) ? ms : 0;
		};
		const getSortTime = (item) => {
			const url = String(item?.url || "");
			const dataDateMs = getDataDateMs(item);
			if (url.startsWith("/archives/")) {
				if (dataDateMs > 0) return dataDateMs;
				const year = Number.parseInt(item?.data?.year, 10);
				if (Number.isFinite(year) && year > 0) return Date.UTC(year, 0, 1);
				return 0;
			}
			if (dataDateMs > 0) return dataDateMs;
			const d = item?.date;
			if (!(d instanceof Date)) return 0;
			const ms = d.getTime();
			return Number.isFinite(ms) ? ms : 0;
		};

		const ensureTitle = (item, fallbackTitle) => {
			const title = item?.data?.title ? String(item.data.title) : "";
			if (title.trim()) return item;

			return {
				url: item?.url,
				date: item?.date,
				data: { ...(item?.data || {}), title: fallbackTitle },
			};
		};

		const archives = collectionApi
			.getFilteredByGlob("content/archives/**/*.md")
			.filter((p) => isPublishedItem(p?.data))
			.filter((p) => p?.url && p.url.startsWith("/archives/"));

		const blog = collectionApi
			.getFilteredByGlob("content/blog/*.md")
			.map((p) => {
				if (p?.url) return p;
				const slug =
					p?.fileSlug || path.basename(String(p?.inputPath || ""), path.extname(String(p?.inputPath || "")));
				return { ...p, url: `/blog/${slug}/` };
			});

		const religioustheory = collectionApi
			.getFilteredByGlob("content/religioustheory/posts/*.md")
			.filter((p) => isPublishedItem(p?.data))
			.filter((p) => p?.url && p.url.startsWith("/religioustheory/"));

		const byKey = new Map();
		for (const item of [...archives, ...blog, ...religioustheory]) {
			const key = item?.url || item?.inputPath;
			if (!key || byKey.has(key)) continue;
			byKey.set(key, item);
		}

		const sortDesc = (a, b) => getSortTime(b) - getSortTime(a);
		const sortedArchives = [...archives].sort(sortDesc);
		const sortedBlog = [...blog].sort(sortDesc);
		const sortedTheory = [...religioustheory].sort(sortDesc);
		const allSorted = [...byKey.values()].sort(sortDesc);
		const archiveSeed = sortedArchives[0] || {
			url: "/archives/",
			date: new Date(0),
			data: { title: "Archives" },
		};
		const blogSeed = sortedBlog[0] || {
			url: "/blog/",
			date: new Date(0),
			data: { title: "Blog" },
		};
		const theorySeed = sortedTheory[0] || {
			url: "/religioustheory/",
			date: new Date(0),
			data: { title: "Religious Theory" },
		};

		// Ensure section representation while still keeping a newest-first feed.
		const selected = [];
		const selectedKeys = new Set();
		for (const candidate of [archiveSeed, blogSeed, theorySeed]) {
			const key = candidate?.url || candidate?.inputPath;
			if (!key || selectedKeys.has(key)) continue;
			selected.push(candidate);
			selectedKeys.add(key);
		}
		for (const item of allSorted) {
			if (selected.length >= 50) break;
			const key = item?.url || item?.inputPath;
			if (!key || selectedKeys.has(key)) continue;
			selected.push(item);
			selectedKeys.add(key);
		}

		const newestFirst = selected
			.sort(sortDesc)
			.slice(0, 50)
			.map((item) => ensureTitle(item, item?.fileSlug || item?.url || "Untitled"));

		// Feed plugin template reverses the collection before rendering entries.
		return [...newestFirst].reverse();
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
			limit: 50,
		},
		metadata: {
			language: "en",
			title: "Editorial",
			subtitle: "Editorial 11ty.",
			base: process.env.SITE_URL || "http://localhost:8080",
			author: {
				name: "adamdjbrett",
			},
		},
	});

	eleventyConfig.addPlugin(feedPlugin, {
		type: "rss",
		outputPath: "/feed/feed.rss",
		templateData: {
			eleventyNavigation: {
				key: "Feed (RSS)",
				order: 11,
			},
		},
		collection: {
			name: "feed",
			limit: 50,
		},
		metadata: {
			language: "en",
			title: "Editorial",
			subtitle: "Editorial 11ty.",
			base: process.env.SITE_URL || "http://localhost:8080",
			author: {
				name: "adamdjbrett",
			},
		},
	});
	eleventyConfig.watchIgnores.add("errors.txt");
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
