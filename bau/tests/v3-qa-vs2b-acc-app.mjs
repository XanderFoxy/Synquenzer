// QA VS2b in the real app (fake mic): 4-bar phrase sung with the independent synth → Stimme-FANG → MELODIE clip.
// node v3-qa-vs2b-acc-app.mjs [variant]   variant: gentle (1.3 st / 140 ms scoops) | plain (no scoops)
import {open, micOn, b64, resample} from './v3-vs2-h.mjs';
import {sing} from './v3-qa-vs2b-acc-synth.mjs';
const variant = process.argv[2] || 'gentle', file = process.argv[3];
const BPM = 100, SB = 60 / BPM, LEAD = 0.04;
// a minor / C major, [beat, beats, midi]
const MEL = [[0, 1, 57], [1, 1, 60], [2, 2, 64], [4, 1, 62], [5, 1, 60], [6, 2, 57], [8, 1, 59], [9, 1, 62], [10, 2, 65], [12, 1, 64], [13, 1, 60], [14, 1.5, 57]];
const notes = MEL.map(([b, d, m], k) => { const n = {on: LEAD + b * SB, dur: d * SB - 0.12, midi: m, vowel: 'aoeau'[k % 5]};
  if (variant === 'gentle') n.scoop = [1.3, 0.14]; if (variant === 'roomfall' || variant === 'dryfall') n.fall = [2.5, 0.14, 9]; if (variant === 'room') n.cons = ['', 'd', 'l', 't', 'n'][k % 5]; if (d >= 2) n.vib = {ct: 60, hz: 5.5, delay: 0.2, jit: 1}; return n; });
const s = sing(notes, variant === 'room' || variant === 'roomfall' ? {voice: 'male', seed: 4, sigma: 6, wet: -18, rt: 0.4, snr: 40} : {voice: 'male', seed: 4, sigma: 6, rev: false, snr: 45});
const H = await open(file ? {file} : {}), p = H.p;
console.log('version', await p.evaluate(() => SYNQUENZER.version));
const m = await micOn(p);
await p.evaluate(bpm => { SYNQUENZER.setBpm(bpm); SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); SYNQUENZER.setKbMode('play'); }, BPM);
const y = resample(s.x, 16000, m.sr);
await p.evaluate(([b, lead]) => { SYNQUENZER.play(); const c = SYNQUENZER.vsClock(); window.__fake.play(b, c.start - lead); }, [b64(y), LEAD]);
const n0 = await p.evaluate(() => SYNQUENZER.vsInfo().litN);
await p.waitForFunction(() => { const c = SYNQUENZER.vsClock(); return c.playing && (c.now - c.outLat - c.start) / c.spb >= 16.5; }, null, {timeout: 60000, polling: 20});
const litN = await p.evaluate(() => SYNQUENZER.vsInfo().litN) - n0;
const okF = await p.evaluate(() => SYNQUENZER.vsFang({beat: 16.5}));
await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy, null, {timeout: 20000}); await p.waitForTimeout(200);
const r = await p.evaluate(() => SYNQUENZER.vsResult());
const ns = r ? r.notes : [];
let hit = 0; const used = new Set();
for (const [b, , mm] of MEL) { const k = ns.findIndex((n, i) => !used.has(i) && n.n === mm && Math.abs((n.o != null ? n.o : n.t) - b) <= 0.2); if (k >= 0) { used.add(k); hit++; } }
const extra = ns.filter((n, i) => !used.has(i));
console.log(JSON.stringify({variant, fang: okF, litN, sung: MEL.length, detected: ns.length, hit, extra: extra.map(n => [+(n.o != null ? n.o : n.t).toFixed(2), +n.d.toFixed(2), n.n]), all: ns.map(n => [+(n.o != null ? n.o : n.t).toFixed(2), +n.d.toFixed(2), n.n]), errs: H.errs.slice(0, 3)}));
await H.br.close();
