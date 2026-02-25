export default {
  title: "Journal for Cultural and Religious Theory",
  layout: "archive-post.njk",
  eleventyComputed: {
    pdfUrl: (data) => {
      const slug = data.page.fileSlug;
      if (!slug || slug === "index") return null;
      const fileName = data.pdf ?? `${slug.charAt(0).toUpperCase() + slug.slice(1)}.pdf`;
      const folder = data.page.filePathStem.substring(0, data.page.filePathStem.lastIndexOf('/'));
      return `${folder}/${fileName}`;
    },
    risCitationUrl: (data) => {
      const slug = data.page.fileSlug;
      if (!slug || slug === "index") return null;
      const issue = (data.page.filePathStem || "").split("/").slice(-2, -1)[0];
      if (!issue) return null;
      return `/citations/archives/${issue}/${slug}.ris`;
    },
    jsonCitationUrl: (data) => {
      const slug = data.page.fileSlug;
      if (!slug || slug === "index") return null;
      const issue = (data.page.filePathStem || "").split("/").slice(-2, -1)[0];
      if (!issue) return null;
      return `/citations/archives/${issue}/${slug}.csl.json`;
    },
    articleNumber: (data) => parseInt(data.article_number, 10) || 999,
    tags: (data) => {
      const manualTags = Array.isArray(data.tags) ? data.tags : [];
      const keywords = data.keywords ?? [];
      const keywordArray = Array.isArray(keywords) ? keywords : String(keywords).split(",");
      const essentialTags = ["archives"];
      const combined = [...manualTags, ...keywordArray, ...essentialTags];
      return [...new Set(combined.map(t => String(t).trim()).filter(Boolean))];
    }
  }
};
