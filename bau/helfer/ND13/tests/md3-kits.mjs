// ND3 acceptance (Node shim, offline 48 kHz, v 0.8 and 1.0): 45 programs, character per category, levels, kits, roles.
// Usage: node md3-kits.mjs [--calib]   (--calib writes src/md-levels.json: CH LEVEL for the ND3-03 level targets)
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url'; import vm from 'node:vm';
import {render, INIT} from './md-shim.mjs';
import * as M from './md-measure.mjs';
const HERE = path.dirname(url.fileURLToPath(import.meta.url)), SR = 48000, CALIB = process.argv.includes('--calib');
// load MDX + the ND3 data from the source blocks (no DOM needed for them)
function loadMDX(levels) {
  const ctx = {window: {}, console, Math, performance, document: {getElementById: () => null}, queueMicrotask, Blob: class {}, URL: {}, btoa: s => Buffer.from(s, 'binary').toString('base64')};
  vm.createContext(ctx); let host = fs.readFileSync(path.join(HERE, '../src/md-host.js'), 'utf8'), progs = fs.readFileSync(path.join(HERE, '../src/md-progs.js'), 'utf8');
  if (levels) progs = progs.replace('  /*LV*/\n', '  Object.assign(LV, ' + JSON.stringify(levels) + ');\n');
  vm.runInContext(host + progs + '\nthis.MDX = MDX; this.MD_NAME = MD_NAME;', ctx); return ctx.MDX;
}
const lvPath = path.join(HERE, '../src/md-levels.json');
let MDX = loadMDX(!CALIB && fs.existsSync(lvPath) ? JSON.parse(fs.readFileSync(lvPath, 'utf8')) : null);
const res = []; const check = (id, ok, d) => { res.push({id, ok: !!ok}); console.log((ok ? 'OK  ' : 'FAIL') + ' ' + id + ' ' + d); };
const R = (x, d = 1) => (+x).toFixed(d), hz = p => 440 * Math.pow(2, (p - 69) / 12);
const hit = (p, v = 1, sec = 2, o = {}) => render(Object.assign({sr: SR, chans: {0: p}, hits: [{ch: 0, at: 0, v}], sec}, o));
const pkDb = x => M.db(M.peakAbs(x));
const band = (x, a, b, f1, f2) => { const L = Math.round((b - a) * SR), S = rectSpec(x, Math.round(a * SR), L); let e = 0; for (let i = Math.ceil(f1 / S.df); i <= f2 / S.df; i++) e += S.mag[i] ** 2; return 10 * Math.log10(e / L + 1e-30); }; /* mean power in the band */
function rectSpec(x, a, L) { const N = 16384, re = new Float64Array(N), im = new Float64Array(N); for (let i = 0; i < Math.min(L, N); i++) re[i] = x[a + i]; M.fft(re, im); const mag = new Float64Array(N / 2); for (let i = 0; i < N / 2; i++) mag[i] = Math.hypot(re[i], im[i]); return {mag, df: SR / N}; }   // rectangular window: the hit sits at the window start
function msp(x, a, b) { let num = 0, den = 0; for (let s = Math.round(a * SR); s + 2048 <= Math.round(b * SR) + 1; s += 1024) { const S = M.spectrum(x, SR, s, s + 2048, 2048); for (let i = 1; i < S.mag.length; i++) { num += S.mag[i] * i * S.df; den += S.mag[i]; } } return num / den; }
function mAus(x) { const {e, dt} = M.hilbDb(x, SR, 0.005, 0.001); /* envelope = Hilbert magnitude, 5 ms smoothing (a 40-60 Hz tone has longer periods than a 5 ms RMS window) */ let pk = -1e9, pi = 0; e.forEach((v, i) => { if (v > pk) { pk = v; pi = i; } }); for (let i = pi; i < e.length; i++) if (e[i] < pk - 20) return i * dt; return e.length * dt; }
function harm(x, a, b) { const S = M.spectrum(x, SR, Math.round(a * SR), Math.round(b * SR)); const P = M.peaks(S, -60).slice(0, 20); if (!P.length) return 0; const low = P.slice().sort((p, q) => p.f - q.f).find(q => q.db > -30) || P[0];
  let e = 0, eh = 0; for (const q of P) { e += q.a * q.a; const h = q.f / low.f; if (Math.abs(h - Math.round(h)) <= 0.01 * h) eh += q.a * q.a; } return eh / e; }
