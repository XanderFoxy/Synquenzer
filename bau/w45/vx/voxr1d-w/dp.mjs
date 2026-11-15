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
const PATCH = process.env.PATCH || ''; const vr1Make = new Function(html.slice(a0, a1).replace('function vr1Make() {', 'function vr1Make() {' + PATCH + ';') + '\nreturn vr1Make;')(), K = vr1Make();
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
// VOXR1B: Wahrheit für Take A. Die Gegenprobe vH = Take A ohne < 70 Hz (nullphasig; tiefster annotierter Grundton 107 Hz, Stimmband 100 Hz–4 kHz
// bleibt) hat keine Tiefstöße; was Prüfen im rohen Take A findet und in vH verschwindet, stimmlos (Annotation) oder ≤ 40 ms vor einem
// Noten-Einsatz liegt, ist ein eigener Tiefstoß des Takes (Verschlusslaut) – kein Fehlalarm. Eingesetzte Stöße in vH = einzige Wahrheit.
const hp70 = z => { const y = Float64Array.from(z); for (const q of [0.5411961, 1.3065630]) { const w = TAU * 70 / sr, c = Math.cos(w), al = Math.sin(w) / (2 * q), a0 = 1 + al, co = [(1 + c) / 2 / a0, -(1 + c) / a0, (1 + c) / 2 / a0, -2 * c / a0, (1 - al) / a0];
  for (const dir of [1, -1]) { let z1 = 0, z2 = 0; for (let k = 0; k < y.length; k++) { const i = dir > 0 ? k : y.length - 1 - k, x0 = y[i], o = co[0] * x0 + z1; z1 = co[1] * x0 - co[3] * o + z2; z2 = co[2] * x0 - co[4] * o; y[i] = o; } } } return Float32Array.from(y); };
