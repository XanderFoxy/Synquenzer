// Gemeinsame Bausteine der Scanner-Module: Feeds sammeln (fehlertolerant), Einträge bauen, Google-News-Suche.
import { leseRss } from '../lib/rss.mjs';
import { schluessel, alterTage } from '../lib/text.mjs';
import { endeAusFuer, abAus, bestimmeEnde, berlinTag, alterStunden, HOECHSTALTER_STUNDEN } from '../lib/ende.mjs';
import { istMydealzDeal, altpreisAusText, preisAngaben, preisZeile, versandImPreis } from '../lib/mydealz.mjs';
import { parsePrice, euro } from '../lib/text.mjs';

export const googleNews = q => `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=de&gl=DE&ceid=DE:de`;
export const mydealzSuche = q => `https://www.mydealz.de/rss/search?q=${encodeURIComponent(q)}`;

/**
 * Holt mehrere Feeds nacheinander; ein kaputter Feed landet in fehler, die anderen laufen weiter.
 * Jedes Item bekommt bis/ab aus dem Text (lib/ende.mjs). Steht ein Ende im Text: vorbei -> raus, noch offen -> bleibt
 * (auch wenn älter als maxAlterTage). Ohne Ende im Text gilt maxAlterTage des Feeds.
 */
export async function sammleFeeds(holeText, feeds, { jetzt = new Date(), maxAlterTage = 30 } = {}) {
  const items = [], fehler = [];
  const jetztMs = new Date(jetzt).getTime();
  for (const f of feeds) {
    try {
      const liste = leseRss(await holeText(f.url));
      for (const it of liste) {
        const text = `${it.titel} ${it.langtext ?? it.beschreibung}`;
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
export async function preisfehlerEintrag(it, { kategorie, pruefer, jetzt, wert = 90, preis: preisErsatz = null, mitPreis = false, soGehts } = {}) {
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
  const versand = inkl ? ' inkl. Versand' : info?.versand > 0 ? ` + ${euro(info.versand)} Versand` : '';
  const endeSeite = info?.ende || null;
  const eintragDaten = eintrag({
    kategorie, titel: it.titel, link: it.link, quelle: it.feed, datum: it.datum, jetzt,
    zeile: [p.preis != null ? preisZeile(p) + versand : '', shop ? `bei ${shop}` : '', p.vorherQuelle || '', 'als Preisfehler gemeldet'].filter(Boolean).join(' · '),
    soGehts: soGehts || 'Schnell bestellen, nur mit Käuferschutz (z. B. PayPal) – Preisfehler werden manchmal storniert, dann bekommst du das Geld zurück.',
    art: 'preisfehler', bis: endeSeite || it.bis || null, bisQuelle: endeSeite ? 'deal-seite' : it.bis ? 'text' : null, ab: it.ab,
    wert, sofort: true, grund: 'Preisfehler', preisfehler: true, preise: p,
    // Versand steckt schon im Preis (CAMELBAK „0,99 € + VSK“ = 6,98 €) -> versand 0, damit die Seite nicht „zzgl.“ schreibt
    extra: { shop: shop || null, versand: inkl ? 0 : info?.versand ?? null, versandInklusive: inkl, temperatur: info?.temperatur ?? it.temperatur ?? null, geprueft: !!info },
  });
  return { eintrag: eintragDaten };
}
