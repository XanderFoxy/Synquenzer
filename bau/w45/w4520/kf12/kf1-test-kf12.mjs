// KF12-Fassung des KF1-Tests (zwei Prüfungen an die vereinte Datei angepasst, mit „KF12:“ markiert; sonst wörtlich kf1/kf1-test.mjs).
// KF1-Test: Klang-Feinschliff Teil 1 – Rauschfarben, Ringmod, Körnung, Anschlag ± → Filter, S&H in der Tonart, Arp „Treppe“.
// Klang GEMESSEN (Offline-Render durch das App-Worklet: Spektrum, Pegel, Periodizität, Klick), alte Klänge bit-gleich gegen die
// Basis, CPU je Stimme (Node-Prüfstand mit dem Worklet-Quelltext), Bedienung per Touch hochkant + quer, Fotos.
// Aufruf: node kf1-test.mjs <index.html> <ordner>   (absolute Pfade; Basis zum Vergleich: <ordner>/../basis.html)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { execFileSync } from 'child_process';
const [file, dir] = process.argv.slice(2);
if (!file || !dir) { console.log('Aufruf: node kf1-test.mjs <index.html> <ordner>'); process.exit(2); }
const basis = path.join(dir, '..', 'basis.html'), fotos = path.join(dir, 'fotos');
const SP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad';
fs.mkdirSync(fotos, {recursive: true});
const res = [];
const ok = (name, pass, info) => { res.push({name, pass: !!pass}); console.log((pass ? 'OK     ' : 'FEHLER ') + name + (info !== undefined ? '  ' + JSON.stringify(info) : '')); };
const errs = [];
const A = fs.readFileSync(file, 'utf8'), Bs = fs.readFileSync(basis, 'utf8');

/* =============== Teil 0: Worklet im Node-Prüfstand (nachgebauter AudioWorkletGlobalScope) – bit-gleich und CPU =============== */
function wkLoad(src, name) {
  const a = src.indexOf('<script type="text/plain" id="sq-worklet-src">'), b = src.indexOf('</script>', a), code = src.slice(src.indexOf('>', a) + 1, b), procs = {};
  // Math.random fest (die S&H-LFOs ziehen ihre Zufallswerte daraus): gleiche Folge in Basis und KF1, je Lauf neu gesetzt
  const M = Object.create(Math); let s = 0; M.random = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const ctx = {sampleRate: 48000, currentFrame: 0, currentTime: 0, console, Math: M, Float64Array, Float32Array, Int32Array, Uint32Array, Int16Array, Int8Array, Uint8Array, Uint16Array, Array, Object, Map, Set, JSON, Number, String, isFinite, isNaN, Infinity, NaN, Error, Symbol, Promise, Date,
    AudioWorkletProcessor: class { constructor() { this.port = {postMessage: () => {}, onmessage: null}; } }, registerProcessor: (n, c) => { procs[n] = c; }};
  ctx.globalThis = ctx; vm.createContext(ctx); vm.runInContext(code, ctx, {filename: name});
  return {ctx, procs, code, seed: () => { s = 0x9E3779B9 | 0; }};
}
const WB = wkLoad(Bs, 'basis'), WK = wkLoad(A, 'kf1');
const PATCH0 = {o1w: 0, o2w: 1, o2lvl: .6, o3lvl: .3, noise: .2, cutoff: 1500, res: .3, drive: .2, fenv: .4, aA: .005, aS: .8, aR: .3, level: .3, eng: 0};
// 8 Stimmen (C-Dur-Septakkorde über zwei Oktaven), n Blöcke à 128; mode 'hash' (FNV über beide Kanäle) | 'cpu' (Zeiten je Block)
function wkRun(W, over, mods, blocks, mode, times, key) {
  W.seed();
  const node = new W.procs['dirigent-analog']({processorOptions: {patch: Object.assign({}, PATCH0, over), mods: mods || [{src: 1, dst: 3, amt: .1}]}});
  const ev = []; [48, 52, 55, 59, 62, 64, 67, 71].forEach((n, k) => ev.push([0.001 + k * .0005, 1, k + 1, n, .4 + k * .08, -1]));
  node.port.onmessage({data: {ev}});
  if (key) node.port.onmessage({data: {kfKey: key}});              // r2: die Tonart wie aus der App
  const L = new Float32Array(128), R = new Float32Array(128), out = [[L, R]], uL = new Uint32Array(L.buffer), uR = new Uint32Array(R.buffer);
  let h = 0x811c9dc5 >>> 0, sub = 0;
  for (let k = 0; k < blocks; k++) {
    W.ctx.currentFrame = k * 128; W.ctx.currentTime = k * 128 / 48000;
    if (mode === 'cpu') { const a = process.hrtime.bigint(); node.process([[]], out); times.push(Number(process.hrtime.bigint() - a)); }
    else { node.process([[]], out); for (let i = 0; i < 128; i++) { h ^= uL[i]; h = Math.imul(h, 0x01000193) >>> 0; h ^= uR[i]; h = Math.imul(h, 0x01000193) >>> 0; const v = Math.abs(L[i]); if (v !== 0 && v < 1.18e-38) sub++; } }
  }
  return {h: h.toString(16), sub};
}
{
  const cases = [['Grundpatch', {}, null], ['Sync + Unison 3 + Analog', {o1w: 1, o2w: 0, o2sync: 1, o1uni: 3, uniDet: .3, analog: .5, spread: .5}, null],
    ['S&H-LFO auf Tonhöhe (ohne Tonart)', {o1w: 2, o2w: 3, l1shape: 4, l1rate: 6}, [{src: 1, dst: 1, amt: .3}]], ['Rauschen laut, Filter offen', {noise: .9, cutoff: 12000, res: 0}, null]];
  const neutral = {kfNc: 0, kfRm: 0, kfSh1: 0, kfSh2: 0}, rows = [];
  for (const [n, o, m] of cases) { const b = wkRun(WB, o, m, 750, 'hash'), k = wkRun(WK, o, m, 750, 'hash'), k0 = wkRun(WK, Object.assign({}, o, neutral), m, 750, 'hash'); rows.push([n, b.h, k.h, k0.h]); }
  ok('Worklet-Kern bit-gleich zur Basis (4 Patches × 2 s, 8 Stimmen; auch mit den neuen Werten ausdrücklich auf neutral)', rows.every(r => r[1] === r[2] && r[2] === r[3]), rows);
  // neue Klänge an: anders als neutral, keine Subnormalen
  const on = [['Ring', {kfRm: .7}], ['rosa', {kfNc: 1, noise: .8}], ['braun', {kfNc: 2, noise: .8}], ['blau', {kfNc: 3, noise: .8}], ['S&H Tonart', {l1shape: 4, l1rate: 6, kfSh1: 1}]];
  const MD = [{src: 1, dst: 1, amt: .3}], base = wkRun(WK, {l1shape: 4, l1rate: 6, noise: .8}, MD, 750, 'hash').h, diff = on.map(([n, o]) => { const r = wkRun(WK, Object.assign({l1shape: 4, l1rate: 6, noise: .8}, o), MD, 750, 'hash'); return [n, r.h !== base, r.sub]; });
  ok('Jede neue Funktion ändert den Klang (gegen neutral), keine Subnormalen in der Ausgabe', diff.every(d => d[1] && d[2] === 0), diff);
  // CPU: 8 Stimmen, Runden abwechselnd (gleiche Bedingungen). Prüfer r2: S&H Tonart nur mit einer S&H-Route auf die Tonhöhe messen (sonst ist
  // kf1ShQ gar nicht aktiv) – Basis dazu mit derselben Route; mit und ohne Tonart-Nachricht. „Anschlag ±“ ist die vorhandene Route (kein Kern mehr)
  const MP = [{src: 1, dst: 1, amt: .2}, {src: 1, dst: 3, amt: .1}], CD = [0, 2741], SHP = {l1shape: 4, l1rate: 6};
  const cfg = [['Basis', WB, {}, null], ['KF1 neutral', WK, {}, null], ['Ring 50 %', WK, {kfRm: .5}, null], ['Rauschen rosa', WK, {kfNc: 1}, null],
    ['Basis S&H→Tonhöhe', WB, SHP, MP], ['S&H Tonart', WK, Object.assign({kfSh1: 1}, SHP), MP, CD], ['S&H Tonart ohne Tonart-Nachricht', WK, Object.assign({kfSh1: 1}, SHP), MP, null],
    ['alles an (S&H→Tonhöhe)', WK, Object.assign({kfSh1: 1, kfRm: .5, kfNc: 1}, SHP), MP, CD]];
  // je Runde das 25-%-Quantil je Einstellung (robust gegen Last-Spitzen anderer Prozesse), das Verhältnis zur Basis derselben Runde; am Ende der
  // Median der Verhältnisse aus 11 Runden (Prüfer r2: unter Last stabil)
  const md = a => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; }, q25 = a => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 2]; }, Rr = cfg.map(() => []), all = cfg.map(() => []);
  for (let r = 0; r < 11; r++) { const m = cfg.map(([, W, o, mods, key], j) => { const t = []; wkRun(W, o, mods, 900, 'cpu', t, key); all[j].push(...t); return q25(t); }); cfg.forEach((c, j) => Rr[j].push(m[j] / m[j < 4 ? 0 : 4])); }
  const med = all.map(t => md(t) / 1e3), rel = j => +((md(Rr[j]) - 1) * 100).toFixed(1), R = {neutral: rel(1), ring: rel(2), rosa: rel(3), sh: rel(5), shOhneTonart: rel(6), alles: rel(7)};
  ok('CPU 8 Stimmen (µs je Block à 128 Samples, Basis ' + med[0].toFixed(0) + ' µs): neutral ≤ +2 %, jede Funktion einzeln ≤ +5 % (S&H Tonart mit S&H-Route auf die Tonhöhe, mit und ohne Tonart-Nachricht); alle zusammen ≤ +8 %', R.neutral <= 2 && R.ring <= 5 && R.rosa <= 5 && R.sh <= 5 && R.shOhneTonart <= 5 && R.alles <= 8,
    Object.assign({µs: Object.fromEntries(cfg.map((c, j) => [c[0], +med[j].toFixed(1)]))}, {prozent: R, jeStimme_µs: +(med[0] / 8).toFixed(1)}));
  // Prüfer r2 (CPU): kf1Snap mit Merker – das Ergebnis ist der nächste Ton der Tonart (Gleichstand nach unten), der Bereich (lo, hi] um x gibt
  // denselben Ton; Vergleich mit einer einfachen Suche über 20000 Zufallspunkte und alle 12 Grundtöne × 4 Skalen
  { const snap = WK.ctx.kf1Snap, z = new Float64Array(20), brute = (x, r, m) => { let b = null, bd = 1e9; for (let c = Math.floor(x) - 13; c <= Math.ceil(x) + 13; c++) { if (!((m >> ((((c - r) % 12) + 12) % 12)) & 1)) continue; const e = Math.abs(c - x); if (e < bd - 1e-12 || (Math.abs(e - bd) <= 1e-12 && c < b)) { bd = e; b = c; } } return b; };
    const scs = [2741, 1453, 2773, 4095], bad = []; let s0 = 12345;
    const rnd = () => { s0 = (s0 * 16807) % 2147483647; return s0 / 2147483647; };
    for (let k = 0; k < 20000; k++) { const x = 24 + rnd() * 72, r = k % 12, m = scs[(k / 12 | 0) % 4], q = snap(x, r, m, z), b = brute(x, r, m), y = z[14] + (z[15] - z[14]) * rnd();
      if (q !== b || !(x > z[14] && x <= z[15]) || brute(y > z[14] ? y : z[15], r, m) !== q) { if (bad.length < 5) bad.push([x, r, m, q, b, z[14], z[15]]); } }
    ok('S&H in der Tonart: Einrasten mit Merker richtig (20000 Zufallspunkte, 12 Grundtöne × Dur/Moll/Lydisch/chromatisch): nächster Ton der Tonart, Bereich des Merkers gibt denselben Ton', !bad.length, bad); }
}

