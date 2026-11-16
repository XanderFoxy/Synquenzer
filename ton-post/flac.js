// Ton-Post – flac.js: verlustfreier FLAC-Kodierer (feste Prädiktoren 0–4, Rice-Partitionen, Stereo-Dekorrelation).
// Nur Integer-PCM (WAV 16/24 Bit, Little Endian). Deterministisch: zweimal kodiert ergibt dieselben Bytes.
// Kein DOM; läuft im Worker und in Node. MD5 und Rahmengrößen in STREAMINFO bleiben 0 (= „unbekannt“, laut Spezifikation erlaubt).
export const BLOCK = 4096;

const CRC8 = new Uint8Array(256), CRC16 = new Uint16Array(256);
for (let i = 0; i < 256; i++) {
  let c = i; for (let k = 0; k < 8; k++) c = c & 0x80 ? ((c << 1) ^ 0x07) & 255 : (c << 1) & 255; CRC8[i] = c;
  let d = i << 8; for (let k = 0; k < 8; k++) d = d & 0x8000 ? ((d << 1) ^ 0x8005) & 0xFFFF : (d << 1) & 0xFFFF; CRC16[i] = d;
}

class Bits {
  constructor(n) { this.b = new Uint8Array(n); this.p = 0; this.acc = 0; this.n = 0; }
  reset() { this.p = 0; this.acc = 0; this.n = 0; }
  platz(extra) { if (this.p + extra + 8 > this.b.length) { const nb = new Uint8Array((this.b.length + extra) * 2); nb.set(this.b.subarray(0, this.p)); this.b = nb; } }
  put(v, k) { // k ≤ 24
    if (!k) return;
    this.acc = (this.acc << k) | (v & ((1 << k) - 1)); this.n += k;
    while (this.n >= 8) { this.n -= 8; this.b[this.p++] = (this.acc >>> this.n) & 255; }
    this.acc &= (1 << this.n) - 1;
  }
  putGross(v, k) { // bis 36 Bit, v ≥ 0 oder Zweierkomplement in k Bit (v als Zahl)
    if (k <= 24) { this.put(v, k); return; }
    const hi = Math.floor(v / 2 ** 24), lo = v - hi * 2 ** 24;
    this.put(hi, k - 24); this.put(lo, 24);
  }
  unaer(q) { while (q >= 24) { this.put(0, 24); q -= 24; } this.put(1, q + 1); }
  byte() { if (this.n) this.put(0, 8 - this.n); }
}

const SR_CODE = { 88200: 1, 176400: 2, 192000: 3, 8000: 4, 16000: 5, 22050: 6, 24000: 7, 32000: 8, 44100: 9, 48000: 10, 96000: 11 };
const BITS_CODE = { 8: 1, 12: 2, 16: 4, 20: 5, 24: 6 };

/** Darf diese Datei verlustfrei nach FLAC? (nur WAV, Integer-PCM 16/24 Bit, 1–8 Kanäle, lückenlose Rahmen) */
export function flacMoeglich(k) {
  return k && k.format === 'wav' && k.pcm && !k.float && (k.bits === 16 || k.bits === 24) && k.kanaele >= 1 && k.kanaele <= 8
    && k.blockAlign === k.kanaele * (k.bits >> 3) && k.rate > 0 && k.rate < 655350 && k.frames >= 16;
}

