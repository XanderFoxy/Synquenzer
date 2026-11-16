// Programm-Schnittstellen trotz robots.txt-Sperre (MV7, Xanders Entscheidung 16.11.2026): Ausnahme NUR für genau fünf
// API-Pfade, gedrosselt und gemerkt nach den Regeln der Dienste; alle anderen Pfade bleiben unter der robots-Regel,
// Reddit und Freelancer.com bleiben immer aus (Nutzungsbedingungen).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { macheAbruf, macheFixtureAbruf } from '../lib/http.mjs';
import { macheRegelWache, istRegelSperre, regelQuellen } from '../lib/robots.mjs';
import { SCHNITTSTELLEN, NIE, schnittstelleFuer, schnittstellenPausen, cacheAufraeumen, cacheSchreibe } from '../lib/schnittstellen.mjs';
import { FIXTURE_KARTE } from './fixtures/karte.mjs';
import { lauf } from '../main.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const FX = join(HIER, 'fixtures');
const cfg = JSON.parse(await readFile(join(HIER, '..', '..', 'config.json'), 'utf8'));
const wunschliste = JSON.parse(await readFile(join(HIER, '..', '..', 'wunschliste.json'), 'utf8'));
const JETZT = new Date('2026-11-16T15:00:00Z');

// echte robots.txt der fünf Dienste (Roh-Lauf 43868228532 und Lauf 43869290803, 16.11.2026), gekürzt auf die Gruppe „*“
export const ECHT_ROBOTS = {
  'overpass-api.de': 'User-agent: *\nDisallow: /api/\nDisallow: /munin/\nDisallow: /achavi/\n',
  'news.google.com': 'User-agent: *\nDisallow: /\nAllow: /$\nAllow: /?\nAllow: /home$\nAllow: /topics/\nAllow: /publications/\nAllow: /stories/\nAllow: /about/\n\nUser-agent: ClaudeBot\nDisallow: /\n',
  'itunes.apple.com': 'User-agent: *\nDisallow: /WebObjects/MZFastFinance.woa\nDisallow: /WebObjects/*\nAllow: /WebObjects/MZStore.woa/wa/viewMultiRoom?*\nDisallow: /search*\nDisallow: /*/rss/*\nDisallow: /*/lookup?\n',
  'query.wikidata.org': 'User-agent: *\nDisallow: /sparql\nDisallow: /bigdata\n',
  'remotive.com': 'User-agent: *\nDisallow: /*search=\nDisallow: /jobs/*\nDisallow: /api/*\nDisallow: /remote-jobs/get_tags\nDisallow: /*category=\n',
};

/** Abruf-Attrappe: robots.txt aus ECHT_ROBOTS (+ eigene), sonst Fixtures bzw. ein kleiner Text; zählt jeden Abruf */
function attrappe(robots = ECHT_ROBOTS, { fixtures = false } = {}) {
  const fx = fixtures ? macheFixtureAbruf(FX, FIXTURE_KARTE) : async url => { throw new Error(url); };
  const gefragt = [];
  const hole = async (url, o) => {
    gefragt.push(url);
    const u = new URL(url);
    if (u.pathname === '/robots.txt' && u.host in robots) return robots[u.host];
    try { return await fx(url, o); } catch { return `antwort ${url}`; }
  };
  return { hole, gefragt };
}

test('Ausnahmeliste: genau fünf Hosts, klein und im Code; Reddit/Freelancer nie', () => {
  assert.deepEqual(SCHNITTSTELLEN.map(s => s.host), ['overpass-api.de', 'news.google.com', 'itunes.apple.com', 'query.wikidata.org', 'remotive.com']);
  assert.ok(Object.isFrozen(SCHNITTSTELLEN) && SCHNITTSTELLEN.every(Object.isFrozen), 'nicht zur Laufzeit erweiterbar');
  assert.deepEqual(NIE, ['reddit.com', 'freelancer.com']);
  for (const s of SCHNITTSTELLEN) {
    assert.ok(s.pauseMs >= 2000 && s.maxJeLauf > 0 && s.maxJeLauf <= 60 && s.regeln.length > 40, s.host);
    assert.ok(!NIE.some(h => s.host.includes(h)), s.host);
  }
  // nicht in der config: die Ausnahme kann nicht still über config.json wachsen
  assert.ok(!JSON.stringify(cfg.abruf.robotsAusnahmen).match(/overpass|google|itunes|wikidata|remotive/));
  // selbst eine (falsche) eigene Liste mit Reddit/Freelancer greift nicht
  const falsch = [{ host: 'www.reddit.com', pfad: /.*/ }, { host: 'reddit.com', pfad: /.*/ }, { host: 'www.freelancer.com', pfad: /.*/ }];
  for (const url of ['https://www.reddit.com/r/German/new/.rss', 'https://reddit.com/x', 'https://www.freelancer.com/api/projects/0.1/projects/active/']) assert.equal(schnittstelleFuer(url, falsch), null, url);
});

