// Modul "essen": Lokale um Döbeln auffrischen (Xander 16.11.2026: „XXL-Restaurants, die besten Italiener, Griechen, Inder,
// Türken … nach Bewertung und was die Leute sagen, in der Nähe von Döbeln; wann es All-you-can-eat gibt; Ketten wie
// Domino's – gibt es einen in der Nähe“).
// Grundlage ist die handgepflegte Liste vorteile/essen.json (Bewertungen mit Quelle und Stand, „was Leute sagen“, Ketten).
// Dieses Modul holt dazu höchstens einmal am Tag (osmStunden) EINE Overpass-Abfrage aus OpenStreetMap (ODbL, öffentlich,
// ohne Schlüssel): alle benannten Restaurants/Imbisse/Biergärten im Umkreis radiusKm und die Filialen bekannter Ketten im
// Umkreis kettenRadiusKm. Daraus: Öffnungszeiten, Lage, Entfernung (Luftlinie), Küche für die gepflegten Lokale; weitere
// Lokale aus OSM (ohne Bewertung); nächste Filiale je Kette; neu/verschwunden gegenüber dem letzten Abruf.
// Eigene Datei <data>/essen.json (Rückgabefeld „datei“), status.essen.kurz für die Übersicht.
// Push: nur für gemerkte Lokale – Stern auf der Seite (die Seite meldet die ids an das ntfy-Thema merkThema, der Radar liest
// es bei jedem Lauf und merkt sich die letzte Liste in zustand.essen.gemerkt) und cfg.module.essen.gemerkt (von Claude
// gepflegt) – „heute All-you-can-eat“ bzw. „heute <Tagesaktion>“, nur am Tag selbst, zwischen pushVon und pushBis Uhr (Berlin).
// Prüfer 16.11.2026: alle Lokale im Umkreis stehen in „weitere“ (vorher nach 200 gekappt = nur bis 18 km); Ketten-Namen
// passen nur noch in eine Richtung („Pizza“ ist nicht Pizza Hut); Punkt + Fläche desselben Lokals zählen einmal; fehlt der
// Ort in OSM, „bei <Ort>“ vom nächsten Lokal mit Ort (≤ 1,5 km) statt eines falschen Orts; kein osmIds in der Seiten-Datei.
// Fällt Overpass aus, bleibt der letzte OSM-Stand aus der alten Datei stehen (mit „alt“ im Status), die Liste selbst ist frisch.
import { berlin } from '../benachrichtigen.mjs';
import { osmStandAus } from './filialen.mjs';

export const STANDARD = {
  overpass: 'https://overpass-api.de/api/interpreter',
  osmStunden: 20,
  timeoutMs: 100000, // Overpass rechnet bis zu 90 s ([timeout:90]); Lauf 43830401385: 20 s waren zu kurz
  pushVon: 9,
  pushBis: 17,
  maxWeitere: 2000, // Sicherung gegen kaputte Abfragen; echt (Roh-Lauf 43832277416): 713 Lokale bis 30 km
  gemerkt: [],
  merkThema: null, // ntfy-Thema, an das die Seite die gemerkten Lokale meldet (öffentlich wie das Push-Thema)
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
/**
 * Passt der OSM-Name `ist` zum gepflegten Namen `soll`? Der OSM-Name darf mehr enthalten („Pizzeria Al Dente“ ⊇ „Al Dente“),
 * umgekehrt nur, wenn er fast so lang ist – sonst passte ein „Asia Imbiss“ auf „Asia Bistro Hoang Long“ (Prüfer B7).
 */
export function passtName(soll, ist) {
  const s = nameKey(soll), i = nameKey(ist);
  if (s.length < 3 || i.length < 3) return false;
  return i.includes(s) || (s.includes(i) && i.length >= 0.75 * s.length);
}
/** Ketten nur in eine Richtung: Marke oder OSM-Name enthält den Ketten-Namen („Pizza“ ist nicht Pizza Hut, „Bistro Donald“ nicht McDonald's) */
export function passtKette(kette, o) {
  const k = nameKey(kette);
  return k.length >= 3 && [o.marke, o.name].some(n => n && nameKey(n).includes(k));
}

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
  aus.sort((a, b) => a.km - b.km);
  // dasselbe Lokal als Punkt und als Fläche (Sirtaki Waldheim, Hotel Bavaria, Leithenmühle): einmal, fehlende Angaben ergänzt
  const behalten = [];
  for (const o of aus) {
    const k = nameKey(o.name) || o.name.toLowerCase();
    const zwilling = behalten.find(b => (nameKey(b.name) || b.name.toLowerCase()) === k && km(b, o) <= 0.15);
    if (!zwilling) { behalten.push(o); continue; }
    for (const f of ['ort', 'adresse', 'oeffnung', 'website', 'marke']) if (!zwilling[f] && o[f]) zwilling[f] = o[f];
    if (!zwilling.kueche.length && o.kueche.length) zwilling.kueche = o.kueche;
  }
  // Ort fehlt in OSM: „bei <Ort>“ vom nächsten Lokal mit Ort (≤ 1,5 km) – nie den Ort aus der gepflegten Liste (Prüfer B2)
  const mitOrt = behalten.filter(o => o.ort);
  for (const o of behalten) {
    if (o.ort) continue;
    let best = null, d = 1.5;
    for (const m of mitOrt) { const x = km(o, m); if (x <= d) { d = x; best = m; } }
    if (best) o.ort = `bei ${best.ort}`.slice(0, 60);
  }
  return behalten;
}

