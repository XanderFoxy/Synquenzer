// FP-KLANG / FP-DSP MK2 in Chromium with real touch input (390x844 and 844x390): Xander's iPhone checkpoints 1 and 2 by touch,
// "≈" in LCD and wave list, the live context gets the wave (mkInfo, mkwNeed asks), longtasks while the list builds all waves.
import {chromium} from 'playwright';
const FILE = new URL('../mk-wt/index.html', import.meta.url).pathname;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const out = [];
for (const [nm, w, h] of [['P1', 390, 844], ['L1', 844, 390]]) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.addInitScript(() => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({entryTypes: ['longtask']}); } catch (e) {} });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(() => { try { ensureAudio(); } catch (e) {} SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await page.waitForTimeout(1200);
  await page.evaluate(() => { window.__need = []; const f = window.mkwPull; window.mkwPull = (E, n) => { window.__need.push([performance.now(), n]); return f(E, n); }; });
  const cdp = await ctx.newCDPSession(page);
  const center = k => page.evaluate(k => { const e = document.querySelector('#synthSheet .mkx[data-k="' + k + '"]'); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height}; }, k);
  const tapAt = async (x, y) => { await page.touchscreen.tap(x, y); await page.waitForTimeout(250); };
  const drag = async (x, y, dy, steps = 14) => { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y}]}); for (let s = 1; s <= steps; s++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x, y: y - dy * s / steps}]}); await page.waitForTimeout(16); } await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await page.waitForTimeout(200); };
  const lcd = () => page.evaluate(() => (window.ED && ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ') : ''));
  const popRows = sel => page.evaluate(sel => [...document.querySelectorAll(sel)].map(b => { const r = b.getBoundingClientRect(); return {t: b.textContent.replace(/\s+/g, ' ').trim(), x: r.x + r.width / 2, y: r.y + r.height / 2, h: r.height, w: r.width}; }), sel);
  const pan = await page.evaluate(() => SYNQUENZER.mkPanel ? SYNQUENZER.mkPanel() : (window.MKUI ? MKUI.panelInfo() : null));
  // 0. EDIT-WAHL 1 -> OSZ 1 (tap = list)
  { const c = await center('w1'); await tapAt(c.x, c.y); const rr = (await popRows('.pop .plist button')).find(x => /OSZ ?1/.test(x.t)); if (rr) await tapAt(rr.x, rr.y); else { console.error('DBG no OSZ 1 row', JSON.stringify((await popRows('.pop .plist button')).map(x => x.t))); } }
  const selW1 = await page.evaluate(() => SYNQUENZER.mkPanel().sel);
  // 1. WELLE (k0 in the OSZ 1 row) -> list -> Speicherwelle
  const k0 = await center('k0'); await tapAt(k0.x, k0.y);
  let rows = await popRows('.pop .plist button');
  const sw = rows.find(r => /Speicherwelle/i.test(r.t)); if (!sw) console.error('DBG WELLE rows', JSON.stringify(rows.map(x => x.t)), await lcd());
  const t0 = await page.evaluate(() => performance.now());
  if (sw) await tapAt(sw.x, sw.y);
  const st1 = await page.evaluate(() => ({w: SYNQUENZER.mkGet(0).t[0].o1.w, c2: SYNQUENZER.mkGet(0).t[0].o1.c2, info: SYNQUENZER.mkInfo ? SYNQUENZER.mkInfo() : (typeof mkInfo === 'function' ? mkInfo() : null), at: MKUI.wv.WV.at}));
  const l1 = await lcd();
  // 2. STEUER 2 tap -> list with 64 rows
  const k2 = await center('k2'); const ltBefore = await page.evaluate(() => window.__lt.length); const tl = await page.evaluate(() => performance.now());
  await tapAt(k2.x, k2.y);
  rows = await popRows('.pop .plist.mkwv button');
  if (!rows.length) { console.error('DBG no list', nm, JSON.stringify(st1), await lcd(), JSON.stringify(k2), await page.evaluate(() => document.querySelector('.pop') ? document.querySelector('.pop').innerText.slice(0, 200) : 'no pop')); await tapAt(k2.x, k2.y); rows = await popRows('.pop .plist.mkwv button'); console.error('DBG second tap rows', rows.length); }
  const heads = await page.evaluate(() => document.querySelectorAll('.pop .plist.mkwv h5').length);
  const noApprox = rows.filter(r => !r.t.includes('≈')).map(r => r.t), small = rows.filter(r => r.h < 44 || r.w < 44).map(r => r.t + ' ' + r.h.toFixed(0));
  // swipe the list down to "Stimme 1" (scroll by touch), then tap it
  for (let k = 0; k < 12; k++) { const r = (await popRows('.pop .plist.mkwv button')).find(x => /^61 /.test(x.t)); if (r && r.y > 60 && r.y < h - 60) break; const L = await page.evaluate(() => { const e = document.querySelector('.pop .plist.mkwv'); const b = e.getBoundingClientRect(); return {x: b.x + b.width / 2, y: b.y + b.height * .75, hh: b.height}; }); await drag(L.x, L.y, L.hh * .5, 8); }
  const r61 = (await popRows('.pop .plist.mkwv button')).find(x => /^61 /.test(x.t));
  const tSel = await page.evaluate(() => performance.now());
  if (r61) await tapAt(r61.x, r61.y);
  await page.waitForTimeout(600);
  const st2 = await page.evaluate(() => ({c2: SYNQUENZER.mkGet(0).t[0].o1.c2, info: mkInfo(), at61: MKUI.wv.WV.at[61], built: MKUI.wv.WV.built.size}));
  const l2 = await lcd();
  // play a note: does the processor still have to ask for the wave?
  await page.evaluate(() => { SYNQUENZER.keyOn(57, .8); }); await page.waitForTimeout(400); await page.evaluate(() => SYNQUENZER.keyOff(57));
  await page.waitForTimeout(3000);   // the rest of the waves in idle slices
  const lt = await page.evaluate(b => window.__lt.slice(b), ltBefore), need = await page.evaluate(() => window.__need), st3 = await page.evaluate(() => ({info: mkInfo(), built: MKUI.wv.WV.built.size}));
  await page.evaluate(() => closePop && closePop());
  out.push({fmt: nm, panel: pan && pan.sel, selW1, wave1: st1, lcd1: l1, listRows: rows.length, heads, noApprox: noApprox.slice(0, 3), small: small.slice(0, 3), tapped61: !!r61, wave61: st2, lcd2: l2, msTo61: st2.at61 ? +(st2.at61 - tSel).toFixed(1) : null, longtasks: lt, mkwNeed: need.length, after3s: st3, errs: errs.slice(0, 3)});
  // 3. PATCH 1: LFO 2 -> CUTOFF +40 (EDIT-WAHL 2 by touch drag)
  const w2 = await center('w2'); const u0 = await page.evaluate(() => SYNQUENZER.undoInfo().n);
  await tapAt(w2.x, w2.y); { const rr = (await popRows('.pop .plist button')).find(x => /PATCH 1/.test(x.t)); if (rr) await tapAt(rr.x, rr.y); else console.error('DBG no PATCH 1 row', JSON.stringify((await popRows('.pop .plist button')).map(x => x.t))); }
  let sel = await page.evaluate(() => SYNQUENZER.mkPanel().sel);
  const pick = async (k, re) => { const c = await center(k); await tapAt(c.x, c.y); const rr = (await popRows('.pop .plist button')).find(x => re.test(x.t)); if (rr) await tapAt(rr.x, rr.y); return !!rr; };
  const q1 = await pick('k0', /LFO ?2/), q2 = await pick('k1', /CUTOFF/);
  const ki = await center('k2'); await drag(ki.x, ki.y, 60, 12);
  const p0 = await page.evaluate(() => SYNQUENZER.mkGet(0).t[0].p[0]), u1 = await page.evaluate(() => SYNQUENZER.undoInfo().n), l3 = await lcd();
  out[out.length - 1].patch = {sel, q1, q2, p0, undoSteps: u1 - u0, lcd: l3};
  await ctx.close();
}
await browser.close();
for (const o of out) { if (o.wave1) delete o.wave1.at; console.log(JSON.stringify(o)); }
