// QA musiker VV1-05: 3-min song speed — Xander-like song (FM, MS 2000 arp, STIMME take, melody, chords) vs. the plain demo song
import { open, buildSong, OUTQ } from './n5-v-qm-lib.mjs';
import { execSync } from 'child_process';
import fs from 'fs';
const kind = process.argv[2] || 'real';
const {b, p, errs} = await open({touch: true});
const res = {kind};
if (kind === 'real') {
  res.setup = await buildSong(p, {bars: 84});
  // the arrangement repeats every 12 bars (like a real song: verse/chorus), all tracks keep playing
  await p.evaluate(() => { const s = JSON.parse(JSON.stringify(S.song)); const L = s.lanes.map(l => l.slice()); s.lanes = L.map(l => { const o = []; for (let k = 0; k < 84; k += 12) for (const e of l) if (e.bar < 12) o.push(Object.assign({}, e, {bar: e.bar + k})); return o; }); s.marks = []; for (let k = 0; k < 84; k += 12) s.marks.push({id: 'i' + k, a: k, len: 2, name: 'Intro'}, {id: 's' + k, a: k + 2, len: 4, name: 'Strophe'}, {id: 'r' + k, a: k + 6, len: 4, name: 'Refrain'}, {id: 'o' + k, a: k + 10, len: 2, name: 'Bridge'}); SYNQUENZER.setSong(s); });
} else {
  await p.evaluate(() => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); const bars = 84, lanes = [[], [], [], [], [], []], marks = [];
    for (let k = 0; k < bars; k += 8) { lanes[0].push({bar: k, slot: 0}); lanes[1].push({bar: k, slot: (k / 8) % 2}); lanes[2].push({bar: k + 2, slot: 0}, {bar: k + 6, slot: -1}); lanes[4].push({bar: k, slot: 0}, {bar: k + 4, slot: 1}); marks.push({id: 'm' + k, a: k, len: Math.min(8, bars - k), name: 'Teil'}); }
    SYNQUENZER.setSong({bars, lanes, carrier: [], mel: {}, marks}); });
}
await p.waitForTimeout(500);
res.song = await p.evaluate(() => ({bars: S.song.bars, sec: +(S.song.bars * 4 * 60 / S.bpm).toFixed(1), nt: NT(), engines: S.tracks.map(t => t.sound ? t.sound.engine : t.kind).join(',')}));
res.loadBefore = execSync('cat /proc/loadavg').toString().trim();
const m = await p.evaluate(async () => { SYNQUENZER.vvTest({opus: true}); window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({type: 'longtask'}); } catch (e) {}
  const t0 = performance.now(); const x = await SYNQUENZER.vvMake({fmt: '9:16', view: 'song'}); return Object.assign(x, {wall: Math.round(performance.now() - t0), lt: window.__lt.length, ltMax: Math.max(0, ...window.__lt)}); });
res.loadAfter = execSync('cat /proc/loadavg').toString().trim();
res.make = {dur: +m.dur.toFixed(1), wallS: +(m.wall / 1000).toFixed(1), xRealtime: +(m.dur * 1000 / m.wall).toFixed(2), audioS: +(m.msAudio / 1000).toFixed(1), audioX: +(m.dur * 1000 / m.msAudio).toFixed(2), videoS: +(m.msVideo / 1000).toFixed(1), longTasks: m.lt, ltMax: m.ltMax, size: m.size};
res.errs = errs;
console.log(JSON.stringify(res));
fs.appendFileSync(OUTQ + 'speed.jsonl', JSON.stringify(res) + '\n');
await b.close();
