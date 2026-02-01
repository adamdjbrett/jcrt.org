import EleventyFetch from "@11ty/eleventy-fetch";
import matter from "gray-matter";
import path from "path";
import fs from "fs";
import yaml from "js-yaml";
import AdmZip from "adm-zip";

export default async function() {
    const cachePath = path.join(process.cwd(), "theory_data_cache.json");

    // 1. Prioritaskan Cache Lokal (Cepat)
    if (fs.existsSync(cachePath)) {
        return JSON.parse(fs.readFileSync(cachePath, "utf8"));
    }

    const metadataPath = path.join(process.cwd(), "_data/metadata.yaml");
    const metadata = yaml.load(fs.readFileSync(metadataPath, "utf8"));
    const { github_user: OWNER, github_repo: REPO, branch: BRANCH = "main" } = metadata;
    const zipUrl = `https://github.com/${OWNER}/${REPO}/archive/refs/heads/${BRANCH}.zip`;

    try {
        const zipBuffer = await EleventyFetch(zipUrl, { duration: "1d", type: "buffer" });
        const zip = new AdmZip(zipBuffer);
        const entries = zip.getEntries();

        let posts = [], pages = [];
        const usedSlugs = new Set(); // Mencegah DuplicatePermalinkOutputError

        entries.forEach(entry => {
            if (entry.entryName.endsWith(".md") && !entry.isDirectory) {
                const { data, content } = matter(entry.getData().toString("utf8"));
                
                // Ambil nama file asli tanpa pemotongan (DEFAULT)
                let baseSlug = path.basename(entry.entryName, ".md");
                
                // Cek keunikan: Jika slug sudah dipakai, tambah angka di belakangnya
                let finalSlug = baseSlug;
                let counter = 1;
                while (usedSlugs.has(finalSlug)) {
                    finalSlug = `${baseSlug}-${counter}`;
                    counter++;
                }
                usedSlugs.add(finalSlug);

                const item = { 
                    ...data, 
                    content: content ? content.trim() : "", 
                    slug: finalSlug 
                };
                
                if (entry.entryName.includes("/posts/")) {
                    posts.push(item);
                } else if (entry.entryName.includes("/pages/")) {
                    pages.push(item);
                }
            }
        });

        const finalData = { 
            posts: posts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)), 
            pages, 
            lastUpdated: new Date() 
        };

        fs.writeFileSync(cachePath, JSON.stringify(finalData, null, 2));
        console.log(`[Theory] Success: ${posts.length} posts loaded.`);
        return finalData;

    } catch (e) {
        console.error("[Theory] Error:", e.message);
        return { posts: [], pages: [] };
    }
}