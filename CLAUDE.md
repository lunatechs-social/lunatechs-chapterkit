# LunaTechs Chapters — vibe-coding rules

This repo holds **chapter pages + event lists**. You (a chapter owner) edit
**your own chapter** here with AI — full creative freedom inside the rails
below. A CI gate builds and checks every change; anything broken or off-brand
simply doesn't publish, so you can experiment freely.

## What you may edit
- **`<your-chapter>/`** only — e.g. `hongkong/`: `index.html`, `events.json`,
  `assets/`, and your chapter's `CLAUDE.md`.

## What is OFF-LIMITS (CI will reject changes here)
- `shared/` (the navbar + brand — core team owns it so every page matches)
- `scripts/`, `.github/`, root `CLAUDE.md` / `README.md`
- **any other chapter's folder.** One chapter per change.

## House rules (CI enforces these — break one and it won't ship)
1. **No third-party resources.** No Google Fonts links, no CDN `<script>`s, no
   external `<link>`/`<script src="https://…">`. Use the site's self-hosted
   fonts: `<link rel="stylesheet" href="/assets/fonts/fonts.css">`. (Loading
   third-party stuff trips iOS Safari's privacy banner.)
2. **Keep the shared navbar.** Leave the line
   `<!--#include virtual="/shared/nav.html" -->` near the top of `<body>`;
   the build inlines the common nav so your page matches the rest of the site.
3. **Brand voice = punchy and grounded**, never dramatic/cinematic. We're a
   *tech enthusiast community*, not a "builder community" or "tech community".
   No moon/lunar imagery (use ⚡ or the mascot). No country-flag emojis on cities.
4. **Events live in `events.json`** — an array; each event needs at least
   `title` and `date` (ISO, e.g. `2026-07-10T18:30:00+08:00`). The page renders
   from this file. Keep it accurate.
5. Reference shared brand art by absolute URL (`/brand/…`) and fonts via
   `/assets/fonts/fonts.css` — the main site serves those on the same domain.

## Publish
Push your change → CI builds + checks it → if green it **auto-publishes** to
`lunatechs.social/<your-chapter>/`. If red, nothing changes and CI tells you
what to fix. Every change is in git history, so anything can be reverted in
one step.

## Test locally before pushing
```bash
node scripts/build.mjs      # renders dist/<chapter>/
node scripts/validate.mjs   # the same checks CI runs
open dist/<your-chapter>/index.html
```
