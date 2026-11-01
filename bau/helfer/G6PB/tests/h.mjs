// G6+b Test-Rahmen: App öffnen, synthetischen Gesang einspielen, Chor v2 setzen, Messwerkzeuge
import {createRequire} from 'module';
const {chromium} = createRequire(import.meta.url)(process.env.PW || 'playwright');
import path from 'path';
import {fileURLToPath} from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
export const APP = path.resolve(HERE, '../index.html');
export async function open(o = {}) {
  const br = o.br || await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await br.newContext({viewport: o.viewport || {width: 390, height: 844}});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + (o.file || APP)); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version);
  await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
  await p.waitForTimeout(300);
  return {br, ctx, p, errs};
}
// Gesang: Noten (MIDI, Schläge) bei bpm; Obertöne mit Vokal-Hülle, Vibrato ±vib ct 5,5 Hz; zwischen Noten „s“ (Rauschen 4–9 kHz)
export function sing(notes, o = {}) {
  const sr = o.sr || 48000, bpm = o.bpm || 120, sp = 60 / bpm, len = Math.ceil((o.beats || 16) * sp * sr), y = new Float32Array(len);
  let seed = o.seed || 7; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff * 2 - 1; };
  const vib = o.vib == null ? 25 : o.vib, F1 = 700, F2 = 1200, env = f => 1 / (1 + ((f - F1) / 300) ** 2) + 0.5 / (1 + ((f - F2) / 400) ** 2) + 0.05;
  for (const n of notes) {
    const a = Math.round((n.b * sp + 0.06) * sr), L = Math.round((n.d * sp - 0.12) * sr), f0 = 440 * 2 ** ((n.m - 69) / 12);
    let ph = 0; const H = Math.min(40, Math.floor(8000 / f0));
    const amp = []; for (let h = 1; h <= H; h++) amp.push(env(h * f0) / Math.sqrt(h));
    for (let i = 0; i < L; i++) {
      const t = i / sr, f = f0 * 2 ** (vib * Math.sin(2 * Math.PI * 5.5 * t) / 1200);
      ph += 2 * Math.PI * f / sr;
      let s = 0; for (let h = 1; h <= H; h++) s += amp[h - 1] * Math.sin(h * ph);
      const e = Math.min(1, i / (0.02 * sr), (L - i) / (0.03 * sr));
      y[a + i] += 0.12 * e * s;
    }
    if (n.s) {   // Zischlaut vor der Note
      const b = a - Math.round(0.055 * sr), M = Math.round(0.05 * sr); let x1 = 0, x2 = 0;
      for (let i = 0; i < M; i++) { const w = rnd(); const hp = w - 1.6 * x1 + 0.7 * x2; x2 = x1; x1 = w; const e = Math.sin(Math.PI * i / M); if (b + i >= 0) y[b + i] += 0.03 * e * hp; }
    }
  }
  return y;
}
// Melodie C-Dur, 2 Schläge je Note
export const MEL = [60, 62, 64, 65, 67, 69, 71, 72, 71, 69, 67, 65, 64, 62, 60, 64];
export function melody(beats, o = {}) { const N = []; const step = o.step || 2; for (let b = 0, k = 0; b < beats; b += step, k++) N.push({b, d: step, m: (o.mel || MEL)[k % (o.mel || MEL).length], s: k % 3 === 1}); return N; }
export async function inject(p, y, o = {}) {
  const pcm = Array.from(y, v => Math.max(-32768, Math.min(32767, Math.round(v * 32767))));
  const r = await p.evaluate(async ([pcm, o]) => { const r = await SYNQUENZER.tkInject({pcm, sr: o.sr || 48000, scene: o.scene || 0, len: o.bars || 4}); return r; }, [pcm, o]);
  await p.waitForFunction(id => SYNQUENZER.tkInfo && SYNQUENZER.tkBufRange(id, 0, 1) != null, r.id, {timeout: 20000});
  return r;
}
// Chor v2 (Daten wie Spec §2.2) mit Stimmen-Liste
export const chor = (voices, grp) => ({v: 2, style: null, grp: Object.assign({below: 9, hp: 0, mid: 0, midF: 1000, air: 0, sib: 0, rev: 0, pre: 0, dly: 0}, grp || {}),
  voices: voices.map((v, i) => Object.assign({lane: 'c' + (i + 1), rule: 'uni', n: [], db: 0, pan: 0, w: 0, dbl: [{ms: 0, ct: 0, p: 0}]}, v))});
// NSDF-Tonhöhe (Hz) im Bereich [a, b) eines Signals
export function nsdf(x, sr, a, b, fmin = 70, fmax = 1200) {
  const s = x.subarray(a, b), N = s.length, tmin = Math.floor(sr / fmax), tmax = Math.ceil(sr / fmin);
  let best = 0, bt = 0; const r = new Float64Array(tmax + 2);
  for (let t = tmin; t <= tmax; t++) { let ac = 0, m = 0; for (let i = 0; i + t < N; i++) { ac += s[i] * s[i + t]; m += s[i] * s[i] + s[i + t] * s[i + t]; } r[t] = m > 0 ? 2 * ac / m : 0; }
  let mx = 0; for (let t = tmin; t <= tmax; t++) if (r[t] > mx) mx = r[t];
  for (let t = tmin + 1; t < tmax; t++) if (r[t] > 0.9 * mx && r[t] >= r[t - 1] && r[t] >= r[t + 1]) { bt = t; break; }
  if (!bt) return 0;
  const y0 = r[bt - 1], y1 = r[bt], y2 = r[bt + 1], den = y0 - 2 * y1 + y2, d = den ? 0.5 * (y0 - y2) / den : 0;
  return sr / (bt + d);
}
export const cents = (f, m) => 1200 * Math.log2(f / (440 * 2 ** ((m - 69) / 12)));
export const median = a => { const b = [...a].sort((x, y) => x - y); return b.length ? b[b.length >> 1] : NaN; };
export function report(name, rows) { let ok = true; for (const r of rows) { console.log((r.ok ? '✓' : '✗') + ' ' + r.id + ' ' + r.msg); if (!r.ok) ok = false; } console.log(name + ': ' + (ok ? 'ALLE OK' : 'FEHLER')); return ok; }
