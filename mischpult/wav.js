// Mischpult 0.1 – wav.js: WAV/AIFF lesen (stückweise über File.slice, nie decodeAudioData), WAV 24 Bit schreiben, CRC32.
// Eigene Umsetzung. Kein DOM. Läuft im Worker, im Hauptfaden und in Node (Blob/File aus node:buffer bzw. fs.openAsBlob).

export const STUECK = 1 << 17; // 131 072 Proben (Konzept 0.7, C.5)

// ---------- CRC32 (Polynom 0xEDB88320; Muster va1Crc, Synquenzer 4.76.1 index.html Zeile 76809) ----------
const CRC_T = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
/** CRC32 fortlaufend: crc32(teil2, crc32(teil1)) == crc32(teil1+teil2). Startwert 0. */
export function crc32(u8, crc = 0) {
  let c = (crc ^ 0xFFFFFFFF) >>> 0;
  for (let i = 0; i < u8.length; i++) c = CRC_T[(c ^ u8[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
export async function crcVonBlob(blob) {
  let crc = 0; const S = 1 << 22;
  for (let a = 0; a < blob.size; a += S) crc = crc32(new Uint8Array(await blob.slice(a, Math.min(blob.size, a + S)).arrayBuffer()), crc);
  return crc;
}

const txt4 = (dv, o) => String.fromCharCode(dv.getUint8(o), dv.getUint8(o + 1), dv.getUint8(o + 2), dv.getUint8(o + 3));
async function bytes(file, a, b) { return new DataView(await file.slice(a, Math.min(b, file.size)).arrayBuffer()); }
function ext80(dv, o) { // IEEE 754 80-Bit (AIFF-Abtastrate)
  const e = dv.getUint16(o) & 0x7FFF, hi = dv.getUint32(o + 2), lo = dv.getUint32(o + 6);
  if (!e && !hi && !lo) return 0;
  return (hi * 2 ** 32 + lo) * 2 ** (e - 16383 - 63);
}

/**
 * Kopf lesen. Ergebnis: {format:'wav'|'aiff', sr, ch, bits, float, le, frames, dataOffset, blockAlign, name, size, hinweis?}
 * Unterstützt: WAV PCM 8/16/24/32 Int, Float 32/64, WAVE_FORMAT_EXTENSIBLE, LIST/ungerade Blöcke vor `data`,
 * data-Größe 0 oder 0xFFFFFFFF (Länge aus der Dateigröße); AIFF und AIFF-C (NONE, sowt, fl32/FL32).
 * Wirft Error('kein-wav') bei anderen Formaten (dann Weg „dekodieren“, C.4 Regel 2).
 */
export async function lesKopf(file) {
  const kopf = { name: file.name || 'Spur', size: file.size };
  let dv = await bytes(file, 0, 65536);
  if (dv.byteLength < 12) throw new Error('kein-wav');
  const id = txt4(dv, 0), typ = txt4(dv, 8);
  const lesBlockKopf = async (o, le) => {
    if (o + 8 <= dv.byteLength) return { id: txt4(dv, o), len: dv.getUint32(o + 4, le) };
    const d = await bytes(file, o, o + 8); if (d.byteLength < 8) return null;
    return { id: txt4(d, 0), len: d.getUint32(4, le) };
  };
  const blockDaten = async (o, len) => (o + len <= dv.byteLength) ? new DataView(dv.buffer, dv.byteOffset + o, len) : bytes(file, o, o + len);
  if ((id === 'RIFF' || id === 'RF64') && typ === 'WAVE') {
    let o = 12, fmt = null;
    while (o + 8 <= file.size) {
      const b = await lesBlockKopf(o, true); if (!b) break;
      if (b.id === 'fmt ') {
        const f = await blockDaten(o + 8, Math.min(b.len, 40));
        let tag = f.getUint16(0, true);
        fmt = { tag, ch: f.getUint16(2, true), sr: f.getUint32(4, true), blockAlign: f.getUint16(12, true), bits: f.getUint16(14, true) };
        if (tag === 0xFFFE && b.len >= 26) fmt.tag = f.getUint16(24, true); // Subformat-GUID, erste 2 Bytes
      } else if (b.id === 'data') {
        if (!fmt) throw new Error('kein-wav');
        let len = b.len;
        const rest = file.size - (o + 8);
        if (len === 0 || len === 0xFFFFFFFF || len > rest) len = rest;
        const float = fmt.tag === 3;
        if (!(fmt.tag === 1 || float)) throw new Error('kein-wav');
        const bpS = fmt.bits >> 3;
        const blockAlign = fmt.blockAlign || bpS * fmt.ch;
        return Object.assign(kopf, { format: 'wav', sr: fmt.sr, ch: fmt.ch, bits: fmt.bits, float, le: true, frames: Math.floor(len / blockAlign), dataOffset: o + 8, blockAlign });
      }
      o += 8 + b.len + (b.len & 1); // ungerade Blöcke haben ein Füllbyte
    }
    throw new Error('kein-wav');
  }
  if (id === 'FORM' && (typ === 'AIFF' || typ === 'AIFC')) {
    let o = 12, comm = null;
    while (o + 8 <= file.size) {
      const b = await lesBlockKopf(o, false); if (!b) break;
      if (b.id === 'COMM') {
        const c = await blockDaten(o + 8, Math.min(b.len, 64));
        comm = { ch: c.getInt16(0), frames: c.getUint32(2), bits: c.getInt16(6), sr: ext80(c, 8), comp: typ === 'AIFC' && b.len >= 22 ? txt4(c, 18) : 'NONE' };
      } else if (b.id === 'SSND') {
        if (!comm) throw new Error('kein-wav');
        const s = await blockDaten(o + 8, 8);
        const off = s.getUint32(0, false);
        const comp = comm.comp;
        const float = comp === 'fl32' || comp === 'FL32';
        if (!(comp === 'NONE' || comp === 'sowt' || comp === 'twos' || float)) throw new Error('kein-wav');
        const bits = float ? 32 : comm.bits, bpS = Math.ceil(bits / 8);
        const dataOffset = o + 16 + off, blockAlign = bpS * comm.ch;
        const frames = Math.min(comm.frames, Math.floor((file.size - dataOffset) / blockAlign));
        return Object.assign(kopf, { format: 'aiff', sr: Math.round(comm.sr), ch: comm.ch, bits: bpS * 8, float, le: comp === 'sowt', frames, dataOffset, blockAlign });
      }
      o += 8 + b.len + (b.len & 1);
    }
    throw new Error('kein-wav');
  }
  throw new Error('kein-wav');
}

/** Rohbytes eines Bereichs in Float32 L/R wandeln (Mono → L = R, mehr als 2 Kanäle → die ersten zwei). */
export function wandle(dv, kopf, n) {
  const L = new Float32Array(n), R = new Float32Array(n);
  const { ch, bits, float, le, blockAlign } = kopf, bp = bits >> 3, c2 = ch > 1 ? 1 : 0;
  for (let i = 0; i < n; i++) {
    const o = i * blockAlign;
    for (let c = 0; c <= c2; c++) {
      const p = o + c * bp; let v;
      if (float) v = bits === 64 ? dv.getFloat64(p, le) : dv.getFloat32(p, le);
      else if (bits === 16) v = dv.getInt16(p, le) / 32768;
      else if (bits === 24) {
        const x = le ? (dv.getUint8(p) | (dv.getUint8(p + 1) << 8) | (dv.getInt8(p + 2) << 16))
          : (dv.getUint8(p + 2) | (dv.getUint8(p + 1) << 8) | (dv.getInt8(p) << 16));
        v = x / 8388608;
      } else if (bits === 32) v = dv.getInt32(p, le) / 2147483648;
      else if (bits === 8) v = kopf.format === 'wav' ? (dv.getUint8(p) - 128) / 128 : dv.getInt8(p) / 128;
      else v = 0;
      if (c === 0) L[i] = v; else R[i] = v;
    }
    if (!c2) R[i] = L[i];
  }
  return { L, R };
}

/**
 * Proben stückweise lesen: for await (const {pos, L, R} of lesStuecke(file, kopf, {frames, start, end})) …
 * Liest nur die Bytes des Stücks (File.slice). Über das Dateiende hinaus wird mit Stille aufgefüllt, wenn end > kopf.frames.
 */
export async function* lesStuecke(file, kopf, { frames = STUECK, start = 0, end = kopf.frames } = {}) {
  for (let pos = start; pos < end; pos += frames) {
    const n = Math.min(frames, end - pos);
    const nDa = Math.max(0, Math.min(n, kopf.frames - pos));
    let L, R;
    if (nDa > 0) {
      const a = kopf.dataOffset + pos * kopf.blockAlign;
      const dv = await bytes(file, a, a + nDa * kopf.blockAlign);
      ({ L, R } = wandle(dv, kopf, Math.min(nDa, Math.floor(dv.byteLength / kopf.blockAlign))));
      if (L.length < n) { const L2 = new Float32Array(n), R2 = new Float32Array(n); L2.set(L); R2.set(R); L = L2; R = R2; }
    } else { L = new Float32Array(n); R = new Float32Array(n); }
    yield { pos, L, R };
  }
}

/** Ein Stück an beliebiger Stelle lesen (für Schnellblick/Abhören). */
export async function lesBereich(file, kopf, start, n) {
  for await (const s of lesStuecke(file, kopf, { frames: n, start, end: start + n })) return s;
  return { pos: start, L: new Float32Array(0), R: new Float32Array(0) };
}

// ---------- WAV 24 Bit schreiben ----------
function wavKopf(sr, frames, ch = 2, bits = 24) {
  const ba = ch * bits / 8, len = frames * ba, b = new ArrayBuffer(44), d = new DataView(b), s = (o, t) => { for (let i = 0; i < 4; i++) d.setUint8(o + i, t.charCodeAt(i)); };
  s(0, 'RIFF'); d.setUint32(4, 36 + len + (len & 1), true); s(8, 'WAVE'); s(12, 'fmt '); d.setUint32(16, 16, true);
  d.setUint16(20, 1, true); d.setUint16(22, ch, true); d.setUint32(24, sr, true); d.setUint32(28, sr * ba, true);
  d.setUint16(32, ba, true); d.setUint16(34, bits, true); s(36, 'data'); d.setUint32(40, len, true);
  return new Uint8Array(b);
}

/** Zufallszahlen mit festem Startwert (mulberry32) – Dither ist dadurch wiederholbar (T5 bitgleich). */
export function zufall(seed = 1) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/**
 * new WavSchreiber24(sr, frames, {dither = true, seed = 1, senke})
 *  .schreib(L, R)   – beliebig große Stücke, in Reihenfolge
 *  .fertig()        – {blob, crc, size, clips}; wirft, wenn nicht genau `frames` Proben geschrieben wurden.
 * TPDF-Dither ±1 LSB (methodik master.kette ausgabe). senke (optional): {schreib(u8), fertig() → Blob} z. B. OPFS.
 */
export class WavSchreiber24 {
  constructor(sr, frames, { dither = true, seed = 1, senke = null } = {}) {
    this.sr = sr; this.frames = frames; this.n = 0; this.dither = dither; this.rnd = zufall(seed); this.senke = senke;
    this.teile = []; this.tb = 0; this.blobs = []; this.clips = 0;
    const k = wavKopf(sr, frames); this.crc = crc32(k); this.size = k.length; this._push(k, false);
  }
  // Speicher: alle ~8 MB werden die Teile zu einem Blob zusammengefasst und freigegeben – am Ende entsteht der Blob aus Blobs
  // (keine zweite Kopie der ganzen Datei im Arbeitsspeicher).
  _push(u8, zaehle = true) {
    if (zaehle) { this.crc = crc32(u8, this.crc); this.size += u8.length; }
    if (this.senke) return this.senke.schreib(u8);
    this.teile.push(u8); this.tb += u8.length;
    if (this.tb >= 8 << 20) { this.blobs.push(new Blob(this.teile)); this.teile = []; this.tb = 0; }
  }
  schreib(L, R) {
    const n = L.length; if (this.n + n > this.frames) throw new Error('WavSchreiber24: zu viele Proben');
    const u8 = new Uint8Array(n * 6), rnd = this.rnd, d = this.dither;
    for (let i = 0, o = 0; i < n; i++) {
      for (let c = 0; c < 2; c++) {
        let v = (c ? R[i] : L[i]) * 8388608;
        if (d) v += rnd() - rnd();               // TPDF, ±1 LSB
        let q = Math.round(v);
        if (q > 8388607) { q = 8388607; this.clips++; } else if (q < -8388608) { q = -8388608; this.clips++; }
        u8[o++] = q & 255; u8[o++] = (q >> 8) & 255; u8[o++] = (q >> 16) & 255;
      }
    }
    this.n += n; this._push(u8);
  }
  async fertig() {
    if (this.n !== this.frames) throw new Error(`WavSchreiber24: ${this.n} statt ${this.frames} Proben`);
    if ((this.frames * 6) & 1) this._push(new Uint8Array(1));
    const blob = this.senke ? await this.senke.fertig() : new Blob([...this.blobs, ...this.teile], { type: 'audio/wav' });
    this.teile = []; this.blobs = []; this.tb = 0;
    return { blob, crc: this.crc, size: this.size, clips: this.clips };
  }
}
