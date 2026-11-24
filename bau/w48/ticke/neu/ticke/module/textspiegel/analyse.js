// M3 textspiegel – lokale Analyse. Rein (ohne DOM), läuft im Browser und in Node (Tests). Nichts wird gesendet.
// Zählt Wörter aus dem eigenen Wörterbuch (woerter.js), Satzlänge, Wortvielfalt (MATTR), Krisen-Wörter; findet die Stellen zu
// einem Merkmal und wiederkehrende Wörter (für „Tiefer lesen“). Grenzen nach KONZEPT §2.5: unter 50 Wörtern nichts, bis 300 nur
// Texte beschreiben, ab 300 vorsichtige Richtungen. Die Zahlen hier bleiben intern – die Anzeige spricht nur in Worten.
import { GRUPPEN, VERNEINER, VERB_NACH, MEINEN_VERB_NACH, HILFSVERBEN, PARTIZIP_OHNE_GE, GE_AUSNAHMEN, ABKUERZUNGEN, STOPP } from './woerter.js';

export const GRENZEN = { min: 50, stil: 300, ziel: [80, 150], fenster: 50, paar: 6 };

const menge = (s) => new Set(s.split(/\s+/).filter(Boolean));
function matcher(liste) {
  const exakt = new Set(), praefix = [];
  for (const w of liste.split(/\s+/).filter(Boolean)) { if (w.endsWith('*')) praefix.push(w.slice(0, -1)); else exakt.add(w); }
  return (t) => { if (exakt.has(t)) return true; for (const p of praefix) if (t.length >= p.length && t.startsWith(p)) return true; return false; };
}
const M = Object.fromEntries(Object.entries(GRUPPEN).map(([k, g]) => [k, matcher(g.liste)]));
const NEG = menge(VERNEINER), VNACH = menge(VERB_NACH), MEINEN = menge(MEINEN_VERB_NACH), HILF = menge(HILFSVERBEN);
const OHNE_GE = menge(PARTIZIP_OHNE_GE), GE_AUS = menge(GE_AUSNAHMEN);
const ABK = new RegExp('(^|[^\\p{L}])(' + ABKUERZUNGEN.join('|') + ')', 'giu');
const GEFUEHL = ['freude', 'belastung'];
// trennbare Verben: an-ge-rufen, auf-ge-standen, mit-ge-macht …
const TRENNBAR = /^(an|auf|aus|ein|mit|nach|vor|zu|ab|weg|los|zurück|her|hin|fest|vorbei|weiter|zusammen|kennen|kaputt|statt|teil|wieder)ge[a-zäöüß]{2,}(t|en)$/;
export const GRUPPEN_IDS = Object.keys(GRUPPEN);

// ---------- Sätze und Wörter ----------
const PLATZ = '․';       // Ersatz-Punkt in Abkürzungen (kein Satzende)
export function saetze(text) {
  let t = String(text || '').replace(/\r/g, '').replace(/[’`´]/g, "'");
  t = t.replace(ABK, (m) => m.replace(/\./g, PLATZ));
  t = t.replace(/(\d)\.(?=\s+(?:[a-zäöüß]|jan|feb|mär|apr|mai|jun|jul|aug|sep|okt|nov|dez))/giu, '$1' + PLATZ);   // „3. Mai“
  const aus = []; let start = 0, m;
  const re = /[.!?…]+["“”„»«'’)\]]*(?=\s|$)|\n/g;
  while ((m = re.exec(t))) {
    const ende = m.index + m[0].length;
    if (m[0] !== '\n') { const rest = t.slice(ende).replace(/^[ \t]+/, ''); if (rest && /^[a-zäöüß]/.test(rest)) continue; }
    aus.push(t.slice(start, ende)); start = ende;
  }
  aus.push(t.slice(start));
  return aus.map((s) => s.replace(new RegExp(PLATZ, 'g'), '.').trim()).filter((s) => /[\p{L}\d]/u.test(s));
}
// Wörter eines Satzes: {w: klein, o: original, teil: Nr. des Satzteils (Komma, Doppelpunkt … trennen)}
const WORT = /[\p{L}\p{M}]+(?:['-][\p{L}\p{M}]+)*|\d+(?:[.,]\d+)*|[,;:–—()]/gu;
export function woerter(satz) {
  const aus = []; let teil = 0;
  for (const m of String(satz).replace(/[’`´]/g, "'").matchAll(WORT)) {
    const o = m[0];
    if (/^[,;:–—()]$/.test(o)) { teil++; continue; }
    let w = o.toLowerCase(); if (/'s$/.test(w)) w = w.slice(0, -2);
    aus.push({ w, o, teil, zahl: /^\d/.test(o) });
  }
  return aus;
}
export const zaehleWoerter = (text) => saetze(text).reduce((s, x) => s + woerter(x).length, 0);

