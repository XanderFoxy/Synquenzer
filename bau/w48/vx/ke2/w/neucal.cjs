// rechnet cal (mk) eines Laufs mit ../cal.json neu (Merkmale fx sind gespeichert) -> <präfix>C-<i>.json
const fs = require('fs'), path = require('path'), pre = process.argv[2], C = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'cal.json'))).mk;
for (let i = 0; i < 4; i++) { const f = pre + '-' + i + '.json'; if (!fs.existsSync(f)) continue; const r = JSON.parse(fs.readFileSync(f));
  for (const q of r) if (q.fx) for (const k of Object.keys(q.fx)) if (C[k]) { let z = 0; for (let j = 0; j < C[k].length; j++) z += C[k][j] * q.fx[k][j]; q.cal[k] = +(1 / (1 + Math.exp(-z))).toFixed(3); }
  fs.writeFileSync(pre + 'C-' + i + '.json', JSON.stringify(r)); }