test('Ausnahme greift nur für genau diese Pfade (Host genau, kein http, keine Unterdomain)', () => {
  const ja = [
    'https://overpass-api.de/api/interpreter?data=%5Bout%3Ajson%5D',
    'https://news.google.com/rss/search?q=Remix%20Contest&hl=de&gl=DE&ceid=DE:de',
    'https://itunes.apple.com/search?term=star%20trek&country=de&media=movie&entity=movie&limit=10',
    'https://itunes.apple.com/de/rss/topmovies/limit=100/genre=4401/json',
    'https://itunes.apple.com/de/rss/toptvseasons/limit=100/json',
    'https://itunes.apple.com/us/rss/toptvseasons/limit=100/genre=4002/json',
    'https://query.wikidata.org/sparql?format=json&query=SELECT',
    'https://remotive.com/api/remote-jobs?search=german%20teacher&limit=50',
  ];
  const nein = [
    'http://overpass-api.de/api/interpreter?data=x', 'https://overpass-api.de/api/status', 'https://overpass-api.de/api/interpreter/x',
    'https://overpass-api.de/api/kill_my_queries', 'https://z.overpass-api.de/api/interpreter?data=x', 'https://overpass-api.de/munin/',
    'https://news.google.com/', 'https://news.google.com/search?q=x', 'https://news.google.com/rss/topics/CAAq', 'https://news.google.com/rss',
    'https://news.google.com/rss/search/x', 'https://news.google.com/articles/CBMi',
    'https://itunes.apple.com/searchx?term=a', 'https://itunes.apple.com/search/x', 'https://itunes.apple.com/de/lookup?id=1',
    'https://itunes.apple.com/de/rss/topsongs/limit=10/json', 'https://itunes.apple.com/de/rss/topmovies/limit=100/xml',
    'https://itunes.apple.com/WebObjects/MZFinance.woa/wa/x', 'https://apps.itunes.apple.com/search?term=a',
    'https://query.wikidata.org/bigdata/namespace/wdq/sparql?query=x', 'https://query.wikidata.org/sparql/x', 'https://www.wikidata.org/sparql?query=x',
    'https://remotive.com/api/other', 'https://remotive.com/remote-jobs?search=x', 'https://remotive.com/jobs/1', 'https://remotive.com/api/remote-jobs/1',
  ];
  for (const u of ja) assert.ok(schnittstelleFuer(u), `Ausnahme fehlt: ${u}`);
  for (const u of nein) assert.equal(schnittstelleFuer(u), null, `Ausnahme zu weit: ${u}`);
});

test('Regel-Wache mit echten robots.txt: Schnittstellen gelesen, andere gesperrte Pfade bleiben gesperrt, Reddit/Freelancer nie', async () => {
  const { hole, gefragt } = attrappe();
  const w = macheRegelWache(hole, { agbVerbot: cfg.abruf.agbVerbot, jetzt: JETZT, agent: 'meinvorteil-radar' });
  w.wache.modul = 'test';
  const api = [
    'https://overpass-api.de/api/interpreter?data=x', 'https://news.google.com/rss/search?q=a', 'https://itunes.apple.com/search?term=a',
    'https://itunes.apple.com/de/rss/topmovies/limit=100/genre=4401/json', 'https://query.wikidata.org/sparql?query=x', 'https://remotive.com/api/remote-jobs?search=x',
  ];
  for (const u of api) assert.equal(await w(u), `antwort ${u}`, u);
  const gesperrt = ['https://overpass-api.de/api/status', 'https://news.google.com/search?q=a', 'https://news.google.com/rss/topics/x', 'https://itunes.apple.com/de/lookup?id=1',
    'https://itunes.apple.com/WebObjects/MZFinance.woa/x', 'https://query.wikidata.org/bigdata/x', 'https://remotive.com/jobs/1', 'https://remotive.com/remote-jobs?search=x'];
  for (const u of gesperrt) await assert.rejects(w(u), e => istRegelSperre(e) && e.regel === 'robots', u);
  for (const u of ['https://www.reddit.com/r/German/new/.rss', 'https://www.freelancer.com/api/projects/0.1/projects/active/']) await assert.rejects(w(u), e => istRegelSperre(e) && e.regel === 'agb', u);
  for (const u of gesperrt) assert.ok(!gefragt.includes(u), `gesperrter Pfad abgerufen: ${u}`);
  assert.ok(!gefragt.some(u => /reddit|freelancer/.test(u)), 'Reddit/Freelancer nie gefragt – auch nicht die robots.txt');
  // robots.txt wird trotzdem vorher gelesen (für die Anzeige und die Regel im Status)
  for (const h of Object.keys(ECHT_ROBOTS)) assert.ok(gefragt.indexOf(`https://${h}/robots.txt`) < gefragt.findIndex(u => u.startsWith(`https://${h}/`) && !u.endsWith('/robots.txt')), h);
  const st = w.wache.schnittstelle;
  assert.equal(st.get('overpass-api.de').regel, 'robots.txt: Disallow: /api/');
  assert.equal(st.get('itunes.apple.com').n, 2);
  const q = regelQuellen(w.wache, 'test');
  assert.deepEqual(q.filter(x => x.art === 'schnittstelle').map(x => x.host).sort(), Object.keys(ECHT_ROBOTS).sort());
  assert.deepEqual(q.filter(x => x.art === 'gesperrt').map(x => x.host), ['reddit.com', 'freelancer.com'], 'Schnittstellen-Hosts nicht zusätzlich „gesperrt“');
  assert.ok(q.length <= 10);
});

