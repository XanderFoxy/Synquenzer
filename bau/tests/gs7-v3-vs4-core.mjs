// VS4 Abnahme, Teil Kern in der App: N7V-21 … N7V-25 mit dem in die App eingebetteten Kern (Worker-Weg der App),
// Bitgleichheit gegen das getestete Modul vs-dsp/clean.mjs. node v3-vs4-core.mjs
import {open} from './v3-vs3-h.mjs';
import * as T from '../vs-dsp/test-signals.mjs';
import {clean, srcText} from '../vs-dsp/clean.mjs';
const APP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const sr = 48000;
const b64 = x => Buffer.from(new Float32Array(x).buffer).toString('base64');
const unb64 = s => { const b = Buffer.from(s, 'base64'); return new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4); };
function scene(dur, {seed = 3, delay = 0.08, echoDb = 0, snr = 50, calib = 0, sat = false} = {}) {
  const S = T.song(sr, dur, {seed});
  const ref = T.playback(sr, dur, {calib, seed: seed + 1});
  let sp = T.hp1(ref, sr, 250); if (sat) sp = sp.map(v => Math.tanh(2.5 * v) / 2.5);
  const echo = T.convolve(sp, T.roomIR(sr, delay, 0.3, {seed: seed + 2}));
  const g = T.rms(S.x) / T.rms(echo) * Math.pow(10, echoDb / 20); for (let i = 0; i < echo.length; i++) echo[i] *= g;
  const nz = T.noise(sr, dur, T.rms(S.x) * Math.pow(10, -snr / 20), seed + 3);
  const mic = new Float32Array(S.x.length); for (let i = 0; i < mic.length; i++) mic[i] = S.x[i] + echo[i] + nz[i];
  const pause = new Uint8Array(mic.length);
  for (const [a, b] of S.silences) for (let i = Math.round((a + 0.1) * sr); i < Math.min(mic.length, Math.round((b - 0.05) * sr)); i++) pause[i] = 1;
  return {S, ref, echo, nz, mic, pause};
}
const pw = (z, m, a = 0) => { let s = 0, c = 0; for (let i = a; i < z.length; i++) if (m[i]) { s += z[i] * z[i]; c++; } return s / Math.max(1, c); };
const sdr = (v, o, a = 0) => { let s = 0, e = 0; for (let i = a; i < o.length; i++) { s += v[i] * v[i]; e += (o[i] - v[i]) ** 2; } return T.db(s / e); };
// Grundton je 40-ms-Fenster (normierte Autokorrelation, erstes Maximum ≥ 0,9)
function f0w(x, s, W) {
  const tMin = Math.floor(sr / 600), tMax = Math.ceil(sr / 80); let e0 = 0; for (let i = 0; i < W; i++) e0 += x[s + i] * x[s + i];
  const r = new Float64Array(tMax + 2);
  for (let t = tMin - 1; t <= tMax + 1; t++) { let c = 0, e1 = 0; for (let i = 0; i < W; i += 2) { c += x[s + i] * x[s + i + t]; e1 += x[s + i + t] * x[s + i + t]; } r[t] = c / Math.sqrt(e0 * e1 / 2 + 1e-20); }
  let bt = tMin; for (let t = tMin; t <= tMax; t++) if (r[t] > r[bt]) bt = t;
  for (let t = tMin; t <= tMax; t++) if (r[t] >= 0.9 * r[bt] && r[t] >= r[t - 1] && r[t] >= r[t + 1]) { bt = t; break; }
  return sr / bt;
}
// RPA: Anteil der Fenster in gesungenen Noten, deren Grundton im Ergebnis ≤ 50 Cent vom Grundton der reinen Stimme liegt
function rpa(S, out, a0) {
  const W = Math.round(0.04 * sr); let n = 0, k = 0;
  for (const nt of S.notes.filter(q => !q.legato && q.t > a0 && q.d > 0.2)) {
    for (let s = Math.round((nt.t + 0.04) * sr); s + W + 600 < Math.round((nt.t + nt.d - 0.04) * sr); s += Math.round(0.03 * sr)) {
      const ft = f0w(S.x, s, W), fo = f0w(out, s, W); n++; if (Math.abs(1200 * Math.log2(fo / ft)) <= 50) k++;
    }
  }
  return {rpa: k / Math.max(1, n), n};
}
const H = await open({file: APP}), p = H.p;
await p.evaluate(() => SYNQUENZER.version);
async function inApp(sc, o) {
  const r = await p.evaluate(([m, rf, sr, o]) => SYNQUENZER.clCore(m, rf, sr, o), [b64(sc.mic), sc.ref ? b64(sc.ref) : null, sr, o]);
  return {y: unb64(r.y), info: r.info, how: r.how};
}
const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
const maxd = (a, b) => { let d = a.length === b.length ? 0 : Infinity; for (let i = 0; i < a.length && d < Infinity; i++) d = Math.max(d, Math.abs(a[i] - b[i])); return d; };
// das getestete Modul (srcText) im selben Browser auf dem Hauptfaden
async function modInPage(sc, o) {
  const y = await p.evaluate(([src, m, r, o]) => { const dec = b => { if (!b) return null; const s = atob(b), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return new Float32Array(u.buffer); };
    const y = (0, eval)(src).clean(dec(m), dec(r), 48000, o); const u = new Uint8Array(y.buffer); let s = ''; for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); return btoa(s); }, [srcText(), b64(sc.mic), sc.ref ? b64(sc.ref) : null, o]);
  return unb64(y);
}

