// real touch recordings of the app UI (iPhone 390x844 @3x), one session, segments logged
import { chromium } from 'playwright'; import { APP } from './lib.mjs'; import { loadDemo } from './load.mjs'; import fs from 'fs'; import { startCast, stopCast } from './sc.mjs';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 3, hasTouch: true, isMobile: true});
const p = await ctx.newPage(); let T0 = Date.now();
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + APP); await p.waitForTimeout(1500); await p.touchscreen.tap(5, 300);
await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 15000}).catch(() => {});
await loadDemo(p);
const cdp = await ctx.newCDPSession(p); const cast = await startCast(cdp, 'cast-rec2'); T0 = cast.t0 * 1000;
const W = ms => p.waitForTimeout(ms);
const seg = {}; const mark = (k, e) => { (seg[k] = seg[k] || {})[e] = (Date.now() - T0) / 1000; };
const pos = re => p.evaluate(re => { const e = [...document.querySelectorAll('button')].find(e => new RegExp(re).test(e.textContent.trim()) && e.getBoundingClientRect().width > 0); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, re);
const tap = async (x, y) => { await p.touchscreen.tap(x, y); };
const tapText = async re => { const r = await pos(re); if (r) await tap(r[0], r[1]); else console.log('miss', re); await W(350); return r; };
const drag = async (x, y, dx, dy, ms) => { const n = Math.max(8, Math.round(ms / 16)); await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y}]});
  for (let i = 1; i <= n; i++) { const f = i / n; await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: x + dx * f, y: y + dy * f}]}); await W(ms / n); }
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); };
const knob = async label => p.evaluate(l => { const e = [...document.querySelectorAll('.kn')].find(e => e.parentElement.textContent.startsWith(l) && e.getBoundingClientRect().width > 0); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2 - 36]; }, label);
await W(500);
// ---- klang again
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.selectTrack(0); }); await W(500);
await tapText('^KLANG$'); await W(600); await tapText('^FILTER$'); await W(800);
console.log(await p.evaluate(() => [...document.querySelectorAll('.kn')].slice(0,5).map(e => e.outerHTML.slice(0,200)))); let k = await knob('Cutoff'); console.log('cut', k); mark('klang', 'a');
if (k) { await drag(k[0], k[1], 0, -140, 1600); await W(250); await drag(k[0], k[1], 0, 160, 1600); await W(250); await drag(k[0], k[1], 0, -80, 1000); }
k = await knob('Resonanz'); console.log('res', k); if (k) { await drag(k[0], k[1], 0, -100, 1200); await W(200); await drag(k[0], k[1], 0, 60, 800); }
await W(300); mark('klang', 'b');
await tapText('^✕$|^×$'); await p.evaluate(() => SYNQUENZER.stop()); await W(500);
mark('video', 'a'); await p.evaluate(() => SYNQUENZER.vvOpen()); await W(1000); await tapText('Vorschau'); await W(6500); await tapText('Stopp|■'); await W(300); await tapText('^Video erstellen'); await W(2500); mark('video', 'b');
await p.evaluate(() => SYNQUENZER.vvCancel && SYNQUENZER.vvCancel()); await W(400);
fs.writeFileSync('rec2-seg.json', JSON.stringify(seg, null, 1));
console.log('frames', await stopCast(cdp, cast, 'rec2-ui.mp4')); await ctx.close();
console.log(seg, errs.slice(0, 5)); await b.close();
