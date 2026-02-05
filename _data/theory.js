import EleventyFetch from "@11ty/eleventy-fetch";
import matter from "gray-matter";
import path from "path";
import fs from "fs";
import yaml from "js-yaml";
import AdmZip from "adm-zip";

export default async function() {
    const dataPath = path.join(process.cwd(), "_data/theory_archive.json");
    
    // Fast path: In CI, use cached theory_archive.json to skip ZIP download (~12s savings)
    if (process.env.USE_CACHED_THEORY === "1" && fs.existsSync(dataPath)) {
        console.log("[Theory] Using cached theory_archive.json (CI mode)");
        return JSON.parse(fs.readFileSync(dataPath, "utf8"));
    }
    
    const metadataPath = path.join(process.cwd(), "_data/metadata.yaml");
    const metadata = yaml.load(fs.readFileSync(metadataPath, "utf8"));
    const { github_user: OWNER, github_repo: REPO, branch: BRANCH = "main" } = metadata;
    const zipUrl = `https://github.com/${OWNER}/${REPO}/archive/refs/heads/${BRANCH}.zip`;

    try {
        // 1. Download ZIP (Cache 1 hari)
        const zipBuffer = await EleventyFetch(zipUrl, {
            duration: "1d",
            type: "buffer"
        });

        const zip = new AdmZip(zipBuffer);
        const zipEntries = zip.getEntries();

        let posts = [];
        let pages = [];
        const usedSlugs = new Set();

        // 2. Proses Ekstraksi
        zipEntries.forEach((entry) => {
            const entryPath = entry.entryName;
            
            if (entryPath.endsWith(".md") && !entry.isDirectory && !path.basename(entryPath).startsWith("._")) {
                let rawContent = entry.getData().toString("utf8")
                    .replace(/\u2028/g, '\n')
                    .replace(/\u2029/g, '\n')
                    .replace(/\r\n/g, '\n');

                const { data, content } = matter(rawContent);
                
                // Ambil slug dasar
                let baseSlug = path.basename(entryPath, ".md");

                // Jamin keunikan slug (Solusi Fatal Error Duplicate Permalink)
                let finalSlug = baseSlug;
                let counter = 1;
                while (usedSlugs.has(finalSlug)) {
                    finalSlug = `${baseSlug}-${counter}`;
                    counter++;
                }
                usedSlugs.add(finalSlug);

                const item = { 
                    ...data, 
                    content: content.trim(), 
                    slug: finalSlug, 
                    path: entryPath 
                };

                if (entryPath.includes("/content/posts/")) {
                    posts.push(item);
                } else if (entryPath.includes("/content/pages/")) {
                    pages.push(item);
                }
            }
        });

        // 3. Mapping Author
        const authorsPath = path.join(process.cwd(), "_data/authors.json");
        const authors = fs.existsSync(authorsPath) ? JSON.parse(fs.readFileSync(authorsPath, "utf8")) : {};

        const formattedPosts = posts.map(post => ({
            ...post,
            authorData: authors[post.author] || { name: post.author || "Editors" }
        })).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

        const nextData = {
            posts: formattedPosts,
            pages: pages,
            authors: authors,
        };

        // Avoid rewriting the cache file on every watch/build—this prevents noisy git diffs
        // and reduces the chance of rebuild loops.
        if (fs.existsSync(dataPath)) {
            try {
                const previous = JSON.parse(fs.readFileSync(dataPath, "utf8"));
                const prevComparable = {
                    posts: previous?.posts || [],
                    pages: previous?.pages || [],
                    authors: previous?.authors || {},
                };

                if (JSON.stringify(prevComparable) === JSON.stringify(nextData)) {
                    console.log(`[Theory] No changes: using existing theory_archive.json.`);
                    return previous;
                }
            } catch {
                // ignore parse errors and overwrite below
            }
        }

        const finalData = { ...nextData, lastUpdated: new Date().toISOString() };
        fs.writeFileSync(dataPath, JSON.stringify(finalData, null, 2));

        console.log(`[Theory] Updated: ${formattedPosts.length} posts saved to archive.`);
        return finalData;

    } catch (error) {
        console.error("[Theory] Error, menggunakan data lama:", error.message);
        if (fs.existsSync(dataPath)) {
            return JSON.parse(fs.readFileSync(dataPath, "utf8"));
        }
        return { posts: [], pages: [], authors: {} };
    }
}
