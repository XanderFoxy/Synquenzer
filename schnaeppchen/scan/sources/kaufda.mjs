// kaufDA (Bonial): Prospekt-Angebote aus der Region (Stadtseite, z. B. Chemnitz) bzw. bundesweit – als zweite Quelle
// neben marktguru, damit für jedes Produkt etwas da ist, auch wenn es in Döbeln gerade nichts gibt („was ist am nächsten
// dran?“, Xander 08.11.2026).
//
// Seiten: https://www.kaufda.de/<Stadt>/Angebote/<Stichwort> (z. B. /Chemnitz/Angebote/Haribo), ohne Stadt
// https://www.kaufda.de/Angebote/<Stichwort> (Standort Berlin 10178). Die Daten stehen als JSON im Next.js-Block
// <script id="__NEXT_DATA__">: props.pageProps.pageInformation.offers.main.items[] mit publisherName, brand, title,
// description, prices.mainPrice/secondaryPrice/priceByBaseUnit, validFrom/validUntil, offerImages.
// robots.txt (31.10.2026): /Angebote/<Begriff> erlaubt, crawl-delay 2 -> Pause pro Server in config (abruf.pauseProHost).
// Eine Stadt ohne Seite (HTTP 404, z. B. /Doebeln/…) oder ohne Treffer -> einmal die bundesweite Seite.
// Ein Angebot von hier gilt NICHT als bestätigt für Döbeln: regional = true, Hinweis „Prospekt <Stadt> – in Döbeln
// prüfen“, nie Push, nie im eigenen Preisverlauf (das macht main.mjs).
import { norm, parseMenge } from '../text.mjs';

const NEXT = /<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]+?)<\/script>/;

