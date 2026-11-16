// Mischpult 0.1 – analyse.js: Rolle aus Name und Signal, Spur-Analyse in Stücken (Durchlauf 1), Maskierung,
// Entscheidung = Plan je Spur (reine Funktion). Regeln und Zahlen aus regeln.js (= methodik.json), Eingriff-Stufen aus KONZEPT A.4.
// Eigene Umsetzung. Signal-Regeln angelehnt an classify/feats (Synquenzer 4.76.1, index.html 66608–66674), ohne Noten.
import { R } from './regeln.js';
import { Lautheit, ClipZaehler, Korrelation, Bq1, bqKoeff, fft, hann, bandMatrix, db, pdb, zahl } from './messen.js';
import { lesBereich } from './wav.js';

export const ROLLEN = R.rollen.liste; // kick snare hats bass pad lead vocal chor fx drumbus sonstiges
export const ROLLEN_ANZEIGE = { kick: 'Kick', snare: 'Snare/Clap', hats: 'Hi-Hats/Perkussion', bass: 'Bass', drumbus: 'Drums (alle zusammen)', lead: 'Lead/Sequenz', pad: 'Fläche', vocal: 'Gesang', chor: 'Chor', fx: 'Effekte', sonstiges: 'Sonstiges' };
export const GESANG = new Set(['vocal', 'chor']);
const TERZ = R.messung.spektrum.terzMittenHz, OKT = R.messung.spektrum.oktavMittenHz;
const FFT_N = R.messung.spektrum.fftPunkte, HOP = FFT_N * R.messung.spektrum.schritt / FFT_N * 2; // jeder 2. Rahmen

// Eingriff-Stufen (KONZEPT A.4, K)
export const STUFEN = {
  sanft: { anteil: 0.25, grenze: 1.5, grenzeVocal: 1, maskAnteil: 0.4, maskMedian: 4, maskStaerke: 0.3, maskMax: 3, maskN: 1, lowCut: 'subsonic', grPos: 0, duck: 2, dynEq: -1.5, hoehen: 0, raum: null, klang: [0.4, 2], glue: 1, druck: -1 },
  mittel: { anteil: 0.5, grenze: 3, grenzeVocal: 2, maskAnteil: 0.3, maskMedian: 3, maskStaerke: 0.5, maskMax: 4.5, maskN: 2, lowCut: 'regel', grPos: 0.5, duck: 4, dynEq: -3, hoehen: -1, raum: -16, klang: [0.6, 3], glue: 2, druck: 0 },
  kraeftig: { anteil: 0.75, grenze: 3, grenzeVocal: 2, maskAnteil: 0.25, maskMedian: 3, maskStaerke: 0.7, maskMax: 6, maskN: 3, lowCut: 'regel', grPos: 1, duck: 6, dynEq: -4, hoehen: -2, raum: -14, klang: [0.8, 3], glue: 3, druck: 1 },
};
export const ZIELE = {
  streaming: { name: 'streaming', lufs: -14, tp_dbtp: -1.0, softclip: false, subsonicHz: 20 },
  laut: { name: 'laut', lufs: -9, tp_dbtp: -2.0, softclip: true, subsonicHz: 25 },
};

// ---------- Rolle aus dem Namen ----------
const RX = Object.fromEntries(Object.entries(R.rollen.dateinameRegex).map(([k, v]) => [k, new RegExp(v, 'i')]));
/** rolleAusName('Kick_01.wav') → {rolle:'kick', sicher:true, quelle:'name'} | null */
export function rolleAusName(name) {
  const n = String(name).replace(/\.[a-z0-9]{2,5}$/i, '').replace(/[_\-.]+/g, ' ').toLowerCase();
  for (const r of R.rollen.dateinameReihenfolge) if (RX[r].test(n)) return { rolle: r, sicher: true, quelle: 'name' };
  return null;
}

// ---------- Rolle aus dem Signal ----------
const inR = (x, [a, b]) => x >= a && x <= b;
/** rolleAusSignal(merkmale) → {rolle, sicher:false, quelle:'signal', erfuellung} */
export function rolleAusSignal(m) {
  const S = R.rollen.signalRegeln, t = [];
  const pr = (rolle, conds) => { const ok = conds.filter(Boolean).length; t.push({ rolle, erf: ok / conds.length }); };
  pr('kick', [m.anteilUnter120 >= S.kick.anteilUnter120Min, m.crest100 >= S.kick.crest100Min, inR(m.einsaetzeProS, S.kick.einsaetzeProS), m.centroid <= S.kick.centroidMaxHz, m.korr >= S.kick.korrelationMin]);
  pr('bass', [m.anteilUnter250 >= S.bass.anteilUnter250Min, m.crest100 <= S.bass.crest100Max, m.flatness <= S.bass.flatnessMax, m.korr >= S.bass.korrelationMin]);
  pr('snare', [inR(m.centroid, S.snare.centroidHz), m.crest100 >= S.snare.crest100Min, inR(m.einsaetzeProS, S.snare.einsaetzeProS), m.anteilUnter120 <= S.snare.anteilUnter120Max]);
  pr('hats', [m.centroid >= S.hats.centroidMinHz, m.anteilUnter500 <= S.hats.anteilUnter500Max, m.einsaetzeProS >= S.hats.einsaetzeProSMin, m.crest100 >= S.hats.crest100Min]);
  pr('pad', [m.crest100 <= S.pad.crest100Max, m.aktivitaet >= S.pad.aktivitaetMin, m.einsaetzeProS <= S.pad.einsaetzeProSMax, m.korr <= S.pad.korrelationMax, inR(m.centroid, S.pad.centroidHz)]);
  pr('lead', [m.tonal, inR(m.crest100, S.lead.crest100), inR(m.centroid, S.lead.centroidHz), m.anteilUnter120 <= S.lead.anteilUnter120Max]);
  pr('vocal', [m.tonal, m.korr >= S.vocal.korrelationMin, inR(m.aktivitaet, S.vocal.aktivitaet), m.anteilUnter120 <= S.vocal.anteilUnter120Max]);
  pr('fx', [m.aktivitaet <= S.fx.aktivitaetMax || m.flatness >= S.fx.oderFlatnessMin]);
  t.sort((a, b) => b.erf - a.erf);
  const best = t[0];
  if (best.erf >= R.rollen.signalMindestErfuellung && !(best.rolle === 'fx' && t[1].erf >= 0.7)) return { rolle: best.rolle, sicher: false, quelle: 'signal', erfuellung: +best.erf.toFixed(2) };
  return { rolle: 'sonstiges', sicher: false, quelle: 'signal', erfuellung: +best.erf.toFixed(2) };
}

