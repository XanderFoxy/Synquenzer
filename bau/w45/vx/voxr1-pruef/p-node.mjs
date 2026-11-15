// Unabhängige Prüfung VOX-R1 (Node-Kern). Ausgaben nennen nur Take A/B/C.
import fs from 'fs';
const file = process.argv[2], basis = process.argv[3];
const RV = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/realvox/dl/';
const SRC = fs.readdirSync(RV).filter(f => /\.wav$/.test(f)).sort((a, b) => parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, '')));
const html = fs.readFileSync(file, 'utf8');
const eS = html.indexOf('function vr1EssCore('), eE = html.indexOf('\nconst VXR1 = {', eS);
const a0 = html.indexOf('function vr1Make() {');
const essSrc = html.slice(eS, eE), makeSrc = html.slice(a0, html.indexOf('\n/* ---------- Teil 3 · 12 Zischen', a0));
const vr1Make = new Function(essSrc + '\n' + makeSrc + '\nreturn vr1Make;')(), K = vr1Make();
const ess = new Function(essSrc + '\nreturn vr1EssCore;')();
const wav = f => { const b = fs.readFileSync(f); let o = 12, sr = 0, d = null; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'fmt ') sr = b.readUInt32LE(o + 12); if (id === 'data') d = b.subarray(o + 8, o + 8 + n); o += 8 + n + (n & 1); }
  const x = new Float32Array(d.length >> 1); for (let i = 0; i < x.length; i++) x[i] = d.readInt16LE(2 * i) / 32767; return {x, sr}; };
const TAU = 2 * Math.PI, db = p => 10 * Math.log10(p + 1e-20);
let seed = 777; const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
function fftN(n) { const rev = new Uint32Array(n); let bits = 0; while ((1 << bits) < n) bits++; for (let i = 0; i < n; i++) { let r = 0; for (let b = 0; b < bits; b++) r |= ((i >> b) & 1) << (bits - 1 - b); rev[i] = r; }
  return (re, im) => { for (let i = 0; i < n; i++) { const j = rev[i]; if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
    for (let s = 2; s <= n; s <<= 1) { const h = s >> 1; for (let i = 0; i < n; i += s) for (let j = 0; j < h; j++) { const w = -TAU * j / s, c = Math.cos(w), sn = Math.sin(w), l = i + j + h, tr = re[l] * c - im[l] * sn, ti = re[l] * sn + im[l] * c; re[l] = re[i + j] - tr; im[l] = im[i + j] - ti; re[i + j] += tr; im[i + j] += ti; } } }; }
const F4 = fftN(4096);
function band(x, sr, f1, f2, a = 0, b = x.length) { const N = 4096, H = 1024, re = new Float64Array(N), im = new Float64Array(N); let e = 0, c = 0;
  for (let p = a; p + N <= b; p += H) { for (let i = 0; i < N; i++) { re[i] = x[p + i] * (0.5 - 0.5 * Math.cos(TAU * i / N)); im[i] = 0; } F4(re, im); for (let k = Math.ceil(f1 * N / sr); k <= Math.floor(f2 * N / sr); k++) e += re[k] * re[k] + im[k] * im[k]; c++; } return e / Math.max(1, c); }
// kurze Fenster (1024) für einzelne Ereignisse
const F1 = fftN(1024);
function bandS(x, sr, f1, f2, a, b) { const N = 1024, H = 256, re = new Float64Array(N), im = new Float64Array(N); let e = 0; for (let p = a; p + N <= b; p += H) { for (let i = 0; i < N; i++) { re[i] = (x[p + i] || 0) * (0.5 - 0.5 * Math.cos(TAU * i / N)); im[i] = 0; } F1(re, im); for (let k = Math.ceil(f1 * N / sr); k <= Math.floor(f2 * N / sr); k++) e += re[k] * re[k] + im[k] * im[k]; } return e; }
const rms = (x, a, b) => { let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return s / Math.max(1, b - a); };
const actRms = x => { const H = 441, e = []; for (let p = 0; p + H <= x.length; p += H) e.push(rms(x, p, p + H)); e.sort((a, b) => a - b); const t = e.slice(Math.floor(e.length * 0.5)); return Math.sqrt(t.reduce((a, b) => a + b, 0) / t.length); };
const f0tab = fs.readFileSync(RV + SRC[0].replace('.wav', '_f0.csv'), 'utf8').trim().split('\n').map(l => l.split(',').map(Number));
const f0at = t => { let lo = 0, hi = f0tab.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (f0tab[m][0] < t) lo = m + 1; else hi = m; } return f0tab[lo][1]; };
const OUT = {};
const T = [wav(RV + SRC[0]), wav(RV + SRC[1]), wav(RV + SRC[2])];
const NM = ['A', 'B', 'C'];

