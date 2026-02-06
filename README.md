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
## Crowcodes
- TODO error: archive 24.1 XIAOQIAN ZHANG does not have files anywhere
- archives 24.1, 23.2, 23.1 done
- archives 22.2 done
- TODO archives 22.1 files dont look right at all, bios.md missing, none of the articles match the live site
- archives 21.3, 21.2, 21.1,20.3 done
- TODO archives 20.2 has four authors, none are given affiliations, none have cards in /authors
- archives 20.1, 19.3, complete




## Controlled vocabulary
1. archives = content/archives - DONE
2. each folder in content/archives is named number.number. left of the decimal is volume. right of the decimal is issue. so 01.1 is volume 1 issue 1. - DONE
3. each folder is comprised of articles. - DONE
    1. the articles used to be just .md then they became just .pdf that is bad practice - DONE
    2. we are making very short and to the point .md article pages to make this soup clearer - DONE
4. Except for early volumes and issues every folder in archives should have a *.md and *.pdf with the same filenames. filename.md and filename.pdf. (except for times they didnt follow this practice) - DONE
5. each folder has an index.njk file which is the table of contents. in order for those to work each .md needs to have an article number. - DONE
6. to get the article numbers go to the live site and visually look at how they are appearing in order. then number the .md files accordingly - IN PROGRESS

## Todos
1. have VS Code, the live site <https://jcrt.org>, and the demo site: localhost:8080 open at the same time. - DONE
2. please note that the demo site is a work in progress and most of the time you will need to type the url you need to visit directly (I'm sorry) - DONE
3. check all folders to see if there are duplicate entries. Find and ensure which one is the source of truth. - IN PROGRESS
4. Search for and resolve duplicates - IN PROGRESS
5. ensure all .md are linked ot their pdf if there is a pdf in the folder add the pdf to the corresponding md file at usually line 8: just ```filename.pdf``` is al lthat is needed at this point - DONE
6. verify the frontmatter of all .md files - DONE
7. add two digit ```article_number:``` to enure the table of contents index.njk properly orders the articles. - IN PROGRESS
8. create a list of all solo authored /archives/ and then add afilliations to them - IN PROGRESS
9. fix footnotes to proper markdown-it footnotes look for #_etn and #_ftn and fix those references to the proper format. - DONE```[\[1\]](#_ftn1)```
[markdown it footnote guide](https://github.com/markdown-it/markdown-it-footnote)
```md
Here is a footnote reference,[^1] and another.[^longnote]

[^1]: Here is the footnote.

[^longnote]: Here's one with multiple blocks.

    Subsequent paragraphs are indented to show that they
belong to the previous footnote.
```
10. ensure all index.njk files in /archives haves artwork. if their issue does not have artwork use /img/jcrt.jpg - DONE
11. add editors to /archives/index.njks as optional front matter for if/when tehres a special issue. - DONE


## Changelog - Dre
1. increase the size of the nav and the css to match <https://editorial.ghost.io> - DONE
2. why does it say "JUDUL TIDAK DITEMUKAN - PERLU EDIT MANUAL" everywhere? - because not have a title - DONE
3. change "Erat Lacinia" to Trending Keywords. - DONE
    1. Portitor ullamcorper change to religious theory make clickable
    2. Elbuso Mendano mchange to media theory make clickable
    3. Klompen Capir - cultural theory make clickable
    4. Bulgoso Dugonge - political theory make clickable
6. confirm pagefind works on build - DONE
7. give each /archives/ entry keywords automated using the .json in _data for inspiration - DONE
9. ensure all authors have an author page with affiliation - create and automate like we did for journal-thenewpolis
author pages should have as front matter: name, affiliation, orcid, bio, show all /archives, /blogs, /religioustheory with headers listed below bio and orcid - DONE

+ increase the size of the menu hamburger to be more like editorial.ghost.io - DONE
+ navigational bar with pagination for /archives/, /religioustheory/ like you see on https://editorial.ghost.io look for Page 1 to see it /content/religioustheory - DONE
+ /content/religious theory homepage should look visually the same as /content/. - DONE
+ what is the best way to set the metadata values for religioustheory homepage? - Auto Fetch Data title from content json from _data/theory_archive.json , the home page title description is on religioustheory/index.njk
+ Religious theory should show recent posts with images like https://editorial.ghost.io - DONE
+ there should be a /tags/ and /categories/ pages that show all tags and categories using <detail> and <summary> to make the accordion - done on /religioustheory/taxonomy/ , or /religioustheory/categories/


Change Log: 
+ Archives Post Layout
+ Sidebar Nav Fixed