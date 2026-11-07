// Gemeinsame Bausteine der Scanner-Module: Feeds sammeln (fehlertolerant), Einträge bauen, Google-News-Suche.
import { leseRss } from '../lib/rss.mjs';
import { schluessel, alterTage, enthaelt } from '../lib/text.mjs';
import { endeAusFuer, abAus, bestimmeEnde, berlinTag, alterStunden, HOECHSTALTER_STUNDEN } from '../lib/ende.mjs';
import { istMydealzDeal, altpreisAusText, preisAngaben, preisZeile, versandImPreis } from '../lib/mydealz.mjs';
import { parsePrice, euro } from '../lib/text.mjs';
import { krass as krassPruefen } from '../lib/krass.mjs';

export const googleNews = q => `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=de&gl=DE&ceid=DE:de`;

// ---------------------------------------------------------------- mydealz ohne Suche
// Die RSS-Suche (/rss/search?q=…) gibt es nicht mehr: HTTP 404 (HTML „Ups...“) seit 31.10.2026, im echten Lauf vom
// 07.11.2026 bei allen 20 Suchen. Ersatz (Belege in QUELLEN-FIX.md):
//   - Gruppen-Feeds /rss/gruppe/<name> – Name = Adresse der Gruppenseite mydealz.de/gruppe/<name> (lebensmittel,
//     preisfehler, reisen, freebies, gewinnspiele liefern im echten Lauf 200; weitere Gruppen: apple-tv, filme-serien,
//     kino, freizeitpark, wellness-massagen, geld-zurueck, bus-bahn, vertraege-finanzen, strom-gas …)
//   - /rss/alles (alle neuen Deals) und /rss/trending (heiß) – /rss/new und /rss/hot leiten dorthin weiter.
// Was früher eine Suche war, ist jetzt: Gruppe(n) + Stichwortfilter (stichwoerter am Feed, siehe sammleFeeds).
export const MYDEALZ = 'https://www.mydealz.de';
export const MYDEALZ_ALLE = `${MYDEALZ}/rss/alles`;
export const MYDEALZ_HEISS = `${MYDEALZ}/rss/trending`;
export const mydealzGruppe = name => `${MYDEALZ}/rss/gruppe/${encodeURIComponent(String(name).trim().toLowerCase())}`;

/**
 * Feeds für mydealz-Gruppen. eintraege: ["kino", { gruppe: "wellness-massagen", stichwoerter: ["Therme"] }, …]
 * ("alles" / "trending" = Feed aller neuen bzw. heißen Deals). rest (maxAlterTage, art, …) gilt für alle.
 */
export function mydealzFeeds(eintraege = [], rest = {}) {
  const out = [];
  for (const e of Array.isArray(eintraege) ? eintraege : [eintraege]) {
    const g = typeof e === 'string' ? { gruppe: e } : e;
    const name = String(g?.gruppe ?? '').trim();
    if (!name) continue;
    const url = name === 'alles' ? MYDEALZ_ALLE : name === 'trending' ? MYDEALZ_HEISS : mydealzGruppe(name);
    const sw = Array.isArray(g.stichwoerter) ? g.stichwoerter.filter(x => typeof x === 'string' && x.trim()) : [];
    const anzeige = g.name || (name === 'alles' ? 'neue Deals' : name === 'trending' ? 'heiße Deals' : (name.charAt(0).toUpperCase() + name.slice(1)).replace(/-/g, ' '));
    out.push({ name: `mydealz ${anzeige}`, url, ...rest, ...(g.maxAlterTage != null ? { maxAlterTage: g.maxAlterTage } : {}), ...(sw.length ? { stichwoerter: sw } : {}) });
  }
  return out;
}

/** mydealz-Feeds eines Moduls: gruppen (siehe mydealzFeeds) + alte „suchen“ als Stichwörter im Feed aller neuen Deals. */
export function mydealzQuellen({ gruppen = [], suchen = [] } = {}, rest = {}) {
  const feeds = mydealzFeeds(gruppen || [], rest);
  const sw = (Array.isArray(suchen) ? suchen : []).filter(q => typeof q === 'string' && q.trim());
  if (sw.length) feeds.push(...mydealzFeeds([{ gruppe: 'alles', name: 'neue Deals', stichwoerter: sw }], rest));
  return feeds;
}

/** Passt ein Text zu einem der Stichwörter? Ein Stichwort aus mehreren Wörtern braucht alle Wörter; "a|b" = Alternativen. */
export function passtStichwort(text, stichwoerter = []) {
  if (!stichwoerter?.length) return true;
  return stichwoerter.some(s => String(s).split('|').some(alt => {
    const woerter = alt.trim().split(/\s+/).filter(Boolean);
    return woerter.length > 0 && woerter.every(w => enthaelt(text, [w]));
  }));
}

