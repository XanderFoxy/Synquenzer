// Test Modul bigfive in der App (erfundene Daten). Aufruf: node bf-test.mjs <basis-url .../ticke/> <alt-daten.json> <foto-präfix>
import { createRequire } from 'module'; const require = createRequire(import.meta.url);
const { chromium } = require('playwright'); const fs = require('fs');
const [basis, altDatei, foto] = process.argv.slice(2);
const ALT = JSON.parse(fs.readFileSync(altDatei, 'utf8'));
const b = await chromium.launch();
let n = 0, f = 0; const fehlerSeite = [];
const ok = (c, t) => { n++; if (!c) { f++; console.log('  FEHLER:', t); } };
const VERBOTEN = /%|als die meisten|Prozentrang|Perzentil|Vergleichsgruppe|T-Wert|Mittelfeld|darunter|richtig gut|Punkte|Note\b|Level|niedriger|höher als/;
async function kontext({ daten = null, quer = false, dunkel = false } = {}) {
  const c = await b.newContext({ viewport: quer ? { width: 926, height: 428 } : { width: 428, height: 926 }, hasTouch: true, isMobile: true, serviceWorkers: 'block', colorScheme: dunkel ? 'dark' : 'light', locale: 'de-DE' });
  if (daten) await c.addInitScript((d) => { try { if (!sessionStorage.getItem('bf-init')) { localStorage.clear(); for (const [k, v] of Object.entries(d)) localStorage.setItem(k, v); sessionStorage.setItem('bf-init', '1'); } } catch {} }, daten);
  const p = await c.newPage();
  p.on('pageerror', (e) => fehlerSeite.push('pageerror: ' + e));
  p.on('console', (m) => { if (m.type() === 'error') fehlerSeite.push('console.error: ' + m.text()); });
  return { c, p };
}
const geh = async (p, h) => { await p.evaluate((x) => { location.hash = x; }, h); await p.waitForTimeout(250); };
const inhaltText = (p) => p.evaluate(() => document.getElementById('inhalt').innerText.replace(/keine Punkte|keine Prozente/g, ''));
async function pruefeErgebnis(p, name) {
  await p.waitForSelector('.bf-bereich', { timeout: 10000 });
  ok(await p.locator('.bf-bereich').count() === 5, name + ': 5 Bereiche');
  ok(await p.locator('#inhalt .band, #inhalt .band-spur, #inhalt [role=progressbar]').count() === 0, name + ': keine Balken/Bänder');
  const t = await inhaltText(p); const m = t.match(VERBOTEN); ok(!m, name + ': keine Bewertungs-Wörter (' + (m && m[0]) + ')');
  const ziffern = await p.evaluate(() => [...document.querySelectorAll('.bf-pole,.bf-richtung,.bf-woher,.bf-fac,.bf-kurz')].map((e) => e.innerText).join(' ').match(/\d/g));
  ok(!ziffern, name + ': keine Ziffern in Mustertexten ' + (ziffern || []).join(''));
  ok(await p.locator('#inhalt a[href^="http"], #inhalt [target=_blank]').count() === 0, name + ': keine Links nach draußen');
  ok(await p.locator('.bf-pol.an, .bf-pol.halb, .bf-pol.beide').count() >= 5, name + ': je Bereich ein Pol hervorgehoben oder beide');
}
async function breite(p, name) {
  const w = await p.evaluate(() => ({ doc: document.documentElement.scrollWidth, vw: innerWidth, inh: document.getElementById('inhalt').scrollWidth, inhC: document.getElementById('inhalt').clientWidth }));
  ok(w.doc <= w.vw && w.inh <= w.inhC + 1, `${name}: nichts läuft quer über (${w.doc}/${w.vw}, ${w.inh}/${w.inhC})`);
}
async function tipp(p, sel, name) {
  const klein = await p.evaluate((s) => [...document.querySelectorAll(s)].filter((e) => e.offsetParent !== null).map((e) => [e.textContent.trim().slice(0, 30), Math.round(e.getBoundingClientRect().height), Math.round(e.getBoundingClientRect().width)]).filter((x) => x[1] < 44 || x[2] < 44), sel);
  ok(!klein.length, name + ': Tippflächen ≥ 44 px ' + JSON.stringify(klein.slice(0, 4)));
}

