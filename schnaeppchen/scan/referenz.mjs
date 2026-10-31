// Preis-Kontext je Produkt: Regulär · Üblich im Angebot · Tiefst 12 Monate · Jetzt – aus den recherchierten
// Referenzpreisen (referenzpreise.json, je Wert mit Quelle) und dem eigenen Verlauf (history.json).
// Verglichen wird immer mit derselben Packungsgröße (± 15 %, z. B. 300/340 g „XXL“); gibt es dafür keinen Wert,
// wird über den Grundpreis (€/Stück, €/100 g, €/100 ml) auf die Packung umgerechnet und das so beschriftet.
// Nie „unbekannt“: fehlt eine Stufe, nimmt die nächste (andere Packung → andere Läden → recherchierter Einzelwert).
import { norm, round, euroKurz } from './text.mjs';
import { median } from './history.mjs';

const TAG_MS = 864e5;
const TOLERANZ = 1.18; // gleiche Packung: 300 g ↔ 340 g, 160 g ↔ 175 g, aber nicht 8er ↔ 15er
const MONATE = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];
const MONAT_NR = { jan: 1, januar: 1, feb: 2, februar: 2, maerz: 3, mrz: 3, apr: 4, april: 4, mai: 5, jun: 6, juni: 6, jul: 7, juli: 7,
  aug: 8, august: 8, sep: 9, sept: 9, september: 9, okt: 10, oktober: 10, nov: 11, november: 11, dez: 12, dezember: 12 };

// Ketten in Döbeln (zuerst), weitere erlaubte Läden, online. Reihenfolge egal: es zählt die früheste Nennung im Text.
const KETTEN = [
  ['Kaufland', /kaufland/, 1], ['Lidl', /\blidl/, 1], ['Aldi Nord', /aldi nord|\baldi\b(?! sued)/, 1],
  ['Netto Marken-Discount', /\bnetto\b/, 1], ['Penny', /\bpenny/, 1], ['EDEKA', /\bedeka/, 1], ['Marktkauf', /marktkauf/, 1],
  ['REWE', /\brewe\b/, 1], ['Globus', /\bglobus/, 2], ['Norma', /\bnorma\b/, 2], ['Amazon', /amazon/, 2],
  ['nahkauf', /nahkauf/, 3], ['Rossmann', /rossmann/, 3], ['Müller', /\bmueller/, 3], ['Action', /\baction\b/, 3],
  ['myTime', /mytime/, 3], ['Storck-Shop', /storck ?shop/, 3], ['diska', /\bdiska/, 3], ['nah & gut', /nah (?:und|&)? ?gut/, 3],
  ['Markant', /\bmarkant\b/, 3], ['CENTERSHOP', /centershop/, 3],
];
// Nicht in Döbeln / Großhandel / nur zum Vergleich: zählt nie (höchstens als allerletzte Rückfallstufe)
const NICHT_HIER = /nicht in doebeln|nicht in sachsen|aldi sued|wasgau|stavenhagen|scottie|mit dem hund|foodservice|grosshaendler|grosshandel|\bmetro\b|\bcitti\b|nur vergleich|nur zum vergleich|\btesco\b|polonia|irland|markt in bayern/;

