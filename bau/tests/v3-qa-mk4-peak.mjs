import {render, mkPatch} from './v3-mk1-node.mjs';
import {db, peak} from './v3-mk1-ana.mjs';
const SR = 48000, FILE = process.env.MK_FILE;
const FXP = (fx, t) => Object.assign(mkPatch(t || {}), {mfx: {type: 0, spd: 64, dep: 0}, dly: {type: 0, sync: 1, time: 64, note: 5, dep: 0}, eq: {lf: 320, lg: 0, hf: 6000, hg: 0}}, fx || {});
for (const [nm, dur, rep] of [['1/8 stabs every beat', .25, .5], ['held chord 2 s', 2, 4], ['single note 1/8', .25, 4]]) {
  const ev = []; const chord = nm.startsWith('single') ? [60] : [48, 55, 60, 64];
  for (let t = 0; t < 4; t += rep) for (const n of chord) { ev.push([t, 'on', n, 1]); ev.push([t + dur, 'off', n]); }
  const dry = render(FXP({}), ev, {sec: 6, file: FILE, bpm: 120});
  const wet = render(FXP({dly: {type: 0, sync: 1, time: 64, note: 5, dep: 127}}), ev, {sec: 6, file: FILE, bpm: 120});
  const wet64 = render(FXP({dly: {type: 0, sync: 1, time: 64, note: 5, dep: 64}}), ev, {sec: 6, file: FILE, bpm: 120});
  console.log(nm.padEnd(22), 'dry peak', db(Math.max(peak(dry.l), peak(dry.r))).toFixed(1), 'dBFS | Stereo 1/8 TIEFE 127 peak', db(Math.max(peak(wet.l), peak(wet.r))).toFixed(1), 'dBFS | TIEFE 64', db(Math.max(peak(wet64.l), peak(wet64.r))).toFixed(1), 'dBFS');
}
