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
import { lauf } from '../main.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const FX = join(HIER, 'fixtures');
const cfg = JSON.parse(await readFile(join(HIER, '..', '..', 'config.json'), 'utf8'));
// Regel-Verstoß behoben (MV6, 16.11.2026): Reddit und Freelancer.com sind in der config AUS (reddit/freelancer leer, beide
// Hosts in abruf.agbVerbot). Die Leser-Tests unten prüfen nur noch das FORMAT der früheren Quellen mit nachgebauten
// Fixtures (mAlt, ohne Verbotsliste) – der echte Radar ruft beide nie ab (Tests „Regel“ am Ende und in regeln.test.mjs).
const mEcht = cfg.module.unterricht.gesuche;
const m = {
  ...mEcht,
  reddit: [{ sub: 'German+LearnGerman', q: null, thema: 'deutsch' }, { sub: 'forhire+slavelabour+germany+Austria+askswitzerland', q: null, thema: null }],
  freelancer: [{ name: 'German Translator/Tutoring', jobs: [518, 2108], limit: 100 }, { name: 'Sprachunterricht/Korrektur/Übersetzung', jobs: [2109, 48, 22], limit: 100 }, 'german tutor', 'german proofreading'],
};
const cfgAlt = { ...cfg, abruf: { ...cfg.abruf, agbVerbot: [] }, module: { ...cfg.module, unterricht: { ...cfg.module.unterricht, gesuche: m } } };
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
  // Reddit-Inhalt ist doppelt kodiert: keine „&#39;“/„&#32;“-Reste, Fußzeile auch hinter „&#32;“ weg (Prüfer 14.11.2026)
  assert.match(b2.extra.auszug, /I'm looking for a tutor/);
  const pr = f.find(e => /proofread my Anschreiben/.test(e.titel));
  assert.equal(pr.extra.auszug, "I'm applying for an Ausbildung and need someone to proofread my Anschreiben (one page). Will pay, of course.");
  for (const e of f) assert.ok(!/&#?\w+;|submitted by/.test(`${e.titel} ${e.extra.auszug || ''}`), `HTML-Rest: ${e.extra.auszug}`);
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
  const r = await unterricht({ holeText: nurGesucheKaputt, cfg: cfgAlt, jetzt: JETZT, zustand: {} });
  assert.deepEqual(r.fehler, []);
  assert.ok(r.hinweise.some(h => /^Gesuche: Reddit gesperrt \(429\)/.test(h)), r.hinweise.join(' | '));
  assert.ok(r.eintraege.some(e => e.extra.gesuch && e.extra.fundort));
});

test('Gesuche im Bereich Unterricht: keine Jobbörse mehr, gleicher Link nur einmal', async () => {
  const r = await unterricht({ holeText, cfg: cfgAlt, jetzt: JETZT, zustand: {} });
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
  assert.equal(auszugAus('I&#39;ve taken classes &#32; submitted by &#32; /u/abc &#32; to &#32; r/German [link] &#32; [Kommentare]'), "I've taken classes");
  // Freelancer-Vorschau (100 Zeichen, mitten im Wort): Wortrest weg, „…“ dran (Prüfer 14.11.2026: „convers“, „insi“)
  assert.equal(auszugAus('Looking for a native speaker for weekly convers', 180, { gekuerzt: true }), 'Looking for a native speaker for weekly …');
  assert.equal(auszugAus('Short and complete.', 180, { gekuerzt: true }), 'Short and complete.');
  assert.equal(mEcht.reddit.length, 0, 'Reddit AUS (robots.txt „Disallow: /“)');
  assert.equal(mEcht.freelancer.length, 0, 'Freelancer.com AUS (Nutzungsbedingungen)');
});

test('Freelancer: nur mit German/Deutsch im Titel oder passender Fähigkeit (Fehltreffer 14.11.2026)', () => {
  assert.equal(freelancerPasst({ title: 'Setup of Professional Email Templates and Follow-up System for Translation Business', jobs: [{ name: 'Email Marketing' }, { name: 'Copywriting' }] }), false);
  assert.equal(freelancerPasst({ title: 'Setup of Professional Email Templates and Follow-up System for Translation Business' }), false);
  assert.equal(freelancerPasst({ title: 'Conversational German Tutor Needed' }), true);
  assert.equal(freelancerPasst({ title: 'Proofread my thesis', jobs: [{ name: 'Proofreading' }, { name: 'German Translator' }] }), true);
});

