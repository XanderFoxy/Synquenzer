// QA musiker VV2: render speed of the same song (12 bars, 28 s) — APP env (pre-VV2 vs VV2), argv FMT VIEW; wall time, x real time
import { open, buildSong } from './n5-v-q2-qmlib.mjs';
const FMT = process.argv[2] || '9:16', VIEW = process.argv[3] || 'song';
const {b, p, errs} = await open({touch: true});
await buildSong(p);
const has = await p.evaluate(() => typeof vvDirSet === 'function');
if (has && VIEW === 'auto') await p.evaluate(() => { const Q = SYNQUENZER, m = S.song.marks.find(x => x.name === 'Refrain'); Q.vvDirSet(m.a, m.a + m.len, 'matrix'); Q.vvDirSet(2, 4, 'spur', 3); Q.vvDirSet(6, 7, 'spur', stimmeT()); });
await p.evaluate(([f, v]) => { SYNQUENZER.vvTest({opus: true}); SYNQUENZER.vvPrefs({fmt: f, view: v, cam: 'kamera'}); }, [FMT, VIEW]);
const t0 = Date.now(); const m = await p.evaluate(() => SYNQUENZER.vvMake({}).then(x => ({dur: x.dur, how: x.how}))); const ms = Date.now() - t0;
console.log(JSON.stringify({app: process.env.APP.split('/').slice(-2).join('/'), FMT, VIEW, ms, dur: +m.dur.toFixed(2), x: +(m.dur * 1000 / ms).toFixed(2), how: m.how, load: (await import('fs')).readFileSync('/proc/loadavg', 'utf8').split(' ')[0], errs}));
await b.close();