// 1) Saubere Takes: was macht „mittel“/„stark“?
OUT.sauber = {};
for (let t = 0; t < 3; t++) { const {x, sr} = T[t], B = K.done(K.check(x, sr));
  for (const lv of ['leicht', 'mittel', 'stark']) { const A = K.assist(B, lv), r = K.done(K.run(x, sr, {steps: A.steps})), y = r.y, n = x.length;
    const d = new Float32Array(n); for (let i = 0; i < n; i++) d[i] = x[i] - y[i];
    // Anteil des Entfernten in Bändern, relativ zum Original in demselben Band
    const bands = [[20, 80], [80, 300], [300, 4000], [4000, 8000], [8000, 16000]], rel = {};
    for (const [f1, f2] of bands) rel[f1 + '-' + f2] = +(db(band(d, sr, f1, f2)) - db(band(x, sr, f1, f2))).toFixed(1);
    // Zisch-Rahmen geändert (> 1 dB über 5 kHz), Stimmhaft geändert
    const H = Math.round(0.01 * sr); let fr = 0, chHF = 0, chHF3 = 0, vo = 0, chVo = 0; const ch = [];
    for (let p = 0; p + H <= n; p += H) { const ex = rms(x, p, p + H); if (ex < 1e-7) continue; fr++; const dHF = db(bandS(y, sr, 5000, 16000, Math.max(0, p - 512), p + H + 512)) - db(bandS(x, sr, 5000, 16000, Math.max(0, p - 512), p + H + 512)); if (dHF < -1) chHF++; if (dHF < -3) chHF3++; }
    const step = r.info.order.join(',');
    OUT.sauber[NM[t] + ':' + lv] = {zeile: B.line, sibPct: B.sibPct, sibFrames: B.sibFrames, schritte: step, plopps: r.info.plop ? r.info.plop.length : 0, klicks: r.info.click ? (r.info.click.events || r.info.click.ev || r.info.click).length : 0, ess: r.info.ess, entferntRelDb: rel, rahmen10ms: fr, hfUm1dB: chHF, hfUm3dB: chHF3 };
  }
}
console.log('SAUBER', JSON.stringify(OUT.sauber, null, 1));

