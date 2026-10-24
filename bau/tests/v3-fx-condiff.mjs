import {loadDsp} from './v3-vs2-corpus.mjs';
import {CONDS, melFor, renderContour} from './v3-vs2b-synth.mjs';
const DN = loadDsp('../dirigent-wt/index.html'), DO = loadDsp('v3-fx-452.html');
for (const name of process.argv.slice(3)) for (const seed of [1, 2, 3]) for (const voice of ['male', 'female']) {
  const c = CONDS[name], base = voice === 'male' ? 52 : 64, notes = melFor(seed * 131 + base + name.length, base, c), sig = renderContour(notes, {voice, seed, snr: c.snr});
  const tr = DN.pyin(sig.x, {fs: 16000});
  const R = {}; for (const [k, D] of [['n', DN], ['o', DO]]) { const dbg = []; const ns = D.segment(tr, {snap: false, tuning: 'auto', dbg}).notes; const used = new Set(), miss = [];
    for (const t of sig.truth) { let best = -1, bd = 1e9; ns.forEach((n, i) => { if (used.has(i) || n.n !== t.midi) return; const d = Math.abs(n.t0 - t.on); if (d <= 0.12 && d < bd) { bd = d; best = i; } }); if (best >= 0) used.add(best); else miss.push([+t.on.toFixed(3), t.midi]); }
    R[k] = {miss, extra: ns.filter((n, i) => !used.has(i)).map(n => [+n.t0.toFixed(3), +(n.t1 - n.t0).toFixed(3), n.n]), dbg}; }
  if (JSON.stringify(R.n.miss) !== JSON.stringify(R.o.miss) || JSON.stringify(R.n.extra) !== JSON.stringify(R.o.extra)) {
    console.log(name, seed, voice, 'NEW miss', JSON.stringify(R.n.miss), 'extra', JSON.stringify(R.n.extra), '| OLD miss', JSON.stringify(R.o.miss), 'extra', JSON.stringify(R.o.extra));
    for (const m of R.n.miss) { const d = R.n.dbg.find(x => Math.abs(x.a * 0.005 - m[0]) < 0.06); if (d) { const {e, ea, eb, vb, ...r} = d; console.log('   ', JSON.stringify(r)); } }
  }
}
