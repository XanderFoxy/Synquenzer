// V2d hörbar (AnalyserNode am Master): Teil mit Lanes — Bass aus in Teil-Takt 5–6, an in 3–4 und 7 (N7S-25 als Pegel)
import { open } from './v3-v2d-pw.mjs';
import { mkCheck } from './v3-v2d-lib.mjs';
const {check, done} = mkCheck();
const {b, p, errs} = await open();
const E = (f, a) => p.evaluate(f, a);
await E(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120); const K = {root: 9, scale: 'aeolian'};
  Q.setClip(0, 3, {len: 1, key: K, notes: [{t: 0, d: 3.8, n: 45, v: .9}]});
  Q.setPart(0, {name: 'Strophe', lanes: [[{bar: 0, slot: 3}, {bar: 4, slot: -1}, {bar: 6, slot: 3}], [], [], [], [], []], chords: {len: 8, ch: [{b: 0, tg: null}]}, len: 8, src: 'fang'});
  Q.launchPart(0); return 1; });
const lv = {};
for (const bar of [3, 4, 5, 6]) {
  await p.waitForFunction(x => window.SYNQUENZER.runtime().beat > x, bar * 4 + 1.5, {timeout: 30000, polling: 20});
  const xs = []; for (let k = 0; k < 6; k++) { xs.push(await E(() => window.SYNQUENZER.meter().rmsDb)); await p.waitForTimeout(60); }
  lv[bar] = Math.max(...xs);
}
check('hörbar: Teil-Takt 5–6 Bass aus (≥ 30 dB leiser als 4 und 7)', lv[3] - lv[4] >= 30 && lv[3] - lv[5] >= 30 && lv[6] - lv[5] >= 30, lv);
check('0 Konsolenfehler', !errs.length, errs);
await b.close(); process.exit(done() ? 1 : 0);
