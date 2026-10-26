// does an effect edit count as "geändert" (dot + A/B)? soundHash of a sound with changed mfx/dly/eq vs. the saved one
import {open, sleep} from './v3-qa-gmk4-tl.mjs';
const T = await open({viewport: {width: 428, height: 926}}); const {p, E, errs} = T;
await E(() => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); ensureAudio(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); });
await sleep(800);
const r = await E(async () => { const Q = SYNQUENZER; await Q.saveSound(0, 'AB Basis', 'new'); const s0 = Q.getSound(0); const out = {origin: s0.origin, ed0: Q.soundEdited(0)};
  const base = JSON.parse(JSON.stringify(s0));
  for (const [k, v] of [['dly.dep', 30], ['mfx.dep', 50], ['eq.hg', -6], ['t.0.f.cut', 40]]) { Q.mkSet(0, k, v); out[k] = Q.soundEdited(0); out['h_' + k] = SQStore.soundHash(Q.getSound(0)) !== SQStore.soundHash(base); Q.undo(); }
  return out; });
console.log(JSON.stringify(r));
await T.br.close();
