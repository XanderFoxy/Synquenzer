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
    beschreibung: [r.description, r.volume ? `${r.volume}` : '', einheit && r.quantity ? `${r.quantity} ${einheit}` : ''].filter(Boolean).join(' '),
    preis: typeof r.price === 'number' ? r.price : null,
    preisAlt: typeof r.oldPrice === 'number' && r.oldPrice > 0 ? r.oldPrice : null,
    refPreis: typeof r.referencePrice === 'number' && r.referencePrice > 0 ? { preis: r.referencePrice, einheit } : null,
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
  for (const s of suchen) {
    const url = `${q.api}?as=web&limit=${q.limit}&offset=0&q=${encodeURIComponent(s)}&zipCode=${cfg.plz}`;
    try {
      const json = JSON.parse(await holeText(url, { headers: { 'x-apikey': keys.apiKey, 'x-clientkey': keys.clientKey, accept: 'application/json' } }));
      for (const r of json.results || []) angebote.push(marktguruAngebot(r));
    } catch (e) { fehler.push(`Suche „${s}“: ${e.message}`); }
  }
  if (fehler.length === suchen.length && suchen.length) throw new Error(fehler[0]);
  return { angebote, fehler };
}
