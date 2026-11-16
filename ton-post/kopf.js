// Ton-Post – kopf.js: Dateikopf lesen (WAV/RF64/W64-frei, AIFF/AIFF-C, FLAC, ZIP), ohne die ganze Datei zu laden.
// Kein DOM; läuft im Hauptfaden, im Worker und in Node (Blob/File).
const txt4 = (dv, o) => String.fromCharCode(dv.getUint8(o), dv.getUint8(o + 1), dv.getUint8(o + 2), dv.getUint8(o + 3));
async function lies(file, a, b) { return new DataView(await file.slice(a, Math.min(b, file.size)).arrayBuffer()); }
function ext80(dv, o) {
  const e = dv.getUint16(o) & 0x7FFF, hi = dv.getUint32(o + 2), lo = dv.getUint32(o + 6);
  if (!e && !hi && !lo) return 0;
  return (hi * 2 ** 32 + lo) * 2 ** (e - 16383 - 63);
}

/**
 * Ergebnis: {format:'wav'|'aiff'|'flac'|'zip'|'?', kanaele, rate, bits, float, le, frames, dauer_s, dataOffset, dataLen, blockAlign}
 * Unbekanntes wird nie zum Fehler: format '?' – die Datei geht trotzdem unverändert mit.
 */
export async function lesKopf(file) {
  const k = { format: '?', kanaele: 0, rate: 0, bits: 0, float: false, le: true, frames: 0, dauer_s: 0 };
  if (!file.size || file.size < 12) return k;
  const dv = await lies(file, 0, 65536);
  const id = txt4(dv, 0), typ = txt4(dv, 8);
  const blockKopf = async (o, le) => {
    if (o + 8 <= dv.byteLength) return { id: txt4(dv, o), len: dv.getUint32(o + 4, le) };
    const d = await lies(file, o, o + 8); return d.byteLength < 8 ? null : { id: txt4(d, 0), len: d.getUint32(4, le) };
  };
  const daten = async (o, len) => (o + len <= dv.byteLength) ? new DataView(dv.buffer, o, len) : lies(file, o, o + len);
  try {
    if ((id === 'RIFF' || id === 'RF64') && typ === 'WAVE') {
      let o = 12, fmt = null, ds64 = 0;
      for (let schritte = 0; o + 8 <= file.size && schritte < 4096; schritte++) {
        const b = await blockKopf(o, true); if (!b) break;
        if (b.id === 'ds64' && b.len >= 24) { const d = await daten(o + 8, 24); ds64 = d.getUint32(16, true) + d.getUint32(20, true) * 4294967296; }
        else if (b.id === 'fmt ') {
          const f = await daten(o + 8, Math.min(b.len, 40));
          let tag = f.getUint16(0, true);
          if (tag === 0xFFFE && b.len >= 26) tag = f.getUint16(24, true);
          fmt = { tag, ch: f.getUint16(2, true), sr: f.getUint32(4, true), ba: f.getUint16(12, true), bits: f.getUint16(14, true) };
        } else if (b.id === 'data') {
          if (!fmt) break;
          const rest = file.size - (o + 8);
          let len = b.len === 0xFFFFFFFF && ds64 ? ds64 : b.len;
          if (len === 0 || len === 0xFFFFFFFF || len > rest) len = rest;
          const ba = fmt.ba || (fmt.bits >> 3) * fmt.ch;
          Object.assign(k, { format: 'wav', kanaele: fmt.ch, rate: fmt.sr, bits: fmt.bits, float: fmt.tag === 3, pcm: fmt.tag === 1 || fmt.tag === 3, le: true, dataOffset: o + 8, dataLen: len, blockAlign: ba });
          k.frames = ba ? Math.floor(len / ba) : 0;
          break;
        }
        o += 8 + b.len + (b.len & 1);
      }
      if (k.format !== 'wav') k.format = 'wav';
    } else if (id === 'FORM' && (typ === 'AIFF' || typ === 'AIFC')) {
      let o = 12, comm = null;
      for (let schritte = 0; o + 8 <= file.size && schritte < 4096; schritte++) {
        const b = await blockKopf(o, false); if (!b) break;
        if (b.id === 'COMM') {
          const c = await daten(o + 8, Math.min(b.len, 64));
          comm = { ch: c.getInt16(0), frames: c.getUint32(2), bits: c.getInt16(6), sr: ext80(c, 8), comp: typ === 'AIFC' && b.len >= 22 ? txt4(c, 18) : 'NONE' };
        } else if (b.id === 'SSND' && comm) {
          const s = await daten(o + 8, 8), off = s.getUint32(0, false);
          const float = comm.comp === 'fl32' || comm.comp === 'FL32', bits = float ? 32 : comm.bits, bp = Math.ceil(bits / 8);
          const dataOffset = o + 16 + off, ba = bp * comm.ch;
          const frames = Math.min(comm.frames, Math.floor((file.size - dataOffset) / ba));
          Object.assign(k, { format: 'aiff', kanaele: comm.ch, rate: Math.round(comm.sr), bits: bp * 8, float, le: comm.comp === 'sowt',
            pcm: ['NONE', 'sowt', 'twos'].includes(comm.comp) || float, frames, dataOffset, dataLen: frames * ba, blockAlign: ba });
          break;
        }
        o += 8 + b.len + (b.len & 1);
      }
      if (k.format !== 'aiff') k.format = 'aiff';
    } else if (id === 'fLaC') {
      // erster Metadatenblock muss STREAMINFO sein (Typ 0, 34 Byte)
      const sr = (dv.getUint8(18) << 12) | (dv.getUint8(19) << 4) | (dv.getUint8(20) >> 4);
      const ch = ((dv.getUint8(20) >> 1) & 7) + 1, bits = (((dv.getUint8(20) & 1) << 4) | (dv.getUint8(21) >> 4)) + 1;
      const frames = (dv.getUint8(21) & 15) * 4294967296 + dv.getUint32(22);
      Object.assign(k, { format: 'flac', kanaele: ch, rate: sr, bits, frames });
    } else if (dv.getUint32(0, true) === 0x04034b50) {
      k.format = 'zip';
    }
  } catch { /* kaputter Kopf: format bleibt, Datei geht unverändert mit */ }
  k.dauer_s = k.rate ? Math.round(k.frames / k.rate * 1000) / 1000 : 0;
  return k;
}

