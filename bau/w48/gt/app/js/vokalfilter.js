// Gesangstrainer – vokalfilter.js: lässt vom Gesang nur die reinen Vokale übrig. Alles lokal, nichts wird gesendet.
//
// export function nurVokale(x, sr, opt={})          → Float32Array y (gleiche Länge wie x, mono)
// export function nurVokaleMitInfo(x, sr, opt={})   → {y, info:{rahmen, anteile, anteileNachher?, hop}}
// export function analysiere(x, sr, opt={})         → {klasse:Uint8Array, hop, anteile, energie}  (ohne Filtern)
// export function imHintergrund(x, sr, opt={})      → Promise<{y, info}> (Modul-Worker vokal-worker.js, sonst Hauptfaden)
// export const KLASSEN = ['vokal','still','stimmlos','zisch','plosiv','nasal']
//
// x: Float32Array (mono) oder [links, rechts] (Float32Array je Kanal). opt:
//   trennen:true   – Stereo-Mix: Mitte (L+R)/2 minus Seiten-Anteil, f0-geführte Obertonmaske, danach Vokal-Gate
//   absenkung:-40  – dB für alles, was kein Vokal ist (Expander mit Vokal-Seitenkette)
//   attack:0.010, release:0.040 (s), vorlauf:0.008 (s)  – weiche Pegelkurve, kein Knacken
//   maske:true, maskeBoden:-24 (dB zwischen den Obertönen), nasalSchwelle, zischSchwelle … (siehe STANDARD)
//   fortschritt:(prozent)=>{}
// Ablauf: Rahmen 10 ms / Fenster ≈ 21–23 ms → Merkmale (YIN-Periodizität aus ton.js, Flachheit, Bänder, Anstieg)
//   → Klasse je Rahmen → Glätten (Mindestlänge) → Pegelkurve; parallel STFT (≈ 43 ms, Hop 1/4) mit Maske nur auf
//   den Obertönen von f0 → Rauschen/Atem/Konsonantenreste zwischen den Obertönen werden „herabkristallisiert“.

import { tonhoehe } from './ton.js';

export const KLASSEN = ['vokal', 'still', 'stimmlos', 'zisch', 'plosiv', 'nasal'];

const STANDARD = {
  hop: 0.01,
  absenkung: -40, attack: 0.010, release: 0.040, vorlauf: 0.008,
  stilleUnterSpitze: 38,      // dB unter dem 95-%-Pegel = Stille
  sicherMin: 0.5,             // YIN-Sicherheit (Periodizität) für „stimmhaft“
  flachMax: -9,               // dB, spektrale Flachheit (100–5000 Hz); darüber = rauschig
  zischSchwelle: -11,         // dB Hochband (4–10 kHz) gegenüber Gesamt; darüber = Zischlaut
  anstiegPlosiv: 12,          // dB in 20 ms + rauschig/hell = Plosiv/Klick
  nasalTief: 0.85,             // Anteil der Energie < 500 Hz
  nasalF2: -20,               // dB Band 1–3,5 kHz gegenüber 80–500 Hz
  nasalMitte: -8,            // dB Band 0,5–1 kHz gegenüber 80–500 Hz (Antiformant der Nasale, „u“ hat hier F2)
  nasalAbfall: 4,  // abgestimmt an The Wall: Silben mit n/m-Ende 2× so oft „nasal“ wie andere             // dB unter dem örtlichen Vokal-Maximum (±150 ms)
  minVokal: 0.04, fuelleLuecke: 0.02,
  maske: true, maskeBoden: -24, maskeStimmlos: -10,
  seitenAnteil: 1.0,          // trennen: |Mitte| − β·|Seite|
};

