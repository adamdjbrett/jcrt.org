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

***
## CHANGELOG
## JCRT.org
**@Dre**
1. increase the size of the menu hamburger to be more like [editorial.ghost.io](https://editorial.ghost.io)
2. navigational bar with pagination for /archives/, /religioustheory/ like you see on <https://editorial.ghost.io> look for ```Page 1``` to see it

### /content/religioustheory
**@Dre**
1. /content/religious theory homepage should look visually the same as /content/.
2. what is the best way to set the metadata values for religioustheory homepage? 
3. Religious theory should show recent posts with images like <https://editorial.ghost.io>
4. there should be a /tags/ and /categories/ pages that show all tags and categories using ```<detail> and <summary>``` to make the accordion

## JCRT.org/archvies
**@Crow**
1. for each *.md in /content/archives 
    1. has title
    2. has author. default author is editors
    3. If it has a SINGLE author than there is an affilation
    4. if there is an abstract it is showing
    5. if there are keywords they are showing
    6. if there is a PDF (all *.md past the first four folders should have a .pdf) if the PDF is missing note it here on the ```readme.md```
    7. /archives/#.#/index.njk table of contents should match jcrt.com/archives/#.#/index.html order
    8. use sort_id IF no pdf is available otherwise use pages:
    9. make sure season matches jcrt.org/archives/#.# for that article
    10. check for duplicates remove duplicates
2. for each *.md in /content/authors/ make sure all authors have name and affiliation
3. In /content/religioustheory/index should show posts with images **@Dre**
4. In /content/archives/ - check all ```index.njk``` if jcrt.org/archives/#.#/index.html shows editors add them and ensure they display


## Missing PDFS
EDLINGER
Gaetano