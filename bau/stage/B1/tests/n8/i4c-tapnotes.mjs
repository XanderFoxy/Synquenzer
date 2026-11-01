// I4c tapNotes in Node (DOM-free, the VS2 block read from index.html): I4-21 to I4-26, I4-32 on synthetic pitch tracks.
// node i4c-tapnotes.mjs [index.html]
import fs from 'fs'; import path from 'path'; import {fileURLToPath} from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.resolve(process.argv[2] || path.join(HERE, '../../index.html')), 'utf8');
const a = html.indexOf('/* VSDSP-BEGIN */'), z = html.indexOf('/* VSDSP-END */');
const D = new Function(html.slice(a, z) + '\nreturn vsDspMake();')();
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const HOP = 80, FS = 16000, dt = HOP / FS;                     // 5 ms frames
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
// a track from pieces [t0, t1, midi(t) | null] (null = unvoiced), level -20 dB voiced
function track(dur, pieces, noise) {
  const n = Math.round(dur / dt), f0 = new Float64Array(n), rms = new Float64Array(n).fill(-200);
  let s = 12345; const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff - .5; };
  for (let i = 0; i < n; i++) { const t = i * dt; for (const [t0, t1, m] of pieces) if (t >= t0 && t < t1 && m != null) { const mm = typeof m === 'function' ? m(t) : m; f0[i] = hz(mm + (noise ? rnd() * noise : 0)); rms[i] = -20; } }
  return {f0, rms, n, hop: HOP, fs: FS};
}
const C = [true, false, true, false, true, true, false, true, false, true, false, true];   // C major
const O = {snap: true, scale: C, root: 0, tuning: 'auto'};
// I4-22 repeated tone: a held A4 with 4 taps -> 4 notes A4, each end = next start
{ const tr = track(2.2, [[0, 2.2, 69]], .05), taps = [0, .5, 1, 1.5].map(s => ({s0: s + .02, s1: s + .4}));
  const r = D.tapNotes(tr, taps, O);
  ok('I4-22 Tonwiederholung: 4 Tipps → 4 Noten gleicher Höhe', r.notes.length === 4 && r.notes.every(n => n.n === 69), r.notes.map(n => n.n).join(','));
  const seg = D.segment(tr, O); ok('I4-22 (VS2 zum Vergleich: 1 Note)', seg.notes.length === 1, seg.notes.length + ' Note(n)'); }
// I4-23 vibrato +-120 ct at 6 Hz, 2 s, 1 tap -> 1 note, the middle +-20 ct
{ const tr = track(2.2, [[0, 2.1, t => 64 + 1.2 * Math.sin(2 * Math.PI * 6 * t)]]), r = D.tapNotes(tr, [{s0: .02, s1: 2}], O);
  ok('I4-23 Vibrato: 1 Note, Mitte ±20 ct, richtiger Halbton', r.notes.length === 1 && Math.abs(r.notes[0].m - 64) <= .2 && r.notes[0].n === 64, r.notes.map(n => n.m + '/' + n.n).join(',')); }
// I4-24 a tap without a tone between sung tones -> pitch of the tone before, by 'ohne'
{ const tr = track(1.4, [[0, .4, 67], [.7, 1.3, 72]]), r = D.tapNotes(tr, [{s0: .02, s1: .38}, {s0: .48, s1: .6}, {s0: .72, s1: 1.25}], O);
  ok('I4-24 Tipp ohne Ton: Höhe des Tons davor, by „ohne“', r.notes.length === 3 && r.notes[1].by === 'ohne' && r.notes[1].n === 67 && r.noTone === 1, r.notes.map(n => n.n + n.by[0]).join(',')); }
// I4-25 voice without a tap: a 400-ms tone without a tap -> not a note, counted once
{ const tr = track(1.6, [[0, .5, 60], [.9, 1.3, 64]]), seg = D.segment(tr, O), r = D.tapNotes(tr, [{s0: .02, s1: .45}], Object.assign({segNotes: seg.notes}, O));
  ok('I4-25 Stimme ohne Tipp: nicht im Clip, gezählt', r.notes.length === 1 && r.open.length === 1, r.notes.length + ' Note, ' + r.open.length + ' Stelle'); }
