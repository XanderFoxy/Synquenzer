// Preisfehler / Technik: was es vorher kostete, was es jetzt kostet, und nichts Abgelaufenes.
// Der mydealz-Feed hat weder Altpreis noch „abgelaufen“ als Feld. Beides steht auf der Deal-Seite
// (window.__INITIAL_STATE__.threadDetail: price, nextBestPrice, shipping, isExpired, endDate). Deshalb wird jede
// Deal-Seite eines Kandidaten geprüft (höchstens ein paar pro Lauf, Ergebnis in dealseiten.json gemerkt).
import { parsePrice, round } from './text.mjs';

export const VORHER_MYDEALZ = 'Vergleichspreis laut mydealz';

// --- Deal-Seite lesen ------------------------------------------------------------------------------------------

// Ein JSON-Objekt ab Position `start` (erstes „{“) ausschneiden – Klammern in Zeichenketten zählen nicht.
function jsonObjektAb(s, start) {
  let tiefe = 0, inStr = false, esc = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === '{') tiefe++;
    else if (c === '}' && --tiefe === 0) return s.slice(start, i + 1);
  }
  return null;
}

const isoAusSekunden = t => (typeof t === 'number' && t > 0 ? new Date(t * 1000).toISOString() : null);
const zahl = v => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null);

/** Liest die Deal-Seite (HTML). Ergebnis: { abgelaufen, bis, preis, vergleichspreis, versand, temperatur, haendler,
 *  veroeffentlicht } oder null, wenn die Seite die Daten nicht enthält (Captcha, Umbau …). */
export function leseDealSeite(html) {
  const s = String(html || '');
  const i = s.indexOf('window.__INITIAL_STATE__');
  if (i < 0) return null;
  const start = s.indexOf('{', i);
  if (start < 0) return null;
  let state;
  try { state = JSON.parse(jsonObjektAb(s, start)); } catch { return null; }
  const td = state?.threadDetail;
  if (!td || typeof td !== 'object') return null;
  const versand = td.shipping?.isFree ? 0 : zahl(td.shipping?.price);
  return {
    abgelaufen: td.isExpired === true || !!td.deletedAt,
    vielleichtAbgelaufen: td.isMaybeExpired === true,
    bis: isoAusSekunden(td.endDate?.timestamp),
    preis: zahl(td.price),
    vergleichspreis: zahl(td.nextBestPrice),
    versand: versand ?? null,
    temperatur: typeof td.temperature === 'number' ? Math.round(td.temperature) : null,
    haendler: td.merchant?.merchantName || null,
    veroeffentlicht: isoAusSekunden(td.publishedAt),
  };
}

/** Steckt der Versand schon im Deal-Preis? (CAMELBAK: Titel „0,99€ + VSK“, Seite price 6,98, shipping 5,99) – wie
 *  vorteile/scan/lib/mydealz.mjs versandImPreis. seite = leseDealSeite(…) */
export function versandImPreis(titel, seite) {
  if (!seite || !(seite.versand > 0) || seite.preis == null) return false;
  const tp = parsePrice((String(titel || '').match(/(\d+(?:[.,]\d{1,2})?)\s*€/) || [])[1]);
  return tp != null && Math.abs(tp + seite.versand - seite.preis) < 0.02;
}

// --- Vorher-Preis aus dem Text (nur als Notlösung, wenn die Deal-Seite keinen Vergleichspreis hat) ---------------

const Z = String.raw`(\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+(?:,\d{1,2})?)`;
const EURO = String.raw`\s*(?:€|eur\b|euro\b)`;
// Reihenfolge = Verlässlichkeit. „sonst“ fehlt absichtlich (meist Versandkosten: „sonst 5,95 €“).
const VORHER_MUSTER = [
  { quelle: 'UVP', re: new RegExp(String.raw`\buvp\b(?:\s*(?:von|liegt bei|bei|:|ca\.?|rund))*\s*${Z}(${EURO})?`, 'gi'), euroNoetig: false },
  { quelle: 'Vergleichspreis laut Deal-Text', re: new RegExp(String.raw`\b(?:vergleichspreis|preisvergleich|pvg|vgp|idealo)\b[^0-9€\n]{0,40}?${Z}(${EURO})?`, 'gi'), euroNoetig: false },
  { quelle: 'statt-Preis laut Deal-Text', re: new RegExp(String.raw`\b(?:an)?statt\b(?:\s+(?:der|dem|den|regul[aä]ren|üblichen|ca\.?|rund|bisher|zuvor|von))*\s*${Z}(${EURO})`, 'gi'), euroNoetig: true },
  { quelle: 'Normalpreis laut Deal-Text', re: new RegExp(String.raw`\b(?:normalerweise|normalpreis|regul[aä]r(?:e[rnms]?)?|ursprünglich)\b(?!\s+uvp\b)[^0-9€\n]{0,30}?${Z}(${EURO})`, 'gi'), euroNoetig: true },
];
const VERSAND_DANACH = /^[^.!?\n]{0,25}(?:versand|vsk|porto|liefer)/i;
const SPANNE_DANACH = /^\s*(?:€|eur|euro)?\s*(?:bis|-|–)\s*\d/i;
const PROZENT_DANACH = /^\s*%/;

