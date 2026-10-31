// G1 Schritt 1b: Wege wie Xander (Editor-Tipp, Audio folgt, Song), gemessen am Ausgang
import {launch, openG, sleep, toI16, recStart, recStop, sylOnsets, heardShifts, SR} from './n5-g-h.mjs';
import {voice} from '../vs-dsp/test-signals.mjs';
const OFF = [0, 60, -60, 45, -50, 60, -60, 0, 55, -45, 60, -60, 30, -30];
const notes = OFF.map((o, k) => ({t: 0.5 + k * 0.25 + o / 1000, d: 0.11, f0: [220, 247, 262, 294][k % 4], vowel: 'aeiou'[k % 5], cons: k % 2 === 1}));
const x = voice(SR, 4, notes, {seed: 3}).x, rawOn = sylOnsets(x, SR);
const br = await launch(null);
const H = await openG(br), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); }); await sleep(300);
await p.evaluate(() => SYNQUENZER.play()); await sleep(300); await p.evaluate(() => SYNQUENZER.stop()); await sleep(200);
const r1 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 1, len: 2}), toI16(x));
const id = r1.id;
async function heard(label, str, how = 'scene', sec = 4.3) {
  await p.evaluate(id => SYNQUENZER.wpPlayed(id, 0, 1), id);
  await recStart(p);
  if (how === 'scene') await p.evaluate(() => { SYNQUENZER.launchScene(1); SYNQUENZER.play(); });
  else await p.evaluate(() => { SYNQUENZER.songPlay(0); });
  await sleep(sec * 1000);
  await p.evaluate(() => SYNQUENZER.stop());
  const r = await recStop(p), y = Float32Array.from(r.y), on = sylOnsets(y, r.sr);
  console.log("  sr", r.sr, "len", y.length, "on", on.slice(0, 4).map(v => v.toFixed(3)).join(" "));
  const hs = heardShifts(x, rawOn, y, r.sr, on[0]);
  const grid = hs.map((h, k) => OFF[k] + h.ms), exp = OFF.map(o => o * (1 - str)), err = grid.map((g, k) => g - exp[k]);
  console.log(label.padEnd(16), 'heard vs grid ms', grid.map(v => v.toFixed(1)).join(' '), '| max|err|', Math.max(...err.map(Math.abs)).toFixed(1), '| min rho', Math.min(...hs.map(h => h.rho)).toFixed(3));
  return grid;
}
await heard('RAW', 0);
await p.evaluate(r => SYNQUENZER.wpOpen({t: r.track, s: 1}), r1); await sleep(600);
await p.evaluate(id => SYNQUENZER.wpDetect(id), id);
await p.click('#wpSheet .wpchips button[data-v="1/8"]'); await sleep(800);
const W = (await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).warp; console.log('editor tap 1/8 →', W.mode, W.strength);
await p.evaluate(() => SYNQUENZER.wpClose());
await heard('EDITOR-TAP', W.strength);
await p.evaluate(id => SYNQUENZER.wpQuantize(id, {grid: 'off'}), id);
// Audio folgt: MELODIE clip with the sung onsets, linked to the take
const mel = OFF.map((o, k) => ({t: +((0.5 + k * 0.25 + o / 1000) * 2).toFixed(4), d: 0.2, n: 60 + (k % 4), v: 0.8}));
await p.evaluate(([id, mel]) => SYNQUENZER.setClip(5, 1, {len: 2, notes: mel, take: id}), [id, mel]);
await p.evaluate(() => SYNQUENZER.quantizeClip(5, 1, {grid: '1/8'})); await sleep(600);
const W2 = (await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).warp; console.log('Audio folgt →', W2 && W2.mode, W2 && W2.strength, W2 && W2.res);
await p.evaluate(() => SYNQUENZER.setClip(5, 1, null));
await heard('AUDIO-FOLGT', W2 ? W2.strength : 0);
console.log('song bars', await p.evaluate(() => SYNQUENZER.songFromChain([{scene: 1, bars: 2}])));
await heard('SONG', W2 ? W2.strength : 0, 'song');
await p.evaluate(id => SYNQUENZER.wpQuantize(id, {grid: '1/8', strength: 0.5, mode: 'stretch'}), id);
await heard('SONG 50%', 0.5, 'song');
console.log('song api', await p.evaluate(() => Object.keys(SYNQUENZER).filter(k => /song/i.test(k)).join(',')));
console.log('errs', H.errs.slice(0, 3));
await br.close();
