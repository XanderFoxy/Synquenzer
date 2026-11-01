// Gegenprüfung MA1: Randfälle (später Motor, Mod-Modus fremde Quelle, Platte T2/SPIEL/Vocoder/Undo, Stop)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const APP = process.argv[2];
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await b.newContext({viewport: {width: 428, height: 926}, deviceScaleFactor: 1, hasTouch: true, isMobile: true});
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
let N = 0, F = 0; const ok = (c, name, info) => { N++; if (!c) F++; console.log((c ? '  ok ' : '  XX ') + name + (info !== undefined ? ' · ' + JSON.stringify(info).slice(0, 300) : '')); };
await p.goto('file://' + APP); await p.waitForTimeout(1200);
await p.touchscreen.tap(5, 300);
await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 15000}).catch(() => {});
await p.waitForTimeout(300);
const W = ms => p.waitForTimeout(ms);
await p.evaluate(() => {
  const A = SYNQUENZER; try { if (R.editor) closeEditor(); } catch (e) {} A.setMetronome && A.setMetronome(false);
  A.setEngine(0, 'va'); clearMods(0);
  const notes = []; for (let k = 0; k < 8; k++) notes.push({t: k, d: .5, n: 57 + (k % 4) * 3, v: .9});
  A.setClip(0, 0, {len: 2, notes});
  for (const [k, v] of [['mA', .005], ['mD', .3], ['mS', 0], ['mR', .08], ['cutoff', 900], ['res', .35], ['l1rate', 3], ['l2rate', 1.3]]) A.setParam(0, k, v);
  A.setMod(0, 'lfo1', 'cutoff', .3); A.setMod(0, 'lfo2', 'res', .45);
  A.selectTrack(0); A.openEditor(); ED.tab = 'filter'; ED.sub.filter = 'ctl'; safeRebuild(buildSynthEd);
});
const knob = dst => p.evaluate(d => { const k = (ED.ctls || []).find(x => x.dst === d && x.isConnected); return k ? {c: k.className, dot: k._dot, hm: k.hasMod} : null; }, dst);
// A. late engine: retire the worklet engine, then bring it back while the editor stays open
await p.evaluate(() => { retireEngine(0); for (const k of ED.ctls) if (k.dst && k.update) k.update(); });
await W(150);
const a1 = await knob('res');
await p.evaluate(() => syncEngine(0, true));
await W(200);
const a2 = await knob('res');
ok(/mna/.test(a1.c) && !/mna/.test(a2.c) && a2.hm, 'A: Resonanz nach spätem Motor wieder hörbar (ohne Neuaufbau)', {a1: a1.c, a2: a2.c});
// B. mod mode menv (no route on either knob): both dots still move, LCD/aria without errors
await p.evaluate(() => { SYNQUENZER.launchClip(0, 0); SYNQUENZER.play(); SYNQUENZER.modMode('menv'); });
await W(300);
const bs = []; for (let k = 0; k < 30; k++) { bs.push(await knob('cutoff')); await W(33); }
const rr = a => { const v = a.map(x => x.dot).filter(x => x != null); return v.length ? Math.max(...v) - Math.min(...v) : 0; };
ok(rr(bs) > .05 && /mlv/.test(bs[0].c) && !/has-mod/.test(bs[0].c), 'B: Mod-Modus H2: Cutoff (nur LFO 1) bewegt sich, kein Ring', {r: rr(bs), c: bs[0].c});
await p.evaluate(() => SYNQUENZER.modMode(null));
// C. route removed (undo) -> the dot class goes
await p.evaluate(() => { SYNQUENZER.setMod(0, 'lfo2', 'res', 0); for (const k of ED.ctls) if (k.update) k.update(); });
await W(100);
const c1 = await knob('res');
ok(!/mlv|has-mod/.test(c1.c) && !c1.hm, 'C: Weg entfernt -> kein Punkt', c1.c);
await p.evaluate(() => { undo(); });
await W(200);
const c2 = await knob('res');
ok(/mlv/.test(c2.c) && c2.hm, 'C: Undo bringt den Punkt zurück', c2.c);
await p.evaluate(() => SYNQUENZER.stop());
// D. plate
await p.evaluate(() => {
  const A = SYNQUENZER; A.setEngine(0, 'mk');
  for (const [k, v] of [['t.0.p.0.s', 2], ['t.0.p.0.d', 4], ['t.0.p.0.i', 45], ['t.0.p.1.i', 0], ['t.0.p.2.i', 0], ['t.0.p.3.i', 0], ['t.0.l1.f', 70]]) A.mkSet(0, k, v);
  ED.tab = 'geraet'; safeRebuild(buildSynthEd); MKUI.P.mode = 'edit';
  A.launchClip(0, 0); A.play();
});
await W(900);
const pk = id => p.evaluate(i => { const K = MKUI.PL.ui && MKUI.PL.ui.knob[i]; return K ? (K.ma1 ? {a: K.ma1.a, rk: K.ma1.rk.length, inDom: K.ma1.svg.isConnected, n: K.n.querySelectorAll('.ma1mk').length} : 'none') : 'noknob'; }, id);
const d1 = await pk('f.cut');
ok(d1 && d1.rk > 0 && d1.n === 1, 'D: Platte Cutoff-Bogen da', d1);
// SPIEL tab -> removed; back -> one again (no duplicates)
await p.evaluate(() => { MKUI.P.tab = 'spiel'; });
await W(150);
const d2 = await pk('f.cut');
await p.evaluate(() => { MKUI.P.tab = 'geraet'; });
await W(150);
const d3 = await pk('f.cut');
ok(d2 === 'none' && d3 && d3.n === 1, 'D: SPIEL entfernt, zurück genau ein Bogen', {d2, d3});
// E. undo of the patch -> ring goes
await p.evaluate(() => SYNQUENZER.mkSet(0, 't.0.p.0.i', 0));
await W(150);
const e1 = await pk('f.cut');
await p.evaluate(() => undo());
await W(200);
const e2 = await pk('f.cut');
ok(e1 === 'none' && e2 && e2.rk > 0, 'E: INT 0 -> kein Bogen; Undo -> Bogen', {e1, e2});
// F. dual mode, timbre 2 with its own patch
const f = await p.evaluate(async () => {
  const A = SYNQUENZER; A.mkSet(0, 'mode', 1);
  const s = sndOf(0).p.mk; const has = s.t[1] && s.t[1].p;
  if (has) { A.mkSet(0, 't.1.p.0.s', 3); A.mkSet(0, 't.1.p.0.d', 6); A.mkSet(0, 't.1.p.0.i', 60); A.mkSet(0, 't.1.l2.f', 80); }
  MKUI.P.tim = 2; MKUI.renderSoon();
  await new Promise(r => setTimeout(r, 1200));
  const out = []; for (let k = 0; k < 20; k++) { const K = MKUI.PL.ui.knob['a.pan']; out.push(K && K.ma1 ? K.ma1.a : 'none'); await new Promise(r => setTimeout(r, 40)); }
  return {mode: sndOf(0).p.mk.mode, has: !!has, out};
});
const fn = f.out.filter(x => typeof x === 'number');
ok(fn.length > 5 && Math.max(...fn) - Math.min(...fn) > 5, 'F: DUAL, Timbre 2: PAN-Punkt bewegt sich (LFO 2)', f);
// G. vocoder mode -> no rings
await p.evaluate(() => { MKUI.P.tim = 1; SYNQUENZER.mkSet(0, 'mode', 3); });
await W(250);
const g = await p.evaluate(() => document.querySelectorAll('.mkpk .ma1mk').length);
ok(g === 0, 'G: Vocoder: keine Bögen', g);
// J. MOD-RAD as PATCH source: the dot follows the wheel
await p.evaluate(() => { const A = SYNQUENZER; A.mkSet(0, 'mode', 0); for (const [k, v] of [['t.0.p.0.s', 7], ['t.0.p.0.d', 4], ['t.0.p.0.i', 50], ['t.0.f.cut', 30]]) A.mkSet(0, k, v); mkWheelSet(0, 'mod', 0); });
await W(500);
const j0 = await p.evaluate(async () => { const o = []; for (let k = 0; k < 15; k++) { const K = MKUI.PL.ui.knob['f.cut']; if (K.ma1 && K.ma1.a != null) o.push(K.ma1.a); await new Promise(r => setTimeout(r, 40)); } return o; });
await p.evaluate(() => mkWheelSet(0, 'mod', 1));
await W(300);
const j1 = await p.evaluate(async () => { const o = []; for (let k = 0; k < 15; k++) { const K = MKUI.PL.ui.knob['f.cut']; if (K.ma1 && K.ma1.a != null) o.push(K.ma1.a); await new Promise(r => setTimeout(r, 40)); } return o; });
ok(j0.length && j1.length && Math.max(...j1) - Math.max(...j0) > 50, 'J: MOD-RAD hoch -> Cutoff-Punkt geht mit', {j0: j0.slice(0, 3), j1: j1.slice(0, 3)});
await p.evaluate(() => { mkWheelSet(0, 'mod', 0); SYNQUENZER.stop(); });
await W(1500);
const h = await pk('f.cut');
ok(h && h.a == null, 'H: Stop: Punkt aus (Bogen bleibt)', h);
// I. cost: ma1Frame and modFrame time
const cost = await p.evaluate(() => { const t0 = performance.now(); for (let k = 0; k < 200; k++) { MKUI.arpFrame(performance.now(), 0); } return (performance.now() - t0) / 200; });
console.log('  frame() inkl. ma1Frame (meist gedrosselt): ' + cost.toFixed(4) + ' ms');
console.log(`GP: ${N - F}/${N}` + (errs.length ? ' · errs ' + JSON.stringify(errs).slice(0, 600) : ' · keine Konsolenfehler'));
await b.close();
