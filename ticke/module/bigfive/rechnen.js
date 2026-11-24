// M1 bigfive – Auswertung (ohne DOM, ohne Kern; in Node testbar).
// Angezeigt wird NUR die Richtung in Worten (eigenesMuster): Antworten 1–5 → umpolen → Mittel der eigenen Antworten je Bereich/Facette
// → „klar“ / „leicht“ in Richtung eines der zwei gleichwertigen Pole oder „beides“. Kein Vergleich mit anderen Menschen.
// Intern bleibt die frühere Rechnung (T-Wert mit Johnsons Vergleichswerten → Band, stufe, klar) im Ergebnis stehen, weil ältere Leser
// (passt, training, textspiegel, weg) diese Felder erwarten und „Genauer hinschauen“ damit vorgeschlagen wird. Sie wird nicht gezeigt.
import { FRAGEN, BEREICHE, BEREICH, FACETTEN, FACETTEN_POLE, NORMEN, FASSUNG, START_REIHE } from './daten.js';

export const GRUPPEN = {
  alle: 'alle Altersgruppen', u21: 'unter 21 Jahren', '21-40': '21 bis 40 Jahre', '41-60': '41 bis 60 Jahre', '60plus': 'über 60 Jahre'
};
export const GRENZEN = {
  schnellMs: 1500,        // Median-Zeit je Frage darunter → „sehr schnell“ (Huang u. a. 2012: < 2 s je Frage ist verdächtig)
  gleichLauf: 10,         // so viele gleiche Antworten hintereinander → „alles gleich“ (Johnson 2005: Longstring)
  gleichAnteil: 0.8,      // oder so viel Anteil derselben Antwort
  zustimmung: 4.0,        // Mittel der Rohantworten in BEIDEN Richtungen ≥ 4 → Ja-Sage-Neigung (≤ 2 → Nein-Sage-Neigung)
  widerspruchSd: 1.3,     // Streuung der umgepolten Antworten in einem Bereich (Startform) → „widersprüchlich“
  mitte: 6,               // |T − 50| darunter → „nahe der Mitte“
  deutlich: 15,           // |T − 50| ab hier → „deutlich“
  naeherung: 3,           // zusätzliche Unsicherheit (T) der Startform-Vergleichswerte (Näherung)
  qualitaet: 4,           // zusätzliche Unsicherheit (T), wenn die Antwort-Qualität fraglich ist
  minStart: 4,            // so viele der 6 Startfragen müssen beantwortet sein
  leicht: 0.35,           // eigene Richtung: |Mittel − 3| ab hier „leicht“ (3 = „teils, teils“)
  klar: 0.85,             // … ab hier „klar“
  gemischtSd: 1.3         // Antworten eines Bereichs so weit gestreut und nicht klar → „beides gehört zu dir“
};

const rund = (x, n = 1) => Math.round(x * 10 ** n) / 10 ** n;
export const stufeT = (t) => (t < 35 ? -2 : t < 45 ? -1 : t <= 55 ? 0 : t <= 65 ? 1 : 2);
export const klar = (b) => (b.oben < 45 ? -1 : b.unten > 55 ? 1 : 0);
const sb = (rho, n) => (n * rho) / (1 + (n - 1) * rho);                         // Spearman-Brown
const mittel = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const sd = (xs) => { if (xs.length < 2) return 0; const m = mittel(xs); return Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1)); };
const gueltig = (a) => typeof a === 'number' && a >= 1 && a <= 5;
const umpolen = (q, a) => (q.k > 0 ? a : 6 - a);

