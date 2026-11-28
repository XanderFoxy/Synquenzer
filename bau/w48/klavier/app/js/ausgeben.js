// ausgeben.js – Stück → MusicXML (.musicxml, unkomprimiert) und MIDI (.mid, Format 1). Alles lokal im Gerät.
// Rundlauf: einlesen(alsMusicXML(st)) und einlesen(alsMidi(st)) ergeben dieselben klingenden Noten
// (Tonhöhe, Anfang, Dauer, System) – geprüft in test/rundlauf.mjs.
import { klingendeNoten, taktDauer, stufe, tonartVorz, notenwert, zerlegeDauer, schreibweiseAus } from './modell.js';

const EPS = 1e-6;
const xe = (s) => String(s).replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]));
const STEP = { C: 'C', D: 'D', E: 'E', F: 'F', G: 'G', A: 'A', H: 'B' };
const AKZ = { '-2': 'flat-flat', '-1': 'flat', 0: 'natural', 1: 'sharp', 2: 'double-sharp' };
const rund = (x) => Math.round(x * 960) / 960;

/** Dateiname, der überall funktioniert (Umlaute umschreiben: manche Systeme verwerfen sonst den Namen). */
export function dateiname(titel, endung) {
  const UM = { ä: 'ae', ö: 'oe', ü: 'ue', Ä: 'Ae', Ö: 'Oe', Ü: 'Ue', ß: 'ss', '–': '-', '—': '-', '’': "'", '„': '', '“': '', '”': '' };
  const t = String(titel || 'Stueck').replace(/[äöüÄÖÜß–—’„“”]/g, (c) => UM[c]).normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 ._,()'+&-]+/g, '-').replace(/\s+/g, ' ').replace(/-{2,}/g, '-').trim().slice(0, 80) || 'Stueck';
  return `${t}.${endung}`;
}

function taktIndex(takte, t) {
  let lo = 0, hi = takte.length - 1;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (takte[m].start <= t + EPS) lo = m; else hi = m - 1; }
  return lo;
}

/** Noten in Takte einsortieren, an Taktstrichen teilen und in schreibbare Werte zerlegen (Haltebögen bleiben erhalten). */
function notenVorbereiten(st) {
  const takte = st.takte;
  const proTakt = takte.map(() => []);
  for (const n of [...st.noten].sort((a, b) => a.t - b.t || a.midi - b.midi)) {
    const sw = n.schreibweise || schreibweiseAus(n.midi, takte[taktIndex(takte, n.t)].tonart);
    const teile = [];
    let t = n.t;
    const bisGesamt = rund(n.t + n.dauer);
    while (bisGesamt - t > EPS) {
      const i = taktIndex(takte, t), tk = takte[i];
      const tkEnde = rund(tk.start + (tk.dauer ?? taktDauer(tk)));
      const bis = i === takte.length - 1 ? bisGesamt : Math.min(bisGesamt, tkEnde);
      let u = t;
      for (const d of zerlegeDauer(bis - t)) { teile.push({ i, t: rund(u), dauer: rund(d) }); u += d; }
      t = bis;
    }
    teile.forEach((x, k) => {
      const bindung = {};
      if (k > 0 || n.bindung?.ende) bindung.ende = true;
      if (k < teile.length - 1 || n.bindung?.start) bindung.start = true;
      proTakt[x.i].push({ t: x.t, dauer: x.dauer, midi: n.midi, sw, system: n.system, stimme: n.stimme ?? (n.system === 'oben' ? 1 : 5), finger: k === 0 ? n.finger : undefined, bindung });
    });
  }
  return proTakt;
}

/** Stimmen: je System nach stimme gruppiert; überlappende Noten bekommen eine weitere Stimme. */
function stimmenBilden(noten) {
  const gruppen = new Map();
  for (const n of noten) { if (!gruppen.has(n.stimme)) gruppen.set(n.stimme, []); gruppen.get(n.stimme).push(n); }
  const stimmen = [];
  for (const key of [...gruppen.keys()].sort((a, b) => a - b)) {
    const plaetze = [];
    for (const n of gruppen.get(key).sort((a, b) => a.t - b.t || b.midi - a.midi)) {
      let p = plaetze.find((x) => x.akk && Math.abs(x.akk.t - n.t) < EPS && Math.abs(x.akk.dauer - n.dauer) < EPS);
      if (p) { p.akk.noten.push(n); continue; }
      p = plaetze.find((x) => x.ende <= n.t + EPS);
      if (!p) { p = { ende: 0, akkorde: [] }; plaetze.push(p); }
      p.akk = { t: n.t, dauer: n.dauer, noten: [n] };
      p.akkorde.push(p.akk);
      p.ende = n.t + n.dauer;
    }
    for (const p of plaetze) stimmen.push(p.akkorde);
  }
  return stimmen;
}

