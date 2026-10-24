// QA group: ● REC with 🎤 while music plays (demo-based project) – latency / drift before and after, raw onsets
import {open, OUT, check, done, tapEl} from './v3-qa-grp-lib.mjs';
import {micOn, resample, b64} from './v3-vs2-h.mjs';
import {renderVoice} from './v3-vs2-corpus.mjs';
import fs from 'fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const variant = process.argv[2] || 'flow3';
const {br, p, errs, E} = await open();
if (variant === 'flow3') { const proj = JSON.parse(fs.readFileSync(OUT + 'flow3-project.json', 'utf8')); await E(pj => SYNQUENZER.importJSON(JSON.stringify({app: 'SYNQUENZER', kind: 'project', format: 4, project: pj})), proj); }
else if (variant === 'demo') { /* the demo as loaded */ }
else await E(() => SYNQUENZER.newProject({init: true}));
await sleep(400);
await E(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); });
const mic = await micOn(p, 'wired');
await E(() => SYNQUENZER.stop()); await sleep(1200);
const LEAD = 0.04, SB = 0.5;
const mel = [[0, 1, 62], [1, 1, 64], [2, 2, 65], [4, 1, 64], [5, 1, 62], [6, 2, 60]];
const sig = renderVoice(mel.map(([b, d, m], k) => ({on: LEAD + b * SB, dur: d * SB, midi: m, legato: false, rest: k ? 0.1 : 0})), {voice: 'female', seed: 5, sigma: 10, vib: [20, 40], bpm: 120});
const y = b64(resample(sig.x, 16000, mic.sr));
const place = beat => E(([b, beat, lead]) => { const c = SYNQUENZER.vsClock(); window.__fake.play(b, c.start + beat * c.spb - lead); }, [y, beat, LEAD]);
const stm = () => E(() => { const s = SYNQUENZER.stimme(); return {lat: s.latMs, how: s.latHow, drift: s.drift, marks: s.marks.length, drops: s.dropN, last: s.last && JSON.stringify(s.last).slice(0, 300)}; });
console.log('before', JSON.stringify(await stm()));
if (process.argv[3] === 'play') await E(() => { SYNQUENZER.selectSlot(5, 2); SYNQUENZER.play(); }); else await E(() => { SYNQUENZER.selectSlot(5, 2); SYNQUENZER.launchScene(0); }); await sleep(100); console.log('sel', JSON.stringify(await E(() => SYNQUENZER.runtime().selected)), 'song', JSON.stringify(await E(() => ({play: SYNQUENZER.runtime().song.play, part: SYNQUENZER.runtime().part}))));
await p.waitForFunction(() => audBeat() >= 3.3, null, {polling: 5});
await E(() => SYNQUENZER.rec()); await sleep(30);
const rs = await E(() => SYNQUENZER.runtime().rec); await place(rs.startBeat);
await p.waitForFunction(x => audBeat() >= x, rs.startBeat + 8.2, {polling: 5});
await E(() => SYNQUENZER.rec());
await p.waitForFunction(() => SYNQUENZER.runtime().rec.state === 'off' && !SYNQUENZER.vsInfo().busy, null, {timeout: 20000}); await sleep(300);
console.log('after', JSON.stringify(await stm()));
const r1 = await E(() => SYNQUENZER.vsResult());
const m = r1 ? r1.notes.reduce((a, n, i) => a + n.o - (mel[i] ? mel[i][0] : 0), 0) / r1.notes.length : null;
console.log(variant, 'raw onsets', JSON.stringify(r1 && r1.notes.map(n => n.o)), 'len', r1 && r1.len, 'mean ms', m && (m * 500).toFixed(0));
console.log('errs', errs); await E(() => SYNQUENZER.stop()); await br.close();
