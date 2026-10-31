// VV2-01: Teil „Refrain“ auf Matrix, Takte 9–12 auf Spur 3 → das Video zeigt genau dort diese Bilder (Bildvergleich je Schnitt)
import { open } from './n5-v-lib.mjs';
import fs from 'fs'; import { execSync } from 'child_process';
export const SONG16 = {bars: 16, lanes: [[{bar: 0, slot: 0}, {bar: 8, slot: 1}], [{bar: 0, slot: 0}], [{bar: 2, slot: 0}, {bar: 14, slot: -1}], [], [{bar: 0, slot: 0}, {bar: 8, slot: 1}], []],
  carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 8, name: 'Strophe'}, {id: 'm2', a: 8, len: 8, name: 'Refrain'}]};
const FMT = process.env.FMT || '16:9', CAM = process.env.CAM || 'kamera';
const {b, p, errs} = await open();
await p.evaluate(s => SYNQUENZER.setSong(s), SONG16);
// the Refrain (mark m2) → Matrix, bars 9–12 → Spur 3 (track index 2), like the sheets do it
const set = await p.evaluate(() => { const m = S.song.marks.find(x => x.name === 'Refrain'); return [SYNQUENZER.vvDirSet(m.a, m.a + m.len, 'matrix'), SYNQUENZER.vvDirSet(8, 12, 'spur', 2), SYNQUENZER.vvDirGet()]; });
const cuts = await p.evaluate(() => SYNQUENZER.vvCuts());
await p.evaluate(([f, c]) => { SYNQUENZER.vvTest({opus: true}); SYNQUENZER.vvPrefs({fmt: f, view: 'auto', cam: c}); }, [FMT, CAM]);
const m = await p.evaluate(() => SYNQUENZER.vvMake({}));
const bl = await p.evaluate(() => SYNQUENZER.vvBlob()); const tag = FMT.replace(':', 'x') + '-' + CAM, f = `n5-v-out/vv2-01-${tag}.mp4`; fs.writeFileSync(f, Buffer.from(bl.b64, 'base64'));
const [W, H] = FMT === '16:9' ? [1920, 1080] : [1080, 1920];
const raw = (src, out, t) => { execSync(`ffmpeg -v error -y ${t != null ? '-ss ' + t.toFixed(4) : ''} -i ${src} -frames:v 1 -f rawvideo -pix_fmt rgb24 ${out}`); return fs.readFileSync(out); };
const diff = (x, y) => { let s = 0, n = 0; for (let k = 0; k < x.length; k += 12) { s += Math.abs(x[k] - y[k]); n++; } return +(s / n).toFixed(2); };
const spb = 60 / (await p.evaluate(() => S.bpm));
const want = sh => (sh.v === 'spur' ? 'spur:' + sh.t : sh.v);
const cands = ['song', 'matrix', 'spur:2', 'spur:0', 'auto'];
const rows = [];
for (const sh of cuts.shots) {
  for (const at of ['mitte', 'nach Blende']) {
    const bar = at === 'mitte' ? (sh.a + sh.b) / 2 : sh.a + .5 / (4 * spb) * 1;   // 0,5 s after the cut
    const t = at === 'mitte' ? bar * 4 * spb : sh.a * 4 * spb + .5;
    const fr = raw(f, 'n5-v-out/v1.raw', t);
    const d = {};
    for (const v of cands) { const png = await p.evaluate(([t, v, fm, c]) => SYNQUENZER.vvShot(t, v, fm, c), [t, v, FMT, CAM]); fs.writeFileSync('n5-v-out/ref.png', Buffer.from(png, 'base64')); d[v] = diff(fr, raw('n5-v-out/ref.png', 'n5-v-out/ref.raw')); }
    const best = Object.keys(d).filter(k => k !== 'auto').sort((x, y) => d[x] - d[y])[0];
    if (at === 'mitte') execSync(`ffmpeg -v error -y -ss ${t.toFixed(4)} -i ${f} -frames:v 1 -vf scale=${W / 4}:${H / 4} n5-v-out/vv2-01-${tag}-${sh.a + 1}.png`);
    rows.push({takte: (sh.a + 1) + '–' + sh.b, at, t: +t.toFixed(2), soll: want(sh), best, d, ok: best === want(sh) && d.auto < 8});
  }
}
const res = {fmt: FMT, cam: CAM, set, cuts: cuts.shots.map(s => [(s.a + 1) + '–' + s.b, want(s), s.why]), hash: cuts.hash, dur: m.dur, rows, ok: rows.every(r => r.ok)};
console.log(JSON.stringify(res, null, 1)); console.log('errors', errs);
fs.writeFileSync(`n5-v-out/vv2-01-${tag}.json`, JSON.stringify(res, null, 1));
await b.close();