/** Rolle vorschlagen: Name zuerst, sonst Signal (Merkmale aus Schnellblick oder Durchlauf 1). */
export function rolleVorschlag(name, merkmale) {
  const n = rolleAusName(name);
  if (n) return n;
  return merkmale ? rolleAusSignal(merkmale) : { rolle: 'sonstiges', sicher: false, quelle: 'keine' };
}

// ---------- Spur-Analyse in Stücken ----------
/**
 * new SpurAnalyse(sr, frames) ; .feed(pos, L, R) lückenlos ; .ende() → merkmale
 * Volle Rate Stereo: K-Energie 100 ms, Spitze, Clip-Folgen, Korrelation (gesamt, < 150 Hz).
 * Mitte: FFT 2048 Hann, jeder 2. Rahmen → 30 Terzbänder je Rahmen (≈ 85 ms Abstand), LTAS je Bin.
 * Hüllkurven 5 ms (Mitte, Tiefband < 120 Hz) → Einsätze, Gesangs-Aktivität, Hall-Schätzung.
 */
export class SpurAnalyse {
  constructor(sr, frames = 0) {
    this.sr = sr; this.frames = frames; this.n = 0;
    this.lu = new Lautheit(sr); this.clip = new ClipZaehler(); this.korr = new Korrelation(sr);
    this.buf = new Float64Array(FFT_N); this.re = new Float64Array(FFT_N); this.im = new Float64Array(FFT_N);
    this.binSum = new Float64Array(FFT_N / 2 + 1); this.mT = bandMatrix(TERZ, 1 / 3, FFT_N, sr);
    this.terzFrames = []; this.frameE = [];
    const kLp = bqKoeff('lp', 120, sr); this.lp1 = new Bq1(kLp); this.lp2 = new Bq1(kLp);
    this.e5n = Math.round(sr * 0.005); this.e5a = 0; this.e5b = 0; this.e5c = 0; this.e5p = 0; this.e5t = 0; this.env = []; this.envTief = []; this.pk5 = []; this.pkTief = [];
    this.b100 = Math.round(sr / 10); this.pkB = 0; this.qB = 0; this.cB = 0; this.blkPk = []; this.blkQ = [];
    this.uebN = frames > 0 ? Math.max(1, Math.ceil(frames / 2000)) : 0; this.ueb = []; this.uebM = 0; this.uebC = 0;
  }
  feed(pos, L, R, n = L.length) {
    if (pos !== this.n) throw new Error('SpurAnalyse: Stücke nicht lückenlos');
    this.lu.feed(L, R, n); this.clip.feed(L, R, n); this.korr.feed(L, R, n);
    const buf = this.buf, hopMask = HOP;
    for (let i = 0; i < n; i++) {
      const l = L[i], r = R[i], m = 0.5 * (l + r), g = this.n + i, ph = g % hopMask;
      if (ph < FFT_N) { buf[ph] = m; if (ph === FFT_N - 1) this._rahmen(); }
      const t = this.lp2.x(this.lp1.x(m));
      this.e5a += m * m; this.e5b += t * t; const at = t < 0 ? -t : t; if (at > this.e5t) this.e5t = at;
      const a = Math.max(Math.abs(l), Math.abs(r)); if (a > this.e5p) this.e5p = a;
      if (++this.e5c === this.e5n) { this.env.push(pdb(this.e5a / this.e5n)); this.envTief.push(pdb(this.e5b / this.e5n)); this.pk5.push(this.e5p); this.pkTief.push(this.e5t); this.e5a = this.e5b = 0; this.e5c = 0; this.e5p = 0; this.e5t = 0; } if (a > this.pkB) this.pkB = a; this.qB += 0.5 * (l * l + r * r);
      if (++this.cB === this.b100) { this.blkPk.push(this.pkB); this.blkQ.push(this.qB / this.b100); this.pkB = 0; this.qB = 0; this.cB = 0; }
      if (this.uebN) { if (a > this.uebM) this.uebM = a; if (++this.uebC === this.uebN) { this.ueb.push(this.uebM); this.uebM = 0; this.uebC = 0; } }
    }
    this.n += n;
  }
  _rahmen() {
    const re = this.re, im = this.im, w = hann(FFT_N); let e = 0;
    for (let i = 0; i < FFT_N; i++) { re[i] = this.buf[i] * w[i]; im[i] = 0; e += this.buf[i] * this.buf[i]; }
    fft(re, im);
    const nb = FFT_N / 2 + 1, P = new Float64Array(nb);
    for (let k = 0; k < nb; k++) { P[k] = re[k] * re[k] + im[k] * im[k]; this.binSum[k] += P[k]; }
    const T = new Float32Array(TERZ.length);
    this.mT.forEach((row, b) => { let s = 0; for (let j = 0; j < row.length; j += 2) s += P[row[j]] * row[j + 1]; T[b] = pdb(s); });
    this.terzFrames.push(T); this.frameE.push(e / FFT_N);
  }
  ende() {
    const sr = this.sr, lu = this.lu, I = lu.integriert(), B = lu.bloecke(4), Bl = Array.from(B, Lautheit.lufs);
    const maxB = Bl.length ? maxA(Bl) : -Infinity, schw = maxB + R.messung.dynamik.aktivitaet.schwelleRelStemMaxLu;
    const aktiv = Bl.length ? Bl.filter(x => x > schw && x > -70).length / Bl.length : 0;
    // Crest 100 ms / 1 s über aktive Blöcke (Median)
    const qMax = maxA(this.blkQ, 1e-20), crest = [], crest1 = [];
    for (let j = 0; j < this.blkQ.length; j++) if (this.blkQ[j] > qMax * 1e-3) crest.push(db(this.blkPk[j]) - pdb(this.blkQ[j]));
    for (let j = 0; j + 10 <= this.blkQ.length; j += 10) { let p = 0, q = 0; for (let k = j; k < j + 10; k++) { p = Math.max(p, this.blkPk[k]); q += this.blkQ[k]; } if (q / 10 > qMax * 1e-3) crest1.push(db(p) - pdb(q / 10)); }
    const med = a => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
    // LTAS
    const nb = FFT_N / 2 + 1, bw = sr / FFT_N, P = this.binSum; let tot = 0, cen = 0, u60 = 0, u120 = 0, u250 = 0, u500 = 0, o5k = 0, lsum = 0, nfl = 0;
    for (let k = 1; k < nb; k++) { const f = k * bw, p = P[k]; tot += p; cen += p * f; if (f < 60) u60 += p; if (f < 120) u120 += p; if (f < 250) u250 += p; if (f < 500) u500 += p; if (f > 5000) o5k += p; if (f > 40 && f < 16000) { lsum += Math.log(p + 1e-30); nfl++; } }
    let am = 0; for (let k = 1; k < nb; k++) { const f = k * bw; if (f > 40 && f < 16000) am += P[k]; }
    const flatness = am > 0 ? Math.exp(lsum / nfl) / (am / nfl) : 1;
    let roll = 0, acc = 0; for (let k = 1; k < nb; k++) { acc += P[k]; if (acc >= 0.85 * tot) { roll = k * bw; break; } }
    const fe = this.frameE, feMax = fe.length ? maxA(fe) : 0, nAkt = Math.max(1, fe.filter(x => x > feMax * 1e-3).length);
    const ltasTerz = TERZ.map((_, b) => { let s = 0; for (const T of this.terzFrames) s += Math.pow(10, T[b] / 10); return pdb(s / nAkt); });
    const ltasOkt = OKT.map((_, o) => pdb(Math.pow(10, ltasTerz[3 * o] / 10) + Math.pow(10, ltasTerz[3 * o + 1] / 10) + Math.pow(10, ltasTerz[3 * o + 2] / 10)));
    const ltMax = maxA(ltasTerz);
    let fUnten = TERZ[0]; for (let b = 0; b < TERZ.length; b++) if (ltasTerz[b] >= ltMax - 20) { fUnten = TERZ[b] * Math.pow(2, -1 / 6); break; }
    // Spitzen-Bin in Bereichen (parabolisch verfeinert)
    const spitzeIn = (a, b) => { let kb = -1, pb = -1; for (let k = Math.max(1, Math.floor(a / bw)); k <= Math.min(nb - 2, Math.ceil(b / bw)); k++) if (P[k] > pb) { pb = P[k]; kb = k; } if (kb < 1) return null; const y0 = Math.log(P[kb - 1] + 1e-30), y1 = Math.log(P[kb] + 1e-30), y2 = Math.log(P[kb + 1] + 1e-30), d = (y0 - 2 * y1 + y2), off = d !== 0 ? 0.5 * (y0 - y2) / d : 0; return (kb + Math.max(-0.5, Math.min(0.5, off))) * bw; };
    // Einsätze (5-ms-Hüllkurven): Anstieg ≥ 6 dB gegen das Minimum der letzten 20 ms, über (Max − 25 dB), Sperrzeit 60 ms
    const einsaetze = (env) => { const out = [], mx = maxA(env); let sperr = -1e9; for (let j = 4; j < env.length; j++) { const mn = Math.min(env[j - 1], env[j - 2], env[j - 3], env[j - 4]); if (env[j] > mx - 25 && env[j] - mn >= 6 && j - sperr >= 12) { out.push(j); sperr = j; } } return out; };
    const env = Float32Array.from(this.env), envTief = Float32Array.from(this.envTief);
    // Tiefband-Einsätze (Kick → Ducking): Spitzen-Hüllkurve über gleitende 25 ms. Die 5-ms-Energie eines 40–60-Hz-Tons schwankt
    // innerhalb jeder Periode um mehr als 6 dB – das ergab Einsätze alle 60–100 ms statt je Kick (Prüfer-Befund 0.1).
    const pkT = this.pkTief, envPk = new Float32Array(pkT.length);
    for (let j = 0; j < pkT.length; j++) { let m = 0; for (let q = Math.max(0, j - 4); q <= j; q++) if (pkT[q] > m) m = pkT[q]; envPk[j] = db(m); }
    const einsaetzePk = (e) => { const out = [], mx = maxA(e); let sperr = -1e9; for (let j = 0; j < e.length; j++) { let mn = j ? Infinity : -200; for (let q = Math.max(0, j - 4); q < j; q++) if (e[q] < mn) mn = e[q]; if (e[j] > mx - 25 && e[j] - mn >= 4.5 && j - sperr >= 12) {
        // Anfang des Anstiegs: frühester Block (bis 15 ms zurück), ab dem die Hüllkurve schon ≥ 2 dB über dem Rest davor liegt
        let a = j; for (let q = j - 1; q >= Math.max(1, j - 3, sperr + 1); q--) { let m2 = Infinity; for (let r = Math.max(0, q - 4); r < q; r++) if (e[r] < m2) m2 = e[r]; if (e[q] - m2 >= 2) a = q; else break; }
        out.push(a); sperr = j; } } return out; };
    const eins = env.length ? einsaetze(this.env) : [], einsTief = envPk.length ? einsaetzePk(envPk) : [];
    // Abklingzeit der Tiefband-Einsätze bis −20 dB (Median, höchstens 400 ms) – Release fürs Ducking (methodik: „Kick-Abklingzeit bis −20 dB“)
    const abk = einsTief.map(j => { let pk = -Infinity, jp = j; for (let q = j; q < Math.min(envPk.length, j + 6); q++) if (envPk[q] > pk) { pk = envPk[q]; jp = q; } let q = jp; while (q < Math.min(envPk.length, jp + 80) && envPk[q] > pk - 20) q++; return (q - jp) * 5; }).sort((a, b) => a - b);
    const abklingTiefMs = abk.length ? abk[abk.length >> 1] : null;
    const dauer = this.n / sr;
    // Hall-Anteil (grobe Schätzung): Pegel 20–150 ms nach dem Ende einer Phrase gegen 100 ms davor
    const envAkt = this.env.filter(x => x > -80), envMed = med(envAkt);
    const ev = k => Math.max(-90, this.env[k]), enden = [];
    for (let j = 20; j + 30 < this.env.length; j++) { const vor = (ev(j - 4) + ev(j - 5) + ev(j - 6)) / 3; if (vor > envMed - 6 && ev(j) < vor - 15 && ev(j + 1) < vor - 15) { let nach = 0; for (let k = j + 4; k < j + 30; k++) nach += ev(k); enden.push(Math.max(-60, nach / 26 - vor)); j += 30; } }
    const hallRelLu = enden.length >= 3 ? +med(enden).toFixed(1) : null;
    const m = {
      sr, frames: this.n, dauer, I: +I.toFixed(3), lra: +lu.lra().toFixed(2), aktivitaet: +aktiv.toFixed(3),
      spitzeDb: +db(this.clip.spitze).toFixed(2), clipFolgen: this.clip.folgen, dc: this.clip.dc,
      korr: +this.korr.gesamt.toFixed(3), korrTief: +this.korr.tief.toFixed(3), mono: this.korr.gesamt > 0.9999,
      crest100: +med(crest).toFixed(2), crest1s: +med(crest1).toFixed(2),
      centroid: tot > 0 ? Math.round(cen / tot) : 0, flatness: +flatness.toFixed(4), rolloff85: Math.round(roll), tonal: flatness < 0.1,
      anteilUnter60: tot ? +(u60 / tot).toFixed(3) : 0, anteilUnter120: tot ? +(u120 / tot).toFixed(3) : 0, anteilUnter250: tot ? +(u250 / tot).toFixed(3) : 0,
      anteilUnter500: tot ? +(u500 / tot).toFixed(3) : 0, anteilUeber5k: tot ? +(o5k / tot).toFixed(3) : 0,
      ltasTerz: ltasTerz.map(x => +x.toFixed(2)), ltasOkt: ltasOkt.map(x => +x.toFixed(2)), fUnten: Math.round(fUnten),
      fK: spitzeIn(35, 130), fV: spitzeIn(1000, 5000),
      einsaetzeProS: dauer > 0 ? +(eins.length / dauer).toFixed(2) : 0, hallRelLu,
      // große Reihen (bleiben im Worker, gehen nicht an die Oberfläche)
      env, envTief, einsaetze5: Int32Array.from(eins), einsaetzeTief5: Int32Array.from(einsTief), abklingTiefMs, terzFrames: this.terzFrames, frameE: Float32Array.from(this.frameE), frameHop: HOP,
      blockPk: Float32Array.from(this.blkPk), pk5: Float32Array.from(this.pk5), blockQ: Float32Array.from(this.blkQ), uebersicht: Float32Array.from(this.ueb),
    };
    return m;
  }
}
/** Merkmale ohne große Reihen (für postMessage an die Oberfläche / Rezept). */
export function merkmaleKlein(m) { const { env, envTief, einsaetze5, einsaetzeTief5, terzFrames, frameE, blockPk, blockQ, pk5, ...k } = m; return k; }