// 2) Entzischer gegen Pegel des „s“: Rauschen 5-12 kHz, 150 ms in einer Pause UND auf einem Vokal, Pegel relativ zum Gesang
{ const {x: v, sr} = T[0], n = v.length, vr = actRms(v), res = [];
  // Pausen und Vokale aus der f0-Tabelle
  const pauses = [], vow = []; for (let t = 1; t < n / sr - 1; t += 0.05) { let pz = true, vv = true; for (let d = -0.1; d <= 0.25; d += 0.01) { const f = f0at(t + d); if (f > 0) pz = false; else vv = false; } if (pz && rms(v, Math.round(t * sr), Math.round((t + 0.15) * sr)) < vr * vr * 0.01) pauses.push(t); if (vv) vow.push(t); }
  const pick = (L, k) => { const o = []; let last = -9; for (const t of L) if (t - last > 1.2 && o.length < k) { o.push(t); last = t; } return o; };
  const P = pick(pauses, 6), V = pick(vow, 6);
  const mkS = (M) => { const z = new Float64Array(M + 4000); for (let i = 0; i < z.length; i++) z[i] = rnd() * 2 - 1; // grob Bandpass 5–12 kHz über Differenz zweier Tiefpässe
    const lp = (a, f) => { const c = Math.exp(-TAU * f / sr), o = new Float64Array(a.length); let s = 0; for (let k = 0; k < 4; k++) { s = 0; for (let i = 0; i < a.length; i++) { s = a[i] * (1 - c) + s * c; o[i] = s; } a = Float64Array.from(o); } return a; };
    const a = lp(z, 12000), b = lp(z, 5000), s = new Float32Array(M); let e = 0; for (let i = 0; i < M; i++) { s[i] = (a[i + 2000] - b[i + 2000]) * Math.sin(Math.PI * i / M); e += s[i] * s[i]; } const g = 1 / Math.sqrt(e / M); for (let i = 0; i < M; i++) s[i] *= g; return s; };
  for (const relDb of [0, -6, -12, -18, -24]) {
    for (const [nm, L] of [['Pause', P], ['Vokal', V]]) { const x = Float32Array.from(v), M = Math.round(0.15 * sr), pos = [];
      for (const t of L) { const i0 = Math.round(t * sr), s = mkS(M), g = vr * Math.pow(10, relDb / 20); for (let i = 0; i < M; i++) x[i0 + i] += g * s[i]; pos.push(i0); }
      const y = Float32Array.from(x), info = ess(y, sr, 6, {});
      const red = pos.map(i0 => { const S = Float32Array.from(x); for (let i = 0; i < S.length; i++) S[i] = x[i] - v[i]; // nur das „s“ messen: Ausgang minus (Ausgang ohne s) nicht trennbar → Band über 5 kHz im Fenster
        return +(db(bandS(y, sr, 5000, 16000, i0, i0 + M)) - db(bandS(x, sr, 5000, 16000, i0, i0 + M))).toFixed(1); });
      res.push({sRelGesangDb: relDb, ort: nm, n: L.length, reduktionDb: red}); } }
  // ganz leise natürliche Zischlaute: wie viele Rahmen des sauberen Take A werden gesenkt, getrennt nach Pegel des Rahmens über 5 kHz relativ zum Gesang
  OUT.essPegel = res; console.log('ESS-PEGEL', JSON.stringify(res));
}

// 3) doppelt entzischt: Kette Zischen (mittel 6 dB) + Gesangs-Effekte Entzischer (Vorgabe 4 dB) auf eingesetzte „s“
{ const {x: v, sr} = T[0], n = v.length, vr = actRms(v), x = Float32Array.from(v), M = Math.round(0.15 * sr), pos = [];
  for (let k = 0; k < 8; k++) { const t = 2 + k * 3.3; let best = t; for (let d = 0; d < 1.5; d += 0.05) if (!(f0at(t + d) > 0) && !(f0at(t + d + 0.15) > 0)) { best = t + d; break; } const i0 = Math.round(best * sr); for (let i = 0; i < M; i++) x[i0 + i] += vr * 0.7 * (rnd() * 2 - 1) * Math.sin(Math.PI * i / M); pos.push(i0); }
  // nur > 5 kHz zählen
  const y1 = Float32Array.from(x); ess(y1, sr, 6, {}); const y2 = Float32Array.from(y1); ess(y2, sr, 4, {});
  const r1 = pos.map(i0 => +(db(bandS(y1, sr, 5000, 16000, i0, i0 + M)) - db(bandS(x, sr, 5000, 16000, i0, i0 + M))).toFixed(1));
  const r2 = pos.map(i0 => +(db(bandS(y2, sr, 5000, 16000, i0, i0 + M)) - db(bandS(x, sr, 5000, 16000, i0, i0 + M))).toFixed(1));
  OUT.doppelt = {kette6: r1, ketteDann4: r2}; console.log('DOPPELT', JSON.stringify(OUT.doppelt)); }

