// QA regression VS2: core flows WITH 🎤 on (fake mic), base V2d-fix (VS1 mic) vs new.
// bleed=1: the app's own output reaches the mic (phone speaker, like VS1 route 'speaker'), 0: silence (headphones)
import { chromium } from 'playwright';
import { INIT, EXE } from './v3-vs2-h.mjs';
const SCR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const FILES = {base: SCR + 'synq-snapshots/V2d-fix.html', new: SCR + 'dirigent-wt/index.html'};
const BLEED = () => {
  const oc = AudioNode.prototype.connect; window.__toDest = [];
  AudioNode.prototype.connect = function (d, ...a) { if (d && d instanceof AudioDestinationNode) window.__toDest.push(this); return oc.call(this, d, ...a); };
  window.__bleed = (gain) => { const F = window.__fake, ctx = window.__ctx; const g = ctx.createGain(); g.gain.value = gain; const dl = ctx.createDelay(0.1); dl.delayTime.value = 0.012; g.connect(dl); oc.call(dl, F.bus); for (const n of window.__toDest) { try { oc.call(n, g); } catch (e) {} } return window.__toDest.length; };
};
const which = process.argv[2] || 'all';
const route = process.argv[3] || 'speaker';
const bleeds = (process.argv[4] || '0,1').split(',').map(Number);
const out = {};
for (const name of (process.argv[6] || 'base,new').split(',')) for (const bleed of bleeds) {
  const br = await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await br.newContext({viewport: {width: 390, height: 844}}); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(INIT); await p.addInitScript(BLEED);
  await p.goto('file://' + FILES[name]); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version); await p.waitForTimeout(500);
  await p.evaluate(r => { const Q = SYNQUENZER; Q.play(); Q.stop(); return Q.stimmeStart({route: r, cal: false}); }, route);
  await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live', null, {timeout: 10000}).catch(() => {});
  await p.waitForTimeout(800);
  const st0 = await p.evaluate(() => { const s = SYNQUENZER.stimme(); return {on: s.on, phase: s.phase, route: s.route}; });
  if (bleed) await p.evaluate(g => window.__bleed(g), +(process.argv[5] || 0.5));
  const r = {st0};
  const wb = (b, to = 40000) => p.waitForFunction(x => SYNQUENZER.runtime().beat > x, b, {timeout: to, polling: 10});
  // setup: synth clip + drums, scene 1 running, select empty slot on track 2 (Synth 3)
  await p.evaluate((NOSYN) => { const Q = SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120); const K = {root: 9, scale: 'aeolian'};
    Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 1, d: .1, n: 42, v: .7}, {t: 2, d: .1, n: 38, v: .9}, {t: 3, d: .1, n: 42, v: .7}]});
    if (!NOSYN) Q.setClip(1, 0, {len: 1, key: K, notes: [{t: 0, d: 1.5, n: 57, v: .7}]});
    Q.selectSlot(2, 0); Q.clearLog(); Q.launchScene(0); }, process.argv[7] === 'nosynth');
  // FANG with keys
  await wb(3.8); const ns = [72, 74, 76, 79, 76, 74, 72, 71];
  for (let k = 0; k < 8; k++) { await wb(4 + k - .03); await p.evaluate(n => SYNQUENZER.tap(n, 300), ns[k]); }
  await wb(12.6);
  r.fangBefore = await p.evaluate(() => { const b = document.getElementById('bFang'); return {mode: SYNQUENZER.runtime().fangMode, label: b.textContent, vs: SYNQUENZER.vsInfo ? (({lit, litN, voiceRecent}) => ({lit, litN, voiceRecent}))(SYNQUENZER.vsInfo()) : null}; });
  await p.evaluate(() => document.getElementById('bFang').click());
  await p.waitForTimeout(2500);
  r.fang = await p.evaluate(() => { const Q = SYNQUENZER, P = Q.project(); const c = Q.getClip(2, 0); const mel = P.tracks.map((t, i) => [i, t.kind, t.name, (t.clips || []).map((c, s) => c ? s + ':' + c.notes.length : null).filter(Boolean).join(' ')]).filter(x => x[3]); return {clip2: c && c.notes.map(n => n.n).join(','), tracks: mel, pop: [...document.querySelectorAll('.pop')].filter(x => x.offsetParent).map(x => x.className)}; });
  await p.evaluate(() => { try { SYNQUENZER.vsResultDrop && SYNQUENZER.vsResultDrop(); } catch (e) {} });
  // ● REC keys on track 3, 1 bar, no count-in
  await p.evaluate(() => { const Q = SYNQUENZER; Q.setRecOptions({countIn: 0, length: 1, quantize: '1/16'}); Q.selectSlot(3, 0); Q.rec(); });
  await p.waitForFunction(() => /rec/.test(SYNQUENZER.runtime().rec.state), null, {timeout: 10000}).catch(() => {});
  const rs = await p.evaluate(() => SYNQUENZER.runtime().rec);
  const b0 = rs.startBeat != null ? rs.startBeat : Math.ceil(await p.evaluate(() => SYNQUENZER.runtime().beat));
  for (let k = 0; k < 4; k++) { await wb(b0 + k - .02); await p.evaluate(n => SYNQUENZER.tap(n, 200), 60 + 2 * k); }
  await wb(b0 + 8); await p.waitForTimeout(2500);
  r.rec = await p.evaluate(() => { const Q = SYNQUENZER, P = Q.project(); const c = Q.getClip(3, 0); return {clip3: c && c.notes.map(n => n.n).join(','), state: Q.runtime().rec.state, tracks: P.tracks.map((t, i) => [i, t.kind, (t.clips || []).map((c, s) => c ? s + ':' + c.notes.length : null).filter(Boolean).join(' ')]).filter(x => x[2]), pop: [...document.querySelectorAll('.pop')].filter(x => x.offsetParent).map(x => x.className), toast: (document.querySelector('#toast') || {}).textContent || '', undo: Q.undoInfo ? JSON.stringify(Q.undoInfo()).slice(0, 200) : null, dbg: (() => { const A = VS.res && VS.res.A; if (!A) return null; const sg = VSD.segment(A.tr, {snap: false, tuning: 'auto', attack: A.inst}); const lat = F => stLatAt(F) * A.sr / 1000;
  return {bleedN: A.bleedN, notes: sg.notes.map(n => [n.t0.toFixed(3), n.t1.toFixed(3), n.m, n.by, vsBleedNote(A.x, A.d0, A.fs, A.sr, lat, n, vsBleedPow()), vsBleedNote(A.x, A.d0, A.fs, A.sr, lat, n, 0, vsBleedPow(3)), A.beatOf(n.t0).toFixed(2)]), clip: VS.res.clip && VS.res.clip.notes.map(n => [n.t, n.n, n.d])}; })()}; });
  await p.evaluate(() => { try { SYNQUENZER.vsResultDrop && SYNQUENZER.vsResultDrop(); } catch (e) {} });
  // stop single clip, drums keep playing
  await p.evaluate(() => SYNQUENZER.tapSlot(1, 0)); const bS = await p.evaluate(() => SYNQUENZER.runtime().beat); await wb(Math.ceil((bS + .01) / 4) * 4 + 4.5);
  r.slots = await p.evaluate(() => SYNQUENZER.runtime().slots);
  r.drums = await p.evaluate(() => SYNQUENZER.noteLog(4000).filter(n => n.track === 4).length);
  r.te = await p.evaluate(() => SYNQUENZER.tickErrors());
  r.errs = errs.slice(0, 5);
  out[name + bleed] = r; await br.close();
}
for (const k of Object.keys(out)) console.log('==', k, JSON.stringify(out[k], null, 0));