export class FlacKodierer {
  constructor({ kanaele, rate, bits, frames }) {
    Object.assign(this, { ch: kanaele, rate, bits, frames });
    this.nr = 0;
    this.w = new Bits(BLOCK * kanaele * 4 + 4096);
    this.kan = Array.from({ length: Math.max(2, kanaele) }, () => new Int32Array(BLOCK));
    this.s = new Int32Array(BLOCK); this.m = new Int32Array(BLOCK); this.res = new Int32Array(BLOCK);
  }
  /** „fLaC“ + STREAMINFO (letzter Metadatenblock). */
  kopf() {
    const w = new Bits(64);
    w.put(0x66, 8); w.put(0x4C, 8); w.put(0x61, 8); w.put(0x43, 8);
    w.put(1, 1); w.put(0, 7); w.put(34, 24);
    const bs = Math.min(BLOCK, this.frames); w.put(bs, 16); w.put(bs, 16); w.put(0, 24); w.put(0, 24);
    w.put(this.rate, 20); w.put(this.ch - 1, 3); w.put(this.bits - 1, 5); w.putGross(this.frames, 36);
    for (let i = 0; i < 16; i++) w.put(0, 8);
    return w.b.slice(0, w.p);
  }
  /** Rohdaten (WAV, LE, verschachtelt) eines Blocks (n Rahmen) → ein FLAC-Rahmen (Uint8Array, Ansicht auf internen Puffer). */
  rahmen(u8, off, n) {
    const ch = this.ch, bp = this.bits >> 3, K = this.kan;
    for (let c = 0; c < ch; c++) {
      const x = K[c]; let p = off + c * bp; const st = ch * bp;
      if (bp === 2) for (let i = 0; i < n; i++, p += st) x[i] = (u8[p] | (u8[p + 1] << 24 >> 16));
      else for (let i = 0; i < n; i++, p += st) x[i] = (u8[p] | (u8[p + 1] << 8) | (u8[p + 2] << 24 >> 8));
    }
    const w = this.w; w.reset(); w.platz(n * ch * 5 + 64);
    // Kanalzuordnung
    let zuord = ch - 1, plan = null;
    if (ch === 2) {
      const L = K[0], R = K[1], S = this.s, M = this.m;
      for (let i = 0; i < n; i++) { S[i] = L[i] - R[i]; M[i] = (L[i] + R[i]) >> 1; }
      const cL = schaetz(L, n), cR = schaetz(R, n), cS = schaetz(S, n), cM = schaetz(M, n);
      const opt = [[cL + cR, 1, [L, R], [0, 0]], [cL + cS, 8, [L, S], [0, 1]], [cS + cR, 9, [S, R], [1, 0]], [cM + cS, 10, [M, S], [0, 1]]];
      let best = opt[0]; for (const o of opt) if (o[0] < best[0]) best = o;
      zuord = best[1]; plan = best[2].map((x, i) => [x, this.bits + best[3][i]]);
    } else plan = K.slice(0, ch).map((x) => [x, this.bits]);
    // Rahmenkopf
    const bsCode = n === BLOCK ? 12 : (n <= 256 ? 6 : 7);
    w.put(0xFFF8, 16); w.put(bsCode, 4); w.put(SR_CODE[this.rate] || 0, 4); w.put(zuord, 4); w.put(BITS_CODE[this.bits] || 0, 3); w.put(0, 1);
    utf8(w, this.nr++);
    if (bsCode === 6) w.put(n - 1, 8); else if (bsCode === 7) w.put(n - 1, 16);
    let c8 = 0; for (let i = 0; i < w.p; i++) c8 = CRC8[c8 ^ w.b[i]];
    w.put(c8, 8);
    for (const [x, bps] of plan) this.unterrahmen(x, n, bps);
    w.byte();
    let c16 = 0; for (let i = 0; i < w.p; i++) c16 = ((c16 << 8) & 0xFFFF) ^ CRC16[(c16 >> 8) ^ w.b[i]];
    w.put(c16, 16);
    return w.b.subarray(0, w.p);
  }
  unterrahmen(x, n, bps) {
    const w = this.w;
    let gleich = true; for (let i = 1; i < n; i++) if (x[i] !== x[0]) { gleich = false; break; }
    if (gleich) { w.put(0, 8); putS(w, x[0], bps); return; }
    const ord = n > 4 ? (x === this.letztX && this.letztOrd >= 0 ? this.letztOrd : besteOrdnung(x, n)) : 0, res = this.res;
    restwerte(x, n, ord, res);
    const plan = riceplan(res, n, ord);
    if (plan.bits >= n * bps || n <= ord) { w.put(2, 8); for (let i = 0; i < n; i++) putS(w, x[i], bps); return; }
    w.put(0x10 | ord << 1, 8);
    for (let i = 0; i < ord; i++) putS(w, x[i], bps);
    const methode = plan.k.some((k) => k > 14) ? 1 : 0, kb = methode ? 5 : 4;
    w.put(methode, 2); w.put(plan.po, 4);
    const teile = 1 << plan.po, len = n >> plan.po;
    let i = ord;
    for (let t = 0; t < teile; t++) {
      const k = plan.k[t], ende = (t + 1) * len;
      w.put(k, kb);
      const maske = (1 << k) - 1, eins = 1 << k, b = w.b;
      let acc = w.acc, nb = w.n, p = w.p;
      for (; i < ende; i++) {
        const r = res[i], u = r >= 0 ? r * 2 : -r * 2 - 1, q = u >>> k, gesamt = q + 1 + k;
        if (gesamt <= 24) { // schneller Weg: alles in einem Rutsch
          acc = (acc << gesamt) | eins | (u & maske); nb += gesamt;
          while (nb >= 8) { nb -= 8; b[p++] = (acc >>> nb) & 255; }
          acc &= (1 << nb) - 1;
        } else {
          w.acc = acc; w.n = nb; w.p = p;
          w.unaer(q);
          if (k > 24) { w.put((u & maske) >>> 24, k - 24); w.put(u & 0xFFFFFF, 24); } else if (k) w.put(u & maske, k);
          acc = w.acc; nb = w.n; p = w.p;
        }
      }
      w.acc = acc; w.n = nb; w.p = p;
    }
  }
}

