#!/usr/bin/env node
// CI gate: validate every built chapter. Any failure exits non-zero so a bad
// vibe-coded change NEVER deploys. Runs against dist/ (post-build).
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.join(process.cwd(), 'dist');
const errors = [];
const err = (ch, m) => errors.push(`  ✗ [${ch}] ${m}`);

// Third-party resources that break iOS Safari's privacy banner — banned.
const BANNED_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com', 'unpkg.com', 'jsdelivr.net', 'cdn.jsdelivr', 'code.jquery'];

function validateChapter(ch) {
  const dir = path.join(DIST, ch);
  const idx = path.join(dir, 'index.html');
  if (!fs.existsSync(idx)) return err(ch, 'no index.html');
  const html = fs.readFileSync(idx, 'utf8');

  if (!/<title>[^<]+<\/title>/i.test(html)) err(ch, 'missing <title>');
  if (!html.includes('site-header')) err(ch, 'missing shared nav — keep the <!--#include …/nav.html--> line');
  if (!html.includes('lt-footer')) err(ch, 'missing shared footer — keep the <!--#include …/footer.html--> line');
  // the shared nav links to these local anchors — they must exist or the nav is broken
  for (const id of ['events', 'about', 'connect']) {
    if (!new RegExp(`id=["']${id}["']`).test(html)) err(ch, `missing id="${id}" section (the shared nav's local links point here)`);
  }
  // an HTML comment that contains "-->" closes early and leaks text — guard against it
  for (const c of html.match(/<!--[\s\S]*?-->/g) || []) {
    if (c.includes('<!--#include')) err(ch, 'a comment contains a literal SSI include (nested "-->" leaks text) — reword it');
  }
  // no third-party loaded resources (scripts/fonts/styles)
  for (const h of BANNED_HOSTS) if (html.includes(h)) err(ch, `third-party resource not allowed: ${h} (self-host instead)`);
  // catch <script src="http…external"> / <link href="http…external">
  const ext = [...html.matchAll(/<(?:script|link)[^>]+(?:src|href)=["']https?:\/\/([^"'\/]+)/gi)]
    .map((m) => m[1]).filter((host) => !host.endsWith('lunatechs.social'));
  if (ext.length) err(ch, `external <script>/<link> hosts not allowed: ${[...new Set(ext)].join(', ')}`);

  // events.json (if present) must be valid + match the schema
  const ev = path.join(dir, 'events.json');
  if (fs.existsSync(ev)) {
    let data;
    try { data = JSON.parse(fs.readFileSync(ev, 'utf8')); }
    catch (e) { return err(ch, `events.json invalid JSON: ${e.message}`); }
    if (!Array.isArray(data)) return err(ch, 'events.json must be an array');
    data.forEach((e, i) => {
      for (const f of ['title', 'date']) if (!e[f]) err(ch, `events[${i}] missing required field "${f}"`);
      if (e.date && isNaN(Date.parse(e.date))) err(ch, `events[${i}] bad date "${e.date}"`);
    });
  }
}

const list = fs.existsSync(DIST) ? fs.readdirSync(DIST).filter((d) => fs.statSync(path.join(DIST, d)).isDirectory()) : [];
if (!list.length) { console.error('no built chapters in dist/ — run build first'); process.exit(1); }
list.forEach(validateChapter);

if (errors.length) {
  console.error(`\n✗ validation failed (${errors.length}):\n${errors.join('\n')}\n`);
  process.exit(1);
}
console.log(`✓ validated ${list.length} chapters: ${list.join(', ')}`);
