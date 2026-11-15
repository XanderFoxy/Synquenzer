// VOX-R1 Teil 1–3/3: Abnahme mit synthetisch eingesetzten Fehlern in echten Gesangs-Takes (Kern in Node + App im Browser, Touch über CDP).
// Aufruf: node voxr1-test.mjs <abs index.html> [basis.html]   – Ausgaben nennen nur „Take A/B/C“, keine Datensatz-Namen.
import fs from 'fs';
import path from 'path';
const file = process.argv[2], basis = process.argv[3];
const RV = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/realvox/dl/';
const SRC = fs.readdirSync(RV).filter(f => /\.wav$/.test(f)).sort((a, b) => parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, '')));
let okN = 0, badN = 0; const R = {};
const ok = (c, name, info) => { if (c) okN++; else badN++; console.log((c ? 'OK ' : 'FEHLER ') + name + (info != null ? ' – ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); };
const html = fs.readFileSync(file, 'utf8'), a0 = html.indexOf('function vr1Make() {'), a1 = html.indexOf('\nconst VXR1 = {', a0);
const vr1Make = new Function(html.slice(a0, a1) + '\nreturn vr1Make;')(), K = vr1Make();
const wav = f => { const b = fs.readFileSync(f); let o = 12, sr = 0, d = null; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'fmt ') sr = b.readUInt32LE(o + 12); if (id === 'data') d = b.subarray(o + 8, o + 8 + n); o += 8 + n + (n & 1); }
  const x = new Float32Array(d.length >> 1); for (let i = 0; i < x.length; i++) x[i] = d.readInt16LE(2 * i) / 32767; return {x, sr}; };
const TAU = 2 * Math.PI, db = p => 10 * Math.log10(p + 1e-20);
let seed = 12345; const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296; };
// Leistung einer Frequenz (Goertzel, Hann) über x[a..b)
const gz = (x, a, b, f, sr) => { const M = b - a, c = 2 * Math.cos(TAU * f / sr); let p1 = 0, p2 = 0; for (let i = 0; i < M; i++) { const w = 0.5 - 0.5 * Math.cos(TAU * i / M), s = (x[a + i] || 0) * w + c * p1 - p2; p2 = p1; p1 = s; } return p1 * p1 + p2 * p2 - c * p1 * p2; };
// Bandenergie f1..f2 (STFT 4096, Hann) über das ganze Signal ab a
function band(x, sr, f1, f2, a = 0) { const N = 4096, H = 2048, re = new Float64Array(N), im = new Float64Array(N), F = fftN(N); let e = 0;
  for (let p = a; p + N <= x.length; p += H) { for (let i = 0; i < N; i++) { re[i] = x[p + i] * (0.5 - 0.5 * Math.cos(TAU * i / N)); im[i] = 0; } F(re, im); for (let k = Math.ceil(f1 * N / sr); k <= Math.floor(f2 * N / sr); k++) e += re[k] * re[k] + im[k] * im[k]; } return e; }
function fftN(n) { const rev = new Uint32Array(n); let bits = 0; while ((1 << bits) < n) bits++; for (let i = 0; i < n; i++) { let r = 0; for (let b = 0; b < bits; b++) r |= ((i >> b) & 1) << (bits - 1 - b); rev[i] = r; }
  return (re, im) => { for (let i = 0; i < n; i++) { const j = rev[i]; if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
    for (let s = 2; s <= n; s <<= 1) { const h = s >> 1; for (let i = 0; i < n; i += s) for (let j = 0; j < h; j++) { const w = -TAU * j / s, c = Math.cos(w), sn = Math.sin(w), l = i + j + h, tr = re[l] * c - im[l] * sn, ti = re[l] * sn + im[l] * c; re[l] = re[i + j] - tr; im[l] = im[i + j] - ti; re[i + j] += tr; im[i + j] += ti; } } }; }
const actRms = x => { const H = 441, e = []; for (let p = 0; p + H <= x.length; p += H) { let s = 0; for (let i = 0; i < H; i++) s += x[p + i] * x[p + i]; e.push(s / H); } e.sort((a, b) => a - b); const t = e.slice(Math.floor(e.length * 0.5)); return Math.sqrt(t.reduce((s, v) => s + v, 0) / t.length); };
// Grundton je Zeit (Tabelle zum Take A), sonst null
const f0tab = (() => { const f = RV + SRC[0].replace('.wav', '_f0.csv'); if (!fs.existsSync(f)) return null; return fs.readFileSync(f, 'utf8').trim().split('\n').map(l => l.split(',').map(Number)); })();
const f0at = t => { if (!f0tab) return 0; let lo = 0, hi = f0tab.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (f0tab[m][0] < t) lo = m + 1; else hi = m; } return f0tab[lo][1]; };

const A = wav(RV + SRC[0]), sr = A.sr, v = A.x, n = v.length, vr = actRms(v);
console.log('INFO Take A: ' + (n / sr).toFixed(1) + ' s, ' + sr + ' Hz; Take B/C für Fehlalarme');
// ---------- 1) Brummen: 50 Hz + 6 Obertöne, zusammen −20 dB unter dem Gesang ----------
for (const base of [50, 60]) {
  const hum = new Float32Array(n), ph = [0.3, 1.1, 2.0, 0.7, 2.9, 1.6, 0.2], a = vr * Math.pow(10, -20 / 20) * Math.sqrt(2 / 7);
  for (let i = 0; i < n; i++) { let s = 0; for (let k = 1; k <= 7; k++) s += Math.sin(TAU * base * k * i / sr + ph[k - 1]); hum[i] = a * s; }
  const x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = v[i] + hum[i];
  const B = K.done(K.check(x, sr)), r = K.done(K.run(x, sr, {steps: {hum: 'auto'}})), h = r.info.hum;
  const hv = K.done(K.run(hum, sr, {steps: {hum: {f0: h.f0, n: h.n}}})).y, vv = K.done(K.run(v, sr, {steps: {hum: {f0: h.f0, n: h.n}}})).y, a2 = Math.round(sr * 0.5);
  const red = []; for (let k = 1; k <= 7; k++) red.push(+(db(gz(hum, a2, n, base * k, sr)) - db(gz(hv, a2, n, base * k, sr))).toFixed(1));
  const dBand = db(band(r.y, sr, 200, 4000, a2)) - db(band(v, sr, 200, 4000, a2)), dBandV = db(band(vv, sr, 200, 4000, a2)) - db(band(v, sr, 200, 4000, a2));
  R['hum' + base] = {gefunden: B.hum.base, f0: B.hum.f0, n: B.hum.n, kerbenDb: red, bandDb: +dBand.toFixed(3), bandNurStimmeDb: +dBandV.toFixed(3), zeile: B.line};
  ok(B.hum.on && B.hum.base === base && Math.abs(B.hum.f0 - base) < 0.05, `Brumm ${base} Hz erkannt (Prüfen)`, {f0: B.hum.f0, n: B.hum.n, zeile: B.line});
  ok(Math.min(...red) >= 25, `Brumm ${base} Hz: auf allen 7 Kerben ≥ 25 dB weniger`, red);
  ok(Math.abs(dBand) <= 0.5 && Math.abs(dBandV) <= 0.5, `Brumm ${base} Hz: Gesangsband 200 Hz–4 kHz ändert sich ≤ 0,5 dB`, {gegenStimme: +dBand.toFixed(3), nurStimmeGefiltert: +dBandV.toFixed(3)});
}
{ const B = K.done(K.check(v, sr)); ok(!B.hum.on, 'Take A ohne Brumm: kein Brumm gemeldet', {rk: B.hum.rk.slice(0, 4), zeile: B.line}); R.sauberA = B.line; }
// ---------- 2) Plopps: 10 eingesetzte 40-ms-Tiefstöße in gesungenen Stellen ----------
const T = []; { const cand = []; for (let t = 0.6; t < n / sr - 0.6; t += 0.01) { let okv = true; for (let d = -0.06; d <= 0.1; d += 0.02) if (!(f0at(t + d) > 0)) { okv = false; break; } if (okv) cand.push(t); }
  let last = -9; for (const t of cand) if (t - last >= (n / sr - 1.2) / 11 && T.length < 10) { T.push(+t.toFixed(3)); last = t; } }
