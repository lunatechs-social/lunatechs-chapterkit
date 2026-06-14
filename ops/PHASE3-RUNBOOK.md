# Phase 3 cutover — gated drafts + "Show unpublished" toggle

Goal: a logged-in organizer/leader (or admin) sees `published:false` events in the
event lists (chapter page **and** the global `/events`) behind a **DRAFT** badge via a
"Show unpublished" toggle; the public sees nothing. State stays in the chapters'
`events.json`. Drafts are served from `/_drafts/events.json`, gated server-side — so
they never leak, even in raw form.

**Do these in order. The build change must NOT reach production before nginx gating is
live, or `/_drafts/events.json` would be world-readable.** That's why the kit work is
on the `phase3-drafts` branch — keep it there until step 4.

Prereq (already shipped): Phase 1 cookie + Phase 2 memberships are deployed, so
`app.lunatechs.social` sets the `.lunatechs.social` `lt_id` cookie and `GET /me`
returns `{ isAdmin, chapters }`.

---

## 1. Install the auth validator on Lightsail (34.212.8.221)

```bash
scp -i ~/.ssh/lightsail-hanley-world.pem \
  chapters/ops/draft-auth.mjs            ubuntu@34.212.8.221:/home/ubuntu/draft-auth.mjs
scp -i ~/.ssh/lightsail-hanley-world.pem \
  chapters/ops/lunatechs-draft-auth.service ubuntu@34.212.8.221:/tmp/

ssh -i ~/.ssh/lightsail-hanley-world.pem ubuntu@34.212.8.221 '
  sudo mv /tmp/lunatechs-draft-auth.service /etc/systemd/system/
  sudo systemctl daemon-reload
  sudo systemctl enable --now lunatechs-draft-auth
  # sanity: a request with no cookie must be denied (401)
  curl -s -o /dev/null -w "no-cookie -> %{http_code}\n" -H "X-Original-Host: hk.lunatechs.social" http://127.0.0.1:9002/check
'
```

## 2. nginx gating (both vhosts)

Add the two blocks from `chapters/ops/nginx-drafts.conf` inside the `server{}` of
**`/etc/nginx/sites-available/lunatechs-chapters`** and
**`/etc/nginx/sites-available/lunatechs.social`**, then:

```bash
ssh -i ~/.ssh/lightsail-hanley-world.pem ubuntu@34.212.8.221 '
  sudo nginx -t && sudo systemctl reload nginx
'
```

## 3. Global merged drafts feed (gen-global-events.mjs)

Edit `/home/ubuntu/gen-global-events.mjs` so it ALSO emits the gated all-feed. This
**replaces** the Phase-0 skip (we now keep drafts and split at write time):

- In `readSource`, **remove** the Phase-0 line
  `if (e.published === false) { dropped++; … continue; }` so `good` includes drafts.
- After `const merged = [...]` (the deduped, sorted list), write two files:

```js
// public feed = published only (unchanged path)
const publicMerged = merged.filter((e) => e.published !== false);
fs.writeFileSync(OUT + '.tmp', JSON.stringify({ events: publicMerged }, null, 2) + '\n');
fs.renameSync(OUT + '.tmp', OUT);
fs.chmodSync(OUT, 0o644);

// gated all-feed = incl. drafts → /var/www/hanley.world/lunatechs/_drafts/events.json
const ALL = '/var/www/hanley.world/lunatechs/_drafts/events.json';
fs.mkdirSync('/var/www/hanley.world/lunatechs/_drafts', { recursive: true });
fs.writeFileSync(ALL + '.tmp', JSON.stringify({ events: merged }, null, 2) + '\n');
fs.renameSync(ALL + '.tmp', ALL);
fs.chmodSync(ALL, 0o644);
```

`node --check ~/gen-global-events.mjs && node ~/gen-global-events.mjs` to apply.
(The global page reads `{events:[...]}`; chapter pages read a bare array — keep that shape.)

## 4. CloudFront: forward the cookie for /_drafts/* (both distributions)

Find the two distributions (chapters subdomains + `lunatechs.social`):
`aws cloudfront list-distributions --query "DistributionList.Items[].{id:Id,aliases:Aliases.Items}"`

For each, add a **cache behavior** for path pattern `/_drafts/*`:
- **Cache policy:** CachingDisabled (TTL 0).
- **Origin request policy:** forward the **`lt_id`** cookie (+ the `X-Original-Host`
  is set by nginx, not needed from CF). A managed "AllViewerExceptHostHeader" works, or
  a custom policy forwarding just the `lt_id` cookie.
- Then `create-invalidation --paths "/_drafts/*"`.

(Without this, CloudFront strips the cookie and every organizer gets 401.)

## 5. Ship the kit + www client

```bash
# merge the build + toggle to main — NOW safe (gating is live)
cd chapters && git checkout main && git merge --no-ff phase3-drafts && git push origin main
# trigger a rebuild of each chapter so dist gets /_drafts/ + the toggle:
#   push any no-op to each chapter repo, or re-run deploy-chapter.sh on the box.
```
For the global page, ship the www `phase3-drafts` branch (the same toggle in
`public/events/index.html`) via the normal `scripts/release.sh`.

---

## Verify

1. **Public still clean:** `curl https://hk.lunatechs.social/_drafts/events.json` → **401/403**;
   `curl https://hk.lunatechs.social/events.json` → no draft.
2. **Organizer sees it:** sign in at app.lunatechs.social as an organizer/leader of HK,
   open hk.lunatechs.social → "Show N unpublished" button appears; toggling shows the
   DRAFT-badged event. A non-HK organizer sees no button on HK.
3. **Global:** same on lunatechs.social/events for any staff; logged-out → nothing.
4. **Fail-closed:** with the validator stopped, `/_drafts/*` returns 401 (never the file).

## Rollback

Stop `lunatechs-draft-auth`, remove the nginx `/_drafts/` blocks + reload, revert the
CloudFront behavior. The public feed + sites are unaffected (drafts simply become
invisible to organizers again).