function lowPeak(x, a, b, fmax) { const S = M.spectrum(x, SR, Math.round(a * SR), Math.round(b * SR)); const P = M.peaks(S, -20, 20, fmax); return P.sort((p, q) => p.f - q.f)[0]; }
// pitch over time (first 3 ms windows by zero crossings, then STFT-free: crossings in the window)
function centsAt(x, t, f0) { const z = []; for (let i = Math.max(1, Math.round(t * SR)); i < Math.min(x.length, Math.round((t + 0.03) * SR)); i++) if (x[i - 1] < 0 && x[i] >= 0) z.push(i - 1 + -x[i - 1] / (x[i] - x[i - 1])); if (z.length < 2) return NaN; return 1200 * Math.log2((z.length - 1) / ((z[z.length - 1] - z[0]) / SR) / f0); }
// BS.1770 integrated loudness (48 kHz K-weighting, 400 ms blocks, gates -70 / -10)
function lufs(L, Rr) { const kw = x => { const y = Float64Array.from(x); const bq = (b0, b1, b2, a1, a2) => { let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < y.length; i++) { const v = y[i], o = b0 * v + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = v; y2 = y1; y1 = o; y[i] = o; } };
    bq(1.53512485958697, -2.69169618940638, 1.19839281085285, -1.69065929318241, 0.73248077421585); bq(1.0, -2.0, 1.0, -1.99004745483398, 0.99007225036621); return y; };
  const l = kw(L), r = kw(Rr), B = Math.round(0.4 * SR), H = Math.round(0.1 * SR), z = []; for (let s = 0; s + B <= l.length; s += H) { let a = 0; for (let i = s; i < s + B; i++) a += l[i] * l[i] + r[i] * r[i]; z.push(a / B); }
  const ld = v => -0.691 + 10 * Math.log10(v + 1e-30); let g = z.filter(v => ld(v) > -70); const m1 = g.reduce((s, v) => s + v, 0) / g.length; g = g.filter(v => ld(v) > ld(m1) - 10); return ld(g.reduce((s, v) => s + v, 0) / g.length); }
// ---- calibration of CH LEVEL (targets: kick -6, snare -3, hats -11.5 dBFS peak at v 1; toms equal to "Fell mitte") ----
const target = {bd: -6, Sn: -3, HH: -11.5, to: -9, Cy: -9, Pc: -9, Be: -9, Tu: -9, Ef: -9};   // to/Cy/Pc/Be/Tu/Ef: [A] -9 dBFS
if (CALIB) {
  const LV = {};
  for (const p of MDX.progs) { const t = target[p.mCat]; if (t == null) continue; let x = p.mLvl; for (let k = 0; k < 4; k++) { const q = Object.assign({}, p, {mLvl: x}); const d = t - pkDb(hit(q, 1, 1.5).L); x = Math.max(1, Math.min(50, Math.round(x * Math.sqrt(Math.pow(10, d / 20))))); } LV[p.mName] = x; }
  fs.writeFileSync(lvPath, JSON.stringify(LV)); console.log('md-levels.json', JSON.stringify(LV)); MDX = loadMDX(LV);
}
// ND3-01 count, names, kits
{ const cats = {}; for (const p of MDX.progs) cats[p.mCat] = (cats[p.mCat] || 0) + 1; const names = new Set(MDX.progs.map(p => p.mName));
  check('ND3-01 Anzahl', MDX.progs.length === 45 && Object.keys(cats).length === 9 && Object.values(cats).every(n => n === 5) && names.size === 45 && MDX.kits.length === 4, MDX.progs.length + ' Programme, ' + JSON.stringify(cats) + ', Kits ' + MDX.kits.length);
  const all = JSON.stringify(MDX.progs) + JSON.stringify(MDX.kits); check('ND3-01 Marke', !/nord/i.test(all), 'kein Gerätename in Namen und Texten');
  check('ND3-01 Kits alle Pads md', MDX.kits.every(k => MDX.ORDER.every(id => k.slots[id] && k.slots[id].src === 'md')), MDX.kits.map(k => k.name).join(' · ')); }