function putS(w, v, bps) { // vorzeichenbehaftet, bps bis 25 (Seitenkanal bei 24 Bit)
  if (bps <= 24) w.put(v, bps); else { w.put(v >> 24, bps - 24); w.put(v & 0xFFFFFF, 24); }
}
function utf8(w, v) {
  if (v < 0x80) { w.put(v, 8); return; }
  const bytes = []; let n = 1, max = 0x3F;
  while (v > max) { bytes.unshift(0x80 | (v & 0x3F)); v = Math.floor(v / 64); n++; max >>= 1; }
  const kopf = (0xFF00 >> n) & 0xFF;
  w.put(kopf | v, 8); for (const b of bytes) w.put(b, 8);
}
// Summe |Rest| je Ordnung (ab Probe 4, wie libFLAC) → beste Ordnung
function besteOrdnung(x, n) {
  let e0 = 0, e1 = 0, e2 = 0, e3 = 0, e4 = 0;
  let a = x[3], b = x[3] - x[2], c = b - (x[2] - x[1]), d = c - ((x[2] - x[1]) - (x[1] - x[0]));
  for (let i = 4; i < n; i++) {
    const v = x[i], r1 = v - a, r2 = r1 - b, r3 = r2 - c, r4 = r3 - d;
    e0 += v < 0 ? -v : v; e1 += r1 < 0 ? -r1 : r1; e2 += r2 < 0 ? -r2 : r2; e3 += r3 < 0 ? -r3 : r3; e4 += r4 < 0 ? -r4 : r4;
    a = v; b = r1; c = r2; d = r3;
  }
  let o = 0, m = e0;
  if (e1 < m) { m = e1; o = 1; } if (e2 < m) { m = e2; o = 2; } if (e3 < m) { m = e3; o = 3; } if (e4 < m) { o = 4; }
  return o;
}
function schaetz(x, n) {
  if (n <= 4) return 0;
  let e0 = 0, e1 = 0, e2 = 0, e3 = 0, e4 = 0;
  let a = x[3], b = x[3] - x[2], c = b - (x[2] - x[1]), d = c - ((x[2] - x[1]) - (x[1] - x[0]));
  for (let i = 4; i < n; i++) {
    const v = x[i], r1 = v - a, r2 = r1 - b, r3 = r2 - c, r4 = r3 - d;
    e0 += v < 0 ? -v : v; e1 += r1 < 0 ? -r1 : r1; e2 += r2 < 0 ? -r2 : r2; e3 += r3 < 0 ? -r3 : r3; e4 += r4 < 0 ? -r4 : r4;
    a = v; b = r1; c = r2; d = r3;
  }
  return Math.min(e0, e1, e2, e3, e4);
}
function restwerte(x, n, o, r) {
  for (let i = 0; i < o; i++) r[i] = 0;
  if (o === 0) for (let i = 0; i < n; i++) r[i] = x[i];
  else if (o === 1) for (let i = 1; i < n; i++) r[i] = x[i] - x[i - 1];
  else if (o === 2) for (let i = 2; i < n; i++) r[i] = x[i] - 2 * x[i - 1] + x[i - 2];
  else if (o === 3) for (let i = 3; i < n; i++) r[i] = x[i] - 3 * x[i - 1] + 3 * x[i - 2] - x[i - 3];
  else for (let i = 4; i < n; i++) r[i] = x[i] - 4 * x[i - 1] + 6 * x[i - 2] - 4 * x[i - 3] + x[i - 4];
}
// Bits für Rice mit Parameter k bei Summe s über c Werte (Näherung wie libFLAC; obere Schranke der echten Bits)
const POT = new Float64Array(32); for (let i = 0; i < 32; i++) POT[i] = 2 ** -i;
let kostK = 0;
function kosten(s, c) {
  if (!c) { kostK = 0; return 0; }
  const mittel = s / c;
  let k = mittel > 2 ? Math.min(30, Math.floor(Math.log2(mittel))) : 0;
  let best = c * (k + 1) + Math.floor(s * POT[k]), bk = k;
  if (k > 0) { const b = c * k + Math.floor(s * POT[k - 1]); if (b < best) { best = b; bk = k - 1; } }
  if (k < 30) { const b = c * (k + 2) + Math.floor(s * POT[k + 1]); if (b < best) { best = b; bk = k + 1; } }
  kostK = bk; return best;
}
const SUM = new Float64Array(256), CNT = new Int32Array(256);
function riceplan(r, n, o) {
  let pmax = 0; while (pmax < 8 && (n % (2 << pmax)) === 0 && (n >> (pmax + 1)) > o) pmax++;
  const teileMax = 1 << pmax, len = n >> pmax;
  for (let t = 0; t < teileMax; t++) {
    let s = 0; const a = t === 0 ? o : t * len, e = (t + 1) * len;
    for (let i = a; i < e; i++) { const v = r[i]; s += v >= 0 ? v * 2 : -v * 2 - 1; }
    SUM[t] = s; CNT[t] = e - a;
  }
  let best = null;
  for (let po = pmax; po >= 0; po--) {
    const teile = 1 << po, schritt = teileMax / teile; let bits = 6; const ks = [];
    for (let t = 0; t < teile; t++) {
      let s = 0, c = 0; for (let j = t * schritt; j < (t + 1) * schritt; j++) { s += SUM[j]; c += CNT[j]; }
      bits += kosten(s, c) + 5; ks.push(kostK);
    }
    if (!best || bits < best.bits) best = { po, k: ks, bits };
  }
  best.bits += o * 25 + 8;
  return best;
}

