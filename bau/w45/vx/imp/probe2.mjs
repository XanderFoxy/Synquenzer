import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage();
await p.goto('file://' + process.argv[2]); await p.waitForTimeout(1500);
console.log(await p.evaluate(() => { setBpm(120); S.ts = tsNorm('6/8'); tkBump(); const c = normClip({len: 4, key: Object.assign({}, S.key, {src: 'auto'}), notes: [0, 3, 6, 9].map(t => ({t, d: 2.9, n: 60, v: .6})), ts: '6/8'}, 'synth', S.key); return JSON.stringify({len: c.len, ts: c.ts, notes: c.notes.map(n => n.t + '/' + n.d), clipB: clipB(Object.assign({}, c, {ts: '6/8'}))}); }));
await b.close();
