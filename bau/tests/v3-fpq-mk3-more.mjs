// FP-TOUCH: ⋯ → Timbre kopieren on a track whose GERÄT panel is not shown (FX tab): which track receives the copy?
import { chromium } from 'playwright';
const FILE = new URL('../mk-br-MK3/index.html', import.meta.url).pathname;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (const [w, h, lab] of [[390, 844, 'P1'], [844, 390, 'L1']]) {
const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true});
const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
const tapSel = async (fn) => { const p = await page.evaluate(fn); if (!p) return false; await page.touchscreen.tap(p[0], p[1]); await page.waitForTimeout(300); return true; };
const btn = txt => `(() => { const b = [...document.querySelectorAll('#synthSheet button, #synthSheet [role=tab], #synthSheet .tab')].find(x => x.offsetParent && x.textContent.trim() === ${JSON.stringify(txt)}); if (!b) return null; const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })()`;
await page.evaluate(async () => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.setEngine(1, 'mk'); SYNQUENZER.mkSet(0, 't.0.f.cut', 50); await SYNQUENZER.saveSound(0, 'Quelle A', 'new'); SYNQUENZER.mkSet(0, 't.0.f.cut', 127);
  SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
await page.waitForTimeout(500);
const p0 = await page.evaluate(() => MKUI.P.i);
const fxOk = await tapSel(btn('FX'));
await page.evaluate(() => closeEditor()); await page.waitForTimeout(200);
await page.evaluate(() => { SYNQUENZER.selectTrack(1); SYNQUENZER.openEditor(); }); await page.waitForTimeout(500);
const st = await page.evaluate(() => ({Pi: MKUI.P.i, sel: R.selT, panel: !!document.querySelector('#synthSheet .mkx[data-k="timbre"]'), tabs: [...document.querySelectorAll('#synthSheet button')].filter(b => b.offsetParent && /^(GERÄT|FX)$/.test(b.textContent.trim())).map(b => b.textContent.trim() + (b.classList.contains('on') || b.getAttribute('aria-selected') === 'true' ? '*' : ''))}));
const more = await tapSel(`(() => { const b = [...document.querySelectorAll('#synthSheet button')].find(x => x.offsetParent && (x.textContent.trim() === '⋯' || x.getAttribute('aria-label') === 'Mehr')); if (!b) return null; const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })()`);
const menu = await page.evaluate(() => [...document.querySelectorAll('.pop button[data-a]')].map(b => b.dataset.a));
const c0 = await page.evaluate(() => [SYNQUENZER.mkGet(0).t[0].f.cut, SYNQUENZER.mkGet(1).t[0].f.cut]);
let res = 'kein tcopy';
if (menu.includes('tcopy')) {
  await tapSel(`(() => { const b = document.querySelector('.pop button[data-a="tcopy"]'); const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })()`);
  const hdr = await page.evaluate(() => { const p = document.querySelector('.pop h4'); return p ? p.textContent : null; });
  const rows = await page.evaluate(() => [...document.querySelectorAll('.pop .mkcp .mkcr b')].map(b => b.textContent));
  const hit = await tapSel(`(() => { const r = [...document.querySelectorAll('.pop .mkcp .mkcr')].find(x => /Quelle A/.test(x.textContent) && !/dieser Sound/.test(x.textContent)); const b = r && r.querySelectorAll('button')[0]; if (!b) return null; const q = b.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; })()`);
  await page.waitForTimeout(300);
  const c1 = await page.evaluate(() => [SYNQUENZER.mkGet(0).t[0].f.cut, SYNQUENZER.mkGet(1).t[0].f.cut]);
  const lcdT = await page.evaluate(() => (ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ') : ''));
  res = 'Kopf "' + hdr + '" Zeilen ' + JSON.stringify(rows) + ' Treffer ' + hit + '; T1-CUTOFF Spur 0/1 vorher ' + c0.join('/') + ' nachher ' + c1.join('/') + ' | LCD ' + lcdT.slice(0, 90);
}
console.log(lab + ': P.i nach Spur 0 ' + p0 + ', FX getippt ' + fxOk + '; Spur 1 offen: ' + JSON.stringify(st) + '; ⋯ ' + more + ' ' + JSON.stringify(menu) + '; ' + res + '; Fehler ' + errs.length + ' ' + errs.join(' ').slice(0, 200));
await ctx.close();
}
await browser.close();
