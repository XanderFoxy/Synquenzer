// QA K1: 3 minutes of the demo song (P 390x844, touch): Synth 2 = MS 2000 Hauchlead, scene switches by finger, the
// Mod-Übersicht used while playing (✕, toast Rückgängig, head ↶), MS 2000 knob values set while the track is silent and sounding,
// background hide/show, BPM. Recorded: master + raw engine outputs of t1 (MS 2000), t2 (Rom-Fläche), t3 (Mini-Lead).
import {open, sleep, OUT} from './n5-k-qa-lib.mjs';
import {recStart, recAnalyse7} from './v3-qa-gmk7-rec.mjs';
const MIN = +(process.argv[2] || 3), FILE = process.env.F, TAG = FILE ? 'base' : 'K';
const T = await open({vp: [390, 844], file: FILE}); const {p, E, errs} = T;
let fail = 0; const check = (m, c, d) => { console.log((c ? 'OK  ' : 'BAD ') + m + (c ? '' : '  ' + JSON.stringify(d).slice(0, 600))); if (!c) fail++; };
await E(async () => { const Q = SYNQUENZER; Q.play(); Q.stop(); Q.setMetronome(false); Q.setBpm(120); mkLoad(); for (let i = 0; i < 80 && !mkLoaded(); i++) await new Promise(r => setTimeout(r, 100));
  Q.setEngine(1, 'mk'); loadPreset(1, 'f-mk-d05');
  // scenes 3/4 get clips too (copies of 1/2), so every scene plays
  for (const t of [0, 1, 2, 3, 4]) { const a = Q.getClip(t, 0), b = Q.getClip(t, 1) || a; if (a && !Q.getClip(t, 2)) Q.setClip(t, 2, a); if (b && !Q.getClip(t, 3)) Q.setClip(t, 3, b); }
  const mel = base => ({len: 1, notes: [[0, .45, 0], [.5, .45, 2], [1, .9, 4], [2, .45, 7], [2.5, .45, 5], [3, .9, 4]].map(([t, d, n]) => ({t, d, n: base + n, v: .8}))});
  Q.setClip(3, 0, mel(72)); Q.setClip(3, 1, mel(74)); Q.setClip(3, 2, mel(71)); Q.setClip(3, 3, mel(69));
  if (!Q.getClip(1, 0)) Q.setClip(1, 0, mel(60)); });
const tapScene = async n => { const b = (await T.find('button.scn', new RegExp('^▶\\s*' + n)))[0]; if (!b) return 'no scene button'; await T.tap(b.cx, b.cy, 200); return 'ok'; };
const closeAll = async () => { await E(() => { try { closePop(); } catch (e) {} if (R.editor) closeEditor(); }); await sleep(300); };
const openEd = async name => { await closeAll(); const th = (await T.find('.th', new RegExp('^' + name, 'i')))[0]; if (!th) return 'no head'; await T.tap(th.cx, th.cy, 250); const k = await T.tapSel('button', /^KLANG$/, 900); return k ? 'ok' : 'no KLANG'; };
const openMods = async () => { const m = (await T.find('#synthSheet .edm, #synthSheet .mkqmore'))[0]; if (!m) return 'no ⋯'; await T.tap(m.cx, m.cy, 350); const mi = (await T.find('.pop button', /^Modulationen/))[0]; if (!mi) return 'no item'; await T.tap(mi.cx, mi.cy, 450); return mi.t.slice(0, 16); };
const tapX = async key => { const x = await E(k => { const r = document.querySelector('.pop.k1pop .k1x[data-x="' + k + '"]'); if (!r) return null; r.scrollIntoView({block: 'nearest'}); const b = r.getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height / 2]; }, key); if (!x) return 'no row ' + key; await T.tap(x[0], x[1], 300); return 'ok'; };
await tapScene(1); await p.waitForFunction(() => SYNQUENZER.runtime().playing, null, {timeout: 10000}); await sleep(300);
console.log('rec', JSON.stringify(await recStart(E, MIN * 60 + 40, [1, 2, 3])));
const res = {};
const act = async (name, fn) => { const t = await E(() => (window.__pn = Math.round(performance.now()), [AU.ctx.currentTime, audBeat()])); let r; try { r = await fn(); } catch (e) { r = 'ERR ' + e.message; } res[name] = r;
  await E(([n, t, b, r]) => window.__q.acts.push({n, t, b, r, pn: window.__pn, t1: AU.ctx.currentTime}), [name, t[0], t[1], typeof r === 'object' ? JSON.stringify(r).slice(0, 80) : String(r)]);
  console.log(`[bar ${(t[1] / 4).toFixed(1)}] ${name} -> ${typeof r === 'object' ? JSON.stringify(r).slice(0, 200) : r}`); return r; };
