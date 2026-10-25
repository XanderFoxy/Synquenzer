// QA V2e′ t31: FANG chip drag aborted (guard, transport, pointercancel, before open) → FANG sheet back, catch kept, nothing stored
import { openVp, T, SETUP55, sleep, mkCheck } from './v3-qa-v2e2-lib.mjs';
const VP = process.argv[2] || 'P1';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp(VP);
const t = T(p, cdp), E = t.E;
await E(SETUP55(false)); await E(() => window.SYNQUENZER.songView(false)); await sleep(300);
await E(() => { const Q = window.SYNQUENZER; Q.setBpm(240); Q.setMetronome && Q.setMetronome(false); Q.launchClip(4, 0); Q.launchClip(0, 0); Q.launchClip(1, 1); return 1; });
await p.waitForFunction(() => window.SYNQUENZER.runtime().playing, null, {timeout: 5000});
await p.waitForFunction(() => window.SYNQUENZER.runtime().beat >= 8.2, null, {timeout: 20000, polling: 5});
await E(() => window.SYNQUENZER.fangTeil({beat: window.SYNQUENZER.runtime().beat}));
await sleep(300);
const PF = await t.full();
const fsheet = async () => ((await t.pop()) || '').includes('fsheet');
console.log('fang sheet open', await fsheet(), 'fangPart', !!(await E(() => window.SYNQUENZER.fangPart())));
const scen = [
  ['guard (auto-open, release without moving)', async c => { await t.down(c.cx, c.cy); await sleep(1150); await t.up(); }],
  ['release over transport', async c => { await t.down(c.cx, c.cy); await sleep(1150); const inf = await t.info(); await t.glide(c.cx, c.cy, inf.canvas.x + 60, inf.canvas.y + 60, 5, 16); const r = await t.rect('.sv-play'); await t.glide(inf.canvas.x + 60, inf.canvas.y + 60, r.cx, r.cy, 5, 16); await t.up(); }],
  ['pointercancel while dragging', async c => { await t.down(c.cx, c.cy); await sleep(600); await t.glide(c.cx, c.cy, c.cx + 30, c.cy - 30, 3, 16); await t.cancel(); }],
  ['release while dragging before open', async c => { await t.down(c.cx, c.cy); await sleep(500); await t.glide(c.cx, c.cy, c.cx + 30, c.cy - 30, 3, 16); await t.up(); }],
];
for (const [tag, fn] of scen) {
  const c = await t.rect('.fsheet .fs-chip');
  if (!c) { check(`${VP} FANG chip available before: ${tag}`, false); break; }
  await fn(c); await sleep(500);
  const ok = await fsheet(), fp = await E(() => !!window.SYNQUENZER.fangPart()), same = (await t.full()) === PF;
  check(`${VP} FANG drag aborted (${tag}) → FANG sheet open again, catch kept, data unchanged`, ok && fp && same && !(await t.songOn()), {sheet: ok, fangPart: fp, same, songOn: await t.songOn(), pop: await t.pop()});
}
await E(() => window.SYNQUENZER.stop && window.SYNQUENZER.stop());
check('0 console errors', errs.length === 0, errs);
await b.close();
process.exit(done());
