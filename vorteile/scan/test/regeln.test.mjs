// Regel-Wache (MV6, 16.11.2026): Xander-Regel „nur Quellen, deren AGB/robots.txt das erlauben; keine Sperren umgehen“.
// Anlass: der Bereich Unterricht las Reddit (robots.txt „User-agent: * / Disallow: /“, HTTP 429) und Freelancer.com (AGB)
// ohne Prüfung. Jetzt geht JEDER Abruf eines Moduls erst durch abruf.agbVerbot (kein Abruf) und die robots.txt des Hosts.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { macheFixtureAbruf } from '../lib/http.mjs';
import { macheRegelWache, istRegelSperre, agbGrund, robotsErlaubt, ROBOTS_TAGE, ROBOTS_MAX_REGELN } from '../lib/robots.mjs';
import { pruefeFundorte } from '../module/assistent.mjs';
import { FIXTURE_KARTE } from './fixtures/karte.mjs';
import { lauf } from '../main.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const FX = join(HIER, 'fixtures');
const cfg = JSON.parse(await readFile(join(HIER, '..', '..', 'config.json'), 'utf8'));
const wunschliste = JSON.parse(await readFile(join(HIER, '..', '..', 'wunschliste.json'), 'utf8'));
const JETZT = new Date('2026-11-16T12:00:00Z');
const host = u => new URL(u).host;

/** Abruf-Attrappe: robots.txt je Host aus `robots` (Text oder Status), sonst die Fixtures; zählt jeden Abruf */
function attrappe(robots = {}) {
  const fx = macheFixtureAbruf(FX, FIXTURE_KARTE);
  const gefragt = [];
  const hole = async (url, o) => {
    gefragt.push(url);
    const u = new URL(url);
    if (u.pathname === '/robots.txt' && u.host in robots) {
      const r = robots[u.host];
      if (typeof r === 'number') throw new Error(`HTTP ${r} bei ${u.host}`);
      return r;
    }
    return fx(url, o);
  };
  return { hole, gefragt };
}