/* =============== Messwerkzeuge im Browser (als Text übergeben) =============== */
const TOOLS = `(() => {
  const T = {};
  T.mk = over => { const s = deep(SQStore.normalizeSound(factorySound('f-init-analog'))); Object.assign(s.p, {o1w: 3, o1lvl: 0, o2lvl: 0, o3lvl: 0, subLvl: 0, noise: 0, cutoff: 20000, res: 0, drive: 0, fenv: 0, kt: 0, aA: .001, aD: 1, aS: 1, aR: .05, level: .5, analog: 0, ftype: 0, spread: 0, ampVel: 0, l1shape: 0, l2shape: 0}, over); s.mods = []; s.fx = {}; return s; };
  T.rms = (x, a, b) => { let e = 0; for (let i = a; i < b; i++) e += x[i] * x[i]; return Math.sqrt(e / Math.max(1, b - a)); };
  T.db = v => 20 * Math.log10(v + 1e-30);
  T.hash = x => { let h = 2166136261 >>> 0; const u = new Uint8Array(x.buffer, x.byteOffset, x.byteLength); for (let i = 0; i < u.length; i++) { h ^= u[i]; h = Math.imul(h, 16777619) >>> 0; } return h; };
  // Welch-Leistungsspektrum (Hann 4096, Sprung 2048)
  T.psd = (x, sr, a, b2) => { const N = 4096, out = new Float64Array(N / 2), re = new Float64Array(N), im = new Float64Array(N); let cnt = 0;
    for (let st = Math.round(a * sr); st + N <= Math.round(b2 * sr); st += 2048) { cnt++;
      for (let n = 0; n < N; n++) { re[n] = x[st + n] * (.5 - .5 * Math.cos(2 * Math.PI * n / N)); im[n] = 0; }
      for (let i = 1, j = 0; i < N; i++) { let bit = N >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { const t = re[i]; re[i] = re[j]; re[j] = t; } }
      for (let len = 2; len <= N; len <<= 1) { const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
        for (let i = 0; i < N; i += len) { let cr = 1, ci = 0; for (let k = 0; k < len / 2; k++) { const h = i + k + len / 2, vr = re[h] * cr - im[h] * ci, vi = re[h] * ci + im[h] * cr;
          re[h] = re[i + k] - vr; im[h] = im[i + k] - vi; re[i + k] += vr; im[i + k] += vi; const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr; } } }
      for (let k = 0; k < N / 2; k++) out[k] += re[k] * re[k] + im[k] * im[k]; }
    for (let k = 0; k < N / 2; k++) out[k] /= Math.max(1, cnt); return {P: out, df: sr / N}; };
  // Pegel je Oktavband (mittlere Leistungsdichte) und Steigung dB/Oktave (kleinste Quadrate) 125 Hz … 8 kHz
  T.slope = S => { const bands = [125, 250, 500, 1000, 2000, 4000, 8000], L = bands.map(f => { let s = 0, n = 0; for (let k = Math.ceil(f / Math.SQRT2 / S.df); k <= Math.floor(f * Math.SQRT2 / S.df); k++) { s += S.P[k]; n++; } return 10 * Math.log10(s / n + 1e-30); });
    const mx = 3, my = L.reduce((a, b) => a + b) / L.length; let nu = 0, de = 0; L.forEach((y, i) => { nu += (i - mx) * (y - my); de += (i - mx) * (i - mx); }); return {slope: +(nu / de).toFixed(2), L: L.map(v => +v.toFixed(1))}; };
  // Pegel einer Frequenz (Hann-DFT, dB re Vollaussteuerung)
  T.tone = (x, sr, f, a, n) => { let re = 0, im = 0; const w = 2 * Math.PI * f / sr; for (let i = 0; i < n; i++) { const h = .5 - .5 * Math.cos(2 * Math.PI * i / n), v = x[a + i] * h; re += v * Math.cos(w * i); im += v * Math.sin(w * i); } return +(20 * Math.log10(Math.hypot(re, im) / n * 4 + 1e-12)).toFixed(1); };
  // Klick-Maß (M-KLICK): größter Sprung der zweiten Differenz gegen ihr 99,5-%-Quantil
  T.click = (x, a, b) => { const d = []; for (let i = a + 2; i < b; i++) d.push(Math.abs(x[i] - 2 * x[i - 1] + x[i - 2])); const s = d.slice().sort((p, q) => p - q); return d.reduce((m, v) => Math.max(m, v), 0) / (s[Math.floor(s.length * .995)] + 1e-12); };
  // Periodizität: Nulldurchgänge eines Sinus -> Frequenz je Periode -> stabile Stufen (Ton, Beginn, Perioden)
  T.steps = (x, sr, a, b, minN) => { const P = []; let last = -1; for (let i = Math.max(1, a); i < b; i++) if (x[i - 1] < 0 && x[i] >= 0) { const t = i - 1 + x[i - 1] / (x[i - 1] - x[i]); if (last >= 0) P.push([(last + t) / 2 / sr, 69 + 12 * Math.log2(sr / (t - last) / 440), last / sr, t / sr]); last = t; }
    const G = []; let g = null; for (const p of P) { if (g && Math.abs(p[1] - g.ref) < .06) { g.n++; g.v.push(p[1]); g.t1 = p[3]; } else { if (g) G.push(g); g = {ref: p[1], n: 1, v: [p[1]], t0: p[2], t1: p[3]}; } } if (g) G.push(g);
    return G.filter(x => x.n >= (minN || 6)).map(x => { const s = x.v.slice().sort((p, q) => p - q), m = s[s.length >> 1]; return {m, t0: x.t0, t1: x.t1, n: x.n}; }); };
  // Prüfer r2 (Befund 9): mkRender der App wartet vor dem Rendern nur 20 ms – unter Last sind die Nachrichten dann nicht immer im Worklet.
  // T.render = dieselbe Funktion, aber sie wartet auf eine Antwort des Worklets (lkInfo, in Basis und KF1 vorhanden): danach sind alle
  // vorher geschickten Nachrichten verarbeitet
  T.sync = E => new Promise(res => { const port = E.node.port, prev = port.onmessage, to = setTimeout(() => { port.onmessage = prev; res(false); }, 3000);
    port.onmessage = e => { if (e.data && e.data.lkInfo) { clearTimeout(to); port.onmessage = prev; res(true); } else if (prev) prev.call(port, e); }; port.postMessage({lkInfo: 1}); });
  { const src = mkRender.toString(), w = 'await new Promise(r => setTimeout(r, 20));'; if (!src.includes(w)) throw new Error('T.render: mkRender ohne 20-ms-Warten'); T.render = eval('(' + src.replace(w, 'await T.sync(E);') + ')'); }
  T.inKey = (m, root, mask) => { const n = Math.round(m), pc = (((n - root) % 12) + 12) % 12; return !!((mask >> pc) & 1); };
  T.maskOf = sc => sc.reduce((m, s) => m | 1 << s, 0);
  return T;
})()`;

