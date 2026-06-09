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

function chapters() {
  return fs.readdirSync(ROOT).filter((d) => {
    const p = path.join(ROOT, d);
    return fs.statSync(p).isDirectory() && !d.startsWith('.') && !SKIP.has(d);
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

fs.rmSync(DIST, { recursive: true, force: true });
const list = chapters();
for (const ch of list) {
  const out = path.join(DIST, ch);
  copyDir(path.join(ROOT, ch), out);
  const idx = path.join(out, 'index.html');
  if (fs.existsSync(idx)) {
    let html = fs.readFileSync(idx, 'utf8');
    // inline the shared nav (SSI-style include) so chapters share one navbar
    html = html.replace(/<!--#include virtual="\/?(shared\/)?nav\.html"\s*-->/g, nav);
    fs.writeFileSync(idx, html);
  }
}
console.log(`✓ built ${list.length} chapters → dist/ : ${list.join(', ')}`);
