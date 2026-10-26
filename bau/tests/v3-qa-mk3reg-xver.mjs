// A 4.10.0 project with MS 2000 tracks (random sounds incl. MK2 waves; T2 differs from T1) → saved file → opened in 4.11.0 (real file input):
// same data and bit-identical offline render (seed 7) as in 4.10.0
import { open, APP } from './v3-qa-mk3reg-pw.mjs';
import fs from 'fs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/MK2.html';
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-mk3reg/xver-410.json';
const render = p => p.evaluate(async () => { const Q = window.SYNQUENZER, out = [];
  const ev = [[0, 'on', 48, .9], [0, 'on', 60, .7], [.05, 'on', 64, .8], [.1, 'on', 67, .6], [.6, 'off', 48], [.7, 'off', 60], [.8, 'off', 64], [.9, 'off', 67], [1.0, 'on', 72, .9], [1.4, 'off', 72]];
  for (let t = 0; t < 4; t++) { const s = Q.getSound(t); if (!s || s.engine !== 'mk') { out.push(null); continue; }
    const r = await Q.mkRender(s, ev, {sec: 2, seed: 7}); const a = r.l, c = r.r; let pk = 0; for (let i = 0; i < a.length; i++) pk = Math.max(pk, Math.abs(a[i]), Math.abs(c[i]));
    out.push({pk, l: Array.from(a), r: Array.from(c)}); }
  return out; });
// 1) base: build the project, keep the file, render
let base, file;
{ const {b, p, errs} = await open({width: 390, height: 844}, BASE, true);
  file = await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.newProject({init: true}); const sl = ms => new Promise(r => setTimeout(r, ms));
    for (let t = 0; t < 4; t++) { Q.setEngine(t, 'mk'); await sl(300); Q.selectTrack(t); Q.openEditor(); await sl(300); MKUI.randomize(t); await sl(100); Q.closeEditor(); }
    Q.mkSet(1, 't.0.o1.w', 5); Q.mkSet(1, 't.0.o1.c2', 33); Q.mkSet(2, 't.0.o1.w', 3); Q.mkSet(3, 't.0.asg', 2);
    // T2 different from T1 (stored, not heard in 4.10.0)
    for (let t = 0; t < 4; t++) { Q.mkSet(t, 't.1.o1.w', 1); Q.mkSet(t, 't.1.f.cut', 30); }
    await sl(300); return Q.serialize(); });
  fs.writeFileSync(OUT, file);
  base = {render: await render(p), mk: await p.evaluate(() => [0, 1, 2, 3].map(t => JSON.stringify(window.SYNQUENZER.mkGet(t)))), errs};
  await b.close(); }
// 2) new: open the 4.10.0 file through the real file input
const {b, p, errs} = await open({width: 390, height: 844}, APP, true);
await p.click('#bMenu'); await p.waitForTimeout(400); await p.setInputFiles('#fileIn', OUT); await p.waitForTimeout(3000);
const nw = {render: await render(p), mk: await p.evaluate(() => [0, 1, 2, 3].map(t => JSON.stringify(window.SYNQUENZER.mkGet(t))))};
const pj = await p.evaluate(() => { const P = window.SYNQUENZER.project(); return {format: P.format, tracks: P.tracks.map(t => t.sound && t.sound.engine)}; });
console.log('opened in 4.11.0', JSON.stringify(pj));
for (let t = 0; t < 4; t++) { const A = base.render[t], B = nw.render[t]; let d = 0; for (let i = 0; i < A.l.length; i++) d = Math.max(d, Math.abs(A.l[i] - B.l[i]), Math.abs(A.r[i] - B.r[i]));
  const ma = JSON.parse(base.mk[t]), mb = JSON.parse(nw.mk[t]); const diffKeys = Object.keys(mb).filter(k => JSON.stringify(ma[k]) !== JSON.stringify(mb[k]));
  console.log('track', t, 'w', ma.t[0].o1.w, 'peak', A.pk.toFixed(4), B.pk.toFixed(4), 'max|Δ|', d, 'data diff keys', JSON.stringify(diffKeys)); }
console.log('errs base', base.errs, 'new', errs); await b.close();
