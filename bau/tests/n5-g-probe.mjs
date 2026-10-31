// G1 Schritt 1: wirkt Quantisieren hörbar? Gesungene Silben ±60 ms neben dem 1/8-Raster, Ausgang mitgeschnitten
import {launch, openG, sleep, toI16, recStart, recStop, sylOnsets, SR} from './n5-g-h.mjs';
import {voice} from '../vs-dsp/test-signals.mjs';
const OFF = [0, 60, -60, 45, -50, 60, -60, 0, 55, -45, 60, -60, 30, -30];
const notes = OFF.map((o, k) => ({t: 0.5 + k * 0.25 + o / 1000, d: 0.11, f0: [220, 247, 262, 294][k % 4], vowel: 'aeiou'[k % 5], cons: k % 2 === 1}));
const x = voice(SR, 4, notes, {seed: 3}).x;
const rawOn = sylOnsets(x, SR);
console.log('raw detector onsets', rawOn.length, rawOn.map((t, k) => ((t - rawOn[0]) * 1000 - k * 250).toFixed(1)).join(' '));
const br = await launch(null);
const H = await openG(br), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); }); await sleep(300);
await p.evaluate(() => SYNQUENZER.play()); await sleep(300); await p.evaluate(() => SYNQUENZER.stop()); await sleep(200);
const r1 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 1, len: 2}), toI16(x));
const id = r1.id;
async function heard(label, exp) {
  await p.evaluate(id => SYNQUENZER.wpPlayed(id, 0, 1), id);
  await recStart(p); await p.evaluate(() => { SYNQUENZER.launchScene(1); SYNQUENZER.play(); }); await sleep(4300);
  await p.evaluate(() => SYNQUENZER.stop());
  const r = await recStop(p), y = Float32Array.from(r.y), on = sylOnsets(y, r.sr).slice(0, 14);
  const dev = on.map((t, k) => (t - on[0]) * 1000 - k * 250);
  const err = dev.map((d, k) => d - exp(k));
  console.log(label, 'n', on.length, '| heard offset ms', dev.map(v => v.toFixed(1)).join(' '), '| err vs expected', err.map(v => v.toFixed(1)).join(' '), '| max|err|', Math.max(...err.map(Math.abs)).toFixed(1));
}
await heard('RAW', k => OFF[k]);
// as Xander: editor open, tap 1/8
await p.evaluate(r => SYNQUENZER.wpOpen({t: r.track, s: 1}), r1); await sleep(600);
await p.evaluate(id => SYNQUENZER.wpDetect(id), id);
await p.click('#wpSheet .wpchips button[data-v="1/8"]'); await sleep(800);
const W = (await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).warp;
console.log('editor tap 1/8 →', W.mode, W.strength, W.res, 'marks', W.map.src.length - 2);
console.log('marks src', W.map.src.slice(1, -1).map(v => v.toFixed(3)).join(' '));
console.log('marks dst', W.map.dst.slice(1, -1).map(v => v.toFixed(3)).join(' '));
await p.evaluate(() => SYNQUENZER.wpClose());
await heard('EDITOR-DEFAULT', k => OFF[k] * (1 - W.strength));
for (const [mode, st] of [['stretch', 1], ['stretch', .5], ['slice', 1], ['slice', .5]]) {
  await p.evaluate(([id, mode, st]) => SYNQUENZER.wpQuantize(id, {grid: '1/8', strength: st, mode}), [id, mode, st]);
  const w = (await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).warp; console.log(' warp', w.mode, w.strength);
  await heard(mode + ' ' + st, k => OFF[k] * (1 - st));
}
console.log('errs', H.errs.slice(0, 3));
await br.close();
