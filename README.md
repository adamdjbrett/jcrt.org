# JCRT.ORG
[![Deploy Eleventy to XMIT](https://github.com/adamdjbrett/jcrt.org/actions/workflows/deploy-xmit.yml/badge.svg?branch=main)](https://github.com/adamdjbrett/jcrt.org/actions/workflows/deploy-xmit.yml)
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

## Version additions
### v0.5
+ Archives Post Layout
+ Sidebar Nav Fixed

### v0.4
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

## Changelog
### Dre
1. https://jcrt.xmit.dev/archives/  - DONE
    1. hide keywords
    2. in header show volume, issue, season, title in that order
    3. under header show in plain text the description (base on /#.#/index.njk) only if one is present. For example proper titles should be 
```## 24.1 - Summer 2025 - Special Issue on Religion and Bioethics - Table of Contents```
underneath as regular text
```
The following issue has resulted from a conference in the fall of 2024.  The conference was sponsored by the journal in collaboration with the University of Denver.
```

### Dre Cont
- TODO verify all sitemap XMLs are valid + every `<loc>` resolves to a real output file (including `/sitemaps/religioustheory/pages-sitemap.xml`) - DONE
- TODO ingest and fix `_data/errors.txt` (dev `--serve --incremental` heap OOM) - DONE
- TODO ensure a successful production build with correct absolute URLs (no `localhost` in deployed sitemaps) - DONE
- TODO optimize `.github/workflows/deploy-xmit.yml` (build + pagefind once, caching, speed) - DONE
 
## Crowcodes
- ~~TODO error: archive 24.1 XIAOQIAN ZHANG does not have files anywhere~~ adjb
- archives 24.1, 23.2, 23.1 done
- archives 22.2 done
- TODO archives 22.1 files dont look right at all, bios.md missing, none of the articles match the live site **live site is wrong someone overwrote the actual page and it wasnt us. adjb**
- archives 21.3, 21.2, 21.1,20.3 done
- ~~TODO archives 20.2 has four authors, none are given affiliations, none have cards in /authors~~ adjb
- archives 20.1, 19.3, 19.2, 19.1, 18.3 complete
- ~~TODO archives 18.2 "Speaking God’s Presence and Absence as Non-Contrastive Transcendent Distinction Joyce Ann Konigsburg" is listed but has no files, would be sort_id: 08~~ adjb
- ~~TODO archvives 18.2 "Religious Studies and Comparative Theology: An Appraisal Joshua Samuel, Union Theological Seminary" is listed but has no files, would be sort_id: 12~~ adjb
- archives 18.2, 18.1, 17.3 done
- 20260206: ARCHIVES 28% COMPLETE
