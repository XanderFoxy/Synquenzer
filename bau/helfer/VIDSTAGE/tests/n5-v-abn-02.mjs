// fallback (VideoEncoder deleted): frames requested by the app vs frames in the file, draw cost per picture
import { open, SONG8, probe, saveBlob, OUT } from './n5-v-abn-lib.mjs';
import fs from 'fs'; import { execSync } from 'child_process';
const tag = process.argv[2] || 'r1', view = process.argv[3] || 'song', fmt = process.argv[4] || '9:16';
const {b, p, errs} = await open({init: () => { delete window.VideoEncoder;
  window.__rf = 0; const P = window.CanvasCaptureMediaStreamTrack && CanvasCaptureMediaStreamTrack.prototype; if (P && P.requestFrame) { const o = P.requestFrame; P.requestFrame = function () { window.__rf++; return o.call(this); }; }
  window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({entryTypes: ['longtask']}); } catch (e) {} }});
await p.evaluate(s => SYNQUENZER.setSong(s), SONG8);
// draw cost of one 1080×1920 picture
const dc = await p.evaluate(async ([view, fmt]) => { const [W, H] = fmt === '16:9' ? [1920, 1080] : [1080, 1920]; const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d', {alpha: false});
  const r = await SYNQUENZER.vvRender({}); const ts = []; for (let k = 0; k < 60; k++) { const t0 = performance.now(); vvDraw(g, W, H, view, vvStateAt(VV.last, k / 30)); g.getImageData(0, 0, 1, 1); ts.push(performance.now() - t0); } ts.sort((a, b) => a - b); return {med: ts[30], p90: ts[54], max: ts[59]}; }, [view, fmt]);
const t0 = Date.now();
const m = await p.evaluate(async ([view, fmt]) => { window.__rf = 0; window.__lt.length = 0; return SYNQUENZER.vvMake({fmt, view}); }, [view, fmt]);
const wall = Date.now() - t0, rf = await p.evaluate(() => window.__rf), lt = await p.evaluate(() => window.__lt);
const f = await saveBlob(p, fs, tag + '-mr2-' + view), pr = probe(f);
const v = pr.streams.find(s => s.codec_type === 'video');
const fr = execSync(`ffprobe -v error -select_streams v:0 -show_entries frame=pts_time -of csv=p=0 "${f}"`).toString().trim().split('\n').map(Number);
const gaps = []; for (let k = 1; k < fr.length; k++) gaps.push(fr[k] - fr[k - 1]); gaps.sort((a, b) => a - b);
const aend = execSync(`ffprobe -v error -select_streams a:0 -show_entries frame=pts_time,duration_time -of csv=p=0 "${f}"`).toString().trim().split('\n').map(l => l.split(',').map(Number)).reduce((mx, r) => Math.max(mx, r[0] + (r[1] || 0)), 0);
console.log(JSON.stringify({view, fmt, drawCost: dc, want: +(m.songSec + m.tail).toFixed(3), wall, requested: rf, requestedFps: +(rf / (m.songSec + m.tail)).toFixed(1), fileFrames: fr.length, fileFps: +(fr.length / (fr[fr.length - 1] + .033)).toFixed(1), lastFrame: fr[fr.length - 1], audioEnd: +aend.toFixed(3), gapMed: gaps[gaps.length >> 1], gapMax: gaps[gaps.length - 1], longTasks: lt.length, ltMax: Math.max(0, ...lt.map(x => x[1])), w: v.width, h: v.height, errs}));
await b.close();
