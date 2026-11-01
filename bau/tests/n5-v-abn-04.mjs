// VV1-04: playhead in the picture vs the heard bar (audio onset of the drums in the same MP4), ±1 frame; matrix highlight with a range not starting at bar 1
import { open, SONG8, OUT, saveBlob } from './n5-v-abn-lib.mjs';
import fs from 'fs'; import { execSync } from 'child_process';
const tag = process.argv[2] || 'r1';
const {b, p, errs} = await open();
const res = {};
// drums only from bar 2 (bar index 1) and again bar 6 (index 5): onsets at 2.1429 s and 10.714 s
const song = {bars: 8, lanes: [[], [], [], [], [{bar: 1, slot: 0}, {bar: 3, slot: -1}, {bar: 5, slot: 0}, {bar: 6, slot: -1}], []], carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 4, name: 'Strophe'}, {id: 'm2', a: 4, len: 4, name: 'Refrain'}]};
await p.evaluate(s => SYNQUENZER.setSong(s), song);
const m = await p.evaluate(async () => { SYNQUENZER.vvTest({opus: true}); return SYNQUENZER.vvMake({fmt: '16:9', view: 'song'}); });
const f = await saveBlob(p, fs, tag + '-04-sync');
const sp = 60 / 112;
// audio of the MP4 (decoded by ffmpeg, edit lists applied) → onsets
execSync(`ffmpeg -v error -y -i "${f}" -map 0:a:0 -ac 1 -ar 48000 -f f32le "${OUT}${tag}-04.f32"`);
const raw = fs.readFileSync(OUT + tag + '-04.f32'), A = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
const onsets = []; let quiet = 0; const thr = Math.pow(10, -40 / 20);
for (let k = 0; k < A.length; k++) { const v = Math.abs(A[k]); if (v < thr * .3) quiet++; else { if (v > thr && quiet > 48000 * .5) onsets.push(+(k / 48000).toFixed(4)); if (v > thr * .3) quiet = 0; } }
res.audioOnsets = onsets.slice(0, 6); res.expect = [1 * 4 * sp, 5 * 4 * sp].map(x => +x.toFixed(4));
// picture: playhead x per frame around the two bar lines (16:9, 8 bars: no scroll; x = (78 + sb·12)·3)
const frameAt = k => { const png = OUT + tag + '-04-f.raw'; execSync(`ffmpeg -v error -y -i "${f}" -vf "select=eq(n\\,${k})" -vsync 0 -frames:v 1 -f rawvideo -pix_fmt rgb24 "${png}"`); return fs.readFileSync(png); };
const playX = buf => { // green #35d07f columns in the lanes area (y 300..700)
  const W = 1920, cols = new Map(); for (let y = 300; y < 700; y += 4) for (let x = 0; x < W; x++) { const i = (y * W + x) * 3, r = buf[i], g = buf[i + 1], bl = buf[i + 2]; if (g > 170 && r < 110 && bl > 90 && bl < 160 && g - r > 100) cols.set(x, (cols.get(x) || 0) + 1); }
  const xs = [...cols.entries()].filter(([x, n]) => n > 60).map(([x]) => x); if (!xs.length) return null; return (Math.min(...xs) + Math.max(...xs) + 1) / 2; };
const pics = [];
for (const bar of [1, 5]) { const tb = bar * 4 * sp, k0 = Math.floor(tb * 30); for (const k of [k0 - 1, k0, k0 + 1, k0 + 2]) { const x = playX(frameAt(k)); const sb = x == null ? null : (x / 3 - 78) / 12; pics.push({bar, k, t: +(k / 30).toFixed(4), x, sb: sb == null ? null : +sb.toFixed(3), sbExpect: +((k / 30) / sp).toFixed(3)}); } }
res.pics = pics;
// time at which the picture's playhead crosses bar n (linear between frames) vs the heard onset
res.sync = [1, 5].map((bar, j) => { const q = pics.filter(x => x.bar === bar && x.sb != null); let tc = null; for (let i = 1; i < q.length; i++) if (q[i - 1].sb <= bar * 4 && q[i].sb >= bar * 4) tc = q[i - 1].t + (bar * 4 - q[i - 1].sb) / (q[i].sb - q[i - 1].sb) * (q[i].t - q[i - 1].t); const on = onsets.find(o => Math.abs(o - bar * 4 * sp) < .5); return {bar, picCross: tc && +tc.toFixed(4), audio: on, dFrames: tc != null && on != null ? +((tc - on) * 30).toFixed(2) : null}; });
// matrix with a range from bar 3 (index 2) to 6 (exclusive): the state at each bar vs the lanes of SONG8
await p.evaluate(s => SYNQUENZER.setSong(s), SONG8);
const mx = await p.evaluate(async () => { await SYNQUENZER.vvRender({range: {a: 2, b: 6}}); const sp = 60 / S.bpm, o = [];
  for (let bar = 2; bar < 6; bar++) { const st = SYNQUENZER.vvStateAt((bar - 2) * 4 * sp + .3 * sp); const exp = S.song.lanes.map((l, i) => { let s = -1; for (const e of l) if (e.bar <= bar) s = e.slot; return s; }); o.push({bar, got: st.slots.slice(0, NT()).map(x => x == null ? -1 : x), exp}); }
  return o; });
res.matrixRange = mx.map(x => Object.assign(x, {ok: JSON.stringify(x.got) === JSON.stringify(x.exp)}));
res.errs = errs;
console.log(JSON.stringify(res));
await b.close();
