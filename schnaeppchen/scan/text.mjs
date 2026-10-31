// Text helpers: normalising, prices, pack sizes, unit prices and matching offers to watch items.

export function norm(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/é|è/g, 'e')
    .replace(/&/g, ' und ')
    .replace(/[^a-z0-9,.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// "1,99 €" | "1.299,00€" | "12.99" | "ab 3,49" -> number (or null)
export function parsePrice(s) {
  if (typeof s === 'number') return Number.isFinite(s) ? s : null;
  if (s == null) return null;
  const m = String(s).replace(/\s/g, '').match(/(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2})|\.(\d{1,2}))?/);
  if (!m) return null;
  const whole = m[1].replace(/\./g, '');
  const frac = m[2] ?? m[3] ?? '0';
  const v = Number(`${whole}.${frac.padEnd(2, '0')}`);
  return Number.isFinite(v) ? v : null;
}

const num = s => Number(String(s).replace(',', '.'));
const ZAHL = String.raw`\d+(?:[.,]\d+)?`;
const EINHEIT = String.raw`(?:kg|g|ml|cl|liter|l)`;

// Grundpreis-Angaben sind nie die Packungsgröße: "1 kg = 7,44", "(100 g = 0,99 €)", "7,44 €/kg", "0,99 € pro 100 g",
// "Grundpreis …", "kg-Preis …", "/kg", "je kg". Sie werden vor dem Lesen der Menge entfernt.
const GRUNDPREIS_MUSTER = [
  /(?:grundpreis|kilopreis|kilogrammpreis|kg-preis|literpreis|l-preis)/g,
  new RegExp(String.raw`\(?\s*(?<![\d.,]\s*)(?:(?:1|100|1000)\s*-?\s*)?${EINHEIT}\s*=\s*(?:€\s*)?${ZAHL}\s*(?:€|eur(?:o)?)?\s*\)?`, 'g'),
  new RegExp(String.raw`${ZAHL}\s*(?:€|eur(?:o)?)\s*(?:\/|\bpro\b|\bper\b)\s*(?:${ZAHL}\s*)?${EINHEIT}(?![a-z])`, 'g'),
  new RegExp(String.raw`(?:\/|\bpro\b|\bper\b)\s*(?:(?:1|100|1000)\s*)?${EINHEIT}(?![a-z])`, 'g'),
  new RegExp(String.raw`\bje\s+(?:kg|l|liter)(?![a-z])`, 'g'),
];
export function ohneGrundpreis(text) {
  let t = String(text ?? '').toLowerCase().replace(/×/g, 'x');
  for (const re of GRUNDPREIS_MUSTER) t = t.replace(re, ' ');
  return t;
}

const inBasis = (v, u) => {
  if (u === 'kg') return { gramm: v * 1000 };
  if (u === 'g') return { gramm: v };
  if (u === 'l' || u === 'liter') return { ml: v * 1000 };
  if (u === 'cl') return { ml: v * 10 };
  if (u === 'ml') return { ml: v };
  return {};
};
const masse = m => m.gramm ?? m.ml;

// Packungsgröße aus Freitext: { stueck, gramm, ml, ausMulti, mehrdeutig } (Felder fehlen, wenn nicht genannt).
// Stückzahl nur aus ausdrücklichen Angaben: "15 x 25 g", "15er", "15 Stück", "15 St.", "4 x 5er".
export function parseMenge(text) {
  const t = ohneGrundpreis(text);
  const out = {};
  // 15 x 25 g / 4x100ml
  const multi = t.match(new RegExp(String.raw`(\d{1,3})\s*x\s*(${ZAHL})\s*-?\s*(${EINHEIT})(?![a-z])`));
  if (multi) {
    const n = Number(multi[1]);
    Object.assign(out, inBasis(num(multi[2]) * n, multi[3]), { stueck: n, ausMulti: true });
  } else {
    // einzelne Mengen ("150 g", "1,5 l", "465-ml-Becher", "375-g-Packg."); verschiedene Werte = mehrdeutig
    const werte = [];
    for (const m of t.matchAll(new RegExp(String.raw`(${ZAHL})\s*-?\s*(${EINHEIT})(?![a-z])`, 'g'))) {
      const b = inBasis(num(m[1]), m[2]);
      if (masse(b) > 0 && !werte.some(w => Object.keys(w)[0] === Object.keys(b)[0] && Math.abs(masse(w) - masse(b)) < 1e-6)) werte.push(b);
    }
    if (werte.length) {
      const groesste = werte.reduce((a, b) => (masse(b) > masse(a) ? b : a));
      Object.assign(out, groesste);
      if (werte.length > 1) out.mehrdeutig = true;
    }
  }
  // 4 x 5er
  const packs = t.match(/(\d{1,2})\s*x\s*(\d{1,3})\s*-?\s*er\b/);
  if (packs) { out.stueck = Number(packs[1]) * Number(packs[2]); delete out.ausMulti; }
  else if (out.stueck == null) {
    const er = t.match(/(\d{1,3})\s*-?\s*er(?:\s*-?\s*(?:pack|packung|box|karton|beutel|tray))?\b/) ||
      t.match(/(\d{1,3})\s*(?:stueck|stück|stk|st)(?![a-zäöü])\.?/) ||
      t.match(/(\d{1,3})\s*(?:riegel|schnitten|becher|tafeln)\b/) ||
      t.match(/(\d{1,3})\s*-?\s*(?:pack|packung)\b/);
    if (er && Number(er[1]) > 0) out.stueck = Number(er[1]);
  }
  return out;
}

