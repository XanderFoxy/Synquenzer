// SPK6 Kern-Test (Node, Kern aus der Datei): Kopie bitgleich, Noten umsetzen (Tonhöhe ±10 ct, keine Klicks, Zeit), Transponieren,
// Chor (Intervalle ±10 ct, Versatz), Effekte (Pegel/Spektrum), deterministisch, Undo, Speichern/Laden.
// Aufruf: node spk6-kern-test.mjs <abs. index.html>   → spk6-kern-test.json neben der Datei
import fs from 'node:fs'; import path from 'node:path';
const file = path.resolve(process.argv[2] || 'index.html'), html = fs.readFileSync(file, 'utf8');
const grab = (src, name) => { const i = src.indexOf('function ' + name + '('); if (i < 0) return ''; let j = src.indexOf('{', i), dep = 0; for (; j < src.length; j++) { if (src[j] === '{') dep++; else if (src[j] === '}' && --dep === 0) break; } return src.slice(i, j + 1); };
const K = new Function(['vsDspMake', 'spk1DspMake', 'spk2DspMake', 'spk3DspMake', 'spk4DspMake', 'spk5DspMake', 'spk6DspMake', 'ki1KernMake'].map(n => grab(html, n)).join(';\n') + ';return spk1DspMake(vsDspMake());')();
let qid = 0; const call = (op, a) => new Promise((ok, no) => { const id = ++qid; K.on(Object.assign({}, a, {op, qid: id}), m => { if (m.qid !== id || m.prog != null || m.chunk) return; if (m.err) no(new Error(m.err)); else ok(m.ok); }); });
const res = {}, T0 = Date.now(); let fails = 0;
const ok = (k, v, cond) => { res[k] = {v, ok: !!cond}; if (!cond) fails++; console.log((cond ? 'OK     ' : 'FEHLER ') + k + ' ' + JSON.stringify(v)); };
const r2 = x => +(+x).toFixed(2);
// ---- Mess-Werkzeuge
const mono = ch => { const y = new Float32Array(ch[0].length); for (const c of ch) for (let i = 0; i < y.length; i++) y[i] += c[i] / ch.length; return y; };
function f0At(x, sr, t0, t1) {   // YIN (CMNDF) mit Parabel, 60…1000 Hz
  const a = Math.round(t0 * sr), W = Math.round((t1 - t0) * sr) - Math.round(sr / 60), tmin = Math.floor(sr / 1000), tmax = Math.ceil(sr / 60), dd = new Float64Array(tmax + 2);
  for (let tau = 1; tau <= tmax + 1; tau++) { let s = 0; for (let i = 0; i < W; i++) { const e = x[a + i] - x[a + i + tau]; s += e * e; } dd[tau] = s; }
  const cm = new Float64Array(tmax + 2); cm[0] = 1; let run = 0; for (let tau = 1; tau <= tmax + 1; tau++) { run += dd[tau]; cm[tau] = dd[tau] * tau / (run || 1); }
  let best = -1; for (let tau = tmin; tau <= tmax; tau++) if (cm[tau] < 0.15 && cm[tau] < cm[tau - 1] && cm[tau] <= cm[tau + 1]) { best = tau; break; }
  if (best < 0) { let mv = 1e9; for (let tau = tmin; tau <= tmax; tau++) if (cm[tau] < mv) { mv = cm[tau]; best = tau; } }
  const p = cm[best - 1], q = cm[best], r = cm[best + 1], den = p - 2 * q + r, sh = den ? 0.5 * (p - r) / den : 0;
  return sr / (best + sh);
}
const cents = (f, g) => 1200 * Math.log2(f / g);
const rms = (x, sr, t0, t1) => { let s = 0, n = 0; for (let i = Math.round(t0 * sr); i < Math.round(t1 * sr); i++) { s += x[i] * x[i]; n++; } return Math.sqrt(s / Math.max(1, n)); };
const db = v => 20 * Math.log10(v + 1e-12);
function bandDb(x, sr, t0, t1, f0, f1) {   // Energie im Band (Goertzel-freie FFT über ein Fenster)
  const N = 16384, a = Math.round(t0 * sr), re = new Float64Array(N), im = new Float64Array(N), V = K.Z2 ? null : null;
  let e = 0; const steps = Math.max(1, Math.floor(((t1 - t0) * sr - N) / (N / 2)) + 1);
  for (let s = 0; s < steps; s++) { for (let j = 0; j < N; j++) { re[j] = (x[a + s * N / 2 + j] || 0) * (0.5 - 0.5 * Math.cos(2 * Math.PI * j / N)); im[j] = 0; } fftR(re, im);
    for (let k = Math.round(f0 * N / sr); k <= Math.round(f1 * N / sr); k++) e += re[k] * re[k] + im[k] * im[k]; }
  return 10 * Math.log10(e / steps + 1e-30);
}
function fftR(re, im) { const N = re.length; for (let i = 1, j = 0; i < N; i++) { let b = N >> 1; for (; j & b; b >>= 1) j ^= b; j ^= b; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let s = 2; s <= N; s <<= 1) { const h = s >> 1, a = -2 * Math.PI / s; for (let i = 0; i < N; i += s) for (let k = 0; k < h; k++) { const wr = Math.cos(a * k), wi = Math.sin(a * k), c = i + k + h, xr = re[c] * wr - im[c] * wi, xi = re[c] * wi + im[c] * wr; re[c] = re[i + k] - xr; im[c] = im[i + k] - xi; re[i + k] += xr; im[i + k] += xi; } } }
function jumps(x, sr, zones) { let m = 0; for (const [a, b] of zones) for (let i = Math.round(a * sr) + 2; i < Math.round(b * sr); i++) m = Math.max(m, Math.abs(x[i] - 2 * x[i - 1] + x[i - 2])); return m; }
const same = (A, B) => A.length === B.length && A.every((c, i) => c.length === B[i].length && c.every((v, j) => Object.is(v, B[i][j])));
const maxDiff = (A, B) => { let m = 0; for (let c = 0; c < A.length; c++) for (let i = 0; i < A[c].length; i++) m = Math.max(m, Math.abs(A[c][i] - B[c][i])); return m; };