const passt = (gruppe, w) => {
  if (M[gruppe](w)) return true;
  const i = w.lastIndexOf('-'); return i > 0 && M[gruppe](w.slice(i + 1));   // „Fußball-Team“ → „team“
};
function verneint(ws, i) {
  for (let j = i - 1; j >= Math.max(0, i - 3); j--) { if (ws[j].teil !== ws[i].teil) break; if (NEG.has(ws[j].w)) return true; }
  if (VNACH.has(ws[i].w)) for (let j = i + 1; j <= Math.min(ws.length - 1, i + 3); j++) { if (ws[j].teil !== ws[i].teil) break; if (ws[j].w === 'nicht') return true; }
  return false;
}
const istPartizip = (x) => {
  if (OHNE_GE.has(x.w)) return true;
  return /^[a-zäöü]/.test(x.o) && !GE_AUS.has(x.w) && (/^ge[a-zäöüß]{2,}(t|en)$/.test(x.w) || TRENNBAR.test(x.w));   // Partizipien sind klein geschrieben
};

// ---------- Analyse eines Textes ----------
function leer() { return Object.fromEntries(GRUPPEN_IDS.map((g) => [g, new Map()])); }
export function analysiereText(text) {
  const S = saetze(text), funde = leer(), verneinteGefuehle = new Map(), alle = [];
  let woerterN = 0, lang = 0, satzLaengen = [];
  for (const s of S) {
    const ws = woerter(s);
    const n = ws.length; if (!n) continue;
    woerterN += n; satzLaengen.push(n);
    const hatHilf = ws.some((x) => HILF.has(x.w));
    ws.forEach((x, i) => {
      if (x.zahl) { alle.push(x.w); return; }
      alle.push(x.w);
      if (x.w.replace(/-/g, '').length > 6) lang++;
      for (const g of GRUPPEN_IDS) {
        if (!passt(g, x.w)) continue;
        if (g === 'ich' && (x.w === 'meine' || x.w === 'meinen') && i > 0 && MEINEN.has(ws[i - 1].w)) continue;   // „ich meine“ = Verb
        if (GEFUEHL.includes(g) && verneint(ws, i)) { verneinteGefuehle.set(x.w, (verneinteGefuehle.get(x.w) || 0) + 1); continue; }
        funde[g].set(x.w, (funde[g].get(x.w) || 0) + 1);
      }
      // zusammengesetzte Vergangenheit: Hilfsverb + Partizip im selben Satz
      if (hatHilf && !passt('vergangenheit', x.w) && istPartizip(x)) funde.vergangenheit.set(x.w, (funde.vergangenheit.get(x.w) || 0) + 1);
    });
  }
  const zeichen = { fragen: (String(text).match(/\?+/g) || []).length, ausrufe: (String(text).match(/!+/g) || []).length };
  return { woerter: woerterN, saetze: satzLaengen.length, satzLaengen, lang, funde, verneinteGefuehle, liste: alle, zeichen };
}

// Wortvielfalt: MATTR (gleitendes Fenster, Covington & McFall 2010) – unabhängig von der Textlänge. Unter Fenstergröße: einfache TTR.
export function mattr(liste, fenster = GRENZEN.fenster) {
  const n = liste.length; if (!n) return null;
  if (n <= fenster) return new Set(liste).size / n;
  const z = new Map(); let typen = 0, summe = 0;
  for (let i = 0; i < n; i++) {
    const w = liste[i]; const c = (z.get(w) || 0) + 1; z.set(w, c); if (c === 1) typen++;
    if (i >= fenster) { const a = liste[i - fenster]; const d = z.get(a) - 1; z.set(a, d); if (d === 0) typen--; }
    if (i >= fenster - 1) summe += typen / fenster;
  }
  return summe / (n - fenster + 1);
}

const r1 = (x) => Math.round(x * 10) / 10;
const sortiere = (map) => [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'de'));
export function umfangVon(n) { return n < GRENZEN.min ? 'zu-kurz' : n < GRENZEN.stil ? 'stil' : 'hinweise'; }

