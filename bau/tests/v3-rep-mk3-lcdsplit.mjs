// independent repro: MK3 split chip in portrait LCD hides .lv value; ⋯ covers the chip at 375 px
import {chromium} from 'playwright';
const EXE = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const APP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK3/index.html';
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-rep-mk3/';
import fs from 'fs'; fs.mkdirSync(OUT, {recursive: true});
const sleep = ms => new Promise(r => setTimeout(r, ms));
const vps = [['P1', 390, 844], ['P2', 375, 812], ['P2se', 375, 667], ['L1', 844, 390]];
for (const [tag, W, H] of vps) {
  const br = await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await br.newContext({viewport: {width: W, height: H}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + APP); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version, null, {timeout: 20000}); await sleep(700);
  const E = (f, a) => p.evaluate(f, a);
  const cdp = await ctx.newCDPSession(p);
  const send = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts});
  const tap = async (x, y, w = 400) => { await send('touchStart', [{x, y, id: 1}]); await sleep(40); await send('touchEnd', []); await sleep(w); };
  const rect = (sel, re) => E(([s, src]) => { const rx = src ? new RegExp(src) : null; const e = [...document.querySelectorAll(s)].filter(e => e.getClientRects().length && (!rx || rx.test(e.textContent.trim())))[0]; if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height, cx: r.x + r.width / 2, cy: r.y + r.height / 2}; }, [sel, re ? re.source : null]);
  const lcd = () => E(() => { const l = document.querySelector('#synthSheet .lcd') || document.querySelector('.lcd'); const b = l.getBoundingClientRect(); const ch = [...l.children].map(c => { const r = c.getBoundingClientRect(); return {cls: c.className, x0: Math.round(r.x), x1: Math.round(r.right), vis: getComputedStyle(c).display !== 'none', txt: c.textContent.slice(0, 70)}; });
    const chip = l.querySelector('.lsplit'); let hit = null, dots = null;
    if (chip) { const r = chip.getBoundingClientRect(); const e = document.elementFromPoint(r.right - 3, r.y + r.height / 2); hit = e ? (e.tagName + '.' + e.className + ' "' + e.textContent.trim().slice(0, 10) + '"') : null; }
    const hb = [...document.querySelectorAll('#synthSheet .hb')].filter(e => e.getClientRects().length).map(e => { const r = e.getBoundingClientRect(); return {cls: e.className, t: e.textContent.trim().slice(0, 4), x0: Math.round(r.x), x1: Math.round(r.right), y0: Math.round(r.y), y1: Math.round(r.bottom)}; }).filter(h => Math.abs(h.y0 - b.y) < 40);
    return {lcd: {x0: Math.round(b.x), x1: Math.round(b.right), y: Math.round(b.y), cls: l.className, sw: l.scrollWidth, cw: l.clientWidth}, ch, chipRightHit: hit, hb}; });
  // setup: MS 2000 on track 1, editor open
  await E(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(700);
  // if half view (portrait shows halves), go to the half with the mk knobs w1/k1
  // EDIT-WAHL 1 → 1 STIMME via touch
  let r = await rect('.mkx[data-k="w1"]');
  if (!r) { const rr = await rect('button, .tab', /^RECHTS$/); if (rr) { await tap(rr.cx, rr.cy); } r = await rect('.mkx[data-k="w1"]'); }
  await tap(r.cx, r.cy, 400); let it = await rect('#popLayer .pop button', /^1 STIMME/); if (!it) { console.log(tag, 'no STIMME row', await E(() => [...document.querySelectorAll('#popLayer .pop button')].map(b => b.textContent.trim()))); }
  await tap(it.cx, it.cy, 700);
  const sum = s => ({lcd: s.lcd, ch: s.ch.map(c => `${c.cls}:${c.x0}-${c.x1}:${c.txt}`), chipRightHit: s.chipRightHit, hb: s.hb.map(h => `${h.t}:${h.x0}-${h.x1}`)});
  console.log(tag, 'Single/STIMME', JSON.stringify(sum(await lcd())));
  // k1 EINZELN → list → Split (touch)
  for (const mode of ['Schicht', 'Split']) {
    r = await rect('.mkx[data-k="k1"]'); await tap(r.cx, r.cy, 400); it = await rect('#popLayer .pop button', new RegExp('^' + mode + '$')); if (!it) { console.log(tag, 'no row', mode, await E(() => [...document.querySelectorAll('#popLayer .pop button')].map(b => b.textContent.trim()))); continue; }
    await tap(it.cx, it.cy, 700);
    const s = await lcd(); console.log(tag, 'mode=' + mode, JSON.stringify(sum(s)));
    await p.screenshot({path: OUT + tag + '-mode-' + mode + '.png', clip: {x: 0, y: Math.max(0, s.lcd.y - 8), width: W, height: 48}});
  }
  console.log(tag, 'pm mode', await E(() => SYNQUENZER.mkGet(0).mode));
  // SHIFT then drag SPLIT up
  r = await rect('.mkx[data-k="shift"]'); await tap(r.cx, r.cy, 300);
  r = await rect('.mkx[data-k="k2"]'); console.log(tag, 'k2 label', await E(() => { const e = [...document.querySelectorAll('.mkx[data-k="k2"]')].find(e => e.getClientRects().length); return e && e.textContent.trim().replace(/\s+/g, ' ').slice(0, 40); }));
  await send('touchStart', [{x: r.cx, y: r.cy, id: 1}]); for (let k = 1; k <= 10; k++) { await send('touchMove', [{x: r.cx, y: r.cy - 3 * k, id: 1}]); await sleep(20); }
  let s = await lcd(); console.log(tag, 'SPLIT drag', JSON.stringify(sum(s)));
  await p.screenshot({path: OUT + tag + '-splitdrag.png', clip: {x: 0, y: Math.max(0, s.lcd.y - 8), width: W, height: 48}});
  await send('touchEnd', []); await sleep(500);
  s = await lcd(); console.log(tag, 'SPLIT after', JSON.stringify(sum(s)));
  console.log(tag, 'split value', await E(() => SYNQUENZER.mkGet(0).split));
  // arm via chip tap
  const chip = await rect('.lcd .lsplit');
  if (chip) { await tap(chip.cx, chip.cy, 500); s = await lcd(); console.log(tag, 'armed', JSON.stringify(sum(s))); await p.screenshot({path: OUT + tag + '-armed.png', clip: {x: 0, y: Math.max(0, s.lcd.y - 8), width: W, height: 48}}); }
  console.log(tag, 'errors', errs.length, errs.slice(0, 3));
  await br.close();
}
