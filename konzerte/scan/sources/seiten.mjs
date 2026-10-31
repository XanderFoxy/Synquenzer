// Festival-/Venue-Seiten (config.seiten): Seite höflich laden, nach Bandnamen suchen.
// Ein Treffer = "Band im Programm erwähnt" (ohne genaues Datum) → Push mit Link zur Seite.
import { erwaehnt } from '../lib.mjs';

export function htmlZuText(html) {
  return String(html || '')
    .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ');
}

export function seiteTreffer(html, seite, bands) {
  const text = htmlZuText(html);
  return bands.filter(b => erwaehnt(text, b)).map(b => ({
    quelle: 'seite:' + seite.id, band: b.name, titel: seite.name, datum: '', zeit: '',
    ort: seite.name, stadt: seite.stadt, land: '', lat: seite.lat, lon: seite.lon,
    link: seite.url, festival: seite.art === 'festival', status: 'auf Seite erwähnt – Datum siehe Link',
  }));
}

export default async function seiten(ctx) {
  const konzerte = [], fehler = [], geprueft = [];
  for (const s of ctx.config.seiten || []) {
    try { konzerte.push(...seiteTreffer(await ctx.http.get(s.url, { json: false }), s, ctx.bands)); geprueft.push(s.id); }
    catch (e) { fehler.push(`${s.name}: ${e.message}`); }
  }
  return { konzerte, fehler, geprueft };
}