// ---- Quelle: Stereo 48 kHz, 6 s. „Gesang“ = Obertonreihe mit zwei Formanten (A3, D4, B3), dazu Bass 55 Hz
const sr = 48000, n = sr * 6, L = new Float32Array(n), R = new Float32Array(n);
const NOTES = [[1.0, 2.0, 220], [2.2, 3.2, 293.665], [3.4, 4.4, 246.942]];
const formant = f => 1 / (1 + ((f - 700) / 180) ** 2) + 0.7 / (1 + ((f - 1200) / 220) ** 2) + 0.15 / (1 + ((f - 2600) / 400) ** 2);
for (const [a, b, f] of NOTES) { const ph = new Float64Array(40); for (let i = Math.round(a * sr); i < Math.round(b * sr); i++) { const t = i / sr, env = Math.min(1, (t - a) / 0.02, (b - t) / 0.03); let v = 0; for (let h = 1; h <= 30 && h * f < 9000; h++) { v += formant(h * f) * Math.sin(2 * Math.PI * h * f * t) / Math.sqrt(h); } L[i] += 0.12 * env * v; R[i] += 0.12 * env * v; } }
for (let i = 0; i < n; i++) { const v = 0.2 * Math.sin(2 * Math.PI * 55 * i / sr); L[i] += v; R[i] += v; }
const doc0 = await call('create', {name: 'spk6-test', sr, ch: [L, R], grid: {bpm: 120, off: 0, ts: '4/4'}}), doc = doc0.meta.id;
const C = (op, a) => call(op, Object.assign({doc}, a));
const rend = async (mix, a, b) => (await C('render', {mix, a, b})).ch;
await C('transfer', {von: 'orig', nach: {art: 'gesang', name: 'Gesang'}, sel: {art: 'rect', t0: 0.8, t1: 4.7, f0: 150, f1: 9500}});
const nt = await C('noten', {lid: 'L1'}); const N1 = (await C('open', {})).meta.teil2.notes.L1 || [];
ok('noten-gefunden', {n: N1.length, m: N1.map(q => q.m), a: N1.map(q => r2(q.a))}, N1.length >= 3 && [57, 62, 59].every(m => N1.some(q => q.m === m)));
const qA = N1.find(q => q.m === 57), qD = N1.find(q => q.m === 62), qB = N1.find(q => q.m === 59);

