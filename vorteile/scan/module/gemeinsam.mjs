// Gemeinsame Bausteine der Scanner-Module: Feeds sammeln (fehlertolerant), Einträge bauen, Google-News-Suche.
import { leseRss } from '../lib/rss.mjs';
import { schluessel, alterTage } from '../lib/text.mjs';

export const googleNews = q => `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=de&gl=DE&ceid=DE:de`;
export const mydealzSuche = q => `https://www.mydealz.de/rss/search?q=${encodeURIComponent(q)}`;

/** Holt mehrere Feeds nacheinander; ein kaputter Feed landet in fehler, die anderen laufen weiter. */
export async function sammleFeeds(holeText, feeds, { jetzt = new Date(), maxAlterTage = 30 } = {}) {
  const items = [], fehler = [];
  for (const f of feeds) {
    try {
      const liste = leseRss(await holeText(f.url));
      for (const it of liste) {
        if (alterTage(it.datum, jetzt) > (f.maxAlterTage ?? maxAlterTage)) continue;
        items.push({ ...it, feed: f.name || f.url, feedInfo: f });
      }
    } catch (e) { fehler.push(`${f.name || f.url}: ${e.message}`); }
  }
  // gleicher Link oder gleicher Titel aus mehreren Feeds -> einmal
  const gesehen = new Set();
  return {
    items: items.filter(it => { const k = it.link || it.titel; const k2 = it.titel.toLowerCase().slice(0, 70); if (gesehen.has(k) || gesehen.has(k2)) return false; gesehen.add(k); gesehen.add(k2); return true; }),
    fehler,
  };
}

/** Einheitliches Eintragsformat für Seite und Push. */
export function eintrag(e) {
  if (!e.link) throw new Error('Eintrag ohne Link');
  return {
    id: e.id || schluessel(e.kategorie, e.link, e.titel.slice(0, 60)),
    kategorie: e.kategorie,
    titel: String(e.titel).slice(0, 160),
    zeile: e.zeile || '',
    soGehts: e.soGehts,
    link: e.link,
    quelle: e.quelle || '',
    wert: Math.max(0, Math.min(100, Math.round(e.wert ?? 50))),
    sofort: !!e.sofort,
    grund: e.grund || '',
    frist: e.frist || null,
    datum: Number.isFinite(Date.parse(e.datum || '')) ? new Date(e.datum).toISOString() : null,
    ...(e.extra ? { extra: e.extra } : {}),
  };
}

export const istRegional = (text, cfg) => cfg.region.some(o => new RegExp(`(^|[^\\p{L}])${o}(?![\\p{L}])`, 'iu').test(text));
