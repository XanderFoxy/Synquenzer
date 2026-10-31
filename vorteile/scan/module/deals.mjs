// Modul "deals": rechnet alle Deals neu durch (Mehrkauf, Aktionspackung, Coupons, Cashback, Limits, Versand).
// Quellen: Daten des Schnäppchen-Weckers (schnaeppchen-daten) + mydealz-Feeds (Lebensmittel, Preisfehler ohne Technik).
import { rechne, bestesAngebot, parseAktion } from '../rechnen.mjs';
import { parsePrice, grammAus, altpreisAus, enthaelt, euro, round } from '../lib/text.mjs';
import { sammleFeeds, eintrag } from './gemeinsam.mjs';

const prozent = v => `−${Math.round(v * 100)} %`;

export function zeileAus(r, basis = '100g') {
  const teile = [`${r.packungen} Packung${r.packungen > 1 ? 'en' : ''} für ${euro(r.zahlen)}${r.normalGesamt ? ` statt ${euro(r.normalGesamt)}` : ''}${r.ersparnis > 0 ? ` (${prozent(r.ersparnis)})` : ''}`];
  if (r.pro100 != null) teile.push(`${euro(round(r.pro100, 2))} pro 100 ${basis === '100ml' ? 'ml' : 'g'}${r.normalPro100 ? ` statt ${euro(round(r.normalPro100, 2))}` : ''}`);
  else teile.push(`${euro(r.proPackung)} pro Packung`);
  return teile.join(' · ');
}

// Ein Angebot aus schnaeppchen/data/current.json durchrechnen
export function rechneSchnaeppchen(o, p, m) {
  const a = parseAktion(`${o.titel} ${o.beschreibung || ''}`);
  const versand = o.versand || 0;
  const menge = o.menge || {};
  const gramm = p.basis === '100g' ? menge.gramm : p.basis === '100ml' ? menge.ml : null;
  const normalEinzelpreis = p.normalpreis
    ? (gramm ? p.normalpreis * gramm / 100 : p.basis === 'stueck' && menge.stueck ? p.normalpreis * menge.stueck : null)
    : null;
  const einzelpreis = a.art === 'buendel' ? null : round((o.preis || 0) - versand);
  const r = rechne({ aktion: a, shop: o.shop, einzelpreis, gramm, versand, normalEinzelpreis: normalEinzelpreis && round(normalEinzelpreis, 3), maxPackungen: m.maxPackungen });
  if (r) r.angebot = o;
  return r;
}

export default async function deals({ holeText, cfg, jetzt }) {
  const m = cfg.module.deals;
  const eintraege = [], fehler = [];
  let technikLinks = new Set();

  // a) Schnäppchen-Wecker
  try {
    const cur = JSON.parse(await holeText(cfg.geschwister.schnaeppchen));
    technikLinks = new Set((cur.technik || []).map(t => t.link));
    for (const p of cur.produkte || []) {
      const angebote = [p.bestes, ...(p.weitere || [])].filter(Boolean);
      const best = bestesAngebot(angebote.map(o => rechneSchnaeppchen(o, p, m)));
      if (!best || !(best.ersparnis >= m.minErsparnis)) continue;
      const o = best.angebot;
      const mitAktion = !!(best.aktion.art || best.aktion.coupons.length || best.aktion.extraMenge || best.aktion.extraProzent);
      eintraege.push(eintrag({
        kategorie: 'deals', titel: `${p.name} bei ${o.shop}`, zeile: zeileAus(best, p.basis), soGehts: best.soGehts,
        link: o.link || cfg.seite, quelle: 'Schnäppchen-Wecker', datum: jetzt,
        wert: Math.min(100, 40 + best.ersparnis * 70), frist: o.gueltigBis ? o.gueltigBis.slice(0, 10) : null,
        // Der Schnäppchen-Wecker pusht selbst; hier nur sofort, wenn die Deal-Mathe einen deutlich besseren Preis findet.
        sofort: mitAktion && best.ersparnis >= m.sofortAbErsparnis && !p.deal,
        grund: mitAktion ? 'Aktion durchgerechnet' : 'Schnäppchen',
        extra: { schritte: best.schritte, pro100: best.pro100, ersparnis: best.ersparnis, shop: o.shop, produkt: p.id },
      }));
    }
  } catch (e) { fehler.push(`Schnäppchen-Daten: ${e.message}`); }

  // b) mydealz: Aktionen mit Mehrkauf/Coupons; Preisfehler außerhalb von Technik (Technik meldet der Schnäppchen-Wecker)
  const { items, fehler: f2 } = await sammleFeeds(holeText, m.feeds, { jetzt });
  fehler.push(...f2);
  for (const it of items) {
    if (technikLinks.has(it.link)) continue;
    const text = `${it.titel} ${it.beschreibung}`;
    const preisfehler = it.feedInfo.preisfehler || /preisfehler/i.test(it.titel);
    if (!preisfehler && !enthaelt(text, m.aktionWoerter)) continue;
    const preis = parsePrice(it.preisText) ?? null;
    const alt = altpreisAus(text);
    const r = rechne({ text, shop: it.shop, einzelpreis: preis, gramm: grammAus(it.titel), normalEinzelpreis: alt, maxPackungen: m.maxPackungen });
    if (preisfehler && preis != null) {
      eintraege.push(eintrag({
        kategorie: 'deals', titel: it.titel, zeile: `${euro(preis)}${it.shop ? ` bei ${it.shop}` : ''}${alt ? ` statt ${euro(alt)}` : ''} – als Preisfehler gemeldet`,
        soGehts: 'Schnell bestellen, nur mit Käuferschutz (z. B. PayPal) – Preisfehler werden manchmal storniert, dann bekommst du das Geld zurück.',
        link: it.link, quelle: it.feed, datum: it.datum, wert: 90, sofort: true, grund: 'Preisfehler',
      }));
      continue;
    }
    if (!r || !r.lohnt || !(r.ersparnis >= m.minErsparnis)) continue;
    eintraege.push(eintrag({
      kategorie: 'deals', titel: it.titel, zeile: zeileAus(r), soGehts: r.soGehts, link: it.link, quelle: it.feed, datum: it.datum,
      wert: Math.min(100, 35 + r.ersparnis * 70), sofort: r.ersparnis >= m.sofortAbErsparnis && (it.temperatur ?? 0) >= 300,
      grund: 'Aktion durchgerechnet', extra: { schritte: r.schritte, pro100: r.pro100, ersparnis: r.ersparnis, shop: it.shop },
    }));
  }
  return { eintraege, fehler };
}
