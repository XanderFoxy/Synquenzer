// QA VV2-01 independent: Refrain (9–16) → Matrix, bars 9–12 → Spur 3; the picture at each shot (pixel signature + reference compare)
import { open } from './n5-v-lib.mjs';
import fs from 'fs'; import { execSync } from 'child_process';
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/n5-v-qa2-out/';
const FMT = process.argv[2] || '16:9', CAM = process.argv[3] || 'kamera';
const SONG = {bars: 16, lanes: [[{bar: 0, slot: 0}, {bar: 8, slot: 1}], [{bar: 0, slot: 0}], [{bar: 0, slot: 0}], [], [{bar: 0, slot: 0}, {bar: 8, slot: 1}], []],
  carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 8, name: 'Strophe'}, {id: 'm2', a: 8, len: 8, name: 'Refrain'}]};
const {b, p, errs} = await open();
await p.evaluate(s => { SYNQUENZER.setSong(s); const m = S.song.marks.find(x => x.name === 'Refrain'); SYNQUENZER.vvDirSet(m.a, m.a + m.len, 'matrix'); SYNQUENZER.vvDirSet(8, 12, 'spur', 2); }, SONG);
const cuts = await p.evaluate(() => SYNQUENZER.vvCuts());
console.log('dir', JSON.stringify(await p.evaluate(() => SYNQUENZER.vvDirGet())), 'cuts', JSON.stringify(cuts.shots.map(s => [(s.a + 1) + '–' + s.b, s.v, s.t])));
await p.evaluate(([f, c]) => { SYNQUENZER.vvTest({opus: true}); SYNQUENZER.vvPrefs({fmt: f, view: 'auto', cam: c}); }, [FMT, CAM]);
const m = await p.evaluate(() => SYNQUENZER.vvMake({}));
const bl = await p.evaluate(() => SYNQUENZER.vvBlob()); const f = OUT + 'q01-' + FMT.replace(':', 'x') + '-' + CAM + '.mp4'; fs.writeFileSync(f, Buffer.from(bl.b64, 'base64'));
const [W, H] = FMT === '16:9' ? [1920, 1080] : [1080, 1920];
const spb = 60 / (await p.evaluate(() => S.bpm));
const t3 = await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--t3').trim());
const raw = (src, n) => { execSync(`ffmpeg -v error -y -i ${src} ${n != null ? '-vf "select=eq(n\\,' + n + ')"' : ''} -frames:v 1 -f rawvideo -pix_fmt rgb24 ${OUT}q.raw`); return fs.readFileSync(OUT + 'q.raw'); };
const diff = (x, y) => { let s = 0, n = 0; for (let k = 0; k < x.length; k += 12) { s += Math.abs(x[k] - y[k]); n++; } return +(s / n).toFixed(2); };
const rows = [];
for (const [lab, bar, want] of [['Strophe Mitte', 4, 'song'], ['Takt 9 + 0,5 s', 8, 'spur:2'], ['Takt 11', 10.5, 'spur:2'], ['Takt 13 + 0,5 s', 12, 'matrix'], ['Takt 15', 14.5, 'matrix']]) {
  const t = bar * 4 * spb + (Number.isInteger(bar) && bar > 4 ? .5 : 0), n = Math.floor(t * 30 + 1e-6), ts = n / 30;
  const fr = raw(f, n), d = {};
  for (const v of ['song', 'matrix', 'spur:2', 'spur:0']) { const png = await p.evaluate(([t, v, fm, c]) => SYNQUENZER.vvShot(t, v, fm, c), [ts, v, FMT, CAM]); fs.writeFileSync(OUT + 'qref.png', Buffer.from(png, 'base64')); d[v] = diff(fr, raw(OUT + 'qref.png')); }
  const best = Object.keys(d).sort((x, y) => d[x] - d[y])[0];
  rows.push({lab, ts: +ts.toFixed(3), want, best, d, ok: best === want});
}
console.log(JSON.stringify({fmt: FMT, cam: CAM, dur: m.dur, t3, rows}, null, 0)); console.log('errs', errs);
await b.close();
