import {
	IdAttributePlugin,
	InputPathToUrlTransformPlugin,
	HtmlBasePlugin,
} from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginNavigation from "@11ty/eleventy-navigation";
import yaml from "js-yaml";
import { execSync } from "child_process";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import markdownItFootnote from "markdown-it-footnote";
import markdownItAttrs from 'markdown-it-attrs';
import markdownItTableOfContents from "markdown-it-table-of-contents";
import pluginTOC from 'eleventy-plugin-toc';
import pluginFilters from "./_config/filters.js";
import fs from "fs";
import path from 'path'; 
import { fileURLToPath } from 'url';

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {
	// Removed manual authors.json loading. Eleventy will auto-load _data/authors.yaml and _data/authors.json as global data.
	eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
		if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
			return false;
		}
	});

if (process.env.ELEVENTY_RUN_MODE === "build") {
    eleventyConfig.on("eleventy.after", () => {
        console.log("Running Pagefind search index...");
        try {
            execSync(`npx pagefind --site _site --glob "**/*.html"`, {
                encoding: "utf-8",
            });
        } catch (e) {
            console.error("Pagefind skipped to prevent file locking.");
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

	eleventyConfig.addBundle("css", {
		toFileDirectory: "dist",
		bundleHtmlContentFromSelector: "style",
	});
	eleventyConfig.addBundle("js", {
		toFileDirectory: "dist",
		bundleHtmlContentFromSelector: 'script[type="module"]',
	});

	eleventyConfig.addPlugin(pluginSyntaxHighlight, {
		preAttributes: { tabindex: 0 },
	});
	eleventyConfig.addPlugin(pluginNavigation);
	eleventyConfig.addPlugin(HtmlBasePlugin);
	eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);
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

	eleventyConfig.addPlugin(IdAttributePlugin, {
		slugify: (text) => {
			const slug = eleventyConfig.getFilter("slugify")(text);
			return `print-${slug}`;
		},
	});
eleventyConfig.addTransform("kill-wp-garbage", function (content) {
        const outputPath = this.page.outputPath;
        
        // Pastikan outputPath ada dan bertipe string
        const isHtml = outputPath && outputPath.endsWith(".html");
        const isTargetDir = outputPath && outputPath.includes("religioustheory");

		if (isHtml && isTargetDir) {
			let result = content;
			result = result.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, "");
			result = result.replace(/class="[^"]*wp-[^"]*"/gi, "");
			result = result.replace(/style="[^"]*"/gi, "");
			result = result.replace(/<[^>]*data-wp[^>]*>/g, "");
			return result;
		}
        return content;
    });
// Author by bio

    eleventyConfig.addFilter("getAuthorObj", (authorsCollection, authorKey) => {
        if (!authorKey || !authorsCollection) return null;
        return authorsCollection.find(author => {
            const key = author.data?.key || author.fileSlug;
            return key === authorKey.trim();
        });
    });
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
eleventyConfig.addPassthroughCopy({ "content/archives": "archives" }, {
        copyOptions: {
            overwrite: true
        }
    });
eleventyConfig.addCollection("archives", function(collectionApi) {
        return collectionApi.getFilteredByGlob("content/archives/**/*.md");
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

	eleventyConfig.addPlugin(pluginFilters);

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
