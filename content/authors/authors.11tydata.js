export default {
	layout: "authors.njk",
	eleventyComputed: {
		fileSlug: (data) => data.page.fileSlug,
		title: (data) => data.name || data.title || data.page.fileSlug,
		description: (data) =>
			data.affiliation || data.organization || data.description || "",
		image: (data) => (data.image && String(data.image).trim() ? data.image : "/img/jcrt.svg"),
		key: (data) => data.key || data.page.fileSlug,
		permalink: (data) => `/authors/${data.page.fileSlug}/`,
	},
};
