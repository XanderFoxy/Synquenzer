// KONUX-Tests: gemeinsamer Aufbau (Seite öffnen, Song mit Marken/Akkorden/Melodie, Finger-Helfer)
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');   // global installiert (Container); ESM findet NODE_PATH nicht
import path from 'path';
import { fileURLToPath } from 'url';
export const DIR = path.dirname(fileURLToPath(import.meta.url));
export const NEU = path.resolve(DIR, '../index.html');
export const ALT = path.resolve(DIR, '../../../snapshots/R-4300.html');
export const BILD = path.join(DIR, 'bilder');
export async function open(o = {}) {
  const b = o.browser || await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await b.newContext({viewport: {width: o.w || 428, height: o.h || 926}, deviceScaleFactor: o.dpr || 2, hasTouch: o.touch !== false, isMobile: o.touch !== false});
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + String(e))); p.on('console', m => { if (m.type() === 'error' && !/favicon|ERR_FILE_NOT_FOUND|net::/.test(m.text())) errs.push(m.text()); });
  await p.addInitScript(() => { try { localStorage.clear(); indexedDB.deleteDatabase && 0; } catch (e) {} });
  await p.goto('file://' + (o.app || NEU)); await p.waitForTimeout(1200);
  const tx = (o.w || 428) - 6, ty = (o.h || 926) - 6;      // Audio-Start: ein Tipp unten rechts (Tastatur) – trifft keine Teile-Leiste
  if (o.touch !== false) await p.touchscreen.tap(tx, ty); else await p.mouse.click(tx, ty);
  await p.evaluate(() => { try { closePop(); } catch (e) {} });
  await p.waitForFunction(() => typeof SYNQUENZER !== 'undefined' && typeof AU !== 'undefined' && AU.ctx, null, {timeout: 15000}).catch(() => {});
  await p.waitForTimeout(300);
  return {b, ctx, p, errs, close: async () => { await ctx.close(); if (!o.browser) await b.close(); }};
}
// ein echter kleiner Song: Spuren, Akkorde, Melodie, vier Marken (Intro 0–2, Strophe 2–6, Refrain 6–10, Outro 10–12)
export async function buildSong(p, o = {}) {
  return p.evaluate(async (o) => {
    const A = SYNQUENZER; A.setMetronome && A.setMetronome(false);
    const nt = NT(), lanes = Array.from({length: nt}, () => []);
    lanes[0] = [{bar: 0, slot: 0}];
    lanes[1] = [{bar: 2, slot: 0}, {bar: 6, slot: 1}];
    lanes[2] = [{bar: 6, slot: 0}, {bar: 10, slot: 1}];
    lanes[3] = [{bar: 2, slot: 0}, {bar: 6, slot: 1}, {bar: 10, slot: -1}];
    lanes[4] = [{bar: 0, slot: 1}, {bar: 2, slot: 0}];
    const mel = {5: {notes: [[24, 72], [26, 74], [28, 76], [30, 74], [32, 72], [34, 71], [36, 69], [40, 72], [42, 76], [44, 79], [46, 77], [48, 76]].map(([t, n]) => ({t, d: 1.5, n, v: .8}))}};
    A.setSong({bars: 12, lanes, carrier: [], mel, melodyTrack: 5, marks: [{id: 'm1', a: 0, len: 2, name: 'Intro'}, {id: 'm2', a: 2, len: 4, name: 'Strophe'}, {id: 'm3', a: 6, len: 4, name: 'Refrain'}, {id: 'm4', a: 10, len: 2, name: 'Outro'}]});
    A.songSetChord(6, 'Am'); A.songSetChord(10, 'F');
    if (o.view !== false) { try { closeSheets(); } catch (e) {} setSongView(true); }
    await new Promise(r => setTimeout(r, 500));
    return {bars: S.song.bars, nt};
  }, o);
}
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const tapXY = async (p, x, y, w = 350) => { await p.touchscreen.tap(x, y); await p.waitForTimeout(w); };
export async function tapSel(p, sel, w = 350) {
  const e = await p.$(sel); if (!e) throw new Error('fehlt ' + sel);
  await e.scrollIntoViewIfNeeded().catch(() => {}); await p.waitForTimeout(60);   // z. B. Namens-Chip im waagrechten Scroller
  const q = await e.boundingBox(); if (!q) throw new Error('unsichtbar ' + sel);
  await tapXY(p, q.x + q.width / 2, q.y + q.height / 2, w); return q;
}
export const li = p => p.evaluate(() => svLayoutInfo());
// Finger auf die Marke (Lineal) mit dem Namen-Anfang re
export async function markTap(p, re) {
  for (let d = 0; d < 6; d++) {
    const I = await li(p); const m = I.marks.find(x => new RegExp(re, 'i').test(x.label));
    if (m && m.x0 >= 0 && m.x1 <= I.canvas.w) { const y = I.canvas.y + (I.blS | 0) + (I.rulerH - (I.blS | 0)) / 2; await tapXY(p, I.canvas.x + (m.x0 + m.x1) / 2, y, 450); return true; }
    await p.evaluate(x => { SV.x = Math.max(0, x); UI.dirty.song = true; }, m ? m.x0 - 20 + I.x0 : I.x0 + 150); await p.waitForTimeout(250);
  }
  return false;
}
// Bereich per Finger: Takt a im Lineal tippen, dann bis Takt b ziehen geht nicht zuverlässig → Auswahl wie die Lineal-Logik (SV.sel) setzen
export async function selRange(p, a, b) {
  await p.evaluate(([a, b]) => { SV.x = 0; SV.sel = {a, b}; SV.pos = a; svButtons(); rangeBarSync(); UI.dirty.song = true; }, [a, b]); await p.waitForTimeout(300);
}
export async function blockTap(p, id) {
  await p.evaluate(() => { SV.x = 0; UI.dirty.song = true; }); await p.waitForTimeout(250);
  const I = await li(p); const k = I.blocks.find(x => x.id === id); if (!k) throw new Error('Block fehlt ' + id);
  await tapXY(p, I.canvas.x + (k.x0 + k.x1) / 2, I.canvas.y + I.blS * .8, 450);   // Querformat: das TAKT-Feld ragt oben ~5 px über die Block-Zeile
}
export const songJ = p => p.evaluate(() => { const st = SYNQUENZER.state().project; return {song: st.song, parts: st.parts}; });
// tiefe Gleichheit (Schlüsselreihenfolge egal)
export function deq(a, b, pth = '') {
  if (a === b) return null;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') return pth + ': ' + JSON.stringify(a)?.slice(0, 80) + ' ≠ ' + JSON.stringify(b)?.slice(0, 80);
  if (Array.isArray(a) !== Array.isArray(b)) return pth + ': Feld/Objekt';
  const ks = new Set(Object.keys(a).concat(Object.keys(b)));
  for (const k of ks) { const r = deq(a[k], b[k], pth + '.' + k); if (r) return r; }
  return null;
}
