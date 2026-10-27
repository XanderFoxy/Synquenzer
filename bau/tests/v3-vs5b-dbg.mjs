import {launch, open5, sleep, toI16, SR, clickTone, rmsDbR} from './v3-vs5b-h.mjs';
const br = await launch(null); const H = await open5(br), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); }); await sleep(300);
const OFF = [14, -22, 31, -9, 26, -35, 18, 4, -27, 12, -16, 33, -6, 21, -30, 9];
const T = OFF.map((o, k) => 0.5 + k * 0.25 + o / 1000), x = clickTone(T, 4.6);
const r = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 3}), toI16(x));
await p.evaluate(id => SYNQUENZER.wpDetect(id), r.id);
const lead = process.argv[2];
await p.evaluate(r => SYNQUENZER.wpQuantize({t: r.track, s: 0}, {grid: '1/8', strength: 1, mode: 'stretch'}), r);
const I = await p.evaluate(id => SYNQUENZER.wpInfo(id), r.id);
const y = Float32Array.from((await p.evaluate(id => SYNQUENZER.wpPlayed(id), r.id)).data), raw = Float32Array.from(await p.evaluate(id => SYNQUENZER.tkBufRange(id), r.id));
const P2 = Math.round(2 * SR / 196), ref0 = rmsDbR(raw, Math.round(0.35 * SR), Math.round(0.45 * SR));
const dips = []; for (let s = Math.round(0.6 * SR); s + P2 < Math.round(4.3 * SR); s += P2 >> 2) { const v = rmsDbR(y, s, s + P2) - ref0; if (v < -2.5) dips.push([(s / SR).toFixed(3), v.toFixed(2)]); }
console.log('dst', I.warp.map.dst.map(v => v.toFixed(3)).join(' '));
console.log('src', I.warp.map.src.map(v => v.toFixed(3)).join(' '));
console.log('dips', JSON.stringify(dips));
// raw dips for comparison
const rd = []; for (let s = Math.round(0.6 * SR); s + P2 < Math.round(4.3 * SR); s += P2 >> 2) { const v = rmsDbR(raw, s, s + P2) - ref0; if (v < -2.5) rd.push([(s / SR).toFixed(3), v.toFixed(2)]); }
console.log('raw dips', JSON.stringify(rd));
await br.close();
