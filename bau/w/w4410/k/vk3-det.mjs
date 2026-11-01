import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const APP = process.argv[2], RANGE = JSON.parse(process.argv[3] || '{"a":2,"b":7}'), FMT = process.argv[4] || '16:9';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 428, height: 926}, deviceScaleFactor: 1});
const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e));
await p.goto('file://' + APP); await p.waitForTimeout(1500); await p.mouse.click(5, 300);
await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 15000}).catch(() => {});
await p.waitForTimeout(300);
// the song: bass (Synth 1), Synth 2 (two clips), chords (Synth 3 from bar 3), drums (two clips), Song-Melodie (MELODIE, touch .3 … 1),
// Strophe 1–4 / Refrain 5–8, Teil-Transposition +2 from bar 7
const setup = await p.evaluate(() => {
  const A = SYNQUENZER; A.setMetronome && A.setMetronome(false);
  const nt = NT(), lanes = Array.from({length: nt}, () => []);
  lanes[0] = [{bar: 0, slot: 0}]; lanes[1] = [{bar: 0, slot: 0}]; lanes[2] = [{bar: 0, slot: 0}]; lanes[DRUM_T] = [{bar: 0, slot: 0}, {bar: 10, slot: 1}];
  const ph = [[72, 1, .35], [74, .5, .45], [76, .5, .55], [79, 2, .7], [77, 1, .5], [76, 1, .4], [74, 2, .6], [72, 2, .3], [76, 1, .8], [79, 1, .9], [81, 2, 1], [79, 1, .95], [77, 1, .7], [76, 4, .85], [74, 2, .5], [72, 2, .65]];
  const notes = []; let t = 0; for (let k = 0; t < 48; k++) { const [n, d, v] = ph[k % ph.length]; notes.push({t, d: d * .95, n, v}); t += d; }
  A.setSong({bars: 12, lanes, carrier: [], mel: {[MEL_T]: {len: 12, key: {root: 0, scale: 'ionian', src: 'user'}, notes}}, melodyTrack: MEL_T,
    marks: [{id: 'm1', a: 0, len: 4, name: 'Strophe'}, {id: 'm2', a: 4, len: 4, name: 'Refrain'}, {id: 'm3', a: 8, len: 4, name: 'Strophe'}]});
  S.song.xp = [{beat: 40, semi: 2}]; songChanged();
  return {bars: S.song.bars, mel: S.song.mel[MEL_T].notes.length, bpm: S.bpm, has: typeof A.vvkShot === 'function'};
});

await p.evaluate(() => { SYNQUENZER.vvTest({opus: true}); const VF = window.VideoFrame; window.__H = [];
  window.VideoFrame = function (src, o) { if (src && src.getContext) { const g = src.getContext('2d'), d = new Uint32Array(g.getImageData(0, 0, src.width, src.height).data.buffer); let h = 2166136261; for (let i = 0; i < d.length; i += 3) { h ^= d[i]; h = Math.imul(h, 16777619) >>> 0; } window.__H.push(h); } return new VF(src, o); }; });
const runs = [];
for (let k = 0; k < 2; k++) { await p.evaluate(() => { window.__H = []; }); const T0 = Date.now(); const r = await p.evaluate(([rg, f]) => SYNQUENZER.vvMake({fmt: f, view: 'auto', range: rg}).then(x => ({ms: x.ms, msAudio: x.msAudio, msVideo: x.msVideo})), [RANGE, FMT]);
  const H = await p.evaluate(() => window.__H.slice()); const sh = await p.evaluate(() => VV.lastRt.shots.map(s => [s.a, s.b, s.v])); runs.push({r, H, sh, wall: Date.now() - T0}); }
const diff = []; for (let i = 0; i < Math.max(runs[0].H.length, runs[1].H.length); i++) if (runs[0].H[i] !== runs[1].H[i]) diff.push(i);
console.log(JSON.stringify({file: APP.split('/').slice(-2).join('/'), frames: runs.map(x => x.H.length), diffFrames: diff.length, first: diff.slice(0, 12), shots: runs[0].sh, ms: runs.map(x => x.r), wall: runs.map(x => x.wall), errs}));
await b.close();