const istKette = (o, ketten = KETTEN_NAMEN) => ketten.some(k => passtKette(k, o));

const ohneLeere = o => { for (const k of Object.keys(o)) if (o[k] == null || o[k] === '' || (Array.isArray(o[k]) && !o[k].length)) delete o[k]; return o; };

/** gepflegte Lokale mit OSM zusammenführen. Rückgabe { lokale, weitere, nichtGefunden } */
export function fuehreZusammen(liste, osm, { radiusKm = 30, maxWeitere = STANDARD.maxWeitere } = {}) {
  const genutzt = new Set();
  const nichtGefunden = [];
  const lokale = (liste.lokale || []).map(l => {
    let o = l.osm ? osm.find(x => x.osm === l.osm) : null;
    if (!o) {
      const grenze = (Number.isFinite(l.km) ? l.km : radiusKm) + 4;
      o = osm.filter(x => !genutzt.has(x.osm) && x.km <= grenze && [l.osmName, l.name].filter(Boolean).some(n => passtName(n, x.name)))
        .sort((a, b) => a.km - b.km)[0] || null;
    }
    if (!o) { nichtGefunden.push(l.id); return { ...l }; }
    genutzt.add(o.osm);
    const kueche = [...new Set([...(l.kueche || []), ...o.kueche])];
    return { ...l, osm: o.osm, lat: o.lat, lon: o.lon, km: o.km, adresse: l.adresse || o.adresse || undefined, oeffnung: o.oeffnung || l.oeffnung || '', website: l.website || o.website || undefined, kueche };
  });
  const weitere = osm.filter(x => !genutzt.has(x.osm) && x.km <= radiusKm && !(istKette(x) && x.km > 5) && x.amenity !== '')
    // knapp (alle ~700 Lokale bis 30 km, ~33 KB gzip): ohne id (die Seite bildet sie aus osm) und ohne leere Felder
    .slice(0, maxWeitere).map(x => ohneLeere({ name: x.name, kueche: x.kueche, ort: x.ort, km: x.km, lat: x.lat, lon: x.lon, adresse: x.adresse, oeffnung: x.oeffnung, website: x.website, osm: x.osm }));
  return { lokale, weitere, nichtGefunden };
}

/** nächste Filiale je Kette aus OSM (null = keine im Umkreis) */
export function naechsteFilialen(ketten, osm) {
  return (ketten || []).map(k => {
    const namen = [k.brand, k.kette].filter(Boolean);
    const f = osm.filter(x => namen.some(n => passtKette(n, x))).sort((a, b) => a.km - b.km)[0];
    return f ? { ...k, naechste: { name: f.name, ort: f.ort, adresse: f.adresse || undefined, km: f.km, lat: f.lat, lon: f.lon, oeffnung: f.oeffnung, osm: f.osm } } : { ...k, naechste: null };
  });
}

