export async function ladeAudio(file) {
  let buf, name = 'Aufnahme';
  if (file instanceof ArrayBuffer) buf = file;
  else if (ArrayBuffer.isView(file)) buf = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
  else if (file && typeof file.arrayBuffer === 'function') { buf = await file.arrayBuffer(); name = file.name || name; }
  else throw new Error('laden: keine Datei');
  if (buf.byteLength < 12) throw new Error('Datei ist leer oder zu kurz');

  let r = wavLesen(buf) || aiffLesen(buf);
  if (!r) r = await dekodieren(buf, flacRate(buf) || mp3Rate(buf));
  const x = mono(r.kanaele);
  return { x, sr: r.sr, name, kanaele: r.kanaele.length, bits: r.bits, format: r.format, dauer: x.length / r.sr };
}

function mono(k) {
  if (k.length === 1) return k[0];
  const n = k[0].length, x = new Float32Array(n), g = 1 / k.length;
  for (const c of k) for (let i = 0; i < n; i++) x[i] += c[i];
  for (let i = 0; i < n; i++) x[i] *= g;
  return x;
}

function kennung(dv, o) {
  return String.fromCharCode(dv.getUint8(o), dv.getUint8(o + 1), dv.getUint8(o + 2), dv.getUint8(o + 3));
}

export function wavLesen(buf) {
  if (ArrayBuffer.isView(buf)) buf = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  const dv = new DataView(buf), len = buf.byteLength;
  if (len < 12) return null;
  const riff = kennung(dv, 0);
  if ((riff !== 'RIFF' && riff !== 'RF64') || kennung(dv, 8) !== 'WAVE') return null;
  let o = 12, fmt = null, datO = -1, datL = 0;
  while (o + 8 <= len) {
    const id = kennung(dv, o); let sz = dv.getUint32(o + 4, true); const k = o + 8;
    if (id === 'fmt ') {
      let f = dv.getUint16(k, true);
      const ch = dv.getUint16(k + 2, true), sr = dv.getUint32(k + 4, true);
      const ba = dv.getUint16(k + 12, true), bits = dv.getUint16(k + 14, true);
      if (f === 0xFFFE && sz >= 26) f = dv.getUint16(k + 24, true); // Extensible: Unterformat
      fmt = { f, ch, sr, ba, bits };
    } else if (id === 'data') {
      datO = k;
      if (sz === 0 || sz === 0xFFFFFFFF || k + sz > len) sz = len - k; // Streaming/abgeschnittene Dateien
      datL = sz;
      if (fmt) break;
    }
    o = k + sz + (sz & 1);
  }
  if (!fmt || datO < 0) throw new Error('WAV ohne fmt/data');
  const { f, ch, sr, bits } = fmt;
  const bps = bits >> 3, ba = fmt.ba || ch * bps;
  if (!ch || !sr || !bps) throw new Error('WAV: ungültiger Kopf');
  const n = Math.floor(datL / ba);
  const kan = []; for (let c = 0; c < ch; c++) kan.push(new Float32Array(n));
  const u = new Uint8Array(buf, datO, n * ba);
  if (f === 1) {
    if (bits === 16) {
      for (let i = 0, p = 0; i < n; i++, p += ba) for (let c = 0, q = p; c < ch; c++, q += 2) {
        const v = u[q] | (u[q + 1] << 8); kan[c][i] = (v > 32767 ? v - 65536 : v) / 32768;
      }
    } else if (bits === 24) {
      for (let i = 0, p = 0; i < n; i++, p += ba) for (let c = 0, q = p; c < ch; c++, q += 3) {
        const v = (u[q] | (u[q + 1] << 8) | (u[q + 2] << 16)) << 8 >> 8; kan[c][i] = v / 8388608;
      }
    } else if (bits === 32) {
      for (let i = 0, p = 0; i < n; i++, p += ba) for (let c = 0, q = p; c < ch; c++, q += 4) {
        kan[c][i] = dv.getInt32(datO + q, true) / 2147483648;
      }
    } else if (bits === 8) {
      for (let i = 0, p = 0; i < n; i++, p += ba) for (let c = 0; c < ch; c++) kan[c][i] = (u[p + c] - 128) / 128;
    } else throw new Error('WAV: ' + bits + ' bit nicht unterstützt');
  } else if (f === 3) {
    for (let i = 0, p = datO; i < n; i++, p += ba) for (let c = 0, q = p; c < ch; c++, q += bps) {
      kan[c][i] = bits === 64 ? dv.getFloat64(q, true) : dv.getFloat32(q, true);
    }
  } else return null; // komprimiertes WAV (z. B. ADPCM) → decodeAudioData versuchen
  return { kanaele: kan, sr, bits, format: f === 3 ? 'wav-float' : 'wav' };
}

function ext80(dv, o) { // IEEE 754 80-bit (AIFF-Abtastrate)
  const e = dv.getUint16(o) , s = e & 0x8000 ? -1 : 1, ex = (e & 0x7FFF) - 16383 - 63;
  const hi = dv.getUint32(o + 2), lo = dv.getUint32(o + 6);
  return s * (hi * 4294967296 + lo) * Math.pow(2, ex);
}