test('Regel-Wache: Host mit AGB-Verbot wird nie abgerufen – nicht einmal die robots.txt', async () => {
  const { hole, gefragt } = attrappe();
  const w = macheRegelWache(hole, { agbVerbot: cfg.abruf.agbVerbot, jetzt: JETZT });
  for (const url of ['https://www.reddit.com/r/German/new/.rss', 'https://old.reddit.com/r/x', 'https://www.freelancer.com/api/projects/0.1/projects/active/']) {
    await assert.rejects(w(url), e => istRegelSperre(e) && e.regel === 'agb', url);
  }
  assert.deepEqual(gefragt, []);
  assert.deepEqual([...w.wache.gesperrt.values()].map(g => [g.regel, g.host, g.n]), [['agb', 'www.reddit.com', 1], ['agb', 'old.reddit.com', 1], ['agb', 'www.freelancer.com', 1]]);
  assert.match(agbGrund('https://www.reddit.com/x', cfg.abruf.agbVerbot), /Disallow: \//);
  assert.equal(agbGrund('https://notreddit.com/x', cfg.abruf.agbVerbot), null, 'nur der Host selbst und seine Unter-Hosts');
});

test('Regel-Wache: robots.txt vor dem ersten Abruf je Host, einmal (auch parallel); Disallow -> übersprungen', async () => {
  const { hole, gefragt } = attrappe({ 'remotive.com': 'User-agent: *\nDisallow: /api/\n', 'news.google.com': 'User-agent: *\nAllow: /rss/\nDisallow: /\n' });
  const zustand = {};
  const w = macheRegelWache(hole, { zustand, jetzt: JETZT });
  await assert.rejects(w('https://remotive.com/api/remote-jobs?search=german%20teacher'), e => e.regel === 'robots' && /Disallow: \/api\//.test(e.message));
  const r = await Promise.all(['q=a', 'q=b', 'q=c'].map(q => w(`https://news.google.com/rss/search?${q}`)));
  assert.equal(r.length, 3);
  await assert.rejects(w('https://news.google.com/topics/x'), e => e.regel === 'robots');
  assert.equal(gefragt.filter(u => u === 'https://news.google.com/robots.txt').length, 1, 'robots.txt einmal je Host');
  assert.equal(gefragt.filter(u => u === 'https://remotive.com/robots.txt').length, 1);
  assert.ok(!gefragt.some(u => /remotive\.com\/api/.test(u)), 'verbotener Pfad nie abgerufen');
  assert.ok(gefragt.indexOf('https://news.google.com/robots.txt') < gefragt.findIndex(u => /news\.google\.com\/rss/.test(u)), 'robots.txt VOR dem ersten Abruf');
  // gemerkt im Zustand: ein Lauf innerhalb von 24 Stunden fragt die robots.txt nicht noch einmal
  assert.deepEqual(Object.keys(zustand.robots).sort(), ['news.google.com', 'remotive.com']);
  const w2 = macheRegelWache(hole, { zustand, jetzt: new Date(JETZT.getTime() + 12 * 3600e3) });
  gefragt.length = 0;
  await w2('https://news.google.com/rss/search?q=d');
  assert.deepEqual(gefragt, ['https://news.google.com/rss/search?q=d']);
  // Prüfer R6, Befund 4 (RFC 9309 2.4): nach 24 Stunden wird sie neu geholt (vorher 7 Tage)
  assert.equal(ROBOTS_TAGE, 1);
  const w3 = macheRegelWache(hole, { zustand, jetzt: new Date(JETZT.getTime() + 24 * 3600e3 + 60e3) });
  gefragt.length = 0;
  await w3('https://news.google.com/rss/search?q=e');
  assert.deepEqual(gefragt, ['https://news.google.com/robots.txt', 'https://news.google.com/rss/search?q=e']);
});

test('robots.txt: alle Regeln zählen (keine Kürzung auf 200), zu viele = nicht prüfbar, alte gekürzte Einträge neu holen', async () => {
  // Prüfer R6, Befund 3: kleinanzeigen.de hat 257 Regeln für uns – die letzten 57 Disallow fielen bei 200 weg
  const viele = n => 'User-agent: *\n' + Array.from({ length: n }, (_, i) => `Disallow: /pfad-${i}/`).join('\n') + '\n';
  const holeRoh = text => async () => ({ status: 200, text });
  const z = {};
  assert.equal((await robotsErlaubt('https://www.kleinanzeigen.de/pfad-250/x', { holeRoh: holeRoh(viele(257)), zustand: z, jetzt: JETZT })).ok, false, 'Regel Nr. 251 gilt');
  assert.equal(z.robots['www.kleinanzeigen.de'].regeln.length, 257);
  assert.equal((await robotsErlaubt('https://www.kleinanzeigen.de/s-anzeigen/x', { holeRoh: holeRoh(viele(257)), zustand: z, jetzt: JETZT })).ok, true);
  // mehr als ROBOTS_MAX_REGELN: nicht kürzen, sondern „nicht prüfbar“ -> die Wache liest die Quelle nicht
  const r = await robotsErlaubt('https://riesig.example/frei', { holeRoh: holeRoh(viele(ROBOTS_MAX_REGELN + 1)), zustand: z, jetzt: JETZT });
  assert.equal(r.ok, false);
  assert.equal(r.nichtLesbar, true);
  assert.match(r.grund, /nicht prüfbar/);
  assert.deepEqual(z.robots['riesig.example'].regeln, [], 'keine Riesen-Liste im Zustand');
  // ein Eintrag der alten Fassung (höchstens 200 Regeln, ohne v) wird sofort neu geholt, nicht erst nach Ablauf
  let geholt = 0;
  const z2 = { robots: { 'www.kleinanzeigen.de': { zeit: JETZT.toISOString(), status: 200, regeln: [{ erlaubt: false, pfad: '/pfad-0/' }] } } };
  const r2 = await robotsErlaubt('https://www.kleinanzeigen.de/pfad-256/', { holeRoh: async () => { geholt++; return { status: 200, text: viele(257) }; }, zustand: z2, jetzt: JETZT });
  assert.equal(geholt, 1);
  assert.equal(r2.ok, false);
});

test('Regel-Wache: robots.txt nicht lesbar (503/429/Zeitüberschreitung) = dieses Mal nicht gelesen, normale Störung, nur ein Versuch je Lauf', async () => {
  const { hole, gefragt } = attrappe({ 'www.mydealz.de': 503, 'urlaubspiraten.de': 429 });
  const w = macheRegelWache(hole, { jetzt: JETZT });
  for (let i = 0; i < 3; i++) await assert.rejects(w(`https://www.mydealz.de/rss/gruppe/x${i}`), e => !istRegelSperre(e) && /robots\.txt nicht lesbar \(HTTP 503\).*dieses Mal nicht gelesen/.test(e.message));
  await assert.rejects(w('https://urlaubspiraten.de/feed'), e => /HTTP 429/.test(e.message));
  assert.equal(gefragt.filter(u => /mydealz\.de\/robots\.txt/.test(u)).length, 1, 'nicht je Adresse neu fragen');
  assert.ok(!gefragt.some(u => /rss\/gruppe/.test(u)), 'ohne lesbare robots.txt kein Abruf');
  // keine robots.txt (404) = alles erlaubt
  const w2 = macheRegelWache(macheFixtureAbruf(FX, FIXTURE_KARTE), { jetzt: JETZT });
  assert.ok((await w2('https://www.mydealz.de/rss/gruppe/lebensmittel')).includes('<rss'));
});

test('Regel-Wache: Ausnahmen nur für eigene Dienste (ntfy-Thema), robotsPruefen false schaltet nur die robots.txt ab', async () => {
  const { hole, gefragt } = attrappe({ 'ntfy.sh': 'User-agent: *\nDisallow: /\n' });
  const w = macheRegelWache(async u => { gefragt.push(u); return 'ok'; }, { ausnahmen: cfg.abruf.robotsAusnahmen, jetzt: JETZT });
  assert.equal(await w('https://ntfy.sh/thema/json?poll=1'), 'ok');
  assert.deepEqual(gefragt, ['https://ntfy.sh/thema/json?poll=1']);
  assert.deepEqual(cfg.abruf.robotsAusnahmen, ['ntfy.sh'], 'keine fremden Quellen in den Ausnahmen');
  const aus = macheRegelWache(hole, { robots: false, agbVerbot: cfg.abruf.agbVerbot, jetzt: JETZT });
  await assert.rejects(aus('https://www.reddit.com/r/x'), e => e.regel === 'agb', 'AGB-Verbot gilt immer');
});

test('Ganzer Lauf (alle Module, Fixtures): Reddit und Freelancer.com nie abgerufen, jeder Host erst nach seiner robots.txt', async () => {
  const { hole, gefragt } = attrappe();
  const r = await lauf({ cfg, wunschliste, vorher: null, zustand: {}, holeText: hole, jetzt: JETZT, alle: true });
  assert.ok(gefragt.length > 50, `nur ${gefragt.length} Abrufe`);
  assert.deepEqual(gefragt.filter(u => /(^|\.)reddit\.com|freelancer\.com/i.test(host(u))), []);
  const erste = new Map();
  gefragt.forEach((u, i) => { const h = host(u); if (!erste.has(h)) erste.set(h, { i, u }); });
  for (const [h, { u }] of erste) {
    if (cfg.abruf.robotsAusnahmen.includes(h)) continue;
    assert.equal(new URL(u).pathname, '/robots.txt', `${h}: erster Abruf war ${u}`);
  }
  // nichts davon ist eine Störung
  for (const [k, s] of Object.entries(r.aktuell.status)) assert.ok(!(s.fehler || []).some(f => /nicht gelesen –/.test(f)), `${k}: ${s.fehler}`);
});

test('Ganzer Lauf: robots.txt verbietet eine Quelle -> übersprungen + Hinweis, Bereich bleibt ohne Störung', async () => {
  const { hole, gefragt } = attrappe({ 'remotive.com': 'User-agent: *\nDisallow: /api/\n' });
  const nur = { ...cfg, module: Object.fromEntries(Object.entries(cfg.module).map(([k, v]) => [k, { ...v, aktiv: k === 'unterricht' }])) };
  const r = await lauf({ cfg: nur, wunschliste, vorher: null, zustand: {}, holeText: hole, jetzt: JETZT, alle: true });
  const st = r.aktuell.status.unterricht;
  assert.equal(st.ok, true, JSON.stringify(st));
  assert.deepEqual(st.fehler, []);
  assert.ok(st.hinweise.includes('robots.txt von remotive.com: nicht gelesen – robots.txt: Disallow: /api/'), st.hinweise.join(' | '));
  assert.equal(st.hinweise.filter(h => /remotive/.test(h)).length, 1, 'ein Hinweis je Host');
  assert.ok(!gefragt.some(u => /remotive\.com\/api/.test(u)));
  assert.ok(!r.aktuell.kategorien.unterricht.some(e => e.quelle === 'Remotive'));
  assert.ok(r.aktuell.kategorien.unterricht.length > 0, 'News + Fundorte bleiben');
});

test('Fundort-Prüfung: robots-Verbot heißt „nicht geprüft“, nicht „Link gerade nicht erreichbar“', async () => {
  const zustand = {};
  const verboten = async url => { const e = new Error(`robots.txt von ${host(url)}: nicht gelesen – robots.txt: Disallow: /`); e.regel = 'robots'; throw e; };
  const liste = [{ titel: 'Plattform', link: 'https://teach.example/jobs' }];
  for (const tag of ['2026-11-16T08:00:00Z', '2026-11-17T08:00:00Z', '2026-11-18T08:00:00Z']) {
    const p = await pruefeFundorte(liste, { holeText: verboten, zustand, name: 'unterricht', jetzt: new Date(tag), an: true });
    assert.deepEqual(p.hinweise, []);
  }
  assert.equal(zustand.fundorte.unterricht['https://teach.example/jobs'].fehlerInFolge, 0);
  assert.equal(zustand.fundorte.unterricht['https://teach.example/jobs'].nichtGeprueft, true);
});

test('Roh-Lauf 43868228532: Apple-robots.txt sperrt /*/rss/* und /search* – Filme ohne „Apple antwortet gerade nicht“-Störung', async () => {
  // echte robots.txt von itunes.apple.com (16.11.2026, Gruppe „*“)
  const apple = 'User-agent: *\nDisallow: /WebObjects/MZFastFinance.woa\nDisallow: /WebObjects/*\nAllow: /WebObjects/MZStore.woa/wa/viewMultiRoom?*\nDisallow: /search*\nDisallow: /*/rss/*\nDisallow: /*/lookup?\n';
  const { hole, gefragt } = attrappe({ 'itunes.apple.com': apple });
  const nur = { ...cfg, module: Object.fromEntries(Object.entries(cfg.module).map(([k, v]) => [k, { ...v, aktiv: k === 'filme' }])) };
  const filmListen = JSON.parse(await readFile(join(HIER, '..', '..', 'filme.json'), 'utf8'));
  const r = await lauf({ cfg: nur, wunschliste, filmListen, vorher: null, zustand: {}, holeText: hole, jetzt: JETZT, alle: true });
  const st = r.aktuell.status.filme;
  assert.ok(!(st.fehler || []).some(f => /antwortet gerade nicht/.test(f)), (st.fehler || []).join(' | '));
  assert.ok((st.hinweise || []).some(h => /robots\.txt von itunes\.apple\.com: nicht gelesen/.test(h)), (st.hinweise || []).join(' | '));
  assert.ok(!gefragt.some(u => /itunes\.apple\.com\/([^/]+\/rss\/|search)/.test(u)), 'gesperrte Apple-Pfade nie abgerufen');
});
