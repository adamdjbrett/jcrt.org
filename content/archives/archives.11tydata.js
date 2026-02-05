export default {
    title: "Journal for Cultural and Religious Theory",
    eleventyComputed: {
        // Look up matching entry from theory_archive.json by slug
        jsonEntry: (data) => {
            const slug = data.page.fileSlug;
            return data.theory?.posts?.find(
                (p) => p.slug === slug || p.permalink?.includes(slug)
            ) ?? null;
        },

        // Build PDF URL from frontmatter `pdf` field or default to CapitalizedSlug.pdf
        pdfUrl: (data) => {
            const slug = data.page.fileSlug;
            if (!slug || slug === "index") return null;
            const fileName = data.pdf ?? `${slug.charAt(0).toUpperCase() + slug.slice(1)}.pdf`;
            const folder = data.page.filePathStem.substring(
                0,
                data.page.filePathStem.lastIndexOf("/")
            );
            return `${folder}/${fileName}`;
        },

        // Numeric article number for sorting (falls back to 999 if missing)
        articleNumber: (data) => parseInt(data.article_number, 10) || 999,

        // Build tags from keywords, deduplicating
        tags: (data) => {
            const keywords = data.keywords ?? [];
            const tagArray = Array.isArray(keywords)
                ? keywords
                : String(keywords).split(",");
            return [...new Set(tagArray.map((t) => String(t).trim()).filter(Boolean))];
        },
    },
};
