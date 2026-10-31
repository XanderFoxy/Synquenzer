// K1-05 Speichern = Klang: per engine a sound with many random knob edits (VA / FM / WT flat values and routes, FM operators,
// AM gesture fractions then the stored value, AM Dual + Mod-Sequenz, drum kit values): (1) the engine plays exactly the stored
// values (worklet dump against what the sound sends); (2) project text -> normalize -> render bit-equal; (3) save, page reload,
// render bit-equal to the render before the reload
import {launch, seedWorklet, renderIn, sameRender} from './n5-k-blib.mjs';
let {b, ctx, p, errs} = await launch();
await seedWorklet(p);
const ev = [[0, 'on', 48, .9], [0, 'on', 55, .8], [0, 'on', 64, .7], [1.0, 'off', 48], [1.0, 'off', 55], [1.0, 'off', 64], [1.1, 'on', 67, .8], [1.6, 'off', 67]];
const R = {};
// edits
const edits = await p.evaluate(async () => {
  const A = SYNQUENZER; let s = 7; const rnd = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  mkLoad(); for (let i = 0; i < 60 && !mkLoaded(); i++) await new Promise(r => setTimeout(r, 100));
  const vaKeys = Object.keys(PD).filter(k => !k.includes('.') && !/^fm/.test(k) && PD[k] && (PD[k].vals || PD[k].min != null));
  const editVA = (t, n) => { for (let j = 0; j < n; j++) { const k = vaKeys[Math.floor(rnd() * vaKeys.length)], d = PD[k];
      const v = d.vals ? d.vals[Math.floor(rnd() * d.vals.length)] : d.min + (d.max - d.min) * rnd(); soundEdit(t, 'k1', () => setP(t, k, v)); } };
  // 0: VA factory + 120 random knob values + routes
  loadPreset(0, 'f-moog-bass'); editVA(0, 120); A.setMod(0, 'lfo2', 'o3lvl', .37); A.setMod(0, 'menv', 'pw', -.21); A.setMod(0, 'lfo1', 'fx.pan', .4);
  // 1: FM6 factory + flat edits + operator edits
  const fmId = [...FACTORY_BY_ID.values()].find(f => f.engine === 'fm6').id; loadPreset(1, fmId);
  for (const [k, v] of [['fmBright', 7.3], ['fmAtk', -4.4], ['cutoff', 3333.3], ['res', .41], ['l1rate', 3.7]]) soundEdit(1, 'k1', () => setP(1, k, v));
  try { A.setFmOp(1, 1, 'ol', 77); A.setFmOp(1, 2, 'coarse', 3); A.setFmOp(1, 0, 'fine', 12); } catch (e) {}
  // 2: AM program, gestures with fractions (live) and the end values, Dual + a second timbre, Mod-Sequenz on
  loadPreset(2, 'f-mk-d05');
  for (let j = 0; j < 60; j++) { const path = ['t.0.f.cut', 't.0.f.res', 't.0.mix.o2', 't.0.o2.tune', 't.0.l1.f', 't.0.e2.r', 't.0.p.1.i', 't.0.vib', 'mfx.dep', 'dly.time'][j % 10], rg = SQMK.mkRange(path);
    const b0 = soundSnapshot(2); for (let q = 0; q < 5; q++) mkSetP(2, path, rg[0] + (rg[1] - rg[0]) * rnd(), true); mkSetP(2, path, Math.round(rg[0] + (rg[1] - rg[0]) * rnd()), false); commitSound(2, b0, 'k1'); }
  soundEdit(2, 'k1', () => { mkSetP(2, 'mode', 1, false); mkSetP(2, 't.1.f.cut', 40, false); mkSetP(2, 't.0.seq.on', 1, false); mkSetP(2, 't.0.seq.q.0.k', 11, false); for (let c = 0; c < 16; c++) mkSetP(2, 't.0.seq.q.0.v.' + c, ((c * 37) % 120) - 60, false); });
  // 3: WT (native) flat edits
  loadPreset(3, [...FACTORY_BY_ID.values()].find(f => f.engine === 'wt').id); for (const [k, v] of [['wt.pos', .61], ['wt.scan', -.3], ['cutoff', 1777], ['fenv', .22]]) soundEdit(3, 'k1', () => setP(3, k, v));
  // 4 drums: kit values
  for (const [k, v] of [['gate', .31], ['room', .27]]) { try { A.setKit(k, v); } catch (e) {} }
  await new Promise(r => setTimeout(r, 300));
  return {fm: fmId};
});
// (1) live engine state = what the stored sound sends
R.live = await p.evaluate(async () => {
  const A = SYNQUENZER, out = {};
  for (const t of [0, 1, 2]) {
    const d = await A.k1Dump(t), x = A.k1Expect(t); const bad = [];
    for (const k in x.flat) if (k !== 'mkLim' && typeof x.flat[k] === 'number' && d.P[k] !== x.flat[k]) bad.push(k + ':' + d.P[k] + '!=' + x.flat[k]);
    const em = x.mods.map(m => [m.src, m.dst, Math.max(-1, Math.min(1, m.amt))].join()).sort().join('|'), dm = d.mods.map(m => m.join()).sort().join('|');
    if (em !== dm) bad.push('mods ' + em + ' vs ' + dm);
    if (x.mk) for (let k = 0; k < 2; k++) { const cmp = (a, b, path) => { for (const q in a) { if (q === 'seq' && !(x.mk.mode === 1 || x.mk.mode === 2 || k === 0)) continue; const va = a[q], vb = b ? b[q] : undefined; if (va && typeof va === 'object') cmp(va, vb, path + '.' + q); else if (typeof va === 'number' && va !== vb) bad.push(path + '.' + q + ':' + vb + '!=' + va); } }; cmp(x.mk.t[k], d.mk[k], 't' + k); }
    out[t] = {bad: bad.slice(0, 6), n: bad.length};
  }
  return out;
});
R.live.pass = [0, 1, 2].every(t => R.live[t].n === 0);
// (2) project text -> normalize -> render equal, data equal
const snap = await p.evaluate(() => { const j = serializeProject(), P2 = normalizeProject(JSON.parse(j)); return {live: [0, 1, 2, 3, 4].map(t => SYNQUENZER.getSound(t)), loaded: [0, 1, 2, 3, 4].map(t => JSON.parse(JSON.stringify(P2.tracks[t].sound)))}; });
R.norm = {};
for (const t of [0, 1, 2]) R.norm[t] = +(await sameRender(p, snap.live[t], snap.loaded[t], ev, {sec: 2, seed: 1})).toFixed(1);
const strip = s => { const o = JSON.parse(JSON.stringify(s)); delete o.mt; delete o.ct; return JSON.stringify(o); };
R.normData = [0, 1, 2, 3, 4].map(t => strip(snap.live[t]) === strip(snap.loaded[t]));
R.norm.pass = [0, 1, 2].every(t => R.norm[t] <= -90) && R.normData.every(Boolean);
// (3) save, reload the page, the same sounds and renders
const before = [];
for (const t of [0, 1, 2]) before.push(await renderIn(p, snap.live[t], ev, {sec: 2, seed: 1}));
await p.evaluate(async () => { await SYNQUENZER.save(); });
await p.waitForTimeout(800);
await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version); await p.waitForTimeout(1500);
await seedWorklet(p);
const after = await p.evaluate(() => [0, 1, 2, 3, 4].map(t => SYNQUENZER.getSound(t)));
R.reload = {data: [0, 1, 2, 3, 4].map(t => strip(after[t]) === strip(snap.live[t]))};
const {dbDiff} = await import('./n5-k-blib.mjs');
for (const t of [0, 1, 2]) { let best = 1e9; for (let k = 0; k < 3 && best > -90; k++) best = Math.min(best, dbDiff(await renderIn(p, after[t], ev, {sec: 2, seed: 1}), before[t])); R.reload[t] = +best.toFixed(1); }
R.reload.pass = R.reload.data.every(Boolean) && [0, 1, 2].every(t => R.reload[t] <= -90);
R.errors = errs.slice(0, 5);
console.log(JSON.stringify(R));
await b.close();
