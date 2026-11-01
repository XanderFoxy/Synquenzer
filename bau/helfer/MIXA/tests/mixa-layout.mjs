// MIX-A Abnahme 6: Layout 428×926, 926×428, 428×650 (+ 375×667, 844×390) mit der echten App-Schrift: MASTER-Seite mit [AUTO-MASTER]
// [MIX-ASSISTENT], beide Blätter (leer und mit Ergebnis): im Bild, nichts abgeschnitten, Ziele ≥ 44 px, Seitenhöhe springt nicht.
// Bilder nach tests/bilder/. node mixa-layout.mjs [index.html]
import { open, buildSong, ok, failed, APP, HERE } from './mixa-lib.mjs';
import fs from 'fs'; import os from 'os'; import path from 'path';
const R = path.resolve(HERE, '../../../..'), TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'mixa-lay-')), BILD = path.join(HERE, 'bilder');
fs.copyFileSync(APP, path.join(TMP, 'index.html')); fs.symlinkSync(path.join(R, 'fonts'), path.join(TMP, 'fonts')); fs.mkdirSync(BILD, {recursive: true});
const FILE = path.join(TMP, 'index.html');
// Prüfung im Seitenkontext: Elemente im Bild, Text nicht abgeschnitten, Ziele ≥ 44 px
const CHECK = sel => {
  const vw = innerWidth, vh = innerHeight, root = document.querySelector(sel); if (!root) return {missing: sel};
  const r = root.getBoundingClientRect(), bad = [], small = [], cut = [];
  if (r.left < -0.5 || r.top < -0.5 || r.right > vw + 0.5 || r.bottom > vh + 0.5) bad.push([sel, Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]);
  for (const b of root.querySelectorAll('button')) { const q = b.getBoundingClientRect(); if (q.width < 1) continue; if (q.height < 43.5 || q.width < 43.5) small.push([b.textContent.trim().slice(0, 20), Math.round(q.width), Math.round(q.height)]); if (b.scrollWidth > b.clientWidth + 1) cut.push(b.textContent.trim().slice(0, 24)); }
  for (const e of root.querySelectorAll('.mxtx,.mxkv,.mxst,.mxrow span,.mxrow b,.mxhd,h4')) if (e.scrollWidth > e.clientWidth + 1) cut.push(e.textContent.trim().slice(0, 30));
  return {bad, small, cut, h: document.scrollingElement.scrollHeight, vh, fonts: document.fonts ? [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family).join(',') : ''};
};
const VPS = [[428, 926], [926, 428], [428, 650], [375, 667], [844, 390]];
let shared = null;
for (const [w, h] of VPS) {
  const {b, p, errs, close} = await open(FILE, {width: w, height: h}, shared ? {browser: shared} : {});
  shared = shared || b;
  await p.waitForTimeout(400);
  const h0 = await p.evaluate(() => document.scrollingElement.scrollHeight);
  await p.evaluate(() => openMasterPage()); await p.waitForTimeout(300);
  const m = await p.evaluate(CHECK, '.mxab');
  ok(`${w}×${h} MASTER: Knöpfe im Bild, ≥ 44 px, nicht abgeschnitten`, !m.missing && !m.bad.length && !m.small.length && !m.cut.length, m);
  ok(`${w}×${h} MASTER: Seitenhöhe unverändert`, m.h === h0 && m.h <= h, [h0, m.h]);
  if (w === 428 && h === 926) ok('echte App-Schrift geladen', /Barlow|JetBrains/i.test(m.fonts), m.fonts);
  await p.screenshot({path: path.join(BILD, `master-${w}x${h}.png`)});
  // Blätter leer
  for (const [name, fn] of [['mix', 'mixaSheet'], ['am', 'amSheet']]) {
    await p.evaluate(fn => window.SYNQUENZER[fn](), fn); await p.waitForTimeout(200);
    const c = await p.evaluate(CHECK, '.pop.mxsheet');
    ok(`${w}×${h} Blatt ${name} (leer): im Bild, Ziele ≥ 44 px, nichts abgeschnitten`, !c.missing && !c.bad.length && !c.small.length && !c.cut.length, c);
    await p.evaluate(() => window.SYNQUENZER.mixaClose());
  }
  // mit Ergebnis (einmal gerechnet, dann in jeder Größe)
  if (w === 428 && h === 926) { await buildSong(p, {}); await p.evaluate(() => window.SYNQUENZER.mixaAnalyze()); await p.evaluate(() => window.SYNQUENZER.mixaMeasureAm(-14)); }
  else { await buildSong(p, {}); await p.evaluate(() => window.SYNQUENZER.mixaAnalyze()); await p.evaluate(() => window.SYNQUENZER.mixaMeasureAm(-14)); }
  for (const [name, fn] of [['mix', 'mixaSheet'], ['am', 'amSheet']]) {
    await p.evaluate(fn => window.SYNQUENZER[fn](), fn); await p.waitForTimeout(250);
    const c = await p.evaluate(CHECK, '.pop.mxsheet');
    ok(`${w}×${h} Blatt ${name} (Ergebnis): im Bild, Ziele ≥ 44 px, nichts abgeschnitten`, !c.missing && !c.bad.length && !c.small.length && !c.cut.length, c);
    const sc = await p.evaluate(() => { const e = document.querySelector('.pop.mxsheet'); return {sh: e.scrollHeight, ch: e.clientHeight, ov: getComputedStyle(e).overflowY, pan: e.classList.contains('pan-y')}; });
    ok(`${w}×${h} Blatt ${name}: scrollt per Finger (pan-y), wenn länger`, sc.sh <= sc.ch + 1 || (sc.ov === 'auto' && sc.pan), sc);
    await p.screenshot({path: path.join(BILD, `blatt-${name}-${w}x${h}.png`)});
    await p.evaluate(() => window.SYNQUENZER.mixaClose());
  }
  ok(`${w}×${h} keine Fehler`, !errs.length, errs.slice(0, 3));
  await close();
}
await shared.close();
fs.rmSync(TMP, {recursive: true, force: true});
console.log(failed() ? 'FEHLER: ' + failed() : 'ALLES GRÜN');
process.exit(failed() ? 1 : 0);
