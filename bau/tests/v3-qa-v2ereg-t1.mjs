// QA regression (V2e): touch flow in the song view on a recorded song (no marks) — base V2d′-fix vs new V2e
// ruler tap selects, ▶ SONG starts at the selection, deselect, AKKORDE tap → chord, melody track pick, SCHLEIFE Song, undo
import { open, APP } from './v3-v2d-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/V2d′-fix.html';
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2ereg/';
const VPS = {P1: [390, 844], P3: [320, 568], L1: [844, 390], L2: [667, 375]};
const waitBeat = (p, b, to = 40000) => p.waitForFunction(x => window.SYNQUENZER.runtime().beat > x, b, {timeout: to, polling: 20});
const setup = () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'}, N = (t, n, d) => ({t, d: d || .4, n, v: .8});
  Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 57), N(1, 60), N(2, 64), N(3, 60)]}); Q.setClip(0, 1, {len: 1, key: K, notes: [N(0, 53), N(2, 55)]});
  Q.setClip(1, 0, {len: 1, key: K, notes: [N(0, 69, 1.5), N(2, 72, 1.5)]});
  Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 2, d: .1, n: 38, v: .9}]}); return 1; };
const res = {};
const only = process.argv[2] ? process.argv[2].split(',') : Object.keys(VPS);
for (const vp of only) for (const [name, file] of [['base', BASE], ['new', APP]]) {
  const [w, h] = VPS[vp];
  const {b, p, errs} = await open({width: w, height: h}, file, true);
  const cdp = await p.context().newCDPSession(p);
  const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, id: 1}]});
  const tap = async (x, y, wait = 250) => { await touch('touchStart', x, y); await p.waitForTimeout(40); await touch('touchEnd', x, y); await p.waitForTimeout(wait); };
  const rect = sel => p.evaluate(s => { const e = document.querySelector(s); if (!e || !e.offsetWidth) return null; const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height}; }, sel);
  const tapSel = async (sel, wait) => { const r = await rect(sel); if (!r) throw new Error('no ' + sel); await tap(r.x + r.width / 2 || r.x + r.w / 2, r.y + r.h / 2, wait); };
  const popBtn = async (pred) => { const r = await p.evaluate(src => { const f = eval(src); const pp = document.querySelector('#popLayer .pop'); if (!pp) return null; const bb = [...pp.querySelectorAll('button')].find(x => x.offsetWidth && f(x)); if (!bb) return null; const q = bb.getBoundingClientRect(); return {x: q.x + q.width / 2, y: q.y + q.height / 2, t: bb.textContent}; }, pred); return r; };
  const r = {};
  try {
    await p.evaluate(setup);
    // a WP6 take: scene 1, scene 2 at bar 3, stop; no marks
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.launchScene(0); Q.songRec(true); });
    await waitBeat(p, 6); await p.evaluate(() => window.SYNQUENZER.launchScene(1)); await waitBeat(p, 17);
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songRec(false); Q.stop(); });
    await p.waitForTimeout(400);
    await p.evaluate(() => window.SYNQUENZER.songView(true)); await p.waitForTimeout(400);
    r.song0 = await p.evaluate(() => { const s = window.SYNQUENZER.song(); return {bars: s.bars, marks: (s.marks || []).length, mt: s.melodyTrack}; });
    // geometry: canvas
    const cv = await rect('.sv-cv');
    const cw = await p.evaluate(() => window.SYNQUENZER.svLayoutInfo ? window.SYNQUENZER.svLayoutInfo().cellW : null) || 36;
    r.cellW = cw;
    // 1) ruler tap bar 2
    await tap(cv.x + cw * 1.5, cv.y + 8);
    r.sel1 = await p.evaluate(() => window.SYNQUENZER.songSelect());
    r.carrierVis1 = await p.evaluate(() => { const c = document.getElementById('carrier'); return !!(c && c.offsetWidth); });
    r.rangeVis1 = await p.evaluate(() => { const c = document.getElementById('rangeBar'); return !!(c && c.offsetWidth); });
    await p.screenshot({path: D + `t1-${name}-${vp}-sel.png`});
    // 2) transport ▶ SONG starts at the selection
    await tapSel('#songView .sv-play', 300);
    await p.waitForTimeout(500);
    r.play = await p.evaluate(() => { const rt = window.SYNQUENZER.runtime(); return {playing: rt.playing, songBeat: rt.song && rt.song.beat != null ? Math.floor(rt.song.beat / 4) : null}; });
    await tapSel('#songView .sv-play', 300);
    r.stopped = await p.evaluate(() => window.SYNQUENZER.runtime().playing);
    // 3) deselect
    await tap(cv.x + cw * 1.5, cv.y + 8);
    r.sel2 = await p.evaluate(() => window.SYNQUENZER.songSelect());
    r.carrierVis2 = await p.evaluate(() => { const c = document.getElementById('carrier'); return !!(c && c.offsetWidth); });
    // 4) AKKORDE row tap in bar 3 (empty spot) → chord pick → degree IV
    const lay = await p.evaluate(() => window.SYNQUENZER.svLayoutInfo ? window.SYNQUENZER.svLayoutInfo() : null);
    let akY;
    if (lay) { const i = lay.rows.indexOf('AKKORDE'); akY = cv.y + lay.rulerH + (i - 1) * lay.rowH + lay.rowH / 2; }
    else { const lc = await rect('#songView .sv-lc'); akY = lc.y + lc.h / 2; }
    await tap(cv.x + cw * 2.5, akY, 400);
    r.pop4 = await p.evaluate(() => { const pp = document.querySelector('#popLayer .pop'); return pp ? pp.className : null; });
    const d3 = await popBtn('x => x.dataset.d === "3"');
    r.d3 = d3 && d3.t;
    if (d3) await tap(d3.x, d3.y, 400);
    r.carrier = await p.evaluate(() => window.SYNQUENZER.song().carrier.map(c => c.beat + ':' + (c.target ? c.target.name : '-')));
    // close a possible toast/popup
    await p.evaluate(() => { const pp = document.querySelector('#popLayer .pop'); return !!pp; }).then(async x => { r.popAfterChord = x; });
    // 5) melody track → Synth 1
    if (name === 'base') await tapSel('#songView .sv-mt', 350);
    else { await tapSel('#songView .sv-lm', 350); const s = await popBtn('x => x.dataset.a === "mt"'); r.mtBtn = s && s.t; if (s) await tap(s.x, s.y, 350); }
    const t0 = await popBtn('x => x.dataset.t === "0"');
    r.t0 = t0 && t0.t;
    if (t0) await tap(t0.x, t0.y, 350);
    r.mt = await p.evaluate(() => window.SYNQUENZER.song().melodyTrack);
    await p.screenshot({path: D + `t1-${name}-${vp}-mt.png`});
    // 6) SCHLEIFE → Song
    await tapSel('#songView .sv-loop', 350);
    const ls = await popBtn('x => x.dataset.l === "song"');
    if (ls) await tap(ls.x, ls.y, 350);
    r.loop = await p.evaluate(() => window.SYNQUENZER.songLoopRange());
    r.loopLbl = await p.evaluate(() => document.querySelector('#songView .sv-loop').textContent);
    // 7) undo → loop off again
    await p.evaluate(() => window.SYNQUENZER.undo()); await p.waitForTimeout(200);
    r.loopU = await p.evaluate(() => window.SYNQUENZER.songLoopRange().on);
    await p.evaluate(() => window.SYNQUENZER.undo()); await p.waitForTimeout(200);
    r.mtU = await p.evaluate(() => window.SYNQUENZER.song().melodyTrack);
    await p.evaluate(() => window.SYNQUENZER.undo()); await p.waitForTimeout(200);
    r.carrierU = await p.evaluate(() => window.SYNQUENZER.song().carrier.length);
    // 8) play the song from the start with loop: no tick errors
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.clearLog(); Q.songPlay(0); }); await p.waitForTimeout(2500);
    r.te = await p.evaluate(() => window.SYNQUENZER.tickErrors());
  } catch (e) { r.fail = String(e).slice(0, 300); }
  r.errs = errs.slice();
  res[vp + name] = r;
  await b.close();
}
for (const vp of only) { const A = res[vp + 'base'], B = res[vp + 'new']; console.log('==', vp);
  for (const k of Object.keys(B)) { const s = JSON.stringify(A[k]) === JSON.stringify(B[k]); console.log('  ' + k, s ? 'same' : 'DIFF', JSON.stringify(B[k]), s ? '' : ' base ' + JSON.stringify(A[k])); } }
