// einlesen.js – MusicXML (.musicxml/.xml), komprimiertes MusicXML (.mxl) und MIDI (.mid) → Stück.
// Alles lokal im Gerät, nichts wird gesendet. Läuft im Browser und in Node (≥ 18).
import { midiAus, schreibweiseAus, taktDauer } from './modell.js';

const fehler = (art, text) => Object.assign(new Error(text), { art, text });

/** PDF/Foto: ehrlich – keine erfundene Erkennung. */
export async function bildErkennen() {
  throw fehler('nicht-verfuegbar', 'Notenerkennung aus Bildern kommt über Claude: Datei über die Ton-Post schicken');
}

/**
 * @param {File|Blob|ArrayBuffer|Uint8Array|string} quelle
 * @param {string} [name] Dateiname (für die Endung)
 */
export async function einlesen(quelle, name = '') {
  if (!name && quelle && typeof quelle === 'object' && 'name' in quelle) name = quelle.name;
  const endung = (name.match(/\.([a-z0-9]+)$/i)?.[1] || '').toLowerCase();
  let bytes = null, text = null;
  if (typeof quelle === 'string') text = quelle;
  else if (quelle instanceof ArrayBuffer) bytes = new Uint8Array(quelle);
  else if (ArrayBuffer.isView(quelle)) bytes = new Uint8Array(quelle.buffer, quelle.byteOffset, quelle.byteLength);
  else if (quelle && typeof quelle.arrayBuffer === 'function') bytes = new Uint8Array(await quelle.arrayBuffer());
  else throw fehler('format', 'Unbekannte Quelle');

  const titelAusName = name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
  if (bytes) {
    const b0 = bytes[0], b1 = bytes[1], b2 = bytes[2], b3 = bytes[3];
    if (b0 === 0x4d && b1 === 0x54 && b2 === 0x68 && b3 === 0x64) return ausMidi(bytes, titelAusName); // MThd
    if (b0 === 0x50 && b1 === 0x4b) return ausMusicXML(await mxlEntpacken(bytes), titelAusName); // PK (ZIP)
    if (b0 === 0x25 && b1 === 0x50 && b2 === 0x44 && b3 === 0x46) return bildErkennen(); // %PDF
    if ((b0 === 0xff && b1 === 0xd8) || (b0 === 0x89 && b1 === 0x50) || ['jpg', 'jpeg', 'png', 'heic', 'webp', 'pdf'].includes(endung)) return bildErkennen();
    text = new TextDecoder(b0 === 0xff && b1 === 0xfe ? 'utf-16le' : b0 === 0xfe && b1 === 0xff ? 'utf-16be' : 'utf-8').decode(bytes);
  }
  if (/<score-(partwise|timewise)/.test(text)) return ausMusicXML(text, titelAusName);
  throw fehler('format', 'Dieses Format kenne ich nicht. Möglich: MusicXML (.musicxml, .xml, .mxl) oder MIDI (.mid).');
}

// ───────────────────────── kleiner XML-Leser (ohne DOM, auch in Node) ─────────────────────────
const ENT = { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" };
const dekodiere = (s) => s.indexOf('&') < 0 ? s : s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) =>
  e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : +e.slice(1)) : ENT[e] ?? m);

