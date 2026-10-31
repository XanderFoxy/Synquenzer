// Modul "deals": rechnet alle Deals neu durch (Mehrkauf, Aktionspackung, Coupons, Cashback, Limits, Versand).
// Quellen: Daten des Schnäppchen-Weckers (schnaeppchen-daten) + mydealz-Feeds (Lebensmittel, Preisfehler ohne Technik).
// Enden: Schnäppchen-Angebote bis gueltigBis (mit Uhrzeit), mydealz bis Textende / Deal-Seite, sonst Höchstalter (lib/ende.mjs).
import { rechne, bestesAngebot, parseAktion, couponImPreis } from '../rechnen.mjs';
import { parsePrice, grammAus, enthaelt, euro, round, datumDe } from '../lib/text.mjs';
import { berlinTag } from '../lib/ende.mjs';
import { dealPruefer, preisAngaben, altpreisAusText } from '../lib/mydealz.mjs';
import { sammleFeeds, eintrag, preisfehlerEintrag, PREISFEHLER } from './gemeinsam.mjs';

const prozent = v => `−${Math.round(v * 100)} %`;

export function zeileAus(r, basis = '100g', { geschaetzt = false, packung = null, ab = null } = {}) {
  const teile = [`${r.packungen} Packung${r.packungen > 1 ? 'en' : ''}${packung ? ` à ${packung}` : ''} für ${euro(r.zahlen)}${r.normalGesamt ? ` statt ${euro(r.normalGesamt)}` : ''}${r.ersparnis > 0 ? ` (${prozent(r.ersparnis)})` : ''}`];
  if (r.pro100 != null) teile.push(`${euro(round(r.pro100, 2))} pro 100 ${basis === '100ml' ? 'ml' : 'g'}${r.normalPro100 ? ` statt ${euro(round(r.normalPro100, 2))}` : ''}`);
  else if (r.packungen > 1) teile.push(`${euro(r.proPackung)} pro Packung`);
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
  // ohne sichere Menge keine Prozent-Aussage. Altes Datenformat (ohne mengeSicher/packung, z. B. „Knoppers 24er-Pack“
  // mit 40 Stück aus „1 kg = 7,44“) gilt als unsicher – wie auf der Seite mein-vorteil/.
  if (!(o.mengeSicher === true || (o.mengeSicher == null && !!o.packung))) return false;
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

/**
 * Versand für einen mydealz-Deal: Deal-Seite (frei/Preis) zuerst; im Laden nichts; Amazon ohne Prime unter der
 * Grenze aus config (module.deals.amazon, wie schnaeppchen/config.json versand); sonst unbekannt = 0.
 */
export function versandFuer({ shop, text = '', preis, info = null }, cfg) {
  if (info?.versandFrei) return { versand: 0, hinweis: '' };
  if (info?.versand > 0) return { versand: info.versand, hinweis: '' };
  if (info?.lokal) return { versand: 0, hinweis: '' };
  const amazon = cfg.module?.deals?.amazon;
  if (amazon && /amazon/i.test(shop || '') && !amazon.prime && preis > 0 && preis < (amazon.kostenlosAb ?? 39)) {
    if (/versandkostenfrei|kostenlose[rn]? versand|gratis versand|free shipping/i.test(text) && !/prime/i.test(text)) return { versand: 0, hinweis: '' };
    return { versand: amazon.kosten ?? 3.99, hinweis: 'ohne Prime' };
  }
  return { versand: 0, hinweis: '' };
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
    const preis = parsePrice(it.preisText) ?? null;
    const aktion = parseAktion(text);
    // Der mydealz-Preis ist der Endpreis: ein Coupon darin („2,49 € – 1 € Coupon = nur 1,49 €“) wird nicht noch
    // einmal abgezogen. Nie günstiger rechnen als der Deal selbst sagt.
    const couponsImPreis = true;
    const couponAbgezogen = aktion.coupons.some(c => couponImPreis(text, preis, c));
    // Aktion = echte Mehrkauf-Aktion, Coupon/Cashback, Aktionspackung oder ein Aktionswort (ein bloßes „für“ zählt nicht)
    const mitAktion = !!(aktion.art || aktion.coupons.length || aktion.extraMenge || aktion.extraProzent || aktion.limit) || enthaelt(text, m.aktionWoerter);
    const gramm = grammAus(it.titel);
    // Normalpreis je Packung: der niedrigste Vergleichswert aus dem Text (UVP ist oft höher als der echte Vergleich);
    // bei Mehrkauf darf der Normalpreis je Packung gleich dem Einzelpreis sein („3 für 2, statt 1,29 € je Packung“)
    const altInfo = altpreisAusText(text, aktion.art ? null : preis, { niedrigster: true });
    const vorab = rechne({ aktion, text, shop: it.shop, einzelpreis: preis, gramm, normalEinzelpreis: altInfo?.preis ?? null, maxPackungen: m.maxPackungen, couponsImPreis, couponAbgezogen });
    if (!vorab || !vorab.lohnt || !(vorab.ersparnis >= m.minErsparnis)) continue;
    // Deal-Seite: abgelaufen? Ende schon vorbei? Vergleichspreis von mydealz (Vorrang vor UVP/Text), Beginn, Versand.
    // (nur wenn das Abruf-Limit es erlaubt; sonst gelten Text und Höchstalter)
    const s = await pruefer.pruefe(it.link, { neuNachStunden: 6 });
    if (s.info?.abgelaufen) continue;
    if (s.info?.ende && Date.parse(s.info.ende) <= jetztMs) continue;
    const endeSeite = s.info?.ende || null;
    const vergleich = preis != null && s.info?.vergleichspreis > preis
      ? { preis: s.info.vergleichspreis, quelle: 'Vergleichspreis laut mydealz' }
      : altInfo;
    const v = versandFuer({ shop: s.info?.haendler || it.shop, text, preis, info: s.info }, cfg);
    const r = rechne({ aktion, text, shop: it.shop, einzelpreis: preis, gramm, normalEinzelpreis: vergleich?.preis ?? null, maxPackungen: m.maxPackungen, couponsImPreis, couponAbgezogen, versand: v.versand, versandHinweis: v.hinweis });
    if (!r || !r.lohnt || !(r.ersparnis >= m.minErsparnis)) continue;
    const ab = it.ab || (s.info?.start && Date.parse(s.info.start) > jetztMs ? s.info.start : null);
    eintraege.push(eintrag({
      kategorie: 'deals', titel: it.titel, zeile: zeileAus(r, '100g', { ab: ab && Date.parse(ab) > jetztMs ? ab : null }), soGehts: r.soGehts, link: it.link, quelle: it.feed, datum: it.datum, jetzt,
      bis: it.bis || endeSeite, bisQuelle: it.bis ? 'text' : endeSeite ? 'deal-seite' : null, ab, art: 'deal',
      wert: Math.min(100, 35 + r.ersparnis * 70), sofort: r.ersparnis >= m.sofortAbErsparnis && (s.info?.temperatur ?? it.temperatur ?? 0) >= 300,
      grund: mitAktion ? 'Aktion durchgerechnet' : 'Deal durchgerechnet', preise: preisAngaben({ preis: preis != null ? round(preis + (v.versand || 0)) : null, preisVorher: vergleich?.preis, vorherQuelle: vergleich?.quelle }),
      extra: { schritte: r.schritte, pro100: r.pro100, ersparnis: r.ersparnis, shop: it.shop, versand: v.versand, couponAbgezogen },
    }));
  }
  return { eintraege, fehler };
}
