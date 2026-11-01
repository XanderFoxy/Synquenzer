// VV4-06: ein 3-min-Song in 9:16 [Ganze App] rendert ≥ 1,5× schneller als Echtzeit (WebCodecs-Weg); Vergleich [Kamera];
// Hauptthread: längstes Bild (ms) und Mittel je Bild
import { open, SONG, report } from './lib.mjs';
const {b, p, errs} = await open();
const bars = 84;   // 84 Takte bei 112 BPM = 180 s
const song = JSON.parse(JSON.stringify(SONG)); song.bars = bars; song.marks = [];
for (let a = 0, j = 0; a < bars; a += 8, j++) song.marks.push({id: 'm' + j, a, len: Math.min(8, bars - a), name: ['Strophe', 'Refrain'][j % 2] + ' ' + (j + 1)});
song.lanes = song.lanes.map((l, i) => { const o = []; for (let a = 0; a < bars; a += 4) { const e = l.filter(x => x.bar < 8).find(x => x.bar <= a % 8 && true); o.push({bar: a, slot: (l.length ? ((a / 4 + i) % 2) : -1)}); } return i === 3 ? [] : o; });
await p.evaluate(s => SYNQUENZER.setSong(s), song);
await p.evaluate(() => { for (let k = 0; k < 20; k++) SYNQUENZER.songSetChord(k * 4 + 1, ['F', 'G', 'Am', 'C'][k % 4]); S.song.xp = [{beat: 64, semi: 2}, {beat: 128, semi: 0}]; SYNQUENZER.vvTest({opus: true}); });
const res = {checks: {}};
for (const cam of ['app', 'kamera']) {
  const m = await p.evaluate(c => SYNQUENZER.vvMake({fmt: '9:16', view: 'auto', cam: c}), cam);
  const prof = await p.evaluate(() => SYNQUENZER.vvInfo().prof);
  res[cam] = {dur: +m.dur.toFixed(1), ms: m.ms, msAudio: m.msAudio, msVideo: m.msVideo, speed: +(m.dur * 1000 / m.ms).toFixed(2), msPerVideoSec: Math.round(m.ms / m.dur), frameMax: prof.frame && Math.round(prof.frame.max), frameAvg: prof.frame && +(prof.frame.sum / prof.frame.n).toFixed(2), how: m.how};
}
res.checks['1,5x Echtzeit'] = res.app.speed >= 1.5;
res.checks.konsole = errs.length === 0; res.errs = errs;
const bad = report('vv4a-perf', res); console.log(JSON.stringify({app: res.app, kamera: res.kamera}));
await b.close(); process.exit(bad ? 1 : 0);