// I4-26 two tones in one tap: C 300 ms then E 150 ms -> one note C, by 'zwei'
{ const tr = track(.6, [[0, .3, 60], [.3, .45, 64]]), r = D.tapNotes(tr, [{s0: .01, s1: .45}], O);
  ok('I4-26 zwei Töne in einem Tipp → C, „zwei“', r.notes.length === 1 && r.notes[0].n === 60 && r.notes[0].by === 'zwei' && r.two === 1, r.notes.map(n => n.n + ' ' + n.by).join(',')); }
// I4-21 fast run: legato 16ths at 140 BPM, 16 tones up and down, a 40 ms glide into each tone, taps 15 ms after each onset
{ const st = 60 / 140 / 4, sc = [60, 62, 64, 65, 67, 69, 71, 72, 71, 69, 67, 65, 64, 62, 60, 62], P = [];
  sc.forEach((m, i) => { const t0 = .1 + i * st, pm = i ? sc[i - 1] : m; P.push([t0, t0 + st, t => (t - t0 < .04 ? pm + (m - pm) * (t - t0) / .04 : m)]); });
  const tr = track(.2 + 16 * st, P, .06), taps = sc.map((m, i) => ({s0: .1 + i * st + .015, s1: .1 + (i + 1) * st + .005}));
  const r = D.tapNotes(tr, taps, O), hit = r.notes.filter((n, i) => n.n === sc[i]).length;
  ok('I4-21 schneller Lauf 16tel @140: 16 Noten, richtige Höhen', r.notes.length === 16 && hit === 16, hit + '/16 richtig');
  const seg = D.segment(tr, O); console.log('      (VS2 ohne Tipps: ' + seg.notes.length + ' Noten)'); }
// two fingers alternating: release of the first ignored (end = next start)
{ const tr = track(1.2, [[0, .5, 62], [.5, 1.1, 65]]), r = D.tapNotes(tr, [{s0: .02, s1: .9}, {s0: .5, s1: 1.05}], O);
  ok('6.2 zwei Finger abwechselnd: Legato, Ende = nächster Beginn', r.notes.length === 2 && Math.abs(r.notes[0].t1 - .5) < 1e-9 && r.notes[1].n === 65, r.notes.map(n => n.n + '@' + n.t0.toFixed(2) + '-' + n.t1.toFixed(2)).join(' ')); }
// debounce: a touch < 30 ms after the previous one is dropped
{ const tr = track(.8, [[0, .7, 60]]), r = D.tapNotes(tr, [{s0: .02, s1: .5}, {s0: .04, s1: .5}], O);
  ok('6.2 Prellen < 30 ms fällt weg', r.notes.length === 1 && r.taps === 1); }
// nothing sung: no notes
{ const tr = track(.8, []), r = D.tapNotes(tr, [{s0: .1, s1: .3}], O); ok('6.4 nur Tipps, kein Gesang → nichts', r.notes.length === 0); }
// I4-32 time: 64 bars at 120 BPM (128 s), a tap every 8th
{ const dur = 128, P = []; for (let i = 0; i < dur / .25; i++) P.push([i * .25, i * .25 + .24, 60 + (i % 12)]);
  const tr = track(dur, P, .05), taps = []; for (let i = 0; i < dur / .25; i++) taps.push({s0: i * .25 + .01, s1: i * .25 + .2});
  const seg = D.segment(tr, O), oo = Object.assign({segNotes: seg.notes}, O); let r, ms = 1e9; for (let k = 0; k < 3; k++) { const t0 = performance.now(); r = D.tapNotes(tr, taps, oo); ms = Math.min(ms, performance.now() - t0); }
  ok('I4-32 tapNotes 64 Takte ≤ 15 ms (bester von 3, warm)', ms <= 15, ms.toFixed(1) + ' ms, ' + r.notes.length + ' Noten'); }
console.log(fails ? 'FEHLER: ' + fails : 'ALLES GRÜN');
process.exit(fails ? 1 : 0);
