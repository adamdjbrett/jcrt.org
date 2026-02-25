export default {
	tags: [
		"theoryPosts"
	],
	"layout": "theory.njk",
	eleventyComputed: {
		risCitationUrl: (data) => {
			const slug = data?.page?.fileSlug;
			if (!slug) return null;
			return `/citations/religioustheory/${slug}.ris`;
		},
		jsonCitationUrl: (data) => {
			const slug = data?.page?.fileSlug;
			if (!slug) return null;
			return `/citations/religioustheory/${slug}.json`;
		},
	},
};
