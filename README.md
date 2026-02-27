# JCRT.ORG
[![Deploy Eleventy to XMIT](https://github.com/adamdjbrett/jcrt.org/actions/workflows/deploy-xmit.yml/badge.svg?branch=main)](https://github.com/adamdjbrett/jcrt.org/actions/workflows/deploy-xmit.yml)
## demo url [jcrt.xmit.dev](https://jcrt.xmit.dev)
Develop by Adam Dj Brett

## Needs
1. netlify integration
2. after the domain name is activated impliement a DAM for pdfs and citations


### Need Help or Have Project ?? Contact Me
+ adamdjbrett.com
+ info@adamdjbrett.com

### Sveltia CMS Setup

1. Create a GitHub OAuth App:
   - Homepage URL: `https://jcrt.xmit.dev`
   - Callback URL: `https://jcrt-auth.adam.workers.dev/callback`
2. Deploy the CMS auth worker:
   - Worker code: `cms-auth-worker.js`
   - Wrangler config: `wrangler.auth.jsonc`
3. Set worker secrets:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
4. Keep `public/admin/config.yml` configured with:
   - `backend.base_url: https://jcrt-auth.adam.workers.dev`
   - `backend.auth_endpoint: auth`
5. Deploy the site worker separately using `wrangler.jsonc`.

### Cloudflare Deploy Commands

```bash
# Build site
npm ci
npm run build

# Deploy static site worker
npx wrangler deploy --config wrangler.jsonc

# Set auth worker secrets (one time / when rotated)
npx wrangler secret put GITHUB_CLIENT_ID --config wrangler.auth.jsonc
npx wrangler secret put GITHUB_CLIENT_SECRET --config wrangler.auth.jsonc

# Deploy auth worker
npx wrangler deploy --config wrangler.auth.jsonc
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
| **Skip compression** | ~3s | Removed gzip/brotli step - XMIT handles compression |
| **Force language** | ~2s | `--force-language en` skips Pagefind language detection |
| **npm cache** | ~5s | Node.js `cache: 'npm'` reuses dependencies between runs |
| **Quiet build** | ~1s | `--quiet` flag reduces logging overhead |

### Environment Variables
| Variable | Purpose |
|----------|---------|
| `SKIP_PAGEFIND=1` | Skip Pagefind in eleventy.config.js (run directly in workflow) |

| `ELEVENTY_RUN_MODE=build` | Triggers production build behavior |
| `FAST_BUILD=1` | Reserved for future HTML transform optimizations |

### Build Time Breakdown (Before → After)
```
npm install:    7s → 1s (cached)
Eleventy:      18s → 6s (optimized)
Pagefind:       8s → 3s (force-language)
Compression:    3s → 0s (removed)
─────────────────────────────
Total:         36s → ~10s
```

## Editorial Theme nicely coded examples
- [ghost](https://editorial.ghost.io/)
- [last update 2 weeks ago jekyll option](https://github.com/TurkuNLP/turkunlp.github.io)
- [andrew - older but still good css](https://andrewbanchich.github.io/editorial-jekyll-theme/)

## Changelog


### Dre

+ Migration JSON data convert in to markdown
+ Update all schema data 
+ Update all religioustheroy visual with md data


1. Fix the homepage so that the following works again to show a /archives/#.# make it easy to set like typing 24.1 type thing. - DONE

```yaml
homepage_archive: 
  active_tag: cat
  section_title: From the Archive
  max_items: 3
```


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
- TODO verify all sitemap XMLs are valid + every `<loc>` resolves to a real output file (including `/religioustheory/sitemap.xml`) - DONE
- TODO ingest and fix `_data/errors.txt` (dev `--serve --incremental` heap OOM) - DONE
- TODO ensure a successful production build with correct absolute URLs (no `localhost` in deployed sitemaps) - DONE
- TODO optimize `.github/workflows/deploy-xmit.yml` (build + pagefind once, caching, speed) - DONE

## Questions for Carl and Vic 
- TODO archives 22.1 files dont look right at all, bios.md missing, none of the articles match the live site
- TODO archives17.2 Jean Leclerq How to do things with words (of God)? Michel Henry’s Phenomenology of Religion - original site lists it but has a dead link, new build has no files on it whatsoever, would be sort id 04
- TODO archives 16.1, original lists "Review of Judith Butler’s Senses of the Subject Matt Waggoner", no files in original or new site exist, would be last item on page sort id 10
- TODO archives 3.3 "The City and the Stars: Politics and Alterity in Heidegger, Levinas and Blanchot. By Lars Iyer, University of Newcastle upon Tyne." original article missing entirely would be sort_id: 02

## Netlify Change Summary (2026-02-25)

This session focused on reducing Netlify deploy friction and keeping citation outputs maintainable.

### Decisions and outcomes

1. Implemented incremental citation generation for both archives and religioustheory citation pipelines.
   - Only new/changed citation files are regenerated.
   - Unchanged items are skipped.
   - Removed source items now clean up stale citation files.
   - Manifests are stored in `.cache/` and keyed by content signatures.

2. Kept citation URLs publicly accessible.
   - `public/citations` is still generated into `_site/citations` during build.
   - Users can continue to access citation files at `/citations/...` on the domain.

3. Switched to partial secrets-scanning reduction (not full disable).
   - Added `netlify.toml`.
   - Configured path omission for generated citation paths:
     - `SECRETS_SCAN_OMIT_PATHS = "public/citations/**,_site/citations/**"`

4. Stopped tracking generated citation artifacts in git.
   - Added `public/citations/` to `.gitignore`.
   - Removed tracked `public/citations/**` files from git index (`--cached`) so they remain generated artifacts, not source-controlled content.

5. Confirmed citation sitemaps still include generated citations.
   - Sitemap generation continues to pick up citation outputs.
   - Verified in build output that citation sitemap files are generated and populated.

## Git LFS and normal git file conversion

Use this when GitHub shows tiny pointer files (for example ~131 bytes) instead of real PDFs.

### A) Convert from Git LFS pointers to normal git-tracked files

```bash
# 1) Start clean
git status

# 2) Stop tracking PDFs in LFS (edit as needed for your patterns)
git lfs untrack "*.pdf"

# 3) Ensure .gitattributes no longer contains LFS rule(s) for those files
# Remove lines like:
# *.pdf filter=lfs diff=lfs merge=lfs -text

# 4) Re-add files so Git stores full binary content in normal git objects
git add .gitattributes
git add "**/*.pdf"

# If citations are tracked and should be normal git files too:
git add public/citations

# 5) Commit and push
git commit -m "Store PDFs/citations as normal git files (remove LFS pointers)"
git push origin main
```

### B) Convert from normal git-tracked files to Git LFS

```bash
# 1) Start clean
git status

# 2) Enable LFS tracking pattern(s)
git lfs track "*.pdf"

# 3) Re-add so matching files are rewritten as LFS pointers in git
git add .gitattributes
git add "**/*.pdf"

# 4) Commit and push
git commit -m "Track PDFs with Git LFS"
git push origin main
```

### Verify what Git is storing

```bash
# Shows LFS-tracked files
git lfs ls-files

# Inspect one file in git object form (pointer starts with: version https://git-lfs.github.com/spec/v1)
git show HEAD:path/to/file.pdf | head

# Local file should be real PDF bytes if fully present
xxd -l 8 path/to/file.pdf
# expected: 25504446...  (%PDF)
```

### Notes

- `.gitattributes` controls whether files become LFS pointers or normal git blobs.
- If a file was committed while LFS tracking was active, GitHub will display a pointer in the repository view.
- To make GitHub show the actual binary in that path/version, remove the LFS rule and recommit the file as a normal git-tracked file.

## New Linux machine: enable Git LFS and download all files

Use this on a fresh Linux machine where Git LFS is not installed yet.

### 1) Install Git LFS

```bash
# Ubuntu / Debian
sudo apt update
sudo apt install -y git-lfs

# Fedora
sudo dnf install -y git-lfs

# Arch
sudo pacman -S --noconfirm git-lfs
```

### 2) Enable Git LFS for your user

```bash
git lfs install
git lfs version
```

### 3) Clone and pull all LFS objects

```bash
git clone https://github.com/adamdjbrett/jcrt.org.git
cd jcrt.org

# Fetch and checkout all LFS files referenced by current branch
git lfs fetch --all
git lfs checkout

# Alternative one-liner (current branch only):
git lfs pull
```

### 4) Verify you have real files (not pointer text)

```bash
head -n 3 content/archives/24.2/alencar.pdf
# If this prints "version https://git-lfs.github.com/spec/v1", it is still a pointer.

xxd -l 8 content/archives/24.2/alencar.pdf
# Real PDF starts with: 25504446 (%PDF)
```

### Emergency recovery: cloned repo but only 131-byte pointer files

```bash
# 1) Confirm pointer symptom
head -n 3 content/archives/24.2/alencar.pdf

# 2) Ensure Git LFS is installed and initialized
git lfs version
git lfs install

# 3) Pull all LFS objects for current branch
git lfs pull

# 4) If still missing, force-fetch everything and checkout
git lfs fetch --all
git lfs checkout

# 5) Verify file is now real PDF bytes
xxd -l 8 content/archives/24.2/alencar.pdf
```

If step 4 still leaves pointer files, check your network/auth and run:

```bash
GIT_TRACE=1 GIT_CURL_VERBOSE=1 git lfs pull
```
