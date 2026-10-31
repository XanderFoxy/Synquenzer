import {open, sleep, APP} from './h.mjs';
import {band25, db} from './sig.mjs';
const H = await open({file: APP}), p = H.p;
await p.evaluate(() => { SYNQUENZER.loadDemo(); SYNQUENZER.setMetronome(false); SYNQUENZER.play(); SYNQUENZER.stop(); });
await sleep(300); const sr = await p.evaluate(() => window.__ctx.sampleRate);
await p.evaluate(() => SYNQUENZER.launchScene(0)); await sleep(1200);
await p.evaluate(() => { window.__cap('d', AU.tracks[4].cut); });
const m = await p.evaluate(() => SYNQUENZER.g4Mix(4000));
const c = await p.evaluate(() => { const c = window.__capGet('d'), m = new Float32Array(c.L.length); for (let k = 0; k < m.length; k++) m[k] = 0.5 * (c.L[k] + c.R[k]); return Array.from(m.subarray(0, 44100 * 4)); });
const z = band25(Float32Array.from(c), sr), B = 2048, P = []; for (let k = 0; k + B <= z.length; k += B) { let a = 0; for (let i = k; i < k + B; i++) a += z[i] * z[i]; P.push(a / B); }
const mx = Math.max(...P), q = P.filter(v => v > mx * 1e-3);
console.log(JSON.stringify(m.per.map(x => [x.name, x.band, x.n])), 'cap drums', db(q.reduce((a, b) => a + b, 0) / q.length).toFixed(2), 'mean all', db(P.reduce((a,b)=>a+b,0)/P.length).toFixed(2));
await H.br.close();
