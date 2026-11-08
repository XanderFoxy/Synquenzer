// mydealz ohne RSS-Suche: /rss/search?q=… liefert seit 31.10.2026 HTTP 404 (echter Lauf 07.11.2026: alle 20 Suchen).
// Ersatz für alle Module: Gruppen-Feeds /rss/gruppe/<name> (+ /rss/alles, /rss/trending) mit Stichwortfilter.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { macheFixtureAbruf } from '../lib/http.mjs';
import { FIXTURE_KARTE } from './fixtures/karte.mjs';
import { mydealzFeeds, mydealzQuellen, passtStichwort, ohneMydealzSuche, sammleFeeds, MYDEALZ_ALLE } from '../module/gemeinsam.mjs';
import { lauf } from '../main.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const lies = n => readFile(join(HIER, '..', '..', n), 'utf8');
const cfg = JSON.parse(await lies('config.json'));
const filmListen = JSON.parse(await lies('filme.json'));
const wunschliste = JSON.parse(await lies('wunschliste.json'));
const JETZT = new Date('2026-11-07T19:00:00Z');

const feed = items => `<?xml version="1.0"?><rss xmlns:pepper="x"><channel><title>t</title>${items.map(([t, d = '']) =>
  `<item><title><![CDATA[${t}]]></title><description><![CDATA[${d}]]></description><link>https://www.mydealz.de/deals/x-${Math.abs([...t].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7))}</link><pubDate>Sat, 07 Nov 2026 08:00:00 +0000</pubDate></item>`).join('')}</channel></rss>`;

test('config und filme.json: keine mydealz-Such-Adresse mehr (sonst stünde wieder HTTP 404 im Status)', async () => {
  for (const n of ['config.json', 'filme.json']) {
    const text = await lies(n);
    assert.doesNotMatch(text, /mydealz\.de\/rss\/search/, n);
    const j = JSON.parse(text);
    const suchen = [];
    (function geh(o, pfad) {
      if (Array.isArray(o)) o.forEach((x, i) => geh(x, `${pfad}[${i}]`));
      else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { if (k === 'suchen' && !/nebenverdienst|musik|remix|auftritte|unterricht/.test(pfad)) suchen.push(`${pfad}.${k}`); geh(v, `${pfad}.${k}`); }
    })(j, n);
    assert.deepEqual(suchen, [], 'keine mydealz-„suchen“ mehr (Google-News-/Remix-Suchen sind etwas anderes)');
  }
});

test('Gruppen-Feeds: Adressen, Namen, Stichwörter; alte Suchwörter -> Feed aller neuen Deals mit Stichwort', () => {
  const f = mydealzFeeds(['kino', { gruppe: 'wellness-massagen', name: 'Wellness & Thermen', stichwoerter: ['Therme'] }, 'alles', 'trending', ''], { maxAlterTage: 10, art: 'deal' });
  assert.deepEqual(f.map(x => x.url), ['https://www.mydealz.de/rss/gruppe/kino', 'https://www.mydealz.de/rss/gruppe/wellness-massagen', 'https://www.mydealz.de/rss/alles', 'https://www.mydealz.de/rss/trending']);
  assert.deepEqual(f.map(x => x.name), ['mydealz Kino', 'mydealz Wellness & Thermen', 'mydealz neue Deals', 'mydealz heiße Deals']);
  assert.ok(f.every(x => x.maxAlterTage === 10 && x.art === 'deal'));
  assert.deepEqual(f[1].stichwoerter, ['Therme']);
  assert.equal(f[0].stichwoerter, undefined);
  const q = mydealzQuellen({ gruppen: ['geld-zurueck'], suchen: ['Cashback Aktion'] });
  assert.deepEqual(q.map(x => [x.url, x.stichwoerter]), [['https://www.mydealz.de/rss/gruppe/geld-zurueck', undefined], [MYDEALZ_ALLE, ['Cashback Aktion']]]);
  // Stichwort aus mehreren Wörtern: alle müssen vorkommen; „a|b“ = Alternativen; Umlaute egal
  assert.equal(passtStichwort('Konzert-Tickets für Leipzig', ['Konzert Tickets']), true);
  assert.equal(passtStichwort('Konzert in Leipzig', ['Konzert Tickets']), false);
  assert.equal(passtStichwort('Spassbad Riesa: 2 für 1', ['Spaßbad|Spassbad']), true);
  assert.equal(passtStichwort('Massage-Gutschein', ['Therme', 'Erlebnisbad']), false);
  assert.equal(passtStichwort('irgendwas', []), true);
  // alte Adresse in einer eigenen config -> nie mehr /rss/search abrufen
  const alt = ohneMydealzSuche({ name: 'mydealz Bahn', url: 'https://www.mydealz.de/rss/search?q=bahn%20sparpreis', maxAlterTage: 7 });
  assert.deepEqual([alt.url, alt.stichwoerter, alt.maxAlterTage], [MYDEALZ_ALLE, ['bahn sparpreis'], 7]);
  assert.equal(ohneMydealzSuche({ url: 'https://www.mydealz.de/rss/gruppe/reisen' }).url, 'https://www.mydealz.de/rss/gruppe/reisen');
});

