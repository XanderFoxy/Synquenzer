// QA MK7 regression: worklet load (engineInfo().load) while the demo plays (VA/FM/drums, no vocoder) and with an MS 2000 track; base vs new
import { open, APP } from './v3-qa-mk7reg-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk6-base-4.12.0.html';
const R = {base: {demo: [], mk: []}, new: {demo: [], mk: []}};
for (let i = 0; i < +(process.argv[2] || 3); i++) for (const [name, file] of [['base', BASE], ['new', APP]]) {
  const {b, p} = await open({width: 390, height: 844}, file);
  for (const sc of ['demo', 'mk']) {
    await p.evaluate(async sc => { const Q = window.SYNQUENZER; Q.stop(); await Q.loadDemo(); if (sc === 'mk') { Q.setEngine(0, 'mk'); Q.setEngine(1, 'mk'); Q.setEngine(2, 'mk'); } Q.setBpm(120); Q.launchScene(0); }, sc);
    await p.waitForTimeout(2500);
    const v = await p.evaluate(async () => { const xs = []; for (let k = 0; k < 40; k++) { const e = window.SYNQUENZER.engineInfo(); xs.push(e.load); await new Promise(r => setTimeout(r, 100)); } xs.sort((a, b) => a - b); return xs[20]; });
    R[name][sc].push(+v.toFixed(3));
  }
  await b.close();
}
console.log(JSON.stringify(R));
