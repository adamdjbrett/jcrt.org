module.exports = {
	layout: false,
	eleventyExcludeFromCollections: true,
	eleventyComputed: {
		// Sitemaps are primarily for production. Skipping them in `--serve` speeds up local dev.
		permalink: (data) => {
			if (process.env.ELEVENTY_RUN_MODE === "serve" || data.isFastBuild) {
				return false;
			}
			return data.permalink;
		},
	},
};