// ---------- Eigene Richtung (nur aus den eigenen Antworten) ----------
// werte: umgepolte Antworten (IPIP-Richtung); umgepolt: App-Bereich zeigt in die Gegenrichtung (stabilitaet).
// pol: 1 = erster Pol (rechts, Zustimmung in App-Richtung), -1 = Gegenpol (links), 0 = beides. deutlich: 'klar' | 'leicht' | 'beides'.
export function richtungAus(werte, umgepolt = false, fraglich = false) {
  if (!werte.length) return null;
  const m = umgepolt ? 6 - mittel(werte) : mittel(werte), d = m - 3, s = sd(werte), n = werte.length;
  let pol = d >= GRENZEN.leicht ? 1 : d <= -GRENZEN.leicht ? -1 : 0;
  let deutlich = pol === 0 ? 'beides' : Math.abs(d) >= GRENZEN.klar ? 'klar' : 'leicht';
  if (n >= 3 && s >= GRENZEN.gemischtSd && Math.abs(d) < GRENZEN.klar) { pol = 0; deutlich = 'beides'; }   // zeigt in verschiedene Richtungen
  if (fraglich && deutlich === 'klar') deutlich = 'leicht';                                                  // eilige Antworten: vorsichtiger sagen
  return { pol, deutlich, n };
}
// Pol-Namen eines Bereichs bzw. einer Facette: [erster Pol, Gegenpol].
export function poleVon(schluessel) {
  const [b, f] = String(schluessel).split('.'), B = BEREICH[b]; if (!B) return null;
  if (!f) return [B.rechts, B.links];
  const P = FACETTEN_POLE[b] && FACETTEN_POLE[b][f]; return P ? [P[1], P[2]] : null;
}
// Kurzes Wort zur Richtung, z. B. „klar in Richtung „Neugier auf Neues““ oder „beides gehört zu dir“ (auch für ältere Leser im Feld wort).
export function wortAus(schluessel, r) {
  const P = poleVon(schluessel); if (!r || !P) return '';
  if (r.deutlich === 'beides' || !r.pol) return 'beides gehört zu dir';
  return `${r.deutlich === 'klar' ? 'klar' : 'leicht'} in Richtung „${r.pol > 0 ? P[0] : P[1]}“`;
}
// Muster aus den Antworten: { bereiche: {id: {pol, deutlich, n}}, facetten: {'bereich.facette': {pol, deutlich, n}}, fraglich }.
// Bereiche erst ab GRENZEN.minStart Antworten der Kurzform (bzw. sobald vertieft), Facetten ab einer Antwort.
export function eigenesMuster(antworten, fraglich = false) {
  const bereiche = {}, facetten = {};
  for (const B of BEREICHE) {
    const qs = FRAGEN.filter((q) => q.b === B.ipip && gueltig(antworten[q.id]));
    const start = qs.filter((q) => q.start).length;
    if (start >= GRENZEN.minStart || istVertieft(B.ipip, antworten)) bereiche[B.id] = richtungAus(qs.map((q) => umpolen(q, antworten[q.id])), !!B.umgepolt, fraglich);
    FACETTEN[B.id].forEach(([fid], i) => {
      const fq = qs.filter((q) => q.f === i + 1);
      const r = richtungAus(fq.map((q) => umpolen(q, antworten[q.id])), !!B.umgepolt, fraglich);
      if (r) facetten[B.id + '.' + fid] = r;
    });
  }
  return { bereiche, facetten, fraglich: !!fraglich };
}

// Ein Band auf der T-Skala. werte: umgepolte Antworten, k: Fragen im vollen Satz, norm: [mittel, sd] der Summe, r: Zuverlässigkeit.
function bandAus(werte, k, norm, r, extra = 0) {
  const n = werte.length, m = mittel(werte), roh = m * k;
  const t = 50 + (10 * (roh - norm[0])) / norm[1];
  const sem = 10 * Math.sqrt(Math.max(0, 1 - r));
  const sePerson = n > 1 ? (sd(werte) * k / Math.sqrt(n)) * 10 / norm[1] : 0;   // eigener Messfehler aus der Streuung der Antworten
  const se = Math.max(Math.sqrt(sem * sem + extra * extra), sePerson);
  const h = 1.96 * se;
  return { wert: t, unten: t - h, oben: t + h, sd: sd(werte), n, mittel: m, r };
}
function fertig(b, umgepolt) {
  let { wert, unten, oben } = b;
  if (umgepolt) [wert, unten, oben] = [100 - wert, 100 - oben, 100 - unten];
  const band = { wert: rund(wert), unten: rund(unten), oben: rund(oben), n: b.n, r: rund(b.r, 2) };
  band.stufe = stufeT(band.wert); band.klar = klar(band);   // intern (ältere Leser); band.wort setzt wertung() aus der eigenen Richtung
  return band;
}