const atBar = bar => p.waitForFunction(x => audBeat() >= x, bar * 4 + 0.3, {timeout: 400000, polling: 10});
const K = TAG === 'K'; const k1 = fn => K ? fn() : Promise.resolve('skip (base)');
{
await atBar(3); await act('Synth 3 editor, ⋯ -> Modulationen', async () => [await openEd('SYNTH 3'), await k1(openMods)]);
await atBar(5); await act('✕ LFO 1 -> Cutoff (pad sounding)', () => k1(() => tapX('r:lfo1:cutoff')));
await atBar(7); await act('toast Rückgängig', () => k1(async () => { const b = (await T.find('button', /^Rückgängig$/))[0]; if (!b) return 'no toast'; await T.tap(b.cx, b.cy, 300); return E(() => SYNQUENZER.k1Mods(2).length); }));
await atBar(9); await act('scene 2 by finger', () => tapScene(2));
await atBar(11); await act('Synth 2 (MS 2000 Hauchlead) editor, ⋯ -> Modulationen', async () => [await openEd('SYNTH 2'), await k1(openMods)]);
await atBar(13); await act('✕ vibrato (LFO 2 × Mod-Rad -> Tonhöhe)', () => K ? tapX('t.0.vib') : E(() => { SYNQUENZER.mkSet(1, 't.0.vib', 0); return 'mkSet'; }));
await atBar(15); await act('head ↶ (vibrato back)', async () => { await E(() => { try { closePop(); } catch (e) {} }); await sleep(250); const u = (await T.find('#synthSheet button', /^↶$/))[0]; if (!u) return 'no ↶'; await T.tap(u.cx, u.cy, 300); return E(() => SYNQUENZER.getSound(1).p.mk.t[0].vib); });
await atBar(17); await act('MS 2000 CUTOFF/RESO/EG values 10x in 2 s (knob-like, while playing)', async () => { for (let k = 0; k < 10; k++) { await E(k => { SYNQUENZER.mkSet(1, 't.0.f.cut', 40 + (k % 5) * 15); SYNQUENZER.mkSet(1, 't.0.f.res', 20 + (k % 3) * 20); SYNQUENZER.mkSet(1, 't.0.f.eg', (k % 4) * 10 - 10); }, k); await sleep(200); } return 'ok'; });
await atBar(19); await act('scene 3 by finger', async () => { await closeAll(); return tapScene(3); });
await atBar(21); await act('MS 2000 OSZ 2 HALBTON / MIX while playing', async () => { for (let k = 0; k < 6; k++) { await E(k => { SYNQUENZER.mkSet(1, 't.0.o2.semi', [0, 7, 12, -5, 0, 7][k]); SYNQUENZER.mkSet(1, 't.0.mix.o2', [0, 60, 127, 30, 0, 90][k]); }, k); await sleep(300); } return 'ok'; });
await atBar(24); await act('background: hidden 3 s, visible again', async () => { await E(() => { Object.defineProperty(document, 'visibilityState', {configurable: true, get: () => 'hidden'}); Object.defineProperty(document, 'hidden', {configurable: true, get: () => true}); document.dispatchEvent(new Event('visibilitychange')); }); await sleep(3000); await E(() => { Object.defineProperty(document, 'visibilityState', {configurable: true, get: () => 'visible'}); Object.defineProperty(document, 'hidden', {configurable: true, get: () => false}); document.dispatchEvent(new Event('visibilitychange')); }); return E(() => AU.ctx.state); });
await atBar(27); await act('scene 4 by finger', () => tapScene(4));
await atBar(29); await act('Synth 4 editor, ⋯ -> Modulationen, ✕ Analog, ✕ Filter-Hüllk.', async () => [await openEd('SYNTH 4'), await k1(async () => [await openMods(), await tapX('p:analog'), await tapX('p:fenv'), await E(() => SYNQUENZER.k1Mods(3).length)])]);
await atBar(32); await act('undo x2 (head)', async () => { await E(() => { try { closePop(); } catch (e) {} }); await sleep(250); for (let k = 0; k < 2; k++) { const u = (await T.find('#synthSheet button', /^↶$/))[0]; if (u) await T.tap(u.cx, u.cy, 350); } return E(() => SYNQUENZER.undoInfo().n); });
await atBar(34); await act('BPM 112 -> 126', () => E(() => { SYNQUENZER.setBpm(126); return SYNQUENZER.runtime().bpm; }));
await atBar(36); await act('scene 1 by finger', async () => { await closeAll(); return tapScene(1); });
await atBar(40); await act('MS 2000 program change while playing (Pendelbass), ⋯ Modulationen', async () => { await E(() => loadPreset(1, 'f-mk-e15')); return [await openEd('SYNTH 2'), await k1(openMods)]; });
await atBar(44); await act('scene 2 by finger', async () => { await closeAll(); return tapScene(2); });
await atBar(48); await act('MS 2000 back to Hauchlead', () => E(() => { loadPreset(1, 'f-mk-d05'); return 1; }));
await atBar(52); await act('scene 3', () => tapScene(3));
await atBar(56); await act('scene 4', () => tapScene(4));
await atBar(60); await act('scene 1', () => tapScene(1));
await atBar(64); await act('scene 2', () => tapScene(2));
await atBar(68); await act('scene 3', () => tapScene(3));
await atBar(72); await act('scene 1', () => tapScene(1));
}
await atBar(Math.min(90, MIN * 30 - 2)); const tStop = await E(() => AU.ctx.currentTime);
await act('■ stop', async () => { await closeAll(); return E(() => { SYNQUENZER.stop(); return 1; }); });
await sleep(4500);
const fin = await E(() => ({voices: SYNQUENZER.voices().filter(v => v.state !== 'off'), live: SYNQUENZER.runtime().liveVoices, te: SYNQUENZER.tickErrors(), playing: SYNQUENZER.runtime().playing}));
const A = await recAnalyse7(E, tStop, {});
const tail = await E(() => new Promise(r => { const a = AU.ctx.createAnalyser(); a.fftSize = 2048; AU.M.ceil.connect(a); const b = new Float32Array(2048); let pk = 0; const iv = setInterval(() => { a.getFloatTimeDomainData(b); for (const v of b) pk = Math.max(pk, Math.abs(v)); }, 20); setTimeout(() => { clearInterval(iv); r(+(20 * Math.log10(pk + 1e-9)).toFixed(1)); }, 1500); }));
console.log('recorded', A.secs, 's; notes', A.notes, '; fps', A.fps, '; longtasks', JSON.stringify(A.lt.slice(0, 20)), '; stalls', JSON.stringify(A.stall.slice(0, 20)), '; late', A.late.length, JSON.stringify(A.late.slice(0, 10)), 'gaps', A.gaps);
const byAct = f => { const a = A.acts.filter(a => f.t >= a.t - .05).pop(); return a ? a.n.slice(0, 50) + ' +' + (f.t - a.t).toFixed(2) : '-'; };
for (const tap in A.taps) { const X = A.taps[tap]; console.log(tap, 'peak', X.peakDb, 'NaN', X.nan, 'flags', X.flags.length, 'sflags', X.sflags.length, 'd2f', X.d2f.length, 'drops', X.drops.length, JSON.stringify(X.drops.slice(0, 6)));
  for (const f of X.flags.concat(X.sflags.map(x => Object.assign({k: 's'}, x)), X.d2f.map(x => Object.assign({k: 'd'}, x))).slice(0, 12)) console.log('    ', f.k || 'f', f.t, f.db, byAct(f)); }
