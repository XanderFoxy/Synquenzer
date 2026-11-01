import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const APP = process.argv[2];
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true});
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + APP); await p.waitForTimeout(1200);
await p.touchscreen.tap(5, 300);
await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 15000}).catch(() => {});
await p.waitForTimeout(300);
const info = await p.evaluate(() => {
  const A = SYNQUENZER; try { if (R.editor) closeEditor(); } catch (e) {}
  A.setMetronome && A.setMetronome(false);
  A.setEngine(0, 'va');
  const notes = []; for (let k = 0; k < 8; k++) notes.push({t: k * 2, d: 1.5, n: 60 + (k % 3) * 4, v: .9});
  A.setClip(0, 0, {len: 16, notes});
  A.setMod(0, 'lfo1', 'cutoff', .5); A.setMod(0, 'lfo2', 'res', .5); A.setMod(0, 'menv', 'cutoff', .3);
  A.selectTrack(0); A.openEditor(); ED.tab = 'filter'; ED.sub.filter = 'ctl'; safeRebuild(buildSynthEd);
  return {ed: R.editor, eng: sndOf(0).engine, mods: sndOf(0).mods, state: SynthHost.state, wk: trackOnWorklet(0)};
});
console.log(JSON.stringify(info));
await p.evaluate(() => { SYNQUENZER.launchClip(0, 0); SYNQUENZER.play(); });
await p.waitForTimeout(500);
const samples = [];
for (let k = 0; k < 20; k++) {
  samples.push(await p.evaluate(() => {
    const o = {};
    for (const k of ED.ctls || []) if (['cutoff', 'res', 'pitch'].includes(k.dst) && k.isConnected) o[k.dst] = [k.hasMod, k._dot != null ? +k._dot.toFixed(3) : null, (k.querySelector('.kdg')||{getAttribute:()=>''}).getAttribute('transform'), k.className];
    const sv = MLIVE.sv; o.sv = [sv.lfo1, sv.lfo2, sv.menv].map(x => +(+x || 0).toFixed(3)); o.scopeAge = Math.round(performance.now() - MLIVE.at);
    return o;
  }));
  await p.waitForTimeout(150);
}
for (const s of samples) console.log(JSON.stringify(s));
await p.screenshot({path: APP.replace(/index\.html$/, 'ma1-repro.png')});
console.log('errs', JSON.stringify(errs));
await b.close();
