// scan-ki.js – Anweisungen an die KI, Antworten lesen, Takte prüfen, Stück bauen. Rein (auch in Node testbar).
//
// Antwortformat (knapp, damit die KI sich aufs Lesen konzentriert und nichts abgeschnitten wird):
//   CLEFS G F / KEY -1 / TIME 3/4
//   M5 7 3            ← Takt 5, 7 Notenköpfe oben, 3 unten (zuerst gezählt, dann geschrieben)
//   U: E5/16 D#5/16 C5+E5/8. r/16 G4/2~
//   L: A2/8 E3/8 A3/4 R
// Vorzeichen stehen nur, wo sie GEDRUCKT sind – Tonart und Gültigkeit bis Taktende rechnet die App selbst.
import { midiAus, tonartVorz } from './modell.js';

const EPS = 1e-6;
export const STIMMEN = ['U', 'U2', 'L', 'L2'];
const STIMME_SYS = { U: 'oben', U2: 'oben', L: 'unten', L2: 'unten' };
const STIMME_NR = { U: 1, U2: 2, L: 5, L2: 6 };
const STAMM_AUS = { C: 'C', D: 'D', E: 'E', F: 'F', G: 'G', A: 'A', B: 'H', H: 'H' };
const AKZ_WERT = { '#': 1, b: -1, n: 0, x: 2, '##': 2, bb: -2 };
const TYP = { 1: 'whole', 2: 'half', 4: 'quarter', 8: 'eighth', 16: '16th', 32: '32nd', 64: '64th' };

// ───────── Anweisungen ─────────

const FORMAT_KOPF = `CLEFS <upper> <lower>      clefs at the start of this line, G or F, e.g. CLEFS G F
KEY <n>                    sharps (positive) or flats (negative) of the key signature, e.g. KEY -1
TIME <beats>/<beat-type>   the time signature in effect, e.g. TIME 3/4
then for every measure, in order:
`;
const FORMAT_TAKT = `M<number> <heads-upper> <heads-lower>
U: <events of the upper staff>
L: <events of the lower staff>

<heads-upper>/<heads-lower> = how many noteheads you see in that staff in this measure (every chord tone and every tied note counts, rests do not). Count them FIRST, then write the events so that they match.

Events, separated by spaces, in time order:
- Note: letter A-G, then the accidental ONLY if one is printed right in front of this notehead (# sharp, b flat, n natural, x double sharp, bb double flat), then the octave (middle C = C4). Do NOT apply the key signature or earlier accidentals yourself - the app does that. Examples: F4 (also when the key signature makes it F sharp), Bb3 (flat printed), En5 (natural printed).
- Then / and the duration: 1 whole, 2 half, 4 quarter, 8 eighth, 16 sixteenth, 32. One dot per augmentation dot: 4. = dotted quarter, 2.. = double-dotted half. Add t for triplets: 8t.
- Chord: join the notes with + and give one duration: C4+E4+G4/2
- Tie into the next note: ~ after the duration: G4/2~
- Rest: r/4, r/8. and so on. Whole-measure rest: R
- Printed fingering: @ and the number: E4/8@3 (for a chord one number per note in order, e.g. C4+E4+G4/4@1,3,5)
- Two independent voices in one staff (stems up and stems down at the same time): extra line U2: (or L2:) for the second voice. Every voice must fill the whole measure (use rests for its gaps).
- Clef change inside the staff: the event CLEF=F or CLEF=G at that point.
- Key or time change at a measure: the line KEY ... or TIME ... right before that M line.
- Leave out: grace notes, ornaments, dynamics, pedal marks, slurs, tempo words.`;
const FORMAT = 'Reply with only this plain-text format, nothing else (no code fence, no comments):\n\n' + FORMAT_KOPF + FORMAT_TAKT;
const FORMAT_EIN_TAKT = 'Reply with only this plain-text format, nothing else (no code fence, no comments). Write only this one measure:\n\n' + FORMAT_TAKT;