/** Schnellblick: 3 Ausschnitte à 5 s (bei 20/50/80 %) → Merkmale → Rollen-Vorschlag. */
export async function schnellblick(file, kopf) {
  const sr = kopf.sr, len = Math.min(kopf.frames, 5 * sr), an = new SpurAnalyse(sr);
  let pos = 0;
  for (const p of [0.2, 0.5, 0.8]) {
    const start = Math.max(0, Math.min(kopf.frames - len, Math.floor(kopf.frames * p - len / 2)));
    const s = await lesBereich(file, kopf, start, len);
    an.feed(pos, s.L, s.R); pos += s.L.length;
  }
  const m = an.ende();
  return { vorschlag: rolleVorschlag(kopf.name, m), merkmale: merkmaleKlein(m) };
}

// ---------- Entscheidung ----------
const PRIO = R.rollen.prioritaet;
export const maxA = (a, s = -Infinity) => { for (let i = 0; i < a.length; i++) if (a[i] > s) s = a[i]; return s; };
const r05 = x => Math.round(x * 2) / 2, clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const OKT_TERZ = o => [3 * o, 3 * o + 1, 3 * o + 2];

/** Maskierung von A auf B je Oktavband und Rahmen (methodik mix.maskierung). → {anteil[o], median[o], terz[o]} */
export function maskierung(mA, mB) {
  const n = Math.min(mA.terzFrames.length, mB.terzFrames.length), RT = R.mix.maskierung.wesentlicheBaenderRT;
  const okt = T => OKT.map((_, o) => pdb(Math.pow(10, T[3 * o] / 10) + Math.pow(10, T[3 * o + 1] / 10) + Math.pow(10, T[3 * o + 2] / 10)));
  const eA = mA.frameE, eB = mB.frameE, mxA = maxA(eA, 1e-20), mxB = maxA(eB, 1e-20);
  const werte = OKT.map(() => []); let nAktiv = 0;
  for (let f = 0; f < n; f++) {
    if (eA[f] < mxA * 1e-3 || eB[f] < mxB * 1e-3) continue; nAktiv++;
    const XA = okt(mA.terzFrames[f]), XB = okt(mB.terzFrames[f]);
    const rang = X => { const idx = X.map((v, i) => i).sort((a, b) => X[b] - X[a]); return new Set(idx.slice(0, RT)); };
    const wA = rang(XA), wB = rang(XB);
    for (let o = 0; o < OKT.length; o++) if (wB.has(o) && !wA.has(o) && XA[o] > XB[o]) werte[o].push(XA[o] - XB[o]);
  }
  return OKT.map((_, o) => {
    const w = werte[o].sort((a, b) => a - b), med = w.length ? w[w.length >> 1] : 0;
    // Terz mit dem größten LTAS-Abstand A − B innerhalb der Oktave
    let tb = OKT_TERZ(o)[1], best = -1e9; for (const t of OKT_TERZ(o)) { const d = mA.ltasTerz[t] - mB.ltasTerz[t]; if (d > best) { best = d; tb = t; } }
    return { anteil: nAktiv ? w.length / nAktiv : 0, median: med, hz: TERZ[tb] };
  });
}

