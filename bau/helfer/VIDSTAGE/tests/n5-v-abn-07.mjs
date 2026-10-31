// VV1-07 + typical defects A1/A4/A5: the sheet in P1 P2 P3 L1 L2 926×428 – touch targets via elementFromPoint, clipping with the real fonts, no layout jump (idle / busy / done / preview), cancel by tap
import { open, SONG8, OUT } from './n5-v-abn-lib.mjs';
import fs from 'fs';
const tag = process.argv[2] || 'r1';
const sizes = (process.argv[3] || 'P1,P2,P3,L1,L2,W').split(',');
const SZ = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [926, 428]};
const meas = p => p.evaluate(() => {
  const sh = document.getElementById('vvSheet'), bad = [], small = [], hits = [];
  const vis = e => { if (!e.getClientRects().length) return false; const cs = getComputedStyle(e); return cs.visibility !== 'hidden' && cs.display !== 'none' && !e.closest('[hidden]'); };
  const btns = [...document.querySelectorAll('#vvSheet button')].filter(vis);
  for (const e of btns) {
    const q = e.getBoundingClientRect(), nm = (e.getAttribute('aria-label') || e.textContent).trim().slice(0, 20);
    if (q.width < 44 - .5 || q.height < 44 - .5) small.push(nm + ' ' + q.width.toFixed(1) + 'x' + q.height.toFixed(1));
    // hit points: centre and the corners of the 44 × 44 box around the centre
    const cx = q.left + q.width / 2, cy = q.top + q.height / 2;
    for (const [x, y] of [[cx, cy], [cx - 21, cy - 21], [cx + 21, cy - 21], [cx - 21, cy + 21], [cx + 21, cy + 21]]) { const h = document.elementFromPoint(x, y); if (!h || (h !== e && !e.contains(h))) hits.push(nm + ' @' + Math.round(x - cx) + ',' + Math.round(y - cy) + ' → ' + (h ? h.tagName + '.' + h.className : 'null')); }
    if (q.right > innerWidth + .5 || q.bottom > innerHeight + .5 || q.left < -.5 || q.top < -.5) bad.push('out:' + nm);
  }
  for (const e of [...sh.querySelectorAll('*')].filter(vis)) {
    if (e.tagName === 'CANVAS' || e.tagName === 'I') continue;
    const own = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (own && e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0) bad.push('clipX:' + e.className + ':' + e.textContent.slice(0, 40) + ' ' + e.scrollWidth + '>' + e.clientWidth);
    const cs = getComputedStyle(e); if (cs.overflow !== 'visible' && e.scrollHeight > e.clientHeight + 1 && e.clientHeight > 0 && !e.classList.contains('vvctl') && !e.classList.contains('vvstage')) bad.push('clipY:' + e.className + ':' + e.textContent.slice(0, 40) + ' ' + e.scrollHeight + '>' + e.clientHeight);
    const q = e.getBoundingClientRect(); if (q.width && (q.right > innerWidth + .5 || q.bottom > innerHeight + .5)) bad.push('out:' + e.className + ':' + e.textContent.slice(0, 30));
  }
  const ctl = sh.querySelector('.vvctl'); if (ctl.scrollHeight > ctl.clientHeight + 1) bad.push('ctl scrolls ' + ctl.scrollHeight + '>' + ctl.clientHeight);
  const geo = {}; for (const s of ['.vvh', '.vvstage', '.vvcv', '.vvctl', '.vvway', '.vvdone']) { const e = sh.querySelector(s); const q = e.getBoundingClientRect(); geo[s] = [q.left, q.top, q.width, q.height].map(Math.round).join(','); }
  [...sh.querySelectorAll('.vvrow')].forEach((e, k) => { const q = e.getBoundingClientRect(); geo['row' + k] = [q.left, q.top, q.width, q.height].map(Math.round).join(','); });
  const act = [...sh.querySelectorAll('.vvacts,.vvprog')].find(vis); const qa = act.getBoundingClientRect(); geo.act = [qa.left, qa.top, qa.width, qa.height].map(Math.round).join(',');
  const texts = [...sh.querySelectorAll('button,span,b,.vvway>*')].filter(vis).map(e => e.textContent.trim()).filter(Boolean);
  return {small, bad, hits, doc: document.documentElement.scrollHeight <= innerHeight && document.documentElement.scrollWidth <= innerWidth, geo, texts};
});
const res = {};
for (const n of sizes) {
  const [w, h] = SZ[n];
  const {b, p, errs} = await open({w, h, touch: true, dpr: 2});
  // a 3-min song so that the busy state lasts; a selection for the "done" run
  await p.evaluate(() => {
    const bars = 84, lanes = [[], [], [], [], [], []], marks = [];
    for (let k = 0; k < bars; k += 8) { lanes[0].push({bar: k, slot: 0}); lanes[1].push({bar: k, slot: (k / 8) % 2}); lanes[4].push({bar: k, slot: 0}, {bar: k + 4, slot: 1}); marks.push({id: 'm' + k, a: k, len: Math.min(8, bars - k), name: k % 16 ? 'Refrain' : 'Strophe'}); }
    SYNQUENZER.setSong({bars, lanes, carrier: [], mel: {}, marks}); SYNQUENZER.vvTest({opus: true}); SYNQUENZER.openMenu();
  });
  await p.waitForTimeout(300);
  const mb = await p.$('#menu button[aria-label="Video des Songs erstellen"]'); await mb.scrollIntoViewIfNeeded();
  const mbq = await mb.boundingBox();
  await mb.tap(); await p.waitForTimeout(600);
  const r = {menuBtn: [Math.round(mbq.width), Math.round(mbq.height)]};
  r.idle = await meas(p);
  // busy: tap Video erstellen, measure, then cancel by tap and time it
  await p.tap('.vvacts .go');
  await p.waitForFunction(() => document.getElementById('vvSheet').classList.contains('busy'), null, {timeout: 5000});
  await p.waitForTimeout(2500);
  r.busy = await meas(p);
  await p.screenshot({path: OUT + tag + '-07-' + n + '-busy.png'});
  const tc = Date.now(); await p.tap('.vvprog .vvbtn');
  await p.waitForFunction(() => !document.getElementById('vvSheet').classList.contains('busy'), null, {timeout: 5000}).catch(() => {});
  r.cancelMs = Date.now() - tc;
  r.afterCancel = await p.evaluate(() => ({busy: VV.busy, off: !!VV.off, uiOff: !!UI.vvOff, timer: !!AU.timer, ctx: AU.ctx && AU.ctx.constructor.name, toast: EL.toast ? EL.toast.textContent : ''}));
  // done: a short selection (bar 1)
  await p.evaluate(() => { SYNQUENZER.songSelect(0, 0); SYNQUENZER.vvPrefs({}); });
  await p.waitForTimeout(200);
  r.selText = await p.evaluate(() => document.querySelector('#vvSheet .vvrow.txt .vvtxt').textContent);
  await p.tap('.vvacts .go');
  await p.waitForFunction(() => !SYNQUENZER.vvInfo().busy && SYNQUENZER.vvInfo().res, null, {timeout: 120000});
  await p.waitForTimeout(400);
  r.done = await meas(p);
  await p.screenshot({path: OUT + tag + '-07-' + n + '-done.png'});
  // preview
  await p.tap('.vvacts .vvbtn:not(.go)'); await p.waitForTimeout(800);
  r.prev = await meas(p); r.prevState = await p.evaluate(() => ({prev: SYNQUENZER.vvInfo().prev, playing: R.playing}));
  await p.tap('.vvacts .vvbtn:not(.go)'); await p.waitForTimeout(300);
  r.prevStopped = await p.evaluate(() => ({prev: SYNQUENZER.vvInfo().prev, playing: R.playing}));
  // format switch 16:9 while open: controls stay where they are
  await p.tap('#vvSheet .vvseg button:nth-child(2)'); await p.waitForTimeout(300);
  r.f169 = await meas(p); await p.screenshot({path: OUT + tag + '-07-' + n + '-169.png'});
  await p.tap('#vvSheet .vvseg button:nth-child(1)'); await p.waitForTimeout(200);
  const keys = Object.keys(r.idle.geo).filter(k => k !== '.vvcv');
  r.jump = ['busy', 'done', 'prev', 'f169'].map(s => [s, keys.filter(k => r.idle.geo[k] !== r[s].geo[k]).map(k => k + ' ' + r.idle.geo[k] + ' → ' + r[s].geo[k])]).filter(x => x[1].length);
  // close by ✕
  await p.tap('#vvSheet .sh-x'); await p.waitForTimeout(300);
  r.closed = await p.evaluate(() => ({open: VV.open, shown: getComputedStyle(document.getElementById('vvSheet')).display}));
  r.errs = errs;
  for (const s of ['idle', 'busy', 'done', 'prev', 'f169']) { const x = r[s]; r[s] = {small: x.small, bad: x.bad, hits: x.hits, doc: x.doc, texts: s === 'idle' || s === 'busy' || s === 'done' ? x.texts : undefined}; }
  res[n] = r; console.log(n, JSON.stringify(r));
  await b.close();
}
fs.writeFileSync(OUT + tag + '-07.json', JSON.stringify(res, null, 1));
