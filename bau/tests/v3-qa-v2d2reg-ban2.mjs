// QA (V2d′): banner text visible width vs needed, for common target combos; ● SONG button label vs its button; screenshots
import { open, APP } from './v3-v2d-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/V2c′-fix.html';
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2d2reg/';
const VPS = [['P1', 390, 844], ['P2', 375, 667], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375], ['W', 844, 1180]];
const setup = () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120); const K = {root: 9, scale: 'aeolian'}, N = (t, n, d) => ({t, d: d || .4, n, v: .8});
  Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 57), N(2, 64)]}); Q.setClip(0, 1, {len: 2, key: K, notes: [N(0, 53), N(4, 55)]});
  Q.setClip(1, 0, {len: 1, key: K, notes: [N(0, 69, 1.5)]}); Q.setClip(1, 1, {len: 1, key: K, notes: [N(.5, 76, .3)]});
  Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}]});
  Q.songFromChain([{scene: 0, bars: 4}, {scene: 1, bars: 4}, {scene: 0, bars: 4}]); Q.selectTrack(1); Q.songView(true); return 1; };
const meas = () => { const e = SV.ban; if (!e || e.hidden) return null; const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
  const need = e.scrollWidth, have = e.clientWidth; const b = SV.btn.bRec, br = b.getBoundingClientRect(), t = b.lastChild, tr = t.getBoundingClientRect();
  return {txt: e.textContent, have, need, cut: need > have + 1, btn: {t: t.textContent, bw: Math.round(br.width), tw: Math.round(tr.width), tl: Math.round(tr.left - br.left), tr: Math.round(br.right - tr.right), sw: b.scrollWidth, cw: b.clientWidth, ov: getComputedStyle(b).overflow}}; };
const combos = [['C', {clips: true, chords: false, notes: false}], ['A', {clips: false, chords: true, notes: false}], ['AN', {clips: false, chords: true, notes: true}], ['CA', {clips: true, chords: true, notes: false}], ['CAN', {clips: true, chords: true, notes: true}]];
for (const [name, file] of [['base', BASE], ['new', APP]]) for (const [id, w, h] of VPS) {
  const {b, p, errs} = await open({width: w, height: h}, file, true);
  const line = [];
  for (const [cn, tg] of combos) for (const [mode, from, to] of [['over', 3, null], ['insert', 3, null], ['replace', 3, 6]]) {
    if (name === 'base' && mode === 'insert') continue;
    await p.evaluate(setup); await p.waitForTimeout(100);
    await p.evaluate(([mode, from, to, tg]) => { const Q = window.SYNQUENZER; const t = Object.assign({mel: tg.notes}, tg);
      if (to != null) return Q.songRecRange ? Q.songRecRange(from, to - 1, mode, t, {track: 1, preroll: false}) : Q.songRecFrom({from, to, targets: t, preroll: false});
      return Q.songRecFrom({from, mode, targets: t, track: 1, preroll: false}); }, [mode, from, to, tg]);
    await p.waitForTimeout(500);
    const m = await p.evaluate(meas);
    if (name === 'new' && cn === 'CAN' && mode === 'over') await p.screenshot({path: D + `ban2-${id}.png`});
    if (name === 'new' && cn === 'AN' && mode === 'over') await p.screenshot({path: D + `ban2-${id}-AN.png`});
    if (name === 'base' && cn === 'CAN' && mode === 'over') await p.screenshot({path: D + `ban2-base-${id}.png`});
    line.push(`${cn}/${mode}: ${m ? (m.cut ? 'CUT ' + m.need + '>' + m.have : 'ok') + ' "' + m.txt + '" btn[' + m.btn.t + ' t' + m.btn.tw + '/b' + m.btn.bw + (m.btn.tl < 0 || m.btn.tr < 0 ? ' SPILL' : '') + ']' : 'none'}`);
    await p.evaluate(() => window.SYNQUENZER.stop()); await p.waitForTimeout(200);
  }
  console.log('==', name, id, errs.length ? 'ERRS ' + errs : ''); for (const l of line) console.log('  ', l);
  await b.close();
}
