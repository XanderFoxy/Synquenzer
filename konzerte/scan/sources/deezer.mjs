// Deezer Public API (ohne Schlüssel): neueste Alben/EPs/Singles mit direktem Hör-Link.
import { istBand, titelSchluessel, norm, WIEDERVEROEFFENTLICHUNG } from '../lib.mjs';

const API = 'https://api.deezer.com';

export function dzWaehle(json, band) {
  const k = (json.data || []).filter(a => istBand(a.name, band));
  k.sort((a, b) => (b.nb_fan || 0) - (a.nb_fan || 0));
  return k[0]?.id || null;
}

export function dzParse(json, band, heute, fensterTage, mbAlt) {
  const grenze = new Date(Date.parse(heute) - fensterTage * 864e5).toISOString().slice(0, 10);
  const out = [];
  for (const a of json.data || []) {
    const d = a.release_date || '';
    if (!d || d < grenze) continue;
    if (!['album', 'ep', 'single'].includes(a.record_type)) continue; // 'compile' = Zusammenstellung
    if (WIEDERVEROEFFENTLICHUNG.test(norm(a.title))) continue;
    const frueher = mbAlt?.get(titelSchluessel(a.title));
    if (frueher && frueher < grenze) continue; // gibt es laut MusicBrainz schon lange → Neuauflage
    out.push({
      quelle: 'deezer', band: band.name, titel: a.title, typ: { album: 'Album', ep: 'EP', single: 'Single' }[a.record_type],
      datum: d, angekuendigt: d > heute, link: a.link || `https://www.deezer.com/album/${a.id}`, cover: a.cover_medium || '',
    });
  }
  return out;
}

export default async function deezer(ctx) {
  const releases = [], fehler = [];
  for (const band of ctx.bands) {
    try {
      let id = band.deezerId || ctx.ids.deezer[band.name];
      if (!id) {
        id = dzWaehle(await ctx.http.get(`${API}/search/artist?q=${encodeURIComponent(band.name)}&limit=10`), band);
        if (!id) { fehler.push(`${band.name}: nicht gefunden`); continue; }
        ctx.ids.deezer[band.name] = id;
      }
      const j = await ctx.http.get(`${API}/artist/${id}/albums?limit=100`);
      if (j.error) throw new Error(j.error.message || 'Deezer-Fehler');
      releases.push(...dzParse(j, band, ctx.heute, ctx.config.releaseListeTage, ctx.mbBekannt?.[band.name]));
    } catch (e) { fehler.push(`${band.name}: ${e.message}`); }
  }
  return { releases, fehler };
}
