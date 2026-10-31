// Modul "praemien": Prämien & Freunde werben – Werbeprämien, Kontowechsel-/Neukundenprämien, Cashback, Wechselbonus
// (Strom/Gas/Handy), Payback-/Coupon-Extrapunkte, Gratis-Produkte, Geld-zurück-Aktionen, App-Startprämien.
// Pro Eintrag: Prämie (€), Kosten, Netto, Aufwand (Minuten), Haken. Sortiert nach Netto pro Aufwand (€/Stunde).
// Quellen: öffentliche mydealz-RSS (ohne Login) + gepflegte Programm-Liste in config.json. Unseriöses fliegt strikt raus.
import { enthaelt, parsePrice, altpreisAus, euro, round } from '../lib/text.mjs';
import { sammleFeeds, eintrag, mydealzSuche } from './gemeinsam.mjs';

const ART_NAME = {
  konto: 'Konto-/Neukundenprämie', energie: 'Strom-/Gas-Wechselbonus', handy: 'Handy-Wechselbonus', freunde: 'Freunde werben',
  gzg: 'Geld zurück', cashback: 'Cashback', punkte: 'Extrapunkte/Coupons', app: 'App-Startprämie', gratis: 'Gratis-Produkt',
};

/** Welche Art von Prämie? Reihenfolge = Vorrang. */
export function artAus(text, m) {
  for (const [art, woerter] of Object.entries(m.artWoerter)) if (enthaelt(text, woerter)) return art;
  return null;
}

/** Strikter Ausschluss: Schneeball/MLM, Krypto/Trading, Glücksspiel, Abo-Fallen, Vorkasse, fremde Daten, Umfrage-Seiten, Kredite. */
export function ausschlussGrund(text, m) {
  for (const [grund, woerter] of Object.entries(m.ausschluss)) if (enthaelt(text, woerter)) return grund;
  // Depot/Broker-"Bonus" nur mit Einzahlungspflicht -> raus
  if (enthaelt(text, ['depot|broker|wertpapier|aktie|etf']) && enthaelt(text, ['einzahl|mindesteinlage|sparplan|order'])) return 'trading';
  return null;
}

const zahl = s => parsePrice(s);
const BETRAG = /(\d{1,3}(?:\.\d{3})+|\d{1,4})(?:,(\d{1,2}))?\s*(?:€|euro\b|eur\b)/gi;
const BEDINGUNG_VOR = /(mindest|geldeingang|gehaltseingang|einzahl|umsatz|bestellwert|mbw|ab\s*$|kauf\s*ab|gebühr|gebuehr|kosten|grundgebühr|grundgebuehr|preis|statt|uvp|nur\s*$|für\s*$|fuer\s*$|von\s*$|monatlich|zahlst|zahlen)/i;
const PRAEMIE_NAH = /(prämie|praemie|bonus|startguthaben|guthaben|cashback|gutschrift|geschenkt|gutschein|zurück|zurueck|belohnung|willkommens|erstattung|erstattet|startprämie|werbeprämie|extra)/i;

/** Höchste Prämie in € aus dem Text (Bedingungen wie „Geldeingang von 1.000 €“ zählen nicht). bisZu = nur „bis zu“. */
export function praemieAus(text) {
  const t = String(text || '');
  let best = null, bisZu = false;
  for (const mm of t.matchAll(BETRAG)) {
    const v = zahl(mm[0]);
    if (!v || v > 2000) continue;
    const vor = t.slice(Math.max(0, mm.index - 28), mm.index);
    const nach = t.slice(mm.index + mm[0].length, mm.index + mm[0].length + 28);
    const vorKurz = vor.slice(-16);
    if (/\/\s*monat|pro\s*monat|im\s*monat|mtl/i.test(nach.slice(0, 12))) continue; // Monatsgebühr
    if (BEDINGUNG_VOR.test(vorKurz) && !PRAEMIE_NAH.test(vorKurz)) continue;
    if (!PRAEMIE_NAH.test(vor) && !PRAEMIE_NAH.test(nach)) continue;
    if (best == null || v > best) { best = v; bisZu = /bis\s*zu\s*$/i.test(vor.trim()); }
  }
  // Punkte: 1 Punkt = 1 Cent (Payback, DeutschlandCard)
  const p = t.match(/(\d{1,3}(?:\.\d{3})+|\d{2,6})\s*(?:extra[-\s]?)?(?:payback[-\s]?)?(?:punkte|°p|°)/i);
  if (p) { const v = zahl(p[1]) / 100; if (v > 0 && v <= 200 && (best == null || v > best)) { best = round(v); bisZu = false; } }
  return { praemie: best, bisZu };
}

