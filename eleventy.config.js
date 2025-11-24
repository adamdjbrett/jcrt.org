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
	eleventyConfig.addPassthroughCopy("sveltia.config.js");
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
  eleventyConfig.addFilter("byAuthor", (posts, authorKey) => {
  if (!posts || !Array.isArray(posts)) {
    return [];
  }
  
  // Bersihkan kunci penulis yang sedang dicari
  const targetKey = String(authorKey).trim();

  return posts.filter(post => {
    const postAuthorData = post.data.author;

    if (!postAuthorData || typeof postAuthorData !== 'string') {
      return false; 
    }

    // Pecah string penulis dan bersihkan setiap kuncinya
    const authors = postAuthorData.split(',')
      .map(a => a.trim());
    
    // Periksa apakah targetKey termasuk dalam daftar penulis postingan
    return authors.includes(targetKey);
  });
});
eleventyConfig.addFilter("getPostsByAuthor", (posts, authorKey) => {
  if (!posts || !Array.isArray(posts)) {
    return [];
  }

  // Langkah 1: Bersihkan (trim) kunci penulis yang sedang kita cari.
  const targetKey = String(authorKey).trim();

  return posts.filter(post => {
    const postAuthorData = post.data.author;

    if (!postAuthorData) {
      return false;
    }

    // Pastikan postAuthorData adalah string sebelum di-split
    if (typeof postAuthorData !== 'string') {
        // Jika data bukan string (misalnya, null atau objek yang tidak terduga), lewati.
        return false; 
    }

    // Langkah 2: Pecah string penulis dari front matter dan bersihkan setiap kuncinya.
    const authors = postAuthorData.split(',')
      .map(a => a.trim());
    
    // Langkah 3: Periksa apakah array penulis postingan (authors) 
    // mengandung kunci yang sedang dicari (targetKey).
    return authors.includes(targetKey);
  });
});

eleventyConfig.addFilter("getAuthors", (authors, label) => {
    let labels = label.split(','); 
    return authors.filter(a => labels.includes(a.key));
});
eleventyConfig.addFilter("findAuthorByKey", (authors, authorKey) => {
        if (!authorKey || !authors || !Array.isArray(authors)) return null;
        const key = String(authorKey).trim().toLowerCase();
        return authors.find(author => 
            String(author.key || '').trim().toLowerCase() === key
        );
    });
	
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

	eleventyConfig.on("eleventy.after", () => {
		execSync(`npx pagefind --site _site --glob \"**/*.html\"`, {
			encoding: "utf-8",
		});
	});

	eleventyConfig.addPlugin(IdAttributePlugin, {
		slugify: (text) => {
			const slug = eleventyConfig.getFilter("slugify")(text);
			return `print-${slug}`;
		},
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

	eleventyConfig.addPlugin(IdAttributePlugin, {});

	eleventyConfig.addShortcode("currentBuildDate", () => {
		return new Date().toISOString();
	});
}

export const config = {
	templateFormats: ["md", "njk", "html", "liquid", "11ty.js"],

	markdownTemplateEngine: "njk",

	htmlTemplateEngine: "njk",

	dir: {
		input: "content", // default: "."
		includes: "../_includes", // default: "_includes" (`input` relative)
		data: "../_data", // default: "_data" (`input` relative)
		output: "_site",
	},
};
