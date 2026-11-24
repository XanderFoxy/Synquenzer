// Test Text-Spiegel 0.3 – erfundene Daten. node test.mjs <portAlt> <portNeu>
import { createRequire } from 'module';
import fs from 'fs';
import { P1, P2 } from './proben.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [portAlt, portNeu] = process.argv.slice(2).map(Number);
const FOTO = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/ticke-w/fotos/';
const ERG = []; const ok = (name, bed, info = '') => { ERG.push([bed ? 'OK ' : 'FEHLER', name, info]); };
const fehler = [];
const KERN = { format: 1, einwilligung: { an: true, zeit: '2026-11-20T10:00:00.000Z' }, einst: { alter: '18+', schrift: 1, einstieg: true } };
const browser = await chromium.launch();
const geraet = (extra = {}) => ({ viewport: { width: 428, height: 926 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, serviceWorkers: 'block', locale: 'de-DE', ...extra });
function wache(page, tag) {
  page.on('pageerror', (e) => fehler.push(`${tag} pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') fehler.push(`${tag} console.error: ${m.text()}`); });
}
const warte = (ms) => new Promise((r) => setTimeout(r, ms));
async function geh(page, base, hash) { await page.evaluate((h) => { location.hash = h; }, hash); await warte(350); }

// ---------- 1. Alte Daten mit der unveränderten Vorlage 0.2.1 erzeugen ----------
const ctxA = await browser.newContext(geraet());
await ctxA.addInitScript((k) => { if (!sessionStorage.getItem('gesaet')) { localStorage.setItem('ticke.v1.kern', JSON.stringify(k)); sessionStorage.setItem('gesaet', '1'); } }, KERN);
const pa = await ctxA.newPage(); wache(pa, 'ALT');
const A = `http://localhost:${portAlt}/ticke/`;
await pa.goto(A + '#text'); await warte(600);
for (const [id, t] of Object.entries(P1)) { await geh(pa, A, '#text/schreiben/' + id); await pa.fill('#ts-feld', t); await warte(600); }
await geh(pa, A, '#text/spiegel'); await warte(300);
const mj = await pa.$('[data-ts=mutter][data-wert=ja]'); if (mj) { await mj.click(); await warte(400); }
await geh(pa, A, '#text/blindtest'); const bk = await pa.$('[data-ts=waehle]'); if (bk) { await bk.click(); await warte(300); }
const alt = await pa.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter((k) => k.startsWith('ticke.v1.')).map((k) => [k, localStorage.getItem(k)])));
fs.writeFileSync('alt-daten.json', JSON.stringify(alt, null, 1));
const altErg = JSON.parse(alt['ticke.v1.ergebnisse'] || '{}').textspiegel;
ok('Vorlage erzeugt alte Daten (Texte, Ergebnis, Blindtest)', !!(altErg && altErg.length && JSON.parse(alt['ticke.v1.m.textspiegel']).blind), `Schlüssel: ${Object.keys(alt).join(', ')}`);
await ctxA.close();

// ---------- 2. Neue Fassung mit den alten Daten ----------
const ctx = await browser.newContext(geraet());
await ctx.addInitScript((d) => { if (!sessionStorage.getItem('gesaet')) { for (const [k, v] of Object.entries(d)) localStorage.setItem(k, v); sessionStorage.setItem('gesaet', '1'); } }, alt);
const p = await ctx.newPage(); wache(p, 'NEU');
const B = `http://localhost:${portNeu}/ticke/`;
const t0 = Date.now(); await p.goto(B + '#text'); await p.waitForSelector('.zeilen .zeile'); const tLaden = Date.now() - t0;
const breite = async () => p.evaluate(() => document.documentElement.scrollWidth);
const inhalt = async () => p.evaluate(() => (document.querySelector('#inhalt') || document.body).innerText);
const extern = async () => p.evaluate(() => document.querySelectorAll('#inhalt a[href^="http"], #inhalt [target=_blank]').length);
const VERBOTEN = /\d+\s*%|von 100\b|Prozent|Punkte|richtig erkannt|Treffer|Claude|über dem Durchschnitt|unter dem Durchschnitt|Münzwurf/i;
async function pruefeSeite(name, foto) {
  const txt = await inhalt(), w = await breite(), x = await extern();
  const m = txt.match(VERBOTEN);
  ok(`${name}: keine Bewertung/Zahlen-Wörter`, !m, m ? `gefunden: „${m[0]}“` : '');
  ok(`${name}: kein Link nach draußen`, x === 0, `${x}`);
  ok(`${name}: nichts quer überlaufend (≤ 428 px)`, w <= 428, `scrollWidth ${w}`);
  const klein = await p.evaluate(() => [...document.querySelectorAll('#inhalt button, #inhalt a.knopf, #inhalt a.karte, #inhalt a.zeile, #inhalt .chip, #inhalt summary, #inhalt .ts-astlink')]
    .filter((e) => e.offsetParent !== null).map((e) => [e.textContent.trim().slice(0, 30), Math.round(e.getBoundingClientRect().height)]).filter(([, h]) => h > 0 && h < 44));
  ok(`${name}: Tippflächen ≥ 44 px`, klein.length === 0, JSON.stringify(klein.slice(0, 4)));
  if (foto) await p.screenshot({ path: FOTO + foto, fullPage: true });
}
const txtUeb = await inhalt();
ok('Übersicht lädt mit alten Texten', /Du hast vier Texte geschrieben/.test(txtUeb), `Ladezeit ${tLaden} ms`);
await pruefeSeite('Übersicht', 'ts-uebersicht.png');

await geh(p, B, '#text/spiegel'); await p.waitForSelector('h2');
const nRicht = await p.$$eval('.ts-richtung', (e) => e.length);
ok('Spiegel: Richtungen in Worten', nRicht >= 5, `${nRicht} Richtungen`);
ok('Spiegel: keine Messbalken (Waage/Skala/Tabelle)', (await p.$$('.ts-waage, .ts-skala, .ts-tabelle, .ts-bar')).length === 0);
await pruefeSeite('Spiegel', 'ts-spiegel.png');

// alte Route text/claude → text/tiefer
await geh(p, B, '#text/claude'); await warte(300);
const hash = await p.evaluate(() => location.hash);
ok('Alte Route #text/claude leitet auf #text/tiefer um', hash === '#text/tiefer', hash);
await p.$$eval('details.ts-tief', (d) => d.forEach((x) => { x.open = true; }));
const nTief = await p.$$eval('details.ts-tief', (e) => e.length), nMark = await p.$$eval('.ts-stelle mark', (e) => e.length), nStellen = await p.$$eval('.ts-stelle', (e) => e.length);
ok('Tiefer lesen: 8 Merkmale mit Stellen aus den Texten', nTief === 8 && nStellen >= 8, `${nTief} Merkmale, ${nStellen} Stellen, ${nMark} markierte Wörter`);
ok('Tiefer lesen: wiederkehrende Wörter', (await p.$$('.ts-woerter span')).length >= 1);
await pruefeSeite('Tiefer lesen', 'ts-tiefer.png');

// Schnittstelle
const api = await p.evaluate(async () => {
  const { kern } = await import('/ticke/kern.js'); const m = await import('/ticke/module/textspiegel/modul.js');
  const satzZahl = (s) => (s.match(/[.!?](\\s|$)/g) || []).length;
  const ae = m.aeste(), li = m.antwortListe(kern), mu = m.muster(kern);
  const inhaltOk = ae.every((a) => { const n = (a.wasEsIst.match(/[.!?](?=\s|$)/g) || []).length; return n >= 3 && n <= 7 && ['imAlltag', 'staerken', 'reibung', 'weiterdenken'].every((k) => a[k].length >= 3 && a[k].length <= 6) && a.pole.length === 2 && a.wissen && !/http/.test(JSON.stringify(a)); });
  return { ae: ae.length, ids: ae.map((a) => a.id), inhaltOk, li: li.map((x) => [x.id, x.art, !!x.wert, x.anzeige.slice(0, 40)]), mu, erg: kern.speicher.ergebnis('textspiegel') };
});
ok('aeste(): 8 Äste mit Lerninhalt (3–6 Sätze, Listen 3–6, zwei Pole, ohne Link)', api.ae === 8 && api.inhaltOk, api.ids.join(', '));
ok('antwortListe(): 4 Texte + Muttersprache + 2 Wirkungs-Fragen', api.li.length === 7 && api.li.slice(0, 4).every((x) => x[1] === 'text' && x[2]), JSON.stringify(api.li.map((x) => x[0] + ':' + x[3])));
ok('muster(): Richtungen ohne Zahl', api.mu.length >= 5 && api.mu.every((x) => !/\d/.test(x.richtung) && ['klar', 'leicht', 'beides'].includes(x.deutlich) && x.ast.startsWith('textspiegel.')), api.mu.map((x) => `${x.ast}=${x.deutlich}`).join(', '));
ok('Ergebnis neu gerechnet (Feld richtungen ergänzt, Format der Vorlage bleibt)', !!(api.erg && api.erg.richtungen && api.erg.woerter && api.erg.merkmale && api.erg.aufgaben), Object.keys(api.erg || {}).join(','));
fs.writeFileSync('muster-vorher.json', JSON.stringify(api.mu, null, 1));

// Antwort ändern über antwortSetzen → Muster ändert sich, „vorher“ gepflegt
const nach = await p.evaluate(async (P2) => {
  const { kern } = await import('/ticke/kern.js'); const m = await import('/ticke/module/textspiegel/modul.js');
  const vor = JSON.stringify(m.muster(kern)), ergVor = kern.speicher.verlauf('textspiegel').length;
  for (const id of ['tag', 'antrieb', 'bremse', 'freund']) await m.antwortSetzen(kern, id, P2[id]);
  await m.antwortSetzen(kern, 'wirkung.extraversion', 'niedrig');
  const jetzt = m.muster(kern), li = m.antwortListe(kern);
  return { anders: JSON.stringify(jetzt) !== vor, jetzt: jetzt.map((x) => `${x.ast}=${x.richtung.slice(0, 50)}`), vorher: li[1].vorher.length, vorherAnz: li[1].vorher[0] && li[1].vorher[0].anzeige,
    erg: kern.speicher.ergebnis('textspiegel').woerter, richt: kern.speicher.ergebnis('textspiegel').richtungen, wirk: li[6].wert + '/' + li[5].wert };
}, P2);
ok('antwortSetzen(): Muster rechnet sofort neu', nach.anders, nach.jetzt.join(' | '));
ok('antwortSetzen(): alte Antwort in „vorher“', nach.vorher === 1, nach.vorherAnz);
ok('antwortSetzen(): Ergebnis passt zu den neuen Texten', nach.erg < 200, `jetzt ${nach.erg} Wörter`);

// Im Text ändern (UI) → Frühere Fassungen → zurückholen → löschen
await geh(p, B, '#text/schreiben/bremse');
await p.fill('#ts-feld', P1.bremse + ' Heute probiere ich es trotzdem.'); await warte(600);
await geh(p, B, '#text'); await geh(p, B, '#text/schreiben/bremse');
const nFass = await p.$$eval('.ts-fassungen li', (e) => e.length);
ok('Schreiben: frühere Fassungen sichtbar (höchstens 5)', nFass >= 1 && nFass <= 5, `${nFass}`);
await p.click('.ts-fassungen summary'); await p.click('[data-ts=zurueckholen][data-i="0"]'); await warte(500);
const nachZurueck = await p.inputValue('#ts-feld');
ok('Schreiben: frühere Fassung zurückgeholt', nachZurueck.trim() === P1.bremse.trim(), nachZurueck.slice(0, 50));
await pruefeSeite('Schreiben', 'ts-schreiben.png');
await p.click('[data-ts=leeren]'); await warte(300); await p.click('dialog [data-w=ja]'); await warte(500);
const leer = await p.inputValue('#ts-feld');
ok('Schreiben: Text löschen (mit Rückfrage)', leer === '', `„${leer.slice(0, 20)}“`);

// Blindtest: alte Daten (letzte) → Ergebnisansicht ohne richtig/falsch; neue Wahl
await p.evaluate(async (P1) => { const { kern } = await import('/ticke/kern.js'); const m = await import('/ticke/module/textspiegel/modul.js'); for (const id of Object.keys(P1)) await m.antwortSetzen(kern, id, P1[id]); }, P1);
await geh(p, B, '#text/blindtest');
const nKarten = await p.$$eval('.ts-blind-karte', (e) => e.length);
ok('Blindtest: drei Beschreibungen zur Wahl', nKarten === 3, `${nKarten}`);
await p.click('.ts-blind-karte >> nth=1'); await warte(400);
const btxt = await inhalt();
ok('Blindtest: Auflösung ohne richtig/falsch', !/richtig|falsch|erkannt|von \d/i.test(btxt) && /So beschreibt die Zählung deine Texte/.test(btxt));
await pruefeSeite('Blindtest', 'ts-blindtest.png');

// Krise → keine Auswertung, muster() leer; zu kurz → kein Ergebnis
const kr = await p.evaluate(async () => {
  const { kern } = await import('/ticke/kern.js'); const m = await import('/ticke/module/textspiegel/modul.js');
  await m.antwortSetzen(kern, 'bremse', 'Manchmal habe ich keine Kraft mehr und will nicht mehr leben.');
  const a = m.muster(kern).length;
  return a;
});
await geh(p, B, '#text/spiegel');
ok('Krise: keine Auswertung, Hilfe-Karte, muster() leer', kr === 0 && (await p.$$('.karte.hilfe')).length >= 1 && (await p.$$('.ts-richtung')).length === 0);
const kurz = await p.evaluate(async () => {
  const { kern } = await import('/ticke/kern.js'); const m = await import('/ticke/module/textspiegel/modul.js');
  for (const id of ['tag', 'antrieb', 'bremse', 'freund']) await m.antwortSetzen(kern, id, null);
  await m.antwortSetzen(kern, 'tag', 'Ein kurzer Text.');
  return { mu: m.muster(kern).length, erg: kern.speicher.ergebnis('textspiegel'), vorher: m.antwortListe(kern)[0].vorher.length };
});
ok('Zu kurz: muster() leer, Ergebnis entfernt; vorher höchstens 5', kurz.mu === 0 && kurz.erg === null && kurz.vorher <= 5, JSON.stringify(kurz));

// Wieder volle Texte, dann quer und dunkel
await p.evaluate(async (P1) => { const { kern } = await import('/ticke/kern.js'); const m = await import('/ticke/module/textspiegel/modul.js'); for (const id of Object.keys(P1)) await m.antwortSetzen(kern, id, P1[id]); }, P1);
await p.setViewportSize({ width: 926, height: 428 }); await geh(p, B, '#text/spiegel'); await warte(200);
ok('Quer 926×428: nichts überlaufend', (await breite()) <= 926, `${await breite()}`);
await p.screenshot({ path: FOTO + 'ts-spiegel-quer.png' });
await ctx.close();
const ctxD = await browser.newContext(geraet({ colorScheme: 'dark' }));
await ctxD.addInitScript((d) => { if (!sessionStorage.getItem('gesaet')) { for (const [k, v] of Object.entries(d)) localStorage.setItem(k, v); sessionStorage.setItem('gesaet', '1'); } }, alt);
const pd = await ctxD.newPage(); wache(pd, 'DUNKEL');
await pd.goto(B + '#text/tiefer'); await pd.waitForSelector('details.ts-tief'); await pd.$$eval('details.ts-tief', (d) => { d[0].open = true; d[2].open = true; });
await pd.screenshot({ path: FOTO + 'ts-tiefer-dunkel.png', fullPage: true });
await ctxD.close();
await browser.close();
ok('0 Seitenfehler / console.error', fehler.length === 0, fehler.slice(0, 6).join(' || '));
for (const e of ERG) console.log(e.join(' | '));
console.log(`\n${ERG.filter((e) => e[0] === 'OK ').length} von ${ERG.length} Prüfungen bestanden`);
