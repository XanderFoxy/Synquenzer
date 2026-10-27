// QA VS5a J: N7V-26 for every grid (1/4 … 1/32, triplets), swing 66 % (audible: rendered differs), strength 50 %, t0 ≠ 0 (clip at ≠ 0), catch window
import {launch, open5, sleep, clicks, toI16} from './v3-qa-vs5a-h2.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const br = await launch(null);
const H = await open5(br, {}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(97); }); await sleep(300);
const spb = 60 / 97, T = []; for (let k = 0; k < 24; k++) T.push(0.4 + k * spb / 4 * 1.37 + ((k * 13) % 7 - 3) * 0.004);
const r = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 4}), toI16(clicks(T, T[T.length - 1] + 0.6)));
const id = r.id; await p.evaluate(id => SYNQUENZER.wpDetect(id), id);
const STEP = {'1/4': 1, '1/8': .5, '1/8T': 1 / 3, '1/16': .25, '1/16T': 1 / 6, '1/32': .125};
for (const g of Object.keys(STEP)) for (const sw of [0.5, 0.66]) for (const str of [1, 0.5]) {
  await p.evaluate(([id, g, sw, str]) => SYNQUENZER.wpQuantize(id, {grid: g, strength: str, swing: sw}), [id, g, sw, str]);
  const W = (await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).warp, st = STEP[g] * spb, swing = g.endsWith('T') ? 0.5 : W.swing;
  let worst = 0, nIn = 0, wrongStay = 0;
  W.map.src.slice(1, -1).forEach((s, k) => {
    const b = (s - W.t0) / st, kk = Math.round(b); let q = kk * st; if (swing !== 0.5 && (kk & 1)) q += (swing - 0.5) * 2 * st; q += W.t0;
    const d = W.map.dst[k + 1];
    if (Math.abs(s - q) <= 0.4 * st + 1e-9) { nIn++; worst = Math.max(worst, Math.abs(d - (s + (q - s) * str)) * 48000); } else if (Math.abs(d - s) > 1e-6) wrongStay++;
  });
  const okk = worst <= 1.01 && !wrongStay && W.res === g && Math.abs(W.strength - str) < 1e-9;
  if (!okk || g === '1/16') console.log((okk ? '✓' : '✗'), g, 'swing', sw, '→', W.swing, 'str', str, ':', nIn, 'in window, worst', worst.toFixed(2), 'samples; moved outside window', wrongStay);
  if (!okk) fail++;
}
// swing audible: 1/16 swing 50 vs 66 → rendered differ
await p.evaluate(id => SYNQUENZER.wpQuantize(id, {grid: '1/16', strength: 1, swing: 0.5}), id); const a = (await p.evaluate(id => SYNQUENZER.wpPlayed(id), id)).data;
await p.evaluate(id => SYNQUENZER.wpQuantize(id, {grid: '1/16', strength: 1, swing: 0.66}), id); const b = (await p.evaluate(id => SYNQUENZER.wpPlayed(id), id)).data;
let diff = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
ok(diff > 48000 * 0.05, 'swing 66 % changes the sound (' + diff + ' samples differ)');
console.log(fail ? 'FAIL ' + fail : 'ALL OK'); ok(!H.errs.length, 'no console errors');
await br.close();