// 4) „nur Entferntes“ bei Hochpass allein auf sauberem Take A (tiefe Stimme): was hört man?
{ const {x, sr} = T[0], y = K.done(K.run(x, sr, {steps: {hp: {fc: 80}}})).y, d = new Float32Array(x.length); for (let i = 0; i < x.length; i++) d[i] = x[i] - y[i];
  const r = {}; for (const [f1, f2] of [[20, 80], [80, 160], [160, 320], [320, 640], [640, 4000]]) r[f1 + '-' + f2] = +(db(band(d, sr, f1, f2)) - db(band(x, sr, f1, f2))).toFixed(1);
  const tot = +(db(rms(d, 0, d.length)) - db(rms(x, 0, x.length))).toFixed(1);
  // nullphasige Alternative (vorwärts/rückwärts) zum Vergleich
  const c = K.bqC('hp', sr, 80, Math.SQRT1_2), run = a => { const o = new Float32Array(a.length); let z1 = 0, z2 = 0; for (let i = 0; i < a.length; i++) { const v = a[i], w = c[0] * v + z1; z1 = c[1] * v - c[3] * w + z2; z2 = c[2] * v - c[4] * w; o[i] = w; } return o; };
  const zp = run(run(x).reverse()).reverse(), d2 = new Float32Array(x.length); for (let i = 0; i < x.length; i++) d2[i] = x[i] - zp[i];
  const r2 = {}; for (const [f1, f2] of [[20, 80], [80, 160], [160, 320], [320, 640]]) r2[f1 + '-' + f2] = +(db(band(d2, sr, f1, f2)) - db(band(x, sr, f1, f2))).toFixed(1);
  // Pegel des Entfernten gegen Raumton
  OUT.nurEntfernt = {hochpassDiffRelDb: r, gesamtRelDb: tot, nullphasigRelDb: r2}; console.log('NUR-ENTFERNT', JSON.stringify(OUT.nurEntfernt)); }

// 5) Plopp-Fehlalarme auf sauberen Takes: was wird im Tiefband geändert, liegen sie auf gesungenen Tönen?
{ const o = [];
  for (let t = 0; t < 3; t++) { const {x, sr} = T[t], B = K.done(K.check(x, sr)), r = K.done(K.run(x, sr, {steps: {plop: {str: 50}}}));
    for (const e of r.info.plop) { const a = Math.max(0, Math.round((e.t0 - 0.02) * sr)), b = Math.min(x.length, Math.round((e.t1 + 0.02) * sr));
      o.push({take: NM[t], t0: +e.t0.toFixed(2), ms: Math.round((e.t1 - e.t0) * 1000), f0: t === 0 ? Math.round(f0at((e.t0 + e.t1) / 2)) : null, tiefDb: +(db(bandS(r.y, sr, 0, 250, a - 512, b + 512)) - db(bandS(x, sr, 0, 250, a - 512, b + 512))).toFixed(1), gesamtDb: +(db(rms(r.y, a, b)) - db(rms(x, a, b))).toFixed(1), pegelDbfs: +db(rms(x, a, b)).toFixed(1)}); } }
  OUT.ploppFehl = o; console.log('PLOPP-FEHL', JSON.stringify(o)); }

