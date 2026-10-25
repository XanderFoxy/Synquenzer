// QA MK1 (FP-TOUCH): real touch (CDP) at 390x844 and 844x390: engine choice by touch, hit areas by elementFromPoint,
// label overflow, page scroll, gesture conflicts.
import { chromium } from 'playwright';
const FILE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html';
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-mk1-shots/';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const FMTS = (process.env.FMTS || 'P1,L1,P2,P3,L2').split(',');
const SIZES = {P1: [390, 844], L1: [844, 390], P2: [375, 667], P3: [320, 568], L2: [667, 375], W: [844, 1180]};
async function touchTap(cdp, x, y) {
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 1}]});
  await new Promise(r => setTimeout(r, 40));
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
  await new Promise(r => setTimeout(r, 150));
}
const HIT = () => {
  const desc = e => e ? (e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).join('.') : '') + (e.dataset && e.dataset.k ? '[k=' + e.dataset.k + ']' : '')) : 'null';
  window.__hit = el => {
    const r = el.getBoundingClientRect(); if (r.width === 0 || r.height === 0) return null;
    const hits = (x, y) => { if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) return false; const e = document.elementFromPoint(x, y); return !!e && (e === el || el.contains(e)); };
    // find a point inside the rect that hits the element (center first, then a coarse grid)
    let cx = r.x + r.width / 2, cy = r.y + r.height / 2;
    if (!hits(cx, cy)) { let f = false; for (let gy = .1; gy < 1 && !f; gy += .1) for (let gx = .1; gx < 1 && !f; gx += .1) { const x = r.x + r.width * gx, y = r.y + r.height * gy; if (hits(x, y)) { cx = x; cy = y; f = true; } } if (!f) return {w: 0, h: 0, blocked: desc(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)), rect: [r.x, r.y, r.width, r.height].map(Math.round)}; }
    let x0 = cx, x1 = cx, y0 = cy, y1 = cy;
    while (hits(x0 - 1, cy) && x0 > r.x - 60) x0--; while (hits(x1 + 1, cy) && x1 < r.right + 60) x1++;
    while (hits(cx, y0 - 1) && y0 > r.y - 60) y0--; while (hits(cx, y1 + 1) && y1 < r.bottom + 60) y1++;
    return {w: Math.round(x1 - x0 + 1), h: Math.round(y1 - y0 + 1), rect: [r.x, r.y, r.width, r.height].map(Math.round)};
  };
  window.__desc = desc;
};
const results = [];
for (const fmt of FMTS) {
  const [w, h] = SIZES[fmt];
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  const cdp = await ctx.newCDPSession(page);
  await page.evaluate(HIT);
  await page.evaluate(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await page.waitForTimeout(500);
  // the engine choice by touch: chip (list) or the 4th key
  const eng = await page.evaluate(() => { const c = document.querySelector('#synthSheet .engchip button'); const k = document.querySelector('#synthSheet .seg.eng .mkeb');
    const t = c || k; const r = t.getBoundingClientRect(); return {chip: !!c, x: r.x + r.width / 2, y: r.y + r.height / 2, hit: __hit(t), label: t.textContent, nameW: (() => { const n = document.querySelector('#synthSheet .sh-title'); return n ? Math.round(n.getBoundingClientRect().width) : null; })()}; });
  results.push(`${fmt} engine control: ${eng.chip ? 'chip' : '4th key'} "${eng.label}" hit ${eng.hit.w}x${eng.hit.h} rect ${eng.hit.rect} · track-name field ${eng.nameW} px`);
  if (eng.chip) {
    await touchTap(cdp, eng.x, eng.y);
    const rows = await page.evaluate(() => [...document.querySelectorAll('.pop button[data-e]')].map(b => ({t: b.textContent, hit: __hit(b)})));
    results.push(`${fmt} chip list rows: ` + rows.map(r => r.t + ' ' + (r.hit ? r.hit.w + 'x' + r.hit.h : '-')).join(', '));
    const mk = await page.evaluate(() => { const b = [...document.querySelectorAll('.pop button[data-e]')].find(b => b.dataset.e === 'mk'); const r = b.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; });
    await touchTap(cdp, mk.x, mk.y);
  } else await touchTap(cdp, eng.x, eng.y);
  await page.waitForTimeout(700);
  const engNow = await page.evaluate(() => SYNQUENZER.getSound(0).engine);
  results.push(`${fmt} after touch: engine = ${engNow}, undo n = ${(await page.evaluate(() => SYNQUENZER.undoInfo().n))}`);
  await page.screenshot({path: OUT + fmt + '-mk.png'});
  // hit areas of every control in the sheet head, the panel and the wheels
  const H = await page.evaluate(() => {
    const sel = '#synthSheet .sh-head button, #synthSheet .sh-tabs button, #synthSheet .stab, #synthSheet .mkx, #mkWh .mkwheel, #synthSheet .sh-bar button';
    const out = []; const seen = new Set();
    for (const e of document.querySelectorAll(sel)) { if (seen.has(e)) continue; seen.add(e); if (e.closest('[hidden]') || getComputedStyle(e).visibility === 'hidden' || getComputedStyle(e).display === 'none') continue;
      const a = __hit(e); if (!a) continue; out.push({d: __desc(e), t: (e.textContent || '').trim().slice(0, 18), a}); }
    return out;
  });
  const small = H.filter(x => x.a.w < 44 || x.a.h < 44);
  results.push(`${fmt} controls scanned: ${H.length}; under 44x44: ${small.length}`);
  for (const s of small) results.push(`   ${s.d} "${s.t}" hit ${s.a.w}x${s.a.h} rect ${s.a.rect}${s.a.blocked ? ' blocked by ' + s.a.blocked : ''}`);
  // label overflow inside the panel / head
  const ov = await page.evaluate(() => [...document.querySelectorAll('#synthSheet *, #mkWh *')].filter(e => e.children.length === 0 && (e.textContent || '').trim() && e.offsetParent && e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible').map(e => __desc(e) + ' "' + e.textContent.trim().slice(0, 20) + '" ' + e.scrollWidth + '>' + e.clientWidth));
  const ov2 = await page.evaluate(() => [...document.querySelectorAll('#synthSheet *, #mkWh *')].filter(e => e.children.length === 0 && (e.textContent || '').trim() && e.offsetParent && e.scrollWidth > e.clientWidth + 1).map(e => __desc(e) + ' "' + e.textContent.trim().slice(0, 20) + '" ' + e.scrollWidth + '>' + e.clientWidth));
  results.push(`${fmt} text overflow (clipped): ${ov.length ? ov.join(' | ') : 'none'}; scrollWidth>clientWidth any: ${ov2.length}${ov2.length ? ' e.g. ' + ov2.slice(0, 6).join(' | ') : ''}`);
  const sc = await page.evaluate(() => ({sw: document.scrollingElement.scrollWidth, sh: document.scrollingElement.scrollHeight, iw: innerWidth, ih: innerHeight, out: [...document.querySelectorAll('#synthSheet .mkx, #mkWh .mkwheel')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + .5 || r.bottom > innerHeight + .5 || r.x < -.5 || r.y < -.5); }).map(e => __desc(e))}));
  results.push(`${fmt} page ${sc.sw}x${sc.sh} vs ${sc.iw}x${sc.ih}; controls outside viewport: ${sc.out.length ? sc.out.join(', ') : 'none'}`);
  results.push(`${fmt} errors: ${JSON.stringify(errs)}`);
  await ctx.close();
}
console.log(results.join('\n'));
await browser.close();
