// Apple-TV-Angebotsräume (tv.apple.com/de/room/…/edt.item.…): z. B. „Filme für 3,99 €“ – Xander 08.11.2026: „im Apple TV
// Store gibt es eine Seite, wo aktuelle Angebote sind … das kann doch mit dieser Seite abgeglichen werden“.
// Die Seiten sind server-gerendert; Filme stehen als Links /de/movie/<slug>/umc.cmc.<id> darin (in HTML oder eingebettetem
// JSON, Schrägstriche evtl. als \/ oder \u002F). Tolerant gelesen, ohne feste DOM-Struktur:
//   raumLinks(html)  -> Räume, deren Name/Slug nach Angebot klingt (Start-/Filmseite des Stores)
//   raumFilme(html)  -> Filme eines Raums { titel, slug, umc, link }
//   raumPreis(html)  -> Preis aus dem Raum-Namen („3,99 €“) oder null
//   passtZuListe(film, item) -> gleicher Film wie der Listen-Eintrag (Slug-Vergleich, nur exakt; Fortsetzungen nicht)
import { parsePrice } from './text.mjs';
import { entities } from './rss.mjs';

const roh = html => String(html || '').replace(/\\u002F/gi, '/').replace(/\\\//g, '/');
export const ANGEBOT_WORT = /3[-,.]99|4[-,.]99|5[-,.]99|angebot|deal|sale|reduziert|aktion|spar|guenstig|günstig|preis|kracher|wochenende|filme-der-woche|film-der-woche/i;

/** Text -> Apple-Slug-Form („Zurück in die Zukunft“ -> „zuruck-in-die-zukunft“) */
export function slugVon(s) {
  return String(s ?? '').toLowerCase().replace(/ß/g, 'ss').replace(/&/g, ' and ')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
const ausSlug = s => { let t = s; try { t = decodeURIComponent(s); } catch { /* roh */ } return t.replace(/-/g, ' ').replace(/\s+/g, ' ').trim(); };

export function raumLinks(html, land = 'de') {
  const t = roh(html);
  const out = new Map();
  const re = new RegExp(`(?:https://tv\\.apple\\.com)?/${land}/room/([^/"'\\s<>?#]+)/(edt\\.item\\.[0-9a-f-]{36})`, 'gi');
  for (const m of t.matchAll(re)) {
    const id = m[2].toLowerCase();
    if (out.has(id)) continue;
    // Name: nächstes „title“/„name“ in der Nähe oder Link-Text, sonst der Slug
    const umgebung = t.slice(Math.max(0, m.index - 400), m.index + 400);
    const name = entities((umgebung.match(/"(?:title|name)"\s*:\s*"([^"]{2,80})"/) || umgebung.match(/>([^<>]{2,80})<\/a>/) || [])[1] || '') || ausSlug(m[1]);
    out.set(id, { id, slug: m[1], name: name.trim(), url: `https://tv.apple.com/${land}/room/${m[1]}/${id}`, angebot: ANGEBOT_WORT.test(`${m[1]} ${name}`) });
  }
  return [...out.values()];
}

export function raumFilme(html, land = 'de') {
  const t = roh(html);
  const out = new Map();
  const re = new RegExp(`(?:https://tv\\.apple\\.com)?/${land}/movie/([^/"'\\s<>?#]*)/(umc\\.cmc\\.[a-z0-9]+)`, 'gi');
  for (const m of t.matchAll(re)) {
    const umc = m[2].toLowerCase();
    if (out.has(umc)) continue;
    // Apple verlinkt manche Filme ohne Slug („/de/movie//umc.cmc.…“): dann den Titel desselben Links/Objekts nehmen
    // (Link-Text „…>Titel</a>“ oder „title“ im selben JSON-Objekt) – nie den eines Nachbarn; sonst weglassen
    let slug = m[1];
    if (!slug) {
      const linkText = t.slice(m.index, m.index + 400).match(/^[^<>]*>\s*([^<>]{2,120}?)\s*<\/a>/);
      const vor = t.slice(Math.max(0, m.index - 400), m.index), nach = t.slice(m.index, m.index + 400);
      const objekt = vor.slice(vor.lastIndexOf('{') + 1) + nach.slice(0, (nach.indexOf('}') + 1 || nach.length + 1) - 1);
      const json = vor.lastIndexOf('{') >= 0 && objekt.match(/"title"\s*:\s*"([^"]{2,120})"/);
      slug = slugVon(entities((linkText || json || [])[1] || '').trim());
      if (!slug) continue;
    }
    out.set(umc, { titel: ausSlug(slug), slug: slug.toLowerCase(), umc, link: `https://tv.apple.com/${land}/movie/${m[1]}/${umc}` });
  }
  return [...out.values()];
}

/** Name des Raums (<title>, og:title, h1) und Preis darin */
export function raumName(html) {
  const t = String(html || '');
  const m = t.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) || t.match(/<title[^>]*>([^<]+)<\/title>/i) || t.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  return m ? entities(m[1]).replace(/\s*[-–|]\s*Apple TV.*$/i, '').trim() : '';
}
export function raumPreis(html) {
  const n = raumName(html);
  const m = n.match(/(\d{1,2}[.,]\d{2})\s*(?:€|eur)/i);
  return m ? parsePrice(m[1]) : null;
}

/** Gleicher Film? Slug des Stores == Slug eines Listen-Namens (Titel, en, auch, Haupttitel vor „–“/„:“). */
export function passtZuListe(film, item) {
  const namen = [item.titel, item.en, ...(Array.isArray(item.auch) ? item.auch : [])].filter(x => typeof x === 'string' && x.trim());
  const haupt = String(item.titel || '').split(/\s[–—-]\s|:\s/)[0];
  if (haupt && haupt.length >= 4 && haupt !== item.titel) namen.push(haupt);
  const s = slugVon(film.slug || film.titel);
  return namen.some(n => slugVon(n) === s);
}