test('Drosselung: Obergrenze je Lauf, dieselbe Adresse nur einmal je Lauf, robots.txt nicht lesbar sperrt die Schnittstelle nicht', async () => {
  const { hole, gefragt } = attrappe({ ...ECHT_ROBOTS, 'overpass-api.de': undefined });
  const robots503 = async (url, o) => { if (url === 'https://overpass-api.de/robots.txt') throw new Error('HTTP 503 bei overpass-api.de'); return hole(url, o); };
  const w = macheRegelWache(robots503, { jetzt: JETZT });
  const ov = SCHNITTSTELLEN.find(s => s.host === 'overpass-api.de');
  for (let i = 0; i < ov.maxJeLauf; i++) await w(`https://overpass-api.de/api/interpreter?data=${i}`);
  await assert.rejects(w('https://overpass-api.de/api/interpreter?data=neu'), e => !istRegelSperre(e) && /höchstens 3 Abrufe je Lauf – Rest im nächsten Lauf/.test(e.message));
  assert.equal(gefragt.filter(u => /overpass-api\.de\/api/.test(u)).length, ov.maxJeLauf);
  // Lauf-Memo: zweimal dieselbe Suche -> ein Abruf, zählt nicht gegen die Grenze
  await w('https://news.google.com/rss/search?q=x'); await w('https://news.google.com/rss/search?q=x');
  assert.equal(gefragt.filter(u => u === 'https://news.google.com/rss/search?q=x').length, 1);
  assert.deepEqual({ n: w.wache.schnittstelle.get('news.google.com').n, gemerkt: w.wache.schnittstelle.get('news.google.com').gemerkt }, { n: 1, gemerkt: 1 });
  // POST (mit Body) wird nie gemerkt
  await w('https://query.wikidata.org/sparql', { method: 'POST', body: 'query=a' }); await w('https://query.wikidata.org/sparql', { method: 'POST', body: 'query=a' });
  assert.equal(gefragt.filter(u => u === 'https://query.wikidata.org/sparql').length, 2);
});

