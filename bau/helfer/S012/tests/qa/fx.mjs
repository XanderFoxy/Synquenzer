// shared QA helpers
import {sleep} from '../h.mjs';
export const snap = p => p.evaluate(() => ({song: SYNQUENZER.project().song, parts: SYNQUENZER.parts()}));
export const cut = (s, x0, x1) => s.lanes.map(l => l.filter(e => e.bar >= x0 && e.bar < x1));
// FANG TEIL over a Strophe without drums (scene 0, drums stopped) → sheet open
export async function fangNoDrums(p) {
  await p.evaluate(() => { SYNQUENZER.launchScene(1); SYNQUENZER.play(); });
  await p.waitForFunction(() => audBeat() > 9, null, {timeout: 20000});
  await p.evaluate(() => { SYNQUENZER.launchScene(0); setTimeout(() => SYNQUENZER.stopTrackNow(4), 30); });
  await p.waitForFunction(() => audBeat() > 18, null, {timeout: 20000});
  await p.evaluate(() => SYNQUENZER.fangTeil({})); await sleep(250);
}
export const texts = (p, sel) => p.$$eval(sel, bs => bs.map(b => b.textContent.trim()));
