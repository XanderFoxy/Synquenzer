// VS2b synthetischer Stress-Korpus: Übergänge, Rutscher, Anschleifen, Abfall am Ende, breites Vibrato, Wackeln (Drift),
// schnelle Läufe (echte kurze Noten dürfen NICHT verschwinden). Direkt auf pYIN-lite + segment der App.
// node v3-vs2b-synth.mjs <index.html> [cond…]   (-v: Fehlerbeispiele)
import {loadDsp, rng} from './v3-vs2-corpus.mjs';
const D = loadDsp(process.argv[2] || '../dirigent-wt/index.html');
const only = process.argv.slice(3).filter(a => !a.startsWith('-')), V = process.argv.includes('-v');
const gauss = r => { let u = 0; while (u === 0) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); };
const FORM = {male: [[730, 90, 1], [1090, 110, 0.5], [2440, 170, 0.25]], female: [[850, 100, 1], [1220, 120, 0.5], [2810, 170, 0.25]]};
const formG = (f, F) => { let g = 0.03; for (const [c, bw, a] of F) g += a / Math.sqrt(1 + ((f - c) / (bw / 2)) ** 2); return g; };
const sm = u => u <= 0 ? 0 : u >= 1 ? 1 : 0.5 - 0.5 * Math.cos(Math.PI * u);
/* notes: {on, dur, midi, glide (s, legato from prev), scoop: [st, s], fall: [st, s], vib: [ct, hz, delay], drift (ct)} */
export function renderContour(notes, o = {}) {
  const fs = 16000, r = rng((o.seed || 1) * 7919 + 17), F = FORM[o.voice || 'male'];
  const end = notes[notes.length - 1].on + notes[notes.length - 1].dur + 0.5, n = Math.ceil(end * fs);
  const P = notes.map((nt, k) => ({...nt, tgt: nt.midi + gauss(r) * (o.sigma != null ? o.sigma : 10) / 100, vp: r() * 6.28, d1: r() * 6.28, d2: r() * 6.28, k}));
  const x = new Float32Array(n), env = new Float32Array(n);
  let ph = 0, ci = 0; const amps = new Float64Array(128); let ampAt = -1, K = 0;
  for (let i = 0; i < n; i++) {
    const t = i / fs;
    while (ci + 1 < P.length && t >= P[ci + 1].on - (P[ci + 1].glide ? P[ci + 1].glide / 2 : 0)) ci++;
    const p = P[ci]; const st = p.on - (p.glide ? p.glide / 2 : 0); if (t < st) continue;
    const off = p.on + p.dur, nx = P[ci + 1], legNext = nx && nx.glide && Math.abs(nx.on - off) < 1e-6;
    const vEnd = legNext ? off + nx.glide / 2 : off - 0.035; if (t >= vEnd) continue;
    let m = p.tgt;
    if (p.glide) { const prv = P[ci - 1]; if (t < p.on + p.glide / 2) m = prv.tgt + (p.tgt - prv.tgt) * sm((t - st) / p.glide); }
    if (p.scoop) m -= p.scoop[0] * (1 - sm((t - p.on) / p.scoop[1]));
    if (p.fall && !legNext) m -= p.fall[0] * sm((t - (vEnd - p.fall[1])) / p.fall[1]);
    const tn = t - p.on;
    if (p.vib && tn > p.vib[2]) m += p.vib[0] / 100 * Math.min(1, (tn - p.vib[2]) / 0.08) * Math.sin(2 * Math.PI * p.vib[1] * tn + p.vp);
    if (p.drift) m += p.drift / 100 * (0.6 * Math.sin(2 * Math.PI * 0.9 * t + p.d1) + 0.4 * Math.sin(2 * Math.PI * 2.3 * t + p.d2));
    const f0 = 440 * Math.pow(2, (m - 69) / 12);
    let a = p.glide ? 1 : Math.min(1, (t - st) / 0.015); if (!legNext) a *= Math.min(1, (vEnd - t) / 0.03);
    if (p.fall && !legNext) a *= 1 - 0.5 * sm((t - (vEnd - p.fall[1])) / p.fall[1]);
    if (i - ampAt >= 80 || ampAt < 0) { ampAt = i; K = Math.min(127, Math.floor(7500 / f0)); for (let k = 1; k <= K; k++) amps[k] = (1 / k) * formG(k * f0, F); }
    ph += 2 * Math.PI * f0 / fs; if (ph > 1e6) ph -= 2 * Math.PI * Math.floor(ph / (2 * Math.PI));
    let s = 0; for (let k = 1; k <= K; k++) s += amps[k] * Math.sin(k * ph);
    x[i] = s * a; env[i] = a;
  }
  let ss = 0, q = 0; for (let i = 0; i < n; i++) if (env[i] > 0.3) { ss += x[i] * x[i]; q++; }
  const g = 0.1 / Math.sqrt(ss / Math.max(1, q)); for (let i = 0; i < n; i++) x[i] *= g;
  let hp = 0, lx = 0; for (let i = 0; i < n; i++) { const w = r() * 2 - 1; hp = 0.7 * (hp + w - lx); lx = w; x[i] += hp * 0.004 * env[i]; }
  for (const p of P) if (!p.glide) { const a = Math.round((p.on - 0.004) * fs); for (let j = 0; j < 128; j++) if (a + j >= 0 && a + j < n) x[a + j] += (r() * 2 - 1) * 0.03 * Math.exp(-j / 48); }
  if (o.snr != null) { const k = 0.1 / Math.pow(10, o.snr / 20) * Math.sqrt(3); for (let i = 0; i < n; i++) x[i] += (r() * 2 - 1) * k; }
  return {x, fs, truth: notes.map(nt => ({on: nt.on, off: nt.on + nt.dur, midi: nt.midi}))};
}
const CM = [0, 2, 4, 5, 7, 9, 11], inC = m => CM.includes(((m % 12) + 12) % 12);
// a melody (C major) with step sizes; beats per note from list
export function melFor(seed, base, o) { return mel(seed, base, o); }
function mel(seed, base, o) {
  const r = rng(seed), sb = 60 / o.bpm, out = []; o._dir = 1; let t = 0.3, idx = 0; const sc = []; for (let m = base - 8; m <= base + 12; m++) if (inC(m)) sc.push(m); idx = sc.indexOf(sc.find(m => m >= base));
  for (let k = 0; k < o.n; k++) {
    const beats = o.beats[Math.floor(r() * o.beats.length)];
    if (o.runs) { if (k % (4 + Math.floor(r() * 3)) === 0) o._dir = r() < 0.5 ? -1 : 1; } let step = o.steps[Math.floor(r() * o.steps.length)] * (o.runs ? (o._dir || 1) : r() < 0.5 ? -1 : 1); if (idx + step < 0 || idx + step >= sc.length) { step = -step; if (o.runs) o._dir = -o._dir; } idx += step;
    const legato = k > 0 && r() < (o.legato || 0);
    const nt = {on: t, dur: beats * sb, midi: sc[idx]};
    if (legato) nt.glide = o.glide[0] + r() * (o.glide[1] - o.glide[0]);
    if (o.scoop && !legato && r() < o.scoop.p) nt.scoop = [(o.scoop.st[0] + r() * (o.scoop.st[1] - o.scoop.st[0])) * (o.scoop.above && r() < 0.5 ? -1 : 1), o.scoop.ms[0] + r() * (o.scoop.ms[1] - o.scoop.ms[0])];
    if (o.fall && r() < o.fall.p) nt.fall = [o.fall.st[0] + r() * (o.fall.st[1] - o.fall.st[0]), o.fall.ms[0] + r() * (o.fall.ms[1] - o.fall.ms[0])];
    if (o.vib && nt.dur >= 0.3) nt.vib = [o.vib[0] + r() * (o.vib[1] - o.vib[0]), 5 + r() * 1.5, o.vibDelay != null ? o.vibDelay : 0.15];
    if (o.drift) nt.drift = o.drift;
    out.push(nt); t += beats * sb; if (o.rest && !legato && r() < o.rest) t += sb / 2;
    if (k + 1 < o.n && o.legato === 1) {} 
  }
  // legato notes start exactly at the previous note's end (no rest before them)
  for (let k = 1; k < out.length; k++) if (out[k].glide) out[k].on = out[k - 1].on + out[k - 1].dur;
  for (let k = 1; k < out.length; k++) if (!out[k].glide && out[k].on < out[k - 1].on + out[k - 1].dur) out[k].on = out[k - 1].on + out[k - 1].dur;
  return out;
}
export const CONDS = {
  vibWide:  {bpm: 90, n: 16, beats: [1, 2], steps: [1, 2, 3], legato: 0.3, glide: [0.06, 0.12], vib: [90, 130], vibDelay: 0.08},
  scoopUp:  {bpm: 100, n: 20, beats: [0.5, 1, 2], steps: [1, 2, 3, 4], scoop: {p: 1, st: [1, 3], ms: [0.04, 0.12]}, vib: [20, 50]},
  scoopBoth:{bpm: 100, n: 20, beats: [0.5, 1, 2], steps: [1, 2, 3, 4], scoop: {p: 1, st: [1, 2.5], ms: [0.04, 0.12], above: true}, vib: [20, 50]},
  fall:     {bpm: 100, n: 20, beats: [1, 2], steps: [1, 2, 3], fall: {p: 1, st: [2, 5], ms: [0.08, 0.16]}, rest: 0.6, vib: [20, 50]},
  slide:    {bpm: 96, n: 20, beats: [1, 2], steps: [1, 2, 3, 4], legato: 1, glide: [0.1, 0.3], vib: [20, 50]},
  drift:    {bpm: 90, n: 16, beats: [1, 2], steps: [1, 2], drift: 45, legato: 0.3, glide: [0.06, 0.12]},
  run120:   {bpm: 120, n: 32, beats: [0.25], steps: [1], runs: true, legato: 0.7, glide: [0.02, 0.04]},
  run150:   {bpm: 150, n: 32, beats: [0.25], steps: [1, 1, 2], runs: true, legato: 0.3, glide: [0.02, 0.03]},
  trill:    {bpm: 120, n: 24, beats: [0.25], steps: [1], legato: 0.7, glide: [0.02, 0.04], info: true},
  mix:      {bpm: 100, n: 24, beats: [0.5, 1, 1, 2], steps: [1, 2, 3, 4], legato: 0.4, glide: [0.05, 0.25], scoop: {p: 0.5, st: [1, 2.5], ms: [0.04, 0.1], above: true}, fall: {p: 0.3, st: [2, 4], ms: [0.08, 0.14]}, vib: [40, 110], drift: 25, rest: 0.3, snr: 30},
};
export function runCond(name, c, seeds = [1, 2, 3]) {
  let sung = 0, det = 0, hit = 0, extra = 0, miss = 0; const ex = [];
  for (const seed of seeds) for (const voice of ['male', 'female']) {
    const base = voice === 'male' ? 52 : 64, notes = mel(seed * 131 + base + name.length, base, c), sig = renderContour(notes, {voice, seed, snr: c.snr});
    const tr = D.pyin(sig.x, {fs: 16000}), ns = D.segment(tr, {snap: false, tuning: 'auto'}).notes;
    sung += notes.length; det += ns.length; const used = new Set();
    for (const t of sig.truth) { let best = -1, bd = 1e9; ns.forEach((n, i) => { if (used.has(i) || n.n !== t.midi) return; const d = Math.abs(n.t0 - t.on); if (d <= 0.12 && d < bd) { bd = d; best = i; } }); if (best >= 0) { used.add(best); hit++; } else { miss++; if (ex.length < 6) ex.push(['miss', voice, seed, +t.on.toFixed(2), t.midi]); } }
    ns.forEach((n, i) => { if (!used.has(i)) { extra++; if (ex.length < 6) ex.push(['extra', voice, seed, +n.t0.toFixed(2), +(n.t1 - n.t0).toFixed(3), n.n, n.m]); } });
  }
  return {name, sung, det, hit, extra, miss, F: +(2 * hit / (sung + det)).toFixed(3), ex};
}
if (process.argv[1] && process.argv[1].endsWith('v3-vs2b-synth.mjs')) {
  let bad = 0; const t0 = Date.now();
  for (const [name, c] of Object.entries(CONDS)) { if (only.length && !only.includes(name)) continue;
    const r = runCond(name, c); const ok = c.info || (r.extra === 0 && r.miss === 0); if (!ok) bad++;
    console.log((c.info ? 'INFO ' : ok ? 'PASS ' : 'FAIL ') + JSON.stringify({...r, ex: V ? r.ex : undefined})); }
  console.log('bad', bad, 'zeit', ((Date.now() - t0) / 1000).toFixed(1), 's');
}