export function xmlLesen(text) {
  const root = { name: '#doc', attrs: {}, kinder: [], text: '' };
  const stapel = [root];
  const n = text.length;
  const attrRe = /\s*([^\s=/>]+)\s*=\s*("([^"]*)"|'([^']*)')/y;
  let i = 0;
  while (i < n) {
    const lt = text.indexOf('<', i);
    const oben = stapel[stapel.length - 1];
    if (lt < 0) break;
    if (lt > i) oben.text += dekodiere(text.slice(i, lt));
    if (text.startsWith('<!--', lt)) { const e = text.indexOf('-->', lt); i = e < 0 ? n : e + 3; continue; }
    if (text.startsWith('<![CDATA[', lt)) { const e = text.indexOf(']]>', lt); oben.text += text.slice(lt + 9, e); i = e + 3; continue; }
    if (text[lt + 1] === '?') { const e = text.indexOf('?>', lt); i = e + 2; continue; }
    if (text[lt + 1] === '!') {
      let j = lt + 2, tiefe = 0;
      for (; j < n; j++) { const c = text[j]; if (c === '[') tiefe++; else if (c === ']') tiefe--; else if (c === '>' && tiefe <= 0) break; }
      i = j + 1; continue;
    }
    if (text[lt + 1] === '/') { if (stapel.length > 1) stapel.pop(); i = text.indexOf('>', lt) + 1; continue; }
    let j = lt + 1;
    while (j < n && !/[\s/>]/.test(text[j])) j++;
    const el = { name: text.slice(lt + 1, j), attrs: {}, kinder: [], text: '' };
    attrRe.lastIndex = j;
    let m;
    while ((m = attrRe.exec(text))) { el.attrs[m[1]] = dekodiere(m[3] ?? m[4]); j = attrRe.lastIndex; }
    while (j < n && text[j] !== '>' && text[j] !== '/') j++;
    const zu = text[j] === '/';
    i = text.indexOf('>', j) + 1;
    oben.kinder.push(el);
    if (!zu) stapel.push(el);
  }
  return root;
}
const kind = (el, name) => el?.kinder.find((k) => k.name === name);
const alle = (el, name) => (el ? el.kinder.filter((k) => k.name === name) : []);
const txt = (el, name, d = '') => { const k = name ? kind(el, name) : el; return k ? k.text.trim() : d; };
const zahl = (el, name, d = 0) => { const v = parseFloat(txt(el, name, '')); return Number.isFinite(v) ? v : d; };

// ───────────────────────── MusicXML ─────────────────────────
const STEP = { C: 'C', D: 'D', E: 'E', F: 'F', G: 'G', A: 'A', B: 'H' };

export function ausMusicXML(text, titelAusName = '') {
  const doc = xmlLesen(text);
  let score = doc.kinder.find((k) => k.name === 'score-partwise' || k.name === 'score-timewise');
  if (!score) throw fehler('format', 'Keine MusicXML-Partitur gefunden');
  if (score.name === 'score-timewise') score = timewiseZuPartwise(score);

  const titel = txt(kind(score, 'work'), 'work-title') || txt(score, 'movement-title') ||
    alle(score, 'credit').map((c) => txt(c, 'credit-words')).find(Boolean) || titelAusName || 'Ohne Titel';

  const teile = alle(score, 'part').map(teilLesen);
  if (!teile.length) throw fehler('format', 'Die Partitur enthält keine Stimmen');
  const anzahlTakte = Math.max(...teile.map((t) => t.takte.length));

  // Systemzuordnung je Teil: 2 Systeme → oben/unten; 1 System → nach Schlüssel
  const takte = [];
  let start = 0, tempo = 0;
  const roh = [];
  for (let i = 0; i < anzahlTakte; i++) {
    const ref = teile[0].takte[i] || teile.find((t) => t.takte[i])?.takte[i];
    const taktart = ref.taktart, tonart = ref.tonart;
    const nenn = (taktart[0] * 4) / taktart[1];
    const ist = Math.max(0, ...teile.map((t) => t.takte[i]?.laenge || 0));
    let dauer = nenn;
    if (ist > 1e-6 && ist < nenn - 1e-6 && (ref.implizit || i === 0 || i === anzahlTakte - 1)) dauer = ist;
    else if (ist > nenn) dauer = ist;
    const nrRoh = parseInt(ref.nummer, 10);
    const nr = Number.isFinite(nrRoh) ? nrRoh : i + 1;
    takte.push({ nr, taktart, tonart, start, dauer, schluessel: { oben: 'G', unten: 'F' } });
    for (const teil of teile) {
      const tk = teil.takte[i];
      if (!tk) continue;
      if (!tempo && tk.tempo) tempo = tk.tempo;
      const sys = (staff) => {
        if (teil.staves >= 2) return staff >= 2 ? 'unten' : 'oben';
        return tk.schluessel[1] === 'F' ? 'unten' : 'oben';
      };
      for (const [staff, s] of Object.entries(tk.schluessel)) {
        const sy = sys(+staff);
        if (s === 'G' || s === 'F') takte[i].schluessel[sy] = s;
      }
      for (const e of tk.ereignisse) roh.push({ ...e, t: start + e.pos, system: sys(e.staff), takt: nr, teil: teil.id });
    }
    start += dauer;
  }
  return fertig({ titel, tempo: tempo || 80, takte }, roh);
}

