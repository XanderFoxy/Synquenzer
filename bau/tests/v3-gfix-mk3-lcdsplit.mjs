// G-MK3-fix: Split chip in portrait LCD — value visible, no overflow, ⋯ does not cover the chip. Real app fonts injected.
import {chromium} from 'playwright';
import fs from 'fs';
const EXE = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const APP = process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK3/index.html';
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-gfix-mk3/'; fs.mkdirSync(OUT, {recursive: true});
const FD = '/home/user/synquenzer/fonts/';
const fcss = [['Barlow Semi Condensed', 'barlow-semi-condensed', [500, 600, 700]], ['JetBrains Mono', 'jetbrains-mono', [500, 700]]].map(([fam, f, ws]) => ws.map(w => `@font-face{font-family:"${fam}";font-weight:${w};src:url(data:font/woff2;base64,${fs.readFileSync(FD + f + '-latin-' + w + '-normal.woff2').toString('base64')}) format("woff2")}`).join('')).join('');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const vps = [['P1', 390, 844], ['P2', 375, 812], ['P2se', 375, 667], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375]];
let fails = 0; const bad = (tag, m) => { fails++; console.log('FAIL', tag, m); };
for (const [tag, W, H] of vps) {
  const br = await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await br.newContext({viewport: {width: W, height: H}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + APP); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version, null, {timeout: 20000});
  if (!process.env.NOFONT) await p.addStyleTag({content: fcss}); await p.evaluate(() => document.fonts.ready); await sleep(700);
  const fontOk = await p.evaluate(() => document.fonts.check('700 11px "Barlow Semi Condensed"') && [...document.fonts].some(f => f.family.includes('Barlow') && f.status === 'loaded'));
  if (!fontOk && !process.env.NOFONT) bad(tag, 'font not loaded');
  const E = (f, a) => p.evaluate(f, a);
  const cdp = await ctx.newCDPSession(p);
  const send = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts});
  const tap = async (x, y, w = 400) => { await send('touchStart', [{x, y, id: 1}]); await sleep(40); await send('touchEnd', []); await sleep(w); };
  const rect = (sel, re) => E(([s, src]) => { const rx = src ? new RegExp(src) : null; const e = [...document.querySelectorAll(s)].filter(e => e.getClientRects().length && (!rx || rx.test(e.textContent.trim())))[0]; if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height, cx: r.x + r.width / 2, cy: r.y + r.height / 2}; }, [sel, re ? re.source : null]);
  const lcd = () => E(() => { const l = document.querySelector('#synthSheet .lcd'); const b = l.getBoundingClientRect();
    const ch = [...l.children].filter(c => getComputedStyle(c).display !== 'none').map(c => { const r = c.getBoundingClientRect(); return {cls: c.className, x0: Math.round(r.x), x1: Math.round(r.right), w: r.width, sw: c.scrollWidth, cw: c.clientWidth, sh: c.scrollHeight, chh: c.clientHeight, txt: c.textContent.slice(0, 90)}; });
    const chip = l.querySelector('.lsplit'); let hit = null, chipR = null;
    if (chip) { const r = chip.getBoundingClientRect(); chipR = {x0: r.x, x1: r.right, y0: r.y, y1: r.bottom}; const e = document.elementFromPoint(r.right - 2, r.y + r.height / 2); hit = e && e.closest('.lcd') ? 'lcd' : e ? e.tagName + ' ' + e.textContent.trim().slice(0, 6) : null;
      // each chip line fits
      chipR.lines = [...chip.children].map(b => b.scrollWidth <= b.clientWidth + 1 || getComputedStyle(b).display === 'inline'); }
    return {cls: l.className, sw: l.scrollWidth, cw: l.clientWidth, x1: b.right, y0: b.y, y1: b.bottom, ch, hit, chipR}; });
  const check = (name, s, want) => {
    if (!s.cw) { console.log(tag, name, 'LCD not shown in this format (by design, P3)'); return; }
    const lv = s.ch.find(c => /\blv\b/.test(c.cls));
    const info = `${name} cls=${s.cls} sw/cw=${s.sw}/${s.cw} ` + s.ch.map(c => `${c.cls}:${c.x0}-${c.x1}"${c.txt}"`).join(' | ') + ` hit=${s.hit}`;
    console.log(tag, info);
    if (s.sw > s.cw + 1) bad(tag, name + ' LCD overflow ' + s.sw + '/' + s.cw);
    if (!lv || lv.w < 20) bad(tag, name + ' value span too narrow ' + (lv && lv.w));
    if (want && !(lv && lv.txt.includes(want))) bad(tag, name + ' value lacks ' + want);
    if (lv && !/\bmq\b/.test(s.cls) && (lv.sw > lv.cw + 1 || lv.sh > lv.chh + 2)) bad(tag, name + ' value clipped (no marquee) ' + lv.sw + '/' + lv.cw + ' h ' + lv.sh + '/' + lv.chh);
    if (s.chipR && s.hit !== 'lcd') bad(tag, name + ' chip right edge covered by ' + s.hit);
    if (s.chipR && (s.chipR.y0 < s.y0 - 0.5 || s.chipR.y1 > s.y1 + 0.5)) bad(tag, name + ' chip taller than LCD');
  };
  await E(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(700);
  let r = await rect('.mkx[data-k="w1"]');
  if (!r) { const rr = await rect('button, .tab', /^RECHTS$/); if (rr) await tap(rr.cx, rr.cy); r = await rect('.mkx[data-k="w1"]'); }
  await tap(r.cx, r.cy, 400); let it = await rect('#popLayer .pop button', /^1 STIMME/); await tap(it.cx, it.cy, 700);
  for (const mode of ['Schicht', 'Split']) {
    r = await rect('.mkx[data-k="k1"]'); await tap(r.cx, r.cy, 400); it = await rect('#popLayer .pop button', new RegExp('^' + mode + '$')); await tap(it.cx, it.cy, 700);
    check('mode=' + mode, await lcd(), mode);
  }
  let s = await lcd(); await p.screenshot({path: OUT + tag + '-mode-Split.png', clip: {x: 0, y: Math.max(0, s.y0 - 8), width: W, height: 52}});
  // ZUWEISUNG list → Mono
  r = await rect('.mkx[data-k="k2"]'); await tap(r.cx, r.cy, 400); it = await rect('#popLayer .pop button', /^Mono$/);
  if (it) { await tap(it.cx, it.cy, 700); check('ZUWEISUNG=Mono', await lcd(), 'Mono'); } else console.log(tag, 'no Mono row');
  r = await rect('.mkx[data-k="shift"]'); await tap(r.cx, r.cy, 300);
  r = await rect('.mkx[data-k="k2"]');
  await send('touchStart', [{x: r.cx, y: r.cy, id: 1}]); for (let k = 1; k <= 10; k++) { await send('touchMove', [{x: r.cx, y: r.cy - 3 * k, id: 1}]); await sleep(20); }
  await sleep(100); s = await lcd(); check('SPLIT drag', s, 'darunter T1, ab hier T2');
  await p.screenshot({path: OUT + tag + '-splitdrag.png', clip: {x: 0, y: Math.max(0, s.y0 - 8), width: W, height: 52}});
  await send('touchEnd', []); await sleep(500);
  check('SPLIT after', await lcd(), 'darunter T1');
  const chip = await rect('.lcd .lsplit');
  if (!chip) { if (tag !== 'P3') bad(tag, 'no chip'); } else { await tap(chip.cx, chip.cy, 500); s = await lcd(); check('armed', s, 'eine Taste spielen');
    await p.screenshot({path: OUT + tag + '-armed.png', clip: {x: 0, y: Math.max(0, s.y0 - 8), width: W, height: 52}});
    console.log(tag, 'armed state', await E(() => SYNQUENZER.mkPanel ? SYNQUENZER.mkPanel().splitArm : '?'));
    await E(() => SYNQUENZER.noteOn ? 0 : 0);
  }
  if (errs.length) bad(tag, 'errors ' + errs.slice(0, 3).join(' / '));
  await br.close();
}
console.log(fails ? 'FAILS ' + fails : 'ALL OK');
