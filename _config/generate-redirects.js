/**
 * Post-build script to generate redirect HTML files for legacy extensions
 * Creates .htm, .shtml, .xhtml, and .htmx redirect files that point to .html
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const siteDir = path.join(__dirname, '../_site');
const extensions = ['htm', 'shtml', 'xhtml', 'htmx'];

// Function to create a simple HTML redirect page
function createRedirectHTML(targetPath) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=${targetPath}">
  <meta name="robots" content="noindex">
  <link rel="canonical" href="${targetPath}">
  <title>Redirecting...</title>
  <script>window.location.href="${targetPath}";</script>
</head>
<body>
  <p>Redirecting to <a href="${targetPath}">${targetPath}</a>...</p>
</body>
</html>`;
}

// Recursively find all index.html files
async function findIndexFiles(dir, base = '') {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(base, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...await findIndexFiles(fullPath, relativePath));
    } else if (entry.name === 'index.html') {
      files.push({
        fullPath,
        relativePath: base,
        webPath: base.replace(/\\/g, '/') || '/'
      });
    }
  }
  
  return files;
}

async function main() {
  console.log('🔄 Generating redirect files for legacy extensions...');
  
  try {
    const indexFiles = await findIndexFiles(siteDir);
    let count = 0;
    
    for (const file of indexFiles) {
      const dir = path.dirname(file.fullPath);
      const webBase = file.webPath === '/' ? '/' : `/${file.webPath}/`;
      
      // Create redirect files for each extension
      for (const ext of extensions) {
        const redirectFile = path.join(dir, `index.${ext}`);
        const targetPath = `${webBase}index.html`;
        const html = createRedirectHTML(targetPath);
        
        await fs.writeFile(redirectFile, html, 'utf-8');
        count++;
      }
    }
    
    console.log(`✅ Generated ${count} redirect files (${indexFiles.length} locations × ${extensions.length} extensions)`);
  } catch (error) {
    console.error('❌ Error generating redirects:', error);
    process.exit(1);
  }
}

main();
