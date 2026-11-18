#!/usr/bin/env node
// Brand gate for desktop.title-desk.com (Spencer override 2026-11-18).
// Public text must say "Title-Desk" / "Title-Desk Agent" (hyphen). The unhyphenated
// spellings are banned everywhere except inside literal installer filenames
// (TitleDesk-Agent-<version>-<platform>.<ext>), which match the published release assets.
// Lowercase identifiers, URLs and storage keys (titledesk-licensing, titledesk.demo,
// THE-HARNESS-LAB/titledesk) are not public text and are not matched (case-sensitive).
// Usage: node scripts/check-brand.mjs   (exit 1 on any violation)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const TEXT_EXT = new Set(['.html', '.js', '.mjs', '.css', '.txt', '.webmanifest', '.xml', '.json', '.yaml']);
const SKIP_DIRS = new Set(['.git', 'node_modules', 'scripts']);

const ALLOWED_FILENAME = /TitleDesk-Agent-\d+\.\d+\.\d+-[A-Za-z-]+\.(?:dmg|exe|AppImage|deb)/g;
const BANNED = [
  [/TitleDesk/g, 'TitleDesk (no hyphen)'],
  [/TITLEDESK/g, 'TITLEDESK (no hyphen)'],
  [/Titledesk/g, 'Titledesk'],
  [/Title Desk/gi, 'Title Desk (space)'],
  [/Title-Desk Desktop/g, 'Title-Desk Desktop'],
  [/Title-Desk Web\b/g, 'Title-Desk Web'],
  [new RegExp('artificial' + 'landman\\.io', 'gi'), 'link to the Artificial Landman site (link matrix: no)'],
  [/artificial-landman-seal/gi, 'Artificial Landman seal asset'],
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) { if (!SKIP_DIRS.has(name)) walk(p, out); }
    else if (TEXT_EXT.has(extname(name)) || name === 'security.txt') out.push(p);
  }
  return out;
}

const violations = [];
for (const file of walk(root)) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const scrubbed = line.replace(ALLOWED_FILENAME, '«installer-filename»');
    for (const [re, label] of BANNED) {
      re.lastIndex = 0;
      if (re.test(scrubbed)) violations.push(`${relative(root, file)}:${i + 1}: ${label}`);
    }
  });
}

// Positive assertions: the hyphenated brand is actually present where it must be.
const must = [
  ['index.html', /Title-Desk Agent/],
  ['download/index.html', /Title-Desk/],
  ['llms.txt', /Title-Desk Agent/],
  ['manifest.webmanifest', /"name":\s*"Title-Desk Agent"/],
];
for (const [rel, re] of must) {
  if (!re.test(readFileSync(join(root, rel), 'utf8'))) violations.push(`${rel}: missing ${re}`);
}

if (violations.length) {
  console.error(`check-brand: ${violations.length} violation(s)`);
  for (const v of violations) console.error('  ' + v);
  process.exit(1);
}
console.log('check-brand: OK (Title-Desk hyphenated everywhere; installer filenames exempt)');
