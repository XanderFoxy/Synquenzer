// „Auf Amazon ansehen“ zu Markt-Angeboten (Prospekt über marktguru/kaufDA, Deals im Laden): fertige Amazon-Suche aus
// dem Produktnamen – ohne Mengen („200 g“, „6x“, „24er-Pack“, „4 × 100 ml“), Preise, Shopnamen, Klammern und
// Prospekt-Wörter („versch. Sorten“, „je“, „statt“).
// Nur ein Such-Link: kein Partner-/Affiliate-Tag, kein Tracking, kein Abruf von Amazon. Amazon verbietet automatisches
// Auslesen (schnaeppchen/PREISQUELLEN-BEFUND.md, Abschnitt 9) – einen Amazon-Preis gibt es deshalb nur, wenn ein
// laufendes Amazon-Angebot schon in den Daten steht (mydealz/Keepa im Schnäppchen-Wecker); nie geschätzt.
// Der Block zwischen „<amazon-suche>“ und „</amazon-suche>“ steht Wort für Wort auch in mein-vorteil/index.html
// (dort ohne „export “; mein-vorteil/test/regeln.test.mjs prüft das).

// <amazon-suche>
// Wörter, die nie zum Produktnamen gehören: Ketten/Portale (Müller, dm, Hit, Real fehlen absichtlich – auch Marken),
// Mengen-/Preis-Einheiten und Prospekt-Wörter. Verglichen wird klein, mit ae/oe/ue/ss.
const AMAZON_WEG = new Set(('kaufland lidl aldi nord sued netto marken-discount penny edeka marktkauf rewe globus norma nahkauf '
  + 'rossmann amazon amazon.de kaufda marktguru mydealz prospekt xtra centershop diska markant mytime '
  + 'fuer statt nur je ab bis bei beim im versch verschiedene verschiedenen sorten sorte sortiert sortierte angebot angebote '
  + 'abgelaufen aktion aktionspreis deal prime spar-abo sparabo abo uvp coupon gratis app neu ca mo di mi do fr sa so '
  + 'pack packung packungen packs multipack vorratspackung familienpackung grosspackung inhalt '
  + 'stueck stk st g gr gramm kg mg ml cl l ltr liter x eur euro € ct cent wl').split(' '));
// Mengen und Preise als ein Wort: „200g“, „1,5l“, „6x“, „x6“, „24x25g“, „24er“, „5er-Pack“, „0,88€“, „3.11.“, „175“
const AMAZON_MENGE = /^(?:[x×]\d+|\d+(?:[.,]\d+)*(?:[x×]\d+(?:[.,]\d+)?)?(?:kg|gr|g|mg|ml|cl|ltr|l|stück|stk|st|wl|er|€|eur|euro|ct|x|×)?(?:-?(?:pack|packs|packung|box|karton|set|tray))?\.?)$/i;
const AMAZON_RAND = /^(?:und|oder|mit|von|aus|in|&|-)$/i;
const amazonKey = w => w.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');

/** Produktname/Angebotstitel -> Suchwörter für Amazon („Haribo Goldbären“) oder '' (nichts Brauchbares) */
export function amazonSuchwort(text) {
  const roh = String(text ?? '').replace(/\[[^\]]*\]|\([^)]*\)|\{[^}]*\}/g, ' ');
  const woerter = [], gesehen = new Set();
  for (const teil of roh.split(/[\s|;:!?+*"„“”‚‘«»•·/\\_=~^<>#%–—,]+/)) {
    const w = teil.replace(/^[.\-'’]+|[.\-'’]+$/g, '');
    if (!w || w === '×') continue;
    const k = amazonKey(w);
    if (AMAZON_WEG.has(k) || AMAZON_MENGE.test(w) || gesehen.has(k)) continue;
    if (!/[\p{L}\d&]/u.test(w)) continue;
    gesehen.add(k);
    woerter.push(w);
  }
  while (woerter.length && AMAZON_RAND.test(woerter[0])) woerter.shift();
  while (woerter.length && AMAZON_RAND.test(woerter[woerter.length - 1])) woerter.pop();
  const s = woerter.slice(0, 8).join(' ');
  return /\p{L}/u.test(s) ? s : '';
}

/** Fertige Amazon-Suche (ohne Partner-Tag) oder null */
export function amazonLink(text) {
  const s = amazonSuchwort(text);
  return s ? `https://www.amazon.de/s?${new URLSearchParams({ k: s })}` : null;
}

/** Ist das Angebot schon bei Amazon? Dann braucht es keinen Amazon-Link. */
export const istAmazon = shop => /amazon/i.test(String(shop || ''));

/**
 * Markt-Angebot gegen ein laufendes Amazon-Angebot aus den Daten: je Einheit (€/100 g, €/Stück), wenn bei beiden die
 * Menge sicher ist, sonst nur bei gleicher Packung. -> { urteil: 'guenstiger'|'teurer'|'gleich', basis: 'einheit'|'packung' } | null
 */
export function amazonVergleich(markt, amazon) {
  if (!markt || !amazon) return null;
  const sicher = o => o.mengeSicher === true || (o.mengeSicher == null && !!o.packung);
  const z = v => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null);
  let m, a, basis;
  if (sicher(markt) && sicher(amazon) && z(markt.einheitspreis) && z(amazon.einheitspreis)) [m, a, basis] = [markt.einheitspreis, amazon.einheitspreis, 'einheit'];
  else if (markt.packung && markt.packung === amazon.packung && z(markt.preis) && z(amazon.preis)) [m, a, basis] = [markt.preis, amazon.preis, 'packung'];
  else return null;
  const d = (m - a) / a;
  return { urteil: Math.abs(d) < 0.01 ? 'gleich' : d < 0 ? 'guenstiger' : 'teurer', basis };
}
// </amazon-suche>
