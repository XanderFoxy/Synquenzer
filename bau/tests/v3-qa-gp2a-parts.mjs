// shared: build two parts via Xander's touch flow (▶n, ⇅ TRANSP., chords, FANG TEIL, ALS TEIL ✓)
import {sleep} from './v3-qa-gp2a-lib.mjs';
export const ROOT = {Am: 57, F: 53, C: 48, G: 55, Dm: 50, Em: 52, E: 52};
export async function fangRun(T, scene, seq, {ok = true, chipName} = {}) {
  const {p, E} = T;
  const beat = () => E(() => SYNQUENZER.runtime().beat);
  const waitB = b => p.waitForFunction(b => SYNQUENZER.runtime().playing && SYNQUENZER.runtime().beat >= b, b, {timeout: 60000, polling: 5});
  if ((await E(() => SYNQUENZER.runtime().kbMode)) !== 'transpose') { await T.tapSel('#segTr'); await sleep(80); }
  await E(() => { const c = document.querySelector('#coach button'); if (c && c.getClientRects().length) c.click(); });
  const playing = await E(() => SYNQUENZER.runtime().playing);
  await T.tapTxt('button.scn', new RegExp('^▶\\s*' + scene));
  await p.waitForFunction(() => SYNQUENZER.runtime().playing, null, {timeout: 5000});
  // a scene start is a boundary: when running, the scene starts at the next bar
  let b0 = playing ? Math.ceil((await beat()) / 4) * 4 : 0;
  for (let k = 0; k < seq.length; k++) { if (k || playing) await waitB(b0 + k * 4 - 0.12); const isE = seq[k] === 'E'; await E(([n, maj]) => SYNQUENZER.keyOn(n, .8, 'ch'), [ROOT[seq[k]], isE]); await sleep(90); await E(() => SYNQUENZER.keyOff(0, 'ch')); }
  await waitB(b0 + seq.length * 4 + 0.2);
  await T.tapSel('#bFang'); await sleep(200);
  const fp = await E(() => { const f = SYNQUENZER.fangPart(); return f && {len: f.len, name: f.suggest && f.suggest.name, ch: f.chords && f.chords.ch.map(c => c.b + ':' + (c.tg && c.tg.name)), clips: f.clips, end: f.endText}; });
  if (chipName) { await T.tapTxt('.fsheet button', new RegExp('^' + chipName)); await sleep(120); }
  if (ok) { await T.tapSel('.fsheet .fs-ok'); await sleep(250); }
  return {b0, fp};
}
