# Crow use this fix
1) Install/use the right Node version (the project needs Node 20+)

- Open a terminal and go into the repo:
  - `cd ~/path/to/jcrt.org`

- If you have `nvm` installed:
  - `nvm install`
  - `nvm use`

- Quick check:
  - `node -v` (should show `v20.x` or newer)

If you don’t have `nvm`:
- Install Node 20+ using your Linux package manager or NodeSource, then re-run `node -v`.

2) Start the site in “fast dev” mode (avoids the heavy build steps)

From inside the `jcrt.org` folder:
- `SKIP_PAGEFIND=1 FAST_BUILD=1 npx @11ty/eleventy --serve --quiet --incremental`

Then open the URL Eleventy prints (usually `http://localhost:8080`).