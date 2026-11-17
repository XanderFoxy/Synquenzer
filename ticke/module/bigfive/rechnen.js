// M1 bigfive – Auswertung (ohne DOM, ohne Kern; in Node testbar: test/bigfive/rechnen-test.mjs).
// Weg: Antworten 1–5 → umpolen → Rohwert (Mittel × Fragenzahl, fehlende Antworten anteilig) → T-Wert mit Vergleichswerten
// (Johnson, IPIP-NEO-120) → 95-%-Band aus der Zuverlässigkeit, verbreitert bei widersprüchlichen Antworten → Wort, Stufe.
import { FRAGEN, BEREICHE, FACETTEN, NORMEN, FASSUNG, START_REIHE } from './daten.js';

export const GRUPPEN = {
  alle: 'alle Altersgruppen', u21: 'unter 21 Jahren', '21-40': '21 bis 40 Jahre', '41-60': '41 bis 60 Jahre', '60plus': 'über 60 Jahre'
};
const WORTE = { '-2': 'deutlich niedriger als die meisten', '-1': 'eher niedriger als die meisten', '0': 'im Mittelfeld', '1': 'eher höher als die meisten', '2': 'deutlich höher als die meisten' };
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
  minStart: 4             // so viele der 6 Startfragen müssen beantwortet sein
};

const rund = (x, n = 1) => Math.round(x * 10 ** n) / 10 ** n;
export const stufeT = (t) => (t < 35 ? -2 : t < 45 ? -1 : t <= 55 ? 0 : t <= 65 ? 1 : 2);
export const wort = (s) => WORTE[String(s)] || WORTE['0'];
export const klar = (b) => (b.oben < 45 ? -1 : b.unten > 55 ? 1 : 0);
// Prozentrang aus T (Normalverteilung): Anteil der Vergleichsgruppe mit niedrigerem Wert, in Prozent.
export function prozentrang(t) {
  const z = (t - 50) / 10, a = Math.abs(z) / Math.SQRT2, u = 1 / (1 + 0.3275911 * a);
  const erf = 1 - (((((1.061405429 * u - 1.453152027) * u) + 1.421413741) * u - 0.284496736) * u + 0.254829592) * u * Math.exp(-a * a);
  return Math.max(0, Math.min(100, 50 * (1 + Math.sign(z) * erf)));
}
const sb = (rho, n) => (n * rho) / (1 + (n - 1) * rho);                         // Spearman-Brown
const mittel = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const sd = (xs) => { if (xs.length < 2) return 0; const m = mittel(xs); return Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1)); };
const gueltig = (a) => typeof a === 'number' && a >= 1 && a <= 5;
const umpolen = (q, a) => (q.k > 0 ? a : 6 - a);

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
  band.stufe = stufeT(band.wert); band.wort = wort(band.stufe); band.klar = klar(band);
  // Anzeige auf 1–99 begrenzt: Prozentrang setzt eine Normalverteilung voraus und ist an den Rändern ungenau (Prüfung 17.11. F13)
  const pr1 = (t) => Math.max(1, Math.min(99, Math.round(prozentrang(t))));
  band.pr = [pr1(band.unten), pr1(band.oben)];
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
        fb.grob = true; facetten[B.id + '.' + fid] = fb;
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
    vergleich: `vorläufig – englischsprachige Online-Stichprobe (Johnson, IPIP-NEO-120), ${GRUPPEN[G]}, Frauen und Männer gemischt; eigene deutsche Übersetzung, noch ohne deutsche Vergleichswerte`,
    bereiche, facetten,
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
