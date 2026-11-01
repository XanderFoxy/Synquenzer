// V6A test helpers (Playwright + Chromium): open the app, a VA test track with two clips, probes
import { chromium } from 'playwright';
import path from 'path';
export const HERE = path.dirname(new URL(import.meta.url).pathname);
export const APP = process.env.V6A_APP || path.resolve(HERE, '../index.html');
export const BASE = path.resolve(HERE, '../../../snapshots/R-4300.html');
let fails = 0; const res = [];
export function ok(id, c, info) { if (!c) fails++; const l = (c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : ''); res.push(l); console.log(l); }
export function done() { console.log(fails ? `\n${fails} FEHLER` : '\nALLES GRÜN'); return fails; }
export async function open(file, o = {}) {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: o.vp || { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + (file || APP)); await p.waitForTimeout(1200);
  await p.evaluate(async () => {
    const Q = window.SYNQUENZER; Q.stop();
    await new Promise(r => setTimeout(r, 50));
    try { ensureAudio(); } catch (e) {}
    for (let k = 0; k < 100 && !(typeof wkReady === 'function' && wkReady()); k++) await new Promise(r => setTimeout(r, 50));
  });
  return { b, p, errs };
}
// the first VA synth track: a held chord in scene 0 and scene 1 (4 bars), engine VA (analog)
export async function setup(p, o = {}) {
  return p.evaluate(async (o) => {
    const Q = window.SYNQUENZER;
    const t = o.t != null ? o.t : S.tracks.findIndex(x => x.kind === 'synth' && !x.stimme);
    Q.setEngine(t, 'va');
    const len = o.len || 1, notes = o.notes || [{t: 0, d: len * 4 - .05, n: 57, v: .8}, {t: 0, d: len * 4 - .05, n: 64, v: .7}];
    for (let s = 0; s < (o.scenes || 2); s++) Q.setClip(t, s, {len, notes, key: {root: 0, scale: 'ionian'}});
    for (let i = 0; i < S.tracks.length; i++) if (i !== t) for (let s = 0; s < 8; s++) if (S.tracks[i].clips[s]) Q.setClip(i, s, null);
    Q.setBpm(o.bpm || 120);
    return t;
  }, o);
}
export async function sleep(p, ms) { await p.waitForTimeout(ms); }
export { fails };
