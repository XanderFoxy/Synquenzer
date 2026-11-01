// Beispielbilder für STATUS.md: Song-Bild und Matrix-Bild über vvDrawApp (1080 × 1920)
import { open, songWithChords } from './lib.mjs';
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const D = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../bilder/');
const {b, p, errs} = await open(); await songWithChords(p);
await p.evaluate(() => SYNQUENZER.vvRender({range: {a: 0, b: 8}})); await p.evaluate(() => SYNQUENZER.vvAppPrep());
for (const [t, v, n] of [[7.4, 'song', 'vvDrawApp-song-takt4.png'], [11.6, 'matrix', 'vvDrawApp-matrix-takt6-Am.png']]) { const r = await p.evaluate(([t, v]) => SYNQUENZER.vvDrawAppPng(t, 1080, 1920, v), [t, v]); fs.writeFileSync(D + '/' + n, Buffer.from(r.png, 'base64')); console.log(n, JSON.stringify(r.o)); }
console.log(errs); await b.close();
