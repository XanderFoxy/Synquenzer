// Modul "essen": Lokale um Döbeln auffrischen (Xander 16.11.2026: „XXL-Restaurants, die besten Italiener, Griechen, Inder,
// Türken … nach Bewertung und was die Leute sagen, in der Nähe von Döbeln; wann es All-you-can-eat gibt; Ketten wie
// Domino's – gibt es einen in der Nähe“).
// Grundlage ist die handgepflegte Liste vorteile/essen.json (Bewertungen mit Quelle und Stand, „was Leute sagen“, Ketten).
// Dieses Modul holt dazu höchstens einmal am Tag (osmStunden) EINE Overpass-Abfrage aus OpenStreetMap (ODbL, öffentlich,
// ohne Schlüssel): alle benannten Restaurants/Imbisse/Biergärten im Umkreis radiusKm und die Filialen bekannter Ketten im
// Umkreis kettenRadiusKm. Daraus: Öffnungszeiten, Lage, Entfernung (Luftlinie), Küche für die gepflegten Lokale; weitere
// Lokale aus OSM (ohne Bewertung); nächste Filiale je Kette; neu/verschwunden gegenüber dem letzten Abruf.
// Eigene Datei <data>/essen.json (Rückgabefeld „datei“), status.essen.kurz für die Übersicht.
// Push (optional, Standard aus): nur für gemerkte Lokale (cfg.module.essen.gemerkt = Liste von ids aus vorteile/essen.json
// oder mein-vorteil/essen.json) „heute All-you-can-eat“ – nur am Tag selbst, zwischen pushVon und pushBis Uhr (Berlin).
// Fällt Overpass aus, bleibt der letzte OSM-Stand aus der alten Datei stehen (mit „alt“ im Status), die Liste selbst ist frisch.
import { berlin } from '../benachrichtigen.mjs';

export const STANDARD = {
  overpass: 'https://overpass-api.de/api/interpreter',
  osmStunden: 20,
  timeoutMs: 100000, // Overpass rechnet bis zu 90 s ([timeout:90]); Lauf 43830401385: 20 s waren zu kurz
  pushVon: 9,
  pushBis: 17,
  maxWeitere: 200,
  gemerkt: [],
  // Seiten-Daten (All-you-can-eat-Tage in Dresden/Leipzig/Chemnitz) – der Workflow checkt nur vorteile/ aus; nur mit Merkliste geholt
  seiteUrl: 'https://raw.githubusercontent.com/XanderFoxy/Synquenzer/main/mein-vorteil/essen.json',
};
export const KETTEN_NAMEN = ["McDonald", 'Burger King', 'KFC', 'Subway', "Domino", 'Pizza Hut', 'Freddy Fresh', 'Five Guys', "L'Osteria", 'Peter Pane', 'burgerme', 'Nordsee'];

// OSM-cuisine -> unsere Küchen (die Seite filtert danach)
const KUECHE = {
  pizza: 'pizza', italian: 'italienisch', italian_pizza: 'pizza', greek: 'griechisch', indian: 'indisch', turkish: 'tuerkisch',
  kebab: 'doener', doner: 'doener', asian: 'asiatisch', chinese: 'chinesisch', vietnamese: 'vietnamesisch', thai: 'asiatisch',
  sushi: 'japanisch', japanese: 'japanisch', burger: 'burger', american: 'burger', german: 'deutsch', regional: 'deutsch',
  saxon: 'saechsisch', mexican: 'mexikanisch', steak_house: 'steak', steak: 'steak', chicken: 'haehnchen', fried_chicken: 'haehnchen',
  fish: 'fisch', seafood: 'fisch', balkan: 'balkan', croatian: 'balkan', syrian: 'orientalisch', arab: 'orientalisch',
  lebanese: 'orientalisch', falafel: 'orientalisch', mediterranean: 'mediterran', spanish: 'mediterran', vegan: 'vegan',
  vegetarian: 'vegetarisch', sandwich: 'imbiss', bratwurst: 'imbiss', sausage: 'imbiss', international: 'international',
};
export function kuecheAus(cuisine) {
  const l = [];
  for (const t of String(cuisine || '').toLowerCase().split(/[;,]/).map(s => s.trim()).filter(Boolean)) {
    const k = KUECHE[t];
    if (k && !l.includes(k)) l.push(k);
  }
  return l;
}

const RAD = Math.PI / 180;
export function km(a, b) {
  const dLat = (b.lat - a.lat) * RAD, dLon = (b.lon - a.lon) * RAD;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}