function teilLesen(part) {
  let div = 1, staves = 1, taktart = [4, 4], tonart = { quinten: 0, modus: 'dur' };
  const schl = {}; // aktueller Schlüssel je System des Teils (bleibt bis zum Wechsel)
  const takte = [];
  for (const m of alle(part, 'measure')) {
    let pos = 0, maxPos = 0, letzterStart = 0, tempo = 0;
    const ereignisse = [];
    for (const el of m.kinder) {
      if (el.name === 'attributes') {
        if (kind(el, 'divisions')) div = zahl(el, 'divisions', 1) || 1;
        if (kind(el, 'staves')) staves = zahl(el, 'staves', 1);
        const key = kind(el, 'key');
        if (key && kind(key, 'fifths')) tonart = { quinten: zahl(key, 'fifths', 0), modus: txt(key, 'mode') === 'minor' ? 'moll' : 'dur' };
        const time = kind(el, 'time');
        if (time && kind(time, 'beats')) taktart = [parseInt(txt(time, 'beats'), 10) || 4, zahl(time, 'beat-type', 4)];
        for (const c of alle(el, 'clef')) schl[c.attrs.number || '1'] = txt(c, 'sign');
      } else if (el.name === 'backup') {
        pos -= zahl(el, 'duration') / div;
      } else if (el.name === 'forward') {
        pos += zahl(el, 'duration') / div;
        maxPos = Math.max(maxPos, pos);
      } else if (el.name === 'direction' || el.name === 'sound') {
        const snd = el.name === 'sound' ? el : kind(el, 'sound');
        if (snd?.attrs.tempo) tempo = tempo || parseFloat(snd.attrs.tempo);
        const met = kind(kind(el, 'direction-type'), 'metronome');
        if (met && !tempo) {
          const pm = zahl(met, 'per-minute', 0);
          const bu = { half: 2, quarter: 1, eighth: 0.5 }[txt(met, 'beat-unit')] || 1;
          if (pm) tempo = pm * bu * (kind(met, 'beat-unit-dot') ? 1.5 : 1);
        }
      } else if (el.name === 'note') {
        if (kind(el, 'grace') || kind(el, 'cue')) continue;
        const dauer = zahl(el, 'duration') / div;
        const akkord = !!kind(el, 'chord');
        const beginn = akkord ? letzterStart : pos;
        if (!akkord) { letzterStart = pos; pos += dauer; maxPos = Math.max(maxPos, pos); }
        const staff = zahl(el, 'staff', 1);
        const stimme = parseInt(txt(el, 'voice', '1'), 10) || 1;
        const typ = txt(el, 'type') || undefined;
        const punkte = alle(el, 'dot').length || undefined;
        const tm = kind(el, 'time-modification');
        const tupel = tm ? [zahl(tm, 'actual-notes', 3), zahl(tm, 'normal-notes', 2)] : undefined;
        if (kind(el, 'rest')) {
          ereignisse.push({ art: 'pause', pos: beginn, dauer, staff, stimme, typ, punkte, ganzTakt: kind(el, 'rest').attrs.measure === 'yes' });
          continue;
        }
        const p = kind(el, 'pitch');
        if (!p) continue;
        const sw = { stamm: STEP[txt(p, 'step')] || 'C', vorz: Math.round(zahl(p, 'alter', 0)), oktave: zahl(p, 'octave', 4) };
        const nots = kind(el, 'notations');
        const bindung = {};
        for (const t of [...alle(el, 'tie'), ...alle(nots, 'tied')]) {
          if (t.attrs.type === 'start') bindung.start = true;
          if (t.attrs.type === 'stop') bindung.ende = true;
        }
        const fing = parseInt(txt(kind(nots, 'technical'), 'fingering', ''), 10);
        ereignisse.push({
          art: 'note', pos: beginn, dauer, staff, stimme, schreibweise: sw, midi: midiAus(sw), typ, punkte, tupel,
          bindung: bindung.start || bindung.ende ? bindung : undefined,
          finger: Number.isFinite(fing) ? fing : undefined,
        });
      }
    }
    takte.push({ nummer: m.attrs.number, implizit: m.attrs.implicit === 'yes', laenge: maxPos, taktart, tonart, schluessel: { ...schl }, ereignisse, tempo, div });
  }
  return { id: part.attrs.id, staves, takte };
}

