// VS2b im Browser (echte App, Mikro-Attrappe): gesungene Phrase mit Anschleifen, Rutschern, Abfall am Ende und breitem
// Vibrato → Stimme-FANG → MELODIE-Clip ohne Zwischennoten; Live-Taste wackelt nicht (VS.litN); Version 4.5.2.
// node v3-vs2b-app.mjs [file]
import {open, micOn, b64, resample} from './v3-vs2-h.mjs';
import {renderContour} from './v3-vs2b-synth.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const BPM = 100, SB = 60 / BPM, LEAD = 0.04;
// 4 Takte a-Moll: [Schlag, Dauer, Ton, Art]
const MEL = [[0, 1, 57, 'scoop'], [1, 1, 60, 'glide'], [2, 2, 64, 'vib'], [4, 1, 65, 'scoop'], [5, 1, 64, 'glide'], [6, 2, 62, 'fall'],
  [8, 1, 60, 'scoop'], [9, 1, 64, 'glide'], [10, 2, 67, 'vib'], [12, 1, 65, 'scoopAbove'], [13, 1, 64, 'glide'], [14, 1.5, 60, 'vibfall']];
function sing(seed) {
  const notes = MEL.map(([b, d, m, k]) => { const n = {on: LEAD + b * SB, dur: d * SB, midi: m};
    if (k === 'glide') n.glide = 0.15; if (k === 'scoop') n.scoop = [1.8, 0.09]; if (k === 'scoopAbove') n.scoop = [-1.5, 0.08];
    if (k.startsWith('vib')) n.vib = [115, 5.5, 0.1]; else if (n.dur >= 0.5) n.vib = [30, 5.8, 0.15]; if (k.endsWith('fall')) n.fall = [4, 0.13]; return n; });
  for (let k = 1; k < notes.length; k++) if (notes[k].glide) notes[k].on = notes[k - 1].on + notes[k - 1].dur;
  return renderContour(notes, {voice: 'male', seed, sigma: 10}).x;
}
const H = await open(process.argv[2] ? {file: process.argv[2]} : {}), p = H.p;
ok(await p.evaluate(() => SYNQUENZER.version) === '4.5.2', 'Version 4.5.2');
const m = await micOn(p); H.sr = m.sr;
await p.evaluate(bpm => { SYNQUENZER.setBpm(bpm); SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); SYNQUENZER.setKbMode('play'); }, BPM);
const y = resample(sing(5), 16000, H.sr);
await p.evaluate(([b, lead]) => { SYNQUENZER.play(); const c = SYNQUENZER.vsClock(); window.__fake.play(b, c.start - lead); }, [b64(y), LEAD]);
const n0 = await p.evaluate(() => SYNQUENZER.vsInfo().litN);
await p.waitForFunction(() => { const c = SYNQUENZER.vsClock(); return c.playing && (c.now - c.outLat - c.start) / c.spb >= 16.5; }, null, {timeout: 60000, polling: 20});
const litN = await p.evaluate(() => SYNQUENZER.vsInfo().litN) - n0;
ok(litN <= 1.5 * MEL.length, `Live: ${litN} Tasten-Einsätze/-Wechsel für ${MEL.length} gesungene Noten (VS2/G-P1b: 85; Soll ≤ ${1.5 * MEL.length})`);
ok(await p.evaluate(() => SYNQUENZER.vsFang({beat: 16.5})), 'Stimme-FANG angenommen');
await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy, null, {timeout: 20000}); await sleep(150);
const r = await p.evaluate(() => SYNQUENZER.vsResult());
const ns = r ? r.notes : [];
let hit = 0; const used = new Set();
for (const [b, , mm] of MEL) { const k = ns.findIndex((n, i) => !used.has(i) && n.n === mm && Math.abs((n.o != null ? n.o : n.t) - b) <= 0.15); if (k >= 0) { used.add(k); hit++; } }
const extra = ns.filter((n, i) => !used.has(i));
if (process.env.V) console.log(JSON.stringify(ns.map(n => [n.o != null ? n.o : n.t, n.d, n.n])));
ok(r && r.track === 5 && r.len === 4, `MELODIE-Clip: Spur ${r && r.track}, ${r && r.len} Takte`);
ok(hit >= MEL.length - 1, `Noten: ${hit}/${MEL.length} richtig (Ton exakt, Einsatz ±0,15 Schlag)`);
ok(extra.length === 0, `keine Zwischennoten: ${extra.length} ${JSON.stringify(extra.map(n => [n.o != null ? n.o : n.t, n.n]))}`);
ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 3)));
await H.br.close();
console.log(fail ? 'FEHLER ' + fail : 'ALLE OK');
process.exit(fail ? 1 : 0);
