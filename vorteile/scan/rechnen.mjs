// Deal-Mathe: Mehrkauf-Aktionen, Aktionspackungen, Coupons/Cashback, Mengenlimits -> echter Preis pro Stück und pro 100 g.
// Grundsatz: Es wird nie eine Packung oder Menge empfohlen, die pro 100 g teurer ist als die einfache Alternative.
import { norm, parsePrice, round, euro } from './lib/text.mjs';

const EINHEIT = '(?:x\\s*)?(?:stueck|stk\\.?|tueten|tuete|packungen|packung|pack|dosen|dose|flaschen|flasche|beutel|becher|artikel|tafeln|riegel|kartons?)?';
const ZAHLWORT = { zwei: 2, drei: 3, vier: 4, fuenf: 5 };
const zahl = s => ZAHLWORT[s] ?? Number(s);

const MARKT_APPS = [
  ['kaufland card|kaufland app|kaufland coupon', 'Kaufland Card'],
  ['lidl plus', 'Lidl Plus'],
  ['penny app|penny coupon', 'Penny-App'],
  ['rewe app|rewe bonus|rewe coupon', 'REWE-App'],
  ['netto app|netto coupon', 'Netto-App'],
  ['edeka app|edeka coupon|genuss\\+', 'EDEKA-App'],
  ['aldi app|aldi coupon', 'ALDI-App'],
  ['payback coupon|payback ecoupon', 'Payback-Coupon'],
  ['app coupon|app-coupon|coupon|gutschein', 'Coupon'],
];
const CASHBACK = [
  ['scondoo', 'Scondoo'],
  ['marktguru cashback|marktguru', 'Marktguru Cashback'],
  ['coupies', 'Coupies'],
  ['geld zurueck|geld-zurueck|gzg', 'Geld-zurück-Aktion'],
  ['cashback', 'Cashback'],
];

/** Liest Aktion, Extra-Inhalt, Limit und Coupons aus einem Angebotstext. */
export function parseAktion(text) {
  const t = norm(text).replace(/(\d)\s*€/g, '$1 €');
  const a = { art: null, coupons: [] };
  let m;
  // Bündelpreis: "2 Tüten für 0,88 €", "3 Stück zusammen für 5 €"
  if ((m = t.match(new RegExp(`\\b(\\d{1,2}|zwei|drei|vier|fuenf)\\s*${EINHEIT}\\s*(?:zusammen\\s*)?(?:fuer|zu je zusammen|zum preis von)\\s*(?:nur\\s*)?(\\d+(?:[.,]\\d{1,2})?)\\s*(?:€|eur\\b|euro\\b)`)))) {
    a.art = 'buendel'; a.anzahl = zahl(m[1]); a.buendelPreis = parsePrice(m[2]);
  } else if ((m = t.match(new RegExp(`\\b(\\d|zwei|drei|vier|fuenf)\\s*${EINHEIT}\\s*(?:fuer|zum preis von|zahl(?:e|en)?)\\s*(\\d|eins|einen|zwei|drei|vier)\\b(?!\\s*[.,]\\d)(?!\\s*(?:€|eur|euro|%))`)))) {
    const z = { eins: 1, einen: 1 }[m[2]] ?? zahl(m[2]);
    if (zahl(m[1]) > z) { a.art = 'mehrkauf'; a.anzahl = zahl(m[1]); a.zahlen = z; }
  }
  if (!a.art && /(zweite[snr]?|2\.)\s*(?:artikel|packung|stueck|produkt|tuete|flasche)?\s*(gratis|geschenkt|umsonst|kostenlos)|1\s*\+\s*1\s*(gratis)?\b/.test(t)) {
    a.art = 'mehrkauf'; a.anzahl = 2; a.zahlen = 1;
  }
  if (!a.art && (m = t.match(/(zweite[snr]?|2\.)\s*(?:artikel|packung|stueck|produkt|tuete|flasche)?\s*(?:zum\s*)?(halben preis|(\d{2})\s*%)/))) {
    a.art = 'zweitesRabatt'; a.anzahl = 2; a.rabatt = m[3] ? Number(m[3]) / 100 : 0.5;
  }
  // Aktionspackung: "+25 g gratis", "25 g mehr", "+20 % gratis"
  if ((m = t.match(/\+\s*(\d{1,4})\s*(g|ml)\b|(\d{1,4})\s*(g|ml)\s*(?:gratis|mehr inhalt|mehr|extra|geschenkt)/))) a.extraMenge = Number(m[1] ?? m[3]);
  else if ((m = t.match(/\+?\s*(\d{1,3})\s*%\s*(?:mehr inhalt|gratis|extra|mehr)/))) a.extraProzent = Number(m[1]) / 100;
  // Limit: "max. 5x pro Kunde", "Abgabe max. 6 Stück", "nur 3 pro Haushalt"
  if ((m = t.match(/(?:max(?:imal)?\.?|hoechstens|abgabe(?:menge)?\s*(?:max\.?)?|nur|limit)\s*(\d{1,2})\s*(x|mal|stueck|stk\.?|packungen|tueten|artikel|aktionen)?\s*(?:pro|je)\s*(?:kunde|kunden|einkauf|haushalt|person|bon)/)) ||
      (m = t.match(/(\d{1,2})\s*(x|mal)\s*(?:pro|je)\s*(?:kunde|kunden|einkauf|haushalt|person|bon)/))) {
    a.limit = Number(m[1]);
    a.limitEinheit = /stueck|stk|packungen|tueten|artikel/.test(m[2] || '') ? 'stueck' : 'aktion';
  }
  // Coupons und Cashback (je Satzteil höchstens einer). Der Wert zählt nur, wenn er direkt am Coupon-Wort steht
  // („Coupon mit 1 € Sofort-Rabatt“, „1 € Sofort-Rabatt mit dem Coupon“, „Coupon 0,10 €“, „Scondoo Cashback 0,50 €“) –
  // nicht irgendein Preis im selben Satz („Butter 2,49 € … Coupon“).
  for (const roh of String(text || '').split(/\s[–—-]\s|[;|•\n]|,\s|[.!]\s(?=[A-ZÄÖÜa-z])/)) {
    const teil = norm(roh).replace(/(\d)\s*€/g, '$1 €');
    const cb = CASHBACK.find(([re]) => new RegExp(`\\b(?:${re})`).test(teil));
    const app = !cb && MARKT_APPS.find(([re]) => new RegExp(`\\b(?:${re})`).test(teil));
    if (!cb && !app) continue;
    const wert = wertAmWort(teil, (cb || app)[0]);
    if (!wert) continue;
    if (cb && wert.wert != null) a.coupons.push({ art: 'cashback', name: cb[1], ...wert });
    else if (app) a.coupons.push({ art: 'markt', name: app[1], ...wert });
  }
  return a;
}

