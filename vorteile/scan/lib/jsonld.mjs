// schema.org-Daten (JSON-LD) aus HTML-Seiten lesen – tolerant: @graph, ItemList, Arrays, kaputte Blöcke werden übersprungen.
// Für Veranstaltungs- und Gig-Seiten (z. B. gigmit-Stadtseiten), die ihre Termine maschinenlesbar einbetten.
import { entities, ohneTags } from './rss.mjs';

export function jsonldBloecke(html) {
  const out = [];
  for (const m of String(html || '').matchAll(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { out.push(JSON.parse(m[1].trim())); } catch { /* kaputter Block: weiter */ }
  }
  return out;
}

const TYPEN = /^(Event|MusicEvent|Festival|SocialEvent|EducationEvent|ExhibitionEvent|TheaterEvent|ComedyEvent|BusinessEvent|JobPosting)$/;
const istTyp = (o, re) => [].concat(o?.['@type'] || []).some(t => re.test(String(t)));

function sammle(o, out, tiefe = 0) {
  if (!o || typeof o !== 'object' || tiefe > 6) return;
  if (Array.isArray(o)) { for (const x of o) sammle(x, out, tiefe + 1); return; }
  if (istTyp(o, TYPEN)) out.push(o);
  for (const k of ['@graph', 'itemListElement', 'item', 'subEvent', 'event', 'events', 'mainEntity']) if (o[k]) sammle(o[k], out, tiefe + 1);
}

const text = v => entities(ohneTags(typeof v === 'string' ? v : v?.name ?? '')).trim();

/** Alle Veranstaltungen/Stellen einer Seite -> [{ typ, name, start, ende, url, ort, stadt, lat, lon, beschreibung, frist }] */
export function jsonldEvents(html, basisUrl = '') {
  const roh = [];
  for (const b of jsonldBloecke(html)) sammle(b, roh);
  return roh.map(o => {
    const loc = [].concat(o.location || o.jobLocation || [])[0] || {};
    const adr = loc.address || {};
    const geo = loc.geo || {};
    let url = typeof o.url === 'string' ? o.url : o['@id'] && /^https?:/.test(o['@id']) ? o['@id'] : '';
    if (url && basisUrl && !/^https?:/.test(url)) { try { url = new URL(url, basisUrl).toString(); } catch { url = ''; } }
    return {
      typ: [].concat(o['@type'])[0],
      name: text(o.name || o.title),
      start: o.startDate || o.datePosted || null,
      ende: o.endDate || null,
      frist: o.validThrough || o.applicationDeadline || null,
      url,
      ort: text(loc.name),
      stadt: text(typeof adr === 'string' ? adr : adr.addressLocality || ''),
      lat: geo.latitude != null ? Number(geo.latitude) : null,
      lon: geo.longitude != null ? Number(geo.longitude) : null,
      beschreibung: text(o.description || '').slice(0, 500),
    };
  }).filter(e => e.name);
}
