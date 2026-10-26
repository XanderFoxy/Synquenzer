// Independent repro: does ■■ (header, real taps) / panic() silence the MS 2000 program DELAY tail? Control: TIEFE 0.
import { chromium } from 'playwright';
const APP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK4/index.html';
async function open(vp) {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({viewport: vp, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + APP); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime, null, {timeout: 20000});
  await p.waitForTimeout(800); return {b, p, errs};
}
const trace = (p, ms) => p.evaluate(async ms => { const Q = window.SYNQUENZER, xs = []; const t0 = performance.now();
  while (performance.now() - t0 < ms) { const m = Q.meter(); xs.push([performance.now() - t0, isFinite(m.rmsDb) ? m.rmsDb : -200]); await new Promise(r => setTimeout(r, 20)); } return xs; }, ms);
const pk = (xs, a, z) => { const v = xs.filter(x => x[0] >= a && x[0] < z).map(x => x[1]); return v.length ? Math.round(Math.max(...v)) : null; };
const cases = process.argv[2] ? process.argv[2].split(',') : ['dbl127', 'dbl0', 'panic127', 'panic0', 'panicMute127'];
for (const vp of [[390, 844], [844, 390]]) for (const cs of cases) {
  const dep = cs.endsWith('127') ? 127 : 0;
  const {b, p, errs} = await open({width: vp[0], height: vp[1]});
  await p.evaluate(async dep => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120);
    Q.setEngine(0, 'mk'); await new Promise(r => setTimeout(r, 300));
    Q.mkSet(0, 'dly.sync', 0); Q.mkSet(0, 'dly.time', 110); Q.mkSet(0, 'dly.dep', dep);
    Q.setClip(0, 0, {len: 1, key: {root: 9, scale: 'aeolian'}, notes: [{t: 0, d: .25, n: 57, v: .9}]}); Q.launchClip(0, 0); }, dep);
  await p.waitForTimeout(4400);   // two loops at 120 BPM
  const mk = await p.evaluate(() => window.SYNQUENZER.mkGet(0).dly);
  let how;
  if (cs.startsWith('dbl')) { await p.tap('#bPlay'); await p.waitForTimeout(350); await p.tap('#bPlay'); how = 'tap ■ ■'; }
  else { await p.tap('#bPlay'); await p.waitForTimeout(1500); await p.evaluate(() => window.SYNQUENZER.panic()); how = 'tap ■, 1.5 s, panic()';
    if (cs.startsWith('panicMute')) { await p.evaluate(() => window.SYNQUENZER.setMute(0, true)); how += ' + setMute(0)'; } }
  const toast = await p.evaluate(() => { const t = document.getElementById('toast'); return t ? t.textContent : null; });
  const xs = await trace(p, cs.startsWith('dbl') ? 4000 : 10000);
  const playing = await p.evaluate(() => window.SYNQUENZER.runtime().playing);
  const out = {vp: vp.join('x'), cs, how, dly: mk, toast, playing, '0-300ms': pk(xs, 0, 300), '0.3-1s': pk(xs, 300, 1000), '1-2s': pk(xs, 1000, 2000), '2-4s': pk(xs, 2000, 4000)};
  if (!cs.startsWith('dbl')) { out['4-7s'] = pk(xs, 4000, 7000); out['7-10s'] = pk(xs, 7000, 10000); }
  out.errs = errs;
  console.log(JSON.stringify(out));
  await b.close();
}
