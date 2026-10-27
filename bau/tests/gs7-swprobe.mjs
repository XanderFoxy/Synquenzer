import {launch, open as openq, sleep, toI16} from './gs7-v3-vs5a-h.mjs';
const FILE = process.argv[2];
const br = await launch(null);
const H = await openq(br, {url: 'file://' + FILE}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); }); await sleep(300);
const n = Math.round(48000 * 4.6), xs = new Float32Array(n); let ph = 0;
const TT = [0.5, 0.762, 0.98, 1.27, 1.49, 1.77, 2.01, 2.24, 2.52, 2.75, 3.03, 3.23];
for (let i = 0; i < n; i++) { const t = i / 48000; let k = 0; for (let j = 0; j < TT.length; j++) if (t >= TT[j]) k = j; ph += 2 * Math.PI * [220, 247, 262, 294][k % 4] / 48000; let v = 0; for (let h = 1; h <= 5; h++) v += Math.sin(h * ph) / h; xs[i] = 0.2 * v * Math.min(1, t / 0.02, (4.6 - t) / 0.02); }
const r2 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 1, len: 2}), toI16(xs));
await p.evaluate(id => SYNQUENZER.wpDetect(id), r2.id);
await p.evaluate(() => SYNQUENZER.launchScene(1)); await sleep(1300);
const tSw = await p.evaluate(async id => { const t = window.__ctx ? window.__ctx.currentTime : 0; const t1 = performance.now(); await SYNQUENZER.wpQuantize(id, {grid: '1/8', strength: 1}); return [t, performance.now() - t1]; }, r2.id);
await sleep(1500);
console.log(FILE.split('/').slice(-2).join('/'), 'tSw', JSON.stringify(tSw), JSON.stringify(await p.evaluate(() => SYNQUENZER.wpSwitchInfo(true))), JSON.stringify(await p.evaluate(id => { const i = SYNQUENZER.wpInfo(id); return {n: i.marks ? i.marks.length : null, det: i.det ? i.det.length : null, last: i.last}; }, r2.id)));
await br.close();