const P = n => MDX.prog(n);
// ND3-02 character
for (const p of MDX.progs.filter(q => q.mCat === 'bd')) { const r = hit(p, 1, 1.5); const lo = lowPeak(r.L, 0.03, 0.5, 200); const ck = band(r.L, 0, 0.005, 2000, 6000), bd = band(r.L, 0.03, 0.15, 30, 150); const aus = mAus(r.L);
  check('ND3-02 bd ' + p.mName, lo && lo.f >= 40 && lo.f <= 70 && ck >= bd - 20 && aus >= 0.05 && aus <= 0.4, 'Grundton ' + (lo ? R(lo.f) : '-') + ' Hz, Klick-Band ' + R(ck - bd) + ' dB zum Körper, M-AUS ' + R(aus * 1000, 0) + ' ms'); }
for (const p of MDX.progs.filter(q => q.mCat === 'Sn' && q.mName !== 'Rausch-Klatsch')) { const r = hit(p, 1, 1); const tone = hit(Object.assign({}, p, {mNlv: 0, mClv: 0, mRvb: 0}), 1, 1), nz = hit(Object.assign({}, p, {mTlv: 0, mClv: 0, mRvb: 0}), 1, 1);   /* dry: the hall would color both parts */
  const pk = M.peaks(M.spectrum(tone.L, SR, 0, Math.round(0.3 * SR)), -40, 120, 400), lo = pk.filter(q => q.a >= pk[0].a * 0.5).sort((a, b) => a.f - b.f)[0]; /* lowest peak within 6 dB of the strongest below 400 Hz */ const d = band(nz.L, 0.03, 0.15, 2000, 20000) - band(tone.L, 0.03, 0.15, 20, 20000);
  check('ND3-02 Sn ' + p.mName, lo && lo.f >= 150 && lo.f <= 260 && d >= -6 && d <= 6, 'Körper ' + (lo ? R(lo.f) : '-') + ' Hz, Rauschen/Ton ' + R(d) + ' dB'); }
{ const bendOf = (p, v) => { const t = hit(Object.assign({}, p, {mNlv: 0, mClv: 0, mBnd: 0}), v, 1.5), r = hit(Object.assign({}, p, {mNlv: 0, mClv: 0}), v, 1.5); const fs = lowPeak(t.L, 0.02, 1, 2000).f; const y = M.bandpass(r.L, SR, fs * 1.2, 1.2); return {fs, c: centsAt(y, 0.002, fs)}; };
  const f = ['Fell tief', 'Fell mitte', 'Fell hoch'].map(n => { const p = P(n), r = hit(p, 0.9, 2), b = bendOf(p, 0.9); return {n, c0: b.c, t60: M.t60(r.L, SR), lo: lowPeak(r.L, 0.3, 1.5, 400)}; });
  for (const x of f) check('ND3-02 to ' + x.n, x.c0 / 100 >= 2 && x.c0 / 100 <= 5 && x.t60 >= 0.3 && x.t60 <= 0.9, 'Bend ' + R(x.c0 / 100, 2) + ' HT, T60 ' + R(x.t60 * 1000, 0) + ' ms');
  const st = [1200 * Math.log2(f[1].lo.f / f[0].lo.f), 1200 * Math.log2(f[2].lo.f / f[1].lo.f)]; check('ND3-02 to Abstand', st.every(c => Math.abs(c - 500) <= 10), st.map(c => R(c, 1)).join(' / ') + ' Cent');
  const e = P('Elektro-Tom'), be = (() => { const r = hit(Object.assign({}, e, {mNlv: 0, mClv: 0}), 0.9, 0.3); let z = 0; for (let i = 2; i < r.L.length; i++) if (r.L[i - 1] > 0 && r.L[i] <= 0) { z = i - 1 + r.L[i - 1] / (r.L[i - 1] - r.L[i]); break; } return {c: 1200 * Math.log2(0.5 / (z / SR) / hz(e.mPit))}; })(); check('ND3-02 to Elektro-Tom', be.c / 100 >= 12, 'Bend ' + R(be.c / 100, 2) + ' HT (erste Halbwelle; Anfangsversatz laut Modell ' + R(MDX.bendHT(e.mBnd, 0.9), 2) + ')');
  const k = P('Kessel'), rk = hit(k, 0.9, 4); const tk = M.t60(M.bandpass(rk.L, SR, hz(k.mPit), 8), SR); check('ND3-02 to Kessel', Math.abs(centsAt(rk.L, 0, hz(k.mPit))) <= 100 && tk >= 1.2, 'Bend ' + R(centsAt(rk.L, 0, hz(k.mPit)) / 100, 2) + ' HT, T60 ' + R(tk, 2) + ' s'); }