function timewiseZuPartwise(score) {
  const parts = new Map();
  for (const m of alle(score, 'measure')) for (const p of alle(m, 'part')) {
    if (!parts.has(p.attrs.id)) parts.set(p.attrs.id, { name: 'part', attrs: { id: p.attrs.id }, kinder: [], text: '' });
    parts.get(p.attrs.id).kinder.push({ name: 'measure', attrs: m.attrs, kinder: p.kinder, text: '' });
  }
  return { ...score, name: 'score-partwise', kinder: [...score.kinder.filter((k) => k.name !== 'measure'), ...parts.values()] };
}

/** Sortiert, vergibt ids, trennt Pausen ab. */
function fertig(kopf, roh) {
  const rang = (e) => (e.system === 'oben' ? 0 : 1);
  roh.sort((a, b) => a.t - b.t || rang(a) - rang(b) || (a.midi || 0) - (b.midi || 0));
  const noten = [], pausen = [];
  for (const e of roh) {
    const t = rund(e.t), dauer = rund(e.dauer);
    if (e.art === 'pause') { pausen.push({ t, dauer, system: e.system, stimme: e.stimme, takt: e.takt, typ: e.typ, punkte: e.punkte, ganzTakt: e.ganzTakt || undefined }); continue; }
    if (!(dauer > 0)) continue;
    const n = { id: 'n' + noten.length, t, dauer, midi: e.midi, system: e.system, stimme: e.stimme, takt: e.takt, schreibweise: e.schreibweise };
    if (e.finger != null) n.finger = e.finger;
    if (e.bindung) n.bindung = e.bindung;
    if (e.typ) n.typ = e.typ;
    if (e.punkte) n.punkte = e.punkte;
    if (e.tupel) n.tupel = e.tupel;
    noten.push(n);
  }
  return { ...kopf, noten, pausen };
}
const rund = (x) => Math.round(x * 960) / 960;

// ───────────────────────── MXL (ZIP) ─────────────────────────
async function mxlEntpacken(bytes) {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65558); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw fehler('format', 'Die .mxl-Datei ist beschädigt (kein ZIP-Verzeichnis).');
  const anzahl = dv.getUint16(eocd + 10, true);
  let p = dv.getUint32(eocd + 16, true);
  const dateien = new Map();
  const dec = new TextDecoder();
  for (let k = 0; k < anzahl; k++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const methode = dv.getUint16(p + 10, true), groesse = dv.getUint32(p + 20, true);
    const nl = dv.getUint16(p + 28, true), el = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true);
    const lokal = dv.getUint32(p + 42, true);
    const name = dec.decode(bytes.subarray(p + 46, p + 46 + nl));
    dateien.set(name, { methode, groesse, lokal });
    p += 46 + nl + el + cl;
  }
  const lies = async (name) => {
    const d = dateien.get(name);
    if (!d) return null;
    const start = d.lokal + 30 + dv.getUint16(d.lokal + 26, true) + dv.getUint16(d.lokal + 28, true);
    const roh = bytes.subarray(start, start + d.groesse);
    if (d.methode === 0) return dec.decode(roh);
    if (d.methode !== 8) throw fehler('format', 'Unbekannte Kompression in der .mxl-Datei.');
    if (typeof DecompressionStream === 'undefined') throw fehler('format', 'Dieses Gerät kann .mxl nicht entpacken – bitte als .musicxml speichern.');
    const strom = new Blob([roh]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return dec.decode(await new Response(strom).arrayBuffer());
  };
  let pfad = null;
  const cont = await lies('META-INF/container.xml');
  if (cont) pfad = kind(kind(kind(xmlLesen(cont), 'container'), 'rootfiles'), 'rootfile')?.attrs['full-path'];
  if (!pfad) pfad = [...dateien.keys()].find((n) => !n.startsWith('META-INF') && /\.(musicxml|xml)$/i.test(n));
  const text = pfad && (await lies(pfad));
  if (!text) throw fehler('format', 'In der .mxl-Datei steckt keine Partitur.');
  return text;
}