const kmRund = v => (v < 10 ? Math.round(v * 10) / 10 : Math.round(v));
const GENERISCH = /\b(restaurant|ristorante|pizzeria|gaststaette|gaststatte|gasthof|gasthaus|landgasthof|bistro|imbiss|cafe|bar|grill|und|the|zur|zum|zu|der|die|das|am|im|hotel|doebeln|dobeln)\b/g;
/** Namens-Schlüssel zum Zuordnen: klein, ohne Akzente, ohne Füllwörter, nur Buchstaben/Ziffern */
export function nameKey(s) {
  return String(s || '').toLowerCase().replace(/ß/g, 'ss').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ').replace(GENERISCH, ' ').replace(/\s+/g, '');
}
const gleicherName = (a, b) => { const x = nameKey(a), y = nameKey(b); return x.length >= 3 && y.length >= 3 && (x.includes(y) || y.includes(x)); };

/** Overpass-Abfrage (eine einzige): Lokale im Umkreis + Ketten im weiteren Umkreis */
export function overpassAbfrage(z, radiusKm, kettenRadiusKm, ketten = KETTEN_NAMEN) {
  const re = ketten.map(k => k.replace(/[.*+?^${}()|[\]\\"]/g, '\\$&')).join('|');
  return `[out:json][timeout:90];(nwr["amenity"~"^(restaurant|fast_food|biergarten)$"]["name"](around:${Math.round(radiusKm * 1000)},${z.lat},${z.lon});`
    + `nwr["amenity"~"^(restaurant|fast_food)$"]["name"~"${re}",i](around:${Math.round(kettenRadiusKm * 1000)},${z.lat},${z.lon}););out center tags qt;`;
}

/** Overpass-JSON -> kompakte Lokale { osm, name, amenity, kueche, lat, lon, km, ort, adresse, oeffnung, website, marke } */
export function leseOsm(json, z) {
  const d = typeof json === 'string' ? JSON.parse(json) : json;
  if (!d || !Array.isArray(d.elements)) throw new Error('Overpass: Antwort ohne elements');
  const aus = [], ids = new Set();
  for (const el of d.elements) {
    const t = el.tags || {};
    const lat = el.lat ?? el.center?.lat, lon = el.lon ?? el.center?.lon;
    if (!t.name || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const osm = `${el.type}/${el.id}`;
    if (ids.has(osm)) continue;
    ids.add(osm);
    if (t['disused:amenity'] || /^(yes|true)$/i.test(t.disused || '')) continue;
    const strasse = [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(' ');
    const ort = t['addr:city'] || t['addr:place'] || t['addr:suburb'] || '';
    const web = /^https?:\/\//i.test(t.website || t['contact:website'] || '') ? (t.website || t['contact:website']).replace(/^http:/i, 'https:') : null;
    aus.push({
      osm, name: String(t.name).slice(0, 80), amenity: t.amenity || '', kueche: kuecheAus(t.cuisine),
      lat: Math.round(lat * 1e5) / 1e5, lon: Math.round(lon * 1e5) / 1e5, km: kmRund(km(z, { lat, lon })),
      ort: String(ort).slice(0, 60), adresse: strasse ? `${strasse}${t['addr:postcode'] || ort ? `, ${[t['addr:postcode'], ort].filter(Boolean).join(' ')}` : ''}`.slice(0, 120) : '',
      oeffnung: String(t.opening_hours || '').slice(0, 200), website: web ? web.slice(0, 200) : null, marke: t.brand || null,
    });
  }
  return aus.sort((a, b) => a.km - b.km);
}

const istKette = (o, ketten = KETTEN_NAMEN) => ketten.some(k => gleicherName(o.marke || o.name, k) || nameKey(o.name).includes(nameKey(k)));

/** gepflegte Lokale mit OSM zusammenführen. Rückgabe { lokale, weitere, nichtGefunden } */
export function fuehreZusammen(liste, osm, { radiusKm = 30, maxWeitere = 200 } = {}) {
  const genutzt = new Set();
  const nichtGefunden = [];
  const lokale = (liste.lokale || []).map(l => {
    let o = l.osm ? osm.find(x => x.osm === l.osm) : null;
    if (!o) {
      const grenze = (Number.isFinite(l.km) ? l.km : radiusKm) + 4;
      o = osm.filter(x => !genutzt.has(x.osm) && x.km <= grenze && [l.osmName, l.name].filter(Boolean).some(n => gleicherName(n, x.name)))
        .sort((a, b) => a.km - b.km)[0] || null;
    }
    if (!o) { nichtGefunden.push(l.id); return { ...l }; }
    genutzt.add(o.osm);
    const kueche = [...new Set([...(l.kueche || []), ...o.kueche])];
    return { ...l, osm: o.osm, lat: o.lat, lon: o.lon, km: o.km, adresse: l.adresse || o.adresse || undefined, oeffnung: o.oeffnung || l.oeffnung || '', website: l.website || o.website || undefined, kueche };
  });
  const weitere = osm.filter(x => !genutzt.has(x.osm) && x.km <= radiusKm && !(istKette(x) && x.km > 5) && x.amenity !== '')
    .slice(0, maxWeitere).map(x => ({ id: `osm-${x.osm.replace('/', '-')}`, name: x.name, kueche: x.kueche, art: x.amenity, ort: x.ort, km: x.km, lat: x.lat, lon: x.lon, adresse: x.adresse || undefined, oeffnung: x.oeffnung, website: x.website || undefined, osm: x.osm }));
  return { lokale, weitere, nichtGefunden };
}

/** nächste Filiale je Kette aus OSM (null = keine im Umkreis) */
export function naechsteFilialen(ketten, osm) {
  return (ketten || []).map(k => {
    const namen = [k.brand, k.kette].filter(Boolean);
    const f = osm.filter(x => namen.some(n => gleicherName(n, x.marke || '') || gleicherName(n, x.name))).sort((a, b) => a.km - b.km)[0];
    return f ? { ...k, naechste: { name: f.name, ort: f.ort, adresse: f.adresse || undefined, km: f.km, lat: f.lat, lon: f.lon, oeffnung: f.oeffnung, osm: f.osm } } : { ...k, naechste: null };
  });
}

const WT = ['', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const wochentagVon = tag => new Date(tag + 'T12:00:00Z').getUTCDay() || 7;
const karteLink = l => (Number.isFinite(l.lat) ? `https://www.openstreetmap.org/?mlat=${l.lat}&mlon=${l.lon}#map=18/${l.lat}/${l.lon}` : `https://www.openstreetmap.org/search?query=${encodeURIComponent([l.name || l.titel, l.ort].filter(Boolean).join(' '))}`);

/** All-you-can-eat heute bei gemerkten Lokalen (ids aus vorteile/essen.json und mein-vorteil/essen.json) */
export function ayceHeute({ liste, seite, gemerkt, tag }) {
  const wt = wochentagVon(tag);
  const g = new Set(Array.isArray(gemerkt) ? gemerkt : []);
  const aus = [];
  for (const l of liste?.lokale || []) {
    if (!g.has(l.id) || !l.ayce || !Array.isArray(l.ayce.wochentage) || !l.ayce.wochentage.includes(wt)) continue;
    aus.push({ id: l.id, name: l.name, ort: l.ort, zeit: l.ayce.text || '', preis: l.ayce.preis || '', link: karteLink(l) });
  }
  for (const e of seite?.eintraege || []) {
    if (!g.has(e.id) || e.rubrik !== 'ayce' || e.nurHinweis || !Array.isArray(e.wochentage) || !e.wochentage.includes(wt)) continue;
    if ((e.bis && e.bis < tag) || (e.ab && e.ab > tag)) continue;
    aus.push({ id: e.id, name: e.titel, ort: e.ort || '', zeit: e.zeit?.text || '', preis: e.preis || '', link: e.quellen?.[0]?.url || karteLink(e) });
  }
  return aus;
}

export default async function essen({ holeText, cfg, jetzt = new Date(), zustand = {}, vorherDatei = null, essenListen = null }) {
  const m = { ...STANDARD, ...(cfg.module?.essen || {}) };
  const liste = essenListen?.liste;
  let seite = essenListen?.seite;
  const fehler = [], hinweise = [], eintraege = [];
  const jetztMs = new Date(jetzt).getTime();
  const { tag, stunde } = berlin(jetzt);
  const zk = (zustand.essen ||= {});
  if (!liste || !Array.isArray(liste.lokale) || !liste.zentrum) return { eintraege, fehler: ['vorteile/essen.json fehlt oder kaputt'] };
  const z = liste.zentrum, radiusKm = liste.radiusKm || 30, kettenRadiusKm = liste.kettenRadiusKm || 70;

  // 1) OSM: höchstens alle osmStunden; sonst (oder bei Ausfall) der letzte Stand aus der alten Datei
  let osm = null, alt = false;
  const faellig = !vorherDatei?.osmRoh || !zk.osmZeit || jetztMs - Date.parse(zk.osmZeit) >= m.osmStunden * 3600e3;
  if (faellig) {
    try {
      const url = `${m.overpass}?data=${encodeURIComponent(overpassAbfrage(z, radiusKm, kettenRadiusKm))}`;
      osm = leseOsm(await holeText(url, { headers: { accept: 'application/json' }, timeoutMs: m.timeoutMs }), z);
      if (!osm.length) throw new Error('Overpass: 0 Lokale (Abfrage geändert?)');
      zk.osmZeit = new Date(jetztMs).toISOString();
    } catch (e) {
      // mit altem Stand nur ein Hinweis (die Seite zeigt den letzten Stand), ohne einen echten Fehler
      (Array.isArray(vorherDatei?.osmRoh) ? hinweise : fehler).push(`OpenStreetMap: ${String(e.message || e).slice(0, 160)}`);
      osm = null;
    }
  }
  if (!osm && Array.isArray(vorherDatei?.osmRoh)) { osm = vorherDatei.osmRoh; alt = faellig; }
  osm ||= [];

  // 2) zusammenführen, Ketten, neu/verschwunden (nur wenn frisch abgefragt und es einen alten Stand gibt)
  const { lokale, weitere, nichtGefunden } = fuehreZusammen(liste, osm, { radiusKm, maxWeitere: m.maxWeitere });
  const ketten = naechsteFilialen(liste.ketten, osm);
  let neu = vorherDatei?.neu || [], weg = vorherDatei?.weg || [];
  if (osm.length && !alt && faellig && Array.isArray(vorherDatei?.osmRoh)) {
    const vorIds = new Set(vorherDatei.osmRoh.filter(x => x.km <= radiusKm).map(x => x.osm));
    const jetztIds = new Set(osm.filter(x => x.km <= radiusKm).map(x => x.osm));
    neu = osm.filter(x => x.km <= radiusKm && !vorIds.has(x.osm)).map(x => ({ osm: x.osm, name: x.name, ort: x.ort, km: x.km, seit: tag }));
    weg = vorherDatei.osmRoh.filter(x => x.km <= radiusKm && !jetztIds.has(x.osm)).map(x => ({ osm: x.osm, name: x.name, ort: x.ort, km: x.km, seit: tag }));
    // Rauschen vermeiden: ein Abruf, der fast alles „neu“ meldet, ist ein Abfrage-Wechsel, kein Neubau
    if (neu.length > 25) { hinweise.push(`OSM: ${neu.length} „neue“ Lokale – Abfrage geändert, nicht als neu gezählt`); neu = []; }
    if (weg.length > 25) { hinweise.push(`OSM: ${weg.length} „verschwundene“ Lokale – Abfrage geändert, nicht gezählt`); weg = []; }
  }
  if (nichtGefunden.length && osm.length) hinweise.push(`in OSM nicht gefunden: ${nichtGefunden.join(', ')}`.slice(0, 300));

  // 3) Push: heute All-you-can-eat bei gemerkten Lokalen (nur am Tag selbst, tagsüber)
  if (stunde >= m.pushVon && stunde < m.pushBis && Array.isArray(m.gemerkt) && m.gemerkt.length) {
    if (!seite && m.seiteUrl) { try { seite = JSON.parse(await holeText(m.seiteUrl, { headers: { accept: 'application/json' } })); } catch (e) { hinweise.push(`Seiten-Daten: ${String(e.message || e).slice(0, 120)}`); } }
    for (const a of ayceHeute({ liste, seite, gemerkt: m.gemerkt, tag })) {
      eintraege.push({
        id: `essen-ayce-${a.id}-${tag}`, kategorie: 'essen', titel: `Heute All-you-can-eat: ${a.name}`.slice(0, 140),
        zeile: [`${WT[wochentagVon(tag)]} ${tag.slice(8, 10)}.${tag.slice(5, 7)}.`, a.zeit, a.ort, a.preis].filter(Boolean).join(' · ').slice(0, 200),
        soGehts: 'Gemerktes Lokal: Zeiten und Preis vorher kurz prüfen (anrufen oder Seite des Lokals) – Bedingungen ändern sich.',
        link: a.link, quelle: 'Essen', wert: 55, sofort: true, datum: new Date(jetztMs).toISOString(), bis: `${tag}T23:59:00+01:00`,
      });
    }
  }

  const mitZeiten = lokale.filter(l => l.oeffnung).length;
  const datei = {
    version: 1, aktualisiert: new Date(jetztMs).toISOString(), stand: liste.stand || null, osmStand: zk.osmZeit || vorherDatei?.osmStand || null,
    quelle: { name: 'OpenStreetMap-Mitwirkende', lizenz: 'ODbL', url: 'https://www.openstreetmap.org/copyright' },
    zentrum: z, radiusKm, kettenRadiusKm, lokale, weitere, ketten, neu, weg, nichtGefunden,
    osmRoh: osm.map(({ osm: o, name, amenity, kueche, lat, lon, km: k, ort, adresse, oeffnung, website, marke }) => ({ osm: o, name, amenity, kueche, lat, lon, km: k, ort, adresse, oeffnung, website, marke })),
  };
  const kurz = `${lokale.length + weitere.length} Lokale bis ${radiusKm} km · ${mitZeiten} mit Öffnungszeiten${neu.length ? ` · ${neu.length} neu` : ''}`;
  if (alt) hinweise.push('OpenStreetMap gerade nicht erreichbar – letzter Stand');
  return { eintraege, fehler, hinweise, datei, kurz };
}
