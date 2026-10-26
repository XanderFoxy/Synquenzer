// QA G-MK2a: undo/redo of the MK2 actions (touch, header ↶ ↷) + what the worklet plays after each undo
import {open, sleep, OUT, check, done, eq, diff} from './v3-qa-gmk2a-tl.mjs';
const L = process.argv[2] === 'L';
const T = await open({viewport: L ? {width: 926, height: 428} : {width: 428, height: 926}}); const {p, E, errs} = T;
await E(() => SYNQUENZER.setMetronome(false));
await T.openEd(0);
const mkb = await T.rectText('button', /^MS ?2000$/); await T.tap(mkb.cx, mkb.cy, 800);
await E(() => { SYNQUENZER.mkSet(0, 't.0.e2.s', 127); SYNQUENZER.mkSet(0, 't.0.e2.r', 30); });
const kA = await T.key(L ? 12 : 8);
// spectrum fingerprint of the held key (harmonic levels at the played note) - LFO-free sounds only
const fp = async () => { await T.send('touchStart', [{x: kA.cx, y: kA.cy, id: 5}]); await sleep(250);
  const r = await E(() => new Promise(res => { const a = AU.ctx.createAnalyser(); a.fftSize = 16384; a.smoothingTimeConstant = 0; AU.M.ceil.connect(a); const f = new Float32Array(a.frequencyBinCount), acc = new Float64Array(f.length); let n = 0; const iv = setInterval(() => { a.getFloatFrequencyData(f); for (let i = 0; i < f.length; i++) acc[i] += Math.pow(10, f[i] / 10); n++; }, 40); setTimeout(() => { clearInterval(iv); AU.M.ceil.disconnect(a); const note = SYNQUENZER.noteLog(4).filter(x => x.track === 0).pop().out; const f0 = 440 * Math.pow(2, (note - 69) / 12), bw = AU.ctx.sampleRate / a.fftSize; const h = []; for (let k = 1; k <= 8; k++) { const c = Math.round(k * f0 / bw); let m = 0; for (let q = c - 2; q <= c + 2; q++) m = Math.max(m, acc[q] / n); h.push(+(10 * Math.log10(m + 1e-30)).toFixed(1)); } res(h); }, 500); }));
  await T.send('touchEnd', [{x: kA.cx, y: kA.cy, id: 5}]); await sleep(350); return r; };
