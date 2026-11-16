// Modul "knaller": die krassesten Angebote der Woche je Markt (Xander 16.11.2026: „je Markt die krassesten Angebote der Woche –
// Aldi, Netto, Marktkauf, Kaufland, Penny, Lidl, Rewe – gestaffelt ab 30 / 40 / 50 % Rabatt, als Kacheln mit Produktbild“).
// Quelle: kaufDA (Bonial), Datenblock __NEXT_DATA__ (lib/kaufda.mjs). Ortsbezug (Roh-Lauf 43793492110, 16.11.2026): die
// Orts-Händlerseite https://www.kaufda.de/<Stadt>/<Händler>/p-r<id> (z. B. /Doebeln/Kaufland/p-r2801) liefert die Prospekte
// dieser Stadt und die nächste Filiale; /Geschaefte/<Händler> ist immer Berlin 10178. Reihenfolge je Markt: orte aus der
// config (Döbeln, dann Chemnitz, Leipzig), erst danach bundesweit – dann mit Hinweis „in Döbeln prüfen“ (regional = true).
// Ist die nächste Filiale weiter als maxFilialeKm (oder gibt es keine), heißt es „kein Markt in der Nähe“ (Hinweis, keine
// Störung, keine bundesweiten Angebote dieses Markts).
// Ehrlich (Bestandsaufnahme 16.11.2026): Prozent NUR mit Vergleichspreis aus der Quelle (secondaryPrice > Preis); dazu immer
// die Art: 'streich' (Streichpreis im Prospekt) oder 'uvp' (Herstellerpreis – im Mitschnitt die meisten großen Prozente).
// ab-Preis (priceRange): „bis zu −n %“ (abPreis = true), abschaltbar mit module.knaller.abPreise = false.
// App-/Karten-Preise (Penny App, Lidl Plus, Kaufland Card, PAYBACK …) -> app = true (die Seite kennzeichnet sie).
// Kein Eintrag in aktuell.json (keine Pushes); eigene Datei <data>/knaller.json (Rückgabefeld „datei“) und eine Übersicht in
// status.knaller.kurz für die Start-Kachel. Bilder nur als Link (https, Prospekt-Ausschnitt von content-media.bonial.biz).
// Fällt eine Händlerseite aus (oder kommt sie ohne ein einziges Angebot), bleiben deren noch gültige Angebote aus der
// letzten Datei stehen (mit „alt“ im Status); mehrere leere Seiten = Störung (Aufbau geändert?); status.kaufda.roh =
// gelesene Angebote des Markts je Seite.
// Prüfer 16.11.2026: Rabatt abgerundet (29,5 % ist nicht „ab 30 %“); ohne UVP-Kennzeichen vorherArt 'unbekannt' (kein
// Goldrahmen); Doppel aus parallelen Prospekten desselben Markts über Bilddatei und Marke/Preis/Vergleichspreis/Ende erkannt.
// Xander 16.11.2026 (2. Runde): „Gelten die Angebote wirklich für die Woche? Staffel 20/30/40/50 %. Was erst Ende der Woche
// kommt, anders kennzeichnen … Bist du sicher, dass alle Angebote drin sind? Bei Aldi Nord die Crunchips mit 50 % finde ich
// nicht.“ Befund (Roh-Läufe 43797380195 und 43818792502): die Döbelner Händlerseite zeigt nur 16 von z. B. 359 Aldi-Angeboten;
// die Crunchips (0,99 statt 1,99 UVP, Seite 20 des Döbelner Aldi-Prospekts) standen nie darauf. Darum jetzt zusätzlich:
//  - Stichwortseiten /Angebote/<Begriff> (bundesweit, bis 16 Angebote je Begriff) – ein Angebot zählt nur, wenn seine
//    Prospekt-id (parentContent.id) einer der Prospekte ist, die die Döbelner Händlerseite nennt (= derselbe Prospekt);
//    je Lauf höchstens maxStichwortSeiten Begriffe, die am längsten nicht gelesenen zuerst (Merkworte immer);
//  - Sammeln über die Läufe der Woche: noch gültige Angebote aus Döbelner Prospekten bleiben stehen (Pool), bis sie ablaufen
//    oder ihr Prospekt nicht mehr genannt wird;
//  - Gültigkeit je Angebot: kaufDA kennt nur die Prospekt-Gültigkeit (Mo–Sa); „ab Donnerstag“/„Fr.+Sa.“/„Wochenende“ im Text
//    und – wo vorhanden – der Starttag aus marktguru (PLZ 04720, je Angebot, z. B. Lidl Doritos ab 19.11.) setzen gueltigAb;
//  - ohne Vergleichspreis in der Quelle: „statt …“ im Text oder der Vergleichspreis desselben Produkts im selben Markt aus
//    früheren Läufen (zustand.knaller.preise) -> vorherArt 'geschaetzt' (Seite: grau, „geschätzt“). Nie erfundene Prozente;
//  - Staffel ab 20 % (minProzent 20, Seite startet bei 30);
//  - Roh-Lauf 43821908194 (16.11.2026): die Stichwortseiten zeigen bei Lidl, Penny, Kaufland und Netto die Berliner Prospekte
//    (andere Prospekt-ids als Döbeln), nur Aldi Nord hat einen Prospekt für alle. Ein solches Angebot zählt darum nur, wenn
//    marktguru es für PLZ 04720 bestätigt (gleicher Markt, gleicher Preis, Marke/Produkt) -> bestaetigt 'marktguru', mit dem
//    Starttag von dort (z. B. Lidl Pepsi Zero 0,99 statt 1,79 UVP ab Do 19.11.). Ohne Bestätigung bleibt es draußen.
import { leseKaufdaSeite, kaufdaZeit, kaufdaSlug } from '../lib/kaufda.mjs';
import { norm, schluessel, round, parsePrice } from '../lib/text.mjs';
import { berlinTag } from '../lib/ende.mjs';

export const STANDARD = {
  basis: 'https://www.kaufda.de',
  geschaefte: '/Geschaefte/{slug}',
  ortsSeite: '/{ort}/{slug}/p-r{id}',
  orte: ['Döbeln', 'Chemnitz', 'Leipzig'],
  ort: 'Döbeln',
  maxFilialeKm: 30,
  nahKm: 10, // Xander 16.11.2026: nur Märkte mit Filiale bis nahKm um Döbeln zeigt die Seite sofort, die übrigen unter „weitere Märkte“
  minProzent: 20,
  stufen: [20, 30, 40, 50],
  maxJeMarkt: 60,
  maxProzent: 85, // mehr Rabatt ist im Prospekt nicht plausibel (Tippfehler in den Daten) -> keine Prozentangabe
  abPreise: true,
  // Stichwortseiten (bundesweit) für die übrigen Angebote der Döbelner Prospekte
  stichwortPfad: '/Angebote/{slug}',
  stichworte: [],
  maxStichwortSeiten: 20,
  stichwortLeerTage: 7, // 404 („keine Angebote zu …“) -> so lange nicht noch einmal fragen
  merkworte: [], // dauerhafte Wünsche (wie wunschliste.json): Treffer = gemerkt, Erinnerung am ersten Gültigkeitstag
  verlaufTage: 120, // Vergleichspreise aus früheren Läufen so lange merken
  marktguru: null, // { aktiv, start, api, plz, limit }: Starttag je Angebot (nur Gültigkeit, keine Preise)
};

