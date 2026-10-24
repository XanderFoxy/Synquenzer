// VS2b live (Worklet) auf echter Stimme: vocadito_1 (Annotation A1, Tonhöhe = gerundet nach Stimmung) und vocadito_10/14 (nur Wechsel zählen)
import fs from 'fs';
import {readWav, resample} from './v3-vs2b-real.mjs';
import {make, liveScore} from './v3-vs2b-live.mjs';
const DIR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/realvox/dl/';
const res = {};
for (const k of ['1', '10', '14']) {
  const w = readWav(DIR + `vocadito_${k}.wav`), x = resample(w.x, w.sr, 48000), W = make(48000, {src: 'voice', lock: false}); W.run(x);
  const L = W.msgs.filter(m => m.lit !== undefined); const on = L.filter(m => m.lit >= 0).length;
  const r = {sec: +(x.length / 48000).toFixed(1), litOn: on};
  if (k === '1') for (const A of ['A1', 'A2']) {
    const ann = fs.readFileSync(DIR + `vocadito_1_notes${A}.csv`, 'utf8').trim().split(/\n/).map(l => l.split(',').map(Number)).map(([o, hz, d]) => ({on: o, off: o + d, midi: Math.round(69 + 12 * Math.log2(hz / 440) + 0.18)}));
    const s = liveScore(W.msgs, ann); r[A] = {notes: ann.length, segs: s.segs, wrong: s.wrong, wrong30: s.wrong30, wob: s.wob, found: s.found, latMed: s.latMed, lat90: s.lat90};
  }
  res['v' + k] = r;
}
console.log(JSON.stringify(res));