const BETRAG = '(\\d+(?:[.,]\\d{1,2})?)\\s*(€|eur\\b|euro\\b|%)';
const DAZWISCHEN_NACH = '(?:\\s*(?:coupon|ecoupon|app|card|plus|cashback))?\\s*(?::|mit|ueber|im wert von|in hoehe von|von|in hoehe|i h v)?\\s*(?:sofort\\s*)?(?:rabatt\\s*)?(?:von\\s*)?-?\\s*';
const DAZWISCHEN_VOR = '\\s*(?:sofort\\s*)?(?:rabatt|nachlass|ersparnis|zurueck|geld zurueck|cashback|coupon)?\\s*(?:mit|per|durch|ueber|dank|via|beim|bei)?\\s*(?:de[mnr]|einem|einer|eine|die|das)?\\s*';
/** Wert direkt vor oder nach dem Coupon-/Cashback-Wort -> { wert } | { prozent } | null */
export function wertAmWort(teil, wortRe) {
  const lies = (z, e) => (e === '%' ? (Number(String(z).replace(',', '.')) > 0 && Number(String(z).replace(',', '.')) < 100 ? { prozent: Number(String(z).replace(',', '.')) / 100 } : null) : { wert: parsePrice(z) });
  const nach = teil.match(new RegExp(`\\b(?:${wortRe})${DAZWISCHEN_NACH}${BETRAG}`));
  if (nach) return lies(nach[1], nach[2]);
  const vor = teil.match(new RegExp(`${BETRAG}${DAZWISCHEN_VOR}(?:[a-z]+\\s+)?(?:${wortRe})\\b`));
  if (vor) return lies(vor[1], vor[2]);
  return null;
}

/**
 * Steckt ein Coupon schon im Deal-Preis? (mydealz: „2,49 € – 1 € Coupon = nur 1,49 €“, „1,49 € mit Coupon“, „dank Coupon“)
 * Dann wird er NICHT noch einmal abgezogen.
 */
export function couponImPreis(text, preis, coupon) {
  if (!(preis > 0)) return false;
  const t = norm(text).replace(/(\d)\s*€/g, '$1 €');
  if (/(?:mit|dank|inkl|inklusive|nach|abzueglich|abzgl)\.?\s*(?:de[mnr]\s*|einem\s*)?(?:\w+\s*)?(?:coupon|gutschein|cashback)/.test(t)) return true;
  const p = String(preis.toFixed(2)).replace('.', ',');
  if (new RegExp(`=\\s*(?:nur\\s*(?:noch\\s*)?)?${p.replace(',', '[.,]')}`).test(t)) return true;
  if (coupon?.wert > 0) {
    // ein anderer Preis im Text minus Coupon = Deal-Preis
    for (const m of t.matchAll(/(\d+[.,]\d{2})\s*(?:€|eur|euro)/g)) if (Math.abs(parsePrice(m[1]) - coupon.wert - preis) < 0.015) return true;
  }
  return false;
}