/**
 * Schnellblick „stumm?“: liest 48 kleine Fenster verteilt über die Daten (zusammen < 1 MB).
 * Ergebnis: true (wahrscheinlich stumm), false (Ton gefunden) oder null (nicht prüfbar).
 */
export async function wohlStumm(file, k) {
  if (!k.pcm || !k.dataLen || !k.blockAlign) return null;
  const bp = k.bits >> 3, fenster = 48, gr = Math.min(k.dataLen, 16384 - (16384 % k.blockAlign));
  const schwelle = k.float ? 3e-5 : (2 ** (k.bits - 1)) * 3e-5; // ~ −90 dBFS
  for (let f = 0; f < fenster; f++) {
    const start = k.dataOffset + Math.floor(((k.dataLen - gr) * f / (fenster - 1)) / k.blockAlign) * k.blockAlign;
    const dv = await lies(file, start, start + gr);
    const n = Math.floor(dv.byteLength / bp);
    for (let i = 0; i < n; i++) {
      const p = i * bp; let v;
      if (k.float) v = bits64(k) ? dv.getFloat64(p, k.le) : dv.getFloat32(p, k.le);
      else if (bp === 2) v = dv.getInt16(p, k.le);
      else if (bp === 3) v = k.le ? (dv.getUint8(p) | (dv.getUint8(p + 1) << 8) | (dv.getInt8(p + 2) << 16)) : (dv.getUint8(p + 2) | (dv.getUint8(p + 1) << 8) | (dv.getInt8(p) << 16));
      else if (bp === 4) v = dv.getInt32(p, k.le);
      else if (bp === 1) v = k.format === 'wav' ? dv.getUint8(p) - 128 : dv.getInt8(p);
      else return null;
      if (v > schwelle || v < -schwelle) return false;
    }
  }
  return true;
}
const bits64 = (k) => k.bits === 64;
