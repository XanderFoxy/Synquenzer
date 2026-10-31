// how big does the project (and so every keyframe / sweep) get with sung takes; what do the take events carry
import {open, sleep} from './n5-h-mu2-lib.mjs';
const T = await open({vp: [390, 844]}); const {p, E} = T;
await sleep(2500); await T.drain(); let n0 = await T.evN();
const sz = () => E(() => ({proj: serializeProject().length, takes: JSON.stringify(S.takes || {}).length}));
console.log('demo', JSON.stringify(await sz()));
const voice = (sr, sec, f0) => { const n = Math.round(sr * sec), x = new Array(n); let ph = 0; for (let i = 0; i < n; i++) { const t = i / sr, f = f0 * Math.pow(2, (Math.floor(t * 2) % 5) / 12) * (1 + .01 * Math.sin(2 * Math.PI * 5 * t)); ph += 2 * Math.PI * f / sr; const env = (t * 2 % 1) < .85 ? 1 : 0; x[i] = Math.round(env * .3 * 32767 * (Math.sin(ph) + .5 * Math.sin(2 * ph) + .25 * Math.sin(3 * ph))); } return x; };
for (const [sec, sc] of [[4, 6], [16, 7]]) {
  const r = await E(([pc, sc, bars]) => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: sc, len: bars}), [voice(48000, sec, 220), sc, sec / 2]);
  await sleep(6000); await T.drain();
  console.log('take', sec + ' s', JSON.stringify(r), JSON.stringify(await sz()));
}
await sleep(3000); await T.drain();
const evs = await T.evSince(n0);
for (const e of evs) console.log(e.u, JSON.stringify(e.z.p), JSON.stringify(e.l), 'd' + (e.d || []).length, JSON.stringify(e.d || []).length + ' B');
console.log(JSON.stringify(await E(() => SYNQUENZER.history())));
const t = await E(() => { const a = performance.now(); for (let i = 0; i < 10; i++) { HIST.cache.clear(); histFullOps([]); } const b = performance.now(); for (let i = 0; i < 10; i++) serializeProject(); return {sweepMs: (b - a) / 10, serMs: (performance.now() - b) / 10}; });
console.log('cost', JSON.stringify(t));
await T.b.close();