// Mehrere Produkte mit je eigenem Preis in einem Titel ("Ben Jerrys 3,49 / Kartoffeln 7,5KG 4,44 / …"):
// die Mengen im Text gehören dann zu anderen Produkten.
const SAMMEL_TRENNER = /\s[\/|;]\s|\s\+\s/;
const SAMMEL_PREIS = /\d+,\d{2}(?!\s*(?:kg|g|ml|l)\b)/gi;
export function istSammeldeal(titel) {
  const teile = String(titel || '').split(SAMMEL_TRENNER);
  return teile.filter(x => new RegExp(SAMMEL_PREIS.source, 'i').test(x)).length >= 2;
}
// Der Teil eines Sammeldeals, der zum Produkt gehört: { titel: "[Penny] Ben Jerrys 3,49", preis: 3.49 } oder null
export function sammelTeil(titel, item) {
  for (const teil of String(titel || '').split(SAMMEL_TRENNER)) {
    if (!passt(teil, item)) continue;
    const preise = [...teil.matchAll(SAMMEL_PREIS)].map(m => parsePrice(m[0]));
    return { titel: teil.trim(), preis: preise.length ? preise.at(-1) : null };
  }
  return null;
}

const zahlText = v => String(Math.round(v * 100) / 100).replace('.', ',');
function masseText(m) {
  if (m.gramm != null) return m.gramm >= 1000 ? `${zahlText(m.gramm / 1000)} kg` : `${zahlText(m.gramm)} g`;
  if (m.ml != null) return m.ml >= 1000 ? `${zahlText(m.ml / 1000)} l` : `${zahlText(m.ml)} ml`;
  return '';
}
// "15 × 25 g", "600 g", "465 ml", "5 Stück" (oder null)
export function packungText(m = {}) {
  const ges = masse(m);
  if (m.stueck > 1 && ges > 0) {
    const je = ges / m.stueck;
    if (Math.abs(je - Math.round(je)) < 0.05) return `${m.stueck} × ${masseText(m.gramm != null ? { gramm: Math.round(je) } : { ml: Math.round(je) })}`;
    return `${m.stueck} Stück · ${masseText(m)}`;
  }
  if (ges > 0) return masseText(m);
  if (m.stueck > 0) return `${m.stueck} Stück`;
  return null;
}

