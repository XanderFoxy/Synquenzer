// Keepa (Amazon price history). Only with the Actions secret KEEPA_KEY and ASINs in watchlist.json ("asins": [...]).
// Prices from Keepa are in cents, -1 = not available. Index 0 = Amazon itself, 1 = new (3rd party), 18 = buy box incl. shipping.

const preis = c => (typeof c === 'number' && c > 0 ? c / 100 : null);
const statWert = (arr, i) => {
  const v = arr?.[i];
  return Array.isArray(v) ? preis(v[1]) : preis(v);
};

export function keepaAngebot(p) {
  const s = p.stats || {};
  const buybox = statWert(s.current, 18);
  const amazon = statWert(s.current, 0);
  const neu = statWert(s.current, 1);
  const aktuell = buybox ?? amazon ?? neu;
  if (!aktuell) return null;
  return {
    quelle: 'keepa',
    shop: 'Amazon',
    asin: p.asin,
    titel: p.title || p.asin,
    beschreibung: p.numberOfItems > 1 ? `${p.numberOfItems} Stück` : '',
    preis: aktuell,
    versand: buybox != null ? 0 : null, // buy box price already contains shipping
    preisAlt: statWert(s.avg180, 0) ?? statWert(s.avg90, 0),
    tiefstAmazon: statWert(s.min, 0),
    link: `https://www.amazon.de/dp/${p.asin}`,
    bild: '',
    gueltigBis: null,
    online: true,
  };
}

export async function keepa({ holeText, cfg, watchlist, env }) {
  const asins = [...new Set(watchlist.produkte.flatMap(p => p.asins || []))];
  if (!env.KEEPA_KEY) return { angebote: [], fehler: [], hinweis: 'kein KEEPA_KEY gesetzt – übersprungen' };
  if (!asins.length) return { angebote: [], fehler: [], hinweis: 'keine ASINs in watchlist.json – übersprungen' };
  const q = cfg.quellen.keepa;
  const angebote = [];
  for (let i = 0; i < asins.length; i += 20) {
    const teil = asins.slice(i, i + 20).join(',');
    const json = JSON.parse(await holeText(`${q.api}?key=${encodeURIComponent(env.KEEPA_KEY)}&domain=${q.domain}&asin=${teil}&stats=180`));
    if (json.error) throw new Error(`Keepa: ${json.error.message || json.error.type || 'Fehler'}`);
    for (const p of json.products || []) { const a = keepaAngebot(p); if (a) angebote.push(a); }
  }
  return { angebote, fehler: [] };
}
