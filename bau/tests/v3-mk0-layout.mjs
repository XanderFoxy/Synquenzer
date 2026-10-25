// MK0 M-PLATZ: banner (locked project), editor notice page, library row of a newer-engine sound in P1 P2 P3 L1 L2 W
// Usage: node v3-mk0-layout.mjs <index.html> <outdir>
import { chromium } from 'playwright';
const [FILE, OUT] = process.argv.slice(2);
const VP = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180]};
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const X = {$: 'snd', v: 1, id: 'u-zukunft-9', name: 'Zukunfts-Klang mit langem Namen', cat: 'lead', engine: 'xyz', ev: 3, p: {a: 1}, mods: [], fx: {}, origin: null, ct: 1, mt: 2};
for (const [k, [w, h]] of Object.entries(VP)) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: k !== 'W'});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(x => { const p = normalizeProject(JSON.parse(JSON.stringify(S))); p.tracks[0].sound = nvWrap(SQStore.normalizeSound(x)); Object.defineProperty(p, '_newer', {value: {f: 5, e: ['xyz'], w: 0}}); applyProject(p, {}); }, X);
  await page.waitForTimeout(500);
  const ban = await page.evaluate(() => { const b = document.getElementById('nvBan'); if (!b) return null; const r = b.getBoundingClientRect(), t = b.querySelector('.cb-t');
    return {x: r.x, y: r.y, w: r.width, h: r.height, sw: document.documentElement.scrollWidth, iw: innerWidth, ih: innerHeight, t: t.scrollWidth <= t.clientWidth + 1,
      btn: [...b.querySelectorAll('button')].map(x => { const q = x.getBoundingClientRect(); return [Math.round(q.width), Math.round(q.height), q.right <= innerWidth + .5]; })}; });
  ok(k + ' banner inside, no overflow, targets >= 44', ban && ban.x >= 0 && ban.x + ban.w <= ban.iw + .5 && ban.y + ban.h <= ban.ih && ban.sw <= ban.iw && ban.t && ban.btn.every(b => b[0] >= 44 && b[1] >= 44 && b[2]), JSON.stringify(ban));
  await page.screenshot({path: OUT + '/mk0-banner-' + k + '.png'});
  await page.evaluate(() => { document.getElementById('nvBan') && document.getElementById('nvBan').remove(); R.selT = 0; openEditor(); });
  await page.waitForTimeout(400);
  const ed = await page.evaluate(() => { const p = document.querySelector('.nvp'); if (!p) return null; const body = p.closest('.pg') && p.closest('.pg').parentElement, r = p.getBoundingClientRect();
    return {r: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], iw: innerWidth, ih: innerHeight, sw: document.documentElement.scrollWidth,
      bodyOk: body ? body.scrollHeight <= body.clientHeight + 1 && body.scrollWidth <= body.clientWidth + 1 : null,
      btn: [...p.querySelectorAll('button')].map(x => { const q = x.getBoundingClientRect(); return [Math.round(q.width), Math.round(q.height), q.bottom <= innerHeight, q.right <= innerWidth]; })}; });
  ok(k + ' editor notice page fits, targets >= 44', ed && ed.bodyOk !== false && ed.sw <= ed.iw && ed.btn.every(b => b[0] >= 44 && b[1] >= 44 && b[2] && b[3]), JSON.stringify(ed));
  await page.screenshot({path: OUT + '/mk0-editor-' + k + '.png'});
  await page.evaluate(x => SYNQUENZER.importSounds({app: 'SYNQUENZER', kind: 'sounds', format: 1, sounds: [x]}), X);
  await page.evaluate(() => { closeSheets(); SYNQUENZER.openBrowser(1); }); await page.waitForTimeout(300);
  await page.evaluate(() => { BR.role = 'eigene'; brRefresh(); }); await page.waitForTimeout(250);
  const row = await page.evaluate(() => { const r = document.querySelector('.brow[data-engine="xyz"]'); if (!r) return null; const q = r.getBoundingClientRect(), sp = r.querySelector('.bmain span');
    return {r: [Math.round(q.x), Math.round(q.width)], iw: innerWidth, sw: document.documentElement.scrollWidth, txt: r.innerText.replace(/\n/g, ' | '), spanFit: sp ? sp.scrollWidth <= sp.clientWidth + 1 || getComputedStyle(sp).textOverflow === 'ellipsis' : null}; });
  ok(k + ' library row with hint', row && /Klang aus neuerer Version/.test(row.txt) && row.r[0] >= 0 && row.r[0] + row.r[1] <= row.iw + .5 && row.sw <= row.iw, JSON.stringify(row));
  await page.screenshot({path: OUT + '/mk0-browser-' + k + '.png'});
  ok(k + ' no console errors', errs.length === 0, errs.join(' | '));
  await ctx.close();
}
await browser.close();
process.exit(fails ? 1 : 0);
