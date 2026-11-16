// Bereich „Nebenverdienst“ (module/auftraege.mjs, Xander 16.11.2026): Unterricht geben (Musik), KI & Apps, Bild & Video.
// Prüft: robots.txt-Regeln, Schema der Einträge, Bewertung, Betrugsfilter, Datenschutz (keine Kontaktdaten), Push-Regel,
// fertige Suchen, keine Arbeitsagentur. Fixtures: test/fixtures/auftraege (NACHGEBAUT, Form wie echte Antworten).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import auftraege, { bewerte, feldVon, betrugPruefen, ohneKontakt, verguetungAusText, inEuro, FELD_NAME } from '../module/auftraege.mjs';
import { leseRobots, regelnFuer, erlaubt, robotsErlaubt, agentAus } from '../lib/robots.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const F = join(HIER, 'fixtures', 'auftraege');
const cfg = JSON.parse(await readFile(join(HIER, '..', '..', 'config.json'), 'utf8'));
const m = cfg.module.auftraege;
const JETZT = new Date('2026-11-16T10:00:00Z');

const KARTE = [
  ['hnrss.org/robots.txt', 'robots-erlaubt.txt'], ['freelancer.com/robots.txt', 'robots-erlaubt.txt'], ['service.bund.de/robots.txt', 'robots-erlaubt.txt'],
  ['jobs/?job_names', 'freelancer-jobs.json'], ['jobs%5B%5D=44&', 'freelancer-ki.json'], ['jobs%5B%5D=688&', 'freelancer-bildvideo.json'], ['jobs%5B%5D=3501&', 'freelancer-unterricht.json'],
  ['hnrss.org/whoishiring', 'hnrss-freelance.xml'], ['RSSGenerator_Ausschreibungen', 'bund-ausschreibungen.xml'],
];
function abruf(karte = KARTE, abrufe = []) {
  return async url => {
    abrufe.push(url);
    const t = karte.find(([k]) => url.includes(k));
    if (!t) throw new Error(`HTTP 404 bei ${new URL(url).host}`);
    if (t[1].startsWith('!')) throw new Error(`HTTP ${t[1].slice(1)} bei ${new URL(url).host}`);
    return readFile(join(F, t[1]), 'utf8');
  };
}
const lauf = async (karte, zustand = {}, c = cfg) => { const abrufe = []; const r = await auftraege({ holeText: abruf(karte, abrufe), cfg: c, jetzt: JETZT, zustand }); return { ...r, abrufe, zustand }; };

test('robots.txt: längste Regel gewinnt, Allow bei Gleichstand, *, $, eigene Gruppe vor *', () => {
  const g = leseRobots('User-agent: *\nDisallow: /api/\nAllow: /api/projects/\nDisallow: /*.pdf$\n\nUser-agent: vorteils-radar\nUser-agent: other\nDisallow: /privat\n');
  const alle = regelnFuer(g, 'irgendwer'), wir = regelnFuer(g, 'vorteils-radar');
  assert.equal(erlaubt(alle, '/api/projects/0.1/projects/active/?jobs[]=1').ok, true);
  assert.equal(erlaubt(alle, '/api/users/1').ok, false);
  assert.equal(erlaubt(alle, '/datei.pdf').ok, false);
  assert.equal(erlaubt(alle, '/datei.pdf?x=1').ok, true, '$ = Ende');
  assert.equal(erlaubt(wir, '/api/users/1').ok, true, 'eigene Gruppe ersetzt *');
  assert.equal(erlaubt(wir, '/privat/x').ok, false);
  assert.equal(erlaubt(regelnFuer(leseRobots('User-agent: *\nDisallow:\n'), 'x'), '/alles').ok, true, 'leeres Disallow = alles erlaubt');
  assert.equal(erlaubt(regelnFuer(leseRobots('User-agent: *\nDisallow: /\n'), 'x'), '/r/German/new/.rss').ok, false);
  assert.equal(agentAus(cfg.abruf.userAgent), 'vorteils-radar');
});

