// intervalle.js – Intervalle zwischen zwei Tönen auf Deutsch benennen (kurz „gr. 3“, lang „große Terz“).
// Kennt die Schreibweise (Fis/Ges), dann wird genau benannt (übermäßige Quarte oder verminderte Quinte);
// sonst nach Halbtönen. Reines ES-Modul, läuft im Browser und in Node.
import { STAEMME, stufe, deutscherName, schreibweiseAus } from './modell.js';

const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, H: 11 };
const BASIS = [0, 0, 2, 4, 5, 7, 9, 11]; // Halbtöne der reinen/großen Intervalle, Index = Zahl 1..7
const REIN = new Set([1, 4, 5]);
const ZAHL = ['', 'Prime', 'Sekunde', 'Terz', 'Quarte', 'Quinte', 'Sexte', 'Septime', 'Oktave', 'None', 'Dezime', 'Undezime', 'Duodezime', 'Tredezime', 'Quartdezime', 'Doppeloktave'];
const ART = {
  rein: ['reine', 'r.'], gross: ['große', 'gr.'], klein: ['kleine', 'kl.'], ueber: ['übermäßige', 'übm.'], vermindert: ['verminderte', 'verm.'],
  dueber: ['doppelt übermäßige', 'dpl. übm.'], dvermindert: ['doppelt verminderte', 'dpl. verm.'],
};

// Nach Halbtönen (ohne Schreibweise): 0 … 12
const HALB = [
  ['Prime', 'Prim'], ['kleine Sekunde', 'kl. 2'], ['große Sekunde', 'gr. 2'], ['kleine Terz', 'kl. 3'], ['große Terz', 'gr. 3'],
  ['reine Quarte', 'r. 4'], ['Tritonus', 'Trit.'], ['reine Quinte', 'r. 5'], ['kleine Sexte', 'kl. 6'], ['große Sexte', 'gr. 6'],
  ['kleine Septime', 'kl. 7'], ['große Septime', 'gr. 7'], ['Oktave', 'Okt.'],
];
const HALB_ZAHL = [1, 2, 2, 3, 3, 4, 4, 5, 6, 6, 7, 7, 8];

const plural = (h) => `${h} ${h === 1 ? 'Halbton' : 'Halbtöne'}`;

/** Name nur aus der Halbtonzahl (h ≥ 0). */
export function nachHalbtoenen(h) {
  h = Math.abs(Math.round(h));
  if (h <= 12) {
    const [lang, kurz] = HALB[h];
    return { lang, kurz, zahl: HALB_ZAHL[h], halbtoene: h, zusatz: h === 6 ? 'übermäßige Quarte / verminderte Quinte' : '' };
  }
  const o = Math.floor(h / 12), r = h % 12;
  if (r === 0) return { lang: o === 2 ? 'Doppeloktave' : `${o} Oktaven`, kurz: `${o} Okt.`, zahl: 7 * o + 1, halbtoene: h, zusatz: '' };
  const einfach = nachHalbtoenen(r);
  const zahl = einfach.zahl + 7 * o;
  if (r === 6) {
    // Tritonus über der Oktave: übermäßige Undezime
    const lang = zahl <= 15 ? `übermäßige ${ZAHL[zahl]}` : `Tritonus + ${o} Oktaven`;
    return { lang, kurz: `übm. ${zahl}`, zahl, halbtoene: h, zusatz: 'Tritonus + Oktave' };
  }
  const [adj] = einfach.lang.split(' ');
  const lang = zahl <= 15 ? `${adj} ${ZAHL[zahl]}` : `${einfach.lang} + ${o} Oktaven`;
  return { lang, kurz: `${einfach.kurz.split(' ')[0]} ${zahl}`, zahl, halbtoene: h, zusatz: '' };
}

/** Genaue Benennung aus zwei Schreibweisen (aufwärts: sw1 tiefer oder gleich). */
function ausSchreibweise(sw1, sw2, h) {
  const d = stufe(sw2) - stufe(sw1);
  if (d < 0) return null;
  const zahl = d + 1;
  const red = ((zahl - 1) % 7) + 1, okt = Math.floor((zahl - 1) / 7);
  const diff = h - (BASIS[red] + 12 * okt);
  let art;
  // auch doppelt übermäßig/vermindert (Eis → Ges, C → Fisis), damit Name und Notennamen immer zusammenpassen
  if (REIN.has(red)) art = { 0: 'rein', 1: 'ueber', '-1': 'vermindert', 2: 'dueber', '-2': 'dvermindert' }[diff] || null;
  else art = { 0: 'gross', '-1': 'klein', 1: 'ueber', '-2': 'vermindert', 2: 'dueber', '-3': 'dvermindert' }[diff] || null;
  if (!art) return null;
  let lang, kurz;
  if (red === 1 && art === 'rein') {
    lang = zahl === 1 ? 'Prime' : zahl === 8 ? 'Oktave' : zahl === 15 ? 'Doppeloktave' : `${okt} Oktaven`;
    kurz = zahl === 1 ? 'Prim' : zahl === 8 ? 'Okt.' : `${okt} Okt.`;
  } else {
    lang = zahl <= 15 ? `${ART[art][0]} ${ZAHL[zahl]}` : `${ART[art][0]} ${ZAHL[red]} + ${okt} Oktaven`;
    kurz = `${ART[art][1]} ${zahl}`;
  }
  let zusatz = '';
  if (h % 12 === 6 && (red === 4 || red === 5)) zusatz = 'Tritonus';
  else if (art !== 'rein' && art !== 'gross' && art !== 'klein') zusatz = 'klingt wie ' + nachHalbtoenen(Math.max(0, h)).lang;
  return { lang, kurz, zahl, halbtoene: h, zusatz };
}

