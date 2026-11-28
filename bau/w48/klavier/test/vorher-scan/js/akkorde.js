// js/akkorde.js – Akkord-Erkennung (Grundton, Terz, Quinte, Septime, Umkehrung, Lage)
// Reines ES-Modul, keine Bibliotheken. Läuft im Browser und in Node (für Tests).

export const ROLLEN_NAME = {
  grundton: 'Grundton', terz: 'Terz', quinte: 'Quinte', septime: 'Septime',
  option: 'Zusatzton', fremd: 'kein Akkordton',
};
/** Kurzzeichen für Tasten/Notenköpfe: 1 3 5 7 */
export const ROLLEN_KURZ = { grundton: '1', terz: '3', quinte: '5', septime: '7', option: '+', fremd: '' };

/** Feste Akkord-Farben (Xander): Grundton rot, Terz orange, Quinte grün, Septime blau, Optionen lila, Rest grau. */
export const ROLLEN_FARBEN = {
  hell:   { grundton: '#e5484d', terz: '#f59e0b', quinte: '#22a06b', septime: '#3b82f6', option: '#9b5de5', fremd: '#9aa0a6' },
  dunkel: { grundton: '#ff6b6f', terz: '#ffb83d', quinte: '#3dd68c', septime: '#6ea8ff', option: '#b98cff', fremd: '#7d838a' },
};

export function istDunkel() {
  try {
    const t = document.documentElement.dataset.theme;
    if (t) return t === 'dark' || t === 'dunkel';
    return matchMedia('(prefers-color-scheme: dark)').matches;
  } catch { return false; }
}
export function rollenFarbe(rolle, dunkel = istDunkel()) {
  const p = dunkel ? ROLLEN_FARBEN.dunkel : ROLLEN_FARBEN.hell;
  return p[rolle] || p.fremd;
}

// ---------- Tonnamen (deutsch: H = h, B = b) ----------
export const STAMM = ['C', 'D', 'E', 'F', 'G', 'A', 'H'];
export const STAMM_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, H: 11 };
const pcVon = (m) => ((m % 12) + 12) % 12;

export function tonName(stamm, vorz = 0) {
  if (!vorz) return stamm;
  if (vorz > 0) return stamm + 'is'.repeat(vorz);
  if (stamm === 'H') return vorz === -1 ? 'B' : 'Heses';
  if (stamm === 'E') return vorz === -1 ? 'Es' : 'Eses';
  if (stamm === 'A') return vorz === -1 ? 'As' : 'Asas';
  return stamm + 'es'.repeat(-vorz);
}
/** Deutsche Oktavschreibweise: A₂ … C₁ … C (groß) … c (klein) … c1 … c5 */
export function oktavName(name, o) {
  if (o >= 3) return name.toLowerCase() + (o > 3 ? String(o - 3) : '');
  if (o === 2) return name;
  return name + (o === 1 ? '₁' : o === 0 ? '₂' : '₃');
}
export function midiAus(s) { return (s.oktave + 1) * 12 + STAMM_PC[s.stamm] + (s.vorz || 0); }

const STANDARD = [['C', 0], ['C', 1], ['D', 0], ['E', -1], ['E', 0], ['F', 0], ['F', 1], ['G', 0], ['A', -1], ['A', 0], ['H', -1], ['H', 0]];
const KREUZ = [['C', 0], ['C', 1], ['D', 0], ['D', 1], ['E', 0], ['F', 0], ['F', 1], ['G', 0], ['G', 1], ['A', 0], ['A', 1], ['H', 0]];
const BE = [['C', 0], ['D', -1], ['D', 0], ['E', -1], ['E', 0], ['F', 0], ['G', -1], ['G', 0], ['A', -1], ['A', 0], ['H', -1], ['H', 0]];
/** vorliebe > 0: Kreuze, < 0: Bs, 0: übliche Namen (Cis, Es, Fis, As, B) */
export function schreibweiseAus(midi, vorliebe = 0) {
  const [stamm, vorz] = (vorliebe > 0 ? KREUZ : vorliebe < 0 ? BE : STANDARD)[pcVon(midi)];
  return { stamm, vorz, oktave: Math.floor(midi / 12) - 1 };
}
export function notenName(x, mitOktave = true) {
  const s = typeof x === 'number' ? schreibweiseAus(x) : x;
  const n = tonName(s.stamm, s.vorz);
  return mitOktave ? oktavName(n, s.oktave) : n;
}

