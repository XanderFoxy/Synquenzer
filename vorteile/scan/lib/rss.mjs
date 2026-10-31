// Kleiner RSS/Atom-Leser ohne Abhängigkeiten. RSS-Teil wie schnaeppchen/scan/rss.mjs (gleiche Felder),
// zusätzlich Atom-<entry> und <source> (Google News).
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', euro: '€', auml: 'ä', ouml: 'ö', uuml: 'ü', Auml: 'Ä', Ouml: 'Ö', Uuml: 'Ü', szlig: 'ß', ndash: '–', mdash: '—' };
export function entities(s) {
  return String(s ?? '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENT[n] ?? m);
}
const cdata = s => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
export const ohneTags = s => String(s ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? cdata(m[1]).trim() : '';
}
function attrs(block, name) {
  const m = block.match(new RegExp(`<${name}\\s([^>]*?)/?>`, 'i'));
  if (!m) return {};
  const o = {};
  for (const a of m[1].matchAll(/([\w:-]+)="([^"]*)"/g)) o[a[1]] = entities(a[2]);
  return o;
}

export function leseRss(xml) {
  if (!/<rss|<feed|<channel/i.test(xml)) throw new Error('keine RSS-Antwort');
  const items = [];
  for (const m of xml.matchAll(/<item[\s>][\s\S]*?<\/item>|<entry[\s>][\s\S]*?<\/entry>/gi)) {
    const b = m[0];
    const atom = /^<entry/i.test(b);
    const merchant = attrs(b, 'pepper:merchant');
    items.push({
      titel: entities(ohneTags(entities(tag(b, 'title')))),
      link: atom ? (attrs(b, 'link').href || '') : entities(tag(b, 'link')),
      beschreibung: ohneTags(entities(tag(b, atom ? 'summary' : 'description') || tag(b, 'content'))).slice(0, 800),
      datum: tag(b, 'pubDate') || tag(b, 'updated') || tag(b, 'published'),
      shop: merchant.name || '',
      preisText: merchant.price || '',
      temperatur: Number(tag(b, 'pepper:temperature')) || null,
      herkunft: entities(ohneTags(tag(b, 'source'))),
      bild: attrs(b, 'media:content').url || '',
    });
  }
  return items;
}
