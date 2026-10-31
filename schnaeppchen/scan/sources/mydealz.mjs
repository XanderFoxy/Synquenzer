// mydealz.de RSS feeds (new, hot, "Preisfehler" group, optional keyword search). Online deals incl. Amazon.
import { leseRss } from '../rss.mjs';
import { parsePrice } from '../text.mjs';

export function mydealzAngebot(it, feed) {
  const preis = parsePrice(it.preisText) ?? parsePrice((it.titel.match(/(\d[\d.,]*)\s?€/) || [])[1]);
  return {
    quelle: 'mydealz',
    shop: it.shop || 'Online',
    titel: it.titel,
    beschreibung: it.beschreibung,
    preis,
    preisAlt: null,
    link: it.link,
    bild: it.bild,
    gueltigBis: null,
    datum: it.datum,
    online: true,
    versand: null,
    preisfehlerFeed: !!feed.preisfehler,
  };
}

export async function mydealz({ holeText, cfg, watchlist }) {
  const q = cfg.quellen.mydealz;
  const feeds = [...q.feeds];
  if (q.suchFeed) {
    for (const s of new Set(watchlist.produkte.flatMap(p => p.suche || [])))
      feeds.push({ name: `mydealz Suche ${s}`, url: q.suchFeed.replace('{q}', encodeURIComponent(s)), optional: true });
  }
  const angebote = [], fehler = [], gesehen = new Set();
  let ok = 0;
  for (const f of feeds) {
    try {
      const items = leseRss(await holeText(f.url, { headers: { accept: 'application/rss+xml, application/xml, text/xml' } }));
      ok++;
      for (const it of items) {
        if (gesehen.has(it.link)) { if (f.preisfehler) angebote.find(a => a.link === it.link).preisfehlerFeed = true; continue; }
        gesehen.add(it.link);
        angebote.push(mydealzAngebot(it, f));
      }
    } catch (e) { if (!f.optional) fehler.push(`${f.name}: ${e.message}`); }
  }
  if (!ok) throw new Error(fehler[0] || 'kein Feed erreichbar');
  return { angebote, fehler };
}
