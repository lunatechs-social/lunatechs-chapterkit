#!/usr/bin/env bash
# Preview THIS chapter locally using the Lunatechs Chapter Kit.
# It pulls the kit (the shared nav/footer/event-cards/worldwide module + build),
# drops your content into it, builds, validates, and serves a local preview.
#
#   ./dev.sh            # build + serve on http://localhost:8787
#   ./dev.sh build      # build + validate only (no server)
set -euo pipefail

KIT_REPO="https://github.com/lunatechs-social/lunatechs-chapterkit"
KIT_DIR=".chapterkit"
PORT=8787

# slug = the chapter folder name the kit builds into (from chapter.json)
SLUG="$(node -p "require('./chapter.json').slug" 2>/dev/null || basename "$PWD")"

echo "▸ chapter: $SLUG"
if [ ! -d "$KIT_DIR/.git" ]; then
  echo "▸ pulling the chapter kit…"
  git clone --depth 1 "$KIT_REPO" "$KIT_DIR"
else
  git -C "$KIT_DIR" pull --ff-only --quiet || true
fi

# drop this chapter's content into the kit, then build with the shared shell
rm -rf "$KIT_DIR/$SLUG"
mkdir -p "$KIT_DIR/$SLUG"
rsync -a --exclude "$KIT_DIR" --exclude '.git' --exclude 'preview' ./ "$KIT_DIR/$SLUG/"

( cd "$KIT_DIR" && node scripts/build.mjs && node scripts/validate.mjs )

if [ "${1:-serve}" = "build" ]; then
  echo "✓ built + validated → $KIT_DIR/dist/$SLUG"
  exit 0
fi

echo "✓ serving $SLUG on http://localhost:$PORT  (fonts/logo load from production)"
cd "$KIT_DIR/dist/$SLUG" && exec python3 -m http.server "$PORT"
