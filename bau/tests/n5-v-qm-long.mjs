// QA musiker VV1: 3 min live playback (song loop, then scene switches, MS 2000 keys, the STIMME scene) AFTER a video job
// (argv 'base' = without the video job). Master + raw FM (t1) / MS 2000 (t3) outputs recorded; clicks, dropouts, stuck notes
import { open, buildSong, OUTQ } from './n5-v-qm-lib.mjs';
import { recStart, recAnalyse7 } from './v3-qa-gmk7-rec.mjs';
import { execSync } from 'child_process';
const BASE = process.argv[2] === 'base';
const {b, p, errs} = await open({touch: true});
const E = (fn, arg) => p.evaluate(fn, arg);
await buildSong(p);
if (!BASE) console.log('video', JSON.stringify(await E(async () => { SYNQUENZER.vvTest({opus: true}); const x = await SYNQUENZER.vvMake({fmt: '9:16', view: 'song'}); return {how: x.how, dur: x.dur}; })));
await E(() => { SYNQUENZER.songLoop(true); });
console.log('rec', JSON.stringify(await recStart(E, 215, [1, 3])));
await E(() => SYNQUENZER.songPlay(0));
const t0 = Date.now(), at = s => new Promise(r => setTimeout(r, Math.max(0, t0 + s * 1000 - Date.now())));
const act = async (n, fn) => { const r = await fn(); await E(([n]) => window.__q.acts.push({n, t: AU.ctx.currentTime, t1: AU.ctx.currentTime, pn: Math.round(performance.now())}), [n]); console.log(((Date.now() - t0) / 1000).toFixed(1), n, JSON.stringify(r)); };
await at(80); await act('scene 1', () => E(() => { SYNQUENZER.launchScene(0); return R.playing; }));
for (let k = 0; k < 10; k++) {
  await at(88 + k * 9); await act('scene ' + (k % 2 ? 1 : 2), () => E(s => { SYNQUENZER.launchScene(s); return R.slot.slice(); }, k % 2 ? 0 : 1));
  if (k % 3 === 1) { await act('MS 2000 key C3 1 s', async () => { await E(() => { SYNQUENZER.selectTrack(3); SYNQUENZER.keyOn(48, .8, 'z'); }); await new Promise(r => setTimeout(r, 1000)); await E(() => SYNQUENZER.keyOff(48, 'z')); return 1; }); }
}
await at(180); const tStop = await E(() => AU.ctx.currentTime);
await act('stop', () => E(() => { SYNQUENZER.stop(); return R.playing; }));
await new Promise(r => setTimeout(r, 4500));
const fin = await E(() => ({voices: SYNQUENZER.voices().filter(v => v.state !== 'off').length, live: SYNQUENZER.runtime().liveVoices, te: SYNQUENZER.tickErrors(), playing: SYNQUENZER.runtime().playing}));
const A = await recAnalyse7(E, tStop, {});
const tail = await E(() => new Promise(r => { const a = AU.ctx.createAnalyser(); a.fftSize = 2048; AU.M.ceil.connect(a); const b = new Float32Array(2048); let pk = 0; const iv = setInterval(() => { a.getFloatTimeDomainData(b); for (const v of b) pk = Math.max(pk, Math.abs(v)); }, 20); setTimeout(() => { clearInterval(iv); r(+(20 * Math.log10(pk + 1e-9)).toFixed(1)); }, 1500); }));
const summ = {}; for (const k in A.taps) { const X = A.taps[k]; summ[k] = {peak: X.peakDb, nan: X.nan, flags: X.flags.length, sflags: X.sflags.length, d2f: X.d2f.length, drops: X.drops.length, f: X.flags.slice(0, 5), d: X.drops.slice(0, 5), s: X.sflags.slice(0, 4), d2: X.d2f.slice(0, 4)}; }
console.log(JSON.stringify({BASE, load: execSync('cat /proc/loadavg').toString().trim(), secs: A.secs, notes: A.notes, gaps: A.gaps, late: A.late.length, lateEx: A.late.slice(0, 5), lt: A.lt.filter(x => x[0] > 50).length, ltMax: Math.max(0, ...A.lt.map(x => x[0])), stall: A.stall.length, fin, tail, taps: summ, errs}));
await b.close();