const open = async (f, vp, tag, seed) => {
  const p = await b.newPage({viewport: vp || {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  p.on('pageerror', e => errs.push((tag || '') + String(e))); p.on('console', m => { if (m.type() === 'error') errs.push((tag || '') + m.text()); });
  if (seed) await p.addInitScript(`(() => { let s = 0x9E3779B9; window.__seed = () => { s = 0x9E3779B9; }; Math.random = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();`);
  await p.goto('file://' + f); await p.waitForTimeout(1500); return p;
};
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});

/* =============== Teil 1: Klang gemessen (Offline-Render durch das App-Worklet, mkRender) =============== */
{
  const pk = await open(file, null, 'kf1: ');
  const K = await pk.evaluate(async src => {
    const T = eval(src), o = {}, SR = 48000;
    o.info = SYNQUENZER.kf1.info();
    // --- 1 Rauschfarben: Steigung je Oktave, Pegel gleich ---
    o.nc = [];
    for (const nc of [0, 1, 2, 3]) { const R = await T.render(T.mk({noise: 1, kfNc: nc}), [[0.01, 'on', 60, .8], [2.4, 'off', 60]], {sec: 2.5});
      const s = T.slope(T.psd(R.l, SR, .1, 2.3)); o.nc.push({nc, slope: s.slope, L: s.L, db: +T.db(T.rms(R.l, 4800, 110000)).toFixed(2)}); }
    // Farbwechsel mitten im Ton (weiß → braun → blau → rosa): kein Sprung, keine Spitze über dem Pegel der neuen Farbe
    { const R = await T.render(T.mk({noise: 1}), [[0.01, 'on', 60, .8], [1.9, 'off', 60]], {sec: 2, at: [[.5, {set: {kfNc: 2}}], [1, {set: {kfNc: 3}}], [1.5, {set: {kfNc: 1}}]]});
      const pk = (a, b) => { let m = 0; for (let i = Math.round(a * SR); i < Math.round(b * SR); i++) m = Math.max(m, Math.abs(R.l[i])); return m; };
      o.ncSwitch = [.5, 1, 1.5].map((t, k) => ({t, um: +pk(t - .003, t + .02).toFixed(3), danach: +pk(t + .05, t + .45).toFixed(3)})); o.ncNaN = R.l.some(v => !isFinite(v)); }
    // --- 2 Ring: Osz 1 Sinus A4 × Osz 2 Sinus E5 (+7 HT), beide Oszillatoren stumm → nur Summe und Differenz ---
    { const f1 = 440, f2 = 440 * Math.pow(2, 7 / 12);
      const R = await T.render(T.mk({o2w: 3, o2semi: 7, kfRm: 1}), [[0.01, 'on', 69, .8], [1.4, 'off', 69]], {sec: 1.5});
      o.ring = {sum: T.tone(R.l, SR, f1 + f2, 9600, 32768), diff: T.tone(R.l, SR, f2 - f1, 9600, 32768), f1: T.tone(R.l, SR, f1, 9600, 32768), f2: T.tone(R.l, SR, f2, 9600, 32768), sonst: T.tone(R.l, SR, 1000, 9600, 32768), f1x2: T.tone(R.l, SR, 2 * f1, 9600, 32768)};
      const Z = await T.render(T.mk({o2w: 3, o2semi: 7, kfRm: 0}), [[0.01, 'on', 69, .8], [1.4, 'off', 69]], {sec: 1.5}); o.ring.ausDb = +T.db(T.rms(Z.l, 4800, 64000)).toFixed(1);
      // Säge × Säge, Osz 2 verstimmt: Summen/Differenzen der Teiltöne (n·f1 ± m·f2)
      const S2 = await T.render(T.mk({o1w: 0, o2w: 0, o2semi: 7, o2fine: 14, kfRm: 1}), [[0.01, 'on', 57, .8], [1.4, 'off', 57]], {sec: 1.5}), g1 = 220, g2 = 220 * Math.pow(2, (7 + .14) / 12);
      o.ringSaw = {sum: T.tone(S2.l, SR, g1 + g2, 9600, 32768), diff: T.tone(S2.l, SR, g2 - g1, 9600, 32768), f1: T.tone(S2.l, SR, g1, 9600, 32768)}; }
    // Ring auf/zu mitten im Ton (M-KLICK): Osz 1 hörbar, Ring 0 → 100 % → 0 per Nachricht
    { const sR = T.mk({o1lvl: .5, o2w: 3, o2semi: 7});
      const R = await T.render(sR, [[0.01, 'on', 57, .8], [1.9, 'off', 57]], {sec: 2, at: [[.5, {set: {kfRm: 1}}], [1.2, {set: {kfRm: 0}}]]}), St = await T.render(Object.assign(deep(sR), {p: Object.assign({}, sR.p, {kfRm: 1})}), [[0.01, 'on', 57, .8], [1.9, 'off', 57]], {sec: 2});
      o.ringKlick = {mitWechsel: +T.click(R.l, 9600, 86400).toFixed(2), still: +T.click(St.l, 9600, 86400).toFixed(2), vor: +T.db(T.rms(R.l, 12000, 23000)).toFixed(1), mit: +T.db(T.rms(R.l, 30000, 55000)).toFixed(1), nach: +T.db(T.rms(R.l, 62000, 86000)).toFixed(1)}; }
    // --- 4 Anschl. ± → Filter (Prüfer r2: = die vorhandene Route Anschlag → Cutoff, Knopf-Einheit wie im Reiter MOD; ±30 % ≈ 3 Oktaven bei vollem
    // Anschlag): Rauschen durch Tiefpass 800 Hz, leise (25 %) gegen laut (100 %): Hoch/Tief-Verhältnis bei 1,5 kHz ---
    const hl = x => { let lp = 0, eh = 0, el = 0; const a = Math.exp(-2 * Math.PI * 1500 / SR); for (let i = 2400; i < x.length - 2400; i++) { lp = a * lp + (1 - a) * x[i]; const h = x[i] - lp; eh += h * h; el += lp * lp; } return +(10 * Math.log10(eh / el)).toFixed(2); };
    o.vc = {};
    for (const vc of [-1, -.5, 0, .5, 1]) { const s = T.mk({noise: 1, cutoff: 800}); if (vc) s.mods = [{src: 'vel', dst: 'cutoff', amt: toEngineAmt('cutoff', vc * .3)}];
      const lo = await T.render(s, [[0.01, 'on', 48, .25], [.5, 'off', 48]], {sec: .6}), hi = await T.render(s, [[0.01, 'on', 48, 1], [.5, 'off', 48]], {sec: .6}); o.vc[vc] = {leise: hl(lo.l), laut: hl(hi.l)}; }
    // --- 5 S&H in der Tonart: Sinus, S&H-LFO → Tonhöhe ±12 HT; frei 6 Hz und im Takt (Achtel bei 120 BPM) ---
    const sh = async (on, key, sync) => { const s = T.mk({o1lvl: 1, l1shape: 4, l1rate: 6, l1sync: sync || 0, kfSh1: on}); s.mods = [{src: 'lfo1', dst: 'pitch', amt: .5}];
      const R = await T.render(s, [[0.01, 'on', 60, .8], [3.9, 'off', 60]], {sec: 4, bpm: 120, songStart: 0, at: key ? [[.003, {kfKey: key}]] : []});
      return T.steps(R.l, SR, 2400, Math.round(3.85 * SR), 6); };
    const ana = (G, root, mask) => ({stufen: G.length, inTonart: G.filter(g => T.inKey(g.m, root, mask)).length, maxCent: +Math.max(...G.map(g => Math.abs(g.m - Math.round(g.m)) * 100)).toFixed(1), toene: [...new Set(G.map(g => Math.round(g.m)))].sort((a, b) => a - b)});
    const Cdur = T.maskOf([0, 2, 4, 5, 7, 9, 11]), Emoll = T.maskOf([0, 2, 3, 5, 7, 8, 10]);
    o.shC = ana(await sh(1, [0, Cdur]), 0, Cdur); o.shAus = ana(await sh(0, [0, Cdur]), 0, Cdur); o.shE = ana(await sh(1, [4, Emoll]), 4, Emoll);
    { const G = await sh(1, [4, Emoll], .5); o.shTakt = ana(G, 4, Emoll); const bd = []; for (let k = 1; k < G.length; k++) { const t = (G[k - 1].t1 + G[k].t0) / 2; bd.push(+(t - Math.round(t / .25) * .25).toFixed(4)); } o.shTakt.raster = {n: bd.length, maxAbw_ms: +(Math.max(...bd.map(Math.abs)) * 1000).toFixed(1)}; }
    // Prüfer r2 (Befund 2): Tonart mit Zeit (kfT = Taktstrich des Szenenwechsels): C-Dur, ab 2,000 s Fis-Dur. S&H frei 6 Hz (Stufen nicht auf dem
    // Raster): bis 2,0 s jede Stufe in C-Dur, ab 2,0 s in Fis-Dur, eine Stufengrenze genau bei 2,0 s (Steuerblock 0,33 ms); eine Note, die vor
    // 2,0 s losgelassen wurde, behält im Ausklang ihre Tonart (kein Sprung im Nachklang)
    { const Fis = T.maskOf([0, 2, 4, 5, 7, 9, 11]), s = T.mk({o1lvl: 1, l1shape: 4, l1rate: 6, kfSh1: 1}); s.mods = [{src: 'lfo1', dst: 'pitch', amt: .5}];
      const R = await T.render(s, [[0.01, 'on', 60, .8], [3.9, 'off', 60]], {sec: 4, at: [[.003, {kfKey: [0, Cdur]}], [.02, {kfKey: [6, Fis], kfT: 2}]]});
      const G = T.steps(R.l, SR, 2400, Math.round(3.85 * SR), 6), vor = G.filter(g => g.t1 < 1.999), nach = G.filter(g => g.t0 > 2.001);
      const gr = []; for (let k = 1; k < G.length; k++) gr.push((G[k - 1].t1 + G[k].t0) / 2);
      o.shZeit = {vor: vor.length, vorC: vor.filter(g => T.inKey(g.m, 0, Cdur)).length, nach: nach.length, nachFis: nach.filter(g => T.inKey(g.m, 6, Fis)).length, grenze_ms: +(Math.min(...gr.map(t => Math.abs(t - 2))) * 1000).toFixed(2)};
      const s2 = T.mk({o1lvl: 1, l1shape: 4, l1rate: 8, kfSh1: 1, aR: 1.6}); s2.mods = [{src: 'lfo1', dst: 'pitch', amt: .5}];
      const R2 = await T.render(s2, [[0.01, 'on', 60, .8], [1.6, 'off', 60]], {sec: 3.2, at: [[.003, {kfKey: [0, Cdur]}], [.02, {kfKey: [6, Fis], kfT: 2}]]});
      const G2 = T.steps(R2.l, SR, Math.round(2.02 * SR), Math.round(2.9 * SR), 6); o.shAusklang = {stufen: G2.length, inC: G2.filter(g => T.inKey(g.m, 0, Cdur)).length}; }
    // --- 3 Körnung: der Einschub direkt (1 kHz / 7 kHz / 200 Hz Sinus), Wechsel per Nachricht ---
    const wsrc = document.getElementById('sq-worklet-src').textContent;
    const korn = async (set, msgs, sec, sig) => { const oc = new OfflineAudioContext(2, Math.round(sec * SR), SR); await oc.audioWorklet.addModule('data:application/javascript;base64,' + btoa(wsrc));
      const n = Math.round(sec * SR), bf = oc.createBuffer(2, n, SR); for (let c = 0; c < 2; c++) { const d = bf.getChannelData(c); for (let i = 0; i < n; i++) d[i] = sig(i); }
      const bs = oc.createBufferSource(); bs.buffer = bf; const node = new AudioWorkletNode(oc, 'synq-kf1-korn', {numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2], channelCount: 2, channelCountMode: 'explicit', channelInterpretation: 'speakers', processorOptions: {set}});
      bs.connect(node); node.connect(oc.destination); bs.connect(oc.destination); bs.start(0);   // r2: wie in der Spur-Kette – trocken + (nass − trocken)
      for (const [t, m] of msgs || []) oc.suspend(Math.round(t * SR / 128) * 128 / SR).then(() => { node.port.postMessage(m); oc.resume(); });
      await new Promise(r => setTimeout(r, 50)); const Rr = await oc.startRendering(); return {x: bf.getChannelData(0), y: Rr.getChannelData(0)}; };
    const sine = (f, a) => i => (a || .5) * Math.sin(2 * Math.PI * f * i / SR);
    { const {x, y} = await korn({b: 16, r: 1, m: 0}, [], .5, sine(1000)); let d = 0; for (let i = 0; i < x.length; i++) d = Math.max(d, Math.abs(x[i] - y[i])); o.kornAus = d; }
    { const lv = async bb => { const {y} = await korn({b: bb, r: 1, m: 1}, [], .3, sine(5, .99)); const L = new Set(); for (let i = 2400; i < y.length; i++) L.add(Math.round(y[i] * 1e6)); return L.size; }; o.kornStufen = {b4: await lv(4), b6: await lv(6), b8: await lv(8)}; }
    { const {x, y} = await korn({b: 4, r: 1, m: 1}, [], .5, sine(1000)); let e = 0; for (let i = 2400; i < y.length; i++) e += (y[i] - x[i]) ** 2; o.kornRausch4 = +(10 * Math.log10(T.rms(x, 2400, x.length) ** 2 / (e / (y.length - 2400)))).toFixed(1); }
    { const {y} = await korn({b: 16, r: 1 / 8, m: 1}, [], .3, sine(1000)); let same = 0; for (let i = 4800; i < 5600; i++) if (Math.abs(y[i] - y[i - 1]) < 1e-6) same++; o.kornHalten8 = same / 800; }
    { const {x, y} = await korn({b: 16, r: 1 / 4, m: 1}, [], .5, sine(7000)); o.kornAlias = {ein5k: T.tone(x, SR, 5000, 4800, 8192), aus5k: T.tone(y, SR, 5000, 4800, 8192), aus7k: T.tone(y, SR, 7000, 4800, 8192)}; }
    { const {x, y} = await korn({b: 16, r: 1, m: 0}, [[.2, {b: 8, r: 1, m: 1}], [.4, {b: 4, r: 1 / 2}], [.6, {b: 16, r: 1, m: 0}]], .8, sine(200));
      const step = (a, t0, t1) => { let m = 0; for (let i = Math.round(t0 * SR) + 1; i < Math.round(t1 * SR); i++) m = Math.max(m, Math.abs(a[i] - a[i - 1])); return +m.toFixed(4); };
      o.kornKlick = {aus: step(y, .05, .19), b8: step(y, .25, .39), b4: step(y, .45, .59), wieder: step(y, .65, .79), an: step(y, .19, .25), wechsel: step(y, .39, .45), ab: step(y, .59, .65)};
      let d = 0; for (let i = Math.round(.62 * SR); i < y.length; i++) d = Math.max(d, Math.abs(x[i] - y[i])); o.kornWiederExakt = d; }
    // --- Denormals / Ausklang: braunes Rauschen + Ring, langer Release ---
    { const R = await T.render(T.mk({o1lvl: .3, o2w: 3, o2semi: 5, kfRm: .8, noise: .6, kfNc: 2, aR: 2}), [[0, 'on', 45, .8], [1, 'off', 45]], {sec: 4});
      let sub = 0, nan = 0; for (const v of R.l) { if (!isFinite(v)) nan++; else if (v !== 0 && Math.abs(v) < 1.18e-38) sub++; } o.denorm = {sub, nan}; }
    return o;
  }, TOOLS);
  const I = K.info;
  ok('Lock-Tabelle kennt die neuen Plätze: kfNc (n), kfRm (b), kfSh1 / kfSh2 (Reihe r); keine fehlen; Regler beschrieben; kein eigener Parameter für Anschl. ± (Prüfer r2)', I.miss.length === 0 && I.pd && JSON.stringify(I.lk.map(x => x[1])) === '["n","b","r","r"]', {lk: I.lk, nAV: I.nAV});
  const want = [0, -3, -6, 3], nc = K.nc;
  ok('Rauschfarben: Steigung weiß/rosa/braun/blau ≈ 0 / −3 / −6 / +3 dB je Oktave (±0,6) – 125 Hz … 8 kHz', nc.every((x, k) => Math.abs(x.slope - want[k]) <= .6), nc.map(x => [['weiß', 'rosa', 'braun', 'blau'][x.nc], x.slope, x.L]));
  ok('Rauschfarben: gleicher Pegel wie weiß (±0,5 dB, Effektivwert)', nc.every(x => Math.abs(x.db - nc[0].db) <= .5), nc.map(x => x.db));
  ok('Farbwechsel mitten im Ton (weiß → braun → blau → rosa): keine Spitze über dem Pegel der neuen Farbe (×1,25), keine NaN', !K.ncNaN && K.ncSwitch.every(s => s.um <= s.danach * 1.25), K.ncSwitch);
  ok('Ringmod: Sinus 440 × 659 Hz → Summe 1099 Hz und Differenz 219 Hz ≥ −26 dB, die Grundtöne selbst ≤ −70 dB; Ring 0 = Stille', K.ring.sum >= -26 && K.ring.diff >= -26 && K.ring.f1 <= -70 && K.ring.f2 <= -70 && K.ring.ausDb < -100, K.ring);
  ok('Ringmod Säge × Säge (Osz 2 +7 HT +14 ct): Summe und Differenz deutlich über dem Grundton', K.ringSaw.sum - K.ringSaw.f1 > 20 && K.ringSaw.diff - K.ringSaw.f1 > 20, K.ringSaw);
  ok('Ring auf/zu mitten im Ton ohne Klick (M-KLICK: Klick-Maß mit Wechsel ≤ 1,5 × ohne Wechsel); Pegel steigt mit Ring', K.ringKlick.mitWechsel <= K.ringKlick.still * 1.5 && K.ringKlick.mit > K.ringKlick.vor + 1, K.ringKlick);
  const v = K.vc;
  ok('Anschl. ± Mitte (keine Route): leise = laut (±0,3 dB) – das Verhalten von vorher', Math.abs(v[0].laut - v[0].leise) <= .3, v[0]);
  ok('Anschl. ± −30 % (Route Anschlag → Cutoff): laut deutlich dunkler als leise (≥ 6 dB weniger Höhen); −15 % dazwischen', v[-1].laut - v[-1].leise <= -6 && v[-.5].laut - v[-.5].leise < -2 && v[-.5].laut > v[-1].laut, {m30: v[-1], m15: v[-.5]});
  ok('Anschl. ± +30 %: laut deutlich heller als leise (≥ 6 dB mehr Höhen); +15 % dazwischen', v[1].laut - v[1].leise >= 6 && v[.5].laut - v[.5].leise > 2 && v[.5].laut < v[1].laut, {p30: v[1], p15: v[.5]});
  ok('S&H in der Tonart (C-Dur, frei 6 Hz): alle Stufen in der Tonart, ≤ 10 Cent', K.shC.stufen >= 15 && K.shC.inTonart === K.shC.stufen && K.shC.maxCent <= 10, K.shC);
  ok('S&H ohne Tonart (Vergleich): Zufallstöne auch außerhalb der Tonart und zwischen den Halbtönen', K.shAus.inTonart < K.shAus.stufen && K.shAus.maxCent > 20, K.shAus);
  ok('S&H in der Tonart (e-Moll): alle Stufen in e-Moll', K.shE.stufen >= 15 && K.shE.inTonart === K.shE.stufen && K.shE.maxCent <= 10, K.shE);
  ok('S&H im Takt (TAKT Achtel, 120 BPM): Stufen in e-Moll, Wechsel auf dem Achtel-Raster (≤ 6 ms)', K.shTakt.stufen >= 12 && K.shTakt.inTonart === K.shTakt.stufen && K.shTakt.raster.maxAbw_ms <= 6, K.shTakt);
  ok('Prüfer r2 (Befund 2): Tonart mit Zeit (Taktstrich 2,0 s, C-Dur → Fis-Dur): vorher jede Stufe in C-Dur, danach jede in Fis-Dur, Wechsel genau bei 2,0 s (≤ 1 ms); losgelassene Note behält im Ausklang ihre Tonart', K.shZeit.vor >= 8 && K.shZeit.vorC === K.shZeit.vor && K.shZeit.nach >= 8 && K.shZeit.nachFis === K.shZeit.nach && K.shZeit.grenze_ms <= 1 && K.shAusklang.stufen >= 3 && K.shAusklang.inC === K.shAusklang.stufen, {zeit: K.shZeit, ausklang: K.shAusklang});
  ok('Körnung aus = Eingang exakt (Einschub parallel: trocken + 0; max. Abweichung 0)', K.kornAus === 0, K.kornAus);
  ok('Körnung Bits (langsamer Sinus, Vollaussteuerung): 4 Bit = 15–17 Stufen, 6 Bit = 61–65, 8 Bit = 251–257; Quantisierungsrauschen 4 Bit bei halber Aussteuerung ≈ 6,02·4 + 1,76 − 6,02 = 19,8 dB (±1,5)', K.kornStufen.b4 <= 17 && K.kornStufen.b4 >= 15 && K.kornStufen.b6 <= 65 && K.kornStufen.b6 >= 61 && K.kornStufen.b8 <= 257 && K.kornStufen.b8 >= 251 && Math.abs(K.kornRausch4 - 19.8) <= 1.5, {stufen: K.kornStufen, abstand4_dB: K.kornRausch4});
  ok('Körnung Rate 1/8: 7 von 8 Samples gehalten (±1e-6); Rate 1/4 bei 7 kHz → Spiegelfrequenz 5 kHz (Aliasing messbar, ≥ 40 dB über dem Eingang)', Math.abs(K.kornHalten8 - .875) < .01 && K.kornAlias.aus5k - K.kornAlias.ein5k >= 40, {gehalten: K.kornHalten8, alias: K.kornAlias});
  const kk = K.kornKlick;
  ok('Körnung an / Wechsel 8 → 4 Bit / aus ohne Klick (M-KLICK: größter Sprung beim Wechsel ≤ ruhiger Teil davor/danach); danach wieder exakt', kk.an <= Math.max(kk.aus, kk.b8) * 1.05 && kk.wechsel <= Math.max(kk.b8, kk.b4) * 1.05 && kk.ab <= Math.max(kk.b4, kk.wieder) * 1.05 && K.kornWiederExakt === 0, kk);
  ok('Keine Subnormalen / NaN im Ausklang (braunes Rauschen + Ring, 3 s Release)', K.denorm.sub === 0 && K.denorm.nan === 0, K.denorm);
  await pk.close();
}