test('sammleFeeds: Stichwortfilter, gleicher Feed pro Lauf nur einmal geholt, alte Such-Adresse ohne 404', async () => {
  const geholt = [];
  const holeText = async url => {
    geholt.push(url);
    if (url.includes('/rss/search')) throw new Error('HTTP 404 bei www.mydealz.de');
    return feed([['Erding Therme: Tageskarte 50 % günstiger'], ['Massage 60 Minuten'], ['Bahn: Sparpreis ab 9,99 €']]);
  };
  const a = await sammleFeeds(holeText, mydealzFeeds([{ gruppe: 'wellness-massagen', stichwoerter: ['Therme'] }]), { jetzt: JETZT });
  assert.deepEqual(a.items.map(i => i.titel), ['Erding Therme: Tageskarte 50 % günstiger']);
  const b = await sammleFeeds(holeText, [{ name: 'mydealz Bahn', url: 'https://www.mydealz.de/rss/search?q=bahn%20sparpreis' }, { name: 'neu', url: MYDEALZ_ALLE }], { jetzt: JETZT });
  assert.deepEqual(b.fehler, []);
  assert.ok(b.items.some(i => /Sparpreis/.test(i.titel)));
  assert.ok(!geholt.some(u => u.includes('/rss/search')), 'keine Such-Adresse mehr abgerufen');
  assert.equal(geholt.filter(u => u === MYDEALZ_ALLE).length, 1, '/rss/alles nur einmal für beide Feeds');
  // Fehler werden nicht gemerkt: ein zweiter Versuch holt neu
  let n = 0;
  const wackelt = async () => { n++; if (n === 1) throw new Error('HTTP 503'); return feed([['Therme']]); };
  const f = mydealzFeeds(['kino']);
  assert.equal((await sammleFeeds(wackelt, f, { jetzt: JETZT })).fehler.length, 1);
  assert.equal((await sammleFeeds(wackelt, f, { jetzt: JETZT })).items.length, 1);
});

test('Ganzer Lauf (alle Module): keine /rss/search-Abrufe, Gruppen werden geholt, keine 404 im Status', async () => {
  const fix = macheFixtureAbruf(join(HIER, 'fixtures'), FIXTURE_KARTE);
  const urls = [];
  const holeText = async (url, opts) => { urls.push(url); return fix(url, opts); };
  // Fixtures vom 31.10.2026 (wie module.test.mjs)
  const r = await lauf({ cfg: { ...cfg, module: { ...cfg.module, praemien: { ...cfg.module.praemien, aktiv: true } } }, wunschliste, filmListen, zustand: {}, holeText, jetzt: new Date('2026-10-31T19:00:00Z'), alle: true });
  assert.ok(!urls.some(u => u.includes('mydealz.de/rss/search')), urls.filter(u => u.includes('rss/search')).join('\n'));
  for (const g of ['geld-zurueck', 'kino', 'freizeitpark', 'wellness-massagen', 'bus-bahn', 'apple-tv', 'filme-serien', 'vertraege-finanzen']) {
    assert.ok(urls.includes(`https://www.mydealz.de/rss/gruppe/${g}`), g);
  }
  assert.ok(!urls.some(u => u.includes('rss/gruppe/kultur-freizeit')), 'kein unbelegter Feed (Kultur & Freizeit ist nur eine Hub-Seite)');
  assert.ok(urls.includes(MYDEALZ_ALLE) && urls.includes('https://www.mydealz.de/rss/trending'), 'Wunsch-Geräte aus neuen + heißen Deals');
  assert.equal(urls.filter(u => u === MYDEALZ_ALLE).length, 1, 'ein Abruf für alle sechs Geräte');
  assert.equal(urls.filter(u => u === 'https://www.mydealz.de/rss/gruppe/geld-zurueck').length, 1, 'deals und praemien teilen sich den Feed');
  const fehler = Object.values(r.aktuell.status).flatMap(s => s.fehler || []);
  assert.ok(!fehler.some(f => /404/.test(f)), fehler.join(' | '));
  // die früheren Such-Treffer kommen jetzt aus den Gruppen
  assert.ok(r.aktuell.kategorien.musik.some(e => /MicroFreak/.test(e.titel)), 'MicroFreak aus /rss/alles');
  assert.ok(r.aktuell.kategorien.erleben.some(e => /Bad Schandau/.test(e.titel)), 'Therme aus der Gruppe wellness-massagen');
});