// ---- 1. Alte Daten der Vorlage laden ----
console.log('1. Alte Daten (Vorlage 0.2.1) laden');
{
  const { c, p } = await kontext({ daten: ALT });
  await p.goto(basis + '?test=1#fragen/bigfive'); await p.waitForFunction(() => window.__ticke);
  await pruefeErgebnis(p, 'alt');
  await tipp(p, '.bf-wege .knopf, .bf-aktionen .knopf, .bf-aktionen .link, .bf-facetten summary', 'alt');
  await breite(p, 'alt hochkant');
  await p.screenshot({ path: foto + '-alt-ergebnis.png', fullPage: false });
  await p.locator('#bf-offenheit').screenshot({ path: foto + '-alt-offenheit.png' });
  const M = await p.evaluate(() => window.__bigfive.muster(window.__ticke));
  ok(M.length === 5 && M.every((x) => x.ast.startsWith('bigfive.') && x.richtung && !/\d/.test(x.richtung) && ['klar', 'leicht', 'beides'].includes(x.deutlich) && x.woher), 'alt: muster() 5 Einträge in Worten');
  console.log('  muster:', M.map((x) => x.ast.slice(8) + '=' + x.deutlich).join(', '));
  const A = await p.evaluate(() => window.__bigfive.antwortListe(window.__ticke));
  ok(A.length === 30 && A.every((x) => x.wert >= 1 && x.anzeige && x.optionen.length === 5 && x.gruppe && x.art === 'wahl'), 'alt: antwortListe() 30 beantwortet');
  const AE = await p.evaluate(() => window.__bigfive.aeste());
  ok(AE.length === 5 && AE.every((x) => x.unteraeste.length === 6 && x.pole.length === 2 && x.imAlltag.length >= 3 && x.wissen && !/http/.test(JSON.stringify(x))), 'alt: aeste() 5 mit Facetten, ohne Links');
  const vorher = await p.evaluate(() => JSON.stringify(window.__ticke.speicher.ergebnis('bigfive').bereiche.extraversion));
  ok(vorher.includes('"pr"'), 'alt: altes Ergebnis unverändert im Speicher (noch mit altem Feld)');

  // ---- 2. Antworten in der Oberfläche ändern ----
  console.log('2. Antworten ändern (Oberfläche)');
  await geh(p, 'fragen/bigfive/antworten'); await p.waitForSelector('.bf-antw');
  ok(await p.locator('.bf-antw').count() === 30, 'Antwort-Liste: 30 Zeilen');
  await tipp(p, '.bf-antw, .bf-sprung .chip', 'Antworten');
  await breite(p, 'Antworten hochkant');
  const vorE = await p.locator('#bf-jetzt-liste li:nth-child(3)').innerText();
  const eIds = await p.evaluate(() => window.__bigfive.antwortListe(window.__ticke).filter((x) => x.bereich === 'extraversion').map((x) => [x.id, window.__bigfive.NACH_ID[x.id].k]));
  for (const [id, k] of eIds) {
    await p.click(`[data-bf-frage="${id}"]`); await p.waitForSelector('dialog.blatt .antwort');
    if (id === eIds[0][0]) { await tipp(p, 'dialog.blatt .antwort, dialog.blatt .knopf', 'Blatt'); await p.screenshot({ path: foto + '-blatt.png' }); }
    await p.click(`dialog.blatt .antwort[data-w="${k > 0 ? 1 : 5}"]`); await p.waitForTimeout(200);
  }
  const nachE = await p.locator('#bf-jetzt-liste li:nth-child(3)').innerText();
  console.log('  Extraversion vorher:', vorE, '| nachher:', nachE);
  ok(nachE !== vorE && nachE.includes('klar in Richtung „Ruhe und Tiefe“'), 'Muster ändert sich sofort nach Änderung');
  const sp = await p.evaluate(() => { const S = window.__ticke.speicher; return { v: S.lies('bigfive', 'vorher', {}), e: S.ergebnis('bigfive'), n: S.verlauf('bigfive').length }; });
  ok(Object.keys(sp.v).length >= 1 && Object.values(sp.v).every((l) => l.length <= 5 && l[0].anzeige && l[0].zeit), '„vorher“ gespeichert: ' + Object.keys(sp.v).length + ' Sätze');
  ok(sp.e.bereiche.extraversion.eigen && sp.e.bereiche.extraversion.eigen.deutlich === 'klar' && sp.e.facettenEigen, 'Ergebnis neu gerechnet (mit Richtung in Worten)');
  ok(sp.n === 1, 'Ergebnis ersetzt, kein neuer Verlaufseintrag (' + sp.n + ')');
  ok(!('pr' in sp.e.bereiche.extraversion) && typeof sp.e.bereiche.extraversion.stufe === 'number', 'kein Prozentrang mehr, alte Felder für andere Module bleiben');
  ok((await p.locator(`[data-bf-frage="${eIds[0][0]}"] small`).innerText()).includes('vorher:'), 'Zeile zeigt „vorher“');
  await p.screenshot({ path: foto + '-antworten.png' });
  // Antwort entfernen
  const weg = eIds[1][0];
  await p.click(`[data-bf-frage="${weg}"]`); await p.waitForSelector('dialog.blatt [data-w=weg]'); await p.click('dialog.blatt [data-w=weg]'); await p.waitForTimeout(200);
  ok((await p.locator(`[data-bf-frage="${weg}"] small`).innerText()).includes('noch offen'), 'Antwort entfernt → „noch offen“');
  // Ergebnis-Seite zeigt die Änderung
  await geh(p, 'fragen/bigfive'); await pruefeErgebnis(p, 'nach Änderung');
  ok((await p.locator('#bf-extraversion .bf-richtung').innerText()).includes('Ruhe und Tiefe'), 'Ergebnis-Seite zeigt neue Richtung');
  // Seiten Methode, Einstieg-Links
  await geh(p, 'fragen/bigfive/methode'); await p.waitForSelector('#inhalt h2');
  const tm = await inhaltText(p); const mm = tm.match(VERBOTEN); ok(!mm, 'Methode: keine Bewertungs-Wörter (' + (mm && mm[0]) + ')');
  ok(await p.locator('#inhalt a[href^="http"], #inhalt [target=_blank]').count() === 0, 'Methode: keine Links nach draußen');
  await breite(p, 'Methode hochkant');
  // dunkel
  await c.close();
}
{
  const { c, p } = await kontext({ daten: ALT, dunkel: true });
  await p.goto(basis + '?test=1#fragen/bigfive'); await p.waitForSelector('.bf-bereich');
  await p.locator('#bf-stabilitaet').screenshot({ path: foto + '-dunkel-stabilitaet.png' });
  await c.close();
}