/* =============== Teil 2: alte Klänge und Projekte bit-gleich (Basis gegen KF1) =============== */
{
  const FAC = async p => p.evaluate(async src => {
    const T = eval(src), ids = FACTORY.map(f => f.id).filter(id => { const s = factorySound(id); return s && s.kind !== 'drum'; }), out = {};
    // Zufall im Worklet fest (S&H-LFOs): jede Offline-Render-Instanz startet mit derselben Folge – in Basis und KF1 gleich
    const el = document.getElementById('sq-worklet-src'), orig = el.textContent;
    el.textContent = '(function(){let s=0x9E3779B9;Math.random=function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};})();\n' + orig;
    const t0 = performance.now();
    for (const id of ids) { const R = await T.render(factorySound(id), [[0.01, 'on', 48, .9], [0.01, 'on', 55, .6], [0.01, 'on', 64, .8], [.45, 'off', 48], [.45, 'off', 55], [.45, 'off', 64]], {sec: .7}); out[id] = T.hash(R.l) ^ T.hash(R.r); }
    out.__ms = Math.round(performance.now() - t0); const sh = ids.find(id => /roboter-blips/.test(id)) || ids[0];
    out.__rep = T.hash((await T.render(factorySound(sh), [[0.01, 'on', 48, .9], [.45, 'off', 48]], {sec: .5})).l); out.__rep2 = T.hash((await T.render(factorySound(sh), [[0.01, 'on', 48, .9], [.45, 'off', 48]], {sec: .5})).l);
    el.textContent = orig;
    return out;
  }, TOOLS);
  const pb = await open(basis, null, 'basis: '), Hb = await FAC(pb); await pb.close();
  const pk = await open(file, null, 'kf1: '), Hk = await FAC(pk); await pk.close();
  const ids = Object.keys(Hb).filter(k => !k.startsWith('__')), bad = ids.filter(id => Hb[id] !== Hk[id]);
  ok('Alle Werksklänge (VA, FM, WT) klingen bit-gleich zur Basis (Akkord, Offline-Render, Hash beider Kanäle; Zufall der S&H-LFOs fest; gerendert erst nach der Antwort des Worklets – Prüfer r2: unter Last stabil)', ids.length >= 50 && !bad.length && Hb.__rep === Hb.__rep2, {klaenge: ids.length, abweichend: bad.slice(0, 5), ms: [Hb.__ms, Hk.__ms]});

  // ein Projekt mit VA-Spur (Rauschen 20 %) in der Basis bauen und speichern, in KF1 laden: Song-Render bit-gleich (Math.random fest)
  const SETUP = async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    SYNQUENZER.newProject(); await wait(200); setBpm(120);
    SYNQUENZER.setClip(0, 0, {len: 1, notes: [{t: .05, n: 36, d: 1.9, v: .9}, {t: 2, n: 43, d: 1.9, v: .7}]});
    const s0 = deep(S.tracks[0].sound); s0.p.noise = .2; SYNQUENZER.setSound(0, s0);
    for (let t = 0; t < S.tracks.length; t++) { try { setTrackFx(t, 'rev', 0); setTrackFx(t, 'dly', 0); } catch (e) {} }
    SYNQUENZER.songFromChain([{scene: 0, bars: 2}]); window.__seed(); ensureAudio(); await wait(1500);
  };
  const HR = async () => { window.__seed(); const r = await vvRenderAudio({range: {a: 0, b: S.song.bars, sel: false}});
    let h = 0x811c9dc5; for (let c = 0; c < 2; c++) { const d = r.ch[c], u = new Uint32Array(d.buffer, d.byteOffset, d.length); for (let i = 0; i < u.length; i++) { h ^= u[i]; h = Math.imul(h, 0x01000193) >>> 0; } } return {h: h.toString(16), n: r.ch[0].length}; };
  const PB = await open(basis, null, 'basis: ', true);
  // (der Song-Render der Basis ist nicht in jedem Lauf gleich – Nachrichten-Zeitpunkte im Offline-Render der App; darum bis ein Hash zweimal kam
  // (höchstens 6 Läufe) = der Hash der Basis; KF1 rendert, bis dieser Hash kommt (höchstens 6) – Prüfer r2: unter Last stabil)
  const BA = await PB.evaluate(async ([s1, s2]) => { const SETUP = eval('(' + s1 + ')'), HR = eval('(' + s2 + ')'); await SETUP(); const proj = serializeProject(), rs = [];
    for (let k = 0; k < 6; k++) { rs.push(await HR()); if (rs.some((r, j) => rs.findIndex(x => x.h === r.h) !== j)) break; } return {proj, rs}; }, [SETUP.toString(), HR.toString()]);
  const modal = rs => { const c = {}; for (const r of rs) c[r.h] = (c[r.h] || 0) + 1; return Object.entries(c).sort((x, y) => y[1] - x[1])[0]; };
  BA.r1 = {h: modal(BA.rs)[0]}; BA.n1 = modal(BA.rs)[1];
  await PB.close();
  const PK = await open(file, null, 'kf1: ', true);
  const KA = await PK.evaluate(async ([proj, s2, want]) => {
    const HR = eval('(' + s2 + ')'), wait = ms => new Promise(r => setTimeout(r, ms)), o = {}, until = async () => { const rs = []; for (let k = 0; k < 6; k++) { rs.push(await HR()); if (rs.some(r => r.h === want)) break; } return rs; };
    applyProject(normalizeProject(JSON.parse(proj)), {ui: true}); window.__seed(); ensureAudio(); await wait(1500);
    const P = S.tracks[0].sound.p, fx = S.tracks[0].sound.fx; o.neutral = [P.kfNc, P.kfRm, P.kfSh1, P.kfSh2].map(v => v === undefined ? 'fehlt' : v); o.kfGesp = Object.keys(JSON.parse(serializeProject()).tracks[0].sound.p).filter(k => /^kf(Nc|Rm|Sh[12])$/.test(k));   /* KF12: Regel 28 – fehlender Wert = neutral, gespeichert wird keiner */ o.vel = (S.tracks[0].sound.mods || []).filter(m => m.src === 'vel' && m.dst === 'cutoff').length; o.fxKeys = Object.keys(fx).filter(k => /^kf/.test(k));
    o.rs = await until(); o.k0 = SYNQUENZER.kf1.korn(0).node;
    setTrackFx(0, 'kfBits', 6); setTrackFx(0, 'kfRate', 1 / 4); await wait(300); o.k1 = SYNQUENZER.kf1.korn(0); o.r2 = await HR();
    setTrackFx(0, 'kfBits', 16); setTrackFx(0, 'kfRate', 1); await wait(300); o.k2 = SYNQUENZER.kf1.korn(0); o.r3s = await until();
    o.fxAus = Object.keys(normalizeProject(JSON.parse(serializeProject())).tracks[0].sound.fx).filter(k => /^kf/.test(k));
    return o;
  }, [BA.proj, HR.toString(), BA.r1 ? BA.r1.h : modal(BA.rs)[0]]);
  await PK.close();
  ok('Altes Projekt (in der Basis gespeichert) lädt mit neutralen Werten (Rauschfarbe weiß, Ring 0, S&H Tonart aus, keine Körnung; Anschl. ± = die gespeicherte Route, unverändert) – KF12: fehlender Wert = neutral, neu gespeichert ohne KF1-Werte (Regel 28)', KA.neutral.every(v => v === 'fehlt' || v === 0) && !KA.kfGesp.length && !KA.fxKeys.length, {werte: KA.neutral, gespeichert: KA.kfGesp, velRouten: KA.vel, fx: KA.fxKeys});
  ok('Altes Projekt: Song-Render (Offline, Video-Ton-Weg) bit-gleich zur Basis (Hash der Basis = der zweimal gekommene; KF1 trifft ihn)', BA.n1 >= 2 && KA.rs.some(r => r.h === BA.r1.h) && !KA.k0, {basis: BA.rs.map(r => r.h), kf1: KA.rs.map(r => r.h)});
  ok('Körnung in der Spur-Kette (parallel): an (6 Bit, 1/4) → anders; wieder aus → Knoten bleibt und gibt Stille dazu, Render wieder bit-gleich; aus = keine Körnung-Schlüssel in der geladenen Datei', KA.k1.node && !BA.rs.some(r => r.h === KA.r2.h) && KA.k2.node && KA.r3s.some(r => r.h === BA.r1.h) && !KA.fxAus.length, {an: KA.r2.h, aus: KA.r3s.map(r => r.h), sig: KA.k1.sig});
}

