# {{CITY}} — chapter site

Your fully-custom chapter site (served at `<slug>.lunatechs.social`). Do anything —
this starter is just a head start. Read the root `CLAUDE.md` for the rules.

## Must keep (CI enforces)
- The shared **nav** include (`<!--#include virtual="/shared/nav.html" -->`) and
  **footer** include — the global shell (brand + nav back + later: login).
- **`events.json`** in the given format (array; each event needs `title` + `date`).
  The main site's `/<city>/` page and the global feed read this file.
- **No third-party resources** (no Google Fonts / CDN scripts). Use `/assets/fonts/fonts.css`.

## Yours to do anything with
- The hero, about, layout, colors, copy — rip it all out if you want.
- **Any other JSON file is your own freeform "database"** — `photos.json` here is an
  example (an array of `{src, caption}`); shape it however you like, or add `team.json`,
  `sponsors.json`, etc. Only `events.json` has a required format.
- Static only — no backend, no personal/user data. (Login + member features come from the
  global system later, for free.)

Placeholders to fill: `{{CITY}}`, `{{TAGLINE}}`, `{{JOIN_URL}}`.
