// Modul "filialen": wo gibt es welchen Markt? (Xander 16.11.2026: „Es sollen Märkte sein, die wirklich in Döbeln sind. Prüfe,
// ob Aldi Nord überhaupt zu Döbeln gehört oder REWE – sonst ausblenden … Besser noch: anhand von GPS, Ort oder dem, was der
// Browser erkennt – je nachdem, von wo ich die App öffne – nur die Märkte zeigen, die für diese Gegend in Frage kommen.“)
// Höchstens alle intervallStunden (Woche) EINE Overpass-Abfrage an OpenStreetMap (ODbL, öffentlich, ohne Schlüssel): alle
// Filialen der Märkte aus module.knaller.maerkte (Marke über brand:wikidata, brand oder name) in Sachsen und den
// Nachbarländern Thüringen, Sachsen-Anhalt, Brandenburg innerhalb des Rahmens bbox (also nicht Tschechien/Polen).
// Ergebnis <data>/filialen.json: je Markt [Breite, Länge, „Straße Nr, Ort“] (4 Nachkommastellen = etwa 10 m) und je Markt
// die nächste Filiale von Döbeln aus (Luftlinie) samt Zahl der Filialen bis nahKm. Die Seite (Reiter „Woche“) lädt die Datei
// nur nach „Standort verwenden“ (die Position bleibt auf dem Gerät); der Knaller nimmt daraus die nächste Filiale, wenn
// kaufDA keine nennt (REWE hat keine Döbelner Händlerseite, Roh-Lauf 43837748020: /Doebeln/REWE/p-r101 = 404).
// Ehrlich: „Netto“ ohne Zusatz (könnte Netto mit dem Scottie sein), ALDI SÜD, „to go“-Läden und Tankstellen-Shops zählen nicht.
// Fällt Overpass aus, bleibt die alte Datei stehen (Hinweis, keine Störung, solange es einen Stand gibt).

export const STANDARD = {
  overpass: 'https://overpass-api.de/api/interpreter',
  // Roh-Lauf 43842880618 (16.11.2026): overpass-api.de „at capacity“ (502) -> einmal die nächste öffentliche Instanz
  // (Liste im OSM-Wiki „Overpass API“), nach einer Pause; eine Abfrage pro Woche.
  overpassWeitere: ['https://overpass.private.coffee/api/interpreter'],
  pauseMs: 3000,
  timeoutMs: 130000, // Overpass rechnet bis [timeout:120]
  zentrum: { name: 'Döbeln', lat: 51.1211, lon: 13.1229 }, // kaufDA-Stadtmitte Döbeln (Roh-Lauf 43793492110)
  laender: ['DE-SN', 'DE-TH', 'DE-ST', 'DE-BB'],
  bbox: [50.15, 11.6, 51.75, 15.1], // Süd, West, Nord, Ost: Sachsen mit gut 30 km Rand
  nahKm: 10,
  umkreisKm: 10, // wie nahKm: mit 15 käme REWE (Leisnig, 15 km) in Döbeln wieder dazu (Roh-Lauf 43843865340)
  minFilialen: 20, // weniger = Abfrage kaputt (echt: weit über 1000 im Gebiet)
};

// Marken je Markt-id. wikidata = Name-Suggestion-Index; marken = OSM brand (ganz, Groß/klein egal); namen = Anfang des
// OSM-Namens, nur wo eindeutig. nicht = Marken/ids, die ausdrücklich NICHT gemeint sind.
export const MARKEN = {
  'aldi-nord': { wikidata: ['Q41171373'], marken: ['aldi nord', 'aldi'], namen: ['aldi'] },
  lidl: { wikidata: ['Q151954'], marken: ['lidl'], namen: ['lidl'] },
  kaufland: { wikidata: ['Q685967'], marken: ['kaufland'], namen: ['kaufland'] },
  netto: { wikidata: ['Q879858'], marken: ['netto marken-discount'], namen: ['netto marken-discount', 'netto filiale'] },
  penny: { wikidata: ['Q284688'], marken: ['penny', 'penny markt', 'penny-markt'], namen: ['penny'] },
  rewe: { wikidata: ['Q16968817'], marken: ['rewe', 'rewe city', 'rewe center', 'rewe markt'], namen: ['rewe'] },
  marktkauf: { wikidata: ['Q1533254'], marken: ['marktkauf'], namen: ['marktkauf'] },
};
const NICHT_WIKIDATA = new Set(['Q41171672', 'Q552652']); // ALDI SÜD, Netto (Scottie)
const NICHT_TEXT = /\bto\s*go\b|tankstelle|aldi\s*s(?:ü|ue)d|getränke|getraenke/i;
const SHOPS = /^(supermarket|discount|hypermarket|department_store|wholesale)$/;