/* =============== Teil 3: Zusammenspiel – Locks, Speichern/Laden, Klangzustand, Tonart der Szene, Arp Treppe, Guide, MIDI =============== */
{
  const p = await open(file, null, 'kf1: ');
  const G = await p.evaluate(async src => {
    const T = eval(src), o = {}, ms = t => new Promise(r => setTimeout(r, t)), Q = SYNQUENZER, SR = 48000;
    Q.newProject(); await ms(200); ensureAudio(); await ms(1200); setBpm(120);
    // Locks je Note: Ring nur auf der gelockten Note; Rauschfarbe je Note (Klasse n); S&H Tonart nur als Reihe
    o.why = {kfRm: lkWhy('kfRm', true) || '', kfNc: lkWhy('kfNc', true) || '', velCut: lkWhy('mods.vel-cutoff.amt', true) || '', velCutReihe: lkWhy('mods.vel-cutoff.amt', false) || '', kfSh1: lkWhy('kfSh1', true) || ''};
    const s = T.mk({o2w: 3, o2semi: 7}); Q.setSound(0, s);
    Q.setClip(0, 0, {len: 1, notes: [{t: 0, n: 69, d: .9, v: .8}, {t: 2, n: 69, d: .9, v: .8}]});
    const cl = S.tracks[0].clips[0]; o.lkSet = lkSet(0, 0, 0, 'kfRm', 1); const nt = S.tracks[0].clips[0].notes[0], x0 = lkNoteX(0, cl, nt), x1 = lkNoteX(0, cl, S.tracks[0].clips[0].notes[1]);
    o.pairs = {lk: x0 && x0.lk, wi: LKT.kfRm.wi, ohne: x1};
    const rnd = async (snd, notes, sec) => { const sn = SQStore.normalizeSound(snd), oc = new OfflineAudioContext(2, Math.round(sec * SR), SR); await oc.audioWorklet.addModule('data:application/javascript;base64,' + btoa(document.getElementById('sq-worklet-src').textContent));
      const E = SynthHost.track(oc, oc.destination, wkFlat(sn), wkMods(sn)); E.tempo(120, null); let id = 1; for (const [t0, t1, n, lk] of notes) { const k = id++; E.on(k, n, .8, t0, -1, 0, lk); E.off(k, t1); } E.flush(); await ms(250); return (await oc.startRendering()).getChannelData(0); };   // die Noten-Nachrichten müssen vor dem Rendern im Worklet sein
    { const y = await rnd(s, [[.01, .9, 69, x0.lk], [1.01, 1.9, 69, null]], 2.1); o.lockRing = {mitLock: +T.db(T.rms(y, 4800, 40000)).toFixed(1), ohne: +T.db(T.rms(y, 52800, 88000)).toFixed(1)}; }
    { const sN = T.mk({noise: 1}); const y = await rnd(sN, [[.01, 1.4, 60, [LKT.kfNc.wi, 2]], [1.51, 2.9, 60, null]], 3); o.lockNc = {braun: T.slope(T.psd(y, SR, .1, 1.35)).slope, weiss: T.slope(T.psd(y, SR, 1.6, 2.85)).slope}; }
    // Prüfer r2 (Befund 4): wo es nicht wirkt, ist es grau – WT (nativ, ohne Worklet) gegen VA und FM: FILTER › Anschl. ±, LFO 1 › S&H Tonart (Form S&H)
    { const st = async eng => { setEngine(0, eng); setP(0, 'l1shape', 4); selectTrack(0); openEditor(); await ms(300); const r = {};
        ED.tab = 'filter'; ED.sub.filter = 'ctl'; safeRebuild(buildSynthEd); await ms(300); const k = EL.synthSheet.querySelector('.knob[data-key="kf1vc"]'); r.vc = k ? [k.classList.contains('inert'), k.getAttribute('aria-disabled')] : null;
        ED.tab = 'lfo'; ED.sub.lfo = 'l1'; safeRebuild(buildSynthEd); await ms(300); const g = EL.synthSheet.querySelector('.seg.kf1sh'), h = EL.synthSheet.querySelector('.kf1shh'); r.sh = g ? [g.classList.contains('inert'), g.getAttribute('aria-disabled'), h && h.textContent] : null;
        closeEditor(); await ms(150); return r; };
      loadPreset(0, 'f-init-analog'); await ms(200); o.inert = {wt: await st('wt'), fm6: await st('fm6'), analog: await st('analog')}; }
    // Speichern/Laden: alle neuen Werte bleiben; Körnung an wird gespeichert, aus nicht
    loadPreset(0, 'f-init-analog'); for (const [k, v] of [['noise', .5], ['kfNc', 2], ['kfRm', .4], ['l1shape', 4], ['kfSh1', 1], ['l2shape', 4], ['kfSh2', 1]]) setP(0, k, v); modSetK(0, 'vel', 'cutoff', -.5);
    setTrackFx(0, 'kfBits', 8); setTrackFx(0, 'kfRate', .25); setTrackFx(0, 'kfMix', .7); await ms(200);
    const before = JSON.stringify(S.tracks[0].sound), ser = serializeProject(), j = JSON.parse(ser);
    applyProject(normalizeProject(j), {ui: true}); await ms(500);
    const P = S.tracks[0].sound.p, F = S.tracks[0].sound.fx; o.load = {same: JSON.stringify(S.tracks[0].sound) === before, p: [P.kfNc, P.kfRm, P.kfSh1, P.kfSh2], vc: +kf1VcGet(0).toFixed(3), fx: [F.kfBits, F.kfRate, F.kfMix], node: Q.kf1.korn(0)};
    o.sound1 = (() => { const z = SQStore.normalizeSound(JSON.parse(JSON.stringify(S.tracks[0].sound))); return [z.p.kfNc, z.p.kfRm, z.fx.kfBits]; })();
    // Klangzustand / Morph: Ring stetig, Rauschfarbe und S&H Tonart stufig (ab Taktstrich); Anschl. ± = Mod-Tiefe (wie im Bestand)
    o.morph = {kfRm: v6aCont('kfRm'), kfNc: v6aCont('kfNc'), kfSh1: v6aCont('kfSh1'), cutoff: v6aCont('cutoff'), velCut: v6aCont('mods.vel-cutoff.amt')};
    { const ap = v6aApply(S.tracks[0].sound, {p: {kfRm: .9, kfNc: 3}}); o.morph.apply = [ap.p.kfRm, ap.p.kfNc]; }
    // Tonart der Szene: dieselbe Tonart wie Tastatur und Träger (heardBaseKey) geht an die Engine; Song-Render in D-Dur
    Q.newProject(); await ms(300); setBpm(120); setProjectKey({root: 2, scale: 'ionian'});
    { const sh = T.mk({o1lvl: 1, l1shape: 4, l1rate: 6, l1sync: .5, kfSh1: 1}); sh.mods = [{src: 'lfo1', dst: 'pitch', amt: .5}]; Q.setSound(0, sh);
      Q.setClip(0, 0, {len: 1, key: {root: 2, scale: 'ionian', src: 'user'}, notes: [{t: 0, n: 62, d: 3.98, v: .8}]}); await ms(300); o.key = Q.kf1.key(); o.sceneKey = Q.sceneKey(0); for (let t = 0; t < S.tracks.length; t++) { try { setTrackFx(t, 'rev', 0); setTrackFx(t, 'dly', 0); } catch (e) {} }
      Q.songFromChain([{scene: 0, bars: 2}]); await ms(600);
      const r = await vvRenderAudio({range: {a: 0, b: S.song.bars, sel: false}}); const G = T.steps(r.ch[0], r.sr, Math.round(.1 * r.sr), Math.round(3.8 * r.sr), 6), M = T.maskOf([0, 2, 4, 5, 7, 9, 11]);
      o.songKey = {stufen: G.length, inTonart: G.filter(g => T.inKey(g.m, 2, M)).length, toene: [...new Set(G.map(g => Math.round(g.m)))].sort((a, b) => a - b), maxCent: +Math.max(...G.map(g => Math.abs(g.m - Math.round(g.m)) * 100)).toFixed(1)}; }
    // ECO / nativer Rückfall: die neuen Werte stören den Abgleich nicht
    try { o.nat = typeof NativeVoice.trimFor(S.tracks[0].sound.p, false, 'analog').trim === 'number'; } catch (e) { o.nat = String(e); }
    // Arp Treppe: das Muster (ARPC) und BM_NAME (BMARP), live gespielt (arpLog) und aus dem Clip (noteLog, Song-Tempo)
    o.trp = Q.kf1.treppe([60, 64, 67], 1, 6, 12); o.trp2 = Q.kf1.treppe([60, 64, 67], 2, 6, 12); o.trp4 = Q.kf1.treppe([60, 62, 64, 65], 1, 6, 8); o.bm = Q.kf1.bmTreppe('trp', [60, 64, 67], 8); o.bm2 = Q.kf1.bmTreppe('trp2', [60, 64, 67], 10);
    Q.setEngine(1, 'mk'); await ms(300); mkSetP(1, 'arp.on', 1, false); mkSetP(1, 'arp.type', 6, false); mkSetP(1, 'arp.range', 1, false); mkSetP(1, 'arp.res', 3, false);
    ARPC.clearLog(); clearLog(); Q.selectTrack(1);
    for (const n of [60, 64, 67]) Q.keyOn(n, .8, 'k' + n); await ms(2100); for (const n of [60, 64, 67]) Q.keyOff(n, 'k' + n); await ms(300);
    o.live = Q.arpLog(1).map(x => x.note);
    ARPC.clearLog(); clearLog(); Q.songDelete && Q.songDelete(); await ms(100);
    Q.setClip(1, 0, {len: 1, notes: [60, 64, 67].map(n => ({t: 0, n, d: 3.9, v: .8}))}); Q.launchScene(0); Q.play(); await ms(2300); Q.stop(); await ms(200);
    o.clip = noteLog(400).filter(e => e.track === 1).map(e => [e.out, e.src, +(e.beat || 0).toFixed(3)]);
    Q.setEngine(2, 'bm'); await ms(400); bmLoad(); Q.bmSet(2, 'a.ar.t', 'trp'); ARPC.clearLog(); clearLog(); Q.selectTrack(2);
    for (const n of [60, 64, 67]) Q.keyOn(n, .8, 'b' + n); await ms(2100); for (const n of [60, 64, 67]) Q.keyOff(n, 'b' + n); await ms(300);
    o.bmLive = Q.arpLog(2).map(x => x.note);
    o.typ = ARPC.TYP.slice(); o.bmT = BMARP.T.slice(-2); o.saveArp = (() => { const j2 = JSON.parse(serializeProject()); return j2.tracks[1].sound.p.mk.arp.type; })();
    // Klangzustand / Speichern der Platte: TYPE 6 übersteht normalize (Klemme 0…6)
    o.mkNorm = SQStore.normalizeSound(deep(S.tracks[1].sound)).p.mk.arp.type;
    // MIDI-Export bricht nicht (Song mit Arp-Spur und VA-Spur mit den neuen Werten)
    try { Q.songFromChain([{scene: 0, bars: 2}]); const m = buildMidi({mode: 'song'}); o.midi = !!(m && m.bytes && m.bytes.length > 50) && String.fromCharCode(...m.bytes.slice(0, 4)) === 'MThd'; } catch (e) { o.midi = String(e); }
    // Stil-Klang (SND1) bricht nicht
    try { const r = Q.snd1 ? Q.snd1.apply('house', 'klang', {off: []}) : null; o.snd1 = r !== false; if (Q.snd1) { Q.snd1.vorher(); Q.snd1.close(); } } catch (e) { o.snd1 = String(e); }
    // Guide „Wo finde ich …?“: sechs Einträge, Suche, Sprung an die Stelle
    const ids = ['kf1nc', 'kf1rm', 'kf1korn', 'kf1vc', 'kf1sh', 'kf1trp'];
    o.guide = ids.map(id => { const e = ui1Entries().find(x => x.id === id); return e ? e.n : null; });
    o.search = [['rauschfarbe', 'kf1nc'], ['ringmod', 'kf1rm'], ['bitcrusher', 'kf1korn'], ['anschlag filter', 'kf1vc'], ['s&h tonart', 'kf1sh'], ['arp treppe', 'kf1trp']].map(([q, id]) => (ui1Search(q) || []).slice(0, 3).some(e => e.id === id));
    selectTrack(0); loadPreset(0, 'f-init-analog'); await ms(200);
    const jr = []; for (const id of ids) { closeEditor(); await ms(150); const r = ui1Jump(id); await ms(1300); jr.push([id, !!(r && r.ok && r.target)]); }
    o.jump = jr; try { ui1RingOff(); } catch (e) {} closeEditor();
    return o;
  }, TOOLS);
  ok('Locks: Ring, Rauschfarbe je Note lockbar; S&H Tonart nur als Reihe (wie die anderen LFO-Werte); Anschl. ± = Route Anschlag → Cutoff: als Reihe lockbar wie jede Mod-Tiefe', !G.why.kfRm && !G.why.kfNc && !!G.why.velCut && !G.why.velCutReihe && !!G.why.kfSh1, G.why);
  ok('Lock Ring 100 % auf Note 1: Paar an die Engine, nur diese Note klingt (die zweite ohne Lock bleibt still)', G.lkSet && G.lkSet.ok !== false && G.pairs.lk && G.pairs.lk[0] === G.pairs.wi && G.lockRing.mitLock > -40 && G.lockRing.ohne < -100, {paare: G.pairs.lk, platz: G.pairs.wi, ring: G.lockRing});
  ok('Lock Rauschfarbe braun auf Note 1 (Note 2 weiß)', Math.abs(G.lockNc.braun + 6) <= .8 && Math.abs(G.lockNc.weiss) <= .8, {nc: G.lockNc});
  const IN = G.inert;
  ok('Prüfer r2 (Befund 4): WT – „Anschl. ±“ (FILTER) und „S&H Tonart“ (LFO) grau und gesperrt (aria-disabled), Hinweis „nur bei VA und FM“; bei FM und VA bedienbar', IN.wt.vc && IN.wt.vc[0] && IN.wt.vc[1] === 'true' && IN.wt.sh && IN.wt.sh[0] && IN.wt.sh[1] === 'true' && /VA und FM/.test(IN.wt.sh[2]) && [IN.fm6, IN.analog].every(x => x.vc && !x.vc[0] && x.sh && !x.sh[0]), IN);
  ok('Speichern/Laden: alle neuen Werte bleiben (Klang Zeichen für Zeichen gleich), Anschl. ± (Route) bleibt, Körnung-Knoten nach dem Laden da; Klang-Datei (normalizeSound) ebenso', G.load.same && JSON.stringify(G.load.p) === '[2,0.4,1,1]' && G.load.vc === -.5 && JSON.stringify(G.load.fx) === '[8,0.25,0.7]' && G.load.node.node && JSON.stringify(G.sound1) === '[2,0.4,8]', G.load);
  ok('Klangzustand/Morph: Ring stetig morphbar; Rauschfarbe und S&H Tonart stufig (ab Taktstrich); Zustand setzt die Werte', G.morph.kfRm && !G.morph.kfNc && !G.morph.kfSh1 && G.morph.cutoff && JSON.stringify(G.morph.apply) === '[0.9,3]', G.morph);
  ok('Tonart der Szene (Projekt D-Dur → Szene D-Dur, wie Tastatur und Träger) geht an die Engine; Song-Render (TAKT Achtel): alle Stufen in D-Dur', JSON.stringify(G.key) === JSON.stringify([2, 2741]) && G.sceneKey.root === 2 && G.sceneKey.scale === 'ionian' && G.songKey.stufen >= 10 && G.songKey.inTonart === G.songKey.stufen && G.songKey.maxCent <= 10, {key: G.key, szene: G.sceneKey, song: G.songKey});
  ok('Nativer Rückfall (ECO) kommt mit den neuen Werten zurecht', G.nat === true, G.nat);
  const J = x => JSON.stringify(x);
  ok('Arp Treppe (Muster): C-E-G → C E C G …; 2 Oktaven → C E C G E C′ G E′ C′ G′; 4 Töne → 1-2-1-3-2-4', J(G.trp.slice(0, 8)) === J([60, 64, 60, 67, 60, 64, 60, 67]) && J(G.trp2.slice(0, 10)) === J([60, 64, 60, 67, 64, 72, 67, 76, 72, 79]) && J(G.trp4.slice(0, 6)) === J([60, 62, 60, 64, 62, 65]), {r1: G.trp, r2: G.trp2, vier: G.trp4});
  ok('Arp Treppe in ' + 'BM' + ' (TYPE TRP / TRP2) und in der Typen-Liste beider Arps', J(G.bm.slice(0, 4)) === J([60, 64, 60, 67]) && J(G.bm2.slice(0, 6)) === J([60, 64, 60, 67, 64, 72]) && G.typ[6] === 'Treppe' && J(G.bmT) === J(['trp', 'trp2']), {bm: G.bm, bm2: G.bm2, typ: G.typ, bmT: G.bmT});
  const stair = L => L.length >= 8 && L.every((n, k) => n === [60, 64, 60, 67][k % 4]);
  ok('Arp Treppe live gespielt (Platte, Akkord halten, arpLog): C E C G C E C G …', stair(G.live), G.live);
  ok('Arp Treppe aus dem Clip (noteLog, Quelle arp): Folge C E C G …, Achtel im Song-Tempo (0 · 0,5 · 1 · 1,5 Schläge)', stair(G.clip.map(x => x[0])) && G.clip.every(x => x[1] === 'arp') && G.clip.slice(0, 4).every((x, k) => Math.abs(x[2] - k * .5) < .01), G.clip.slice(0, 9));
  ok('Arp Treppe live in ' + 'BM' + ' (TYPE TRP): C E C G …', stair(G.bmLive), G.bmLive);
  ok('Arp TYPE 6 wird gespeichert und übersteht normalize (Klemme 0…6)', G.saveArp === 6 && G.mkNorm === 6, {gespeichert: G.saveArp, norm: G.mkNorm});
  ok('MIDI-Export (Song mit Arp-Spur und VA-Spur mit den neuen Werten) und Stil-Klang (SND1) brechen nicht', G.midi === true && G.snd1 === true, {midi: G.midi, snd1: G.snd1});
  ok('Guide „Wo finde ich …?“: Rauschfarbe, Ringmod, Körnung, Anschlag Filter, S&H Tonart, Arp Treppe – Suche findet sie, Sprung zeigt die Stelle', J(G.guide) === J(['Rauschfarbe', 'Ringmod', 'Körnung', 'Anschlag Filter', 'S&H Tonart', 'Arp Treppe']) && G.search.every(Boolean) && G.jump.every(x => x[1]), {suche: G.search, sprung: G.jump});
  await p.close();
}