// ---------------------------------------------------------------- FFT (radix 2, komplex, in place)
const plaene = new Map();
function plan(N) {
  let p = plaene.get(N); if (p) return p;
  const bits = Math.round(Math.log2(N)), rev = new Uint32Array(N);
  for (let i = 0; i < N; i++) { let r = 0; for (let b = 0; b < bits; b++) r |= ((i >> b) & 1) << (bits - 1 - b); rev[i] = r; }
  const cos = new Float64Array(N / 2), sin = new Float64Array(N / 2);
  for (let i = 0; i < N / 2; i++) { cos[i] = Math.cos(2 * Math.PI * i / N); sin[i] = Math.sin(2 * Math.PI * i / N); }
  const hann = new Float64Array(N); for (let i = 0; i < N; i++) hann[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / N);
  p = { N, rev, cos, sin, hann }; plaene.set(N, p); return p;
}
function fft(re, im, p, inv) {
  const N = p.N, rev = p.rev;
  for (let i = 0; i < N; i++) { const j = rev[i]; if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
  const sg = inv ? 1 : -1;
  for (let len = 2; len <= N; len <<= 1) {
    const half = len >> 1, step = N / len;
    for (let i = 0; i < N; i += len) {
      for (let j = 0, k = 0; j < half; j++, k += step) {
        const wr = p.cos[k], wi = sg * p.sin[k];
        const a = i + j, b = a + half;
        const xr = re[b] * wr - im[b] * wi, xi = re[b] * wi + im[b] * wr;
        re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
      }
    }
  }
}
const pow2 = (n) => 1 << Math.ceil(Math.log2(Math.max(2, n)));
const dB = (p) => 10 * Math.log10(p + 1e-20);

function kanaele(x) {
  if (x && x.length && (x[0] instanceof Float32Array || Array.isArray(x[0]))) return x.map((k) => (k instanceof Float32Array ? k : Float32Array.from(k)));
  if (x && x.kanaele) return kanaele(x.kanaele);
  return [x instanceof Float32Array ? x : Float32Array.from(x || [])];
}
function mono(ks) {
  if (ks.length === 1) return ks[0];
  const n = ks[0].length, y = new Float32Array(n), f = 1 / ks.length;
  for (const k of ks) for (let i = 0; i < n; i++) y[i] += k[i] * f;
  return y;
}

// ---------------------------------------------------------------- Merkmale je Rahmen
function merkmale(x, sr, o, spur) {
  const hopS = o.hop * sr, Na = pow2(0.021 * sr), P = plan(Na), w = P.hann;
  const K = Math.max(1, Math.floor(x.length / hopS) + 1);
  const re = new Float64Array(Na), im = new Float64Array(Na);
  const bin = (hz) => Math.min(Na / 2 - 1, Math.max(1, Math.round(hz * Na / sr)));
  const b80 = bin(80), b100 = bin(100), b300 = bin(300), b500 = bin(500), b1k = bin(1000), b35 = bin(3500), b4k = bin(4000), b5k = bin(5000), b8k = bin(8000), b10k = bin(10000);
  const F = {
    e: new Float32Array(K), flach: new Float32Array(K), hoch: new Float32Array(K), tief: new Float32Array(K),
    f2: new Float32Array(K), mitte: new Float32Array(K), hz: new Float32Array(K), sicher: new Float32Array(K), K, hopS,
  };
  for (let k = 0; k < K; k++) {
    const c = Math.round(k * hopS) - (Na >> 1);
    for (let i = 0; i < Na; i++) { const j = c + i; re[i] = j >= 0 && j < x.length ? x[j] * w[i] : 0; im[i] = 0; }
    fft(re, im, P, false);
    let eTot = 0, eTief = 0, eMitte = 0, eF2 = 0, eHoch = 0, e4k = 0, lg = 0, ar = 0, nF = 0;
    for (let b = b80; b <= b10k; b++) {
      const p = re[b] * re[b] + im[b] * im[b];
      if (b <= b8k) eTot += p;
      if (b <= b500) eTief += p; else if (b <= b1k) eMitte += p; else if (b <= b35) eF2 += p;
      if (b <= b4k) e4k += p; else eHoch += p;
      if (b >= b100 && b <= b5k) { lg += Math.log(p + 1e-20); ar += p; nF++; }
    }
    F.e[k] = dB(eTot / Na);
    F.flach[k] = nF ? 10 * (lg / nF - Math.log(ar / nF + 1e-20)) / Math.LN10 : 0;
    F.hoch[k] = dB(eHoch) - dB(eTot + eHoch);
    F.tief[k] = eTief / (e4k + 1e-20);
    F.f2[k] = dB(eF2) - dB(eTief);
    F.mitte[k] = dB(eMitte) - dB(eTief);
    const q = Math.min(spur.hz.length - 1, Math.round(k * o.hop / spur.hop));
    F.hz[k] = q >= 0 ? spur.hz[q] || 0 : 0; F.sicher[k] = q >= 0 ? spur.sicher[q] || 0 : 0;
    if (o.fortschritt && (k & 2047) === 0) o.fortschritt(30 + Math.round(k / K * 25));
  }
  void b300;
  return F;
}

function quantil(arr, q) {
  const a = Float32Array.from(arr).sort(); return a.length ? a[Math.min(a.length - 1, Math.floor(q * a.length))] : 0;
}

function klassifiziere(F, o) {
  const { K } = F, kl = new Uint8Array(K);
  const spitze = quantil(F.e, 0.95), still = spitze - o.stilleUnterSpitze;
  const r = Math.max(1, Math.round(0.15 / o.hop)), d2 = Math.max(1, Math.round(0.02 / o.hop));
  // örtliches Maximum stimmhafter Rahmen (für den Nasal-Abfall)
  const stimmh = (k) => F.hz[k] > 0 && F.sicher[k] >= o.sicherMin;
  const lokMax = new Float32Array(K).fill(-200);
  for (let k = 0; k < K; k++) {
    if (!stimmh(k)) continue;
    for (let j = Math.max(0, k - r); j <= Math.min(K - 1, k + r); j++) if (F.e[k] > lokMax[j]) lokMax[j] = F.e[k];
  }
  for (let k = 0; k < K; k++) {
    const e = F.e[k];
    if (e < still) { kl[k] = 1; continue; }
    const anstieg = k >= d2 ? e - F.e[k - d2] : 0;
    const rauschig = F.flach[k] > o.flachMax, hell = F.hoch[k] > o.zischSchwelle;
    if (anstieg > o.anstiegPlosiv && (rauschig || hell || !stimmh(k))) { kl[k] = 4; continue; }
    if (!stimmh(k)) { kl[k] = hell || rauschig ? 3 : 2; continue; }
    if (hell || rauschig) { kl[k] = 3; continue; }
    const nasal = F.tief[k] > o.nasalTief && F.f2[k] < o.nasalF2 && F.mitte[k] < o.nasalMitte && e < lokMax[k] - o.nasalAbfall;
    kl[k] = nasal ? 5 : 0;
  }
  // Plosiv-Burst: 2 Rahmen danach gehören dazu
  for (let k = K - 1; k >= 0; k--) if (kl[k] === 4) for (let j = k + 1; j <= Math.min(K - 1, k + 2); j++) if (kl[j] === 0) kl[j] = 4;
  // kurze Lücken im Vokal füllen, zu kurze Vokal-Inseln entfernen
  const luecke = Math.round(o.fuelleLuecke / o.hop), minV = Math.round(o.minVokal / o.hop);
  for (let k = 0; k < K;) {
    if (kl[k] === 0) { k++; continue; }
    let j = k; while (j < K && kl[j] !== 0) j++;
    if (k > 0 && j < K && j - k <= luecke && kl[k] !== 1 && kl[k] !== 4) for (let q = k; q < j; q++) kl[q] = 0;
    k = j;
  }
  for (let k = 0; k < K;) {
    if (kl[k] !== 0) { k++; continue; }
    let j = k; while (j < K && kl[j] === 0) j++;
    if (j - k < minV) for (let q = k; q < j; q++) kl[q] = 2;
    k = j;
  }
  return kl;
}

function anteileVon(kl, e) {
  const n = new Array(KLASSEN.length).fill(0), en = new Array(KLASSEN.length).fill(0);
  let summe = 0;
  for (let k = 0; k < kl.length; k++) { n[kl[k]]++; const p = Math.pow(10, e[k] / 10); en[kl[k]] += p; summe += p; }
  const out = {};
  KLASSEN.forEach((name, i) => { out[name] = { rahmen: n[i], anteil: kl.length ? n[i] / kl.length : 0, energie: summe ? en[i] / summe : 0 }; });
  return out;
}

// ---------------------------------------------------------------- Pegelkurve (Expander mit Vokal-Seitenkette)
function pegelKurve(kl, n, sr, o) {
  const hopS = o.hop * sr, boden = o.absenkung;
  const g = new Float32Array(n);
  const aA = Math.exp(-1 / (o.attack * sr)), aR = Math.exp(-1 / (o.release * sr));
  const vor = Math.round(o.vorlauf * sr);
  let z = boden;
  for (let i = 0; i < n; i++) {
    const k = Math.min(kl.length - 1, Math.floor((i + vor) / hopS + 0.5));
    const ziel = kl[k] === 0 ? 0 : boden;
    const a = ziel > z ? aA : aR;
    z = ziel + (z - ziel) * a;
    g[i] = Math.pow(10, z / 20);
  }
  return g;
}

// ---------------------------------------------------------------- STFT mit Obertonmaske (+ Mitte/Seite)
function obertonFilter(ks, sr, o, spur, istVokal) {
  const N = pow2(0.04 * sr), H = N >> 2, P = plan(N), w = P.hann, n = ks[0].length;
  const y = new Float32Array(n), norm = new Float32Array(n);
  const reM = new Float64Array(N), imM = new Float64Array(N), reS = new Float64Array(N), imS = new Float64Array(N);
  const boden = Math.pow(10, o.maskeBoden / 20), bodenSl = Math.pow(10, o.maskeStimmlos / 20);
  const stereo = o.trennen && ks.length >= 2, L = ks[0], R = ks[1] || ks[0];
  const df = sr / N, half = N >> 1, mask = new Float32Array(half + 1);
  const T = Math.ceil(n / H) + 2;
  for (let t = 0; t < T; t++) {
    const s0 = t * H - (N >> 1);
    for (let i = 0; i < N; i++) {
      const j = s0 + i, ok = j >= 0 && j < n;
      const l = ok ? L[j] : 0, r = ok ? R[j] : 0;
      reM[i] = (stereo ? (l + r) * 0.5 : l) * w[i]; imM[i] = 0;
      if (stereo) { reS[i] = (l - r) * 0.5 * w[i]; imS[i] = 0; }
    }
    fft(reM, imM, P, false);
    if (stereo) fft(reS, imS, P, false);
    const tm = (s0 + (N >> 1)) / sr;
    const q = Math.min(spur.hz.length - 1, Math.max(0, Math.round(tm / spur.hop)));
    const f0 = spur.hz[q] > 0 && spur.sicher[q] >= o.sicherMin ? spur.hz[q] : 0;
    const vok = istVokal(tm);
    for (let b = 0; b <= half; b++) {
      let m;
      if (!o.maske) m = 1;
      else if (!f0) m = bodenSl;
      else {
        const f = b * df, h = f / f0;
        if (h < 0.7) m = boden;
        else {
          const d = Math.abs(h - Math.round(h)) * f0;                 // Hz zum nächsten Oberton
          const bw = Math.min(0.42 * f0, Math.max(1.6 * df, 0.03 * f)); // halbe Breite: Fenster + Vibrato
          m = d < bw ? boden + (1 - boden) * Math.pow(Math.cos(Math.PI * 0.5 * d / bw), 2) : boden;
        }
        if (!vok) m = Math.max(m, bodenSl * 0.5);
      }
      mask[b] = m;
    }
    for (let b = 0; b <= half; b++) {
      let gain = mask[b];
      if (stereo) {
        const aM = Math.hypot(reM[b], imM[b]), aS = Math.hypot(reS[b], imS[b]);
        const rest = Math.max(0, aM - o.seitenAnteil * aS);
        gain *= aM > 1e-12 ? rest / aM : 0;
      }
      reM[b] *= gain; imM[b] *= gain;
      if (b > 0 && b < half) { reM[N - b] = reM[b]; imM[N - b] = -imM[b]; }
    }
    fft(reM, imM, P, true);
    for (let i = 0; i < N; i++) {
      const j = s0 + i; if (j < 0 || j >= n) continue;
      y[j] += reM[i] / N * w[i]; norm[j] += w[i] * w[i];
    }
    if (o.fortschritt && (t & 1023) === 0) o.fortschritt(55 + Math.round(t / T * 40));
  }
  for (let i = 0; i < n; i++) y[i] = norm[i] > 1e-6 ? y[i] / norm[i] : 0;
  return y;
}

// ---------------------------------------------------------------- öffentlich
function vorbereiten(x, sr, opt) {
  const o = { ...STANDARD, ...opt };
  const ks = kanaele(x);
  const m = mono(ks);
  if (o.fortschritt) o.fortschritt(2);
  const spur = tonhoehe(m, sr, { hop: o.hop, fmin: o.fmin ?? 65, fmax: o.fmax ?? 1100 });
  if (o.fortschritt) o.fortschritt(30);
  const F = merkmale(m, sr, o, spur);
  const kl = klassifiziere(F, o);
  return { o, ks, m, spur, F, kl };
}

export function analysiere(x, sr, opt = {}) {
  const { o, F, kl } = vorbereiten(x, sr, opt);
  return { klasse: kl, hop: o.hop, anteile: anteileVon(kl, F.e), energie: F.e, hz: F.hz };
}

export function nurVokaleMitInfo(x, sr, opt = {}) {
  if (!(sr > 0)) throw new Error('Abtastrate fehlt');
  const { o, ks, spur, F, kl } = vorbereiten(x, sr, opt);
  const n = ks[0].length;
  const istVokal = (t) => kl[Math.min(kl.length - 1, Math.max(0, Math.round(t / o.hop)))] === 0;
  const z = obertonFilter(ks, sr, o, spur, istVokal);
  const g = pegelKurve(kl, n, sr, o);
  let spitze = 0;
  for (let i = 0; i < n; i++) { z[i] *= g[i]; const a = Math.abs(z[i]); if (a > spitze) spitze = a; }
  if (spitze > 0.95) { const f = 0.95 / spitze; for (let i = 0; i < n; i++) z[i] *= f; }
  if (o.fortschritt) o.fortschritt(100);
  const info = { hop: o.hop, rahmen: kl.length, anteile: anteileVon(kl, F.e), klasse: opt.mitKlassen ? kl : undefined };
  return { y: z, info };
}

export function nurVokale(x, sr, opt = {}) { return nurVokaleMitInfo(x, sr, opt).y; }

// ---------------------------------------------------------------- im Hintergrund (Worker)
let arbeiter = null, nr = 0;
const offen = new Map();
export function imHintergrund(x, sr, opt = {}) {
  const o = { ...opt }; delete o.fortschritt;
  const lokal = () => Promise.resolve().then(() => nurVokaleMitInfo(x, sr, opt));
  if (typeof Worker === 'undefined' || typeof document === 'undefined') return lokal();
  try {
    if (!arbeiter) {
      arbeiter = new Worker(new URL('./vokal-worker.js', import.meta.url), { type: 'module' });
      arbeiter.onmessage = (e) => {
        const p = offen.get(e.data.id); if (!p) return;
        if (e.data.stand != null) { if (p.fortschritt) p.fortschritt(e.data.stand); return; }
        offen.delete(e.data.id);
        e.data.ok ? p.res({ y: e.data.y, info: e.data.info }) : p.rej(new Error(e.data.fehler));
      };
      arbeiter.onerror = () => { for (const [, p] of offen) p.lokal(); offen.clear(); arbeiter = null; };
    }
    return new Promise((res, rej) => {
      const id = ++nr;
      offen.set(id, { res, rej, fortschritt: opt.fortschritt, lokal: () => lokal().then(res, rej) });
      arbeiter.postMessage({ id, x, sr, opt: o });
    });
  } catch (e) { return lokal(); }
}
