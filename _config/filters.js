import { DateTime } from "luxon";

export default function(eleventyConfig) {
    // --- Date Filters ---
    eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
        if (!dateObj) return "";
        return DateTime.fromJSDate(new Date(dateObj), { zone: zone || "utc" }).toFormat(format || "dd LLLL yyyy");
    });

    eleventyConfig.addFilter("htmlDateString", (dateObj) => {
        if (!dateObj) return "";
        return DateTime.fromJSDate(new Date(dateObj), { zone: "utc" }).toFormat('yyyy-LL-dd');
    });
    
    // --- Collection & Array Filters ---
    // Gunakan optional chaining (?.) agar tidak crash jika array kosong
    eleventyConfig.addNunjucksFilter("limit", (arr, limit) => (arr || []).slice(0, limit));

    eleventyConfig.addFilter("head", (array, n) => {
        if (!Array.isArray(array) || array.length === 0) return [];
        if (n < 0) return array.slice(n);
        return array.slice(0, n);
    });

    // --- Utility Filters ---
    eleventyConfig.addFilter("min", (...numbers) => Math.min.apply(null, numbers));

    eleventyConfig.addFilter("getKeys", target => (target ? Object.keys(target) : []));

    eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
        return (tags || []).filter(tag => ["all", "posts", "authors", "nav"].indexOf(tag) === -1);
    });

    eleventyConfig.addFilter("sortAlphabetically", strings =>
        [...(strings || [])].sort((a, b) => a.localeCompare(b))
    );

    // --- Custom Business Logic Filters ---
    eleventyConfig.addFilter("filterByTag", (collection, tag) => {
        if (!tag || !collection) return collection;
        return collection.filter(item => {
            const tags = item.data.tags || [];
            return Array.isArray(tags) ? tags.includes(tag) : tags === tag;
        });
    });

eleventyConfig.addCollection("religioustheory", function(collectionApi) {
  return collectionApi.getFilteredByGlob("content/religioustheory/**/*")
    .filter(item => {
      const isIndex = item.inputPath.includes("index.md");
      const isContent = item.inputPath.endsWith(".md") || item.inputPath.endsWith(".html");
      
      return !isIndex && isContent;
    });
});


};