/** Laden aus dem Freitext → { kette, rang (1 Döbeln, 2 erlaubt/online, 3 sonst, 9 nicht hier), app, uvp, schaetzung } */
export function ladenAus(text) {
  const t = norm(text);
  let best = null;
  for (const [kette, re, rang] of KETTEN) {
    const m = t.match(re);
    if (m && (!best || m.index < best.i)) best = { kette, rang, i: m.index };
  }
  const nichtHier = NICHT_HIER.test(t);
  return {
    kette: best?.kette || String(text || '').split(/[(,;]/)[0].trim() || '?',
    rang: nichtHier ? 9 : best?.rang ?? 3,
    app: /(?<!ohne )\bapp\b|kaufland ?card|nur mit .*karte/.test(t),
    uvp: /\buvp\b|kein regalpreis|hersteller/.test(t),
    schaetzung: /schaetzung/.test(t),
  };
}

const zwei = n => String(n).padStart(2, '0');
function isoWoche(jahr, kw) { // Montag der ISO-Kalenderwoche
  const j4 = new Date(Date.UTC(jahr, 0, 4));
  const mo = new Date(j4.getTime() - ((j4.getUTCDay() + 6) % 7) * TAG_MS);
  return new Date(mo.getTime() + (kw - 1) * 7 * TAG_MS).toISOString().slice(0, 10);
}

/**
 * Datum aus dem Freitext → { tag: 'JJJJ-MM-TT', genau: 'tag'|'monat'|'jahr' } oder null (undatiert).
 * Es zählt die früheste Datumsangabe im Text („2026-10-26 bis 2026-10-31“ → Beginn; „bis 2026-10-24“ → Ende).
 * „Meldedatum unbekannt (abgerufen 31.10.2026)“ / „ohne Datum“ am Anfang = undatiert (Abrufdatum ≠ Preisdatum).
 */
export function datumAus(text) {
  const s = String(text || '');
  if (/^\s*(?:ohne datum|meldedatum unbekannt|unbekannt|schätzung, stand unbekannt|schaetzung, stand unbekannt)/i.test(s)) return null;
  const funde = [];
  const such = (re, f) => { for (const m of s.matchAll(re)) { const r = f(m); if (r) funde.push({ i: m.index, ...r }); } };
  such(/\b(20\d\d)-(\d\d)-(\d\d)\b/g, m => ({ tag: `${m[1]}-${m[2]}-${m[3]}`, genau: 'tag' }));
  such(/\b(20\d\d)-(\d\d)\b(?!-\d)/g, m => ({ tag: `${m[1]}-${m[2]}-15`, genau: 'monat' }));
  such(/\b(\d{1,2})\.(\d{1,2})\.(20\d\d)\b/g, m => ({ tag: `${m[3]}-${zwei(m[2])}-${zwei(m[1])}`, genau: 'tag' }));
  such(/\bKW ?(\d{1,2})\/(20\d\d)\b/gi, m => ({ tag: isoWoche(+m[2], +m[1]), genau: 'tag' }));
  such(/\b(\d{1,2})\/(20\d\d)\b/g, m => (+m[1] >= 1 && +m[1] <= 12 ? { tag: `${m[2]}-${zwei(m[1])}-15`, genau: 'monat' } : null));
  such(/\b([A-Za-zä]{3,9})\.? (20\d\d)\b/g, m => {
    const nr = MONAT_NR[norm(m[1])];
    return nr ? { tag: `${m[2]}-${zwei(nr)}-15`, genau: 'monat' } : null;
  });
  such(/^\s*(20\d\d)\b(?![-./]\d)/g, m => ({ tag: `${m[1]}-07-01`, genau: 'jahr' }));
  if (!funde.length) return null;
  funde.sort((a, b) => a.i - b.i);
  return { tag: funde[0].tag, genau: funde[0].genau };
}

/** Packungsgröße aus dem Freitext in Basis-Einheiten (Stück, g, ml) oder null. Bei Spannen („110–150 g“) die größere. */
export function mengeAus(text, basis, stueckGramm) {
  const s = String(text || '').replace(/,(\d)/g, '.$1');
  // Grundpreis-Angaben („0,438 €/100 g“, „13,27 €/kg“, „1 kg = 6,10“) sind nie die Packung
  const ohne = s.replace(/€\s*\/\s*\d*\s*(?:g|ml|kg|l|stück)\b/gi, ' ').replace(/\d+(?:\.\d+)?\s*(?:kg|l)\s*=\s*[\d.]+/gi, ' ');
  if (basis === 'stueck') {
    const st = ohne.match(/\b(\d+)\s*(?:Riegel|St\.?|Stück)(?![a-zäöü])/);
    if (st) return +st[1];
    const er = ohne.match(/\b(\d+)er\b/);
    if (er) return +er[1];
    const mal = ohne.match(/\b(\d+)\s*[x×]\s*(\d+(?:\.\d+)?)\s*g\b/i);
    if (mal) return +mal[1];
    const g = ohne.match(/\b(\d+(?:\.\d+)?)\s*g\b/);
    if (g && stueckGramm) { const n = +g[1] / stueckGramm; if (n >= 1 && Math.abs(n - Math.round(n)) < 0.15) return Math.round(n); }
    return null;
  }
  const einheit = basis === '100ml' ? 'ml' : 'g';
  const re = new RegExp(`(?:\\b(\\d+)\\s*[x×]\\s*)?(\\d+(?:\\.\\d+)?)(?:\\s*(?:[-–/]|bis)\\s*(\\d+(?:\\.\\d+)?))?\\s*${einheit}\\b`, 'i');
  const m = ohne.match(re);
  if (!m) return null;
  const je = Math.max(+m[2], m[3] ? +m[3] : 0);
  return m[1] ? +m[1] * je : je;
}

const hostVon = u => { try { return new URL(u).hostname.replace(/^www\./, '').replace(/^api\./, ''); } catch { return null; } };
const ersteUrl = t => String(t || '').match(/https?:\/\/[^\s)'"“”]+/)?.[0]?.replace(/[.,;]+$/, '')
  || (String(t || '').match(/GitHub ([\w.-]+\/[\w-]+)/) ? `https://github.com/${String(t).match(/GitHub ([\w.-]+\/[\w-]+)/)[1]}` : null);
const HOST_NAME = { 'github.com': 'Prospekt-Archiv (GitHub)', 'prices.openfoodfacts.org': 'Open Prices' };
/** Kurzer Quellenname + Link: „supermarktcheck.de“, „marktguru.de“ … */
export function quelleVon(e) {
  const url = e.url || ersteUrl(e.quelle) || null;
  const host = url ? hostVon(url) : null;
  const name = HOST_NAME[host] || host || String(e.quelle || '').split(/[,(:]/)[0].trim().slice(0, 40) || 'Recherche';
  return { quelle: name, url };
}

const tagMs = tag => Date.parse(`${tag}T12:00:00Z`);
const monatText = tag => { const [j, m] = tag.split('-'); return `${MONATE[+m - 1]} ${j}`; };

/** referenzpreise.json → { [id]: { hauptMenge, regal[], angebote[], ueblichRecherche, tiefstRecherche, tiefstAllzeit } } */
export function ladeReferenz(json, watchlist) {
  const out = {};
  const items = new Map((watchlist?.produkte || []).map(i => [i.id, i]));
  for (const pr of json?.produkte || []) {
    const item = items.get(pr.id) || {};
    const basis = pr.basis || item.basis;
    const sg = item.stueckGramm;
    const eintrag = (e, art) => {
      const menge = mengeAus(e.packung, basis, sg);
      if (!(e.p > 0) || !(menge > 0)) return null;
      const laden = ladenAus(e.shop);
      const d = datumAus(art === 'regal' ? e.stand : e.datum);
      if (/schaetzung|schätzung/i.test(art === 'regal' ? e.stand : '')) laden.schaetzung = true;
      return { art, p: e.p, menge, einheit: e.p / (basis === 'stueck' ? menge : menge / 100), shop: e.shop, ...laden,
        tag: d?.tag || null, genau: d?.genau || null, ...quelleVon(e) };
    };
    const regal = (pr.regulaer || []).map(e => eintrag(e, 'regal')).filter(Boolean);
    const angebote = (pr.angebote || []).map(e => eintrag(e, 'angebot')).filter(Boolean);
    const t12 = pr.tiefst12 ? eintrag(pr.tiefst12, 'angebot') : null;
    // der recherchierte Tiefstwert zählt als Angebot (falls nicht schon in der Liste)
    if (t12 && !angebote.some(a => a.p === t12.p && a.kette === t12.kette && a.tag?.slice(0, 7) === t12.tag?.slice(0, 7))) angebote.push(t12);
    const ue = pr.ueblich ? { ...pr.ueblich, menge: mengeAus(pr.ueblich.packung, basis, sg), ...quelleVon({ url: pr.ueblich.quellen?.[0], quelle: '' }) } : null;
    out[pr.id] = {
      basis, regal, angebote, ueblichRecherche: ue, tiefstRecherche: t12,
      tiefstAllzeit: pr.tiefstAllzeit ? eintrag(pr.tiefstAllzeit, 'angebot') : null,
      hauptMenge: ue?.menge || regal[0]?.menge || angebote[0]?.menge || null,
      stand: json.stand || null,
    };
  }
  return out;
}

const passend = (a, b) => a > 0 && b > 0 && Math.max(a, b) / Math.min(a, b) <= TOLERANZ;
/** Packungspreis eines Werts für die Kontext-Packung: gleiche Packung → wie gemeldet, sonst über den Grundpreis */
const wertFuer = (e, menge, basis) => (passend(e.menge, menge) ? e.p : round(e.einheit * (basis === 'stueck' ? menge : menge / 100), 2));
export function packungKurz(menge, basis) {
  if (!(menge > 0)) return '';
  if (basis === 'stueck') return `${menge} Stück`;
  return `${String(menge).replace('.', ',')} ${basis === '100ml' ? 'ml' : 'g'}`;
}
const kurzLaden = e => `${e.kette}${e.app ? (e.kette === 'Kaufland' ? ' mit Card' : ' mit App') : ''}`;

/** Eigener Verlauf → Einträge wie die Referenz (nur Punkte mit Packung, je Laden/Preis/Woche einmal) */
export function verlaufEintraege(gruppeHist, basis) {
  const out = [], gesehen = new Set();
  for (const x of gruppeHist?.punkte || []) {
    if (!(x.m > 0) || !(x.p > 0)) continue;
    const pp = x.pp > 0 ? x.pp : round(x.p * (basis === 'stueck' ? x.m : x.m / 100), 2);
    const woche = Math.floor(tagMs(x.tag) / (7 * TAG_MS));
    const k = `${norm(x.shop)}|${pp}|${woche}`;
    if (gesehen.has(k)) continue;
    gesehen.add(k);
    out.push({ art: 'angebot', p: pp, menge: x.m, einheit: x.p, shop: x.shop, ...ladenAus(x.shop), rang: ladenAus(x.shop).rang === 9 ? 9 : 1,
      tag: x.tag, genau: 'tag', quelle: 'eigener Verlauf', url: null, eigen: true });
  }
  return out;
}

/**
 * Preis-Kontext für eine Packung (die des Angebots, sonst die übliche Packung des Produkts).
 * angebot: { preis, menge (in Basis-Einheiten), shop } oder null.
 * -> { menge, packung, jetzt, regulaer, ueblich, tiefst12, ersparnis, deal, neuesTief, zeile, ... }
 */
export function preisKontext({ ref, basis, verlauf = [], angebot = null, jetztMs, cfg = {} }) {
  const nah = cfg.deal?.nahTiefst ?? 0.10;
  const minAngebote = cfg.deal?.ueblichMinAngebote ?? 3;
  const altTage = cfg.deal?.referenzAltTage ?? 90;
  const menge = angebot?.menge > 0 ? angebot.menge : ref?.hauptMenge || verlauf.find(v => v.menge > 0)?.menge || null;
  const res = { menge, packung: packungKurz(menge, basis), jetzt: null, regulaer: null, ueblich: null, tiefst12: null, ersparnis: null, deal: false, neuesTief: false };
  if (!(menge > 0)) return res;
  const alt = tag => !tag || jetztMs - tagMs(tag) > altTage * TAG_MS;
  const standText = (tag, genau) => (!tag ? 'Meldung ohne Datum' : alt(tag) ? `Stand ${genau === 'tag' || genau === 'monat' ? monatText(tag) : tag.slice(0, 4)}` : '');
  const mitWert = (e, extra = {}) => ({ pack: wertFuer(e, menge, basis), einheit: round(e.einheit, 4), shop: kurzLaden(e), tag: e.tag, monat: e.tag ? monatText(e.tag) : null,
    umgerechnet: !passend(e.menge, menge), packungQuelle: packungKurz(e.menge, basis), quelle: e.quelle, url: e.url, eigen: !!e.eigen, ...extra });

  if (angebot?.preis > 0) res.jetzt = { pack: round(angebot.preis, 2), shop: angebot.shop || '' };

  // --- Regulär: Regalpreis, bevorzugt Ketten in Döbeln, gleiche Packung; Laden des Angebots zuerst ----------------
  const regal = ref?.regal || [];
  const regalStufen = [
    e => passend(e.menge, menge) && e.rang === 1 && !e.uvp && !e.schaetzung,
    e => passend(e.menge, menge) && e.rang <= 2 && !e.uvp && !e.schaetzung,
    e => passend(e.menge, menge) && e.rang <= 3 && !e.uvp && !e.schaetzung,
    e => e.rang <= 2 && !e.uvp && !e.schaetzung, // andere Packung, umgerechnet
    e => passend(e.menge, menge) && e.rang <= 3, // UVP / Schätzung (so beschriftet)
    e => e.rang <= 3, () => true,
  ];
  for (const f of regalStufen) {
    const c = regal.filter(f);
    if (!c.length) continue;
    const kette = angebot?.shop ? ladenAus(angebot.shop).kette : null;
    const gleich = c.filter(e => e.kette === kette);
    let wahl;
    if (gleich.length) wahl = gleich.sort((a, b) => (b.tag || '').localeCompare(a.tag || ''))[0];
    else {
      const med = median(c.map(e => wertFuer(e, menge, basis)));
      wahl = [...c].sort((a, b) => Math.abs(wertFuer(a, menge, basis) - med) - Math.abs(wertFuer(b, menge, basis) - med)
        || (b.rang === 1) - (a.rang === 1) || (b.tag || '').localeCompare(a.tag || ''))[0];
    }
    res.regulaer = mitWert(wahl, { stand: standText(wahl.tag, wahl.genau), uvp: wahl.uvp, geschaetzt: wahl.schaetzung });
    break;
  }

  // --- Angebote der letzten 12 Monate (Referenz + eigener Verlauf), nur bis heute ------------------------------
  const von = jetztMs - 365 * TAG_MS;
  const imJahr = e => e.tag && tagMs(e.tag) >= von && tagMs(e.tag) <= jetztMs + TAG_MS / 2;
  const alle = [...(ref?.angebote || []), ...verlauf];
  const zaehlt = e => e.rang <= 2;

  // Üblich = Median der Angebotspreise (gleiche Packung, Döbelner Ketten + online); zu wenige → andere Packungen
  // umgerechnet → recherchierter Wert
  // Reihenfolge: gleiche Packung (≥ 3 Angebote) → recherchierter Wert für diese Packung → alle Packungen umgerechnet
  const ur = ref?.ueblichRecherche?.p > 0 ? ref.ueblichRecherche : null;
  const ueStufen = [e => imJahr(e) && zaehlt(e) && passend(e.menge, menge), 'recherche', e => imJahr(e) && zaehlt(e)];
  for (const f of ueStufen) {
    if (f === 'recherche') { if (ur && passend(ur.menge, menge)) break; continue; }
    const c = alle.filter(f);
    if (c.length < minAngebote) continue;
    const werte = c.map(e => wertFuer(e, menge, basis));
    const neuestes = c.reduce((a, b) => ((b.tag || '') > (a.tag || '') ? b : a));
    const namen = [...new Set(c.map(e => e.quelle))];
    res.ueblich = { pack: round(median(werte), 2), anzahl: c.length, umgerechnet: c.some(e => !passend(e.menge, menge)),
      tag: neuestes.tag, stand: alt(neuestes.tag) ? `Stand ${monatText(neuestes.tag)}` : '',
      quelle: namen.length > 2 ? `${namen.slice(0, 2).join(', ')} u. a.` : namen.join(', '), url: c.find(e => e.url)?.url || null };
    break;
  }
  if (!res.ueblich && ur) {
    const u = ur;
    const um = !passend(u.menge, menge);
    res.ueblich = { pack: um ? round(u.einheitspreis * (basis === 'stueck' ? menge : menge / 100), 2) : u.p, anzahl: null, umgerechnet: um,
      tag: ref.stand, stand: alt(ref.stand) ? `Stand ${monatText(ref.stand)}` : '', quelle: u.quelle, url: u.url, recherche: true };
  }

  // Tiefst 12 Mon. = günstigster Wert (gleiche Packung, Döbelner Ketten + online); sonst umgerechnet / andere Läden
  const tiefstStufen = [e => imJahr(e) && zaehlt(e) && passend(e.menge, menge), e => imJahr(e) && zaehlt(e), e => imJahr(e) && e.rang <= 3, e => imJahr(e)];
  for (const f of tiefstStufen) {
    const c = alle.filter(f);
    if (!c.length) continue;
    const t = c.reduce((a, b) => { const wa = wertFuer(a, menge, basis), wb = wertFuer(b, menge, basis); return wb < wa - 1e-9 || (Math.abs(wb - wa) < 1e-9 && (b.tag || '') > (a.tag || '')) ? b : a; });
    res.tiefst12 = mitWert(t);
    break;
  }
  if (!res.tiefst12) { const t = ref?.tiefstRecherche || ref?.tiefstAllzeit; if (t) res.tiefst12 = mitWert(t, { stand: standText(t.tag, t.genau), aelter: true }); }

  // --- Bewertung: nur gegen den recherchierten regulären Preis; Deal = ≤ üblich UND nahe am 12-Monats-Tief -------
  const j = res.jetzt?.pack;
  if (j > 0 && res.regulaer?.pack > 0) res.ersparnis = round(1 - j / res.regulaer.pack, 3);
  if (j > 0 && res.ueblich && res.tiefst12) {
    res.deal = j <= res.ueblich.pack + 0.005 && j <= res.tiefst12.pack * (1 + nah) + 0.005;
    res.neuesTief = j <= res.tiefst12.pack + 0.005;
  }
  res.stufe = !j ? 'kein-angebot' : res.deal ? (res.neuesTief ? 'tiefst' : 'gut')
    : res.ueblich && j <= res.ueblich.pack + 0.005 ? 'ueblich' : 'normal';
  res.zeile = kontextZeile(res);
  return res;
}

const shopMonat = t => [t.shop, t.monat].filter(Boolean).join(', ');
/** „Jetzt 2,79 € · Regulär 3,49 € · Üblich im Angebot 2,79 € · Tiefst 12 Mon. 2,49 € (Kaufland, Okt. 2026)“ */
export function kontextZeile(k) {
  const teile = [];
  if (k.jetzt) teile.push(`Jetzt ${euroKurz(k.jetzt.pack)}`); else teile.push('Gerade kein Angebot');
  if (k.regulaer && k.jetzt) teile.push(`Regulär ${euroKurz(k.regulaer.pack)}`);
  if (k.ueblich) teile.push(`${k.jetzt ? 'Üblich im Angebot' : 'Üblich'} ${euroKurz(k.ueblich.pack)}`);
  if (k.tiefst12) teile.push(`${k.jetzt ? 'Tiefst 12 Mon.' : 'Tiefst'} ${euroKurz(k.tiefst12.pack)} (${shopMonat(k.tiefst12)})`);
  if (!k.jetzt && k.packung) teile.push(`je ${k.packung}`);
  return teile.join(' · ');
}

/** Für den Push: „Tiefst 12 Mon. 2,49 € (Kaufland, Okt. 2026) · üblich 2,79 € · statt regulär 3,49 € (−20 %)“ */
export function pushZeile(k) {
  return [
    k.tiefst12 ? `Tiefst 12 Mon. ${euroKurz(k.tiefst12.pack)} (${shopMonat(k.tiefst12)})` : '',
    k.ueblich ? `üblich ${euroKurz(k.ueblich.pack)}` : '',
    k.regulaer ? `statt regulär ${euroKurz(k.regulaer.pack)}${k.ersparnis > 0 ? ` (−${Math.round(k.ersparnis * 100)} %)` : ''}` : '',
  ].filter(Boolean).join(' · ');
}