const PRUEFEN = `Before you answer, check every measure:
- Each voice must add up to exactly the time signature (only a pickup as the very first measure of the piece may be shorter).
- Count every notehead: all chord tones, notes on ledger lines above and below the staff, notes squeezed close together.
- Look closely at accidentals, augmentation dots, ties, and the number of beams or flags (1 = eighths, 2 = sixteenths, 3 = 32nds).

Honesty comes first: transcribe only what is printed. Never invent, guess or complete notes. If a staff of a measure cannot be read with confidence, write ? instead of its events, e.g. "L: ?".`;

/**
 * Anweisung für eine ganze Zeile (System).
 * @param {{zeile:number, zeilen:number, von:number, bis:number, staves:number, kontext?:{clefs, key, time}, teile?:Array<{von,bis}>, ganzeSeite?:boolean, hinweis?:string}} o
 */
export function zeilenAnweisung(o) {
  const L = [];
  if (o.ganzeSeite) {
    L.push('The image shows a page of printed piano sheet music. Transcribe every measure on it, line by line, exactly as printed. Number the measures 1, 2, 3 ... in reading order.');
  } else {
    L.push(`The image shows ONE line (system) of printed piano sheet music: line ${o.zeile} of ${o.zeilen} on the page. The app cut it out of the page and evened out the light.`);
    L.push(`It has ${o.staves === 1 ? 'one staff' : 'two staves (upper and lower staff of the piano, joined by a brace)'}.`);
    const n = o.bis - o.von + 1;
    L.push(`The small blue numbers 1 to ${n} in the white band above the music were added by the app: they mark the ${n} measure${n === 1 ? '' : 's'} it found between the barlines of this line (measures ${o.von} to ${o.bis} of the whole piece${n > 1 ? '' : ''}). Write your M lines with these blue numbers: M1${n > 1 ? ` to M${n}` : ''}. Ignore any measure numbers printed in the score. If the printed music clearly has a different number of measures, follow the printed music and number them in order.`);
    if (o.teile && o.teile.length > 1) L.push(`The line comes as ${o.teile.length} images so that it stays sharp: ${o.teile.map((t, i) => `image ${i + 1} = blue measures ${t.von} to ${t.bis}`).join(', ')}. Read them as one continuous line.`);
  }
  if (o.kontext) {
    const k = o.kontext;
    L.push(`Context from the lines before: key signature ${vorzText(k.key)}, time signature ${k.time}, clefs at the end of the previous line: upper ${k.clefs?.[0] || 'G'}, lower ${k.clefs?.[1] || 'F'}. Later lines usually do not print the time signature again - keep it unless a new one is printed.`);
  } else if (!o.ganzeSeite) {
    L.push('This is the first line of the piece: read the clefs, the key signature and the time signature from it.');
  }
  if (o.hinweis) L.push(o.hinweis);
  if (o.staves === 1) L.push('With one staff, write only the U: lines (and U2: for a second voice).');
  L.push('', FORMAT, '', PRUEFEN);
  return L.join('\n');
}

/** Anweisung für einen einzelnen Takt (zweiter Durchgang, Doppelt-Lesen). */
export function taktAnweisung(o) {
  const L = [];
  L.push(`The image shows ONE measure (measure ${o.nr}) of printed piano sheet music, cut out of a line by the app at the barlines and enlarged.`);
  if (o.mitKopf) L.push('Left of the white gap with the dotted line you see only the clefs and key signature from the start of this line, for reference - do not transcribe anything there. The measure to transcribe is right of the gap.');
  L.push(`In effect for this measure: upper staff ${o.clefs?.[0] === 'F' ? 'bass clef (F)' : 'treble clef (G)'}${o.staves === 1 ? '' : `, lower staff ${o.clefs?.[1] === 'G' ? 'treble clef (G)' : 'bass clef (F)'}`}, key signature ${vorzText(o.key)}, time signature ${o.time}: every voice must add up to ${zeitText(o.time)}.${o.auftakt ? ' It may be a pickup measure (shorter).' : ''}`);
  if (o.variante) L.push('Work beat by beat from left to right. For every beat, look at both staves and note every notehead before you move on.');
  L.push('', FORMAT_EIN_TAKT, '', PRUEFEN);
  return L.join('\n');
}

