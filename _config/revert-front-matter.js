/**
 * Script to remove eleventyComputed blocks from all index.njk files
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const archivesDir = path.join(__dirname, '../content/archives');

async function processFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    
    // Check if file has eleventyComputed block
    if (!content.includes('eleventyComputed:')) {
      return false;
    }
    
    // Remove eleventyComputed block (from "eleventyComputed:" to the line before "---")
    content = content.replace(/\neleventyComputed:\s*\n\s*permalink:\s*\n(?:\s*-\s*"[^"]+"\s*\n)+/g, '\n');
    
    await fs.writeFile(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔧 Removing eleventyComputed blocks from archive files...');
  
  try {
    const entries = await fs.readdir(archivesDir, { withFileTypes: true });
    let count = 0;
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const indexPath = path.join(archivesDir, entry.name, 'index.njk');
        try {
          await fs.access(indexPath);
          if (await processFile(indexPath)) {
            count++;
          }
        } catch {
          // File doesn't exist, skip
        }
      }
    }
    
    console.log(`✅ Processed ${count} files`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
