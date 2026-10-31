// QA musiker VV1 (iPhone): is the screen kept awake for the whole „Video erstellen“ job (page stays visible)?
import { open, buildSong } from './n5-v-qm-lib.mjs';
const init = () => { window.__wake = 0; const fake = {request: async () => { window.__wake++; const s = {released: false, addEventListener() {}, release: async () => { s.released = true; }}; return s; }};
  try { Object.defineProperty(navigator, 'wakeLock', {configurable: true, get: () => fake}); } catch (e) {} };
const {b, p, errs} = await open({touch: true, init});
await buildSong(p, {take: false, bars: +(process.env.BARS || 36)});
if (process.env.OPUS) await p.evaluate(() => SYNQUENZER.vvTest({opus: true}));
await p.evaluate(() => { wakeRelease(); SYNQUENZER.vvOpen(); }); await p.waitForTimeout(400);
const go = await p.$('#vvSheet .vvacts .go'); const q = await go.boundingBox(); await p.touchscreen.tap(q.x + q.width / 2, q.y + q.height / 2);
const t0 = Date.now(), log = [];
for (;;) { await p.waitForTimeout(5000); const s = await p.evaluate(() => ({awake: !!(WAKE.sentinel && !WAKE.sentinel.released), busy: SYNQUENZER.vvInfo().busy, prog: (document.querySelector('#vvSheet .vvprog span') || {}).textContent})); log.push(Math.round((Date.now() - t0) / 1000) + 's ' + (s.awake ? 'awake' : 'NOT-AWAKE') + ' ' + (s.busy ? s.prog : 'done')); if (!s.busy) break; }
console.log(log.join(' | ')); console.log('errors', errs);
await b.close();