function waehleDivisions(werte) {
  for (const d of [1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 96, 192, 480, 960]) if (werte.every((v) => Math.abs(v * d - Math.round(v * d)) < 1e-6)) return d;
  return 960;
}

/** Taktart, die zur tatsächlichen Taktlänge passt (für Auftakt/unregelmäßige Takte). */
function passendeTaktart(dauer, ta) {
  for (const n of [ta[1], 4, 8, 16]) { const z = (dauer * n) / 4; if (Math.abs(z - Math.round(z)) < EPS && Math.round(z) >= 1) return [Math.round(z), n]; }
  return ta;
}

/**
 * Stück → MusicXML-Text (score-partwise 4.0, ein Klavier-Teil mit 2 Systemen).
 * @param {object} st Stück laut modell.js
 * @param {{titel?:string}} [opt]
 */
export function alsMusicXML(st, opt = {}) {
  const takte = st.takte;
  const proTakt = notenVorbereiten(st);
  const werte = [];
  takte.forEach((tk, i) => { werte.push(tk.dauer ?? taktDauer(tk)); for (const n of proTakt[i]) werte.push(n.t - tk.start, n.dauer, n.t + n.dauer - tk.start); });
  for (const x of st.tempi || []) werte.push(x.t - takte[taktIndex(takte, x.t)].start);
  const DIV = waehleDivisions(werte.map(rund));
  const D = (q) => Math.round(rund(q) * DIV);
  const titel = opt.titel || st.titel || 'Stück';
  const tempi = st.tempi && st.tempi.length ? st.tempi : [{ t: 0, bpm: st.tempo || 80 }];
  const tempoText = (bpm, offset) => {
    const b = Math.round(bpm * 100) / 100;
    return `<direction placement="above"><direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>${Math.round(b)}</per-minute></metronome></direction-type>${offset ? `<offset>${offset}</offset>` : ''}<sound tempo="${b}"/></direction>`;
  };

  const aus = [];
  aus.push('<?xml version="1.0" encoding="UTF-8" standalone="no"?>');
  aus.push('<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">');
  aus.push('<score-partwise version="4.0">');
  aus.push(`  <work><work-title>${xe(titel)}</work-title></work>`);
  aus.push(`  <identification><encoding><software>Klavier-Lernhilfe</software><encoding-date>${new Date().toISOString().slice(0, 10)}</encoding-date></encoding></identification>`);
  aus.push('  <part-list><score-part id="P1"><part-name>Klavier</part-name></score-part></part-list>');
  aus.push('  <part id="P1">');

  let vor = null; // vorige Takt-Attribute
  takte.forEach((tk, i) => {
    let dauer = tk.dauer ?? taktDauer(tk);
    if (i === takte.length - 1) for (const n of proTakt[i]) dauer = Math.max(dauer, rund(n.t + n.dauer - tk.start));
    const nenn = taktDauer(tk);
    const auftakt = i === 0 && dauer < nenn - EPS;
    const letzter = i === takte.length - 1;
    const zeigeTa = auftakt || letzter || Math.abs(dauer - nenn) < EPS ? tk.taktart : passendeTaktart(dauer, tk.taktart);
    const q = tk.tonart?.quinten || 0, modus = tk.tonart?.modus === 'moll' ? 'minor' : 'major';
    const schl = { oben: tk.schluessel?.oben || 'G', unten: tk.schluessel?.unten || 'F' };
    const teile = [];
    if (!vor) teile.push(`<divisions>${DIV}</divisions>`);
    if (!vor || vor.q !== q || vor.modus !== modus) teile.push(`<key><fifths>${q}</fifths><mode>${modus}</mode></key>`);
    if (!vor || vor.ta.join('/') !== zeigeTa.join('/')) teile.push(`<time><beats>${zeigeTa[0]}</beats><beat-type>${zeigeTa[1]}</beat-type></time>`);
    if (!vor) teile.push('<staves>2</staves>');
    for (const [nr, sys] of [[1, 'oben'], [2, 'unten']]) {
      if (!vor || vor.schl[sys] !== schl[sys]) teile.push(`<clef number="${nr}">${schl[sys] === 'F' ? '<sign>F</sign><line>4</line>' : '<sign>G</sign><line>2</line>'}</clef>`);
    }
    vor = { q, modus, ta: zeigeTa, schl };
    aus.push(`    <measure number="${xe(tk.nr)}"${auftakt ? ' implicit="yes"' : ''}>`);
    if (teile.length) aus.push(`      <attributes>${teile.join('')}</attributes>`);
    for (const x of tempi) {
      if (taktIndex(takte, x.t) !== i) continue;
      aus.push('      ' + tempoText(x.bpm, D(x.t - tk.start)));
    }

    // Vorzeichen je System in zeitlicher Reihenfolge (gelten bis Taktende)
    const akz = new Map();
    for (const sys of ['oben', 'unten']) {
      const zust = new Map();
      for (const n of proTakt[i].filter((x) => x.system === sys).sort((a, b) => a.t - b.t || a.midi - b.midi)) {
        const s = stufe(n.sw), vz = n.sw.vorz || 0;
        const ist = zust.has(s) ? zust.get(s) : tonartVorz(n.sw.stamm, q);
        zust.set(s, vz);
        if (n.bindung.ende && Math.abs(n.t - tk.start) < EPS) continue;
        if (ist !== vz) akz.set(n, AKZ[vz]);
      }
    }

    const notenXml = (n, { akkord, voice, staff, wert }) => {
      const sw = n.sw;
      let x = '<note>';
      if (akkord) x += '<chord/>';
      x += `<pitch><step>${STEP[sw.stamm]}</step>${sw.vorz ? `<alter>${sw.vorz}</alter>` : ''}<octave>${sw.oktave}</octave></pitch>`;
      x += `<duration>${D(n.dauer)}</duration>`;
      if (n.bindung.ende) x += '<tie type="stop"/>';
      if (n.bindung.start) x += '<tie type="start"/>';
      x += `<voice>${voice}</voice>`;
      if (wert) { x += `<type>${wert.typ}</type>` + '<dot/>'.repeat(wert.punkte || 0); }
      if (akz.has(n)) x += `<accidental>${akz.get(n)}</accidental>`;
      if (wert?.tupel) x += `<time-modification><actual-notes>${wert.tupel[0]}</actual-notes><normal-notes>${wert.tupel[1]}</normal-notes></time-modification>`;
      x += `<staff>${staff}</staff>`;
      const nots = [];
      if (n.bindung.ende) nots.push('<tied type="stop"/>');
      if (n.bindung.start) nots.push('<tied type="start"/>');
      if (n.finger != null) nots.push(`<technical><fingering>${n.finger}</fingering></technical>`);
      if (nots.length) x += `<notations>${nots.join('')}</notations>`;
      return x + '</note>';
    };
    const pausen = (von, laenge, voice, staff) => {
      const r = [];
      let u = von;
      for (const d of zerlegeDauer(laenge)) {
        const w = notenwert(d);
        r.push(`<note><rest/><duration>${D(d)}</duration><voice>${voice}</voice>${w ? `<type>${w.typ}</type>${'<dot/>'.repeat(w.punkte || 0)}` : ''}${w?.tupel ? `<time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes></time-modification>` : ''}<staff>${staff}</staff></note>`);
        u += d;
      }
      return r;
    };

    const zeilen = [];
    let geschrieben = false;
    for (const [staff, sys, basis] of [[1, 'oben', 1], [2, 'unten', 5]]) {
      const stimmen = stimmenBilden(proTakt[i].filter((n) => n.system === sys));
      if (!stimmen.length) {
        if (geschrieben) zeilen.push(`<backup><duration>${D(dauer)}</duration></backup>`);
        zeilen.push(`<note><rest measure="yes"/><duration>${D(dauer)}</duration><voice>${basis}</voice><staff>${staff}</staff></note>`);
        geschrieben = true;
        continue;
      }
      stimmen.forEach((akkorde, k) => {
        if (geschrieben) zeilen.push(`<backup><duration>${D(dauer)}</duration></backup>`);
        const voice = basis + k;
        let pos = tk.start;
        for (const a of akkorde) {
          if (a.t > pos + EPS) {
            if (k === 0) zeilen.push(...pausen(pos, a.t - pos, voice, staff));
            else zeilen.push(`<forward><duration>${D(a.t - pos)}</duration><voice>${voice}</voice><staff>${staff}</staff></forward>`);
          }
          const wert = notenwert(a.dauer);
          a.noten.sort((x, y) => x.midi - y.midi).forEach((n, j) => zeilen.push(notenXml(n, { akkord: j > 0, voice, staff, wert })));
          pos = a.t + a.dauer;
        }
        const rest = tk.start + dauer - pos;
        if (rest > EPS) {
          if (k === 0) zeilen.push(...pausen(pos, rest, voice, staff));
          else zeilen.push(`<forward><duration>${D(rest)}</duration><voice>${voice}</voice><staff>${staff}</staff></forward>`);
        }
        geschrieben = true;
      });
    }
    for (const z of zeilen) aus.push('      ' + z);
    aus.push('    </measure>');
  });
  aus.push('  </part>');
  aus.push('</score-partwise>');
  return aus.join('\n') + '\n';
}

