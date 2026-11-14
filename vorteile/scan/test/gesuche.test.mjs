// Gesuche aus dem Netz (Xander 14.11.2026): Leute, die Hilfe mit Deutsch suchen – Reddit (Atom), Freelancer (JSON),
// Fundorte (Upwork, Fiverr, Kleinanzeigen …). Fixtures in fixtures/gesuche/ sind NACHGEBAUT (Format der Quellen), weil
// die Bau-Sitzung kein Netz zu den Quellen hatte – beim nächsten Roh-Lauf durch echte Antworten ersetzen.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { macheFixtureAbruf } from '../lib/http.mjs';
import { FIXTURE_KARTE } from './fixtures/karte.mjs';
import { gesucheAusNetz, pruefeGesuch, hilfeArt, redditSuche, freelancerSuche, freelancerLink, freelancerPasst, auszugAus, lemmySuche } from '../module/gesuche.mjs';
import unterricht from '../module/unterricht.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const FX = join(HIER, 'fixtures');
const cfg = JSON.parse(await readFile(join(HIER, '..', '..', 'config.json'), 'utf8'));
const m = cfg.module.unterricht.gesuche;
const JETZT = new Date('2026-11-14T12:00:00Z');
const holeText = macheFixtureAbruf(FX, FIXTURE_KARTE);
const funde = l => l.filter(e => !e.extra?.fundort);