const P = new Float32Array(n);
{ const L = [[0.5411961], [1.3065630]].map(([q]) => { const w = TAU * 120 / sr, c = Math.cos(w), al = Math.sin(w) / (2 * q), a0 = 1 + al; return [(1 - c) / 2 / a0, (1 - c) / a0, (1 - c) / 2 / a0, -2 * c / a0, (1 - al) / a0]; });
  for (const t of T) { const i0 = Math.round(t * sr), M = Math.round(0.04 * sr), nz = new Float64Array(M + 2000); for (let i = 0; i < nz.length; i++) nz[i] = rnd() * 2 - 1;
    for (const c of L) { let z1 = 0, z2 = 0; for (let i = 0; i < nz.length; i++) { const x0 = nz[i], o = c[0] * x0 + z1; z1 = c[1] * x0 - c[3] * o + z2; z2 = c[2] * x0 - c[4] * o; nz[i] = o; } }
    let lr = 0; for (let i = 0; i < M; i++) { const w = Math.sin(Math.PI * i / M); lr += 0; } let e = 0, es = 0; for (let i = 0; i < M; i++) { e += v[i0 + i] * v[i0 + i]; es += nz[1000 + i] * nz[1000 + i]; }
    const g = 2 * Math.sqrt(e / es);   // Stoß +6 dB über dem Gesang an der Stelle (Tiefstoß + Rauschen < 120 Hz)
    for (let i = 0; i < M; i++) { const w = Math.sin(Math.PI * i / M); P[i0 + i] = g * (nz[1000 + i] * w + 0.6 * Math.sqrt(es / M) * Math.sin(Math.PI * i / M) * Math.sin(Math.PI * i / M)); } } }
{ const x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = v[i] + P[i];
  if (process.env.VR1DBG) { const Fx = K.done(K.feats(x, sr)), Fv = K.done(K.feats(v, sr)); for (const sens of [6, 7, 8, 9, 10]) { const e = K.plopFind(Fx, {sens}), ev = K.plopFind(Fv, {sens}); console.log('DBG sens', sens, 'treffer', T.filter(t => e.some(q => q.t1 >= t - 0.01 && q.t0 <= t + 0.05)).length, 'fehl', e.filter(q => !T.some(t => q.t1 >= t - 0.01 && q.t0 <= t + 0.05)).length, 'sauber', ev.length, JSON.stringify(ev.map(q => [q.t0, +(q.t1 - q.t0).toFixed(3), q.exDb]).slice(0, 8))); } process.exit(0); }
  const t0 = Date.now(), r = K.done(K.run(x, sr, {steps: {plop: {}}})), ms = Date.now() - t0, ev = r.info.plop;
  const hit = T.map(t => ev.find(e => e.t1 >= t - 0.01 && e.t0 <= t + 0.05)), fp = ev.filter(e => !T.some(t => e.t1 >= t - 0.01 && e.t0 <= t + 0.05));
  const N = 4096, red = [], harm = [], harmMax = [];
  for (const t of T) { const c = Math.round((t + 0.02) * sr), a = c - N / 2, e = new Float32Array(n); for (let i = a; i < a + N; i++) e[i] = r.y[i] - v[i];
    const lo = (z) => band(z.subarray(a, a + N), sr, 0, 250); red.push(+(db(lo(P)) - db(lo(e))).toFixed(1));
    const f0 = f0at(t + 0.02), b2 = c - 1024; let hy = 0, hv = 0, mx = 0; for (let k = 1; k * f0 < 4000; k++) { const py = gz(r.y, b2, b2 + 2048, k * f0, sr), pv = gz(v, b2, b2 + 2048, k * f0, sr); hy += py; hv += pv; if (pv > 1e-6 * gz(v, b2, b2 + 2048, f0, sr)) mx = Math.max(mx, Math.abs(db(py) - db(pv)) * (pv / (hv || 1) > 0.02 ? 1 : 0)); }
    harm.push(+(db(hy) - db(hv)).toFixed(2)); harmMax.push(+mx.toFixed(2)); }
  // außerhalb der Stöße bitgleich
  let same = true; for (let i = 0; i < n && same; i++) { const near = T.some(t => Math.abs(i / sr - t) < 0.2) || ev.some(e => i / sr > e.t0 - 0.05 && i / sr < e.t1 + 0.05); if (!near && r.y[i] !== x[i]) same = false; }
  R.plop = {gesetzt: T.length, gefunden: hit.filter(Boolean).length, fehl: fp.length, reduktionDb: red, oberToeneDb: harm, oberToeneMaxEinzelDb: harmMax, ms};
  ok(hit.filter(Boolean).length >= 9 && fp.length <= 1, 'Plopps: ≥ 9 von 10 gefunden, ≤ 1 Fehlalarm', {gefunden: hit.filter(Boolean).length, fehl: fp.length});
  ok(red.filter((d, k) => hit[k]).every(d => d >= 12), 'Plopps: je ≥ 12 dB weniger (Band < 250 Hz, Fehler gegen den sauberen Take)', red);
  ok(harm.every(d => Math.abs(d) <= 1), 'Plopps: Obertöne der Stimme an den Stellen ≤ 1 dB Änderung', {summe: harm, einzelnMax: harmMax});
  ok(same, 'Plopps: außerhalb der Stöße bitgleich', null);
  const B = K.done(K.check(x, sr)); ok(B.plops.length >= 9 && B.plops.length <= 11, 'Prüfen zählt die Plopps', {n: B.plops.length, zeile: B.line}); R.zeilePlopp = B.line;
  // Kette Plopps → Brummen → Hochpass: Reihenfolge fest, Plopps sehen den Tiefbass vor dem Hochpass
  const r2 = K.done(K.run(x, sr, {steps: {hp: {}, hum: 'auto', plop: {}}}));
  ok(JSON.stringify(r2.info.order) === '["plop","hum","hp"]' && r2.info.plop.length === ev.length, 'Kette: Plopps → Brummen → Hochpass (feste Reihenfolge, gleiche Plopps wie allein)', r2.info.order);
}
// ---------- 3) Fehlalarme auf sauberen Takes ----------
for (let k = 0; k < SRC.length; k++) { const W = wav(RV + SRC[k]), B = K.done(K.check(W.x, W.sr)); R['take' + 'ABC'[k]] = B.line;
  ok(B.plops.length <= 1 && !B.hum.on, `Take ${'ABC'[k]} sauber: ≤ 1 Plopp, kein Brumm`, {plopps: B.plops.length, zeile: B.line, ms: B.ms}); }
// ================= Teil 2 =================
let sd2 = 4242; const rn2 = () => { sd2 = (Math.imul(sd2, 1103515245) + 12345) >>> 0; return sd2 / 4294967296; };
const bqc = (type, f, q, sr, gDb) => { const w = TAU * f / sr, c = Math.cos(w), al = Math.sin(w) / (2 * q), a0 = 1 + al; if (type === 'hp') return [(1 + c) / 2 / a0, -(1 + c) / a0, (1 + c) / 2 / a0, -2 * c / a0, (1 - al) / a0]; if (type === 'lp') return [(1 - c) / 2 / a0, (1 - c) / a0, (1 - c) / 2 / a0, -2 * c / a0, (1 - al) / a0];
  const A = Math.pow(10, gDb / 40), b0 = 1 + al / A; return [(1 + al * A) / b0, -2 * c / b0, (1 - al * A) / b0, -2 * c / b0, (1 - al / A) / b0]; };
