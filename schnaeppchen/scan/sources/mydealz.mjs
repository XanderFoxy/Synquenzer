// mydealz.de RSS feeds (new, hot, "Preisfehler" group, optional keyword search). Online deals incl. Amazon.
import { leseRss } from '../rss.mjs';
import { parsePrice, norm, passt, euroKurz, SAMMEL_TRENNER } from '../text.mjs';
import { abAus, endeAusFuer, berlinIso, HOECHSTALTER_STUNDEN } from '../ende.mjs';
import { vorherAusText } from '../preisfehler.mjs';

// Läden mit Filialen: ein mydealz-Deal dort („[Penny] …“) gilt im Laden -> kein Versand, Filter wie Prospekt-Angebote.
const LAEDEN = ['penny', 'rewe', 'edeka', 'kaufland', 'netto', 'norma', 'globus', 'marktkauf', 'aldi', 'lidl'];
export function istLaden(shop, titel = '') {
  const s = norm(shop);
  const klammer = (String(titel).match(/^\s*\[([^\]]{2,40})\]/) || [])[1];
  return LAEDEN.some(l => s.split(' ').includes(l)) || (!!klammer && LAEDEN.some(l => norm(klammer).split(' ').includes(l)));
}

export function isoDatum(d) {
  const t = Date.parse(d || '');
  return Number.isFinite(t) ? new Date(t).toISOString() : null;
}

export function mydealzAngebot(it, feed) {
  const preis = parsePrice(it.preisText) ?? parsePrice((it.titel.match(/(\d[\d.,]*)\s?€/) || [])[1]);
  const laden = istLaden(it.shop, it.titel);
  return {
    quelle: 'mydealz',
    shop: it.shop || 'Online',
    titel: it.titel,
    beschreibung: it.beschreibung,
    langtext: it.langtext || it.beschreibung || '',
    preis,
    preisAlt: null,
    link: it.link,
    bild: it.bild,
    gueltigBis: null,
    datum: isoDatum(it.datum),
    temperatur: it.temperatur ?? null,
    online: !laden,
    versand: laden ? 0 : null,
    preisfehlerFeed: !!feed.preisfehler,
  };
}

export async function mydealz({ holeText, cfg, watchlist }) {
  const q = cfg.quellen.mydealz;
  const feeds = [...q.feeds];
  if (q.suchFeed) {
    for (const s of new Set(watchlist.produkte.flatMap(p => p.suche || [])))
      feeds.push({ name: `mydealz Suche ${s}`, url: q.suchFeed.replace('{q}', encodeURIComponent(s)), optional: true });
  }
  const angebote = [], fehler = [], gesehen = new Set();
  let ok = 0;
  for (const f of feeds) {
    try {
      const items = leseRss(await holeText(f.url, { headers: { accept: 'application/rss+xml, application/xml, text/xml' } }));
      ok++;
      for (const it of items) {
        if (gesehen.has(it.link)) { if (f.preisfehler) angebote.find(a => a.link === it.link).preisfehlerFeed = true; continue; }
        gesehen.add(it.link);
        angebote.push(mydealzAngebot(it, f));
      }
    } catch (e) { if (!f.optional) fehler.push(`${f.name}: ${e.message}`); }
  }
  if (!ok) throw new Error(fehler[0] || 'kein Feed erreichbar');
  return { angebote, fehler };
}

// Sätze eines Deal-Texts (Datumspunkte wie „2.11. hat“ trennen nicht: danach kommt kein Großbuchstabe)
const saetze = t => String(t || '').split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ„"])/).map(x => x.trim()).filter(Boolean);
const ZAHL_EURO = String.raw`(\d+(?:[.,]\d{1,2})?)\s*(?:€|euro\b|eur\b)?`;

/**
 * Zeit und Bedingungen eines mydealz-Angebots für ein Produkt der Merkliste – wie beim Vorteils-Radar:
 * Beginn („Ab Montag den 2.11.“), Ende („bis 7.11.“, „nur am Donnerstag 29.10.“), sonst höchstens 72 Stunden
 * ab Veröffentlichung bzw. ab Beginn. Bei Sammeldeals zählen der eigene Satz und der Einleitungssatz.
 * „3,49 Euro mit App bzw. 3,99 Euro ohne App“ -> nurMitApp, preisOhneApp.
 * Laden-Angebot mit Beginn („[Penny] … ab Montag“) ohne Ende: Wochenangebote laufen bis Samstag -> Anzeigefenster bis
 * Samstag dieser Woche (statt nur 72 h; ein „bis“ wird daraus nicht).
 * Vorher-Preis („statt 4,99 €“, „Der reguläre Preis sind inzwischen 6,99 Euro“) aus dem eigenen Text bzw. Satz.
 * -> { ab, bis, sichtbarBis, nurMitApp, preisOhneApp, hinweis, preisVorher, vorherQuelle }
 */
