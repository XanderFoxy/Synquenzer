// kaufDA (Bonial) lesen: Next.js-Datenblock <script id="__NEXT_DATA__"> einer kaufDA-Seite -> Angebote.
// kaufdaZeit/grundpreisAus und der Lesekopf stammen aus schnaeppchen/scan/sources/kaufda.mjs (Schnäppchen-Wecker, 08.11.2026);
// kopiert statt importiert, weil der Workflow des Radars nur vorteile/ auscheckt (sparse-checkout). Änderungen dort hier
// nachziehen. Neu (16.11.2026, Wochen-Knaller): angeboteAus() sucht die Angebote tolerant überall in pageInformation – die
// Händlerseiten (/Geschaefte/<Händler>) sind noch nicht im Mitschnitt; bekannt ist nur offers.main/otherPublishers.items[] der
// Stichwort-Seiten (/Angebote/<Begriff>, Mitschnitte roh-daten 31.10./08.11.2026).
// Felder eines Angebots (type "OFFER"): publisherName, brand, title, description, prices.mainPrice, prices.secondaryPrice
// (0 = keiner), prices.secondaryPriceIsUVP (true = UVP, false = Streichpreis im Prospekt), prices.priceRange (ab-Preis),
// prices.conditions[].other („Nur mit App“, „ab 6 Dosen“), prices.priceByBaseUnit, validFrom/validUntil
// („2026-10-25T23:00:00.000+0000“), offerImages.url.thumbnail/normal/large (Ausschnitt aus dem Prospekt), categoryPaths.
// robots.txt (31.10.2026): /Angebote/, /Geschaefte/ und /<Händler>/Sortiment/ erlaubt, crawl-delay 2 (abruf.pauseMsJeHost).
// Ortsbezug (Roh-Lauf 43793492110, 16.11.2026): /Geschaefte/<Händler> zeigt immer den Standort Berlin 10178 (auch mit ?zip=
// oder ?lat=&lng=); /<Stadt>/<Händler>/p-r<Händler-id> (z. B. /Doebeln/Kaufland/p-r2801) zeigt die Prospekte der Stadt
// (eigene Prospekt-ids je Region) und die nächste Filiale. /<Stadt>/Angebote/<Begriff> und /<Stadt>/Geschaefte/... = 404.
// Vollständigkeit (Roh-Lauf 43818792502, 16.11.2026): die Orts-Händlerseite zeigt nur 16 Angebote (OfferGrid size 16) von
// offers.main.totalItems (Aldi Nord Döbeln 359, Lidl 1000, Kaufland 491, Netto 483, Penny 297), immer dieselben 16, ?page=2
// ändert nichts. /<Stadt>/Angebote/<Begriff> gibt es nur für wenige verlinkte Begriffe (Cola), sonst 404; /<Händler>/Sortiment/
// <Begriff> ebenso. Die bundesweite Stichwortseite /Angebote/<Begriff> listet je Begriff bis zu 16 Angebote aller Händler mit
// parentContent.id (Prospekt) – darüber kommt die Wochen-Knaller-Liste an die übrigen Angebote der Döbelner Prospekte.

const NEXT = /<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]+?)<\/script>/;

