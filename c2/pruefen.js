// Feinschliff – tolerante Antwortprüfung. Tolerant bei: Leerzeichen, typografischen Anführungszeichen/Strichen,
// Satzzeichen am Ende, Groß-/Kleinschreibung NUR am Satzanfang. Nicht tolerant bei ß/ss, Umlauten, Nomen-Großschreibung.
// Ein fehlendes oder überzähliges Komma zählt als richtig, mit Hinweis.
export function norm(s, { komma = true } = {}) {
  let x = String(s ?? '').normalize('NFC')
    .replace(/[‘’‚‛´`]/g, "'")
    .replace(/[“”„‟«»‹›]/g, '"')
    .replace(/[‐-―−]/g, '-')
    .replace(/[   ]/g, ' ')
    .replace(/…/g, '...')
    .replace(/\s+/g, ' ').trim()
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([,;:])(?=\S)/g, '$1 ')
    .replace(/[\s.!?;:]+$/, '').replace(/[.!?]+(["'])$/, '$1').trim();
  if (!komma) x = x.replace(/,/g, '').replace(/\s+/g, ' ').trim();
  return x;
}
const anfangKlein = (s) => s.charAt(0).toLowerCase() + s.slice(1);
// anfang:false → Lücke mitten im Satz: Groß-/Kleinschreibung zählt genau (Nomen groß, „dem“ klein)
const gleichStreng = (a, b, opt, anfang = true) => { const x = norm(a, opt), y = norm(b, opt); return x === y || (anfang && anfangKlein(x) === anfangKlein(y)); };
export const liste = (l) => (Array.isArray(l) ? l : l == null ? [] : [l]).map(String);
// → { richtig, komma (nur Komma anders), treffer }
export function vergleiche(antwort, loesungen, { ganzKlein = false, anfang = true } = {}) {
  const a = ganzKlein ? String(antwort ?? '').toLowerCase() : antwort;
  const ls = liste(loesungen);
  if (!norm(a)) return { richtig: false, komma: false, treffer: null };
  for (const l of ls) if (gleichStreng(a, ganzKlein ? l.toLowerCase() : l, undefined, anfang)) return { richtig: true, komma: false, treffer: l };
  for (const l of ls) if (gleichStreng(a, ganzKlein ? l.toLowerCase() : l, { komma: false }, anfang)) return { richtig: true, komma: true, treffer: l };
  return { richtig: false, komma: false, treffer: null };
}
// Lücken: ein "___" → loesungen = [Alternativen]; mehrere "___" → loesungen = [[Alt. Lücke 1], [Alt. Lücke 2], …]
export const luecken = (satz) => String(satz).split(/_{3,}/);
export function lueckenLoesungen(u) {
  const n = luecken(u.satz).length - 1;
  if (n <= 1) return [liste(u.loesungen)];
  return Array.from({ length: n }, (_, i) => liste(u.loesungen?.[i]));
}
// Token für "fehler": Satzzeichen am Rand zählen nicht
export const kern = (w) => String(w).replace(/^[„“"»«‚‘'(\[]+|[.,;:!?“”"»«‘’')\]]+$/g, '');
// Wortpositionen des Fehlers im Satz (erste Fundstelle der Wortfolge)
export function fehlerSpanne(u) {
  const w = String(u.satz).split(/\s+/).map(kern); const f = String(u.fehler).split(/\s+/).map(kern);
  for (let i = 0; i + f.length <= w.length; i++) if (f.every((x, j) => w[i + j] === x)) return f.map((_, j) => i + j);
  return [];
}
