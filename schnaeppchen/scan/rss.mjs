// Tiny RSS reader (enough for mydealz/pepper feeds), no dependencies.
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', euro: '€', auml: 'ä', ouml: 'ö', uuml: 'ü', Auml: 'Ä', Ouml: 'Ö', Uuml: 'Ü', szlig: 'ß' };
export function entities(s) {
  return String(s ?? '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENT[n] ?? m);
}
const cdata = s => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
const ohneTags = s => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

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
  for (const m of xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)) {
    const b = m[0];
    const merchant = attrs(b, 'pepper:merchant');
    items.push({
      titel: entities(ohneTags(entities(tag(b, 'title')))),
      link: entities(tag(b, 'link')),
      beschreibung: ohneTags(entities(tag(b, 'description'))).slice(0, 600),
      datum: tag(b, 'pubDate'),
      shop: merchant.name || '',
      preisText: merchant.price || '',
      bild: attrs(b, 'media:content').url || '',
    });
  }
  return items;
}
