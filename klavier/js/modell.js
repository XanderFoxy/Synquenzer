// modell.js – gemeinsames Datenmodell der Klavier-Lernhilfe.
//
// Stück = {
//   titel, tempo (bpm, Viertel),
//   takte: [{ nr, taktart:[z,n], tonart:{quinten, modus:'dur'|'moll'}, start (Viertel ab Beginn),
//             dauer (Viertel), schluessel?:{oben:'G'|'F', unten:'G'|'F'} }],
//   noten: [{ id, t (Viertel ab Beginn), dauer (Viertel), midi, system:'oben'|'unten', stimme, takt (nr),
//             schreibweise:{stamm:'C'..'H', vorz:-2..2, oktave (wissenschaftlich: 4 = c1 = MIDI 60)},
//             finger?, bindung?:{start?:true, ende?:true}, typ?, punkte? }],
//   pausen?: [{ t, dauer, system, stimme, takt, ganzTakt? }],
//   tempi?: [{ t (Viertel), bpm }]   – nur bei Tempowechseln; tempo = Anfangstempo
//   quelle?: { art:'midi', … }       – Angaben zum Einlesen (Raster gerundet?, Hände-Zuordnung, Spuren)
// }
// Hinweis zu Haltebögen: Eine gebundene Folgenote (bindung.ende) wird NICHT neu angeschlagen.
// klingendeNoten(stück) fasst Bogenketten zu je einem klingenden Ton zusammen (für Wiedergabe/Analyse).

export const STAEMME = ['C', 'D', 'E', 'F', 'G', 'A', 'H'];
const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, H: 11 };
const KREUZ_FOLGE = ['F', 'C', 'G', 'D', 'A', 'E', 'H'];
const B_FOLGE = ['H', 'E', 'A', 'D', 'G', 'C', 'F'];

// Feste Akkord-Farben (Xander): Grundton rot, Terz orange, Quinte grün, Septime blau, Optionen lila, fremd grau.
export const ROLLEN_FARBE = {
  grundton: '#e5484d',
  terz: '#f59e0b',
  quinte: '#22a55b',
  septime: '#3b82f6',
  option: '#9b5de5',
  fremd: '#8b8d98',
};

export function midiAus({ stamm, vorz = 0, oktave }) {
  return 12 * (oktave + 1) + PC[stamm] + vorz;
}

/** Diatonische Stufe (C4 = 28): bestimmt die Höhe im Notensystem. */
export function stufe({ stamm, oktave }) {
  return oktave * 7 + STAEMME.indexOf(stamm);
}

/** Vorzeichen, das die Tonart für einen Stamm vorgibt (-1, 0, 1). */
export function tonartVorz(stamm, quinten = 0) {
  if (quinten > 0) return KREUZ_FOLGE.indexOf(stamm) < quinten ? 1 : 0;
  if (quinten < 0) return B_FOLGE.indexOf(stamm) < -quinten ? -1 : 0;
  return 0;
}

/** Schreibweise eines MIDI-Tons passend zur Tonart (Leitton in Moll erhöht). */
export function schreibweiseAus(midi, tonart = { quinten: 0, modus: 'dur' }) {
  const q = tonart?.quinten || 0;
  const pc = ((midi % 12) + 12) % 12;
  const mitStamm = (stamm) => {
    let vorz = pc - PC[stamm];
    if (vorz > 6) vorz -= 12;
    if (vorz < -6) vorz += 12;
    const oktave = Math.floor((midi - PC[stamm] - vorz) / 12) - 1;
    return { stamm, vorz, oktave };
  };
  // 1. leitereigen?
  for (const s of STAEMME) if (((PC[s] + tonartVorz(s, q)) % 12 + 12) % 12 === pc) return mitStamm(s);
  // 2. Moll: erhöhte 7. Stufe (Leitton), z. B. Gis in a-Moll
  const durIdx = (((q * 4) % 7) + 7) % 7;
  const durPc = (((q * 7) % 12) + 12) % 12;
  if (tonart?.modus === 'moll') {
    const mollIdx = (durIdx + 5) % 7, mollPc = (durPc + 9) % 12;
    if (pc === (mollPc + 11) % 12) return mitStamm(STAEMME[(mollIdx + 6) % 7]);
  }
  // 3. sonst: Kreuz-Tonarten Kreuze, B-Tonarten Bs; in C: Cis, Es, Fis, Gis, B
  const KREUZ = { 1: 'C', 3: 'D', 6: 'F', 8: 'G', 10: 'A' };
  const BE = { 1: 'D', 3: 'E', 6: 'G', 8: 'A', 10: 'H' };
  // weiße Taste, die die Tonart verändert (H in F-Dur, F in G-Dur): mit Auflösungszeichen schreiben
  const NATUR = { 0: 'C', 2: 'D', 4: 'E', 5: 'F', 7: 'G', 9: 'A', 11: 'H' };
  if (NATUR[pc]) return mitStamm(NATUR[pc]);
  if (q > 0) return mitStamm(KREUZ[pc]);
  if (q < 0) return mitStamm(BE[pc]);
  return mitStamm(pc === 3 || pc === 10 ? BE[pc] : KREUZ[pc]);
}

