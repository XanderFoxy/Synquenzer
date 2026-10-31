// mydealz: Deal-Seite lesen (abgelaufen? Vergleichspreis? Versand?), Altpreis aus dem Text, Temperatur aus dem Titel,
// Preisangaben „vorher → jetzt“ für Preisfehler.
// Der RSS-Feed hat KEIN Feld für „abgelaufen“ und keinen Altpreis. Beides steht nur auf der Deal-Seite in
// window.__INITIAL_STATE__.threadDetail (isExpired, endDate, nextBestPrice, price, shipping, temperature).
import { parsePrice, round, euro } from './text.mjs';

export const istMydealzDeal = link => /^https:\/\/www\.mydealz\.de\/deals\//.test(String(link || ''));
export const threadId = link => (String(link || '').match(/-(\d{5,9})(?:[/?#]|$)/) || [])[1] || null;

/** Das JSON-Objekt nach `window.__INITIAL_STATE__ =` lesen (Klammern zählen, Zeichenketten beachten). */
export function initialState(html) {
  const s = String(html || '');
  const i = s.indexOf('window.__INITIAL_STATE__');
  if (i < 0) return null;
  const start = s.indexOf('{', i);
  if (start < 0) return null;
  let tiefe = 0, inText = false, esc = false;
  for (let k = start; k < s.length; k++) {
    const c = s[k];
    if (inText) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inText = false;
      continue;
    }
    if (c === '"') inText = true;
    else if (c === '{') tiefe++;
    else if (c === '}' && --tiefe === 0) {
      try { return JSON.parse(s.slice(start, k + 1)); } catch { return null; }
    }
  }
  return null;
}

const zeit = ts => (Number(ts) > 0 ? new Date(Number(ts) * 1000).toISOString() : null);
const zahl = v => (v == null || v === '' || !Number.isFinite(Number(v)) ? null : Number(v));

/**
 * Deal-Seite -> kurze Info oder null (nicht lesbar).
 * { id, titel, preis, vergleichspreis, versand, versandFrei, abgelaufen, vielleichtAbgelaufen, ende, start,
 *   veroeffentlicht, temperatur, haendler, lokal }
 */
export function leseDealSeite(html) {
  const td = initialState(html)?.threadDetail;
  if (!td || typeof td !== 'object' || td.threadId == null) return null;
  return {
    id: String(td.threadId),
    titel: td.title || '',
    preis: zahl(td.price),
    vergleichspreis: zahl(td.nextBestPrice),
    versand: zahl(td.shipping?.price),
    versandFrei: !!td.shipping?.isFree,
    abgelaufen: td.isExpired === true,
    vielleichtAbgelaufen: td.isMaybeExpired === true,
    ende: zeit(td.endDate?.timestamp),
    start: zeit(td.startDate?.timestamp),
    veroeffentlicht: zeit(td.publishedAt),
    temperatur: zahl(td.temperature) != null ? Math.round(Number(td.temperature)) : null,
    haendler: td.merchant?.merchantName || null,
    lokal: td.isLocal === true,
  };
}

/** "109° - Titel" (Hot-Feed) -> { titel: "Titel", temperatur: 109 } */
export function temperaturAusTitel(titel) {
  const m = String(titel || '').match(/^\s*(-?\d{1,5})\s*°\s*[-–]\s*/);
  return m ? { titel: String(titel).slice(m[0].length).trim(), temperatur: Number(m[1]) } : { titel: String(titel || ''), temperatur: null };
}

// Betrag: "96,99 €", "115 Eur", "9999€", "115,55" (Dezimalstellen reichen), "1.299,00"
const BETRAG = '(\\d{1,3}(?:\\.\\d{3})+(?:,\\d{1,2})?|\\d+,\\d{1,2}|\\d+(?:\\.\\d{1,2})?(?=\\s*(?:€|eur\\b|euro\\b)))\\s*(?:€|eur\\b|euro\\b)?';
// Reihenfolge = Vorrang. Nur Formulierungen, die in echten Feeds einen Altpreis meinen.
const ALTPREIS_MUSTER = [
  ['UVP laut Deal-Text', new RegExp(`(?:uvp|unverbindliche preisempfehlung)\\s*(?:von|liegt bei|:)?\\s*(?:ca\\.?\\s*)?${BETRAG}`, 'i')],
  ['Vergleichspreis laut Deal-Text', new RegExp(`(?:vergleichspreis|preisvergleich|pvg|vgp)(?:[^0-9€%]{0,25}?)(?:liegt\\s*)?(?:bei|ab|:)?\\s*(?:ca\\.?\\s*)?${BETRAG}`, 'i')],
  ['Normalpreis laut Deal-Text', new RegExp(`(?:normalerweise|regul(?:ä|ae)r|normalpreis)(?:[^0-9€%]{0,20}?)\\s*(?:ca\\.?\\s*)?${BETRAG}`, 'i')],
  ['Preis vorher laut Deal-Text', new RegExp(`(?:anstatt|statt)\\s*(?:der\\s*)?(?:ca\\.?\\s*)?${BETRAG}`, 'i')],
];
// Davor oder danach: dann ist der Betrag Versand, eine Gebühr oder ein anderer Zusammenhang
const KEIN_ALTPREIS_NACH = /^[^.!?]{0,25}(versand|vsk|porto|liefer|gebühr|gebuehr|anschluss|monat|mtl|pro jahr|im jahr|%)/i;

/** Altpreis aus Titel/Beschreibung – nur wenn größer als der jetzige Preis. -> { preis, quelle } | null */
export function altpreisAusText(text, jetztPreis = null) {
  const t = String(text || '').replace(/\s+/g, ' ');
  for (const [quelle, re] of ALTPREIS_MUSTER) {
    const g = new RegExp(re.source, 'gi');
    let m;
    while ((m = g.exec(t))) {
      const v = parsePrice(m[1]);
      const nach = t.slice(m.index + m[0].length);
      if (v == null || v <= 0 || KEIN_ALTPREIS_NACH.test(nach)) continue;
      if (jetztPreis != null && !(v > jetztPreis)) continue;
      return { preis: v, quelle };
    }
  }
  return null;
}

/** Preisangaben nach Datenvertrag: { preis, preisVorher, vorherQuelle, ersparnisEuro, ersparnisProzent } */
export function preisAngaben({ preis = null, preisVorher = null, vorherQuelle = null } = {}) {
  const p = zahl(preis), v = zahl(preisVorher);
  const ok = p != null && v != null && v > p;
  return {
    preis: p,
    preisVorher: ok ? v : null,
    vorherQuelle: ok ? vorherQuelle || null : null,
    ersparnisEuro: ok ? round(v - p, 2) : null,
    ersparnisProzent: ok ? Math.max(0, Math.min(100, Math.round((1 - p / v) * 100))) : null,
  };
}

/** "vorher 96,99 € → jetzt 23,99 € (−75 %)" bzw. ohne bekannten Altpreis "jetzt 165,00 € (Preis vorher unbekannt)" */
export function preisZeile(p) {
  if (p?.preis == null) return '';
  if (p.preisVorher != null) return `vorher ${euro(p.preisVorher)} → jetzt ${euro(p.preis)} (−${p.ersparnisProzent} %)`;
  return `jetzt ${euro(p.preis)} (Preis vorher unbekannt)`;
}

/** Steckt der Versand schon im Preis? (CAMELBAK: Titel „0,99€ + VSK“, price 6,98, shipping 5,99) */
export function versandImPreis(titel, info) {
  if (!info || !(info.versand > 0) || info.preis == null) return false;
  const tp = parsePrice((String(titel).match(/(\d+(?:[.,]\d{1,2})?)\s*€/) || [])[1]);
  return tp != null && Math.abs(tp + info.versand - info.preis) < 0.02;
}

/**
 * Prüft Deal-Seiten höflich: höchstens `max` Abrufe pro Lauf (alle Module zusammen), Ergebnis im Zustand
 * (zustand.dealSeiten, 7 Tage) gemerkt. Abgelaufene bleiben abgelaufen; laufende werden nach `neuNachStunden` neu geprüft.
 * pruefe(link) -> { status: 'ok'|'unlesbar'|'nichtGeprueft'|'keineSeite', info? }
 */
export function macheDealPruefer({ holeText, zustand = {}, jetzt = new Date(), max = 10, merkeTage = 7 } = {}) {
  const jetztMs = new Date(jetzt).getTime();
  const cache = (zustand.dealSeiten ||= {});
  for (const [k, v] of Object.entries(cache)) if (!(jetztMs - Date.parse(v?.t || 0) < merkeTage * 864e5)) delete cache[k];
  let abrufe = 0;
  const fehler = [];
  return {
    fehler,
    get abrufe() { return abrufe; },
    async pruefe(link, { neuNachStunden = 6 } = {}) {
      if (!istMydealzDeal(link)) return { status: 'keineSeite' };
      const key = threadId(link) || link;
      const c = cache[key];
      const alterH = c ? (jetztMs - Date.parse(c.t)) / 3600e3 : Infinity;
      // nicht lesbare Seiten nach 1 Stunde erneut versuchen
      if (c && (c.info?.abgelaufen || alterH < (c.info ? neuNachStunden : 1))) return { status: c.info ? 'ok' : 'unlesbar', info: c.info || null, ausCache: true };
      if (abrufe >= max) return c?.info ? { status: 'ok', info: c.info, ausCache: true, veraltet: true } : { status: 'nichtGeprueft' };
      abrufe++;
      let info = null;
      try { info = leseDealSeite(await holeText(link)); }
      catch (e) { fehler.push(`Deal-Seite ${key}: ${e.message}`); }
      cache[key] = { t: new Date(jetztMs).toISOString(), info };
      return info ? { status: 'ok', info } : { status: 'unlesbar' };
    },
  };
}

// Ein Prüfer pro Lauf (gleiches Zustand-Objekt = gleicher Lauf), damit das Abruf-Limit für alle Module gemeinsam gilt.
const PRUEFER = new WeakMap();
export function dealPruefer({ holeText, zustand, jetzt, max }) {
  if (!zustand || typeof zustand !== 'object') return macheDealPruefer({ holeText, jetzt, max });
  let p = PRUEFER.get(zustand);
  if (!p) { p = macheDealPruefer({ holeText, zustand, jetzt, max }); PRUEFER.set(zustand, p); }
  return p;
}
