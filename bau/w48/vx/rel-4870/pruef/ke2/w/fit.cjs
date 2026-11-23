// Nach-Eichung der Engine-3-Gewissheit (CAL.mk): logistische Regression auf dem Eichlauf, zum alten Gewicht hin gezogen. node fit.cjs <html> eich -> ../cal.json
const fs = require('fs'), [html, pre] = process.argv.slice(2);
const s = fs.readFileSync(html, 'utf8'), old = JSON.parse(s.match(/^const CAL = (?:\/\*KE2\*\/ )? ?(\{.*\}) ;$/m)[1]);
let r = []; for (let i = 0; i < 4; i++) { const f = pre + '-' + i + '.json'; if (fs.existsSync(f)) r = r.concat(JSON.parse(fs.readFileSync(f))); }
const out = {mk: {}};
for (const k of Object.keys(old.mk)) {
  const w0 = old.mk[k], X = [], Y = [];
  for (const q of r) if (q.fx && q.fx[k] && q.ok && k in q.ok) { X.push(q.fx[k]); Y.push(q.ok[k] ? 1 : 0); }
  if (X.length < 20) { out.mk[k] = w0; continue; }
  let w = w0.slice(); const mu = 2 / X.length;
  for (let it = 0; it < 4000; it++) { const g = w.map((v, j) => 2 * mu * (v - w0[j]));
    for (let i = 0; i < X.length; i++) { let z = 0; for (let j = 0; j < w.length; j++) z += w[j] * X[i][j]; const p = 1 / (1 + Math.exp(-z)); for (let j = 0; j < w.length; j++) g[j] += (p - Y[i]) * X[i][j] / X.length; }
    for (let j = 0; j < w.length; j++) w[j] -= .5 * g[j]; }
  out.mk[k] = w.map(v => +v.toFixed(3)); console.log(k, 'n', X.length, 'richtig', (Y.reduce((a, b) => a + b, 0) / Y.length).toFixed(2), w0.join(','), '->', out.mk[k].join(','));
}
fs.writeFileSync(require('path').join(__dirname, '..', 'cal.json'), JSON.stringify(out));
