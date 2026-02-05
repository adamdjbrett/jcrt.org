#!/usr/bin/env bash
# Pre-copy static archive assets (PDFs + images) to _site/ before Eleventy runs.
#
# Why: Eleventy's passthrough copy processes 637 files / 211MB one-by-one,
# taking ~10s. This script uses hardlinks (zero I/O, instant) instead.
#
#   - Linux (GitHub Actions CI): hardlinks via ln (same filesystem guaranteed)
#   - macOS (local dev, APFS): hardlinks via ln (same volume)
#   - Incremental: skips files that already exist and match size
#
# Eleventy's addPassthroughCopy for archives is removed; this script handles it.
set -euo pipefail

SRC_DIR="content/archives"
DEST_DIR="_site/archives"

mkdir -p "$DEST_DIR"

# Portable file-size function (macOS vs GNU/Linux stat)
file_size() {
  stat -f%z "$1" 2>/dev/null || stat -c%s "$1" 2>/dev/null || echo "0"
}

echo "Pre-copying archive assets to $DEST_DIR ..."

COPIED=0
SKIPPED=0

# Find all static assets, process each
find "$SRC_DIR" -type f \( \
  -name '*.pdf' -o \
  -name '*.jpg' -o -name '*.jpeg' -o \
  -name '*.png' -o -name '*.gif' -o \
  -name '*.webp' -o -name '*.svg' \
\) | while IFS= read -r src_file; do
  rel_path="${src_file#$SRC_DIR/}"
  dest_file="$DEST_DIR/$rel_path"

  # Incremental: skip if dest exists with same size
  if [ -f "$dest_file" ]; then
    if [ "$(file_size "$src_file")" = "$(file_size "$dest_file")" ]; then
      SKIPPED=$((SKIPPED + 1))
      continue
    fi
    # Size differs — remove stale dest before re-linking
    rm -f "$dest_file"
  fi

  mkdir -p "$(dirname "$dest_file")"

  # Hardlink (works on same filesystem — always true for local builds and CI)
  if ln "$src_file" "$dest_file" 2>/dev/null; then
    COPIED=$((COPIED + 1))
    continue
  fi

  # macOS APFS clonefile fallback (copy-on-write, near-instant)
  if cp -c "$src_file" "$dest_file" 2>/dev/null; then
    COPIED=$((COPIED + 1))
    continue
  fi

  # Last resort: regular copy
  cp "$src_file" "$dest_file"
  COPIED=$((COPIED + 1))
done

echo "  Done."
