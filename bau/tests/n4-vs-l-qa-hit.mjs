// QA VS-L: wirksame Trefferfläche (elementFromPoint-Abtastung 0,5 px) der neuen Knöpfe: Melodieerkennung An/Aus, Länge im Aufnahme-Blatt
// und in den Einstellungen; 6 Formate. node n4-vs-l-qa-hit.mjs <file>
import {chromium} from 'playwright';
import {INIT as INIT2} from './v3-vs2-h.mjs';
const file = process.argv[2];
const VP = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], XL: [926, 428]};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const br = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const SPAN = (sel) => [...document.querySelectorAll(sel)].filter(b => b.offsetParent).map(b => {
  const q = b.getBoundingClientRect(), cx = q.left + q.width / 2, cy = q.top + q.height / 2;
  const hit = (x, y) => { const e = document.elementFromPoint(x, y); return !!e && (e === b || b.contains(e)); };
  let h = 0, w = 0; for (let y = q.top - 6; y <= q.bottom + 6; y += 0.5) if (hit(cx, y)) h += 0.5;
  for (let x = q.left - 6; x <= q.right + 6; x += 0.5) if (hit(x, cy)) w += 0.5;
  return {t: b.textContent.trim().slice(0, 10), w, h, vis: cy >= 0 && cy <= innerHeight && cx >= 0 && cx <= innerWidth, rect: [q.left, q.top, q.width, q.height].map(v => +v.toFixed(2))};
});
const out = {};
for (const [k, [w, h]] of Object.entries(VP)) {
  const ctx = await br.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 3});
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.addInitScript(INIT2);
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version); await sleep(600);
  await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.stimmeStart({route: 'wired', cal: false}); });
  await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live', null, {timeout: 8000}).catch(() => {}); await sleep(400);
  await p.evaluate(() => SYNQUENZER.stimmeSheet()); await sleep(400);
  const mel = await p.evaluate(SPAN, '.pop.stpop #vsMel button');
  await p.evaluate(() => SYNQUENZER.stimmeSheet(false)); await sleep(200);
  await p.evaluate(() => { const b = document.getElementById('chipLen'); b && b.click(); }); await sleep(400);
  const ro = await p.evaluate(SPAN, '#roLen button');
  await p.keyboard.press('Escape'); await sleep(200);
  await p.evaluate(() => SYNQUENZER.openMenu ? SYNQUENZER.openMenu() : null); await sleep(500);
  let menu = await p.evaluate(() => { const r = [...document.querySelectorAll('#menu .mrow')].find(r => { const l = r.querySelector('.lbl'); return l && l.textContent === 'Länge'; }); if (!r) return 'keine Zeile'; r.scrollIntoView({block: 'center'}); return 'ok'; });
  await sleep(300);
  const mn = menu === 'ok' ? await p.evaluate(SPAN, '#menu .mrow.rlen .seg button') : menu;
  out[k] = {mel, ro, menu: mn, errs};
  await ctx.close();
}
await br.close();
for (const [k, v] of Object.entries(out)) {
  const f = a => Array.isArray(a) ? a.map(x => `${x.t}:${x.w}x${x.h}${x.vis ? '' : '(aus)'}`).join(' ') : a;
  console.log(k, '| Mel', f(v.mel), '| roLen', f(v.ro), '| Menü', f(v.menu), v.errs.length ? JSON.stringify(v.errs) : '');
}
