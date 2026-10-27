// QA VS5b: N7V-29 with factor < 0.5 and two marks in one grid cell (collision), Dehnen
import {launch, open5, sleep, toI16, clickTone} from './v3-vs5b-h.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const br = await launch(null); const H = await open5(br), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
for (const [T, g, label] of [[[0.41, 0.53, 1.0, 1.5, 2.0], '1/4', 'factor < 0.5'], [[0.46, 0.555, 1.0, 1.5, 2.0], '1/4', 'two marks to one grid point']]) {
  const x = clickTone(T, 2.6, {toneFrom: 0.2});
  const r = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 1, len: 2}), toI16(x));
  const det = await p.evaluate(id => SYNQUENZER.wpDetect(id), r.id);
  for (let k = det.length - 1; k >= 0; k--) if (!T.some(t => Math.abs(t - det[k].t) < 0.005)) await p.evaluate(([id, k]) => SYNQUENZER.wpMark(id, 'del', k), [r.id, k]);
  await p.evaluate(([r, g]) => SYNQUENZER.wpQuantize({t: r.track, s: 1}, {grid: g, strength: 1, mode: 'stretch', t0: 0}), [r, g]);
  const Y = await p.evaluate(id => SYNQUENZER.wpPlayed(id), r.id), y = Y.data, raw = await p.evaluate(id => SYNQUENZER.tkBufRange(id), r.id);
  const I = await p.evaluate(id => SYNQUENZER.wpInfo(id), r.id), W = I.warp.map;
  let bit = 0; const s = W.src.slice(1, -1), d = W.dst.slice(1, -1); s.forEach((v, k) => { const S0 = Math.round(v * 48000), D0 = Math.round(d[k] * 48000); let same = true; for (let j = 0; j < 960; j++) if (y[D0 + j] !== raw[S0 + j]) { same = false; break; } if (same) bit++; });
  let fin = true, pk = 0; for (const v of y) { if (!Number.isFinite(v)) fin = false; pk = Math.max(pk, Math.abs(v)); }
  console.log('  ' + label + ': src', s.map(v => v.toFixed(3)).join(' '), 'dst', d.map(v => v.toFixed(3)).join(' '), 'warn', JSON.stringify(I.warn), 'last', JSON.stringify(I.last));
  ok(fin && !Y.raw, label + ': render finite, played version not raw');
  ok(bit === s.length, label + ': first 20 ms after each mark bit-identical ' + bit + '/' + s.length);
  const fac = d.slice(1).map((v, k) => (v - d[k]) / (s[k + 1] - s[k]));
  const out = fac.filter(f => f < 0.5 || f > 2).length;
  ok(!out || (I.warn && I.warn.length >= out), label + ': factors ' + fac.map(f => f.toFixed(2)).join(' ') + ' → warnings ' + (I.warn ? I.warn.length : 0) + ' for ' + out);
}
ok(!H.errs.length, 'no console errors ' + JSON.stringify(H.errs.slice(0, 3)));
await br.close(); console.log(fail ? 'FAIL ' + fail : 'ALL OK');
