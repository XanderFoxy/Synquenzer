// M2 interessen – Auswertung (reine Rechnung, ohne DOM und ohne kern.js → in Node testbar).
// Ergebnis-Formate: ARCH.md §3.3 (interessen.riasec, interessen.rhythmus, interessen.ehrlichkeit).
import { RIASEC, REIHE, WORT_INTERESSE, EHRLICHKEIT, FACETTEN, WORT_EHRLICH, TYP_GRENZEN, TYP_WORT, SELBST } from './daten.js';

const r2 = (x) => Math.round(x * 100) / 100;
const r1 = (x) => Math.round(x * 10) / 10;

// ---------- Bänder auf der Skala „pomp“ (Prozent des möglichen Bereichs, 0–100) ----------
// Ohne deutsche Vergleichswerte gibt es keine T-Werte. Das Band ist ±1,96 · SD · √(1 − r), mit angenommener Streuung SD
// (in pomp-Punkten) und Zuverlässigkeit r; r für n Fragen nach Spearman-Brown aus der Zuverlässigkeit der vollen Skala.
export function stufePomp(p) { return p < 20 ? -2 : p < 40 ? -1 : p <= 60 ? 0 : p <= 80 ? 1 : 2; }
export function zuverlaessigkeit(rVoll, nVoll, n) {
  if (n <= 0) return 0;
  const einzeln = rVoll / (nVoll - (nVoll - 1) * rVoll);
  return (n * einzeln) / (1 + (n - 1) * einzeln);
}
export function bandPomp(items, antworten, { rVoll, nVoll, sd, worte }) {
  let s = 0, n = 0;
  for (const it of items) {
    const a = antworten[it.id];
    if (typeof a === 'number' && a >= 1 && a <= 5) { s += it.u ? 6 - a : a; n++; }
  }
  if (!n) return null;
  const wert = ((s / n - 1) / 4) * 100;
  const r = zuverlaessigkeit(rVoll, nVoll, n);
  const h = 1.96 * sd * Math.sqrt(Math.max(0, 1 - r));
  const stufe = stufePomp(wert);
  return { wert: r1(wert), unten: r1(Math.max(0, wert - h)), oben: r1(Math.min(100, wert + h)), stufe, wort: worte[String(stufe)], n, r: r2(r) };
}

// ---------- RIASEC ----------
// Annahmen (QUELLEN.md): volle Skala 8 Fragen, r ≈ .80 (übersetzt, vorläufig), Streuung der Mittelwerte ≈ 0,9 auf 1–5 = 22 pomp.
export const RIASEC_ANNAHME = { rVoll: 0.80, nVoll: 8, sd: 22 };
export function abstandSechseck(a, b) { const d = Math.abs(REIHE.indexOf(a) - REIHE.indexOf(b)); return Math.min(d, 6 - d); }
export function paarSchluessel(a, b) { return [a, b].sort((x, y) => REIHE.indexOf(x) - REIHE.indexOf(y)).join(''); }

export function riasecAuswerten(antworten, form = 'kurz') {
  const typen = {};
  for (const t of REIHE) {
    const items = RIASEC.filter((f) => f.typ === t && (form === 'voll' || f.k));
    const b = bandPomp(items, antworten, { ...RIASEC_ANNAHME, worte: WORT_INTERESSE });
    if (!b) return null;
    typen[t] = b;
  }
  const sortiert = [...REIHE].sort((a, b) => typen[b].wert - typen[a].wert || REIHE.indexOf(a) - REIHE.indexOf(b));
  for (const t of REIHE) typen[t].rang = 1 + REIHE.filter((x) => typen[x].wert > typen[t].wert).length;
  const top = sortiert.slice(0, 3);
  const w = sortiert.map((t) => typen[t].wert);
  const hoehe = r1(w.reduce((s, x) => s + x, 0) / 6);
  // Knapp-Grenze = 1 Standardfehler der Differenz zweier Bereiche (Prüfung 17.11. F3): SD · √(2 · (1 − r)), r je nach Fragenzahl.
  // Kurzform (4 Fragen, r ≈ .67) ≈ 18 Punkte, volle Form (8 Fragen, r = .80) ≈ 14 Punkte.
  const nFragen = Math.min(...REIHE.map((t) => typen[t].n));
  const grenze = r1(RIASEC_ANNAHME.sd * Math.sqrt(2 * (1 - zuverlaessigkeit(RIASEC_ANNAHME.rVoll, RIASEC_ANNAHME.nVoll, nFragen))));
  const spitze = sortiert.filter((t) => w[0] - typen[t].wert < grenze);
  return {
    schema: 1, skala: 'pomp', form, typen, top, code: top.join(''),
    // knapp: Platz 3 und 4 (bzw. 1 und 2) liegen weniger als 1 Standardfehler der Differenz auseinander → „nimm beide mit“
    knapp: { drittVierter: w[2] - w[3] < grenze ? sortiert[3] : null, ersterZweiter: w[0] - w[1] < grenze, grenze }, spitze,
    hoehe, spreizung: r1(w[0] - w[5]),
    nachbarn: abstandSechseck(top[0], top[1]),     // 1 = nebeneinander, 2 = eins dazwischen, 3 = gegenüber
    quellen: ['armstrong2008', 'nye2012']
  };
}