// ───────────────────────── MIDI ─────────────────────────
export function ausMidi(bytes, titelAusName = '') {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const ntrks = dv.getUint16(10), division = dv.getUint16(12);
  if (division & 0x8000) throw fehler('format', 'Diese MIDI-Datei nutzt SMPTE-Zeit – wird nicht unterstützt.');
  let p = 8 + dv.getUint32(4);
  const spuren = [];
  const meta = { tempo: 0, taktarten: [], tonart: null, titel: '' };
  for (let s = 0; s < ntrks && p + 8 <= bytes.length; s++) {
    const len = dv.getUint32(p + 4);
    if (dv.getUint32(p) !== 0x4d54726b) { p += 8 + len; continue; } // MTrk
    let q = p + 8;
    const ende = Math.min(bytes.length, q + len);
    p = q + len;
    let tick = 0, status = 0;
    const offen = new Map();
    const spur = { name: '', noten: [] };
    const vlq = () => { let v = 0, b; do { b = bytes[q++]; v = (v << 7) | (b & 0x7f); } while (b & 0x80 && q < ende); return v; };
    while (q < ende) {
      tick += vlq();
      let b = bytes[q];
      if (b & 0x80) { status = b; q++; } else if (!status) break;
      const typ = status & 0xf0, kanal = status & 0x0f;
      if (status === 0xff) {
        const mt = bytes[q++], ml = vlq(), d = bytes.subarray(q, q + ml);
        q += ml;
        if (mt === 0x51 && !meta.tempo) meta.tempo = Math.round(60000000 / ((d[0] << 16) | (d[1] << 8) | d[2]));
        else if (mt === 0x58) meta.taktarten.push({ tick, taktart: [d[0], 2 ** d[1]] });
        else if (mt === 0x59 && !meta.tonart) meta.tonart = { quinten: (d[0] << 24) >> 24, modus: d[1] ? 'moll' : 'dur' };
        else if (mt === 0x03) spur.name = new TextDecoder().decode(d);
        status = 0;
      } else if (status === 0xf0 || status === 0xf7) { q += vlq(); status = 0; }
      else if (typ === 0x90 || typ === 0x80) {
        const ton = bytes[q++], vel = bytes[q++];
        const k = kanal * 128 + ton;
        if (typ === 0x90 && vel > 0) {
          if (!offen.has(k)) offen.set(k, []);
          offen.get(k).push({ tick, vel });
        } else {
          const a = offen.get(k)?.shift();
          if (a && kanal !== 9) spur.noten.push({ von: a.tick, bis: tick, midi: ton, vel: a.vel });
        }
      } else if (typ === 0xc0 || typ === 0xd0) q += 1;
      else q += 2;
    }
    if (spur.noten.length) spuren.push(spur);
  }
  if (!spuren.length) throw fehler('format', 'In der MIDI-Datei sind keine Noten.');
  if (!meta.titel && spuren.length === 1 && spuren[0].name) meta.titel = spuren[0].name;
  const tonart = meta.tonart || { quinten: 0, modus: 'dur' };

  // Raster: Sechzehntel oder Triole, je nachdem was besser passt
  const quant = (tick) => {
    const x = tick / division, a = Math.round(x * 4) / 4, b = Math.round(x * 3) / 3;
    return Math.abs(x - b) < Math.abs(x - a) - 0.02 ? b : a;
  };
  // Hände: nach Spurnamen, sonst nach Tonhöhe der Spur; eine Spur → nach Spielbarkeit
  let alleNoten = [];
  const istLinks = (n) => /links|left|\blh\b|bass|l\.?\s*h/i.test(n), istRechts = (n) => /rechts|right|\brh\b|r\.?\s*h|melod/i.test(n);
  if (spuren.length >= 2) {
    const schnitt = spuren.map((s) => s.noten.reduce((a, n) => a + n.midi, 0) / s.noten.length);
    const hoechste = schnitt.indexOf(Math.max(...schnitt));
    spuren.forEach((s, i) => {
      const sys = istLinks(s.name) ? 'unten' : istRechts(s.name) ? 'oben' : spuren.length === 2 ? (i === hoechste ? 'oben' : 'unten') : schnitt[i] >= 60 ? 'oben' : 'unten';
      for (const n of s.noten) alleNoten.push({ ...n, system: sys });
    });
  } else {
    alleNoten = haendeTeilen(spuren[0].noten);
  }

  // Takte
  const tas = meta.taktarten.length ? meta.taktarten : [{ tick: 0, taktart: [4, 4] }];
  const ende = Math.max(...alleNoten.map((n) => quant(n.bis)));
  const takte = [];
  let start = 0, ti = 0;
  while (start < ende - 1e-6 || !takte.length) {
    while (ti + 1 < tas.length && quant(tas[ti + 1].tick) <= start + 1e-6) ti++;
    const taktart = tas[ti].taktart;
    const dauer = (taktart[0] * 4) / taktart[1];
    takte.push({ nr: takte.length + 1, taktart, tonart, start, dauer, schluessel: { oben: 'G', unten: 'F' } });
    start += dauer;
  }
  // Noten quantisieren und an Taktstrichen mit Haltebogen teilen
  const roh = [];
  for (const n of alleNoten) {
    let t = quant(n.von), bis = Math.max(quant(n.bis), t + 0.25);
    const sw = schreibweiseAus(n.midi, tonart);
    let erst = true;
    while (bis - t > 1e-6) {
      const tk = takte.find((k) => k.start <= t + 1e-6 && t < k.start + k.dauer - 1e-6) || takte[takte.length - 1];
      const stueck = Math.min(bis, tk.start + tk.dauer) - t;
      const weiter = bis - (t + stueck) > 1e-6;
      const bindung = erst && !weiter ? undefined : { ...(erst ? {} : { ende: true }), ...(weiter ? { start: true } : {}) };
      roh.push({ art: 'note', t, dauer: stueck, midi: n.midi, schreibweise: sw, system: n.system, stimme: n.system === 'oben' ? 1 : 5, takt: tk.nr, bindung });
      t += stueck;
      erst = false;
    }
  }
  return { ...fertig({ titel: meta.titel || titelAusName || 'MIDI-Stück', tempo: meta.tempo || 100, takte }, roh), pausen: undefined };
}

