// Vice Trophy Atlas — the hand-in program for gta6-trophy-guide-01.
// Node 22, standard library only, no build step.
//
// What it hands in: this repo's app/ folder — a static web app (index.html,
// styles, three small ES modules, and app/data/trophies.json with the 55
// official PS5 trophies and a guide to each in our own words) — plus the
// screenshots/ renders, and a dossier.json the judge reads, built with the
// kit's vendored library (vendor/makefun-frontend.ts, untouched: the scorer
// rebuilds the dossier with its own copy and the two must match byte for
// byte). Run it with MAKEFUN_OUTPUT_DIR standing in for /output:
//   MAKEFUN_OUTPUT_DIR=out node main.ts
// The app itself is fully offline: it loads nothing over the network, and
// its progress lives in the reader's own browser (localStorage).

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const destination = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const shotDir = join(repoRoot, 'screenshots');

function atlasMirror(source, target) {
  mkdirSync(dirname(target), { recursive: true });
  cpSync(source, target, { recursive: true });
}

function atlasShotNames() {
  if (!existsSync(shotDir)) return [];
  return readdirSync(shotDir).filter((name) => !name.startsWith('.')).sort();
}

mkdirSync(destination, { recursive: true });
atlasMirror(join(repoRoot, 'app'), join(destination, 'app'));
const shots = atlasShotNames();
if (shots.length > 0) atlasMirror(shotDir, join(destination, 'screenshots'));

const dossier = buildDossier(destination, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(destination, 'dossier.json'), dossier);
console.log(`Vice Trophy Atlas handed in: ${shots.length} screenshot(s), dossier ${dossier.length} bytes.`);
