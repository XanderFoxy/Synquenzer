// QA musiker VV1-08 fallback (MediaRecorder in real time): does the app draw 30 pictures/s, and how many reach the file?
import { open, buildSong, OUTQ } from './n5-v-qm-lib.mjs';
import { execSync } from 'child_process';
import fs from 'fs';
const view = process.argv[2] || 'song', fmt = process.argv[3] || '9:16';
const {b, p, errs} = await open({touch: true});
await buildSong(p, {take: false});
const load0 = execSync('cat /proc/loadavg').toString().split(' ')[0];
const r = await p.evaluate(async ([view, fmt]) => {
  const D = []; const o = window.vvDraw; window.vvDraw = function () { D.push(performance.now()); return o.apply(this, arguments); };
  const rq = []; const oR = CanvasCaptureMediaStreamTrack.prototype.requestFrame; CanvasCaptureMediaStreamTrack.prototype.requestFrame = function () { rq.push(performance.now()); return oR.apply(this, arguments); };
  let tA = null; const oE = window.vvEncodeMR; window.vvEncodeMR = function (job) { tA = performance.now(); D.length = 0; rq.length = 0; return oE.apply(this, arguments); };
  const x = await SYNQUENZER.vvMake({fmt, view});
  window.vvDraw = o; window.vvEncodeMR = oE; CanvasCaptureMediaStreamTrack.prototype.requestFrame = oR;
  const gaps = []; for (let k = 1; k < D.length; k++) gaps.push(D[k] - D[k - 1]);
  gaps.sort((a, b) => b - a);
  return {how: x.how, dur: x.dur, draws: D.length, drawFps: +(D.length / x.dur).toFixed(1), reqFrames: rq.length, worstGapsMs: gaps.slice(0, 5).map(Math.round), wallMR: Math.round(performance.now() - tA)};
}, [view, fmt]);
const bl = await p.evaluate(() => SYNQUENZER.vvBlob()); const f = OUTQ + 'mr-' + view + '-' + fmt.replace(':', 'x') + '.' + bl.ext; fs.writeFileSync(f, Buffer.from(bl.b64, 'base64'));
const fr = execSync(`ffprobe -v error -select_streams v -show_entries frame=pts_time -of csv=p=0 ${f}`).toString().trim().split('\n').map(Number);
const g = []; for (let k = 1; k < fr.length; k++) g.push(fr[k] - fr[k - 1]); g.sort((a, b) => b - a);
console.log(JSON.stringify(Object.assign(r, {load0, load1: execSync('cat /proc/loadavg').toString().split(' ')[0], fileFrames: fr.length, fileFps: +(fr.length / r.dur).toFixed(1), lastFrame: fr[fr.length - 1], worstFileGapsS: g.slice(0, 4).map(x => +x.toFixed(2)), errs})));
await b.close();
