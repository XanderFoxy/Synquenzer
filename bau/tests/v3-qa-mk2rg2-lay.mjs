// QA regression MK2: the new MK2 states in every format (P1 P2 P3 L1 L2 W + L1 safe-area): OSZ 1 = Speicherwelle (labels,
// LCD), the 64-wave list, EDIT-WAHL 2 PATCH 2 and its QUELLE list; inside the viewport, rows >= 44 px, no overflow, no page
// scroll, no overlap of panel controls, no console errors; screenshots.
import { chromium } from 'playwright';
const FILE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html';
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-mk2rg2/';
const FMT = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180], 'L1-SA': [844, 390]};
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const panelCheck = page => page.evaluate(() => {
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
  const ks = [...document.querySelectorAll('#synthSheet .mkx')].filter(vis), R = ks.map(e => [e.dataset.k, e.getBoundingClientRect()]);
  const out = R.filter(([, r]) => r.left < -0.5 || r.top < -0.5 || r.right > innerWidth + 0.5 || r.bottom > innerHeight + 0.5).map(x => x[0]);
  const ov = []; for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) { const a = R[i][1], c = R[j][1]; const w = Math.min(a.right, c.right) - Math.max(a.left, c.left), h = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top); if (w > 1 && h > 1) ov.push(R[i][0] + '/' + R[j][0]); }
  const small = R.filter(([, r]) => r.width < 43.5 || r.height < 43.5).map(([k, r]) => k + ':' + Math.round(r.width) + 'x' + Math.round(r.height));
  const lab = [...document.querySelectorAll('#synthSheet .mkx *')].filter(e => vis(e) && e.children.length === 0 && e.textContent.trim() && e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible').map(e => e.textContent.trim());
  const lcd = document.querySelector('#synthSheet .lcd'); const lr = lcd && lcd.getBoundingClientRect();
  return {n: R.length, out, ov: ov.slice(0, 6), small: small.slice(0, 6), lab: lab.slice(0, 6), hscroll: document.documentElement.scrollWidth > innerWidth, lcd: lcd ? lcd.innerText.replace(/\s+/g, ' ').slice(0, 120) : null, lcdIn: lr ? lr.left >= -0.5 && lr.right <= innerWidth + 0.5 : null};
});
const popCheck = page => page.evaluate(() => {
  const p = document.querySelector('.pop'); if (!p) return null; const r = p.getBoundingClientRect();
  const L = p.querySelector('.plist'), bs = [...p.querySelectorAll('.plist button')], on = p.querySelector('.plist .rb.on');
  const lr = L.getBoundingClientRect(), orr = on ? on.getBoundingClientRect() : null;
  return {n: bs.length, inView: r.left >= -0.5 && r.top >= -0.5 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5, rect: [r.left, r.top, r.width, r.height].map(Math.round),
    minH: Math.round(Math.min(...bs.map(x => x.getBoundingClientRect().height))), over: bs.filter(x => x.scrollWidth > x.clientWidth + 1).map(x => x.textContent.trim()).slice(0, 4),
    head: [...p.querySelectorAll('h4,p')].filter(x => x.scrollWidth > x.clientWidth + 1).map(x => x.textContent.trim()).slice(0, 2), scrolls: L.scrollHeight > L.clientHeight, listIn: lr.top >= r.top - 0.5 && lr.bottom <= r.bottom + 0.5,
    onVis: orr ? orr.top >= lr.top - 1 && orr.bottom <= lr.bottom + 1 : null, hscroll: document.documentElement.scrollWidth > innerWidth}; });