/** Maskierung im festen Bereich eines Paars (methodik mix.paare, z. B. Gesang 1–5 kHz): M = X_A − X_B, wenn X_A > X_B, nur wo beide klingen. */
export function maskierungBereich(mA, mB, oktaven) {
  const n = Math.min(mA.terzFrames.length, mB.terzFrames.length), eA = mA.frameE, eB = mB.frameE, mxA = maxA(eA, 1e-20), mxB = maxA(eB, 1e-20);
  const okt = (T, o) => pdb(Math.pow(10, T[3 * o] / 10) + Math.pow(10, T[3 * o + 1] / 10) + Math.pow(10, T[3 * o + 2] / 10));
  const werte = {}; oktaven.forEach(o => werte[o] = []); let nAktiv = 0;
  for (let f = 0; f < n; f++) {
    if (eA[f] < mxA * 1e-3 || eB[f] < mxB * 1e-3) continue; nAktiv++;
    for (const o of oktaven) { const d = okt(mA.terzFrames[f], o) - okt(mB.terzFrames[f], o); if (d > 0) werte[o].push(d); }
  }
  const out = {}; for (const o of oktaven) { const w = werte[o].sort((a, b) => a - b); out[o] = { anteil: nAktiv ? w.length / nAktiv : 0, median: w.length ? w[w.length >> 1] : 0 }; }
  return out;
}

