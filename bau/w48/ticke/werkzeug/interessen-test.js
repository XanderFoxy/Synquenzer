// Test für module/interessen (Agent „interessen“). Aufruf: node interessen-test.js <portNeu> <portAlt>
// iPhone hochkant 428×926, Touch, Service Worker blockiert. Nur erfundene Testdaten.
const { chromium } = require('playwright');
const path = require('path');
const W = path.resolve(__dirname, '..');
const [PN, PA] = process.argv.slice(2);
const NEU = `http://127.0.0.1:${PN}/ticke/`, ALT = `http://127.0.0.1:${PA}/ticke/`;
const FOTO = path.join(W, 'fotos');
const OK = [], FEHL = [];
const pruef = (bed, text) => { (bed ? OK : FEHL).push(text); if (!bed) console.log('  FEHLT:', text); };

async function fenster(browser, { dunkel = false, ls = null } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 428, height: 926 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3,
    serviceWorkers: 'block', locale: 'de-DE', colorScheme: dunkel ? 'dark' : 'light' });
  if (ls) await ctx.addInitScript((d) => { if (!sessionStorage.getItem('gesetzt')) { for (const [k, v] of Object.entries(d)) localStorage.setItem(k, v); sessionStorage.setItem('gesetzt', '1'); } }, ls);
  const page = await ctx.newPage(), fehler = [];
  page.on('pageerror', (e) => fehler.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') fehler.push('console.error: ' + m.text()); });
  page.on('dialog', (d) => d.accept());
  return { ctx, page, fehler };
}
const warte = (ms) => new Promise((r) => setTimeout(r, ms));
async function geh(page, base, hash) { await page.goto(base + '#' + hash); await page.waitForFunction(() => { const el = document.getElementById('inhalt'); return el && el.querySelector('h2'); }, null, { timeout: 15000 }); await warte(150); }
async function gehHash(page, hash) { await page.evaluate((h) => { location.hash = h; }, hash); await warte(400); await page.waitForFunction(() => document.querySelector('#inhalt h2'), null, { timeout: 15000 }); }

