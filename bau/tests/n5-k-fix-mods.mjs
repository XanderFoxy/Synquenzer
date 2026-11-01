// K1-fix: the new rows (MS 2000 STEUER 2, vocoder, FM graph LFO / pitch envelopes, fm6 PEG): list, ✕ (1 undo step, engine), Tipp, open-list refresh on ↶ ↷
import {launch} from './n5-k-blib.mjs';
const {b, p, errs} = await launch({});
const J = x => console.log(JSON.stringify(x));
await p.evaluate(async () => { mkLoad(); for (let i = 0; i < 60 && !mkLoaded(); i++) await new Promise(r => setTimeout(r, 100)); });
// (a) all 8 STEUER-2 programs + Pendelbass rows
J(await p.evaluate(() => ['f-mk-a11', 'f-mk-e03', 'f-mk-e11', 'f-mk-e15', 'f-mk-k109', 'f-mk-k305', 'f-mk-k610', 'f-mk-k616'].map(id => { loadPreset(2, id); return [id, SYNQUENZER.k1Mods(2).map(e => e.src + ' → ' + e.dst + ' [' + e.amt + ']')]; })));
// (b) a program with a Speicherwelle / Rauschen and STEUER 2 > 0: no row
J(await p.evaluate(() => { const out = []; for (const [id, f] of FACTORY_BY_ID) if (f.engine === 'mk') { const s = factorySound(id), m = s.p.mk; for (let k = 0; k < (m.mode === 1 || m.mode === 2 ? 2 : 1); k++) { const o = m.t[k].o1; if ((o.w === 5 || o.w === 6) && o.c2 > 0) { loadPreset(2, id); out.push([id, 'w' + o.w, SYNQUENZER.k1Mods(2).filter(e => /Steuer 2/.test(e.amt)).length]); } } } return {speicherRausch: out.length, withRow: out.filter(x => x[2]).length}; }));
// (c) delete STEUER 2 on Streichsatz: value 0, 1 undo step, undo back; jump
J(await p.evaluate(() => { loadPreset(2, 'f-mk-a11'); selectTrack(2); openEditor(); const key = SYNQUENZER.k1Mods(2).find(e => /Steuer 2/.test(e.amt)).key; const u0 = UNDO.length;
  const j = SYNQUENZER.k1Jump(2, key); SYNQUENZER.k1Del(2, key); const after = sndOf(2).p.mk.t[0].o1.c2, du = UNDO.length - u0; undo(); return {key, jump: j, after, undoSteps: du, back: sndOf(2).p.mk.t[0].o1.c2, lcd: (EL.synthSheet.querySelector('.lcd') || {}).innerText}; }));
// (d) vocoder programs
J(await p.evaluate(() => ['f-mk-h11', 'f-mk-k811'].map(id => { loadPreset(2, id); return [id, SYNQUENZER.k1Mods(2).map(e => e.key + ' ' + e.src + ' → ' + e.dst + ' [' + e.amt + ']')]; })));
J(await p.evaluate(() => { loadPreset(2, 'f-mk-h11'); selectTrack(2); openEditor(); const u0 = UNDO.length; const j = SYNQUENZER.k1Jump(2, 'voc.mint'); SYNQUENZER.k1Del(2, 'voc.mint'); const a = sndOf(2).p.mk.voc.mint, du = UNDO.length - u0; undo(); return {jump: j, after: a, undoSteps: du, back: sndOf(2).p.mk.voc.mint}; }));
await p.evaluate(() => closeEditor && closeEditor());
// (e) FM graph: INIT FM, OP 1 LFO FM 18; then all ops lfoFm 36 + lfoAm 42; pit point form on OP 2
J(await p.evaluate(() => { loadPreset(1, 'f-init-fm'); const x = SYNQUENZER.fmxFromFm6(sndOf(1).p.fm6); const r = {}; x.ops[0].lfoFm = 18; SYNQUENZER.setFmx(1, x); r.a = SYNQUENZER.k1Mods(1).map(e => e.key + ' ' + e.src + ' → ' + e.dst + ' [' + e.amt + ']');
  const y = deep(sndOf(1).p.fmx); y.ops.forEach(o => { o.lfoFm = 36; o.lfoAm = 42; }); SYNQUENZER.setFmx(1, y); r.b = SYNQUENZER.k1Mods(1).map(e => e.key + ' ' + e.src + ' → ' + e.dst + ' [' + e.amt + ']'); r.ops = y.ops.map(o => [o.on, o.ol]); r.edges = JSON.stringify(y.edges); return r; }));
