#!/usr/bin/env bash
# Pre-copy static archive assets (PDFs + images) to _site/ before Eleventy runs.
# This is MUCH faster than Eleventy's passthrough copy because:
#   - On Linux (Netlify CI): uses hardlinks (cp -al) — near-instant, zero disk I/O
#   - On macOS (local dev): uses clonefile (cp -c) — CoW, near-instant on APFS
#   - Falls back to regular cp if neither is available
#
# Eleventy's passthrough copy is removed from the config; this script handles it.
set -euo pipefail

SRC_DIR="content/archives"
DEST_DIR="_site/archives"

# Ensure _site exists (Eleventy may not have created it yet on a clean build)
mkdir -p "$DEST_DIR"

echo "Pre-copying archive assets to $DEST_DIR ..."

# Collect source files (PDFs + images)
FILES=$(find "$SRC_DIR" -type f \( \
  -name '*.pdf' -o \
  -name '*.jpg' -o -name '*.jpeg' -o \
  -name '*.png' -o -name '*.gif' -o \
  -name '*.webp' -o -name '*.svg' \
\))

if [ -z "$FILES" ]; then
  echo "  No archive assets found — skipping."
  exit 0
fi

COUNT=0

# Detect platform and pick the fastest copy strategy
copy_file() {
  local src="$1" dest="$2"
  mkdir -p "$(dirname "$dest")"

  # Skip if destination already exists and is same size (incremental)
  if [ -f "$dest" ]; then
    local src_size dest_size
    src_size=$(stat -f%z "$src" 2>/dev/null || stat -c%s "$src" 2>/dev/null || echo "0")
    dest_size=$(stat -f%z "$dest" 2>/dev/null || stat -c%s "$dest" 2>/dev/null || echo "1")
    if [ "$src_size" = "$dest_size" ]; then
      return 0
    fi
  fi

  # Try hardlink first (fastest — works on same filesystem)
  if ln "$src" "$dest" 2>/dev/null; then
    return 0
  fi

  # Try macOS clonefile (APFS copy-on-write)
  if cp -c "$src" "$dest" 2>/dev/null; then
    return 0
  fi

  # Try GNU hardlink copy
  if cp -al "$src" "$dest" 2>/dev/null; then
    return 0
  fi

  # Fallback: regular copy
  cp "$src" "$dest"
}

while IFS= read -r src_file; do
  # Strip the source prefix to get relative path: content/archives/08.3/Ramey.pdf → 08.3/Ramey.pdf
  rel_path="${src_file#$SRC_DIR/}"
  dest_file="$DEST_DIR/$rel_path"
  copy_file "$src_file" "$dest_file"
  COUNT=$((COUNT + 1))
done <<< "$FILES"

echo "  Pre-copied $COUNT archive assets."
