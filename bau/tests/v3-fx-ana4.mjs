import fs from 'fs';
const rows = JSON.parse(fs.readFileSync(process.env.FEAT || 'v3-fx-feat.json'));
const sel = process.argv[2] || 'onset', TH = +(process.argv[3] || 0.08), W = +(process.argv[4] || 2);
const still = v => { let best = 0, cur = 0, be = 0; for (let k = 0; k < v.length; k++) { const a = v[Math.max(0, k - W)], b = v[Math.min(v.length - 1, k + W)]; if (Math.abs(b - a) <= TH) { cur++; if (cur > best) { best = cur; be = k; } } else cur = 0; } return [best, v.length - 1 - be]; };
const T = {};
for (const r of rows) {
  if (sel === 'onset') { if (r.pend || !r.qa) continue; } else if (sel === 'end') { if (!r.pa || r.qfirst) continue; } else { if (!(r.pa && r.qa)) continue; }
  const [s, t] = still(r.v); const key = `${String(s).padStart(2)}/${String(t).padStart(2)}`; T[key] = T[key] || {R: 0, F: 0, tags: new Set()}; T[key][r.real ? 'R' : 'F']++; if (!r.real) T[key].tags.add(r.tag); else T[key].tags.add('R:' + r.tag);
}
for (const [k, v] of Object.entries(T).sort()) console.log(k, 'real', v.R, 'false', v.F, [...v.tags].slice(0, 4).join(','));
