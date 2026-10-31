// VV1-07: the sheet in P1, P2, P3, L1, L2, 926×428 – everything in view, ≥ 44 × 44, no layout jump (idle, busy, done)
import { open, SONG8 } from './n5-v-lib.mjs';
import fs from 'fs';
const sizes = [[390, 844, 'P1'], [375, 667, 'P2'], [320, 568, 'P3'], [844, 390, 'L1'], [667, 375, 'L2'], [926, 428, 'W']];
const res = {};
const meas = p => p.evaluate(() => {
  const sh = document.getElementById('vvSheet'), bad = [], small = [];
  for (const e of sh.querySelectorAll('button')) { if (e.offsetParent === null || getComputedStyle(e).visibility === 'hidden') continue; const q = e.getBoundingClientRect(); if (q.width < 44 - .5 || q.height < 44 - .5) small.push(e.textContent + ' ' + q.width.toFixed(0) + 'x' + q.height.toFixed(0)); if (q.right > innerWidth + .5 || q.bottom > innerHeight + .5 || q.left < -.5 || q.top < -.5) bad.push('out:' + e.textContent); }
  for (const e of sh.querySelectorAll('button,span,b,.vvway>*')) { if (e.offsetParent === null) continue; if (e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0) bad.push('clip:' + e.textContent.slice(0, 40)); const q = e.getBoundingClientRect(); if (q.width && (q.right > innerWidth + .5 || q.bottom > innerHeight + .5)) bad.push('out:' + e.textContent.slice(0, 30)); }
  const ctl = sh.querySelector('.vvctl'); if (ctl.scrollHeight > ctl.clientHeight + 1) bad.push('ctl scrolls ' + ctl.scrollHeight + '>' + ctl.clientHeight);
  const act = [...sh.querySelectorAll('.vvacts,.vvprog')].find(e => e.offsetParent !== null);
  const geo = [...sh.querySelectorAll('.vvrow,.vvdone,.vvway,.vvstage,canvas'), act].map(e => { const q = e.getBoundingClientRect(); return [Math.round(q.left), Math.round(q.top), Math.round(q.width), Math.round(q.height)]; });
  return {small, bad, doc: document.documentElement.scrollHeight === innerHeight && document.body.scrollHeight <= innerHeight, geo: JSON.stringify(geo)};
});
for (const [w, h, n] of sizes) {
  const {b, p, errs} = await open({w, h, touch: true, dpr: 2});
  const FD = 'file:///tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/fonts/';
  const ff = [['Barlow Semi Condensed', 'barlow-semi-condensed', [500, 600, 700]], ['JetBrains Mono', 'jetbrains-mono', [500, 700]]];
  await p.addStyleTag({content: ff.map(([fam, file, ws]) => ws.map(wt => `@font-face{font-family:"${fam}";font-style:normal;font-weight:${wt};src:url(${FD}${file}-latin-${wt}-normal.woff2) format("woff2")}`).join('')).join('')});
  const fontOk = await p.evaluate(async () => { await Promise.all(['500 12px "Barlow Semi Condensed"', '700 12px "Barlow Semi Condensed"', '700 12px "JetBrains Mono"'].map(s => document.fonts.load(s))); await document.fonts.ready; return document.fonts.check('700 12px "Barlow Semi Condensed"'); });
  await p.evaluate(s => { SYNQUENZER.setSong(s); SYNQUENZER.songSelect(0, 1); SYNQUENZER.vvTest({opus: true}); SYNQUENZER.openMenu(); }, SONG8);
  await p.waitForTimeout(300);
  const btn = await p.$('#menu button[aria-label="Video des Songs erstellen"]'); await btn.scrollIntoViewIfNeeded(); await btn.tap(); await p.waitForTimeout(500);
  const idle = await meas(p);
  await p.tap('.vvacts .go');
  await p.waitForFunction(() => document.getElementById('vvSheet').classList.contains('busy'), null, {timeout: 5000}).catch(async e => { console.log('nobusy', await p.evaluate(() => [EL.toast.textContent, document.querySelector('.vvacts .go').disabled, JSON.stringify(SYNQUENZER.vvInfo())])); await p.screenshot({path: 'n5-v-out/a7-dbg.png'}); throw e; });
  await p.waitForTimeout(400);
  const busy = await meas(p); await p.screenshot({path: 'n5-v-out/a7-' + n + '-busy.png'});
  await p.waitForFunction(() => !SYNQUENZER.vvInfo().busy, null, {timeout: 120000}); await p.waitForTimeout(400);
  const done = await meas(p); await p.screenshot({path: 'n5-v-out/a7-' + n + '-done.png'});
  // ▶ Vorschau: plays, the picture moves, ■ stops
  await p.tap('.vvacts .vvbtn:not(.go)'); await p.waitForTimeout(1200);
  const pv = await p.evaluate(() => ({prev: SYNQUENZER.vvInfo().prev, playing: R.playing, song: !!R.songPlay}));
  await p.screenshot({path: 'n5-v-out/a7-' + n + '-prev.png'});
  await p.tap('.vvacts .vvbtn:not(.go)'); await p.waitForTimeout(300);
  const pv2 = await p.evaluate(() => ({prev: SYNQUENZER.vvInfo().prev, playing: R.playing}));
  const jump = idle.geo !== busy.geo || idle.geo !== done.geo;
  res[n] = {geo: [idle.geo, busy.geo, done.geo], fontOk, idle: [idle.small, idle.bad], busy: [busy.small, busy.bad], done: [done.small, done.bad], docOk: idle.doc && busy.doc && done.doc, jump, preview: pv, stopped: pv2, errs,
    ok: fontOk && !jump && [idle, busy, done].every(x => !x.small.length && !x.bad.length && x.doc) && pv.prev && pv.playing && !pv2.prev && !pv2.playing && !errs.length};
  console.log(n, JSON.stringify(res[n]));
  await b.close();
}
fs.writeFileSync('n5-v-out/a7.json', JSON.stringify(res, null, 1));
