// einlesen.js – MusicXML (.musicxml/.xml), komprimiertes MusicXML (.mxl) und MIDI (.mid) → Stück.
// Alles lokal im Gerät, nichts wird gesendet. Läuft im Browser und in Node (≥ 18).
import { midiAus, schreibweiseAus, taktDauer, zerlegeDauer } from './modell.js';

const fehler = (art, text) => Object.assign(new Error(text), { art, text });

/** PDF/Foto: ehrlich – keine erfundene Erkennung. */
export async function bildErkennen() {
  throw fehler('nicht-verfuegbar', 'Noten aus einem Bild oder PDF kann diese Seite nicht selbst lesen');
}

/**
 * @param {File|Blob|ArrayBuffer|Uint8Array|string} quelle
 * @param {string} [name] Dateiname (für die Endung)
 * @param {{haende?:'spur'|'tonhoehe'|'auto'}} [opt] nur MIDI: wie die Noten auf die Hände verteilt werden
 */
export async function einlesen(quelle, name = '', opt = {}) {
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
    if (b0 === 0x4d && b1 === 0x54 && b2 === 0x68 && b3 === 0x64) return ausMidi(bytes, titelAusName, opt); // MThd
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
  let start = 0;
  const roh = [], tempiRoh = [];
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
      for (const tp of tk.tempi) tempiRoh.push({ t: rund(start + tp.pos), bpm: tp.bpm });
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
  const tempi = tempoListe(tempiRoh);
  const kopf = { titel, tempo: tempi[0]?.bpm || 80, takte };
  if (tempi.length > 1) kopf.tempi = tempi;
  return fertig(kopf, roh);
}

/** Tempo-Angaben sortieren, doppelte und gleichbleibende entfernen; erste gilt ab 0. */
function tempoListe(roh) {
  const aus = [];
  for (const x of [...roh].filter((x) => x.bpm > 0 && Number.isFinite(x.bpm)).sort((a, b) => a.t - b.t)) {
    const bpm = Math.round(Math.min(400, Math.max(10, x.bpm)) * 100) / 100;
    const v = aus[aus.length - 1];
    if (v && Math.abs(v.t - x.t) < 1e-6) continue;
    if (v && Math.abs(v.bpm - bpm) < 0.01) continue;
    aus.push({ t: x.t, bpm });
  }
  if (aus.length) aus[0].t = 0;
  return aus;
}

