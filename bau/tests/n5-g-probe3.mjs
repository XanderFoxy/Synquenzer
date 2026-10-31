// G1 Schritt 1c: echter Weg mit (Fake-)Mikrofon: ● REC mit 🎤 → STIMME-Take + MELODIE; dann Editor-Tipp 1/8 bzw. MELODIE-Quantisieren (Blatt, Standard)
import {launch, openG, sleep, writeWav, micOn, waitBeat, idle, SR, OUTG} from './n5-g-h.mjs';
import {voice} from '../vs-dsp/test-signals.mjs';
const OFF = [0, 60, -60, 45, -50, 60, -60, 0, 55, -45, 60, -60, 30, -30, 20, -20];
const notes = []; for (let rep = 0; rep < 5; rep++) OFF.forEach((o, k) => notes.push({t: rep * 4 + 0.25 + k * 0.25 + o / 1000, d: 0.11, f0: [220, 247, 262, 294][k % 4], vowel: 'aeiou'[k % 5], cons: k % 2 === 1}));
const v = voice(SR, 20.5, notes, {seed: 4}).x; const wav = OUTG + '/syl.wav'; writeWav(wav, v, SR);
const br = await launch(wav);
const H = await openG(br), p = H.p;
await p.evaluate(() => SYNQUENZER.newProject()); await sleep(300);
await micOn(p);
await p.evaluate(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); SYNQUENZER.setRecOptions({countIn: 0, length: 2}); SYNQUENZER.selectSlot(0, 2); });
await p.evaluate(() => SYNQUENZER.play());
await waitBeat(p, 3.5); await p.evaluate(() => SYNQUENZER.rec());
await waitBeat(p, 12.8); await idle(p);
await p.evaluate(() => SYNQUENZER.stop());
const I = await p.evaluate(() => SYNQUENZER.tkInfo()), st = I.stimme;
const c = await p.evaluate(t => SYNQUENZER.getClip(t, 2), st);
console.log('STIMME clip', JSON.stringify(c && c.audio));
const id = c.audio.take;
const melT = await p.evaluate(id => { const out = []; for (let t = 0; t < 16; t++) { const c = SYNQUENZER.getClip(t, 2); if (c && c.take === id) out.push({t, n: c.notes.length, q: c.q || null, notes: c.notes.slice(0, 6).map(n => +n.t.toFixed(3))}); } return out; }, id);
console.log('linked MELODIE', JSON.stringify(melT));
const det = await p.evaluate(id => SYNQUENZER.wpDetect(id), id);
const seg = det.filter(m => m.t >= c.audio.in && m.t <= c.audio.out);
const t0 = c.audio.in - c.audio.at * 0.5;
console.log('marks in clip', seg.length, 'raw dev from 1/8 (ms):', seg.map(m => { const b = (m.t - t0) / 0.25; return ((b - Math.round(b)) * 250).toFixed(0); }).join(' '));
function rep(W, lab) { if (!W) { console.log(lab, 'no warp'); return; } const s = W.map.src.slice(1, -1), d = W.map.dst.slice(1, -1), step = {'1/8': .25, '1/16': .125, '1/4': .5}[W.res] || .25;
  const moved = s.filter((x, k) => Math.abs(x - d[k]) > 1e-4).length;
  const devAfter = d.map(x => { const b = (x - W.t0) / .25; return Math.abs(b - Math.round(b)) * 250; });
  console.log(lab, W.mode, W.strength, W.grid, W.res, 'moved', moved, '/', s.length, '| after: dev from 1/8 ms', devAfter.map(v => v.toFixed(0)).join(' ')); }
// (a) editor: tap 1/8
await p.evaluate(st => SYNQUENZER.wpOpen({t: st, s: 2}), st); await sleep(500);
await p.click('#wpSheet .wpchips button[data-v="1/8"]'); await sleep(800);
rep((await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).warp, 'EDITOR 1/8');
await p.click('#wpSheet .wpchips button[data-v="auto"]'); await sleep(800);
rep((await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).warp, 'EDITOR Auto');
await p.evaluate(() => SYNQUENZER.wpClose());
await p.evaluate(id => SYNQUENZER.wpQuantize(id, {grid: 'off'}), id);
// (b) MELODIE sheet with defaults → Anwenden
if (melT.length) {
  await p.evaluate(t => SYNQUENZER.openQuant(t, 2), melT[0].t); await sleep(400);
  const qs = await p.evaluate(() => ({on: [...document.querySelectorAll('#qSheet .qchips button.on')].map(b => b.textContent), note: (document.querySelector('#qSheet .qnote') || {}).textContent, fol: !!document.querySelector('#qSheet .qfol.on')}));
  console.log('quant sheet', JSON.stringify(qs));
  await p.evaluate(() => SYNQUENZER.closeQuant(true)); await sleep(1500);
  rep((await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).warp, 'MELODIE Auto');
  await p.evaluate(t => SYNQUENZER.openQuant(t, 2), melT[0].t); await sleep(300);
  await p.click('#qSheet .qchips button[data-v="1/8"]'); await sleep(200);
  await p.evaluate(() => SYNQUENZER.closeQuant(true)); await sleep(1500);
  rep((await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).warp, 'MELODIE 1/8');
}
console.log('errs', H.errs.slice(0, 3));
await br.close();
