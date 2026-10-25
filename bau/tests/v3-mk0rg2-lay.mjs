// QA regression MK0: layout in P1 P2 P3 L1 L2 W for many states; base vs new: screenshots + visible-element rects,
// overflow (page scroll width, elements outside the viewport, clipped button labels), overlapping buttons.
// usage: node v3-mk0rg2-lay.mjs base|new
import { open, launch, NEW, BASE, OUT, VP } from './v3-mk0rg2-lib.mjs';
import fs from 'fs';
const [which] = process.argv.slice(2);
const br = await launch();
const res = {};
const STATES = {
  main: async p => {},
  transpose: async p => p.evaluate(() => window.SYNQUENZER.setKbMode('transpose')),
  playing: async p => { await p.evaluate(() => { window.SYNQUENZER.launchScene(0); }); await p.waitForTimeout(600); await p.evaluate(() => window.SYNQUENZER.stop()); },
  song: async p => p.evaluate(() => window.SYNQUENZER.songView && window.SYNQUENZER.songView(true)),
  edVA: async p => p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectSlot(0, 0); Q.openEditor(); }),
  edFM: async p => p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectSlot(1, 0); Q.openEditor(); }),
  edDrum: async p => p.evaluate(() => { const Q = window.SYNQUENZER; Q.selectSlot(4, 0); Q.openEditor(); }),
  browser: async p => p.evaluate(() => window.SYNQUENZER.openBrowser(0)),
  clipSheet: async p => p.evaluate(() => window.SYNQUENZER.openClipSheet(0, 0)),
  roll: async p => p.evaluate(() => window.SYNQUENZER.openRoll(1, 0)),
  menu: async p => p.evaluate(() => window.SYNQUENZER.openMenu()),
  help: async p => { await p.evaluate(() => window.SYNQUENZER.openMenu()); await p.waitForTimeout(300); await p.evaluate(() => { const b = [...document.querySelectorAll('#menu button')].find(x => x.offsetParent && /^Hilfe/.test(x.textContent.trim())); if (b) b.click(); }); },
  projects: async p => { await p.evaluate(() => window.SYNQUENZER.openMenu()); await p.waitForTimeout(300); await p.evaluate(() => { const b = [...document.querySelectorAll('#menu button')].find(x => x.offsetParent && /^Projekte/.test(x.textContent.trim())); if (b) b.click(); }); },
};
const probe = p => p.evaluate(() => {
  const iw = innerWidth, ih = innerHeight, out = {sw: document.documentElement.scrollWidth, bw: document.body.scrollWidth, iw, ih, outside: [], clipped: [], overlap: [], rects: []};
  const els = [...document.querySelectorAll('button, .slot, .scn, .knob, .th, .stp, input, select, .brow, h4, .lcd, #kb')].filter(e => e.offsetParent && getComputedStyle(e).visibility !== 'hidden' && +getComputedStyle(e).opacity > 0.05);
  const name = e => (e.id ? '#' + e.id : e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0]) + ':' + (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 14);
  const btns = [];
  for (const e of els) { const q = e.getBoundingClientRect(); if (q.width < 1 || q.height < 1) continue;
    // fully clipped by a scrolling ancestor is fine; only check against the viewport for elements not inside a scroller
    let sc = e.parentElement, inScroll = false; while (sc && sc !== document.body) { const cs = getComputedStyle(sc); if (/(auto|scroll|hidden)/.test(cs.overflowX + cs.overflowY)) { inScroll = true; break; } sc = sc.parentElement; }
    if (!inScroll && (q.right > iw + 1 || q.left < -1 || q.bottom > ih + 1)) out.outside.push(name(e) + ' ' + [q.left, q.top, q.right, q.bottom].map(Math.round).join(','));
    if (e.tagName === 'BUTTON' && e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== 'visible') out.clipped.push(name(e));
    out.rects.push(name(e) + '@' + [q.left, q.top, q.width, q.height].map(Math.round).join(','));
    if (e.tagName === 'BUTTON') btns.push([e, q]); }
  for (let i = 0; i < btns.length; i++) for (let j = i + 1; j < btns.length; j++) { const [a, A] = btns[i], [b, B] = btns[j]; if (a.contains(b) || b.contains(a)) continue;
    const ix = Math.min(A.right, B.right) - Math.max(A.left, B.left), iy = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
    if (ix > 2 && iy > 2) { const t = document.elementFromPoint((Math.max(A.left, B.left) + Math.min(A.right, B.right)) / 2, (Math.max(A.top, B.top) + Math.min(A.bottom, B.bottom)) / 2); out.overlap.push(name(a) + ' x ' + name(b)); } }
  out.overlap = out.overlap.slice(0, 30); return out; });
for (const vp of Object.keys(VP)) {
  for (const st of Object.keys(STATES)) {
    const {p, errs, close} = await open(which === 'base' ? BASE : NEW, vp, vp !== 'W', br);
    try {
      await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.stop(); });
      await p.waitForTimeout(400);
      await STATES[st](p); await p.waitForTimeout(700);
      await p.screenshot({path: OUT + `lay-${which}-${vp}-${st}.png`});
      res[vp + '-' + st] = Object.assign(await probe(p), {errs: errs.slice()});
    } catch (e) { res[vp + '-' + st] = {FAIL: String(e).slice(0, 300)}; }
    await close();
  }
  console.log(which, vp, 'done');
}
await br.close();
fs.writeFileSync(OUT + `lay-${which}.json`, JSON.stringify(res, null, 1));
