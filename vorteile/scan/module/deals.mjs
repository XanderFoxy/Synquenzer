// Modul "deals": rechnet alle Deals neu durch (Mehrkauf, Aktionspackung, Coupons, Cashback, Limits, Versand).
// Quellen: Daten des Schnäppchen-Weckers (schnaeppchen-daten) + mydealz-Feeds (Lebensmittel, Preisfehler ohne Technik).
// Enden: Schnäppchen-Angebote bis gueltigBis (mit Uhrzeit), mydealz bis Textende / Deal-Seite, sonst Höchstalter (lib/ende.mjs).
import { rechne, bestesAngebot, parseAktion } from '../rechnen.mjs';
import { parsePrice, grammAus, enthaelt, euro, round, datumDe } from '../lib/text.mjs';
import { berlinTag } from '../lib/ende.mjs';
import { dealPruefer, preisAngaben, altpreisAusText } from '../lib/mydealz.mjs';
import { sammleFeeds, eintrag, preisfehlerEintrag, PREISFEHLER } from './gemeinsam.mjs';

const prozent = v => `−${Math.round(v * 100)} %`;

export function zeileAus(r, basis = '100g', { geschaetzt = false, packung = null, ab = null } = {}) {
  const teile = [`${r.packungen} Packung${r.packungen > 1 ? 'en' : ''}${packung ? ` à ${packung}` : ''} für ${euro(r.zahlen)}${r.normalGesamt ? ` statt ${euro(r.normalGesamt)}` : ''}${r.ersparnis > 0 ? ` (${prozent(r.ersparnis)})` : ''}`];
  if (r.pro100 != null) teile.push(`${euro(round(r.pro100, 2))} pro 100 ${basis === '100ml' ? 'ml' : 'g'}${r.normalPro100 ? ` statt ${euro(round(r.normalPro100, 2))}` : ''}`);
  else teile.push(`${euro(r.proPackung)} pro Packung`);
  if (geschaetzt && r.normalGesamt) teile.push('Normalpreis geschätzt');
  if (ab) teile.unshift(`ab ${datumDe(berlinTag(ab))}`);
  return teile.join(' · ');
}

// Großhandel ist für Xander nicht kaufbar (z. B. „EDEKA Foodservice … NUR FÜR GROSSHÄNDLER“)
const GROSSHANDEL = /foodservice|gro(?:ß|ss)handel|gro(?:ß|ss)h(?:ä|ae)ndler|gro(?:ß|ss)verbraucher|nur f(?:ü|ue)r gewerbe|gewerbekunden|selgros|transgourmet|metro cash|c\+c\b/i;