J(await p.evaluate(() => { selectTrack(1); openEditor(); const L = SYNQUENZER.k1Mods(1), e = L.find(e => /lfoFm/.test(e.key)), u0 = UNDO.length; const j = SYNQUENZER.k1Jump(1, e.key); const lit = [...EL.synthSheet.querySelectorAll('.k1hl')].map(x => x.dataset.key);
  SYNQUENZER.k1Del(1, e.key); const after = sndOf(1).p.fmx.ops.map(o => o.lfoFm), du = UNDO.length - u0, n = SYNQUENZER.k1Mods(1).length; undo(); return {jump: j, lit, after, undoSteps: du, n, back: sndOf(1).p.fmx.ops.map(o => o.lfoFm)}; }));
// (f) FM pitch envelope through the TONH. commit path on FM-Pluck and INIT FM
J(await p.evaluate(() => { const r = {}; for (const [t, id] of [[1, 'f-init-fm'], [2, 'f-fm-pluck']]) { if (!FACTORY_BY_ID.has(id)) { r[id] = 'missing'; continue; } loadPreset(t, id); SYNQUENZER.setFmPeg(t, {r: [60, 40, 99, 99], l: [62, 50, 50, 50]});
  r[id] = {fmx: !!sndOf(t).p.fmx, rows: SYNQUENZER.k1Mods(t).filter(e => /Tonhöhen/.test(e.src)).map(e => e.key + ' ' + e.src + ' → ' + e.dst + ' [' + e.amt + '] dx=' + e.dx)}; } return r; }));
J(await p.evaluate(() => { const t = 1; selectTrack(t); openEditor(); const e = SYNQUENZER.k1Mods(t).find(e => /Tonhöhen/.test(e.src)); const u0 = UNDO.length; const j = SYNQUENZER.k1Jump(t, e.key);
  SYNQUENZER.k1Del(t, e.key); const n = SYNQUENZER.k1Mods(t).filter(e => /Tonhöhen/.test(e.src)).length, peg = sndOf(t).p.fm6.peg || null, pits = sndOf(t).p.fmx ? sndOf(t).p.fmx.ops.map(o => !!o.pit) : null, du = UNDO.length - u0; undo();
  return {jump: j, tab: ED.tab, sub: ED.sub.env, afterRows: n, peg, pits, undoSteps: du, backRows: SYNQUENZER.k1Mods(t).filter(e => /Tonhöhen/.test(e.src)).length}; }));
// (g) fm6 without a graph: delete p.fmx, set peg
J(await p.evaluate(() => { loadPreset(1, 'f-init-fm'); const s = sndOf(1); delete s.p.fmx; fmSetPeg(1, {r: [60, 40, 99, 99], l: [62, 50, 50, 50]}); return SYNQUENZER.k1Mods(1).map(e => e.key + ' ' + e.src + ' → ' + e.dst + ' [' + e.amt + ']'); }));
// (h) open list follows undo / redo (toast fn)
J(await p.evaluate(async () => { loadPreset(2, 'f-rom-flaeche'); selectTrack(2); openEditor(); SYNQUENZER.k1Open(2); const rows = () => document.querySelectorAll('.pop.k1pop .k1mr').length; const r = {n0: rows()};
  document.querySelector('.pop.k1pop .k1x[data-x="r:lfo2:pitch"]').click(); await new Promise(r => setTimeout(r, 30)); r.afterX = rows();
  const tb = () => [...document.querySelectorAll('#toast button')].find(b => b.getBoundingClientRect().width > 0);
  tb().click(); await new Promise(r => setTimeout(r, 30)); r.afterToastUndo = rows(); r.pop = !!document.querySelector('.pop.k1pop');
  tb().click(); await new Promise(r => setTimeout(r, 30)); r.afterToastRedo = rows(); r.keys = [...document.querySelectorAll('.pop.k1pop .k1mr')].map(x => x.dataset.k).join(','); return r; }));
