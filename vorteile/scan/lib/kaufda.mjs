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

/** HTML einer kaufDA-Seite -> { ort, plz, url, items[] } (wirft, wenn der Datenblock fehlt oder kaputt ist) */
export function leseKaufdaSeite(html) {
  const m = String(html || '').match(NEXT);
  if (!m) throw new Error('kaufDA: Datenblock __NEXT_DATA__ fehlt (Seite geändert?)');
  let d;
  try { d = JSON.parse(m[1]); } catch { throw new Error('kaufDA: Datenblock __NEXT_DATA__ nicht lesbar'); }
  const pi = d?.props?.pageProps?.pageInformation || {};
  const loc = pi.location || {};
  return { ort: loc.cityDisplayName || loc.city || null, plz: loc.zip || null, url: typeof pi.url === 'string' ? pi.url : null, items: angeboteAus(pi) };
}
