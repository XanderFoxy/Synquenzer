// QA VS4 E: Takes sheet with many takes (overdub ×7) in L2 / XL / P3: whole sheet reachable, finger scroll, SÄUBERN reachable
import {launch, open, sleep} from './gs7-v3-qa-vs4-h.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const br = await launch(null);
for (const [nm, w, h] of [['L2', 667, 375], ['XL', 926, 428], ['P3', 320, 568]]) {
  const ctx = await br.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true}); const H = await open(br, {ctx}), p = H.p, cdp = await ctx.newCDPSession(p);
  let r; for (let k = 0; k < 7; k++) { const n = 48000, a = new Array(n); for (let i = 0; i < n; i++) a[i] = Math.round(0.2 * Math.sin(2 * Math.PI * (200 + 30 * k) * i / 48000) * 32767); r = await p.evaluate(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 0, len: 1}), a); }
  await p.evaluate(id => SYNQUENZER.clSet(id, 60), r.id); await p.evaluate(id => SYNQUENZER.clWait(id), r.id);
  await p.evaluate(t => SYNQUENZER.tkSheet({t, s: 0}), r.track); await sleep(400);
  const g = await p.evaluate(() => { const P = document.querySelector('.pop.tksheet'), q = P.getBoundingClientRect(), c = P.querySelector('.clbox').getBoundingClientRect(); return {top: Math.round(q.top), bot: Math.round(q.bottom), sh: P.scrollHeight, ch: P.clientHeight, ov: getComputedStyle(P).overflowY, ta: getComputedStyle(P).touchAction, clTop: Math.round(c.top), clBot: Math.round(c.bottom), items: P.querySelectorAll('.tklist > *').length}; });
  ok(g.top >= 0 && g.bot <= h, `${nm}: sheet with ${g.items} takes inside the screen ${JSON.stringify(g)}`);
  if (g.sh > g.ch + 1) {
    const b = await p.locator('.pop.tksheet').boundingBox(), x = b.x + 20, y0 = b.y + b.height - 30;
    const st0 = await p.evaluate(() => document.querySelector('.pop.tksheet').scrollTop);
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y: y0}]});
    for (let k = 1; k <= 10; k++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x, y: y0 - 20 * k}]}); await sleep(16); }
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await sleep(500);
    const st1 = await p.evaluate(() => document.querySelector('.pop.tksheet').scrollTop);
    ok(st1 > st0, `${nm}: sheet taller than the screen scrolls with the finger (scrollTop ${st0} → ${st1})`);
  }
  const vis = await p.evaluate(() => { const P = document.querySelector('.pop.tksheet'); P.querySelector('.clr').scrollIntoView({block: 'nearest'}); const c = P.querySelector('.clr').getBoundingClientRect(); const e = document.elementFromPoint(c.left + c.width / 2, c.top + c.height / 2); return e && e.classList.contains('clr'); });
  ok(vis, `${nm}: SÄUBERN slider reachable (hit test)`);
  await p.screenshot({path: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/gs7/qa-vs4/e-' + nm + '.png'});
  ok(!H.errs.length, `${nm}: no console errors ${JSON.stringify(H.errs.slice(0, 2))}`);
  await ctx.close();
}
await br.close(); console.log(fail ? 'FAIL ' + fail : 'ALL OK');
