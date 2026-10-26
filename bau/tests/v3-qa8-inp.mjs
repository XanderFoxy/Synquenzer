// QA MK8: Sichern place choice by touch – can the name field be focused by a tap, can the popup be scrolled by a finger
// (content taller than the popup in P3 / L2)? Compared with the VA Sichern popup of the same build.
import {launch, open} from './v3-qa8-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await launch();
for (const [f, eng] of [['P3', 'mk'], ['L2', 'mk'], ['P1', 'mk'], ['P3', 'va'], ['P1', 'va']]) {
  const {ctx, page: p, errs} = await open(b, f);
  const cdp = await ctx.newCDPSession(p);
  const send = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts});
  await p.evaluate(async eng => { await SYNQUENZER.libraryReady(); if (eng === 'mk') { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); } else { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); } }, eng);
  await sleep(500);
  if (eng === 'mk') await p.evaluate(async () => { mkProg.select(6, 16); SYNQUENZER.mkSet(0, 't.0.f.cut', 30); await mkProg.write(6, 16, 'Doppelsirene Neu'); SYNQUENZER.mkSet(0, 't.0.f.cut', 31); });
  else await p.evaluate(() => SYNQUENZER.setParam ? 0 : 0);
  await sleep(300);
  // open Sichern with a touch tap
  const sv = await p.evaluate(() => { const e = document.querySelector('#synthSheet .sh-head .hb.sv'); const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; });
  await send('touchStart', [{x: sv.x, y: sv.y, id: 1}]); await sleep(40); await send('touchEnd', []); await sleep(500);
  // VA without own origin: the name pop opens with the input focused programmatically; blur first so the tap must focus it
  await p.evaluate(() => { const a = document.activeElement; if (a && a.blur) a.blur(); });
  const inp = await p.evaluate(() => { const i = document.querySelector('#popLayer .pop input'); if (!i) return null; const r = i.getBoundingClientRect(); return {x: r.x + 20, y: r.y + r.height / 2}; });
  if (!inp) { console.log(f, eng, 'no input', await p.evaluate(() => document.querySelector('#popLayer .pop') && document.querySelector('#popLayer .pop').innerText)); await ctx.close(); continue; }
  await send('touchStart', [{x: inp.x, y: inp.y, id: 1}]); await sleep(60); await send('touchEnd', []); await sleep(300);
  const foc = await p.evaluate(() => document.activeElement && document.activeElement.tagName + '.' + document.activeElement.className);
  // finger scroll inside the popup (drag up 120 px from the middle of the popup)
  const pr = await p.evaluate(() => { const q = document.querySelector('#popLayer .pop'); const r = q.getBoundingClientRect(); return {x: r.x + 12, y: r.y + r.height * .55, sh: q.scrollHeight, ch: q.clientHeight, st: q.scrollTop}; });
  await send('touchStart', [{x: pr.x, y: pr.y, id: 1}]); for (let k = 1; k <= 10; k++) { await send('touchMove', [{x: pr.x, y: pr.y - 12 * k, id: 1}]); await sleep(16); } await send('touchEnd', []); await sleep(400);
  const st2 = await p.evaluate(() => { const q = document.querySelector('#popLayer .pop'); return q ? q.scrollTop : 'closed'; });
  console.log(f.padEnd(3), eng.padEnd(3), 'tap name field → focus:', foc, '| popup scrollH/clientH', pr.sh + '/' + pr.ch, 'scrollTop before/after finger drag', pr.st, '→', st2, '| errs', errs.length);
  await ctx.close();
}
await b.close();