/** Stichwort für die kaufDA-Adresse: „Leckermäulchen“ -> „Leckermaeulchen“, „Ben & Jerry's“ -> „Ben-Jerrys“ */
export function kaufdaSlug(s) {
  return String(s || '').trim()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue').replace(/ß/g, 'ss')
    .replace(/['’]/g, '').replace(/&/g, ' ').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** ISO aus „2026-10-31T22:00:00.000+0000“ (oder null) */
export function kaufdaZeit(s) {
  if (!s) return null;
  const t = Date.parse(String(s).replace(/([+-]\d\d)(\d\d)$/, '$1:$2'));
  return Number.isFinite(t) ? new Date(t).toISOString() : null;
}

/**
 * Grundpreis aus kaufDA-Text -> { preis, einheit: 'kg'|'l'|'100g'|'100ml' } oder null.
 * Nur EIN eindeutiger Wert: „(1 kg = 7.16)“, „1 kg = 7.04“, „€5.66/kg“, „€ 5.71/1 kg“, „100 g = 0,99 €“.
 * Mehrere Werte („1kg = 8,14/7,98/7,16“, „1 kg = 5.21 - 4.76“) oder „je Stück“ -> null (Packung dann aus dem Text).
 */
export function grundpreisAus(s) {
  const t = String(s || '').toLowerCase().replace(/(\d),(\d)/g, '$1.$2').trim();
  if (!t) return null;
  const Z = String.raw`(\d+(?:\.\d+)?)`;
  const einheit = (menge, u, preis) => {
    const m = menge ? Number(menge) : 1;
    if (!(preis > 0)) return null;
    if (u === 'kg' && m === 1) return { preis, einheit: 'kg' };
    if (u === 'l' && m === 1) return { preis, einheit: 'l' };
    if (u === 'g' && m === 100) return { preis, einheit: '100g' };
    if (u === 'ml' && m === 100) return { preis, einheit: '100ml' };
    if (u === 'g' && m === 1000) return { preis, einheit: 'kg' };
    if (u === 'ml' && m === 1000) return { preis, einheit: 'l' };
    return null;
  };
  let m = t.match(new RegExp(String.raw`^\(?\s*(1000|100|1)?\s*(kg|g|l|ml)\s*=\s*(?:€\s*)?${Z}\s*(?:€|eur)?\s*\)?\s*$`));
  if (m) return einheit(m[1], m[2], Number(m[3]));
  m = t.match(new RegExp(String.raw`^\(?\s*(?:€\s*)?${Z}\s*(?:€|eur)?\s*\/\s*(1000|100|1)?\s*(kg|g|l|ml)\s*\)?\s*$`));
  if (m) return einheit(m[2], m[3], Number(m[1]));
  return null;
}

const masse = m => m?.gramm ?? m?.ml ?? null;

/** Packung aus Preis ÷ Grundpreis, gegengeprüft mit dem Text (±3 %); widersprechen sich beide -> packWiderspruch */
export function kaufdaPackung(preis, ref, text) {
  if (!(preis > 0) || !ref) return { packMenge: null, packWiderspruch: false };
  const faktor = ref.einheit === 'kg' ? ['gramm', 1000] : ref.einheit === 'l' ? ['ml', 1000]
    : ref.einheit === '100g' ? ['gramm', 100] : ['ml', 100];
  const menge = Math.round(preis / ref.preis * faktor[1]);
  if (!(menge > 0)) return { packMenge: null, packWiderspruch: false };
  const t = parseMenge(text);
  const tm = masse(t);
  // Text nennt eine andere Menge derselben Art (g ↔ g): eins davon ist falsch -> Menge unsicher
  const gleicheArt = t[faktor[0]] != null;
  const widerspruch = !!(tm && gleicheArt && !t.ausMulti && !t.mehrdeutig && Math.abs(tm - menge) / menge > 0.03);
  return { packMenge: { [faktor[0]]: menge }, packWiderspruch: widerspruch };
}

/** Ein kaufDA-Angebot (items[] aus __NEXT_DATA__) im gemeinsamen Format der Quellen */
export function kaufdaAngebot(o, { seite, ort }) {
  const p = o.prices || {};
  const preis = typeof p.mainPrice === 'number' && p.mainPrice > 0 ? p.mainPrice : null;
  const marke = String(o.brand || '').trim();
  const name = String(o.title || '').trim();
  const titel = (marke && !norm(name).includes(norm(marke)) ? `${marke} ${name}` : name || marke).trim();
  const beschreibung = [o.description, p.description].filter(Boolean).join(' · ');
  const alt = typeof p.secondaryPrice === 'number' && preis && p.secondaryPrice > preis ? p.secondaryPrice : null;
  const ref = grundpreisAus(p.priceByBaseUnit);
  const pack = kaufdaPackung(preis, ref && (ref.einheit === 'kg' || ref.einheit === 'l') ? ref : null, `${name} ${o.description || ''}`);
  const bedingungen = (p.conditions || []).map(c => String(c?.other || '').trim()).filter(c => c && !/^je$/i.test(c));
  const hinweise = [];
  if (p.priceRange) hinweise.push('ab-Preis');
  if (bedingungen.length) hinweise.push(bedingungen.join(', '));
  // „Nur mit App“ (Penny), „mit Kaufland Card“, „Lidl Plus“: der Preis gilt nur mit App/Karte
  const mitApp = bedingungen.some(c => /\bapp\b|card|lidl plus|payback/i.test(c)) || /nur mit (?:der )?(?:app|karte|card)|lidl plus/i.test(o.description || '');
  return {
    quelle: 'kaufda',
    shop: String(o.publisherName || '').trim(),
    titel,
    beschreibung,
    preis,
    preisAlt: alt,
    vorherQuelle: alt ? (p.secondaryPriceIsUVP ? 'UVP laut Prospekt' : 'Streichpreis im Prospekt') : null,
    // Grundpreis nur, wenn er eindeutig ist (sonst rechnet einheitspreis() mit der Packung)
    refPreis: ref && (ref.einheit === 'kg' || ref.einheit === 'l') && !pack.packWiderspruch ? { preis: ref.preis, einheit: ref.einheit } : null,
    packMenge: pack.packMenge,
    packWiderspruch: pack.packWiderspruch,
    mehrereSorten: /versch|verschiedene|sorten/i.test(beschreibung),
    gueltigAb: kaufdaZeit(o.validFrom),
    gueltigBis: kaufdaZeit(o.validUntil),
    link: seite,
    bild: o.offerImages?.url?.normal || o.offerImages?.url?.thumbnail || '',
    online: false,
    versand: 0,
    regional: true,
    region: ort || 'bundesweit',
    kaufdaHinweis: hinweise.join(' · '),
    nurMitApp: mitApp,
    kaufdaId: o.id || null,
  };
}

/** HTML einer kaufDA-Seite -> { ort, url, items[] } (wirft, wenn der Datenblock fehlt) */
export function leseKaufdaSeite(html) {
  const m = String(html || '').match(NEXT);
  if (!m) throw new Error('kaufDA: Datenblock __NEXT_DATA__ fehlt (Seite geändert?)');
  const d = JSON.parse(m[1]);
  const pi = d?.props?.pageProps?.pageInformation || {};
  const of = pi.offers || {};
  const items = [...(of.main?.items || []), ...(of.otherPublishers?.items || [])].filter(x => x && (x.type == null || x.type === 'OFFER'));
  const loc = pi.location || {};
  return { ort: loc.cityDisplayName || loc.city || null, plz: loc.zip || null, url: pi.url || null, items };
}

const ist404 = e => /HTTP 404|HTTP 410/.test(String(e?.message || e));

export async function kaufda({ holeText, cfg, watchlist }) {
  const q = cfg.quellen.kaufda || {};
  const basis = String(q.basis || 'https://www.kaufda.de').replace(/\/$/, '');
  const stadt = q.stadt ? kaufdaSlug(q.stadt) : '';
  const slugs = [...new Set(watchlist.produkte.flatMap(p => p.kaufda || []).map(kaufdaSlug).filter(Boolean))];
  const opts = { headers: { accept: 'text/html,application/xhtml+xml', ...(q.userAgent ? { 'user-agent': q.userAgent } : {}) } };
  const angebote = [], fehler = [], ohneSeite = [];
  let stadtGibtEs = !!stadt, stadtBestaetigt = false, ok = 0;
  const seen = new Set();
  for (const slug of slugs) {
    const versuche = [];
    if (stadtGibtEs) versuche.push({ url: `${basis}/${stadt}/Angebote/${slug}`, stadt: true });
    versuche.push({ url: `${basis}/Angebote/${slug}`, stadt: false });
    let letzterFehler = null, fertig = false, stadt404 = false;
    for (const v of versuche) {
      try {
        const s = leseKaufdaSeite(await holeText(v.url, opts));
        ok++;
        // Stadtseite 404, bundesweite Seite zum selben Stichwort da -> die Stadt hat keine Seiten (nicht das Stichwort):
        // für den Rest des Laufs gleich bundesweit (spart Abrufe). Fehlt das Stichwort überall, bleibt die Stadt.
        if (v.stadt) stadtBestaetigt = true;
        else if (stadt404 && !stadtBestaetigt) stadtGibtEs = false;
        // Stadtseite ohne Treffer -> bundesweit nachsehen (eine Seite mehr), sonst fertig
        if (!s.items.length && v.stadt) continue;
        for (const it of s.items) {
          const a = kaufdaAngebot(it, { seite: s.url || v.url, ort: v.stadt ? s.ort || q.stadt : s.ort ? `bundesweit (${s.ort})` : 'bundesweit' });
          const key = a.kaufdaId || `${a.shop}|${a.titel}|${a.preis}|${a.gueltigBis}`;
          if (!(a.preis > 0) || seen.has(key)) continue;
          seen.add(key);
          angebote.push(a);
        }
        fertig = true;
        break;
      } catch (e) {
        letzterFehler = e;
        // Stadtseite 404: bundesweit versuchen (ob die Stadt oder nur das Stichwort fehlt, zeigt die bundesweite Seite)
        if (v.stadt && ist404(e)) { stadt404 = true; continue; }
        // Stichwort ohne kaufDA-Seite ist keine Störung der Quelle, nur ein Hinweis (Stichwort in watchlist.json prüfen)
        if (!v.stadt && ist404(e)) { ohneSeite.push(slug); letzterFehler = null; }
        break;
      }
    }
    if (!fertig && letzterFehler) fehler.push(`Stichwort „${slug}“: ${letzterFehler.message}`);
  }
  if (slugs.length && !ok && !ohneSeite.length) throw new Error(fehler[0] || 'kaufDA nicht erreichbar');
  if (slugs.length && !ok && fehler.length) throw new Error(fehler[0]);
  const hinweis = [stadt && !stadtGibtEs ? `keine kaufDA-Seite für ${q.stadt} – bundesweite Seiten` : '',
    ohneSeite.length ? `ohne kaufDA-Seite: ${ohneSeite.join(', ')}` : ''].filter(Boolean).join(' · ');
  return { angebote, fehler, hinweis };
}