// ---------- Ehrlichkeit-Bescheidenheit ----------
// Annahmen: 12 Fragen, r ≈ .80, Streuung ≈ 0,6 auf 1–5 = 15 pomp; Teile (3 Fragen) Streuung ≈ 0,72 = 18 pomp.
export const EHRLICH_ANNAHME = { rVoll: 0.80, nVoll: 12, sd: 15, sdTeil: 18 };
export function ehrlichkeitAuswerten(antworten) {
  const A = EHRLICH_ANNAHME;
  const gesamt = bandPomp(EHRLICHKEIT, antworten, { rVoll: A.rVoll, nVoll: A.nVoll, sd: A.sd, worte: WORT_EHRLICH });
  if (!gesamt) return null;
  const facetten = {};
  for (const f of Object.keys(FACETTEN)) {
    const b = bandPomp(EHRLICHKEIT.filter((x) => x.f === f), antworten, { rVoll: A.rVoll, nVoll: A.nVoll, sd: A.sdTeil, worte: WORT_EHRLICH });
    if (b) facetten[f] = b;
  }
  return { schema: 1, skala: 'pomp', ...gesamt, facetten, quellen: ['ashton2007'] };
}

// ---------- Tagesrhythmus ----------
// Uhrzeit 'HH:MM' → Stunden (dezimal). Einschlafen: ab 15 Uhr als „vor Mitternacht“ negativ (23:30 → −0,5).
export function stunden(hhmm) {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(hhmm || '')); if (!m) return null;
  const h = Number(m[1]) + Number(m[2]) / 60; return h >= 0 && h < 24 ? h : null;
}
const einschlaf = (h) => (h >= 15 ? h - 24 : h);
const norm12 = (h) => { let x = h; while (x > 12) x -= 24; while (x <= -12) x += 24; return x; };
const normMitte = (h) => { let x = h; while (x > 18) x -= 24; while (x <= -6) x += 24; return x; };   // Schlafmitte: 18 Uhr am Vortag bis 18 Uhr
export const uhr24 = (h) => ((h % 24) + 24) % 24;
// Schlaf aus Einschlaf- und Aufwachzeit: { beginn, dauer, mitte } oder null
export function schlaf(ein, auf) {
  const e = stunden(ein), a = stunden(auf); if (e === null || a === null) return null;
  const beginn = einschlaf(e); let dauer = a - beginn; if (dauer <= 0) dauer += 24; if (dauer > 24) dauer -= 24;
  return { beginn, dauer, mitte: normMitte(beginn + dauer / 2) };
}
// Typ aus der korrigierten Schlafmitte an freien Tagen
export function typAus(msfsc) { for (const [t, g] of TYP_GRENZEN) if (msfsc < g) return t; return 'spaet'; }

