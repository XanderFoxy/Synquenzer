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
const DN = loadDsp(NEW), DO = loadDsp(OLD);
const notesOf = (D, x, o = {}) => D.segment(D.pyin(x, {fs: 16000}), {snap: false, tuning: 'auto', ...o}).notes;
function cond(D, name, seeds = [1, 2, 3]) {
  const c = CONDS[name]; let sung = 0, hit = 0, extra = 0, miss = 0;
  for (const seed of seeds) for (const voice of ['male', 'female']) {
    const base = voice === 'male' ? 52 : 64, notes = melFor(seed * 131 + base + name.length, base, c), sig = renderContour(notes, {voice, seed, snr: c.snr}), ns = notesOf(D, sig.x);
    sung += notes.length; const used = new Set();
    for (const t of sig.truth) { let best = -1, bd = 1e9; ns.forEach((n, i) => { if (used.has(i) || n.n !== t.midi) return; const d = Math.abs(n.t0 - t.on); if (d <= 0.12 && d < bd) { bd = d; best = i; } }); if (best >= 0) { used.add(best); hit++; } else miss++; }
    extra += ns.length - used.size;
  }
  return {sung, hit, extra, miss};
}
const fmt = r => `${r.hit}/${r.sung} richtig, ${r.extra} zusätzlich, ${r.miss} fehlen`;
// VS2b-01 keine falschen Zwischennoten bei Übergängen und Rutschern
for (const name of ['scoopUp', 'scoopBoth', 'slide', 'fall', 'mix']) {
  const n = cond(DN, name), o = cond(DO, name);
  const lim = name === 'mix' ? 0.04 : 0.02;   // mix: alles zugleich (Vibrato bis ±110 ct, Drift, Anschleifen, Abfall, Rauschen 30 dB)
  ok(n.extra <= lim * n.sung && n.miss === 0, `VS2b-01 ${name}: ${fmt(n)} (vorher ${fmt(o)}; Soll ≤ ${lim * 100} % zusätzlich, 0 fehlen)`);
}
// VS2b-02 echte kurze Töne bleiben (Mindestlänge/Verschmelzen nimmt keine Läufe weg)
for (const [name, th] of [['run120', 1], ['run150', 0.97], ['trill', 0.97]]) {
  const n = cond(DN, name), o = cond(DO, name);
  ok(n.hit >= th * n.sung && n.extra <= 0.02 * n.sung, `VS2b-02 ${name}: ${fmt(n)} (vorher ${fmt(o)}; Soll ≥ ${th * 100} %)`);
}
// VS2b-03 Hysterese 70 ms / 60 ct: ein Ausschlag um +1 Halbton (40/60 ms) ist keine Note, ab 100 ms ist er eine; 50 ct 300 ms keine
{
  const mk = (devSt, devS) => { const a = {on: 0.3, dur: 0.6, midi: 57}, b = {on: 0.9, dur: devS, midi: 57 + devSt, glide: 0.012}, c = {on: 0.9 + devS, dur: 0.6, midi: 57, glide: 0.012}; return [a, b, c]; };
  const cnt = (devSt, devS) => { let tot = 0; for (const seed of [1, 2, 3]) { const sig = renderContour(mk(devSt, devS), {voice: 'male', seed, sigma: 0}); tot += notesOf(DN, sig.x).length; } return tot / 3; };
  const r = {40: cnt(1, 0.04), 60: cnt(1, 0.06), 100: cnt(1, 0.1), 150: cnt(1, 0.15), c50: cnt(0.5, 0.3)};
  ok(r[40] === 1 && r[60] === 1, `VS2b-03 +1 Halbton für 40 ms / 60 ms: ${r[40]} / ${r[60]} Note(n) (Soll 1)`);
  ok(r[100] === 3 && r[150] === 3, `VS2b-03 +1 Halbton für 100 ms / 150 ms: ${r[100]} / ${r[150]} Noten (Soll 3)`);
  ok(r.c50 === 1, `VS2b-03 +50 ct für 300 ms: ${r.c50} Note (Soll 1, unter 60 ct)`);
}
// VS2b-04 Vibrato-Toleranz: breites Vibrato (±90–130 ct) = eine Note je Ton, Tonhöhe = Median (±25 ct vom Ziel)
{
  const n = cond(DN, 'vibWide'), o = cond(DO, 'vibWide');
  ok(n.extra === 0 && n.miss === 0, `VS2b-04 vibWide: ${fmt(n)} (vorher ${fmt(o)})`);
  let dev = []; for (const seed of [1, 2]) { const notes = melFor(seed * 131 + 52 + 7, 52, CONDS.vibWide), sig = renderContour(notes, {voice: 'male', seed, sigma: 0}), tr = DN.pyin(sig.x, {fs: 16000}), sg = DN.segment(tr, {snap: false, tuning: 0});
    for (const t of notes) { const d = sg.notes.find(x => Math.abs(x.t0 - t.on) < 0.12); if (d && t.vib) dev.push(Math.abs(d.m - t.midi) * 100); } }
  dev.sort((a, b) => a - b);
  ok(dev.length && dev[dev.length - 1] <= 25, `VS2b-04 Tonhöhe je Note bei Vibrato: Abweichung Median ${dev[dev.length >> 1].toFixed(0)} ct, max ${dev[dev.length - 1].toFixed(0)} ct (Soll ≤ 25)`);
}
// VS2b-05 echte Gesangsaufnahmen (vocadito, CC BY 4.0)
{
  const w = readWav(DIR + 'vocadito_1.wav'), x = resample(w.x, w.sr, 16000);
  const res = D => { const sg = D.segment(D.pyin(x, {fs: 16000}), {snap: false, tuning: 'auto'}); const out = {}; for (const A of ['A1', 'A2']) { const ann = fs.readFileSync(DIR + `vocadito_1_notes${A}.csv`, 'utf8').trim().split(/\n/).map(l => l.split(',').map(Number)).map(([on, hz, d]) => ({on, off: on + d, m: 69 + 12 * Math.log2(hz / 440)})); out[A] = evalNotes(sg.notes, ann, 0.1, sg.tuneCt); } return out; };
  const n = res(DN), o = res(DO);
  for (const A of ['A1', 'A2']) ok(n[A].F >= o[A].F && n[A].det - n[A].hit <= o[A].det - o[A].hit, `VS2b-05 vocadito_1 (${A}): F ${n[A].F} (vorher ${o[A].F}), ${n[A].hit}/${n[A].ann} richtig, falsch erkannt ${n[A].det - n[A].hit} (vorher ${o[A].det - o[A].hit})`);
  for (const k of ['10', '14']) { const w2 = readWav(DIR + `vocadito_${k}.wav`), x2 = resample(w2.x, w2.sr, 16000), cN = notesOf(DN, x2), cO = notesOf(DO, x2), sh = a => a.filter(q => q.t1 - q.t0 < 0.1).length;
    ok(cN.length <= cO.length && sh(cN) <= sh(cO), `VS2b-05 vocadito_${k} (ohne Noten-Wahrheit): ${cN.length} Noten, davon ${sh(cN)} unter 100 ms (vorher ${cO.length} / ${sh(cO)})`); }
}
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
process.exit(fail ? 1 : 0);
