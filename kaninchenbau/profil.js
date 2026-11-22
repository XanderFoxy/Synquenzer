// Kaninchenbau – Startfragen. Reine Funktionen (ohne DOM), damit sie im Test vollständig durchgespielt werden können.
// antw = { [fragenId]: 0 | 1 }  (0 = linke Schaltfläche, 1 = rechte)
// Ablauf: A) je Gebiet „spannend?“  (keins gemocht → 2 Entweder-oder-Paare)
//         B) je gemochtem Gebiet: Entweder-oder zwischen zwei Ästen, dann „und der dritte?“ (solange < 5)
//         C) Kaninchenbau-Frage: ein Gang über eine Querverbindung (bis mindestens 3 Äste, sonst genau einmal)
// Ergebnis: 3–5 Äste.
import { GEBIETE, AESTE, BRUECKEN, TYP_BRUECKE } from './inhalt.js';

export const MIN = 3, MAX = 5;
const G = Object.fromEntries(GEBIETE.map((g) => [g.id, g]));
const NOTFALL = [['geschichte', 'reisen'], ['musik', 'sprache']];
const TYP_RANG = { ort: 0, person: 1, zeit: 2, idee: 3 };
const ERSATZ = ['rom-reise', 'rom-caesar', 'mastering', 'rhetorik-antike', 'synthese'];

function lauf(antw) {
  const punkte = new Map();                      // Reihenfolge des ersten Auftretens = Gleichstand-Regel
  const add = (id, n) => punkte.set(id, (punkte.get(id) || 0) + n);
  const gewaehlt = () => [...punkte].filter(([, p]) => p >= 3).sort((a, b) => b[1] - a[1]).map(([id]) => id).slice(0, MAX);
  const fertig = (frage) => ({ frage, punkte, gewaehlt: gewaehlt() });
  let n = 0;                                     // gestellte Fragen bis hier

  // A) Gebiete
  const gemocht = [];
  for (const g of GEBIETE) {
    const id = 'g:' + g.id;
    if (!(id in antw)) return fertig({ id, art: 'gebiet', n, text: g.frage, links: 'Ja, spannend!', rechts: 'Eher nicht', gebiet: g.id });
    n++; if (antw[id] === 0) gemocht.push(g);
  }
  if (!gemocht.length) {
    for (const [a, b] of NOTFALL) {
      const id = `n:${a}|${b}`;
      if (!(id in antw)) return fertig({ id, art: 'notfall', n, text: 'Dann such dir trotzdem eins aus – was eher?', links: G[a].name, rechts: G[b].name, gebiete: [a, b] });
      n++; gemocht.push(G[antw[id] === 0 ? a : b]);
    }
  }
  // B) Äste je gemochtem Gebiet
  for (const g of gemocht) {
    const [x, y] = g.paar; const id = 'p:' + g.id;
    if (!(id in antw)) return fertig({ id, art: 'paar', n, text: 'Was reizt dich mehr?', links: AESTE[x].wahl, rechts: AESTE[y].wahl, gebiet: g.id, aeste: [x, y] });
    n++; add(antw[id] === 0 ? x : y, 3); add(antw[id] === 0 ? y : x, 1);
  }
  for (const g of gemocht) {
    if (gewaehlt().length >= MAX) break;
    const id = 'z:' + g.id;
    if (!(id in antw)) return fertig({ id, art: 'zusatz', n, text: AESTE[g.zusatz].zusatzFrage, links: 'Ja, gern!', rechts: 'Lieber nicht', gebiet: g.id, aeste: [g.zusatz] });
    n++; if (antw[id] === 0) add(g.zusatz, 3);
  }
  // C) Kaninchenbau-Fragen
  const gefragt = new Set(); let k = 0;
  for (;;) {
    const sel = gewaehlt();
    const noch = sel.length < MIN || (k === 0 && sel.length < MAX);
    if (!noch || k >= 4) break;
    const kand = kandidat(sel, gefragt);
    if (!kand) break;
    const id = `k:${kand.von}>${kand.zu}`;
    if (!(id in antw)) {
      return fertig({ id, art: 'kaninchen', n, text: `Von „${AESTE[kand.von].kurz}“ führt ein Gang zu „${AESTE[kand.zu].kurz}“ – ${TYP_BRUECKE[kand.typ]}: ${kand.was}. Mitgraben?`,
        unter: kand.text, links: 'Ja, mitgraben!', rechts: 'Nein, danke', bruecke: kand, aeste: [kand.zu] });
    }
    n++; k++; gefragt.add(kand.zu);
    if (antw[id] === 0) add(kand.zu, 3);
  }
  return fertig(null);
}

function kandidat(sel, gefragt) {
  for (const s of sel) {
    const moeglich = BRUECKEN.filter((b) => b.a === s || b.b === s)
      .map((b) => ({ ...b, von: s, zu: b.a === s ? b.b : b.a }))
      .filter((b) => !sel.includes(b.zu) && !gefragt.has(b.zu))
      .sort((p, q) => TYP_RANG[p.typ] - TYP_RANG[q.typ]);
    if (moeglich.length) return moeglich[0];
  }
  return null;
}

// Nächste Frage oder null, wenn fertig.
export function naechste(antw) { return lauf(antw).frage; }

// Ergebnis: 3–5 Ast-IDs (zuerst gewählte, dann Zweitplatzierte, dann feste Ersatzliste).
export function auswerten(antw) {
  const { punkte, gewaehlt } = lauf(antw);
  const aus = [...gewaehlt];
  const rest = [...punkte].filter(([id, p]) => p > 0 && !aus.includes(id)).sort((a, b) => b[1] - a[1]).map(([id]) => id);
  for (const id of [...rest, ...ERSATZ]) { if (aus.length >= MIN) break; if (!aus.includes(id)) aus.push(id); }
  return aus.slice(0, MAX);
}

// Fortschritt in den Startfragen: gestellt / (gestellt + geschätzter Rest, wenn ab jetzt immer links gewählt würde).
export function fortschritt(antw) {
  const jetzt = lauf(antw).frage;
  if (!jetzt) return { n: Object.keys(antw).length, gesamt: Object.keys(antw).length };
  const probe = { ...antw }; let rest = 0, f = jetzt;
  while (f && rest < 30) { probe[f.id] = 0; rest++; f = lauf(probe).frage; }
  return { n: jetzt.n, gesamt: jetzt.n + rest };
}
