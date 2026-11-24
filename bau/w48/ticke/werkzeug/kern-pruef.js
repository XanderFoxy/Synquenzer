// Prüft die Kern-Arbeit (kern-Agent) in der App: node kern-pruef.js <basis-url> <foto-ordner> [stub=1]
// Basis-URL z. B. http://127.0.0.1:8951/ticke/ . Mit stub=1 wird ein Muster-Test-Stub erwartet (Antworten ändern komplett).
const { chromium } = require('playwright');
const [, , BASIS, FOTOS, STUB] = process.argv;
const fs = require('fs');
const fehler = [], ok = [], schlecht = [];
const pruef = (name, bed, info = '') => { (bed ? ok : schlecht).push(name + (info ? ' – ' + info : '')); };
const warte = (p, ms) => p.waitForTimeout(ms);

async function seite(browser, opt = {}) {
  const ctx = await browser.newContext({ viewport: opt.viewport || { width: 428, height: 926 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, serviceWorkers: 'block', colorScheme: opt.dunkel ? 'dark' : 'light', locale: 'de-DE' });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => fehler.push('pageerror ' + (opt.name || '') + ': ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error') fehler.push('console.error ' + (opt.name || '') + ': ' + m.text()); });
  p.on('requestfailed', (r) => { if (!/favicon/.test(r.url())) fehler.push('requestfailed ' + r.url()); });
  p.on('response', (r) => { if (r.status() >= 400) fehler.push('HTTP ' + r.status() + ' ' + r.url()); });
  return { ctx, p };
}
async function geh(p, hash) { await p.evaluate((h) => { location.hash = h; }, hash); await warte(p, 350); }
const quer = (p) => p.evaluate(() => { const i = document.getElementById('inhalt'); return { doc: document.documentElement.scrollWidth - document.documentElement.clientWidth, inhalt: i.scrollWidth - i.clientWidth }; });
const VERBOTEN = [/\bPunkte?n?\b/, /\d\s?%/, /Prozent/, /die meisten/, /in Folge/, /\bLevel\b/, /Abzeichen/, /\bRang\b/, /Perzentil/, /Wahrscheinlichkeit/, /im Vergleich zu anderen/, /Mit Claude/];
async function textPruef(p, name) {
  const t = await p.evaluate(() => document.getElementById('inhalt').innerText + ' ' + (document.getElementById('weg-leiste').innerText || ''));
  const treffer = VERBOTEN.filter((r) => r.test(t)).map(String);
  pruef('Wortwahl ' + name, !treffer.length, treffer.join(' '));
  const ext = await p.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => /^(https?:|\/\/|mailto:)/i.test(h) || false).concat([...document.querySelectorAll('[target=_blank]')].map(() => 'target=_blank')));
  pruef('keine Links nach draußen ' + name, !ext.length, ext.join(' '));
}
async function foto(p, n) { if (FOTOS) await p.screenshot({ path: `${FOTOS}/kern-${n}.png` }); }

