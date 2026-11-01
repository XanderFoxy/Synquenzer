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
const pre = await p.evaluate(() => ({tracks: S.tracks.map((t, i) => [i, t.kind, t.sound && t.sound.engine, !!AU.synth[i]]), host: SynthHost.state}));
console.log(JSON.stringify(pre));
const snap = () => p.evaluate(() => { const o = {}; for (const k of ED.ctls || []) if (['cutoff', 'res'].includes(k.dst) && k.isConnected) o[k.dst] = [k.hasMod, k._dot != null ? +k._dot.toFixed(3) : null, k.className.replace('knob mctl ', '')]; o.wk = trackOnWorklet(R.selT); o.E = !!AU.synth[R.selT]; return o; });
const series = async (n = 6) => { const r = []; for (let k = 0; k < n; k++) { r.push(await snap()); await p.waitForTimeout(120); } return r; };
// S1: track 1, routes set, editor opened before any note
await p.evaluate(() => {
  const A = SYNQUENZER; A.setMetronome && A.setMetronome(false);
  const t = 1; const notes = []; for (let k = 0; k < 8; k++) notes.push({t: k * 2, d: 1.5, n: 60 + (k % 3) * 4, v: .9});
  A.setClip(t, 0, {len: 16, notes});
  A.setMod(t, 'lfo1', 'cutoff', .5); A.setMod(t, 'lfo2', 'res', .5);
  A.selectTrack(t); A.openEditor(); ED.tab = 'filter'; ED.sub.filter = 'ctl'; safeRebuild(buildSynthEd);
});
console.log('S1 stopped', JSON.stringify(await series(3)));
await p.evaluate(() => { SYNQUENZER.launchClip(1, 0); SYNQUENZER.play(); });
await p.waitForTimeout(600);
console.log('S1 playing', JSON.stringify(await series(5)));
// S2: mod mode lfo1
await p.evaluate(() => SYNQUENZER.modMode('lfo1'));
console.log('S2 modmode lfo1', JSON.stringify(await series(4)));
await p.evaluate(() => SYNQUENZER.modMode(null));
for (const eng of ['fm', 'wt']) {
  await p.evaluate(e => { SYNQUENZER.setEngine(1, e); SYNQUENZER.setMod(1, 'lfo2', 'res', .5); ED.tab = 'filter'; safeRebuild(buildSynthEd); }, eng);
  await p.waitForTimeout(400);
  console.log('S3 ' + eng, JSON.stringify(await series(4)));
}
console.log('errs', JSON.stringify(errs));
await b.close();