test('robots.txt: fehlt (404) = erlaubt, Serverfehler = dieses Mal nicht lesen, Ergebnis im Zustand gemerkt', async () => {
  const z = {};
  const r404 = await robotsErlaubt('https://a.example/x', { holeRoh: async () => ({ status: 404, text: '' }), zustand: z, jetzt: JETZT });
  assert.equal(r404.ok, true);
  const r503 = await robotsErlaubt('https://b.example/x', { holeRoh: async () => ({ status: 503, text: '' }), zustand: z, jetzt: JETZT });
  assert.equal(r503.ok, false);
  let n = 0;
  const hole = async () => { n++; return { status: 200, text: 'User-agent: *\nDisallow: /\n' }; };
  await robotsErlaubt('https://c.example/a', { holeRoh: hole, zustand: z, jetzt: JETZT });
  const r2 = await robotsErlaubt('https://c.example/b', { holeRoh: hole, zustand: z, jetzt: JETZT });
  assert.equal(n, 1, 'gleicher Host: robots.txt nur einmal holen');
  assert.equal(r2.ok, false);
  assert.match(r2.grund, /Disallow: \//);
});

test('Lauf mit Fixtures: Schema jedes Eintrags, drei Felder, nie Arbeitsagentur', async () => {
  const r = await lauf();
  assert.deepEqual(r.fehler, []);
  assert.deepEqual(r.hinweise, []);
  const treffer = r.eintraege.filter(e => !e.extra.fundort), fund = r.eintraege.filter(e => e.extra.fundort);
  assert.ok(treffer.length >= 8, `Treffer: ${treffer.length}`);
  for (const e of r.eintraege) {
    assert.equal(e.kategorie, 'auftraege');
    assert.match(e.link, /^https:\/\//);
    assert.ok(e.titel && e.zeile && e.soGehts, e.titel);
    assert.equal(e.extra.gesuch, true);
    assert.ok(!/arbeitsagentur|jobb(ö|oe)rse/i.test(`${e.link} ${e.quelle} ${e.extra.quelle}`), 'keine Arbeitsagentur');
  }
  for (const e of treffer) {
    const x = e.extra;
    assert.ok(Object.keys(FELD_NAME).includes(x.feld), x.feld);
    assert.ok(['klein', 'mittel', 'groß'].includes(x.aufwand), x.aufwand);
    assert.equal(typeof x.allein, 'boolean');
    assert.ok(Number.isInteger(x.passt) && x.passt >= m.mindestPasst && x.passt <= 100);
    assert.ok(x.online === true ? x.ort === 'online' && x.km === null : typeof x.km === 'number' && x.km <= m.vorOrtKm, e.titel);
    assert.ok(Number.isInteger(x.alterTage) && x.alterTage <= m.maxAlterTage);
    assert.ok(Number.isFinite(x.sortWert));
    assert.ok(e.datum && e.sichtbarBis);
    assert.equal(e.zeile.split(' · ')[0], FELD_NAME[x.feld]);
  }
  assert.deepEqual(new Set(treffer.map(e => e.extra.feld)), new Set(['unterricht', 'ki', 'bildvideo']));
  // fertige Suchen erscheinen immer, je Feld mindestens eine
  for (const f of ['unterricht', 'ki', 'bildvideo']) assert.ok(fund.some(e => e.extra.feld === f), f);
  assert.equal(fund.length, m.suchLinks.length);
  // Zahlen für den Status
  assert.equal(r.kurz.gelesen, 5);
  assert.equal(r.kurz.treffer, treffer.length);
});

test('Bewertung: Unterricht vor Ort mit Entfernung, online mit Stundensatz, groß/Team raus aus „allein“', async () => {
  const r = await lauf();
  const t = titel => r.eintraege.find(e => e.titel.startsWith(titel));
  const gitarre = t('Gitarrenunterricht in Leipzig');
  assert.equal(gitarre.extra.feld, 'unterricht');
  assert.equal(gitarre.extra.online, false);
  assert.equal(gitarre.extra.ort, 'Leipzig');
  assert.ok(gitarre.extra.km > 40 && gitarre.extra.km < 70);
  assert.equal(gitarre.extra.allein, true);
  assert.equal(gitarre.extra.aufwand, 'klein');
  assert.match(gitarre.extra.verguetung, /20–30 € pro Std\./);
  const synth = t('Synth sound design coaching');
  assert.equal(synth.extra.feld, 'unterricht');
  assert.equal(synth.extra.online, true);
  assert.ok(synth.extra.gruende.includes('Musik/Synthese'));
  assert.equal(t('Online piano lessons').extra.feld, 'unterricht', '„adult beginner“ ist kein Erwachsenen-Inhalt');
  const baecker = t('Kleine Web-App');
  assert.equal(baecker.extra.feld, 'ki');
  assert.ok(baecker.extra.gruende.includes('deutsch') && baecker.extra.gruende.includes('aus der Gegend'));
  assert.equal(t('Edit 5 YouTube').extra.feld, 'bildvideo');
  assert.equal(t('Background music').extra.feld, 'bildvideo', 'Musik für Videos = Bild & Video');
  const bund = t('Erstellung einer barrierefreien Website');
  assert.equal(bund.extra.ort, 'Döbeln');
  assert.equal(bund.extra.allein, false, 'Ausschreibung = formelles Angebot, nicht „allein machbar“');
  // raus: zu weit weg (Hamburg vor Ort), Rahmenvertrag in Bonn, Nachhilfe Mathe (kein Feld), Transkription (nichtWoerter),
  // NFT (schwach), Marktplatz-Plattform (groß + viele Gebote), alt (30 Tage)
  for (const raus of ['Piano teacher in Hamburg', 'Software-Rahmenvertrag', 'Math tutoring', 'Transcription', 'NFT minting', 'Marketplace platform', 'Old project'])
    assert.ok(!r.eintraege.some(e => e.titel.startsWith(raus)), raus);
  // Reihenfolge: passt absteigend
  const p = r.eintraege.filter(e => !e.extra.fundort).map(e => e.extra.passt);
  assert.deepEqual(p, [...p].sort((a, b) => b - a));
});

test('Bewertung einzeln: Aufwand nach Budget und Wörtern, Team, Währung', () => {
  const b = (titel, budget, feld = 'ki') => bewerte({ titel, text: '', feld, budget, datum: '2026-11-15T10:00:00Z' }, m, JETZT);
  assert.equal(b('Landing page', { min: 50, max: 200, code: 'EUR' }).aufwand, 'klein');
  assert.equal(b('Web app', { min: 500, max: 1200, code: 'EUR' }).aufwand, 'mittel');
  assert.equal(b('Web app', { min: 3000, max: 6000, code: 'USD' }).aufwand, 'groß');
  assert.equal(b('Web app', { min: 3000, max: 6000, code: 'USD' }).allein, false);
  assert.equal(b('Need a development team for our app', null).allein, false);
  assert.equal(b('SaaS platform with iOS and Android apps', null).aufwand, 'groß');
  assert.equal(inEuro(100, 'USD'), 86);
  assert.equal(inEuro(100, 'XYZ'), null);
  assert.deepEqual(verguetungAusText('Budget 1,500 EUR'), { eur: 1500, stunde: false, text: '1500 €' });
  assert.equal(verguetungAusText('ca. 40 € pro Stunde').stunde, true);
  assert.equal(verguetungAusText('Termin am 12.11.2026'), null);
  assert.equal(b('x', null).alterTage, 1);
  assert.equal(feldVon('Piano lessons online', m), 'unterricht');
  assert.equal(feldVon('Piano for sale', m), 'bildvideo', 'Musik ohne Unterricht = Musik/Medien');
  assert.equal(feldVon('Math tutoring', m), null);
  assert.equal(feldVon('Edit my YouTube video', m), 'bildvideo');
  assert.equal(feldVon('Build a ChatGPT chatbot', m), 'ki');
});

test('Betrug: Vorkasse/Paketagent/Scheck/Gebühr raus, Kontakt außerhalb der Plattform = Warnung ohne Push', async () => {
  assert.ok(betrugPruefen('Paketagent gesucht, Pakete annehmen und weiterleiten', m).raus);
  assert.ok(betrugPruefen('Zahlung per Scheck, Rest bitte zurücküberweisen', m).raus);
  assert.ok(betrugPruefen('Bitte Vorkasse für das Material', m).raus);
  assert.ok(betrugPruefen('pay a registration fee first', m).raus);
  assert.ok(betrugPruefen('Kontoeröffnung per Video-Ident, 50 € pro Konto', m).raus);
  assert.ok(betrugPruefen('Contact me on WhatsApp for details', m).warnung);
  assert.deepEqual(betrugPruefen('Kleine Web-App für unsere Bäckerei', m), {});
  const r = await lauf();
  for (const raus of ['Package forwarding', 'Landing page with AI image generator', 'Website for a law firm']) assert.ok(!r.eintraege.some(e => e.titel.startsWith(raus)), raus);
  assert.equal(r.kurz.betrug, 3);
  const wa = r.eintraege.find(e => e.titel.startsWith('AI chatbot'));
  assert.match(wa.extra.warnung, /Vorsicht/);
  assert.equal(wa.sofort, false);
});

test('Datenschutz: keine Mail, Telefonnummer, Links oder Namen in Titel/Auszug; Auftraggeber nie gespeichert', async () => {
  assert.equal(ohneKontakt('Mail an a.b@example.de oder 0341 1234567, +49 151 23456789, www.x.de, @hans'), 'Mail an [Mail] oder [Telefon], [Telefon], [Link], [Name]');
  const r = await lauf();
  const roh = JSON.stringify(r.eintraege);
  assert.ok(!/@example\.(de|com)|0341 1234567|beispielnutzer|andererbeispiel|owner_info/.test(roh), 'Kontakt oder Name im Ergebnis');
  const hn = r.eintraege.find(e => e.quelle === 'Hacker News: Seeking freelancer');
  assert.equal(hn.titel, 'Small PWA with an AI assistant for a music school.');
  assert.ok(!r.eintraege.some(e => /seeking work/i.test(`${e.titel} ${e.extra.auszug || ''}`)), 'SEEKING WORK = Angebot, kein Gesuch');
});

test('Push nur für neue, gut passende, allein machbare Treffer: nah oder online mit Vergütung', async () => {
  const r = await lauf();
  const push = r.eintraege.filter(e => e.sofort);
  assert.ok(push.length >= 2);
  for (const e of push) {
    const x = e.extra;
    assert.ok(x.passt >= m.pushMindestPasst && x.allein && !x.warnung && x.alterTage <= 2, e.titel);
    assert.ok(x.online ? x.verguetungEur != null : x.km <= m.pushNahKm, e.titel);
  }
  assert.ok(push.some(e => e.titel.startsWith('Gitarrenunterricht in Leipzig')));
  assert.ok(!r.eintraege.find(e => e.titel.startsWith('Erstellung einer barrierefreien')).sofort, 'Ausschreibung: kein Push');
  assert.ok(!r.eintraege.filter(e => e.extra.fundort).some(e => e.sofort), 'fertige Suchen nie als Push');
});

test('robots.txt verbietet -> Quelle nicht gelesen, Hinweis, fertige Suchen bleiben', async () => {
  const karte = [['freelancer.com/robots.txt', 'robots-verbot.txt'], ...KARTE];
  const r = await lauf(karte);
  assert.ok(!r.abrufe.some(u => /projects\/active/.test(u)), 'Projekte trotz Verbot abgerufen');
  assert.equal(r.hinweise.filter(h => /robots\.txt: Disallow: \//.test(h)).length, 3);
  assert.ok(r.eintraege.some(e => e.quelle === 'Hacker News: Seeking freelancer'));
  assert.equal(r.eintraege.filter(e => e.extra.fundort).length, m.suchLinks.length);
  // alles gesperrt/kaputt -> Fehler (main.mjs behält dann den alten Stand), fertige Suchen trotzdem da
  const tot = await lauf([['robots.txt', '!503']]);
  assert.deepEqual(tot.fehler, ['Nebenverdienst: keine Quelle lesbar']);
  assert.equal(tot.eintraege.length, m.suchLinks.length);
});

test('Fähigkeits-Namen werden einmal aufgelöst und gemerkt; Lookup-Ausfall = nur Zahlen-IDs', async () => {
  const z = {};
  const r1 = await lauf(KARTE, z);
  assert.equal(r1.abrufe.filter(u => u.includes('job_names')).length, 3);
  assert.equal(z.quellen.freelancerJobs.ids['Music Production'], 1201);
  const r2 = await lauf(KARTE, z);
  assert.equal(r2.abrufe.filter(u => u.includes('job_names')).length, 0, 'gemerkt');
  assert.ok(r2.abrufe.some(u => u.includes('jobs%5B%5D=1201')));
  const r3 = await lauf([['job_names', '!500'], ...KARTE], {});
  assert.ok(r3.hinweise.some(h => /Fähigkeiten nicht auflösbar/.test(h)));
  assert.ok(r3.abrufe.some(u => u.includes('jobs%5B%5D=688&')), 'Zahlen-IDs gehen trotzdem');
});

test('config: Nebenverdienst ohne Arbeitsagentur; Kleinanzeigen nur als Link (Gesuche, Döbeln)', () => {
  assert.equal(cfg.module.nebenverdienst.aktiv, false, 'BA-Jobbörse aus');
  assert.ok(!JSON.stringify(m).includes('arbeitsagentur'));
  for (const q of m.quellen) assert.ok(!/kleinanzeigen|reddit|upwork|fiverr/.test(q.url || q.art), q.name);
  const ka = m.suchLinks.filter(s => s.quelle === 'Kleinanzeigen');
  assert.ok(ka.length >= 6);
  for (const s of ka) { const u = new URL(s.link); assert.equal(u.searchParams.get('adType'), 'WANTED'); }
  assert.ok(ka.some(s => new URL(s.link).searchParams.get('locationStr') === '04720 Döbeln' && new URL(s.link).searchParams.get('radius') === '50'));
});

// Echter Lauf 16.11.2026 (43821307089): Video-Aufträge landeten über Fähigkeiten/„lesson“ im Text im Unterricht,
// „Learn VirtualDJ Mixing Online -- 3 … -- 7“ fünfmal, indonesische Aufträge, 7-€-Aufträge ganz oben.
test('Unterricht nur mit Unterrichtswort im Titel, Lerner-Satz oder Unterrichts-Fähigkeit – nicht über „lesson“ irgendwo im Text', () => {
  const reels = 'Creative Instagram Reels Editor I need a skilled editor … each reel ends with a short lesson, clean audio mixing';
  assert.equal(feldVon(reels, m, 'unterricht', 'Graphic Design · Sound Design · Video Editing', 'Creative Instagram Reels Editor'), 'bildvideo');
  assert.equal(feldVon('Warm Female Voiceover for eLearning narration for a course, sound design', m, 'unterricht', 'Voice Over · eLearning · Sound Design', 'Warm Female Voiceover for eLearning'), 'bildvideo');
  assert.equal(feldVon('Learn VirtualDJ Mixing Online guidance inside VirtualDJ, beat-matching', m, 'unterricht', 'Music · Music Lessons', 'Learn VirtualDJ Mixing Online -- 5'), 'unterricht');
  assert.equal(feldVon('Suche jemanden für Klavier, möchte lernen nach Noten zu spielen', m, null, '', 'Klavier für Anfänger'), 'unterricht', 'Lerner-Satz im Text');
  assert.equal(feldVon('Ableton project help', m, null, 'Music Production · Music Lessons', 'Ableton project help'), 'unterricht', 'Unterrichts-Fähigkeit der Plattform');
});

test('Doppelte mit Zähler/Zeitstempel im Titel raus, nur Deutsch/Englisch, kaum Geld nach unten', async () => {
  const { titelKern } = await import('../module/auftraege.mjs');
  assert.equal(titelKern('Learn VirtualDJ Mixing Online -- 5'), 'Learn VirtualDJ Mixing Online');
  assert.equal(titelKern('Service Promo Video Editing - 15/11/2026 20:10 EST'), 'Service Promo Video Editing');
  assert.equal(titelKern('Remote India Marketing Interns -- 6'), 'Remote India Marketing Interns');
  assert.equal(titelKern('Top 10 Synth Presets'), 'Top 10 Synth Presets', 'Zahl mitten im Titel bleibt');
  const pr = (id, title, extra = {}) => ({ id, seo_url: `video-editing/p-${id}`, title, description: 'Edit my YouTube video, sound design with a synth, premiere pro', jobs: [{ name: 'Video Editing' }], time_submitted: Date.parse('2026-11-16T08:00:00Z') / 1000, budget: { minimum: 100, maximum: 250 }, currency: { code: 'USD' }, language: 'en', ...extra });
  const projekte = [pr(1, 'Learn VirtualDJ Mixing Online -- 3'), pr(2, 'Learn VirtualDJ Mixing Online -- 4'), pr(3, 'Learn VirtualDJ Mixing Online -- 5'),
    pr(4, 'Jepretan Alam Gunung Langit Cerah', { language: 'id' }), pr(5, 'Tiny Reels Edit', { budget: { minimum: 600, maximum: 700 }, currency: { code: 'INR' } }), pr(6, 'Normal Reels Edit')];
  const c = structuredClone(cfg); c.module.auftraege.robotsPruefen = false;
  c.module.auftraege.quellen = [{ art: 'freelancer', name: 'Test', feld: 'bildvideo', jobs: [688] }];
  const r = await auftraege({ holeText: async () => JSON.stringify({ status: 'success', result: { projects: projekte } }), cfg: c, jetzt: JETZT, zustand: {} });
  const titel = r.eintraege.filter(e => !e.extra.fundort).map(e => e.titel);
  assert.equal(titel.filter(t => /VirtualDJ/.test(t)).length, 1, 'Zähler-Duplikate zusammengefasst');
  assert.ok(!titel.some(t => /Jepretan/.test(t)), 'nur Deutsch/Englisch');
  const winzig = r.eintraege.find(e => e.titel === 'Tiny Reels Edit'), normal = r.eintraege.find(e => e.titel === 'Normal Reels Edit');
  assert.ok(winzig && normal && winzig.extra.passt <= normal.extra.passt - 20, 'kaum Geld: −20');
  assert.ok(winzig.extra.gruende.includes('kaum Geld'));
  assert.equal(winzig.sofort, false);
  assert.ok(r.kurz.doppelt >= 2 && r.kurz.passtNicht >= 1);
});

test('Fertige Suchen um Döbeln: „Döbeln · hier“ statt „0 km“', async () => {
  const c = structuredClone(cfg); c.module.auftraege.quellen = [];
  const r = await auftraege({ holeText: async () => '', cfg: c, jetzt: JETZT, zustand: {} });
  const kl = r.eintraege.find(e => /Klavierunterricht“ um Döbeln/.test(e.titel));
  assert.match(kl.zeile, /^Döbeln · hier · nur Gesuche/);
  assert.ok(r.eintraege.every(e => !/ · 0 km/.test(e.zeile)));
});