const center = (page, k) => page.evaluate(k => { const e = [...document.querySelectorAll('#synthSheet .mkx[data-k="' + k + '"]')].find(x => x.getBoundingClientRect().width > 0); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2 + 6]; }, k);
for (const [f, [w, h]] of Object.entries(FMT)) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: f !== 'W', deviceScaleFactor: 1});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  if (f === 'L1-SA') await page.addInitScript(() => { const s = document.createElement('style'); s.textContent = ':root{--sal:47px;--sar:47px}'; document.addEventListener('DOMContentLoaded', () => document.head.appendChild(s)); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await page.waitForTimeout(500);
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 't.0.o1.w', 5); SYNQUENZER.mkSet(0, 't.0.o1.c2', 68); MKUI.setWahl(1, 2); }); await page.waitForTimeout(200);
  let half = await page.evaluate(() => SYNQUENZER.mkPanel().half || null);
  if (!(await center(page, 'k2'))) { await page.evaluate(() => { MKUI.setHalf(MKUI.P.half === 'A' ? 'B' : 'A'); MKUI.render(); }); await page.waitForTimeout(150); half = await page.evaluate(() => SYNQUENZER.mkPanel().half || null); }
  // the LCD of STEUER 2 for the wave with the longest name
  await page.evaluate(() => { const d = MKUI.knobs()[2]; MKUI.lcdOf(d); });
  const a = await panelCheck(page);
  ok(f + ' OSZ 1 Speicherwelle: Panel ' + a.n + ' Regler im Bild, ohne Überlappung, ≥ 44 px, Beschriftung ohne Überlauf, kein Seiten-Scroll (Hälfte ' + half + ')', a.n > 0 && !a.out.length && !a.ov.length && !a.small.length && !a.lab.length && !a.hscroll && a.lcdIn !== false, JSON.stringify(a));
  await page.screenshot({path: OUT + 'lay-' + f + '-osz1.png'});
  const c = await center(page, 'k2');
  if (c) { await page.mouse.click(c[0], c[1]); await page.waitForTimeout(400); }
  const L = await popCheck(page);
  ok(f + ' Liste der Speicherwellen: im Bild, 64 Zeilen ≥ 44 px, ohne Überlauf, scrollt, gewählte sichtbar', L && L.n === 64 && L.inView && L.minH >= 44 && !L.over.length && !L.head.length && L.scrolls && L.listIn && L.onVis && !L.hscroll, JSON.stringify(L));
  await page.screenshot({path: OUT + 'lay-' + f + '-wavelist.png'});
  await page.evaluate(() => { try { closePop(); } catch (e) {} }); await page.waitForTimeout(150);
  // EDIT-WAHL 2 PATCH 2 with the longest route text
  await page.evaluate(() => { SYNQUENZER.mkSet(0, 't.0.p.1.s', 6); SYNQUENZER.mkSet(0, 't.0.p.1.d', 3); SYNQUENZER.mkSet(0, 't.0.p.1.i', -63); MKUI.setWahl(2, 1); }); await page.waitForTimeout(200);
  if (!(await center(page, 'k0'))) { await page.evaluate(() => { MKUI.setHalf(MKUI.P.half === 'A' ? 'B' : 'A'); MKUI.render(); }); await page.waitForTimeout(150); }
  await page.evaluate(() => { const d = MKUI.knobs()[2]; if (d) MKUI.lcdOf(d); });
  const pa = await panelCheck(page);
  ok(f + ' EDIT-WAHL 2 PATCH 2: Panel im Bild, ohne Überlappung, ≥ 44 px, Beschriftung ohne Überlauf', pa.n > 0 && !pa.out.length && !pa.ov.length && !pa.small.length && !pa.lab.length && !pa.hscroll && pa.lcdIn !== false, JSON.stringify(pa));
  await page.screenshot({path: OUT + 'lay-' + f + '-patch.png'});
  const c0 = await center(page, 'k1');
  if (c0) { await page.mouse.click(c0[0], c0[1]); await page.waitForTimeout(400); }
  const L2 = await popCheck(page);
  ok(f + ' Liste ZIEL: im Bild, 8 Zeilen ≥ 44 px, ohne Überlauf', L2 && L2.n === 8 && L2.inView && L2.minH >= 44 && !L2.over.length && !L2.hscroll, JSON.stringify(L2));
  await page.screenshot({path: OUT + 'lay-' + f + '-patchlist.png'});
  await page.evaluate(() => { try { closePop(); } catch (e) {} });
  // back to SPIEL, close the editor: the main view as before (no page scroll)
  await page.evaluate(() => { MKUI.toSpiel(); SYNQUENZER.closeEditor(); }); await page.waitForTimeout(300);
  const m = await page.evaluate(() => ({h: document.documentElement.scrollWidth > innerWidth, v: document.documentElement.scrollHeight > innerHeight + 1}));
  ok(f + ' nach dem Schließen kein Seiten-Scroll; keine Konsolenfehler', !m.h && !m.v && !errs.length, JSON.stringify(m) + ' ' + errs.join(' | ').slice(0, 300));
  await ctx.close();
}
await b.close(); console.log(fails ? fails + ' FAIL' : 'alles PASS');
