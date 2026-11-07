// MusicBrainz: Künstler-ID auflösen (gecacht) und Release-Groups (Album/EP/Single) holen. Max. 1 Anfrage/Sekunde.
import { istBand, titelSchluessel } from '../lib.mjs';

const WS = 'https://musicbrainz.org/ws/2';
const OHNE = new Set(['Compilation', 'DJ-mix', 'Mixtape/Street', 'Demo', 'Interview', 'Audiobook', 'Audio drama', 'Spokenword', 'Field recording']);

export function mbWaehle(json, band) {
  const kand = (json.artists || []).filter(a => istBand(a.name, band) || (a.aliases || []).some(x => istBand(x.name, band)));
  kand.sort((a, b) => ((b.country === band.land) - (a.country === band.land)) || (b.score - a.score));
  return kand[0]?.id || null;
}

/** Alle Release-Groups → { neu: [...im Fenster/angekündigt], alt: Map(titelSchluessel → frühestes Datum) } */
export function mbParse(groups, band, heute, fensterTage) {
  const grenze = new Date(Date.parse(heute) - fensterTage * 864e5).toISOString().slice(0, 10);
  const alt = new Map(), neu = [];
  for (const g of groups) {
    const d = g['first-release-date'] || '';
    const k = titelSchluessel(g.title);
    if (d && (!alt.has(k) || d < alt.get(k))) alt.set(k, d);
    const typ = g['primary-type'];
    if (!['Album', 'EP', 'Single'].includes(typ)) continue;
    const sek = g['secondary-types'] || [];
    if (sek.some(s => OHNE.has(s))) continue;
    // Mitschnitte mit Datum im Titel („1987-12-10: Wembley Arena, London“) sind Bootlegs, keine neue Platte
    if (/^\d{4}-\d{2}-\d{2}\s*:/.test(g.title || '')) continue;
    if (!/^\d{4}-\d{2}(-\d{2})?$/.test(d) || d < grenze) continue;
    neu.push({
      quelle: 'musicbrainz', band: band.name, titel: g.title, typ: typ + (sek.length ? ` (${sek.join(', ')})` : ''),
      datum: d.length === 7 ? d + '-01' : d, angekuendigt: d > heute,
      link: `https://musicbrainz.org/release-group/${g.id}`,
    });
  }
  return { neu, alt };
}

export default async function musicbrainz(ctx) {
  const releases = [], fehler = [], bekannt = {};
  for (const band of ctx.bands) {
    try {
      let id = band.mbid || ctx.ids.mb[band.name];
      if (!id) {
        const q = encodeURIComponent(`artist:"${band.name}"`);
        id = mbWaehle(await ctx.http.get(`${WS}/artist?query=${q}&limit=10&fmt=json`), band);
        if (!id) { fehler.push(`${band.name}: nicht gefunden`); continue; }
        ctx.ids.mb[band.name] = id;
      }
      const groups = [];
      for (let off = 0; off < 1000; off += 100) {
        // nur offizielle Veröffentlichungen (website-default blendet Bootlegs/Pseudo-Releases aus, wie musicbrainz.org)
        const j = await ctx.http.get(`${WS}/release-group?artist=${id}&type=album|ep|single&release-group-status=website-default&limit=100&offset=${off}&fmt=json`);
        groups.push(...(j['release-groups'] || []));
        if (groups.length >= (j['release-group-count'] || 0) || !(j['release-groups'] || []).length) break;
      }
      const { neu, alt } = mbParse(groups, band, ctx.heute, ctx.config.releaseListeTage);
      releases.push(...neu);
      bekannt[band.name] = alt;
    } catch (e) { fehler.push(`${band.name}: ${e.message}`); }
  }
  ctx.mbBekannt = bekannt; // für Deezer: alte Titel als Wiederveröffentlichung erkennen
  return { releases, fehler };
}
