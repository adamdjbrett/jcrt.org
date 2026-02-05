import {
	IdAttributePlugin,
	InputPathToUrlTransformPlugin,
	HtmlBasePlugin,
} from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginNavigation from "@11ty/eleventy-navigation";
import yaml from "js-yaml";
import { execFileSync, execSync } from "child_process";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import markdownItFootnote from "markdown-it-footnote";
import markdownItAttrs from 'markdown-it-attrs';
import markdownItTableOfContents from "markdown-it-table-of-contents";
import pluginTOC from 'eleventy-plugin-toc';
import pluginFilters from "./_config/filters.js";
import { authorSlug, splitAuthors } from "./_config/authorSlug.js";
import fs from "fs";
import path from 'path'; 
import { fileURLToPath } from 'url';
import memoize from "memoize";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

const lastModifiedCache = new Map();
let gitLastModifiedIndex = null;

function normalizeGitPath(p) {
	return String(p || "").replace(/\\/g, "/").replace(/^\.\//, "");
}

function buildGitLastModifiedIndex() {
	if (gitLastModifiedIndex) return gitLastModifiedIndex;

	const map = new Map();

	// Build a per-file last commit timestamp map in one git call (much faster than N calls).
	// Uses NUL delimiters for robust parsing.
	try {
		const out = execFileSync(
			"git",
			[
				"log",
				"-z",
				"--name-only",
				"--format=%cI%x00",
				"--",
				"content",
				"public",
				"_data",
				"_includes",
				"eleventy.config.js",
			],
			{ cwd: process.cwd(), encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
		);

		const tokens = out.split("\0");
		let currentDate = null;

		for (const token of tokens) {
			if (!token) continue;

			// Commit ISO 8601 date line produced by --format=%cI.
			// Example: 2026-02-05T12:34:56-05:00
			if (/^\d{4}-\d{2}-\d{2}T/.test(token)) {
				const d = new Date(token.trim());
				currentDate = Number.isNaN(d.valueOf()) ? null : d;
				continue;
			}

			if (!currentDate) continue;
			const filePath = normalizeGitPath(token.trim());
			if (!filePath) continue;
			if (!map.has(filePath)) {
				map.set(filePath, currentDate);
			}
		}
	} catch {
		// If git isn’t available (or repo isn’t a git checkout), fall back to filesystem mtimes.
	}

	gitLastModifiedIndex = map;
	return gitLastModifiedIndex;
}

function getLastModifiedDate(inputPath) {
	if (!inputPath) return null;

	let rawPath = normalizeGitPath(inputPath);

	const fullPath = path.isAbsolute(rawPath)
		? rawPath
		: path.join(process.cwd(), rawPath);

	const relPath = normalizeGitPath(path.relative(process.cwd(), fullPath) || rawPath);
	const cacheKey = relPath;
	const cached = lastModifiedCache.get(cacheKey);
	if (cached) return cached;

	const runMode = process.env.ELEVENTY_RUN_MODE;

	// Prefer git commit time so <lastmod> reflects what was pushed/deployed.
	// In `--serve`, git calls are very expensive (thousands of files) and slow down rebuilds,
	// so we use filesystem mtime instead.
	if (runMode !== "serve") {
		const idx = buildGitLastModifiedIndex();
		const fromIndex = idx.get(relPath);
		if (fromIndex) {
			lastModifiedCache.set(cacheKey, fromIndex);
			return fromIndex;
		}
	}

	try {
		const stat = fs.statSync(fullPath);
		const d = stat.mtime;
		lastModifiedCache.set(cacheKey, d);
		return d;
	} catch {
		return null;
	}
}

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {
	const isFastBuild = Boolean(process.env.FAST_BUILD);
	eleventyConfig.addGlobalData("isFastBuild", isFastBuild);

	// Removed manual authors.json loading. Eleventy will auto-load _data/authors.yaml and _data/authors.json as global data.
	eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
		if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
			return false;
		}
	});

	// Run Pagefind after a production build unless explicitly skipped.
	// Use `SKIP_PAGEFIND=1` locally if Pagefind isn't available on your platform.
	if (process.env.ELEVENTY_RUN_MODE === "build" && !process.env.SKIP_PAGEFIND) {
		eleventyConfig.on("eleventy.after", async () => {
			console.log("Running Pagefind search index...");
			try {
				// Prefer local dependency; avoid `npx` attempting network installs.
				execSync(
					[
						"npx --no-install pagefind",
						"--site _site",
						'--glob \"**/*.html\"',
						"--force-language en",
						// Skip author bio landing pages and the PDFs themselves.
						'--exclude \"**/bios/index.html\"',
						'--exclude \"**/bios.html\"',
						'--exclude \"**/bios.pdf\"',
					].join(" "),
					{ encoding: "utf-8" }
				);
			} catch (e) {
				console.error("Pagefind error:", e.message);
			}
		});
	}
