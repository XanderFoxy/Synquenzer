// VV4CE Bedienung: Bereich → ⋯ → Video → [Spur …] → [Modulation] (nur Spuren mit echter Modulation), Trefferflächen ≥ 44 px,
// 1 Undo-Schritt, Speichern/Laden behält den Eintrag; Live-Vorschau mit Modulations-Bild ohne Fehler. 428 × 926 und 926 × 428.
import { chromium } from 'playwright';
import { APP, OUT, ok, summary } from './lib.mjs';
import fs from 'fs';
fs.mkdirSync(OUT, {recursive: true});
const SONG = {bars: 8, lanes: [[], [{bar: 0, slot: 0}], [{bar: 0, slot: 0}], [], [{bar: 0, slot: 0}], []], carrier: [], mel: {}, marks: []};
for (const [nm, w, h] of [['P', 428, 926], ['L', 926, 428]]) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const p = await b.newPage({viewport: {width: w, height: h}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + APP); await p.waitForTimeout(1500); await p.mouse.click(5, 300);
  await p.evaluate(s => { SYNQUENZER.setSong(s); setSongView(true); }, SONG); await p.waitForTimeout(400);
  await p.evaluate(() => SYNQUENZER.songSelect(2, 3)); await p.waitForTimeout(250);
  await p.tap('#rangeBar button[data-a="more"]'); await p.waitForTimeout(300);
  await p.tap('.pop .vvdr button[data-a="vv-spur"]'); await p.waitForTimeout(300);
  const m = await p.evaluate(() => {
    const o = {spur: [], mod: [], small: [], hits: [], out: []};
    for (const e of document.querySelectorAll('.pop button[data-t], .pop button[data-m]')) {
      const q = e.getBoundingClientRect(), t = e.textContent.trim(); (e.dataset.m != null ? o.mod : o.spur).push(t);
      if (q.width < 43.5 || q.height < 43.5) o.small.push(t + ' ' + q.width.toFixed(1) + 'x' + q.height.toFixed(1));
      if (q.right > innerWidth || q.bottom > innerHeight || q.left < 0 || q.top < 0) o.out.push(t);
      const cx = q.left + q.width / 2, cy = q.top + q.height / 2;
      for (const [x, y] of [[cx, cy], [cx - 20, cy - 20], [cx + 20, cy + 20]]) { const hh = document.elementFromPoint(x, y); if (!hh || (hh !== e && !e.contains(hh))) o.hits.push(t + ' → ' + (hh ? hh.tagName : 'null')); }
    }
    return o; });
  ok(nm + ' [Modulation] nur für Spuren mit echter Modulation (SYN 3 ja, SYN 2 FM nein, DRUMS nein)', m.mod.length === 1 && /3/.test(m.mod[0]) && m.spur.length === 3, m);
  ok(nm + ' Trefferflächen ≥ 44 px, im Bild, frei', !m.small.length && !m.hits.length && !m.out.length, {small: m.small, hits: m.hits, out: m.out});
  await p.screenshot({path: OUT + '/ui-' + nm + '-spurblatt.png'});
  const u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
  await p.tap('.pop button[data-m="2"]'); await p.waitForTimeout(300);
  const r = await p.evaluate(() => ({dir: SYNQUENZER.vvDirGet(), n: SYNQUENZER.undoInfo().n, of: SYNQUENZER.vvDirOf(2, 4)}));
  ok(nm + ' Tipp setzt {a: 2, b: 4, v: mod, t: 2}, 1 Undo-Schritt', JSON.stringify(r.dir) === JSON.stringify([{a: 2, b: 4, v: 'mod', t: 2}]) && r.n === u0 + 1 && r.of === 'mod:2', r);
  const un = await p.evaluate(() => { undo(); const a = SYNQUENZER.vvDirGet(); redo(); return [a, SYNQUENZER.vvDirGet()]; });
  ok(nm + ' Undo / Redo', un[0] == null && JSON.stringify(un[1]) === JSON.stringify([{a: 2, b: 4, v: 'mod', t: 2}]), un);
  const sv = await p.evaluate(() => { const s1 = serialize(); applyProject(normalizeProject(projFromFile(JSON.parse(s1))), {}); return JSON.stringify(SYNQUENZER.vvDirGet()); });
  ok(nm + ' Speichern → Laden behält den Eintrag', sv === JSON.stringify([{a: 2, b: 4, v: 'mod', t: 2}]), sv);
  const cuts = await p.evaluate(() => SYNQUENZER.vvCuts({range: {a: 0, b: 8}}));
  ok(nm + ' Auto-Regie: Takt 3–4 = Modulation Synth 3', cuts && cuts.shots.some(s => s.a === 2 && s.b === 4 && s.v === 'mod' && s.t === 2), cuts && cuts.shots.map(s => [s.a, s.b, s.v, s.t]));
  // live preview (Vorschau) with the picture of bars 3–4
  await p.evaluate(() => { closePop(); SV.sel = null; rangeBarSync(); SYNQUENZER.vvOpen(); SYNQUENZER.vvPrefs({view: 'auto'}); }); await p.waitForTimeout(400);
  await p.evaluate(() => SYNQUENZER.vvPreview(true)); await p.waitForTimeout(6500);
  await p.screenshot({path: OUT + '/ui-' + nm + '-vorschau.png'});
  await p.evaluate(() => SYNQUENZER.vvPreview(false)); await p.waitForTimeout(300);
  ok(nm + ' keine Konsolenfehler (inkl. Live-Vorschau)', !errs.length, errs.slice(0, 4));
  await b.close();
}
console.log(JSON.stringify(summary()));
process.exit(summary().fails ? 1 : 0);
