import EleventyFetch from "@11ty/eleventy-fetch";
import matter from "gray-matter";
import path from "path";
import fs from "fs";
import yaml from "js-yaml";
import AdmZip from "adm-zip";

export default async function() {
    const outputDir = path.join(process.cwd(), "content/religioustheory/posts");
    
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const metadataPath = path.join(process.cwd(), "_data/metadata.yaml");
    const metadata = yaml.load(fs.readFileSync(metadataPath, "utf8"));
    
    const { github_user: OWNER, github_repo: REPO, branch: BRANCH = "main" } = metadata;
    const zipUrl = `https://github.com/${OWNER}/${REPO}/archive/refs/heads/${BRANCH}.zip`;

    console.log(`[TheorySync] Fetching from: ${OWNER}/${REPO}`);

    try {
        const zipBuffer = await EleventyFetch(zipUrl, {
            duration: "1d",
            type: "buffer"
        });

        const zip = new AdmZip(zipBuffer);
        const zipEntries = zip.getEntries();
        const usedSlugs = new Set();

        zipEntries.forEach((entry) => {
            const entryPath = entry.entryName;
            
            if (entryPath.endsWith(".md") && entryPath.includes("/content/posts/")) {
                let rawContent = entry.getData().toString("utf8")
                    .replace(/\u2028/g, '\n')
                    .replace(/\u2029/g, '\n')
                    .replace(/\r\n/g, '\n');

                const { data, content } = matter(rawContent);
                
                let baseSlug = path.basename(entryPath, ".md");
                let finalSlug = data.slug || baseSlug;

                let counter = 1;
                while (usedSlugs.has(finalSlug)) {
                    finalSlug = `${baseSlug}-${counter}`;
                    counter++;
                }
                usedSlugs.add(finalSlug);

                
                const postDate = data.date ? new Date(data.date) : new Date();
                const year = postDate.getFullYear();
                const month = String(postDate.getMonth() + 1).padStart(2, '0');

                const newFrontMatter = {
                    title: data.title || metadata.title,
                    date: data.date || postDate.toISOString(),
                    author: data.author || "editors",
                    image: data.image || "/images/logos/JCRT.svg",
                    categories: Array.isArray(data.categories) ? data.categories : ["General"],
                    layout: "theory.njk", 
                    slug: finalSlug,
                    tags: ["theoryPosts"] 
                };

                const finalFileContent = matter.stringify(content, newFrontMatter);
                
                fs.writeFileSync(path.join(outputDir, `${finalSlug}.md`), finalFileContent);
            }
        });

        console.log(`[TheorySync] Done! Data synced to content/religioustheory/posts`);
        return [];
    } catch (err) {
        console.error("[TheorySync] Error during sync:", err.message);
        return [];
    }
};