/* =============== Teil 4: Bedienung per Touch (hochkant + quer), Undo, Fotos =============== */
const touchDrag = async (p, x, y, dx, dy, steps) => {
  const c = await p.context().newCDPSession(p); steps = steps || 10;
  await c.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y}]}); await p.waitForTimeout(30);
  for (let k = 1; k <= steps; k++) { await c.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: x + dx * k / steps, y: y + dy * k / steps}]}); await p.waitForTimeout(16); }
  await c.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await c.detach(); await p.waitForTimeout(250);
};
const tapEl = async (p, sel, i) => { const l = p.locator(sel + ' >> visible=true').nth(i || 0); const bb = await l.boundingBox(); if (!bb) return null; await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(350); return bb; };
const boxOf = async (p, sel) => { const l = p.locator(sel + ' >> visible=true'); if (!(await l.count())) return null; return l.first().boundingBox(); };
for (const [w, h, nm] of [[428, 926, 'hochkant'], [926, 428, 'quer']]) {
  const p = await open(file, {width: w, height: h}, nm + ': ');
  await p.touchscreen.tap(w / 2, h - 60); await p.waitForTimeout(200);
  const ed = (tab, sub) => p.evaluate(async ([tab, sub]) => { ED.tab = tab; ED.sub[tab] = sub; SYNQUENZER.openEditor(); safeRebuild(buildSynthEd); await new Promise(r => setTimeout(r, 350)); }, [tab, sub]);
  await p.evaluate(async () => { const ms = t => new Promise(r => setTimeout(r, t)); SYNQUENZER.newProject({init: true}); await ms(300); ensureAudio(); await ms(500); selectTrack(0); loadPreset(0, 'f-init-analog'); setP(0, 'noise', .4); UNDO.length = 0; REDO.length = 0; });
  const lay = () => p.evaluate(() => { const x = EL.synthSheet.querySelector('.sh-x'), xr = x && x.getBoundingClientRect(); return {x: !!xr && xr.width >= 36 && xr.right <= innerWidth + 1 && xr.top >= 0, over: document.documentElement.scrollWidth > innerWidth + 1}; });
  // OSZ › MIX: Fader „Ring“ hochziehen (ein ↶-Schritt), Regler „Rausch-Farbe“ drehen
  await ed('osc', 'mix');
  const fr = await boxOf(p, '#synthSheet .fader[data-key="kfRm"]'), kn = await boxOf(p, '#synthSheet .knob[data-key="kfNc"]');
  const fz = await p.evaluate(() => [...EL.synthSheet.querySelectorAll('.pg.kf1mix .faders .fader')].map(f => { const r = f.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height), Math.round(r.right)]; }));
  if (fr) await touchDrag(p, fr.x + fr.width / 2, fr.y + fr.height * .8, 0, -fr.height * .5);
  const M1 = await p.evaluate(() => ({rm: S.tracks[0].sound.p.kfRm, undo: UNDO.length}));
  if (kn) await touchDrag(p, kn.x + kn.width / 2, kn.y + kn.height / 2, 0, -90);
  const M2 = await p.evaluate(() => { const k = EL.synthSheet.querySelector('.knob[data-key="kfNc"]'); return {nc: S.tracks[0].sound.p.kfNc, undo: UNDO.length, txt: k && k.textContent}; });
  await p.screenshot({path: path.join(fotos, 'kf1-' + nm + '-mix.png')});
  const L1 = await lay();
  ok(nm + ': OSZ › MIX – Fader „Ring“ per Touch hochgezogen (ein ↶-Schritt), Regler „Rausch-Farbe“ gedreht (zeigt die Farbe); alle 6 Fader in der Breite, ≥ 44 px (Prüfer r2)', fr && kn && M1.rm > .1 && M1.undo === 1 && M2.nc > 0 && M2.undo === 2 && /rosa|braun|blau/.test(M2.txt) && fz.length === 6 && fz.every(f => f[0] >= 44 && f[2] <= w) && L1.x && !L1.over, {ring: M1, farbe: M2, fader: fz, ring_px: fr && [Math.round(fr.width), Math.round(fr.height)], knopf_px: kn && [Math.round(kn.width), Math.round(kn.height)]});
  // FILTER: „Anschl. ±“ nach unten = negativ – Prüfer r2: der Regler stellt die Route Anschlag → Cutoff (dieselbe Tiefe wie im Reiter MOD)
  await ed('filter', 'ctl');
  const vr = () => { const r = (S.tracks[0].sound.mods || []).filter(m => m.src === 'vel' && m.dst === 'cutoff'); return r.length ? +r[0].amt.toFixed(4) : null; };
  const F0 = await p.evaluate(`(${vr})()`);
  const kv = await boxOf(p, '#synthSheet .knob[data-key="kf1vc"]');
  if (kv) await touchDrag(p, kv.x + kv.width / 2, kv.y + kv.height / 2, 0, 70);
  const F1 = await p.evaluate(`(() => { const k = EL.synthSheet.querySelector('.knob[data-key="kf1vc"]'), r = k.getBoundingClientRect(); return {route: (${vr})(), knopf: +kf1VcGet(0).toFixed(3), undo: UNDO.length, txt: k.textContent, inView: r.bottom <= innerHeight && r.right <= innerWidth, n: S.tracks[0].sound.mods.length}; })()`);
  await p.screenshot({path: path.join(fotos, 'kf1-' + nm + '-filter.png')});
  // Doppeltipp = Standard: die Route geht weg (0 = keine Route), ↶ holt sie wieder
  if (kv) { await p.touchscreen.tap(kv.x + kv.width / 2, kv.y + kv.height / 2); await p.waitForTimeout(80); await p.touchscreen.tap(kv.x + kv.width / 2, kv.y + kv.height / 2); await p.waitForTimeout(400); }
  const F2 = await p.evaluate(`(() => ({route: (${vr})(), undo: UNDO.length}))()`);
  await p.evaluate(() => undo()); await p.waitForTimeout(200); const F3 = await p.evaluate(`(${vr})()`);
  ok(nm + ': FILTER – Regler „Anschl. ±“ per Touch nach unten → Route Anschlag → Cutoff negativ (zeigt −… %, gleiche Tiefe wie im Reiter MOD), ein ↶-Schritt; Doppeltipp = keine Route; ↶ holt sie; ganz sichtbar, ≥ 44 px', kv && F1.route != null && F1.route < -.05 && Math.abs(F1.knopf - F1.route / .9966) < .002 && F1.undo === 3 && /−\d+ %/.test(F1.txt) && F2.route === null && F2.undo === 4 && F3 === F1.route && F1.inView && kv.width >= 44 && kv.height >= 44,
    Object.assign(F1, {vorher: F0, doppeltipp: F2, rueck: F3, px: kv && [Math.round(kv.width), Math.round(kv.height)]}));
  // LFO 1: ohne Form S&H grau; Form S&H → AN antippen
  await ed('lfo', 'l1');
  const S0 = await p.evaluate(() => { const s = EL.synthSheet.querySelector('.seg.kf1sh'), hh = EL.synthSheet.querySelector('.kf1shh'); return {inert: s.classList.contains('inert'), hint: hh && hh.textContent}; });
  await p.evaluate(async () => { setP(0, 'l1shape', 4); safeRebuild(buildSynthEd); await new Promise(r => setTimeout(r, 300)); UNDO.length = 0; });
  const sb = await tapEl(p, '#synthSheet .seg.kf1sh button', 1);
  const S1 = await p.evaluate(() => { const s = EL.synthSheet.querySelector('.seg.kf1sh'), hh = EL.synthSheet.querySelector('.kf1shh'), r = s.getBoundingClientRect(), x = EL.synthSheet.querySelector('.pg').getBoundingClientRect(); return {sh: S.tracks[0].sound.p.kfSh1, undo: UNDO.length, hint: hh && hh.textContent, inView: r.bottom <= innerHeight && r.bottom <= x.bottom + 1 && r.right <= innerWidth}; });
  await p.screenshot({path: path.join(fotos, 'kf1-' + nm + '-lfo.png')});
  ok(nm + ': LFO 1 – „S&H Tonart“ grau ohne Form S&H; mit S&H per Touch AN (ein ↶-Schritt), Hinweis, sichtbar; Taste ≥ 44 px', S0.inert && /S&H/.test(S0.hint) && sb && S1.sh === 1 && S1.undo === 1 && /Tonart|Tonhöhe/.test(S1.hint) && S1.inView && sb.height >= 44 && sb.width >= 44, {vorher: S0, nachher: S1, px: sb && [Math.round(sb.width), Math.round(sb.height)]});
  // FX › KÖRNUNG: Reiter antippen, RETRO antippen → Knoten an, Anzeige; ↶ → aus
  await ed('fx', 'chorus'); await p.evaluate(() => { UNDO.length = 0; });
  const tb = await tapEl(p, '#synthSheet .stab[data-sub="korn"]');
  const tabs = await p.evaluate(() => [...EL.synthSheet.querySelectorAll('.sh-subs .stab')].map(t => { const r = t.getBoundingClientRect(); return [t.textContent, Math.round(r.width), Math.round(r.height), t.scrollWidth <= t.clientWidth + 1, r.right <= innerWidth + 1]; }));
  const rb = await tapEl(p, '#synthSheet .pg.kf1korn .seg.chm button', 2);
  const C1 = await p.evaluate(async () => { await new Promise(r => setTimeout(r, 300)); const fx = S.tracks[0].sound.fx, i = EL.synthSheet.querySelector('.pg.kf1korn .fxinfo'); return {sub: ED.sub.fx, b: fx.kfBits, r: fx.kfRate, m: fx.kfMix, node: SYNQUENZER.kf1.korn(0).node, info: i && i.textContent, undo: UNDO.length, khz: AU.ctx.sampleRate / 4000, ctl: [...EL.synthSheet.querySelectorAll('.pg.kf1korn [data-key^="fx.kf"]')].map(k => { const r = k.getBoundingClientRect(); return [k.dataset.key, Math.round(r.width), Math.round(r.height), r.bottom <= innerHeight]; })}; });
  await p.screenshot({path: path.join(fotos, 'kf1-' + nm + '-koernung.png')});
  const C2 = await p.evaluate(async () => { undo(); await new Promise(r => setTimeout(r, 300)); const fx = S.tracks[0].sound.fx, i = EL.synthSheet.querySelector('.pg.kf1korn .fxinfo'); return {b: fx.kfBits, r: fx.kfRate, k: SYNQUENZER.kf1.korn(0), info: i && i.textContent}; });
  const khz = (/8 Bit · (\d+(?:,\d)?) kHz/.exec(C1.info || '') || [])[1];
  ok(nm + ': FX › KÖRNUNG – Reiter per Touch, Kurzwahl RETRO = 8 Bit · 1/4 (ein ↶-Schritt), Anzeige „8 Bit · ¼ der Abtastrate in kHz“ (iPhone 48 kHz → 12 kHz); ↶ = aus („kein Rechenaufwand“), Knoten nur Durchgang', tb && C1.sub === 'korn' && C1.b === 8 && C1.r === .25 && C1.node && khz && Math.abs(parseFloat(khz.replace(',', '.')) - C1.khz) <= .6 && C1.undo === 1 && C2.b == null && /kein Rechenaufwand/.test(C2.info) && JSON.parse(C2.k.sig).m === 0,
    {nachher: C1, zurueck: {b: C2.b, info: C2.info, sig: C2.k.sig}});
  ok(nm + ': Reiter-Leiste SPUR · CHORUS · KÖRNUNG · HALL · ECHO · MASTER ganz lesbar, KÖRNUNG so hoch wie die anderen (Bestand); Körnung-Regler ≥ 44 px und sichtbar; Kurzwahl ≥ 44 px', tabs.length >= 6 && tabs.some(t => t[0] === 'KÖRNUNG') && tabs.every(t => t[2] === tabs[0][2] && t[3] && t[4]) && C1.ctl.length === 3 && C1.ctl.every(k => k[1] >= 44 && k[2] >= 44 && k[3]) && rb && rb.height >= 44, {reiter: tabs, regler: C1.ctl, kurzwahl_px: rb && [Math.round(rb.width), Math.round(rb.height)]});
  // Drum-Spur: KÖRNUNG im Drum-Editor (FX), GROB antippen
  await p.evaluate(async () => { closeEditor(); selectTrack(DRUM_T); ED.dTab = 'fx'; ED.dFx = 'korn'; SYNQUENZER.openEditor(); await new Promise(r => setTimeout(r, 500)); UNDO.length = 0; });
  const db = await tapEl(p, '.pg.kf1korn .seg.chm button', 3);
  const D1 = await p.evaluate(async () => { await new Promise(r => setTimeout(r, 300)); const fx = S.tracks[DRUM_T].sound.fx || {}; return {b: fx.kfBits, r: fx.kfRate, node: SYNQUENZER.kf1.korn(DRUM_T).node, undo: UNDO.length, tab: !!document.querySelector('.stab[data-sub="korn"]')}; });
  await p.screenshot({path: path.join(fotos, 'kf1-' + nm + '-drum-koernung.png')});
  ok(nm + ': Drum-Editor › FX › KÖRNUNG – GROB per Touch = 4 Bit · 1/8, Knoten an der Drum-Spur, ein ↶-Schritt', db && D1.b === 4 && D1.r === .125 && D1.node && D1.undo === 1 && D1.tab, D1);
  // Platte: TYPE antippen bis Treppe (LCD „StP“)
  await p.evaluate(async () => { const ms = t => new Promise(r => setTimeout(r, t)); closeEditor(); await ms(200); SYNQUENZER.newProject({init: true}); await ms(300); SYNQUENZER.setEngine(1, 'mk'); await ms(400); selectTrack(1); ED.tab = 'osc'; ED.sub.osc = 'o1'; SYNQUENZER.openEditor(); await ms(1200); });   // (Bestand: mit dem FX-Reiter zeigt eine Platten-Spur die FX-Seite)
  let P1 = null;
  // hochkant zeigt die Platte eine Hälfte: mit ▶ („Nächster Halt“) bis zur ARP-Sektion, dann TYPE 6× antippen
  let taps = 0, halts = 0, nT = 0;
  for (let k = 0; k < 30 && nT < 6; k++) {
    const st = await p.evaluate(() => { const bt = document.querySelector('.mkpb[data-k="arp.type"]'), r = bt && bt.getBoundingClientRect(); return {t: S.tracks[1].sound.p.mk.arp.type, vis: !!r && r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight, x: r && r.x + r.width / 2, y: r && r.y + r.height / 2}; });
    if (!st.vis) { const nb = await tapEl(p, 'button.mkar[aria-label="Nächster Halt"]'); halts++; if (!nb) break; continue; }
    await p.touchscreen.tap(st.x, st.y); taps++; await p.waitForTimeout(250);
    if (await p.evaluate(() => S.tracks[1].sound.p.mk.arp.type) !== st.t) nT++;
  }
  P1 = await p.evaluate(() => { const l = document.querySelector('.mkplcd'), bt = document.querySelector('.mkpb[data-k="arp.type"]'), r = bt && bt.getBoundingClientRect(); return {type: S.tracks[1].sound.p.mk.arp.type, lcd: l && l.textContent, px: r && [Math.round(r.width), Math.round(r.height)]}; }); P1.taps = taps; P1.halts = halts;
  await p.screenshot({path: path.join(fotos, 'kf1-' + nm + '-platte-treppe.png')});
  ok(nm + ': Platte › ARP › TYPE per Touch 6× (hochkant erst mit ▶ zur ARP-Sektion) = Treppe, LCD zeigt „TYP Treppe“', P1.type === 6 && /TYP\s+Treppe/.test(P1.lcd || ''), P1);
  await p.close();
}
// quer 926 × 370 (Safari mit Leisten): die neuen Bedienteile passen in die Seite (Fotos)
{
  const p = await open(file, {width: 926, height: 370}, 'q370: ');
  const R = await p.evaluate(async () => { const ms = t => new Promise(r => setTimeout(r, t)), out = {}; SYNQUENZER.newProject({init: true}); await ms(300); selectTrack(0); loadPreset(0, 'f-init-analog'); setP(0, 'l1shape', 4);
    for (const [tab, sub, sel] of [['osc', 'mix', '[data-key="kfRm"],[data-key="kfNc"]'], ['filter', 'ctl', '[data-key="kf1vc"]'], ['lfo', 'l1', '.kf1shr'], ['fx', 'korn', '.pg.kf1korn .seg.chm, .pg.kf1korn [data-key^="fx.kf"]']]) {
      ED.tab = tab; ED.sub[tab] = sub; SYNQUENZER.openEditor(); safeRebuild(buildSynthEd); await ms(350);
      out[tab] = [...EL.synthSheet.querySelectorAll(sel)].map(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1; }); }
    return out; });
  for (const [tab, sub] of [['osc', 'mix'], ['lfo', 'l1'], ['fx', 'korn']]) { await p.evaluate(async ([tab, sub]) => { ED.tab = tab; ED.sub[tab] = sub; safeRebuild(buildSynthEd); await new Promise(r => setTimeout(r, 300)); }, [tab, sub]); await p.screenshot({path: path.join(fotos, 'kf1-quer370-' + tab + '.png')}); }
  ok('quer 926 × 370: Ring, Rausch-Farbe, Anschl. ±, S&H Tonart, Körnung ganz in der Seite', Object.values(R).every(a => a.length && a.every(Boolean)), R);
  // Prüfer r2 (Befund 8): die Info-Zeile der Körnung überlappt die Kurzwahl-Leiste nicht (quer 926 × 370 und 926 × 428)
  const KO = []; for (const hh of [370, 428]) { await p.setViewportSize({width: 926, height: hh}); await p.evaluate(async () => { ED.tab = 'fx'; ED.sub.fx = 'korn'; safeRebuild(buildSynthEd); await new Promise(r => setTimeout(r, 350)); });
    KO.push(await p.evaluate(() => { const a = document.querySelector('.pg.kf1korn .seg.chm').getBoundingClientRect(), i = document.querySelector('.pg.kf1korn .fxinfo').getBoundingClientRect(), pg = document.querySelector('.pg.kf1korn').getBoundingClientRect(); return {h: innerHeight, segUnten: Math.round(a.bottom), infoOben: Math.round(i.top), infoUnten: Math.round(i.bottom), seiteUnten: Math.round(pg.bottom)}; })); }
  ok('Prüfer r2 (Befund 8): quer 926 × 370 / 926 × 428 – Körnung-Info-Zeile unter der Kurzwahl-Leiste (keine Überlappung) und in der Seite', KO.every(k => k.infoOben >= k.segUnten && k.infoUnten <= k.seiteUnten), KO);
  await p.close();
}
// Prüfer r2 (Befund 6): Mixer-Fader auf schmalen Handys ≥ 44 px (hochkant 428 / 390 / 375 / 360), sechs in der Breite, kein waagerechtes Rollen
{
  const FW = {};
  for (const wd of [428, 390, 375, 360]) { const p = await open(file, {width: wd, height: 844}, 'fader' + wd + ': ');
    FW[wd] = await p.evaluate(async () => { SYNQUENZER.newProject(); await new Promise(r => setTimeout(r, 300)); SYNQUENZER.selectTrack(0); openEditor(); await new Promise(r => setTimeout(r, 400)); ED.tab = 'osc'; ED.sub.osc = 'mix'; safeRebuild(buildSynthEd); await new Promise(r => setTimeout(r, 350));
      const f = [...document.querySelectorAll('.pg-osc-mix .faders .fader')].map(e => { const q = e.getBoundingClientRect(); return [Math.round(q.width * 10) / 10, Math.round(q.right)]; }); return {f, over: document.documentElement.scrollWidth > innerWidth + 1}; });
    if (wd === 360) await p.screenshot({path: path.join(fotos, 'kf1-hochkant360-mix.png')});
    await p.close(); }
  ok('Prüfer r2 (Befund 6): Mixer-Fader hochkant 428 / 390 / 375 / 360 px je ≥ 44 px breit, alle 6 in der Seite, kein waagerechtes Rollen', Object.entries(FW).every(([wd, o]) => o.f.length === 6 && o.f.every(x => x[0] >= 44 && x[1] <= +wd) && !o.over), Object.fromEntries(Object.entries(FW).map(([k, o]) => [k, o.f.map(x => x[0])])));
}
/* =============== Teil 6 (Prüfer r2): live im Echtzeit-AudioContext – Körnung erstes Einschalten, S&H-Tonart im Song =============== */
const REC = 'class KfRec extends AudioWorkletProcessor{constructor(){super();this.on=true;this.port.onmessage=()=>{this.on=false};}process(i){const x=i[0]&&i[0][0];if(this.on)this.port.postMessage({f:currentFrame,d:x?x.slice(0):null});return true;}}registerProcessor("kfrec",KfRec);';
{
  // Befund 1: Körnung erstmals einschalten, während ein Sinus klingt (Aufnahme hinter dem Einschub, am Spur-Drive): kein Aussetzer (Lauf von
  // Null-Samples), kein Sprung (zweite Differenz um den Schaltpunkt ≤ 4 × die im ruhigen Teil mit Körnung an); 8 Erst-Einschaltungen
  const runs = [];
  for (let r = 0; r < 8; r++) { const p = await open(file, null, 'live' + r + ': ');
    runs.push(await p.evaluate(async src => {
      const ms = t => new Promise(r => setTimeout(r, t)), Q = SYNQUENZER; Q.newProject(); await ms(300); ensureAudio(); await ms(800);
      const c = AU.ctx; if (c.state !== 'running') { try { await c.resume(); } catch (e) {} }
      const s = deep(SQStore.normalizeSound(factorySound('f-init-analog'))); Object.assign(s.p, {o1w: 3, o1lvl: 1, o2lvl: 0, o3lvl: 0, subLvl: 0, noise: 0, cutoff: 20000, res: 0, drive: 0, fenv: 0, kt: 0, aA: .001, aD: 1, aS: 1, aR: .05, level: .5, analog: 0, spread: 0, ampVel: 0, l1shape: 0, l2shape: 0}); s.mods = []; s.fx = {}; Q.setSound(0, s); await ms(500);
      await c.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src));
      const rec = new AudioWorkletNode(c, 'kfrec', {numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1], channelCount: 1, channelCountMode: 'explicit'}), z = c.createGain(); z.gain.value = 0; rec.connect(z); z.connect(c.destination);
      const A = AU.tracks[0]; A.drive.connect(rec); const ch = []; rec.port.onmessage = e => ch.push(e.data);
      const E = AU.synth[0]; E.on(4242, 57, .8, c.currentTime + .02, null, 0); E.flush && E.flush(); await ms(700);
      const tAn = c.currentTime; setP(0, 'fx.kfBits', 15); const node = !!A.kf1k; await ms(700);
      rec.port.postMessage(0); E.off && E.off(4242, c.currentTime); await ms(100); try { A.drive.disconnect(rec); } catch (e) {}
      ch.sort((a, b) => a.f - b.f); const f0 = ch[0].f, n = ch[ch.length - 1].f + 128 - f0, x = new Float32Array(n); for (const q of ch) if (q.d) x.set(q.d, q.f - f0);
      const sr = c.sampleRate, i0 = Math.round(tAn * sr) - f0;
      const run = (a, b) => { let m = 0, cur = 0; for (let i = Math.max(0, a); i < Math.min(n, b); i++) { if (Math.abs(x[i]) < 1e-4) { cur++; if (cur > m) m = cur; } else cur = 0; } return m; };
      const d2 = (a, b) => { let m = 0; for (let i = Math.max(2, a); i < Math.min(n, b); i++) m = Math.max(m, Math.abs(x[i] - 2 * x[i - 1] + x[i - 2])); return m; };
      return {node, null_um: run(i0 - .1 * sr, i0 + .25 * sr), d2_um: +d2(i0 - .05 * sr, i0 + .25 * sr).toFixed(5), d2_an: +d2(i0 + .3 * sr, i0 + .6 * sr).toFixed(5), d2_vor: +d2(i0 - .4 * sr, i0 - .1 * sr).toFixed(5)};
    }, REC)); await p.close(); }
  ok('Prüfer r2 (Befund 1): Körnung erstes Einschalten in einen klingenden Ton (live, 8 ×): kein Aussetzer (≤ 8 Null-Samples), kein Sprung (zweite Differenz am Schaltpunkt ≤ 4 × ruhig mit Körnung an)', runs.every(o => o.node && o.null_um <= 8 && o.d2_um <= 4 * Math.max(o.d2_an, o.d2_vor)), runs);
}
{
  // Befund 2: Song live – Szene A C-Dur (Note 48), Szene B Fis-Dur (Note 78), S&H Sechzehntel ±12 HT → Tonhöhe, S&H Tonart AN; jede Stufe ≥ 64
  // (Szene B) liegt in Fis-Dur, jede ≤ 61 (Szene A) in C-Dur – auch die erste nach dem Taktstrich (2 Läufe à 4 Wechsel)
  const out = [];
  for (let r = 0; r < 2; r++) { const p = await open(file, null, 'song' + r + ': ');
    out.push(await p.evaluate(async src => {
      const ms = t => new Promise(r => setTimeout(r, t)), Q = SYNQUENZER; Q.newProject(); await ms(300); setBpm(120); ensureAudio(); await ms(800);
      const c = AU.ctx; if (c.state !== 'running') { try { await c.resume(); } catch (e) {} }
      const s = deep(SQStore.normalizeSound(factorySound('f-init-analog'))); Object.assign(s.p, {o1w: 3, o1lvl: 1, o2lvl: 0, o3lvl: 0, subLvl: 0, noise: 0, cutoff: 20000, res: 0, drive: 0, fenv: 0, kt: 0, aA: .001, aD: 1, aS: 1, aR: .02, level: .5, analog: 0, spread: 0, ampVel: 0, l1shape: 4, l1rate: 6, l1sync: .25, kfSh1: 1});
      s.mods = [{src: 'lfo1', dst: 'pitch', amt: .5}]; s.fx = {}; Q.setSound(0, s);
      Q.setClip(0, 0, {len: 1, key: {root: 0, scale: 'ionian', src: 'user'}, notes: [{t: 0, n: 48, d: 3.99, v: .8}]}); Q.setClip(0, 1, {len: 1, key: {root: 6, scale: 'ionian', src: 'user'}, notes: [{t: 0, n: 78, d: 3.99, v: .8}]});
      for (let t = 1; t < S.tracks.length; t++) { try { setTrackFx(t, 'vol', 0); } catch (e) {} }
      Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}, {scene: 0, bars: 2}, {scene: 1, bars: 2}]); await ms(400);
      await c.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src));
      const rec = new AudioWorkletNode(c, 'kfrec', {numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1], channelCount: 1, channelCountMode: 'explicit'}), z = c.createGain(); z.gain.value = 0; rec.connect(z); z.connect(c.destination); AU.tracks[0].drive.connect(rec);
      const ch = []; rec.port.onmessage = e => ch.push(e.data);
      Q.songPlay(0); await ms(16800); Q.songPlay(false); rec.port.postMessage(0); await ms(100);
      ch.sort((a, b) => a.f - b.f); const f0 = ch[0].f, n = ch[ch.length - 1].f + 128 - f0, x = new Float32Array(n); for (const q of ch) if (q.d) x.set(q.d, q.f - f0);
      const sr = c.sampleRate, P = []; let last = -1; for (let i = 1; i < n; i++) if (x[i - 1] < 0 && x[i] >= 0) { const t = i - 1 + x[i - 1] / (x[i - 1] - x[i]); if (last >= 0) P.push([69 + 12 * Math.log2(sr / (t - last) / 440), last / sr, t / sr]); last = t; }
      const G = []; let g = null; for (const q of P) { if (g && Math.abs(q[0] - g.ref) < .06) { g.n++; g.v.push(q[0]); } else { if (g) G.push(g); g = {ref: q[0], n: 1, v: [q[0]], t0: q[1]}; } } if (g) G.push(g);
      const st = G.filter(q => q.n >= 4).map(q => { const v = q.v.slice().sort((a, b) => a - b); return {m: v[v.length >> 1], t0: +q.t0.toFixed(3)}; });
      const DUR = [0, 2, 4, 5, 7, 9, 11], inK = (m, r0) => DUR.includes((((Math.round(m) - r0) % 12) + 12) % 12);
      const B = st.filter(q => q.m >= 64), A_ = st.filter(q => q.m <= 61);
      return {A: A_.length, inC: A_.filter(q => inK(q.m, 0)).length, B: B.length, inFis: B.filter(q => inK(q.m, 6)).length, falsch: B.filter(q => !inK(q.m, 6)).concat(A_.filter(q => !inK(q.m, 0))).map(q => [q.t0, +q.m.toFixed(2)])};
    }, REC)); await p.close(); }
  ok('Prüfer r2 (Befund 2): Song live mit Tonartwechsel der Szene (C-Dur ↔ Fis-Dur, S&H Sechzehntel): jede Stufe in der Tonart ihrer Szene, auch die erste nach dem Taktstrich (2 Läufe)', out.every(o => o.A >= 40 && o.B >= 40 && o.inC === o.A && o.inFis === o.B), out);
}
await b.close();