/** Eine Spur → zwei Hände: Akkorde am Stück so trennen, dass jede Hand spielbar bleibt (≤ Dezime), mit geglätteten Handlagen. */
function haendeTeilen(noten) {
  const gruppen = new Map();
  for (const n of noten) { const k = n.von; if (!gruppen.has(k)) gruppen.set(k, []); gruppen.get(k).push(n); }
  let mL = 48, mR = 67;
  const aus = [];
  for (const k of [...gruppen.keys()].sort((a, b) => a - b)) {
    const g = gruppen.get(k).sort((a, b) => a.midi - b.midi);
    let best = 0, bestKosten = Infinity;
    for (let s = 0; s <= g.length; s++) {
      const L = g.slice(0, s), R = g.slice(s);
      let kosten = 0;
      for (const n of L) kosten += Math.abs(n.midi - mL) + (n.midi > 64 ? 6 : 0);
      for (const n of R) kosten += Math.abs(n.midi - mR) + (n.midi < 55 ? 6 : 0);
      if (L.length && L[L.length - 1].midi - L[0].midi > 14) kosten += 100;
      if (R.length && R[R.length - 1].midi - R[0].midi > 14) kosten += 100;
      if (L.length > 5 || R.length > 5) kosten += 100;
      if (kosten < bestKosten) { bestKosten = kosten; best = s; }
    }
    g.forEach((n, i) => aus.push({ ...n, system: i < best ? 'unten' : 'oben' }));
    const mitte = (a) => a.reduce((s, n) => s + n.midi, 0) / a.length;
    if (best > 0) mL = 0.7 * mL + 0.3 * mitte(g.slice(0, best));
    if (best < g.length) mR = 0.7 * mR + 0.3 * mitte(g.slice(best));
    if (mR - mL < 7) { const m = (mR + mL) / 2; mL = m - 3.5; mR = m + 3.5; }
  }
  return aus;
}

export { taktDauer };
