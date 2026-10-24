// QA VS2b acceptance: live key (worklet synq-stimme from index.html) with the independent singing synth, 4.5.2 vs 4.5.1.
import fs from 'fs';
import {make, srcOf} from './v3-vs2b-live.mjs';
import {resample} from './v3-vs2b-real.mjs';
import {sing} from './v3-qa-vs2b-acc-synth.mjs';
const SN = srcOf(fs.readFileSync('../dirigent-wt/index.html', 'utf8')), SO = srcOf(fs.readFileSync('v3-vs2b-base.html', 'utf8'));
const SR = 48000, only = (process.env.ONLY || '').split(',').filter(Boolean);
function live(SRC, notes, o) {
  const s = sing(notes, {sigma: 6, rev: false, snr: 45, ...o}), x = resample(s.x, 16000, SR), W = make(SR, {src: 'voice', lock: false}, SRC), ms = W.run(x);
  const L = W.msgs.filter(m => m.lit !== undefined).map(m => ({n: m.lit, t: m.f / SR})), segs = [];
  for (let i = 0; i < L.length; i++) if (L[i].n >= 0) segs.push({n: L[i].n, t0: L[i].t, t1: i + 1 < L.length ? L[i + 1].t : x.length / SR});
  return {segs, truth: s.truth, cpu: ms / 1000 / (x.length / SR) * 100};
}
const both = (notes, o) => ({n: live(SN, notes, o), o: live(SO, notes, o)});
const VO = [['male', 50], ['female', 62]];
const want = c => !only.length || only.some(x => c.startsWith(x));
// changes of the lit key inside a held note (from on+150 ms to off-60 ms), and keys that were never sung
function wob(r) { let ch = 0, wrong = 0, wrongMs = 0; const ex = [];
  for (const t of r.truth) { const ins = r.segs.filter(s => s.t1 > t.on + 0.15 && s.t0 < t.off - 0.06); ch += Math.max(0, ins.length - 1); }
  for (const s of r.segs) if (!r.truth.some(t => t.midi === s.n && t.off > s.t0 - 0.15 && t.on < s.t1)) { wrong++; wrongMs += (s.t1 - s.t0) * 1000; if (ex.length < 3) ex.push([+s.t0.toFixed(3), Math.round((s.t1 - s.t0) * 1000), s.n]); }
  return {ch, wrong, wrongMs: Math.round(wrongMs), ex}; }
