// QA regression (V2d′): take banner in the song view, ● SONG button label, and the clip-view top-bar banner (K2-63) for the
// longest texts (all targets, NOTEN on Synth 2, every mode) in P1 P2 P3 L1 L2 W; base only 'over' (V0c). Fit / overlap / off-screen.
import { open, APP } from './v3-v2d-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/V2c′-fix.html';
const VPS = [['P1', 390, 844], ['P2', 375, 667], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375], ['W', 844, 1180]];
const setup = () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120); const K = {root: 9, scale: 'aeolian'}, N = (t, n, d) => ({t, d: d || .4, n, v: .8});
  Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 57), N(2, 64)]}); Q.setClip(0, 1, {len: 2, key: K, notes: [N(0, 53), N(4, 55)]});
  Q.setClip(1, 0, {len: 1, key: K, notes: [N(0, 69, 1.5)]}); Q.setClip(1, 1, {len: 1, key: K, notes: [N(.5, 76, .3)]});
  Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}]});
  Q.songFromChain([{scene: 0, bars: 4}, {scene: 1, bars: 4}, {scene: 0, bars: 4}]); Q.selectTrack(1); Q.songView(true); return 1; };
const meas = () => {
  const vw = innerWidth, vh = innerHeight, o = {};
  const fit = e => { if (!e || e.hidden || !e.offsetParent) return null; const r = e.getBoundingClientRect(); const kids = [...e.querySelectorAll('*')].filter(k => k.scrollWidth > k.clientWidth + 1 && getComputedStyle(k).display !== 'inline'); return {t: e.textContent, x: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height), over: e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 2, kids: kids.map(k => k.tagName + ':' + k.textContent), off: r.left < -1 || r.right > vw + 1 || r.top < -1 || r.bottom > vh + 1}; };
  o.ban = fit(SV.ban); o.btn = fit(SV.btn.bRec);
  return o;
};
const measTop = () => {
  const b = UI.recBan; if (!b || b.hidden) return null; const r = b.getBoundingClientRect();
  const kids = [...b.children].map(k => ({t: k.textContent, over: k.scrollWidth > k.clientWidth + 1}));
  const hits = [...document.querySelectorAll('#top button, #top .chip')].filter(x => x !== b && x.offsetParent && getComputedStyle(x).visibility === 'visible').filter(x => { const q = x.getBoundingClientRect(); const ix = Math.min(q.right, r.right) - Math.max(q.left, r.left), iy = Math.min(q.bottom, r.bottom) - Math.max(q.top, r.top); return ix > 2 && iy > 2; }).map(x => x.id || x.className);
  return {t: b.textContent, x: Math.round(r.left), w: Math.round(r.width), over: b.scrollWidth > b.clientWidth + 1, kids, covers: hits, right: Math.round(r.right), vw: innerWidth};
};
const out = [];
for (const [name, file] of [['base', BASE], ['new', APP]]) for (const [id, w, h] of VPS) {
  const {b, p, errs} = await open({width: w, height: h}, file, true);
  for (const [mode, from, to] of [['over', 3, null], ['insert', 3, null], ['replace', 3, 6], ['overdub', 3, 6], ['over', 10, null], ['replace', 9, 11]]) {
    if (name === 'base' && mode !== 'over' && mode !== 'replace') continue;
    await p.evaluate(setup); await p.waitForTimeout(150);
    const ok = await p.evaluate(([mode, from, to]) => { const Q = window.SYNQUENZER; const tg = {clips: true, chords: true, notes: true, mel: true};
      if (to != null) return Q.songRecRange ? Q.songRecRange(from, to - 1, mode, tg, {track: 1, preroll: false}) : Q.songRecFrom({from, to, targets: tg, preroll: false});
      return Q.songRecFrom({from, mode, targets: tg, track: 1, preroll: false}); }, [mode, from, to]);
    await p.waitForTimeout(700);
    const m = await p.evaluate(meas);
    await p.evaluate(() => window.SYNQUENZER.songView(false)); await p.waitForTimeout(400);
    const t = await p.evaluate(measTop);
    await p.evaluate(() => window.SYNQUENZER.songView(true)); await p.waitForTimeout(200);
    out.push({name, id, mode, from, to, ok, m, t});
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.stop(); }); await p.waitForTimeout(300);
    if (name === 'new' && mode === 'over' && from === 3) await p.screenshot({path: `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2d2reg/ban-${id}.png`});
  }
  out.push({name, id, errs: errs.slice()});
  await b.close();
}
for (const o of out) {
  if (o.errs) { if (o.errs.length) console.log(o.name, o.id, 'ERRS', o.errs); continue; }
  const bad = [];
  if (o.m.ban && (o.m.ban.over || o.m.ban.off || o.m.ban.kids.length)) bad.push('BAN');
  if (o.m.btn && (o.m.btn.over || o.m.btn.off || o.m.btn.kids.length)) bad.push('BTN');
  if (o.t && (o.t.over || o.t.kids.some(k => k.over) || o.t.covers.length || o.t.right > o.t.vw)) bad.push('TOP');
  console.log(o.name, o.id, o.mode, o.from, o.to, 'ok=' + o.ok, bad.length ? 'BAD ' + bad.join(',') : 'fit', '| ban:', o.m.ban && o.m.ban.t, o.m.ban && o.m.ban.w, '| btn:', o.m.btn && o.m.btn.t, o.m.btn && JSON.stringify(o.m.btn.kids), '| top:', o.t && o.t.t, o.t && o.t.w, o.t && JSON.stringify(o.t.kids.filter(k => k.over)), o.t && JSON.stringify(o.t.covers));
}