// 6) Reihenfolge mit SÄUBERN: Hochpass 80 Hz vor der Plopp-Suche (SÄUBERN liegt vor der Kette) – eingesetzte Tiefstöße
{ const {x: v, sr} = T[0], n = v.length, P = new Float32Array(n), Tt = []; for (let t = 1; t < n / sr - 1 && Tt.length < 10; t += 0.05) { let ok = true; for (let d = -0.06; d <= 0.1; d += 0.02) if (!(f0at(t + d) > 0)) { ok = false; break; } if (ok && (!Tt.length || t - Tt[Tt.length - 1] > 2.5)) Tt.push(t); }
  for (const t of Tt) { const i0 = Math.round(t * sr), M = Math.round(0.04 * sr); let e = 0; for (let i = 0; i < M; i++) e += v[i0 + i] * v[i0 + i]; const g = 2 * Math.sqrt(e / M); let ph = rnd() * TAU; for (let i = 0; i < M; i++) P[i0 + i] = g * Math.sin(Math.PI * i / M) * (0.7 * Math.sin(TAU * 45 * i / sr + ph) + 0.3 * Math.sin(TAU * 90 * i / sr)); }
  const x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = v[i] + P[i];
  const roh = K.done(K.check(x, sr)).plops, h = K.done(K.run(x, sr, {steps: {hp: {fc: 80}}})).y, nach = K.done(K.check(h, sr)).plops;
  const hit = L => Tt.filter(t => L.some(e => e.t1 >= t - 0.02 && e.t0 <= t + 0.06)).length;
  OUT.ploppNachHP = {gesetzt: Tt.length, ohneHochpass: hit(roh), nachHochpass80: hit(nach)}; console.log('PLOPP-HP', JSON.stringify(OUT.ploppNachHP)); }

// 7) Atem als Stilmittel: eingesetzte Atmer (Rauschen 1–6 kHz, 300 ms, −28 dBFS), Atmer-Schritt aus (lassen) – ändert Zischen sie?
{ const {x: v, sr} = T[0], n = v.length, x = Float32Array.from(v), pos = []; const M = Math.round(0.3 * sr);
  for (let t = 1.5; t < n / sr - 1 && pos.length < 6; t += 0.05) { let pz = true; for (let d = -0.05; d <= 0.35; d += 0.01) if (f0at(t + d) > 0) { pz = false; break; } if (pz && (!pos.length || t * sr - pos[pos.length - 1] > 2 * sr)) pos.push(Math.round(t * sr)); }
  const g = Math.pow(10, -28 / 20) * Math.sqrt(2);
  for (const i0 of pos) { let a = 0, b = 0; const c1 = Math.exp(-TAU * 6000 / sr), c2 = Math.exp(-TAU * 1000 / sr); for (let i = 0; i < M; i++) { const z = rnd() * 2 - 1; a = z * (1 - c1) + a * c1; b = z * (1 - c2) + b * c2; x[i0 + i] += g * 3 * (a - b) * Math.sin(Math.PI * i / M); } }
  const y = Float32Array.from(x), inf = ess(y, sr, 6, {}), y9 = Float32Array.from(x); ess(y9, sr, 9, {});
  OUT.atemStil = {n: pos.length, essMittel: pos.map(i0 => +(db(bandS(y, sr, 1000, 16000, i0, i0 + M)) - db(bandS(x, sr, 1000, 16000, i0, i0 + M))).toFixed(2)), essMittelUeber5k: pos.map(i0 => +(db(bandS(y, sr, 5000, 16000, i0, i0 + M)) - db(bandS(x, sr, 5000, 16000, i0, i0 + M))).toFixed(1)), essStarkUeber5k: pos.map(i0 => +(db(bandS(y9, sr, 5000, 16000, i0, i0 + M)) - db(bandS(x, sr, 5000, 16000, i0, i0 + M))).toFixed(1)),
    pegelDbfs: pos.map(i0 => +db(rms(x, i0, i0 + M)).toFixed(1)), check: K.done(K.check(x, sr)).breaths};
  console.log('ATEM-STIL', JSON.stringify(OUT.atemStil)); }

