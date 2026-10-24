import fs from 'fs';
const rows = JSON.parse(fs.readFileSync('v3-fx-feat.json'));
const fw = v => { let best = 0, bi = 0, bj = 0; for (let i = 0; i < v.length; i++) { let lo = v[i], hi = lo; for (let j = i; j < v.length; j++) { lo = Math.min(lo, v[j]); hi = Math.max(hi, v[j]); if (hi - lo > 0.25) break; if (j - i + 1 > best) { best = j - i + 1; bi = i; bj = j; } } } return [best, bi, bj]; };
const sel = process.argv[2] || 'onset', cond = new Function('o', 'return ' + (process.argv[3] || 'true'));
for (const r of rows) {
  const len = r.b - r.a, [fl, fi, fj] = fw(r.v);
  let nb; if (sel === 'onset') { if (r.pend || !r.qa) continue; nb = r.qm; } else if (sel === 'end') { if (!r.pa || r.qfirst) continue; nb = r.pm; } else { if (!(r.pa && r.qa)) continue; nb = r.qm; }
  const sg = Math.sign(nb - r.m) || 1, v = r.v;
  const o = {tag: r.tag, real: r.real, len, fl, head: fi, tail: len - 1 - fj, tr: +(r.tr * sg).toFixed(2), d: +(nb - r.m).toFixed(2), mv: r.mv, pa: r.pa, qa: r.qa, v: v.join(' ')};
  if (cond(o)) console.log(JSON.stringify(o));
}
