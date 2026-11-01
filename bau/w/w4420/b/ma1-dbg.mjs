import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const APP = process.argv[2], T = +(process.argv[3] || 1);
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true});
const p = await ctx.newPage();
await p.goto('file://' + APP); await p.waitForTimeout(1200);
await p.touchscreen.tap(5, 300);
await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 15000}).catch(() => {});
await p.waitForTimeout(300);
console.log(JSON.stringify(await p.evaluate((t) => {
  const A = SYNQUENZER; A.setMetronome && A.setMetronome(false);
  const notes = []; for (let k = 0; k < 8; k++) notes.push({t: k * 2, d: 1.5, n: 60 + (k % 3) * 4, v: .9});
  A.setClip(t, 0, {len: 16, notes});
  A.setMod(t, 'lfo2', 'res', .5);
  A.selectTrack(t); A.openEditor(); ED.tab = 'filter'; ED.sub.filter = 'ctl'; safeRebuild(buildSynthEd);
  const s = sndOf(t); return {eng: s.engine, mods: s.mods, res: s.p.res, l2: [s.p.l2rate, s.p.l2sync, s.p.l2shape, s.p.l2retrig, s.p.l2fade], l1: [s.p.l1rate, s.p.l1sync, s.p.l1shape, s.p.l1retrig, s.p.l1fade]};
}, T)));
await p.evaluate((t) => { SYNQUENZER.launchClip(t, 0); SYNQUENZER.play(); }, T);
for (let k = 0; k < 12; k++) {
  console.log(JSON.stringify(await p.evaluate(() => { const k = ED.ctls.find(c => c.dst === 'res' && c.isConnected); const sc = MLIVE.scope; return {dot: k && k._dot, sv2: MLIVE.sv.lfo2, sc: sc && sc.slice(0, 10).map(x => +(+x).toFixed(3)), age: Math.round(performance.now() - MLIVE.at), nv: MLIVE.nv}; })));
  await p.waitForTimeout(150);
}
await b.close();