// ---- a) Duplizieren = echte Kopie
const mixVor = await rend(null), l1 = await rend('L1');
const du = await C('s6dup', {lid: 'L1'}); const cid = du.lid, l2 = await rend(cid), mixNach = await rend(null);
const cp = du.meta.layers.find(l => l.id === cid);
ok('kopie-bitgleich', {lid: cid, name: cp.name, col: cp.col, quelleCol: du.meta.layers[0].col, noten: (du.meta.teil2.notes[cid] || []).length}, same(l1, l2) && cp.name === 'Gesang Kopie' && cp.col !== du.meta.layers[0].col && (du.meta.teil2.notes[cid] || []).length === N1.length);
{ let m = 0; for (let c = 0; c < 2; c++) for (let i = 0; i < n; i++) m = Math.max(m, Math.abs(mixNach[c][i] - mixVor[c][i] - l1[c][i])); ok('kopie-klingt-zusaetzlich', {maxAbw: m}, m < 1e-4); }

// ---- b) Noten umsetzen (Kopie): A3 +3 Halbtöne, D4 +0,37 Halbtöne (fein), B3 1/16 später
const nA = du.meta.teil2.notes[cid].find(q => q.m === 57), nD = du.meta.teil2.notes[cid].find(q => q.m === 62), nB = du.meta.teil2.notes[cid].find(q => q.m === 59);
const s1 = await C('s6shift', {lid: cid, ids: [nA.id], dm: 3});
let y = mono(await rend(cid));
const fA = f0At(y, sr, 1.25, 1.75), fDu = f0At(y, sr, 2.45, 2.95);
ok('umsetzen-ziel', {f: r2(fA), ziel: r2(220 * 2 ** 0.25), ct: r2(cents(fA, 220 * 2 ** 0.25)), andereNote: r2(fDu), ctAndere: r2(cents(fDu, 293.665)), regs: s1.regs}, Math.abs(cents(fA, 220 * 2 ** 0.25)) <= 10 && Math.abs(cents(fDu, 293.665)) <= 10);
{ const z = [[0.9, 1.08], [1.92, 2.12]], st = [[1.3, 1.7]], jz = jumps(y, sr, z), js = jumps(y, sr, st), y0 = mono(l1), j0 = jumps(y0, sr, z);
  ok('keine-klicks', {sprungBlende: +jz.toExponential(2), sprungNote: +js.toExponential(2), sprungOriginalKanten: +j0.toExponential(2), verh: r2(jz / js)}, jz <= 1.5 * Math.max(js, j0)); }
await C('s6shift', {lid: cid, ids: [nD.id], dm: 0.37});
y = mono(await rend(cid)); { const f = f0At(y, sr, 2.45, 2.95), z = 293.665 * 2 ** (0.37 / 12); ok('fein-37ct', {f: r2(f), ziel: r2(z), ct: r2(cents(f, z))}, Math.abs(cents(f, z)) <= 10); }
const step = 60 / 120 / 4; await C('s6shift', {lid: cid, ids: [nB.id], dt: step});
y = mono(await rend(cid)); { const on = (x, t0, t1) => { const e = []; for (let t = t0; t < t1; t += 0.005) e.push([t, rms(x, sr, t, t + 0.005)]); const pk = Math.max(...e.map(v => v[1])); return e.find(v => v[1] > pk * 0.5)[0]; };
  const a0 = on(mono(l1), 3.2, 3.9), a1 = on(y, 3.2, 3.9), f = f0At(y, sr, 3.7, 4.3); ok('zeit-1/16', {vorher: r2(a0), nachher: r2(a1), soll: r2(a0 + step), fB: r2(f), ct: r2(cents(f, 246.942))}, Math.abs(a1 - a0 - step) < 0.012 && Math.abs(cents(f, 246.942)) <= 10); }
const m0 = (await C('open', {})).meta, nn = m0.teil2.notes[cid];
ok('noten-anzeige-folgt', nn.map(q => ({m: q.m, c6: q.c6 || 0, a: r2(q.a)})), nn.some(q => q.m === 60 && q.o6) && nn.some(q => q.m === 62 && q.c6 === 37) && nn.some(q => Math.abs(q.a - qB.a - step) < 1e-3));
// ganze Ebene −12
await C('s6shift', {lid: cid, tr: -12}); y = mono(await rend(cid)); { const f = f0At(y, sr, 1.25, 1.75); ok('transponieren-12', {f: r2(f), ziel: r2(220 * 2 ** 0.25 / 2), ct: r2(cents(f, 220 * 2 ** 0.25 / 2))}, Math.abs(cents(f, 220 * 2 ** 0.25 / 2)) <= 10); }
// Undo: −12 zurück → Audio wie vorher
const vorU = mono(await rend(cid)); await C('s6shift', {lid: cid, tr: 12}); await C('undo', {}); const nachU = mono(await rend(cid));
ok('undo-umsetzen', {gleich: vorU.every((v, i) => Object.is(v, nachU[i]))}, vorU.every((v, i) => Object.is(v, nachU[i])));