const filt = (y, c) => { let z1 = 0, z2 = 0; for (let i = 0; i < y.length; i++) { const x0 = y[i], o = c[0] * x0 + z1; z1 = c[1] * x0 - c[3] * o + z2; z2 = c[2] * x0 - c[4] * o; y[i] = o; } };
const frames = (y, H) => { const L = []; for (let p = 0; p + H <= y.length; p += H) { let s = 0; for (let i = p; i < p + H; i++) s += y[i] * y[i]; L.push(db(s / H)); } return L; };
// ---------- 5) Klicks: 20 Mundklicks (0,5–3 ms, harter Einsatz, ausklingend; Rauschstoß oder gedämpfter Ton 2,5–6 kHz) je Take ----------
const clickSet = (v, sr, seedK) => { sd2 = seedK; const n = v.length, x = Float32Array.from(v), hpS = Float64Array.from(v); for (const q of [0.5411961, 1.3065630]) filt(hpS, bqc('hp', 2000, q, sr)); const CL = [];
  for (let k = 0; k < 20; k++) { const t = 0.3 + k * (n / sr - 0.8) / 20 + rn2() * 0.15, i0 = Math.round(t * sr), d = 0.0005 + rn2() * 0.0025, M = Math.max(4, Math.round(d * sr)), f = 2500 + rn2() * 3500, typ = k % 2;
    let e = 0; for (let i = i0 - 441; i < i0 + 441; i++) e += hpS[i] * hpS[i]; const amp = Math.max(0.01, Math.sqrt(e / 882) * Math.pow(10, (12 + rn2() * 8) / 20)), sg = rn2() < 0.5 ? -1 : 1;
    for (let i = 0; i < M; i++) { const w = Math.min(1, i / 2) * Math.exp(-3 * i / M); x[i0 + i] += sg * amp * w * (typ ? Math.sin(TAU * f * i / sr + 1.2) : (rn2() * 2 - 1)); }
    CL.push({t, d, s0: i0, s1: i0 + M}); }
  return {x, CL}; };
