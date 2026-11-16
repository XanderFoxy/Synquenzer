// Mischpult 0.1 – zip.js: ZIP (STORE, ohne Kompression) aus Blobs, UTF-8-Namen (Bit 11).
// Aufbau nach va1ZipBlob (Synquenzer 4.76.1, index.html Zeile 76815), eigene Umsetzung. CRC kommt vom WAV-Schreiber mit.
import { crc32, crcVonBlob } from './wav.js';

const enc = new TextEncoder();
function dosZeit(d) {
  return { t: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), d: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate() };
}

/** Text als Eintrag vorbereiten: {name, blob, size, crc}. */
export function textEintrag(name, text, typ = 'text/plain;charset=utf-8') {
  const u8 = enc.encode(text); return { name, blob: new Blob([u8], { type: typ }), size: u8.length, crc: crc32(u8) };
}

/** Fehlende CRCs nachrechnen (async). */
export async function mitCrc(eintraege) {
  for (const e of eintraege) { if (e.size == null) e.size = e.blob.size; if (e.crc == null) e.crc = await crcVonBlob(e.blob); }
  return eintraege;
}

/** zipAusBlobs([{name, blob, size, crc}], datum?) → Blob (application/zip). Alle CRCs müssen bekannt sein. */
export function zipAusBlobs(eintraege, datum = new Date()) {
  const { t, d } = dosZeit(datum), teile = [], zentral = []; let off = 0;
  for (const e of eintraege) {
    if (e.crc == null) throw new Error('zip: CRC fehlt für ' + e.name);
    const nm = enc.encode(e.name), size = e.size ?? e.blob.size;
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
    h.setUint16(10, t, true); h.setUint16(12, d, true); h.setUint32(14, e.crc >>> 0, true); h.setUint32(18, size, true); h.setUint32(22, size, true);
    h.setUint16(26, nm.length, true); h.setUint16(28, 0, true);
    teile.push(h.buffer, nm, e.blob);
    const z = new DataView(new ArrayBuffer(46));
    z.setUint32(0, 0x02014b50, true); z.setUint16(4, 20, true); z.setUint16(6, 20, true); z.setUint16(8, 0x0800, true); z.setUint16(10, 0, true);
    z.setUint16(12, t, true); z.setUint16(14, d, true); z.setUint32(16, e.crc >>> 0, true); z.setUint32(20, size, true); z.setUint32(24, size, true);
    z.setUint16(28, nm.length, true); z.setUint32(42, off, true);
    zentral.push(z.buffer, nm);
    off += 30 + nm.length + size;
  }
  const zLen = zentral.reduce((s, x) => s + x.byteLength, 0);
  const ende = new DataView(new ArrayBuffer(22));
  ende.setUint32(0, 0x06054b50, true); ende.setUint16(8, eintraege.length, true); ende.setUint16(10, eintraege.length, true);
  ende.setUint32(12, zLen, true); ende.setUint32(16, off, true);
  return new Blob([...teile, ...zentral, ende.buffer], { type: 'application/zip' });
}
