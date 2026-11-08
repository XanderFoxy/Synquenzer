// Orte und Entfernungen ab Döbeln (grob, Luftlinie) – für Auftritte, Unterricht und alles mit Ort.
// Tabelle: Region zuerst (Mittelsachsen, Leipzig, Dresden, Chemnitz), dann große Städte in Deutschland und Nachbarländern.
// Gleiche Koordinaten wie konzerte/scan/geo.mjs (Döbeln 51.1194/13.1186).
import { norm } from './text.mjs';

export const DOEBELN = { name: 'Döbeln', lat: 51.1194, lon: 13.1186 };

// Name (wie er im Text steht) -> [lat, lon]. Längere Namen zuerst prüfen (siehe ortAus). Bewusst NICHT drin, weil es
// auch gewöhnliche Wörter sind: „Halle“ (nur „Halle (Saale)“/„Halle/Saale“), „Essen“, „Aue“.
export const ORTE = {
  'Döbeln': [51.1194, 13.1186], 'Waldheim': [51.0736, 13.0234], 'Hartha': [51.0975, 12.9744], 'Leisnig': [51.1583, 12.9283],
  'Roßwein': [51.0661, 13.1833], 'Rosswein': [51.0661, 13.1833], 'Ostrau': [51.2017, 13.1608], 'Großweitzschen': [51.1453, 13.0717],
  'Mittweida': [50.9856, 12.9811], 'Rochlitz': [51.0464, 12.8028], 'Freiberg': [50.9119, 13.3428], 'Hainichen': [50.97, 13.1239],
  'Frankenberg': [50.9106, 13.0378], 'Flöha': [50.8564, 13.0747], 'Burgstädt': [50.9136, 12.8106], 'Geringswalde': [51.0786, 12.9067],
  'Oschatz': [51.3, 13.1078], 'Riesa': [51.3077, 13.2939], 'Meißen': [51.1634, 13.4737], 'Meissen': [51.1634, 13.4737], 'Nossen': [51.0581, 13.2969],
  'Grimma': [51.2386, 12.7256], 'Wurzen': [51.3703, 12.7397], 'Colditz': [51.1308, 12.8058], 'Borna': [51.1236, 12.4972],
  'Torgau': [51.5603, 13.0056], 'Eilenburg': [51.4594, 12.6347], 'Markkleeberg': [51.2775, 12.3714], 'Deutzen': [51.105, 12.429],
  'Radebeul': [51.1, 13.65], 'Pirna': [50.9622, 13.9406], 'Freital': [51.0017, 13.6497], 'Großenhain': [51.29, 13.5333],
  'Leipzig': [51.3397, 12.3731], 'Dresden': [51.0504, 13.7373], 'Chemnitz': [50.8278, 12.9214], 'Zwickau': [50.7189, 12.4964],
  'Plauen': [50.4952, 12.1368], 'Bautzen': [51.1814, 14.4244], 'Görlitz': [51.1526, 14.9873], 'Hoyerswerda': [51.4381, 14.2483],
  'Annaberg-Buchholz': [50.5794, 13.0042], 'Glauchau': [50.8197, 12.5447], 'Limbach-Oberfrohna': [50.8586, 12.7608],
  'Halle (Saale)': [51.4825, 11.9697], 'Halle/Saale': [51.4825, 11.9697], 'Halle an der Saale': [51.4825, 11.9697], 'Merseburg': [51.3544, 11.9928], 'Altenburg': [50.9878, 12.4336],
  'Gera': [50.8806, 12.0833], 'Jena': [50.9271, 11.5892], 'Weimar': [50.9795, 11.3235], 'Erfurt': [50.9848, 11.0299],
  'Dessau': [51.8333, 12.25], 'Magdeburg': [52.1205, 11.6276], 'Cottbus': [51.7563, 14.3329], 'Potsdam': [52.3906, 13.0645],
  'Berlin': [52.52, 13.405], 'Hamburg': [53.5511, 9.9937], 'Hannover': [52.3759, 9.732], 'Bremen': [53.0793, 8.8017],
  'Köln': [50.9375, 6.9603], 'Koeln': [50.9375, 6.9603], 'Düsseldorf': [51.2277, 6.7735], 'Dortmund': [51.5136, 7.4653],
  'Bochum': [51.4818, 7.2162], 'Münster': [51.9607, 7.6261], 'Bielefeld': [52.0302, 8.5325],
  'Frankfurt am Main': [50.1109, 8.6821], 'Frankfurt': [50.1109, 8.6821], 'Mannheim': [49.4875, 8.466], 'Stuttgart': [48.7758, 9.1829],
  'Nürnberg': [49.4521, 11.0767], 'Nuernberg': [49.4521, 11.0767], 'München': [48.1351, 11.582], 'Muenchen': [48.1351, 11.582],
  'Würzburg': [49.7913, 9.9534], 'Bamberg': [49.8988, 10.9028], 'Bayreuth': [49.9456, 11.5713], 'Regensburg': [49.0134, 12.1016],
  'Kassel': [51.3127, 9.4797], 'Göttingen': [51.5413, 9.9158], 'Braunschweig': [52.2689, 10.5268], 'Wolfsburg': [52.4227, 10.7865],
  'Hildesheim': [52.1508, 9.9511], 'Kiel': [54.3233, 10.1228], 'Lübeck': [53.8655, 10.6866], 'Rostock': [54.0924, 12.0991],
  'Schwerin': [53.6355, 11.4012], 'Karlsruhe': [49.0069, 8.4037], 'Freiburg': [47.999, 7.8421], 'Wiesbaden': [50.0782, 8.2398],
  'Mainz': [49.9929, 8.2473], 'Saarbrücken': [49.2402, 6.9969], 'Aachen': [50.7753, 6.0839], 'Bonn': [50.7374, 7.0982],
  'Oberhausen': [51.4963, 6.8638], 'Hildburghausen': [50.4256, 10.7314], 'Suhl': [50.6092, 10.6927], 'Eisenach': [50.9807, 10.3152],
  'Prag': [50.0755, 14.4378], 'Praha': [50.0755, 14.4378], 'Prague': [50.0755, 14.4378], 'Wien': [48.2082, 16.3738], 'Vienna': [48.2082, 16.3738],
  'Breslau': [51.1079, 17.0385], 'Wrocław': [51.1079, 17.0385], 'Zürich': [47.3769, 8.5417], 'Amsterdam': [52.3676, 4.9041],
  'London': [51.5074, -0.1278], 'Paris': [48.8566, 2.3522], 'Kopenhagen': [55.6761, 12.5683], 'Stockholm': [59.3293, 18.0686],
};