/**
 * Ganze Datei als FLAC-Strom: for await (const stueck of flacStrom(file, kopf, beiPcm)) … (Uint8Array, eigene Kopie).
 * beiPcm(u8) bekommt die Original-PCM-Bytes (für die Prüfsumme der PCM-Daten).
 */
export async function* flacStrom(file, kopf, beiPcm = null, lesen = 1 << 22) {
  const enc = new FlacKodierer(kopf);
  yield enc.kopf();
  const ba = kopf.blockAlign, blockBytes = BLOCK * ba;
  const stueck = Math.max(1, Math.floor(lesen / blockBytes)) * blockBytes;
  const ende = kopf.dataOffset + kopf.frames * ba;
  for (let a = kopf.dataOffset; a < ende; a += stueck) {
    const u8 = new Uint8Array(await file.slice(a, Math.min(ende, a + stueck)).arrayBuffer());
    if (beiPcm) beiPcm(u8);
    const teile = []; let summe = 0;
    for (let o = 0; o < u8.length; o += blockBytes) {
      const n = Math.min(BLOCK, Math.floor((u8.length - o) / ba));
      if (n <= 0) break;
      const r = enc.rahmen(u8, o, n); teile.push(r.slice()); summe += r.length;
    }
    const aus = new Uint8Array(summe); let p = 0; for (const t of teile) { aus.set(t, p); p += t.length; }
    yield aus;
  }
}