function vorzText(k) {
  const n = Number(k) || 0;
  if (!n) return 'none (C major / A minor)';
  return `${Math.abs(n)} ${n > 0 ? 'sharp' : 'flat'}${Math.abs(n) > 1 ? 's' : ''}`;
}
function zeitText(time) {
  const [z, n] = String(time || '4/4').split('/').map(Number);
  const v = (z * 4) / n;
  return `${Math.round(v * 100) / 100} quarter note${v === 1 ? '' : 's'} (${z}/${n})`;
}

// ───────── Antwort lesen ─────────

const NOTE_RE = /^([A-Ha-h])(##|bb|#|b|n|x|♯|♭|♮)?(-?\d)$/;
const DAUER_RE = /^(1|2|4|8|16|32|64)(\.{0,3})(t?)$/;

/** Ein Ereignis-Wort lesen → {n:[{s,a,o,f?}], d, p, t, r, ganz, bo} oder {schl} oder null */
export function leseEreignis(wort) {
  let w = String(wort).trim().replace(/[,;]+$/, '');
  if (!w) return null;
  const cl = w.match(/^CLEF=([GF])$/i);
  if (cl) return { schl: cl[1].toUpperCase() };
  if (/^R$/.test(w)) return { n: [], d: 1, p: 0, t: false, r: true, ganz: true, bo: false };
  let finger = null;
  const at = w.indexOf('@');
  if (at >= 0) { finger = w.slice(at + 1).split(/[,/]/).map((x) => parseInt(x, 10)).filter((x) => x >= 0 && x <= 5); w = w.slice(0, at); }
  let bo = false;
  if (w.endsWith('~')) { bo = true; w = w.slice(0, -1); }
  const sl = w.lastIndexOf('/');
  if (sl < 0) return null;
  const kopf = w.slice(0, sl), dm = w.slice(sl + 1).match(DAUER_RE);
  if (!dm) return null;
  const ev = { n: [], d: +dm[1], p: dm[2].length, t: !!dm[3], r: false, ganz: false, bo };
  if (/^r$/i.test(kopf)) { ev.r = true; return ev; }
  for (const teil of kopf.split('+')) {
    const m = teil.match(NOTE_RE);
    if (!m) return null;
    const akz = { '♯': '#', '♭': 'b', '♮': 'n' }[m[2]] || m[2] || null;
    ev.n.push({ s: STAMM_AUS[m[1].toUpperCase()], a: akz, o: +m[3] });
  }
  if (finger) ev.n.forEach((x, i) => { if (finger[i] != null) x.f = finger[i]; });
  return ev.n.length ? ev : null;
}

/**
 * Antworttext → {clefs, key, time, takte:[{nr, koepfe:{U,L}, stimmen:{U:[…]|'?', …}, key?, time?, fehler:[]}]}
 */
export function leseAntwort(text) {
  const aus = { clefs: null, key: null, time: null, takte: [], keine: false };
  let akt = null, wKey = null, wTime = null;
  for (const roh of String(text || '').replace(/```[a-z]*/gi, '').split(/\r?\n/)) {
    const z = roh.trim();
    if (!z) continue;
    let m;
    if ((m = z.match(/^CLEFS?\s+([GF])\s*([GF])?/i))) { if (!aus.clefs) aus.clefs = [m[1].toUpperCase(), (m[2] || 'F').toUpperCase()]; continue; }
    if ((m = z.match(/^KEY\s+([+-]?\d)/i))) { const k = Math.max(-7, Math.min(7, +m[1])); if (aus.key == null && !aus.takte.length) aus.key = k; else wKey = k; continue; }
    if ((m = z.match(/^TIME\s+(\d{1,2})\s*\/\s*(\d{1,2})/i))) { const t = `${+m[1]}/${+m[2]}`; if (aus.time == null && !aus.takte.length) aus.time = t; else wTime = t; continue; }
    if ((m = z.match(/^M\s*(\d+)\b\s*(\d+)?\s*(\d+)?/i))) {
      akt = { nr: +m[1], koepfe: { U: m[2] != null ? +m[2] : null, L: m[3] != null ? +m[3] : null }, stimmen: {}, fehler: [] };
      if (wKey != null) { akt.key = wKey; wKey = null; }
      if (wTime != null) { akt.time = wTime; wTime = null; }
      aus.takte.push(akt);
      continue;
    }
    if ((m = z.match(/^(U2|L2|U|L|O|O2)\s*:\s*(.*)$/i))) {
      if (!akt) continue;
      const key = { O: 'U', O2: 'U2' }[m[1].toUpperCase()] || m[1].toUpperCase();
      const rest = m[2].trim();
      if (!rest || /^\?+$/.test(rest) || /^unleserlich|^illegible/i.test(rest)) { akt.stimmen[key] = '?'; continue; }
      const evs = [];
      for (const wort of rest.split(/\s+/)) {
        const ev = leseEreignis(wort);
        if (ev) evs.push(ev); else akt.fehler.push(wort);
      }
      if (akt.fehler.length && !evs.length) akt.stimmen[key] = '?';
      else akt.stimmen[key] = evs;
      continue;
    }
    if (/<keine-noten|no (readable )?sheet music/i.test(z)) aus.keine = true;
  }
  return aus;
}

// ───────── Ereignisse → Noten ─────────

export const evDauer = (ev, taktLaenge) => (ev.ganz ? taktLaenge : (4 / ev.d) * (2 - 1 / 2 ** ev.p) * (ev.t ? 2 / 3 : 1));
export const taktLaengeAus = (time) => { const [z, n] = String(time || '4/4').split('/').map(Number); return (z * 4) / (n || 4); };

/**
 * Takt in Noten/Pausen umrechnen (Zeiten relativ zum Taktanfang).
 * ctx: {key, time, clefs:{oben,unten}, boegen: Map (offene Haltebögen aus dem vorigen Takt), staves}
 * Ergebnis: {noten:[…], pausen:[…], summen:{U:…}, schluessel:{oben,unten}, schluesselEnde}
 */
export function taktNoten(takt, ctx) {
  const L = taktLaengeAus(takt.time || ctx.time);
  const key = takt.key ?? ctx.key ?? 0;
  const noten = [], pausen = [], summen = {};
  const schl = { oben: ctx.clefs?.oben || 'G', unten: ctx.clefs?.unten || 'F' };
  const schlEnde = { ...schl };
  // 1. Zeitpunkte je Stimme
  const proSys = { oben: [], unten: [] };
  for (const sk of STIMMEN) {
    const evs = takt.stimmen?.[sk];
    if (!Array.isArray(evs)) continue;
    const sys = STIMME_SYS[sk];
    let t = 0;
    evs.forEach((ev, ei) => {
      if (ev.schl) { if (t < EPS) schl[sys] = ev.schl; schlEnde[sys] = ev.schl; return; }
      const d = evDauer(ev, L);
      if (ev.r) pausen.push({ t, dauer: d, system: sys, stimme: STIMME_NR[sk], typ: ev.ganz ? 'whole' : TYP[ev.d], punkte: ev.p || undefined, ganzTakt: ev.ganz || undefined, ort: { sk, ei } });
      else ev.n.forEach((x, ni) => proSys[sys].push({ t, d, x, ev, sk, ei, ni }));
      t += d;
    });
    summen[sk] = Math.round(t * 960) / 960;
  }
  // 2. Tonhöhen: gedruckte Vorzeichen gelten bis Taktende (gleiche Linie/Zwischenraum), sonst Tonart; Haltebögen tragen weiter
  const boegen = ctx.boegen || new Map();
  for (const sys of ['oben', 'unten']) {
    const liste = proSys[sys].sort((a, b) => a.t - b.t);
    const gilt = new Map();
    for (const e of liste) {
      const ort = e.x.s + e.x.o;
      const bogenKey = sys + '|' + ort;
      const offen = boegen.get(bogenKey);
      const ende = !!offen && Math.abs(offen.bis - e.t) < EPS;
      let vorz;
      if (e.x.a != null) vorz = AKZ_WERT[e.x.a] ?? 0;
      else if (ende) vorz = offen.vorz;
      else if (gilt.has(ort)) vorz = gilt.get(ort);
      else vorz = tonartVorz(e.x.s, key);
      if (e.x.a != null) gilt.set(ort, vorz);
      const sw = { stamm: e.x.s, vorz, oktave: e.x.o };
      const n = {
        t: e.t, dauer: e.d, midi: midiAus(sw), system: sys, stimme: STIMME_NR[e.sk], schreibweise: sw,
        typ: TYP[e.ev.d], punkte: e.ev.p || undefined, tupel: e.ev.t ? [3, 2] : undefined, ort: { sk: e.sk, ei: e.ei, ni: e.ni },
      };
      if (e.x.f != null) n.finger = e.x.f;
      if (ende || e.ev.bo) n.bindung = { ...(ende ? { ende: true } : {}), ...(e.ev.bo ? { start: true } : {}) };
      if (ende) boegen.delete(bogenKey);
      if (e.ev.bo) boegen.set(bogenKey, { vorz, bis: e.t + e.d });
      noten.push(n);
    }
  }
  // Bögen, die über den Taktstrich gehen: Ende relativ zum nächsten Takt
  return { noten, pausen, summen, laenge: L, key, schluessel: schl, schluesselEnde: schlEnde };
}

/** Nach dem Takt: offene Bögen auf den nächsten Taktanfang verschieben. */
export function boegenWeiter(boegen, laenge) {
  for (const [k, v] of [...boegen]) { if (v.bis >= laenge - EPS) boegen.set(k, { ...v, bis: v.bis - laenge }); else boegen.delete(k); }
}

/**
 * Takte (in Reihenfolge) → Stück im Format von modell.js.
 * takte: [{stimmen, time?, key?, auftakt?}], grund: {key, time, clefs:[o,u], staves, titel}
 */
export function baueStueck(takte, grund) {
  let key = grund.key ?? 0, time = grund.time || '4/4';
  const clefs = { oben: grund.clefs?.[0] || 'G', unten: grund.clefs?.[1] || 'F' };
  const boegen = new Map();
  const st = { titel: grund.titel || 'Aus Foto', tempo: grund.tempo || 80, takte: [], noten: [], pausen: [] };
  let start = 0, nr = 1;
  takte.forEach((tk, i) => {
    if (tk.key != null) key = tk.key;
    if (tk.time) time = tk.time;
    if (tk.clefs) { clefs.oben = tk.clefs[0] || clefs.oben; clefs.unten = tk.clefs[1] || clefs.unten; }
    const r = taktNoten({ ...tk, key, time }, { key, time, clefs, boegen });
    const [z, n] = time.split('/').map(Number);
    let dauer = r.laenge;
    const maxSumme = Math.max(0, ...Object.values(r.summen));
    const werte = Object.values(r.summen).filter((v) => v > EPS);
    const gleichKurz = werte.length > 0 && werte.every((v) => Math.abs(v - werte[0]) < EPS) && werte[0] < r.laenge - EPS;
    const auftakt = i === 0 && (tk.auftakt ?? gleichKurz) && maxSumme > EPS && maxSumme < r.laenge - EPS;
    if (auftakt) dauer = maxSumme;
    else if (maxSumme > r.laenge + EPS) dauer = maxSumme; // zu lang gelesen: nichts abschneiden, Prüfung meldet es
    const taktNr = auftakt ? 0 : nr++;
    st.takte.push({ nr: taktNr, taktart: [z, n], tonart: { quinten: key, modus: 'dur' }, start, dauer, schluessel: { ...r.schluessel } });
    const pre = 't' + i + '-';
    r.noten.forEach((x) => st.noten.push({ ...x, id: pre + x.ort.sk + '-' + x.ort.ei + '-' + x.ort.ni, t: start + x.t, takt: taktNr, ort: undefined }));
    r.pausen.forEach((p) => st.pausen.push({ ...p, t: start + p.t, takt: taktNr, ort: undefined }));
    boegenWeiter(boegen, dauer);
    Object.assign(clefs, r.schluesselEnde);
    start += dauer;
  });
  for (const n of st.noten) { delete n.ort; for (const k of Object.keys(n)) if (n[k] === undefined) delete n[k]; }
  for (const p of st.pausen) { delete p.ort; for (const k of Object.keys(p)) if (p[k] === undefined) delete p[k]; }
  // Haltebogen-Enden ohne Anfang entfernen (sonst klingt eine Note nicht an)
  const anf = new Set(st.noten.filter((n) => n.bindung?.start).map((n) => n.system + '|' + n.midi + '|' + Math.round((n.t + n.dauer) * 960)));
  for (const n of st.noten) if (n.bindung?.ende && !anf.has(n.system + '|' + n.midi + '|' + Math.round(n.t * 960))) { delete n.bindung.ende; if (!n.bindung.start) delete n.bindung; }
  return st;
}

// ───────── Prüfen ─────────

/** Gefüllte Köpfe (Viertel und kürzer) – nur die zählt die Bildprüfung. */
export function gefuellteKoepfe(takt, staff) {
  let n = 0;
  for (const sk of staff === 0 ? ['U', 'U2'] : ['L', 'L2']) {
    const evs = takt.stimmen?.[sk];
    if (Array.isArray(evs)) for (const ev of evs) if (!ev.r && !ev.schl && ev.d >= 4) n += ev.n.length;
  }
  return n;
}
export function alleKoepfe(takt, staff) {
  let n = 0;
  for (const sk of staff === 0 ? ['U', 'U2'] : ['L', 'L2']) {
    const evs = takt.stimmen?.[sk];
    if (Array.isArray(evs)) for (const ev of evs) if (!ev.r && !ev.schl) n += ev.n.length;
  }
  return n;
}

const bruchText = (v) => {
  const ganz = Math.floor(v + EPS), rest = v - ganz;
  const B = [[0.25, '¼'], [0.5, '½'], [0.75, '¾'], [1 / 3, '⅓'], [2 / 3, '⅔'], [0.125, '⅛'], [0.375, '⅜'], [0.625, '⅝'], [0.875, '⅞']];
  const b = B.find(([x]) => Math.abs(x - rest) < 0.01);
  if (rest < 0.01) return String(ganz);
  return b ? (ganz ? ganz : '') + b[1] : (Math.round(v * 100) / 100).toString().replace('.', ',');
};
export { bruchText };

/**
 * Prüft einen Takt. ctx: {time, staves, erster, letzter, pixel:{U,L}|null (gefüllte Köpfe im Bild)}
 * → [{art, text, staff?}] (leer = unauffällig)
 */
export function pruefeTakt(takt, ctx) {
  const g = [];
  const L = taktLaengeAus(takt.time || ctx.time);
  const zwei = ctx.staves !== 1;
  const haupt = zwei ? ['U', 'L'] : ['U'];
  for (const sk of STIMMEN) if (takt.stimmen?.[sk] === '?') g.push({ art: 'unleserlich', text: `${sk.startsWith('U') ? 'Oben' : 'Unten'} als unleserlich gemeldet.` });
  if (g.length) return g;
  for (const sk of haupt) if (!Array.isArray(takt.stimmen?.[sk]) || !takt.stimmen[sk].some((e) => !e.schl)) g.push({ art: 'leer', text: `${sk === 'U' ? 'Oben' : 'Unten'} fehlt der Takt.` });
  const summen = [];
  for (const sk of STIMMEN) {
    const evs = takt.stimmen?.[sk];
    if (!Array.isArray(evs) || !evs.length) continue;
    let s = 0; for (const ev of evs) if (!ev.schl) s += evDauer(ev, L);
    summen.push({ sk, s });
  }
  const randTakt = ctx.erster || ctx.letzter;
  const alle = summen.map((x) => x.s);
  const gleichKurz = randTakt && alle.length && alle.every((v) => Math.abs(v - alle[0]) < EPS) && alle[0] < L - EPS;
  for (const { sk, s } of summen) {
    if (Math.abs(s - L) < EPS || gleichKurz) continue;
    g.push({ art: 'summe', text: `${sk.startsWith('U') ? 'Oben' : 'Unten'}${sk.endsWith('2') ? ' (2. Stimme)' : ''}: Notenwerte ergeben ${bruchText(s)} statt ${bruchText(L)} Viertel.` });
  }
  for (const [i, sk] of haupt.entries()) {
    const gesagt = takt.koepfe?.[sk];
    const da = alleKoepfe(takt, i);
    if (gesagt != null && gesagt !== da) g.push({ art: 'zahl', text: `${i ? 'Unten' : 'Oben'}: ${gesagt} Köpfe gezählt, aber ${da} geschrieben.` });
    const px = ctx.pixel?.[sk];
    if (px != null) {
      const ki = gefuellteKoepfe(takt, i);
      const tol = Math.max(2, Math.round(0.3 * Math.max(px, ki)));
      if (Math.abs(px - ki) > tol) g.push({ art: 'bild', text: `${i ? 'Unten' : 'Oben'}: im Bild etwa ${px} gefüllte Notenköpfe, gelesen ${ki}.` });
    }
  }
  // Tonumfang
  const r = taktNoten(takt, { key: takt.key ?? ctx.key ?? 0, time: takt.time || ctx.time, clefs: { oben: ctx.clefs?.[0] || 'G', unten: ctx.clefs?.[1] || 'F' } });
  const fern = r.noten.filter((n) => (n.system === 'oben' ? n.midi < 33 || n.midi > 100 : n.midi < 21 || n.midi > 88));
  if (fern.length) g.push({ art: 'umfang', text: `${fern.length} Ton${fern.length > 1 ? 'e' : ''} weit außerhalb des Notensystems – Schlüssel verlesen?` });
  if (takt.unbekannt?.length) g.push({ art: 'format', text: `Nicht verstanden: ${takt.unbekannt.slice(0, 3).join(' ')}` });
  return g;
}

/** Fingerabdruck eines Takts (Tonhöhe, Anfang, Dauer je System) – für den Vergleich zweier Lesungen. */
export function abdruck(takt, ctx) {
  const r = taktNoten(takt, { key: takt.key ?? ctx.key ?? 0, time: takt.time || ctx.time, clefs: { oben: 'G', unten: 'F' } });
  return r.noten.map((n) => `${n.system}|${Math.round(n.t * 48)}|${n.midi}|${Math.round(n.dauer * 48)}`).sort();
}
export function vergleiche(a, b, ctx) {
  const x = abdruck(a, ctx), y = abdruck(b, ctx);
  const zx = new Map(); for (const k of x) zx.set(k, (zx.get(k) || 0) + 1);
  let gleich = 0;
  for (const k of y) { const v = zx.get(k); if (v) { gleich++; zx.set(k, v - 1); } }
  const unterschied = x.length + y.length - 2 * gleich;
  return { gleich: unterschied === 0 && x.length > 0, unterschied, n: Math.max(x.length, y.length) };
}

// ───────── Darstellung / Rückweg (für Chips, Tests und das Bearbeiten) ─────────

export function evText(ev) {
  if (ev.schl) return 'CLEF=' + ev.schl;
  if (ev.ganz) return 'R';
  const d = ev.d + '.'.repeat(ev.p || 0) + (ev.t ? 't' : '');
  const kopf = ev.r ? 'r' : ev.n.map((x) => (x.s === 'H' ? 'B' : x.s) + (x.a || '') + x.o).join('+');
  const f = ev.n?.some((x) => x.f != null) ? '@' + ev.n.map((x) => x.f ?? '').join(',') : '';
  return kopf + '/' + d + (ev.bo ? '~' : '') + f;
}

/**
 * Aus Noten eines fertigen Stücks die Ereignis-Zeilen schreiben, wie ein Notenstecher (Vorzeichen nur, wo nötig).
 * Für Tests (vorbereitete KI-Antworten) und als Rückweg.
 */
export function taktAlsText(st, nr, { key = 0, mitKoepfen = true } = {}) {
  const tk = st.takte.find((t) => t.nr === nr);
  if (!tk) return '';
  const ende = tk.start + tk.dauer;
  const zeilen = [];
  const koepfe = { U: 0, L: 0 };
  const DUR = [[4, 1, 0], [3, 2, 1], [2, 2, 0], [1.5, 4, 1], [1, 4, 0], [0.75, 8, 1], [0.5, 8, 0], [0.375, 16, 1], [0.25, 16, 0], [0.125, 32, 0]];
  const dText = (d, tupel) => {
    if (tupel) { const g = d * 1.5; const e = DUR.find(([v, , p]) => Math.abs(v - g) < EPS && !p); if (e) return e[1] + 't'; }
    const e = DUR.find(([v]) => Math.abs(v - d) < EPS);
    return e ? e[1] + '.'.repeat(e[2]) : '4';
  };
  for (const [sys, sk] of [['oben', 'U'], ['unten', 'L']]) {
    const alleN = st.noten.filter((n) => n.system === sys && n.t >= tk.start - EPS && n.t < ende - EPS);
    const alleP = (st.pausen || []).filter((p) => p.system === sys && p.t >= tk.start - EPS && p.t < ende - EPS);
    const stimmen = [...new Set([...alleN, ...alleP].map((x) => x.stimme ?? 1))].sort((a, b) => a - b);
    if (!stimmen.length) stimmen.push(sys === 'oben' ? 1 : 5);
    const gilt = new Map();
    // Vorzeichen gelten über alle Stimmen eines Systems in zeitlicher Reihenfolge
    const zeitFolge = [...alleN].sort((a, b) => a.t - b.t || a.midi - b.midi);
    const akzVon = new Map();
    for (const n of zeitFolge) {
      const sw = n.schreibweise, ort = sw.stamm + sw.oktave;
      const erwartet = n.bindung?.ende ? sw.vorz : gilt.has(ort) ? gilt.get(ort) : tonartVorz(sw.stamm, key);
      let a = '';
      if (sw.vorz !== erwartet) { a = { 1: '#', '-1': 'b', 0: 'n', 2: 'x', '-2': 'bb' }[sw.vorz]; gilt.set(ort, sw.vorz); }
      akzVon.set(n, a);
    }
    stimmen.slice(0, 2).forEach((sn, vi) => {
      const mitte = vi === 1 ? stimmen.slice(1) : [sn];
      const noten = alleN.filter((n) => mitte.includes(n.stimme ?? 1));
      const pausen = alleP.filter((p) => mitte.includes(p.stimme ?? 1));
      const gruppen = new Map();
      for (const n of noten) { const k = Math.round((n.t - tk.start) * 960); if (!gruppen.has(k)) gruppen.set(k, []); gruppen.get(k).push(n); }
      for (const p of pausen) { const k = Math.round((p.t - tk.start) * 960); if (!gruppen.has(k)) gruppen.set(k, [p]); }
      const woerter = [];
      let pos = 0;
      for (const k of [...gruppen.keys()].sort((a, b) => a - b)) {
        const g = gruppen.get(k);
        if (k / 960 > pos + EPS) woerter.push('r/' + dText(k / 960 - pos));
        if (g[0].midi == null) { woerter.push(g[0].ganzTakt ? 'R' : 'r/' + dText(g[0].dauer)); pos = k / 960 + (g[0].ganzTakt ? tk.dauer : g[0].dauer); continue; }
        const sort = g.sort((a, b) => a.midi - b.midi);
        const teile = sort.map((n) => (n.schreibweise.stamm === 'H' ? 'B' : n.schreibweise.stamm) + akzVon.get(n) + n.schreibweise.oktave);
        koepfe[sk] += sort.length;
        const f = sort.some((n) => n.finger != null) ? '@' + sort.map((n) => n.finger ?? '').join(',') : '';
        woerter.push(teile.join('+') + '/' + dText(sort[0].dauer, sort[0].tupel) + (sort.some((n) => n.bindung?.start) ? '~' : '') + f);
        pos = k / 960 + sort[0].dauer;
      }
      zeilen.push({ sk: vi ? sk + '2' : sk, text: woerter.join(' ') || 'R' });
    });
  }
  return [`M${nr}${mitKoepfen ? ` ${koepfe.U} ${koepfe.L}` : ''}`, ...zeilen.map((z) => `${z.sk}: ${z.text}`)].join('\n');
}

/** Tiefe Kopie eines Takts (zum Bearbeiten, Varianten). */
export const kopie = (x) => JSON.parse(JSON.stringify(x));
