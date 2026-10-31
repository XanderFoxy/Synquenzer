// Ticketmaster Discovery API v2 (kostenloser Schlüssel → Secret TM_KEY). Liefert Konzerte + Festivals mit Koordinaten.
import { geohash, istBand, erwaehnt, berlinIso } from '../lib.mjs';

const BASIS = 'https://app.ticketmaster.com/discovery/v2/events.json';

export function tmUrl(key, band, zuhause, radiusKm) {
  const p = new URLSearchParams({
    apikey: key, keyword: band.name, geoPoint: geohash(zuhause.lat, zuhause.lon, 7),
    radius: String(radiusKm), unit: 'km', classificationName: 'music', sort: 'date,asc', size: '100', locale: '*',
  });
  return `${BASIS}?${p}`;
}

const iso = v => (v && Number.isFinite(Date.parse(v)) ? new Date(v).toISOString() : null);

/** Vorverkäufe laut Ticketmaster (sales.presales[] + sales.public): [{ art, name, ab, bis }], nach Beginn sortiert. */
export function tmVorverkauf(sales) {
  const out = [];
  for (const p of sales?.presales || []) {
    if (!p) continue;
    out.push({ art: 'presale', name: p.name || 'Vorverkauf', ab: iso(p.startDateTime), bis: iso(p.endDateTime) });
  }
  const pub = sales?.public;
  if (pub && (pub.startDateTime || pub.endDateTime) && !pub.startTBD) out.push({ art: 'public', name: 'Allgemeiner Vorverkauf', ab: iso(pub.startDateTime), bis: iso(pub.endDateTime) });
  return out.filter(v => v.ab || v.bis).sort((a, b) => (a.ab || '').localeCompare(b.ab || ''));
}

export function tmParse(json, band) {
  const out = [];
  for (const ev of json?._embedded?.events || []) {
    const atts = ev._embedded?.attractions || [];
    const passt = atts.some(a => istBand(a.name, band)) || (!atts.length && erwaehnt(ev.name, band));
    if (!passt) continue;
    const v = ev._embedded?.venues?.[0] || {};
    const status = ev.dates?.status?.code || '';
    if (status === 'cancelled') continue;
    const segs = (ev.classifications || []).map(c => `${c.genre?.name || ''} ${c.subGenre?.name || ''} ${c.type?.name || ''}`).join(' ');
    out.push({
      quelle: 'ticketmaster', band: band.name, titel: ev.name,
      datum: ev.dates?.start?.localDate || '', zeit: (ev.dates?.start?.localTime || '').slice(0, 5),
      // vorbei nach dem (letzten) Konzerttag, Berliner Zeit
      bis: berlinIso(ev.dates?.end?.localDate || ev.dates?.start?.localDate || ''),
      vorverkauf: tmVorverkauf(ev.sales),
      ort: v.name || '', stadt: v.city?.name || '', land: v.country?.countryCode || '',
      lat: v.location ? Number(v.location.latitude) : null, lon: v.location ? Number(v.location.longitude) : null,
      link: ev.url || '', festival: atts.length > 1 || /festival/i.test(ev.name + ' ' + segs),
      status: status === 'rescheduled' ? 'verschoben' : status === 'postponed' ? 'verlegt' : '',
    });
  }
  return out;
}

export default async function ticketmaster(ctx) {
  const key = ctx.env.TM_KEY;
  if (!key) return { uebersprungen: 'kein TM_KEY gesetzt' };
  const konzerte = [], fehler = [];
  for (const band of ctx.bands) {
    try { konzerte.push(...tmParse(await ctx.http.get(tmUrl(key, band, ctx.config.zuhause, ctx.config.listenRadiusKm)), band)); }
    catch (e) { fehler.push(`${band.name}: ${e.message}`); }
  }
  return { konzerte, fehler };
}
