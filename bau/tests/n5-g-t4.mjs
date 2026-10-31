// G1 Leistung: synchroner Anteil eines Chip-Tipps (Quantisieren + Zeichnen) im Editor, 60-s-Take, je 6 Tipps; Median/Max
import {launch, openG, sleep, toI16, SR} from './n5-g-h.mjs';
import {voice} from '../vs-dsp/test-signals.mjs';
const notes = []; for (let k = 0; k < 236; k++) notes.push({t: 0.5 + k * 0.25 + ((k * 37) % 13 - 6) * 0.009, d: 0.11, f0: [220, 247, 262, 294][k % 4], vowel: 'aeiou'[k % 5], cons: k % 2 === 1});
const x = voice(SR, 60, notes, {seed: 3}).x; { let sd = 5; for (let i = 0; i < x.length; i++) { sd = (sd * 16807) % 2147483647; x[i] += 0.0005 * (sd / 2147483647 * 2 - 1); } }
const br = await launch(null);
const H = await openG(br, {viewport: {width: 926, height: 428}, touch: true, mobile: true}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
const r1 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 1, len: 16}), toI16(x)); const id = r1.id;
await p.evaluate(id => SYNQUENZER.wpDetect(id), id);
await p.evaluate(r => SYNQUENZER.wpOpen({t: r.track, s: 1}), r1); await sleep(400);
for (let i = 0; i < 4; i++) { const z = await p.evaluate(() => document.querySelector('#wpSheet .wpz').textContent); if (z === 'Ganz') break; await p.tap('#wpSheet .wpz'); await sleep(150); }
const T = [], F = [];
for (const g of ['1/8', '1/16', '1/4', '1/8', '1/16', '1/8']) {
  const r = await p.evaluate(g => { const b = document.querySelector('#wpSheet .wpchips button[data-v="' + g + '"]'); const t0 = performance.now(); b.click(); const t1 = performance.now(); return new Promise(res => { const fr = []; let l = performance.now(); const f = () => { const n = performance.now(); fr.push(n - l); l = n; if (fr.length < 20) requestAnimationFrame(f); else res({sync: t1 - t0, frames: fr}); }; requestAnimationFrame(f); }); }, g);
  T.push(r.sync); F.push(...r.frames.slice(1)); await sleep(1200);
}
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
console.log('Tipp synchron (ms):', T.map(v => v.toFixed(1)).join(' '), '| Median', med(T).toFixed(1), '| Bildabstand Median', med(F).toFixed(1), 'max', Math.max(...F).toFixed(1));
await br.close();
