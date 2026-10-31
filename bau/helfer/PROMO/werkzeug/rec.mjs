// real touch recordings of the app UI (iPhone 390x844 @3x), one session, segments logged
import { chromium } from 'playwright'; import { APP } from './lib.mjs'; import { loadDemo } from './load.mjs'; import fs from 'fs'; import { startCast, stopCast } from './sc.mjs';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 3, hasTouch: true, isMobile: true});
const p = await ctx.newPage(); let T0 = Date.now();
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + APP); await p.waitForTimeout(1500); await p.touchscreen.tap(5, 300);
await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 15000}).catch(() => {});
await loadDemo(p);
const cdp = await ctx.newCDPSession(p); const cast = await startCast(cdp, 'cast-rec'); T0 = cast.t0 * 1000;
const W = ms => p.waitForTimeout(ms);
const seg = {}; const mark = (k, e) => { (seg[k] = seg[k] || {})[e] = (Date.now() - T0) / 1000; };
const pos = re => p.evaluate(re => { const e = [...document.querySelectorAll('button')].find(e => new RegExp(re).test(e.textContent.trim()) && e.getBoundingClientRect().width > 0); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, re);
const tap = async (x, y) => { await p.touchscreen.tap(x, y); };
const tapText = async re => { const r = await pos(re); if (r) await tap(r[0], r[1]); else console.log('miss', re); await W(350); return r; };
const drag = async (x, y, dx, dy, ms) => { const n = Math.max(8, Math.round(ms / 16)); await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y}]});
  for (let i = 1; i <= n; i++) { const f = i / n; await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: x + dx * f, y: y + dy * f}]}); await W(ms / n); }
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); };
const knob = async label => p.evaluate(l => { const e = [...document.querySelectorAll('.kn')].find(e => e.textContent.includes(l) && e.getBoundingClientRect().width > 0); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2 - 30]; }, label);
await W(500);
// ---- 1 matrix: launch scenes while playing
mark('matrix', 'a'); await p.evaluate(() => SYNQUENZER.play()); await W(1200);
for (const re of ['^▶\\s*2', '^▶\\s*3', '^▶\\s*4', '^▶\\s*2']) { await tapText(re); await W(1700); }
mark('matrix', 'b');
// ---- 2 synth: bass filter, turn cutoff
await p.evaluate(() => SYNQUENZER.selectTrack(0)); await W(300); mark('klang', 'a');
await tapText('^KLANG$'); await W(600); await tapText('^FILTER$'); await W(600);
let k = await knob('Cutoff'); if (k) { await drag(k[0], k[1], 0, -150, 1800); await W(300); await drag(k[0], k[1] - 10, 0, 170, 1800); await W(300); await drag(k[0], k[1], 0, -60, 900); }
k = await knob('Resonanz'); if (k) { await drag(k[0], k[1], 0, -90, 1200); }
await W(500); mark('klang', 'b');
// ---- 3 FM arp: algorithm + operators
await p.evaluate(() => SYNQUENZER.selectTrack(1)); await W(700); mark('fm', 'a');
await tapText('^FM$'); await W(500);
const alg = await pos('^›$|^>$'); 
for (let i = 0; i < 3; i++) { const r = await p.evaluate(() => { const e = [...document.querySelectorAll('button')].filter(e => /^[›>]$/.test(e.textContent.trim()) && e.getBoundingClientRect().y < 300 && e.getBoundingClientRect().width > 0)[0]; if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }); if (r) await tap(r[0], r[1]); await W(800); }
for (let i = 0; i < 3; i++) { const r = await p.evaluate(() => { const e = [...document.querySelectorAll('button')].filter(e => /^[‹<]$/.test(e.textContent.trim()) && e.getBoundingClientRect().y < 300 && e.getBoundingClientRect().width > 0)[0]; if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }); if (r) await tap(r[0], r[1]); await W(600); }
await drag(110, 330, 0, -50, 1000); await drag(150, 330, 0, 60, 1000); await W(400); mark('fm', 'b');
// ---- 4 drums
await p.evaluate(() => SYNQUENZER.selectTrack(4)); await W(700); mark('drums', 'a');
for (const re of ['^SNARE', '^CLAP', '^KICK']) { await tapText(re); await W(300); }
k = await knob('Decay'); if (k) await drag(k[0], k[1], 0, -80, 1200);
const pads = await p.evaluate(() => [...document.querySelectorAll('button')].filter(e => e.getBoundingClientRect().y > 640 && e.getBoundingClientRect().width > 50).map(e => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }));
const patt = [0, 2, 1, 2, 0, 0, 1, 3, 0, 2, 1, 2, 4, 5, 6, 7];
for (const i of patt) { const q = pads[i]; if (q) await tap(q[0], q[1]); await W(250); }
mark('drums', 'b');
// ---- 5 record a clip on the lead track (keyboard)
await tapText('^✕$|^×$'); await W(400);
await p.evaluate(() => { SYNQUENZER.selectTrack(5); SYNQUENZER.selectSlot && SYNQUENZER.selectSlot(5, 7); }); await W(600); mark('rec', 'a');
await tapText('AUTO'); await W(1500);
const keys = await p.evaluate(() => [...document.querySelectorAll('.wk, .key.w, [data-n]')].filter(e => e.getBoundingClientRect().width > 15 && e.getBoundingClientRect().y > 500).slice(0, 14).map(e => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height * .8]; }));
const yk = 800, wx = i => 19 + i * 38.5;
const melody = [4, 6, 4, 3, 2, 2, 3, 2, 0, 2, 3, 4, 4, 6, 7, 6];
for (const i of melody) { await tap(keys[i] ? keys[i][0] : wx(i), keys[i] ? keys[i][1] : yk); await W(255); }
await W(1500); await tapText('AUTO|●'); await W(1200); mark('rec', 'b');
// ---- 6 song view
await p.evaluate(() => SYNQUENZER.stop()); await W(300);
mark('song', 'a'); await tapText('^SONG'); await W(600); await p.evaluate(() => SYNQUENZER.songPlay && SYNQUENZER.songPlay()); await W(7000); mark('song', 'b');
await p.evaluate(() => SYNQUENZER.stop()); await W(300);
// ---- 7 video sheet
await tapText('⇄|✕'); await W(400);
mark('video', 'a'); await p.evaluate(() => SYNQUENZER.vvOpen()); await W(1200); await tapText('^Video erstellen'); await W(7000); mark('video', 'b');
await p.evaluate(() => SYNQUENZER.vvCancel && SYNQUENZER.vvCancel()); await W(500);
fs.writeFileSync('rec-seg.json', JSON.stringify(seg, null, 1));
console.log('frames', await stopCast(cdp, cast, 'rec-ui.mp4')); await ctx.close();
console.log(seg, errs.slice(0, 5), {keys: keys.length, pads: pads.length}); await b.close();