R.click = {};
for (let k = 0; k < SRC.length; k++) {
  const W = wav(RV + SRC[k]), srk = W.sr, v0 = W.x, {x, CL} = clickSet(v0, srk, 777 + k), t0 = Date.now(), r = K.done(K.run(x, srk, {steps: {click: {}}})), ms = Date.now() - t0, L = r.info.click.list;
  const at = (e, c) => e.t1 * srk >= c.s0 - 44 && e.t0 * srk <= c.s1 + 44, hit = CL.filter(c => L.some(e => at(e, c))), fp = L.filter(e => !CL.some(c => at(e, c)));
  const own = K.done(K.clickScan(v0, srk, {})), fpOwn = fp.filter(e => own.some(q => Math.abs(q.t0 - e.t0) < 0.003)), fpNew = fp.filter(e => !fpOwn.includes(e));
  const ownSung = k === 0 && f0tab ? own.filter(q => f0at(q.t0) > 0).length : null;
  const red = hit.map(c => { let e0 = 0, e1 = 0; for (let i = c.s0 - 44; i < c.s1 + 44; i++) { e0 += (x[i] - v0[i]) ** 2; e1 += (r.y[i] - v0[i]) ** 2; } return +(10 * Math.log10(e0 / (e1 + 1e-20))).toFixed(1); }).sort((a, b) => a - b);
  // Überstand im Band > 2 kHz: Klick-Stelle gegen die Umgebung (±10 ms) – vorher / nachher (hörbar = ragt heraus)
  const hb = y => { const z = Float64Array.from(y); for (const q of [0.5411961, 1.3065630]) filt(z, bqc('hp', 2000, q, srk)); return z; }, hx = hb(x), hy = hb(r.y);
  const ov = (z, c) => { let a = 0, b = 0, na = 0, nb = 0; const m = Math.round(0.01 * srk); for (let i = c.s0 - m; i < c.s1 + m; i++) { if (i >= c.s0 && i < c.s1) { a += z[i] * z[i]; na++; } else { b += z[i] * z[i]; nb++; } } return 10 * Math.log10((a / na + 1e-20) / (b / nb + 1e-20)); };
  const ovr = hit.map(c => [+ov(hx, c).toFixed(1), +ov(hy, c).toFixed(1)]), ovMax = Math.max(...ovr.map(q => q[1]));
  let same = true; for (let i = 0; i < x.length && same; i++) if (r.y[i] !== x[i] && !L.some(e => i >= Math.round(e.t0 * srk) - 2 && i < Math.round(e.t1 * srk) + 2)) same = false;
  const nm = 'Take ' + 'ABC'[k];
  R.click[nm] = {gesetzt: 20, gefunden: hit.length, durchgang1: r.info.click.pass1, durchgang2: r.info.click.pass2, fehlNeu: fpNew.length, eigeneGeraeusche: fpOwn.length, eigeneImGesang: ownSung, reduktionMedianDb: red[red.length >> 1], reduktionMinDb: red[0], ueberstandVorMedianDb: ovr.map(q => q[0]).sort((a, b) => a - b)[ovr.length >> 1], ueberstandNachMaxDb: +ovMax.toFixed(1), ms};
  ok(hit.length >= 18, `Klicks ${nm}: ≥ 18 von 20 gefunden (2 Durchgänge)`, {gefunden: hit.length, d1: r.info.click.pass1, d2: r.info.click.pass2});
  ok(fpNew.length <= 1, `Klicks ${nm}: ≤ 1 falscher Treffer (Stellen, an denen der Take vorher kein Geräusch hatte)`, {neu: fpNew.map(e => e.t0), eigeneGeraeuscheDesTakes: fpOwn.length});
  ok(ovr.length && ovMax <= 3, `Klicks ${nm}: repariert – keine gefundene Stelle ragt danach mehr als 3 dB aus ihrer Umgebung (Band > 2 kHz)`, {vorherMedian: R.click[nm].ueberstandVorMedianDb, nachherMax: +ovMax.toFixed(1), fehlerEnergieMedianDb: red[red.length >> 1]});
  ok(same, `Klicks ${nm}: außerhalb der reparierten Stellen bitgleich`, null);
}
// ---------- 6) Atmer: 10 Atmer in den ruhigen Pausen von Take A (auf −20 dBFS Gesang gebracht) → −40 dBFS ± 3 dB, keine Silbe ----------
{ const vN = Float32Array.from(v), gN = Math.pow(10, (-20 - 20 * Math.log10(vr)) / 20); for (let i = 0; i < n; i++) vN[i] *= gN;
  const H = 441, Lf = frames(vN, H), Lv = Lf.filter(q => q > -110).sort((a, b) => a - b), fl = Lv[Math.floor(0.1 * Lv.length)], BR = [], x = Float32Array.from(vN);
  { let s = -1; for (let j = 0; j <= Lf.length; j++) { const t = j * H / sr, q = j < Lf.length && !(f0at(t) > 0) && !(f0at(t + 0.01) > 0) && Lf[j] < fl + 10; if (q && s < 0) s = j; if (!q && s >= 0) { const d = (j - s) * H / sr; if (d >= 0.33 && BR.length < 10) { const bd = Math.min(0.5, d - 0.08), t0 = s * H / sr + (d - bd) / 2; BR.push({t0, t1: t0 + bd, s0: Math.round(t0 * sr), s1: Math.round((t0 + bd) * sr)}); } s = -1; } } }
  for (const b of BR) { const M = b.s1 - b.s0, nz = new Float64Array(M + 4000); for (let i = 0; i < nz.length; i++) nz[i] = rn2() * 2 - 1;
    filt(nz, bqc('hp', 450, 0.7, sr)); filt(nz, bqc('lp', 5000, 0.7, sr)); filt(nz, bqc('pk', 1600, 1.2, sr, 6)); filt(nz, bqc('lp', 7000, 0.7, sr));
    const seg = nz.subarray(4000), env = i => { const u = i / M; return u < 0.35 ? 0.5 - 0.5 * Math.cos(Math.PI * u / 0.35) : 0.5 + 0.5 * Math.cos(Math.PI * (u - 0.35) / 0.65); };
    let e = 0; for (let i = 0; i < M; i++) e += (seg[i] * env(i)) ** 2; b.L = -26 - rn2() * 8; const g = Math.pow(10, b.L / 20) / Math.sqrt(e / M); for (let i = 0; i < M; i++) x[b.s0 + i] += g * seg[i] * env(i); }
  const B = K.done(K.check(x, sr)), r = K.done(K.run(x, sr, {steps: {breath: {}}})), ev = r.info.breath;
  const lv = BR.map(b => { let p0 = 0, p1 = 0; for (let i = b.s0; i < b.s1; i++) { p0 += x[i] ** 2; p1 += r.y[i] ** 2; } return {vor: +db(p0 / (b.s1 - b.s0)).toFixed(1), nach: +db(p1 / (b.s1 - b.s0)).toFixed(1), gefunden: ev.some(q => q.t1 >= b.t0 && q.t0 <= b.t1)}; });
  const okN = lv.filter(q => Math.abs(q.nach + 40) <= 3).length, fpB = ev.filter(q => !BR.some(b => q.t1 >= b.t0 && q.t0 <= b.t1));
  let sung = 0, sungFr = 0; for (let k = 0; k < f0tab.length; k++) { if (!(f0tab[k][1] > 0)) continue; sungFr++; const c = Math.round(f0tab[k][0] * sr); let d = false; for (let i = Math.max(0, c - 441); i < Math.min(n, c + 441); i++) if (r.y[i] !== x[i]) { d = true; break; } if (d) sung++; }
  const Bc = K.done(K.check(vN, sr)), rc = K.done(K.run(vN, sr, {steps: {breath: {}}}));
  let sungC = 0; for (let k = 0; k < f0tab.length; k++) { if (!(f0tab[k][1] > 0)) continue; const c = Math.round(f0tab[k][0] * sr); for (let i = Math.max(0, c - 441); i < Math.min(n, c + 441); i++) if (rc.y[i] !== vN[i]) { sungC++; break; } }
  R.breath = {gesetzt: BR.length, gefunden: lv.filter(q => q.gefunden).length, imZiel: okN, pegel: lv, fehl: fpB.length, pruefenZaehlt: B.breaths, zeile: B.line, gesungeneRahmenGeaendert: sung, gesungeneRahmen: sungFr, sauberTakeAtmer: Bc.breaths, sauberTakeGesungenGeaendert: sungC};
  ok(BR.length === 10 && okN >= 9, 'Atmer: ≥ 9 von 10 auf −40 dBFS ± 3 dB', lv.map(q => q.nach));
  ok(sung === 0 && sungC === 0, 'Atmer: keine gesungene Silbe abgesenkt (alle stimmhaften Rahmen ±10 ms bitgleich)', {mitAtmern: sung, sauberTake: sungC, rahmen: sungFr});
  ok(fpB.length <= 1 && B.breaths >= 9 && B.breaths <= 11, 'Atmer: Prüfen zählt sie, ≤ 1 falscher', {pruefen: B.breaths, fehl: fpB.length, zeile: B.line});
  R.breathTakes = {}; for (let k = 1; k < SRC.length; k++) { const W = wav(RV + SRC[k]); R.breathTakes['Take ' + 'ABC'[k]] = K.done(K.check(W.x, W.sr)).breaths; }
  // ---------- 7) Raumton in Lücken: 5 Schnitte (Stille) in ruhigen Stellen von Take A ----------
  const Lo = frames(v, H), Lov = Lo.filter(q => q > -110).sort((a, b) => a - b), flo = Lov[Math.floor(0.1 * Lov.length)], holes = [], xh = Float32Array.from(v);
  { let s = -1; for (let j = 0; j <= Lo.length; j++) { const q = j < Lo.length && Lo[j] > -110 && Lo[j] < flo + 6; if (q && s < 0) s = j; if (!q && s >= 0) { if (j - s >= 25 && holes.length < 5) { const c = (s + j) / 2 * H, d = Math.min(0.3, 0.5 * (j - s) * H / sr); /* Schnitt mitten in der Pause, Raumton bleibt links und rechts */ holes.push([Math.round(c - d * sr / 2), Math.round(c + d * sr / 2)]); } s = -1; } } }
  for (const [a, b] of holes) xh.fill(0, a, b);
  const t0 = Date.now(), rr = K.done(K.run(xh, sr, {steps: {room: {}}})), msR = Date.now() - t0, RI = rr.info.room;
  const lev = (y, a, b) => { let s = 0; for (let i = a; i < b; i++) s += y[i] * y[i]; return db(s / Math.max(1, b - a)); };
  const oct = (y, a, b) => { const out = []; for (const f of [250, 500, 1000, 2000, 4000, 8000]) out.push(db(band(Float32Array.from(y.subarray(a, b)), sr, f / Math.SQRT2, f * Math.SQRT2))); return out; };
  const HR = holes.map(([a, b]) => { const R0 = Math.round(0.012 * sr), nbA = Math.max(0, a - Math.round(0.15 * sr)), nbB = Math.min(n, b + Math.round(0.15 * sr)), nb = db((Math.pow(10, lev(v, nbA, a) / 10) + Math.pow(10, lev(v, b, nbB) / 10)) / 2);
    const so = oct(v, a, b), sf = oct(rr.y, a, b), d0 = so.map((q, i) => sf[i] - q), mean = d0.reduce((s, q) => s + q, 0) / d0.length;
    return {vorher: +lev(xh, a + R0, b - R0).toFixed(1), daneben: +nb.toFixed(1), original: +lev(v, a + R0, b - R0).toFixed(1), baender: d0.map(q => +q.toFixed(1)), gefuellt: +lev(rr.y, a + R0, b - R0).toFixed(1), formDb: +Math.max(...d0.map(q => Math.abs(q - mean))).toFixed(1), rand: +Math.max(Math.abs(rr.y[a]), Math.abs(rr.y[b - 1])).toExponential(1)}; });
  let sameR = true; for (let i = 0; i < n && sameR; i++) if (rr.y[i] !== xh[i] && !RI.holes.some(h => i >= Math.round(h.t0 * sr) && i < Math.round(h.t1 * sr))) sameR = false;
  const allIn = holes.every(([a, b]) => RI.holes.some(h => h.t0 * sr <= a + 441 && h.t1 * sr >= b - 441));
  R.room = {gelernt: RI.learned, luecken: HR, gefuellt: RI.holes.length, ms: msR};
  ok(holes.length === 5 && allIn && HR.every(h => Math.abs(h.gefuellt - h.original) <= 3), 'Raumton: jede Lücke gefüllt, Pegel wie der Raumton an der Stelle vor dem Schnitt ± 3 dB (kein Loch mehr)', HR.map(h => [h.vorher, h.original, h.gefuellt]));
  ok(HR.every(h => h.formDb <= 4), 'Raumton: Klangfarbe (Oktavbänder 250 Hz–8 kHz) wie der Raumton an der Stelle ± 4 dB', HR.map(h => h.formDb));
  ok(sameR && HR.every(h => +h.rand < 1e-3), 'Raumton: 10-ms-Blenden innen, außerhalb der Lücken bitgleich', {bitgleich: sameR, rand: HR.map(h => h.rand)});
  { const W = wav(RV + SRC[1]), r1 = K.done(K.run(W.x, W.sr, {steps: {room: {}}})); R.room.takeB = r1.info.room.why || (r1.info.room.holes.length + ' gefüllt'); }
  // Kette mit allem: feste Reihenfolge
  const rk = K.done(K.run(x, sr, {steps: {room: {}, breath: {}, hp: {}, hum: 'auto', plop: {}, click: {}}}));
  ok(JSON.stringify(rk.info.order) === '["click","plop","hum","hp","breath","room"]', 'Kette: Klicks → Plopps → Brummen → Hochpass → Atmer → Raumton (fest)', rk.info.order);
  globalThis.__atmerX = x; globalThis.__atmerB = BR;
}
// ---------- 5) Zischen (Teil 3): 10 eingesetzte „s“ (Rauschen 5–10 kHz, 150 ms, −3 dB unter dem Gesang) an leisen Stellen ----------
{ const H = 441, nf = Math.floor(n / H), e = new Float64Array(nf); for (let j = 0; j < nf; j++) { let s = 0; for (let i = j * H; i < j * H + H; i++) s += v[i] * v[i]; e[j] = s / H; }
  const L = Math.round(0.15 * sr), pos = [], used = new Uint8Array(nf), idx = [...e.keys()].filter(j => e[j] > 1e-9 && j > 50 && j < nf - 50).sort((a, b) => e[a] - e[b]);
  for (const j of idx) { if (pos.length >= 10) break; if (used[j]) continue; pos.push(j * H); for (let q = Math.max(0, j - 150); q < Math.min(nf, j + 150); q++) used[q] = 1; }
  const sN = new Float32Array(n); seed = 777; let bs = [0, 0, 0, 0];
  const c1 = (() => { const w = TAU * 5000 / sr, al = Math.sin(w) / (2 * 0.7071), a0 = 1 + al; return [(1 + Math.cos(w)) / 2 / a0, -(1 + Math.cos(w)) / a0, (1 + Math.cos(w)) / 2 / a0, -2 * Math.cos(w) / a0, (1 - al) / a0]; })();
  for (const p0 of pos) { let z1 = 0, z2 = 0, s2 = 0; const tmp = new Float32Array(L); for (let i = 0; i < L; i++) { const u = rnd() * 2 - 1, o = c1[0] * u + z1; z1 = c1[1] * u - c1[3] * o + z2; z2 = c1[2] * u - c1[4] * o; tmp[i] = o; s2 += o * o; }
    const g = vr * Math.pow(10, -3 / 20) / Math.sqrt(s2 / L), R = Math.round(0.01 * sr); for (let i = 0; i < L; i++) { const r = Math.min(1, i / R, (L - 1 - i) / R); sN[p0 + i] += g * tmp[i] * r; } }
  const x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = v[i] + sN[i];
  const B = K.done(K.check(x, sr)), y = Float32Array.from(x), info = K.ess(y, sr, 6);
  const bandE = (z, a, b, f1, f2) => band(Float32Array.from(z.subarray(a, b)), sr, f1, f2);   // genau über dem eingesetzten „s“
  const red = pos.map(p0 => +(db(bandE(y, p0, p0 + L, 5000, 16000)) - db(bandE(x, p0, p0 + L, 5000, 16000))).toFixed(1));
  // Vokale: stimmhafte 10-ms-Rahmen (Grundton-Tabelle) ≥ 250 ms weg von den „s“
  const far = i => pos.every(p0 => i < p0 - 0.25 * sr || i > p0 + L + 0.25 * sr); let e0 = 0, e1 = 0, nv = 0, mxd = 0;
  for (let j = 0; j < nf; j++) { const i = j * H; if (!far(i) || !(f0at(i / sr) > 0) || e[j] < 1e-6) continue; let a = 0, b2 = 0; for (let q = i; q < i + H; q++) { a += x[q] * x[q]; b2 += y[q] * y[q]; } e0 += a; e1 += b2; nv++; mxd = Math.max(mxd, Math.abs(db(b2) - db(a))); }
  const vok = +(db(e1) - db(e0)).toFixed(3); let same = 0, tot = 0; for (let j = 0; j < nf; j++) { const i = j * H; if (!far(i) || !(f0at(i / sr) > 0)) continue; tot++; let eq = true; for (let q = i; q < i + H; q++) if (y[q] !== x[q]) { eq = false; break; } if (eq) same++; }
  R.zischen = {s: pos.length, reduktionDb: red, vokaleDb: vok, vokaleMaxRahmenDb: +mxd.toFixed(2), vokalRahmen: nv, bitgleich: same + '/' + tot, info, pruefen: {sibPct: B.sibPct, line: B.line}};
  const md = red.slice().sort((a, b) => a - b)[5]; ok(red.filter(d => d <= -5.5).length >= 9 && md <= -5.95, 'Zischen: S-Energie > 5 kHz −6 dB (Median; ≥ 9 von 10 „s“ ≤ −5,5 dB, Rest = 10-ms-Ränder), Stärke 6 dB', {reduktionDb: red, median: md});
  ok(Math.abs(vok) <= 0.5, 'Zischen: Vokale ändern sich ≤ 0,5 dB', {vokaleDb: vok, rahmen: nv, bitgleich: same + '/' + tot});
  ok(info.how === 'spektral' && info.latMs > 20 && info.latMs < 26, 'Zischen: spektral, Blocklänge ≈ 23 ms (offline vorausgerechnet, beim Mithören aus)', info);
  const sc = K.done(K.check(v, sr)), A1 = K.assist(sc, 'leicht'), A2 = K.assist(sc, 'mittel'), A3 = K.assist(sc, 'stark'), Bm = K.assist(B, 'mittel');
  R.assist = {sauber: {zeile: sc.line, mittel: Object.keys(A2.steps)}, mitS: {zeile: B.line, mittel: Object.keys(Bm.steps), ess: Bm.steps.ess}, vorschlag: K.suggest(B), worst: K.worst(B, 10)};
  ok(Bm.steps.ess && Bm.steps.ess.amt === 6 && K.assist(B, 'leicht').steps.ess.amt === 3 && K.assist(B, 'stark').steps.ess.amt === 9, 'Assistent: Zischen gefunden → Entzischer mit 3 / 6 / 9 dB (× 0,5 / 1 / 1,5)', R.assist.mitS);
  const W = K.worst(B, 10); ok(W.t1 - W.t0 === 10 && pos.filter(p0 => p0 / sr >= W.t0 && p0 / sr < W.t1).length >= 2, 'Assistent: 10 s Vorhören an der Stelle mit den meisten Funden', W);
  globalThis.__essX = x; }
