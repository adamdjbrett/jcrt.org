import matter from "gray-matter";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import AdmZip from "adm-zip";

const metadata = yaml.load(fs.readFileSync("./_data/metadata.yaml", "utf8"));
const { github_user: OWNER, github_repo: REPO, branch: BRANCH = "main" } = metadata;

async function syncViaZip() {
    const zipUrl = `https://github.com/${OWNER}/${REPO}/archive/refs/heads/${BRANCH}.zip`;
    const outputPath = "./_data/theory_archive.json";

    console.log(`Downloading ZIP from ${zipUrl}...`);

    try {
        const response = await fetch(zipUrl);
        if (!response.ok) throw new Error("Gagal download ZIP kawan.");
        
        const buffer = await response.arrayBuffer();
        const zip = new AdmZip(Buffer.from(buffer));
        const zipEntries = zip.getEntries();

        let posts = [];
        let pages = [];

        zipEntries.forEach((entry) => {
            const entryPath = entry.entryName;
            // Folder ZIP GitHub biasanya: repo-main/content/posts/...
            if (entryPath.endsWith(".md") && !entry.isDirectory) {
                const rawContent = entry.getData().toString("utf8");
                const { data, content } = matter(rawContent);
                const slug = path.basename(entryPath, ".md");

                if (entryPath.includes("/content/posts/")) {
                    posts.push({ ...data, content, slug, path: entryPath });
                } else if (entryPath.includes("/content/pages/")) {
                    pages.push({ ...data, content, slug, path: entryPath });
                }
            }
        });

        const finalData = { posts, pages, lastUpdated: new Date().toISOString() };
        fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));

        console.log(`\n--- BOOM! Sync Berhasil ---`);
        console.log(`Total Posts: ${posts.length}`);
        console.log(`Total Pages: ${pages.length}`);
        
    } catch (e) {
        console.error("Error kawan:", e.message);
    }
}

syncViaZip();