// 8) Konsonanten t/k (kurze Anschläge 5–15 ms) und Vibrato-Ton: ändert die ganze Kette „stark“ sie?
{ const {x: v, sr} = T[1], n = v.length, B = K.done(K.check(v, sr)), A = K.assist(Object.assign({}, B, {sibPct: 99, clicks: 1, plops: [{}], breaths: 1}), 'stark'), y = K.done(K.run(v, sr, {steps: A.steps})).y;
  // Anschläge: Rahmen (5 ms), deren Energie über 2 kHz in 10 ms um ≥ 15 dB steigt
  const H = Math.round(0.005 * sr), E = []; for (let p = 0; p + H <= n; p += H) E.push(bandS(v, sr, 2000, 16000, p, p + 1024 > n ? n : p + 1024));
  const on = []; for (let j = 3; j < E.length - 3; j++) if (db(E[j]) - db(E[j - 2]) > 15 && db(E[j]) > -40 + db(1024 * 1024 * 0.25 * 1e-0) - 100) on.push(j);
  const ch = on.slice(0, 200).map(j => { const p = j * H; return db(bandS(y, sr, 2000, 16000, p, p + 2048)) - db(bandS(v, sr, 2000, 16000, p, p + 2048)); });
  ch.sort((a, b) => a - b);
  OUT.anschlaege = {takeB: true, n: ch.length, median: ch.length ? +ch[ch.length >> 1].toFixed(2) : null, schlimmste: ch.slice(0, 5).map(z => +z.toFixed(1)), ueber1dB: ch.filter(z => z < -1).length, ueber3dB: ch.filter(z => z < -3).length};
  console.log('ANSCHLAEGE', JSON.stringify(OUT.anschlaege)); }

// 9) Zeit: Gesangs-Effekte (G4) rendern, 3-min-Take, alter gegen neuen Entzischer
{ const g4 = h => { const s = h.indexOf('function g4DspMake() {'), e = h.indexOf('\nconst G4D = g4DspMake();', s); return h.slice(s, e); };
  const newF = new Function(essSrc + '\n' + g4(html) + '\nreturn g4DspMake;')(), oldF = new Function(g4(fs.readFileSync(basis, 'utf8')) + '\nreturn g4DspMake;')();
  const {x: v, sr} = T[0], L = Math.round(180 * sr), x = new Float32Array(L); for (let i = 0; i < L; i++) x[i] = v[i % v.length];
  const P = {on: true, hp: 100, ds: 4, sy: 80, thr: -24, ra: 3, lo: -1, mid: -2, pre: 3, rev: 0.18, dly: 0.1};
  const t = (F) => { const D = F(); const t0 = Date.now(); const r = D.render(Float32Array.from(x), sr, P, []); return {ms: Date.now() - t0, ds: r.info && r.info.ds}; };
  const o1 = t(oldF), n1 = t(newF), o2 = t(oldF), n2 = t(newF);
  // nur Entzischer
  const tE = Date.now(); ess(Float32Array.from(x), sr, 4, {}); const essMs = Date.now() - tE;
  OUT.g4Zeit = {alt: [o1.ms, o2.ms], neu: [n1.ms, n2.ms], essAllein3min: essMs, dsAlt: o1.ds, dsNeu: n1.ds}; console.log('G4-ZEIT', JSON.stringify(OUT.g4Zeit)); }

// 10) Slice-Größe des Entzischers (Rückfall Hauptfaden: yield nur alle 512 Rahmen)
{ const {x: v, sr} = T[0], L = Math.round(60 * sr), x = new Float32Array(L); for (let i = 0; i < L; i++) x[i] = v[i % v.length];
  const it = ess(x, sr, 6, {gen: true}); let mx = 0, t = performance.now(), r; const g = []; while (!(r = it.next()).done) { const n = performance.now(); g.push(n - t); mx = Math.max(mx, n - t); t = n; }
  OUT.essScheibe = {maxMs: +mx.toFixed(1), scheiben: g.length}; console.log('ESS-SCHEIBE', JSON.stringify(OUT.essScheibe)); }
fs.writeFileSync(new URL('./p-node.json', import.meta.url), JSON.stringify(OUT, null, 1));