/** Welche Coupons dürfen zusammen? Ein Markt-Coupon (der beste) + je Anbieter ein Cashback. */
export function stapelCoupons(coupons, basisBetrag) {
  const markt = coupons.filter(c => c.art === 'markt')
    .map(c => ({ ...c, betrag: c.wert ?? round(basisBetrag * (c.prozent || 0)) }))
    .sort((a, b) => b.betrag - a.betrag)[0];
  const cash = [];
  for (const c of coupons.filter(c => c.art === 'cashback')) if (!cash.some(x => x.name === c.name)) cash.push({ ...c, betrag: c.wert });
  return [markt, ...cash].filter(Boolean);
}

/**
 * Rechnet ein Angebot durch.
 * o = { text, shop, einzelpreis?, gramm?, versand?, normalEinzelpreis, normalGramm?, maxPackungen? }
 *   einzelpreis = Preis einer Packung ohne Mehrkauf-Aktion (bei Bündelpreisen optional)
 *   gramm = normale Packungsgröße (g oder ml), normalGramm = Größe beim Normalpreis (Standard: gramm)
 */
export function rechne(o) {
  const a = o.aktion || parseAktion(o.text || '');
  const maxPackungen = o.maxPackungen ?? 10;
  const einzel = o.einzelpreis ?? null;
  // couponsImPreis: der Preis ist schon der Endpreis (mydealz) -> Coupons nur als Hinweis, nichts abziehen
  // (couponAbgezogen: der Text zeigt, dass der Coupon im Preis steckt -> „im Preis schon abgezogen“)
  const imPreis = !!o.couponsImPreis;
  // 1. Kaufeinheit (wie viele Packungen, welcher Preis)
  let proEinheit, preisEinheit, aktionText;
  if (a.art === 'buendel') { proEinheit = a.anzahl; preisEinheit = a.buendelPreis; aktionText = `${a.anzahl} für ${euro(a.buendelPreis)}`; }
  else if (a.art === 'mehrkauf' && einzel) { proEinheit = a.anzahl; preisEinheit = a.zahlen * einzel; aktionText = `${a.anzahl} zum Preis von ${a.zahlen}`; }
  else if (a.art === 'zweitesRabatt' && einzel) { proEinheit = 2; preisEinheit = einzel * (2 - a.rabatt); aktionText = `2. Packung ${Math.round(a.rabatt * 100)} % günstiger`; }
  else if (einzel) { proEinheit = 1; preisEinheit = einzel; aktionText = ''; }
  else return null;

  // 2. Wie oft? Ohne echte Mehrkauf-Aktion genau 1 Packung (kein erfundener 10er-Vorrat). Bei Mehrkauf: Limit
  //    beachten, nicht mehr als maxPackungen Vorrat.
  const maxEinheiten = proEinheit > 1 ? Math.max(1, Math.floor(maxPackungen / proEinheit)) : 1;
  let wdh = maxEinheiten;
  if (a.limit) wdh = Math.min(wdh, a.limitEinheit === 'stueck' ? Math.max(1, Math.floor(a.limit / proEinheit)) : a.limit);
  const packungen = proEinheit * wdh;
  const ware = round(preisEinheit * wdh);

  // 3. Inhalt pro Packung (Aktionspackung)
  const gramm = o.gramm ? o.gramm + (a.extraMenge || 0) + (a.extraProzent ? o.gramm * a.extraProzent : 0) : null;

  // 4. Coupons/Cashback, Versand
  const coupons = stapelCoupons(a.coupons || [], ware);
  const abzug = imPreis ? 0 : round(coupons.reduce((s, c) => s + c.betrag, 0));
  const versand = o.versand || 0;
  const zahlen = round(Math.max(0, ware - abzug) + versand);

  const proPackung = round(zahlen / packungen, 3);
  const pro100 = gramm ? round(zahlen / (packungen * gramm) * 100, 4) : null;
  const normalGramm = o.normalGramm ?? o.gramm ?? null;
  const normalPro100 = o.normalEinzelpreis && normalGramm ? round(o.normalEinzelpreis / normalGramm * 100, 4) : null;
  const normalGesamt = o.normalEinzelpreis ? round(o.normalEinzelpreis * packungen) : null;
  const ersparnis = normalGesamt ? round(1 - zahlen / normalGesamt, 3) : null;
  const ersparnis100 = pro100 && normalPro100 ? round(1 - pro100 / normalPro100, 3) : null;

  // 5. Lohnt sich die Aktion gegenüber "einfach eine Packung zum Einzelpreis"?
  let warnung = '';
  let lohnt = (ersparnis100 ?? ersparnis ?? 0) > 0;
  if (einzel && proEinheit > 1) {
    const einzelPro = round((einzel + versand) / 1, 3);
    if (proPackung >= einzelPro - 1e-9 && !abzug) { lohnt = false; warnung = `Die Aktion ist nicht günstiger als eine einzelne Packung für ${euro(einzel)}.`; }
  }

  const schritte = [];
  if (aktionText) schritte.push(`${wdh}× „${aktionText}“${a.limit ? ` (max. ${a.limit}${a.limitEinheit === 'stueck' ? ' Stück' : '×'} pro Kunde)` : ''} = ${packungen} Packungen`);
  else schritte.push(`${packungen} Packung${packungen > 1 ? 'en' : ''} zu je ${euro(einzel)}`);
  if (a.extraMenge || a.extraProzent) schritte.push(`Aktionspackung: ${gramm} g statt ${o.gramm} g`);
  for (const c of coupons) {
    const wie = o.couponAbgezogen ? 'im Preis schon abgezogen' : 'nicht eingerechnet';
    if (imPreis) schritte.push(c.art === 'cashback' ? `${c.name} nutzen (${euro(c.betrag)} – ${wie})` : `${c.name} an der Kasse zeigen (${euro(c.betrag)} – ${wie})`);
    else schritte.push(c.art === 'cashback' ? `danach ${c.name}: ${euro(c.betrag)} zurück (Kassenbon hochladen)` : `${c.name} an der Kasse: −${euro(c.betrag)}`);
  }
  if (versand) schritte.push(`plus ${euro(versand)} Versand${o.versandHinweis ? ` (${o.versandHinweis})` : ''}`);

  const soGehts = baueSoGehts({ shop: o.shop, wdh, aktionText, packungen, coupons, zahlen, lohnt, einzel, warnung });
  return {
    aktion: a, packungen, wiederholungen: wdh, ware, abzug, versand, zahlen, proPackung, gramm, pro100, normalPro100,
    normalGesamt, ersparnis, ersparnis100, lohnt, warnung, schritte, soGehts,
  };
}

