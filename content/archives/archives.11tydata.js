export default {
    title: "Journal for Cultural and Religious Theory",
    eleventyComputed: {
        tags: (data) => {
            const keywords = data.keywords;
            if (Array.isArray(keywords)) {
                return keywords.map((item) => String(item).trim()).filter(Boolean);
            }
            if (typeof keywords === "string") {
                return keywords
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean);
            }
            return [];
        },
    },
};
