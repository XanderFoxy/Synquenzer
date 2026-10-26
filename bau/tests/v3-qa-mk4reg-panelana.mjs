import fs from 'fs';
const res = JSON.parse(fs.readFileSync('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-mk4reg/panel.json', 'utf8'));
let n = 0, nd = 0; const vps = new Set();
for (const k of Object.keys(res.new)) {
  if (k.endsWith('|errs')) { if (res.new[k].length) console.log('ERRS', k, res.new[k]); continue; }
  n++; vps.add(k.split('|')[0]);
  const A = res.base[k], B = res.new[k]; if (!A) { console.log('no base', k); continue; }
  const moved = [], added = [], gone = [], newClip = [], newOff = [];
  for (const e of Object.keys(B.els)) { const x = B.els[e], y = A.els[e]; if (!y) { added.push(e + '"' + x.t + '"'); continue; } if (Math.abs(x.x - y.x) > 1 || Math.abs(x.y - y.y) > 1 || Math.abs(x.w - y.w) > 1 || Math.abs(x.h - y.h) > 1) moved.push(e + ' ' + JSON.stringify([y.x, y.y, y.w, y.h]) + '→' + JSON.stringify([x.x, x.y, x.w, x.h])); if (x.clip && !x.covered && !y.clip) newClip.push(e + '"' + x.t + '"'); if (x.off && !y.off && !x.covered) newOff.push(e); }
  for (const e of Object.keys(A.els)) if (!B.els[e]) gone.push(e);
  const newOv = B.ov.filter(o => !A.ov.includes(o));
  const doc = B.docW > B.vw || B.docH > B.vh ? ' DOC ' + B.docW + 'x' + B.docH : '';
  if (moved.length || added.length || gone.length || newClip.length || newOff.length || newOv.length || doc) {
    nd++; console.log('==', k, doc);
    if (moved.length) console.log('  moved', moved.length, moved.slice(0, 8));
    if (added.length) console.log('  added', added.slice(0, 8));
    if (gone.length) console.log('  gone', gone.slice(0, 8));
    if (newClip.length) console.log('  clip', newClip.slice(0, 8));
    if (newOff.length) console.log('  off', newOff.slice(0, 8));
    if (newOv.length) console.log('  overlap', newOv.slice(0, 8));
  }
  // absolute checks for the new MK4 positions
  if (/w2p[456]$/.test(k)) { const bad = Object.entries(B.els).filter(([e, x]) => !x.covered && (x.off) ); const ov = B.ov.filter(o => !/lcd\.mq/.test(o)); if (bad.length || ov.length) console.log('  ABS', k, bad.map(b => b[0]).slice(0, 5), ov.slice(0, 5)); }
}
console.log('states', n, 'vps', [...vps].join(','), 'with differences', nd);
