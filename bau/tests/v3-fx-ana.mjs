import fs from 'fs';
const rows = JSON.parse(fs.readFileSync('v3-fx-feat.json'));
const fw = v => { let best = 0, bi = 0, bj = 0; for (let i = 0; i < v.length; i++) { let lo = v[i], hi = lo; for (let j = i; j < v.length; j++) { lo = Math.min(lo, v[j]); hi = Math.max(hi, v[j]); if (hi - lo > 0.25) break; if (j - i + 1 > best) { best = j - i + 1; bi = i; bj = j; } } } return [best, bi, bj]; };
const sel = process.argv[2] || 'onset';
const out = [];
for (const r of rows) {
  const len = r.b - r.a, [fl, fi, fj] = fw(r.v);
  let nb, dir; if (sel === 'onset') { if (r.pend || !r.qa) continue; nb = r.qm; } else if (sel === 'end') { if (!r.pa || r.qfirst) continue; nb = r.pm; } else { if (!(r.pa && r.qa)) continue; nb = r.qm; }
  const sg = Math.sign(nb - r.m) || 1, v = r.v;
  // monotone progress toward neighbour
  let back = 0, mx = -1e9; for (const x of v) { const y = (x - v[0]) * sg; mx = Math.max(mx, y); back = Math.max(back, mx - y); }
  const rise = (v[v.length - 1] - v[0]) * sg, tail = len - 1 - fj, head = fi, after = (v[v.length-1] - v[fj]) * sg;
  out.push({tag: r.tag, real: r.real, len, fl, head, tail, rise: +rise.toFixed(2), after: +after.toFixed(2), back: +back.toFixed(2), tr: +(r.tr * sg).toFixed(2), d: +((nb - r.m)).toFixed(2), mv: r.mv});
}
const key = o => `${o.real ? 'REAL ' : 'FALSE'} ${o.tag}`;
const g = {}; for (const o of out) (g[key(o)] = g[key(o)] || []).push(o);
for (const [k, a] of Object.entries(g).sort()) { console.log(k, a.length); for (const o of a.slice(0, +(process.argv[3] || 6))) console.log('   ', JSON.stringify({len: o.len, fl: o.fl, head: o.head, tail: o.tail, rise: o.rise, after: o.after, back: o.back, tr: o.tr, d: o.d, mv: o.mv})); }