/** { wert, quelle } aus Titel/Beschreibung, nur wenn eindeutig über dem Preis; sonst null. */
export function vorherAusText(titel, beschreibung, preis) {
  for (const text of [titel, beschreibung]) {
    const t = String(text || '');
    let bester = null;
    for (const { quelle, re, euroNoetig } of VORHER_MUSTER) {
      re.lastIndex = 0;
      for (const m of t.matchAll(re)) {
        const rest = t.slice(m.index + m[0].length);
        if (PROZENT_DANACH.test(rest) || SPANNE_DANACH.test(rest) || VERSAND_DANACH.test(rest)) continue;
        // ohne €-Zeichen nur Zahlen mit Cent („PVG 471,40“), damit „Bike24“ o. Ä. nicht zählt
        if (!euroNoetig && !m[2] && !/,\d{1,2}$/.test(m[1])) continue;
        const wert = parsePrice(m[1]);
        if (!(wert > 0)) continue;
        if (preis > 0 && !(wert > preis * 1.05 && wert < preis * 200)) continue;
        // die erste passende Stelle im Text gewinnt (spätere gehören oft zu einem anderen Produkt im selben Deal)
        if (!bester || m.index < bester.pos) bester = { wert, quelle, pos: m.index };
        break;
      }
    }
    if (bester) return { wert: bester.wert, quelle: bester.quelle };
  }
  return null;
}

/** Vorher/jetzt/Ersparnis nach Vertrag: preisVorher, vorherQuelle, ersparnisEuro, ersparnisProzent (ganze Zahl 0–100). */
export function vorherJetzt(preis, vorher, quelle) {
  if (!(preis > 0) || !(vorher > preis)) return { preisVorher: null, vorherQuelle: null, ersparnisEuro: null, ersparnisProzent: null };
  return {
    preisVorher: round(vorher),
    vorherQuelle: quelle || null,
    ersparnisEuro: round(vorher - preis),
    ersparnisProzent: Math.min(100, Math.max(0, Math.round((1 - preis / vorher) * 100))),
  };
}

// --- Prüfen mit Gedächtnis (dealseiten.json) -------------------------------------------------------------------

export const leereDealseiten = () => ({ version: 1, seiten: {} });

/**
 * Prüft die Deal-Seiten der Kandidaten (neueste zuerst). Abgelaufene Ergebnisse bleiben gemerkt, laufende werden nach
 * `neuPruefenMin` Minuten erneut geprüft (ein Preisfehler ist oft nach Minuten vorbei). Höchstens `max` Abrufe pro Lauf.
 * Rückgabe: Map link -> Ergebnis ({ ok:true, … } | { ok:false, fehler }) bzw. undefined (diesmal nicht geprüft).
 */
export async function pruefeDealSeiten(links, { holeText, cache, jetztMs, max = 10, neuPruefenMin = 45, log = () => {} }) {
  cache ||= leereDealseiten();
  cache.seiten ||= {};
  const res = new Map();
  let abrufe = 0;
  for (const link of links) {
    const alt = cache.seiten[link];
    const alter = alt ? (jetztMs - Date.parse(alt.geprueft)) / 6e4 : Infinity;
    if (alt?.ok && (alt.abgelaufen || alter < neuPruefenMin)) { res.set(link, alt); continue; }
    if (abrufe >= max) continue;
    abrufe++;
    let e;
    try {
      const daten = leseDealSeite(await holeText(link, { headers: { accept: 'text/html' } }));
      e = daten ? { ok: true, ...daten } : { ok: false, fehler: 'Deal-Seite ohne Daten (Seite geändert?)' };
    } catch (err) { e = { ok: false, fehler: String(err?.message || err) }; }
    e.geprueft = new Date(jetztMs).toISOString();
    if (e.ok) cache.seiten[link] = e; // Fehler nicht merken -> nächster Lauf versucht es wieder
    res.set(link, e);
    log(`Deal-Seite ${e.ok ? (e.abgelaufen ? 'abgelaufen' : 'läuft') : 'nicht lesbar: ' + e.fehler}: ${link}`);
  }
  // Gedächtnis klein halten: nur die letzten 8 Tage
  for (const [k, v] of Object.entries(cache.seiten)) if (jetztMs - Date.parse(v.geprueft) > 8 * 864e5) delete cache.seiten[k];
  return { ergebnisse: res, abrufe, cache };
}
