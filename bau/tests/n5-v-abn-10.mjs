// keyboard while the Video sheet is open: Escape (§10.5 every sheet closes with Escape), Space during the render, note keys
import { open, SONG8, OUT } from './n5-v-abn-lib.mjs';
const res = {};
{
  const {b, p, errs} = await open();
  await p.evaluate(s => { SYNQUENZER.setSong(s); SYNQUENZER.vvTest({opus: true}); }, SONG8);
  // reference: the menu closes with Escape
  await p.evaluate(() => SYNQUENZER.openMenu()); await p.waitForTimeout(200); await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  res.menuEsc = await p.evaluate(() => EL.menu.classList.contains('open'));
  // Video sheet + Escape
  await p.evaluate(() => { T.recall && null; SYNQUENZER.vvOpen(); }); await p.waitForTimeout(400);
  const before = await p.evaluate(() => ({open: VV.open, carrier: JSON.stringify(T.current()), proj: JSON.stringify(SYNQUENZER.serialize())}));
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  const after = await p.evaluate(() => ({open: VV.open, carrier: JSON.stringify(T.current()), proj: JSON.stringify(SYNQUENZER.serialize())}));
  res.videoEsc = {openBefore: before.open, openAfter: after.open, carrierChanged: before.carrier !== after.carrier, projChanged: before.proj !== after.proj};
  // a note key (A = a note on the computer keyboard) while the sheet is open
  await p.evaluate(() => clearLog());
  await p.keyboard.down('KeyA'); await p.waitForTimeout(150); await p.keyboard.up('KeyA'); await p.waitForTimeout(200);
  res.noteKeyWhileOpen = await p.evaluate(() => ({voices: VOICES.length, recent: RECENT.length, log: noteLog(64).length, open: VV.open}));
  // Space while the sheet is open (not busy)
  await p.keyboard.press('Space'); await p.waitForTimeout(500);
  res.spaceWhileOpen = await p.evaluate(() => ({playing: R.playing, open: VV.open}));
  await p.evaluate(() => { if (R.playing) stop(); }); await p.waitForTimeout(1200);
  res.errs = errs; await b.close();
}
for (const run of [1, 2]) {
  // Space during the offline render (busy): does the video job survive and is the live state intact afterwards?
  const {b, p, errs} = await open();
  await p.evaluate(s => { SYNQUENZER.setSong(s); SYNQUENZER.vvTest({opus: true}); SYNQUENZER.vvOpen(); }, SONG8);
  await p.waitForTimeout(500);
  const proj0 = await p.evaluate(() => JSON.stringify(SYNQUENZER.serialize()));
  await p.evaluate(() => { window.__err = null; window.__jobP = SYNQUENZER.vvMake({fmt: '9:16', view: 'song'}).then(x => { window.__job = x; }, e => { window.__err = String(e && e.message || e); }); });
  await p.waitForTimeout(1500);
  const mid = await p.evaluate(() => ({off: !!VV.off, busy: VV.busy, ctx: AU.ctx && AU.ctx.constructor.name}));
  await p.keyboard.press('Space'); await p.waitForTimeout(100); await p.keyboard.press('Space');
  await p.waitForFunction(() => window.__job || window.__err, null, {timeout: 120000}).catch(() => {});
  await p.waitForTimeout(500);
  const end = await p.evaluate(() => ({job: window.__job ? {dur: +window.__job.dur.toFixed(3), songSec: +window.__job.songSec.toFixed(3), tail: +window.__job.tail.toFixed(3)} : null, err: window.__err, ctx: AU.ctx && AU.ctx.constructor.name, ctxState: AU.ctx && AU.ctx.state, playing: R.playing, timer: !!AU.timer, uiOff: !!UI.vvOff, off: !!VV.off, voices: VOICES.length}));
  const proj1 = await p.evaluate(() => JSON.stringify(SYNQUENZER.serialize()));
  // live playback afterwards
  const lp = await p.evaluate(async () => { clearLog(); const ok = songPlayStart(0); await new Promise(r => setTimeout(r, 2500)); const n = noteLog(256).length; stop(); return {ok, notes: n, ctx: AU.ctx.constructor.name}; });
  res['spaceDuringRender' + run] = {mid, end, projSame: proj0 === proj1, liveAfter: lp, errs};
  await b.close();
}
console.log(JSON.stringify(res, null, 1));