/** Wert eines Gratis-Produkts: „im Wert von 12 €“, „UVP 9,99“, sonst Standardwert. */
export function warenwertAus(text, preisText, standard) {
  const w = String(text || '').match(/(?:im\s*wert\s*von|wert[:\s]*|gegenwert\s*von)\s*(?:ca\.?\s*)?(\d[\d.]*(?:,\d{1,2})?)\s*(?:€|euro)/i);
  if (w) return zahl(w[1]);
  const alt = altpreisAus(text);
  if (alt) return alt;
  return standard;
}

/** Kosten und Haken aus dem Text. */
export function hakenAus(text, art, m) {
  const t = String(text || '');
  const haken = [];
  let kosten = 0;
  const laufzeitM = t.match(/(?:mindest)?(?:vertrags)?laufzeit[^0-9]{0,20}(\d{1,2})\s*monat/i) || t.match(/(\d{1,2})\s*monate?\s*(?:mindest)?laufzeit/i);
  const laufzeit = laufzeitM ? Number(laufzeitM[1]) : null;
  const gebuehrM = t.match(/(\d{1,3}(?:,\d{1,2})?)\s*(?:€|euro)\s*(?:\/|pro|im|je)\s*monat/i)
    || t.match(/(?:kontoführung|kontofuehrung|grundgebühr|grundgebuehr|monatlich)[^0-9]{0,15}(\d{1,3}(?:,\d{1,2})?)\s*(?:€|euro)/i);
  const gebuehr = gebuehrM ? zahl(gebuehrM[1]) : 0;
  // Strom/Gas brauchst du sowieso – die Abschläge sind keine Zusatzkosten. Sonst: Gebühr × Laufzeit (oder 6 Monate halten).
  if (gebuehr > 0 && art !== 'energie') {
    const monate = laufzeit || m.haltenMonate || 6;
    kosten += gebuehr * monate;
    haken.push(`${euro(gebuehr)}/Monat Gebühr (${monate} Monate = ${euro(round(gebuehr * monate))})`);
  }
  const einmal = t.match(/(?:anschlussgebühr|anschlussgebuehr|bereitstellungs\w*|aktivierungsgebühr|aktivierungsgebuehr|versand(?:kosten)?)[^0-9]{0,12}(\d{1,3}(?:,\d{1,2})?)\s*(?:€|euro)/i);
  if (einmal) { const v = zahl(einmal[1]); if (v > 0) { kosten += v; haken.push(`einmalig ${euro(v)} (${einmal[0].split(/\s/)[0]})`); } }
  if (/mindestumsatz|kartenumsatz|kartenumsätze|kartenumsaetze|transaktionen|kartenzahlungen/i.test(t)) haken.push('Mindestumsatz/Kartenzahlungen nötig');
  const eingang = t.match(/(?:geldeingang|gehaltseingang|zahlungseingang)[^0-9]{0,20}(\d{1,3}(?:\.\d{3})*|\d+)\s*(?:€|euro)/i);
  if (eingang) haken.push(`Geldeingang ${euro(zahl(eingang[1]))} nötig (dein eigenes Geld)`);
  else if (/geldeingang|gehaltseingang/i.test(t)) haken.push('Geldeingang nötig (dein eigenes Geld)');
  if (laufzeit) haken.push(`Laufzeit ${laufzeit} Monate`);
  if (/kündig|kuendig/i.test(t) || laufzeit || art === 'energie' || art === 'handy') haken.push('rechtzeitig kündigen (Erinnerung setzen)');
  if (/schufa|bonität|bonitaet/i.test(t) || art === 'konto' || /kreditkarte/i.test(t)) haken.push('Schufa-Abfrage');
  if (/neukunde/i.test(t)) haken.push('nur Neukunden');
  if (/kassenbon|kassenzettel|beleg hochladen/i.test(t) || art === 'gzg') haken.push('erst zahlen, Kassenbon hochladen, Geld kommt nach Wochen');
  if (art === 'cashback') haken.push('lohnt nur, wenn du das sowieso kaufst');
  return { kosten: round(kosten), haken: [...new Set(haken)], laufzeit };
}