// N7V-21: Übersprechen 0 dB linear, mit Einmessen (2 s Rauschen am Anfang)
{
  const sc = scene(24, {echoDb: 0, calib: 2, seed: 9});
  const r = await inApp(sc, {way: 'notes'}), ref = await modInPage(sc, {way: 'notes'}), nd = clean(sc.mic, sc.ref, sr, {way: 'notes'});
  ok(r.how === 'worker' && same(r.y, ref), `N7V-21: App-Kern im Worker (${r.how}) bitgleich zum getesteten Modul (srcText) im selben Browser`);
  ok(maxd(r.y, nd) < 1e-6, `App-Kern gegen Node-Lauf des Moduls: max. Abweichung ${maxd(r.y, nd).toExponential(2)} (nur Rundung der Math-Funktionen der JS-Maschine)`);
  const a0 = Math.round(2.5 * sr), S = sdr(sc.S.x, r.y, a0), red = T.db(pw(sc.echo, sc.pause, a0) / pw(r.y, sc.pause, a0)), R = rpa(sc.S, r.y, 2.5), R0 = rpa(sc.S, sc.mic, 2.5);
  ok(S >= 15, `N7V-21: SDR ${S.toFixed(1)} dB (≥ 15)`);
  ok(red >= 15, `N7V-21: Minderung in Pausen ${red.toFixed(1)} dB (≥ 15)`);
  ok(R.rpa >= 0.99, `N7V-21: RPA ${(100 * R.rpa).toFixed(1)} % über ${R.n} Fenster (≥ 99 %; ohne Säubern ${(100 * R0.rpa).toFixed(1)} %)`);
  ok(r.info.way === '1E', `N7V-25: Noten-Weg meldet „${r.info.way}“`);
}
// N7V-22: +6 dB mit Sättigung (Noten-Weg; Noten-F über die App-Kette in v3-vs4-accept B)
{
  const sc = scene(24, {echoDb: 6, sat: true, seed: 8});
  const r = await inApp(sc, {way: 'notes'}), S = sdr(sc.S.x, r.y), R = rpa(sc.S, r.y, 0.5);
  ok(S >= 10, `N7V-22: +6 dB tanh: SDR ${S.toFixed(1)} dB (≥ 10)`);
  console.log(`  RPA ${(100 * R.rpa).toFixed(1)} % (${R.n} Fenster), Rechenzeit ${r.info.ms} ms für 24 s`);
  const h = await inApp(sc, {amount: 1}); const Sh = sdr(sc.S.x, h.y), redh = T.db(pw(sc.echo, sc.pause) / pw(h.y, sc.pause));
  ok(h.info.way === '1E+NF+W+HP' && redh >= 15, `Hör-Weg (Säubern 100 %): Weg „${h.info.way}“, Minderung in Pausen ${redh.toFixed(1)} dB, SDR ${Sh.toFixed(1)} dB, Hinweis „${h.info.hint}“`);
}
// N7V-23: kein Gate – ohne Übersprechen, SNR 40, SÄUBERN 100 %
{
  const S0 = T.song(sr, 24, {seed: 13}), nz = T.noise(sr, 24, T.rms(S0.x) * 0.01, 14), mic = new Float32Array(S0.x.length);
  for (let i = 0; i < mic.length; i++) mic[i] = S0.x[i] + nz[i];
  const r = await inApp({mic, ref: null}, {amount: 1}), ref = await modInPage({mic, ref: null}, {amount: 1});
  ok(same(r.y, ref), 'N7V-23: ohne Referenz bitgleich zum Modul');
  const S = sdr(S0.x, r.y);
  let worst = 0;
  for (const nt of S0.notes.filter(q => !q.legato)) {
    const a = Math.round((nt.t + 0.03) * sr), b = Math.round((nt.t + nt.d - 0.05) * sr), lv = T.rms(S0.x, a, b), w = Math.round(0.01 * sr); let run = 0;
    for (let s = a; s + w <= b; s += w) { if (T.rms(r.y, s, s + w) < lv * 0.01) { run += 10; worst = Math.max(worst, run); } else run = 0; }
  }
  ok(S >= 20, `N7V-23: SDR gegen die Original-Stimme ${S.toFixed(1)} dB (≥ 20)`);
  ok(worst <= 50, `N7V-23: längster Abschnitt < −40 dB in gesungenen Noten ${worst} ms (≤ 50)`);
  const nr = T.db(T.rms(nz, 0, Math.round(0.5 * sr)) ** 2 / T.rms(r.y, 0, Math.round(0.5 * sr)) ** 2);
  console.log(`  Rauschen vor dem Einsatz −${nr.toFixed(1)} dB`);
}
// N7V-24: SÄUBERN 0 % = bitgleich (Kern); der Take-Weg spielt bei 0 % den Roh-Puffer selbst (v3-vs4-accept)
{
  const sc = scene(4, {seed: 30});
  const r = await inApp(sc, {amount: 0});
  ok(same(r.y, sc.mic), 'N7V-24: SÄUBERN 0 % → bitgleiche Kopie');
}
ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 3)));
await H.br.close();
console.log(fail ? `FEHLER: ${fail}` : 'ALLE OK');
process.exit(fail ? 1 : 0);
