import {render, mkPatch} from './v3-mk1-node.mjs';
import {mKlick, rms} from './v3-mk1-ana.mjs';
const SR = 48000, SOFT = {e2: {a: 60, d: 64, s: 127, r: 60}};
const FXP = fx => Object.assign(mkPatch(SOFT), fx);
const ev = [[0, 'on', 48, .8], [0, 'on', 55, .7]];
for (const [nm, fx, at] of [['dry', {}, []], ['dly no change', {dly: {type: 0, sync: 1, note: 11, dep: 100}}, []], ['dly 120->40', {dly: {type: 0, sync: 1, note: 11, dep: 100}}, [[1.2, {tempo: {bpm: 40}}], [2.6, {tempo: {bpm: 120}}]]],
  ['time jumps', {dly: {type: 0, sync: 0, time: 90, dep: 100}}, [[.6, {mkSet: {'dly.time': 110}}], [1.0, {mkSet: {'dly.time': 60}}], [1.6, {mkSet: {'dly.time': 100}}], [2.2, {mkSet: {'dly.time': 30}}]]],
  ['time no jumps', {dly: {type: 0, sync: 0, time: 90, dep: 100}}, []]]) {
  const o = render(FXP(fx), ev, {sec: 4, bpm: 120, at}); const k = mKlick(o.l, SR, [0]);
  console.log(nm, k.worst.toFixed(1), 'at', k.at.toFixed(3));
}