// Antwort-Qualität: Tempo, gleiche Antworten, Ja-/Nein-Sage-Neigung. reihe = IDs in der Reihenfolge, in der sie gezeigt wurden.
export function qualitaet(antworten, zeiten = {}, reihe = null) {
  const ids = (reihe || FRAGEN.map((q) => q.id)).filter((id) => gueltig(antworten[id]));
  const werte = ids.map((id) => antworten[id]);
  let lauf = 0, maxLauf = 0, vor = null;
  for (const w of werte) { lauf = w === vor ? lauf + 1 : 1; vor = w; if (lauf > maxLauf) maxLauf = lauf; }
  const haeufig = {}; werte.forEach((w) => { haeufig[w] = (haeufig[w] || 0) + 1; });
  const anteil = werte.length ? Math.max(...Object.values(haeufig)) / werte.length : 0;
  const ms = ids.map((id) => zeiten[id]).filter((x) => typeof x === 'number' && x > 0).sort((a, b) => a - b);
  const median = ms.length ? ms[Math.floor(ms.length / 2)] : null;
  const plus = [], minus = [];
  for (const id of ids) { const q = FRAGEN.find((x) => x.id === id); (q.k > 0 ? plus : minus).push(antworten[id]); }
  const mp = plus.length ? mittel(plus) : 3, mm = minus.length ? mittel(minus) : 3;
  const q = {
    n: werte.length, laengsterLauf: maxLauf, gleichAnteil: rund(anteil, 2), medianMs: median,
    schnell: ms.length >= 10 && median < GRENZEN.schnellMs,
    gleich: werte.length >= 10 && (maxLauf >= GRENZEN.gleichLauf || anteil >= GRENZEN.gleichAnteil),
    jaSager: plus.length >= 5 && minus.length >= 5 && mp >= GRENZEN.zustimmung && mm >= GRENZEN.zustimmung,
    neinSager: plus.length >= 5 && minus.length >= 5 && mp <= 6 - GRENZEN.zustimmung && mm <= 6 - GRENZEN.zustimmung
  };
  q.fraglich = q.schnell || q.gleich || q.jaSager || q.neinSager;
  return q;
}

// Ist ein Bereich vertieft? Jede Facette hat mindestens 3 Antworten (O6 „liberalitaet“: 2, mehr gibt es nicht).
function istVertieft(ipip, antworten) {
  for (let f = 1; f <= 6; f++) {
    const qs = FRAGEN.filter((q) => q.b === ipip && q.f === f);
    const n = qs.filter((q) => gueltig(antworten[q.id])).length;
    if (n < Math.min(3, qs.length)) return false;
  }
  return true;
}

