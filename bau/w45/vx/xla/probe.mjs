// schneller Probelauf: Blatt mit einer synthetischen .cbp öffnen, Foto, Passt, Projekt ansehen
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
import fs from 'node:fs';
const file = path.resolve(process.argv[2]), here = path.dirname(new URL(import.meta.url).pathname), f = process.argv[3] || 'synth-song.cbp';
const b = await chromium.launch();
const p = await b.newPage({viewport: {width: 428, height: 926}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + file); await p.waitForTimeout(1500);
const bytes = [...fs.readFileSync(path.join(here, 'tests', f))];
await p.evaluate(b => window.__xla.file(b, 'Probe'), bytes);
for (let k = 0; k < 40; k++) { await p.waitForTimeout(150); const s = await p.evaluate(() => { const c = window.__xla.cur(); return c && c.st + ':' + !!c.res; }); if (s === 'fertig:true' || /fehler/.test(s)) break; }
console.log(await p.evaluate(() => { const c = window.__xla.cur(); return JSON.stringify({st: c.st, err: c.err, last: window.__xla.last(), worker: window.__xla.worker(), lanes: c.sum.lanes.length, scenes: c.res && c.res.scenes.map(s => s.name)}); }));
await p.screenshot({path: path.join(here, 'fotos', 'probe-p.png')});
await p.evaluate(() => window.__xla.apply()); await p.waitForTimeout(1200);
console.log(await p.evaluate(() => JSON.stringify({name: S.name, nt: S.tracks.length, tracks: S.tracks.map(t => t.name + ':' + t.clips.filter(Boolean).length + ':' + (t.sound && (t.sound.name || t.sound.engine))), scenes: S.scenes.map(s => s.name), bars: S.song && S.song.bars, marks: S.song && S.song.marks.length, own: S.song && Object.keys(S.song.own).length, undo: UNDO.map(u => u.kind + ':' + u.label), view: !!UI.songView})));
await p.screenshot({path: path.join(here, 'fotos', 'probe-p2.png')});
console.log('errors', JSON.stringify(errs));
await b.close();