function teilLesen(part) {
  let div = 1, staves = 1, taktart = [4, 4], tonart = { quinten: 0, modus: 'dur' };
  const schl = {}; // aktueller Schlüssel je System des Teils (bleibt bis zum Wechsel)
  const takte = [];
  for (const m of alle(part, 'measure')) {
    let pos = 0, maxPos = 0, letzterStart = 0;
    const ereignisse = [], tempi = [];
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
        let bpm = snd?.attrs.tempo ? parseFloat(snd.attrs.tempo) : 0;
        const met = kind(kind(el, 'direction-type'), 'metronome');
        if (met && !bpm) {
          const pm = zahl(met, 'per-minute', 0);
          const bu = { whole: 4, half: 2, quarter: 1, eighth: 0.5, '16th': 0.25 }[txt(met, 'beat-unit')] || 1;
          if (pm) bpm = pm * bu * (kind(met, 'beat-unit-dot') ? 1.5 : 1);
        }
        if (bpm > 0) tempi.push({ pos: Math.max(0, pos + zahl(el, 'offset', 0) / div), bpm });
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
    takte.push({ nummer: m.attrs.number, implizit: m.attrs.implicit === 'yes', laenge: maxPos, taktart, tonart, schluessel: { ...schl }, ereignisse, tempi, div });
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
const istLinks = (n) => /links|linke|left|\bbass|\bl\.?\s*h\b/i.test(n || '');
const istRechts = (n) => /rechts|rechte|right|\br\.?\s*h\b|melod|treble|sopran/i.test(n || '');
const taktLaenge = (ta) => (ta[0] * 4) / ta[1];
const textAus = (d) => { try { return new TextDecoder('utf-8', { fatal: true }).decode(d); } catch { return String.fromCharCode(...d); } };

/**
 * MIDI (Format 0 und 1) → Stück. Ehrlich: stück.quelle sagt, was gerundet (quantisiert), gekürzt oder weggelassen wurde.
 * opt.haende: 'spur' (nach Spuren/Spurnamen) | 'tonhoehe' (ab c1 rechts) | 'auto' (spielbare Griffe). Ohne Angabe:
 * nach Spur, wenn es mehrere Spuren (oder eine benannte Hand) gibt, sonst nach Tonhöhe.
 */
export function ausMidi(bytes, titelAusName = '', opt = {}) {
  if (bytes.length < 14) throw fehler('format', 'Die MIDI-Datei ist zu kurz.');
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const kopfLaenge = dv.getUint32(4), format = dv.getUint16(8), ntrks = dv.getUint16(10), division = dv.getUint16(12);
  if (division & 0x8000) throw fehler('format', 'Diese MIDI-Datei nutzt SMPTE-Zeit – wird nicht unterstützt.');
  if (!division) throw fehler('format', 'Die MIDI-Datei hat keine Zeitbasis.');
  const meta = { tempi: [], taktarten: [], tonarten: [] };
  const spuren = [];
  let schlagzeug = 0, ohneEnde = 0, titel = '', spurNr = 0;
  let p = 8 + kopfLaenge;
  while (spurNr < ntrks && p + 8 <= bytes.length) {
    const id = dv.getUint32(p), len = dv.getUint32(p + 4);
    let q = p + 8;
    const ende = Math.min(bytes.length, q + len);
    p = q + len;
    if (id !== 0x4d54726b) continue; // fremder Block: überspringen (erlaubt)
    const nr = spurNr++;
    let tick = 0, status = 0, name = '';
    const offen = new Map(), proKanal = new Map();
    const notiere = (kanal, von, bis, midi, vel) => {
      if (kanal === 9) { schlagzeug++; return; } // Kanal 10 = Schlagzeug: kein Klavier
      if (!proKanal.has(kanal)) proKanal.set(kanal, []);
      proKanal.get(kanal).push({ von, bis, midi, vel });
    };
    const vlq = () => { let v = 0, b; do { b = bytes[q++]; v = v * 128 + (b & 0x7f); } while (b & 0x80 && q < ende); return v; };
    while (q < ende) {
      tick += vlq();
      if (q >= ende) break;
      const b = bytes[q];
      if (b === 0xff) {
        const mt = bytes[q + 1];
        q += 2;
        const ml = vlq(), d = bytes.subarray(q, Math.min(ende, q + ml));
        q += ml;
        if (mt === 0x2f) break;
        if (mt === 0x51 && d.length >= 3) { const us = (d[0] << 16) | (d[1] << 8) | d[2]; if (us > 0) meta.tempi.push({ tick, bpm: 60000000 / us }); }
        else if (mt === 0x58 && d.length >= 2 && d[0] > 0 && d[1] < 7) meta.taktarten.push({ tick, taktart: [d[0], 2 ** d[1]] });
        else if (mt === 0x59 && d.length >= 2) meta.tonarten.push({ tick, tonart: { quinten: Math.max(-7, Math.min(7, (d[0] << 24) >> 24)), modus: d[1] ? 'moll' : 'dur' } });
        else if (mt === 0x03 && !name) name = textAus(d).replace(/\0/g, '').trim();
        continue; // Laufstatus bleibt bestehen (nachsichtig – manche Programme verlassen sich darauf)
      }
      if (b === 0xf0 || b === 0xf7) { q++; const l = vlq(); q += l; continue; } // Sysex (Achtung: erst Länge lesen, dann springen)
      let st = status;
      if (b & 0x80) { st = b; q++; if (b < 0xf0) status = b; }
      else if (!status) { q++; continue; } // Datenbyte ohne Status: überspringen
      if (st >= 0xf0) { q += { 0xf1: 1, 0xf2: 2, 0xf3: 1 }[st] || 0; continue; }
      const typ = st & 0xf0, kanal = st & 0x0f;
      if (typ === 0x90 || typ === 0x80) {
        const ton = bytes[q++] & 0x7f, vel = bytes[q++] & 0x7f;
        const k = kanal * 128 + ton;
        if (typ === 0x90 && vel > 0) { if (!offen.has(k)) offen.set(k, []); offen.get(k).push({ tick, vel }); }
        else { const a = offen.get(k)?.shift(); if (a) notiere(kanal, a.tick, tick, ton, a.vel); } // Note-On mit Stärke 0 = Note-Off
      } else if (typ === 0xc0 || typ === 0xd0) q += 1;
      else q += 2;
    }
    // Noten ohne Note-Off: bis zum Spurende klingen lassen (und melden)
    for (const [k, liste] of offen) for (const a of liste) { ohneEnde++; notiere(k >> 7, a.tick, Math.max(tick, a.tick + division / 4), k & 127, a.vel); }
    if (nr === 0 && name && (format === 0 || !proKanal.size)) titel = name;
    for (const [kanal, noten] of [...proKanal].sort((a, b) => a[0] - b[0])) if (noten.length) spuren.push({ name, kanal, noten, nr });
  }
  if (!spuren.length) throw fehler('format', schlagzeug ? 'In der MIDI-Datei ist nur Schlagzeug (Kanal 10) – keine Klaviernoten.' : 'In der MIDI-Datei sind keine Noten.');
  const Q = (tk) => tk / division;
  const jeZeitpunkt = (liste) => { const m = new Map(); for (const x of [...liste].sort((a, b) => a.tick - b.tick)) m.set(x.tick, x); return [...m.values()]; };

  // Taktarten (+ Auftakt: kurze erste Taktart, die genau einen Takt dauert, z. B. 1/4 vor 4/4)
  let tas = jeZeitpunkt(meta.taktarten);
  if (!tas.length || tas[0].tick > 0) tas.unshift({ tick: 0, taktart: [4, 4] });
  let auftakt = 0;
  if (tas.length >= 2) {
    const L0 = taktLaenge(tas[0].taktart), L1 = taktLaenge(tas[1].taktart);
    if (Math.abs(Q(tas[1].tick) - L0) < 1e-6 && L0 < L1 - 1e-6) { auftakt = L0; tas = [{ tick: 0, taktart: tas[1].taktart }, ...tas.slice(1)]; }
  }
  const tasQ = tas.map((x) => ({ q: Q(x.tick), taktart: x.taktart }));
  const tons = jeZeitpunkt(meta.tonarten).map((x) => ({ q: Q(x.tick), tonart: x.tonart }));
  const tonartBei = (q) => { let t = { quinten: 0, modus: 'dur' }; for (const x of tons) if (x.q <= q + 1e-6) t = x.tonart; return t; };
  const tempi = tempoListe(meta.tempi.map((x) => ({ t: rund(Q(x.tick)), bpm: x.bpm })));

  // Hände
  const benannt = spuren.map((s) => (istLinks(s.name) ? 'unten' : istRechts(s.name) ? 'oben' : null));
  if (spuren.length === 2 && !!benannt[0] !== !!benannt[1]) { const i = benannt[0] ? 1 : 0; benannt[i] = benannt[1 - i] === 'oben' ? 'unten' : 'oben'; }
  const modi = [...(spuren.length >= 2 || benannt[0] ? ['spur'] : []), 'tonhoehe', 'auto'];
  const modus = modi.includes(opt.haende) ? opt.haende : modi[0];
  let alle = [];
  if (modus === 'spur') {
    const schnitt = spuren.map((s) => s.noten.reduce((a, n) => a + n.midi, 0) / s.noten.length);
    const hoechste = schnitt.indexOf(Math.max(...schnitt));
    spuren.forEach((s, i) => {
      s.system = benannt[i] || (spuren.length === 2 ? (i === hoechste ? 'oben' : 'unten') : schnitt[i] >= 60 ? 'oben' : 'unten');
      for (const n of s.noten) alle.push({ ...n, system: s.system });
    });
  } else if (modus === 'tonhoehe') {
    for (const s of spuren) for (const n of s.noten) alle.push({ ...n, system: n.midi >= 60 ? 'oben' : 'unten' });
  } else alle = haendeTeilen(spuren.flatMap((s) => s.noten));

  // Raster: liegt alles exakt auf Sechzehntel/Triolen (oder 32stel/16tel-Triolen)? Sonst eingespielt → schätzen.
  const tol = Math.max(1, division / 96);
  const SAETZE = [[1 / 4, 1 / 3], [1 / 4, 1 / 3, 1 / 8, 1 / 6]];
  const nahe = (tk, satz) => satz.some((s) => { const x = Q(tk) / s; return Math.abs(x - Math.round(x)) * s * division <= tol; });
  const satzNr = SAETZE.findIndex((satz) => alle.every((n) => nahe(n.von, satz)));
  const geschaetzt = satzNr < 0;
  const satz = SAETZE[geschaetzt ? 0 : satzNr];
  const quant = (tk) => {
    const x = Q(tk);
    if (geschaetzt) { const a = Math.round(x * 4) / 4, b = Math.round(x * 3) / 3; return Math.abs(x - b) < Math.abs(x - a) - 0.02 ? b : a; }
    let best = null;
    for (const s of satz) { const r = Math.round(x / s) * s, e = Math.abs(x - r); if (!best || e < best.e - 1e-9) best = { r, e }; }
    return best.r;
  };
  const minDauer = geschaetzt || satzNr === 0 ? 0.25 : 0.125;
  // Etwas früher losgelassen (z. B. 85 % der Länge, typisch beim Einspielen)? Dann bis zum nächsten Einsatz der Hand
  // verlängern, statt eine zu kurze Note + winzige Pause zu schreiben. Liegt das Ende genau im Raster, bleibt es.
  const einsaetze = { oben: [], unten: [] };
  for (const n of alle) einsaetze[n.system].push(n.von);
  for (const k in einsaetze) einsaetze[k] = [...new Set(einsaetze[k])].sort((a, b) => a - b);
  const naechsterEinsatz = (sys, von) => {
    const l = einsaetze[sys];
    let lo = 0, hi = l.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (l[m] > von + tol) hi = m; else lo = m + 1; }
    return l[lo];
  };
  const rohEnde = Math.max(...alle.map((n) => n.bis));
  let anfaenge = 0, enden = 0, maxV = 0, verlaengert = 0;
  const einmal = new Map();
  let doppelt = 0;
  for (const n of alle) {
    const t = rund(quant(n.von));
    let rohBis = n.bis;
    const nx = naechsterEinsatz(n.system, n.von) ?? (geschaetzt ? rohEnde : undefined); // Schlusston: bis zum Ende
    const laenge = rohBis - n.von;
    const grenze = geschaetzt ? Math.max(division / 4, Math.min(division, 0.35 * laenge)) : Math.min(division / 4, 0.3 * laenge);
    if (nx != null && rohBis < nx - tol && (geschaetzt || !nahe(rohBis, satz)) && nx - rohBis < grenze) { rohBis = nx; verlaengert++; }
    let bis = rund(quant(rohBis));
    if (bis < t + minDauer - 1e-6) bis = t + minDauer;
    const abw = Math.abs(t - Q(n.von));
    if (abw * division > tol) anfaenge++;
    if (Math.abs(bis - Q(n.bis)) * division > tol) enden++;
    maxV = Math.max(maxV, abw);
    const k = n.system + '|' + n.midi + '|' + t;
    const v = einmal.get(k);
    if (v) { doppelt++; v.bis = Math.max(v.bis, bis); } else einmal.set(k, { t, bis, midi: n.midi, system: n.system });
  }
  // Gleiche Taste in einer Hand nochmals angeschlagen, bevor sie losgelassen wurde: wie am Klavier – die erste endet dort.
  const noten = [...einmal.values()].sort((a, b) => a.t - b.t);
  let gekuerzt = 0;
  const letzte = new Map();
  for (const n of noten) {
    const k = n.system + '|' + n.midi, v = letzte.get(k);
    if (v && v.bis > n.t + 1e-6) { v.bis = n.t; gekuerzt++; }
    letzte.set(k, n);
  }

  // Takte
  const ende = Math.max(...noten.map((n) => n.bis));
  const takte = [];
  let start = 0, ti = 0, nr = auftakt ? 0 : 1;
  while (start < ende - 1e-6 || !takte.length) {
    while (ti + 1 < tasQ.length && tasQ[ti + 1].q <= start + 1e-6) ti++;
    const taktart = tasQ[ti].taktart;
    let dauer = auftakt && !takte.length ? auftakt : taktLaenge(taktart);
    const naechst = tasQ[ti + 1]?.q;
    if (naechst != null && naechst > start + 1e-6 && naechst < start + dauer - 1e-6) dauer = naechst - start; // Wechsel mitten im Takt
    takte.push({ nr: nr++, taktart, tonart: tonartBei(start), start: rund(start), dauer: rund(dauer), schluessel: { oben: 'G', unten: 'F' } });
    start = rund(start + dauer);
    if (takte.length > 20000) break;
  }
  const taktBei = (t) => {
    let lo = 0, hi = takte.length - 1;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (takte[m].start <= t + 1e-6) lo = m; else hi = m - 1; }
    return takte[lo];
  };

  // Stimmen: hält eine Hand einen Ton, während sie weiterspielt → zweite Stimme (ruhigeres Notenbild)
  for (const sys of ['oben', 'unten']) {
    const basis = sys === 'oben' ? 1 : 5;
    const st = [];
    for (const n of noten.filter((x) => x.system === sys).sort((a, b) => a.t - b.t || b.midi - a.midi)) {
      let k = st.findIndex((v) => Math.abs(v.t - n.t) < 1e-6 && Math.abs(v.bis - n.bis) < 1e-6);
      if (k < 0) k = st.findIndex((v) => v.ende <= n.t + 1e-6);
      if (k < 0) k = st.length < 2 ? st.push({ ende: 0 }) - 1 : (st[0].ende <= st[1].ende ? 0 : 1);
      st[k] = { ende: Math.max(st[k].ende, n.bis), t: n.t, bis: n.bis };
      n.stimme = basis + k;
    }
  }

  // An Taktstrichen teilen und in schreibbare Notenwerte zerlegen (mit Haltebögen)
  const roh = [];
  for (const n of noten) {
    if (!(n.bis - n.t > 1e-6)) continue;
    const sw = schreibweiseAus(n.midi, tonartBei(n.t));
    const teile = [];
    let t = n.t;
    while (n.bis - t > 1e-6) {
      const tk = taktBei(t);
      const bis = Math.min(n.bis, rund(tk.start + tk.dauer));
      let u = t;
      for (const d of zerlegeDauer(bis - t)) { teile.push({ t: rund(u), dauer: rund(d), takt: tk.nr }); u += d; }
      t = bis;
    }
    teile.forEach((x, i) => {
      const bindung = teile.length === 1 ? undefined : { ...(i > 0 ? { ende: true } : {}), ...(i < teile.length - 1 ? { start: true } : {}) };
      roh.push({ art: 'note', t: x.t, dauer: x.dauer, midi: n.midi, schreibweise: sw, system: n.system, stimme: n.stimme, takt: x.takt, bindung });
    });
  }

  const kopf = { titel: titel || titelAusName || 'MIDI-Stück', tempo: tempi[0]?.bpm || 120, takte };
  if (tempi.length > 1) kopf.tempi = tempi;
  const stueck = fertig(kopf, roh);
  stueck.pausen = undefined;
  let taktartWechsel = 0;
  for (let i = 1; i < takte.length; i++) if (takte[i].taktart.join('/') !== takte[i - 1].taktart.join('/')) taktartWechsel++;
  stueck.quelle = {
    art: 'midi', format, division,
    spuren: spuren.map((s) => ({ name: s.name, kanal: s.kanal + 1, noten: s.noten.length, system: s.system || null })),
    haende: modus, haendeModi: modi,
    raster: { art: geschaetzt ? 'geschaetzt' : satzNr === 0 ? 'sechzehntel' : 'fein', anfaenge, enden, gesamt: alle.length, maxVerschiebung: Math.round(maxV * 1000) / 1000 },
    schlagzeug, ohneEnde, doppelt, gekuerzt, verlaengert, auftakt: auftakt > 0, tempoWechsel: Math.max(0, tempi.length - 1), taktartWechsel,
  };
  return stueck;
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
