// MIX-A Tests: gemeinsame Helfer (Seite mit festem Zufall, Testsong mit Bass, Sequenz, Fläche, Lead, Drums, Gesang)
import { chromium } from 'playwright';
import path from 'path';
export const HERE = path.dirname(new URL(import.meta.url).pathname);
export const APP = path.resolve(process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : path.join(HERE, '../index.html'));
let fails = 0; export const failed = () => fails;
export const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info != null ? ' — ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); return !!c; };
// fester Zufall (Rauschpuffer, Drum-Zufall): zwei Läufe / zwei Dateien sind vergleichbar
// fester Zufall (Rauschpuffer, Hall-IR, Drum-Zufall; im Worklet über den Modul-Text): zwei Läufe / zwei Dateien sind vergleichbar.
// __reseed(): vor jedem Render derselbe Anfangszustand (jeder Offline-Kontext lädt das Worklet-Modul neu = eigener Zufall ab Startwert)
const PRNG = `let __s = 123456789; Math.random = () => { __s ^= __s << 13; __s >>>= 0; __s ^= __s >>> 17; __s ^= __s << 5; __s >>>= 0; return __s / 4294967296; };`;
const SEED = `(() => { ${PRNG} window.__reseed = v => { __s = v || 123456789; };
  document.addEventListener('DOMContentLoaded', () => { for (const id of ['sq-worklet-src', 'sq-md-src']) { const e = document.getElementById(id); if (e) e.textContent = ${JSON.stringify(PRNG)} + '\\n' + e.textContent; } }); })();`;
export async function open(file, vp, o = {}) {
  const b = o.browser || await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await b.newContext({viewport: vp || {width: 428, height: 926}, hasTouch: true, isMobile: true});
  await ctx.addInitScript(SEED); if (o.init) await ctx.addInitScript(o.init);
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + (file || APP)); await p.waitForTimeout(1200);
  return {b, p, errs, close: () => (o.browser ? ctx.close() : b.close())};
}
// Gesang: gesungener Vokal (Formanten 700/1200/2600 Hz, Vibrato 5,5 Hz), Silben 0,45 s, 16 Bit WAV als Base64
export function vocalWav(sec, sr = 48000, startSec = 0) {
  const n = Math.round(sec * sr), x = new Float32Array(n), mel = [64, 67, 69, 67, 64, 62, 64, 60], F = [[700, 110], [1200, 140], [2600, 220]];
  const syl = 0.6; let k = 0;
  for (let t0 = startSec; t0 + 0.45 < sec; t0 += syl, k++) {
    const f0 = 440 * Math.pow(2, (mel[k % mel.length] - 69) / 12), a0 = Math.round(t0 * sr), len = Math.round(0.45 * sr); let ph = 0;
    const amp = 0.25 * (0.6 + 0.4 * ((k * 7) % 5) / 4);
    for (let i = 0; i < len && a0 + i < n; i++) {
      const t = i / sr, env = Math.min(1, t / 0.04) * Math.min(1, (0.45 - t) / 0.08), f = f0 * Math.pow(2, 0.3 / 12 * Math.sin(2 * Math.PI * 5.5 * t));
      ph += 2 * Math.PI * f / sr; let v = 0;
      for (let h = 1; h * f0 < 6000; h++) { const fh = h * f0; let g = 0; for (const [c, bw] of F) g += Math.exp(-((fh - c) ** 2) / (2 * bw * bw)); v += (g + 0.02 / h) * Math.sin(h * ph); }
      x[a0 + i] += v * amp * env;
    }
  }
  const buf = Buffer.alloc(44 + n * 2); buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8); buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(x[i] * 32767))), 44 + i * 2);
  return buf.toString('base64');
}
// Testsong: Spur 0 Bass (Achtel, tief), 1 Sequenz (Sechzehntel-Arpeggio, kurz), 2 Fläche (Akkorde über den Takt), 3 Lead (Melodie), 4 Drums,
// Szene 0. Song 12 Takte: Teil „Intro“ (Takt 1–4: Fläche + Lead), Teil „Refrain“ (Takt 5–12: alle). opts.vocal: Gesang im Refrain
export async function buildSong(p, opts = {}) {
  return p.evaluate(async o => {
    const Q = window.SYNQUENZER;
    const bass = {len: 1, notes: []}; [36, 36, 43, 36, 38, 36, 43, 41].forEach((n, k) => bass.notes.push({t: k * 0.5, d: 0.4, n, v: 0.9 - (k % 2) * 0.25}));
    const arp = {len: 1, notes: []}; for (let k = 0; k < 16; k++) arp.notes.push({t: k * 0.25, d: 0.12, n: [72, 76, 79, 84][k % 4], v: 0.8});
    const pad = {len: 2, notes: []}; for (const [t, ch] of [[0, [60, 64, 67, 71]], [4, [57, 60, 64, 67]]]) for (const n of ch) pad.notes.push({t, d: 3.9, n, v: 0.7});
    const lead = {len: 2, notes: []}; [[0, 1, 76], [1, 0.5, 79], [1.5, 0.5, 77], [2, 1.5, 76], [4, 0.75, 72], [4.75, 0.75, 74], [5.5, 1, 76], [6.5, 1.5, 79]].forEach(([t, d, n]) => lead.notes.push({t, d, n, v: 0.85}));
    const dr = {len: 1, notes: []}; for (let k = 0; k < 4; k++) dr.notes.push({t: k, d: 0.1, n: 36, v: 1}); for (const t of [1, 3]) dr.notes.push({t, d: 0.1, n: 38, v: 0.9}); for (let k = 0; k < 8; k++) dr.notes.push({t: k * 0.5, d: 0.05, n: 42, v: 0.6});
    Q.setClip(0, 0, bass); Q.setClip(1, 0, arp); Q.setClip(2, 0, pad); Q.setClip(3, 0, lead); Q.setClip(4, 0, dr);
    const nt = Q.tracks().length, lanes = Array.from({length: nt}, () => []);
    lanes[2] = [{bar: 0, slot: 0}]; lanes[3] = [{bar: 0, slot: 0}];
    for (const t of [0, 1, 4]) lanes[t] = [{bar: 0, slot: -1}, {bar: 4, slot: 0}];
    Q.setSong({bars: 12, lanes, carrier: [], marks: [{a: 0, len: 4, name: 'Intro'}, {a: 4, len: 8, name: 'Refrain'}]});
    if (o.vocal) { const r = await Q.ggbImport(o.vocal, {name: 'Gesang'}); if (!r) return {err: 'vocal'}; }
    return {tracks: Q.tracks().length, song: !!Q.project().song};
  }, opts);
}