/** Bewertung: € pro Stunde Aufwand -> 0–100. */
export function wertAus(netto, minuten) {
  const proStunde = netto / (Math.max(1, minuten) / 60);
  return { proStunde: round(proStunde, 0), wert: Math.max(0, Math.min(100, Math.round(15 + 22 * Math.log10(1 + Math.max(0, proStunde))))) };
}

/** Ein Text (Feed-Eintrag) -> Bewertung oder null. */
export function bewertePraemie(text, m, { preisText = '' } = {}) {
  if (ausschlussGrund(text, m)) return null;
  const art = artAus(text, m);
  if (!art) return null;
  let { praemie, bisZu } = praemieAus(text);
  let gratis = false;
  if (art === 'gratis' || art === 'gzg') {
    const preis = zahl(preisText);
    if (art === 'gratis' && preis != null && preis > 0) return null; // nicht gratis
    if (praemie == null) { praemie = warenwertAus(text, preisText, art === 'gratis' ? m.gratisStandardWert : null); gratis = art === 'gratis'; }
  }
  if (!praemie) return null;
  if (bisZu) praemie = round(praemie * (m.bisZuFaktor ?? 0.5));
  const { kosten, haken, laufzeit } = hakenAus(text, art, m);
  if (bisZu) haken.unshift('nur „bis zu“ – meist gibt es weniger');
  const netto = round(praemie - kosten);
  if (netto < (m.minNetto ?? 3)) return null;
  const minuten = (m.aufwandMin[art] ?? 15) + (haken.some(h => /kündigen/.test(h)) ? 5 : 0);
  const { proStunde, wert } = wertAus(netto, minuten);
  const ohneHaken = !haken.length;
  const sofort = netto >= m.sofortAbNetto || (gratis && ohneHaken && praemie >= (m.gratisSofortAbWert ?? 10));
  return { art, praemie, kosten, netto, minuten, haken, laufzeit, proStunde, wert, gratis, sofort, lohnt: netto >= (m.lohntAbNetto ?? 10) ? 'ja' : 'knapp' };
}

function zeileAus(b) {
  return [
    ART_NAME[b.art],
    `Prämie ${euro(b.praemie)}${b.kosten ? ` − Kosten ${euro(b.kosten)}` : ''} = netto ${euro(b.netto)}`,
    `ca. ${b.minuten} Min.`,
    `≈ ${Math.round(b.proStunde)} €/Std.`,
    b.lohnt === 'ja' ? 'lohnt sich' : 'lohnt sich nur knapp',
  ].join(' · ');
}

const SO_GEHTS = {
  konto: 'Bedingungen auf der Bankseite lesen (Geldeingang, Kartenzahlungen, Frist für die Prämie). Konto eröffnen, Bedingungen erfüllen, Prämie abwarten – danach kostenloses Konto behalten oder kündigen.',
  energie: 'Im Vergleichsrechner den Gesamtpreis im ersten Jahr inkl. Bonus prüfen. Wechseln (neuer Anbieter kündigt den alten). Erinnerung für die Kündigung nach 11 Monaten setzen.',
  handy: 'Gesamtkosten über die Laufzeit gegen deinen jetzigen Tarif rechnen. Nur wechseln, wenn es netto günstiger ist. Kündigungstermin notieren.',
  freunde: 'Nur teilen, wenn die Person wirklich wechseln will. Eigenen Werbe-Link aus dem Kundenkonto kopieren. Nie Daten anderer selbst eintragen.',
  gzg: 'Aktionsprodukt kaufen, Kassenbon fotografieren und auf der Hersteller-Seite hochladen (eigene IBAN). Teilnahmefrist beachten.',
  cashback: 'Nur nutzen, wenn du das sowieso kaufst. Vorher im Cashback-Portal/App aktivieren, dann über den Link kaufen.',
  punkte: 'Coupon in der App aktivieren und beim nächsten normalen Einkauf Karte/App vorzeigen.',
  app: 'App aus dem offiziellen Store laden, Bedingungen lesen, Startguthaben nutzen. Keine Kreditkarte für „Probe-Abos“ hinterlegen.',
  gratis: 'Link öffnen, beim Hersteller bestellen bzw. abholen. Nie Kontodaten angeben, kein Abo, keine Versandkosten.',
};