/** Alte Such-Adresse (/rss/search?q=…) in der config -> Feed aller neuen Deals + Stichwort, statt jedes Mal HTTP 404. */
export function ohneMydealzSuche(f) {
  const m = String(f?.url || '').match(/^https:\/\/www\.mydealz\.de\/rss\/search\?(?:.*&)?q=([^&#]*)/);
  if (!m) return f;
  let q = m[1];
  try { q = decodeURIComponent(q.replace(/\+/g, ' ')); } catch { /* bleibt roh */ }
  return { ...f, url: MYDEALZ_ALLE, stichwoerter: [...(f.stichwoerter || []), q] };
}

// Gleicher Feed in einem Lauf (gleiche holeText-Funktion) nur einmal abrufen – mehrere Module teilen sich z. B. /rss/alles.
const FEED_SPEICHER = new WeakMap();
const FEED_HALTEN_MS = 10 * 60e3;
function holeFeed(holeText, url) {
  let m = FEED_SPEICHER.get(holeText);
  if (!m) { m = new Map(); FEED_SPEICHER.set(holeText, m); }
  const jetzt = Date.now();
  const c = m.get(url);
  if (c && jetzt - c.t < FEED_HALTEN_MS) return c.p;
  const p = holeText(url);
  m.set(url, { t: jetzt, p });
  p.catch(() => m.delete(url)); // Fehler nicht merken: ein anderes Modul darf es noch einmal versuchen
  return p;
}

/**
 * Holt mehrere Feeds nacheinander; ein kaputter Feed landet in fehler, die anderen laufen weiter.
 * Feed mit stichwoerter: nur Einträge, deren Titel/Beschreibung eines davon enthält (Ersatz für die mydealz-Suche).
 * Jedes Item bekommt bis/ab aus dem Text (lib/ende.mjs). Steht ein Ende im Text: vorbei -> raus, noch offen -> bleibt
 * (auch wenn älter als maxAlterTage). Ohne Ende im Text gilt maxAlterTage des Feeds.
 */
export async function sammleFeeds(holeText, feeds, { jetzt = new Date(), maxAlterTage = 30 } = {}) {
  const items = [], fehler = [];
  const jetztMs = new Date(jetzt).getTime();
  for (const f0 of feeds) {
    const f = ohneMydealzSuche(f0);
    try {
      const liste = leseRss(await holeFeed(holeText, f.url));
      for (const it of liste) {
        const text = `${it.titel} ${it.langtext ?? it.beschreibung}`;
        if (f.stichwoerter && !passtStichwort(`${it.titel} ${it.beschreibung}`, f.stichwoerter)) continue;
        const ende = endeAusFuer(text, it.datum, new Date(jetztMs));
        if (ende ? Date.parse(ende.bis) < jetztMs : alterTage(it.datum, jetzt) > (f.maxAlterTage ?? maxAlterTage)) continue;
        const { langtext, ...rest } = it;
        items.push({ ...rest, bis: ende?.bis || null, ab: abAus(text, new Date(jetztMs)), feed: f.name || f.url, feedInfo: f });
      }
    } catch (e) { fehler.push(`${f.name || f.url}: ${e.message}`); }
  }
  // gleicher Link oder gleicher Titel aus mehreren Feeds -> einmal
  const gesehen = new Set();
  return {
    items: items.filter(it => { const k = it.link || it.titel; const k2 = it.titel.toLowerCase().slice(0, 70); if (gesehen.has(k) || gesehen.has(k2)) return false; gesehen.add(k); gesehen.add(k2); return true; }),
    fehler,
  };
}

/**
 * Einheitliches Eintragsformat für Seite und Push (Felder: README → „Datenformat“).
 * Ende: bis/bisQuelle (Feld der Quelle oder Text), ab, art (Anzeigefenster ohne bekanntes Ende), jetzt.
 * Preise (optional): preise = { preis, preisVorher, vorherQuelle, ersparnisEuro, ersparnisProzent } (lib/mydealz.mjs preisAngaben).
 */
export function eintrag(e) {
  if (!e.link) throw new Error('Eintrag ohne Link');
  const datum = Number.isFinite(Date.parse(e.datum || '')) ? new Date(e.datum).toISOString() : null;
  const ende = bestimmeEnde({ bis: e.bis, bisQuelle: e.bisQuelle || (e.bis ? 'text' : null), ab: e.ab, datum, art: e.art || 'deal', jetzt: e.jetzt || new Date() });
  return {
    id: e.id || schluessel(e.kategorie, e.link, e.titel.slice(0, 60)),
    kategorie: e.kategorie,
    titel: String(e.titel).slice(0, 160),
    zeile: e.zeile || '',
    soGehts: e.soGehts,
    link: e.link,
    quelle: e.quelle || '',
    wert: Math.max(0, Math.min(100, Math.round(e.wert ?? 50))),
    sofort: !!e.sofort,
    grund: e.grund || '',
    frist: e.frist || (ende.bis ? berlinTag(ende.bis) : null),
    datum,
    bis: ende.bis,
    bisQuelle: ende.bisQuelle,
    ab: ende.ab,
    sichtbarBis: ende.sichtbarBis,
    preisfehler: !!e.preisfehler,
    ...(e.preise ? {
      preis: e.preise.preis ?? null, preisVorher: e.preise.preisVorher ?? null, vorherQuelle: e.preise.vorherQuelle ?? null,
      ersparnisEuro: e.preise.ersparnisEuro ?? null, ersparnisProzent: e.preise.ersparnisProzent ?? null,
    } : {}),
    ...(e.extra ? { extra: e.extra } : {}),
  };
}

export const istRegional = (text, cfg) => cfg.region.some(o => new RegExp(`(^|[^\\p{L}])${o}(?![\\p{L}])`, 'iu').test(text));

export const PREISFEHLER = /preisfehler|fehlerpreis|error fare/i;

/**
 * Preisfehler nach Datenvertrag. Liefert { eintrag } oder { grund } (warum weggelassen).
 * Regeln: höchstens 24 Stunden alt. mydealz: die Deal-Seite muss lesbar sein und darf nicht „abgelaufen“ sagen
 * (der RSS-Feed kennt kein „abgelaufen“). Altpreis: Vergleichspreis der Deal-Seite (nextBestPrice), sonst eindeutige
 * Formulierung im Text (UVP, Vergleichspreis, „statt“ …) – nur wenn höher als jetzt, sonst null.
 */
// krass (optional, Grenzen aus der config): nur krasse Preisfehler (lib/krass.mjs) – sonst { grund: 'nicht krass: …' }
export async function preisfehlerEintrag(it, { kategorie, pruefer, jetzt, wert = 90, preis: preisErsatz = null, mitPreis = false, soGehts, krass = null } = {}) {
  if (mitPreis && parsePrice(it.preisText) == null && preisErsatz == null) return { grund: 'ohne Preis' };
  // ohne lesbares Datum lässt sich das 24-Stunden-Fenster nicht prüfen -> weglassen (wie der Schnäppchen-Wecker)
  if (!Number.isFinite(Date.parse(it.datum || ''))) return { grund: 'ohne Datum' };
  if (alterStunden(it.datum, jetzt) > HOECHSTALTER_STUNDEN.preisfehler) return { grund: 'älter als 24 Stunden' };
  let info = null;
  if (istMydealzDeal(it.link)) {
    const s = await pruefer.pruefe(it.link, { neuNachStunden: 0.75 });
    if (s.status !== 'ok') return { grund: 'Deal-Seite nicht lesbar' };
    info = s.info;
    if (info.abgelaufen) return { grund: 'abgelaufen' };
    if (info.vielleichtAbgelaufen) return { grund: 'laut mydealz vielleicht abgelaufen' };
  }
  const jetztMs = new Date(jetzt).getTime();
  // Ende laut Deal-Seite schon vorbei, auch wenn mydealz es (noch) nicht als abgelaufen markiert hat
  if (info?.ende && Date.parse(info.ende) <= jetztMs) return { grund: 'abgelaufen' };
  const text = `${it.titel} ${it.beschreibung}`;
  const preis = info?.preis ?? parsePrice(it.preisText) ?? preisErsatz;
  const vorher = preis != null && info?.vergleichspreis > preis
    ? { preis: info.vergleichspreis, quelle: 'Vergleichspreis laut mydealz' }
    : altpreisAusText(text, preis);
  const p = preisAngaben({ preis, preisVorher: vorher?.preis, vorherQuelle: vorher?.quelle });
  const shop = info?.haendler || it.shop || '';
  const inkl = versandImPreis(it.titel, info);
  // Nur No-Brainer (Xander 07.11.2026): Versand zählt mit, wenn er nicht schon im Preis steckt
  const k = krass ? krassPruefen({ titel: it.titel, preis: p.preis != null ? p.preis + (!inkl && info?.versand > 0 ? info.versand : 0) : null, preisVorher: p.preisVorher }, krass) : null;
  if (k && !k.ok) return { grund: `nicht krass: ${k.grund}` };
  const versand = inkl ? ' inkl. Versand' : info?.versand > 0 ? ` + ${euro(info.versand)} Versand` : '';
  const endeSeite = info?.ende || null;
  const eintragDaten = eintrag({
    kategorie, titel: it.titel, link: it.link, quelle: it.feed, datum: it.datum, jetzt,
    zeile: [p.preis != null ? preisZeile(p) + versand : '', shop ? `bei ${shop}` : '', p.vorherQuelle || '', 'als Preisfehler gemeldet'].filter(Boolean).join(' · '),
    soGehts: soGehts || 'Schnell bestellen, nur mit Käuferschutz (z. B. PayPal) – Preisfehler werden manchmal storniert, dann bekommst du das Geld zurück.',
    art: 'preisfehler', bis: endeSeite || it.bis || null, bisQuelle: endeSeite ? 'deal-seite' : it.bis ? 'text' : null, ab: it.ab,
    wert, sofort: true, grund: 'Preisfehler', preisfehler: true, preise: p,
    // Versand steckt schon im Preis (CAMELBAK „0,99 € + VSK“ = 6,98 €) -> versand 0, damit die Seite nicht „zzgl.“ schreibt
    extra: { shop: shop || null, versand: inkl ? 0 : info?.versand ?? null, versandInklusive: inkl, temperatur: info?.temperatur ?? it.temperatur ?? null, geprueft: !!info, ...(k ? { krass: k.grund, normalAb: k.normalAb ?? null } : {}) },
  });
  return { eintrag: eintragDaten };
}
