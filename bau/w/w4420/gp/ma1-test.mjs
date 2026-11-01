// MA1 test: modulation visible on every knob for every source (Analog: LFO1 → Cutoff, LFO2 → Resonanz, Hüllk. 2 → Cutoff; mk plate: PATCH)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const APP = process.argv[2], OUT = APP.replace(/index\.html$/, '');
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await b.newContext({viewport: {width: 428, height: 926}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
let N = 0, F = 0; const ok = (c, name, info) => { N++; if (!c) F++; console.log((c ? '  ✓ ' : '  ✗ ') + name + (info !== undefined ? ' · ' + JSON.stringify(info).slice(0, 300) : '')); };
await p.goto('file://' + APP); await p.waitForTimeout(1200);
await p.touchscreen.tap(5, 300);
await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 15000}).catch(() => {});
await p.waitForTimeout(300);
// ---- 1. Analog
await p.evaluate(() => {
  const A = SYNQUENZER; try { if (R.editor) closeEditor(); } catch (e) {} A.setMetronome && A.setMetronome(false);
  A.setEngine(0, 'va'); clearMods(0);
  const notes = []; for (let k = 0; k < 8; k++) notes.push({t: k, d: .5, n: 57 + (k % 4) * 3, v: .9});
  A.setClip(0, 0, {len: 2, notes});
  for (const [k, v] of [['mA', .005], ['mD', .22], ['mS', 0], ['mR', .08], ['cutoff', 900], ['res', .35], ['l1rate', 3], ['l2rate', 1.3]]) A.setParam(0, k, v);
  A.setMod(0, 'lfo1', 'cutoff', .3); A.setMod(0, 'lfo2', 'res', .45); A.setMod(0, 'menv', 'cutoff', .35);
  A.selectTrack(0); A.openEditor(); ED.tab = 'filter'; ED.sub.filter = 'ctl'; safeRebuild(buildSynthEd);
  clearLog(); A.launchClip(0, 0); A.play();
});
await p.waitForTimeout(700);
const sample = async (n, fn) => { const r = []; for (let k = 0; k < n; k++) { r.push(await p.evaluate(fn)); await p.waitForTimeout(33); } return r; };
const vaS = () => { const o = {t: AU.ctx.currentTime}; for (const k of ED.ctls || []) if (['cutoff', 'res'].includes(k.dst) && k.isConnected) { o[k.dst] = k._dot; o[k.dst + 'C'] = k.className; o[k.dst + 'T'] = k.querySelector('.kdg').getAttribute('transform'); o[k.dst + 'O'] = getComputedStyle(k.querySelector('.kdg')).opacity; }
  o.menv = MLIVE.sv.menv; o.l1 = MLIVE.sv.lfo1; o.l2 = MLIVE.sv.lfo2; o.age = performance.now() - MLIVE.at; return o; };
