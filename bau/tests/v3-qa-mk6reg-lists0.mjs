import { open } from './v3-qa-mk6reg-pw.mjs';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
for (const f of [S + 'mk6-base-4.12.0.html', S + 'mk-br-MK6/index.html']) {
const {b, p, errs} = await open({width: 390, height: 844}, f);
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.openEditor(); }); await p.waitForTimeout(1500);
const r = await p.evaluate(() => { const M = window.MKUI; const out = [];
  for (const [k, d] of Object.entries(M.KN)) { if (!d || !d.L) continue; out.push(k + ':' + d.p + ':' + d.L + ':' + (Array.isArray(d.L) ? d.L[0].length : '?')); }
  return out; });
console.log(f.slice(-30), r.join(' | '));
await b.close(); }
