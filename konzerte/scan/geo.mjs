// Städte → Koordinaten. Erst eingebaute Tabelle, dann Cache (data/geo.json), dann Nominatim (1 Anfrage/s, nur einmal pro Stadt).
import { norm } from './lib.mjs';

export const STAEDTE = {
  'dobeln': [51.1194, 13.1186], 'leipzig': [51.3397, 12.3731], 'dresden': [51.0504, 13.7373], 'chemnitz': [50.8278, 12.9214],
  'halle': [51.4825, 11.9697], 'halle saale': [51.4825, 11.9697], 'berlin': [52.52, 13.405], 'erfurt': [50.9848, 11.0299],
  'prag': [50.0755, 14.4378], 'prague': [50.0755, 14.4378], 'praha': [50.0755, 14.4378], 'zwickau': [50.7189, 12.4964],
  'jena': [50.9271, 11.5892], 'weimar': [50.9795, 11.3235], 'gera': [50.8806, 12.0833], 'magdeburg': [52.1205, 11.6276],
  'potsdam': [52.3906, 13.0645], 'cottbus': [51.7563, 14.3329], 'gorlitz': [51.1526, 14.9873], 'plauen': [50.4952, 12.1368],
  'riesa': [51.3077, 13.2939], 'meissen': [51.1634, 13.4737], 'freiberg': [50.9119, 13.3428], 'wroclaw': [51.1079, 17.0385],
  'hamburg': [53.5511, 9.9937], 'munchen': [48.1351, 11.582], 'koln': [50.9375, 6.9603], 'hannover': [52.3759, 9.732],
  'nurnberg': [49.4521, 11.0767], 'frankfurt am main': [50.1109, 8.6821], 'hildesheim': [52.1508, 9.9511],
};

export async function koordinaten(stadt, land, cache, http) {
  const k = norm(stadt);
  if (!k) return null;
  if (STAEDTE[k]) return { lat: STAEDTE[k][0], lon: STAEDTE[k][1] };
  const ck = `${k}|${land || ''}`;
  if (ck in cache) return cache[ck];
  if (!http) return null;
  try {
    const q = new URLSearchParams({ city: stadt, format: 'json', limit: '1' });
    if (land) q.set('countrycodes', land.toLowerCase());
    const j = await http.get(`https://nominatim.openstreetmap.org/search?${q}`);
    cache[ck] = j[0] ? { lat: Number(j[0].lat), lon: Number(j[0].lon) } : null;
  } catch { return null; } // nicht cachen → nächster Lauf versucht es erneut
  return cache[ck];
}
