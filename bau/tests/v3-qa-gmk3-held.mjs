// QA G-MK3: held keys (API keyOn = the keyboard path inputDown) while MK3 controls are operated by touch; after release:
// no stuck voice (worklet scope, main-thread VOICES, level), sound while held
import {open, sleep, OUT, check, done, eq} from './v3-qa-gmk3-tl.mjs';
const T = await open(); const {p, E, errs} = T;
await E(() => { const Q = SYNQUENZER; Q.setMetronome(false); Q.setEngine(0, 'mk'); Q.mkSet(0, 'mode', 2); Q.mkSet(0, 'split', 60); Q.mkSet(0, 't.0.e2.r', 20); Q.mkSet(0, 't.1.e2.r', 40); Q.mkSet(0, 't.1.o1.w', 1); Q.mkSet(0, 't.1.e2.a', 20); });
await E(async () => { const Q = SYNQUENZER; Q.setEngine(2, 'mk'); Q.mkSet(2, 't.0.o1.w', 2); await Q.saveSound(2, 'Quelle', 'new'); });
await T.openEd(0);
const lvT = ms => E(ms => new Promise(r => { const a = AU.ctx.createAnalyser(); a.fftSize = 2048; const n = AU.synth[0].node; n.connect(a); const buf = new Float32Array(2048); let pk = 0; const iv = setInterval(() => { a.getFloatTimeDomainData(buf); for (const v of buf) pk = Math.max(pk, Math.abs(v)); }, 20); setTimeout(() => { clearInterval(iv); try { n.disconnect(a); } catch (e) {} r(+(20 * Math.log10(pk + 1e-12)).toFixed(1)); }, ms); }), ms);
const scope = async () => { await E(() => SYNQUENZER.mkScope(0)); await sleep(100); return E(() => { const s = SYNQUENZER.mkScope(0); return s ? s.voices.map(v => v.note + (v.tb === 2 ? 'b' : 'a')).sort().join(' ') : null; }); };
const shift = async on => { const pn = await T.panel(); if (!!pn.shift !== !!on) await T.tapMk('shift', 200); };
const held = async (name, notes, fn, o = {}) => {
  await E(() => SYNQUENZER.mkSet(0, 'mode', 2)); await E(() => SYNQUENZER.mkSet(0, 'split', 60)); await sleep(100);
  await E(n => { n.forEach((x, k) => SYNQUENZER.keyOn(x, .8, 'H' + k)); }, notes); await sleep(400);
  const s0 = await scope(); let r; try { r = await fn(); } catch (e) { r = 'ERR ' + e.message; }
  await sleep(300); const s1 = await scope(); const lv1 = await lvT(200);
  await E(n => { n.forEach((x, k) => SYNQUENZER.keyOff(x, 'H' + k)); }, notes); await sleep(1600);
  const s2 = await scope(); const lv2 = await lvT(250); const vv = await E(() => SYNQUENZER.voices().filter(v => v.state !== 'off').length); const live = await E(() => SYNQUENZER.runtime().liveVoices);
  const ok = !s2 && lv2 < -90 && !vv && !live && (o.silentOk || lv1 > -45);
  check(name, ok, {r, held: [s0, s1], lv1, after: {scope: s2, lv: lv2, voices: vv, live}});
  if (o.after) await o.after();
};
await T.w('w1', /^1 STIMME/);
await held('H1 EINZELN → Schicht while 55+64 held', [55, 64], () => T.knobList('k1', /^Schicht$/));
await held('H2 EINZELN → Einzeln while held', [55, 64], () => T.knobList('k1', /^Einzeln$/));
await held('H3 Einzeln → Split while held', [55, 64], async () => { await E(() => SYNQUENZER.mkSet(0, 'mode', 0)); await sleep(200); await T.knobList('k1', /^Split$/); });
await held('H4 SPLIT drag across the held keys (60 → 40 → 70)', [55, 64], async () => { await shift(1); await T.sweep('k2', 60, 30, 25); await T.sweep('k2', -90, 40, 25); return E(() => SYNQUENZER.mkGet(0).split); });
await held('H5 STIMMEN 2+2 → 1+3 → 3+1 with 4 held keys', [50, 55, 64, 67], async () => { await shift(1); await T.knobList('k1', /^1\+3$/); await shift(1); await T.knobList('k1', /^3\+1$/); return E(() => SYNQUENZER.mkGet(0).tv); }, {after: () => E(() => SYNQUENZER.mkSet(0, 'tv', 1))});
await held('H6 Split arm (tap SPLIT) + a new held key sets split', [55], async () => { await shift(1); await T.tapMk('k2', 250); await E(() => SYNQUENZER.keyOn(72, .8, 'X')); await sleep(300); const sp = await E(() => SYNQUENZER.mkGet(0).split); await E(() => SYNQUENZER.keyOff(72, 'X')); return sp; });
await held('H7 T2 ZUWEISUNG → Mono → Unison → Poly while held', [55, 64, 67], async () => { await shift(0); await T.tapMk('timbre', 250); await T.knobList('k2', /^Mono$/); await sleep(300); await T.knobList('k2', /^Unison$/); await sleep(300); await T.knobList('k2', /^Poly$/); return E(() => SYNQUENZER.mkGet(0).t[1].asg); }, {after: async () => { await T.tapMk('timbre', 250); await T.tapMk('timbre', 250); }});
await held('H8 solo T1 while a T2 key is held, release, solo off: T2 must not come back', [64], async () => { await shift(1); await T.tapMk('timbre', 250); await sleep(300); return (await T.panel()).solo; }, {silentOk: true, after: async () => { await T.tapMk('timbre', 250); await sleep(500); const s = await scope(); const lv = await lvT(200); check('H8b after solo off: nothing sounds', !s && lv < -90, {s, lv}); }});
await held('H9 SHIFT + 2 swap while held', [55, 64], async () => { await shift(1); await T.tapMk('n1', 300); });
await held('H10 SHIFT + 4 init while held', [55, 64], async () => { await shift(1); await T.tapMk('n3', 300); });
await held('H11 SHIFT + 1 copy while held', [55, 64], async () => { await shift(1); await T.tapMk('n0', 500); const r = await E(() => { const r = [...document.querySelectorAll('#popLayer .mkcr')].find(r => /Quelle/.test(r.textContent)); if (!r) return null; const q = r.querySelector('button[data-t="0"]').getBoundingClientRect(); return {cx: q.x + q.width / 2, cy: q.y + q.height / 2}; }); if (!r) return 'no row'; await T.tap(r.cx, r.cy, 300); });
await held('H12 STIMMUNG Pelog / GRUNDTON sweep while held', [55, 64], async () => { await T.w('w2', /^10 STIMMUNG/); await T.knobList('k0', /^Pelog$/); await T.sweep('k1', -80, 30, 25); return E(() => [SYNQUENZER.mkGet(0).scale, SYNQUENZER.mkGet(0).skey]); });
await held('H13 ↶ ↷ ↶ (header) while held', [55, 64], async () => { for (const s of ['↶', '↷', '↶']) await T.tapTxt('.hb.ur', new RegExp('^' + s + '$'), 250); });
await held('H14 PRIORITÄT Tiefste + 1+3 with T1 Mono, 3 keys under the split', [48, 52, 55], async () => { await T.w('w1', /^1 STIMME/); await shift(1); await T.knobList('k0', /^Tiefste$/); await shift(1); await T.knobList('k1', /^1\+3$/); await E(() => SYNQUENZER.mkSet(0, 'mode', 1)); await sleep(200); return scope(); });
await held('H15 ⋯ → Init (whole sound) while held', [55, 64], async () => { const d = await T.rectText('button', /^⋯$/); await T.tap(d.cx, d.cy, 400); await T.tapPop(/^Init/); await sleep(300); return E(() => SYNQUENZER.getSound(0).name); }, {after: () => E(() => SYNQUENZER.mkSet(0, 'mode', 2))});
check('no console errors', errs.length === 0, errs.slice(0, 5));
await T.br.close(); done();