function aiffLesen(buf) {
  const dv = new DataView(buf), len = buf.byteLength;
  if (kennung(dv, 0) !== 'FORM') return null;
  const typ = kennung(dv, 8);
  if (typ !== 'AIFF' && typ !== 'AIFC') return null;
  let o = 12, comm = null, ssO = -1;
  while (o + 8 <= len) {
    const id = kennung(dv, o), sz = dv.getUint32(o + 4), k = o + 8;
    if (id === 'COMM') {
      comm = { ch: dv.getInt16(k), n: dv.getUint32(k + 2), bits: dv.getInt16(k + 6), sr: Math.round(ext80(dv, k + 8)), comp: 'NONE' };
      if (typ === 'AIFC' && sz >= 22) comm.comp = kennung(dv, k + 18);
    } else if (id === 'SSND') ssO = k + 8 + dv.getUint32(k);
    o = k + sz + (sz & 1);
  }
  if (!comm || ssO < 0) return null;
  const { ch, bits, sr } = comm, comp = comm.comp.toLowerCase();
  const flt = comp === 'fl32' || comp === 'fl64', le = comp === 'sowt';
  if (!flt && comp !== 'none' && !le) return null;
  const bps = flt ? (comp === 'fl64' ? 8 : 4) : (bits + 7) >> 3, ba = bps * ch;
  const n = Math.min(comm.n, Math.floor((len - ssO) / ba));
  const kan = []; for (let c = 0; c < ch; c++) kan.push(new Float32Array(n));
  const u = new Uint8Array(buf);
  for (let i = 0, p = ssO; i < n; i++) for (let c = 0; c < ch; c++, p += bps) {
    let v;
    if (flt) v = bps === 8 ? dv.getFloat64(p) : dv.getFloat32(p);
    else if (bps === 2) v = (le ? dv.getInt16(p, true) : dv.getInt16(p)) / 32768;
    else if (bps === 3) v = (le ? (u[p] | (u[p + 1] << 8) | (u[p + 2] << 16)) : ((u[p] << 16) | (u[p + 1] << 8) | u[p + 2])) << 8 >> 8, v /= 8388608;
    else if (bps === 4) v = (le ? dv.getInt32(p, true) : dv.getInt32(p)) / 2147483648;
    else v = dv.getInt8(p) / 128;
    kan[c][i] = v;
  }
  return { kanaele: kan, sr, bits: flt ? bps * 8 : bits, format: 'aiff' };
}

function flacRate(buf) { // FLAC STREAMINFO: originale Abtastrate, damit nicht umgerechnet wird
  try {
    const u = new Uint8Array(buf, 0, Math.min(64, buf.byteLength));
    if (u[0] === 0x66 && u[1] === 0x4C && u[2] === 0x61 && u[3] === 0x43) return (u[18] << 12) | (u[19] << 4) | (u[20] >> 4);
  } catch (e) { /* egal */ }
  return 0;
}

function mp3Rate(buf) { // MP3-Rahmenkopf: originale Abtastrate (44,1 kHz bleibt 44,1 kHz statt auf 48 kHz umgerechnet)
  try {
    const u = new Uint8Array(buf);
    let i = 0;
    if (u[0] === 0x49 && u[1] === 0x44 && u[2] === 0x33) i = 10 + ((u[6] & 127) << 21 | (u[7] & 127) << 14 | (u[8] & 127) << 7 | (u[9] & 127)) + (u[5] & 16 ? 10 : 0);
    else if (u[0] !== 0xFF || (u[1] & 0xE0) !== 0xE0) return 0; // kein MP3 (z. B. M4A) → nicht anfassen
    const n = Math.min(u.length - 4, i + 8192);
    for (; i < n; i++) {
      if (u[i] !== 0xFF || (u[i + 1] & 0xE0) !== 0xE0) continue;
      const ver = (u[i + 1] >> 3) & 3, lay = (u[i + 1] >> 1) & 3, br = u[i + 2] >> 4, si = (u[i + 2] >> 2) & 3;
      if (ver === 1 || lay === 0 || br === 0 || br === 15 || si === 3) continue;
      return [44100, 48000, 32000][si] / (ver === 3 ? 1 : ver === 2 ? 2 : 4);
    }
  } catch (e) { /* egal */ }
  return 0;
}

let dekoCtx = null;
async function dekodieren(buf, srWunsch) {
  const kopie = buf.slice(0); // decodeAudioData macht den Puffer unbrauchbar
  const OAC = G.OfflineAudioContext || G.webkitOfflineAudioContext;
  const AC = G.AudioContext || G.webkitAudioContext;
  let c = null;
  if (OAC) { try { c = new OAC(1, 1, srWunsch || 48000); } catch (e) { c = null; } }
  if (!c && AC) { if (!dekoCtx) dekoCtx = new AC(); c = dekoCtx; }
  if (!c) throw new Error('Dieses Format kann hier nicht gelesen werden – bitte WAV oder AIFF verwenden');
  const ab = await new Promise((res, rej) => {
    try {
      const p = c.decodeAudioData(kopie, res, () => rej(new Error('Datei konnte nicht dekodiert werden')));
      if (p && p.then) p.then(res, () => rej(new Error('Datei konnte nicht dekodiert werden')));
    } catch (e) { rej(e); }
  });
  const kan = []; for (let i = 0; i < ab.numberOfChannels; i++) kan.push(new Float32Array(ab.getChannelData(i)));
  return { kanaele: kan, sr: ab.sampleRate, bits: 0, format: 'dekodiert' };
}

