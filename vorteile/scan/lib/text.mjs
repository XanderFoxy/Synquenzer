// Text-Helfer. norm/parsePrice wie schnaeppchen/scan/text.mjs (gleiches Verhalten), dazu Wortsuche und Fristen.
import { endeAus } from './ende.mjs';

export function norm(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/é|è/g, 'e')
    .replace(/&/g, ' und ')
    .replace(/[^a-z0-9,.%€+]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// "1,99 €" | "1.299,00€" | "12.99" | "ab 3,49" -> Zahl (oder null)
export function parsePrice(s) {
  if (typeof s === 'number') return Number.isFinite(s) ? s : null;
  if (s == null) return null;
  const m = String(s).replace(/\s/g, '').match(/(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2})|\.(\d{1,2}))?/);
  if (!m) return null;
  const v = Number(`${m[1].replace(/\./g, '')}.${(m[2] ?? m[3] ?? '0').padEnd(2, '0')}`);
  return Number.isFinite(v) ? v : null;
}

export const round = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

export const euro = v => (v == null ? '–' : v.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }));

// Enthält der Text eines der Wörter? Kurze Wörter (≤ 3 Zeichen) nur als ganzes Wort. "a|b" = Alternativen.
export function enthaelt(text, woerter = []) {
  const t = ' ' + norm(text) + ' ';
  return woerter.some(w => String(w).split('|').some(alt => {
    const n = norm(alt);
    if (!n) return false;
    return n.length <= 3 ? new RegExp(`(^|[^a-z0-9])${n.replace(/[.+]/g, '\\$&')}([^a-z0-9]|$)`).test(t) : t.includes(n);
  }));
}
export const zaehle = (text, woerter = []) => woerter.filter(w => enthaelt(text, [w])).length;

// Frist aus Text: "bis 15.11.2026", "Bewerbungsschluss: 30. November", "Einsendeschluss 1.12." -> "YYYY-MM-DD" (Berlin) | null
// (Regeln in lib/ende.mjs: Reise-/Aufenthaltszeiträume zählen nicht, ohne Jahr -> dieses oder nächstes Jahr)
export function fristAus(text, jetzt = new Date()) {
  return endeAus(text, jetzt)?.tag ?? null;
}

export const datumDe = iso => (iso && /^\d{4}-\d{2}-\d{2}/.test(iso) ? iso.slice(0, 10).split('-').reverse().join('.') : '');

export function tageBis(iso, jetzt = new Date()) {
  if (!iso) return null;
  return Math.ceil((Date.parse(iso.slice(0, 10) + 'T23:59:59Z') - jetzt.getTime()) / 864e5);
}

// Alter eines RSS-Datums in Tagen (unbekannt -> 0, damit nichts aus Versehen wegfällt)
export function alterTage(datum, jetzt = new Date()) {
  const t = Date.parse(datum || '');
  return Number.isFinite(t) ? (jetzt.getTime() - t) / 864e5 : 0;
}

export function schluessel(...teile) {
  const s = teile.map(x => norm(x)).join('|');
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36);
}

// Größte Mengenangabe in g/ml ("150 g", "1,5 kg", "6 x 0,5 l" -> 3000) oder null
export function grammAus(text) {
  const t = String(text ?? '').toLowerCase().replace(/×/g, 'x');
  const n = s => Number(String(s).replace(',', '.'));
  const basis = (v, u) => (u === 'kg' || u === 'l' || u === 'liter' ? v * 1000 : v);
  const multi = t.match(/(\d{1,2})\s*x\s*(\d+(?:[.,]\d+)?)\s*-?\s*(kg|g|ml|liter|l)\b/);
  if (multi) return basis(n(multi[2]) * Number(multi[1]), multi[3]);
  let best = null;
  for (const m of t.matchAll(/(?<![+\d])(\d+(?:[.,]\d+)?)\s*-?\s*(kg|g|ml|liter|l)(?![a-z])/g)) {
    const v = basis(n(m[1]), m[2]);
    if (v > 0 && (best == null || v > best)) best = v;
  }
  return best;
}

// "statt 299 €", "UVP 299,99", "Vergleichspreis 249€" -> Zahl (wie schnaeppchen/scan/deals.mjs altpreisAus)
export function altpreisAus(text) {
  const m = String(text || '').match(/(?:statt|uvp|vergleichspreis|vgp|sonst|regul[aä]r|normalpreis)[:\s]*(?:ca\.?\s*)?(\d[\d.]*(?:,\d{1,2})?)\s*(?:€|eur|euro)?/i);
  return m ? parsePrice(m[1]) : null;
}
