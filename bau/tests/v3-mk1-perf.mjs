// MK1-26 Startzeit (EN3-14) and MK1-27 Regression/DoD (PE1 with the AM panel open, budget) in Chromium.
// Usage: node v3-mk1-perf.mjs <new.html> <predecessor.html>
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
const NEW = path.resolve(process.argv[2]), OLD = path.resolve(process.argv[3]), ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const T = async (id, f) => { if (ONLY && !ONLY.test(id)) return; try { await f(); } catch (e) { ok(id, false, 'Fehler ' + String(e.stack || e).slice(0, 300)); } };
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
const booted = p => p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000, polling: 'raf'}).then(() => p.evaluate(() => performance.now()));
// ---- MK1-27 budget ----
await T('MK1-27 Budget', async () => {
  const a = fs.statSync(OLD).size, b = fs.statSync(NEW).size, d = (b - a) / 1024;
  ok('MK1-27 Budget ≤ +115 KB', d <= 115, `${(a / 1024).toFixed(1)} KB → ${(b / 1024).toFixed(1)} KB: +${d.toFixed(1)} KB`);
});
// ---- MK1-26 boot without AM (median of 5, alternating) ----
await T('MK1-26 ohne AM', async () => {
  const r = {old: [], neu: []};
  for (let k = 0; k < 6; k++) for (const [n, f] of [['old', OLD], ['neu', NEW]]) {
    const ctx = await browser.newContext({viewport: {width: 390, height: 844}}); const p = await ctx.newPage();
    await p.goto('file://' + f); const t = await booted(p); if (k) r[n].push(t);    // the first pair warms the disk cache
    await ctx.close();
  }
  const d = med(r.neu) - med(r.old);
  ok('MK1-26 Projekt ohne AM: Zuwachs ≤ +20 ms (Median aus 5)', d <= 20, `Vorgänger ${med(r.old).toFixed(0)} ms, neu ${med(r.neu).toFixed(0)} ms → ${d >= 0 ? '+' : ''}${d.toFixed(0)} ms ${JSON.stringify(r)}`);
});
// ---- MK1-26 boot with an AM project: ≤ +150 ms, block evaluated at load ----
await T('MK1-26 mit AM', async () => {
  const ctx = await browser.newContext({viewport: {width: 390, height: 844}}); const p = await ctx.newPage();
  await p.goto('file://' + NEW); await booted(p);
  await p.evaluate(async () => { SYNQUENZER.setEngine(0, 'mk'); await autosave.flush(); });
  const am = [], info = [];
  for (let k = 0; k < 6; k++) { await p.reload(); const t = await booted(p); const i = await p.evaluate(() => ({mk: SYNQUENZER.getSound(0).engine, info: SYNQUENZER.mkInfo()})); if (k) { am.push(t); info.push(i); } }
  await ctx.close();
  const c2 = await browser.newContext({viewport: {width: 390, height: 844}}); const p2 = await c2.newPage();
  await p2.goto('file://' + NEW); await booted(p2); await p2.evaluate(async () => { await autosave.flush(); });
  const va = []; for (let k = 0; k < 6; k++) { await p2.reload(); const t = await booted(p2); if (k) va.push(t); }
  await c2.close();
  const d = med(am) - med(va);
  ok('MK1-26 Projekt mit AM-Sound: ≤ +150 ms; der Block ist beim Laden ausgewertet (vor dem Transport)', d <= 150 && info.every(x => x.mk === 'mk' && x.info.loaded),
    `ohne AM ${med(va).toFixed(0)} ms, mit AM ${med(am).toFixed(0)} ms → +${d.toFixed(0)} ms; Block ${info.map(x => x.info.blockMs).join('/')} ms, geladen ${info.every(x => x.info.loaded)}`);
});
// ---- MK1-26 first evaluation of the block: ≤ 150 ms at CPU x4, no longtask > 50 ms without ----
await T('MK1-26 Block', async () => {
  const res = {};
  for (const rate of [1, 4]) {
    const ctx = await browser.newContext({viewport: {width: 844, height: 390}}); const p = await ctx.newPage();
    await p.goto('file://' + NEW); await booted(p);
    const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', {rate});
    res[rate] = await p.evaluate(() => new Promise(r => { const lt = []; let po; try { po = new PerformanceObserver(l => { for (const e of l.getEntries()) lt.push(e.duration); }); po.observe({type: 'longtask'}); } catch (e) {}
      const t0 = performance.now(); mkLoad(); const t1 = performance.now(); setTimeout(() => { po && po.disconnect(); r({blockMs: SYNQUENZER.mkInfo().blockMs, wall: t1 - t0, lt: lt.map(x => Math.round(x))}); }, 300); }));
    await cdp.send('Emulation.setCPUThrottlingRate', {rate: 1}); await ctx.close();
  }
  ok('MK1-26 erste Auswertung ≤ 150 ms bei CPU ×4; ohne Drosselung keine longtask > 50 ms', res[4].blockMs <= 150 && !res[1].lt.some(x => x > 50), JSON.stringify(res));
});
// ---- MK1-26 engine key during the demo (block not yet evaluated): no note > 5 ms late, no beat missing ----
await T('MK1-26 Demo', async () => {
  const ctx = await browser.newContext({viewport: {width: 844, height: 390}, hasTouch: true}); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + NEW); await booted(p);
  await p.evaluate(async () => { const Q = SYNQUENZER; await Q.loadDemo(); Q.setBpm(120); Q.launchScene(0); Q.selectTrack(0); Q.openEditor();
    window.__late = []; const lg = window.logNote; window.logNote = function (e) { const r = lg.apply(this, arguments); try { if (AU.ctx && e && e.time != null && e.src !== 'audition') window.__late.push([AU.ctx.currentTime - e.time, e.track, e.beat]); } catch (x) {} return r; }; });
  await p.waitForTimeout(3000);
  const was = await p.evaluate(() => mkLoaded());
  const tClick = await p.evaluate(() => { const b = document.querySelector('#synthSheet .seg.eng button.mkeb'); const t = AU.ctx.currentTime; b.click(); return t; });
  await p.waitForTimeout(3000);
  const r = await p.evaluate(tc => { const L = window.__late.filter(x => x[0] > -10); const win = L.filter(x => Math.abs(x[0]) < 30); const worst = Math.max(...L.map(x => x[0]));
    // beats of the drum track per bar around the click vs the bars before
    const log = SYNQUENZER.noteLog(2000).filter(n => n.beat != null && n.beat >= 0), dr = S.tracks.findIndex(t => t.kind === 'drum'), bc = {};
    for (const n of log) if (n.track === dr) { const bar = Math.floor(n.beat / 4); bc[bar] = (bc[bar] || 0) + 1; }
    return {worstLateMs: +(worst * 1000).toFixed(1), n: L.length, eng: SYNQUENZER.getSound(0).engine, loaded: mkLoaded(), bars: bc, clickBeat: +t2b(tc).toFixed(2)}; }, tClick);
  const bars = Object.keys(r.bars).map(Number).sort((a, b) => a - b), cb = Math.floor(r.clickBeat / 4), around = bars.filter(b => b >= cb - 3 && b <= cb + 3 && b < bars[bars.length - 1]);
  const counts = around.map(b => r.bars[b]), steady = counts.every(c => c === counts[0]);
  ok('MK1-26 Engine-Knopf „MS 2000“ während der Demo: keine Note > 5 ms nach Plan, kein Schlag fällt aus', !was && r.loaded && r.eng === 'mk' && r.worstLateMs <= 5 && steady && !errs.length,
    JSON.stringify({vorher: was, ...r, bars: undefined, takte: around.map(b => b + ':' + r.bars[b]).join(' '), errs: errs.slice(0, 2)}));
  await ctx.close();
});
// ---- MK1-27 PE1 with the AM panel open (L1 and P1), 10 s demo, a BEND gesture and a rotary gesture ----
for (const [fmt, vp] of [['L1', {width: 844, height: 390}], ['P1', {width: 390, height: 844}]]) await T('MK1-27 PE1 ' + fmt, async () => {
  const ctx = await browser.newContext({viewport: vp, hasTouch: true, isMobile: true}); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + NEW); await booted(p);
  await p.evaluate(async () => { const Q = SYNQUENZER; await Q.loadDemo(); Q.setBpm(120); Q.setEngine(0, 'mk'); Q.launchScene(0); Q.selectTrack(0); Q.openEditor();
    window.__tk = []; const tk = window.tick; clearInterval(AU.timer); AU.timer = setInterval(h => { const t0 = performance.now(); tk(h); window.__tk.push(performance.now() - t0); }, TICK_MS); });
  await p.waitForTimeout(1500);
  const box = k => p.evaluate(k => { const e = k === 'bend' ? document.querySelector('#mkWh .mkwheel[data-w="bend"]') : document.querySelector('#synthSheet .mkx[data-k="' + k + '"]'); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, k);
  const mP = p.evaluate(() => new Promise(res => {
    const lt = []; let po; try { po = new PerformanceObserver(l => { for (const e of l.getEntries()) lt.push(e.duration); }); po.observe({type: 'longtask'}); } catch (e) {}
    const fr = []; let last = performance.now(); const t0 = last; window.__tk.length = 0;
    const f = now => { fr.push(now - last); last = now; if (now - t0 < 10000) requestAnimationFrame(f); else { po && po.disconnect(); const s = fr.slice().sort((a, b) => a - b), tk = window.__tk.slice().sort((a, b) => a - b);
      res({fps: +(1000 / s[s.length >> 1]).toFixed(1), long: lt.filter(x => x > 50).length, tickP95: +tk[Math.floor(tk.length * .95)].toFixed(2), ticks: tk.length}); } };
    requestAnimationFrame(f); }));
  await p.waitForTimeout(2000);
  const b = await box('bend'); await p.mouse.move(b[0], b[1]); await p.mouse.down(); for (let k = 1; k <= 20; k++) { await p.mouse.move(b[0], b[1] - k * 3); await p.waitForTimeout(16); } await p.mouse.up();
  await p.waitForTimeout(1500);
  const w = await box('w1'); await p.mouse.move(w[0], w[1] + 6); await p.mouse.down(); for (let k = 1; k <= 20; k++) { await p.mouse.move(w[0], w[1] + 6 - k * 5); await p.waitForTimeout(16); } await p.mouse.up();
  const m = await mP;
  const te = await p.evaluate(() => SYNQUENZER.tickErrors());
  ok(`MK1-27 PE1 ${fmt} mit offenem AM-Bedienfeld, BEND- und Drehschalter-Zug: ≥ 55 fps, keine longtask > 50 ms, tick-p95 ≤ 4 ms`, m.fps >= 55 && m.long === 0 && m.tickP95 <= 4 && !te && !errs.length, JSON.stringify({...m, tickErrors: te, errs: errs.slice(0, 2)}));
  await ctx.close();
});
await browser.close();
console.log('\n' + (fails ? fails + ' FEHLER' : 'alles bestanden'));
process.exit(fails ? 1 : 0);
