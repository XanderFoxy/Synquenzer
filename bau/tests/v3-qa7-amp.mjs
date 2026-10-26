import * as Q from './v3-qa7-lib.mjs';
const {SR, render, vocSnd, rms, db, ok, welch, centroid} = Q;
const br = await Q.launch(); const {page, errs} = await Q.openApp(br);
const base = await Q.baseMk(page);
const sec = 1.5, mod = Float32Array.from(await page.evaluate(sec => SYNQUENZER.mkVowel({f0: 120, v: ['a'], sec, sr: 48000, rms: -20}), sec));
const lv = async (voc, ev, t0) => { const o = await render(page, vocSnd(base, voc, t0 || {}), ev, {sec, inputs: {e2: mod}}); return o; };
const L = o => db(rms(o.l, 24000));
// AMP LEVEL
{ const a = L(await lv({lvl: 127}, [[0, 'on', 48, .8]])), b = L(await lv({lvl: 64}, [[0, 'on', 48, .8]])), c = L(await lv({lvl: 0}, [[0, 'on', 48, .8]]));
  ok('AMP PEGEL wirkt', a - b > 3 && c < -90, `127: ${a.toFixed(1)}, 64: ${b.toFixed(1)}, 0: ${c.toFixed(1)} dB`); }
// DIST
{ const a = await lv({dist: 0}, [[0, 'on', 48, .8]]), b = await lv({dist: 1}, [[0, 'on', 48, .8]]); let d = 0; for (let i = 24000; i < a.l.length; i++) d += (a.l[i] - b.l[i]) ** 2;
  ok('VERZERRER wirkt', db(Math.sqrt(d / (a.l.length - 24000))) - L(a) > -30, 'Differenz ' + (db(Math.sqrt(d / (a.l.length - 24000))) - L(a)).toFixed(1) + ' dB'); }
// VEL SENSE: vel 0.2 vs 1.0, with vel +63 the difference should grow vs vel 0
{ const d0 = L(await lv({vel: 0}, [[0, 'on', 48, 1]])) - L(await lv({vel: 0}, [[0, 'on', 48, .2]]));
  const d1 = L(await lv({vel: 63}, [[0, 'on', 48, 1]])) - L(await lv({vel: 63}, [[0, 'on', 48, .2]]));
  const d2 = L(await lv({vel: -63}, [[0, 'on', 48, 1]])) - L(await lv({vel: -63}, [[0, 'on', 48, .2]]));
  ok('AMP ANSCHLAG wirkt', Math.abs(d1 - d0) > 3 && Math.abs(d2 - d0) > 3, `Δ laut/leise: vel 0 ${d0.toFixed(1)}, +63 ${d1.toFixed(1)}, −63 ${d2.toFixed(1)} dB`); }
// KBD TRACK
{ const d0 = L(await lv({kbd: 0}, [[0, 'on', 84, .8]])) - L(await lv({kbd: 0}, [[0, 'on', 36, .8]]));
  const d1 = L(await lv({kbd: 63}, [[0, 'on', 84, .8]])) - L(await lv({kbd: 63}, [[0, 'on', 36, .8]]));
  const d2 = L(await lv({kbd: -63}, [[0, 'on', 84, .8]])) - L(await lv({kbd: -63}, [[0, 'on', 36, .8]]));
  ok('AMP KEYTRACK wirkt', Math.abs(d1 - d0) > 3 && Math.abs(d2 - d0) > 3, `Δ C6/C2: kbd 0 ${d0.toFixed(1)}, +63 ${d1.toFixed(1)}, −63 ${d2.toFixed(1)} dB`); }
// FC-MOD sources: each src with mint 63 shifts the spectrum vs mint 0
const C = o => { const N = 8192; return centroid(welch(o.l, 24000, sec * SR, N), N); };
const names = ['EG1', 'EG2', 'LFO1', 'LFO2', 'Anschlag', 'Keytrack', 'Bend', 'Mod-Rad'];
const c0 = C(await lv({msrc: 1, mint: 0}, [[0, 'on', 72, .9]], {mix: {o1: 0, o2: 0, n: 127}}));
const rows = [];
for (let s = 0; s < 8; s++) {
  const t0 = {mix: {o1: 0, o2: 0, n: 127}, e1: {a: 0, d: 64, s: 100, r: 0, rst: 1}, l1: {w: 2, ks: 0, sync: 0, f: 100, note: 6}, l2: {w: 2, ks: 0, sync: 0, f: 100, note: 6}};
  const o = await render(page, vocSnd(base, {msrc: s, mint: 63}, t0), [[0, 'on', 72, .9]], {sec, inputs: {e2: mod}, at: s === 6 ? [[0, {mkWheel: {bend: 1}}]] : s === 7 ? [[0, {mkWheel: {mod: 1}}]] : []});
  const o0 = await render(page, vocSnd(base, {msrc: s, mint: 0}, t0), [[0, 'on', 72, .9]], {sec, inputs: {e2: mod}, at: s === 6 ? [[0, {mkWheel: {bend: 1}}]] : s === 7 ? [[0, {mkWheel: {mod: 1}}]] : []});
  let d = 0; for (let i = 24000; i < o.l.length; i++) d += (o.l[i] - o0.l[i]) ** 2; const rel = db(Math.sqrt(d / (o.l.length - 24000))) - L(o0);
  rows.push(names[s] + ' ' + rel.toFixed(1) + ' dB (M-SP ' + C(o0).toFixed(0) + '→' + C(o).toFixed(0) + ')');
}
console.log(rows.join('\n'));
ok('FC-MOD jede Quelle wirkt (EG1, EG2, LFO1, LFO2, Anschlag, Keytrack; Räder nur informativ)', rows.slice(0, 6).every(r => parseFloat(r.split(' ')[1]) > -20), rows.join(' | '));
console.log('errs', errs.slice(0, 3)); Q.summary(); await br.close();
