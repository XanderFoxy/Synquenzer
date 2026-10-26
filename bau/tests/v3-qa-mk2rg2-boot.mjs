// QA regression MK2: start time base 4.9.0 vs new 4.10.0 (fresh, and with a stored project that has an MS 2000 track)
import { chromium } from 'playwright';
import fs from 'fs';
const APP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-base-A.html';
const EXE = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const TMP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-mk2rg2/ud-';
const N = +process.argv[2] || 7, THR = +process.argv[3] || 1;
const med = a => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };
async function once(file, ud, prep) {
  const ctx = await chromium.launchPersistentContext(ud, {executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required'], viewport: {width: 390, height: 844}});
  const p = ctx.pages()[0] || await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  if (THR > 1) { const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', {rate: THR}); }
  await p.addInitScript(() => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({entryTypes: ['longtask']}); } catch (e) {} });
  await p.goto('file://' + file);
  await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.storage && window.SYNQUENZER.storage().booted, null, {timeout: 60000, polling: 5});
  const t = await p.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; return {booted: Math.round(performance.now()), dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd)}; });
  let extra = null;
  if (prep) extra = await p.evaluate(prep);
  await p.waitForTimeout(1500);
  t.lt = await p.evaluate(() => window.__lt.slice()); t.mk = await p.evaluate(() => { const i = window.SYNQUENZER.mkInfo(); return i.loaded; });
  t.tracks = await p.evaluate(() => window.SYNQUENZER.project().tracks.map(x => x.sound ? x.sound.engine : x.kind).join(','));
  t.errs = errs; t.extra = extra;
  await ctx.close(); return t;
}
const prepMk = async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); await new Promise(r => setTimeout(r, 300)); Q.setEngine(3, 'mk'); await new Promise(r => setTimeout(r, 300)); Q.mkSet(3, 't.0.o1.w', 5); Q.mkSet(3, 't.0.o1.c2', 30); Q.setEngine(5, 'mk'); Q.mkSet(5, 't.0.o1.w', 3); await Q.save(); return Q.storage(); };
const res = {};
for (const mode of ['fresh', 'mkproj']) for (const [name, file] of [['base', BASE], ['new', APP]]) {
  const ud = TMP + mode + '-' + name; fs.rmSync(ud, {recursive: true, force: true});
  if (mode === 'mkproj') { const r0 = await once(file, ud, prepMk); console.log('prep', name, JSON.stringify(r0.extra), r0.tracks); }
  res[mode + '-' + name] = [];
  for (let k = 0; k < N; k++) { if (mode === 'fresh') fs.rmSync(ud, {recursive: true, force: true}); res[mode + '-' + name].push(await once(file, ud)); }
}
for (const k of Object.keys(res)) { const a = res[k];
  console.log(k.padEnd(14), 'booted med', med(a.map(x => x.booted)), 'dcl', med(a.map(x => x.dcl)), 'load', med(a.map(x => x.load)), '| all booted', a.map(x => x.booted).join(' '), '| longtasks', JSON.stringify(a.map(x => x.lt)), '| mk loaded', a[0].mk, a[0].tracks, '| errs', JSON.stringify(a.flatMap(x => x.errs)).slice(0, 300)); }
