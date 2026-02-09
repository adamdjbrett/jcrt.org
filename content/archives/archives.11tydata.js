function normalizePermalink(value) {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

export default {
  title: "Journal for Cultural and Religious Theory",
  layout: "archive-post.njk",
  eleventyComputed: {
    jsonEntry: (data) => {
      const pagePermalink = normalizePermalink(data.page?.url);
      // theory_archive.json content is restricted to /religioustheory/ routes only.
      if (!pagePermalink || !pagePermalink.startsWith("/religioustheory/")) {
        return null;
      }

      const posts = Array.isArray(data.theory?.posts) ? data.theory.posts : [];
      if (!posts.length) return null;

      const explicitPermalink = normalizePermalink(
        data.theoryPermalink ?? data.sourcePermalink ?? null
      );
      if (explicitPermalink) {
        const byExplicitPermalink = posts.find(
          (post) => normalizePermalink(post.permalink) === explicitPermalink
        );
        if (byExplicitPermalink) return byExplicitPermalink;
      }

      const byPagePermalink = posts.find(
        (post) => normalizePermalink(post.permalink) === pagePermalink
      );
      if (byPagePermalink) return byPagePermalink;

      const explicitSlug = data.theorySlug ?? data.sourceSlug ?? null;
      if (explicitSlug) {
        return posts.find((post) => post.slug === explicitSlug) ?? null;
      }

      return null;
    },
    pdfUrl: (data) => {
      const slug = data.page.fileSlug;
      if (!slug || slug === "index") return null;
      const fileName = data.pdf ?? `${slug.charAt(0).toUpperCase() + slug.slice(1)}.pdf`;
      const folder = data.page.filePathStem.substring(0, data.page.filePathStem.lastIndexOf('/'));
      return `${folder}/${fileName}`;
    },
    articleNumber: (data) => parseInt(data.article_number, 10) || 999,
    tags: (data) => {
      const keywords = data.keywords ?? [];
      const tagArray = Array.isArray(keywords) ? keywords : String(keywords).split(",");
      return [...new Set(tagArray.map(t => String(t).trim()).filter(Boolean))];
    }
  }
};
