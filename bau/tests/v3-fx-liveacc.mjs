// VS2b Abnahme (Node, direkt auf DSP und Worklet der App; Vergleich mit dem Stand davor = G-P1b-gruppe-fix 4.5.1)
// node v3-vs2b-accept.mjs <neu.html> <alt.html>
import fs from 'fs';
import {loadDsp} from './v3-vs2-corpus.mjs';
import {CONDS, melFor, renderContour} from './v3-vs2b-synth.mjs';
import {readWav, resample, evalNotes} from './v3-vs2b-real.mjs';
import {make, liveScore, srcOf} from './v3-vs2b-live.mjs';
const NEW = process.argv[2] || '../dirigent-wt/index.html', OLD = process.argv[3] || 'v3-vs2b-base.html';
const DIR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/realvox/dl/';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };

// VS2b-06 Live-Anzeige (Worklet): Wackeln und falsche Zwischen-Tasten, Läufe bleiben sichtbar, Rechenzeit
{
  const SN = srcOf(fs.readFileSync(NEW, 'utf8')), SO = srcOf(fs.readFileSync(OLD, 'utf8'));
  const live = (SRC, names) => { const t = {notes: 0, wrong: 0, wob: 0, found: 0, ms: 0, sec: 0}; for (const name of names) { const c = CONDS[name];
    for (const seed of [1, 2]) for (const voice of ['male', 'female']) { const base = voice === 'male' ? 52 : 64, notes = melFor(seed * 131 + base + name.length, base, c), sig = renderContour(notes, {voice, seed, snr: c.snr});
      const x = resample(sig.x, 16000, 48000), W = make(48000, {src: 'voice', lock: false}, SRC); t.ms += W.run(x); t.sec += x.length / 48000; const s = liveScore(W.msgs, sig.truth); t.notes += notes.length; t.wrong += s.wrong; t.wob += s.wob; t.found += s.found; } } t.cpu = 100 * t.ms / 1000 / t.sec; return t; };
  const TR = ['vibWide', 'drift', 'scoopUp', 'scoopBoth', 'slide', 'fall', 'mix'];
  const n = live(SN, TR), o = live(SO, TR);
  ok(n.wrong <= 0.2 * o.wrong, `VS2b-06 falsche Tasten (Übergänge, Vibrato, Drift, Anschleifen, Abfall): ${n.wrong} (vorher ${o.wrong}; Soll ≤ 20 %)`);
  ok(n.wob <= 0.25 * o.wob, `VS2b-06 Wechsel mitten im Ton (Wackeln): ${n.wob} (vorher ${o.wob}; Soll ≤ 25 %)`);
  const nv = live(SN, ['vibWide']), ov = live(SO, ['vibWide']);
  ok(nv.wob <= 0.05 * ov.wob, `VS2b-06 breites Vibrato ±90–130 ct: ${nv.wob} Wechsel im Ton (vorher ${ov.wob}; Soll ≤ 5 %)`);
  const nr = live(SN, ['run120', 'run150', 'trill']);
  ok(nr.found >= 0.95 * nr.notes && nr.wrong === 0, `VS2b-06 schnelle Läufe/Triller: ${nr.found}/${nr.notes} Töne leuchten, ${nr.wrong} falsche Tasten (Soll ≥ 95 %, 0)`);
  ok(n.cpu <= 3, `VS2b-06 Rechenzeit Live-Weg ${n.cpu.toFixed(2)} % Echtzeit (vorher ${o.cpu.toFixed(2)} %; Soll ≤ 3 %)`);
  // echte Stimme (vocadito_1, A1): Tasten-Meldungen und falsche Tasten
  const w = readWav(DIR + 'vocadito_1.wav'), x = resample(w.x, w.sr, 48000);
  const ann = fs.readFileSync(DIR + 'vocadito_1_notesA1.csv', 'utf8').trim().split(/\n/).map(l => l.split(',').map(Number)).map(([q, hz, d]) => ({on: q, off: q + d, midi: Math.round(69 + 12 * Math.log2(hz / 440) + 0.18)}));
  const rl = SRC => { const W = make(48000, {src: 'voice', lock: false}, SRC); W.run(x); return liveScore(W.msgs, ann); };
  const ln = rl(SN), lo = rl(SO);
  ok(ln.segs <= 0.6 * lo.segs && ln.wrong <= 0.4 * lo.wrong, `VS2b-06 echte Stimme vocadito_1: ${ln.segs} Tasten-Meldungen für ${ann.length} Noten (vorher ${lo.segs}), falsche Tasten ${ln.wrong} (vorher ${lo.wrong}), ${ln.found} Noten leuchten (vorher ${lo.found}), Latenz Median ${ln.latMed} ms (vorher ${lo.latMed})`);
}
console.log(fail ? 'FEHLER ' + fail : 'ALLE OK');