test('Gesuche: Reddit + Freelancer + Lemmy – Gesuch ja, Angebot nein, zu alt nein, Duplikat einmal, neueste zuerst', async () => {
  const mL = { ...m, lemmy: [{ instanz: 'feddit.org', q: 'Nachhilfe Deutsch' }] }; // Lemmy ist in der config aus (nur Nachrichten), Code bleibt
  const { eintraege, hinweise } = await gesucheAusNetz({ holeText, m: mL, jetzt: JETZT, zustand: {}, kuenstler: cfg.kuenstler });
  assert.deepEqual(hinweise, []);
  const f = funde(eintraege);
  const t = f.map(e => e.titel);
  for (const ja of [/Goethe B2/, /proofread my Anschreiben/, /Ausländerbehörde/, /German tutor for my daughter/, /conversation practice/, /Translate website/, /Nachhilfe in Deutsch für meine Frau/, /Anschreiben auf Deutsch korrigiert/]) assert.ok(t.some(x => ja.test(x)), `${ja} fehlt: ${t.join(' | ')}`);
  for (const nein of [/\[Offer\]/, /looking for students/, /For Hire/, /customer support/, /sales representative/, /doch and aber/, /\(A2\)/, /master thesis/, /Biete Deutsch-Nachhilfe/, /Klasse 5/, /für Sohn/]) assert.ok(!t.some(x => nein.test(x)), `${nein} sollte fehlen`);
  assert.equal(t.filter(x => /Goethe B2/.test(x)).length, 1, 'Crosspost mit gleichem Link nur einmal');
  const d = f.map(e => Date.parse(e.datum));
  assert.deepEqual(d, [...d].sort((a, b) => b - a), 'neueste zuerst');
  for (const e of f) {
    assert.equal(e.kategorie, 'unterricht');
    assert.equal(e.extra.typ, 'gesuch');
    assert.equal(e.extra.gesuch, true);
    assert.equal(e.extra.online, true);
    assert.match(e.link, /^https:\/\/(www\.(reddit|freelancer)\.com|feddit\.org)\//);
    assert.ok(e.datum && e.quelle && e.soGehts.length > 20);
    assert.ok(JETZT - Date.parse(e.datum) <= 21 * 864e5, 'höchstens 21 Tage alt');
    assert.equal(e.sofort, false, 'keine Push-Flut');
    assert.equal(e.extra.bewerbenAls.name, 'Deutsch mit Xander');
    assert.ok(Date.parse(e.sichtbarBis) - Date.parse(e.datum) === 21 * 864e5, 'Anzeigefenster 21 Tage');
  }
  const b2 = f.find(e => /Goethe B2/.test(e.titel));
  assert.equal(b2.quelle, 'Reddit r/German');
  assert.equal(b2.extra.was, 'pruefung');
  assert.match(b2.zeile, /^Gesuch · Prüfungsvorbereitung · vom 12\.11\.2026$/);
  assert.match(b2.extra.auszug, /^Hi! My Goethe B2 exam/);
  assert.ok(!/submitted by|\[link\]/.test(b2.extra.auszug), 'Reddit-Fußzeile weg');
  assert.ok(b2.extra.auszug.length <= 180);
  assert.equal(f.find(e => /Anschreiben/.test(e.titel)).extra.was, 'bewerbung');
  assert.equal(f.find(e => /Ausländerbehörde/.test(e.titel)).extra.was, 'behoerde');
  assert.equal(f.find(e => /daughter/.test(e.titel)).quelle, 'Reddit r/forhire', 'Quelle = Subreddit des Beitrags, nicht die Sammel-Abfrage');
  const lf = f.find(e => /meine Frau/.test(e.titel));
  assert.equal(lf.quelle, 'Lemmy fragen@feddit.org');
  assert.equal(lf.link, 'https://feddit.org/post/beispiel901');
  assert.equal(lf.extra.was, 'pruefung');
  assert.equal(f.find(e => /Anschreiben auf Deutsch/.test(e.titel)).datum, '2026-11-13T18:00:00.000Z', 'Lemmy 0.18 ohne Zone = UTC');
  const fl = f.find(e => /Translate website/.test(e.titel));
  assert.equal(fl.quelle, 'Freelancer');
  assert.equal(fl.link, 'https://www.freelancer.com/projects/translation/beispiel-translate-website-english-german');
  assert.equal(fl.extra.was, 'uebersetzung');
  assert.match(fl.zeile, /Übersetzung · vom 12\.11\.2026 · 30–250 EUR · 23 Gebote$/);
  assert.match(f.find(e => /conversation practice/.test(e.titel)).zeile, /Konversation · vom 13\.11\.2026 · 10–20 USD pro Std\. · 7 Gebote$/);
  // neuere Gesuche höher (Sortierung im Radar über sortWert)
  const sw = f.map(e => e.extra.sortWert);
  assert.deepEqual(sw, [...sw].sort((a, b) => b - a));
});

test('Gesuche: Fundorte (Upwork, Fiverr, Kleinanzeigen …) erscheinen immer – auch wenn alle Quellen ausfallen', async () => {
  const kaputt = async url => { throw new Error(`HTTP 403 bei ${new URL(url).host}`); };
  const { eintraege, hinweise } = await gesucheAusNetz({ holeText: kaputt, m, jetzt: JETZT, zustand: {}, kuenstler: cfg.kuenstler });
  assert.equal(funde(eintraege).length, 0);
  const fund = eintraege.filter(e => e.extra.fundort);
  assert.equal(fund.length, m.fundorte.length);
  assert.ok(fund.length >= 5);
  for (const q of ['Upwork', 'Fiverr', 'Kleinanzeigen', 'Freelancer', 'Reddit']) assert.ok(fund.some(e => e.quelle === q), q);
  assert.ok(fund.every(e => e.extra.typ === 'gesuch' && e.extra.gesuch === true && e.link.startsWith('https://')));
  assert.ok(fund.find(e => e.quelle === 'Kleinanzeigen').zeile.includes('Link prüfen'), 'nicht live belegte Adresse markiert');
  // Reddit ganz gesperrt = EIN kurzer Hinweis (vorher eine Zeile je Subreddit)
  assert.equal(hinweise.length, 1 + m.freelancer.length + m.lemmy.length, hinweise.join(' | '));
  assert.ok(hinweise.some(h => /Freelancer „German Translator\/Tutoring“/.test(h)), 'Name der Fähigkeits-Abfrage im Hinweis');
  assert.equal(hinweise.filter(h => /Reddit/.test(h)).length, 1);
  assert.match(hinweise[0], /^Gesuche: Reddit gesperrt \(403\) – Suche unter „Hier selbst schauen“$/);
  assert.ok(hinweise.every(h => /^Gesuche: /.test(h) && /403/.test(h)));
});

test('Gesuche: Ausfall ist nur ein Hinweis – der Bereich Unterricht bleibt ohne Störung', async () => {
  const nurGesucheKaputt = async (url, o) => (/reddit|freelancer|api\/v3/.test(url) ? Promise.reject(new Error('HTTP 429 bei www.reddit.com')) : holeText(url, o));
  const r = await unterricht({ holeText: nurGesucheKaputt, cfg, jetzt: JETZT, zustand: {} });
  assert.deepEqual(r.fehler, []);
  assert.ok(r.hinweise.some(h => /^Gesuche: Reddit gesperrt \(429\)/.test(h)), r.hinweise.join(' | '));
  assert.ok(r.eintraege.some(e => e.extra.gesuch && e.extra.fundort));
});

test('Gesuche im Bereich Unterricht: keine Jobbörse mehr, gleicher Link nur einmal', async () => {
  const r = await unterricht({ holeText, cfg, jetzt: JETZT, zustand: {} });
  assert.deepEqual(r.fehler, []);
  const g = r.eintraege.filter(e => e.extra.gesuch && !e.extra.fundort);
  assert.equal(g.length, 6, g.map(e => e.titel).join(' | ')); // Reddit + Freelancer (Lemmy in der config aus)
  assert.ok(!r.eintraege.some(e => /arbeitsagentur|jobbörse/i.test(`${e.quelle} ${e.link}`)), 'Xander 14.11.2026: keine Arbeitsamt-Stellen in diesem Bereich');
  const links = r.eintraege.filter(e => !e.extra.fundort).map(e => e.link);
  assert.equal(new Set(links).size, links.length);
  assert.ok(r.eintraege.filter(e => e.extra.fundort && !e.extra.gesuch).length >= 4, 'Plattformen (italki, Preply, Lingoda, BAMF) bleiben');
});

test('Gesuche-Filter: Wörter, Angebote, Thema, Art der Hilfe', () => {
  const ja = (t, x = '', q) => assert.ok(pruefeGesuch(t, x, m, q).was, `${t} sollte Gesuch sein: ${pruefeGesuch(t, x, m, q).grund}`);
  const nein = (t, x = '', q, grund) => { const p = pruefeGesuch(t, x, m, q); assert.ok(!p.was, `${t} sollte kein Gesuch sein`); if (grund) assert.equal(p.grund, grund, t); };
  ja('Suche Nachhilfe in Deutsch für meinen Sohn (Klasse 7)');
  ja('Brauche Hilfe beim Korrekturlesen meiner Bewerbung auf Deutsch');
  ja('Looking for a German teacher for my wife, A1');
  ja('[Task] Proofread 2 pages German text, $15');
  ja('Need a tutor for telc B1', '', { thema: 'deutsch' });
  ja('Translate my CV into German', '', { immerGesuch: true });
  ja('Looking for a tutor, offering 20€/h', 'Paid lessons, online.', { thema: 'deutsch' }); // „offering“ im Text eines Suchenden ist kein Angebot
  nein('[Offer] German lessons with a native speaker', '', { thema: 'deutsch' }, 'Angebot');
  nein('Biete Deutsch-Nachhilfe in Döbeln', '', {}, 'Angebot');
  nein('Offering German tutoring, all levels', '', {}, 'Angebot');
  nein('German lessons', 'I offer lessons, my rates are low', { thema: 'deutsch' }, 'Angebot');
  nein('Looking for a tutor', 'for my math homework', {}, 'nicht Deutsch');
  nein('Need a German speaking customer support agent', '', {}, 'passt nicht');
  nein('Is this sentence correct?', 'Can anyone help', { thema: 'deutsch' }, 'keine Deutsch-Hilfe');
  nein('German grammar tips', '', { thema: 'deutsch' }, 'kein Gesuch');
  assert.equal(hilfeArt('Goethe B2 Vorbereitung'), 'pruefung');
  assert.equal(hilfeArt('proofread my cover letter'), 'bewerbung');
  assert.equal(hilfeArt('Brief an das Jobcenter'), 'behoerde');
  assert.equal(hilfeArt('Übersetzung Urkunde'), 'uebersetzung');
  assert.equal(hilfeArt('please proofread my essay'), 'korrektur');
  assert.equal(hilfeArt('conversation practice once a week'), 'konversation');
  assert.equal(hilfeArt('German tutor wanted'), 'nachhilfe');
  assert.equal(hilfeArt('insgesamt zusammen'), 'nachhilfe', '„amt“ nur als ganzes Wort');
});

test('Gesuche: Adressen der Quellen', () => {
  assert.equal(redditSuche({ sub: 'German', q: 'tutor OR teacher' }), 'https://www.reddit.com/r/German/search.rss?q=tutor%20OR%20teacher&restrict_sr=1&sort=new&t=month');
  assert.equal(redditSuche({ sub: 'German+LearnGerman', q: 'tutor' }), 'https://www.reddit.com/r/German+LearnGerman/search.rss?q=tutor&restrict_sr=1&sort=new&t=month', '„+“ bleibt (eine Abfrage für mehrere Subreddits)');
  // Roh-Lauf 14.11.2026: Reddit-Suche aus GitHub 403 „Verboten“, die Liste /new/.rss 200 -> Standard ist die Liste
  assert.equal(redditSuche({ sub: 'German+LearnGerman' }), 'https://www.reddit.com/r/German+LearnGerman/new/.rss?limit=100');
  assert.ok(m.reddit.length <= 2 && m.reddit.every(r => !r.q), 'höchstens 2 Reddit-Abfragen je Lauf, Liste statt Suche');
  assert.equal(freelancerSuche('german tutor'), 'https://www.freelancer.com/api/projects/0.1/projects/active/?query=german%20tutor&limit=50&job_details=true');
  assert.equal(freelancerSuche({ jobs: [518, 2108], limit: 100 }), 'https://www.freelancer.com/api/projects/0.1/projects/active/?jobs%5B%5D=518&jobs%5B%5D=2108&limit=100&job_details=true');
  assert.ok(m.freelancer.some(q => q?.jobs?.includes(518)), 'Fähigkeit German Translator (518) wird abgefragt');
  assert.equal(lemmySuche({ instanz: 'feddit.org', q: 'Nachhilfe Deutsch' }), 'https://feddit.org/api/v3/search?q=Nachhilfe%20Deutsch&type_=Posts&sort=New&listing_type=All&limit=50');
  assert.equal(freelancerLink('/translation/x-1'), 'https://www.freelancer.com/projects/translation/x-1');
  assert.equal(auszugAus('Text hier submitted by /u/abc [link] [comments]'), 'Text hier');
  assert.ok(auszugAus('wort '.repeat(80)).endsWith(' …'));
  assert.equal(cfg.abruf.pauseMsJeHost['www.reddit.com'], 6000, 'Reddit höflich: höchstens ~10 Abrufe pro Minute');
});

test('Freelancer: nur mit German/Deutsch im Titel oder passender Fähigkeit (Fehltreffer 14.11.2026)', () => {
  assert.equal(freelancerPasst({ title: 'Setup of Professional Email Templates and Follow-up System for Translation Business', jobs: [{ name: 'Email Marketing' }, { name: 'Copywriting' }] }), false);
  assert.equal(freelancerPasst({ title: 'Setup of Professional Email Templates and Follow-up System for Translation Business' }), false);
  assert.equal(freelancerPasst({ title: 'Conversational German Tutor Needed' }), true);
  assert.equal(freelancerPasst({ title: 'Proofread my thesis', jobs: [{ name: 'Proofreading' }, { name: 'German Translator' }] }), true);
});
