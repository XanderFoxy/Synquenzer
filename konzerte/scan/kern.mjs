// Reine Logik: Ergebnisse der Quellen zusammenführen, Distanz filtern, Dedupe gegen "gesehen", Pushes bestimmen.
import { norm, titelSchluessel, distanzKm, datumDe, tageZwischen } from './lib.mjs';

export const konzertKey = k => k.quelle.startsWith('seite:')
  ? `s|${k.quelle.slice(6)}|${norm(k.band)}`
  : `k|${norm(k.band)}|${k.datum}|${norm(k.stadt)}`;
export const releaseKey = r => `r|${norm(r.band)}|${titelSchluessel(r.titel)}`;

/** Bei Ausfall einer Quelle die alten Einträge dieser Quelle behalten (nichts verschwindet wegen eines Fehlers). */
export function mitAltbestand(neu, alt, quelleKaputt) {
  return [...neu, ...(alt || []).filter(x => quelleKaputt(x.quelle))];
}

export function verarbeite({ konzerte, releases, gesehen, config, heute, seitenGeprueft = [] }) {
  const erstlauf = !gesehen;
  gesehen = gesehen || { konzerte: {}, releases: {} };
  const z = config.zuhause, pushes = [];

  // Konzerte: Distanz, Radius, Zukunft, Dedupe (gleiches Datum+Stadt+Band aus mehreren Quellen = eins)
  const km = new Map();
  for (const k of konzerte) {
    if (k.datum && k.datum < heute) continue;
    const dist = k.lat != null && k.lon != null ? distanzKm(z, { lat: k.lat, lon: k.lon }) : null;
    if (dist != null && dist > config.listenRadiusKm) continue;
    const e = { ...k, km: dist, key: konzertKey(k) };
    if (!km.has(e.key)) km.set(e.key, e);
  }
  const liste = [...km.values()].sort((a, b) => (a.datum || '9999').localeCompare(b.datum || '9999') || (a.km ?? 9e9) - (b.km ?? 9e9));

  for (const k of liste) {
    k.neu = !gesehen.konzerte[k.key];
    if (!k.neu) continue;
    const nah = k.km == null || k.km <= config.pushRadiusKm;
    if (nah && !erstlauf) {
      const wo = [k.ort, k.stadt].filter(Boolean).join(', ');
      pushes.push({
        key: k.key, art: 'konzerte',
        titel: `${k.festival ? 'Festival' : 'Konzert'}: ${k.band}`,
        text: `${k.datum ? datumDe(k.datum) + (k.zeit ? ' ' + k.zeit : '') + ' · ' : ''}${wo}${k.km != null ? ` (${k.km} km)` : ''}${k.titel && norm(k.titel) !== norm(k.band) ? '\n' + k.titel : ''}${k.status ? '\n' + k.status : ''}`,
        link: k.link, tags: ['ticket'], prio: 4,
      });
    } else gesehen.konzerte[k.key] = heute; // zu weit: nur Liste, kein Push
  }

  // Festival-Seiten: verschwundene Erwähnung vergessen → spätere Rückkehr meldet erneut (nur geprüfte Seiten)
  for (const key of Object.keys(gesehen.konzerte)) {
    if (key.startsWith('s|') && seitenGeprueft.includes(key.split('|')[1]) && !km.has(key)) delete gesehen.konzerte[key];
    if (key.startsWith('k|') && tageZwischen(key.split('|')[2] || heute, heute) > 30) delete gesehen.konzerte[key];
  }

  // Releases: MusicBrainz + Deezer zusammenführen, Deezer-Link bevorzugt (direkt anhören)
  const rm = new Map();
  for (const r of releases) {
    const key = releaseKey(r), alt = rm.get(key);
    if (!alt) { rm.set(key, { ...r, key, quellen: [r.quelle], links: { [r.quelle]: r.link } }); continue; }
    alt.quellen.push(r.quelle); alt.links[r.quelle] = r.link;
    if (r.quelle === 'deezer') Object.assign(alt, { link: r.link, cover: r.cover || alt.cover, datum: r.datum < alt.datum ? r.datum : alt.datum });
  }
  const rListe = [...rm.values()].sort((a, b) => b.datum.localeCompare(a.datum));
  const grenze = new Date(Date.parse(heute) - config.releaseFensterTage * 864e5).toISOString().slice(0, 10);
  for (const r of rListe) {
    r.neu = !gesehen.releases[r.key];
    if (!r.neu) continue;
    if (!erstlauf && r.datum >= grenze) {
      pushes.push({
        key: r.key, art: 'releases',
        titel: `${r.angekuendigt ? 'Angekündigt' : 'Neu'}: ${r.band}`,
        text: `${r.typ} „${r.titel}“ · ${r.angekuendigt ? 'erscheint ' : ''}${datumDe(r.datum)}`,
        link: r.link, tags: ['cd'], prio: 3,
      });
    } else gesehen.releases[r.key] = heute;
  }

  for (const x of [...liste, ...rListe]) if (erstlauf) x.neu = false;
  return { konzerte: liste, releases: rListe, gesehen, pushes, erstlauf };
}
