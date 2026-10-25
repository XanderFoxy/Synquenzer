// QA (V2e): song-view label column + transport texts: does any text run past its box (base vs new), all viewports, song present and empty
import { open, NEW as APP, BASE as BASE0 } from './v3-qa-v2e2reg-pw.mjs';
const BASE = BASE0;
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2e2reg/';
const VPS = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180]};
const MEAS = () => { const out = [];
  const els = [...document.querySelectorAll('#songView button, #songView .sv-l, #songView .sv-l *, #rangeBar button, #rangeBar button *')].filter(x => x.offsetWidth && getComputedStyle(x).visibility === 'visible');
  for (const x of els) {
    // text overflow of the element itself
    if (x.scrollWidth > x.clientWidth + 1 && x.clientWidth > 0) out.push('over ' + (x.className || x.tagName) + ' "' + x.textContent.trim().slice(0, 22) + '" ' + x.scrollWidth + '/' + x.clientWidth);
    // a child text box running out of its button / label box
    const par = x.closest('button, .sv-l'); if (par && par !== x) { const a = x.getBoundingClientRect(), c = par.getBoundingClientRect(); if (a.right > c.right + 1 || a.left < c.left - 1 || a.bottom > c.bottom + 1 || a.top < c.top - 1) out.push('out ' + (x.className || x.tagName) + ' "' + x.textContent.trim().slice(0, 22) + '" in "' + par.textContent.trim().slice(0, 16) + '" ' + [a.left, a.right, a.top, a.bottom].map(Math.round) + ' vs ' + [c.left, c.right, c.top, c.bottom].map(Math.round)); }
  }
  return [...new Set(out)]; };
for (const vp of Object.keys(VPS)) for (const st of ['song', 'empty']) {
  const res = {};
  for (const [name, file] of [['base', BASE], ['new', APP]]) {
    const [w, h] = VPS[vp];
    const {b, p, errs} = await open({width: w, height: h}, file, true);
    await p.evaluate(async st => { const Q = window.SYNQUENZER; if (st === 'song') { await Q.loadDemo(); Q.setBpm(240); Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); } else { Q.newProject({init: true}); } Q.songView(true); }, st);
    await p.waitForTimeout(600);
    res[name] = await p.evaluate(MEAS);
    if (name === 'new') await p.screenshot({path: D + `t4-${vp}-${st}.png`});
    res[name + 'E'] = errs.slice();
    await b.close();
  }
  const nw = res.new.filter(x => !res.base.includes(x));
  console.log('==', vp, st, 'new-only:', JSON.stringify(nw), '| base:', JSON.stringify(res.base), 'errs', JSON.stringify(res.newE));
}