// ---- c) Chor aus L1 (4 Stimmen, Satz)
const key = await C('s6key', {lid: 'L1'}); const ch = await C('s6chor', {lid: 'L1', n: 4, art: 'satz'});
const ivOf = K.Z2.s6.ivOf, lay = id => ch.meta.layers.find(l => l.id === id), base1 = lay('L1');
const cv = [];
for (const v of ch.voices) {
  const ya = mono(await rend(v.lid)), iv = ivOf(57, v.iv, key), f = f0At(ya, sr, 1.3, 1.8), soll = 220 * 2 ** (iv / 12), l = lay(v.lid);
  cv.push({lid: v.lid, name: l.name, iv, f: r2(f), ctZumIntervall: r2(cents(f, soll)), ctZurStreuung: r2(cents(f, soll) - v.ct), dtMs: l.a6.dt, pan: l.fx && l.fx.pan, vol: l.vol, k6: l.k6});
}
ok('chor-intervalle', {tonart: key, stimmen: cv}, cv.length === 4 && cv.every(v => Math.abs(v.ctZumIntervall) <= 10 && Math.abs(v.ctZurStreuung) <= 4 && v.dtMs >= 5 && v.dtMs <= 25 && v.k6 === 1) && new Set(cv.map(v => v.pan)).size === 4);
{ // Versatz: Einsatz (1-ms-Raster, 30 % der Spitze) der Unisono-Stimme gegen L1, dazu die Lage im Speicher
  const u = ch.voices.find(v => v.iv === 'u'), yu = mono(await rend(u.lid)), y1 = mono(l1), on = x => { let pk = 0; for (let t = 0.9; t < 1.3; t += 0.001) pk = Math.max(pk, rms(x, sr, t, t + 0.002)); for (let t = 0.9; t < 1.3; t += 0.001) if (rms(x, sr, t, t + 0.002) > 0.3 * pk) return t; return -1; };
  const g = (on(yu) - on(y1)) * 1000; ok('chor-versatz', {soll: u.dt, gemessenMs: r2(g)}, Math.abs(g - u.dt) <= 2); }
