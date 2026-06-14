# Running the {{CITY}} chapter site

Everything a chapter leader needs to **update the site, run events, and ship changes**
for **{{CITY}}** (`https://<slug>.lunatechs.social`). You only ever edit this repo's content — the shared
look and the build come from the [Chapter Kit](https://github.com/lunatechs-social/lunatechs-chapterkit).

> **The whole job:** edit content → preview with `./dev.sh` → `git push` to `main`.
> The site is live within seconds. No S3, no GitHub Actions, nothing to configure.

---

## How it deploys (the real mechanism — Lightsail, not S3)

This site is **served from the LunaTechs server (AWS Lightsail), on the same box and
nginx as the global `lunatechs.social` site** — fronted by a CDN for speed. It is **not**
an S3/static-hosting bucket.

On every push to `main`:

1. GitHub fires a **webhook** at the server's `lunatechs-webhook` service.
2. The server runs **`deploy-chapter.sh <slug>`**, which:
   - `git reset --hard origin/main` in the server's clone of this repo,
   - builds your content through the Chapter Kit (`./dev.sh build` → `dist/<slug>/`),
   - publishes it to the web root (`/var/www/chapters/<slug>/`),
   - serves it at **`https://<slug>.lunatechs.social`** via nginx.
3. If your push changed **`events.json`**, the server also arms a debounced (~30 min)
   sync so your events flow into the **global** events feed on `lunatechs.social`.

You don't touch the server. It's pull-only and resets hard to `origin/main`, so the
live site always matches what's on `main` — never hand-edit anything on the server.

A bad change can only break **your** page: the build validates before publishing, and
no other chapter is affected.

---

## Preview before you push

```bash
./dev.sh          # build + serve a local preview at http://localhost:8787
./dev.sh build    # build + validate only (no server) — good as a pre-push check
```

`dev.sh` pulls the kit, drops your content into it, builds, and validates exactly the
way the server will. If `./dev.sh build` passes locally, the deploy will succeed.

---

## Ship a change

```bash
git add -A
git commit -m "describe your change"
git push origin main
```

That's it — live in seconds at `https://<slug>.lunatechs.social`. (First push: `git clone`, then make
your edits. Need access? You're added as a collaborator on this repo.)

---

## Events — add / update / delete

Your event list lives in **`events.json`** (a JSON array, newest event first). Each
event is one object; the only required fields are **`title`** and **`date`**. The
fields used across the site:

| Field | What it's for |
|---|---|
| `slug` | stable id, also the per-event folder name (e.g. `2026-06-12-ai-video-creation`) |
| `title` | event name |
| `date` | ISO 8601 **with timezone**, e.g. `"2026-06-12T18:00:00+08:00"` |
| `endTime` | display end time, e.g. `"21:00"` |
| `location` | venue line |
| `summary` | one-paragraph blurb on the card |
| `tags` | array, e.g. `["signature","co-hosted"]` |
| `lumaUrl` | RSVP link (Luma) |
| `lumaGraphic` | card image (your Luma banner) |
| `landingUrl` | your own marketing/landing page (see below) |
| `recapUrl` | your recap page after the event (see below) |
| `photo` / `featuredPhoto` | hero/card photo |
| `stats` | `[{ "value": "120", "label": "builders" }]` for recaps |
| `dateTbd` | `true` if the date isn't set yet |

**Add an event** — add a new object at the **top** of the array:
```json
{
  "slug": "2026-07-10-claude-code-night",
  "title": "Claude Code Night",
  "date": "2026-07-10T18:30:00+08:00",
  "endTime": "21:00",
  "location": "Your venue, {{CITY}}",
  "summary": "One line that sells the night.",
  "tags": ["casual"],
  "lumaUrl": "https://luma.com/xxxxxxx",
  "lumaGraphic": "events/2026-07-10-claude-code-night/banner.jpg"
}
```

**Update an event** — edit the fields on its object (change the venue, add a `recapUrl`,
swap the photo, etc.).

**Delete an event** — remove its object from the array. If it had a folder under
`events/<slug>/`, delete that folder too so its images stop shipping.

> Keep the JSON valid (commas, quotes). `./dev.sh build` will fail loudly if it isn't —
> that's the guardrail, not a bug.

---

## Event marketing / landing pages

A landing page is a **full custom page you share to sell an event** (countdown, speaker
grid, sponsor logos, schedule — go wild). It lives in its **own folder**:

```
events/<slug>/index.html        e.g. events/2026-07-10-claude-code-night/index.html
events/<slug>/banner.jpg         images for that page live alongside it
```

1. Copy the starter template (or an existing event folder) to `events/<your-slug>/`.
   The kit ships a template at `_starter/events/example/` in the
   [Chapter Kit](https://github.com/lunatechs-social/lunatechs-chapterkit).
2. Make it sing. **Keep** the shared nav + footer include lines and use **no
   third-party `<script>`/`<link>`** tags (fonts are first-party). For video, **embed
   YouTube — don't host video files** in the repo.
3. Point the event at it: set `"landingUrl": "https://<slug>.lunatechs.social/events/<your-slug>/"` in
   `events.json`.

It publishes at `https://<slug>.lunatechs.social/events/<your-slug>/` on your next push.

---

## Event recaps

After an event, give it a recap page (photos, turnout stats, what happened). Two ways,
both fine:

- **Reuse the same folder** — turn `events/<slug>/index.html` into the recap after the
  event (this is what {{CITY}} mostly does), **or**
- **A dedicated recap folder** — copy `_starter/recaps/example/` to `recaps/<slug>/`.

Then set **`"recapUrl"`** on the event in `events.json` to the page's URL, and add a
`featuredPhoto` and `stats` so the event card shows the recap nicely. Same rules: keep
the shared nav/footer includes, no third-party resources.

> Tip: open this repo in Claude Code and say *"make a recap page for `<event>` from these
> photos"* — it'll fill in the template for you.

---

## Contact / "link tree" page

Every chapter gets an auto-generated link-tree at **`https://<slug>.lunatechs.social/links/`** (great as
the link in your social bios). It's built from **`chapter.json`** — you don't write the
page, just the links. Edit the `links` array:

```json
"links": [
  {
    "type": "whatsapp",
    "title": "WhatsApp Community",
    "sub": "Daily chat with {{CITY}} builders",
    "url": "https://chat.whatsapp.com/xxxxxxxx"
  }
]
```

- `type` picks the icon (e.g. `whatsapp`, `instagram`, `email`, `luma`, `website`).
- `title` / `sub` are the label and the small text under it.
- Shared global LunaTechs links (the main site, global socials) are added automatically.

Leave `slug` and `subdomain` in `chapter.json` **alone** — those wire your repo to its
URL. `city`, `status`, and `links` are yours to edit.

---

## The rules (the build enforces these — a violation fails the build, nothing ships)

- **No third-party resources** — no Google Fonts, no CDN scripts. Use `/assets/fonts/fonts.css`.
- Keep the **three shared includes** (`nav.html`, `events.html`, `global.html`) and the
  section ids **`#events` / `#about` / `#connect`** the shared nav links to.
- Keep **`<body data-city="…">`** — it names your chapter in the nav chip and the
  worldwide module.
- Static only — no backend, no user data in the repo. Don't host video; embed YouTube.

Brand name in prose is **LunaTechs**; the logo wordmark is lowercase. Punchy and
grounded, no moon/lunar imagery (use ⚡ or the mascot).
