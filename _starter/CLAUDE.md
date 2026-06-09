# {{CITY}} — chapter site

Your fully-custom chapter site (served at `<slug>.lunatechs.social`). Do anything —
this starter is just a head start. Read the root `CLAUDE.md` for the rules.

## Must keep (CI enforces)
- The three shared includes — the global shell, all core-owned:
  - **nav** (`/shared/nav.html`) — local-first: Events / About / Contact jump to YOUR
    page; one "Global ↗" link goes back to the worldwide site.
  - **global** (`/shared/global.html`) — the "you're part of the worldwide LunaTechs
    community" module. Keep it near the bottom, above the footer.
  - **footer** (`/shared/footer.html`).
- **Nav anchor contract** — your page MUST have sections with `id="events"`, `id="about"`,
  and `id="connect"` (the starter ships them) so the shared nav's local links work.
- **`<body data-city="...">`** — names your chapter in the nav chip + the global module.
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