const ONLINE = /\b(online|remote|virtuell|virtual|weltweit|worldwide|homeoffice|home office|von zu hause|von zuhause|digital eingereicht|livestream)\b/i;
export const istOnline = text => ONLINE.test(String(text || ''));

export function distanzKm(a, b) {
  if (!a || !b || a.lat == null || b.lat == null) return null;
  const R = 6371, rad = x => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

const NAMEN = Object.keys(ORTE).sort((a, b) => b.length - a.length);
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const MUSTER = NAMEN.map(n => [n, new RegExp(`(^|[^\\p{L}])${esc(n)}(?![\\p{L}])`, 'u')]);

/**
 * Erster bekannter Ort im Text (Titel vor Beschreibung), mit Entfernung ab zuhause. Nur ganze Wörter.
 * -> { ort, lat, lon, km } | null
 */
export function ortAus(text, zuhause = DOEBELN) {
  const s = String(text || '');
  let best = null;
  for (const [n, re] of MUSTER) {
    const m = re.exec(s);
    if (!m) continue;
    const pos = m.index + m[1].length;
    if (!best || pos < best.pos) best = { n, pos };
  }
  if (!best) return null;
  const [lat, lon] = ORTE[best.n];
  const ort = best.n.replace(/^Rosswein$/, 'Roßwein').replace(/^Meissen$/, 'Meißen').replace(/^Koeln$/, 'Köln').replace(/^Nuernberg$/, 'Nürnberg').replace(/^Muenchen$/, 'München').replace(/^Halle.*$/, 'Halle (Saale)');
  return { ort, lat, lon, km: distanzKm(zuhause, { lat, lon }) };
}

/** Ort nach Name (z. B. aus einer Quelle mit Stadtfeld) -> { ort, lat, lon, km } | null */
export function ortNach(name, zuhause = DOEBELN) {
  const n = norm(name);
  if (!n) return null;
  const k = NAMEN.find(x => norm(x) === n) || NAMEN.find(x => n.startsWith(norm(x) + ' '));
  if (!k) return null;
  const [lat, lon] = ORTE[k];
  return { ort: k, lat, lon, km: distanzKm(zuhause, { lat, lon }) };
}

/** Kurztext für die Zeile: „Leipzig · 54 km“, „online“, „deutschlandweit“ */
export function ortZeile(o, online = false) {
  if (o?.ort) return o.km != null ? `${o.ort} · ${o.km} km` : o.ort;
  return online ? 'online' : 'deutschlandweit';
}

/** Punkte für „nah zuerst“ (Döbeln = am meisten). Ohne Ort: wenig, online: etwas. */
export function nahPunkte(km, online = false) {
  if (km == null) return online ? 6 : 2;
  if (km <= 30) return 25;
  if (km <= 80) return 18;
  if (km <= 150) return 10;
  if (km <= 300) return 4;
  return 0;
}