/* =============== Teil 5: Pflichtprüfungen =============== */
{
  const cnt = (s, w) => s.split(w).length - 1;
  const brand = ['Korg', 'microKORG', 'RADIAS', 'DWGS', 'Kodamo', 'Mask1', 'Nord', 'Kompakt', 'Clavia', 'Elektron', 'Octatrack', 'Moog', 'Roland'];
  const up = brand.filter(x => cnt(A, x) > cnt(Bs, x));
  ok('Markenwörter: keine Zählung gestiegen; „MS 2000“ genau 1×; „  live: true,“ genau 1×', !up.length && cnt(A, 'MS 2000') === 1 && cnt(A, '  live: true,') === 1, {gestiegen: up});
  ok('Prüfer r2 (Befund 7): Hilfetext der Platte nennt alle ARPEGGIATOR-Typen (Up, Down, Alt 1, Alt 2, Random, Trigger, Treppe)', A.includes('TYPE (Up, Down, Alt 1, Alt 2, Random, Trigger, Treppe), GATE') && !A.includes('Random, Trigger), GATE'));
  ok('Prüfer r2 (Befund 5): kein zweiter Kern für Anschlag → Cutoff – kein Parameter kfVc mehr (Worklet, Speicher, Lock-Liste); der Regler stellt die Route der Mod-Matrix', !/\bkfVc\b/.test(A.replace(/!PD\.kfVc/g, '')) && /modSetK\(i, KF1_VR\.src, KF1_VR\.dst, v, true\)/.test(A));
  const v = s => (/const VERSION = '([^']*)';/.exec(s) || [])[1];
  ok('VERSION unverändert (' + v(A) + ')', v(A) === v(Bs));
  const wk = WK.code, blk = (/\/\* KF1-WK-BEGIN[\s\S]*?KF1-WK-END \*\//.exec(wk) || [''])[0];
  const body = (n, s) => { const i = s.indexOf('  ' + n + '('); if (i < 0) return ''; let d = 0, j = s.indexOf('{', i); for (let k = j; k < s.length; k++) { if (s[k] === '{') d++; else if (s[k] === '}') { d--; if (!d) return s.slice(j, k + 1); } } return ''; };
  const hot = ['kf1RingLvl', 'kf1ShQ', 'kf1Noise', 'kf1Pre', 'kf1Osc', 'kf1Wave', 'kf1Ring', 'process'].map(n => [n, body(n, blk)]);
  const alloc = hot.filter(([, s]) => !s || /\bnew\s|=>|\[\s*[^\]\s]|\{\s*[a-zA-Z_$][\w$]*\s*:|\.slice\(|\.map\(|\.concat\(/.test(s.replace(/\/\/.*$/gm, '').replace(/[a-zA-Z_$][\w$.]*\s*\[/g, 'X(')));
  ok('Worklet: nur ASCII; Ton-Wege (kf1RingLvl, kf1ShQ, kf1Noise, kf1Pre, kf1Osc, kf1Wave, kf1Ring, Körnung process) ohne Allokation', !/[^\x00-\x7f]/.test(wk) && blk.length > 0 && !alloc.length, {alloc: alloc.map(x => x[0])});
  // jede neue Zeile gegenüber der Basis gehört zu KF1 (Block oder markierte Einhänge-Zeile)
  const bl = new Set(Bs.split('\n')), add = A.split('\n'); let inb = false, bad = [];
  const l2 = new Set(fs.readFileSync(path.join(path.dirname(file), '..', 'kf2', 'index.html'), 'utf8').split('\n'));   // KF12: die Zeilen von KF2 (wörtlich aus kf2/index.html, von kf2-test geprüft)
  for (const l of add) { if (/KF(1|12)(-WK)?-BEGIN/.test(l)) inb = true; if (!bl.has(l) && !l2.has(l) && !inb && !/KF1/.test(l)) bad.push(l.slice(0, 120)); if (/KF(1|12)(-WK)?-END/.test(l)) inb = false; }   // KF12: neue Zeile = KF1-/KF12-markiert, im Block oder wörtlich von KF2
  ok('Eigener Block KF1-BEGIN … KF1-END (Haupt-Skript, Worklet KF1-WK-BEGIN … END, SQStore); jede neue Zeile außerhalb ist als KF1 markiert (KF12: oder als KF12, oder wörtlich aus KF2)', /KF1-BEGIN/.test(A) && /KF1-END/.test(A) && blk.length > 0 && !bad.length, {ohneMarke: bad.slice(0, 5)});
  const kblk = (/\/\* ===== KF1-BEGIN[\s\S]*?\/\* KF1-END \*\//.exec(A) || [''])[0] + blk;
  ok('Keine Emojis in den KF1-Teilen', !/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u.test(kblk));
  const run = (args) => { try { return execFileSync('node', args, {encoding: 'utf8', env: Object.assign({}, process.env, {NODE_PATH: '/opt/node-tools/node_modules'}), timeout: 300000}); } catch (e) { return 'FEHLER ' + (e.stdout || '') + (e.stderr || ''); } };
  const td = run([SP + '/rel-4271/tools/topdefs.cjs', file]).trim(), dk = run([SP + '/tools2/dupkeys.cjs', file]).trim();
  ok('topdefs 0/0 (doppelte Namen / Syntaxfehler)', /doppelt 0, Syntaxfehler 0/.test(td), td.split('\n').slice(-1));
  ok('dupkeys 0', /^0 doppelte Schlüssel/m.test(dk), dk.split('\n').slice(-1));
}
ok('Keine Fehler in der Konsole (alle Seiten)', errs.length === 0, errs.slice(0, 5));
const n = res.filter(r => r.pass).length;
console.log((n === res.length ? 'OK' : 'FEHLER') + ' KF1: ' + n + '/' + res.length + ' bestanden');
process.exit(n === res.length ? 0 : 1);
