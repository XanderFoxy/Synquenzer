import {loadDsp} from './v3-vs2-corpus.mjs';
import {CONDS, melFor, renderContour} from './v3-vs2b-synth.mjs';
const files = process.argv.slice(2), Ds = files.map(f => loadDsp(f)), name = process.env.C || 'run150', c = CONDS[name];
const res = files.map(() => ({hit: 0, miss: 0, extra: 0, ex: []}));
for (const seed of [1, 2, 3]) for (const voice of ['male', 'female']) {
  const base = voice === 'male' ? 52 : 64, notes = melFor(seed * 131 + base + name.length, base, c), sig = renderContour(notes, {voice, seed, snr: c.snr});
  const tr = Ds[0].pyin(sig.x, {fs: 16000});
  Ds.forEach((D, j) => { const ns = D.segment(tr, {snap: false, tuning: 'auto'}).notes, used = new Set(), R = res[j];
    for (const t of sig.truth) { let best = -1, bd = 1e9; ns.forEach((n, i) => { if (used.has(i) || n.n !== t.midi) return; const d = Math.abs(n.t0 - t.on); if (d <= 0.12 && d < bd) { bd = d; best = i; } }); if (best >= 0) { used.add(best); R.hit++; } else { R.miss++; if (R.ex.length < 4) R.ex.push([voice, seed, +t.on.toFixed(3), t.midi]); } }
    R.extra += ns.length - used.size; ns.forEach((n, i) => { if (!used.has(i)) R.ex.push(["X", voice, seed, +n.t0.toFixed(3), +(n.t1 - n.t0).toFixed(3), n.n]); }); });
}
files.forEach((f, j) => console.log(f, JSON.stringify(res[j])));
