# Lunatechs Chapter Kit

Everything needed to run a **Lunatechs** chapter site. Each chapter lives in its own
small content repo (`lunatechs-chapter-<slug>`) and is wrapped by this kit at build
time — chapter owners write a little HTML + JSON, the kit provides the shared look,
the build, and the guardrails. One chapter can never see or break another.

## What's in here (core-owned)
| Path | What it is |
|---|---|
| `_starter/` | the template a new chapter starts from (`index.html`, `events.json`, `photos.json`, `dev.sh`, `chapter.json`, `CLAUDE.md`) |
| `shared/nav.html` | local-first chapter nav (Events / About / Contact jump in-page; one Global ↗ link out) |
| `shared/footer.html` | shared footer |
| `shared/events.html` | event cards (identical to the main `/events/` page) + List/Grid toggle for past events |
| `shared/global.html` | the "Lunatics, worldwide" module — graphic carousel of live chapters |
| `shared/cities.json` | the global chapter registry (live / forming / wanted) the module reads |
| `scripts/build.mjs` | inlines the shared shell into each chapter folder → `dist/<slug>/` |
| `scripts/validate.mjs` | CI gate: no third-party resources, nav present + anchors exist, events schema, no comment leaks |

## How a chapter works
1. A chapter has its **own repo** (`lunatechs-chapter-<slug>`) seeded from `_starter/`.
2. The owner edits `index.html` + `events.json` and runs **`./dev.sh`** to preview
   (it pulls this kit, drops their content in, builds, and serves locally).
3. On push to `main`, a **GitHub webhook** hits the LunaTechs server (Lightsail), which
   runs `deploy-chapter.sh <slug>` → pulls the repo → builds it through this kit →
   publishes to nginx at `<slug>.lunatechs.social` (same box as the global site, CDN in
   front). **No S3, no GitHub Actions.** A bad change fails the build and never ships;
   no other chapter is touched.

## Start a new chapter
```bash
cp -r _starter ../lunatechs-chapter-<slug>     # then fill {{CITY}}, {{TAGLINE}}, {{JOIN_URL}}, {{SLUG}}
# create the repo, push, add the founder as a collaborator, add it to shared/cities.json
```

## Conventions chapters must keep (CI enforces)
- The three shared includes: `nav.html`, `events.html`, `global.html`.
- Section ids `#events`, `#about`, `#connect` (the shared nav links to them).
- `<body data-city="…">` (names the chapter in the nav chip + worldwide module).
- **No third-party resources** — fonts are first-party.

Brand name is written **Lunatechs** (title case). The logo wordmark is lowercase.