const vH = hp70(v), NOTE = (() => { const f = RV + SRC[0].replace('.wav', '_notesA1.csv'); return fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim().split('\n').map(l => +l.split(',')[0]) : []; })();
const OWN = (() => { const raw = K.done(K.check(v, sr)).plops, hpF = K.done(K.check(vH, sr)).plops; return raw.filter(e => !hpF.some(q => q.t1 >= e.t0 && q.t0 <= e.t1) && (!(f0at(e.t0 + 0.01) > 0) || NOTE.some(t => t - e.t0 >= -0.01 && t - e.t0 <= 0.04))); })();
const isOwn = e => OWN.some(q => e.t1 >= q.t0 - 0.01 && e.t0 <= q.t1 + 0.01);
{ const raw = K.done(K.check(v, sr)).plops, hpF = K.done(K.check(vH, sr)).plops, vb = 10 * Math.log10(band(vH, sr, 100, 4000) / band(v, sr, 100, 4000));
  R.plopWahrheit = {rohFunde: raw.length, eigeneTiefstoesse: OWN.length, ohneTief70: hpF.length, stimmband100_4000Db: +vb.toFixed(2), eigene: OWN.map(e => ({t: +e.t0.toFixed(3), f0: Math.round(f0at(e.t0 + 0.01)), vorNoteMs: (() => { const t = NOTE.filter(t => t >= e.t0 - 0.03).sort((a, b) => a - b)[0]; return t != null ? Math.round((t - e.t0) * 1000) : null; })()}))};
  ok(hpF.length === 0 && Math.abs(vb) <= 0.1 && raw.length === OWN.length, 'Take A: jeder Plopp-Fund ist ein eigener Tiefstoß (verschwindet ohne < 70 Hz, stimmlos bzw. ≤ 40 ms vor einem Noten-Einsatz); ohne < 70 Hz 0 Funde', {roh: raw.length, eigene: OWN.length, ohneTief70: hpF.length, stimmbandDb: +vb.toFixed(2)});
  const Q = new Float32Array(n); for (let i = 0; i < n; i++) Q[i] = vH[i] + P[i]; const eq = K.done(K.check(Q, sr)).plops;
  const hq = T.filter(t => eq.some(e => e.t1 >= t - 0.01 && e.t0 <= t + 0.05)).length, fq = eq.filter(e => !T.some(t => e.t1 >= t - 0.01 && e.t0 <= t + 0.05)).length;
  ok(hq >= 9 && fq === 0, 'Plopps (Wahrheit = nur eingesetzte Stöße, Take A ohne < 70 Hz): ≥ 9 von 10 gefunden, 0 Fehlalarme', {gefunden: hq, fehl: fq}); }
{ const x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = v[i] + P[i];
  if (process.env.VR1DBG) { const Fx = K.done(K.feats(x, sr)), Fv = K.done(K.feats(v, sr)); for (const sens of [6, 7, 8, 9, 10]) { const e = K.plopFind(Fx, {sens}), ev = K.plopFind(Fv, {sens}); console.log('DBG sens', sens, 'treffer', T.filter(t => e.some(q => q.t1 >= t - 0.01 && q.t0 <= t + 0.05)).length, 'fehl', e.filter(q => !T.some(t => q.t1 >= t - 0.01 && q.t0 <= t + 0.05)).length, 'sauber', ev.length, JSON.stringify(ev.map(q => [q.t0, +(q.t1 - q.t0).toFixed(3), q.exDb]).slice(0, 8))); } process.exit(0); }
  const t0 = Date.now(), r = K.done(K.run(x, sr, {steps: {plop: {}}})), ms = Date.now() - t0, ev = r.info.plop;
  const hit = T.map(t => ev.find(e => e.t1 >= t - 0.01 && e.t0 <= t + 0.05)), fp = ev.filter(e => !T.some(t => e.t1 >= t - 0.01 && e.t0 <= t + 0.05) && !isOwn(e));   // VOXR1B: eigene Tiefstöße sind Wahrheit
  const N = 4096, red = [], harm = [], harmMax = [];
  for (const t of T) { const c = Math.round((t + 0.02) * sr), a = c - N / 2, e = new Float32Array(n); for (let i = a; i < a + N; i++) e[i] = r.y[i] - v[i];
    const lo = (z) => band(z.subarray(a, a + N), sr, 0, 250); red.push(+(db(lo(P)) - db(lo(e))).toFixed(1));
    const f0 = f0at(t + 0.02), b2 = c - 1024; let hy = 0, hv = 0, mx = 0; for (let k = 1; k * f0 < 4000; k++) { const py = gz(r.y, b2, b2 + 2048, k * f0, sr), pv = gz(v, b2, b2 + 2048, k * f0, sr); hy += py; hv += pv; if (pv > 1e-6 * gz(v, b2, b2 + 2048, f0, sr)) mx = Math.max(mx, Math.abs(db(py) - db(pv)) * (pv / (hv || 1) > 0.02 ? 1 : 0)); }
    harm.push(+(db(hy) - db(hv)).toFixed(2)); harmMax.push(+mx.toFixed(2)); }
  // außerhalb der Stöße bitgleich
  let same = true; for (let i = 0; i < n && same; i++) { const near = T.some(t => Math.abs(i / sr - t) < 0.2) || ev.some(e => i / sr > e.t0 - 0.05 && i / sr < e.t1 + 0.05); if (!near && r.y[i] !== x[i]) same = false; }
  R.plop = {gesetzt: T.length, gefunden: hit.filter(Boolean).length, fehl: fp.length, reduktionDb: red, oberToeneDb: harm, oberToeneMaxEinzelDb: harmMax, ms};
  ok(hit.filter(Boolean).length >= 9 && fp.length === 0, 'Plopps: ≥ 9 von 10 gefunden, 0 Fehlalarme (eigene Tiefstöße des Takes zählen als Wahrheit)', {gefunden: hit.filter(Boolean).length, fehl: fp.length});
  ok(red.filter((d, k) => hit[k]).every(d => d >= 12), 'Plopps: je ≥ 12 dB weniger (Band < 250 Hz, Fehler gegen den sauberen Take)', red);
  ok(harm.every(d => Math.abs(d) <= 1), 'Plopps: Obertöne der Stimme an den Stellen ≤ 1 dB Änderung', {summe: harm, einzelnMax: harmMax});
  ok(same, 'Plopps: außerhalb der Stöße bitgleich', null);
  const B = K.done(K.check(x, sr)); ok(Math.abs(B.plops.length - (10 + OWN.length)) <= 1, 'Prüfen zählt die Plopps (10 eingesetzte + eigene Tiefstöße)', {n: B.plops.length, eigene: OWN.length, zeile: B.line}); R.zeilePlopp = B.line;
  // Kette Plopps → Brummen → Hochpass: Reihenfolge fest, Plopps sehen den Tiefbass vor dem Hochpass
  const r2 = K.done(K.run(x, sr, {steps: {hp: {}, hum: 'auto', plop: {}}}));
  ok(JSON.stringify(r2.info.order) === '["plop","hum","hp"]' && r2.info.plop.length === ev.length, 'Kette: Plopps → Brummen → Hochpass (feste Reihenfolge, gleiche Plopps wie allein)', r2.info.order);
}