// ---------- 4) 3-min-Take: Rechenzeit Kern (Desktop × 3 ≤ 20 s) ----------
{ const L = Math.round(180 * sr), x = new Float32Array(L); for (let i = 0; i < L; i++) x[i] = v[i % n] + P[i % n] + 0.003 * Math.sin(TAU * 50 * i / sr);
  const t0 = Date.now(); K.done(K.check(x, sr)); const t1 = Date.now(); K.done(K.run(x, sr, {steps: {click: {}, plop: {}, hum: 'auto', hp: {}, breath: {}, room: {}}})); const t2 = Date.now();
  R.zeit3min = {pruefenMs: t1 - t0, ketteMs: t2 - t1};
  ok(3 * (t2 - t0) <= 20000, '3-min-Take: Prüfen + Kette × 3 ≤ 20 s', R.zeit3min); }
if (!process.argv.includes('--nur-kern')) await browser();
fs.writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), 'voxr1-test.json'), JSON.stringify(R, null, 1));
console.log(`ERGEBNIS ${okN}/${okN + badN}` + (badN ? ' – FEHLER' : ' – alles OK'));

async function browser() {
  const { chromium } = await import('/opt/node-tools/node_modules/playwright/index.mjs');
  const b = await chromium.launch(), errs = [];
  const p = await b.newPage({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true});
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1500);
  const run = (fn, arg) => p.evaluate('(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)); return (' + fn.toString() + ')(' + JSON.stringify(arg == null ? null : arg) + '); })()');
  // Take A mit Brumm + Plopps als Take in die App
  const x16 = new Int16Array(n); for (let i = 0; i < n; i++) x16[i] = Math.max(-32768, Math.min(32767, Math.round((v[i] + P[i] + vr * 0.1 * Math.sqrt(2 / 7) * [1, 2, 3, 4, 5, 6, 7].reduce((s, k) => s + Math.sin(TAU * 50 * k * i / sr), 0)) * 32767)));
  const b64 = Buffer.from(x16.buffer).toString('base64');
  const id = await run(async o => { const s = atob(o.b), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); const pcm = Array.from(new Int16Array(u.buffer));
    const r = await SYNQUENZER.tkInject({pcm, sr: o.sr, scene: 0, at: 0, len: 2}); await wait(300); window.__tk0 = r; return r.id; }, {b: b64, sr});
  // Node-Ergebnis für denselben Int16-Take
  const xf = new Float32Array(n); for (let i = 0; i < n; i++) xf[i] = x16[i] / 32767;
  const nb = K.done(K.check(xf, sr)), nr = K.done(K.run(xf, sr, {steps: {click: {}, plop: {}, hum: 'auto', hp: {}, breath: {}, room: {}}}));
  const h = y => { const u = new Uint8Array(y.buffer, y.byteOffset, y.byteLength); let s = 0x811c9dc5; for (let i = 0; i < u.length; i++) { s ^= u[i]; s = Math.imul(s, 0x01000193) >>> 0; } return s.toString(16); };
  const W = await run(async o => { const pr = []; const c = await SYNQUENZER.vr1Check(o.id); const j = await window.__vr1.take('run', o.id, {steps: {click: {}, plop: {}, hum: 'auto', hp: {}, breath: {}, room: {}}}, q => pr.push(q));
    const u = new Uint8Array(j.y.buffer); let s = 0x811c9dc5; for (let i = 0; i < u.length; i++) { s ^= u[i]; s = Math.imul(s, 0x01000193) >>> 0; }
    return {line: c.line, plops: c.plops.length, hum: c.hum.f0, hash: s.toString(16), prog: pr.length, info: SYNQUENZER.vr1Info(), order: j.info.order}; }, {id});
  ok(W.info.worker === 'worker' && W.line === nb.line && W.hash === h(nr.y), 'App: Prüfen + Kette im Worker = Node-Kern (bitgleich)', {zeile: W.line, worker: W.info.worker, hash: [W.hash, h(nr.y)]});
  ok(W.prog >= 2, 'App: Fortschritt kommt während der Rechnung', {meldungen: W.prog});
  // Rückfall Hauptfaden (Scheiben ≤ 8 ms) = gleiches Ergebnis
  const M = await run(async o => { window.__vr1.noWorker(true); try { const j = await window.__vr1.take('run', o.id, {steps: {click: {}, plop: {}, hum: 'auto', hp: {}, breath: {}, room: {}}}); const u = new Uint8Array(j.y.buffer); let s = 0x811c9dc5; for (let i = 0; i < u.length; i++) { s ^= u[i]; s = Math.imul(s, 0x01000193) >>> 0; } return {hash: s.toString(16), info: SYNQUENZER.vr1Info()}; } finally { window.__vr1.noWorker(false); } }, {id});
  ok(M.hash === W.hash && M.info.slices > 3, 'Rückfall Hauptfaden in Scheiben: gleiches Ergebnis', {scheiben: M.info.slices});
  // 3-min-Take im Worker: Zeit, Abbruch, keine Long Tasks > 50 ms auf dem Hauptfaden
  const Z = await run(async o => {
    const L = Math.round(180 * o.sr), src = await (async () => { const m = S.takes[o.id]; return await tkPcm(o.id); })(), x = new Int16Array(L); for (let i = 0; i < L; i++) x[i] = src[i % src.length];
    const lt = []; let ob = null; try { ob = new PerformanceObserver(l => { for (const e of l.getEntries()) lt.push(Math.round(e.duration)); }); ob.observe({entryTypes: ['longtask']}); } catch (e) {}
    // Abbruch nach 300 ms
    const j1 = window.__vr1.job('run', x, o.sr, {steps: {plop: {}, hum: 'auto', hp: {}}}); await wait(300); const ta = performance.now(); j1.abort(); let ab = ''; try { await j1.p; } catch (e) { ab = e.message; } const abMs = performance.now() - ta;
    // ganzer Lauf (Prüfen + Kette), dabei Chat-artige Arbeit auf dem Hauptfaden messen (Takt 16 ms)
    let tick = 0, maxGap = 0, lastT = performance.now(); const iv = setInterval(() => { const t = performance.now(); maxGap = Math.max(maxGap, t - lastT); lastT = t; tick++; }, 16);
    const t0 = performance.now(), pr = []; await window.__vr1.job('check', x, o.sr, null, q => pr.push(q)).p; const t1 = performance.now(); const r = await window.__vr1.job('run', x, o.sr, {steps: {click: {}, plop: {}, hum: 'auto', hp: {}, breath: {}, room: {}}}, q => pr.push(q)).p; const t2 = performance.now();
    clearInterval(iv); await wait(100); if (ob) ob.disconnect();
    return {abbruch: ab, abbruchMs: Math.round(abMs), pruefenMs: Math.round(t1 - t0), ketteMs: Math.round(t2 - t1), longTasks: lt, maxLueckeMs: Math.round(maxGap), fortschritt: pr.length, plopps: r.info.plop.length, aborts: SYNQUENZER.vr1Info().aborts};
  }, {id, sr});
  R.app3min = Z;
  ok(Z.abbruch === 'abgebrochen' && Z.abbruchMs < 100, 'Abbrechbar: Abbruch wirkt sofort, danach rechnet ein neuer Worker', {ms: Z.abbruchMs});
  ok(3 * (Z.pruefenMs + Z.ketteMs) <= 20000, 'App: 3-min-Take im Worker, Prüfen + Kette × 3 ≤ 20 s', {pruefen: Z.pruefenMs, kette: Z.ketteMs});
  ok(!Z.longTasks.some(d => d > 50) && Z.maxLueckeMs < 60, 'Hauptfaden ohne Long Task > 50 ms während der Rechnung', {longTasks: Z.longTasks, maxLuecke: Z.maxLueckeMs});
  // Brummen live: IIRFilterNode-Kette = Kern offline
  const Lv = await run(async o => { const sr = 48000, n = sr * 2, x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = 0.1 * Math.sin(2 * Math.PI * 50 * i / sr) + 0.05 * Math.sin(2 * Math.PI * 150 * i / sr) + 0.05 * Math.sin(2 * Math.PI * 440 * i / sr);
    const ctx = new OfflineAudioContext(1, n, sr), bf = ctx.createBuffer(1, n, sr); bf.getChannelData(0).set(x); const s = ctx.createBufferSource(); s.buffer = bf; const L = window.__vr1.humLive(ctx, {f0: 50, n: 7}); s.connect(L.input); L.output.connect(ctx.destination); s.start(); const out = (await ctx.startRendering()).getChannelData(0);
    const K = window.__vr1.make(), y = K.done(K.run(x, sr, {steps: {hum: {f0: 50, n: 7}}})).y; let d = 0, e = 0; for (let i = 0; i < n; i++) { d = Math.max(d, Math.abs(out[i] - y[i])); } for (let i = sr; i < n; i++) e += out[i] * out[i]; return {maxDiff: d, n: L.n, typ: L.nodes[0].constructor.name, restDb: 10 * Math.log10(e / sr / (0.05 * 0.05 / 2))}; }, null);
  ok(Lv.n === 7 && Lv.maxDiff < 1e-4, 'Brummen live (Filterkette der Wiedergabe) = Kern offline', Lv);
  // Touch über CDP: Takes-Blatt / Säubern-Zeile unverändert (Aussehen bleibt in Teil 1), nichts ragt aus dem Bild
  const cdp = await p.context().newCDPSession(p);
  const ui = async () => run(async () => { const r = {}; const sc = document.querySelector('[data-tr]') ; r.w = innerWidth; r.h = innerHeight; r.over = [...document.querySelectorAll('body *')].filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && (b.right > innerWidth + 1) && getComputedStyle(e).position !== 'fixed' && !e.closest('[hidden]'); }).length; return r; }, null);
  const tap = async (x, y) => { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y}]}); await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await p.waitForTimeout(250); };
  const vb = await run(async () => { const e = [...document.querySelectorAll('button,[role=button]')].find(b => b.offsetParent && /SÄUBERN|Takes|TAKES/.test(b.textContent || '')); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; }, null);
  if (vb) await tap(vb.x, vb.y);
  await run(async o => { if (!(UI.pop && UI.pop.name === 'takes')) { const r = window.__tk0; try { tkSheet({t: r.track, s: r.scene}); } catch (e) { console.log('tkSheet ' + e); } } await wait(400); }, {id});
  const U = await run(async () => { const p = UI.pop && UI.pop.el; if (!p) return {pop: UI.pop ? UI.pop.name : null}; const b = p.getBoundingClientRect(), cb = p.querySelector('.clbox'); return {pop: UI.pop.name, in: b.left >= -1 && b.right <= innerWidth + 1 && b.top >= -1, clbox: !!cb, clboxH: cb ? Math.round(cb.getBoundingClientRect().height) : null, vr1: !!p.querySelector('.vr1') }; }, null);
  R.ui = U; await p.screenshot({path: path.join(path.dirname(file), 'voxr1-blatt.png')});
  // Teil 3: Zeile „Gesang reinigen“ im Säubern-Blatt (Touch über CDP)
  const geo = async () => run(async () => { const p = UI.pop && UI.pop.el, d = p && p.querySelector('.vr1'); if (!d) return null; const B = [...d.querySelectorAll('button'), ...p.querySelectorAll('.clab button')].filter(b => b.offsetParent);
    const c = s => { const e = d.querySelector(s) || p.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, vis: r.top >= 0 && r.bottom <= innerHeight}; };
    return {lab: d.querySelector('.cllab').textContent, minH: Math.min(...B.map(b => b.getBoundingClientRect().height)), n: B.length, ab: [...p.querySelectorAll('.clbox .clab')][0] ? [...[...p.querySelectorAll('.clbox .clab')][0].querySelectorAll('button')].map(b => b.textContent) : [], st: d.querySelector('.vr1st').textContent,
      mittel: c('[data-vr1="mittel"]'), pv: c('[data-vr1a="pv"]'), ap: c('[data-vr1a="ap"]'), more: c('[data-vr1a="more"]'), weg: c('[data-vr1ab]'), sauber: c('button[data-cl="sauber"]'), roh: c('button[data-cl="roh"]')}; }, null);
  const tapEl = async (k, g0) => { let g = g0 || await geo(); if (g && g[k] && !g[k].vis) { await run(async o => { const p = UI.pop.el, e = p.querySelector(o.s); if (e) e.scrollIntoView({block: 'center'}); await wait(150); }, {s: {mittel: '[data-vr1="mittel"]', pv: '[data-vr1a="pv"]', ap: '[data-vr1a="ap"]', more: '[data-vr1a="more"]', weg: '[data-vr1ab]', sauber: 'button[data-cl="sauber"]', roh: 'button[data-cl="roh"]'}[k]}); g = await geo(); } if (g && g[k]) await tap(g[k].x, g[k].y); return g; };
  const until = async (fn, arg, ms) => { const t0 = Date.now(); let r; while (Date.now() - t0 < (ms || 20000)) { r = await run(fn, arg); if (r && r.ok) return r; await p.waitForTimeout(200); } return r; };
  let G0 = await geo(); R.ui3 = {zeile: G0};
  ok(!!G0 && G0.lab === 'Gesang reinigen' && G0.minH >= 44 && G0.ab.join('|') === 'Roh|Sauber|nur Entferntes', 'Säubern-Blatt: Zeile „Gesang reinigen“, A/B dreiteilig Roh │ Sauber │ nur Entferntes, Trefferflächen ≥ 44 px', G0 && {lab: G0.lab, minH: G0.minH, ab: G0.ab});
  await tapEl('mittel'); const C1 = await until(async o => { const s = document.querySelector('.vr1st'); return {ok: /Befund/.test(s && s.textContent || ''), st: s && s.textContent}; }, null);
  ok(C1 && C1.ok, 'Touch „mittel“: Take wird geprüft, Befund + Schritte der Stufe in der Zustandszeile', C1);
  await tapEl('more'); const Mo = await run(async () => { const g = document.querySelector('.vr1st2'); return {offen: !!g && !g.closest('[hidden]'), knoepfe: g ? [...g.querySelectorAll('button')].map(b => b.textContent) : []}; }, null);
  ok(Mo.offen && Mo.knoepfe.length === 7, 'Mehr ▾: Einzelschritte in fester Reihenfolge (an/aus)', Mo);
  const U3 = await ui(); ok(U3.over === 0, 'Zeile + Mehr ▾: nichts ragt aus dem Bild (hochkant 428×926)', U3);
  await p.screenshot({path: path.join(path.dirname(file), 'voxr1-blatt.png')});
  await tapEl('pv'); const Pv = await until(async o => { const v = SYNQUENZER.vr1Ver(o.id); return {ok: !!v.pv, pv: v.pv}; }, {id}, 30000);
  await tapEl('weg'); const Ab = await run(async o => SYNQUENZER.vr1Ver(o.id).ab, {id}); await tapEl('sauber'); const Ab2 = await run(async o => SYNQUENZER.vr1Ver(o.id).ab, {id});
  R.ui3.vorhoeren = {pv: Pv, ab: [Ab, Ab2]};
  ok(Pv && Pv.ok && Pv.pv.t1 - Pv.pv.t0 <= 10.01 && Ab === 'weg' && Ab2 === 'sauber', 'Touch ▶ 10 s: Vorhören an der schlimmsten Stelle, A/B auf „nur Entferntes“ und zurück', R.ui3.vorhoeren);
  await run(async () => { SYNQUENZER.vr1PvStop(); }, null);
  const h0 = await run(async o => SYNQUENZER.tkPcmHash(o.id), {id}), ph0 = await run(async o => SYNQUENZER.clPlayHash(o.id), {id});
  await tapEl('ap'); const Ap = await until(async o => { const v = SYNQUENZER.vr1Ver(o.id); return {ok: v.ready && !v.busy, v: {applied: v.applied && v.applied.lv, steps: v.applied && Object.keys(v.applied.steps), ready: v.ready}}; }, {id}, 40000);
  // die Gesangs-Effekte (G4, an der STIMME-Spur an) rechnen danach auf der neuen Fassung neu – darauf warten
  await until(async o => { SYNQUENZER.clPlayHash(o.id); await wait(150); return {ok: !(typeof G4 !== 'undefined' && (G4.job.has(o.id) || G4.dq.has(o.id)))}; }, {id}, 30000);
  const h1 = await run(async o => SYNQUENZER.tkPcmHash(o.id), {id}), ph1 = await run(async o => SYNQUENZER.clPlayHash(o.id), {id});
  const fv = await run(async o => { const b = window.__vr1.proc(o.id, null), r = tkBuffer(o.id); if (!b || !r) return null; const x = b.getChannelData(0), y = r.getChannelData(0); let d = 0; for (let i = 0; i < x.length; i++) d = Math.max(d, Math.abs(x[i] - y[i])); return {laenge: x.length === y.length, maxDiff: +d.toFixed(4)}; }, {id});
  R.ui3.anwenden = {ap: Ap, rohGleich: h0 === h1, spieltNeu: ph0 !== ph1, fassung: fv};
  ok(Ap && Ap.ok && h0 === h1 && ph0 !== ph1 && fv && fv.laenge && fv.maxDiff > 0, 'Touch „Anwenden“: neue Fassung spielt (auch durch die Gesangs-Effekte), Roh-Take bitgleich', R.ui3.anwenden);
  await run(async () => { undo(); await wait(400); }, null);
  await until(async o => { SYNQUENZER.clPlayHash(o.id); await wait(150); return {ok: !(typeof G4 !== 'undefined' && (G4.job.has(o.id) || G4.dq.has(o.id)))}; }, {id}, 30000);
  const Un = await run(async o => ({v: SYNQUENZER.vr1Ver(o.id).applied, ph: SYNQUENZER.clPlayHash(o.id)}), {id});
  ok(!Un.v && Un.ph === ph0, 'Ein ↶ nimmt „Gesang reinigen“ zurück (es spielt wieder die vorige Fassung)', {applied: Un.v, gleich: Un.ph === ph0});
  // Fotos quer (926×428 und 926×370)
  for (const [w, hh, nm] of [[926, 428, 'voxr1-quer.png'], [926, 370, 'voxr1-quer370.png']]) { await p.setViewportSize({width: w, height: hh}); await p.waitForTimeout(400); await run(async () => { const p = UI.pop && UI.pop.el; if (p) { popFit(p); const d = p.querySelector('.vr1'); if (d) d.scrollIntoView({block: 'center'}); } await wait(200); }, null);
    const Uq = await ui(); await p.screenshot({path: path.join(path.dirname(file), nm)}); ok(Uq.over === 0, 'nichts ragt aus dem Bild (quer ' + w + '×' + hh + ')', Uq); }
  await p.setViewportSize({width: 428, height: 926}); await p.waitForTimeout(300);
  // vorhandener Entzischer der Gesangs-Effekte ist spektral (Hauptfaden und Worker)
  { const xa = globalThis.__essX; const b64e = Buffer.from(new Float32Array(xa.subarray(0, Math.min(xa.length, 20 * sr))).buffer).toString('base64');
    const Gd = await run(async o => { const s = atob(o.b), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); const x = new Float32Array(u.buffer); const P = {}; for (const k of G4_K) P[k] = 0; P.ds = 6;
      const a = G4D.render(Float32Array.from(x), o.sr, P, []), b = await g4Call({op: 'render', x: Float32Array.from(x), sr: o.sr, P, marks: []}); return {haupt: a.info.ds, worker: b.info.ds, how: G4.how}; }, {b: b64e, sr});
    R.g4ds = Gd; ok(Gd.haupt && Gd.haupt.how === 'spektral' && Gd.worker && Gd.worker.how === 'spektral' && Gd.how === 'worker', 'Gesangs-Effekte: Entzischer ist spektral (Hauptfaden und Worker), Aussehen unverändert', Gd); }
  const Gu = await run(async () => { const L = ui1Entries(); const e = L.find(x => x.id === 'vr1gesang'); return e ? {n: e.n, w: e.w} : null; }, null);
  ok(!!Gu, 'Guide „Wo finde ich …?“ kennt „Gesang reinigen“', Gu);
  const U0 = await ui(); ok(U0.over === 0, 'nichts ragt aus dem Bild (hochkant 428×926)', U0);
  // Teil 2: Atmer-Marken im Marken-Editor (vorhandener Stil), Touch über CDP
  { const xa = globalThis.__atmerX, x16b = new Int16Array(xa.length); for (let i = 0; i < xa.length; i++) x16b[i] = Math.max(-32768, Math.min(32767, Math.round(xa[i] * 32767)));
    const tk = await run(async o => { const s = atob(o.b), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); const pcm = Array.from(new Int16Array(u.buffer));
      const r = await SYNQUENZER.tkInject({pcm, sr: o.sr, scene: 1, at: 0, len: 2}); await wait(300); return Object.assign({}, r, {h0: await SYNQUENZER.tkPcmHash(r.id)}); }, {b: Buffer.from(x16b.buffer).toString('base64'), sr});
    const M2 = await run(async o => { const c = await SYNQUENZER.vr1Check(o.id); const m1 = SYNQUENZER.vr1Breaths(o.id); const r = await SYNQUENZER.vr1Run(o.id, {steps: {breath: {}}}); const m2 = SYNQUENZER.vr1Breaths(o.id);
      wpOpen({t: o.track, s: o.scene}); await wait(500); const E = WP.ed, cv = E && E.cv, b = cv ? cv.getBoundingClientRect() : null;
      return {pruefen: c.breaths, marken: m1.length, nachLauf: m2.filter(q => q.done && q.dbNeu != null && Math.abs(q.dbNeu + 40) <= 3).length, offen: !!E, hits: E && E.vr1b ? E.vr1b.length : 0, cv: b && {x: b.x, y: b.y, w: b.width, h: b.height}, hit0: E && E.vr1b && E.vr1b[0], info: E && E.info ? E.info.textContent : null}; }, tk);
    R.uiAtmer = M2; await p.screenshot({path: path.join(path.dirname(file), 'voxr1-atmer.png')});
    ok(M2.pruefen >= 9 && M2.marken === M2.pruefen && M2.nachLauf >= 9, 'App: Prüfen legt Atmer-Marken an, der Lauf bringt sie auf −40 dBFS (Roh-Take bleibt)', {pruefen: M2.pruefen, marken: M2.marken, imZiel: M2.nachLauf});
    ok(M2.offen && M2.hits >= 1, 'Marken-Editor zeichnet die Atmer-Marken (Band über der Welle, Farbe der Welle)', {hits: M2.hits, info: M2.info});
    let tapOk = false;
    if (M2.cv && M2.hit0) { const xx = M2.cv.x + Math.max(4, Math.min(M2.cv.w - 4, (M2.hit0.x0 + M2.hit0.x1) / 2)), yy = M2.cv.y + M2.cv.h * 0.5; await tap(xx, yy);
      const T2 = await run(async o => { const okA = SYNQUENZER.vr1BreathAct(o.id, 0, 'weg'); await wait(100); const E = WP.ed; const r = {offen: !!E, hits: E && E.vr1b ? E.vr1b.length : 0, act: SYNQUENZER.vr1Breaths(o.id)[0].act, okA}; return r; }, tk);
      tapOk = T2.offen && T2.hits >= 1 && T2.act === 'weg'; R.uiAtmerTap = T2; }
    ok(tapOk, 'Touch (CDP) auf eine Marke: Editor bleibt offen, Marke „weg“ setzbar (Bedienung der Marken folgt mit der Zeile)', R.uiAtmerTap);
    const U2 = await ui(); ok(U2.over === 0, 'Marken-Editor: nichts ragt aus dem Bild (hochkant 428×926)', U2);
    await run(async () => { wpClose(); await wait(150); }, null);
    const raw = await run(async o => { const a = await SYNQUENZER.tkPcmHash(o.id); return a; }, tk); R.rohHash = raw;
    ok(typeof raw === 'string' && raw === tk.h0, 'Roh-Take nach Prüfen + Lauf bitgleich (Ergebnis nur als neue Fassung)', {vorher: tk.h0, nachher: raw}); }
  ok(!errs.length, 'keine Konsolenfehler', errs.slice(0, 3));
  await b.close();
}
