// LCD meaning of STEUER 1/2 per wave, same-wave tap in the list, SHIFT + OKT on the wave knob
import {open, sleep, OUT, check, done} from './v3-qa-gmk2a-tl.mjs';
const T = await open(); const {p, E, errs} = T;
await E(() => SYNQUENZER.setMetronome(false));
await T.openEd(0); const mkb = await T.rectText('button', /^MS ?2000$/); await T.tap(mkb.cx, mkb.cy, 800);
await T.w('w1', /^3 OSZ 1/);
const out = {};
for (const w of ['Säge', 'Puls', 'Dreieck', 'Sinus×', 'Stimmwelle', 'Speicherwelle', 'Rauschen']) {
  await T.knobList('k0', new RegExp('^' + w));
  await T.sweep('k1', -6, 6, 20); const l1 = await T.lcdTxt();
  await T.sweep('k2', -6, 6, 20); const l2 = await T.lcdTxt();
  out[w] = [l1, l2];
  console.log(w.padEnd(14), '|', l1, '|', l2);
}
const want = {'Säge': ['FORM', 'WFM'], 'Puls': ['BREITE', 'PWM'], 'Dreieck': ['FORM', 'WFM'], 'Sinus×': ['X-MOD', 'X-LFO'], 'Stimmwelle': ['FORM', 'WFM'], 'Speicherwelle': ['ohne Wirkung', 'WELLE'], 'Rauschen': ['CUTOFF', 'RESO']};
const badL = Object.entries(want).filter(([w, [a, b]]) => !(out[w][0] || '').includes(a) || !(out[w][1] || '').includes(b));
check('LCD names STEUER 1 / STEUER 2 per wave (B.3 OSZ 1 row)', badL.length === 0, badL.map(([w]) => [w, out[w]]));
// same wave tapped again in the list → no extra undo step
await T.knobList('k0', /^Speicherwelle/);
const u0 = await T.undoN(), c20 = (await T.pm(0)).t[0].o1.c2;
await T.tapMk('k2', 600);
const cur = await E(() => { const b = document.querySelector('#popLayer .pop .rb.on'); const r = b.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height / 2, t: b.textContent.trim()}; });
await T.tap(cur.cx, cur.cy, 400);
const u1 = await T.undoN();
check('tap on the current wave in the list: no change, no extra undo step', u1 === u0 && (await T.pm(0)).t[0].o1.c2 === c20, {u: [u0, u1], cur: cur.t, top: await T.undoTop()});
// SHIFT + OKT ▲ after the wave knob → next wave
const wv = async () => Math.floor((await T.pm(0)).t[0].o1.c2 / 2) + 1;
await T.sweep('k2', -8, 6, 20); const w0 = await wv();
await T.tapMk('shift'); await T.tapMk('octu', 300); const w1 = await wv(); const l1 = await T.lcdTxt();
await T.tapMk('shift'); await T.tapMk('octu', 300); const w2 = await wv();
await T.tapMk('shift'); await T.tapMk('octd', 300); const w3 = await wv();
console.log('SHIFT+OKT on wave knob', w0, w1, w2, w3, l1);
check('SHIFT + OKT ▲/▼ steps the stored wave by one per press', w1 === w0 + 1 && w2 === w0 + 2 && w3 === w0 + 1, {w0, w1, w2, w3, lcd: l1});
check('no console errors', errs.length === 0, errs);
await T.br.close(); done();
