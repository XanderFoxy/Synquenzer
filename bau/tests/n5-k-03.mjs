// K1-03: Mod-Übersicht vollständig (gegen die Liste der Engine), Löschen hörbar + Undo, Tipp springt zum Regler, was sich
// bewegt hat eine Zeile, INIT/neues Projekt ohne Modulation und auf 0 Cent
import {launch, seedWorklet, renderIn, dbDiff, freqZC} from './n5-k-blib.mjs';
const {b, p, errs} = await launch();
await seedWorklet(p);
const R = {};
const sr = 48000;
// A. INIT: no entry, pitch exactly on the note (8 notes, each its own voice and start phase)
{
  const mods = await p.evaluate(() => SYNQUENZER.k1Mods(0));
  const ev = []; for (let k = 0; k < 8; k++) ev.push([k * .3, 'on', 57, .8, 'n' + k], [k * .3 + .27, 'off', 57, .8, 'n' + k]);
  // the INIT sound with its wave set to sine for the measurement (drift and tuning act the same on every wave)
  const x = await renderIn(p, await p.evaluate(() => { const s = SYNQUENZER.getSound(0); s.p.o1w = 3; return s; }), ev, {sec: 2.6, seed: 1});
  const dev = []; for (let k = 0; k < 8; k++) { const f = freqZC(x, sr, Math.round((k * .3 + .12) * sr), Math.round((k * .3 + .26) * sr)); dev.push(+(1200 * Math.log2(f / 220)).toFixed(3)); }
  await p.evaluate(() => { SYNQUENZER.setEngine(1, 'mk'); SYNQUENZER.initSound(1); });
  const mk = await p.evaluate(() => SYNQUENZER.k1Mods(1));
  const y = await renderIn(p, await p.evaluate(() => SYNQUENZER.getSound(1)), ev, {sec: 2.6, seed: 1});
  const devMk = []; for (let k = 0; k < 8; k++) { const f = freqZC(y, sr, Math.round((k * .3 + .12) * sr), Math.round((k * .3 + .26) * sr)); devMk.push(+(1200 * Math.log2(f / 220)).toFixed(3)); }
  const old = await p.evaluate(() => { const s = SYNQUENZER.getSound(0); s.p.analog = .15; s.p.o2fine = 7; SYNQUENZER.setSound(0, s); const e = SYNQUENZER.soundEdited(0); SYNQUENZER.initSound(0); return {oldInitEdited: e, newInitEdited: SYNQUENZER.soundEdited(0)}; });
  R.init = {entries: mods.length, centsVA: dev, maxCtVA: Math.max(...dev.map(Math.abs)), entriesMk: mk.length, maxCtMk: Math.max(...devMk.map(Math.abs)), ...old,
    pass: mods.length === 0 && mk.length === 0 && Math.max(...dev.map(Math.abs)) < .05 && Math.max(...devMk.map(Math.abs)) < .05 && !old.oldInitEdited && !old.newInitEdited};
}
// B. completeness: every factory VA / FM sound and every program of the AM engine on track 2, the overview against the engine dump
{
  const res = await p.evaluate(async () => {
    const A = SYNQUENZER; mkLoad(); for (let i = 0; i < 60 && !mkLoaded(); i++) await new Promise(r => setTimeout(r, 100));
    const ids = []; for (const [id, f] of FACTORY_BY_ID) if (f.engine === 'analog' || f.engine === 'fm6' || f.engine === 'mk') ids.push(id);
    const bad = []; let n = 0, entries = 0;
    for (const id of ids) {
      loadPreset(2, id); await new Promise(r => setTimeout(r, 0));
      const d = await A.k1Dump(2), L = A.k1Mods(2), s = A.getSound(2); if (!d) { bad.push([id, 'no dump']); continue; } n++; entries += L.length;
      const want = [];
      if (s.engine === 'mk') {
        const pm = s.p.mk, dual = pm.mode === 1 || pm.mode === 2, voc = pm.mode === 3;
        for (let k = 0; k < (dual ? 2 : 1); k++) { const T = d.mk[k];   // the ENGINE's timbre values
          if (T.vib) want.push('t.' + k + '.vib'); if (!voc) T.p.forEach((q, j) => { if (q.i) want.push('t.' + k + '.p.' + j + '.i'); });
          for (const [a, b] of [['f', 'eg'], ['f', 'kbd'], ['f', 'vel'], ['a', 'kbd']]) if (T[a][b]) want.push('t.' + k + '.' + a + '.' + b);
          if (!voc && T.seq && T.seq.on) T.seq.q.forEach((q, j) => { if (q.k > 0 && q.v.some(x => x)) want.push('t.' + k + '.seq.q.' + j + '.k'); }); }
      } else {
        const RS = ['', 'lfo1', 'lfo2', 'fenv', 'menv', 'vel', 'key', 'mw', 'rnd', 'aenv'], RD = SQF.DST_ID || null;
        for (const m of d.mods) want.push('r:' + RS[m[0]] + ':' + m[1]);
        for (const m of s.mods) if (String(m.dst).startsWith('fx.')) want.push('r:' + m.src + ':' + m.dst);
        const P = d.P; if (P.fenv) want.push('p:fenv'); if (P.fvel && P.fenv) want.push('p:fvel'); if (P.kt) want.push('p:kt'); if (P.analog) want.push('p:analog');
      }
      const have = L.map(e => e.key);
      if (s.engine === 'mk') { const a = want.slice().sort().join(), b = have.slice().sort().join(); if (a !== b) bad.push([id, a, b]); }
      else { const nr = have.filter(k => k.startsWith('r:')).length, np = have.filter(k => k.startsWith('p:')).sort().join(), wr = want.filter(k => k.startsWith('r:')).length, wp = want.filter(k => k.startsWith('p:')).sort().join();
        if (nr !== wr || np !== wp || new Set(have).size !== have.length) bad.push([id, wr + '|' + wp, nr + '|' + np]); }
    }
    return {n, entries, bad: bad.slice(0, 8), nbad: bad.length};
  });
  R.complete = Object.assign(res, {pass: res.nbad === 0 && res.n > 300});
}
// C. ✕ is audible and one undo step brings it back (VA route LFO → pitch; AM vibrato via the stored Mod-Rad)
{
  const va = await p.evaluate(async () => {
    const A = SYNQUENZER; let id = null;
    for (const [k, f] of FACTORY_BY_ID) if (f.engine === 'analog' && (f.mods || []).some(m => m.src === 'lfo1' && m.dst === 'pitch')) { id = k; break; }
    loadPreset(2, id); const key = A.k1Mods(2).find(e => e.key === 'r:lfo1:pitch').key, before = A.getSound(2), u0 = A.undoInfo().n;
    const d0 = await A.k1Dump(2); A.k1Del(2, key); await new Promise(r => setTimeout(r, 120)); const d1 = await A.k1Dump(2), after = A.getSound(2), u1 = A.undoInfo().n;
    undo(); await new Promise(r => setTimeout(r, 120)); const d2 = await A.k1Dump(2), back = A.getSound(2);
    return {id, before, after, back, eng: [d0.mods.length, d1.mods.length, d2.mods.length], undoSteps: u1 - u0, gone: !A.k1Mods(2).length ? null : !after.mods.some(m => m.src === 'lfo1' && m.dst === 'pitch')};
  });
  const ev = [[0, 'on', 60, .8], [1.6, 'off', 60]];
  const x0 = await renderIn(p, va.before, ev, {sec: 2, seed: 1}), x1 = await renderIn(p, va.after, ev, {sec: 2, seed: 1}), x2 = await renderIn(p, va.back, ev, {sec: 2, seed: 1});
  // pitch wobble: frequency per 50 ms window, spread in cents
  const spread = x => { const f = []; for (let t = .2; t < 1.5; t += .05) f.push(1200 * Math.log2(freqZC(x, sr, Math.round(t * sr), Math.round((t + .05) * sr)) / 261.63)); return Math.max(...f) - Math.min(...f); };
  // the wobble on a plain saw: INIT + LFO 1 -> pitch (amount 0,01 = ±24 ct), deleted through the overview
  const w = await p.evaluate(async () => { const A = SYNQUENZER; A.initSound(2); const s = A.getSound(2); s.mods = [{src: 'lfo1', dst: 'pitch', amt: .01}]; s.p.l1rate = 5; A.setSound(2, s); const a = A.getSound(2); A.k1Del(2, 'r:lfo1:pitch'); return [a, A.getSound(2)]; });
  const w0 = await renderIn(p, w[0], ev, {sec: 2, seed: 1}), w1 = await renderIn(p, w[1], ev, {sec: 2, seed: 1});
  R.delVA = {id: va.id, wobbleInitCt: [+spread(w0).toFixed(1), +spread(w1).toFixed(1)], engineRoutes: va.eng, undoSteps: va.undoSteps, afterVsBeforeDb: +dbDiff(x1, x0).toFixed(1), undoVsBeforeDb: +dbDiff(x2, x0).toFixed(1)};
  R.delVA.pass = va.eng[1] === va.eng[0] - 1 && va.eng[2] === va.eng[0] && va.undoSteps === 1 && R.delVA.wobbleInitCt[0] > 20 && R.delVA.wobbleInitCt[1] < 1 && R.delVA.afterVsBeforeDb > -20 && R.delVA.undoVsBeforeDb <= -90;
  const mk = await p.evaluate(async () => {
    const A = SYNQUENZER; loadPreset(2, 'f-mk-d05'); const before = A.getSound(2), u0 = A.undoInfo().n, d0 = await A.k1Dump(2);
    A.k1Del(2, 't.0.vib'); await new Promise(r => setTimeout(r, 120)); const d1 = await A.k1Dump(2), after = A.getSound(2), u1 = A.undoInfo().n;
    undo(); await new Promise(r => setTimeout(r, 120)); const d2 = await A.k1Dump(2);
    return {before, after, vib: [d0.mk[0].vib, d1.mk[0].vib, d2.mk[0].vib], undoSteps: u1 - u0};
  });
  const y0 = await renderIn(p, mk.before, ev, {sec: 2, seed: 1}), y1 = await renderIn(p, mk.after, ev, {sec: 2, seed: 1});
  R.delMk = {vib: mk.vib, undoSteps: mk.undoSteps, afterVsBeforeDb: +dbDiff(y1, y0).toFixed(1), wobbleCt: [+spread(y0).toFixed(1), +spread(y1).toFixed(1)]};
  R.delMk.pass = mk.vib[0] !== 0 && mk.vib[1] === 0 && mk.vib[2] === mk.vib[0] && mk.undoSteps === 1 && R.delMk.afterVsBeforeDb > -20;
}
// D. Tipp: VA filter envelope -> FILTER page, knob lit; route to pitch -> MOD row; AM vibrato -> its LCD page
{
  R.jump = await p.evaluate(async () => {
    const A = SYNQUENZER, out = {};
    loadPreset(3, 'f-moog-bass'); selectTrack(3); openEditor(); await new Promise(r => setTimeout(r, 200));
    const L = A.k1Mods(3); out.keys = L.map(e => e.key);
    const k = L.find(e => e.key === 'p:fenv') ? 'p:fenv' : L.find(e => e.kind === 'p').key;
    out.r1 = A.k1Jump(3, k); const el = EL.synthSheet.querySelector('.sh-body [data-key="' + k.slice(2) + '"]'); out.lit = !!(el && el.classList.contains('k1hl')); out.tab = ED.tab;
    const rr = L.find(e => e.kind === 'route'); if (rr) { out.r2 = A.k1Jump(3, rr.key); await new Promise(r => setTimeout(r, 100)); out.tab2 = ED.tab; }
    loadPreset(2, 'f-mk-d05'); selectTrack(2); openEditor(); await new Promise(r => setTimeout(r, 400));
    out.r3 = A.k1Jump(2, 't.0.vib'); await new Promise(r => setTimeout(r, 200)); out.mkMode = MKUI.P.mode; out.lcd = (document.querySelector('#synthSheet .lcd, .sh-lcd, .lcd') || {}).textContent || '';
    return out;
  });
  R.jump.pass = /^filter/.test(R.jump.r1) && R.jump.lit && R.jump.r3 && R.jump.r3.page != null && R.jump.mkMode === 'edit';
}
// E. what moves has an entry: MOD tab of INIT (no route): no source chip moves while a note sounds; one route lfo1 -> cutoff: LFO 1 moves
{
  R.move = await p.evaluate(async () => {
    const A = SYNQUENZER; A.initSound(3); selectTrack(3); ED.tab = 'mod'; openEditor(); await new Promise(r => setTimeout(r, 300));
    const sample = async () => { const seen = {}; for (let k = 0; k < 20; k++) { for (const c of ED.msrc || []) (seen[c.dataset.src] = seen[c.dataset.src] || new Set()).add(c._b.style.transform || ''); await new Promise(r => setTimeout(r, 60)); } return Object.fromEntries(Object.entries(seen).map(([k, v]) => [k, v.size])); };
    A.keyOn(60); const a = await sample();
    A.setMod(3, 'lfo1', 'cutoff', .3); await new Promise(r => setTimeout(r, 200)); const b = await sample(); A.keyOff(60);
    return {noRoute: a, withRoute: b, rows: A.k1Mods(3).length};
  });
  R.move.pass = Object.values(R.move.noRoute).every(n => n <= 1) && R.move.withRoute.lfo1 > 3 && Object.entries(R.move.withRoute).every(([k, n]) => k === 'lfo1' || n <= 1);
}
R.errors = errs.slice(0, 5);
console.log(JSON.stringify(R, null, 1));
await b.close();