test('Echte Titel aus dem Roh-Lauf 14.11.2026 (r/German, Freelancer): echte Gesuche drin, Fragen/Fehltreffer raus', () => {
  const forum = { thema: 'deutsch', streng: true };
  assert.ok(pruefeGesuch('Looking for German tutor recommendations on Preply (A1–A2)', '', m, forum).was);
  // Präsenzkurs in Berlin (Text: „I would prefer in person classes“) – nichts für Xander (Prüfer 14.11.2026)
  assert.equal(pruefeGesuch('I\'m looking for a good B2.1 exam prep course in Berlin', 'I would prefer in person classes, but am open to online classes too for the right price.', m, forum).grund, 'vor Ort (Berlin)');
  assert.equal(pruefeGesuch('Looking for a German tutor', 'Face to face only, I live in Hamburg.', m, forum).grund, 'vor Ort');
  assert.ok(pruefeGesuch('Looking for a German tutor in Leipzig', 'In person would be great.', m, forum).was, 'nah (Leipzig 57 km) bleibt');
  assert.ok(pruefeGesuch('Looking for a German tutor in Berlin – online is fine', '', m, forum).was, 'Ort + online bleibt');
  assert.ok(pruefeGesuch('German tutor for my team in Munich', 'Remote, 2 sessions a week', m, { immerGesuch: true }).was, 'Freelancer (immer online) ohne Orts-Regel');
  // Art: „Goethe-Institut“ ist keine Prüfung; Titel sucht einen Tutor -> Nachhilfe (Prüfer 14.11.2026)
  const preply = 'My partner and I are currently taking an online A1.2 German course with Goethe-Institut, but we’re considering switching to private lessons on Preply. While Goethe has been a decent introduction … We don’t feel we’re getting enough actual speaking practice';
  assert.equal(pruefeGesuch('Looking for German tutor recommendations on Preply (A1–A2)', preply, m, forum).was, 'nachhilfe');
  assert.equal(pruefeGesuch('Looking for a tutor to prepare for the Goethe B2 exam (speaking)', 'I struggle with the speaking part', m, forum).was, 'pruefung');
  assert.equal(pruefeGesuch('Suche Nachhilfe in Deutsch für meine Frau (B1, online)', 'Hilfe für die telc-B1-Prüfung', m, { thema: 'deutsch', streng: true }).was, 'pruefung', 'genannte Prüfung im Text gilt');
  for (const t of ['Need help deciphering lyrics', 'Seeking grammaticality judgements', 'which is better for A1? online or onsite?', 'Passed TELC B1? Please share the study plan that worked for you', 'Brand new learner', 'I need suggestions to improve my german skills.', 'Büchempfehlungen (B1 -> B2) für meinen Urlaub?'])
    assert.ok(!pruefeGesuch(t, 'I am looking for a teacher, any tips?', m, forum).was, `${t} ist kein Gesuch`);
  assert.ok(!pruefeGesuch('Night life in interlaken', 'Looking for bars, German speaking, chat', m, { streng: true }).was);
  // Freelancer: E-Mail-Vorlagen für ein Übersetzungsbüro = kein Deutsch-Gesuch (Live-Daten 19:27 und 22:57). Mit den ECHTEN
  // Fähigkeiten (Translation, German Translator …) lässt freelancerPasst es durch – erst das nichtWort „email template“ hält es auf
  const mail = { title: 'Setup of Professional Email Templates and Follow-up System for Translation Business', jobs: ['Translation', 'Internet Marketing', 'Data Entry', 'German Translator', 'Email Marketing', 'Content Writing', 'Customer Service', 'Business Writing'].map(name => ({ name })) };
  assert.equal(freelancerPasst(mail), true);
  assert.equal(pruefeGesuch(mail.title, 'I\'m starting a translation business specializing in English, French, and German for general document', m, { immerGesuch: true }).grund, 'passt nicht');
  assert.ok(!pruefeGesuch('Setup of Professional Email Templates and Follow-up System for Translation Business', 'I\'m starting a translation business specializing in English, French, and German … email templates and a follow-up system', m, { immerGesuch: true }).was);
  assert.equal(pruefeGesuch('German Fitness App Localization Review', 'I need a native German (Germany) speaker to run a full sanity-check on the existing German text', m, { immerGesuch: true }).was, 'korrektur');
});