(async () => {
  const browser = await chromium.launch();
  // ---------- 1. Neu (nichts beantwortet) ----------
  let { ctx, p } = await seite(browser, { name: 'neu' });
  const t0 = Date.now();
  await p.goto(BASIS + '?test=1'); await p.waitForSelector('#inhalt h2');
  pruef('Startseite lädt', true, (Date.now() - t0) + ' ms bis h2');
  const karten = await p.$$eval('.start-karten a', (a) => a.map((x) => x.getAttribute('href') + ' ' + Math.round(x.getBoundingClientRect().height)));
  pruef('Start (neu): zwei Karten oben', karten.length === 2 && karten[0].startsWith('#muster') && karten[1].startsWith('#antworten'), karten.join(', '));
  const kartenOben = await p.$eval('.start-karten', (u) => u.getBoundingClientRect().top < 300);
  pruef('Start (neu): Karten im oberen Teil', kartenOben);
  await textPruef(p, 'Start neu'); await foto(p, '01-start-neu');
  let q = await quer(p); pruef('Start neu: nichts quer', q.doc <= 0 && q.inhalt <= 0, JSON.stringify(q));
  // Reiter
  const reiter = await p.$$eval('#leiste a', (a) => a.map((x) => { const r = x.getBoundingClientRect(), s = x.querySelector('span'); return { r: x.dataset.r, w: r.width, h: r.height, ueber: s.scrollWidth > s.clientWidth + 1, zeilen: Math.round(s.getBoundingClientRect().height / parseFloat(getComputedStyle(s).lineHeight)) }; }));
  pruef('6 Reiter, Muster an 2. Stelle', reiter.length === 6 && reiter[1].r === 'muster', reiter.map((x) => x.r).join(','));
  pruef('Reiter ≥ 44 px', reiter.every((x) => x.w >= 44 && x.h >= 44), reiter.map((x) => Math.round(x.w) + '×' + Math.round(x.h)).join(' '));
  pruef('Reiter-Schrift passt (1 Zeile)', reiter.every((x) => !x.ueber && x.zeilen <= 1), JSON.stringify(reiter.map((x) => x.zeilen)));
  // Schrift „Sehr groß“
  await p.evaluate(() => window.__ticke.setzeEinst({ schrift: 1.3 })); await warte(p, 100);
  const reiterG = await p.$$eval('#leiste a', (a) => a.map((x) => { const s = x.querySelector('span'); return { w: x.getBoundingClientRect().width, ueber: s.scrollWidth > s.clientWidth + 1 }; }));
  q = await quer(p);
  pruef('Schrift sehr groß: Reiter-Texte laufen nicht über', reiterG.every((x) => !x.ueber), JSON.stringify(reiterG.map((x) => Math.round(x.w))));
  pruef('Schrift sehr groß: nichts quer', q.doc <= 0 && q.inhalt <= 0, JSON.stringify(q));
  await foto(p, '02-start-neu-gross');
  await p.evaluate(() => window.__ticke.setzeEinst({ schrift: 1 }));

  // Quellen-Seite
  await geh(p, '#einstellungen/quellen'); await p.waitForSelector('.quelle-erkl', { timeout: 5000 }).catch(() => {});
  const qs = await p.evaluate(() => ({ titel: document.getElementById('titel').textContent, h2: document.querySelector('#inhalt h2').textContent, erkl: document.querySelectorAll('.quelle-erkl').length, li: document.querySelectorAll('.quellen li').length }));
  pruef('Quellen-Seite heißt „Woher das Wissen kommt“', qs.titel === 'Woher das Wissen kommt' && qs.h2 === 'Woher das Wissen kommt', qs.titel);
  pruef('Quellen mit Erklärung', qs.erkl > 0, `${qs.erkl} von ${qs.li} Quellen mit Erklärung`);
  await textPruef(p, 'Quellen'); await foto(p, '03-quellen');
  // Marke → Blatt
  await geh(p, '#einstellungen/hinweise');
  await p.click('#inhalt .marke[data-quellen=pittenger2005]'); await p.waitForSelector('dialog.blatt .quellen li', { timeout: 5000 });
  const bl = await p.evaluate(() => { const d = document.querySelector('dialog.blatt'); return { erkl: d.querySelectorAll('.quelle-erkl').length, ext: [...d.querySelectorAll('a')].filter((a) => /^http/.test(a.getAttribute('href'))).length, link: d.querySelector('.link').textContent }; });
  pruef('Marke-Blatt: Erklärung, kein Link nach draußen', bl.erkl >= 1 && bl.ext === 0, JSON.stringify(bl));
  await foto(p, '04-marke-blatt');
  await p.click('dialog.blatt [data-w=""]'); await warte(p, 150);
  await textPruef(p, 'Hinweise');
  const rq = await p.evaluate(() => document.querySelector('#inhalt .richtung') ? document.querySelector('#inhalt .richtung').innerText : '');
  pruef('Hinweise: Beispiel mit richtung() ohne Zahl', rq && !/\d/.test(rq), rq.replace(/\n/g, ' / '));

  // Profil / Was passt: ein Reiter mit Unterreitern
  await geh(p, '#profil'); await warte(p, 400);
  let u = await p.evaluate(() => ({ sicht: !document.getElementById('unterreiter').hidden, cur: document.querySelector('#unterreiter [aria-current]')?.dataset.r, nav: document.querySelector('#leiste [aria-current]')?.dataset.r, zur: document.getElementById('zurueck').hidden, h: Math.round(document.querySelector('#unterreiter a').getBoundingClientRect().height) }));
  pruef('#profil: Unterreiter sichtbar, Reiter Profil', u.sicht && u.cur === 'profil' && u.nav === 'profil' && u.zur && u.h >= 44, JSON.stringify(u));
  await foto(p, '05-profil-unterreiter');
  await p.click('#unterreiter a[data-r=passt]'); await warte(p, 450);
  u = await p.evaluate(() => ({ hash: location.hash, cur: document.querySelector('#unterreiter [aria-current]')?.dataset.r, nav: document.querySelector('#leiste [aria-current]')?.dataset.r, zur: document.getElementById('zurueck').hidden, titel: document.getElementById('titel').textContent }));
  pruef('#passt über Unterreiter, Reiter Profil bleibt', u.hash === '#passt' && u.cur === 'passt' && u.nav === 'profil' && u.zur, JSON.stringify(u));
  await geh(p, '#training'); u = await p.evaluate(() => document.getElementById('unterreiter').hidden);
  pruef('Unterreiter weg außerhalb von Profil', u);

  // Muster-Reiter
  await geh(p, '#muster'); await warte(p, 300);
  u = await p.evaluate(() => ({ nav: document.querySelector('#leiste [aria-current]')?.dataset.r, h2: document.querySelector('#inhalt h2')?.textContent }));
  pruef('#muster gehört dem Modul muster, Reiter Muster aktiv', u.nav === 'muster' && !/Bausteine/.test(u.h2 || ''), JSON.stringify(u));
  await geh(p, '#bausteine'); u = await p.evaluate(() => document.querySelector('#inhalt h2')?.textContent);
  pruef('#bausteine (Test-Seite) da', u === 'Bausteine', u);
  await foto(p, '06-bausteine');

  // ---------- 2. Antworten ändern ----------
  await geh(p, '#antworten');
  await p.waitForFunction(() => [...document.querySelectorAll('.antw-teil [data-stand]')].every((s) => s.textContent !== 'lädt …'), null, { timeout: 8000 });
  const teile = await p.$$eval('.antw-teil', (t) => t.map((x) => x.dataset.teil + ': ' + x.querySelector('[data-stand]').textContent));
  pruef('#antworten: alle Teile geladen', teile.length >= 7, teile.join(' | '));
  await textPruef(p, 'Antworten');
  q = await quer(p); pruef('#antworten: nichts quer', q.doc <= 0 && q.inhalt <= 0, JSON.stringify(q));
  await foto(p, '07-antworten-zu');
  if (STUB) {
    await p.click('.antw-teil[data-teil=muster] summary'); await warte(p, 100);
    await foto(p, '08-antworten-muster-offen');
    const setze = async (id, aktion) => { await p.click(`.antw-zeile[data-modul=muster][data-id=${id}]`); await p.waitForSelector('dialog.blatt'); await aktion(); await warte(p, 250); };
    const zeileText = (id) => p.$eval(`.antw-zeile[data-modul=muster][data-id=${id}]`, (b) => b.innerText.replace(/\s+/g, ' ').trim());
    await setze('d1', async () => { await foto(p, '09-blatt-wahl'); await p.click('dialog.blatt .antwort:nth-child(4)'); });
    let z = await zeileText('d1'); pruef('Wahl setzen', /stimmt eher/.test(z), z);
    const e1 = await p.evaluate(() => window.__ticke.speicher.ergebnis('muster'));
    pruef('Ergebnis neu berechnet nach Wahl', e1 && e1.antworten && e1.antworten.d1 === 4, JSON.stringify(e1 && e1.antworten));
    await setze('d1', async () => { await p.click('dialog.blatt .antwort:nth-child(3)'); });
    z = await zeileText('d1'); pruef('Wahl ändern, „vorher“ sichtbar', /teils, teils/.test(z) && /vorher: stimmt eher/.test(z), z);
    await setze('d1', async () => { await foto(p, '10-blatt-vorher'); const n = await p.$$eval('dialog.blatt .antw-vorher-liste li', (l) => l.length); pruef('Blatt zeigt Vorher-Liste', n === 1, n + ' Einträge'); await p.click('dialog.blatt [data-w=v0]'); });
    z = await zeileText('d1'); pruef('„Wieder nehmen“ setzt alte Antwort', /stimmt eher/.test(z) && !/^.*stimmt eher.*vorher: stimmt eher/.test(z), z);
    await setze('d3', async () => { await p.fill('#antw-feld', 'Ich höre erst auf den Bauch und prüfe dann.'); await foto(p, '11-blatt-text'); await p.click('dialog.blatt [data-w=ok]'); });
    z = await zeileText('d3'); pruef('Text setzen', /höre erst auf den Bauch/.test(z), z);
    await setze('d4', async () => { await p.fill('#antw-feld', '07:30'); await p.press('#antw-feld', 'Enter'); });
    z = await zeileText('d4'); pruef('Zeit setzen (Enter)', /07:30/.test(z), z);
    await setze('d5', async () => { await p.fill('#antw-feld', '7,5'); await p.click('dialog.blatt [data-w=ok]'); });
    z = await zeileText('d5'); pruef('Zahl setzen (Komma)', /7,5 Stunden/.test(z), z);
    await setze('d2', async () => { await p.click('dialog.blatt .antwort:nth-child(5)'); });
    await setze('d2', async () => { await p.click('dialog.blatt [data-w=loeschen]'); });
    z = await zeileText('d2'); pruef('Antwort löschen → noch offen', /noch offen/.test(z), z);
    const st = await p.$eval('.antw-teil[data-teil=muster] [data-stand]', (s) => s.textContent);
    pruef('Stand des Teils', st === '4 beantwortet · 1 noch offen', st);
    // Filter
    await p.click('#antw-offen'); await warte(p, 100);
    let sicht = await p.$$eval('[data-zeile]:not([hidden])', (l) => l.length);
    pruef('Nur offene', sicht === 1, sicht + ' sichtbar');
    await foto(p, '12-nur-offene');
    await p.click('#antw-offen'); await p.fill('#antw-suche', 'ratsel'); await warte(p, 300);
    sicht = await p.$$eval('[data-zeile]:not([hidden])', (l) => l.map((x) => x.innerText.split('\n')[0]));
    pruef('Suche (ohne Umlaut findet „Rätsel“)', sicht.length === 1 && /Rätsel/.test(sicht[0]), sicht.join(' | '));
    await p.fill('#antw-suche', 'gibtsnicht'); await warte(p, 300);
    const leer = await p.$eval('#antw-stand', (s) => s.textContent); pruef('Suche ohne Treffer: Hinweis', /Keine Antwort passt/.test(leer), leer);
    await p.fill('#antw-suche', ''); await warte(p, 300);
    // Speichern über Neuladen (mit Einwilligung)
    await p.evaluate(() => window.__ticke.speicher.setzeEinwilligung(true));
    await p.reload(); await p.waitForSelector('#inhalt h2');
    await geh(p, '#antworten/muster'); await p.waitForSelector('.antw-teil[data-teil=muster][open] .antw-zeile', { timeout: 6000 });
    const sp = await p.evaluate(() => { const t = document.querySelector('.antw-teil[data-teil=muster]'); const r = t.getBoundingClientRect(); return { offen: t.open, oben: Math.round(r.top), fokus: document.activeElement && document.activeElement.tagName, d1: document.querySelector('.antw-zeile[data-id=d1]').innerText.replace(/\s+/g, ' ') }; });
    pruef('#antworten/muster springt zum Teil (nach Neuladen, gespeichert)', sp.offen && sp.oben < 200 && /stimmt eher/.test(sp.d1), JSON.stringify(sp));
    await foto(p, '13-antworten-sprung');
    // Tastatur: Zeile per Enter öffnen, Escape schließt
    await p.focus('.antw-zeile[data-id=d2]'); await p.keyboard.press('Enter'); await p.waitForSelector('dialog.blatt');
    await p.keyboard.press('Escape'); await warte(p, 150);
    pruef('Tastatur: Blatt auf/zu', !(await p.$('dialog.blatt')));
  }
  // Startseite begonnen
  await p.evaluate(() => window.__ticke.setzeEinst({ einstieg: true })); await geh(p, '#start'); await warte(p, 200);
  const kb = await p.$$eval('.start-karten a', (a) => a.length);
  pruef('Start (begonnen): zwei Karten oben', kb === 2);
  await textPruef(p, 'Start begonnen'); await foto(p, '14-start-begonnen');
  await geh(p, '#fragen'); await textPruef(p, 'Fragen');
  const denk = await p.evaluate(() => [...document.querySelectorAll('#inhalt .zeile b')].map((b) => b.textContent));
  pruef('Fragen: Denkweise gelistet', denk.includes('Denkweise'), denk.join(', '));
  await geh(p, '#los'); await textPruef(p, 'Start-Fragebogen');
  await geh(p, '#einstellungen'); await textPruef(p, 'Einstellungen');
  await geh(p, '#einstieg'); await textPruef(p, 'Einstieg');
  await ctx.close();

  // ---------- 3. Alte Daten der Vorlage (Format 1) laden weiter ----------
  ({ ctx, p } = await seite(browser, { name: 'alt' }));
  await p.goto(BASIS + '?test=1'); await p.waitForSelector('#inhalt h2');
  await p.evaluate(() => {
    const jetzt = new Date().toISOString();
    localStorage.setItem('ticke.v1.kern', JSON.stringify({ format: 1, einwilligung: { an: true, zeit: jetzt }, einst: { alter: '18+', schrift: 1, einstieg: true } }));
    localStorage.setItem('ticke.v1.m.weg', JSON.stringify({ gesehen: { profil: jetzt }, aus: { text: jetzt } }));
    localStorage.setItem('ticke.v1.m.training', JSON.stringify({ tage: { '2026-11-22': ['atmen'], '2026-11-23': ['atmen'] } }));
    localStorage.setItem('ticke.v1.ergebnisse', JSON.stringify({ 'passt.wachstum': [{ schema: 1, titel: 'Mehr Ruhe finden', zeit: jetzt, version: '0.2.1' }] }));
  });
  await p.reload(); await p.waitForSelector('#inhalt h2'); await warte(p, 300);
  const alt = await p.evaluate(() => ({ an: window.__ticke.speicher.einwilligung(), zeilen: [...document.querySelectorAll('#inhalt .zeilen .zeile b')].map((b) => b.textContent) }));
  pruef('Vorlage-Daten laden (Einwilligung, Richtung, Training ohne Serie)', alt.an && alt.zeilen.some((t) => /Mehr Ruhe finden/.test(t)) && alt.zeilen.includes('Training'), alt.zeilen.join(' | '));
  await textPruef(p, 'Start mit Vorlage-Daten');
  await ctx.close();

  // ---------- 4. Quer (926×428) und dunkel ----------
  ({ ctx, p } = await seite(browser, { name: 'quer', viewport: { width: 926, height: 428 }, dunkel: true }));
  await p.goto(BASIS + '?test=1#profil'); await p.waitForSelector('#inhalt h2'); await warte(p, 400);
  u = await p.evaluate(() => { const l = document.getElementById('leiste').getBoundingClientRect(), ur = document.getElementById('unterreiter').getBoundingClientRect(), i = document.getElementById('inhalt').getBoundingClientRect(); return { leiste: [Math.round(l.width), Math.round(l.height)], unter: [Math.round(ur.left), Math.round(ur.top), Math.round(ur.height)], inhalt: [Math.round(i.left), Math.round(i.top)], hg: getComputedStyle(document.body).backgroundColor }; });
  q = await quer(p);
  pruef('Quer: Leiste links, Unterreiter über dem Inhalt, nichts quer', u.leiste[1] > 300 && u.unter[0] >= u.leiste[0] && u.unter[1] < u.inhalt[1] && q.doc <= 0 && q.inhalt <= 0, JSON.stringify({ u, q }));
  await foto(p, '15-quer-dunkel-profil');
  await geh(p, '#antworten'); await warte(p, 900); await foto(p, '16-quer-dunkel-antworten');
  q = await quer(p); pruef('Quer: #antworten nichts quer', q.doc <= 0 && q.inhalt <= 0, JSON.stringify(q));
  await geh(p, '#bausteine'); await warte(p, 200); await foto(p, '17-quer-dunkel-bausteine');
  await ctx.close();
  ({ ctx, p } = await seite(browser, { name: 'dunkel', dunkel: true }));
  await p.goto(BASIS + '?test=1#bausteine'); await p.waitForSelector('.richtung'); await foto(p, '18-dunkel-richtung');
  await geh(p, '#start'); await foto(p, '19-dunkel-start');
  await ctx.close();

  await browser.close();
  const bericht = { ok: ok.length, schlecht, fehler: [...new Set(fehler)] };
  console.log(ok.map((x) => '  ok  ' + x).join('\n'));
  console.log(schlecht.map((x) => 'FEHLT ' + x).join('\n'));
  console.log('Seitenfehler/console.error/HTTP:', bericht.fehler.length ? '\n' + bericht.fehler.join('\n') : 0);
  console.log(`== ${ok.length} ok, ${schlecht.length} nicht ok, ${bericht.fehler.length} Fehler`);
})().catch((e) => { console.error(e); process.exit(1); });
