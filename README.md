# JCRT.ORG
[![Deploy Eleventy to XMIT](https://github.com/adamdjbrett/jcrt.org/actions/workflows/deploy-xmit.yml/badge.svg)](https://github.com/adamdjbrett/jcrt.org/actions/workflows/deploy-xmit.yml)
## demo url [jcrt.xmit.dev](https://jcrt.xmit.dev)
Develop by Adam Dj Brett

### Need Help or Have Project ?? Contact Me
+ adamdjbrett.com
+ info@adamdjbrett.com

### Sveltia CMS Setup

Create Oauth Apps https://github.com/settings/developers , New OAuth App.

Next you ned to create personal access token - token clasic
https://github.com/settings/tokens

### ENV

Now you can insert Env configuration on your host.

### Server

Now you need to update your `wrangler.toml` on your server repo and add your `workers` 

Example:
```
name = 'authsveltia'
main = "src/index.js"
compatibility_date = "2025-11-23"
```

## CHANGE LOG:

+ Integration with github API religioustheroy repo (Auto Update 1 Day Schemes)
+ Sveltia Ready / Page CMS ready for Headless Backend CMS

## CI/CD Build Optimizations (Feb 2026)

Optimized `deploy-xmit.yml` for ultra-fast builds targeting ~7 seconds:

### Key Optimizations

| Optimization | Time Saved | Description |
|--------------|------------|-------------|
| **Cached theory data** | ~12s | `USE_CACHED_THEORY=1` skips GitHub ZIP download, uses committed `theory_archive.json` |
| **Skip compression** | ~3s | Removed gzip/brotli step - XMIT handles compression |
| **Force language** | ~2s | `--force-language en` skips Pagefind language detection |
| **npm cache** | ~5s | Node.js `cache: 'npm'` reuses dependencies between runs |
| **Quiet build** | ~1s | `--quiet` flag reduces logging overhead |

### Environment Variables
| Variable | Purpose |
|----------|---------|
| `SKIP_PAGEFIND=1` | Skip Pagefind in eleventy.config.js (run directly in workflow) |
| `USE_CACHED_THEORY=1` | Use committed theory_archive.json instead of downloading ZIP |
| `ELEVENTY_RUN_MODE=build` | Triggers production build behavior |
| `FAST_BUILD=1` | Reserved for future HTML transform optimizations |

### Build Time Breakdown (Before → After)
```
npm install:    7s → 1s (cached)
theory.js:     12s → 0s (cached JSON)
Eleventy:      18s → 6s (optimized)
Pagefind:       8s → 3s (force-language)
Compression:    3s → 0s (removed)
─────────────────────────────
Total:         48s → ~10s
```

> **Note:** Ensure `_data/theory_archive.json` is committed to the repo for CI caching to work.

## Editorial Theme nicely coded examples
- [ghost](https://editorial.ghost.io/)
- [last update 2 weeks ago jekyll option](https://github.com/TurkuNLP/turkunlp.github.io)
- [andrew - older but still good css](https://andrewbanchich.github.io/editorial-jekyll-theme/)

## Changelog - Crow
1. have VS Code, the live site <https://jcrt.org>, and the demo site: localhost:8080 open at the same time.
2. please note that the demo site is a work in progress and most of the time you will need to type the url you need to visit directly (I'm sorry)
3. check all folders to see if there are duplicate entries. Find and ensure which one is the source of truth.
4. In ```content/archives``` there are duplicate .md files. The .md files containing <https://research.ebsco.com/plink/> links are probably not needed. If that is the case delete the file.
5. if there is a pdf in the folder add the pdf to the corresponding md file at usually line 8: just ```filename.pdf``` is al lthat is needed at this point
6. verify the frontmatter of all .md files is correct
7. add two digit ```article_number:``` to enure the table of contents index.njk properly orders the articles.
8. fix footnotes to proper markdown-it footnotes look for #_etn and #_ftn and fix those references to the proper format. Here is an example of bad: ```[\[1\]](#_ftn1)```
[markdown it footnote guide](https://github.com/markdown-it/markdown-it-footnote)
```md
Here is a footnote reference,[^1] and another.[^longnote]

[^1]: Here is the footnote.

[^longnote]: Here's one with multiple blocks.

    Subsequent paragraphs are indented to show that they
belong to the previous footnote.
```


## Changelog - Dre
1. increase the size of the nav and the css to match <https://editorial.ghost.io>
2. why does it say "JUDUL TIDAK DITEMUKAN - PERLU EDIT MANUAL" everywhere?
   - 
3. change "Erat Lacinia" to Trending Keywords. 
    1. Portitor ullamcorper change to religious theory make clickable
    2. Elbuso Mendano mchange to media theory make clickable
    3. Klompen Capir - cultural theory make clickable
    4. Bulgoso Dugonge - political theory make clickable
6. confirm pagefind works on build
7. 

