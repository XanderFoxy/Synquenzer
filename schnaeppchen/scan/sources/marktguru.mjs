// marktguru.de: brochure offers of the shops around the postcode (Kaufland, Lidl, Aldi, Netto, Penny, Rewe, Edeka ...).
// The public web app reads its API keys from the start page; we do the same, once per run, and search each product once.

export async function marktguruKeys(holeText, cfg, env = {}) {
  if (env.MARKTGURU_API_KEY && env.MARKTGURU_CLIENT_KEY) return { apiKey: env.MARKTGURU_API_KEY, clientKey: env.MARKTGURU_CLIENT_KEY };
  const html = await holeText(cfg.quellen.marktguru.startseite);
  const api = html.match(/"apiKey"\s*:\s*"([^"]+)"/);
  const client = html.match(/"clientKey"\s*:\s*"([^"]+)"/);
  if (!api || !client) throw new Error('marktguru: API-Schlüssel auf der Startseite nicht gefunden (Seite geändert?)');
  return { apiKey: api[1], clientKey: client[1] };
}

// Packungsgröße aus den Feldern der Quelle: volume ist die Packung in kg bzw. l (quantity ist immer 1 = eine Packung).
// Gegenprobe: Preis ÷ Grundpreis (referencePrice, € pro kg/l) muss dieselbe Menge ergeben (±3 %).
// Fehlt volume, gilt Preis ÷ Grundpreis allein. Widersprechen sich beide, gibt es keine Packung aus den Feldern.
// Widersprechen sich volume und Preis ÷ Grundpreis, ist eins davon falsch -> packWiderspruch (Menge gilt als unsicher).
export function packWiderspruch(r) {
  const v = typeof r.volume === 'number' && r.volume > 0 ? r.volume : null;
  const g = r.price > 0 && r.referencePrice > 0 ? r.price / r.referencePrice : null;
  return !!(v && g && Math.abs(g - v) / v > 0.03 && /^(kg|kilogramm|l|liter)$/i.test(String(r.unit?.shortName || r.unit?.name || '')));
}

export function packungAusFeldern(r) {
  const einheit = String(r.unit?.shortName || r.unit?.name || '').toLowerCase();
  const faktor = einheit === 'kg' || einheit === 'kilogramm' ? 'gramm' : (einheit === 'l' || einheit === 'liter') ? 'ml' : null;
  if (!faktor) return null;
  const volume = typeof r.volume === 'number' && r.volume > 0 ? r.volume : null;
  const ausGrundpreis = typeof r.price === 'number' && r.price > 0 && typeof r.referencePrice === 'number' && r.referencePrice > 0
    ? r.price / r.referencePrice : null;
  let menge = null;
  if (volume && ausGrundpreis) menge = Math.abs(ausGrundpreis - volume) / volume <= 0.03 ? volume : null;
  else menge = volume ?? ausGrundpreis;
  return menge ? { [faktor]: Math.round(menge * 1000) } : null;
}

export function marktguruAngebot(r) {
  const shop = r.advertisers?.[0]?.name || r.advertiser?.name || '';
  const marke = r.brand?.name || '';
  const produkt = r.product?.name || '';
  const titel = (produkt && marke && produkt.toLowerCase().includes(marke.toLowerCase()) ? produkt : [marke, produkt].filter(Boolean).join(' ')).trim() || r.description || '';
  const gueltig = (r.validityDates || [])[0] || {};
  const einheit = r.unit?.shortName || r.unit?.name || '';
  return {
    quelle: 'marktguru',
    shop,
    titel,
    // nur der Text des Prospekts – keine angehängten Zahlen (früher "0.375 1 kg" -> falsche Packung 1 kg)
    beschreibung: r.description || '',
    preis: typeof r.price === 'number' ? r.price : null,
    preisAlt: typeof r.oldPrice === 'number' && r.oldPrice > 0 ? r.oldPrice : null,
    refPreis: typeof r.referencePrice === 'number' && r.referencePrice > 0 ? { preis: r.referencePrice, einheit } : null,
    packMenge: packungAusFeldern(r),
    packWiderspruch: packWiderspruch(r),
    mehrereSorten: !!r.isMultiProduct,
    gueltigAb: gueltig.from || null,
    gueltigBis: gueltig.to || null,
    link: r.id ? `https://www.marktguru.de/offers/${r.id}` : 'https://www.marktguru.de/',
    bild: r.id ? `https://mg2de.b-cdn.net/api/v1/offers/${r.id}/images/default/0/medium.webp` : '',
    online: false,
    versand: 0,
  };
}

export async function marktguru({ holeText, cfg, watchlist, env }) {
  const q = cfg.quellen.marktguru;
  const keys = await marktguruKeys(holeText, cfg, env);
  const suchen = [...new Set(watchlist.produkte.flatMap(p => p.suche || []))];
  const angebote = [], fehler = [];
  // Breite Suchwörter (Marke: „Haribo“, „Exquisa“) können mehr als eine Seite Treffer haben -> weitere Seiten
  // (offset), höchstens q.seiten (Standard 3). Gleiche Angebote (id) aus mehreren Suchen zählen einmal.
  const maxSeiten = Math.max(1, q.seiten ?? 3);
  const gesehen = new Set();
  for (const s of suchen) {
    try {
      for (let seite = 0, offset = 0; seite < maxSeiten; seite++) {
        const url = `${q.api}?as=web&limit=${q.limit}&offset=${offset}&q=${encodeURIComponent(s)}&zipCode=${cfg.plz}`;
        const json = JSON.parse(await holeText(url, { headers: { 'x-apikey': keys.apiKey, 'x-clientkey': keys.clientKey, accept: 'application/json' } }));
        const res = json.results || [];
        for (const r of res) {
          if (r.id != null && gesehen.has(r.id)) continue;
          if (r.id != null) gesehen.add(r.id);
          angebote.push(marktguruAngebot(r));
        }
        offset += res.length;
        if (!res.length || res.length < q.limit || !(json.totalResults > offset)) break;
      }
    } catch (e) { fehler.push(`Suche „${s}“: ${e.message}`); }
  }
  if (fehler.length === suchen.length && suchen.length) throw new Error(fehler[0]);
  return { angebote, fehler };
}