function lowCutHz(rolle, m, st) {
  if (st.lowCut === 'subsonic') return 20;
  const T = R.mix.hochpass.tabelleHz, tab = rolle === 'vocal' ? 70 : Array.isArray(T[rolle]) ? T[rolle][0] : rolle === 'drumbus' ? 20 : 20;
  let fc = Math.min(tab, 0.7 * m.fUnten);
  if (rolle === 'vocal') fc = clamp(0.7 * m.fUnten, 20, 120);
  return Math.max(20, Math.round(fc));
}

function komp(rolle, m, st, bpm) {
  const K = R.mix.kompression, nw = K.nurWennNoetig;
  const key = rolle === 'vocal' ? 'vocalStufe1' : rolle;
  const t = K.rollen[key]; if (!t || !t.ratio || t.ratio <= 1) return null;
  if (m.crest100 < nw.crest100UnterDb && m.lra < nw.lraStemUnterLu) return { aus: true, grund: 'gleichmäßig genug – kein Kompressor nötig' };
  const spanne = arr => Array.isArray(arr) ? arr[0] + (arr[1] - arr[0]) * st.grPos : arr;
  const zielGr = spanne(t.zielGrDb); if (!(zielGr > 0.25)) return null;
  let attack = spanne(t.attackMs), release = spanne(t.releaseMs);
  if (bpm && (rolle === 'kick' || rolle === 'snare' || rolle === 'drumbus')) release = clamp(15000 / bpm, 50, 200);
  if (bpm && rolle === 'bass') release = clamp(30000 / bpm, 100, 300);
  // Schwelle und Make-up aus einer Nachbildung des Kompressors auf der 5-ms-Hüllkurve (Spitze je 5 ms, Energie je 5 ms):
  // Schwelle so, dass die Reduktion in lauten Stellen (P90) ≈ Ziel; Make-up = energiegewichtete mittlere Reduktion (Verhältnis bleibt, Konzept 0.5).
  const r = t.ratio, W = t.kneeDb || 6, pk = m.pk5, en = m.env, n = Math.min(pk.length, en.length);
  if (n < 50) return null;
  const sim = T => {
    const aA = Math.exp(-5 / attack), aR = Math.exp(-5 / release), sl = 1 / r - 1, emax = maxA(en); let y1 = 0, y = 0, num = 0, den = 0; const grs = [];
    for (let j = 0; j < n; j++) {
      y1 = pk[j] > aR * y1 ? pk[j] : aR * y1; y = aA * y + (1 - aA) * y1;
      const o = db(y) - T, gs = 2 * o < -W ? 0 : 2 * Math.abs(o) <= W ? sl * (o + W / 2) * (o + W / 2) / (2 * W) : sl * o;
      const e = Math.pow(10, en[j] / 10); num += e * Math.pow(10, gs / 10); den += e; if (en[j] > emax - 30) grs.push(-gs);
    }
    grs.sort((a, b) => a - b); return { gr90: grs.length ? grs[Math.floor(0.9 * (grs.length - 1))] : 0, makeup: den > 0 ? -pdb(num / den) : 0 };
  };
  const ps = [], emx = maxA(en); for (let j = 0; j < n; j++) if (en[j] > emx - 30) ps.push(db(pk[j]));
  if (ps.length < 20) return null;
  ps.sort((a, b) => a - b);
  let thr = ps[Math.floor(0.9 * (ps.length - 1))] - zielGr / (1 - 1 / r), s1 = sim(thr);
  for (let it = 0; it < 4 && Math.abs(s1.gr90 - zielGr) > 0.25; it++) { thr += (s1.gr90 - zielGr) / (1 - 1 / r); s1 = sim(thr); }
  const makeup = s1.makeup;
  return { ratio: r, attackMs: +attack.toFixed(1), releaseMs: Math.round(release), knieDb: W, threshDb: +thr.toFixed(2), makeupDb: +makeup.toFixed(2), zielGrDb: +zielGr.toFixed(1), grSimP90Db: +s1.gr90.toFixed(2) };
}

