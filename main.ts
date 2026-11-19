// Leonida Trophy Guide entry program (Node 22, standard library only).
// The guide itself is plain static files in app/ (index.html + app.js + style.css +
// app/data/trophies.json), served at app/index.html with no build step and no network
// use. This program hands it in: it copies app/ and screenshots/ from beside this
// file to /output and writes /output/dossier.json with the vendored make.fun
// library. Leave vendor/makefun-frontend.ts untouched: the scorer requires
// dossier.json to be byte for byte what its own copy of the library writes.
//
// Fresh-build note (my own line, added in this session): refuse to hand in a
// half-built tree — if app/index.html is missing, fail loudly instead of
// writing an empty dossier.
//
// Serve locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

if (!existsSync(join(here, 'app', 'index.html'))) {
  throw new Error('refusing to hand in: app/index.html is missing');
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
