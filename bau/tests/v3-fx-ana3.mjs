import fs from 'fs';
const rows = JSON.parse(fs.readFileSync('v3-fx-feat.json'));
const sel = process.argv[2] || 'onset', TH = +(process.argv[3] || 0.08), W = +(process.argv[4] || 2);
const still = v => { let best = 0, cur = 0; for (let k = 0; k < v.length; k++) { const a = v[Math.max(0, k - W)], b = v[Math.min(v.length - 1, k + W)]; if (Math.abs(b - a) <= TH) { cur++; best = Math.max(best, cur); } else cur = 0; } return best; };
const H = {}; 
for (const r of rows) {
  let nb; if (sel === 'onset') { if (r.pend || !r.qa) continue; } else if (sel === 'end') { if (!r.pa || r.qfirst) continue; } else { if (!(r.pa && r.qa)) continue; }
  const s = still(r.v), k = (r.real ? 'REAL ' : 'FALSE') + ' ' + r.tag.replace(/\/.*/, '');
  (H[k] = H[k] || []).push(s);
}
for (const [k, a] of Object.entries(H).sort()) { a.sort((x, y) => x - y); console.log(k.padEnd(28), a.length, 'min', a[0], 'p10', a[Math.floor(a.length * 0.1)], 'med', a[a.length >> 1], 'p90', a[Math.floor(a.length * 0.9)], 'max', a[a.length - 1]); }