/** Stichwort/Händler für die kaufDA-Adresse: „Netto Marken-Discount“ -> „Netto-Marken-Discount“ */
export function kaufdaSlug(s) {
  return String(s || '').trim()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue').replace(/ß/g, 'ss')
    .replace(/['’]/g, '').replace(/&/g, ' ').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** ISO aus „2026-10-31T22:00:00.000+0000“ (oder null) */
export function kaufdaZeit(s) {
  if (!s) return null;
  const t = Date.parse(String(s).replace(/([+-]\d\d)(\d\d)$/, '$1:$2'));
  return Number.isFinite(t) ? new Date(t).toISOString() : null;
}

const istAngebot = x => !!x && typeof x === 'object' && !Array.isArray(x) && (x.type === 'OFFER' || (x.type == null && x.prices && typeof x.prices === 'object' && 'mainPrice' in x.prices));

/**
 * Alle Angebote einer Seite, egal wo sie in pageInformation stehen (offers.main.items, offers.otherPublishers.items oder
 * eine andere Liste auf der Händlerseite). Tiefe begrenzt, gleiche id nur einmal.
 */
export function angeboteAus(pi) {
  const out = [], gesehen = new Set();
  const lauf = (x, tiefe) => {
    if (!x || typeof x !== 'object' || tiefe > 7) return;
    if (Array.isArray(x)) {
      for (const y of x) {
        if (istAngebot(y)) { const k = y.id || JSON.stringify([y.publisherName, y.title, y.prices?.mainPrice]); if (!gesehen.has(k)) { gesehen.add(k); out.push(y); } }
        else lauf(y, tiefe + 1);
      }
      return;
    }
    for (const [k, v] of Object.entries(x)) if (k !== 'brochures' && k !== 'location') lauf(v, tiefe + 1);
  };
  // die bekannten Listen zuerst (Reihenfolge wie auf der Seite)
  lauf(pi?.offers?.main?.items, 0);
  lauf(pi?.offers?.otherPublishers?.items, 0);
  lauf(pi, 0);
  return out;
}

/**
 * Nächste Filiale auf einer Orts-Händlerseite (/<Stadt>/<Händler>/p-r<id>, Roh-Lauf 43793492110 vom 16.11.2026):
 * template.content.StoreInfobox = { header: "Nächste Filiale", storeInfo: { name, address, city: "04317 Leipzig" }, distance (km) }.
 * Fehlt sie -> null.
 */
export function filialeAus(pi) {
  const box = pi?.template?.content?.StoreInfobox;
  const si = box?.storeInfo;
  if (!si || typeof si !== 'object') return null;
  const km = typeof box.distance === 'number' && Number.isFinite(box.distance) ? Math.round(box.distance * 10) / 10 : null;
  const adresse = [si.address, si.city].filter(x => typeof x === 'string' && x.trim()).map(x => x.trim()).join(', ').slice(0, 80);
  return adresse || km != null ? { adresse, km } : null;
}

/**
 * Prospekte einer Orts-Händlerseite (Roh-Lauf 43818792502, 16.11.2026): brochures.viewer[] (der große Wochenprospekt) und
 * brochures.publisher[] (weitere Prospekte des Händlers: Extra-Angebote, „ab nächster Woche“ mit contentBadges valid_soon, …).
 * id = contentId – dieselbe id steht bei jedem Angebot in parentContent.id. Damit lässt sich ein Angebot einer bundesweiten
 * Stichwortseite (/Angebote/<Begriff>, Standort Berlin) eindeutig dem Prospekt für Döbeln zuordnen (gleiche id = gleicher
 * Prospekt; Aldi Nord Crunchips 16.11.2026: Seite 20 von 6c21c979…, dem Döbelner Wochenprospekt).
 */
export function prospekteAus(pi, felder = ['viewer', 'publisher']) {
  const out = [], gesehen = new Set();
  for (const k of felder) {
    for (const b of Array.isArray(pi?.brochures?.[k]) ? pi.brochures[k] : []) {
      const id = typeof b?.contentId === 'string' && b.contentId ? b.contentId : null;
      if (!id || gesehen.has(id)) continue;
      gesehen.add(id);
      out.push({
        id, titel: String(b.title || '').replace(/\s+/g, ' ').trim().slice(0, 60), verlag: String(b.publisher?.name || '').trim().slice(0, 40),
        ab: kaufdaZeit(b.validFrom), bis: kaufdaZeit(b.validUntil), seiten: Number.isInteger(b.pageCount) ? b.pageCount : null,
        bald: (Array.isArray(b.contentBadges) ? b.contentBadges : []).some(c => c?.name === 'valid_soon'),
      });
    }
  }
  return out;
}

/** Zahl aller Angebote laut Seite (offers.main.totalItems) – die Seite zeigt davon höchstens 16 (OfferGrid size 16) */
export function gesamtAus(pi) {
  const n = pi?.offers?.main?.totalItems;
  return Number.isInteger(n) && n >= 0 ? n : null;
}

/** HTML einer kaufDA-Seite -> { ort, plz, url, typ, filiale, items[], prospekte[], gesamt } (wirft, wenn der Datenblock fehlt oder kaputt ist) */
export function leseKaufdaSeite(html) {
  const m = String(html || '').match(NEXT);
  if (!m) throw new Error('kaufDA: Datenblock __NEXT_DATA__ fehlt (Seite geändert?)');
  let d;
  try { d = JSON.parse(m[1]); } catch { throw new Error('kaufDA: Datenblock __NEXT_DATA__ nicht lesbar'); }
  const pi = d?.props?.pageProps?.pageInformation || {};
  const loc = pi.location || {};
  return { ort: loc.cityDisplayName || loc.city || null, plz: loc.zip || null, url: typeof pi.url === 'string' ? pi.url : null, typ: typeof pi.type === 'string' ? pi.type : null, filiale: filialeAus(pi), items: angeboteAus(pi), prospekte: prospekteAus(pi), gesamt: gesamtAus(pi) };
}
