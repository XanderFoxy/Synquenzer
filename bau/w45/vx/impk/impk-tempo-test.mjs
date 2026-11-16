// IMPK-Prüfung (Kopie von pruef/tempo-eigen.mjs + Abnahme): eigene Gesangs-Faelle (nicht die des Bauers): legato ohne Luecke, Betonung (laut/leise), Decrescendo,
// Konsonant-Rauschen vor dem Vokal, punktierte/synkopierte Rhythmen, Atem-Pausen, Hall. imp1Core aus basis.html und index.html.
import fs from 'node:fs';
const core = f => { const H = fs.readFileSync(f, 'utf8'), i = H.indexOf('function imp1Core() {'), j = H.indexOf('const IMP1 = {', i); let s = H.slice(i, j); if (process.env.DUMP) s = s.replace(/const ons = (impkPeaks\(on, fps, fe\)|peaks\(on, fps\));/, m => m + ' if (globalThis.__ons) globalThis.__ons(ons, fps);'); return new Function(s + '\nreturn imp1Core;')()(); };
const [fb, fi] = process.argv.slice(2), CB = core(fb), CI = core(fi);
const VOW = {a: [[730, 90, 0], [1090, 110, -6], [2440, 160, -18]], o: [[570, 80, 0], [840, 100, -4], [2410, 160, -22]], e: [[530, 80, 0], [1840, 120, -10], [2480, 160, -14]], i: [[270, 60, 0], [2290, 150, -12], [3010, 200, -18]]};
const fenv = (f, vw) => { let s = 0.02; for (const [F, B, g] of VOW[vw]) { const d = (f - F) / B; s += Math.pow(10, g / 20) / (1 + d * d); } return s; };
let seed = 99; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
// notes: [{m, d(beats), g(dB)}]; o: {bpm, gap(s), fade(s), legato(bool), cons(s noise before vowel, inside the note start), consDb, vib, reverb, swing}
function synth(notes, o) {
  const sr = 44100, sp = 60 / o.bpm, tot = notes.reduce((s, n) => s + n.d, 0) * sp + 1.2, N = Math.round(tot * sr), y = new Float32Array(N);
  let t = 0.25, ph = 0, cur = 0; const vws = ['a', 'o', 'e', 'i'];
  const tr = [];
  for (let k = 0; k < notes.length; k++) {
    const n = notes[k]; if (n.m == null) { t += n.d * sp; continue; }
    tr.push(t);
    const f0 = 440 * Math.pow(2, (n.m - 69) / 12), i0 = Math.round(t * sr), legNext = o.legato && k + 1 < notes.length && notes[k + 1].m != null;
    const i1 = Math.round((t + n.d * sp - (legNext ? 0 : o.gap)) * sr), vw = vws[k % 4], H = Math.floor(7000 / f0), amps = [];
    for (let h = 1; h <= H; h++) amps.push(fenv(h * f0, vw) / Math.sqrt(h));
    const G = Math.pow(10, (n.g || 0) / 20), fi = o.legato && k > 0 && notes[k - 1].m != null ? 0.008 : (o.fade || 0.03), fo = legNext ? 0.008 : (o.fade || 0.03);
    const cs = o.cons ? Math.round(o.cons * sr) : 0, cG = Math.pow(10, (o.consDb == null ? -12 : o.consDb) / 20);
    for (let i = i0; i < i1 && i < N; i++) {
      const tt = (i - i0) / sr, cents = (o.vib == null ? 20 : o.vib) * Math.sin(2 * Math.PI * 5.3 * (t + tt)) * Math.min(1, tt / .2), f = f0 * Math.pow(2, cents / 1200);
      ph += 2 * Math.PI * f / sr; let s = 0; for (let h = 0; h < amps.length; h++) s += amps[h] * Math.sin((h + 1) * ph);
      let env = Math.min(1, (i - i0) / (fi * sr), (i1 - i) / (fo * sr));
      if (cs && i - i0 < cs) { const e2 = Math.min(1, (i - i0) / (0.005 * sr)); y[i] += 0.3 * cG * (rnd() * 2 - 1) * e2 * G; env *= Math.max(0, (i - i0 - cs * 0.6) / (cs * 0.4)); }
      y[i] += s * env * G * 0.05;
    }
    t += n.d * sp;
  }
  if (o.reverb) { const D = Math.round(.031 * sr); for (let r = 0; r < 4; r++) { const dd = D * (r + 1) + r * 97, g = .35 / (r + 1); for (let i = N - 1; i >= dd; i--) y[i] += g * y[i - dd]; } }
  let pk = 0; for (const s of y) pk = Math.max(pk, Math.abs(s)); for (let i = 0; i < N; i++) y[i] = Math.round(y[i] * 0.5 / pk * 32767) / 32768;
  return {y, sr, t1: tr[0]};
}
const MEL = [60, 62, 64, 65, 67, 65, 64, 62, 60, 64, 67, 72, 71, 69, 67, 65];
const mk = (pat, gpat) => { const out = []; let k = 0, pos = 0; for (let r = 0; r < 2; r++) for (const d of pat) { out.push({m: d < 0 ? null : MEL[k % MEL.length] + (r ? 2 : 0), d: Math.abs(d), g: gpat ? gpat(k, pos) : 0}); pos += Math.abs(d); if (d > 0) k++; } return out; };
const P8 = [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 2];                 // Viertel
const PD = [1.5, .5, 1, 1, 1.5, .5, 2, 1, .5, 1.5, 1, 2];           // punktiert
const PS = [.5, 1, .5, 1, 1, .5, 1, .5, 1, 2, 1, 1];                // synkopiert
const PB = [1, 1, 1, -1, 1, 1, 2, 1, 1, 1, -1, 2, 2];                // mit Atem-Pausen
const acc = (k, pos) => (Math.abs(pos % 4) < 1e-6 ? 0 : -7);
const decr = k => -((k % 4) * 2.5);
const alt = k => (k % 2 ? -8 : 0);
const CASES = [];
const BPMS = (process.env.BPMS || '66,72,76,80,84,88,92,100,118,132,150').split(',').map(Number), ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
for (const bpm of BPMS) {
  CASES.push([`leg ${bpm}`, mk(P8), {bpm, legato: true}]);
  CASES.push([`leg+akz ${bpm}`, mk(P8, acc), {bpm, legato: true}]);
  CASES.push([`leg+decr ${bpm}`, mk(P8, decr), {bpm, legato: true}]);
  CASES.push([`gap+alt ${bpm}`, mk(P8, alt), {bpm, gap: .02, fade: .012}]);
  CASES.push([`kons ${bpm}`, mk(P8), {bpm, gap: .01, fade: .015, cons: .07, consDb: -10}]);
  CASES.push([`kons+leg ${bpm}`, mk(P8, alt), {bpm, legato: true, cons: .06, consDb: -14}]);
  CASES.push([`punkt ${bpm}`, mk(PD), {bpm, gap: .04}]);
  CASES.push([`synk ${bpm}`, mk(PS, alt), {bpm, gap: .03}]);
  CASES.push([`pause+hall ${bpm}`, mk(PB), {bpm, gap: .05, reverb: true}]);
}
const sum = {B: {ok: 0, ae: 0, t1: 0, n: 0, oct: 0}, I: {ok: 0, ae: 0, t1: 0, n: 0, oct: 0}}; const worse = [], better = [];
for (const [name, notes, o] of CASES.filter(c => !ONLY || ONLY.test(c[0]))) {
  const s = synth(notes, o), res = {};
  for (const [k, C] of [['B', CB], ['I', CI]]) {
    if (process.env.DUMP) globalThis.__ons = (ons) => { const sp = 60 / o.bpm; console.log(k, 'n', ons.length, ons.map(x => ((x.t - s.t1) / sp).toFixed(2) + ':' + x.w.toFixed(0)).join(' ')); };
    const r = C.analyse(s.y, s.sr, {}, () => {}), P = Math.round(r.bpm), oct = Math.abs(r.bpm * 2 - o.bpm) < 2 || Math.abs(r.bpm / 2 - o.bpm) < 2;
    const x = sum[k]; x.n++; if (P === o.bpm) x.ok++; if (oct) x.oct++; else x.ae += Math.abs(r.bpmRoh - o.bpm); x.t1 += Math.abs(r.t1 - s.t1) * 1000;
    res[k] = {roh: r.bpmRoh, P, t1e: Math.round((r.t1 - s.t1) * 1000), q: r.quelle, st: r.stab != null ? r.stab : r.stabil};
  }
  const okB = res.B.P === o.bpm, okI = res.I.P === o.bpm; if (okB && !okI) worse.push(name); if (!okB && okI) better.push(name);
  console.log(`${name.padEnd(16)} wahr ${o.bpm} | Basis ${res.B.roh}→${res.B.P} t1${res.B.t1e} ${res.B.q} | IMPK ${res.I.roh}→${res.I.P} t1${res.I.t1e} ${res.I.q}${okB !== okI ? (okI ? '  BESSER' : '  SCHLECHTER') : ''}`);
}
for (const k of ['B', 'I']) { const x = sum[k]; console.log(`${k === 'B' ? 'Basis' : 'IMPK '}: richtig ${x.ok}/${x.n}, ½×/2× ${x.oct}, |Fehler| ${(x.ae / Math.max(1, x.n - x.oct)).toFixed(3)} BPM, |t1| ${(x.t1 / x.n).toFixed(1)} ms`); }
console.log('SCHLECHTER', JSON.stringify(worse), 'BESSER', JSON.stringify(better));
// Abnahme: kein Fall schlechter als die Basis (Projekt-Tempo), und insgesamt nicht weniger richtig
const fail = worse.length > 0 || sum.I.ok < sum.B.ok;
console.log(fail ? `FEHLER: schlechter ${worse.length}, richtig ${sum.I.ok} < ${sum.B.ok}?` : `ALLE OK (0 schlechter, richtig ${sum.I.ok}/${sum.I.n} gegen Basis ${sum.B.ok}/${sum.B.n}, besser ${better.length})`);
process.exit(fail ? 1 : 0);