/**
 * entscheide(spuren, merkmale, {eingriff, ziel, bpm, mixI}) → plan
 * spuren: [{name, rolle, hauptsache, solassen}] ; merkmale: aus SpurAnalyse.ende() ; mixI: integrierte Lautheit der Vorher-Summe.
 * plan = {eingriff, ziel, bpm, sr, spuren:[planSpur], kick: {quelle, zeiten}, vocalTor, hinweise}
 */
export function entscheide(spuren, merkmale, { eingriff = 'mittel', ziel = 'streaming', bpm = 120, mixI }) {
  const st = STUFEN[eingriff], sr = merkmale[0].sr, Fw = R.mix.pegelFensterLu;
  const hatVocal = spuren.some(s => s.rolle === 'vocal'), plan = { eingriff, ziel, bpm, sr, spuren: [], hinweise: [] };
  const rang = s => s.hauptsache ? -1 : (PRIO.indexOf(s.rolle) < 0 ? 99 : PRIO.indexOf(s.rolle));
  const iVocal = spuren.findIndex(s => s.rolle === 'vocal');
  // Kick-Zeiten (5-ms-Raster → Proben), aus Kick-Spur oder Tiefband der Drum-Summe
  const iKick = spuren.findIndex(s => s.rolle === 'kick'), iDrum = spuren.findIndex(s => s.rolle === 'drumbus');
  const kq = iKick >= 0 ? iKick : iDrum;
  const e5 = Math.round(sr * 0.005);
  const kickZeiten = kq >= 0 ? Int32Array.from(merkmale[kq].einsaetzeTief5.length ? merkmale[kq].einsaetzeTief5 : merkmale[kq].einsaetze5, j => j * e5) : null;
  // Gesangs-Tor (5 ms): Kurzzeit > Median − 10 dB (methodik paare vocal.dynEq.ausloeser), 30 ms Haltezeit
  let vocalTor = null;
  if (iVocal >= 0) {
    const env = merkmale[iVocal].env, akt = Array.from(env).filter(x => x > -80).sort((a, b) => a - b), med = akt.length ? akt[akt.length >> 1] : -200;
    vocalTor = new Uint8Array(env.length); let halt = 0;
    for (let j = 0; j < env.length; j++) { if (env[j] > med - 10) halt = 6; vocalTor[j] = halt > 0 ? 1 : 0; if (halt > 0) halt--; }
  }
  plan.kick = kickZeiten ? { quelle: spuren[kq].name, zeiten: kickZeiten } : null; plan.vocalTor = vocalTor; plan.torSchritt = e5;

  spuren.forEach((s, i) => {
    const m = merkmale[i], rolle = s.rolle;
    const ps = { name: s.name, rolle, hauptsache: !!s.hauptsache, solassen: !!s.solassen, pegelDb: 0, pegelGrund: null, lrelVorher: +(m.I - mixI).toFixed(2), fenster: null,
      lowCutHz: null, eq: [], komp: null, ducking: null, dynEq: null, hoehenDb: 0, send: null, texte: [], hallRelLu: m.hallRelLu };
    plan.spuren.push(ps);
    if (s.solassen) { ps.texte.push('unverändert (So lassen)'); return; }
    if (!isFinite(m.I)) { ps.texte.push('still – nichts geändert'); return; }
    // Pegel
    let fen = Fw[rolle === 'lead' && !hatVocal ? 'leadOhneVocal' : rolle];
    if (fen) {
      ps.fenster = fen.fenster; const L = ps.lrelVorher; let ueber = 0;
      if (L > fen.fenster[1]) ueber = L - fen.fenster[1]; else if (L < fen.fenster[0]) ueber = L - fen.fenster[0];
      if (rolle === 'chor' && iVocal >= 0) { const unter = merkmale[iVocal].I - m.I, [a, b] = fen.unterVocalLu; if (unter < a) ueber = Math.max(ueber, a - unter); }
      const grenze = rolle === 'vocal' ? st.grenzeVocal : st.grenze;
      let d = r05(clamp(-st.anteil * ueber, -grenze, grenze));
      if (Math.abs(d) < R.mix.pegel.minAenderungDb) d = 0;
      if (d) { ps.pegelDb = d; ps.pegelGrund = `lag ${zahl(Math.abs(ueber))} dB ${ueber > 0 ? 'über' : 'unter'} dem üblichen Bereich`; ps.texte.push(`${zahl(Math.abs(d))} dB ${d < 0 ? 'leiser' : 'lauter'}`); }
    }
    // Low Cut
    ps.lowCutHz = lowCutHz(rolle, m, st);
    // Kompressor
    const k = komp(rolle, m, st, bpm); if (k && !k.aus) { ps.komp = k; ps.texte.push(`Kompressor ${zahl(k.zielGrDb)} dB`); }
    // hintere Ebene: Höhen ab 6 kHz
    if ((rolle === 'pad' || rolle === 'fx') && st.hoehen) { ps.hoehenDb = st.hoehen; }
  });

  const P = i => plan.spuren[i];
  // Kick → Bass: Ducking unter 150 Hz + Glocke beim Kick-Grundton
  const iBass = spuren.map((s, i) => s.rolle === 'bass' ? i : -1).filter(i => i >= 0);
  if (kq >= 0 && kickZeiten && kickZeiten.length) {
    const pk = R.mix.paare[0], fK = merkmale[kq].fK;
    for (const b of iBass) {
      if (P(b).solassen) continue;
      P(b).ducking = { von: spuren[kq].name, tiefeDb: st.duck, unterHz: pk.ducking.nurUnterHz, vorlaufMs: 1.5, attackMs: 1, holdMs: 20, releaseMs: clamp(Math.round(merkmale[kq].abklingTiefMs ?? 15000 / bpm * 0.75), pk.ducking.releaseSpanneMs[0], Math.min(pk.ducking.releaseSpanneMs[1], Math.round(15000 / bpm))), naeherungDawDb: Math.min(2, st.duck) };
      P(b).texte.push(`weicht der Kick unter 150 Hz um ${zahl(st.duck, 0)} dB aus`);
      if (fK && fK >= 35 && fK <= 130) {
        // Tiefe: Tabelle (methodik paare kick/bass statisch −2…−3 dB), bei starker Maskierung im Paar-Band 40–120 Hz bis staerke × Median (≤ Grenze der Stufe)
        const mk = maskierungBereich(merkmale[b], merkmale[kq], [1])[1];
        let tief = { sanft: -2, mittel: -2.5, kraeftig: -3 }[eingriff];
        if (mk.anteil >= st.maskAnteil && mk.median >= st.maskMedian) tief = Math.min(tief, -r05(Math.min(st.maskMax, st.maskStaerke * mk.median)));
        P(b).eq.push({ typ: 'peak', hz: Math.round(fK), db: tief, q: 2, grund: 'Platz für die Kick', prio: 0 });
        P(b).texte.push(`Platz für die Kick bei ${Math.round(fK)} Hz`);
      }
    }
  }
  // Gesang ↔ Synths: dynamischer EQ beim Gesang-Präsenzbereich, nur während der Phrasen
  if (iVocal >= 0 && vocalTor) {
    const fV = merkmale[iVocal].fV || 2500;
    spuren.forEach((s, i) => {
      if (!['lead', 'pad', 'chor'].includes(s.rolle) || P(i).solassen || s.hauptsache) return;
      const mk = maskierungBereich(merkmale[i], merkmale[iVocal], [5, 6, 7]);
      const o = [5, 6, 7].filter(o => mk[o].anteil >= st.maskAnteil && mk[o].median >= st.maskMedian);
      if (!o.length) return;
      P(i).dynEq = { hz: Math.round(fV), q: 1.2, db: st.dynEq, attackMs: 10, releaseMs: 200, grund: 'Platz für den Gesang' };
      P(i).texte.push(`macht dem Gesang bei ${zahl(fV / 1000, 1)} kHz Platz (nur wenn gesungen wird)`);
    });
  }
  // Allgemeine Maskierung (Rangfolge methodik 2.3); Paare oben ausgenommen
  const sonder = (a, b) => (spuren[a].rolle === 'bass' && (spuren[b].rolle === 'kick' || spuren[b].rolle === 'drumbus')) ||
    (['lead', 'pad', 'chor'].includes(spuren[a].rolle) && spuren[b].rolle === 'vocal');
  const zaehl = new Array(spuren.length).fill(0), kandidaten = [];
  for (let a = 0; a < spuren.length; a++) for (let b = 0; b < spuren.length; b++) {
    if (a === b || P(a).solassen || sonder(a, b) || rang(spuren[a]) <= rang(spuren[b])) continue;
    if (!isFinite(merkmale[a].I) || !isFinite(merkmale[b].I)) continue;
    const mk = maskierung(merkmale[a], merkmale[b]);
    mk.forEach((x, o) => { if (o >= 1 && x.anteil >= st.maskAnteil && x.median >= st.maskMedian) kandidaten.push({ a, b, o, ...x }); });
  }
  kandidaten.sort((x, y) => y.median * y.anteil - x.median * x.anteil);
  for (const c of kandidaten) {
    const ps = P(c.a); if (zaehl[c.a] >= st.maskN || ps.eq.length >= 3) continue;
    if (ps.eq.some(e => Math.abs(Math.log2(e.hz / c.hz)) < 0.5)) continue;
    const tief = -r05(Math.min(st.maskMax, st.maskStaerke * c.median)); if (tief > -0.5) continue;
    ps.eq.push({ typ: 'peak', hz: Math.round(c.hz), db: tief, q: R.mix.maskierung.gegenmittel.q, grund: `Platz für ${ROLLEN_ANZEIGE[spuren[c.b].rolle] || spuren[c.b].name}`, prio: 1 });
    ps.texte.push(`Platz für ${ROLLEN_ANZEIGE[spuren[c.b].rolle]} bei ${c.hz >= 1000 ? zahl(c.hz / 1000, 1) + ' kHz' : Math.round(c.hz) + ' Hz'}`);
    zaehl[c.a]++;
  }
  // Höhen hinten als 4. Band (High Shelf 6 kHz)
  plan.spuren.forEach(ps => { if (ps.hoehenDb) { ps.eq.push({ typ: 'highshelf', hz: 6000, db: ps.hoehenDb, q: 0.7, grund: 'nach hinten (Höhen leiser)', prio: 2 }); ps.texte.push(`etwas nach hinten (Höhen ${zahl(ps.hoehenDb, 0)} dB)`); } });
  // höchstens 4 Bänder, Wichtigkeit: Maskierung vor Mulm vor Höhen; Band-Nummern wie StudioEQ
  plan.spuren.forEach(ps => {
    ps.eq.sort((a, b) => a.prio - b.prio); ps.eq = ps.eq.slice(0, 4).sort((a, b) => a.hz - b.hz);
    // StudioEQ: Shelf nur auf Band 1 (tief) und 4 (hoch); Band 2/3 sind immer parametrisch → Glocken zuerst auf 2/3
    { const frei = [2, 3, 1, 4], nimm = b => { const i = frei.indexOf(b); if (i < 0) return 0; frei.splice(i, 1); return b; };
      for (const e of ps.eq) if (e.typ === 'lowshelf') e.band = nimm(1); else if (e.typ === 'highshelf') e.band = nimm(4);
      for (const e of ps.eq) if (e.typ !== 'lowshelf' && e.typ !== 'highshelf') e.band = frei.length ? nimm(frei[0]) : 0;
      /* band 0 = kein Band frei (Rezept: zweiter StudioEQ) – der Klang im Mischpult bleibt gleich */ }
    ps.eq.forEach(e => delete e.prio);
  });
  // Raum (nur trockene Spuren, nie Kick/Bass)
  if (st.raum != null) plan.spuren.forEach((ps, i) => {
    if (ps.solassen || !['vocal', 'lead', 'pad', 'chor', 'snare'].includes(ps.rolle)) return;
    if (ps.hallRelLu == null || ps.hallRelLu >= -20) return;
    ps.send = { zielLu: st.raum }; ps.texte.push('etwas Raum dazu');
  });
  plan.spuren.forEach(ps => { if (!ps.texte.length) ps.texte.push('passt – nichts geändert'); });
  return plan;
}