const swVon = (x) => x.schreibweise || x.sw || schreibweiseAus(x.midi);
const midiVon = (sw) => 12 * (sw.oktave + 1) + PC[sw.stamm] + (sw.vorz || 0);

/** Schreibweise für einen Ton ohne Notenbild (getippte Taste): so, dass das Intervall zum Bezugston „einfach“ heißt
 *  (H → Dis = große Terz statt H → Es = verminderte Quarte). */
export function passendeSchreibweise(swA, midiB) {
  const h = midiB - midiVon(swA), b = Math.abs(h);
  const okt = 7 * Math.floor(b / 12);
  // Tritonus: übermäßige Quarte oder verminderte Quinte – je nachdem, was weniger Vorzeichen braucht (H → F statt H → Eis)
  const zahlen = b % 12 === 6 ? [4 + okt, 5 + okt] : [HALB_ZAHL[b % 12] + okt];
  let best = null;
  for (const zahl of zahlen) {
    const st = stufe(swA) + Math.sign(h) * (zahl - 1);
    const t = { stamm: STAEMME[((st % 7) + 7) % 7], vorz: 0, oktave: Math.floor(st / 7) };
    t.vorz = midiB - midiVon(t);
    if (!best || Math.abs(t.vorz) < Math.abs(best.vorz)) best = t;
  }
  return Math.abs(best.vorz) <= 1 ? best : schreibweiseAus(midiB);
}

/**
 * Intervall vom Bezugston a zum Ton b. a, b: {midi, schreibweise?}
 * → {lang, kurz, zahl, halbtoene, zusatz, abwaerts, tief, hoch}
 */
export function intervall(a, b) {
  const swA = swVon(a), swB = b.schreibweise || b.sw || passendeSchreibweise(swA, b.midi);
  let abwaerts = b.midi < a.midi || (b.midi === a.midi && stufe(swB) < stufe(swA));
  const [t, ho] = abwaerts ? [{ ...b, sw: swB }, { ...a, sw: swA }] : [{ ...a, sw: swA }, { ...b, sw: swB }];
  const h = ho.midi - t.midi;
  // Sehr ungewöhnliche Schreibweise (z. B. Ces über His): ehrlich nach Halbtönen benennen
  const iv = ausSchreibweise(t.sw, ho.sw, h) || { ...nachHalbtoenen(h), zusatz: 'ungewöhnliche Schreibweise – nach Halbtönen benannt' };
  if (h === 0) abwaerts = false;
  return { ...iv, abwaerts, tief: t, hoch: ho };
}

/** Lange Form für die Karte: „A → C = kleine Terz (3 Halbtöne)“ – immer vom tieferen zum höheren Ton. */
export function langText(iv) {
  const mitOktave = iv.halbtoene >= 12; // über die Oktave: mit Oktavlage (c → e1), sonst klingt es nach Terz
  const n1 = deutscherName(iv.tief.sw, { mitOktave }), n2 = deutscherName(iv.hoch.sw, { mitOktave });
  return `${n1} → ${n2} = ${iv.lang} (${plural(iv.halbtoene)})`;
}

/** Intervall vom Grundton aufwärts innerhalb einer Oktave (für „vom Grundton“): wurzel/ton = Schreibweisen. */
export function vomGrundton(wurzel, ton) {
  let nat = PC[ton.stamm] - PC[wurzel.stamm];
  if (nat < 0) nat += 12;
  const h = nat + (ton.vorz || 0) - (wurzel.vorz || 0);
  const w = { stamm: wurzel.stamm, vorz: wurzel.vorz || 0, oktave: 4 };
  const t = { stamm: ton.stamm, vorz: ton.vorz || 0, oktave: 4 + (STAEMME.indexOf(ton.stamm) < STAEMME.indexOf(wurzel.stamm) ? 1 : 0) };
  const iv = ausSchreibweise(w, t, h) || nachHalbtoenen(((h % 12) + 12) % 12);
  return { ...iv, abwaerts: false, tief: { midi: midiVon(w), sw: w }, hoch: { midi: midiVon(t), sw: t } };
}

export const halbtonText = plural;