const esc = s => String(s).replace(/[.*+?^${}()|[\]\\"]/g, '\\$&');
export function km(a, b) {
  const r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}
const kmRund = v => Math.round(v * 10) / 10;

/** Eine Overpass-Abfrage: Länder (ISO3166-2) geschnitten mit dem Rahmen; Treffer über brand:wikidata, brand oder name */
export function overpassAbfrage(ids, { laender = STANDARD.laender, bbox = STANDARD.bbox } = {}) {
  const wd = ids.flatMap(id => MARKEN[id]?.wikidata || []);
  const br = ids.flatMap(id => MARKEN[id]?.marken || []);
  const na = ids.flatMap(id => MARKEN[id]?.namen || []);
  const b = bbox.join(',');
  const a = '(area.a)';
  return `[out:json][timeout:120];area["ISO3166-2"~"^(${laender.map(esc).join('|')})$"]->.a;(`
    + `nwr["shop"]["brand:wikidata"~"^(${wd.join('|')})$"]${a}(${b});`
    + `nwr["shop"]["brand"~"^(${br.map(esc).join('|')})$",i]${a}(${b});`
    + `nwr["shop"]["name"~"^(${na.map(esc).join('|')})",i]${a}(${b});`
    + ');out center tags qt;';
}

/** Welcher Markt ist dieses OSM-Objekt? (null = keiner der Märkte oder nicht eindeutig) */
export function marktVon(t, ids = Object.keys(MARKEN)) {
  if (!t || !SHOPS.test(String(t.shop || ''))) return null;
  const wd = String(t['brand:wikidata'] || '').trim();
  if (NICHT_WIKIDATA.has(wd)) return null;
  const brand = String(t.brand || '').trim().toLowerCase(), name = String(t.name || '').trim().toLowerCase();
  if (NICHT_TEXT.test(brand) || NICHT_TEXT.test(name)) return null;
  for (const id of ids) if (wd && MARKEN[id]?.wikidata.includes(wd)) return id;
  if (wd) return null; // andere Marke laut Wikidata
  for (const id of ids) if (brand && MARKEN[id]?.marken.includes(brand)) return id;
  if (brand && brand !== name) return null; // fremde Marke (z. B. „Netto“ = Scottie), auch wenn der Name passt
  for (const id of ids) if (MARKEN[id]?.namen.some(n => name === n || name.startsWith(`${n} `) || name.startsWith(`${n}-`) || name.startsWith(`${n},`))) return id;
  return null;
}

function adresseVon(t) {
  const str = [t['addr:street'] || t['addr:place'] || '', t['addr:housenumber'] || ''].join(' ').trim();
  const ort = String(t['addr:city'] || t['addr:suburb'] || '').trim();
  return [str, ort].filter(Boolean).join(', ').replace(/\s+/g, ' ').slice(0, 60);
}

/** Overpass-JSON -> { <markt-id>: [[lat, lon, adresse], …] } (doppelte Objekte – Gebäude + Punkt – unter 60 m zusammengelegt) */
export function leseFilialen(text, ids = Object.keys(MARKEN)) {
  const d = typeof text === 'string' ? JSON.parse(text) : text;
  if (!d || !Array.isArray(d.elements)) throw new Error('Overpass: Antwort ohne elements');
  const aus = Object.fromEntries(ids.map(id => [id, []]));
  const gesehen = new Set();
  for (const e of d.elements) {
    const k = `${e.type}/${e.id}`;
    if (gesehen.has(k)) continue;
    gesehen.add(k);
    const t = e.tags || {};
    const id = marktVon(t, ids);
    if (!id) continue;
    const lat = Number(e.lat ?? e.center?.lat), lon = Number(e.lon ?? e.center?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const p = { lat: Math.round(lat * 1e4) / 1e4, lon: Math.round(lon * 1e4) / 1e4 };
    const liste = aus[id];
    const doppelt = liste.find(x => km({ lat: x[0], lon: x[1] }, p) < 0.06);
    const adr = adresseVon(t);
    if (doppelt) { if (!doppelt[2] && adr) doppelt[2] = adr; continue; }
    liste.push([p.lat, p.lon, adr]);
  }
  for (const id of ids) aus[id].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  return aus;
}

/** je Markt: nächste Filiale vom Punkt aus und Zahl bis nahKm (null = keine im Gebiet) */
export function naechste(filialen, punkt, nahKm = STANDARD.nahKm) {
  const aus = {};
  for (const [id, liste] of Object.entries(filialen || {})) {
    let best = null, nah = 0;
    for (const f of Array.isArray(liste) ? liste : []) {
      const d = km(punkt, { lat: f[0], lon: f[1] });
      if (d <= nahKm) nah++;
      if (!best || d < best.km) best = { km: d, adresse: f[2] || '' };
    }
    aus[id] = best ? { km: kmRund(best.km), adresse: best.adresse, nah } : null;
  }
  return aus;
}

export default async function filialen({ holeText, cfg, jetzt = new Date(), zustand = {}, vorherDatei = null }) {
  const m = { ...STANDARD, ...(cfg.module?.filialen || {}) };
  const maerkte = (cfg.module?.knaller?.maerkte || []).filter(x => x && MARKEN[x.id]);
  const ids = maerkte.map(x => x.id);
  const namen = Object.fromEntries(maerkte.map(x => [x.id, x.name]));
  const fehler = [], hinweise = [];
  const jetztMs = new Date(jetzt).getTime();
  const zk = (zustand.filialen ||= {});
  if (!ids.length) return { eintraege: [], fehler: ['module.knaller.maerkte fehlt'] };
  let f = null;
  const abfrage = encodeURIComponent(overpassAbfrage(ids, m));
  const server = [m.overpass, ...(Array.isArray(m.overpassWeitere) ? m.overpassWeitere : [])].filter(Boolean);
  const probleme = [];
  for (const [i, basis] of server.entries()) {
    if (i && m.pauseMs) await new Promise(r => setTimeout(r, m.pauseMs));
    try {
      const l = leseFilialen(await holeText(`${basis}?data=${abfrage}`, { headers: { accept: 'application/json' }, timeoutMs: m.timeoutMs }), ids);
      const zahl = Object.values(l).reduce((s, x) => s + x.length, 0);
      if (zahl < m.minFilialen) throw new Error(`Overpass: nur ${zahl} Filialen (Abfrage geändert?)`);
      f = l;
      zk.osmZeit = new Date(jetztMs).toISOString();
      zk.server = new URL(basis).host;
      break;
    } catch (e) {
      probleme.push(`${new URL(basis).host}: ${String(e.message || e).slice(0, 120)}`);
      if (/nur \d+ Filialen/.test(String(e.message))) break; // Antwort da, aber leer: kein zweiter Server nötig
    }
  }
  if (!f) (vorherDatei?.maerkte ? hinweise : fehler).push(`OpenStreetMap: ${probleme.join(' · ')}`.slice(0, 300));
  if (!f) {
    if (!vorherDatei?.maerkte) return { eintraege: [], fehler, hinweise };
    return { eintraege: [], fehler, hinweise: [...hinweise, 'letzter Stand bleibt'], datei: null, kurz: vorherDatei.kurz || '' };
  }
  const z = m.zentrum;
  const vonZentrum = naechste(f, z, m.nahKm);
  const zahlen = Object.fromEntries(ids.map(id => [id, f[id].length]));
  for (const id of ids) if (!f[id].length) hinweise.push(`${namen[id]}: keine Filiale im Gebiet gefunden`);
  const nahNamen = ids.filter(id => vonZentrum[id] && vonZentrum[id].km <= m.nahKm).map(id => namen[id]);
  const fern = ids.filter(id => !(vonZentrum[id] && vonZentrum[id].km <= m.nahKm))
    .map(id => `${namen[id]}${vonZentrum[id] ? ` (nächste ${String(vonZentrum[id].km).replace('.', ',')} km)` : ''}`);
  const kurz = `${nahNamen.length} Märkte bis ${m.nahKm} km um ${z.name}${fern.length ? ` · weiter weg: ${fern.join(', ')}` : ''}`;
  const datei = {
    version: 1, aktualisiert: new Date(jetztMs).toISOString(), osmStand: zk.osmZeit, server: zk.server,
    quelle: { name: 'OpenStreetMap-Mitwirkende', lizenz: 'ODbL', url: 'https://www.openstreetmap.org/copyright' },
    gebiet: `Sachsen, Thüringen, Sachsen-Anhalt, Brandenburg im Rahmen ${m.bbox.join(', ')}`, bbox: m.bbox,
    zentrum: z, nahKm: m.nahKm, umkreisKm: m.umkreisKm,
    namen, zahlen, naechsteVomZentrum: vonZentrum, maerkte: f,
  };
  return { eintraege: [], fehler, hinweise, datei, kurz };
}
