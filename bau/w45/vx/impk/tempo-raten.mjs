// Kopie aus vx/imp2b/pruef (IMPK: Ausgabe-Bezeichnung IMPK statt IMP2, sonst gleich)
// Zusatzfall Import bei 22,05/44,1/48/96 kHz: synthetische Vokal-Melodien mit bekannter Wahrheit (Tempo, erste Note 0,25 s),
// imp1Core aus basis.html und index.html. Ausgabe je Fall/Rate: bpm roh, Projekt-Tempo (Math.round wie die App), t1-Fehler.
import fs from 'node:fs';
import { makeVoices } from '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vx/chr3/src/synth.mjs';
const core = f => { const H = fs.readFileSync(f, 'utf8'), i = H.indexOf('function imp1Core() {'), j = H.indexOf('const IMP1 = {', i); return new Function(H.slice(i, j) + '\nreturn imp1Core;')()(); };
const [fb, fi] = process.argv.slice(2), CB = core(fb), CI = core(fi);
const MEL = [[72, 1], [74, 1], [76, 2], [77, 1], [76, 1], [74, 2], [72, 1], [79, 1], [77, 1], [76, 1], [74, 2], [72, 2]];
const rs = (x, sr, fo) => { if (sr === fo) return x; const n = Math.floor(x.length * fo / sr), y = new Float32Array(n), fc = 0.45 * Math.min(sr, fo), K = 64, beta = 8.6;
  const i0 = v => { let s = 1, t = 1; for (let k = 1; k < 50; k++) { t *= (v / (2 * k)) ** 2; s += t; } return s; }, ib = i0(beta), sc = Math.max(1, sr / fo), KK = Math.ceil(K * sc);
  for (let j = 0; j < n; j++) { const c = j * sr / fo, n0 = Math.floor(c); let s = 0, w = 0; for (let m = n0 - KK + 1; m <= n0 + KK; m++) { const d = m - c, u = d / KK; if (Math.abs(u) >= 1) continue; const a = 2 * fc / sr * d, h = (a === 0 ? 1 : Math.sin(Math.PI * a) / (Math.PI * a)) * i0(beta * Math.sqrt(1 - u * u)) / ib; w += h; if (m >= 0 && m < x.length) s += x[m] * h; } y[j] = s / w; } return y; };
const q16 = x => Float32Array.from(x, s => Math.max(-32768, Math.min(32767, Math.round(s * 32767))) / 32768);
const RATES = [22050, 44100, 48000, 96000], rows = [], sum = {B: {}, I: {}};
for (const bpm of [96, 104, 112, 120, 126, 132, 140]) for (const [mn, mel] of [['A', MEL.map(([m, d]) => [m - 12, d])], ['B', [...MEL, ...MEL]]]) {
  const x0 = q16(makeVoices({mel, iv: [0], sr: 44100, sp: 60 / bpm}).voices[0].y), line = {fall: `${bpm}${mn}`, B: [], I: []};
  for (const sr of RATES) { const x = rs(x0, 44100, sr);
    for (const [k, C] of [['B', CB], ['I', CI]]) { const r = C.analyse(x, sr, {}, () => {}), P = Math.round(r.bpm), e = r.bpmRoh - bpm, half = Math.abs(r.bpm * 2 - bpm) < 2 || Math.abs(r.bpm / 2 - bpm) < 1;
      line[k].push({sr, roh: r.bpmRoh, P, t1e: Math.round((r.t1 - 0.25) * 1000), q: r.quelle});
      const s = sum[k][sr] = sum[k][sr] || {n: 0, okP: 0, ae: 0, t1: 0, oct: 0}; s.n++; if (P === bpm) s.okP++; if (half) s.oct++; else s.ae += Math.abs(e); s.t1 += Math.abs(r.t1 - 0.25) * 1000; } }
  rows.push(line);
  const f = L => L.map(z => `${z.sr / 1000}k ${z.roh.toFixed(2)}→${z.P} t1${z.t1e >= 0 ? '+' : ''}${z.t1e}`).join(' · ');
  console.log(`${line.fall.padEnd(5)} Basis: ${f(line.B)}\n      IMPK : ${f(line.I)}`);
}
for (const k of ['B', 'I']) console.log((k === "B" ? "Basis" : "IMPK ") + ' je Rate: ' + RATES.map(sr => { const s = sum[k][sr]; return `${sr / 1000}k Projekt-Tempo richtig ${s.okP}/${s.n}, ½×/2× ${s.oct}, |Fehler| ${(s.ae / Math.max(1, s.n - s.oct)).toFixed(2)} BPM, |t1| ${(s.t1 / s.n).toFixed(1)} ms`; }).join(' | '));
const spread = k => rows.map(l => { const v = l[k].map(z => z.roh); return Math.max(...v) - Math.min(...v); });
for (const k of ['B', 'I']) { const s = spread(k); console.log((k === "B" ? "Basis" : "IMPK ") + ` Spanne über die Raten je Fall: max ${Math.max(...s).toFixed(2)} BPM, Mittel ${(s.reduce((a, b) => a + b, 0) / s.length).toFixed(2)}`); }
