import {launch, open5, sleep, toI16} from './v3-qa-vs5a-h2.mjs';
const br = await launch(null); const H = await open5(br, {}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); }); await sleep(300);
const LEN = 4.6, n = Math.round(48000 * LEN), xs = new Float32Array(n); let ph = 0;
const TT = [0.5, 0.762, 0.98, 1.27, 1.49, 1.77, 2.01, 2.24, 2.52, 2.75, 3.03, 3.23, 3.52, 3.74, 4.03, 4.27];
for (let i = 0; i < n; i++) { const t = i / 48000; let k = 0; for (let j = 0; j < TT.length; j++) if (t >= TT[j]) k = j; ph += 2 * Math.PI * [220, 247, 262, 294][k % 4] / 48000; let v = 0; for (let h = 1; h <= 5; h++) v += Math.sin(h * ph) / h; xs[i] = 0.2 * v * Math.min(1, t / 0.02, (LEN - t) / 0.02); }
const id = (await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 2}), toI16(xs))).id;
await p.evaluate(id => SYNQUENZER.wpDetect(id), id);
await p.evaluate(() => SYNQUENZER.launchScene(0)); await sleep(900);
await p.evaluate(() => { const o = wpSwitch; window.__dbg = []; window.wpSwitch = () => { window.__dbg.push({stack: new Error().stack.split('\n').slice(2, 6).map(l => l.trim().split(' ')[1]).join('<'), now: AU.ctx.currentTime, src: TK.src.map(r => ({take: r.take, start: r.start, end: r.end, dead: r.dead, same: (() => { try { return tkPlayBuf(r.take, r.aud) === r.s.buffer; } catch (e) { return String(e); } })(), warp: !!wpWarp(r.take), cache: WP.cache.has(r.take), ready: wpReady(r.take), raw: r.s.buffer === tkBuffer(r.take), job: WP.job.size, sched: b2t(R.schedBeat)}))}); return o(); }; });
await p.evaluate(async id => { await SYNQUENZER.wpQuantize(id, {grid: '1/8', strength: 1}); }, id); await sleep(500); console.log(JSON.stringify(await p.evaluate(id => { const I = SYNQUENZER.wpInfo(id); return {marks: I.marks && I.marks.length, det: I.det && I.det.length, warp: I.warp && {grid: I.warp.grid, res: I.warp.res, src: I.warp.map.src.slice(0, 6), dst: I.warp.map.dst.slice(0, 6)}, ready: I.ready}; }, id))); await p.evaluate(async id => { await SYNQUENZER.wpQuantize(id, {grid: 'off', strength: 1}); }, id); await sleep(500);
console.log(JSON.stringify(await p.evaluate(() => window.__dbg), null, 0));
console.log(await p.evaluate(() => JSON.stringify(SYNQUENZER.wpSwitchInfo())));
await br.close();
