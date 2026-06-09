#!/usr/bin/env bash
# CI guardrail: a chapter owner's change may only touch files inside ONE
# chapter folder. Touching shared/, scripts/, .github/, or another chapter's
# folder fails here (those are core-team-owned — also protected via CODEOWNERS).
# Usage: scope-check.sh <base-ref>   (e.g. origin/main)
set -euo pipefail
BASE="${1:-origin/main}"

mapfile -t changed < <(git diff --name-only "$BASE"...HEAD || git diff --name-only HEAD)
[ ${#changed[@]} -eq 0 ] && { echo "no changes"; exit 0; }

PROTECTED='^(shared/|scripts/|\.github/|CLAUDE\.md|README\.md|\.gitignore)'
chapter=""
for f in "${changed[@]}"; do
  if [[ "$f" =~ $PROTECTED ]]; then
    echo "✗ change touches a CORE-TEAM-OWNED path: $f"
    echo "  Chapter owners may only edit their own chapter folder."
    exit 1
  fi
  top="${f%%/*}"
  if [ -z "$chapter" ]; then chapter="$top"
  elif [ "$top" != "$chapter" ]; then
    echo "✗ change spans multiple chapters ($chapter and $top) — one chapter per PR."
    exit 1
  fi
done
echo "✓ scope ok — change confined to: $chapter/"