test('Cache über Läufe: Google News 6 h, Wikidata 24 h, nur mit cache: true; Overpass/Apple/Remotive nie gemerkt; Größe begrenzt', async () => {
  const { hole, gefragt } = attrappe();
  const zustand = {};
  const neu = (stunden, cache = true) => macheRegelWache(hole, { zustand, jetzt: new Date(JETZT.getTime() + stunden * 3600e3), cache });
  const gn = 'https://news.google.com/rss/search?q=Kinderfest%20D%C3%B6beln', wd = 'https://query.wikidata.org/sparql?query=x', ap = 'https://itunes.apple.com/search?term=a';
  const w1 = neu(0);
  for (const u of [gn, wd, ap]) await w1(u);
  assert.ok(zustand.schnittstellen.cache[gn].gz && zustand.schnittstellen.cache[wd].gz && !zustand.schnittstellen.cache[ap], 'nur Google News + Wikidata gemerkt');
  gefragt.length = 0;
  const w2 = neu(5);
  assert.equal(await w2(gn), `antwort ${gn}`, 'gemerkte Antwort entpackt');
  await w2(wd); await w2(ap);
  assert.deepEqual(gefragt, [ap], '5 h später: Google News und Wikidata aus dem Cache');
  gefragt.length = 0;
  const w3 = neu(7);
  await w3(gn); await w3(wd);
  assert.deepEqual(gefragt, [gn], '7 h später: Google News neu, Wikidata noch gemerkt');
  gefragt.length = 0;
  const ohne = neu(8, false);
  await ohne(gn);
  assert.deepEqual(gefragt, [gn], 'ohne cache (Tests, Roh-Lauf): immer frisch');
  // Aufräumen: Abgelaufenes raus, dann Größe (älteste zuerst)
  cacheAufraeumen(zustand, JETZT.getTime() + 30 * 3600e3);
  assert.deepEqual(Object.keys(zustand.schnittstellen.cache), []);
  const z = {};
  for (let i = 0; i < 5; i++) cacheSchreibe(z, `https://news.google.com/rss/search?q=${i}`, `x${i}`.repeat(4000) + Math.random(), JETZT.getTime() + i * 1000);
  const groesse = Object.values(z.schnittstellen.cache).reduce((n, e) => n + e.gz.length, 0);
  cacheAufraeumen(z, JETZT.getTime() + 5000, SCHNITTSTELLEN, Math.floor(groesse * 0.6));
  const bleibt = Object.keys(z.schnittstellen.cache);
  assert.ok(bleibt.length >= 1 && bleibt.length < 5 && bleibt.includes('https://news.google.com/rss/search?q=4') && !bleibt.includes('https://news.google.com/rss/search?q=0'), bleibt.join(' '));
});

