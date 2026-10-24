// node v3-vs2b-dbg.mjs <index> <cond> <voice> <seed> [t0 t1]
import {loadDsp, rng} from './v3-vs2-corpus.mjs';
import {renderContour, CONDS} from './v3-vs2b-synth.mjs';
const [file, cond, voice, seedS, a0, a1] = process.argv.slice(2);
const D = loadDsp(file), seed = +seedS, c = CONDS[cond];
// regenerate exactly like runCond
const mod = await import('./v3-vs2b-synth.mjs');
const base = voice === 'male' ? 52 : 64;
const notes = mod.melFor ? mod.melFor(seed * 131 + base + cond.length, base, c) : null;
const sig = renderContour(notes, {voice, seed, snr: c.snr});
const tr = D.pyin(sig.x, {fs: 16000}), ns = D.segment(tr, {snap: false, tuning: 'auto'}).notes;
const lo = a0 ? +a0 : 0, hi = a1 ? +a1 : 1e9, hop = tr.hop / tr.fs;
const ev = [...notes.map(n => ({t: n.on, s: 'T', d: n.dur, m: n.midi, x: JSON.stringify({g: n.glide && +n.glide.toFixed(3), sc: n.scoop && n.scoop.map(v => +v.toFixed(2)), fa: n.fall && n.fall.map(v => +v.toFixed(2)), vib: n.vib && +n.vib[0].toFixed(0)})})), ...ns.map(n => ({t: n.t0, s: 'D', d: n.t1 - n.t0, m: n.m, n: n.n, by: n.by}))].sort((p, q) => p.t - q.t);
for (const e of ev) { if (e.t < lo || e.t > hi) continue; let trc = ''; if (e.s === 'D') { const a = Math.round(e.t / hop), b = Math.round((e.t + e.d) / hop); const v = []; for (let i = a; i < b; i += 3) v.push(tr.f0[i] > 0 ? (69 + 12 * Math.log2(tr.f0[i] / 440)).toFixed(1) : '-'); trc = v.join(' '); }
  console.log((e.s === 'T' ? 'T ' : '     D ') + e.t.toFixed(3), e.d.toFixed(3), (+e.m).toFixed(2), e.n ?? '', e.by ?? '', e.x ?? '', trc.slice(0, 220)); }
