// VOX-R1 Teil 1/3: Abnahme mit synthetisch eingesetzten Fehlern in echten Gesangs-Takes (Kern in Node + App im Browser, Touch über CDP).
// Aufruf: node voxr1-test.mjs <abs index.html> [basis.html]   – Ausgaben nennen nur „Take A/B/C“, keine Datensatz-Namen.
import fs from 'fs';
import path from 'path';
const file = process.argv[2], basis = process.argv[3];
const RV = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/realvox/dl/';
const SRC = fs.readdirSync(RV).filter(f => /\.wav$/.test(f)).sort((a, b) => parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, '')));
let okN = 0, badN = 0; const R = {};
const ok = (c, name, info) => { if (c) okN++; else badN++; console.log((c ? 'OK ' : 'FEHLER ') + name + (info != null ? ' – ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); };
const html = fs.readFileSync(file, 'utf8'), a0 = html.indexOf('function vr1Make() {'), a1 = html.indexOf('\nconst VR1 = {', a0);
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
  const t0 = Date.now(), r = K.done(K.run(x, sr, {steps: {plop: {}}})), ms = Date.now() - t0, ev = r.info.plop;
  const hit = T.map(t => ev.find(e => e.t1 >= t - 0.01 && e.t0 <= t + 0.05)), fp = ev.filter(e => !T.some(t => e.t1 >= t - 0.01 && e.t0 <= t + 0.05));
  const N = 4096, red = [], harm = [], harmMax = [];
  for (const t of T) { const c = Math.round((t + 0.02) * sr), a = c - N / 2, e = new Float32Array(n); for (let i = a; i < a + N; i++) e[i] = r.y[i] - v[i];
    const lo = (z) => band(z.subarray(a, a + N), sr, 0, 250); red.push(+(db(lo(P)) - db(lo(e))).toFixed(1));
    const f0 = f0at(t + 0.02), b2 = c - 1024; let hy = 0, hv = 0, mx = 0; for (let k = 1; k * f0 < 4000; k++) { const py = gz(r.y, b2, b2 + 2048, k * f0, sr), pv = gz(v, b2, b2 + 2048, k * f0, sr); hy += py; hv += pv; if (pv > 1e-6 * gz(v, b2, b2 + 2048, f0, sr)) mx = Math.max(mx, Math.abs(db(py) - db(pv)) * (pv / (hv || 1) > 0.02 ? 1 : 0)); }
    harm.push(+(db(hy) - db(hv)).toFixed(2)); harmMax.push(+mx.toFixed(2)); }
  // außerhalb der Stöße bitgleich
  let same = true; for (let i = 0; i < n && same; i++) { const near = T.some(t => Math.abs(i / sr - t) < 0.2); if (!near && r.y[i] !== x[i]) same = false; }
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
// ---------- 4) 3-min-Take: Rechenzeit Kern (Desktop × 3 ≤ 20 s) ----------
{ const L = Math.round(180 * sr), x = new Float32Array(L); for (let i = 0; i < L; i++) x[i] = v[i % n] + P[i % n] + 0.003 * Math.sin(TAU * 50 * i / sr);
  const t0 = Date.now(); K.done(K.check(x, sr)); const t1 = Date.now(); K.done(K.run(x, sr, {steps: {plop: {}, hum: 'auto', hp: {}}})); const t2 = Date.now();
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
    const r = await SYNQUENZER.tkInject({pcm, sr: o.sr, scene: 0, at: 0, len: 2}); await wait(300); return r.id; }, {b: b64, sr});
  // Node-Ergebnis für denselben Int16-Take
  const xf = new Float32Array(n); for (let i = 0; i < n; i++) xf[i] = x16[i] / 32767;
  const nb = K.done(K.check(xf, sr)), nr = K.done(K.run(xf, sr, {steps: {plop: {}, hum: 'auto', hp: {}}}));
  const h = y => { const u = new Uint8Array(y.buffer, y.byteOffset, y.byteLength); let s = 0x811c9dc5; for (let i = 0; i < u.length; i++) { s ^= u[i]; s = Math.imul(s, 0x01000193) >>> 0; } return s.toString(16); };
  const W = await run(async o => { const pr = []; const c = await SYNQUENZER.vr1Check(o.id); const j = await window.__vr1.take('run', o.id, {steps: {plop: {}, hum: 'auto', hp: {}}}, q => pr.push(q));
    const u = new Uint8Array(j.y.buffer); let s = 0x811c9dc5; for (let i = 0; i < u.length; i++) { s ^= u[i]; s = Math.imul(s, 0x01000193) >>> 0; }
    return {line: c.line, plops: c.plops.length, hum: c.hum.f0, hash: s.toString(16), prog: pr.length, info: SYNQUENZER.vr1Info(), order: j.info.order}; }, {id});
  ok(W.info.worker === 'worker' && W.line === nb.line && W.hash === h(nr.y), 'App: Prüfen + Kette im Worker = Node-Kern (bitgleich)', {zeile: W.line, worker: W.info.worker, hash: [W.hash, h(nr.y)]});
  ok(W.prog >= 2, 'App: Fortschritt kommt während der Rechnung', {meldungen: W.prog});
  // Rückfall Hauptfaden (Scheiben ≤ 8 ms) = gleiches Ergebnis
  const M = await run(async o => { window.__vr1.noWorker(true); try { const j = await window.__vr1.take('run', o.id, {steps: {plop: {}, hum: 'auto', hp: {}}}); const u = new Uint8Array(j.y.buffer); let s = 0x811c9dc5; for (let i = 0; i < u.length; i++) { s ^= u[i]; s = Math.imul(s, 0x01000193) >>> 0; } return {hash: s.toString(16), info: SYNQUENZER.vr1Info()}; } finally { window.__vr1.noWorker(false); } }, {id});
  ok(M.hash === W.hash && M.info.slices > 3, 'Rückfall Hauptfaden in Scheiben: gleiches Ergebnis', {scheiben: M.info.slices});
  // 3-min-Take im Worker: Zeit, Abbruch, keine Long Tasks > 50 ms auf dem Hauptfaden
  const Z = await run(async o => {
    const L = Math.round(180 * o.sr), src = await (async () => { const m = S.takes[o.id]; return await tkPcm(o.id); })(), x = new Int16Array(L); for (let i = 0; i < L; i++) x[i] = src[i % src.length];
    const lt = []; let ob = null; try { ob = new PerformanceObserver(l => { for (const e of l.getEntries()) lt.push(Math.round(e.duration)); }); ob.observe({entryTypes: ['longtask']}); } catch (e) {}
    // Abbruch nach 300 ms
    const j1 = window.__vr1.job('run', x, o.sr, {steps: {plop: {}, hum: 'auto', hp: {}}}); await wait(300); const ta = performance.now(); j1.abort(); let ab = ''; try { await j1.p; } catch (e) { ab = e.message; } const abMs = performance.now() - ta;
    // ganzer Lauf (Prüfen + Kette), dabei Chat-artige Arbeit auf dem Hauptfaden messen (Takt 16 ms)
    let tick = 0, maxGap = 0, lastT = performance.now(); const iv = setInterval(() => { const t = performance.now(); maxGap = Math.max(maxGap, t - lastT); lastT = t; tick++; }, 16);
    const t0 = performance.now(), pr = []; await window.__vr1.job('check', x, o.sr, null, q => pr.push(q)).p; const t1 = performance.now(); const r = await window.__vr1.job('run', x, o.sr, {steps: {plop: {}, hum: 'auto', hp: {}}}, q => pr.push(q)).p; const t2 = performance.now();
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
  await run(async o => { if (!(UI.pop && UI.pop.name === 'takes')) { const t = S.tracks.findIndex(t => t.kind === 'voice' || t.kind === 'stimme' || t.stimme); try { tkSheet && tkSheet(Math.max(0, t), 0); } catch (e) {} } await wait(300); }, {id});
  const U = await run(async () => { const p = UI.pop && UI.pop.el; if (!p) return {pop: UI.pop ? UI.pop.name : null}; const b = p.getBoundingClientRect(), cb = p.querySelector('.clbox'); return {pop: UI.pop.name, in: b.left >= -1 && b.right <= innerWidth + 1 && b.top >= -1, clbox: !!cb, clboxH: cb ? Math.round(cb.getBoundingClientRect().height) : null, vr1: !!p.querySelector('.vr1') }; }, null);
  R.ui = U; await p.screenshot({path: path.join(path.dirname(file), 'voxr1-blatt.png')});
  ok(!U.vr1, 'Teil 1 ändert nichts Sichtbares (Zeile „Gesang reinigen“ erst nach Funk-Vorschlag, Teil 3)', U);
  const U0 = await ui(); ok(U0.over === 0, 'nichts ragt aus dem Bild (hochkant 428×926)', U0);
  ok(!errs.length, 'keine Konsolenfehler', errs.slice(0, 3));
  await b.close();
}