for (const p of MDX.progs.filter(q => q.mCat === 'HH')) { const r = hit(p, 1, 2); const sp = msp(r.L, 0, 0.1), h = harm(r.L, 0, 0.3), t = M.t60(r.L, SR);
  const okT = p.mName === 'Zu' ? t <= 0.15 : p.mName === 'Offen' ? t >= 0.4 : true;
  check('ND3-02 HH ' + p.mName, sp >= 6000 && h < 0.3 && okT, 'M-SP ' + R(sp, 0) + ' Hz, Harmonizität ' + R(h, 2) + ', T60 ' + R(t * 1000, 0) + ' ms'); }
{ const zu = P('Zu'), of = P('Offen'); const r = render({sr: SR, chans: {4: zu, 5: of}, hits: [{ch: 5, at: 0, v: 1}, {ch: 4, at: 0.5, v: 1}], sec: 1}), only = render({sr: SR, chans: {4: zu}, hits: [{ch: 4, at: 0.5, v: 1}], sec: 1}), ref = render({sr: SR, chans: {5: of}, hits: [{ch: 5, at: 0, v: 1}], sec: 1});
  const i0 = Math.round(0.504 * SR); let rest = 0; for (let i = i0; i < i0 + 480; i++) rest = Math.max(rest, Math.abs(r.L[i] - only.L[i])); const lv = M.rms(ref.L, Math.round(0.45 * SR), Math.round(0.5 * SR));
  check('ND3-02 HH Zu schließt Offen', M.db(rest / lv) <= -60, 'nach 4 ms ' + R(M.db(rest / lv)) + ' dB'); }
for (const p of MDX.progs.filter(q => q.mCat === 'Cy')) { const r = hit(p, 1, 6); const t = M.t60(r.L, SR), sp = msp(r.L, 0, 0.2); const tmin = p.mName === 'Splash' ? 0.6 : 1.2;
  check('ND3-02 Cy ' + p.mName, t >= tmin && sp >= 4000, 'T60 ' + R(t, 2) + ' s, M-SP ' + R(sp, 0) + ' Hz'); }
for (const p of MDX.progs.filter(q => (q.mCat === 'Pc' || q.mCat === 'Tu') && q.mName !== 'Shaker')) { const r = hit(p, 1, 1.5); const f0 = hz(p.mPit); const lo = lowPeak(r.L, p.mName === 'Handtrommel' ? 0.15 : 0.005, 1.2, 0.45 * SR);
  const c = lo ? 1200 * Math.log2(lo.f / f0) : NaN; check('ND3-02 ' + p.mCat + ' ' + p.mName, Math.abs(c) <= 10, 'tiefste starke Spitze ' + (lo ? R(lo.f) : '-') + ' Hz, ' + R(c, 1) + ' Cent zu PITCH'); }
for (const p of MDX.progs.filter(q => q.mCat === 'Be')) { const r = hit(p, 1, 2); const S = M.spectrum(r.L, SR, 0, Math.round(1.3 * SR)); const Pk = M.peaks(S, -40).slice(0, 10); const f1 = Pk.slice().sort((a, b) => a.f - b.f)[0];
  const inh = Pk.filter(q => { const h = q.f / f1.f; return Math.abs(h - Math.round(h)) > 0.02 * h; }).length; check('ND3-02 Be ' + p.mName, inh >= 2, inh + ' unharmonische Spitzen (von 10)'); }
{ const ef = MDX.progs.filter(q => q.mCat === 'Ef'); const bigB = ef.filter(q => Math.abs(MDX.bendHT(q.mBnd, 1)) >= 24).map(q => q.mName);
  check('ND3-02 Ef', bigB.length >= 3 && ef.some(q => q.mDty === 'SA' && q.mDst > 0) && ef.some(q => q.mDty === 'rn' && q.mDst > 0) && ef.some(q => /^F/.test(q.mWav) && q.mSpc >= 64), '|Bend| ≥ 24 HT: ' + bigB.join(', ') + ' · SA, rn, FM-FX-Zone vorhanden'); }
