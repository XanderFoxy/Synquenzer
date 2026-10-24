// VS2b Live-Anzeige (Worklet „synq-stimme“ aus index.html, Node-Attrappe): Wackeln, falsche Zwischen-Tasten, Latenz
// node v3-vs2b-live.mjs <index.html> [cond…] [-v]
import fs from 'fs';
import {CONDS, melFor, renderContour} from './v3-vs2b-synth.mjs';
import {resample} from './v3-vs2b-real.mjs';
const html = fs.readFileSync(process.argv[2] && process.argv[2].endsWith('.html') ? process.argv[2] : '../dirigent-wt/index.html', 'utf8');
const only = process.argv.slice(3).filter(a => !a.startsWith('-')), V = process.argv.includes('-v');
const a = html.indexOf('const ST_WK = `') + 'const ST_WK = `'.length, b = html.indexOf("registerProcessor('synq-stimme', SynqStimme);`;") + "registerProcessor('synq-stimme', SynqStimme);".length;
const SRC = html.slice(a, b);
export function make(sr, mpm) {
  let Cls = null; const msgs = [];
  class AWP { constructor() { this.port = {postMessage: m => msgs.push(m), onmessage: null}; } }
  globalThis.currentFrame = 0;
  new Function('AudioWorkletProcessor', 'registerProcessor', 'sampleRate', SRC)(AWP, (n, c) => { Cls = c; }, sr);
  const p = new Cls({processorOptions: {block: 4096, mpm}});
  return {p, msgs, run(x) { const out = [[new Float32Array(128)]], z = new Float32Array(128); let ms = 0; for (let i = 0; i + 128 <= x.length; i += 128) { globalThis.currentFrame = i; const t = process.hrtime.bigint(); p.process([[x.subarray(i, i + 128)], [z]], out); ms += Number(process.hrtime.bigint() - t) / 1e6; } return ms; }};
}
const SR = 48000;
export function liveScore(msgs, truth) {
  const L = msgs.filter(m => m.lit !== undefined).map(m => ({n: m.lit, t: m.f / SR})), segs = [];
  for (let i = 0; i < L.length; i++) if (L[i].n >= 0) segs.push({n: L[i].n, t0: L[i].t, t1: i + 1 < L.length ? L[i + 1].t : 1e9});
  const at = t => truth.find(x => t >= x.on && t < x.off);
  let wrong = 0, wrong30 = 0, wob = 0; const lat = [], ex = [];
  // falsch = diese Taste wurde in [Anfang − 150 ms, Ende] gar nicht gesungen (eine nachlaufende Taste ist kein Fehler, nur Latenz)
  for (const s of segs) { const tt = truth.find(x => x.midi === s.n && x.off > s.t0 - 0.15 && x.on < s.t1); if (!tt) { wrong++; if (s.t1 - s.t0 >= 0.03) wrong30++; if (ex.length < 4) ex.push([+s.t0.toFixed(3), +(s.t1 - s.t0).toFixed(3), s.n, (at(s.t0) || {}).midi]); } }
  for (const x of truth) {
    const ins = segs.filter(s => s.t1 > x.on + 0.1 && s.t0 < x.off - 0.06);       // während des Tons (ohne Einsatz/Übergang)
    wob += Math.max(0, ins.length - 1);
    const f = segs.find(s => s.n === x.midi && s.t1 > x.on && s.t0 < x.off); if (f) lat.push(Math.max(0, f.t0 - x.on) * 1000);
  }
  lat.sort((p, q) => p - q);
  return {segs: segs.length, wrong, wrong30, wob, latMed: Math.round(lat[lat.length >> 1] || 0), lat90: Math.round(lat[Math.floor(lat.length * 0.9)] || 0), found: lat.length, ex};
}
if (process.argv[1] && process.argv[1].endsWith('v3-vs2b-live.mjs')) {
  const tot = {}; let cpu = 0, sec = 0;
  for (const [name, c] of Object.entries(CONDS)) { if (only.length && !only.includes(name)) continue;
    const r = {notes: 0, segs: 0, wrong: 0, wrong30: 0, wob: 0, found: 0, lat: [], ex: []};
    for (const seed of [1, 2]) for (const voice of ['male', 'female']) {
      const base = voice === 'male' ? 52 : 64, notes = melFor(seed * 131 + base + name.length, base, c), sig = renderContour(notes, {voice, seed, snr: c.snr});
      const x = resample(sig.x, 16000, SR), W = make(SR, {src: 'voice', lock: false}); cpu += W.run(x); sec += x.length / SR;
      const s = liveScore(W.msgs, sig.truth); r.notes += notes.length; for (const k of ['segs', 'wrong', 'wrong30', 'wob', 'found']) r[k] += s[k]; r.lat.push(s.latMed, s.lat90); if (r.ex.length < 4) r.ex.push(...s.ex.slice(0, 2));
    }
    console.log(JSON.stringify({name, ...r, ex: V ? r.ex : undefined}));
  }
  console.log('cpu', (100 * cpu / 1000 / sec).toFixed(2) + '% Echtzeit');
}