/** Diatonische Stelle im System: 0 = unterste Linie (Bass: großes G, Violin: e1), gerade = Linie */
export function systemPosition(s, schluessel = 'bass') {
  const diat = s.oktave * 7 + STAMM.indexOf(s.stamm);
  return diat - (schluessel === 'bass' ? 2 * 7 + 4 : 4 * 7 + 2);
}
export function ortImSystem(s, schluessel = 'bass') {
  const p = systemPosition(s, schluessel);
  if (p >= 0 && p <= 8) return p % 2 === 0 ? `auf der ${p / 2 + 1}. Linie` : `im ${(p + 1) / 2}. Zwischenraum`;
  if (p < 0) {
    if (p % 2 === 0) return `auf der ${-p / 2}. Hilfslinie unten`;
    return p === -1 ? 'direkt unter dem System' : `unter der ${(-p - 1) / 2}. Hilfslinie unten`;
  }
  if (p % 2 === 0) return `auf der ${(p - 8) / 2}. Hilfslinie oben`;
  return p === 9 ? 'direkt über dem System' : `über der ${(p - 9) / 2}. Hilfslinie oben`;
}

const IV_NAMEN = ['Prime', 'kleine Sekunde', 'große Sekunde', 'kleine Terz', 'große Terz', 'Quarte', 'Tritonus',
  'Quinte', 'kleine Sexte', 'große Sexte', 'kleine Septime', 'große Septime'];
export function intervallName(h) {
  h = Math.abs(h);
  if (h === 12) return 'Oktave';
  if (h < 12) return IV_NAMEN[h];
  const o = Math.floor(h / 12), r = h % 12;
  return r === 0 ? `${o} Oktaven` : `${IV_NAMEN[r]} + ${o === 1 ? 'Oktave' : o + ' Oktaven'}`;
}

// ---------- Vorlagen ----------
// k = kleiner Malus für seltenere Akkorde, damit einfache Dreiklänge bei Gleichstand gewinnen
export const VORLAGEN = [
  { art: 'dur', iv: [0, 4, 7], k: 0, text: 'Dur-Dreiklang', sym: '' },
  { art: 'moll', iv: [0, 3, 7], k: 0, text: 'Moll-Dreiklang', sym: 'm' },
  { art: 'vermindert', iv: [0, 3, 6], k: 0.05, text: 'verminderter Dreiklang', sym: '°' },
  { art: 'uebermaessig', iv: [0, 4, 8], k: 0.08, text: 'übermäßiger Dreiklang', sym: '+' },
  { art: 'sus4', iv: [0, 5, 7], k: 0.06, text: 'Quartvorhalt (sus4)', sym: 'sus4' },
  { art: 'sus2', iv: [0, 2, 7], k: 0.07, text: 'Sekundvorhalt (sus2)', sym: 'sus2' },
  { art: '7', iv: [0, 4, 7, 10], k: 0.03, text: 'Dominantseptakkord', sym: '7' },
  { art: 'maj7', iv: [0, 4, 7, 11], k: 0.05, text: 'großer Septakkord', sym: 'maj7' },
  { art: 'm7', iv: [0, 3, 7, 10], k: 0.04, text: 'Moll-Septakkord', sym: 'm7' },
  { art: 'm7b5', iv: [0, 3, 6, 10], k: 0.06, text: 'halbverminderter Septakkord', sym: 'ø7' },
  { art: 'dim7', iv: [0, 3, 6, 9], k: 0.06, text: 'verminderter Septakkord', sym: '°7' },
  { art: '7sus4', iv: [0, 5, 7, 10], k: 0.08, text: 'Septakkord mit Quartvorhalt', sym: '7sus4' },
];
const FEHLT = [0.3, 0.25, 0.12, 0.35]; // Malus, wenn Grundton/Terz/Quinte/Septime fehlt
const istSus = (v) => v.art.includes('sus');
const rolleAnStelle = (v, k) => (k === 0 ? 'grundton' : k === 1 ? (istSus(v) ? 'option' : 'terz') : k === 2 ? 'quinte' : 'septime');
const rollenText = (v, k) => (k === 1 && istSus(v) ? (v.art.includes('sus4') ? 'Quarte' : 'Sekunde') : ROLLEN_NAME[rolleAnStelle(v, k)]);
const optionIv = (v) => (v.art === 'moll' || v.art === 'm7' ? [2, 5, 9] : [2, 9]);