/** Feste Programme aus config.json (Richtwerte, Bedingungen gepflegt). */
export function programmEintraege(m) {
  const out = [];
  for (const p of m.programme || []) {
    if (p.aktiv === false || !p.link) continue;
    const netto = round((p.praemie || 0) - (p.kosten || 0));
    if (netto <= 0) continue;
    const { proStunde, wert } = wertAus(netto, p.aufwandMin || 15);
    const b = { art: p.art, praemie: p.praemie, kosten: p.kosten || 0, netto, minuten: p.aufwandMin || 15, proStunde, lohnt: netto >= (m.lohntAbNetto ?? 10) ? 'ja' : 'knapp' };
    out.push(eintrag({
      id: `praemie-programm-${p.id || p.name}`,
      kategorie: 'praemien', titel: p.name, quelle: 'gepflegte Liste', link: p.link,
      zeile: zeileAus(b) + (p.richtwert ? ` · Richtwert${p.einheit ? ' ' + p.einheit : ''}` : ''),
      soGehts: p.soGehts || SO_GEHTS[p.art] || 'Bedingungen auf der Seite lesen.',
      wert, sofort: false, grund: `programm:${p.art}`,
      extra: { art: p.art, praemie: p.praemie, kosten: b.kosten, netto, aufwandMin: b.minuten, proStunde, haken: p.haken || [], lohnt: b.lohnt, sortWert: proStunde, richtwert: !!p.richtwert },
    }));
  }
  return out;
}

export default async function praemien({ holeText, cfg, jetzt }) {
  const m = cfg.module.praemien;
  const feeds = [...m.feeds, ...(m.suchen || []).map(q => ({ name: `mydealz „${q}“`, url: mydealzSuche(q), maxAlterTage: m.maxAlterTage ?? 14 }))];
  const { items, fehler } = await sammleFeeds(holeText, feeds, { jetzt });
  const eintraege = programmEintraege(m);
  const kandidaten = [];
  for (const it of items) {
    if (it.temperatur != null && it.temperatur < (m.minTemperatur ?? -1e9)) continue; // von der Community abgestraft
    const text = `${it.titel} ${it.beschreibung}`;
    const b = bewertePraemie(text, m, { preisText: it.preisText });
    if (!b) continue;
    kandidaten.push(eintrag({
      kategorie: 'praemien', titel: it.titel, quelle: it.shop ? `${it.shop} via ${it.feed}` : it.feed, link: it.link, datum: it.datum,
      zeile: zeileAus(b), soGehts: SO_GEHTS[b.art], wert: b.wert, sofort: b.sofort, grund: b.art,
      extra: { art: b.art, praemie: b.praemie, kosten: b.kosten, netto: b.netto, aufwandMin: b.minuten, proStunde: b.proStunde, haken: b.haken, lohnt: b.lohnt, sortWert: b.proStunde },
    }));
  }
  // keine Push-Flut: pro Lauf höchstens maxSofortProLauf Sofort-Kandidaten (die mit dem höchsten Netto)
  kandidaten.filter(e => e.sofort).sort((a, b) => b.extra.netto - a.extra.netto)
    .forEach((e, i) => { if (i >= (m.maxSofortProLauf ?? 1)) e.sofort = false; });
  eintraege.push(...kandidaten);
  eintraege.sort((a, b) => b.extra.sortWert - a.extra.sortWert);
  return { eintraege, fehler };
}
