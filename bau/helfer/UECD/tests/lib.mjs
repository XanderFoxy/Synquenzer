// UE-C/D Testhilfen (Playwright + Chromium). Nutzung: import {open, song, ...} from './lib.mjs'
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
export const DIR = path.dirname(fileURLToPath(import.meta.url));
export const APP = process.env.UE_APP || path.resolve(DIR, '../index.html');
export const KITS = ['808', '909', 'Rom Pop', 'Gated 84', 'FM Labor', 'Disko 85', 'Resonanz-Perc'];
export async function open(o = {}) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const p = await b.newPage({viewport: o.vp || {width: 428, height: 926}, deviceScaleFactor: o.dpr || 1, hasTouch: !!o.touch});
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + (o.app || APP)); await p.waitForFunction(() => window.SYNQUENZER && document.querySelector('#app')); await p.waitForTimeout(400);
  return {b, p, errs};
}
// Testsong: Drum-Groove (Muster) in Slot 0, optional Synth-Pad; Teile je `lenBars` Takte; Kanten bei 4, 8, …
export async function song(p, o = {}) {
  return p.evaluate(o => {
    const A = window.SYNQUENZER, nb = o.parts || 2, L = o.lenBars || 4, bars = nb * L;
    A.newProject({});
    const pat = {kick: 'x...x...x...x...', snare: '....X.......X...', hatC: 'x.x.x.x.x.x.x.x.'};
    const gm = {kick: 36, snare: 38, hatC: 42}, notes = [];
    for (const k in pat) [...pat[k]].forEach((c, i) => { if (c !== '.') notes.push(Object.assign({t: i * .25, d: .1, n: gm[k], v: c === 'X' ? 1 : .8}, c === 'X' ? {a: 1} : {})); });
    A.setClip(4, 0, {len: 1, notes});
    if (o.kit) A.loadKit(o.kit);
    if (o.bpm) A.setBpm(o.bpm);
    const lanes = Array.from({length: A.NT()}, () => []); lanes[4] = [{bar: 0, slot: 0}];
    if (o.pad) { A.setClip(0, 0, {len: 1, notes: [{t: 0, d: 4, n: 60, v: .8}, {t: 0, d: 4, n: 64, v: .8}, {t: 0, d: 4, n: 67, v: .8}]}); lanes[0] = [{bar: 0, slot: 0}]; }
    if (o.lanes) for (const k in o.lanes) lanes[k] = o.lanes[k];
    const marks = Array.from({length: nb}, (_, i) => ({a: i * L, len: L, part: 'S' + (i + 1)}));
    A.setSong({bars, lanes, carrier: [], marks, mel: {}});
    return A.songMarks ? A.song().marks : A.song().marks;
  }, o);
}
// offline render (Video-Weg) – Ergebnis: Kennzahlen, Noten-Log; pcm(): Float32-Kanäle eines Bereichs
export async function render(p, a, b) {
  const r = await p.evaluate(async ([a, b]) => { const A = window.SYNQUENZER; const r = await A.vvRender({range: {a, b}}); return {peak: r.peak, rms: r.rms, sr: r.sr, dur: r.dur, songSec: r.songSec, log: r.log, bpm: A.state().project.bpm}; }, [a, b]);
  return r;
}
export async function pcm(p, t0, t1) {
  const o = await p.evaluate(([t0, t1]) => window.SYNQUENZER.vvPcm(t0, t1), [t0, t1]);
  const buf = Buffer.from(o.b64, 'base64'), i16 = new Int16Array(buf.buffer, buf.byteOffset, buf.length / 2), L = new Float32Array(o.n), R = new Float32Array(o.n);
  for (let k = 0; k < o.n; k++) { L[k] = i16[2 * k] / 32767; R[k] = i16[2 * k + 1] / 32767; }
  return {sr: o.sr, L, R};
}
// BS.1770 K-Gewichtung (48 kHz-Koeffizienten, bei anderer Rate über bilineare Umrechnung) → Lautheit (ungegated) in LUFS
function kCoef(sr) {
  // Vorfilter (Hochregal) und RLB-Hochpass nach ITU-R BS.1770-4, allgemein für fs
  const f0 = 1681.974450955533, G = 3.999843853973347, Q = .7071752369554196, K = Math.tan(Math.PI * f0 / sr), Vh = Math.pow(10, G / 20), Vb = Math.pow(Vh, .4996667741545416);
  const a0 = 1 + K / Q + K * K, s1 = [(Vh + Vb * K / Q + K * K) / a0, 2 * (K * K - Vh) / a0, (Vh - Vb * K / Q + K * K) / a0, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0];
  const f1 = 38.13547087602444, Q1 = .5003270373238773, K1 = Math.tan(Math.PI * f1 / sr), b0 = 1 + K1 / Q1 + K1 * K1;
  const s2 = [1, -2, 1, 2 * (K1 * K1 - 1) / b0, (1 - K1 / Q1 + K1 * K1) / b0];
  return [s1, s2];
}
function biq(x, c) { const y = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let k = 0; k < x.length; k++) { const v = c[0] * x[k] + c[1] * x1 + c[2] * x2 - c[3] * y1 - c[4] * y2; x2 = x1; x1 = x[k]; y2 = y1; y1 = v; y[k] = v; } return y; }
export function kWeight(ch, sr) { const [a, b] = kCoef(sr); return ch.map(x => biq(biq(x, a), b)); }
export function lufs(kw, sr, t0, t1) { const a = Math.max(0, Math.round(t0 * sr)), b = Math.min(kw[0].length, Math.round(t1 * sr)); let s = 0; for (const x of kw) for (let k = a; k < b; k++) s += x[k] * x[k]; return -0.691 + 10 * Math.log10(s / Math.max(1, b - a) + 1e-20); }
export function peakDb(ch, sr, t0, t1) { const a = Math.max(0, Math.round(t0 * sr)), b = Math.min(ch[0].length, Math.round(t1 * sr)); let m = 0; for (const x of ch) for (let k = a; k < b; k++) { const v = Math.abs(x[k]); if (v > m) m = v; } return 20 * Math.log10(m + 1e-20); }
export const db = x => 20 * Math.log10(Math.abs(x) + 1e-20);
export function ok(cond, name, info) { const r = {name, ok: !!cond, info: info == null ? '' : typeof info === 'string' ? info : JSON.stringify(info)}; console.log((r.ok ? 'OK   ' : 'FEHL ') + name + (r.info ? '  ' + r.info : '')); return r; }
