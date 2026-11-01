// Regel 28: ein Projekt ohne Übergänge rendert bit-gleich wie die Basis R-4300 (Drums, Synth mit Hall/Echo, STIMME + Chor, North-Kit).
// UE-06: Scheduler-Zeit (Offline-Render, Profil „susp“ = ein Scheduler-Schritt) ohne Übergänge ±5 % zur Basis, mit 8 Übergängen ≤ +10 %.
import {open, song, render, pcm, ok, DIR} from './lib.mjs';
import crypto from 'crypto';
import fs from 'fs';
const BASE = new URL('../../../snapshots/R-4300.html', import.meta.url).pathname;
const R = [];
async function scene(p, o) {
  await song(p, {kit: o.kit, parts: 3, lenBars: 4, pad: 1});
  await p.evaluate(o => { const A = window.SYNQUENZER; A.setTrackFx(0, 'rev', .4); A.setTrackFx(0, 'dly', .3); if (o.north) A.loadKit(MD_KIT_NAMES[1]); }, o);
}
async function hashRender(app, o) {
  const {b, p, errs} = await open({app});
  await scene(p, o);
  const r = await render(p, 0, 12), P = await pcm(p, 0, r.songSec);
  const h = crypto.createHash('sha1'); h.update(Buffer.from(P.L.buffer)); h.update(Buffer.from(P.R.buffer));
  const log = r.log.map(e => [e.track, e.out, e.beat, e.vel].join(':')).join('|');
  await b.close();
  return {h: h.digest('hex'), log, peak: r.peak, errs};
}
for (const o of [{kit: 'Rom Pop'}, {kit: 'Gated 84'}, {kit: '808', north: 1}]) {
  const a = await hashRender(BASE, o), b = await hashRender(undefined, o);
  R.push(ok(a.h === b.h && a.log === b.log && !b.errs.length, 'Regel 28: ohne Übergänge bit-gleich zur Basis (' + (o.north ? 'North' : o.kit) + ')', {basis: a.h.slice(0, 10), neu: b.h.slice(0, 10)}));
}
// UE-06 Scheduler-Zeit
async function prof(app, nUe, reps) {
  const {b, p} = await open({app});
  await song(p, {kit: '909', parts: 9, lenBars: 2, pad: 1});
  if (nUe) await p.evaluate(n => { const A = window.SYNQUENZER, m = A.song().marks, src = ['w-fill-kurz', 'w-tom-wirbel', 'w-snare-wirbel', 'w-fill-lang', 'w-hh-auf', 'w-clap-treppe', 'w-rim-ping', 'w-fill-crash']; for (let k = 0; k < n; k++) A.ueAdd(src[k], {m: m[k + 1].id}, {dens: 2}); A.ueAdd('w-tom-doppel', {at: 5}, {}); }, nUe);
  const out = [];
  for (let k = 0; k < reps; k++) { await p.evaluate(() => { VV.prof = null; }); await render(p, 0, 18); out.push(await p.evaluate(() => { const s = VV.prof.susp; return s.sum / s.n; })); }
  await b.close();
  out.sort((x, y) => x - y); return out[Math.floor(out.length / 2)];
}
const base = await prof(BASE, 0, 5), mine0 = await prof(undefined, 0, 5), mine8 = await prof(undefined, 8, 5);
R.push(ok(Math.abs(mine0 / base - 1) <= .05 || mine0 - base < .02, 'UE-06 Scheduler ohne Übergänge ±5 % zur Basis', {basisMs: +base.toFixed(4), neuMs: +mine0.toFixed(4), proz: +((mine0 / base - 1) * 100).toFixed(1)}));
R.push(ok(mine8 / mine0 - 1 <= .10 || mine8 - mine0 < .02, 'UE-06 Scheduler mit 8 Übergängen ≤ +10 %', {ohneMs: +mine0.toFixed(4), mitMs: +mine8.toFixed(4), proz: +((mine8 / mine0 - 1) * 100).toFixed(1)}));
fs.mkdirSync(DIR + '/out', {recursive: true}); fs.writeFileSync(DIR + '/out/ue-r28-perf.json', JSON.stringify(R, null, 1));
console.log(R.filter(x => x.ok).length + '/' + R.length + ' OK');
process.exit(R.every(x => x.ok) ? 0 : 1);