// Hauptfunktion. antworten {bfNr: 1..5 | null}; o: { gruppe, zeiten, lauf, reihe }. Gibt den Ergebnis-Eintrag (ARCH.md §3.3, schema 1).
export function wertung(antworten, { gruppe = 'alle', zeiten = {}, lauf = null, reihe = null } = {}) {
  const G = NORMEN.gruppen[gruppe] ? gruppe : 'alle', N = NORMEN.gruppen[G];
  const qual = qualitaet(antworten, zeiten, reihe);
  const extraQ = qual.fraglich ? GRENZEN.qualitaet : 0;
  const bereiche = {}, facetten = {}, angeboten = [], erledigt = [], gruende = {}, fehlt = [];
  const eigen = eigenesMuster(antworten, qual.fraglich);
  for (const B of BEREICHE) {
    const ip = B.ipip, nrm = N[ip], rel = NORMEN.r[ip];
    const vertieft = istVertieft(ip, antworten);
    let roh;
    if (vertieft) {
      const qs = FRAGEN.filter((q) => q.b === ip && gueltig(antworten[q.id]));
      const voll = FRAGEN.filter((q) => q.b === ip).length;           // 24 (O: 22)
      const r = sb(rel.r24 / (24 - 23 * rel.r24), qs.length);          // Zuverlässigkeit für die tatsächlich beantworteten Fragen
      roh = bandAus(qs.map((q) => umpolen(q, antworten[q.id])), 24, nrm.d, Math.min(r, 0.9), extraQ);
      roh.k = voll;
      erledigt.push(B.id);
      // Facetten
      FACETTEN[B.id].forEach(([fid], i) => {
        const fq = FRAGEN.filter((q) => q.b === ip && q.f === i + 1 && gueltig(antworten[q.id]));
        if (fq.length < 2) return;
        const rf = Math.min(0.7, sb(NORMEN.rhoW, fq.length) - 0.05);
        const fb = fertig(bandAus(fq.map((q) => umpolen(q, antworten[q.id])), 4, nrm.f[i], rf, extraQ), B.umgepolt);
        fb.grob = true; fb.eigen = eigen.facetten[B.id + '.' + fid] || null; fb.wort = wortAus(B.id + '.' + fid, fb.eigen);
        facetten[B.id + '.' + fid] = fb;
      });
    } else {
      const qs = FRAGEN.filter((q) => q.b === ip && q.start && gueltig(antworten[q.id]));
      if (qs.length < GRENZEN.minStart) { fehlt.push(B.id); continue; }
      const r = sb(rel.rStart / (6 - 5 * rel.rStart), qs.length);
      roh = bandAus(qs.map((q) => umpolen(q, antworten[q.id])), 6, nrm.s, r, Math.sqrt(GRENZEN.naeherung ** 2 + extraQ ** 2));
    }
    const band = fertig(roh, B.umgepolt);
    band.form = vertieft ? 'vertieft' : 'start';
    band.grob = !vertieft;
    band.streuung = rund(roh.sd, 2);
    band.eigen = eigen.bereiche[B.id] || richtungAus(FRAGEN.filter((q) => q.b === ip && gueltig(antworten[q.id])).map((q) => umpolen(q, antworten[q.id])), !!B.umgepolt, qual.fraglich);
    band.wort = wortAus(B.id, band.eigen);
    bereiche[B.id] = band;
    if (!vertieft) {
      const abst = Math.abs(band.wert - 50);
      const grund = roh.sd >= GRENZEN.widerspruchSd ? 'widerspruch' : abst < GRENZEN.mitte ? 'mitte' : abst >= GRENZEN.deutlich ? 'deutlich' : null;
      if (grund) { gruende[B.id] = grund; angeboten.push(B.id); }
    }
  }
  const RANG = { widerspruch: 0, mitte: 1, deutlich: 2 };
  angeboten.sort((a, b) => RANG[gruende[a]] - RANG[gruende[b]] || Math.abs(bereiche[a].wert - 50) - Math.abs(bereiche[b].wert - 50));
  const form = erledigt.length ? 'vertieft' : 'start';
  return {
    schema: 1, form, skala: 'T', fassung: FASSUNG, gruppe: G, lauf,
    vergleich: 'nicht angezeigt – die Richtung in Worten kommt nur aus den eigenen Antworten (intern: Johnson, IPIP-NEO-120, für ältere Leser)',
    bereiche, facetten,
    facettenEigen: eigen.facetten,   // Richtung je Facette in Worten (ab einer Antwort), nur aus den eigenen Antworten
    vertiefung: { angeboten, erledigt, gruende, empfohlen: angeboten.slice(0, 2) },
    fehlt, qualitaet: qual,
    beantwortet: FRAGEN.filter((q) => gueltig(antworten[q.id])).length,
    quellen: ['johnson2014', 'goldberg2006', 'johnsonnormen']
  };
}

// Startform vollständig (genug Antworten für alle fünf Bereiche)?
export function startFertig(antworten) {
  return BEREICHE.every((B) => FRAGEN.filter((q) => q.b === B.ipip && q.start && gueltig(antworten[q.id])).length >= GRENZEN.minStart);
}
export function startBeantwortet(antworten) { return START_REIHE.filter((n) => ('bf' + n) in antworten).length; }
