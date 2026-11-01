// QA musiker VV2: Xander's song with Regie (Refrain Matrix, bars 3–4 Spur SYN 4 (MS 2000 arp), bar 7 Spur STIMME) → video Auto;
// argv: FMT (9:16|16:9) CAM (kamera|balken). Frames per shot (start+0.5 s, middle, end-0.2 s) as PNG; camera trace stats
import { open, buildSong } from './n5-v-qm-lib.mjs';
import fs from 'fs'; import { execSync } from 'child_process';
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/n5-v-q2-out/';
const FMT = process.argv[2] || '9:16', CAM = process.argv[3] || 'kamera', TAG = 'vid-' + FMT.replace(':', 'x') + '-' + CAM;
const {b, p, errs} = await open({touch: true});
const res = {FMT, CAM};
res.setup = await buildSong(p);
res.set = await p.evaluate(() => { const Q = SYNQUENZER, m = S.song.marks.find(x => x.name === 'Refrain');
  return [Q.vvDirSet(m.a, m.a + m.len, 'matrix'), Q.vvDirSet(2, 4, 'spur', 3), Q.vvDirSet(6, 7, 'spur', stimmeT()), Q.vvDirGet()]; });
res.cuts = await p.evaluate(() => SYNQUENZER.vvCuts());
await p.evaluate(([f, c]) => { SYNQUENZER.vvTest({opus: true}); SYNQUENZER.vvPrefs({fmt: f, view: 'auto', cam: c}); }, [FMT, CAM]);
const t0 = Date.now();
res.make = await p.evaluate(() => SYNQUENZER.vvMake({}));
res.makeMs = Date.now() - t0;
const bl = await p.evaluate(() => SYNQUENZER.vvBlob()); const f = OUT + TAG + '.' + bl.ext; fs.writeFileSync(f, Buffer.from(bl.b64, 'base64'));
const bpm = await p.evaluate(() => S.bpm), spb = 60 / bpm; res.bpm = bpm;
const frames = [];
for (const sh of res.cuts.shots) {
  for (const [k, t] of [['a', sh.a * 4 * spb + .5], ['m', (sh.a + sh.b) / 2 * 4 * spb], ['e', sh.b * 4 * spb - .25]]) {
    const n = Math.round(t * 30), png = OUT + TAG + '-' + (sh.a + 1) + k + '.png';
    execSync(`ffmpeg -v error -y -i ${f} -vf "select=eq(n\\,${n}),scale=${FMT === '9:16' ? '270:480' : '480:270'}" -frames:v 1 ${png}`);
    frames.push({shot: (sh.a + 1) + '–' + sh.b + ' ' + sh.v + (sh.t != null ? ':' + sh.t : ''), k, t: +t.toFixed(2), png});
  }
}
res.frames = frames;
// contact sheet
execSync(`ffmpeg -v error -y -i ${f} -vf "fps=2,scale=${FMT === '9:16' ? '135:240' : '240:135'},tile=8x${Math.ceil(res.make.dur * 2 / 8)}" -frames:v 1 ${OUT + TAG}-tile.png`);
if (FMT === '9:16' && CAM === 'kamera') {
  const L = (await p.evaluate(() => SYNQUENZER.vvRunLog())).log || [];
  // how much of each spur shot shows the Laufstrich inside the window
  res.camN = L.length;
}
res.errs = errs;
console.log(JSON.stringify(res, null, 1));
fs.writeFileSync(OUT + TAG + '.json', JSON.stringify(res, null, 1));
await b.close();
