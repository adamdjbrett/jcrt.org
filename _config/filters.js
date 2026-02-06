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

    eleventyConfig.addFilter("sortAlphabetically", (strings) =>
        [...(strings || [])].sort((a, b) =>
            String(a ?? "").localeCompare(String(b ?? ""))
        )
    );
eleventyConfig.addFilter("validImage", function(imgUrl, fallback) {
    if (!imgUrl || imgUrl === "" || imgUrl === "null" || imgUrl === undefined) {
        return fallback;
    }
    return imgUrl;
});

eleventyConfig.addFilter("unique", function(array) {
    if (!Array.isArray(array)) return [];
    return [...new Set(array)];
});
    // --- Custom Business Logic Filters ---
    eleventyConfig.addFilter("filterByTag", (collection, tag) => {
        if (!tag || !collection) return collection;
        return collection.filter(item => {
            const tags = item.data.tags || [];
            return Array.isArray(tags) ? tags.includes(tag) : tags === tag;
        });
    });
eleventyConfig.addFilter("lastModifiedDate", (dateObj) => {
  const date = new Date(dateObj);
  if (isNaN(date.getTime())) {
    return new Date().toISOString();
  }

  return date.toISOString();
});
eleventyConfig.addCollection("religioustheory", function(collectionApi) {
  return collectionApi.getFilteredByGlob("content/religioustheory/**/*")
    .filter(item => {
      const isIndex = item.inputPath.includes("index.md");
      const isContent = item.inputPath.endsWith(".md") || item.inputPath.endsWith(".html");
      
      return !isIndex && isContent;
    });
});

eleventyConfig.addFilter("isoDate", (dateObj) => {
    if (!dateObj) return new Date().toISOString();
    return new Date(dateObj).toISOString();
});
    eleventyConfig.addFilter("postDate", (dateObj) => {
        return new Date(dateObj).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });
  eleventyConfig.addFilter("currentYear", () => DateTime.now().toFormat("yyyy"));

eleventyConfig.addFilter("categoryTheory", function(posts) {
    let catSet = new Set();
    if (!Array.isArray(posts)) return [];
    
    posts.forEach(post => {
        if (post.categories && Array.isArray(post.categories)) {
            post.categories.forEach(cat => catSet.add(cat));
        }
    });
    return Array.from(catSet);
});
eleventyConfig.addFilter("tagTheory", function(posts) {
    let tagSet = new Set();
    if (!Array.isArray(posts)) return [];
    
    posts.forEach(post => {
        if (post.tags && Array.isArray(post.tags)) {
            post.tags.forEach(tag => tagSet.add(tag));
        }
    });
    return Array.from(tagSet);
});

eleventyConfig.addFilter("hasTagTheory", function(postTags, targetTag) {
    if (!Array.isArray(postTags)) return false;
    return postTags.includes(targetTag);
});

eleventyConfig.addFilter("hasCategoryTheory", function(postCategories, targetCategory) {
    if (!Array.isArray(postCategories)) return false;
    return postCategories.includes(targetCategory);
});
eleventyConfig.addCollection("issueList", function(collectionApi) {
    const allEntries = collectionApi.getAll();
    const issues = [];
    const archivePath = "/archives/"; 

    allEntries.forEach(entry => {
        if (entry.inputPath.includes(archivePath) && entry.inputPath.endsWith('/index.njk')) {
            const parts = entry.inputPath.split('/');
            if (parts.length > 3) { 
                const season = String(entry.data.season || "0").padStart(3, '0');
                const issue = String(entry.data.issue || "0").padStart(3, '0');
                issues.push({
                    entry: entry,
                    sortKey: `${season}.${issue}`
                });
            }
        }
    });

    return issues.sort((a, b) => b.sortKey.localeCompare(a.sortKey));
});

eleventyConfig.addCollection("onlyIssues", function(collectionApi) {
    return collectionApi.getFilteredByGlob("content/archives/**/index.njk").sort((a, b) => {
        const aKey = `${String(a.data.season).padStart(3, '0')}.${String(a.data.issue).padStart(3, '0')}`;
        const bKey = `${String(b.data.season).padStart(3, '0')}.${String(b.data.issue).padStart(3, '0')}`;
        return bKey.localeCompare(aKey);
    });
});
eleventyConfig.addCollection("archivesSorted", function(collectionApi) {
  const items = collectionApi.getFilteredByGlob("content/archives/**/*.md");
  
  console.log(`🔍 Debug: Found ${items.length} files in archives`);

  return items.sort((a, b) => {
    const vA = a.data.volume || 0;
    const iA = a.data.issue || 0;
    const vB = b.data.volume || 0;
    const iB = b.data.issue || 0;

    const aKey = `${String(vA).padStart(3, '0')}.${String(iA).padStart(3, '0')}`;
    const bKey = `${String(vB).padStart(3, '0')}.${String(iB).padStart(3, '0')}`;
    
    return bKey.localeCompare(aKey); // Urutan terbaru
  });
});

};
