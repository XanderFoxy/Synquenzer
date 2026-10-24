// QA group: raw onset of sung notes – ● REC with 🎤 vs FANG 🎤, same signal placement, same session
import {open, check, done} from './v3-qa-grp-lib.mjs';
import {micOn, resample, b64} from './v3-vs2-h.mjs';
import {renderVoice} from './v3-vs2-corpus.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const {br, p, errs, E} = await open();
await E(() => { SYNQUENZER.newProject({init: true}); });
await sleep(300);
await E(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); });
const mic = await micOn(p, 'wired');
await E(() => SYNQUENZER.stop()); await sleep(1200);
const LEAD = 0.04, SB = 0.5;
const mel = [[0, 1, 62], [1, 1, 64], [2, 2, 65], [4, 1, 64], [5, 1, 62], [6, 2, 60]];
const sig = renderVoice(mel.map(([b, d, m], k) => ({on: LEAD + b * SB, dur: d * SB, midi: m, legato: false, rest: k ? 0.1 : 0})), {voice: 'female', seed: 5, sigma: 10, vib: [20, 40], bpm: 120});
const y = b64(resample(sig.x, 16000, mic.sr));
const place = beat => E(([b, beat, lead]) => { const c = SYNQUENZER.vsClock(); window.__fake.play(b, c.start + beat * c.spb - lead); }, [y, beat, LEAD]);
const raw = r => r.notes.map(n => +((n.o != null ? n.o : n.t)).toFixed(3));
await E(() => { SYNQUENZER.setRecOptions({countIn: 0}); SYNQUENZER.selectSlot(0, 0); SYNQUENZER.play(); });
// REC from beat 8 (press at 7.3), voice at 8, stop at 16.2
await p.waitForFunction(() => audBeat() >= 7.3, null, {polling: 5}); await E(() => SYNQUENZER.rec());
const rs = await E(() => SYNQUENZER.runtime().rec.startBeat); await place(rs);
await p.waitForFunction(x => audBeat() >= x, rs + 8.2, {polling: 5}); await E(() => SYNQUENZER.rec());
await p.waitForFunction(() => SYNQUENZER.runtime().rec.state === 'off' && !SYNQUENZER.vsInfo().busy, null, {timeout: 20000}); await sleep(300);
const r1 = await E(() => SYNQUENZER.vsResult()); console.log('REC start', rs, 'raw onsets', JSON.stringify(r1 && raw(r1)));
await E(() => SYNQUENZER.vsResultOk());
// FANG: voice at beat 32, tap at 40.3
await E(() => SYNQUENZER.selectSlot(1, 0));
await place(32);
await p.waitForFunction(() => audBeat() >= 40.3, null, {polling: 5});
await E(() => SYNQUENZER.vsFang());
await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy && SYNQUENZER.vsResult(), null, {timeout: 20000}); await sleep(200);
const r2 = await E(() => SYNQUENZER.vsResult()); console.log('FANG raw onsets', JSON.stringify(r2 && raw(r2)), 'start', r2 && r2.start);
const m1 = r1 ? raw(r1).reduce((a, x, i) => a + x - mel[i][0], 0) / r1.notes.length : null, m2 = r2 ? raw(r2).reduce((a, x, i) => a + x - mel[i][0], 0) / r2.notes.length : null;
console.log('mean offset beats REC', m1 && m1.toFixed(3), 'FANG', m2 && m2.toFixed(3), ' (ms)', m1 && (m1 * 500).toFixed(0), m2 && (m2 * 500).toFixed(0));
check('● REC and FANG 🎤 place the same singing at the same time (±15 ms)', Math.abs((m1 - m2) * 500) <= 15, {recMs: m1 * 500, fangMs: m2 * 500});
console.log('engine', JSON.stringify(await E(() => ({outLat: AU.outLat, lat: SYNQUENZER.stimme().latMs}))));
console.log('errs', errs); await E(() => SYNQUENZER.stop()); await br.close(); done();