function baueSoGehts({ shop, wdh, aktionText, packungen, coupons, zahlen, lohnt, einzel, warnung }) {
  if (!lohnt) return warnung ? `Nur 1 Packung zum Einzelpreis (${euro(einzel)}) nehmen – die Aktion lohnt nicht.` : 'Nicht kaufen – normal ist es gleich teuer oder günstiger.';
  const wo = shop ? `Bei ${shop}: ` : '';
  const was = aktionText ? `${wdh}× „${aktionText}“ in den Wagen (${packungen} Packungen)` : `${packungen} Packung${packungen > 1 ? 'en' : ''} nehmen`;
  const extra = coupons.map(c => (c.art === 'cashback' ? `danach Bon bei ${c.name} hochladen` : `${c.name} an der Kasse zeigen`));
  return `${wo}${[was, ...extra].join(', ')} → ${euro(zahlen)} gesamt.`;
}

/** Bestes Angebot nach echtem Preis pro 100 g (sonst pro Packung). Nicht lohnende fallen raus. */
export function bestesAngebot(ergebnisse) {
  const ok = ergebnisse.filter(e => e && e.lohnt !== false);
  ok.sort((x, y) => (x.pro100 ?? x.proPackung * 1000) - (y.pro100 ?? y.proPackung * 1000));
  return ok[0] || null;
}

/** Packungsgrößen vergleichen: [{name, preis, gramm}] -> sortiert, mit Warnung bei "größer, aber teurer pro 100 g". */
export function vergleichePackungen(packungen) {
  const mit = packungen.filter(p => p.preis > 0 && p.gramm > 0).map(p => ({ ...p, pro100: round(p.preis / p.gramm * 100, 4) }));
  mit.sort((a, b) => a.pro100 - b.pro100);
  const kleinste = [...mit].sort((a, b) => a.gramm - b.gramm);
  for (const p of mit) {
    const kleinerBilliger = kleinste.find(k => k.gramm < p.gramm && k.pro100 < p.pro100);
    p.schlechter = !!kleinerBilliger;
    if (kleinerBilliger) p.hinweis = `Größer, aber teurer: ${kleinerBilliger.name} kostet nur ${euro(kleinerBilliger.pro100)} pro 100 g.`;
  }
  return { beste: mit[0] || null, alle: mit };
}