// ---- 2b. Eilig ausgefüllte Vorlage-Daten ----
console.log('2b. Eilige Antworten (Vorlage-Daten)');
{
  const { c, p } = await kontext({ daten: JSON.parse(fs.readFileSync(altDatei.replace('.json', '-eilig.json'), 'utf8')) });
  await p.goto(basis + '?test=1#fragen/bigfive'); await pruefeErgebnis(p, 'eilig');
  ok(await p.locator('.bf-qualitaet').count() === 1, 'eilig: freundlicher Hinweis sichtbar');
  ok(!(await p.locator('.bf-richtung').allInnerTexts()).some((t) => t.startsWith('Klar')), 'eilig: Richtungen vorsichtig (kein „klar“)');
  const q = await p.locator('.bf-qualitaet').innerText(); ok(!/\d/.test(q), 'eilig: Hinweis ohne Zahlen über ihn');
  await c.close();
}

// ---- 3. Neu ausfüllen (erfundene Antworten) über den Fragebogen ----
console.log('3. Fragebogen neu ausfüllen');
{
  const { c, p } = await kontext();
  await p.goto(basis + '?test=1#fragen/bigfive'); await p.waitForFunction(() => window.__ticke);
  await p.waitForSelector('#inhalt h2');
  const te = await inhaltText(p); const me = te.match(VERBOTEN); ok(!me, 'Einstieg: keine Bewertungs-Wörter (' + (me && me[0]) + ')');
  await geh(p, 'fragen/bigfive/start'); await p.waitForSelector('.frage');
  const ziel = { O: 2, C: 5, E: 4, A: 2, N: 2 };
  for (let i = 0; i < 30; i++) {
    await p.waitForSelector('.frage[data-bereit="1"]');
    const info = await p.evaluate(() => { const t = document.querySelector('#fb-text').textContent; const q = window.__bigfive.FRAGEN.find((x) => x.t === t); return { b: q.b, k: q.k }; });
    let w = ziel[info.b]; if (info.k < 0) w = 6 - w;
    if (i === 4) { await p.click('[data-fb=skip]'); await p.waitForTimeout(300); continue; }
    await p.click(`.antwort[data-wert="${w}"]`); await p.waitForTimeout(1750);
  }
  await p.waitForSelector('.bf-bereich', { timeout: 10000 }).catch(() => {});
  if (!(await p.locator('.bf-bereich').count())) { await geh(p, 'fragen/bigfive'); }
  await pruefeErgebnis(p, 'neu');
  const r = await p.evaluate(() => Object.fromEntries(Object.entries(window.__ticke.speicher.ergebnis('bigfive').bereiche).map(([k, v]) => [k, v.wort])));
  console.log('  neu:', JSON.stringify(r));
  ok(!(await p.locator('.bf-qualitaet').count()), 'neu: in Ruhe ausgefüllt → kein Eilig-Hinweis');
  ok(r.gewissenhaftigkeit.startsWith('klar') && r.gewissenhaftigkeit.includes('Plan und Struktur') && r.offenheit.includes('Halt im Bewährten') && r.stabilitaet.includes('Gelassene Ruhe'), 'neu: Richtungen passen zu den erfundenen Antworten');
  const L = await p.evaluate(() => window.__bigfive.antwortListe(window.__ticke));
  ok(L.length === 30 && L.filter((x) => x.wert == null).length === 1 && L.some((x) => x.uebersprungen), 'neu: übersprungener Satz als offen gelistet');
  // Vertrag: antwortSetzen ändert das Muster, „vorher“ höchstens 5
  const id = L.find((x) => x.bereich === 'offenheit' && x.wert != null).id;
  const vor = await p.evaluate(() => window.__bigfive.muster(window.__ticke).find((x) => x.ast === 'bigfive.offenheit').richtung);
  const nach = await p.evaluate(async () => { const B = window.__bigfive, k = window.__ticke;
    for (const x of B.antwortListe(k).filter((y) => y.bereich === 'offenheit')) await B.antwortSetzen(k, x.id, B.NACH_ID[x.id].k > 0 ? 5 : 1);
    return B.muster(k).find((x) => x.ast === 'bigfive.offenheit').richtung; });
  console.log('  offenheit vorher:', vor, '| nachher:', nach);
  ok(vor !== nach && nach.includes('Neugier auf Neues'), 'antwortSetzen: Muster rechnet neu');
  const v5 = await p.evaluate(async (i) => { const B = window.__bigfive, k = window.__ticke; for (let j = 0; j < 8; j++) await B.antwortSetzen(k, i, (j % 5) + 1); return B.antwortListe(k).find((x) => x.id === i).vorher.length; }, id);
  ok(v5 === 5, '„vorher“ höchstens 5 je Satz (' + v5 + ')');
  const fehlerfrei = await p.evaluate(async () => { try { await window.__bigfive.antwortSetzen(window.__ticke, 'bf999', 3); return false; } catch { return true; } });
  ok(fehlerfrei, 'antwortSetzen: unbekannte ID wird abgelehnt');
  await c.close();
}

// ---- 4. Quer 926×428 ----
console.log('4. Quer');
{
  const { c, p } = await kontext({ daten: ALT, quer: true });
  await p.goto(basis + '?test=1#fragen/bigfive'); await p.waitForSelector('.bf-bereich');
  await breite(p, 'quer Ergebnis'); await p.screenshot({ path: foto + '-quer-ergebnis.png' });
  await geh(p, 'fragen/bigfive/antworten'); await p.waitForSelector('.bf-antw'); await breite(p, 'quer Antworten');
  await c.close();
}
ok(fehlerSeite.length === 0, 'Seitenfehler/console.error: ' + fehlerSeite.length + ' ' + fehlerSeite.slice(0, 5).join(' | '));
console.log(`${n - f} von ${n} Prüfungen ok${f ? ` – ${f} FEHLER` : ''}`);
await b.close(); process.exit(f ? 1 : 0);