// e: { tage (0–7 Tage mit fester Aufstehzeit), freiEin, freiAuf, arbeitEin, arbeitAuf, weckerFrei (bool), selbst }
// Gibt { fehler: '…' } oder das Ergebnis (ARCH.md §3.3, zusätzliche Felder siehe NOTES-interessen.md).
export function rhythmusAuswerten(e) {
  const tage = e.tage === null || e.tage === undefined || e.tage === '' ? NaN : Number(e.tage);
  if (!(tage >= 0 && tage <= 7)) return { fehler: 'Wähle, an wie vielen Tagen du zu einer festen Zeit aufstehen musst.' };
  const frei = tage < 7 ? schlaf(e.freiEin, e.freiAuf) : null;
  const arbeit = tage > 0 ? schlaf(e.arbeitEin, e.arbeitAuf) : null;
  if (tage < 7 && !frei) return { fehler: 'Trag ein, wann du an freien Tagen einschläfst und aufwachst.' };
  if (tage > 0 && !arbeit) return { fehler: 'Trag ein, wann du an Tagen mit fester Zeit einschläfst und aufwachst.' };
  for (const s of [frei, arbeit]) if (s && (s.dauer < 2 || s.dauer > 16)) return { fehler: `Das wären ${dauerText(s.dauer)} Schlaf. Bitte prüf die Zeiten.` };
  const basis = frei || arbeit;
  const msf = basis.mitte, msw = arbeit ? arbeit.mitte : null;
  let msfsc = msf;
  if (frei && arbeit && frei.dauer > arbeit.dauer) {
    const woche = (arbeit.dauer * tage + frei.dauer * (7 - tage)) / 7;
    msfsc = msf - (frei.dauer - woche) / 2;
  }
  const typ = typAus(msfsc);
  const jetlag = msw === null || !frei ? null : Math.abs(norm12(msf - msw));
  // Grobe Tagesfenster (abgeleitet aus Schmidt u. a. 2007: Leistung folgt der inneren Uhr) – Uhrzeiten 0–24.
  const fenster = (a, b) => ({ von: r2(uhr24(msfsc + a)), bis: r2(uhr24(msfsc + b)) });
  const fokus = fenster(6.5, 9.5), tief = fenster(10, 12), fokus2 = fenster(12.5, 15);
  const ideen = typ === 'spaet' || typ === 'eher-spaet' ? fenster(3.5, 5.5) : typ === 'frueh' || typ === 'eher-frueh' ? fenster(15.5, 17.5) : null;
  const sel = SELBST.find((x) => x.wert === e.selbst && x.von != null) || null;
  const imFenster = (f) => sel && ueberlappt(sel.von, sel.bis, f.von, f.bis);
  const hinweise = [];
  if (e.weckerFrei && frei) hinweise.push('wecker');
  if (tage === 7) hinweise.push('keine-freien-tage');
  if (arbeit && arbeit.dauer < 6) hinweise.push('kurz-geschlafen');
  if (jetlag !== null && jetlag >= 2) hinweise.push('grosser-jetlag');
  if ([frei, arbeit].some((s) => s && (s.beginn < -6 || s.beginn > 6))) hinweise.push('ungewoehnliche-zeiten');
  return {
    schema: 1,
    schlafmitteFrei: frei ? r2(frei.mitte) : null, schlafmitteArbeit: msw === null ? null : r2(msw), schlafmitteKorr: r2(msfsc),
    sozialerJetlag: jetlag === null ? null : r2(jetlag),
    schlafdauerFrei: frei ? r2(frei.dauer) : null, schlafdauerArbeit: arbeit ? r2(arbeit.dauer) : null,
    einschlafenFrei: frei ? r2(frei.beginn) : null, einschlafenArbeit: arbeit ? r2(arbeit.beginn) : null,
    tageMitTermin: tage, weckerFrei: !!e.weckerFrei,
    typ, wort: TYP_WORT[typ], stufe: 'abgeleitet',
    fokus, tief, fokus2, ideen,
    selbst: sel ? sel.wert : (e.selbst || null), selbstPasst: sel ? !!(imFenster(fokus) || imFenster(fokus2)) : null,
    hinweise, quellen: ['roenneberg2003', 'wittmann2006', 'schmidt2007']
  };
}
// Überlappen sich zwei Uhrzeit-Bereiche (auch über Mitternacht)?
export function ueberlappt(a1, b1, a2, b2) {
  const teile = (a, b) => { a = uhr24(a); b = uhr24(b); return a <= b ? [[a, b]] : [[a, 24], [0, b]]; };
  for (const [x1, y1] of teile(a1, b1)) for (const [x2, y2] of teile(a2, b2)) if (Math.min(y1, y2) - Math.max(x1, x2) > 0.25) return true;
  return false;
}

// ---------- Anzeige-Hilfen ----------
export function uhrText(h) { if (h == null) return '–'; let m = Math.round(uhr24(h) * 12) * 5; m %= 1440; return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`; }
export function dauerText(h) {
  const m = Math.round(Math.abs(h) * 12) * 5, s = Math.floor(m / 60), r = m % 60;
  return s && r ? `${s} Std. ${r} Min.` : s ? `${s} Std.` : `${r} Min.`;
}