function bewerte(w, bassPc) {
  let best = null;
  for (let r = 0; r < 12; r++) {
    for (const v of VORLAGEN) {
      let rein = 0, fehlt = 0;
      for (let k = 0; k < v.iv.length; k++) {
        const g = w[(r + v.iv[k]) % 12];
        rein += g;
        if (g < 0.02) fehlt += FEHLT[k];
      }
      const s = rein - 0.6 * (1 - rein) - fehlt - v.k + (bassPc === r ? 0.1 : 0);
      if (!best || s > best.s + 1e-9) best = { s, r, v, rein };
    }
  }
  return best;
}

function fenster(noten, a, b) {
  const w = new Float64Array(12);
  const drin = [];
  for (const n of noten) {
    if (n.t >= b - 1e-6) break; // sortiert
    const e = n.t + n.dauer;
    if (e <= a + 1e-6) continue;
    let g = (Math.min(b, e) - Math.max(a, n.t)) * (n.t >= a - 1e-6 ? 1 : 0.5);
    if (Math.abs(n.t - a) < 1e-6) g *= 1.3;
    drin.push(n);
    w[pcVon(n.midi)] += g;
  }
  if (!drin.length) return null;
  let bass = drin[0];
  for (const n of drin) if (n.midi < bass.midi) bass = n;
  w[pcVon(bass.midi)] *= 1.5; // Basston zählt mehr
  let summe = 0; for (const g of w) summe += g;
  let pcs = 0;
  for (let i = 0; i < 12; i++) { w[i] /= summe || 1; if (w[i] > 0) pcs++; }
  const best = bewerte(w, pcVon(bass.midi));
  return { a, b, w, drin, bass, pcs, best, guete: best.rein - (1 - best.rein) };
}

const enthaelt = (best, pc) => best.v.iv.some((i) => (best.r + i) % 12 === pc);

/**
 * Analysiert ein Stück. Fenster: ganzer Takt → halber Takt → Schlag (feiner nur, wenn nötig).
 * @param {object} stueck  Stück laut modell.js
 * @param {{nurSystem?: 'oben'|'unten'}} [opt]
 * @returns {Array} Segmente {von, bis, name, kurz, grundton, art, umkehrung, umkehrungText, bass, rollen, intervalle, erklaerung, …}
 */