// ───────────────────────── MIDI ─────────────────────────
const PPQ = 480;
function vlq(n) {
  const b = [n & 0x7f];
  while ((n = Math.floor(n / 128)) > 0) b.unshift((n & 0x7f) | 0x80);
  return b;
}
const utf8 = (s) => Array.from(new TextEncoder().encode(s));
function spurBytes(ereignisse) {
  // ereignisse: [{tick, rang, bytes}] – rang ordnet gleichzeitige Ereignisse (Meta < Note-Off < Note-On)
  ereignisse.sort((a, b) => a.tick - b.tick || a.rang - b.rang);
  const d = [];
  let letzter = 0;
  for (const e of ereignisse) { d.push(...vlq(Math.max(0, e.tick - letzter)), ...e.bytes); letzter = Math.max(letzter, e.tick); }
  d.push(0, 0xff, 0x2f, 0);
  return [0x4d, 0x54, 0x72, 0x6b, (d.length >>> 24) & 255, (d.length >>> 16) & 255, (d.length >>> 8) & 255, d.length & 255, ...d];
}

/**
 * Stück → MIDI-Datei (Format 1): Spur 0 = Titel, Tempo, Taktart, Tonart; Spur 1 = Rechte Hand (Kanal 1); Spur 2 = Linke Hand (Kanal 2).
 * Haltebögen werden zu einem langen Ton zusammengefasst.
 * @returns {Uint8Array}
 */