// Packung eines Angebots für einen Merkzettel-Eintrag – ehrlich: woher die Menge kommt und ob sie sicher ist.
// o.packMenge = Packungsgröße aus den Daten der Quelle (marktguru: volume, geprüft mit Preis ÷ Grundpreis).
// -> { menge: { stueck, gramm|ml }, packung, mengeSicher, mengeQuelle: 'grundpreis'|'text'|'vorgabe'|null }
export function bestimmeMenge(o, item) {
  const titel = o.titel || '';
  const sammel = !!o.sammeldeal || (o.quelle === 'mydealz' && istSammeldeal(titel));
  const t = sammel ? {} : parseMenge(`${titel} ${o.beschreibung || ''}`);
  const g = o.packMenge && masse(o.packMenge) > 0 ? o.packMenge : null;
  const m = {};
  let quelle = null;
  let sicher = !sammel && !o.packWiderspruch;
  let alternativ = null;
  if (g) {
    Object.assign(m, g);
    quelle = 'grundpreis';
    if (t.stueck != null) {
      // "465/4x100ml": die 4 Stück gehören zur anderen Packung (400 ml), nicht zu den 465 ml laut Grundpreis
      const tm = masse(t);
      const passend = !t.ausMulti || (tm > 0 && Math.abs(tm - masse(g)) / masse(g) <= 0.03);
      if (passend) m.stueck = t.stueck;
      // … und diese andere Packung gibt es zum selben Preis: beide nennen, gerechnet wird mit der teureren pro 100 ml
      else if (tm > 0 && (t.gramm != null) === (g.gramm != null)) alternativ = { ...(t.gramm != null ? { gramm: t.gramm } : { ml: t.ml }), stueck: t.stueck };
    }
  } else if (masse(t) > 0) {
    if (t.gramm != null) m.gramm = t.gramm;
    if (t.ml != null) m.ml = t.ml;
    if (t.stueck != null) m.stueck = t.stueck;
    quelle = 'text';
    if (t.mehrdeutig) sicher = false;
  } else if (t.stueck != null) {
    m.stueck = t.stueck;
    quelle = 'text';
  }
  if (item.basis === 'stueck') {
    if (m.stueck == null && m.gramm > 0 && item.stueckGramm && sicher) {
      const n = m.gramm / item.stueckGramm;
      if (n >= 1 && Math.abs(n - Math.round(n)) <= 0.15) m.stueck = Math.round(n);
    } else if (m.stueck != null && m.gramm > 0 && item.stueckGramm) {
      // Stückzahl und Gewicht widersprechen sich (z. B. "5er" bei 375 g) -> nicht sicher
      const n = m.gramm / item.stueckGramm;
      if (Math.abs(n - m.stueck) / m.stueck > 0.25) sicher = false;
    }
  } else if (item.basis === '100g') {
    if (m.gramm == null && m.stueck && item.stueckGramm && quelle) m.gramm = m.stueck * item.stueckGramm;
  }
  // Packung als Text nur aus dem, was das Angebot selbst sagt (nie aus Vorgaben der Merkliste);
  // unsichere Stückzahl nicht als „5 × 75 g“ ausgeben – dann nur Gewicht/Inhalt.
  const packung = sicher ? packungText(m) : packungText({ gramm: m.gramm, ml: m.ml });
  // Lücken mit der Vorgabe aus watchlist.json füllen (nur zum Rechnen; dann ist der Preis pro Stück/100 g unsicher,
  // außer der Grundpreis der Quelle liefert ihn direkt)
  if (item.basis === 'stueck' && m.stueck == null) {
    sicher = false;
    if (item.standardStueck) { m.stueck = item.standardStueck; quelle ||= 'vorgabe'; }
  } else if (item.basis === '100g' && m.gramm == null) {
    if (!o.refPreis) sicher = false;
    if (item.standardGramm) { m.gramm = item.standardGramm; quelle = quelle && o.refPreis ? quelle : 'vorgabe'; }
  } else if (item.basis === '100ml' && m.ml == null) {
    if (!o.refPreis) sicher = false;
    if (item.standardMl) { m.ml = item.standardMl; quelle = quelle && o.refPreis ? quelle : 'vorgabe'; }
  }
  if (!quelle) sicher = false;
  if (alternativ && sicher) {
    return { menge: m, packung: [packung, packungText(alternativ)].filter(Boolean).join(' oder '), mengeSicher: sicher, mengeQuelle: quelle, alternativ };
  }
  return { menge: m, packung, mengeSicher: sicher, mengeQuelle: quelle };
}

// Effective pack data for an item, filling gaps with item defaults (alte Schnittstelle, für Tests/Vergleiche).
export function fuelleMenge(menge, item) {
  const m = { ...menge };
  delete m.ausMulti; delete m.mehrdeutig;
  if (item.basis === 'stueck') {
    if (m.stueck == null && m.gramm && item.stueckGramm) m.stueck = Math.round(m.gramm / item.stueckGramm);
    if (m.stueck == null && item.standardStueck) { m.stueck = item.standardStueck; m.geschaetzt = true; }
  } else if (item.basis === '100g') {
    if (m.gramm == null && m.stueck && item.stueckGramm) m.gramm = m.stueck * item.stueckGramm;
    if (m.gramm == null && item.standardGramm) { m.gramm = item.standardGramm; m.geschaetzt = true; }
  } else if (item.basis === '100ml') {
    if (m.ml == null && item.standardMl) { m.ml = item.standardMl; m.geschaetzt = true; }
  }
  return m;
}