test('Gesuche-Gedächtnis: Forenbeiträge bleiben bis 21 Tage (auch wenn Reddit sperrt), neu geprüft mit dem aktuellen Filter', async () => {
  // Prüfer 14.11.2026: /new/.rss reicht bei der Sammelabfrage < 1 Tag zurück, jeder Lauf ersetzte alles
  const zustand = {};
  const r1 = await gesucheAusNetz({ holeText, m, jetzt: JETZT, zustand, kuenstler: cfg.kuenstler });
  const reddit1 = funde(r1.eintraege).filter(e => /^Reddit/.test(e.quelle)).map(e => e.titel);
  assert.ok(reddit1.length >= 3, reddit1.join(' | '));
  assert.ok(Object.keys(zustand.gesuche).length >= reddit1.length);
  assert.ok(Object.values(zustand.gesuche).every(g => g.text.length <= 500 && !/submitted by|&#/.test(g.text)), 'Text ohne Fuß und HTML-Reste');
  // gemerkter Fehltreffer (alter Filter): fliegt beim nächsten Lauf raus; zu alter Beitrag ebenso
  zustand.gesuche['https://www.reddit.com/r/german/comments/alt01/x'] = { titel: 'Looking for a German tutor in Berlin', link: 'https://www.reddit.com/r/German/comments/alt01/x/', datum: '2026-11-13T10:00:00.000Z', quelle: 'Reddit r/German', art: 'reddit', thema: 'deutsch', text: 'In person please.' };
  zustand.gesuche['https://www.reddit.com/r/german/comments/alt02/y'] = { titel: 'Looking for a German tutor', link: 'https://www.reddit.com/r/German/comments/alt02/y/', datum: '2026-10-01T10:00:00.000Z', quelle: 'Reddit r/German', art: 'reddit', thema: 'deutsch', text: 'Online, A2.' };
  zustand.gesuche['https://www.reddit.com/r/german/comments/alt03/z'] = { titel: 'Need someone to correct my Motivationsschreiben', link: 'https://www.reddit.com/r/German/comments/alt03/z/', datum: '2026-11-03T10:00:00.000Z', quelle: 'Reddit r/German', art: 'reddit', thema: 'deutsch', text: 'Will pay 20 €.' };
  // Tag 2: Reddit gesperrt (429), Freelancer da
  const zwei = async (url, o) => (/reddit\.com/.test(url) ? Promise.reject(new Error('HTTP 429 bei www.reddit.com')) : holeText(url, o));
  const r2 = await gesucheAusNetz({ holeText: zwei, m, jetzt: new Date(JETZT.getTime() + 864e5), zustand, kuenstler: cfg.kuenstler });
  const t2 = funde(r2.eintraege).map(e => e.titel);
  for (const t of reddit1) assert.ok(t2.includes(t), `${t} sollte bleiben: ${t2.join(' | ')}`);
  assert.ok(t2.includes('Need someone to correct my Motivationsschreiben'), 'gemerktes Gesuch (11 Tage alt) bleibt');
  assert.ok(!t2.some(t => /in Berlin/.test(t)), 'gemerkter Fehltreffer wird mit dem aktuellen Filter neu geprüft');
  assert.ok(!t2.includes('Looking for a German tutor'), 'älter als 21 Tage -> weg');
  assert.ok(!Object.values(zustand.gesuche).some(g => /alt0[12]/.test(g.link)), 'Zustand räumt Fehltreffer und Altes auf');
  assert.equal(funde(r2.eintraege).find(e => /Motivationsschreiben/.test(e.titel)).extra.was, 'bewerbung');
  assert.ok(r2.hinweise.some(h => /Reddit gesperrt \(429\)/.test(h)));
  // Freelancer wird nicht gemerkt (dort zählt nur „noch offen“)
  assert.ok(!Object.values(zustand.gesuche).some(g => /freelancer/.test(g.link)));
});

test('Radar: fallen Remotive/News aus und gibt es 0 Gesuche, bleiben alte Stellen – alte Gesuche nicht (Prüfer 14.11.2026)', async () => {
  const cfgU = { ...cfgAlt, module: { unterricht: cfgAlt.module.unterricht } };
  const alt = (id, extra, titel) => ({ id, kategorie: 'unterricht', titel, link: `https://example.org/${id}`, datum: '2026-11-13T07:00:00.000Z', sichtbarBis: '2026-11-30T00:00:00.000Z', wert: 70, extra });
  const vorher = { kategorien: { unterricht: [
    alt('u1', { typ: 'gesuch', gesuch: true, sortWert: 85 }, 'Setup of Professional Email Templates and Follow-up System for Translation Business'),
    alt('u2', { typ: 'online', sortWert: 70 }, 'Online German Teacher – Firma'),
  ] } };
  const tot = async url => { throw new Error(`HTTP 503 bei ${new URL(url).host}`); };
  const r = await lauf({ cfg: cfgU, wunschliste: {}, vorher, zustand: { lauf: {} }, holeText: tot, jetzt: JETZT, alle: true });
  const t = r.aktuell.kategorien.unterricht.map(e => e.titel);
  assert.ok(t.includes('Online German Teacher – Firma'), 'alte Stelle bleibt');
  assert.ok(!t.some(x => /Email Templates/.test(x)), 'alter Gesuch-Fehltreffer bleibt nicht stehen');
  assert.ok(r.aktuell.kategorien.unterricht.some(e => e.extra?.fundort), 'Fundorte frisch');
});

// ---------------------------------------------------------------- Regel (MV6, 16.11.2026)
test('Regel: mit der echten config werden Reddit und Freelancer.com nie abgerufen – auch nicht, wenn sie wieder eingetragen werden', async () => {
  const gefragt = [];
  const zaehlend = async (url, o) => { gefragt.push(url); return holeText(url, o); };
  // 1) echte config: Bereich Unterricht ganz
  const r = await unterricht({ holeText: zaehlend, cfg, jetzt: JETZT, zustand: {} });
  assert.deepEqual(r.fehler, []);
  assert.ok(!gefragt.some(u => /reddit\.com|freelancer\.com/i.test(u)), gefragt.filter(u => /reddit|freelancer/.test(u)).join(' | '));
  assert.ok(r.eintraege.some(e => e.extra.fundort && /reddit\.com/.test(e.link)), 'Reddit bleibt als Link zum selbst Suchen');
  assert.ok(r.eintraege.some(e => e.extra.fundort && /freelancer\.com/.test(e.link)), 'Freelancer.com bleibt als Link zum selbst Suchen');
  // 2) jemand trägt die alten Abfragen wieder ein: agbVerbot (abruf) hält sie trotzdem auf, je Quelle EIN Hinweis
  gefragt.length = 0;
  const cfgWieder = { ...cfg, module: { ...cfg.module, unterricht: { ...cfg.module.unterricht, gesuche: { ...mEcht, reddit: m.reddit, freelancer: m.freelancer } } } };
  const r2 = await unterricht({ holeText: zaehlend, cfg: cfgWieder, jetzt: JETZT, zustand: {} });
  assert.ok(!gefragt.some(u => /reddit\.com|freelancer\.com/i.test(u)), 'nie abgerufen, auch nicht die robots.txt');
  assert.equal(r2.hinweise.filter(h => /^Gesuche: Reddit nicht gelesen – robots\.txt von Reddit/.test(h)).length, 1, r2.hinweise.join(' | '));
  assert.equal(r2.hinweise.filter(h => /^Gesuche: Freelancer\.com nicht gelesen – Nutzungsbedingungen/.test(h)).length, 1, r2.hinweise.join(' | '));
  assert.deepEqual(r2.fehler, []);
});

// ---------------------------------------------------------------- Prüfer R6 (16.11.2026), Befund 1
test('Regel: gemerkte Reddit-Gesuche (vor der Regel-Wache gesammelt) werden verworfen und aus dem Zustand gelöscht', async () => {
  // Nachbau des echten Zustands vom Zweig vorteile-daten (a59ea321): zwei Reddit-Beiträge in zustand.gesuche, die ohne
  // diesen Fix bei jedem Lauf neu gespeichert und bis 30.11./06.12. als „Gesuch“ gezeigt worden wären
  const gefragt = [];
  const zaehlend = async (url, o) => { gefragt.push(url); return holeText(url, o); };
  const jetzt = new Date('2026-11-16T12:00:00Z');
  const zustand = { gesuche: {
    'https://www.reddit.com/r/germany/comments/r6a/x': { titel: 'Need someone to correct my Motivationsschreiben', link: 'https://www.reddit.com/r/germany/comments/r6a/x/', datum: '2026-11-15T10:00:00.000Z', quelle: 'Reddit r/germany', art: 'reddit', thema: 'deutsch', text: 'Will pay 20 €.' },
    'https://www.reddit.com/r/german/comments/r6b/y': { titel: 'Looking for a German tutor online', link: 'https://www.reddit.com/r/German/comments/r6b/y/', datum: '2026-11-09T10:00:00.000Z', quelle: 'Reddit r/German', art: 'reddit', thema: 'deutsch', text: 'Online, A2, paid.' },
    'https://feddit.org/post/1': { titel: 'Suche Nachhilfe Deutsch online', link: 'https://feddit.org/post/1', datum: '2026-11-14T10:00:00.000Z', quelle: 'Lemmy deutsch@feddit.org', art: 'lemmy', thema: 'deutsch', text: 'Für die B2-Prüfung, bezahlt.' },
  } };
  const r = await unterricht({ holeText: zaehlend, cfg, jetzt, zustand });
  assert.deepEqual(r.fehler, []);
  assert.ok(!gefragt.some(u => /reddit\.com/i.test(u)), 'Reddit nicht abgerufen');
  const gesuche = r.eintraege.filter(e => e.extra.gesuch && !e.extra.fundort);
  assert.ok(!gesuche.some(e => /reddit\.com/.test(e.link)), gesuche.map(e => e.link).join(' | '));
  assert.ok(gesuche.some(e => e.link === 'https://feddit.org/post/1'), 'erlaubte Foren-Beiträge bleiben gemerkt');
  assert.deepEqual(Object.keys(zustand.gesuche), ['https://feddit.org/post/1'], 'Reddit-Beiträge aus dem Zustand gelöscht');
  assert.ok(r.hinweise.some(h => /2 gemerkte Beiträge verworfen/.test(h)), r.hinweise.join(' | '));
  // nächster Lauf: nichts mehr zu verwerfen, kein Hinweis mehr
  const r2 = await unterricht({ holeText: zaehlend, cfg, jetzt: new Date(jetzt.getTime() + 3600e3), zustand });
  assert.ok(!r2.hinweise.some(h => /verworfen/.test(h)));
  // robots.txt sperrt einen Foren-Host in diesem Lauf (Regel-Wache) -> dessen gemerkte Beiträge ebenso
  const wache = async () => '';
  wache.wache = { gesperrt: new Map([['robots|feddit.org', { regel: 'robots', host: 'feddit.org', grund: 'robots.txt: Disallow: /' }]]) };
  const r3 = await gesucheAusNetz({ holeText: wache, m: mEcht, jetzt, zustand, kuenstler: cfg.kuenstler, agbVerbot: cfg.abruf.agbVerbot });
  assert.ok(!r3.eintraege.some(e => e.link === 'https://feddit.org/post/1'));
  assert.deepEqual(Object.keys(zustand.gesuche), []);
});

test('Regel: Reddit-Gesuche aus dem letzten Stand (aktuell.json) verschwinden sofort – auch wenn Unterricht nicht dran ist', async () => {
  const cfgU = { ...cfg, module: { unterricht: cfg.module.unterricht } };
  const vorher = { kategorien: { unterricht: [
    { id: 'g1', kategorie: 'unterricht', titel: 'Need help with German', link: 'https://www.reddit.com/r/germany/comments/r6a/x/', datum: '2026-11-15T10:00:00.000Z', sichtbarBis: '2026-12-06T10:00:00.000Z', wert: 70, extra: { typ: 'gesuch', gesuch: true, sortWert: 80 } },
    { id: 'f1', kategorie: 'unterricht', titel: 'Reddit r/German: selbst suchen', link: 'https://www.reddit.com/r/German/search/?q=tutor', wert: 40, extra: { typ: 'gesuch', gesuch: true, fundort: true, sortWert: 40 } },
    { id: 's1', kategorie: 'unterricht', titel: 'Online German Teacher – Firma', link: 'https://example.org/s1', datum: '2026-11-15T10:00:00.000Z', wert: 70, extra: { typ: 'online', sortWert: 70 } },
  ] }, status: { unterricht: { ok: true } } };
  const nie = async url => { throw new Error(`kein Abruf erwartet: ${url}`); };
  const r = await lauf({ cfg: cfgU, wunschliste: {}, vorher, zustand: { lauf: { unterricht: '2026-11-16T11:30:00.000Z' } }, holeText: nie, jetzt: new Date('2026-11-16T12:00:00Z') });
  const links = r.aktuell.kategorien.unterricht.map(e => e.link);
  assert.ok(!links.includes('https://www.reddit.com/r/germany/comments/r6a/x/'), links.join(' | '));
  assert.ok(links.includes('https://www.reddit.com/r/German/search/?q=tutor'), 'Fundort-Link (selbst suchen) bleibt');
  assert.ok(links.includes('https://example.org/s1'));
});