/** OSM-Stand aus der alten Datei: gepflegte Lokale mit OSM-Feldern, weitere, nächste Filialen (die Datei hält kein Rohformat mehr) */
export function ausVorher(v) {
  if (!v || typeof v !== 'object') return [];
  if (Array.isArray(v.osmRoh) && v.osmRoh.length) return v.osmRoh; // ältere Datei (16.11.2026, Roh-Lauf 43831213811)
  const el = [], ids = new Set();
  const dazu = (x, amenity, marke = null) => {
    if (!x || !x.osm || ids.has(x.osm) || !Number.isFinite(x.lat) || !Number.isFinite(x.km)) return;
    ids.add(x.osm);
    el.push({ osm: x.osm, name: x.name, amenity, kueche: Array.isArray(x.kueche) ? x.kueche : [], lat: x.lat, lon: x.lon, km: x.km, ort: x.ort || '', adresse: x.adresse || '', oeffnung: x.oeffnung || '', website: x.website || null, marke });
  };
  for (const l of v.lokale || []) dazu(l, 'restaurant');
  for (const w of v.weitere || []) dazu(w, w.art || 'restaurant'); // „art“ nur in Dateien vor dem 16.11.2026 (Prüfer)
  for (const k of v.ketten || []) dazu(k.naechste && { ...k.naechste, kueche: [] }, 'fast_food', k.brand || k.kette);
  return el.sort((a, b) => a.km - b.km);
}

/**
 * Vergleichsstand für neu/nicht mehr da: die gezeigten OSM-Lokale (gepflegte mit OSM-Kennung + weitere) – seit „weitere“
 * alles im Umkreis enthält, braucht die Seiten-Datei keine eigene Liste mehr (Prüfer B8: osmIds waren 53 KB nur dafür).
 * Ältere Dateien: osmIds / osmRoh (Ketten über 5 km wie in „weitere“ ausgelassen).
 */
export function vergleichsStand(v, radiusKm = 30) {
  if (!v || typeof v !== 'object') return null;
  const alt = Array.isArray(v.osmIds) && v.osmIds.length ? v.osmIds : Array.isArray(v.osmRoh) && v.osmRoh.length ? v.osmRoh : null;
  const l = alt ? alt.filter(x => !(istKette(x) && x.km > 5)) : [...(v.lokale || []).filter(x => x && x.osm), ...(v.weitere || [])];
  const aus = l.filter(x => x && typeof x.osm === 'string' && Number.isFinite(x.km) && x.km <= radiusKm).map(x => ({ osm: x.osm, name: x.name, ort: x.ort || '', km: x.km }));
  return aus.length ? aus : null;
}

/** gemerkte Lokale von der Seite: neueste Nachricht { v: 1, essen: [ids] } im ntfy-Thema (andere Nachrichten dort: Wochen-Knaller) */
export function leseEssenMerk(text) {
  let beste = null;
  for (const zeile of String(text || '').split('\n')) {
    let n, d;
    try { n = JSON.parse(zeile); d = JSON.parse(n?.message); } catch { continue; }
    if (!n || n.event !== 'message' || !d || d.v !== 1 || !Array.isArray(d.essen)) continue;
    const time = typeof n.time === 'number' ? n.time : 0;
    if (beste && time < beste.time) continue;
    beste = { time, ids: [...new Set(d.essen.filter(x => typeof x === 'string' && /^[a-z0-9-]{2,80}$/.test(x)))].slice(0, 60) };
  }
  return beste;
}
async function holeEssenMerk({ holeText, cfg, m, zk, hinweise }) {
  const thema = typeof m.merkThema === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(m.merkThema) ? m.merkThema : null;
  if (!thema) return;
  const server = String(cfg.ntfy?.server || 'https://ntfy.sh').replace(/\/$/, '');
  try {
    const neu = leseEssenMerk(await holeText(`${server}/${thema}/json?poll=1&since=12h`, { headers: { accept: 'application/x-ndjson' } }));
    // ntfy.sh hält Nachrichten 12 h: ohne neue Nachricht bleibt die letzte Liste; nichts Älteres über Neueres
    if (neu && !(neu.time * 1000 < Date.parse(zk.merkStand || '') )) { zk.gemerkt = neu.ids; zk.merkStand = new Date(neu.time * 1000).toISOString(); }
  } catch (e) { hinweise.push(`Merkliste: ${String(e.message || e).slice(0, 120)}`); }
}

/** 23:59 Berliner Zeit an `tag` mit dem richtigen Versatz (Winter +01:00, Sommer +02:00) */
export function tagesEnde(tag) {
  const h = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', hour: '2-digit', hourCycle: 'h23' }).format(new Date(`${tag}T12:00:00Z`)));
  return `${tag}T23:59:00+${String(h - 12).padStart(2, '0')}:00`;
}