// Unit price for basis. refPreis = price per kg / l from the source (preferred when present).
export function einheitspreis(preis, menge, item, ref) {
  if (!(preis > 0)) return null;
  if (ref && ref.preis > 0) {
    const u = String(ref.einheit || '').toLowerCase();
    if (item.basis === '100g' && u === 'kg') return round(ref.preis / 10);
    if (item.basis === '100ml' && (u === 'l' || u === 'liter')) return round(ref.preis / 10);
    if (item.basis === '100g' && u === '100g') return round(ref.preis);
    if (item.basis === '100ml' && u === '100ml') return round(ref.preis);
  }
  if (item.basis === 'stueck' && menge.stueck > 0) return round(preis / menge.stueck, 3);
  if (item.basis === '100g' && menge.gramm > 0) return round(preis / menge.gramm * 100);
  if (item.basis === '100ml' && menge.ml > 0) return round(preis / menge.ml * 100);
  return null;
}

export const round = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

export const BASIS_LABEL = { stueck: 'pro Stück', '100g': 'pro 100 g', '100ml': 'pro 100 ml' };

// "0,19 €" – immer zwei Nachkommastellen (für Texte auf der Seite und in Pushes)
export const euroKurz = v => (v == null || !Number.isFinite(v) ? '–'
  : `${v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`);

// "Sa 31.10. 19:00" (deutsche Zeit); ohne Uhrzeit, wenn es 23:59/00:00 ist (Ende bzw. Beginn des Tages)
export function zeitpunktText(iso) {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return '';
  const teile = Object.fromEntries(new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', weekday: 'short', day: '2-digit',
    month: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(d).map(x => [x.type, x.value]));
  const tag = `${teile.weekday.replace('.', '')} ${teile.day}.${teile.month}.`;
  const uhr = `${teile.hour}:${teile.minute}`;
  return uhr === '23:59' || uhr === '00:00' ? tag : `${tag} ${uhr}`;
}

// term "a|b" matches when one alternative is contained (also with spaces removed: "x-cut" == "xcut").
// Kurze Wörter (bis 4 Buchstaben) zählen nur am Wortanfang: "eis" trifft "Eis"/"Eiscreme", aber nicht "Preis"/"weiss",
// "mini" trifft "Minis", "ben" trifft "Ben & Jerry's", aber nicht "Lebensmittel".
export function termTrifft(text, term) {
  const t = ' ' + norm(text) + ' ';
  const tc = t.replace(/\s/g, '');
  return String(term).split('|').some(alt => {
    const a = norm(alt);
    if (!a) return false;
    if (a.length <= 4 && !a.includes(' ')) return new RegExp(`[^a-z0-9]${a.replace(/\./g, '\\.')}`).test(t);
    return t.includes(a) || tc.includes(a.replace(/\s/g, ''));
  });
}

const GENERISCH = ['versch', 'verschiedene', 'sorten', 'je ', 'auswahl'];

// Does an offer text belong to a watch item? (count limits checked separately)
export function passt(text, item) {
  if (!(item.muss || []).every(term => termTrifft(text, term))) return false;
  if ((item.nicht || []).some(term => termTrifft(text, term))) return false;
  if (item.sorte?.length) {
    const generisch = GENERISCH.some(g => (' ' + norm(text) + ' ').includes(g));
    if (!generisch && !item.sorte.every(term => termTrifft(text, term))) return false;
  }
  return true;
}

export function stueckPasst(menge, item) {
  if (item.stueckMin == null && item.stueckMax == null) return true;
  const n = menge.stueck ?? (menge.gramm && item.stueckGramm ? Math.round(menge.gramm / item.stueckGramm) : null);
  if (n == null) return item.stueckMin == null; // unknown count -> only the "small pack" item
  if (item.stueckMin != null && n < item.stueckMin) return false;
  if (item.stueckMax != null && n > item.stueckMax) return false;
  return true;
}
