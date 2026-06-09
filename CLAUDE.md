# Lunatechs Chapter Kit — core maintainer notes

This is the **kit**, not a chapter. It holds the shared shell + build + guardrails
that wrap each chapter's content. Chapters live in their **own** repos
(`lunatechs-chapter-<slug>`), seeded from `_starter/` and assembled against this kit
at build time. Editing here changes every chapter — treat `shared/`, `scripts/`, and
`_starter/` as the contract.

See `README.md` for the full layout. Quick map:
- `shared/` — nav, footer, event cards (+ List/Grid past toggle), the "Lunatics,
  worldwide" module, and `cities.json` (the global registry the module reads).
- `scripts/build.mjs` — inlines the shared includes into each chapter folder → `dist/<slug>/`.
- `scripts/validate.mjs` — the CI gate (no third-party resources; nav present; the
  `#events`/`#about`/`#connect` anchors exist; events.json schema; no nested-comment leaks).
- `_starter/` — the template a new chapter copies (`index.html`, `events.json`,
  `photos.json`, `chapter.json`, `dev.sh`, `CLAUDE.md`).
- `.github/workflows/kit-ci.yml` — smoke-tests the starter on every change to the kit.
- `.github/workflows/assemble.yml` — reusable workflow chapters call to build+validate+deploy.

## Rules that flow down to every chapter (validate.mjs enforces)
1. **No third-party resources** (no Google Fonts / CDN scripts) — fonts are first-party.
2. Keep the three shared includes (`nav.html`, `events.html`, `global.html`) and the
   `#events` / `#about` / `#connect` section ids.
3. `<body data-city="…">` names the chapter in the nav chip + worldwide module.
4. **Brand voice = punchy and grounded**, never cinematic. No moon/lunar imagery
   (use ⚡ or the mascot). No country-flag emojis on cities. Brand name in prose is
   **Lunatechs** (title case); the logo wordmark is lowercase.

## Test locally
```bash
cp -r _starter smoketest && node scripts/build.mjs && node scripts/validate.mjs
```

## Start a new chapter
Copy `_starter/` into a new `lunatechs-chapter-<slug>` repo, fill the `{{…}}`
placeholders, push, add the founder as a collaborator, and add the city to
`shared/cities.json`.