export function mydealzZeit(o, item, jetztMs) {
  const alle = saetze(o.langtext || o.beschreibung);
  const eigene = alle.filter(s => passt(s, item));
  const text = o.sammeldeal ? [o.titel, alle[0] || '', ...eigene].join(' ') : `${o.titel} ${o.langtext || o.beschreibung || ''}`;
  const jetzt = new Date(jetztMs);
  const ab = (o.sammeldeal && abAus(eigene.join(' '), jetzt)) || abAus(text, jetzt);
  const ende = endeAusFuer(o.sammeldeal ? [alle[0] || '', ...eigene].join(' ') : text, o.datum, jetzt);
  const bis = ende?.bis || null;
  const start = Math.max(Date.parse(o.datum || '') || NaN, Date.parse(ab || '') || -Infinity);
  let sichtbarBis = !bis && Number.isFinite(start) ? new Date(start + HOECHSTALTER_STUNDEN.deal * 36e5).toISOString() : null;
  if (sichtbarBis && ab && o.online === false) {
    const samstag = samstagNach(Date.parse(ab));
    if (samstag > sichtbarBis) sichtbarBis = samstag;
  }
  // „mit App“: nur im eigenen Satz (Sammeldeal) bzw. im ganzen Text
  const appText = (o.sammeldeal ? eigene.join(' ') : text).toLowerCase();
  const mitApp = appText.match(new RegExp(`${ZAHL_EURO}\\s*(?:nur\\s*)?mit\\s+(?:der\\s+)?(?:[a-zäöü+-]+[\\s-])?app\\b`));
  const ohneApp = appText.match(new RegExp(`${ZAHL_EURO}\\s*ohne\\s+(?:die\\s+)?app\\b`));
  const appPreis = mitApp ? parsePrice(mitApp[1]) : null;
  const nurMitApp = appPreis != null && o.preis != null && Math.abs(appPreis - o.preis) < 0.005;
  const preisOhneApp = nurMitApp && ohneApp ? parsePrice(ohneApp[1]) : null;
  const hinweis = nurMitApp ? `nur mit ${o.shop && o.shop !== 'Online' ? o.shop + '-' : ''}App${preisOhneApp ? ` (ohne App ${euroKurz(preisOhneApp)})` : ''}` : '';
  const vorher = o.preis > 0 ? vorherAusText(o.sammeldeal ? vorherSaetze(alle, eigene, o) : o.titel, o.sammeldeal ? '' : o.langtext || o.beschreibung || '', o.preis) : null;
  return { ab, bis, sichtbarBis, nurMitApp, preisOhneApp, hinweis, preisVorher: vorher?.wert ?? null, vorherQuelle: vorher?.quelle ?? null };
}

// Sammeldeal: die eigenen Sätze und jeweils der nächste, wenn er kein anderes Produkt des Deals nennt
// („Starten wir mit Ben und Jerrys Eis für 3,49 Euro … Der reguläre Preis sind inzwischen 6,99 Euro.“)
function vorherSaetze(alle, eigene, o) {
  const fremd = String(o.sammelTitel || '').split(SAMMEL_TRENNER).map(t => t.trim()).filter(t => t && t !== o.titel)
    .map(t => (norm(t.replace(/^\s*\[[^\]]*\]\s*/, '')).match(/[a-z]{4,}/) || [])[0]).filter(Boolean);
  const raus = [];
  alle.forEach((s, i) => {
    if (!eigene.includes(s)) return;
    raus.push(s);
    const n = alle[i + 1];
    if (n && !eigene.includes(n) && !fremd.some(w => norm(n).includes(w))) raus.push(n);
  });
  return raus.join(' ');
}

// Samstag 23:59 (Berliner Zeit) der Woche, in der ms liegt (Sonntag zählt zur folgenden Woche)
const WOCHENTAG = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Berlin', weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric' });
export function samstagNach(ms) {
  const p = Object.fromEntries(WOCHENTAG.formatToParts(new Date(ms)).map(x => [x.type, x.value]));
  const wt = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
  return berlinIso(+p.year, +p.month, +p.day + (6 - wt), 23, 59, 0);
}
