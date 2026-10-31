// QA VV2-04: 9:16 Kamera – per picture the content displacement (window corners, Euclidean) in % of the picture width; inside the view
import { open } from './n5-v-lib.mjs';
import fs from 'fs';
const {b, p, errs} = await open();
const sc = process.argv[2] || 'diag';
const info = await p.evaluate(sc => {
  const c0 = S.tracks[0].clips[0];
  S.tracks[5].clips[5] = JSON.parse(JSON.stringify(c0)); S.tracks[2].clips[5] = JSON.parse(JSON.stringify(S.tracks[2].clips[0]));
  const lanes = [[], [], [], [], [], []];
  if (sc === 'diag') { lanes[0] = [{bar: 0, slot: 0}, {bar: 4, slot: -1}, {bar: 8, slot: 0}]; lanes[5] = [{bar: 4, slot: 5}, {bar: 8, slot: -1}]; }
  SYNQUENZER.setSong({bars: 12, lanes, carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 12, name: 'Strophe'}]});
  SYNQUENZER.vvDirSet(0, 12, 'matrix');
  return {ns: NS(), rows: vvRows(), bpm: S.bpm, lanes: JSON.stringify(S.song.lanes), dir: SYNQUENZER.vvDirGet()};
}, sc);
console.log(JSON.stringify(info));
await p.evaluate(() => { SYNQUENZER.vvTest({opus: true}); SYNQUENZER.vvPrefs({fmt: '9:16', view: 'auto', cam: 'kamera'}); });
const t0 = Date.now();
const m = await p.evaluate(() => SYNQUENZER.vvMake({}));
const L = await p.evaluate(() => SYNQUENZER.vvRunLog());
console.log('made', ((Date.now() - t0) / 1000).toFixed(1) + ' s', JSON.stringify({dur: m.dur, cuts: m.cuts, frames: L.log.length, shots: L.shots.map(s => [s.a, s.b, s.v, s.t])}));
const W = 1080, H = 1920;
let worst = {d: 0}, outside = 0, worstAx = {d: 0};
const rows = [];
for (let i = 1; i < L.log.length; i++) {
  const A = L.log[i - 1], B = L.log[i];
  if (A.k !== B.k) continue;                                          // a cut
  if (A.cx - A.ww / 2 < -1e-6 || A.cx + A.ww / 2 > 640 + 1e-6 || A.cy - A.wh / 2 < -1e-6 || A.cy + A.wh / 2 > 360 + 1e-6) outside++;
  let dmax = 0, dx = 0, dy = 0;
  for (const [fx, fy] of [[0, 0], [1, 0], [0, 1], [1, 1], [.5, .5]]) {
    const Px = A.cx - A.ww / 2 + fx * A.ww, Py = A.cy - A.wh / 2 + fy * A.wh;
    const u1 = (Px - (A.cx - A.ww / 2)) * W / A.ww, v1 = (Py - (A.cy - A.wh / 2)) * H / A.wh;
    const u2 = (Px - (B.cx - B.ww / 2)) * W / B.ww, v2 = (Py - (B.cy - B.wh / 2)) * H / B.wh;
    const d = Math.hypot(u2 - u1, v2 - v1) / W; if (d > dmax) { dmax = d; dx = Math.abs(u2 - u1) / W; dy = Math.abs(v2 - v1) / W; }
  }
  rows.push({ts: B.ts, d: dmax});
  if (dmax > worst.d) worst = {d: +(dmax * 100).toFixed(2), dx: +(dx * 100).toFixed(2), dy: +(dy * 100).toFixed(2), ts: B.ts, A: [A.cx, A.cy, A.z].map(v => +v.toFixed(2)), B: [B.cx, B.cy, B.z].map(v => +v.toFixed(2))}, worst.d = dmax;
  const ax = Math.abs(B.cx - A.cx) / A.ww; if (ax > worstAx.d) worstAx = {d: ax, ts: B.ts};
}
const over = rows.filter(r => r.d > .05);
console.log(JSON.stringify({scenario: sc, frames: L.log.length, outside, worstEuclid: Object.assign({}, worst, {d: undefined, pct: worst.d}), worstCenterXonly: +(worstAx.d * 100).toFixed(2), framesOver5pct: over.length, over: over.slice(0, 12).map(r => [r.ts, +(r.d * 100).toFixed(2)])}));
fs.writeFileSync('/home/user/Synquenzer/bau/helfer/VIDSTAGE/tests/out/n5-v-qa2-out/cam-' + sc + '.json', JSON.stringify(L.log));
const bl = await p.evaluate(() => SYNQUENZER.vvBlob()); fs.writeFileSync('/home/user/Synquenzer/bau/helfer/VIDSTAGE/tests/out/n5-v-qa2-out/cam-' + sc + '.mp4', Buffer.from(bl.b64, 'base64'));
console.log('errs', errs);
await b.close();
