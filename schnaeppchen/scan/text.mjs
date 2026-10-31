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

// Pack size from free text: { stueck, gramm, ml } (each may be undefined)
export function parseMenge(text) {
  const t = String(text ?? '').toLowerCase().replace(/×/g, 'x');
  const out = {};
  const toBase = (v, u) => {
    if (u === 'kg') return { gramm: v * 1000 };
    if (u === 'g') return { gramm: v };
    if (u === 'l' || u === 'liter') return { ml: v * 1000 };
    if (u === 'ml') return { ml: v };
    return {};
  };
  // 24 x 25 g / 4x100ml
  const multi = t.match(/(\d{1,3})\s*x\s*(\d+(?:[.,]\d+)?)\s*-?\s*(kg|g|ml|liter|l)\b/);
  if (multi) {
    const n = Number(multi[1]);
    const b = toBase(num(multi[2]) * n, multi[3]);
    Object.assign(out, b, { stueck: n });
  } else {
    // largest single amount ("150 g", "1,5 l", "465-ml-Becher")
    let best = null;
    for (const m of t.matchAll(/(\d+(?:[.,]\d+)?)\s*-?\s*(kg|g|ml|liter|l)(?![a-z])/g)) {
      const b = toBase(num(m[1]), m[2]);
      const v = b.gramm ?? b.ml;
      if (v > 0 && (!best || v > (best.gramm ?? best.ml))) best = b;
    }
    if (best) Object.assign(out, best);
  }
  // 4 x 5er
  const packs = t.match(/(\d{1,2})\s*x\s*(\d{1,3})\s*-?\s*er\b/);
  if (packs) out.stueck = Number(packs[1]) * Number(packs[2]);
  else if (out.stueck == null) {
    const er = t.match(/(\d{1,3})\s*-?\s*er(?:\s*-?\s*(?:pack|packung|box|karton))?\b/) ||
      t.match(/(\d{1,3})\s*(?:stueck|stück|stk\.?|riegel|schnitten|becher|beutel|tueten|tüten)\b/) ||
      t.match(/(\d{1,3})\s*-?\s*(?:pack|packung)\b/);
    if (er) out.stueck = Number(er[1]);
  }
  return out;
}

// Effective pack data for an item, filling gaps with item defaults.
export function fuelleMenge(menge, item) {
  const m = { ...menge };
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

// term "a|b" matches when one alternative is contained (also with spaces removed: "x-cut" == "xcut")
export function termTrifft(text, term) {
  const t = ' ' + norm(text) + ' ';
  const tc = t.replace(/\s/g, '');
  return String(term).split('|').some(alt => {
    const a = norm(alt);
    return a && (t.includes(a) || tc.includes(a.replace(/\s/g, '')));
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
