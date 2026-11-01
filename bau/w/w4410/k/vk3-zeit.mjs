import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const FILES = [process.argv[2], process.argv[3]], N = +(process.argv[4] || 4);
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const pages = [];
for (const f of FILES) { const P = await b.newPage({viewport: {width: 428, height: 926}, deviceScaleFactor: 1});
  await P.goto('file://' + f); await P.waitForTimeout(1500); await P.mouse.click(5, 300);
  await P.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 15000}).catch(() => {});
  await P.waitForTimeout(300);
// the song: bass (Synth 1), Synth 2 (two clips), chords (Synth 3 from bar 3), drums (two clips), Song-Melodie (MELODIE, touch .3 … 1),
// Strophe 1–4 / Refrain 5–8, Teil-Transposition +2 from bar 7
const setup = await P.evaluate(() => {
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

  await P.evaluate(() => SYNQUENZER.vvTest({opus: true})); pages.push(P); }
const res = {};
for (const [tag, o] of [['16:9 Auto', {fmt: '16:9', view: 'auto', range: {a: 2, b: 7}}], ['16:9 Song', {fmt: '16:9', view: 'song', range: {a: 2, b: 7}}], ['9:16 Auto', {fmt: '9:16', view: 'auto', range: {a: 2, b: 7}}]]) {
  const L = [[], []], A = [[], []], V = [[], []]; let sh = ['', ''];
  for (let k = 0; k < N; k++) for (let j = 0; j < 2; j++) { const r = await pages[j].evaluate(o => SYNQUENZER.vvMake(o).then(x => ({ms: x.ms, a: x.msAudio, v: x.msVideo})), o); L[j].push(r.ms); A[j].push(r.a); V[j].push(r.v); sh[j] = await pages[j].evaluate(() => VV.lastRt.shots.map(s => s.v).join(',')); }
  const med = x => x.slice().sort((p, q) => p - q)[x.length >> 1];
  res[tag] = ['basis', 'k'].map((nm, j) => ({nm, bilder: sh[j], ms: med(L[j]), audio: med(A[j]), video: med(V[j]), all: L[j]}));
}
console.log(JSON.stringify(res, null, 0));
await b.close();