// Fragebogen durchgehen. wertFuer(text) → 1..5. tippen=true: echte Touch-Tipps (wartet auf data-bereit), sonst Ziffern-Tasten.
async function bogen(page, wertFuer, { tippen = false, max = 60 } = {}) {
  let n = 0, letzter = '';
  while (n < max) {
    const ist = await page.evaluate(() => !!document.querySelector('#inhalt .frage'));
    if (!ist) break;
    const text = await page.$eval('#fb-text', (h) => h.textContent.trim());
    if (text === letzter) { await warte(60); continue; }
    const w = wertFuer(text);
    if (tippen) {
      await page.waitForSelector('#inhalt .frage[data-bereit="1"]', { timeout: 5000 });
      await page.tap(`#inhalt .antwort[data-wert="${w}"]`);
    } else {
      const k = await page.$$eval('#inhalt .antwort', (bs, w) => bs.findIndex((b) => b.dataset.wert === String(w)), w);
      await page.keyboard.press(String(k + 1));
    }
    letzter = text; n++;
    await page.waitForFunction((t) => { const h = document.querySelector('#fb-text'); return !h || h.textContent.trim() !== t; }, text, { timeout: 5000 }).catch(() => {});
  }
  await warte(300);
  return n;
}
// Prüft eine Ergebnis-Seite auf Bewertungs-Reste. Gibt Text-Schnipsel mit Ziffern zurück (zum Ansehen).
async function ohneWertung(page, name) {
  const r = await page.evaluate(() => {
    const el = document.getElementById('inhalt'), t = el.innerText;
    return { band: el.querySelectorAll('.band, .band-spur, [role=progressbar]').length, breite: document.documentElement.scrollWidth,
      ziffern: t.split('\n').filter((z) => /\d/.test(z)).map((z) => z.trim()).filter(Boolean),
      extern: [...document.querySelectorAll('#inhalt a[href]')].map((a) => a.getAttribute('href')).filter((h) => /^https?:|^\/\//.test(h)),
      blank: document.querySelectorAll('#inhalt [target=_blank]').length,
      klein: [...el.querySelectorAll('button, a.knopf, a.zeile, .chip, .antwort')].filter((b) => { const q = b.getBoundingClientRect(); return q.width && q.height < 44; }).map((b) => b.textContent.trim().slice(0, 30)),
      boese: (t.match(/\d+\s?%|Platz \d|\bPunkte?\b|von 100|Perzentil|überdurchschnittlich|unterdurchschnittlich|Typ-Prozent|\bRang\b/g) || []) };
  });
  pruef(r.band === 0, `${name}: kein Balken/Band/Messleiste (${r.band})`);
  pruef(r.breite <= 428, `${name}: nichts läuft quer über (${r.breite}px)`);
  pruef(r.extern.length === 0 && r.blank === 0, `${name}: keine Links nach draußen (${r.extern.join(' ')})`);
  pruef(r.boese.length === 0, `${name}: keine Prozente/Plätze/Punkte (${r.boese.join(', ')})`);
  pruef(r.klein.length === 0, `${name}: Tippflächen ≥ 44 px (${r.klein.join(' | ')})`);
  return r.ziffern;
}

const EHRL_FAIR = (D) => (text) => { const f = D.EHRLICHKEIT.find((x) => x.text === text); return f.u ? 2 : 4; };
const RIASEC_W = { A: 5, I: 4, S: 4, R: 2, E: 3, C: 1 };
const riasecWert = (D, plan = RIASEC_W) => (text) => { const f = D.RIASEC.find((x) => x.text === text); return plan[f.typ]; };

async function rhythmusEingeben(page, base) {
  await geh(page, base, 'fragen/interessen/rhythmus/eingabe');
  await page.tap('[data-gruppe="tage"][data-wert="5"]'); await warte(150);
  await page.fill('[data-feld="arbeitEin"]', '23:30'); await page.fill('[data-feld="arbeitAuf"]', '06:45');
  await page.fill('[data-feld="freiEin"]', '01:30'); await page.fill('[data-feld="freiAuf"]', '10:00');
  await page.tap('[data-gruppe="weckerFrei"][data-wert="false"]'); await warte(150);
  await page.tap('[data-gruppe="selbst"][data-wert="\\"abend\\""]'); await warte(150);
  await page.tap('[data-ia="auswerten"]'); await warte(500);
}
async function alleDrei(page, base, D) {
  await geh(page, base, 'fragen/interessen/ehrlichkeit');
  await page.tap('[data-ia="start"]'); await warte(400);
  const n1 = await bogen(page, EHRL_FAIR(D), { tippen: true });
  await geh(page, base, 'fragen/interessen/riasec');
  await page.tap('[data-ia="start"]'); await warte(400);
  const n2 = await bogen(page, riasecWert(D));
  await rhythmusEingeben(page, base);
  return [n1, n2];
}
const K = () => import('./kern.js').then((m) => m.kern);

(async () => {
  const D = await import(path.join(W, 'neu/ticke/module/interessen/daten.js'));
  const browser = await chromium.launch();
  const alleFehler = [];
  try {
    // ------------------------------------------------------------ 1. Frisch: alle drei Teile ausfüllen, Ergebnis ansehen
    console.log('1. frisch ausfüllen');
    const A = await fenster(browser);
    const { page } = A;
    await geh(page, NEU, 'fragen/interessen');
    const [n1, n2] = await alleDrei(page, NEU, D);
    pruef(n1 === 12, `Ehrlichkeit: 12 Fragen per Touch beantwortet (${n1})`);
    pruef(n2 === 24, `Interessen: 24 Fragen beantwortet (${n2})`);
    const ziffern = {};
    await geh(page, NEU, 'fragen/interessen/ehrlichkeit');
    const tE = await page.$eval('#inhalt', (e) => e.innerText);
    pruef(/leicht in Richtung fair und bescheiden/.test(tE), 'Ehrlichkeit: Richtung in Worten „leicht in Richtung fair und bescheiden“');
    pruef((await page.$$('#inhalt .ia-pol')).length === 2 && (await page.$$('#inhalt .ia-pol.an')).length === 1, 'Ehrlichkeit: zwei gleichwertige Pole, einer markiert');
    pruef(/Strategisch und statusbewusst/.test(tE) && /Fair und bescheiden/.test(tE), 'Ehrlichkeit: beide Pole mit Stärken beschrieben');
    pruef(!/genauerer Blick/.test(tE), 'Ehrlichkeit: keine Warn-Karte für eine Seite mehr');
    ziffern.ehrlichkeit = await ohneWertung(page, 'Ehrlichkeit-Ergebnis');
    await page.screenshot({ path: path.join(FOTO, 'interessen-ehrlichkeit.png'), fullPage: true });
    await geh(page, NEU, 'fragen/interessen/riasec');
    const tR = await page.$eval('#inhalt', (e) => e.innerText);
    pruef(/Was dich anzieht/.test(tR) && /Künstlerisch-gestaltend/.test(tR), 'Interessen: „Was dich anzieht“ mit Bereichen in Worten');
    const reihe = await page.$$eval('#inhalt .ia-bereiche b', (bs) => bs.map((b) => b.textContent));
    pruef(reihe.length === 6 && reihe[0] === 'Künstlerisch-gestaltend' && reihe[5] === 'Ordnend', `Interessen: Reihenfolge bleibt, ohne Zahlen (${reihe.join(', ')})`);
    pruef((await page.$$('#inhalt .ia-hex-name')).every ? !(await page.$$eval('#inhalt .ia-hex-name', (t) => t.some((x) => /\d/.test(x.textContent)))) : true, 'Interessen: Sechseck ohne Platz-Zahlen');
    pruef(/Zwischen|Dinge oder Menschen/.test(tR) && (await page.$$('#inhalt .ia-pole')).length === 2, 'Interessen: zwei Achsen (Dinge/Menschen, Daten/Ideen) als Pole');
    ziffern.riasec = await ohneWertung(page, 'Interessen-Ergebnis');
    await page.screenshot({ path: path.join(FOTO, 'interessen-riasec.png'), fullPage: true });
    await geh(page, NEU, 'fragen/interessen/rhythmus');
    const tY = await page.$eval('#inhalt', (e) => e.innerText);
    pruef(/Deine innere Uhr geht (leicht|klar) in Richtung spät/.test(tY), 'Rhythmus: Richtung „in Richtung spät“ in Worten');
    pruef(/einschlafen 23:30 Uhr, aufwachen 06:45 Uhr/.test(tY) && /einschlafen 01:30 Uhr, aufwachen 10:00 Uhr/.test(tY), 'Rhythmus: seine eingegebenen Uhrzeiten stehen als seine Angaben');
    pruef(!/Schlafmitte an freien Tagen: |Std\. \d+ Min|Typ\b|Abendtyp|Morgentyp/.test(tY), 'Rhythmus: keine errechnete Schlafmitte/Dauer-Zahl, kein Typ-Etikett');
    ziffern.rhythmus = await ohneWertung(page, 'Rhythmus-Ergebnis');
    await page.screenshot({ path: path.join(FOTO, 'interessen-rhythmus.png'), fullPage: true });
    console.log('  Ziffern zur Durchsicht:', JSON.stringify(ziffern, null, 1));

    // ------------------------------------------------------------ 2. Vertrag: antwortListe / muster / aeste / antwortSetzen
    console.log('2. Vertrag');
    const v = await page.evaluate(async () => {
      const k = (await import('./kern.js')).kern, M = await import('./module/interessen/modul.js');
      const L = M.antwortListe(k), mu = M.muster(k), ae = M.aeste();
      return { n: L.length, offen: L.filter((x) => x.wert === null).length, gruppen: [...new Set(L.map((x) => x.gruppe))], bsp: L[0], zeit: L.find((x) => x.art === 'zeit'),
        felder: L.every((x) => typeof x.id === 'string' && x.gruppe && x.frage && ['wahl', 'text', 'zahl', 'zeit'].includes(x.art) && typeof x.anzeige === 'string' && (x.wert === null) === (x.anzeige === '') && typeof x.route === 'string' && Array.isArray(x.vorher)),
        ids: new Set(L.map((x) => x.id)).size === L.length,
        mu, ae: ae.map((a) => ({ id: a.id, bereich: a.bereich, s: (a.wasEsIst.match(/[.!?](\s|$)/g) || []).length,
          listen: ['imAlltag', 'staerken', 'reibung', 'weiterdenken'].map((f) => a[f].length), wissen: typeof a.wissen === 'string' && !/http|www\./.test(a.wissen),
          verwandt: a.verwandt, ueben: (a.ueben || []).map((u) => u.route), pole: a.pole ? a.pole.length : 0 })) };
    });
    pruef(v.n === 43 && v.offen === 0, `antwortListe: 43 Antworten (12+24+7), alle beantwortet (${v.n}, offen ${v.offen})`);
    pruef(v.felder && v.ids, 'antwortListe: alle Felder nach Vertrag, IDs eindeutig');
    console.log('  Gruppen:', v.gruppen.join(' | '));
    console.log('  Beispiel:', JSON.stringify(v.bsp).slice(0, 300));
    console.log('  Zeit:', JSON.stringify(v.zeit));
    pruef(v.mu.length === 9, `muster: 9 Einträge (Ehrlichkeit, Sechseck, 6 Bereiche, Rhythmus) – ${v.mu.length}`);
    pruef(v.mu.every((m) => /^interessen\./.test(m.ast) && m.titel && m.richtung && ['klar', 'leicht', 'beides'].includes(m.deutlich) && m.woher), 'muster: Felder nach Vertrag');
    pruef(v.mu.every((m) => !/\d/.test(m.richtung)), 'muster: Richtung ohne Zahl');
    for (const m of v.mu) console.log(`  [${m.deutlich}] ${m.ast}: ${m.richtung} — ${m.woher}`);
    const aeIds = v.ae.map((a) => a.id);
    pruef(aeIds.length === 9 && ['interessen.ehrlichkeit', 'interessen.rhythmus', 'interessen.riasec', ...'RIASEC'.split('').map((t) => 'interessen.' + t)].every((i) => aeIds.includes(i)), `aeste: 9 Äste (${aeIds.join(', ')})`);
    pruef(v.ae.every((a) => a.s >= 3 && a.s <= 6), `aeste: wasEsIst 3–6 Sätze (${v.ae.map((a) => a.s).join(',')})`);
    pruef(v.ae.every((a) => a.listen.every((n) => n >= 3 && n <= 6)), `aeste: Listen 3–6 Punkte (${v.ae.map((a) => a.listen.join('/')).join(' ')})`);
    pruef(v.ae.every((a) => a.wissen), 'aeste: wissen als reiner Text ohne Link');
    pruef(v.mu.every((m) => aeIds.includes(m.ast)), 'muster: jeder Eintrag zeigt auf einen vorhandenen Ast');
    const uebRouten = [...new Set(v.ae.flatMap((a) => a.ueben))];
    console.log('  ueben-Routen:', uebRouten.join(' '));

    // Antworten ändern → Ergebnis rechnet sofort neu, vorher-Liste, Verlauf bleibt gleich lang
    const c = await page.evaluate(async () => {
      const k = (await import('./kern.js')).kern, M = await import('./module/interessen/modul.js'), S = k.speicher, D = await import('./module/interessen/daten.js');
      const r = (a) => M.muster(k).find((m) => m.ast === a);
      const vE = S.verlauf('interessen.ehrlichkeit').length, vR = S.verlauf('interessen.riasec').length, vY = S.verlauf('interessen.rhythmus').length;
      const e0 = r('interessen.ehrlichkeit').richtung;
      for (const f of D.EHRLICHKEIT) await M.antwortSetzen(k, 'ehrlichkeit.' + f.id, f.u ? 5 : 1);
      const e1 = r('interessen.ehrlichkeit').richtung;
      const r0 = r('interessen.riasec').richtung;
      for (const f of D.RIASEC.filter((x) => x.k && x.typ === 'C')) await M.antwortSetzen(k, 'riasec.' + f.id, 5);
      for (const f of D.RIASEC.filter((x) => x.k && x.typ === 'A')) await M.antwortSetzen(k, 'riasec.' + f.id, 1);
      const r1 = r('interessen.riasec').richtung, c1 = r('interessen.C').richtung;
      const y0 = r('interessen.rhythmus').richtung;
      const y1res = await M.antwortSetzen(k, 'rhythmus.freiEin', '21:30'); await M.antwortSetzen(k, 'rhythmus.freiAuf', '05:30');
      await M.antwortSetzen(k, 'rhythmus.arbeitEin', '21:30'); await M.antwortSetzen(k, 'rhythmus.arbeitAuf', '05:00');
      const y1 = r('interessen.rhythmus').richtung;
      // Mehrfach ändern: vorher höchstens 5
      for (const w of [1, 2, 3, 4, 5, 1, 2]) await M.antwortSetzen(k, 'ehrlichkeit.h1', w);
      const h1 = M.antwortListe(k).find((x) => x.id === 'ehrlichkeit.h1');
      const falsch = [await M.antwortSetzen(k, 'ehrlichkeit.h1', 9), await M.antwortSetzen(k, 'gibts.nicht', 1), await M.antwortSetzen(k, 'rhythmus.freiEin', '25:99'), await M.antwortSetzen(k, 'rhythmus.selbst', 'quatsch')];
      const del = await M.antwortSetzen(k, 'ehrlichkeit.h4', null);
      const h4 = M.antwortListe(k).find((x) => x.id === 'ehrlichkeit.h4');
      const tageAenderung = await M.antwortSetzen(k, 'rhythmus.tage', '7');
      const nachTage = M.antwortListe(k).filter((x) => x.gruppe === 'Tagesrhythmus').map((x) => x.id);
      await M.antwortSetzen(k, 'rhythmus.tage', 5);
      const passt = S.ergebnis('interessen.riasec'), ehr = S.ergebnis('interessen.ehrlichkeit');
      return { e0, e1, r0, r1, c1, y0, y1, y1res, h1v: h1.vorher, h1w: h1.wert, h1a: h1.anzeige, falsch, del, h4: { wert: h4.wert, anzeige: h4.anzeige, vorher: h4.vorher.length },
        verlauf: [vE, vR, vY, S.verlauf('interessen.ehrlichkeit').length, S.verlauf('interessen.riasec').length, S.verlauf('interessen.rhythmus').length],
        tageAenderung, nachTage, format: { riasec: typeof passt.typen.R.wert === 'number' && Array.isArray(passt.top) && typeof passt.typen.R.stufe === 'number', ehr: typeof ehr.wert === 'number' && !!ehr.facetten } };
    });
    console.log('  Ehrlichkeit vorher/nachher:', c.e0, '→', c.e1);
    console.log('  Interessen vorher/nachher:', c.r0, '→', c.r1, '|', c.c1);
    console.log('  Rhythmus vorher/nachher:', c.y0, '→', c.y1, JSON.stringify(c.y1res));
    pruef(c.e0 !== c.e1 && /strategisch/.test(c.e1), 'antwortSetzen: Ehrlichkeit-Richtung ändert sich sofort');
    pruef(c.r0 !== c.r1 && /Ordnend/.test(c.r1), 'antwortSetzen: Interessen-Muster ändert sich sofort');
    pruef(c.y0 !== c.y1 && /früh/.test(c.y1), 'antwortSetzen: Rhythmus-Richtung ändert sich sofort');
    pruef(c.h1v.length === 5 && c.h1v.every((x) => 'wert' in x && x.anzeige && x.zeit), `vorher: höchstens 5 je Frage, mit wert/anzeige/zeit (${c.h1v.length}: ${c.h1v.map((x) => x.wert).join(',')}; jetzt ${c.h1w} „${c.h1a}“)`);
    pruef(c.falsch.every((x) => x.ok === false && x.fehler), 'antwortSetzen: ungültige Werte/IDs werden abgelehnt');
    pruef(c.del.ok && c.h4.wert === null && c.h4.anzeige === '' && c.h4.vorher >= 1, 'antwortSetzen(null) löscht die Antwort, alte bleibt bei vorher');
    pruef(c.verlauf[0] === c.verlauf[3] && c.verlauf[1] === c.verlauf[4] && c.verlauf[2] === c.verlauf[5], `Korrektur ersetzt das Ergebnis, Verlauf wächst nicht (${c.verlauf.join(',')})`);
    pruef(!c.nachTage.includes('rhythmus.freiEin') && c.nachTage.includes('rhythmus.arbeitEin'), `antwortListe: Rhythmus zeigt nur passende Fragen (tage=7: ${c.nachTage.join(',')})`);
    pruef(c.format.riasec && c.format.ehr, 'Ergebnis-Format für andere Module unverändert (typen.wert, stufe, top, facetten)');
    // Ergebnis-Seiten nach der Änderung
    await geh(page, NEU, 'fragen/interessen/ehrlichkeit');
    pruef(/in Richtung strategisch und statusbewusst/.test(await page.$eval('#inhalt', (e) => e.innerText)), 'Ehrlichkeit-Seite zeigt nach Änderung die neue Richtung');
    await geh(page, NEU, 'fragen/interessen/riasec');
    pruef(/Am meisten ziehen dich an: Ordnend/.test(await page.$eval('#inhalt', (e) => e.innerText)), 'Interessen-Seite zeigt nach Änderung das neue Muster');

    // Korrektur im Fragebogen selbst (?frage=…): Antwort ändern → sofort neu, vorher gemerkt
    await geh(page, NEU, 'fragen/interessen/ehrlichkeit/bogen?frage=h5');
    const kopf = await page.$eval('#inhalt .frage-kopf', (e) => e.innerText);
    pruef(/Antworten ändern/.test(kopf) && /Frage 6 von 12/.test(kopf), `Fragebogen öffnet zum Ändern direkt bei der Frage (${kopf.replace(/\n/g, ' ')})`);
    await page.waitForSelector('#inhalt .frage[data-bereit="1"]'); await page.tap('#inhalt .antwort[data-wert="5"]'); await warte(500);
    const h5 = await page.evaluate(async () => { const k = (await import('./kern.js')).kern, M = await import('./module/interessen/modul.js'); return M.antwortListe(k).find((x) => x.id === 'ehrlichkeit.h5'); });
    pruef(h5.wert === 5 && h5.vorher.length >= 1, `Fragebogen-Korrektur: neuer Wert gespeichert, alter bei vorher (${h5.wert}, vorher ${h5.vorher.map((x) => x.wert)})`);

    // Rhythmus: „Zeiten ändern“ → vorher, ersetzt
    await geh(page, NEU, 'fragen/interessen/rhythmus/eingabe');
    await page.fill('[data-feld="freiEin"]', '02:30'); await page.tap('[data-ia="auswerten"]'); await warte(500);
    const yv = await page.evaluate(async () => { const k = (await import('./kern.js')).kern, M = await import('./module/interessen/modul.js'); const x = M.antwortListe(k).find((q) => q.id === 'rhythmus.freiEin'); return { w: x.wert, v: x.vorher.map((q) => q.anzeige), n: k.speicher.verlauf('interessen.rhythmus').length }; });
    pruef(yv.w === '02:30' && yv.v[0] === '21:30 Uhr' && yv.n === c.verlauf[5], `Rhythmus „Zeiten ändern“: vorher gemerkt, Ergebnis ersetzt (${JSON.stringify(yv)})`);
    await page.screenshot({ path: path.join(FOTO, 'interessen-rhythmus-geaendert.png'), fullPage: false });
    alleFehler.push(...A.fehler.map((f) => 'frisch: ' + f));
    await A.ctx.close();

    // ------------------------------------------------------------ 3. Dunkel + Übersicht
    console.log('3. dunkel');
    const Dk = await fenster(browser, { dunkel: true });
    await geh(Dk.page, NEU, 'fragen/interessen');
    await alleDrei(Dk.page, NEU, D);
    await geh(Dk.page, NEU, 'fragen/interessen/ehrlichkeit');
    await Dk.page.screenshot({ path: path.join(FOTO, 'interessen-ehrlichkeit-dunkel.png'), fullPage: false });
    await geh(Dk.page, NEU, 'fragen/interessen/riasec');
    await Dk.page.evaluate(() => document.querySelector('.ia-pole').scrollIntoView());
    await Dk.page.screenshot({ path: path.join(FOTO, 'interessen-achsen-dunkel.png'), fullPage: false });
    await geh(Dk.page, NEU, 'fragen/interessen');
    pruef(/Antworten ansehen und ändern/.test(await Dk.page.$eval('#inhalt', (e) => e.innerText)), 'Übersicht: Weg zu „Antworten ansehen und ändern“');
    alleFehler.push(...Dk.fehler.map((f) => 'dunkel: ' + f));
    await Dk.ctx.close();

    // ------------------------------------------------------------ 4. Alte Daten der Vorlage 0.2.1
    console.log('4. alte Daten (Vorlage 0.2.1)');
    const Al = await fenster(browser);
    await geh(Al.page, ALT, 'fragen/interessen');
    await Al.page.evaluate(async () => { (await import('./kern.js')).kern.speicher.setzeEinwilligung(true); });
    await alleDrei(Al.page, ALT, D);
    // Alter Stand: dazu noch „Genauer machen“ angefangen (halb), damit auch ein laufender Zwischenstand mitkommt
    await geh(Al.page, ALT, 'fragen/interessen/riasec');
    await Al.page.tap('[data-ia="genauer"]'); await warte(400);
    let gn = 0; while (gn < 6) { const t = await Al.page.$eval('#fb-text', (h) => h.textContent.trim()); await Al.page.keyboard.press(String(riasecWert(D)(t))); gn++; await Al.page.waitForFunction((x) => document.querySelector('#fb-text').textContent.trim() !== x, t); }
    const altLS = await Al.page.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter((k) => k.startsWith('ticke.')).map((k) => [k, localStorage.getItem(k)])));
    require('fs').writeFileSync(path.join(__dirname, 'interessen-altdaten.json'), JSON.stringify(altLS, null, 1));
    pruef(Object.keys(altLS).length >= 2, `Vorlage: Daten im localStorage (${Object.keys(altLS).join(', ')})`);
    alleFehler.push(...Al.fehler.map((f) => 'vorlage: ' + f));
    await Al.ctx.close();

    const N = await fenster(browser, { ls: altLS });
    await geh(N.page, NEU, 'fragen/interessen/ehrlichkeit');
    const aE = await N.page.$eval('#inhalt', (e) => e.innerText);
    pruef(/leicht in Richtung fair und bescheiden/.test(aE), 'alte Daten: Ehrlichkeit lädt und zeigt Richtung');
    await ohneWertung(N.page, 'alte Daten Ehrlichkeit');
    await geh(N.page, NEU, 'fragen/interessen/riasec');
    const aR = await N.page.$eval('#inhalt', (e) => e.innerText);
    pruef(/Am meisten ziehen dich an: Künstlerisch-gestaltend/.test(aR) && /Genauer machen – weiter \(6 von 24\)/.test(aR), 'alte Daten: Interessen laden, angefangenes „Genauer“ läuft weiter (6 von 24)');
    await ohneWertung(N.page, 'alte Daten Interessen');
    await geh(N.page, NEU, 'fragen/interessen/rhythmus');
    const aY = await N.page.$eval('#inhalt', (e) => e.innerText);
    pruef(/in Richtung spät/.test(aY) && /einschlafen 23:30 Uhr, aufwachen 6:45 Uhr/.test(aY), 'alte Daten: Rhythmus lädt, Angaben aus altem Ergebnis zurückgerechnet');
    await ohneWertung(N.page, 'alte Daten Rhythmus');
    const aV = await N.page.evaluate(async () => {
      const k = (await import('./kern.js')).kern, M = await import('./module/interessen/modul.js');
      const L = M.antwortListe(k), mu = M.muster(k);
      const r0 = mu.find((m) => m.ast === 'interessen.A').richtung;
      const res = await M.antwortSetzen(k, 'riasec.a2', 1);
      const r1 = M.muster(k).find((m) => m.ast === 'interessen.A').richtung;
      const rest = L.filter((x) => /^riasec\./.test(x.id)).length;
      return { n: L.length, offen: L.filter((x) => x.wert === null).length, rest, mu: mu.length, r0, r1, res, gespeichert: !!localStorage.getItem('ticke.v1.m.interessen') && JSON.parse(localStorage.getItem('ticke.v1.m.interessen')).vorher };
    });
    console.log('  alte Daten Vertrag:', JSON.stringify(aV).slice(0, 400));
    pruef(aV.mu === 9 && aV.rest === 48 && aV.offen === 18, `alte Daten: muster 9, antwortListe mit allen 48 Interessen-Fragen (18 offen von „Genauer“) – ${aV.mu}/${aV.rest}/${aV.offen}`);
    pruef(aV.res.ok && !!aV.gespeichert, 'alte Daten: Antwort ändern klappt und wird (mit Einwilligung) gespeichert');
    alleFehler.push(...N.fehler.map((f) => 'altdaten: ' + f));
    // Andere Module, die diese Ergebnisse lesen, laden noch (nur Hinweis – fremde Dateien)
    for (const r of ['profil', 'passt', 'training']) { await geh(N.page, NEU, r).catch(() => {}); }
    const fremd = N.fehler.length - alleFehler.filter((f) => f.startsWith('altdaten')).length;
    console.log('  Fehler beim Öffnen von profil/passt/training:', fremd, N.fehler.slice(-3));
    await N.ctx.close();
  } catch (e) { FEHL.push('Testabbruch: ' + (e.stack || e)); console.log(e); }
  await browser.close();
  console.log('\nSeitenfehler/console.error:', alleFehler.length); alleFehler.forEach((f) => console.log('  ' + f));
  console.log(`\nERGEBNIS: ${OK.length} ok, ${FEHL.length} fehlgeschlagen`); FEHL.forEach((f) => console.log('  ✗ ' + f));
  process.exit(FEHL.length || alleFehler.length ? 1 : 0);
})();
