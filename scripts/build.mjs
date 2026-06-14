#!/usr/bin/env node
// Build each chapter folder into dist/<chapter>/, inlining the shared nav.
// Chapter pages reference shared site assets (/assets/fonts, /brand) by
// absolute URL — those are served by the main site on the same domain.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const SKIP = new Set(['scripts', 'shared', 'dist', 'node_modules', '.git', '.github']);
const nav = fs.readFileSync(path.join(ROOT, 'shared', 'nav.html'), 'utf8');
const footer = fs.readFileSync(path.join(ROOT, 'shared', 'footer.html'), 'utf8');
const events = fs.readFileSync(path.join(ROOT, 'shared', 'events.html'), 'utf8');
const partners = fs.readFileSync(path.join(ROOT, 'shared', 'partners.html'), 'utf8');
const linksPage = fs.readFileSync(path.join(ROOT, 'shared', 'links.page.html'), 'utf8');
// global module + its city list (core-owned). Inject the cities JSON at build
// time so each chapter ships the data inline (no cross-origin fetch / missing file).
const cities = fs.readFileSync(path.join(ROOT, 'shared', 'cities.json'), 'utf8').trim();
const global = fs
  .readFileSync(path.join(ROOT, 'shared', 'global.html'), 'utf8')
  .replace('"__CITIES__"', cities);

function chapters() {
  return fs.readdirSync(ROOT).filter((d) => {
    const p = path.join(ROOT, d);
    // skip hidden + helpers + `_`-prefixed template dirs (e.g. _starter)
    return fs.statSync(p).isDirectory() && !d.startsWith('.') && !d.startsWith('_') && !SKIP.has(d);
  });
}

function copyDir(src, out) {
  fs.mkdirSync(out, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (e.name === 'CLAUDE.md' || e.name.endsWith('.md')) continue; // docs don't ship
    const s = path.join(src, e.name), o = path.join(out, e.name);
    if (e.isDirectory()) copyDir(s, o);
    else fs.copyFileSync(s, o);
  }
}

// Inline the shared SSI includes into ANY .html file — so a chapter can add as many
// freeform pages as it likes (recaps, event marketing/landing pages, …) and each one
// can opt into the shared nav/footer/events/global just by leaving the include line in.
function inlineShared(file) {
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/<!--#include virtual="\/?(shared\/)?nav\.html"\s*-->/g, nav);
  html = html.replace(/<!--#include virtual="\/?(shared\/)?footer\.html"\s*-->/g, footer);
  html = html.replace(/<!--#include virtual="\/?(shared\/)?events\.html"\s*-->/g, events);
  html = html.replace(/<!--#include virtual="\/?(shared\/)?partners\.html"\s*-->/g, partners);
  html = html.replace(/<!--#include virtual="\/?(shared\/)?global\.html"\s*-->/g, global);
  fs.writeFileSync(file, html);
}
function inlineAll(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) inlineAll(p);
    else if (e.name.endsWith('.html')) inlineShared(p);
  }
}

// Strip unpublished events from the PUBLIC events.json the browser fetches.
// Source of truth is the chapter's events.json (which may hold `published:false`
// drafts); the public build only ever ships published events, so a draft never
// leaks via the raw file or the rendered list. (Logged-in organizers get drafts
// from a separately auth-gated feed — see Phase 3.)
function writePublicEvents(out) {
  const evPath = path.join(out, 'events.json');
  if (!fs.existsSync(evPath)) return;
  let data;
  try { data = JSON.parse(fs.readFileSync(evPath, 'utf8')); }
  catch { return; } // validate.mjs reports bad JSON; don't crash the whole build here
  if (!Array.isArray(data)) return;
  const published = data.filter((e) => e && e.published !== false);
  fs.writeFileSync(evPath, JSON.stringify(published, null, 2) + '\n');
}

fs.rmSync(DIST, { recursive: true, force: true });
const list = chapters();
for (const ch of list) {
  const out = path.join(DIST, ch);
  copyDir(path.join(ROOT, ch), out);
  inlineAll(out); // every .html in the chapter, not just index.html
  writePublicEvents(out); // drop `published:false` drafts from the shipped events.json

  // generate this chapter's /links/ linktree from the shared template, injecting
  // its chapter.json (city + local links). Shared brand links live in the template.
  try {
    const chJson = fs.readFileSync(path.join(ROOT, ch, 'chapter.json'), 'utf8').trim();
    const linksDir = path.join(out, 'links');
    fs.mkdirSync(linksDir, { recursive: true });
    const linksOut = path.join(linksDir, 'index.html');
    fs.writeFileSync(linksOut, linksPage.replace('"__CHAPTER__"', chJson));
    inlineShared(linksOut); // pull in the shared footer
  } catch (e) {
    console.warn(`  (${ch}: no chapter.json — skipped /links/)`);
  }
}
console.log(`✓ built ${list.length} chapters → dist/ : ${list.join(', ')}`);