let s1 = await sample(90, vaS);
const rng = (a, k) => { const v = a.map(x => x[k]).filter(x => x != null); return v.length ? Math.max(...v) - Math.min(...v) : 0; };
ok(rng(s1, 'cutoff') > .1, 'Analog: Cutoff-Punkt bewegt sich (LFO 1 + Hüllk. 2)', {range: rng(s1, 'cutoff')});
ok(rng(s1, 'res') > .05, 'Analog: Resonanz-Punkt bewegt sich (LFO 2)', {range: rng(s1, 'res')});
ok(s1.every(x => x.resO === '1' && x.cutoffO === '1'), 'Analog: beide Punkte sichtbar');
ok(s1.filter(x => x.age < 200).length > s1.length * .9, 'Werte aus dem Worklet-Scope (frisch)');
// envelope strikes per note: rising edges of Hüllk. 2 (> 0.5) in the 30-Hz scope stream against the note starts (one per beat)
const env = await p.evaluate(async () => {
  const E = AU.synth[0], f = E.onScope, log = []; E.onScope = m => { log.push([m.t, m.scope[4]]); if (f) f(m); };
  await new Promise(r => setTimeout(r, 3000)); E.onScope = f;
  let edges = 0; for (let k = 1; k < log.length; k++) if (log[k][1] > .5 && log[k - 1][1] <= .5) edges++;
  const spb = 60 / S.bpm, t0 = log[0][0], t1 = log[log.length - 1][0];
  return {edges, beats: +((t1 - t0) / spb).toFixed(2), n: log.length, peak: Math.max(...log.map(x => x[1]))};
});
ok(env.n > 70 && Math.abs(env.edges - env.beats) <= 1.5, 'Hüllk. 2 schlägt je Note an (Scope 30 Hz)', env);
await p.screenshot({path: OUT + 'ma1-analog.png'});
// ---- 2. mod mode LFO 1: the Resonanz knob (LFO 2 only) keeps moving
await p.evaluate(() => SYNQUENZER.modMode('lfo1'));
await p.waitForTimeout(200);
const s2 = await sample(45, vaS);
ok(rng(s2, 'res') > .03 && s2.every(x => x.resO === '1'), 'Mod-Modus LFO 1: Resonanz (LFO 2) bewegt sich weiter', {range: rng(s2, 'res'), cls: s2[0].resC});
await p.screenshot({path: OUT + 'ma1-modmodus.png'});
await p.evaluate(() => SYNQUENZER.modMode(null));
// ---- 3. stopped: the knobs stay calm (envelope 0); LFO free-running as before
await p.evaluate(() => SYNQUENZER.stop());
// ---- 4. mk plate: PATCH 1 LFO 1 → CUTOFF, PATCH 2 EG 1 → PAN
const mkInfo = await p.evaluate(() => {
  const A = SYNQUENZER; A.setEngine(0, 'mk');
  for (const [k, v] of [['t.0.p.0.s', 2], ['t.0.p.0.d', 4], ['t.0.p.0.i', 45], ['t.0.p.1.s', 0], ['t.0.p.1.d', 6], ['t.0.p.1.i', 55], ['t.0.e1.a', 0], ['t.0.e1.d', 55], ['t.0.e1.s', 0], ['t.0.e1.r', 20], ['t.0.p.2.i', 0], ['t.0.p.3.i', 0], ['t.0.l1.f', 70], ['t.0.f.cut', 62]]) A.mkSet(0, k, v);
  ED.tab = 'geraet'; safeRebuild(buildSynthEd); MKUI.P.mode = 'edit';
  try { MKUI.k1.jump('t.0.f.cut'); } catch (e) {}
  A.launchClip(0, 0); A.play();
  return {eng: sndOf(0).engine, p: sndOf(0).p.mk.t[0].p};
});
console.log('  mk', JSON.stringify(mkInfo));
await p.waitForTimeout(900);
const mkS = () => { const o = {}; const K = MKUI.PL.ui && MKUI.PL.ui.knob; for (const id of ['f.cut', 'a.pan']) { const m = K && K[id] && K[id].ma1; o[id] = m ? m.a : 'none'; o[id + 'R'] = m ? m.rk.length : 0; }
  const E = AU.synth[0]; o.nv = E && E.mks ? E.mks.voices.length : -1; return o; };
const s3 = await sample(60, mkS);
const nums = (a, k) => a.map(x => x[k]).filter(x => typeof x === 'number');
const rg = (a, k) => { const v = nums(a, k); return v.length ? Math.max(...v) - Math.min(...v) : 0; };
ok(s3.some(x => x['f.cutR'] > 0) && rg(s3, 'f.cut') > 5, 'Platte: CUTOFF-Bogen + Punkt bewegt sich (PATCH LFO 1)', {range: rg(s3, 'f.cut'), n: nums(s3, 'f.cut').length});
ok(s3.some(x => x['a.panR'] > 0) && rg(s3, 'a.pan') > 5, 'Platte: PAN-Punkt schlägt mit EG 1 je Note an', {range: rg(s3, 'a.pan')});
await p.waitForFunction(() => { const K = MKUI.PL.ui.knob; return K['f.cut'].ma1 && K['f.cut'].ma1.a != null && K['a.pan'].ma1 && K['a.pan'].ma1.a != null && Math.abs(K['a.pan'].ma1.a - (-135 + 270 * .5)) > 20; }, null, {timeout: 4000}).catch(() => {});
await p.screenshot({path: OUT + 'ma1-platte.png'});
await p.evaluate(() => SYNQUENZER.stop());
console.log(`MA1: ${N - F}/${N} grün` + (errs.length ? ' · errs ' + JSON.stringify(errs).slice(0, 400) : ' · keine Konsolenfehler'));
await b.close();
