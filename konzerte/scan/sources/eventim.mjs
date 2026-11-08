// Eventim (ohne Schlüssel): die öffentliche Such-Schnittstelle, die eventim.de selbst für die Suche benutzt
// (public-api.eventim.com/websearch/search/api/exploration/v1/products – beschrieben u. a. von pyventim, openevent.codeberg.page).
// Liefert Termine mit Datum, Halle, Stadt und meist Koordinaten – auch weit weg (der Kern zeigt je Band den nächsten Termin).
// Undokumentiert -> tolerant gelesen (typeAttributes.liveEntertainment.{startDate, location} oder flache Felder).
// Höflich: ein Abruf je Band und Lauf (alle 3 Stunden), Abstand pro Host in run.mjs.
import { auftrittZuordnung } from '../lib.mjs';

const BASIS = 'https://public-api.eventim.com/websearch/search/api/exploration/v1/products';
export const evUrl = band => `${BASIS}?${new URLSearchParams({ webId: 'web__eventim-de', language: 'de', search_term: band.name, page: '1', top: '50', sort: 'DateAsc' })}`;
// Ausweich-Adresse (so fragt pyventim, kggx/pyventim explore_product_groups): Tourneen mit je bis zu 5 Terminen in
// productGroups[].products[] – gleiche Felder (typeAttributes.liveEntertainment.{startDate, location{…, geoLocation}}).
const BASIS_V2 = 'https://public-api.eventim.com/websearch/search/api/exploration/v2/productGroups';
export const evUrlV2 = band => `${BASIS_V2}?${new URLSearchParams({ search_term: band.name, page: '1', sort: 'DateAsc' })}`;

const tief = (o, ...pfade) => { for (const p of pfade) { const v = p.split('.').reduce((x, k) => x?.[k], o); if (v != null && v !== '') return v; } return null; };

export function evParse(json, band) {
  // v1/products: products[]; v2/productGroups: productGroups[].products[] (Gruppe ohne Termine -> Gruppe selbst)
  const gruppen = Array.isArray(json?.productGroups) ? json.productGroups.flatMap(g => (Array.isArray(g?.products) && g.products.length ? g.products : [g])) : null;
  const liste = json?.products || gruppen || json?.results || json?.items || [];
  const out = [];
  for (const p of Array.isArray(liste) ? liste : []) {
    const name = String(p.name || p.title || '');
    const atts = (p.attractions || p.artists || []).map(a => a?.name || a).filter(Boolean);
    // Zuordnung über die Künstlerangabe (exakter Name); ohne sie nur „Band …“ ohne Tribute-/Party-/Gast-Wörter (lib.mjs)
    const zuordnung = auftrittZuordnung(name, atts, band);
    if (!zuordnung) continue;
    const kat = (p.categories || []).map(c => String(c?.name || '')).join(' ');
    const le = p.typeAttributes?.liveEntertainment || p.liveEntertainment || {};
    const start = String(tief(le, 'startDate') || tief(p, 'startDate', 'date', 'eventDate') || '');
    if (!/^\d{4}-\d{2}-\d{2}/.test(start)) continue;
    const loc = le.location || p.location || p.venue || {};
    const geo = loc.geoLocation || loc.geo || loc.coordinates || {};
    // fehlende Koordinaten bleiben null (Number(null) wäre 0 -> „6000 km“); run.mjs sucht dann Stadt bzw. PLZ
    const zahl = v => (v == null || v === '' ? NaN : Number(v));
    const lat = zahl(geo.latitude ?? geo.lat), lon = zahl(geo.longitude ?? geo.lon ?? geo.lng);
    const status = String(p.status || '').toLowerCase();
    if (/cancel|abgesagt/.test(status)) continue;
    out.push({
      quelle: 'eventim', band: band.name, titel: name,
      datum: start.slice(0, 10), zeit: /T\d{2}:\d{2}/.test(start) ? start.slice(11, 16) : '',
      ort: loc.name || '', stadt: loc.city || loc.cityName || '', land: loc.countryCode || loc.country || '', plz: String(loc.postalCode || loc.zipCode || ''),
      lat: Number.isFinite(lat) ? lat : null, lon: Number.isFinite(lon) ? lon : null,
      // mehrere Künstler (z. B. „Mega 80er Usedom – mit Dieter Bohlen, Kim Wilde und Alphaville“) = Festival
      link: p.link || p.url || '', festival: /festival/i.test(`${name} ${kat}`) || atts.length > 2,
      status: /postpon|verleg|verschob/.test(status) ? 'verlegt' : '', zuordnung,
    });
  }
  return out.filter(k => /^https?:/.test(k.link));
}

export default async function eventim(ctx) {
  if (ctx.config.eventim === false) return { uebersprungen: 'in config aus' };
  const konzerte = [], fehler = [];
  let v1tot = false; // v1/products antwortet mit 4xx -> in diesem Lauf gleich v2/productGroups
  for (const band of ctx.bands) {
    try {
      let j = null;
      if (!v1tot) {
        try { j = await ctx.http.get(evUrl(band)); }
        catch (e) { if (/HTTP 4\d\d/.test(String(e.message))) v1tot = true; else throw e; }
      }
      if (j == null) j = await ctx.http.get(evUrlV2(band));
      konzerte.push(...evParse(j, band));
    } catch (e) { fehler.push(`${band.name}: ${e.message}`); }
  }
  return { konzerte, fehler };
}