export function analysiere(stueck, opt = {}) {
  const noten = (stueck.noten || [])
    .filter((n) => !opt.nurSystem || n.system === opt.nurSystem)
    .slice().sort((x, y) => x.t - y.t || x.midi - y.midi);
  if (!noten.length) return [];
  let takte = stueck.takte && stueck.takte.length ? stueck.takte : null;
  if (!takte) {
    const ende = Math.max(...noten.map((n) => n.t + n.dauer));
    takte = []; for (let s = 0, nr = 1; s < ende; s += 4, nr++) takte.push({ nr, taktart: [4, 4], start: s });
  }
  const roh = [];
  takte.forEach((takt, i) => {
    const [z, n] = takt.taktart || [4, 4];
    let L = (z * 4) / n;
    if (takte[i + 1]) L = Math.min(L, takte[i + 1].start - takt.start) || L; // Auftakt
    const a = takt.start;
    const zus = n === 8 && z % 3 === 0 && z > 3;
    const schlag = Math.min(L, zus ? 1.5 : 4 / n);
    const anz = Math.max(1, Math.round(L / schlag));
    const schlaege = (von, bis) => { const r = []; for (let q = von; q < bis - 1e-6; q += schlag) r.push([q, Math.min(bis, q + schlag)]); return r; };
    const vorl = (takt.tonart && takt.tonart.quinten) || 0;
    const ganz = fenster(noten, a, a + L);
    if (!ganz) return;
    if (ganz.guete >= 0.8 || anz === 1) { ganz.takt = takt.nr; ganz.vorl = vorl; roh.push(ganz); return; }
    const teile = anz % 2 === 0 && anz >= 4 ? [[a, a + L / 2], [a + L / 2, a + L]] : schlaege(a, a + L);
    for (const [p, q] of teile) {
      const f = fenster(noten, p, q);
      if (!f) continue;
      if (f.guete >= 0.7 || q - p <= schlag + 1e-6) { f.takt = takt.nr; f.vorl = vorl; roh.push(f); continue; }
      for (const [x, y] of schlaege(p, q)) { const g = fenster(noten, x, y); if (g) { g.takt = takt.nr; g.vorl = vorl; roh.push(g); } }
    }
  });
  // Zusammenfassen: gleicher Akkord + gleicher Bass; Einzeltöne, die passen, gehören zum Nachbarn
  const zus = [];
  for (const f of roh) {
    const vor = zus[zus.length - 1];
    if (vor) {
      const gleich = vor.pcs >= 2 && f.pcs >= 2 && vor.best.r === f.best.r && vor.best.v === f.best.v && pcVon(vor.bass.midi) === pcVon(f.bass.midi);
      const passt = vor.pcs >= 2 && f.pcs < 2 && f.drin.every((n) => enthaelt(vor.best, pcVon(n.midi)));
      if (gleich || passt) {
        vor.b = f.b;
        for (const n of f.drin) if (!vor.drin.includes(n)) vor.drin.push(n);
        continue;
      }
    }
    zus.push({ ...f, drin: f.drin.slice() });
  }
  return zus.map((f) => baueSegment(f, f.vorl));
}

function baueSegment(f, vorl = 0) {
  const { best, bass, drin, a, b } = f;
  const { r, v } = best;
  const einzel = f.pcs < 2;
  const gNote = drin.find((n) => pcVon(n.midi) === r && n.schreibweise);
  const gs = gNote ? gNote.schreibweise : schreibweiseAus(r + 60, vorl);
  const g = tonName(gs.stamm, gs.vorz);
  const klein = g.toLowerCase();
  const name = einzel ? `Einzelton ${g}` : {
    dur: `${g}-Dur`, moll: `${klein}-Moll`, vermindert: `${klein}-vermindert`, uebermaessig: `${g}-übermäßig`,
    sus4: `${g}-sus4`, sus2: `${g}-sus2`,
  }[v.art] || `${g}${v.sym} (${v.text})`;
  const kurz = einzel ? g : g + v.sym;
  const rollen = new Map();
  const neu = new Set();
  for (const n of drin) {
    const iv = (pcVon(n.midi) - r + 12) % 12;
    const k = v.iv.indexOf(iv);
    let rolle;
    if (einzel) rolle = 'fremd';
    else if (k >= 0) rolle = rolleAnStelle(v, k);
    else rolle = optionIv(v).includes(iv) && (n.dauer >= 1 - 1e-6 || Math.abs(n.t - a) < 1e-6) ? 'option' : 'fremd';
    rollen.set(n.id, rolle);
    if (n.t >= a - 1e-6 && n.t < b - 1e-6) neu.add(n.id);
  }
  const bassS = bass.schreibweise || schreibweiseAus(bass.midi, vorl);
  const bassTon = tonName(bassS.stamm, bassS.vorz);
  const bassVoll = oktavName(bassTon, bassS.oktave);
  const kb = v.iv.indexOf((pcVon(bass.midi) - r + 12) % 12);
  const bassFremd = einzel || kb < 0;
  const umkehrung = bassFremd ? 0 : kb;
  const umkehrungText = bassFremd ? 'Bass ist kein Akkordton'
    : kb === 0 ? 'Grundstellung'
    : kb === 1 ? `1. Umkehrung (${rollenText(v, 1)} im Bass)`
    : kb === 2 ? '2. Umkehrung (Quinte im Bass)' : '3. Umkehrung (Septime im Bass)';
  // Lage und Abstände
  const akkMidis = [...new Set(drin.filter((n) => { const ro = rollen.get(n.id); return ro !== 'fremd'; }).map((n) => n.midi))].sort((x, y) => x - y);
  const spanne = akkMidis.length ? akkMidis[akkMidis.length - 1] - akkMidis[0] : 0;
  const lage = spanne > 12 ? 'weit' : 'eng';
  const bm = akkMidis[0] ?? bass.midi;
  const intervalle = akkMidis.slice(1).map((m) => {
    const n = drin.find((x) => x.midi === m);
    const s = (n && n.schreibweise) || schreibweiseAus(m, vorl);
    return { von: bassVoll, zu: notenName(s), halbtoene: m - bm, name: intervallName(m - bm), rolle: rollen.get(n.id) };
  });
  const luecke = akkMidis.length > 1 ? akkMidis[1] - akkMidis[0] : 0;
  const schl = bass.system === 'oben' ? 'Violinschlüssel' : 'Bassschlüssel';
  let erklaerung;
  if (einzel) erklaerung = `Nur ein Ton: ${bassVoll}. Er steht im ${schl} ${ortImSystem(bassS, bass.system === 'oben' ? 'violin' : 'bass')}.`;
  else {
    erklaerung = bassFremd
      ? `Im Bass liegt ${bassTon} – das ist kein Ton von ${name} (Durchgangs- oder Orgelton).`
      : `Im Bass liegt ${bassTon} = ${rollenText(v, kb)} von ${name} → ${umkehrungText.replace(/ \(.*\)$/, '')}.`;
    erklaerung += lage === 'weit'
      ? ` Weite Lage: die Akkordtöne verteilen sich über ${intervallName(spanne)}.`
      : ' Enge Lage: alle Akkordtöne innerhalb einer Oktave.';
    if (luecke > 12) erklaerung += ` Der Bass liegt mehr als eine Oktave unter dem nächsten Akkordton (${intervallName(luecke)}).`;
    erklaerung += ` Der Basston ${bassVoll} steht im ${schl} ${ortImSystem(bassS, bass.system === 'oben' ? 'violin' : 'bass')}.`;
  }
  return {
    von: a, bis: b, takt: f.takt, name, kurz, grundton: g, grundtonPc: r, grundtonSw: gs, art: einzel ? 'einzelton' : v.art,
    artText: einzel ? 'Einzelton' : v.text, umkehrung, umkehrungText, bassFremd, bass: bassTon, bassVoll, bassMidi: bass.midi,
    rollen, neu, noten: drin, intervalle, lage, spanne, erklaerung, sicherheit: Math.max(0, Math.min(1, best.s)),
    unvollstaendig: !einzel && v.iv.some((i) => f.w[(r + i) % 12] < 0.02),
  };
}