// If use sveltia cms
//	eleventyConfig.addPassthroughCopy("sveltia.config.js");
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
	// Single shared markdown-it instance for the "md" template filter (memoized)
	const mdSimple = new markdownIt({ html: true, breaks: true, linkify: true });
	eleventyConfig.addFilter("md", memoize((content) => mdSimple.render(content || "")));

  let options = {
    html: true,
    breaks: true,
    linkify: true,
      permalink: true,
    typographer: true,
      permalinkClass: "direct-link",
      permalinkSymbol: "#"
  };

   let markdownLib = markdownIt(options).use(markdownItAttrs).use(markdownItFootnote).use(markdownItTableOfContents);
  eleventyConfig.setLibrary("md", markdownLib);
	  eleventyConfig.amendLibrary("md", mdLib => {
		mdLib.use(markdownItAnchor, {
			permalink: markdownItAnchor.permalink.ariaHidden({
				placement: "after",
				class: "header-anchor",
				symbol: "",
				ariaHidden: false,
			}),
			level: [1,2,3,4],
			slugify: eleventyConfig.getFilter("slugify")
		});
	});
	eleventyConfig.addPlugin(pluginTOC, {
		tags: ['h2', 'h3', 'h4', 'h5'],
		  id: 'toci', 
		  class: 'list-group',
		ul: true,
		flat: true,
		wrapper: 'div'
	  });

	if (!isFastBuild) {
		eleventyConfig.addPlugin(IdAttributePlugin, {
			slugify: (text) => {
				const slug = eleventyConfig.getFilter("slugify")(text);
				return `print-${slug}`;
			},
		});
	}


	eleventyConfig.addFilter("getAuthorObj", (authorsCollection, authorKey) => {
        if (!authorKey || !authorsCollection) return null;
        return authorsCollection.find(author => {
            const key = author.data?.key || author.fileSlug;
            return key === authorKey.trim();
        });
    });

	eleventyConfig.addFilter("authorSlug", memoize((name) => authorSlug(name)));
	eleventyConfig.addFilter("authorsToArray", memoize((authorField) =>
		splitAuthors(authorField).map(authorSlug).filter(Boolean)
	));

	eleventyConfig.addFilter("lastModifiedDate", (inputPath) =>
		getLastModifiedDate(inputPath)
	);
eleventyConfig.addFilter("getPostsByAuthor", (posts, authorKey) => {
    if (!posts || !authorKey) return [];
    const targetKey = String(authorKey).trim().toLowerCase();
    return posts.filter(post => {
        const postAuthorData = post.data.author;
        if (!postAuthorData) return false;
        const authors = String(postAuthorData).split(',').map(a => a.trim().toLowerCase());
        return authors.includes(targetKey);
    });
});
	eleventyConfig.addCollection("authors", function(collectionApi) {
        return collectionApi.getFilteredByGlob("content/authors/*.md").sort((a, b) => {
            const nameA = (a.data.name || a.data.title || "").toLowerCase();
            const nameB = (b.data.name || b.data.title || "").toLowerCase();
            return nameA.localeCompare(nameB);
        });
    });

	// Copy static archive assets (PDFs/images) so /archives/* links resolve.
	// Copying the full directory (incl. markdown) is slow and can be unstable in --serve.
	eleventyConfig.addPassthroughCopy("content/archives/**/*.pdf", { concurrency: 16 });
	eleventyConfig.addPassthroughCopy("content/archives/**/*.{jpg,jpeg,png,gif,webp,svg}", {
		concurrency: 16,
	});
eleventyConfig.addCollection("archives", function(collectionApi) {
        return collectionApi.getFilteredByGlob("content/archives/**/*.md");
    });

	eleventyConfig.addCollection("sitemaps", function (collectionApi) {
		return collectionApi
			.getFilteredByGlob("content/sitemap/*.xml.njk")
			.sort((a, b) => (a.url || "").localeCompare(b.url || ""));
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
			name: "all",
			limit: 20,
		},
		metadata: {
			language: "en",
			title:
				"Editorial",
			subtitle:
				"Editorial 11ty.",
			base: "https://www.example.com/",
			author: {
				name: "adamdjbrett",
			},
		},
	});

	// Image optimization: transforms <img> tags to responsive formats.
	// In --serve mode, images are only processed on-request for speed.
	eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		extensions: "html",
		formats: ["avif", "webp", "auto"],
		defaultAttributes: {
			loading: "lazy",
			decoding: "async",
		},
		transformOnRequest: process.env.ELEVENTY_RUN_MODE === "serve",
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

	// In `--serve`, avoid copying large passthrough trees into `_site`—serve them directly.
	serverPassthroughCopyBehavior: "passthrough",
	

	dir: {
		input: "content", // default: "."
		includes: "../_includes", // default: "_includes" (`input` relative)
		data: "../_data", // default: "_data" (`input` relative)
		output: "_site",
	},
};