// (i) MOD chip LFO 1 with lfoFm and no route
J(await p.evaluate(() => ({fmxLfo: k1FmxLfo(1), initFm: (loadPreset(3, 'f-init-fm'), k1FmxLfo(3)), mods1: SYNQUENZER.k1Mods(1).length})));
// (j) FM graphs against the worklet dump: mixed per-operator LFO FM / AM, DX pitch envelope on some ops, point form on a fixed op, PMD 0
const fmCases = await p.evaluate(async () => {
  const A = SYNQUENZER, t = 1, out = [];
  const cases = [
    x => { x.ops.forEach((o, k) => { o.ol = 80; o.lfoFm = k < 3 ? 18 : 54; o.lfoAm = k % 2 ? 85 : 0; }); },
    x => { x.ops.forEach((o, k) => { o.ol = 80; if (k < 2) { o.pit = {f: 'dx', r: [60, 40, 99, 99], l: [62, 50, 50, 50]}; o.pr = 'dx'; } }); x.ops[4].fixed = 1; x.ops[4].pit = {f: 'pt', y: [70, 50], t: [200], sus: -1}; x.ops[4].pr = 'ton'; },
    x => { x.ops.forEach(o => { o.ol = 80; o.lfoFm = 36; }); x.pmd = 0; },
    x => { x.ops.forEach(o => { o.ol = 80; o.lfoAm = 127; }); x.amd = 50; x.ops[5].on = 0; },
  ];
  for (const f of cases) {
    loadPreset(t, 'f-init-fm'); const x = A.fmxFromFm6(sndOf(t).p.fm6); f(x); let err = null; try { A.setFmx(t, x); } catch (e) { err = String(e); }
    await new Promise(r => setTimeout(r, 30)); const d = await A.k1Dump(t), L = A.k1Mods(t), X = d.fmx, want = [];
    if (X) for (let k = 0; k < 6; k++) { if (!X.on[k]) continue; if (X.fmS[k]) want.push('x:lfoFm:' + k); if (X.am[k] || X.amG[k]) want.push('x:lfoAm:' + k); if (X.pit[k] || X.pt[k]) want.push('x:pit:' + k); }
    const hx = []; for (const e of L) { const m = /^x:(\w+):(\d+)$/.exec(e.key); if (m) for (const c of m[2]) hx.push('x:' + m[1] + ':' + c); }
    out.push({err, same: want.sort().join() === hx.sort().join(), want: want.join(), rows: L.filter(e => e.key.startsWith('x:')).map(e => e.src + ' → ' + e.dst + ' [' + e.amt + ']')});
  }
  return out;
});
fmCases.forEach(c => J(c));
// (k) the vocoder voice ignores the timbre filter / amp intensities (why they are not listed in vocoder mode): render with EG-Int / Keytrack 63 vs as is
{
  const {renderIn, dbDiff, seedWorklet} = await import('./n5-k-blib.mjs'); await seedWorklet(p);
  const s = await p.evaluate(() => factorySound('f-mk-h11'));
  const vow = await p.evaluate(() => Array.from(MKUI.mkVowel({f0: 110, v: ['a', 'e', 'i', 'o', 'u'], seg: .5, sec: 3, sr: 48000, rms: -20, vib: 0})));
  const ev = [[0.05, 'on', 57, .8, 'a'], [2.8, 'off', 57, .8, 'a']], o = {sec: 3, seed: 1, inputs: {e1: vow, e2: vow}};
  const a = await renderIn(p, s, ev, o), z = JSON.parse(JSON.stringify(s)); Object.assign(z.p.mk.t[0].f, {eg: 63, kbd: 63, vel: 63}); z.p.mk.t[0].a.kbd = 63;
  const c = await renderIn(p, z, ev, o), y = JSON.parse(JSON.stringify(s)); y.p.mk.voc.mint = 0; const e = await renderIn(p, y, ev, o);
  J({vocFilterAmp63VsAsIs: +dbDiff(c, a).toFixed(1), vocMint0VsAsIs: +dbDiff(e, a).toFixed(1)});
}
// (l) MOD tab: the LFO 1 chip moves for a graph with LFO FM and no route
J(await p.evaluate(async () => { const A = SYNQUENZER, t = 1; loadPreset(t, 'f-init-fm'); const x = A.fmxFromFm6(sndOf(t).p.fm6); x.ops[0].lfoFm = 18; A.setFmx(t, x); selectTrack(t); ED.tab = 'mod'; openEditor(); await new Promise(r => setTimeout(r, 300));
  A.keyOn(57); const v = new Set(); for (let k = 0; k < 10; k++) { await new Promise(r => setTimeout(r, 100)); const c = [...(ED.msrc || [])].find(c => c.dataset.src === 'lfo1'); v.add(c ? c._b.style.transform : 'none'); } A.keyOff(57);
  const o = [...(ED.msrc || [])].filter(c => c.dataset.src !== 'lfo1').map(c => c._b.style.transform || 'scaleX(0)'); return {lfo1Values: v.size, othersMoving: new Set(o).size > 1 || (o[0] && o[0] !== 'scaleX(0)' && o[0] !== 'scaleX(0.000)')}; }));
console.log('errs', errs);
await b.close();