/** Deutscher Tonname: C, Cis, Des, Es, As, B, H … mit Oktave (C, c, c1 …) wenn gewünscht. */
export function deutscherName(sw, { mitOktave = false } = {}) {
  const { stamm, vorz = 0, oktave } = sw;
  let n;
  if (stamm === 'H' && vorz === -1) n = 'B';
  else if (stamm === 'H' && vorz === -2) n = 'Heses';
  else {
    n = stamm;
    if (vorz > 0) n += 'is'.repeat(vorz);
    if (vorz < 0) n += (stamm === 'E' || stamm === 'A' ? 's' : 'es') + 'es'.repeat(-vorz - 1);
  }
  if (!mitOktave) return n;
  // Helmholtz: c1 = C4 (Mitte), c = C3, C = C2, C1 = C1
  if (oktave >= 3) return n.toLowerCase() + (oktave > 3 ? String(oktave - 3) : '');
  return n + (oktave < 2 ? String(2 - oktave) : '');
}

export function taktDauer(takt) {
  return (takt.taktart[0] * 4) / takt.taktart[1];
}

/** Takt, in dem die Zeit t (Viertel) liegt. */
export function taktAn(stück, t) {
  const tk = stück.takte;
  let lo = 0, hi = tk.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (tk[mid].start <= t + 1e-9) lo = mid; else hi = mid - 1;
  }
  return tk[lo];
}

/** Fasst Haltebogen-Ketten zusammen → [{id, ids, t, dauer, midi, system, stimme, takt}] */
export function klingendeNoten(stück) {
  const offen = new Map();
  const aus = [];
  for (const n of [...stück.noten].sort((a, b) => a.t - b.t)) {
    const key = n.system + ':' + n.midi;
    let k = offen.get(key);
    if (n.bindung?.ende && k && Math.abs(k.t + k.dauer - n.t) < 1e-6) {
      k.dauer += n.dauer;
      k.ids.push(n.id);
    } else {
      k = { id: n.id, ids: [n.id], t: n.t, dauer: n.dauer, midi: n.midi, system: n.system, stimme: n.stimme, takt: n.takt };
      aus.push(k);
    }
    if (n.bindung?.start) offen.set(key, k);
    else offen.delete(key);
  }
  return aus;
}

// ───────── Notenwerte: darstellbare Dauern (für MIDI-Einlesen und Export) ─────────
const NW_GERADE = [[6, 'whole', 1], [4, 'whole', 0], [3, 'half', 1], [2, 'half', 0], [1.5, 'quarter', 1], [1, 'quarter', 0], [0.75, 'eighth', 1],
  [0.5, 'eighth', 0], [0.375, '16th', 1], [0.25, '16th', 0], [0.1875, '32nd', 1], [0.125, '32nd', 0], [0.0625, '64th', 0]];
const NW_TRIOLE = [4 / 3, 2 / 3, 1 / 3, 1 / 6, 1 / 12]; // Halbe-, Viertel-, Achtel-, 16tel-, 32tel-Triole
const fast = (a, b) => Math.abs(a - b) < 1e-6;

/** Notenwert einer Dauer (Viertel) → {typ, punkte, tupel?} oder null, wenn sie nicht als ein Wert schreibbar ist. */
export function notenwert(d) {
  for (const [v, typ, punkte] of NW_GERADE) if (fast(v, d)) return { typ, punkte };
  for (const v of NW_TRIOLE) if (fast(v, d)) { const g = NW_GERADE.find((w) => fast(w[0], v * 1.5) && !w[2]); if (g) return { typ: g[1], punkte: 0, tupel: [3, 2] }; }
  return null;
}

/** Zerlegt eine Dauer in schreibbare Notenwerte (werden mit Haltebogen verbunden), z. B. 2.5 → [2, 0.5], 5/3 → [4/3, 1/3]. */
export function zerlegeDauer(d) {
  const aus = [];
  let rest = d;
  const vielfach = (x, n) => Math.abs(x * n - Math.round(x * n)) < 1e-6;
  const gerade = NW_GERADE.map((w) => w[0]);
  for (let schutz = 0; rest > 1e-6 && schutz < 40; schutz++) {
    const liste = vielfach(rest, 16) ? gerade : vielfach(rest, 12) ? [4, 3, 2, ...NW_TRIOLE, 1].sort((a, b) => b - a) : [...gerade, ...NW_TRIOLE].sort((a, b) => b - a);
    const v = liste.find((x) => x <= rest + 1e-6);
    if (!v) { if (aus.length) aus[aus.length - 1] += rest; else aus.push(rest); break; }
    aus.push(v);
    rest -= v;
  }
  return aus;
}

/** Kurzer Selbsttest des Modells – gibt eine Liste von Problemen zurück (leer = gut). */
export function pruefe(stück) {
  const p = [];
  if (!stück || !Array.isArray(stück.takte) || !Array.isArray(stück.noten)) return ['Kein Stück'];
  if (!stück.takte.length) p.push('Keine Takte');
  const ids = new Set();
  for (const n of stück.noten) {
    if (ids.has(n.id)) p.push('Doppelte id ' + n.id);
    ids.add(n.id);
    if (!(n.dauer > 0)) p.push('Dauer ≤ 0 bei ' + n.id);
    if (midiAus(n.schreibweise) !== n.midi) p.push('Schreibweise passt nicht zu MIDI bei ' + n.id);
    if (n.system !== 'oben' && n.system !== 'unten') p.push('System falsch bei ' + n.id);
  }
  return p;
}
