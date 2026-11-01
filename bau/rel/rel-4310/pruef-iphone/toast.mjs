// Nachweis: Hinweis „Take n gelöscht · Rückgängig“ bei offenem Takes-Blatt – wo liegt er, was trifft der Finger?
// Aufruf: node toast.mjs <app.html> W H [weg]   weg = wisch | x | x2 (✕ der Zeile, ✕ Löschen in der Bearbeiten-Zeile)
import {createRequire} from 'module'; const {chromium} = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const APP = process.argv[2], W = +process.argv[3] || 428, H = +process.argv[4] || 926, WEG = process.argv[5] || 'wisch', T = W + 'x' + H + ' ' + WEG;
const OUT = new URL('./bilder/', import.meta.url).pathname; fs.mkdirSync(OUT, {recursive: true});
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await b.newContext({viewport: {width: W, height: H}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + APP); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 30000}); await sleep(900);
await p.evaluate(async () => { closePop(); ensureAudio(); for (let k = 0; k < 50 && !(AU.ctx && AU.ctx.state === 'running'); k++) await new Promise(r => setTimeout(r, 100)); });
const cdp = await ctx.newCDPSession(p);
const tap = async (x, y) => { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y}]}); await sleep(40); await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); };
async function drag(x0, y0, x1, y1, steps = 14) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: x0, y: y0}]}); for (let i = 1; i <= steps; i++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: x0 + (x1 - x0) * i / steps, y: y0 + (y1 - y0) * i / steps}]}); await sleep(16); } await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); }
await p.evaluate(() => SYNQUENZER.setSong({bars: 8, lanes: []}));
const pcm = k => { const sr = 48000, n = 3 * sr, a = new Array(n).fill(0), t0 = .1 + (k % 5) * .4; for (let i = Math.round(t0 * sr); i < Math.round((t0 + .6) * sr); i++) a[i] = Math.round(12000 * Math.sin(2 * Math.PI * 220 * i / sr)); return a; };
for (let k = 0; k < 7; k++) { await p.evaluate(a => SYNQUENZER.tkInject({pcm: a, scene: 0, len: 1}), pcm(k)); await sleep(5); }
await p.evaluate(() => { closePop(); SYNQUENZER.tkSheet({t: SYNQUENZER.tkInfo().stimme, s: 0}); }); await sleep(500);
const nos = () => p.evaluate(() => SYNQUENZER.g10cInfo().nos.join(','));
console.log(T, 'vorher Takes:', await nos());
await p.evaluate(() => UI.pop.el.querySelector('.g10c-row[data-k="3"]').scrollIntoView({block: 'nearest'})); await sleep(150);
const r = await p.evaluate(() => { const e = UI.pop.el.querySelector('.g10c-row[data-k="3"] .g10c-pick').getBoundingClientRect(); const d = UI.pop.el.querySelector('.g10c-row[data-k="3"] .tk-del').getBoundingClientRect(); return {l: e.left, w: e.width, y: e.top + e.height / 2, dx: d.left + d.width / 2, dy: d.top + d.height / 2}; });
if (WEG === 'wisch') await drag(r.l + r.w * .8, r.y, r.l + r.w * .8 - 170, r.y + 5);
else if (WEG === 'x') await tap(r.dx, r.dy);
else { await tap(r.l + 20, r.y); }
await sleep(300);
if (WEG === 'x2') {   // Halten → Bearbeiten → ✕ Löschen
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: r.l + 20, y: r.y}]}); await sleep(700); await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await sleep(300);
  const d2 = await p.evaluate(() => { const e = UI.pop.el.querySelector('.g10c-del2'); e.scrollIntoView({block: 'nearest'}); const q = e.getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height / 2}; }); await sleep(150);
  await tap(d2.x, d2.y); await sleep(300);
}
console.log(T, 'nach dem Löschen:', await nos());
const t = await p.evaluate(() => {
  const t = document.getElementById('toast'), bt = t && t.querySelector('button'); if (!bt || !t.classList.contains('show')) return {show: false};
  const r = bt.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, h = document.elementFromPoint(x, y);
  const anc = []; for (let e = t; e && e !== document.body; e = e.parentElement) anc.push((e.id ? '#' + e.id : '') + (e.className ? '.' + String(e.className).split(' ').join('.') : '') + ' z=' + getComputedStyle(e).zIndex + ' pos=' + getComputedStyle(e).position);
  return {show: true, txt: t.textContent, cls: t.className, parent: anc, btn: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], x, y, hit: h ? h.tagName + '.' + h.className + ' ' + (h.getAttribute('aria-label') || h.textContent.trim().slice(0, 30)) : null, hitInBtn: !!(h && bt.contains(h))};
});
console.log(T, 'Hinweis:', JSON.stringify(t));
await p.screenshot({path: OUT + 'toast-' + W + 'x' + H + '-' + WEG + '.png'});
if (t.show) { await tap(t.x, t.y); await sleep(400); }
console.log(T, 'nach Fingertipp auf „Rückgängig“:', await nos(), 'Blatt:', await p.evaluate(() => UI.pop && UI.pop.name), 'Konsole:', JSON.stringify(errs.slice(0, 3)));
await p.screenshot({path: OUT + 'toast-' + W + 'x' + H + '-' + WEG + '-nachtipp.png'});
await b.close();
