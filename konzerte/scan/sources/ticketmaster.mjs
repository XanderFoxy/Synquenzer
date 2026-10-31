// Ticketmaster Discovery API v2 (kostenloser Schlüssel → Secret TM_KEY). Liefert Konzerte + Festivals mit Koordinaten.
import { geohash, istBand, erwaehnt } from '../lib.mjs';

const BASIS = 'https://app.ticketmaster.com/discovery/v2/events.json';

export function tmUrl(key, band, zuhause, radiusKm) {
  const p = new URLSearchParams({
    apikey: key, keyword: band.name, geoPoint: geohash(zuhause.lat, zuhause.lon, 7),
    radius: String(radiusKm), unit: 'km', classificationName: 'music', sort: 'date,asc', size: '100', locale: '*',
  });
  return `${BASIS}?${p}`;
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