const TAG_NR = { mo: 1, montag: 1, di: 2, dienstag: 2, mi: 3, mittwoch: 3, do: 4, donnerstag: 4, fr: 5, freitag: 5, sa: 6, samstag: 6 };
/**
 * Starttag aus dem Text („ab Donnerstag“, „ab Do.“, „Fr. + Sa.“, „Freitag und Samstag“, „Wochenend-Knüller“) -> { tag 1–6,
 * wochenende } oder null. Nur eindeutige Formen – „Montag bis Samstag“ ist kein später Start.
 */
export function startHinweis(text) {
  const t = String(text || '').toLowerCase();
  if (!t) return null;
  const wochenende = /wochenend|weekend/.test(t);
  const frsa = /\b(?:fr|freitag)\.?\s*(?:\+|&|und|\/|-|–|bis)\s*(?:sa|samstag)\b/.test(t);
  const ab = t.match(/\bab\s+(mo(?:ntag)?|di(?:enstag)?|mi(?:ttwoch)?|do(?:nnerstag)?|fr(?:eitag)?|sa(?:mstag)?)\b\.?/);
  if (ab) { const tag = TAG_NR[ab[1]]; return { tag, wochenende: wochenende || tag >= 5 }; }
  if (frsa) return { tag: 5, wochenende: true };
  if (wochenende) return { tag: 5, wochenende: true };
  return null;
}

const STD = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', hour: '2-digit', hourCycle: 'h23' });
/** 00:00 Berliner Zeit des Kalendertags (YYYY-MM-DD) als ISO */
export function berlinMitternacht(tag) {
  const [y, mo, d] = String(tag).split('-').map(Number);
  if (!y || !mo || !d) return null;
  const roh = Date.UTC(y, mo - 1, d, 0, 0);
  // Versatz Berlin (1 oder 2 h) an diesem Tag: was zeigt die Berliner Uhr um roh (UTC-Mitternacht)?
  const h = Number(STD.formatToParts(new Date(roh)).find(x => x.type === 'hour')?.value);
  return new Date(roh - h * 3600e3).toISOString();
}
const WT = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Berlin', weekday: 'short' });
const WT_NR = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
/** erster Tag mit Wochentag `tag` (1 = Mo) ab dem Prospektbeginn `abIso` (Berlin), höchstens 6 Tage später -> ISO 00:00 */
export function tagAb(abIso, tag) {
  const t0 = Date.parse(abIso || '');
  if (!Number.isFinite(t0) || !(tag >= 1 && tag <= 6)) return null;
  for (let i = 0; i < 7; i++) {
    const t = t0 + i * 864e5 + 3 * 3600e3; // +3 h: sicher im richtigen Berliner Tag
    if (WT_NR[WT.format(new Date(t))] === tag) return i === 0 ? null : berlinMitternacht(berlinTag(new Date(t).toISOString()));
  }
  return null;
}

/** Ende der Woche von jetztMs: Montag 00:00 Berliner Zeit (ISO) – was dann oder später beginnt, kommt „ab nächster Woche“ */
export function wochenEndeIso(jetztMs) {
  const tag = berlinTag(new Date(jetztMs).toISOString());
  if (!tag) return null;
  const wt = WT_NR[WT.format(new Date(jetztMs))]; // 0 = So
  const [y, mo, d] = tag.split('-').map(Number);
  return berlinMitternacht(new Date(Date.UTC(y, mo - 1, d + (wt === 0 ? 1 : 8 - wt))).toISOString().slice(0, 10));
}

/**
 * Packungsgröße aus Titel/Beschreibung („12 x 1 Liter“, „1,75-l-Fl.“, „Je 70 g“, „165 g – 185 g“) -> „12x1000ml“, „1750ml“,
 * „70g“, „165-185g“ oder null. Grundpreise („1 kg = 3,98“) zählen nicht. Für „geschätzt“: nur dieselbe Packung vergleichen.
 */
export function mengeVon(text) {
  const t = String(text || '').toLowerCase().replace(/\u00a0/g, ' ');
  const re = /(?:(\d{1,3})\s*[x×]\s*)?(\d{1,4}(?:[.,]\d{1,3})?)\s*-?\s*(kg|g|ml|cl|l|liter)\b(?:\s*[–-]\s*(\d{1,4}(?:[.,]\d{1,3})?)\s*-?\s*(kg|g|ml|cl|l|liter)\b)?(?!\s*=)/g;
  const basis = (z, e) => { const n = Number(String(z).replace(',', '.')); const f = { kg: 1000, g: 1, ml: 1, cl: 10, l: 1000, liter: 1000 }[e]; return Number.isFinite(n) && n > 0 ? Math.round(n * f * 10) / 10 : null; };
  for (const m of t.matchAll(re)) {
    const v = basis(m[2], m[3]);
    if (v == null) continue;
    const einheit = /^(kg|g)$/.test(m[3]) ? 'g' : 'ml';
    const bis = m[4] ? basis(m[4], m[5] || m[3]) : null;
    return `${m[1] ? `${Number(m[1])}x` : ''}${v}${bis && bis !== v ? `-${bis}` : ''}${einheit}`;
  }
  return null;
}

