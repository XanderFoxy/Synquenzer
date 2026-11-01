// G9E: Hilfen – Gesang-Take (Fake-Mikro) aufnehmen und Text setzen
import {micOn, g10demo, sleep, waitBeat} from './h-lib.mjs';
export const TEXT = 'Lie-be ist ein Feu-er\nbrennt in mir die gan-ze Nacht\nund ich sing da-von';
export async function takeWithText(p, o = {}) {
  await g10demo(p, o); await micOn(p);
  const st = await p.evaluate(() => SYNQUENZER.tkInfo().stimme);
  await p.evaluate(s => { for (let i = 0; i < NT(); i++) { R.slot[i] = -1; R.pend[i] = null; } SYNQUENZER.selectSlot(s, 0); SYNQUENZER.rec(); }, st);
  await waitBeat(p, 4 * 4 - 3.7); await p.evaluate(() => SYNQUENZER.rec()); await waitBeat(p, 4 * 4 + .3);
  await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy && !SYNQUENZER.tkInfo().pend.length && SYNQUENZER.tkInfo().writes === 0 && SYNQUENZER.runtime().rec.state === 'off', null, {timeout: 30000}); await sleep(400);
  await p.evaluate(() => { SYNQUENZER.stop(); }); await sleep(300);
  const id = await p.evaluate(() => Object.keys(SYNQUENZER.takes())[0]);
  // Marken fest setzen (Fake-Mikro hat keine Silben-Anfänge): alle 0,5 s ab 0,25 s nach dem Clip-Anfang
  await p.evaluate(id => { const m = S.takes[id], a = S.tracks[stimmeT()].clips[0].audio, mk = []; for (let t = a.in + .25; t < a.out - .2; t += .5) mk.push({t: +t.toFixed(6), conf: 1}); m.marks = mk; }, id);
  const r = await p.evaluate(([id, t]) => SYNQUENZER.g9SetAsync(id, {op: 'text', text: t, lang: 'de'}), [id, o.text || TEXT]);
  return {st, id, r};
}
