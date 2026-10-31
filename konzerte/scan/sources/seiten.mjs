// Festival-/Venue-Seiten (config.seiten): Seite höflich laden, nach Bandnamen suchen.
// Ein Treffer = "Band im Programm erwähnt" (ohne genaues Datum) → Push mit Link zur Seite.
import { erwaehnt, berlinIso, datumDe } from '../lib.mjs';

export function htmlZuText(html) {
  return String(html || '')
    .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ');
}

const MONAT = { januar: 1, februar: 2, maerz: 3, märz: 3, april: 4, mai: 5, juni: 6, juli: 7, august: 8, september: 9, oktober: 10, november: 11, dezember: 12 };
const z2 = n => String(n).padStart(2, '0');

/**
 * Festival-Termin von der Seite: erster Zeitraum mit Jahr, der noch nicht vorbei ist ("03.–05.09.2027",
 * "03. – 05. 09.2027", "14.–17. Mai 2027"). Einzelne Daten zählen nicht (oft News/Vorverkauf). -> { von, bis } | null
 */
export function terminAusSeite(text, heute) {
  const t = String(text || '').toLowerCase();
  const re = /(\d{1,2})\.\s*[-–]\s*(\d{1,2})\.\s*(?:(\d{1,2})\.\s*|(januar|februar|märz|maerz|april|mai|juni|juli|august|september|oktober|november|dezember)\s*)(\d{4})/g;
  for (const m of t.matchAll(re)) {
    const monat = m[3] ? Number(m[3]) : MONAT[m[4]];
    const [a, b, j] = [Number(m[1]), Number(m[2]), Number(m[5])];
    if (!(monat >= 1 && monat <= 12 && a >= 1 && b <= 31 && b >= a && b - a <= 10)) continue;
    const von = `${j}-${z2(monat)}-${z2(a)}`, bis = `${j}-${z2(monat)}-${z2(b)}`;
    if (bis >= heute) return { von, bis };
  }
  return null;
}

export function seiteTreffer(html, seite, bands, heute = '') {
  const text = htmlZuText(html);
  const termin = heute ? terminAusSeite(text, heute) : null;
  return bands.filter(b => erwaehnt(text, b)).map(b => ({
    quelle: 'seite:' + seite.id, band: b.name, titel: seite.name, datum: termin?.von || '', zeit: '',
    bis: termin ? berlinIso(termin.bis) : null,
    ort: seite.name, stadt: seite.stadt, land: '', lat: seite.lat, lon: seite.lon,
    link: seite.url, festival: seite.art === 'festival',
    status: termin ? `auf Seite erwähnt – Festival ${datumDe(termin.von)} bis ${datumDe(termin.bis)}` : 'auf Seite erwähnt – Datum siehe Link',
  }));
}

export default async function seiten(ctx) {
  const konzerte = [], fehler = [], geprueft = [];
  for (const s of ctx.config.seiten || []) {
    try { konzerte.push(...seiteTreffer(await ctx.http.get(s.url, { json: false }), s, ctx.bands, ctx.heute)); geprueft.push(s.id); }
    catch (e) { fehler.push(`${s.name}: ${e.message}`); }
  }
  // gesamt: so viele Seiten stehen in der config – die Seite sagt dann ehrlich „3 von 4 geprüft“ statt „Festival-Seiten aus“
  return { konzerte, fehler, geprueft, gesamt: (ctx.config.seiten || []).length };
}