/** Ein Akkord aus einzelnen MIDI-Tönen (für Übungen/Tests). schreibweisen optional parallel zu midis. */
export function akkordAusMidis(midis, opt = {}) {
  const noten = midis.map((m, i) => ({ id: 'm' + i, t: 0, dauer: 1, midi: m, system: opt.system || 'unten', schreibweise: opt.schreibweisen && opt.schreibweisen[i] }));
  const seg = analysiere({ noten, takte: [{ nr: 1, taktart: [1, 4], start: 0, tonart: { quinten: opt.quinten || 0 } }] });
  return seg[0] || null;
}

/** Farben je Note: jede Note bekommt die Rolle aus dem Segment, in dem sie anfängt. */
export function farbKarte(segmente, opt = {}) {
  const dunkel = opt.dunkel ?? istDunkel();
  const karte = new Map();
  for (const s of segmente) {
    for (const n of s.noten) {
      if (!s.neu.has(n.id) || karte.has(n.id)) continue;
      if (opt.nurSystem && n.system !== opt.nurSystem) continue;
      karte.set(n.id, rollenFarbe(s.rollen.get(n.id), dunkel));
    }
  }
  return karte;
}
/** Rolle je Note (wie farbKarte, aber Rollen-Namen) */
export function rollenKarte(segmente) {
  const karte = new Map();
  for (const s of segmente) for (const id of s.neu) if (!karte.has(id)) karte.set(id, s.rollen.get(id));
  return karte;
}
/** Segment zur Zeit q (Viertel) */
export function segmentBei(segmente, q) {
  let lo = 0, hi = segmente.length - 1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1, s = segmente[m];
    if (q < s.von) hi = m - 1; else if (q >= s.bis) lo = m + 1; else return s;
  }
  return null;
}