const APP = /\bapp\b|\bcard\b|lidl\s*plus|payback|kundenkarte|mit karte|nur mit (?:der )?(?:app|karte)|coupon|deutschland\s*card|rewe[\s-]*bonus|bonus[\s-]*guthaben|mitglied/i;
// dieselben Kennzeichen im Beschreibungstext (dort ohne das allgemeine „app“/„card“, die in Produktnamen vorkommen)
const APP_TEXT = /nur mit (?:der )?(?:app|karte|card)|lidl\s*plus|mit (?:der )?\S+[ -]app\b|deutschland\s*card|payback|rewe[\s-]*bonus|bonus[\s-]*guthaben|kaufland\s*card|k-card|mitglied(?:er)?preis/i;
/** Rabatt in ganzen Prozent, abgerundet: nie mehr versprechen, als die Quelle hergibt (29,5 % ist nicht „ab 30 %“) */
export const rabattProzent = (preis, vorher) => Math.floor((1 - preis / vorher) * 100 + 1e-9);
/** Bilddatei eines Angebots (letzter Pfadteil ohne Query; „main.jpg“ ist ein Platzhalter und zählt nicht) – gleich = gleiches Foto */
export function bildDatei(u) {
  const m = /\/([^/?#]+)(?:[?#]|$)/.exec(String(u || ''));
  return m && !/^main\.\w+$/i.test(m[1]) ? m[1].toLowerCase() : null;
}
const LEER = /^\s*(?:je|pro stück|pro beutel|pro packung|stück)?\s*$/i;
const kurzText = (s, n) => { const t = String(s || '').replace(/\s+/g, ' ').trim(); return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t; };
const httpsOder = u => (typeof u === 'string' && /^https:\/\//i.test(u.trim()) ? u.trim() : null);
const haendlerKey = s => norm(s).replace(/[^a-z0-9]/g, '');

/** Händlername aus kaufDA -> Markt-id der config (oder null: „Netto mit dem Scottie“, „ALDI SÜD“, EDEKA …) */
export function marktVon(publisherName, maerkte) {
  const k = haendlerKey(publisherName);
  if (!k) return null;
  for (const m of maerkte) if ((m.haendler || [m.name]).some(h => haendlerKey(h) === k)) return m.id;
  return null;
}

/** Lebensmittel oder Non-Food aus categoryPaths (fehlt -> null) */
export function bereichVon(o) {
  const pfade = Array.isArray(o?.categoryPaths) ? o.categoryPaths : [];
  if (!pfade.length) return null;
  return pfade.some(p => Array.isArray(p) && p.some(x => /lebensmittel|getr(?:ä|ae)nke|drogerie|s(?:ü|ue)(?:ß|ss)igkeiten/i.test(String(x?.name || '')))) ? 'lebensmittel' : 'nonfood';
}

/**
 * Ein kaufDA-Angebot -> Knaller-Angebot oder { grund } (warum nicht).
 * pct nur mit Vergleichspreis aus der Quelle (secondaryPrice > mainPrice), vorherArt 'streich' | 'uvp'.
 */
export function knallerAngebot(o, { markt, seite, region, jetztMs, opt }) {
  const p = o?.prices || {};
  const preis = typeof p.mainPrice === 'number' && p.mainPrice > 0 ? p.mainPrice : null;
  if (preis == null) return { grund: 'ohne Preis' };
  const bis = kaufdaZeit(o.validUntil), ab = kaufdaZeit(o.validFrom);
  if (bis && Date.parse(bis) < jetztMs) return { grund: 'abgelaufen' };
  let vorher = typeof p.secondaryPrice === 'number' && p.secondaryPrice > preis ? p.secondaryPrice : null;
  let artText = null;
  if (vorher == null) {
    // „statt 1,99“ im Text des Prospekts = Vergleichspreis des Händlers selbst
    const m = /\bstatt\s*(?:bisher\s*)?(\d{1,3}(?:[.,]\d{1,2})?)\s*(?:€|eur)?/i.exec(`${o.description || ''} ${p.description || ''}`);
    const v = m ? parsePrice(m[1]) : null;
    if (v && v > preis) { vorher = v; artText = 'streich'; }
  }
  if (vorher == null && !opt.ohneVergleich) return { grund: 'ohne Vergleichspreis' };
  const pct = vorher != null ? rabattProzent(preis, vorher) : null;
  if (pct != null && pct > opt.maxProzent) return { grund: 'Rabatt unplausibel' };
  const abPreis = p.priceRange === true;
  if (abPreis && !opt.abPreise) return { grund: 'ab-Preis' };
  const marke = String(o.brand || '').trim();
  const name = String(o.title || '').trim();
  const titel = kurzText(marke && !norm(name).includes(norm(marke)) ? `${marke} ${name}` : name || marke, 90);
  if (!titel) return { grund: 'ohne Titel' };
  const bedingungen = (Array.isArray(p.conditions) ? p.conditions : []).map(c => String(c?.other || '').trim()).filter(c => c && !LEER.test(c));
  const app = bedingungen.some(c => APP.test(c)) || APP_TEXT.test(`${o.description || ''} ${p.description || ''}`);
  const bedingung = kurzText(bedingungen.filter(c => !APP.test(c)).join(', '), 60);
  const info = kurzText([String(o.description || '').split('\n').map(s => s.trim()).filter(Boolean).join(' '), p.priceByBaseUnit].filter(Boolean).join(' · '), 90);
  const bilder = o.offerImages?.url || {};
  // Starttag später als der Prospekt („ab Donnerstag“, „Wochenend-Knüller“): aus Titel, Beschreibung, Bedingungen, Bildtitel
  const hinweis = startHinweis([o.title, o.description, p.description, ...bedingungen, o.offerImages?.metaData?.imageTitle].filter(Boolean).join(' · '));
  const abText = hinweis ? tagAb(ab, hinweis.tag) : null;
  return {
    angebot: {
      id: o.id ? `kd:${o.id}` : `kd:${schluessel(markt, titel, preis, bis)}`,
      // Art nur, wenn die Quelle sie sagt: true = UVP, false = Streichpreis; fehlt das Feld -> 'unbekannt' (kein Goldrahmen)
      markt, titel, info, preis: round(preis), vorher: vorher != null ? round(vorher) : null,
      vorherArt: vorher == null ? null : artText || (p.secondaryPriceIsUVP === true ? 'uvp' : p.secondaryPriceIsUVP === false ? 'streich' : 'unbekannt'), pct,
      ...(artText ? { vorherQuelle: 'Prospekttext „statt“' } : {}),
      ...(abPreis ? { abPreis: true } : {}),
      app, bedingung,
      bild: httpsOder(bilder.normal) || httpsOder(bilder.thumbnail) || httpsOder(bilder.large) || null,
      ...(typeof o.parentContent?.id === 'string' && o.parentContent.id ? { prospekt: o.parentContent.id.slice(0, 40) } : {}),
      // Packungsgröße (für „geschätzt“ – nur dieselbe Packung desselben Produkts vergleichen)
      ...(mengeVon(`${name} ${o.description || ''} ${p.description || ''}`) ? { menge: mengeVon(`${name} ${o.description || ''} ${p.description || ''}`) } : {}),
      _marke: norm(marke), _bildDatei: bildDatei(bilder.large || bilder.normal || bilder.thumbnail),
      link: httpsOder(seite),
      gueltigAb: abText && (!ab || Date.parse(abText) > Date.parse(ab)) ? abText : ab, gueltigBis: bis,
      ...(abText ? { abQuelle: 'text' } : {}), ...(hinweis?.wochenende ? { wochenende: true } : {}),
      regional: true, region,
      bereich: bereichVon(o),
    },
  };
}

/** Prospekt-Orte -> Text für die Seite: nur Orte der config in ihrer Reihenfolge, „bundesweit“ zuletzt */
export function standortVon(liste, orte) {
  const da = new Set(liste);
  const out = orte.filter(o => da.has(o));
  if (da.has('bundesweit') || !out.length) out.push('bundesweit');
  return out.join('/');
}

const ist404 = e => /HTTP 404|HTTP 410/.test(String(e?.message || e));
/**
 * Online-Prospekt (Prüfer 16.11.2026: „netto-online.de – Exklusive Angebote“ steht in der Döbelner Netto-Liste; darüber kamen
 * Waschtisch 249,99 statt 819 und Whirlpool als „Markt-Knaller“ auf Platz 1). Kein Angebot im Markt -> zählt nicht.
 */
export const istOnlineProspekt = p => /online|\.de\b|versand|webshop|internet/i.test(`${p?.titel || ''}`);
/** Stichwort steht im Angebot (Titel, Marke, Beschreibung)? „Becks“ fand bei kaufDA auch „Becken“ */
export function stichwortPasst(o, w) {
  const text = norm(`${o?.brand || ''} ${o?.title || ''} ${o?.description || ''}`).replace(/\s+/g, '');
  const teile = norm(w).split(/\s+/).filter(Boolean);
  return teile.length > 0 && teile.every(x => text.includes(x));
}

/** Schlüssel desselben Produkts im selben Markt (für den Vergleichspreis aus früheren Läufen) */
export const produktKey = (markt, titel) => `${markt}|${norm(titel).replace(/[^a-z0-9]+/g, ' ').trim().slice(0, 60)}`;

/**
 * Vergleichspreis aus früheren Läufen (zustand.knaller.preise): derselbe Markt, dasselbe Produkt (Titel), dort einmal mit
 * Vergleichspreis aus dem Prospekt gesehen (Streichpreis oder UVP) -> { v, a, t } oder null. Nur wenn höher als jetzt.
 * Prüfer 16.11.2026: kaufDA-Titel sind oft nur die Marke („Coca-Cola“, „PEPSI“) – Kiste 16,99 gegen Flasche 4,99 ergab
 * „≈ −70 %“. Darum zusätzlich dieselbe Packungsgröße (menge) oder dasselbe Prospektbild (b); fehlt beides -> nichts.
 */
export function verlaufVergleich(preise, markt, titel, preis, { menge = null, bild = null } = {}) {
  const v = preise?.[produktKey(markt, titel)];
  if (!v || typeof v.v !== 'number' || !(v.v > preis)) return null;
  const gleicheMenge = !!menge && !!v.m && v.m === menge;
  const gleichesBild = !!bild && !!v.b && v.b === bild;
  return gleicheMenge || gleichesBild ? v : null;
}

/** Vergleichspreise dieses Laufs merken (nur echte aus dem Prospekt), alte nach verlaufTage weg, höchstens 3000 */
export function merkeVergleich(zk, angebote, jetztMs, tage) {
  const p = (zk.preise ||= {});
  const tag = berlinTag(new Date(jetztMs).toISOString());
  for (const a of angebote) {
    if (!a || a.vorher == null || !['streich', 'uvp', 'unbekannt'].includes(a.vorherArt)) continue;
    const b = bildDatei(a.bild);
    p[produktKey(a.markt, a.titel)] = { v: a.vorher, a: a.vorherArt, t: tag, ...(a.menge ? { m: a.menge } : {}), ...(b ? { b } : {}) };
  }
  const grenze = berlinTag(new Date(jetztMs - tage * 864e5).toISOString());
  for (const [k, v] of Object.entries(p)) if (!v || !v.t || v.t < grenze) delete p[k];
  const keys = Object.keys(p);
  if (keys.length > 3000) for (const k of keys.sort((a, b) => (p[a].t < p[b].t ? -1 : 1)).slice(0, keys.length - 3000)) delete p[k];
}

/** marktguru-Antwort -> [{ markt, preis, marke, produkt, ab, bis }] (nur Gültigkeit je Angebot, kein Vorher-Preis bei marktguru) */
export function marktguruGueltig(json, maerkte) {
  const out = [];
  for (const r of Array.isArray(json?.results) ? json.results : []) {
    const markt = marktVon(r?.advertisers?.[0]?.name || '', maerkte);
    const g = Array.isArray(r?.validityDates) ? r.validityDates[0] : null;
    if (!markt || typeof r.price !== 'number' || !g?.from) continue;
    out.push({ markt, preis: r.price, marke: norm(r.brand?.name || ''), produkt: norm(r.product?.name || ''), ab: new Date(Date.parse(g.from)).toISOString(), bis: g.to ? new Date(Date.parse(g.to)).toISOString() : null });
  }
  return out;
}
// Wörter (ab 4 Zeichen) ohne die der Marke; gleich = gleich oder eines steckt im anderen (ab 5 Zeichen: „Chips“/„Tortilla-Chips“)
const worte = (s, ohne = '') => { const weg = new Set(norm(ohne).split(/\s+/)); return norm(s).split(/[\s,.%€+]+/).filter(w => w.length > 3 && !weg.has(w)); };
const wortGleich = (x, y) => x === y || (Math.min(x.length, y.length) >= 5 && (x.includes(y) || y.includes(x)));
/** wie gut passt ein marktguru-Angebot zum Titel? -1 = gar nicht (Marke fehlt / kein Produktwort), sonst Zahl der Produktwörter */
export function marktguruWertung(a, g) {
  if (a.markt !== g.markt) return -1;
  const t = norm(a.titel);
  // Marke: steht im Titel, oder das erste Titelwort steht bei marktguru (kaufDA „Kinder Bueno“ = marktguru Ferrero „Kinder Bueno“)
  const erstes = t.split(/\s+/)[0] || '';
  const marke = (!!g.marke && t.includes(g.marke)) || (erstes.length > 2 && `${g.marke} ${g.produkt}`.split(/\s+/).includes(erstes));
  const titelWorte = worte(a.titel, `${g.marke} ${a._marke || ''}`); // _marke = Marke laut kaufDA (Storck Knoppers)
  const produktWorte = worte(g.produkt, g.marke);
  const n = produktWorte.filter(w => titelWorte.some(x => wortGleich(w, x))).length;
  // Titel nur die Marke („PEPSI“, „Pringles“) oder marktguru nennt kein eigenes Produktwort („Coca-Cola | Cola XXL“): Marke
  // reicht. Sonst muss ein Produktwort passen (Prüfer 16.11.2026: „LINDT Mini-Weihnachtsfiguren 2,99“ wurde von „Lindt
  // Weihnachtliche Kugeln 2,99“ bestätigt)
  if (!titelWorte.length || !produktWorte.length) return marke ? 0 : -1;
  return n > 0 && (marke || !g.marke) ? n : -1;
}
/** passt ein marktguru-Angebot zu einem Knaller-Angebot? gleicher Markt, gleicher Preis, Marke + Produktwort (s. o.) */
export function passtMarktguru(a, g) {
  return Math.abs(a.preis - g.preis) <= 0.005 && marktguruWertung(a, g) >= 0;
}
/**
 * bestes passendes marktguru-Angebot (gleicher Preis, Zeitraum überlappt) oder null. Führt marktguru dasselbe Produkt zur
 * selben Zeit genauer passend mit ANDEREM Preis, gilt keine Bestätigung (Kaufland Lindt Mini-Weihnachtsfiguren 3,33 für
 * PLZ 04720 – 2,99 nur mit Karte).
 */
export function marktguruTreffer(a, liste) {
  let best = null, bestN = -1, anders = -1;
  for (const g of liste) {
    if (!zeitlichPassend(a, g)) continue;
    const n = marktguruWertung(a, g);
    if (n < 0) continue;
    if (Math.abs(a.preis - g.preis) <= 0.005) { if (n > bestN) { best = g; bestN = n; } } else if (n > anders) anders = n;
  }
  return best && !(anders > bestN) ? best : null;
}

/** marktguru-Zeitraum überlappt den des Angebots (Lidl hat z. B. Chips 1,79 € diese Woche und andere ab nächster Woche) */
export const zeitlichPassend = (a, g) => !(a.gueltigBis && Date.parse(g.ab) >= Date.parse(a.gueltigBis)) && !(a.gueltigAb && g.bis && Date.parse(g.bis) <= Date.parse(a.gueltigAb));

/** nächste Filiale des Markts von Döbeln aus der Filial-Datei (OSM) -> { adresse, km, von, quelle } oder null */
export function filialeAusOsm(datei, id) {
  const f = datei?.naechsteVomZentrum?.[id];
  if (!f || typeof f.km !== 'number' || !Number.isFinite(f.km)) return null;
  return { adresse: typeof f.adresse === 'string' ? f.adresse : '', km: f.km, von: datei.zentrum?.name || 'Döbeln', quelle: 'OpenStreetMap' };
}

export default async function knaller({ holeText, cfg, jetzt = new Date(), zustand = {}, vorherDatei = null, filialenDatei = null }) {
  const m = { ...STANDARD, ...(cfg.module?.knaller || {}) };
  const maerkte = (Array.isArray(m.maerkte) ? m.maerkte : []).filter(x => x && x.id && x.kaufda);
  const jetztMs = new Date(jetzt).getTime();
  const basis = String(m.basis).replace(/\/$/, '');
  const zk = (zustand.knaller ||= {});
  delete zk.ohneStadt; // alte Regel (bis 16.11.2026): Stadt 7 Tage überspringen – gibt es nicht mehr
  const orte = (Array.isArray(m.orte) && m.orte.length ? m.orte : [m.ort]).map(o => String(o || '').trim()).filter(Boolean);
  const gleichOrt = (a, b) => !!a && !!b && kaufdaSlug(a).toLowerCase().split('-')[0] === kaufdaSlug(b).toLowerCase().split('-')[0];
  const opts = { headers: { accept: 'text/html,application/xhtml+xml' } };
  const fehler = [], hinweise = [];
  const st = { ok: true, anzahl: 0, fehler: [], abrufe: 0, seiten: {}, roh: {}, orte: {}, alt: [] };
  const jeMarkt = {};
  const info = {};
  const leer = [];
  // Prospekte der Orts-/Händlerseite je Markt (id -> { titel, ab, bis, seiten }), dazu gesehen = alle Angebote dieses Markts
  const prospekte = {};
  const gesehenIds = {};
  const optOhne = { ...m, ohneVergleich: true };
  let okSeiten = 0;
  // Doppel: dieselbe Aktion steht oft in mehreren parallelen (regionalen) Prospekten desselben Markts – mit anderer id und
  // leicht anderem Titel („Knoppers Nussriegel oder Knoppers“ / „Knoppers Nussriegel“). Gleich ist dann: dasselbe Foto, oder
  // Marke + erstes Titelwort + Preis + Vergleichspreis + Ende.
  const doppel = {};
  const nimm = (mkId, r) => {
    const { _marke, _bildDatei, ...a } = r.angebot;
    const g = (doppel[mkId] ||= new Set());
    const wort = norm(a.titel).split(/\s+/).find(w => w.length > 2 && w !== _marke) || '';
    const keys = [a.id, `t|${norm(a.titel)}|${a.preis}`, `m|${_marke}|${wort}|${a.preis}|${a.vorher}|${a.gueltigBis || ''}`];
    if (_bildDatei) keys.push(`b|${_bildDatei}`);
    if (keys.some(k => g.has(k))) return false;
    for (const k of keys) g.add(k);
    (jeMarkt[mkId] ||= []).push(a);
    return true;
  };
  for (const mk of maerkte) {
    const slug = kaufdaSlug(mk.kaufda);
    const pfad = String(m.geschaefte).replace('{slug}', slug);
    // erst die Orts-Händlerseiten (Döbeln, Chemnitz, Leipzig), zuletzt bundesweit
    const versuche = [];
    if (mk.kaufdaId) {
      for (const o of orte) versuche.push({ ort: o, url: `${basis}${String(m.ortsSeite).replace('{ort}', kaufdaSlug(o)).replace('{slug}', kaufdaSlug(mk.kaufdaOrt || mk.kaufda)).replace('{id}', String(mk.kaufdaId))}` });
    }
    versuche.push({ ort: null, url: `${basis}${pfad}` });
    let seite = null, letzterFehler = null, filiale = null, leerSeite = false, keinMarkt = false;
    const ohneOrt = [];
    for (const v of versuche) {
      let s;
      try {
        st.abrufe++;
        s = leseKaufdaSeite(await holeText(v.url, opts));
      } catch (e) {
        if (ist404(e)) { if (v.ort) { ohneOrt.push(v.ort); continue; } letzterFehler = e; break; }
        letzterFehler = e; // 503, Zeitlimit, kaputter Datenblock: nicht noch 3 weitere Seiten probieren
        break;
      }
      if (v.ort) {
        // nächste Filiale vom ersten Ort (Döbeln) aus: zu weit/keine -> kein Markt in der Nähe
        if (v.ort === orte[0]) filiale = s.filiale ? { ...s.filiale, von: v.ort } : null;
        if (v.ort === orte[0] && filiale?.km != null && filiale.km > m.maxFilialeKm) { keinMarkt = true; break; }
        const eigene = s.items.some(o => marktVon(o.publisherName, maerkte) === mk.id);
        if (eigene && (!s.ort || gleichOrt(s.ort, v.ort))) { seite = { ...s, v }; break; }
        ohneOrt.push(v.ort);
        continue;
      }
      seite = { ...s, v };
      if (!s.items.length) leerSeite = true;
      break;
    }
    if (keinMarkt) {
      hinweise.push(`${mk.name}: kein Markt in der Nähe von ${orte[0]}${filiale?.km != null ? ` (nächste Filiale ${String(filiale.km).replace('.', ',')} km)` : ''}`);
      jeMarkt[mk.id] = [];
      st.seiten[mk.id] = 0;
      st.orte[mk.id] = 'kein Markt in der Nähe';
      info[mk.id] = { link: null, ort: null, keinMarkt: true, filiale };
      continue;
    }
    // Seite gelesen, aber kein einziges Angebot darauf: einzeln = Hinweis, alte Angebote bleiben; sind es mehrere/alle
    // Seiten -> Fehler unten (Aufbau geändert?), nicht still „0“
    const roh = seite ? seite.items.filter(o => marktVon(o.publisherName, maerkte) === mk.id).length : 0;
    if (seite && leerSeite) { leer.push(mk.name); seite = null; }
    if (!seite) {
      // Ausfall: noch gültige Angebote dieses Markts aus der letzten Datei behalten
      const alt = (Array.isArray(vorherDatei?.angebote) ? vorherDatei.angebote : []).filter(a => a && a.markt === mk.id && !(a.gueltigBis && Date.parse(a.gueltigBis) < jetztMs));
      jeMarkt[mk.id] = alt;
      if (alt.length) st.alt.push(mk.id);
      const msg = `${mk.name}: ${letzterFehler ? letzterFehler.message : 'keine Seite'}`;
      if (leerSeite) hinweise.push(`${mk.name}: Seite ohne Angebote (kein Prospekt am Standort?)`);
      else if (letzterFehler && ist404(letzterFehler)) hinweise.push(`${mk.name}: keine kaufDA-Händlerseite (${pfad})`);
      else fehler.push(msg);
      st.seiten[mk.id] = 0;
      info[mk.id] = { link: null, ort: null, filiale };
      continue;
    }
    okSeiten++;
    st.roh[mk.id] = roh;
    if (!roh) hinweise.push(`${mk.name}: keine Angebote dieses Markts auf der Seite`);
    const lokal = !!seite.v.ort;
    // bundesweit (Berlin-Prospekt): sichtbar als Hinweis, jedes Angebot „regional“ (= in Döbeln prüfen)
    if (!lokal && mk.kaufdaId) hinweise.push(`${mk.name}: kein Prospekt für ${orte.join('/')} gefunden – bundesweite Angebote, in ${m.ort} prüfen`);
    const region = lokal ? seite.v.ort : seite.ort ? `bundesweit (${seite.ort})` : 'bundesweit';
    st.orte[mk.id] = lokal ? seite.v.ort : 'bundesweit';
    const link = (seite.url && /^https:\/\//.test(seite.url) ? seite.url : null) || seite.v.url;
    // Ort-Prospekt gilt für Döbeln (orte[0]) -> nicht „regional“; Nachbarstadt/bundesweit -> „in Döbeln prüfen“
    const regional = !(lokal && gleichOrt(seite.v.ort, m.ort));
    info[mk.id] = { link, ort: region, lokal: lokal ? seite.v.ort : null, filiale, gesamt: seite.gesamt ?? null, region, regional };
    // nur Prospekte, deren Angebote hier gezählt werden dürfen: die der Orts-Seite (bundesweit: die der Berliner Seite)
    const online = new Set((seite.prospekte || []).filter(istOnlineProspekt).map(p => p.id));
    if (online.size) st.online = (st.online || 0) + online.size;
    prospekte[mk.id] = new Map((seite.prospekte || []).filter(p => !online.has(p.id) && (!p.bis || Date.parse(p.bis) >= jetztMs)).map(p => [p.id, p]));
    gesehenIds[mk.id] = new Set();
    jeMarkt[mk.id] = [];
    for (const o of seite.items) {
      if (marktVon(o.publisherName, maerkte) !== mk.id) continue;
      if (online.has(o.parentContent?.id)) continue; // Online-Prospekt: nicht im Markt
      if (o.id) gesehenIds[mk.id].add(o.id);
      const r = knallerAngebot(o, { markt: mk.id, seite: link, region, jetztMs, opt: optOhne });
      if (!r.angebot) continue;
      r.angebot.regional = regional;
      nimm(mk.id, r);
    }
    st.seiten[mk.id] = jeMarkt[mk.id].length;
  }
  if (leer.length >= 2 && leer.length > okSeiten) fehler.push(`Seiten ohne Angebote (${leer.join(', ')}) – Aufbau bei kaufDA geändert?`);
  if (maerkte.length && !okSeiten && fehler.length) throw new Error(`kaufDA: keine Händlerseite gelesen – ${fehler[0]}`);

  // --- Stichwortseiten: die übrigen Angebote der Döbelner Prospekte (die Händlerseite zeigt nur 16) ------------------------
  const merkworte = (Array.isArray(m.merkworte) ? m.merkworte : []).map(w => String(w || '').trim()).filter(Boolean);
  const mitProspekt = Object.values(prospekte).some(p => p.size);
  const sw = { gelesen: 0, leer: 0, fehler: 0, treffer: 0, begriffe: [] };
  const mgListe = [];
  if (mitProspekt && (m.stichworte?.length || merkworte.length)) {
    const zeit = (zk.stichwortZeit ||= {});
    const leerBis = (zk.stichwortLeer ||= {});
    for (const [k, v] of Object.entries(leerBis)) if (!(Date.parse(v) > jetztMs)) delete leerBis[k];
    const alle = [...new Set([...merkworte, ...(m.stichworte || [])].map(w => String(w).trim()).filter(Boolean))];
    const offen = alle.filter(w => !leerBis[w]);
    // Merkworte immer, sonst die am längsten nicht gelesenen zuerst
    const fremd = []; // Angebote aus anderen (Berliner) Prospekten desselben Markts – zählen nur mit marktguru-Bestätigung
    const reihe = [...offen.filter(w => merkworte.includes(w)),
      ...offen.filter(w => !merkworte.includes(w)).sort((a, b) => (Date.parse(zeit[a] || 0) || 0) - (Date.parse(zeit[b] || 0) || 0)).slice(0, m.maxStichwortSeiten)];
    let mgKeys = null, mgAus = !m.marktguru?.aktiv;
    for (const w of reihe) {
      const url = `${basis}${String(m.stichwortPfad).replace('{slug}', kaufdaSlug(w))}`;
      let s = null;
      try { st.abrufe++; s = leseKaufdaSeite(await holeText(url, opts)); } catch (e) {
        if (ist404(e)) { sw.leer++; leerBis[w] = new Date(jetztMs + m.stichwortLeerTage * 864e5).toISOString(); } else sw.fehler++;
      }
      zeit[w] = new Date(jetztMs).toISOString();
      if (s) {
        sw.gelesen++;
        let n = 0;
        for (const o of s.items) {
          const mkId = marktVon(o.publisherName, maerkte);
          const pid = o.parentContent?.id;
          if (!mkId || !pid || !prospekte[mkId]) continue;
          if (!prospekte[mkId].has(pid)) { if (info[mkId]?.lokal && fremd.length < 400) fremd.push({ mkId, o, w }); continue; } // anderer Prospekt -> unten
          if (o.id) gesehenIds[mkId].add(o.id);
          const i = info[mkId];
          const r = knallerAngebot(o, { markt: mkId, seite: i.link, region: i.region, jetztMs, opt: optOhne });
          if (!r.angebot) continue;
          r.angebot.regional = i.regional;
          r.angebot.fund = w.slice(0, 30);
          if (nimm(mkId, r)) n++;
        }
        sw.treffer += n;
        if (n) sw.begriffe.push(w);
      }
      // marktguru (PLZ): Starttag je Angebot – nur, wenn die Schlüssel der Web-Seite da sind (wie im Schnäppchen-Wecker)
      if (!mgAus) {
        try {
          if (!mgKeys) {
            const h = await holeText(m.marktguru.start, {});
            const a = h.match(/"apiKey"\s*:\s*"([^"]+)"/), c = h.match(/"clientKey"\s*:\s*"([^"]+)"/);
            if (!a || !c) throw new Error('marktguru: Schlüssel nicht gefunden');
            mgKeys = { apiKey: a[1], clientKey: c[1] };
          }
          const u = `${m.marktguru.api}?as=web&limit=${m.marktguru.limit ?? 48}&offset=0&q=${encodeURIComponent(w)}&zipCode=${m.marktguru.plz || cfg.plz}`;
          mgListe.push(...marktguruGueltig(JSON.parse(await holeText(u, { headers: { 'x-apikey': mgKeys.apiKey, 'x-clientkey': mgKeys.clientKey, accept: 'application/json' } })), maerkte));
        } catch (e) { mgAus = true; hinweise.push(`marktguru (Starttag je Angebot): ${String(e?.message || e).slice(0, 80)}`); }
      }
    }
    sw.begriffe = sw.begriffe.slice(0, 40);
    // anderer Prospekt desselben Markts: nur mit Bestätigung durch marktguru (PLZ, gleicher Preis, Marke/Produkt, Zeitraum)
    let bestaetigt = 0;
    for (const { mkId, o, w } of fremd) {
      const i = info[mkId];
      const r = knallerAngebot(o, { markt: mkId, seite: i.link, region: i.region, jetztMs, opt: m });
      if (!r.angebot) continue;
      const a = r.angebot;
      const g = marktguruTreffer(a, mgListe);
      if (!g) continue;
      // Stichwort muss im Angebot stehen oder bei marktguru („Becks“ fand bei kaufDA auch „Becken“; Duplo ist Ferrero)
      if (!stichwortPasst(o, w) && !stichwortPasst({ title: `${g.marke} ${g.produkt}` }, w)) continue;
      a.regional = i.regional; a.fund = w.slice(0, 30); a.bestaetigt = 'marktguru';
      if (nimm(mkId, r)) bestaetigt++;
    }
    if (fremd.length) sw.fremd = { gesehen: fremd.length, bestaetigt };
  }

  // --- Sammeln über die Woche: noch gültige Angebote aus Döbelner Prospekten der letzten Datei bleiben ------------------
  let ausPool = 0;
  for (const a of Array.isArray(vorherDatei?.angebote) ? vorherDatei.angebote : []) {
    if (!a || !a.markt || !prospekte[a.markt] || st.alt.includes(a.markt)) continue;
    if (a.gueltigBis && Date.parse(a.gueltigBis) < jetztMs) continue;
    // Prospekt nicht mehr genannt -> weg (von marktguru für Döbeln bestätigte bleiben bis zu ihrem Ende)
    if (a.bestaetigt !== 'marktguru' && (!a.prospekt || !prospekte[a.markt].has(a.prospekt))) continue;
    if ((jeMarkt[a.markt] || []).some(b => b.id === a.id)) continue;
    const { _marke, _bildDatei, ...rest } = a;
    const g = (doppel[a.markt] ||= new Set());
    if (g.has(a.id) || g.has(`t|${norm(a.titel)}|${a.preis}`)) continue;
    g.add(a.id); g.add(`t|${norm(a.titel)}|${a.preis}`);
    (jeMarkt[a.markt] ||= []).push(rest);
    ausPool++;
  }

  // --- Gültigkeit je Angebot aus marktguru (Lidl/Netto/Penny/Kaufland: „ab Donnerstag“ steht dort je Angebot) -----------
  let mgTreffer = 0;
  for (const liste of Object.values(jeMarkt)) for (const a of liste) {
    // passend und zeitlich überlappend (Lidl hat z. B. Chips 1,79 € diese Woche und andere 1,79-€-Chips ab nächster Woche)
    const g = marktguruTreffer(a, mgListe);
    if (!g) continue;
    mgTreffer++;
    if (!a.gueltigAb || Date.parse(g.ab) > Date.parse(a.gueltigAb) + 3600e3) { a.gueltigAb = g.ab; a.abQuelle = 'marktguru'; }
    if (g.bis && (!a.gueltigBis || Date.parse(g.bis) < Date.parse(a.gueltigBis) - 3600e3)) a.gueltigBis = g.bis;
  }

  // --- Vergleichspreis fehlt: aus früheren Läufen (derselbe Markt, dasselbe Produkt) – sonst bleibt es ohne Rabatt -------
  let geschaetzt = 0;
  for (const liste of Object.values(jeMarkt)) for (const a of liste) {
    if (a.vorher != null) continue;
    const v = verlaufVergleich(zk.preise, a.markt, a.titel, a.preis, { menge: a.menge || null, bild: bildDatei(a.bild) });
    if (!v) continue;
    const pct = rabattProzent(a.preis, v.v);
    if (pct > m.maxProzent) continue;
    a.vorher = round(v.v); a.vorherArt = 'geschaetzt'; a.pct = pct;
    a.vorherQuelle = `${v.a === 'uvp' ? 'UVP' : 'Vergleichspreis'} im Prospekt vom ${v.t.slice(8, 10)}.${v.t.slice(5, 7)}.`;
    geschaetzt++;
  }
  merkeVergleich(zk, Object.values(jeMarkt).flat(), jetztMs, m.verlaufTage);

  // nur ab minProzent, je Markt höchstens maxJeMarkt (die größten zuerst)
  const angebote = [];
  const maerkteOut = {};
  for (const mk of maerkte) {
    const alleM = (jeMarkt[mk.id] || []).filter(a => a.vorher != null && a.pct != null && !(a.gueltigBis && Date.parse(a.gueltigBis) < jetztMs));
    const l = alleM.filter(a => a.pct >= m.minProzent)
      .sort((a, b) => b.pct - a.pct || (a.vorherArt === 'streich' ? -1 : 1) - (b.vorherArt === 'streich' ? -1 : 1) || a.preis - b.preis)
      .slice(0, m.maxJeMarkt);
    angebote.push(...l);
    const bis = l.map(a => a.gueltigBis).filter(Boolean).sort().pop() || null;
    const i = info[mk.id] || {};
    // nächste Filiale von Döbeln: kaufDA (Orts-Händlerseite) oder – wenn kaufDA keine nennt (REWE: keine Döbelner Seite) – die
    // Filial-Liste aus OpenStreetMap (Modul filialen). nah = bis nahKm (die Seite blendet die übrigen erst auf Wunsch ein).
    if (!i.filiale) { const f = filialeAusOsm(filialenDatei, mk.id); if (f) i.filiale = f; }
    const nah = i.filiale?.km != null ? i.filiale.km <= m.nahKm : i.keinMarkt ? false : null;
    const pr = prospekte[mk.id] ? [...prospekte[mk.id].values()] : [];
    maerkteOut[mk.id] = {
      name: mk.name, link: i.link || null, anzahl: l.length, ...(bis ? { prospektBis: bis } : {}), ...(st.alt.includes(mk.id) ? { alt: true } : {}),
      // Prospekt-Ort dieses Markts (Döbeln/Chemnitz/Leipzig oder „bundesweit (Berlin)“), nächste Filiale von Döbeln aus
      ...(i.ort ? { ort: i.ort } : {}), ...(i.keinMarkt ? { keinMarkt: true } : {}), ...(i.filiale ? { filiale: i.filiale } : {}), ...(nah != null ? { nah } : {}),
      // Vollständigkeit: kaufDA zählt gesamt Angebote in den Prospekten, gelesen = davon hier gesehen (Seite + Stichworte + Pool)
      ...(i.gesamt != null ? { gesamt: i.gesamt } : {}),
      ...(prospekte[mk.id] ? { gelesen: new Set([...(gesehenIds[mk.id] || []), ...(jeMarkt[mk.id] || []).filter(a => !a.bestaetigt).map(a => String(a.id).replace(/^kd:/, ''))]).size, mitVergleich: alleM.length } : {}),
      ...(pr.length ? { prospekte: pr.slice(0, 6).map(p => ({ titel: p.titel, ab: p.ab, bis: p.bis, ...(p.seiten ? { seiten: p.seiten } : {}), ...(p.bald ? { bald: true } : {}) })) } : {}),
    };
  }
  angebote.sort((a, b) => b.pct - a.pct || a.preis - b.preis);
  // Merkworte (config): Treffer tragen „merkwort“ – die Seite zeigt sie als gemerkt, der Radar erinnert am ersten Tag
  if (merkworte.length) {
    const mw = merkworte.map(w => [w, norm(w)]);
    for (const a of angebote) { const t = mw.find(([, n]) => n && norm(a.titel).includes(n)); if (t) a.merkwort = t[0].slice(0, 30); }
    zk.merkRadar = angebote.filter(a => a.merkwort).slice(0, 30).map(a => ({ id: a.id, titel: a.titel, markt: a.markt, preis: a.preis, vorher: a.vorher, pct: a.pct, ab: a.gueltigAb, bis: a.gueltigBis }));
  } else delete zk.merkRadar;
  st.anzahl = angebote.length;
  st.fehler = fehler.slice(0, 10);
  st.ok = !fehler.length;
  if (sw.gelesen || sw.leer || sw.fehler) st.stichworte = sw;
  if (ausPool) st.pool = ausPool;
  if (geschaetzt) st.geschaetzt = geschaetzt;
  if (mgListe.length || mgTreffer) st.marktguru = { angebote: mgListe.length, treffer: mgTreffer };
  if (hinweise.length) st.hinweise = hinweise.slice(0, 10);
  if (!st.alt.length) delete st.alt;
  if (!Object.keys(st.roh).length) delete st.roh;
  const standort = standortVon(Object.values(st.orte).filter(o => o !== 'kein Markt in der Nähe'), orte);
  if (!Object.keys(st.orte).length) delete st.orte;
  const stufen = (Array.isArray(m.stufen) && m.stufen.length ? m.stufen : STANDARD.stufen).filter(n => Number.isFinite(n));
  const spaeter = a => !!(a.gueltigAb && Date.parse(a.gueltigAb) > jetztMs);
  // Start-Kachel wie der Reiter ohne Standort: nur Märkte mit Filiale bis nahKm um Döbeln (nah = false -> nicht mitgezählt)
  const fern = maerkte.filter(x => maerkteOut[x.id]?.nah === false).map(x => x.id);
  const kachelAngebote = angebote.filter(a => !fern.includes(a.markt));
  const jetztGilt = kachelAngebote.filter(a => !spaeter(a));
  // Zähler je Stufe nur für das, was HEUTE gilt; was später kommt, steht extra (kommt)
  const ab = Object.fromEntries(stufen.map(n => [n, jetztGilt.filter(a => a.pct >= n).length]));
  // kommt = beginnt noch DIESE Woche (vor Mo 00:00 Berlin), naechste = ab Montag (Prüfer 16.11.2026: die Start-Kachel sagte
  // „+ 7 kommen diese Woche noch“, 3 davon erst ab 23./26.11.); wocheBis = dieses Ende, damit die Seite alte Zahlen erkennt
  const wocheBis = wochenEndeIso(jetztMs), wbMs = Date.parse(wocheBis);
  const dieseWoche = a => spaeter(a) && Date.parse(a.gueltigAb) < wbMs;
  const kommt = Object.fromEntries(stufen.map(n => [n, kachelAngebote.filter(a => dieseWoche(a) && a.pct >= n).length]));
  const naechste = Object.fromEntries(stufen.map(n => [n, kachelAngebote.filter(a => spaeter(a) && !dieseWoche(a) && a.pct >= n).length]));
  const nameVon = id => maerkte.find(x => x.id === id)?.name || id;
  const kurz = {
    anzahl: kachelAngebote.length, ab, kommt, naechste, wocheBis, ...(fern.length ? { ohneFiliale: fern.map(nameVon) } : {}),
    // erst was jetzt gilt, dann was ab Montag/Donnerstag kommt (mit „ab“, damit die Start-Kachel „ab Mo“ sagen kann)
    top: [...jetztGilt, ...kachelAngebote.filter(spaeter)].slice(0, 3).map(a => ({ titel: a.titel, markt: nameVon(a.markt), pct: a.pct, preis: a.preis, vorherArt: a.vorherArt, ...(a.abPreis ? { abPreis: true } : {}), ...(a.app ? { app: true } : {}), ...(spaeter(a) ? { ab: a.gueltigAb } : {}) })),
  };
  const datei = {
    version: 1,
    aktualisiert: new Date(jetztMs).toISOString(),
    ort: m.ort,
    // Prospekt-Orte der gelesenen Märkte, in der Reihenfolge der config („Döbeln“, „Döbeln/Chemnitz“, „Döbeln/bundesweit“ …)
    standort,
    minProzent: m.minProzent,
    stufen,
    maerkte: maerkteOut,
    angebote,
    status: { kaufda: st },
    hinweis: 'Prospekt-Ort je Markt in maerkte.<id>.ort (regional = nicht der Prospekt für Döbeln, dort prüfen). Rabatt mit Vergleichspreis, abgerundet: vorherArt streich = Streichpreis im Prospekt, uvp = unverbindliche Preisempfehlung des Herstellers, unbekannt = Art nicht angegeben, geschaetzt = kein Vergleichspreis im Prospekt, sondern derselbe Artikel im selben Markt aus einem früheren Prospekt (vorherQuelle). abPreis = „ab“-Preis (bis zu). app = nur mit App/Karte. prospekt = Prospekt-id bei kaufDA. gueltigAb später als heute = kommt noch (abQuelle text/marktguru, wochenende = Fr/Sa-Angebot). maerkte.<id>.gesamt = Angebote in den Prospekten laut kaufDA, gelesen = davon gesehen. bestaetigt marktguru = aus einem anderen Prospekt desselben Markts, von marktguru für PLZ 04720 mit gleichem Preis und Produktwort bestätigt. menge = Packungsgröße (geschaetzt nur bei gleicher Packung). Online-Prospekte (netto-online.de …) zählen nicht (status.kaufda.online). maerkte.<id>.filiale = nächste Filiale von Döbeln (kaufDA oder OpenStreetMap, quelle), nah = bis nahKm (false = keine Filiale in der Nähe: die Seite zeigt den Markt erst unter „weitere Märkte“, die Start-Kachel zählt ihn nicht).',
  };
  return { eintraege: [], fehler, hinweise, datei, kurz };
}