// ---------- Analyse aller Aufgaben ----------
// texte: { aufgabeId: 'Text' }. Gibt alles für die Anzeige zurück (Belege = gefundene Wörter, nur für die Ansicht, nicht fürs Ergebnis).
export function analysiere(texte, reihenfolge = Object.keys(texte || {})) {
  const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const aufgaben = {}, gesamt = leer(), verneint = new Map(), liste = [];
  let W = 0, S = 0, lang = 0; const laengen = []; const zeichen = { fragen: 0, ausrufe: 0 };
  let unklarSatz = false;
  for (const id of reihenfolge) {
    const a = analysiereText((texte || {})[id] || '');
    const merk = {};
    for (const g of GRUPPEN_IDS) { let c = 0; for (const [w, k] of a.funde[g]) { c += k; gesamt[g].set(w, (gesamt[g].get(w) || 0) + k); } merk[g] = c; }
    for (const [w, k] of a.verneinteGefuehle) verneint.set(w, (verneint.get(w) || 0) + k);
    aufgaben[id] = { woerter: a.woerter, saetze: a.saetze, merkmale: merk };
    W += a.woerter; S += a.saetze; lang += a.lang; laengen.push(...a.satzLaengen); liste.push(...a.liste);
    zeichen.fragen += a.zeichen.fragen; zeichen.ausrufe += a.zeichen.ausrufe;
    if (a.woerter >= 40 && a.saetze <= 1) unklarSatz = true;
  }
  const merkmale = {};
  for (const g of GRUPPEN_IDS) {
    const anzahl = [...gesamt[g].values()].reduce((s, k) => s + k, 0);
    merkmale[g] = { anzahl, pro100: W ? r1((anzahl / W) * 100) : 0, belege: sortiere(gesamt[g]).slice(0, 6) };
  }
  const mittel = S ? W / S : null;
  if (mittel && mittel > 40) unklarSatz = true;
  const v = mattr(liste);
  return {
    woerter: W, saetze: S, umfang: umfangVon(W), aufgaben, merkmale,
    verneint: { anzahl: [...verneint.values()].reduce((s, k) => s + k, 0), belege: sortiere(verneint).slice(0, 6) },
    satzlaenge: { mittel: mittel == null ? null : r1(mittel), laengster: laengen.length ? Math.max(...laengen) : 0, unklar: unklarSatz },
    vielfalt: { wert: v == null ? null : Math.round(v * 1000) / 1000, fenster: GRENZEN.fenster, kurz: liste.length <= GRENZEN.fenster },
    langeWoerter: { anzahl: lang, pro100: W ? r1((lang / W) * 100) : 0 },
    zeichen,
    ms: Math.round(((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0) * 10) / 10
  };
}

// Waage zwischen zwei Gruppen: Richtung nur bei genug Wörtern und deutlichem Unterschied (mindestens doppelt so viele).
export function waage(a, b, min = GRENZEN.paar) {
  const s = a + b;
  if (s < min) return { richtung: 'wenig', a, b, anteilA: s ? a / s : 0.5 };
  return { richtung: a >= 2 * b ? 'a' : b >= 2 * a ? 'b' : 'gleich', a, b, anteilA: a / s };
}
// In welcher Aufgabe steckt der Großteil einer Gruppe? (für „liegt wohl am Thema“)
export function schwerpunkt(analyse, gruppe) {
  const ges = analyse.merkmale[gruppe].anzahl; if (ges < 4) return null;
  let best = null; for (const [id, a] of Object.entries(analyse.aufgaben)) if (!best || a.merkmale[gruppe] > best[1]) best = [id, a.merkmale[gruppe]];
  return best && best[1] / ges >= 0.6 ? { id: best[0], anzahl: best[1], von: ges } : null;
}
// ---------- Krisen-Regel (KONZEPT §2.5): bei Wörtern zu Suizid, Selbstverletzung oder akuter Gewalt → keine Analyse, Hilfe ----------
// Jede Wortliste bleibt unvollständig (Umgangssprache, Tippfehler, Andeutungen). Darum steht der Hilfe-Fuß ohnehin auf jeder Seite;
// lieber einmal zu oft Hilfe zeigen als einmal zu wenig (ein Fehlalarm lässt sich mit „Text ändern“ beheben). Test: test/textspiegel/analyse.test.mjs.
const NEIN = '(?!nicht\\b|niemals\\b|nie\\b|keinesfalls\\b|auf keinen fall\\b)';                          // Verneinung in der Lücke
const KRISE = [
  /\b(suizid|selbstmord|freitod|lebensmüd|selbstverletz|selbsttötung)/u,
  /\b(mich|mir)\b[^.!?\n]{0,30}\b(umbring\w*|umzubringen|töten|zu töten|das leben (zu )?nehmen|was antun|etwas antun|was anzutun|etwas anzutun)\b/u,
  /\b(umbring\w*|töte|töten|tötet)\b[^.!?\n]{0,6}\b(mich|mir)\b/u,
  // trennbare Verben: „Ich bring mich (bald) um.“ – aber nicht „bringt mich um den Schlaf“ / „um 8 Uhr“
  /\bbr(ing|inge|ingst|ingt|ingen|achte|achten|ächte)\b[^.!?\n]{0,30}\bmich\b[^.!?\n]{0,30}\bum(?=\s*([.!?,;:\n]|$)|\s+(und|aber|weil|wenn|denn|oder|dann|bevor)\b)/u,
  /\b(tu|tue|tust|tun|tät|täte)\b[^.!?\n]{0,20}\bmir\b[^.!?\n]{0,20}\b(was|etwas)\b[^.!?\n]{0,10}\ban(?=\s*([.!?,;:\n]|$)|\s+(und|aber|weil|wenn|denn|oder|dann|bevor)\b)/u,
  new RegExp(`\\b(will|möchte|wollte|würde (gern|gerne|lieber))\\b(?:${NEIN}[^.!?\\n]){0,35}\\bsterben\\b`, 'u'),
  /\bsterben\s+(will|möchte|wollen)\b/u,
  new RegExp(`\\b(will|möchte|wollte|wünsche mir|wünschte)\\b(?:${NEIN}[^.!?\\n]){0,30}\\btot (sein|wäre|wär)\\b`, 'u'),
  /\b(wäre|bin|sein) (lieber|am liebsten) tot\b|\b(am liebsten|lieber)\b[^.!?\n]{0,15}\btot\b|\bwünschte,? ich wäre tot\b/u,
  /\bnicht mehr (leben|aufwachen|existieren|da sein)\s*(will|möchte|wollen|[.!?\n]|$)/u,
  /\b(nie|niemals) (mehr|wieder) (aufwachen|aufzuwachen)\b/u,
  /\bkeine (lust|kraft) mehr\b[^.!?\n]{0,12}\b(zu leben|leben)\b|\bkeine lust mehr auf (das|mein) leben\b/u,
  /\bkeinen ausweg mehr\b|\b(sehe|seh|gibt es|gibt's) keinen ausweg\s*([.!?,;\n]|$)/u,
  /\bfür immer (weg sein|einschlafen|verschwinden)\b|\b(weg sein|einschlafen) für immer\b/u,
  /\b(leben|alles)\b[^.!?\n]{0,25}\bkeinen sinn mehr\b|\bkeinen sinn mehr[^.!?\n]{0,15}\b(zu leben|leben)\b/u,
  /\b(mit (allem|dem leben|meinem leben) schluss|schluss machen mit (allem|dem leben|meinem leben)|(allem|meinem leben) ein ende)\b/u,
  /\b(ritze mich|mich (zu )?ritzen|mich selbst verletz|verletz\w* mich selbst|mir selbst weh)/u,
  /\b(schneide|schneidest|schneidet|ritze|ritzt|ritzte)\s+mich\b(?!\s+(beim|aus versehen|versehentlich|an|am|in den|in die)\b)/u,
  /\b(arme?|handgelenke?|pulsadern?)\b[^.!?\n]{0,20}\b(aufschneiden|aufzuschneiden|aufschneide|ritzen|ritze)\b/u,
  /\bmich\b[^.!?\n]{0,15}\bvor (den|einen) zug\b|\b(von der brücke|vom dach|aus dem fenster) (springen|zu springen|stürzen)\b/u,
  /\b(schlägt|schlagen|schlug|bedroht|bedrohen|missbraucht|missbrauchen|vergewaltigt)\s+mich\b/u,
  /\bmich\b[^.!?\n]{0,20}\b(geschlagen|bedroht|missbraucht|vergewaltigt)\b/u,
  /\b(kill myself|suicide|want to die|end my life|hurt myself|cut myself|self[- ]harm)\b/u
];
export function krise(texte) {
  const aufgaben = [];
  for (const [id, t] of Object.entries(texte || {})) {
    const s = ' ' + String(t || '').toLowerCase().replace(/\s+/g, ' ') + ' ';
    if (KRISE.some((re) => re.test(s))) aufgaben.push(id);
  }
  return { an: aufgaben.length > 0, aufgaben };
}

// ---------- Für „Tiefer lesen“: die Stellen in den eigenen Texten ----------
// Sätze, in denen Wörter der Gruppen stehen (verneinte Gefühlswörter zählen nicht). Je Satz die gefundenen Originalwörter.
// Sortiert: mehr Treffer zuerst, bei Gleichstand der kürzere Satz. Lange Sätze werden um den ersten Treffer gekürzt.
export function fundstellen(texte, reihenfolge, gruppen, n = 2) {
  const aus = [];
  for (const id of reihenfolge) {
    for (const s of saetze((texte || {})[id] || '')) {
      const ws = woerter(s), treffer = new Set();
      ws.forEach((x, i) => {
        if (x.zahl) return;
        for (const g of gruppen) {
          if (!passt(g, x.w)) continue;
          if (g === 'ich' && (x.w === 'meine' || x.w === 'meinen') && i > 0 && MEINEN.has(ws[i - 1].w)) continue;
          if (GEFUEHL.includes(g) && verneint(ws, i)) continue;
          treffer.add(x.o); break;
        }
      });
      if (treffer.size) aus.push({ aufgabe: id, satz: kuerze(s, treffer), woerter: [...treffer] });
    }
  }
  return aus.sort((a, b) => b.woerter.length - a.woerter.length || a.satz.length - b.satz.length).slice(0, n);
}
function kuerze(s, treffer, max = 220) {
  if (s.length <= max) return s;
  let i = s.length; for (const w of treffer) { const j = s.indexOf(w); if (j >= 0 && j < i) i = j; }
  const von = Math.max(0, Math.min(i - 60, s.length - max)), bis = Math.min(s.length, von + max);
  return (von > 0 ? '… ' : '') + s.slice(von, bis).trim() + (bis < s.length ? ' …' : '');
}
// Zerlegt einen Satz in Stücke [{t, an}] – an = eines der gefundenen Wörter (zum Hervorheben in der Anzeige).
export function stuecke(satz, woerterListe) {
  const ziel = new Set(woerterListe), aus = []; let pos = 0;
  for (const m of String(satz).matchAll(/[\p{L}\p{M}]+(?:['-][\p{L}\p{M}]+)*/gu)) {
    if (!ziel.has(m[0])) continue;
    if (m.index > pos) aus.push({ t: satz.slice(pos, m.index), an: false });
    aus.push({ t: m[0], an: true }); pos = m.index + m[0].length;
  }
  if (pos < satz.length) aus.push({ t: satz.slice(pos), an: false });
  return aus;
}
// Wörter, die in den Texten wiederkehren – meist Themen (Hauptwörter). Ohne Allerweltswörter und ohne die Wörter der
// grammatischen Gruppen (ich, nicht, immer, war, werde, machen, weil …); Freunde/Familie und Gefühlswörter dürfen bleiben.
// Mindestens 2-mal, mindestens 4 Buchstaben; Einzahl/Mehrzahl grob zusammengefasst. Gezeigt wird die häufigste Schreibweise –
// groß nur, wenn das Wort auch mitten im Satz groß steht (sonst ist es nur der Satzanfang).
const STOP = menge(STOPP);
const OHNE = GRUPPEN_IDS.filter((g) => !['menschen', 'freude', 'belastung'].includes(g));
const stamm = (w) => (w.length > 5 ? w.replace(/(en|e|n|s)$/, '') : w);
export function wiederkehrend(texte, reihenfolge, n = 8) {
  const z = new Map();
  for (const id of reihenfolge) for (const s of saetze((texte || {})[id] || '')) woerter(s).forEach((x, i) => {
    if (x.zahl || x.w.length < 4 || STOP.has(x.w) || HILF.has(x.w) || OHNE.some((g) => passt(g, x.w))) return;
    const k = stamm(x.w), e = z.get(k) || { n: 0, formen: new Map(), gross: false };
    e.n++; e.formen.set(x.w, (e.formen.get(x.w) || 0) + 1); if (i > 0 && /^[A-ZÄÖÜ]/.test(x.o)) e.gross = true; z.set(k, e);
  });
  return [...z.entries()].filter(([, e]) => e.n >= 2)
    .sort((a, b) => b[1].n - a[1].n || b[0].length - a[0].length || a[0].localeCompare(b[0], 'de')).slice(0, n)
    .map(([, e]) => { const f = [...e.formen.entries()].sort((a, b) => b[1] - a[1])[0][0]; return e.gross ? f.charAt(0).toUpperCase() + f.slice(1) : f; });
}

// Kleiner Fingerabdruck der Texte (merkt, ob sich seit dem letzten Ergebnis etwas geändert hat)
export function fingerabdruck(texte) {
  let h = 5381; const s = JSON.stringify(texte || {});
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
