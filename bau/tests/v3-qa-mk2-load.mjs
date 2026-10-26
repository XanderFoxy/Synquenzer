// QA MK2-08: time from loading a sound (setSound) to the post of its wave into the live context, cold (fresh page), several runs;
// longtasks while all 64 build; table bytes per context; second AM track 0 bytes
import {launch, openApp} from './v3-qa-mk2-lib.mjs';
const FILE = process.argv[2] || new URL('../mk-wt/index.html', import.meta.url).pathname;
const b = await launch();
const LT = () => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]); }).observe({entryTypes: ['longtask']}); } catch (e) {} };
const res = {};
for (const n of [23, 61, 35, 7, 64]) {
  res[n] = [];
  for (let k = 0; k < 4; k++) {
    const {ctx, page} = await openApp(b, FILE, {init: LT});
    const r = await page.evaluate(async n => {
      SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); ensureAudio(); await new Promise(r => setTimeout(r, 600));
      const W = mkLoad().wv.WV, sent = () => { const c = W.ctx.get(AU.ctx); return c && c.sent.has(n); };
      const s = SYNQUENZER.getSound(0); s.p.mk.t[0].o1.w = 5; s.p.mk.t[0].o1.c2 = 2 * n - 2; window.__lt.length = 0;
      const t0 = performance.now(); SYNQUENZER.setSound(0, s); const t1 = performance.now();
      while (!sent() && performance.now() - t0 < 3000) await new Promise(r => setTimeout(r, 0));
      return {post: W.at[n] - t0, setSound: t1 - t0, lt: window.__lt.filter(x => x[1] > 50).map(x => Math.round(x[1]))};
    }, n);
    res[n].push(r); await ctx.close();
  }
  console.log('wave', n, 'load->post ms', res[n].map(x => x.post.toFixed(1)).join(' '), '| setSound sync ms', res[n].map(x => x.setSound.toFixed(1)).join(' '), '| longtasks', JSON.stringify(res[n].map(x => x.lt)));
}
// all 64 + longtasks, bytes, second track
{
  const {ctx, page, errs} = await openApp(b, FILE, {init: LT});
  const r = await page.evaluate(async () => {
    SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); ensureAudio(); await new Promise(r => setTimeout(r, 600));
    const M = mkLoad(); const s = SYNQUENZER.getSound(0); s.p.mk.t[0].o1.w = 5; s.p.mk.t[0].o1.c2 = 2 * 61 - 2; SYNQUENZER.setSound(0, s);
    window.__lt.length = 0; const t0 = performance.now(); M.wv.all();
    while (M.wv.WV.built.size < 64 && performance.now() - t0 < 30000) await new Promise(r => setTimeout(r, 20));
    // post the rest by touching each wave once on track 0 (gesture path): need() for every wave
    const E = AU.synth[0]; for (let n = 1; n <= 64; n++) M.wv.need(E, n);
    await new Promise(r => setTimeout(r, 500));
    const i1 = SYNQUENZER.mkInfo(), lt = window.__lt.filter(x => x[1] > 50).map(x => Math.round(x[1]));
    SYNQUENZER.setEngine(1, 'mk'); const s1 = SYNQUENZER.getSound(0); s1.p.mk.t[0].o1.c2 = 2 * 35 - 2; SYNQUENZER.setSound(1, s1);
    SYNQUENZER.setEngine(2, 'mk'); const s2 = SYNQUENZER.getSound(0); s2.p.mk.t[0].o1.c2 = 2 * 40 - 2; SYNQUENZER.setSound(2, s2);
    await SYNQUENZER.audition(1, 60, 300); await SYNQUENZER.audition(2, 64, 300); await new Promise(r => setTimeout(r, 1500));
    return {ms: performance.now() - t0, i1, i2: SYNQUENZER.mkInfo(), lt};
  });
  console.log('all 64:', JSON.stringify(r), 'errors', errs.length);
  await ctx.close();
}
await b.close();