/** Darf ein Angebot aus den Schnäppchen-Daten gerechnet werden? (nicht vorbei, Menge sicher, kein Großhandel) */
export function angebotOk(o, jetztMs = Date.now()) {
  if (!o) return false;
  if (o.gueltigBis && Date.parse(o.gueltigBis) < jetztMs) return false;
  if (o.bis && Date.parse(o.bis) < jetztMs) return false;
  if (o.mengeSicher === false) return false; // ohne sichere Menge keine Prozent-Aussage
  return !GROSSHANDEL.test(`${o.shop || ''} ${o.titel || ''} ${o.beschreibung || ''}`);
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

export default async function deals({ holeText, cfg, jetzt, zustand }) {
  const m = cfg.module.deals;
  const eintraege = [], fehler = [];
  const jetztMs = new Date(jetzt).getTime();
  let technikLinks = new Set();

  // a) Schnäppchen-Wecker
  try {
    const cur = JSON.parse(await holeText(cfg.geschwister.schnaeppchen));
    technikLinks = new Set((cur.technik || []).map(t => t.link));
    for (const p of cur.produkte || []) {
      const angebote = [p.bestes, ...(p.weitere || [])].filter(o => angebotOk(o, jetztMs));
      const best = bestesAngebot(angebote.map(o => rechneSchnaeppchen(o, p, m)));
      if (!best || !(best.ersparnis >= m.minErsparnis)) continue;
      const o = best.angebot;
      const mitAktion = !!(best.aktion.art || best.aktion.coupons.length || best.aktion.extraMenge || best.aktion.extraProzent);
      const ab = o.gueltigAb && Date.parse(o.gueltigAb) > jetztMs ? o.gueltigAb : null;
      eintraege.push(eintrag({
        kategorie: 'deals', titel: `${p.name} bei ${o.shop}`, soGehts: best.soGehts,
        zeile: zeileAus(best, p.basis, { geschaetzt: p.normalQuelle === 'schaetzung', packung: o.packung || null, ab }),
        link: o.link || cfg.seite, quelle: 'Schnäppchen-Wecker', datum: jetzt, jetzt,
        bis: o.gueltigBis || null, bisQuelle: 'feld', ab, art: 'schnaeppchen',
        wert: Math.min(100, 40 + best.ersparnis * 70),
        // Der Schnäppchen-Wecker pusht selbst; hier nur sofort, wenn die Deal-Mathe einen deutlich besseren Preis findet.
        sofort: mitAktion && best.ersparnis >= m.sofortAbErsparnis && !p.deal,
        grund: mitAktion ? 'Aktion durchgerechnet' : 'Schnäppchen',
        preise: preisAngaben({ preis: o.preis, preisVorher: o.preisVorher, vorherQuelle: 'Streichpreis im Prospekt' }),
        extra: {
          schritte: best.schritte, pro100: best.pro100, ersparnis: best.ersparnis, shop: o.shop, produkt: p.id,
          angebotTitel: o.titel || null, packung: o.packung || null, normalQuelle: p.normalQuelle || null,
        },
      }));
    }
  } catch (e) { fehler.push(`Schnäppchen-Daten: ${e.message}`); }

  // b) mydealz: Aktionen mit Mehrkauf/Coupons; Preisfehler außerhalb von Technik (Technik meldet der Schnäppchen-Wecker)
  const { items, fehler: f2 } = await sammleFeeds(holeText, m.feeds, { jetzt });
  fehler.push(...f2);
  const pruefer = dealPruefer({ holeText, zustand, jetzt });
  const istPreisfehler = it => !!(it.feedInfo.preisfehler || PREISFEHLER.test(it.titel));
  // Preisfehler zuerst: sie brauchen die Deal-Seite (Abruf-Limit pro Lauf)
  const sortiert = [...items].sort((a, b) => istPreisfehler(b) - istPreisfehler(a));
  for (const it of sortiert) {
    if (technikLinks.has(it.link)) continue;
    const text = `${it.titel} ${it.beschreibung}`;
    if (istPreisfehler(it)) {
      const r = await preisfehlerEintrag(it, { kategorie: 'deals', pruefer, jetzt, wert: 90, mitPreis: true });
      if (r.eintrag) eintraege.push(r.eintrag);
      else if (r.grund === 'Deal-Seite nicht lesbar') fehler.push(`Preisfehler ausgelassen (${r.grund}): ${it.titel.slice(0, 60)}`);
      continue;
    }
    if (!enthaelt(text, m.aktionWoerter)) continue;
    const preis = parsePrice(it.preisText) ?? null;
    // Normalpreis je Packung (darf gleich dem Einzelpreis sein: „3 für 2, statt 1,29 € je Packung“)
    const altInfo = altpreisAusText(text);
    const alt = altInfo?.preis ?? null;
    const r = rechne({ text, shop: it.shop, einzelpreis: preis, gramm: grammAus(it.titel), normalEinzelpreis: alt, maxPackungen: m.maxPackungen });
    if (!r || !r.lohnt || !(r.ersparnis >= m.minErsparnis)) continue;
    // abgelaufen laut Deal-Seite? (nur wenn das Abruf-Limit es erlaubt; sonst gilt das Höchstalter)
    const s = await pruefer.pruefe(it.link, { neuNachStunden: 6 });
    if (s.info?.abgelaufen) continue;
    const endeSeite = s.info?.ende && Date.parse(s.info.ende) > jetztMs ? s.info.ende : null;
    eintraege.push(eintrag({
      kategorie: 'deals', titel: it.titel, zeile: zeileAus(r, '100g', { ab: it.ab && Date.parse(it.ab) > jetztMs ? it.ab : null }), soGehts: r.soGehts, link: it.link, quelle: it.feed, datum: it.datum, jetzt,
      bis: it.bis || endeSeite, bisQuelle: it.bis ? 'text' : endeSeite ? 'deal-seite' : null, ab: it.ab, art: 'deal',
      wert: Math.min(100, 35 + r.ersparnis * 70), sofort: r.ersparnis >= m.sofortAbErsparnis && (s.info?.temperatur ?? it.temperatur ?? 0) >= 300,
      grund: 'Aktion durchgerechnet', preise: preisAngaben({ preis, preisVorher: alt, vorherQuelle: altInfo?.quelle }),
      extra: { schritte: r.schritte, pro100: r.pro100, ersparnis: r.ersparnis, shop: it.shop },
    }));
  }
  return { eintraege, fehler };
}