// ND3-03 levels
const lvOf = (cat, v) => MDX.progs.filter(q => q.mCat === cat).map(p => ({n: p.mName, pk: pkDb(hit(p, v, 1.5).L)}));
for (const [cat, lo, hi] of [['bd', -7, -5], ['Sn', -5, -1], ['HH', -14, -9]]) { const L = lvOf(cat, 1); check('ND3-03 Spitzen ' + cat, L.every(x => x.pk >= lo && x.pk <= hi), L.map(x => x.n + ' ' + R(x.pk)).join(', ') + ' dBFS (v 1,0)'); }
{ const L = ['Fell tief', 'Fell mitte', 'Fell hoch'].map(n => pkDb(hit(P(n), 1, 1.5).L)); check('ND3-03 Toms', Math.max(...L) - Math.min(...L) <= 2, L.map(x => R(x)).join(' / ') + ' dBFS'); }
for (const K of MDX.kits) {
  const chans = {}; MDX.ORDER.forEach((id, i) => { chans[i] = K.slots[id]; }); const step = 60 / 120 / 4, hits = [];
  const pat = [[0, 0, 4, 8, 12], [1, 4, 12], [4, 0, 2, 4, 6, 8, 10, 12], [5, 14], [3, 12], [2, 7], [6, 13], [7, 14], [8, 15], [9, 0], [10, 3, 11], [11, 1, 5, 9, 13]];
  for (let bar = 0; bar < 16; bar++) for (const [ch, ...st] of pat) for (const s of st) { if (ch === 9 && bar % 4) continue; if (ch >= 6 && ch <= 8 && bar % 4 !== 3) continue; hits.push({ch, at: (bar * 16 + s) * step, v: s % 4 === 0 ? 1 : 0.8}); }
  const r = render({sr: SR, chans, kit: Object.assign({}, K.md), hits, sec: 16 * 2 + 1}); let nan = 0, dc = 0; for (const v of r.L) { if (!Number.isFinite(v)) nan++; dc += v; }
  const dry = {}; for (const k in chans) dry[k] = Object.assign({}, chans[k], {mRvb: 0, mDly: 0}); const rd = render({sr: SR, chans: dry, kit: Object.assign({}, K.md), hits, sec: 33});
  const lu = lufs(rd.L, rd.R); check('ND3-03/04 Kit ' + K.name, Math.abs(lu + 18) <= 3 && nan === 0 && Math.abs(dc / r.L.length) <= 0.005, 'M-LUFS trocken ' + R(lu) + ' LUFS, NaN ' + nan + ', DC ' + (dc / r.L.length).toExponential(1));
}
// ND3-05 role
{ const ok = MDX.ORDER.every(id => { const p = MDX.roleProg(id); return p && p.mName === MDX.ROLE[id]; }); check('ND3-05 Pad-Start nach Rolle', ok, MDX.ORDER.map(id => id + '→' + MDX.ROLE[id]).join(', ')); }
// ND3-06 listening samples (WAV, 2 hits v 0.8 / 1.0 each) into the scratch dir given by --wav=DIR
const wd = (process.argv.find(a => a.startsWith('--wav=')) || '').slice(6);
if (wd) { fs.mkdirSync(wd, {recursive: true}); for (const p of MDX.progs) { const r = render({sr: SR, chans: {0: p}, hits: [{ch: 0, at: 0.02, v: 0.8}, {ch: 0, at: 1.2, v: 1}], sec: 3}); const n = r.L.length, b = Buffer.alloc(44 + n * 4);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 4, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22); b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) { b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(r.L[i] * 32767))), 44 + i * 4); b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(r.R[i] * 32767))), 46 + i * 4); }
  fs.writeFileSync(path.join(wd, p.mCat + '-' + p.mName.replace(/[^A-Za-z0-9äöüÄÖÜß-]/g, '_') + '.wav'), b); } console.log('WAV in ' + wd); }
const bad = res.filter(r => !r.ok); console.log('\n' + (res.length - bad.length) + '/' + res.length + ' bestanden' + (bad.length ? '\nFEHLT: ' + bad.map(b => b.id).join(', ') : ''));