export function alsMidi(st, opt = {}) {
  const tick = (q) => Math.round(q * PPQ);
  const takte = st.takte;
  const t0 = [];
  const titel = opt.titel || st.titel || 'Stück';
  const name = utf8(titel).slice(0, 120);
  t0.push({ tick: 0, rang: 0, bytes: [0xff, 0x03, ...vlq(name.length), ...name] });
  const tempi = st.tempi && st.tempi.length ? st.tempi : [{ t: 0, bpm: st.tempo || 80 }];
  for (const x of tempi) {
    const us = Math.max(1, Math.min(0xffffff, Math.round(60000000 / x.bpm)));
    t0.push({ tick: tick(x.t), rang: 2, bytes: [0xff, 0x51, 3, (us >> 16) & 255, (us >> 8) & 255, us & 255] });
  }
  let vorTa = '', vorTon = '';
  takte.forEach((tk, i) => {
    const dauer = tk.dauer ?? taktDauer(tk), nenn = taktDauer(tk);
    const letzter = i === takte.length - 1 && i > 0;
    const ta = !letzter && Math.abs(dauer - nenn) > EPS ? passendeTaktart(dauer, tk.taktart) : tk.taktart;
    if (ta.join('/') !== vorTa) {
      const dd = Math.round(Math.log2(ta[1]));
      t0.push({ tick: tick(tk.start), rang: 1, bytes: [0xff, 0x58, 4, ta[0] & 255, dd, 24, 8] });
      vorTa = ta.join('/');
    }
    const q = tk.tonart?.quinten || 0, mi = tk.tonart?.modus === 'moll' ? 1 : 0;
    if (`${q}/${mi}` !== vorTon) {
      t0.push({ tick: tick(tk.start), rang: 1, bytes: [0xff, 0x59, 2, q & 255, mi] });
      vorTon = `${q}/${mi}`;
    }
  });
  const spuren = [spurBytes(t0)];
  const klingend = klingendeNoten(st);
  for (const [sys, kanal, spurName, vel] of [['oben', 0, 'Rechte Hand', 80], ['unten', 1, 'Linke Hand', 70]]) {
    const n = utf8(spurName);
    const ev = [{ tick: 0, rang: 0, bytes: [0xff, 0x03, ...vlq(n.length), ...n] }, { tick: 0, rang: 1, bytes: [0xc0 | kanal, 0] }];
    for (const k of klingend) {
      if (k.system !== sys) continue;
      const a = tick(k.t), b = Math.max(a + 1, tick(k.t + k.dauer));
      ev.push({ tick: a, rang: 3, bytes: [0x90 | kanal, k.midi & 127, vel] });
      ev.push({ tick: b, rang: 2, bytes: [0x80 | kanal, k.midi & 127, 0] });
    }
    spuren.push(spurBytes(ev));
  }
  const kopf = [0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 1, 0, spuren.length, (PPQ >> 8) & 255, PPQ & 255];
  const gesamt = kopf.length + spuren.reduce((a, s) => a + s.length, 0);
  const out = new Uint8Array(gesamt);
  out.set(kopf, 0);
  let p = kopf.length;
  for (const s of spuren) { out.set(s, p); p += s.length; }
  return out;
}
