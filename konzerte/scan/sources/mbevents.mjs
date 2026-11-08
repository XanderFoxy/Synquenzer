// MusicBrainz-Veranstaltungen (ohne Schlüssel): Termine der Band als „event“ (Konzerte, Festivals), Ort über die
// „held at“-Beziehung (Halle mit Koordinaten) bzw. „held in“ (Stadt). Lückenhaft, aber offen und weltweit – trägt mit,
// wenn Ticketmaster (Schlüssel fehlt) und Eventim nichts liefern. Läuft nach „musicbrainz“ (nutzt dessen Künstler-IDs).
// Höflich: 1 Browse je Band + höchstens maxLookups Detail-Abrufe je Band (MusicBrainz: 1 Anfrage/Sekunde, in run.mjs).
import { berlinIso } from '../lib.mjs';

const WS = 'https://musicbrainz.org/ws/2';

/** Browse-Antwort -> kommende, nicht abgesagte Termine [{ id, name, datum, zeit, typ }] (früheste zuerst) */
export function mbEvents(json, heute) {
  return (json?.events || [])
    .map(e => ({ id: e.id, name: e.name || '', datum: String(e['life-span']?.begin || ''), ende: String(e['life-span']?.end || ''), zeit: String(e.time || '').slice(0, 5), typ: e.type || '', abgesagt: !!e.cancelled }))
    .filter(e => /^\d{4}-\d{2}-\d{2}$/.test(e.datum) && (e.ende && /^\d{4}-\d{2}-\d{2}$/.test(e.ende) ? e.ende : e.datum) >= heute && !e.abgesagt)
    .sort((a, b) => a.datum.localeCompare(b.datum));
}

/** Detail-Antwort (inc=place-rels+area-rels) -> { ort, stadt, land, lat, lon } */
export function mbOrt(json) {
  const rel = json?.relations || [];
  const platz = rel.find(r => r.place)?.place || null;
  const gebiet = platz?.area || rel.find(r => r.area)?.area || null;
  const k = platz?.coordinates || {};
  const lat = Number(k.latitude), lon = Number(k.longitude);
  return {
    ort: platz?.name || '', stadt: gebiet?.name || '', land: (gebiet?.['iso-3166-1-codes'] || [])[0] || '',
    lat: Number.isFinite(lat) ? lat : null, lon: Number.isFinite(lon) ? lon : null,
  };
}

export default async function mbevents(ctx) {
  const konzerte = [], fehler = [];
  const max = ctx.config.mbEventsMaxLookups ?? 2;
  for (const band of ctx.bands) {
    const id = band.mbid || ctx.ids.mb?.[band.name];
    if (!id) continue; // Künstler-ID kommt aus der Quelle „musicbrainz“
    try {
      const evs = mbEvents(await ctx.http.get(`${WS}/event?artist=${id}&limit=100&fmt=json`), ctx.heute).slice(0, max);
      for (const e of evs) {
        let o = { ort: '', stadt: '', land: '', lat: null, lon: null };
        try { o = mbOrt(await ctx.http.get(`${WS}/event/${e.id}?inc=place-rels+area-rels&fmt=json`)); }
        catch (err) { fehler.push(`${band.name}: ${err.message}`); }
        konzerte.push({
          quelle: 'mbevents', band: band.name, titel: e.name, datum: e.datum, zeit: e.zeit,
          bis: e.ende && e.ende > e.datum ? berlinIso(e.ende) : null, ...o, link: `https://musicbrainz.org/event/${e.id}`, festival: /festival/i.test(`${e.typ} ${e.name}`), status: '',
        });
      }
    } catch (err) { fehler.push(`${band.name}: ${err.message}`); }
  }
  return { konzerte, fehler };
}