const half = async want => { const pn = await T.panel(); if (pn.half && pn.half !== 'beide' && pn.half !== want) { await T.tapTxt('.tab, button', want === 'B' ? /^RECHTS$/ : /^LINKS$/); await sleep(350); } };
await half('B');
const steps = [];   // [name, p.mk after, fingerprint or null, undo count]
const snap = async (name, withFp = true) => { const pm = await T.pm(0); const f = withFp ? await fp() : null; steps.push({name, pm, f, u: await T.undoN(), lcd: await T.lcdTxt()}); console.log(name.padEnd(42), 'u', steps[steps.length - 1].u, JSON.stringify(pm.t[0].o1), JSON.stringify(pm.t[0].p.map(x => [x.s, x.d, x.i])), f ? JSON.stringify(f) : ''); };
await snap('0 start (INIT MS 2000)');
await T.w('w1', /^3 OSZ 1/);
await T.knobList('k0', /^Speicherwelle/); await snap('1 WELLE → Speicherwelle (list)');
await T.sweep('k2', -40, 20, 25); await snap('2 STEUER 2 drag up');
// wave list → 61
await T.tapMk('k2', 600); await E(() => { const L = document.querySelector('#popLayer .plist.mkwv'); const b = document.querySelector('#popLayer .pop button[data-v="61"]'); L.scrollTop = b.offsetTop - L.offsetTop - 100; }); await sleep(300);
{ const r = await E(() => { const r = document.querySelector('#popLayer .pop button[data-v="61"]').getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height / 2}; }); await T.tap(r.cx, r.cy, 500); }
await snap('3 wave list → 61');
await T.knobList('k0', /^Sinus×$/); await snap('4 WELLE → Sinus×', false);
await E(() => SYNQUENZER.mkSet(0, 't.0.o1.c2', 0));   // X-LFO 0 so the fingerprint is stable
await snap('5 X-LFO 0 (api)');
await T.sweep('k1', -50, 30, 25); await snap('6 STEUER 1 X-MOD drag');
await T.knobList('k0', /^Stimmwelle$/); await snap('7 WELLE → Stimmwelle');
await T.knobList('k0', /^Rauschen$/); await snap('8 WELLE → Rauschen', false);
await T.knobList('k0', /^Speicherwelle/); await snap('9 WELLE → Speicherwelle again');
await T.w('w2', /^1 PATCH 1/);
await T.knobList('k0', /^LFO 2$/); await snap('10 PATCH 1 QUELLE → LFO 2', false);
await T.knobList('k1', /^CUTOFF$/); await snap('11 PATCH 1 ZIEL → CUTOFF', false);
await T.sweep('k2', -50, 30, 25); await snap('12 PATCH 1 INT drag up', false);
await T.w('w2', /^3 PATCH 3/);
await T.knobList('k1', /^PAN$/); await snap('13 PATCH 3 ZIEL → PAN', false);
await T.sweep('k2', 60, 30, 25); await snap('14 PATCH 3 INT drag down (negative)', false);
await T.tapTxt('button', /^🎲$/); await sleep(300); await snap('15 🎲', false);
// header undo all the way back, compare with the snapshots; then redo forward
const uEnd = await T.undoN();
const bad = [];
for (let k = steps.length - 2; k >= 0; k--) {
  await T.tapTxt('.hb.ur', /^↶$/, 300);
  const pm = await T.pm(0), want = steps[k];
  const ok = eq(pm, want.pm);
  let fok = true, f = null;
  if (want.f) { f = await fp(); fok = f.every((v, i) => Math.abs(v - want.f[i]) < 3 || (v < -70 && want.f[i] < -70)); }
  if (!ok || !fok) bad.push({to: want.name, d: diff(pm, want.pm).slice(0, 3), f, want: want.f});
  if (k === 0) break;
}
const uMid = await T.undoN();
check('U1 ↶ step by step restores every MK2 step exactly (p.mk) and the worklet sounds like it (harmonics ±3 dB)', bad.length === 0, bad.slice(0, 4));
const bad2 = [];
for (let k = 1; k < steps.length; k++) {
  await T.tapTxt('.hb.ur', /^↷$/, 300);
  const pm = await T.pm(0), want = steps[k];
  if (!eq(pm, want.pm)) bad2.push({to: want.name, d: diff(pm, want.pm).slice(0, 3)});
}
const fEnd = await fp();
check('U2 ↷ step by step re-applies every step exactly', bad2.length === 0 && (await T.undoN()) === uEnd, {bad2: bad2.slice(0, 4), u: [uEnd, await T.undoN()]});
check('U3 one undo step per action (15 actions → 15 steps; step 5 api)', uEnd - steps[0].u === 15, {u0: steps[0].u, uEnd, per: steps.map(s => s.u)});
// panel follows undo: after undo to step 3 (Speicherwelle 61) the STEUER 2 knob/LCD shows the wave
for (let k = 0; k < 12; k++) await T.tapTxt('.hb.ur', /^↶$/, 150);
await T.w('w1', /^3 OSZ 1/);
const pn = await T.panel();
await T.tapMk('k2', 500); const lt = await T.popTexts(); const on = await E(() => { const b = document.querySelector('#popLayer .pop .rb.on'); return b ? b.textContent.trim() : null; }); await T.closePop();
check('U4 after undo to "wave list → 61" the wave list marks 61 as current', /^61\b/.test(on || ''), {on, o1: (await T.pm(0)).t[0].o1});
check('no console errors', errs.length === 0, errs.slice(0, 5));
await T.br.close(); done();
