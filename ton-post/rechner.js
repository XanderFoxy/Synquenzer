// Ton-Post – rechner.js (Worker): Prüfsumme (SHA-256) stückweise, FLAC-Größe messen, FLAC-Teile liefern.
// Liest nur Stücke über File.slice – der Speicher des iPhones bleibt geschont; der Hauptfaden bleibt frei.
import { Sha256 } from './sha256.js';
import { flacStrom } from './flac.js';

const STUECK = 1 << 22; // 4 MiB
let strom = null; // {id, it, pos, puffer:[], gepuffert, teilNr}

async function pruefsumme(id, file) {
  const h = new Sha256(); let t = 0;
  for (let a = 0; a < file.size; a += STUECK) {
    const u8 = new Uint8Array(await file.slice(a, Math.min(file.size, a + STUECK)).arrayBuffer());
    h.update(u8);
    const jetzt = Date.now(); if (jetzt - t > 120) { t = jetzt; postMessage({ art: 'fort', id, fertig: a + u8.length }); }
  }
  return h.hex();
}

async function flacMass(id, file, kopf) {
  const h = new Sha256(); let groesse = 0, gelesen = 0, t = 0;
  for await (const s of flacStrom(file, kopf, (pcm) => { h.update(pcm); gelesen += pcm.length; })) {
    groesse += s.length;
    const jetzt = Date.now(); if (jetzt - t > 120) { t = jetzt; postMessage({ art: 'fort', id, fertig: kopf.dataOffset + gelesen }); }
  }
  return { groesse, sha256_pcm: h.hex() };
}

// Teil nr (0-basiert) der FLAC-Datei: Strom läuft weiter, wenn möglich; sonst von vorn (gleiche Bytes, deterministisch).
async function flacTeil(id, file, kopf, nr, teilGroesse) {
  if (!strom || strom.id !== id || strom.teilNr > nr) strom = { id, it: flacStrom(file, kopf), puffer: [], gepuffert: 0, teilNr: 0, ende: false };
  const s = strom;
  for (;;) {
    while (!s.ende && s.gepuffert < teilGroesse) {
      const r = await s.it.next();
      if (r.done) s.ende = true; else { s.puffer.push(r.value); s.gepuffert += r.value.length; }
    }
    const n = Math.min(teilGroesse, s.gepuffert);
    const teil = new Uint8Array(n); let p = 0;
    while (p < n) {
      const b = s.puffer[0], k = Math.min(b.length, n - p);
      teil.set(b.subarray(0, k), p); p += k;
      if (k === b.length) s.puffer.shift(); else s.puffer[0] = b.subarray(k);
    }
    s.gepuffert -= n;
    const nrJetzt = s.teilNr++;
    const letzt = s.ende && s.gepuffert === 0;
    if (nrJetzt === nr) return { teil, letzt };
    if (letzt) throw new Error('teil-fehlt');
  }
}

onmessage = async (e) => {
  const m = e.data;
  try {
    if (m.art === 'hash') postMessage({ art: 'hash', id: m.id, sha256: await pruefsumme(m.id, m.file) });
    else if (m.art === 'flac-mass') postMessage({ art: 'flac-mass', id: m.id, ...(await flacMass(m.id, m.file, m.kopf)) });
    else if (m.art === 'flac-teil') {
      const { teil, letzt } = await flacTeil(m.id, m.file, m.kopf, m.nr, m.teilGroesse);
      postMessage({ art: 'flac-teil', id: m.id, nr: m.nr, teil, letzt }, [teil.buffer]);
    }
  } catch (err) { postMessage({ art: 'fehler', id: m.id, text: String(err && err.message || err) }); }
};