const WT = ['', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const wochentagVon = tag => new Date(tag + 'T12:00:00Z').getUTCDay() || 7;
const karteLink = l => (Number.isFinite(l.lat) ? `https://www.openstreetmap.org/?mlat=${l.lat}&mlon=${l.lon}#map=18/${l.lat}/${l.lon}` : `https://www.openstreetmap.org/search?query=${encodeURIComponent([l.name || l.titel, l.ort].filter(Boolean).join(' '))}`);

/** All-you-can-eat oder feste Tagesaktion (Tagesessen, XXL mit Wochentagen) heute bei gemerkten Lokalen (ids aus vorteile/essen.json und mein-vorteil/essen.json) */
export function ayceHeute({ liste, seite, gemerkt, tag }) {
  const wt = wochentagVon(tag);
  const g = new Set(Array.isArray(gemerkt) ? gemerkt : []);
  const aus = [];
  for (const l of liste?.lokale || []) {
    if (!g.has(l.id) || !l.ayce || !Array.isArray(l.ayce.wochentage) || !l.ayce.wochentage.includes(wt)) continue;
    aus.push({ id: l.id, name: l.name, ort: l.ort, zeit: l.ayce.text || '', preis: l.ayce.preis || '', link: karteLink(l), art: 'ayce' });
  }
  for (const e of seite?.eintraege || []) {
    if (!g.has(e.id) || !['ayce', 'lokal', 'xxl'].includes(e.rubrik) || e.nurHinweis || !Array.isArray(e.wochentage) || !e.wochentage.includes(wt)) continue;
    if (e.rubrik !== 'ayce' && e.wochentage.length >= 7) continue; // jeden Tag = keine Erinnerung wert
    if ((e.bis && e.bis < tag) || (e.ab && e.ab > tag)) continue;
    aus.push({ id: e.id, name: e.titel, ort: e.ort || '', zeit: e.zeit?.text || '', preis: e.preis || '', link: e.quellen?.[0]?.url || karteLink(e), art: e.rubrik === 'ayce' ? 'ayce' : 'tag' });
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
  const altOsm = (a => (a.length ? a : null))(ausVorher(vorherDatei)); // leer = kein Stand
  // für neu/weg: die gezeigten OSM-Lokale der alten Datei (alle im Umkreis)
  const altIds = vergleichsStand(vorherDatei, radiusKm);
  // !('osmStand' in zk): Zustand von vor dem Befund B6 kennt nur die Abrufzeit -> einmal neu holen, damit der echte Stand dasteht
  const faellig = !altOsm || !zk.osmZeit || !('osmStand' in zk) || jetztMs - Date.parse(zk.osmZeit) >= m.osmStunden * 3600e3;
  if (faellig) {
    try {
      const url = `${m.overpass}?data=${encodeURIComponent(overpassAbfrage(z, radiusKm, kettenRadiusKm))}`;
      const d = JSON.parse(await holeText(url, { headers: { accept: 'application/json' }, timeoutMs: m.timeoutMs }));
      osm = leseOsm(d, z);
      if (!osm.length) throw new Error('Overpass: 0 Lokale (Abfrage geändert?)');
      zk.osmZeit = new Date(jetztMs).toISOString(); // Abruf
      zk.osmStand = osmStandAus(d); // Datenstand von OpenStreetMap (Prüfer R6, Rest von B6: vorher die Abrufzeit)
    } catch (e) {
      // mit altem Stand nur ein Hinweis (die Seite zeigt den letzten Stand), ohne einen echten Fehler
      (altOsm ? hinweise : fehler).push(`OpenStreetMap: ${String(e.message || e).slice(0, 160)}`);
      osm = null;
    }
  }
  if (!osm && altOsm) { osm = altOsm; alt = faellig; }
  osm ||= [];

  // 2) zusammenführen, Ketten, neu/verschwunden (nur wenn frisch abgefragt und es einen alten Stand gibt)
  const { lokale, weitere, nichtGefunden } = fuehreZusammen(liste, osm, { radiusKm, maxWeitere: m.maxWeitere });
  const ketten = naechsteFilialen(liste.ketten, osm);
  let neu = vorherDatei?.neu || [], weg = vorherDatei?.weg || [];
  if (osm.length && !alt && faellig && altIds) {
    const jetztListe = vergleichsStand({ lokale, weitere }, radiusKm) || [];
    const vorIds = new Set(altIds.map(x => x.osm));
    const jetztIds = new Set(jetztListe.map(x => x.osm));
    const tage = t => (Date.parse(tag) - Date.parse(t)) / 864e5;
    const frischNeu = jetztListe.filter(x => !vorIds.has(x.osm)).map(x => ({ ...x, seit: tag }));
    const frischWeg = altIds.filter(x => !jetztIds.has(x.osm)).map(x => ({ ...x, seit: tag }));
    // „neu“ bleibt 14 Tage stehen (solange das Lokal da ist), „nicht mehr da“ 30 Tage (solange es nicht wiederkommt)
    neu = [...frischNeu, ...neu.filter(x => x.seit && tage(x.seit) <= 14 && jetztIds.has(x.osm) && !frischNeu.some(y => y.osm === x.osm))];
    weg = [...frischWeg, ...weg.filter(x => x.seit && tage(x.seit) <= 30 && !jetztIds.has(x.osm) && !frischWeg.some(y => y.osm === x.osm))];
    // Rauschen vermeiden: ein Abruf, der fast alles „neu“ meldet, ist ein Abfrage-Wechsel, kein Neubau
    if (frischNeu.length > 25) { hinweise.push(`OSM: ${frischNeu.length} „neue“ Lokale – Abfrage geändert, nicht als neu gezählt`); neu = neu.filter(x => !frischNeu.includes(x)); }
    if (frischWeg.length > 25) { hinweise.push(`OSM: ${frischWeg.length} „verschwundene“ Lokale – Abfrage geändert, nicht gezählt`); weg = weg.filter(x => !frischWeg.includes(x)); }
  }
  if (nichtGefunden.length && osm.length) hinweise.push(`in OSM nicht gefunden: ${nichtGefunden.join(', ')}`.slice(0, 300));

  // 3) Push: heute All-you-can-eat / Tagesaktion bei gemerkten Lokalen (Stern auf der Seite + config), nur am Tag selbst, tagsüber
  await holeEssenMerk({ holeText, cfg, m, zk, hinweise });
  const gemerkt = [...new Set([...(Array.isArray(m.gemerkt) ? m.gemerkt : []), ...(Array.isArray(zk.gemerkt) ? zk.gemerkt : [])])];
  if (stunde >= m.pushVon && stunde < m.pushBis && gemerkt.length) {
    if (!seite && m.seiteUrl) { try { seite = JSON.parse(await holeText(m.seiteUrl, { headers: { accept: 'application/json' } })); } catch (e) { hinweise.push(`Seiten-Daten: ${String(e.message || e).slice(0, 120)}`); } }
    for (const a of ayceHeute({ liste, seite, gemerkt, tag })) {
      eintraege.push({
        id: `essen-ayce-${a.id}-${tag}`, kategorie: 'essen', titel: `${a.art === 'ayce' ? 'Heute All-you-can-eat' : 'Heute'}: ${a.name}`.slice(0, 140),
        zeile: [`${WT[wochentagVon(tag)]} ${tag.slice(8, 10)}.${tag.slice(5, 7)}.`, a.zeit, a.ort, a.preis].filter(Boolean).join(' · ').slice(0, 200),
        soGehts: 'Gemerktes Lokal: Zeiten und Preis vorher kurz prüfen (anrufen oder Seite des Lokals) – Bedingungen ändern sich.',
        link: a.link, quelle: 'Essen', wert: 55, sofort: true, datum: new Date(jetztMs).toISOString(), bis: tagesEnde(tag),
      });
    }
  }

  const mitZeiten = lokale.filter(l => l.oeffnung).length + weitere.filter(l => l.oeffnung).length;
  const datei = {
    version: 1, aktualisiert: new Date(jetztMs).toISOString(), stand: liste.stand || null,
    // osmStand = Stand der OSM-Daten (osm3s.timestamp_osm_base), abgerufen = Zeit des Abrufs – wie bei den Filialen
    osmStand: 'osmStand' in zk ? zk.osmStand || null : vorherDatei?.osmStand || null, abgerufen: zk.osmZeit || vorherDatei?.abgerufen || null,
    quelle: { name: 'OpenStreetMap-Mitwirkende', lizenz: 'ODbL', url: 'https://www.openstreetmap.org/copyright' },
    zentrum: z, radiusKm, kettenRadiusKm, lokale, weitere, ketten, neu, weg, nichtGefunden,
  };
  const kurz = `${lokale.length + weitere.length} Lokale bis ${radiusKm} km · ${mitZeiten} mit Öffnungszeiten${neu.length ? ` · ${neu.length} neu` : ''}`;
  if (alt) hinweise.push('OpenStreetMap gerade nicht erreichbar – letzter Stand');
  return { eintraege, fehler, hinweise, datei, kurz, zahl: { n: lokale.length + weitere.length, wort: 'Lokale' } };
}
