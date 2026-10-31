// K-G9 (c) synthetisch: gesungene Phrasen mit bekannten Silben-Einsätzen (Konsonant-Beginn) und Vokal-Einsätzen.
// Marken kommen aus dem echten VS5a-Kern (vsMarksMake aus bau/snapshots/stage-ges2.html, unverändert).
// (a) öffentlicher Gesangs-Datensatz und (b) Xanders Takes fehlen (keine Netz-Freigabe F0 / F7) – siehe CHANGES.md.
import fs from 'fs'; import vm from 'vm';
const HERE = new URL('.', import.meta.url).pathname;
export function loadVSM() {
  const html = fs.readFileSync(HERE + '../../../snapshots/stage-ges2.html', 'utf8');
  const a = html.indexOf('function vsMarksMake() {'), b = html.indexOf("VERSION: 'vs5a-marks-2'};", a);
  const src = html.slice(a, html.indexOf('\n}', b) + 2);
  const ctx = {}; vm.createContext(ctx); vm.runInContext(src + '\nthis.M = vsMarksMake();', ctx);
  return ctx.M;
}
export function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
const VF = {a: [800, 1200], e: [500, 1900], i: [300, 2300], o: [500, 900], u: [350, 800], 'ä': [650, 1700], 'ö': [450, 1500], 'ü': [300, 1700], y: [300, 2000]};
function vowelOf(x) { const m = x.toLowerCase().match(/[aeiouäöüy]/); return m ? m[0] : 'a'; }
function onsetOf(x) {
  const s = x.toLowerCase().replace(/^[^a-zäöüß]+/, '');
  if (/^[aeiouäöüy]/.test(s)) return 'v';
  if (/^(sch|sh|s|ß|z|f|v|ch|h|th|c)/.test(s)) return 'f';
  if (/^(t|k|p|b|d|g|q)/.test(s)) return 'p';
  return 'n';   // m n l r w j …
}
// Phrase: [{x, w, line?, mel?: Anzahl Ton-Stufen, fuse?: ohne Einsatz (Verschmelzung)}] → {x: Float32Array, sr, syl: [{x, on, von, mel, fuse}]}
export function sing(P, o = {}) {
  const sr = o.sr || 32000, R = rng(o.seed || 1), base = o.f0 || 200, out = [], syl = [];
  let t = 0.4, f0 = base;
  const segs = [];
  P.forEach((y, i) => {
    if (i > 0) { if (y.line) t += 0.35 + 0.25 * R(); else if (y.w) t += o.wordGap != null ? o.wordGap : 0.03 + 0.12 * R(); }
    const on = t, kind = y.fuse ? 'fuse' : onsetOf(y.x);
    const cDur = kind === 'f' ? 0.07 + 0.03 * R() : kind === 'p' ? 0.035 : kind === 'n' ? 0.05 : 0;
    const steps = y.mel || 1, dur = (steps > 1 ? 0.2 * steps : 0.18 + 0.25 * R());
    if (!y.fuse && (y.w || R() < 0.6)) f0 = base * Math.pow(2, (Math.floor(R() * 7) - 3) / 12);
    segs.push({on, kind, cDur, v: vowelOf(y.x), dur, f0, steps});
    syl.push({x: y.x, on, von: on + cDur, mel: steps, fuse: !!y.fuse, w: y.w || 0, line: !!y.line});
    t += cDur + dur;
  });
  const n = Math.ceil((t + 0.6) * sr), x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = (R() - 0.5) * 2e-4;   // Grundrauschen ≈ −80 dB
  let ph = 0;
  for (let si = 0; si < segs.length; si++) {
    const g = segs[si], nx = segs[si + 1], fuseNext = nx && nx.kind === 'fuse';
    const a0 = Math.round(g.on * sr), c1 = Math.round((g.on + g.cDur) * sr), e1 = Math.round((g.on + g.cDur + g.dur) * sr);
    // Konsonant
    if (g.kind === 'f') { let lp = 0; for (let i = a0; i < c1; i++) { const r = (R() - 0.5); lp = 0.3 * lp + r; const env = Math.min(1, (i - a0) / (0.01 * sr), (c1 - i) / (0.01 * sr)); x[i] += 0.08 * (r - 0.7 * lp) * env; } }
    else if (g.kind === 'p') { const b0 = c1 - Math.round(0.012 * sr); for (let i = b0; i < c1; i++) x[i] += 0.25 * (R() - 0.5) * Math.exp(-(i - b0) / (0.003 * sr)); }
    else if (g.kind === 'n') { for (let i = a0; i < c1; i++) { ph += 2 * Math.PI * g.f0 / sr; const env = Math.min(1, (i - a0) / (0.012 * sr)); x[i] += 0.03 * env * (Math.sin(ph) + 0.3 * Math.sin(2 * ph)); } }
    // Vokal: harmonisch, Formant-Gewichte, Vibrato, Ton-Stufen (Melisma)
    const [F1, F2] = VF[g.v] || VF.a, H = 14, amp = new Float64Array(H + 1);
    const fw = (f, Fc, bw) => 1 / (1 + Math.pow((f - Fc) / bw, 2));
    const isFuse = g.kind === 'fuse';
    for (let i = c1; i < e1; i++) {
      const tt = (i - c1) / sr, st = Math.min(g.steps - 1, Math.floor(tt / 0.2));
      const f = g.f0 * Math.pow(2, (st * 2) / 12) * Math.pow(2, 0.25 / 12 * Math.sin(2 * Math.PI * 5.5 * tt));
      ph += 2 * Math.PI * f / sr;
      const att = isFuse ? 1 : g.kind === 'v' ? Math.min(1, tt / 0.02) : Math.min(1, tt / 0.008);
      const rel = fuseNext ? 1 : Math.min(1, (e1 - i) / (0.03 * sr));
      let v = 0; for (let h = 1; h <= H; h++) { const fh = f * h; if (fh > sr / 2.2) break; v += Math.sin(h * ph) * (fw(fh, F1, 120) + 0.6 * fw(fh, F2, 180) + 0.05) / h; }
      x[i] += 0.12 * att * rel * v;
    }
  }
  return {x, sr, syl, len: n / sr};
}
// Silben-Lexikon aus den Prüflisten (wahre Trennung)
export function lexikon(lang) { return fs.readFileSync(HERE + 'daten/silben-' + lang + '.tsv', 'utf8').trim().split('\n').map(r => r.split('\t')[1].split('-')); }
// Phrase aus zufälligen Wörtern: {P, text}
export function phrase(R, lex, nW, o = {}) {
  const P = [], words = [];
  for (let w = 0; w < nW; w++) {
    const sy = lex[Math.floor(R() * lex.length)];
    sy.forEach((x, i) => P.push({x, w: i === 0 ? 1 : 0, line: o.lines && w > 0 && w % o.lines === 0 && i === 0}));
    words.push(sy.join(''));
  }
  return {P, text: words.join(' ')};
}
// M-AUSR: richtige Marke = Marke mit kleinstem Abstand zum wahren Einsatz (±60 ms)
export function ausr(truth, marks, s) {
  let ok = 0, n = 0; const err = [];
  truth.forEach((y, i) => {
    let bk = -1, bd = 0.06; marks.forEach((m, k) => { const d = Math.abs(m.t - y.on); if (d <= bd) { bd = d; bk = k; } });
    if (bk < 0) return;
    n++;
    const got = s[i] ? s[i].t : -1;
    if (Math.abs(got - marks[bk].t) < 1e-5) { ok++; err.push(Math.abs(got - y.on)); }
  });
  err.sort((a, b) => a - b);
  return {n, ok, q: n ? ok / n : 0, med: err.length ? err[err.length >> 1] : NaN};
}
