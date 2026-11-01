// QA musiker VV1-02: a sung take that runs past the song end (last bar) — how does the video sound end (hard cut / click?) vs live
import { open, buildSong, liveCap } from './n5-v-qm-lib.mjs';
import { pcmOf } from './n5-v-lufs.mjs';
const {b, p, errs} = await open({touch: true});
await buildSong(p, {take: false, mk: false, bars: 4});
const st = await p.evaluate(async () => { const A = SYNQUENZER, sr = 48000, n = sr * 4, pcm = new Array(n);
  for (let k = 0; k < n; k++) { const t = k / sr; pcm[k] = Math.round(9000 * Math.sin(2 * Math.PI * 220 * t) * Math.min(1, t * 20)); }
  await A.tkInject({pcm, sr, scene: 0, len: 2}); const s = JSON.parse(JSON.stringify(S.song)); const st = stimmeT(); while (s.lanes.length < NT()) s.lanes.push([]);
  s.lanes = s.lanes.map(() => []); s.lanes[st] = [{bar: 3, slot: 0}]; A.setSong(s); await new Promise(r => setTimeout(r, 500)); return st; });
// offline: around the song end
const off = await p.evaluate(async () => { const r = await SYNQUENZER.vvRender({}); const x = VV.last, L = x.ch[0], sr = x.sr, e = Math.round(x.songSec * sr);
  const w = (a, b) => { let s = 0, m = 0; for (let k = a; k < b; k++) { s += L[k] * L[k]; } return +(10 * Math.log10(s / (b - a) + 1e-20)).toFixed(1); };
  let md = 0, at = 0; for (let k = e - 4800; k < e + 4800; k++) { const d = Math.abs(L[k] - L[k - 1]); if (d > md) { md = d; at = k; } }
  let nd = 0; for (let k = e - 48000; k < e - 9600; k++) nd = Math.max(nd, Math.abs(L[k] - L[k - 1]));
  const rms = []; for (let k = -6; k <= 6; k++) rms.push(w(e + k * 240, e + (k + 1) * 240));
  return {songSec: x.songSec, tail: r.tail, maxDiffNearEnd: +md.toFixed(4), atMsFromEnd: +((at - e) / sr * 1000).toFixed(1), normalMaxDiff: +nd.toFixed(4), rms5msAroundEnd: rms}; });
console.log('offline', JSON.stringify(off));
// live: the same song played once, captured
const lv = await liveCap(p, null, 2000);
const a = pcmOf(lv.b64), L = a.L, sr = lv.sr;
// find the end: last sample where 5-ms RMS > -30 dB, then the drop profile
let e = 0; for (let k = 0; k + 240 < L.length; k += 240) { let s = 0; for (let j = k; j < k + 240; j++) s += L[j] * L[j]; if (10 * Math.log10(s / 240 + 1e-20) > -30) e = k + 240; }
const rms = []; for (let k = -6; k <= 6; k++) { let s = 0; for (let j = e + k * 240; j < e + (k + 1) * 240; j++) s += L[j] * L[j]; rms.push(+(10 * Math.log10(s / 240 + 1e-20)).toFixed(1)); }
let md = 0; for (let k = e - 2400; k < e + 2400; k++) md = Math.max(md, Math.abs(L[k] - L[k - 1]));
console.log('live', JSON.stringify({endS: +(e / sr).toFixed(3), maxDiffNearEnd: +md.toFixed(4), rms5msAroundEnd: rms}));
console.log('errors', errs);
await b.close();
