// VS4-fix: capture what the app hands to the cleaning worker in the sat6 Stimme-FANG run (mic, ref) for offline work
import {launch, open, micOn, sleep, writeWav, resample, DIR} from './v3-qa-vs4-h.mjs';
import {renderVoice} from './v3-vs2-corpus.mjs';
import fs from 'fs';
const SR = 44100, SB = 0.5, MODE = process.argv[2] || 'sat6';
const MEL = [[0, 1, 57], [2, 1, 60], [4, 1, 64], [6, 1, 62], [8, 1, 60], [10, 1, 64], [12, 1, 59], [14, 1, 57]];
const v16 = renderVoice(MEL.map(([b, d, m], k) => ({on: 0.05 + b * SB, dur: d * SB, midi: m, legato: false, rest: k ? 0.1 : 0})), {voice: 'male', seed: 11, sigma: 10, vib: [20, 40], bpm: 120}).x;
const v = resample(v16, 16000, SR), P = SR * 8, y = new Float32Array(P);
let pk = 0; for (let i = 0; i < Math.min(P, v.length); i++) pk = Math.max(pk, Math.abs(v[i]));
for (let i = 0; i < Math.min(P, v.length); i++) y[i] = v[i] * 0.3 / pk;
let vs = 0, vc = 0, va = 0; for (const s of y) { va += s * s; if (Math.abs(s) > 0.015) { vs += s * s; vc++; } } const vWholeDb = 10 * Math.log10(va / P);
let seed = 9; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 - 0.5; };
const nAmp = Math.sqrt(vs / vc) * 0.01 * 3.46, x = new Float32Array(P); for (let i = 0; i < P; i++) x[i] = y[i] + nAmp * rnd();
const WAV = DIR + `/cap-${MODE}.wav`; writeWav(WAV, x, SR); fs.writeFileSync(DIR + '/cap-voice.f32', Buffer.from(y.buffer));
const br = await launch(WAV), H = await open(br), p = H.p;
await p.evaluate(() => { const o = Worker.prototype.postMessage; window.__caps = []; Worker.prototype.postMessage = function (m, t) { try { if (m && m.mic && m.o) window.__caps.push({way: m.o.way || 'hear', mic: Float32Array.from(m.mic, v => m.mic instanceof Int16Array ? v / 32767 : v), ref: m.ref ? Float32Array.from(m.ref, v => m.ref instanceof Int16Array ? v / 32767 : v) : null, sr: m.sr}); } catch (e) {} return o.call(this, m, t); }; });
await micOn(p, "speaker"); await p.evaluate(() => { window.__bleedDbg = []; });
await p.evaluate(() => { const o = vsBleedNote; window.__bl = []; vsBleedNote = function (x, d0, fs, sr, lat, n, bl, bb, unc) { const r = o.apply(this, arguments); window.__dn = x.length; window.__bl.push({m: n.m, n: n.n, t0: +n.t0.toFixed(2), t1: +n.t1.toFixed(2), r, bl: +(10*Math.log10(bl)).toFixed(1), bb: +(10*Math.log10(bb)).toFixed(1)}); return r; }; });
await p.evaluate(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); window.__tap(); });
await p.evaluate(() => { SYNQUENZER.selectSlot(0, 3); SYNQUENZER.play(); });
const lv = []; for (let k = 0; k < 12; k++) { await sleep(250); lv.push(await p.evaluate(() => window.__lvl().rmsDb)); }
await p.evaluate(() => SYNQUENZER.stop()); await sleep(400);
const mRmsDb = lv.reduce((s, v) => s + v, 0) / lv.length, tgt = MODE === 'sat6' || MODE === 'fang6' ? 6 : 0;
const g = Math.pow(10, (vWholeDb + tgt - mRmsDb) / 20) * (+process.env.HPC || 1.35);
await p.evaluate(([g, sat]) => window.__loop(0.012, g, sat, 250), [g, MODE === 'sat6' ? 1 : 0]);
await p.evaluate(() => { SYNQUENZER.selectSlot(0, 3); SYNQUENZER.play(); });
await p.waitForFunction(() => { const c = SYNQUENZER.vsClock(); return c.playing && (c.now - c.outLat - c.start) / c.spb >= 16.5; }, null, {timeout: 60000, polling: 20});
await p.evaluate(() => SYNQUENZER.vsFang({beat: 16.5}));
await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy, null, {timeout: 60000});
const res = await p.evaluate(() => SYNQUENZER.vsResult());
console.log('notes', JSON.stringify((res && res.notes || []).map(n => n.n)), JSON.stringify(await p.evaluate(() => SYNQUENZER.clNotesInfo())));
console.log("bleed", JSON.stringify(await p.evaluate(() => window.__bl)));
console.log("dbg", JSON.stringify(await p.evaluate(() => (window.__bleedDbg || []).map(d => Object.fromEntries(Object.entries(d).map(([k, v]) => [k, +(+v).toFixed(1)]))))));
const caps = await p.evaluate(() => window.__caps.map(c => ({way: c.way, sr: c.sr, n: c.mic.length})));
console.log("caps", JSON.stringify(caps), "dn", await p.evaluate(() => window.__dn));
for (let k = 0; k < caps.length; k++) {
  const d = await p.evaluate(k => { const c = window.__caps[k], b = a => { const u = new Uint8Array(a.buffer); let s = ''; for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); return btoa(s); }; return {mic: b(c.mic), ref: c.ref ? b(c.ref) : null}; }, k);
  fs.writeFileSync(DIR + `/cap-${MODE}-${k}-mic.f32`, Buffer.from(d.mic, 'base64')); if (d.ref) fs.writeFileSync(DIR + `/cap-${MODE}-${k}-ref.f32`, Buffer.from(d.ref, 'base64'));
}
await br.close();