// ---- d) Effekte (auf L1, Solo; Kopie/Chor stumm)
for (const l of ch.meta.layers) if (l.id !== 'L1') await C('layer', {was: 'mute', lid: l.id, v: true});
await C('layer', {was: 'solo', lid: 'L1', v: true});
const dry = await rend(null), dm = mono(dry);
const fxTest = async (fx, fn) => { const r = await C('s6fx', {lid: 'L1', fx}); const w = await rend(null); const out = fn(w); await C('undo', {}); return {r, w, out}; };
let t = await fxTest({pan: -1}, w => ({L: r2(db(rms(w[0], sr, 1, 4))), R: r2(db(rms(w[1], sr, 1, 4)))}));
ok('fx-pan-links', t.out, t.out.R < -80 && Math.abs(t.out.L - db(rms(dry[0], sr, 1, 4))) < 0.1);
t = await fxTest({lp: 1000}, w => ({hochVor: r2(bandDb(dm, sr, 1.2, 1.9, 2500, 8000)), hochNach: r2(bandDb(mono(w), sr, 1.2, 1.9, 2500, 8000)), tiefVor: r2(bandDb(dm, sr, 1.2, 1.9, 150, 500)), tiefNach: r2(bandDb(mono(w), sr, 1.2, 1.9, 150, 500))}));
ok('fx-tiefpass', t.out, t.out.hochVor - t.out.hochNach > 20 && Math.abs(t.out.tiefVor - t.out.tiefNach) < 1.5);
t = await fxTest({hp: 600}, w => ({tiefVor: r2(bandDb(dm, sr, 1.2, 1.9, 150, 260)), tiefNach: r2(bandDb(mono(w), sr, 1.2, 1.9, 150, 260)), hochVor: r2(bandDb(dm, sr, 1.2, 1.9, 2000, 8000)), hochNach: r2(bandDb(mono(w), sr, 1.2, 1.9, 2000, 8000))}));
ok('fx-hochpass', t.out, t.out.tiefVor - t.out.tiefNach > 12 && Math.abs(t.out.hochVor - t.out.hochNach) < 1);
t = await fxTest({lo: 6}, w => ({g220: r2(bandDb(mono(w), sr, 1.2, 1.9, 200, 240) - bandDb(dm, sr, 1.2, 1.9, 200, 240)), g4k: r2(bandDb(mono(w), sr, 1.2, 1.9, 3500, 6000) - bandDb(dm, sr, 1.2, 1.9, 3500, 6000))}));
ok('fx-eq-tiefen', t.out, t.out.g220 > 3 && t.out.g220 < 6.2 && Math.abs(t.out.g4k) < 0.5);
t = await fxTest({mi: -9}, w => ({g1200: r2(bandDb(mono(w), sr, 1.2, 1.9, 1100, 1300) - bandDb(dm, sr, 1.2, 1.9, 1100, 1300))}));
ok('fx-eq-mitten', t.out, t.out.g1200 < -7);
t = await fxTest({hall: 0.7}, w => ({nachklangVor: r2(db(rms(dm, sr, 4.5, 5.0))), nachklangNach: r2(db(rms(mono(w), sr, 4.5, 5.0)))}));
ok('fx-hall', t.out, t.out.nachklangNach - t.out.nachklangVor > 20);
t = await fxTest({echo: 0.7}, w => { const D = 0.375; return {echo1: r2(db(rms(mono(w), sr, 4.4 + 0.05, 4.4 + D - 0.05)) - db(rms(dm, sr, 4.45, 4.4 + D - 0.05)))}; });
ok('fx-echo', t.out, t.out.echo1 > 20);
t = await fxTest({sat: 1}, w => { const a = bandDb(dm, sr, 1.2, 1.9, 200, 240), b = bandDb(mono(w), sr, 1.2, 1.9, 200, 240); return {obertonAnteilVor: r2(bandDb(dm, sr, 1.2, 1.9, 4000, 9000) - a), obertonAnteilNach: r2(bandDb(mono(w), sr, 1.2, 1.9, 4000, 9000) - b), spitzeVor: r2(Math.max(...dm.slice(48000, 96000).map(Math.abs))), spitzeNach: r2(Math.max(...mono(w).slice(48000, 96000).map(Math.abs)))}; });
ok('fx-saettigung', t.out, t.out.obertonAnteilNach - t.out.obertonAnteilVor > 3);
// deterministisch: zweimal und rückwärts (frischer Cache) gleich; Abspiel-Blöcke = render
await C('s6fx', {lid: 'L1', fx: {hall: 0.5, echo: 0.4, lo: 3, lp: 8000, sat: 0.3, pan: 0.3}});
const A1 = await rend(null), A2 = await rend(null); const d = K.docs.get(doc); d.cache.clear(); d.c6 && d.c6.clear();
const NBk = Math.ceil(n / 16384), bl = []; for (let k = NBk - 1; k >= 0; k--) bl[k] = (await C('block', {k})).ch;
let bm = 0; for (let k = 0; k < NBk; k++) for (let c = 0; c < 2; c++) for (let i = 0; i < 16384 && k * 16384 + i < n; i++) bm = Math.max(bm, Math.abs(bl[k][c][i] - A1[c][k * 16384 + i]));
ok('fx-deterministisch', {zweimal: same(A1, A2), rueckwaertsMaxAbw: bm}, same(A1, A2) && bm === 0);
// Undo der Effekte = Zustand vorher
await C('undo', {}); const U1 = await rend(null); ok('undo-effekte', {gleich: same(U1, dry)}, same(U1, dry));
await C('redo', {});
// ---- Speichern / Laden rund (Export → Import → Öffnen)
const vorS = await rend(null), vorC = await rend(cv[0].lid), ex = await call('export', {id: doc});
ok('export-audio', {a6: (ex.a6 || []).map(a => a.id + ':' + a.x.length)}, (ex.a6 || []).length >= 5);
await call('close', {doc}); await call('import', {meta: ex.meta, pcm: ex.pcm, masks: ex.masks, a6: ex.a6});
const nachS = await rend(null), nachC = await rend(cv[0].lid);
ok('speichern-laden-rund', {mix: maxDiff(vorS, nachS), chorStimme: maxDiff(vorC, nachC)}, maxDiff(vorS, nachS) === 0 && maxDiff(vorC, nachC) === 0);
console.log(JSON.stringify({ms: Date.now() - T0, fails}));
fs.writeFileSync(path.join(path.dirname(file), 'spk6-kern-test.json'), JSON.stringify({ms: Date.now() - T0, fails, res}, null, 1));
console.log(fails ? 'FEHLER: ' + fails : 'ALLES OK');
