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

Optimized `deploy-xmit.yml` for faster builds (~3-7 seconds including Pagefind):

| Optimization | Description |
|--------------|-------------|
| `npm ci` with flags | Uses `--prefer-offline --no-audit --no-fund` for faster installs |
| Node.js caching | Added `cache: 'npm'` to cache dependencies between runs |
| Removed 2s delay | Eliminated Windows file-lock workaround (unnecessary on Linux CI) |
| Direct Pagefind | Run Pagefind in workflow instead of via eleventy.after hook |
| `--quiet` flag | Reduced Eleventy logging overhead |
| Parallel compression | Uses async `Promise.all()` for gzip + brotli |
| Brotli quality 6 | ~10x faster than quality 11 with minimal size difference |
| Streamlined steps | Removed verify step, cleaner deploy logic |

**Environment Variables:**
- `SKIP_PAGEFIND=1` - Set in CI to skip Pagefind in eleventy.config.js (run directly in workflow)
- `ELEVENTY_RUN_MODE=build` - Triggers production build behavior

## Editorial Theme nicely coded examples
- [ghost](https://editorial.ghost.io/)
- [last update 2 weeks ago jekyll option](https://github.com/TurkuNLP/turkunlp.github.io)
- [andrew - older but still good css](https://andrewbanchich.github.io/editorial-jekyll-theme/)

## Changelog
1. increase the size of the nav and the css to match <https://editorial.ghost.io>
2. why does it say "JUDUL TIDAK DITEMUKAN - PERLU EDIT MANUAL" everywhere?
   - 
3. change "Erat Lacinia" to Trending Keywords. 
    1. Portitor ullamcorper change to religious theory make clickable
    2. Elbuso Mendano mchange to media theory make clickable
    3. Klompen Capir - cultural theory make clickable
    4. Bulgoso Dugonge - political theory make clickable