test('Abstände: Schnittstellen bringen ihre Pausen mit (größerer Wert gewinnt), macheAbruf hält sie ein; User-Agent ohne Namen/E-Mail', async () => {
  const p = schnittstellenPausen(cfg.abruf.pauseMsJeHost);
  assert.equal(p['itunes.apple.com'], 3200);
  assert.equal(p['overpass-api.de'], 10000);
  assert.equal(p['news.google.com'], 3000);
  assert.equal(p['remotive.com'], 30000);
  assert.equal(p['www.kaufda.de'], 2100, 'andere Hosts bleiben');
  assert.equal(schnittstellenPausen({ 'news.google.com': 9000 })['news.google.com'], 9000);
  // macheAbruf: zwei Abrufe beim selben Host liegen mindestens den Host-Abstand auseinander
  const zeiten = [];
  const ua = [];
  const hole = macheAbruf({ pauseMs: 1, timeoutMs: 2000, userAgent: cfg.abruf.userAgent, pauseMsJeHost: schnittstellenPausen({}, [{ host: 'langsam.example', pauseMs: 150 }]) },
    async (url, o) => { zeiten.push(Date.now()); ua.push(o.headers['user-agent']); return new Response('ok'); });
  await hole('https://langsam.example/a'); await hole('https://langsam.example/b');
  assert.ok(zeiten[1] - zeiten[0] >= 140, `${zeiten[1] - zeiten[0]} ms`);
  // 429/5xx: die eine Wiederholung kommt frühestens nach dem Host-Abstand (Overpass „at capacity“: 10 s, nicht 3 s)
  const z2 = [];
  const hole2 = macheAbruf({ pauseMs: 1, wiederholMs: 10, timeoutMs: 2000, userAgent: 'x', pauseMsJeHost: { 'voll.example': 150 } },
    async () => { z2.push(Date.now()); return new Response(z2.length === 1 ? 'at capacity' : 'ok', { status: z2.length === 1 ? 502 : 200 }); });
  assert.equal(await hole2('https://voll.example/api'), 'ok');
  assert.ok(z2[1] - z2[0] >= 140, `Wiederholung nach ${z2[1] - z2[0]} ms`);
  // eigener, ehrlicher User-Agent – ohne Personennamen, ohne E-Mail, ohne persönliche Adresse
  assert.match(cfg.abruf.userAgent, /^MeinVorteil-Radar\/1\.0 \(/);
  assert.doesNotMatch(cfg.abruf.userAgent, /xander|foxy|@|github|https?:/i);
  assert.ok(ua.every(x => x === cfg.abruf.userAgent));
});

test('Ganzer Lauf mit echten robots.txt: Unterricht liest Remotive, Filme die Apple-Charts – Quellen-Liste sagt „Schnittstelle“', async () => {
  const { hole, gefragt } = attrappe(ECHT_ROBOTS, { fixtures: true });
  const nur = { ...cfg, module: Object.fromEntries(Object.entries(cfg.module).map(([k, v]) => [k, { ...v, aktiv: k === 'unterricht' || k === 'filme' || k === 'auftraege' }])) };
  const filmListen = JSON.parse(await readFile(join(HIER, '..', '..', 'filme.json'), 'utf8'));
  const zustand = {};
  const r = await lauf({ cfg: nur, wunschliste, filmListen, vorher: null, zustand, holeText: hole, jetzt: JETZT, alle: true });
  const u = r.aktuell.status.unterricht, f = r.aktuell.status.filme;
  assert.ok(!(u.hinweise || []).some(h => /robots\.txt von remotive\.com/.test(h)), (u.hinweise || []).join(' | '));
  assert.ok(gefragt.some(x => /^https:\/\/remotive\.com\/api\/remote-jobs\?/.test(x)), 'Remotive gelesen');
  assert.ok(u.quellen.some(q => q.host === 'remotive.com' && q.art === 'schnittstelle'), JSON.stringify(u.quellen));
  assert.ok(u.quellen.some(q => q.host === 'news.google.com' && q.art === 'schnittstelle'));
  assert.ok(!(f.hinweise || []).some(h => /robots\.txt von itunes\.apple\.com/.test(h)), (f.hinweise || []).join(' | '));
  assert.ok(gefragt.some(x => /itunes\.apple\.com\/de\/rss\/topmovies/.test(x)), 'Apple-Charts gelesen');
  assert.ok(f.quellen.some(q => q.host === 'itunes.apple.com' && q.art === 'schnittstelle'), JSON.stringify(f.quellen));
  assert.ok(!gefragt.some(x => /reddit|freelancer/.test(x)));
  // Nebenverdienst lässt Freelancer.com selbst aus (Nutzungsbedingungen) -> trotzdem „gesperrt (Regeln)“ in der Quellen-Liste
  assert.deepEqual(r.aktuell.status.auftraege.quellen, [{ host: 'freelancer.com', art: 'gesperrt' }]);
  // Zahlen des Laufs im Zustand (für den Bericht/Prüfer)
  assert.ok(zustand.schnittstellen.lauf['itunes.apple.com'].n > 0);
  assert.equal(zustand.schnittstellen.lauf['remotive.com'].regel, 'robots.txt: Disallow: /*search=', 'längste passende Regel (RFC 9309)');
  assert.equal(zustand.schnittstellen.cache, undefined, 'lauf() ohne schnittstellenCache merkt nichts (Tests/Roh)');
});

test('main(): echter Lauf merkt Google News/Wikidata im Zustand, zweiter Lauf 1 h später fragt sie nicht noch einmal', async () => {
  const { main } = await import('../main.mjs');
  const dir = await mkdtemp(join(tmpdir(), 'vorteile-api-'));
  const gefragt = [];
  const fx = macheFixtureAbruf(FX, FIXTURE_KARTE);
  const fetchImpl = async url => {
    gefragt.push(url);
    const u = new URL(url);
    if (u.pathname === '/robots.txt') return u.host in ECHT_ROBOTS ? new Response(ECHT_ROBOTS[u.host]) : new Response('', { status: 404 });
    try { return new Response(await fx(url)); } catch { return new Response('nicht da', { status: 404 }); }
  };
  const log = console.log; console.log = () => {};
  try {
    await main(['--data', dir, '--alle', '--dry-run', '--jetzt', '2026-11-16T15:00:00Z'], {}, { fetchImpl, abruf: { pauseMs: 0 } });
    const n1 = gefragt.filter(u => /news\.google\.com\/rss/.test(u)).length;
    const z = JSON.parse(await readFile(join(dir, 'zustand.json'), 'utf8'));
    assert.ok(n1 > 10, `Google News im ersten Lauf: ${n1}`);
    assert.ok(Object.keys(z.schnittstellen.cache).some(u => u.startsWith('https://news.google.com/rss/search?')));
    gefragt.length = 0;
    await main(['--data', dir, '--alle', '--dry-run', '--jetzt', '2026-11-16T16:00:00Z'], {}, { fetchImpl, abruf: { pauseMs: 0 } });
    assert.equal(gefragt.filter(u => /news\.google\.com\/rss/.test(u)).length, 0, 'Google News aus dem Cache');
    assert.ok(gefragt.some(u => /itunes\.apple\.com\/de\/rss/.test(u)), 'Apple wird nicht gemerkt');
  } finally { console.log = log; }
});
