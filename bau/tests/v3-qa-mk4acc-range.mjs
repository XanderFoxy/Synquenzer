// every effect knob: drag far down then far up on the real panel (L1): the stored value reaches the range ends; display/LCD per end
import { chromium } from 'playwright';
const FILE = process.argv[2];
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await browser.newContext({viewport: {width: 844, height: 390}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
await page.evaluate(() => { SYNQUENZER.newProject({init: true}); }); await page.waitForTimeout(300);
await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await page.waitForTimeout(700);
const box = k => page.evaluate(k => { const e = document.querySelector('#synthSheet .mkx[data-k="' + k + '"]'); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height}; }, k);
async function drag(k, dy) { const b = await box(k); const x = b.x + b.w / 2, y = b.y + b.h / 2; await page.mouse.move(x, y); await page.mouse.down(); const st = 20; for (let s = 1; s <= st; s++) { await page.mouse.move(x, y - dy * s / st); } await page.mouse.up(); await page.waitForTimeout(80); }
const get = p => page.evaluate(p => SYNQUENZER.mkGet(0)[p.split('.')[0]][p.split('.')[1]], p);
const info = () => page.evaluate(() => ({disp: SYNQUENZER.mkPanel().disp, lcd: ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ') : ''}));
const rows = [];
for (const [pos, k, p, lo, hi] of [[4, 'k1', 'mfx.spd', 0, 127], [4, 'k2', 'mfx.dep', 0, 127], [5, 'k2', 'dly.time', 0, 127], [5, 'k3', 'dly.dep', 0, 127], [6, 'k0', 'eq.lf', 40, 1000], [6, 'k1', 'eq.lg', -12, 12], [6, 'k2', 'eq.hf', 1000, 18000], [6, 'k3', 'eq.hg', -12, 12]]) {
  await page.evaluate(pos => MKUI.setWahl(2, pos), pos); await page.waitForTimeout(80);
  for (let i = 0; i < 3; i++) await drag(k, -300);
  const a = await get(p), ia = await info();
  for (let i = 0; i < 3; i++) await drag(k, 300);
  const b = await get(p), ib = await info();
  rows.push([p, a, b, ia.disp, ib.disp, ib.lcd]);
  console.log((a === lo && b === hi ? 'PASS' : 'FAIL') + ' ' + p + ' reicht ' + lo + ' … ' + hi + ' — ' + a + ' / ' + b + ' | Anzeige ' + ia.disp + ' / ' + ib.disp + ' | LCD ' + ia.lcd + ' / ' + ib.lcd);
}
// NOTE (sync on): drag ends 0 / 14
await page.evaluate(() => { SYNQUENZER.mkSet(0, 'dly.sync', 1); MKUI.setWahl(2, 5); }); await page.waitForTimeout(80);
for (let i = 0; i < 3; i++) await drag('k2', -300); const n0 = await get('dly.note'), d0 = await info();
for (let i = 0; i < 3; i++) await drag('k2', 300); const n1 = await get('dly.note'), d1 = await info();
console.log((n0 === 0 && n1 === 14 ? 'PASS' : 'FAIL') + ' dly.note reicht 1/32 … 1/1 — ' + n0 + ' / ' + n1 + ' | Anzeige ' + d0.disp + ' / ' + d1.disp + ' | LCD ' + d0.lcd + ' / ' + d1.lcd);
console.log(errs.length ? 'FAIL Konsolenfehler ' + errs.join(' | ') : 'PASS keine Konsolenfehler');
await browser.close();
