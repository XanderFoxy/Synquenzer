// QA VS2: Mikro-Blatt (VS1 sheet + new "Stimme → Noten" part) base vs new, P1 P3 L1 L2: clipping, overlap, reachable by scroll
import { chromium } from 'playwright';
import { INIT, EXE } from './v3-vs2-h.mjs';
const SCR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const FILES = {base: SCR + 'synq-snapshots/V2c′-fix.html', new: SCR + 'dirigent-wt/index.html'};
const res = {};
for (const name of ['base', 'new']) for (const [vp, w, h] of [['P1', 390, 844], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375]]) {
  const br = await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
  const p = await (await br.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true})).newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(INIT);
  await p.goto('file://' + FILES[name]); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version); await p.waitForTimeout(500);
  await p.evaluate(() => { const Q = SYNQUENZER; Q.play(); Q.stop(); return Q.stimmeStart({route: 'speaker', cal: false}); });
  await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live', null, {timeout: 10000}); await p.waitForTimeout(500);
  await p.evaluate(() => SYNQUENZER.stimmeSheet(true)); await p.waitForTimeout(400);
  const m = await p.evaluate(() => { const pop = document.querySelector('.pop.stpop'); if (!pop) return null; const r = pop.getBoundingClientRect();
    const sc = [pop, ...pop.querySelectorAll('*')].find(e => e.scrollHeight > e.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(e).overflowY));
    const bs = [...pop.querySelectorAll('button')].filter(b => getComputedStyle(b).display !== 'none').map(b => { const q = b.getBoundingClientRect(); return {t: b.textContent.trim().slice(0, 22), x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height), cut: b.scrollWidth > b.clientWidth + 1}; });
    const ov = []; const vb = [...pop.querySelectorAll('button')].filter(b => b.getBoundingClientRect().height > 0);
    for (let i = 0; i < vb.length; i++) for (let j = i + 1; j < vb.length; j++) { const a = vb[i].getBoundingClientRect(), c = vb[j].getBoundingClientRect(); const ix = Math.min(a.right, c.right) - Math.max(a.left, c.left), iy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top); if (ix > 1 && iy > 1 && !vb[i].contains(vb[j])) ov.push(vb[i].textContent.slice(0, 12) + ' X ' + vb[j].textContent.slice(0, 12)); }
    let unreachable = [];
    if (sc) { const s0 = sc.scrollTop; sc.scrollTop = 1e6; const sr = sc.getBoundingClientRect(); unreachable = bs.length ? [...pop.querySelectorAll('button')].filter(b => { const q = b.getBoundingClientRect(); return q.height > 0 && (q.bottom > Math.min(innerHeight, sr.bottom) + 1); }).map(b => b.textContent.slice(0, 16)) : []; sc.scrollTop = s0; }
    else unreachable = [...pop.querySelectorAll('button')].filter(b => { const q = b.getBoundingClientRect(); return q.height > 0 && (q.bottom > innerHeight + 1 || q.top < -1 || q.right > innerWidth + 1); }).map(b => b.textContent.slice(0, 16));
    return {box: [r.left, r.top, r.width, r.height].map(Math.round), scroller: sc ? (sc.className || sc.tagName) + ' ' + sc.scrollHeight + '/' + sc.clientHeight : null, n: bs.length, cut: bs.filter(b => b.cut).map(b => b.t), small: bs.filter(b => b.h < 36).map(b => b.t + ' ' + b.h), ov, unreachable}; });
  await p.screenshot({path: SCR + `dirigent-test/v3-qa-v2d2reg/msheet-${name}-${vp}.png`});
  res[name + vp] = {m, errs: errs.slice(0, 3)}; await br.close();
}
for (const vp of ['P1', 'P3', 'L1', 'L2']) console.log('==', vp, '\n base', JSON.stringify(res['base' + vp]), '\n new ', JSON.stringify(res['new' + vp]));