if (want('LVIB')) for (const hz of [5, 5.5, 6.5]) for (const ct of [50, 100, 130]) {
  const T = {n: {ch: 0, wrong: 0, wrongMs: 0}, o: {ch: 0, wrong: 0, wrongMs: 0}}; let ex;
  for (const seed of [1, 2]) for (const [voice, b] of VO) {
    const notes = [{on: 0.3, dur: 1.5, midi: b, vib: {ct, hz, delay: 0.15, jit: 1}}, {on: 2.0, dur: 1.5, midi: b + 3, vib: {ct, hz, delay: 0.15, jit: 1}, cons: 'l'}];
    const r = both(notes, {voice, seed}); for (const k of ['n', 'o']) { const w = wob(r[k]); T[k].ch += w.ch; T[k].wrong += w.wrong; T[k].wrongMs += w.wrongMs; if (k === 'n' && w.ex.length && !ex) ex = [voice, seed, ...w.ex]; }
  }
  console.log(`${T.n.ch === 0 && T.n.wrong === 0 ? 'PASS' : 'FAIL'} LVIB ${hz} Hz ±${ct} ct (8 held 1.5 s notes): NEW key changes inside notes ${T.n.ch}, never-sung keys ${T.n.wrong} (${T.n.wrongMs} ms) ${ex ? JSON.stringify(ex) : ''} | OLD ${T.o.ch}, ${T.o.wrong} (${T.o.wrongMs} ms)`);
}
if (want('LGLIDE')) for (const iv of [2, 5, 7, -3, -7]) for (const g of [120, 250]) {
  const T = {n: {ch: 0, wrong: 0, wrongMs: 0}, o: {ch: 0, wrong: 0, wrongMs: 0}}; let ex;
  for (const seed of [1, 2]) for (const [voice, b] of VO) {
    const notes = [{on: 0.3, dur: 0.6, midi: b}, {on: 0.9, dur: 0.6, midi: b + iv, glide: g / 1000}];
    const r = both(notes, {voice, seed}); for (const k of ['n', 'o']) { const w = wob(r[k]); T[k].ch += w.ch; T[k].wrong += w.wrong; T[k].wrongMs += w.wrongMs; if (k === 'n' && w.ex.length && !ex) ex = [voice, seed, ...w.ex]; }
  }
  console.log(`${T.n.wrong === 0 ? 'PASS' : 'INFO'} LGLIDE ${iv} st ${g} ms (4 slides): NEW in-between keys ${T.n.wrong} (${T.n.wrongMs} ms total) ${ex ? JSON.stringify(ex) : ''} | OLD ${T.o.wrong} (${T.o.wrongMs} ms)`);
}
if (want('LSCOOP')) for (const st of [1, 1.3, 2, -1.3]) for (const ms of [80, 140]) {
  const T = {n: {wrong: 0, wrongMs: 0}, o: {wrong: 0, wrongMs: 0}}; let ex;
  for (const seed of [1, 2]) for (const [voice, b] of VO) {
    const notes = [0, 2, 4].map((s, k) => ({on: 0.3 + k * 0.8, dur: 0.6, midi: b + s, scoop: [st, ms / 1000, process.env.SHAPE || 'cos']}));
    const r = both(notes, {voice, seed}); for (const k of ['n', 'o']) { const w = wob(r[k]); T[k].wrong += w.wrong; T[k].wrongMs += w.wrongMs; if (k === 'n' && w.ex.length && !ex) ex = [voice, seed, ...w.ex]; }
  }
  console.log(`${T.n.wrong === 0 ? 'PASS' : 'INFO'} LSCOOP ${st} st ${ms} ms (12 notes): NEW wrong keys ${T.n.wrong} (${T.n.wrongMs} ms) ${ex ? JSON.stringify(ex) : ''} | OLD ${T.o.wrong} (${T.o.wrongMs} ms)`);
}
// N7V-14 latency steady tone → key on; key off after the voice stops; CPU
if (want('LLAT')) { const lat = {n: [], o: []}, off = {n: [], o: []}; let cpu = 0, cn = 0;
  for (const seed of [1, 2, 3]) for (const [voice, b] of VO) for (const vw of ['a', 'i']) {
    const notes = [{on: 0.3, dur: 0.8, midi: b, vowel: vw}, {on: 1.5, dur: 0.8, midi: b + 5, vowel: vw}];
    const r = both(notes, {voice, seed});
    for (const k of ['n', 'o']) for (const t of r[k].truth) { const f = r[k].segs.find(s => s.n === t.midi && s.t1 > t.on && s.t0 < t.off); lat[k].push(f ? Math.round((f.t0 - t.on) * 1000) : 999); if (f) off[k].push(Math.round((f.t1 - (t.off - 0.03)) * 1000)); }
    cpu += r.n.cpu; cn++;
  }
  const mx = a => Math.max(...a);
  console.log(`${mx(lat.n) <= 60 ? 'PASS' : 'FAIL'} LLAT key on after onset (24 tones): NEW max ${mx(lat.n)} ms ${JSON.stringify(lat.n)} | OLD max ${mx(lat.o)}`);
  console.log(`${mx(off.n) <= 80 ? 'PASS' : 'FAIL'} LOFF key off after voice end: NEW max ${mx(off.n)} ms | OLD max ${mx(off.o)}`);
  console.log(`${cpu / cn <= 3 ? 'PASS' : 'FAIL'} LCPU ${(cpu / cn).toFixed(2)} % real time`);
}
// fast runs: every note lights
if (want('LRUN')) for (const [bpm, name] of [[120, '1/16 120 BPM'], [100, '1/16 100 BPM']]) {
  let found = 0, tot = 0, wrong = 0, fo = 0, wo = 0;
  for (const seed of [1, 2]) for (const [voice, b] of VO) {
    const sc = []; for (let m = b - 5; m <= b + 14; m++) if ([0, 2, 4, 5, 7, 9, 11].includes(((m % 12) + 12) % 12)) sc.push(m); const st = sc.findIndex(m => m >= b), d = 60 / bpm / 4;
    const notes = [0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1, 0, 1].map((q, k) => { const n = {on: 0.3 + k * d, dur: d, midi: sc[st + q]}; if (k) n.glide = 0.025; return n; });
    const r = both(notes, {voice, seed});
    for (const k of ['n', 'o']) { let f = 0; for (const t of r[k].truth) if (r[k].segs.some(s => s.n === t.midi && s.t1 > t.on && s.t0 < t.off + 0.03)) f++; const w = wob(r[k]).wrong; if (k === 'n') { found += f; wrong += w; tot += r[k].truth.length; } else { fo += f; wo += w; } }
  }
  console.log(`${found >= 0.95 * tot && wrong === 0 ? 'PASS' : 'FAIL'} LRUN ${name}: NEW ${found}/${tot} lit, ${wrong} wrong | OLD ${fo}/${tot}, ${wo} wrong`);
}
