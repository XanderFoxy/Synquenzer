// QA MK5: cost of a key press (inputDown) on an MS 2000 track arp off vs on, stopped and playing; chord recording timing
import { open, APP } from './v3-qa-mk5reg-pw.mjs';
const {b, p, errs} = await open({width: 390, height: 844}, APP);
const r = await p.evaluate(async () => { const Q = window.SYNQUENZER; const sl = ms => new Promise(r => setTimeout(r, ms));
  Q.newProject({init: true}); Q.setBpm(120); Q.setEngine(0, 'mk'); Q.setEngine(1, 'mk'); await sl(700);
  const K = {root: 9, scale: 'aeolian'}; Q.setClip(1, 0, {len: 1, key: K, notes: [57, 60, 64].map(n => ({t: 0, d: 4, n, v: .8}))});
  const meas = async (arp, playing) => { Q.selectTrack(0); Q.mkSet(0, 'arp.on', arp); await sl(100); if (playing) { Q.launchScene(0); await sl(500); }
    const c = []; for (let k = 0; k < 20; k++) { const ns = [60, 64, 67]; for (const n of ns) { const t0 = performance.now(); Q.keyOn(n, .8, 'm' + n); c.push(performance.now() - t0); } await sl(120); for (const n of ns) { Q.keyOff(n, 'm' + n); } await sl(80); }
    Q.stop(); await sl(300); c.sort((a, b) => a - b); return {p50: +c[Math.floor(c.length / 2)].toFixed(2), p95: +c[Math.floor(c.length * .95)].toFixed(2), max: +c[c.length - 1].toFixed(2)}; };
  return {offStopped: await meas(0, false), onStopped: await meas(1, false), offPlaying: await meas(0, true), onPlaying: await meas(1, true)}; });
console.log(JSON.stringify(r), JSON.stringify(errs));
await b.close();