check('recorded >= ' + Math.round(MIN * 56 - 5) + ' s', A.secs >= MIN * 56 - 5, A.secs);
check('no NaN, master peak < 0 dBFS', Object.values(A.taps).every(x => x.nan === 0) && A.taps.master.peakDb < 0, Object.fromEntries(Object.entries(A.taps).map(([k, x]) => [k, [x.nan, x.peakDb]])));
check('no dropouts', Object.values(A.taps).every(x => x.drops.length === 0), Object.fromEntries(Object.entries(A.taps).map(([k, x]) => [k, x.drops.slice(0, 4)])));
check('no stuck notes 4.5 s after stop', fin.voices.length === 0 && !fin.live && tail < -60, {fin, tail});
check('tickErrors 0', !fin.te, fin.te);
check('no late notes', A.late.length === 0, A.late.slice(0, 10));
check('no console errors', errs.length === 0, errs.slice(0, 5));
check('no longtask > 50 ms / stall > 60 ms', !A.lt.some(x => x[0] > 50) && !A.stall.length, {lt: A.lt, stall: A.stall});
check('all actions ran', !Object.values(res).some(r => /ERR|no /.test(JSON.stringify(r))), Object.entries(res).filter(([k, r]) => /ERR|no /.test(JSON.stringify(r))));
check('master: no click flags', A.taps.master.flags.length === 0, A.taps.master.flags.slice(0, 10).map(f => [f.t, f.db, byAct(f)]));
check('raw taps: no flags / sustained / discontinuity', ['t1', 't2', 't3'].every(k => A.taps[k].flags.length === 0 && A.taps[k].sflags.length === 0 && A.taps[k].d2f.length === 0), Object.fromEntries(['t1', 't2', 't3'].map(k => [k, [A.taps[k].flags.length, A.taps[k].sflags.length, A.taps[k].d2f.length]])));
await T.b.close();
console.log(fail ? fail + ' BAD' : 'all ok');
