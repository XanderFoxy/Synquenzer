// Test „Entweder – oder“ 0.3 in der App (Arbeitskopie neu/ticke): wählen, Muster, Wahlen ändern, Schnittstelle, alte Daten, quer.
// Nur erfundene Wahlen. Service Worker blockiert.
const { chromium } = require('playwright');
const fs = require('fs');
const PORT = process.argv[2] || '8956';
const W = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/ticke-w';
const FOTO = W + '/fotos/';
const ALT = JSON.parse(fs.readFileSync(W + '/werkzeug/spiel/alt-daten.json', 'utf8'));
const U = (h, q = 'test=1&saat=5') => `http://127.0.0.1:${PORT}/ticke/?${q}#${h}`;
const KERN = JSON.stringify({ format: 1, einwilligung: { an: true, zeit: '2026-11-20T10:00:00.000Z' }, einst: { alter: null, schrift: 1, einstieg: true } });
let fehlerZahl = 0, pruef = 0;
const ok = (b, t) => { pruef++; if (!b) { fehlerZahl++; console.log('  FEHLER:', t); } else console.log('  ok:', t); };
// Wörter/Zeichen, die eine Bewertung wären (auf den sichtbaren Seiten des Moduls)
const VERBOTEN = /(\d+\s?%|Prozent|Punkte|Sterne|Abzeichen|Level|Bonus|richtig!|falsch|Erwischt|Hoppla|Adlerauge|Aussagekraft|fraglich|überdurchschnittlich|unterdurchschnittlich|Rang|Wahrscheinlichkeit)/i;
async function neu(b, opt = {}) {
  const ctx = await b.newContext({ viewport: { width: 428, height: 926 }, hasTouch: true, isMobile: true, serviceWorkers: 'block', reducedMotion: 'reduce', deviceScaleFactor: 2, ...opt });
  const page = await ctx.newPage();
  page.fehler = [];
  page.on('pageerror', (e) => page.fehler.push('pageerror: ' + e));
  page.on('console', (m) => { if (m.type() === 'error') page.fehler.push('console: ' + m.text()); });
  return { ctx, page };
}
const text = (page) => page.evaluate(() => document.getElementById('inhalt').innerText);
const quer = (page) => page.evaluate(() => { const d = document.documentElement; const zuBreit = [...document.querySelectorAll('#inhalt *')].filter((x) => { const r = x.getBoundingClientRect(); return r.right > innerWidth + 1 && r.width > 0; }).map((x) => x.className || x.tagName).slice(0, 5); return { sw: d.scrollWidth, iw: innerWidth, inhaltSW: document.getElementById('inhalt').scrollWidth, inhaltCW: document.getElementById('inhalt').clientWidth, zuBreit }; });
const kleineTippflaechen = (page, sel) => page.evaluate((s) => [...document.querySelectorAll(s)].filter((x) => { const r = x.getBoundingClientRect(); return r.width > 0 && (r.height < 43.5 || r.width < 43.5); }).map((x) => x.textContent.trim().slice(0, 30) + ' ' + Math.round(x.getBoundingClientRect().height)), sel);
async function waehleBis(page, n, seite = (i) => (i % 3 ? '.sp-links' : '.sp-rechts')) {
  for (let i = 0; i < n; i++) {
    await page.waitForSelector('.sp-paar[data-bereit="1"]', { timeout: 6000 });
    await page.click(seite(i));
    await page.waitForFunction(() => !document.querySelector('.sp-paar[data-bereit="1"]') || document.querySelector('.sp-ende'), null, { timeout: 3000 }).catch(() => {});
  }
}

(async () => {
  const b = await chromium.launch();
  const zeiten = {};

  console.log('1) Neu: wählen bis zum Muster');
  {
    const { ctx, page } = await neu(b);
    await ctx.addInitScript((k) => { if (!sessionStorage.getItem('x')) { sessionStorage.setItem('x', '1'); localStorage.clear(); localStorage.setItem('ticke.v1.kern', k); } }, KERN);
    let t0 = Date.now();
    await page.goto(U('spiel'));
    await page.waitForSelector('.sp-held');
    zeiten.uebersicht = Date.now() - t0;
    const tu = await text(page);
    ok(!VERBOTEN.test(tu), 'Übersicht ohne Bewertungs-Wörter' + (VERBOTEN.test(tu) ? ' → ' + tu.match(VERBOTEN)[0] : ''));
    ok(/Schnelle Wahl zwischen zwei Möglichkeiten/.test(tu) && /Anfangen/.test(tu), 'Übersicht: ruhiger Text + „Anfangen“');
    await page.screenshot({ path: FOTO + 'spiel-1-uebersicht.png', fullPage: false });
    await page.click('a[href="#spiel/runde"]');
    await page.waitForSelector('.sp-paar[data-bereit="1"]');
    let tr = await text(page);
    ok(/Wahl 1 von 40/.test(tr) && /Teil 1 von 4/.test(tr), 'Fortschritt „Wahl 1 von 40“, „Teil 1 von 4“');
    ok(!VERBOTEN.test(tr), 'Wählen ohne Bewertungs-Wörter');
    ok((await kleineTippflaechen(page, '.sp-wahl,.sp-unten .knopf,.sp-merk')).length === 0, 'Tippflächen ≥ 44 px beim Wählen');
    await page.screenshot({ path: FOTO + 'spiel-2-waehlen.png' });
    await waehleBis(page, 3);
    // Eine zurück → bisherige Wahl markiert → „So lassen“
    await page.waitForSelector('.sp-paar[data-bereit="1"]');
    await page.click('[data-sp=zurueck]');
    await page.waitForSelector('.sp-bisher');
    tr = await text(page);
    ok(/Wahl 3 von 40/.test(tr) && /bisher/.test(tr) && /So lassen/.test(tr), 'Eine zurück zeigt Wahl 3 mit „bisher“ und „So lassen“');
    await page.screenshot({ path: FOTO + 'spiel-3-zurueck.png' });
    // umwählen auf die andere Seite
    await page.waitForSelector('.sp-paar[data-bereit="1"]');
    const vorher3 = await page.evaluate(() => window.__spiel.lauf().antworten[window.__spiel.ABLAUF[2].id].w);
    await page.click('.sp-wahl:not(.sp-bisher)');
    await page.waitForFunction(() => /Wahl 4 von 40/.test(document.getElementById('inhalt').innerText));
    const l3 = await page.evaluate(() => { const l = window.__spiel.lauf(), id = window.__spiel.ABLAUF[2].id; return { w: l.antworten[id].w, vorher: l.vorher[id] }; });
    ok(l3.w !== vorher3 && l3.vorher && l3.vorher.length === 1 && l3.vorher[0].w === vorher3, 'Zurück und umwählen: neue Wahl gespeichert, alte als „vorher“');
    t0 = Date.now();
    await waehleBis(page, 36);
    zeiten.waehlenJe = Math.round((Date.now() - t0) / 36);
    await page.waitForSelector('.sp-ende');
    const te = await text(page);
    ok(/Alle 40 Wahlen sind da/.test(te) && /Tätigkeiten wählen/.test(te), 'Fertig-Seite mit freiwilligen Tätigkeiten');
    ok(!VERBOTEN.test(te), 'Fertig-Seite ohne Bewertungs-Wörter' + (VERBOTEN.test(te) ? ' → ' + te.match(VERBOTEN)[0] : ''));
    await page.screenshot({ path: FOTO + 'spiel-4-fertig.png' });
    const erg1 = await page.evaluate(() => window.__ticke.speicher.ergebnis('spiel'));
    ok(erg1 && erg1.schema === 2 && erg1.bereiche && Object.keys(erg1.bereiche).length === 5, 'Ergebnis gespeichert (schema 2, 5 Richtungen)');
    ok(!/pOben|unten|oben|punkte|abzeichen|urteil|"t":/.test(JSON.stringify(erg1)), 'Gespeichertes Ergebnis ohne Mess-Zahlen/Punkte');
    await page.click('[data-sp=duelle]');
    await waehleBis(page, 15, (i) => (i % 2 ? '.sp-links' : '.sp-rechts'));
    await page.waitForFunction(() => location.hash === '#spiel/ergebnis', null, { timeout: 5000 });
    await page.waitForSelector('.sp-ri');
    const tm = await text(page);
    ok(!VERBOTEN.test(tm), 'Muster-Seite ohne Bewertungs-Wörter' + (VERBOTEN.test(tm) ? ' → ' + tm.match(VERBOTEN)[0] : ''));
    ok((await page.$$('.sp-ri')).length === 6, 'Muster: 5 Richtungen + Tätigkeiten');
    ok(/(Klar|Leicht) in Richtung|Beides gehört zu dir/.test(tm), 'Richtungen in Worten');
    const zahlen = (tm.match(/\d+/g) || []);
    ok(zahlen.length <= 6, 'Muster-Seite fast ohne Ziffern (nur Hilfe-Nummern): ' + zahlen.join(','));
    ok((await page.$$('a[href^="#muster/ast/spiel."]')).length === 6, 'Links zu den Ästen (#muster/ast/spiel.…)');
    await page.screenshot({ path: FOTO + 'spiel-5-muster.png', fullPage: true });
    const q = await quer(page); ok(q.inhaltSW <= q.inhaltCW + 1 && q.zuBreit.length === 0, 'Muster: nichts läuft quer über ' + JSON.stringify(q));

    console.log('2) Wahlen ändern → Muster ändert sich');
    t0 = Date.now();
    await page.goto(U('spiel/wahlen?id=p04'));
    await page.waitForSelector('.sp-w');
    zeiten.wahlenSeite = Date.now() - t0;
    ok((await page.$$('.sp-w')).length === 55, '55 Wahlen in der Liste');
    ok(await page.evaluate(() => document.querySelector('#sp-w-p04').classList.contains('sp-w-ziel')), 'Sprung zu ?id=p04');
    ok((await kleineTippflaechen(page, '.sp-w-knopf')).length === 0, 'Tippflächen ≥ 44 px in „Deine Wahlen“');
    const tw = await text(page); ok(!VERBOTEN.test(tw), 'Wahlen-Seite ohne Bewertungs-Wörter' + (VERBOTEN.test(tw) ? ' → ' + tw.match(VERBOTEN)[0] : ''));
    const q2 = await quer(page); ok(q2.inhaltSW <= q2.inhaltCW + 1 && q2.zuBreit.length === 0, 'Wahlen: nichts läuft quer ' + JSON.stringify(q2));
    await page.screenshot({ path: FOTO + 'spiel-6-wahlen.png' });
    // Alle Offenheit-Paare in Richtung „Neues“, dann alle in Richtung „Vertrautes“ – Muster muss sich drehen
    const setzeOffen = async (richtung) => {
      const ziele = await page.evaluate((r) => { const S = window.__spiel; const out = [];
        for (const s of S.ABLAUF) { if (s.art !== 'paar') continue; const A = window.__spielAussage || null; }
        return out; }, richtung);
      return ziele;
    };
    await setzeOffen(1);
    const plan = await page.evaluate(() => {
      // aus daten.js: welche Seite eines Paars zeigt Richtung „Neues“ (Offenheit k=+1) bzw. „Vertrautes“?
      return null;
    });
    const musterVor = await page.evaluate(() => window.__spiel.muster().find((m) => m.ast === 'spiel.offenheit'));
    // per Klick umwählen: in jedem Paar mit Offenheit-Aussage die Seite, die zur Gegenrichtung passt
    const ziel = musterVor.deutlich !== 'beides' && /Richtung „Neues“/.test(musterVor.richtung) ? -1 : 1;
    const klicks = await page.evaluate(async (zielR) => {
      const m = await import('./module/spiel/daten.js');
      const res = [];
      for (const p of m.PAARE) {
        const A = m.AUSSAGEN[p.a], B = m.AUSSAGEN[p.b];
        let w = null;
        if (A.b === 'offenheit') w = A.k === zielR ? 'a' : 'b';
        else if (B.b === 'offenheit') w = B.k === zielR ? 'b' : 'a';
        if (w) res.push([p.id, w]);
      }
      return res;
    }, ziel);
    let geklickt = 0;
    for (const [id, w] of klicks) {
      const knopf = await page.$(`#sp-w-${id} [data-wert="${w}"][aria-pressed="false"]`);
      if (knopf) { await knopf.click(); geklickt++; await page.waitForTimeout(20); }
    }
    const musterNach = await page.evaluate(() => window.__spiel.muster().find((m) => m.ast === 'spiel.offenheit'));
    console.log('     vorher:', musterVor.richtung.slice(0, 60), '| nachher:', musterNach.richtung.slice(0, 60), '| Klicks', geklickt);
    ok(geklickt > 0 && musterNach.richtung !== musterVor.richtung, 'Umwählen dreht die Richtung „Neues oder Vertrautes“');
    const erg2 = await page.evaluate(() => window.__ticke.speicher.ergebnis('spiel'));
    ok(erg2.bereiche.offenheit.richtung === ziel, 'Gespeichertes Ergebnis sofort neu gerechnet');
    ok(await page.evaluate(() => window.__ticke.speicher.verlauf('spiel').length) === 1, 'Derselbe Lauf ersetzt sein Ergebnis (kein neuer Verlaufseintrag)');
    const info = await page.evaluate((id) => document.querySelector('#sp-w-' + id + ' .sp-w-info')?.textContent || '', klicks[0][0]);
    ok(/vorher/.test(info), '„vorher“ sichtbar nach Umwählen: ' + info);
    await page.goto(U('spiel/ergebnis')); await page.waitForSelector('.sp-ri');
    const tm2 = await text(page);
    ok(tm2.includes(musterNach.richtung), 'Muster-Seite zeigt die neue Richtung');

    console.log('3) Schnittstelle antwortListe / antwortSetzen / muster / aeste');
    const api = await page.evaluate(async () => {
      const m = await import('./module/spiel/modul.js'), k = window.__ticke;
      const liste = m.antwortListe(k), mu = m.muster(k), ae = m.aeste();
      const a0 = liste.find((x) => x.id === 'p01');
      const neuW = a0.wert === 'a' ? 'b' : 'a';
      const r1 = await m.antwortSetzen(k, 'p01', neuW);
      const nach = m.antwortListe(k).find((x) => x.id === 'p01');
      const r2 = await m.antwortSetzen(k, 'p01', null);
      const geloescht = m.antwortListe(k).find((x) => x.id === 'p01');
      await m.antwortSetzen(k, 'p01', a0.wert);
      let falsch = null; try { await m.antwortSetzen(k, 'p01', 'c'); } catch (e) { falsch = String(e.message); }
      const felder = ae.every((x) => x.id.startsWith('spiel.') && x.titel && x.bereich && x.wasEsIst && x.imAlltag.length >= 3 && x.staerken.length >= 3 && x.reibung.length >= 3 && x.weiterdenken.length >= 3 && x.wissen && !/http/.test(JSON.stringify(x)));
      const saetze = ae.map((x) => (x.wasEsIst.match(/[.!?](\s|$)/g) || []).length);
      return { n: liste.length, a0, nach, r1, r2, geloescht, falsch, mu, aeIds: ae.map((x) => x.id), felder, saetze,
        gruppen: [...new Set(liste.map((x) => x.gruppe))], musterOk: mu.every((x) => x.ast && x.titel && x.richtung && ['klar', 'leicht', 'beides'].includes(x.deutlich) && x.woher && !/\d/.test(x.richtung)) };
    });
    ok(api.n === 55 && api.a0.art === 'wahl' && api.a0.optionen.length === 2 && api.a0.route === 'spiel/wahlen?id=p01' && api.a0.anzeige, 'antwortListe: 55 Einträge, Form stimmt');
    ok(api.r1 === true && api.nach.wert !== api.a0.wert && api.nach.vorher.length >= 1, 'antwortSetzen ändert, „vorher“ gepflegt');
    ok(api.r2 === true && api.geloescht.wert === null && api.geloescht.anzeige === '', 'antwortSetzen(null) löscht');
    ok(/Wert muss/.test(api.falsch || ''), 'antwortSetzen weist ungültige Werte ab');
    ok(api.musterOk && api.mu.length === 6, 'muster(k): 6 Einträge in Worten, ohne Ziffern');
    ok(api.felder && api.aeIds.length === 6 && api.saetze.every((n) => n >= 3 && n <= 6), 'aeste(): 6 Äste mit Lerninhalt (wasEsIst 3–6 Sätze: ' + api.saetze.join(',') + ')');
    console.log('     Gruppen:', api.gruppen.join(' | '));
    console.log('     Beispiel muster:', JSON.stringify(api.mu[0]));
    ok(page.fehler.length === 0, 'keine Seitenfehler (Teil 1–3) ' + page.fehler.slice(0, 3).join(' / '));
    await ctx.close();
  }

  console.log('4) Alte Daten der Vorlage 0.2.1');
  for (const [name, daten] of [['fertig', ALT.fertig], ['halb', ALT.halb]]) {
    const { ctx, page } = await neu(b);
    await ctx.addInitScript((d) => { if (!sessionStorage.getItem('x')) { sessionStorage.setItem('x', '1'); localStorage.clear(); for (const [k, v] of Object.entries(d)) localStorage.setItem(k, v); } }, daten);
    await page.goto(U('spiel'));
    await page.waitForSelector('.sp-held');
    const tu = await text(page);
    if (name === 'fertig') {
      ok(/Dein Muster ansehen/.test(tu) && /Dein Muster bisher/.test(tu), 'alt fertig: Übersicht zeigt Muster');
      await page.goto(U('spiel/ergebnis')); await page.waitForSelector('.sp-ri');
      const tm = await text(page);
      ok((await page.$$('.sp-ri')).length === 6 && !VERBOTEN.test(tm), 'alt fertig: Muster in Worten inkl. Tätigkeiten, ohne Bewertung');
      await page.goto(U('spiel/wahlen')); await page.waitForSelector('.sp-w');
      const gedrueckt = await page.$$eval('.sp-w-knopf[aria-pressed="true"]', (x) => x.length);
      ok(gedrueckt === 55, 'alt fertig: alle 55 Wahlen übernommen (' + gedrueckt + ')');
      await page.click('#sp-w-p02 [aria-pressed="false"]');
      const e2 = await page.evaluate(() => window.__ticke.speicher.verlauf('spiel'));
      ok(e2.length === 1 && e2[0].schema === 2, 'alt fertig: Umwählen ersetzt das alte Ergebnis durch eins in Worten');
      await page.goto(U('spiel/runde')); await page.waitForTimeout(300);
      ok(await page.evaluate(() => location.hash) === '#spiel/ergebnis', 'alt fertig: „runde“ führt zum Muster (alles gewählt)');
    } else {
      ok(/Weiter wählen/.test(tu), 'alt halb: „Weiter wählen“ ' + (tu.match(/Wahl \d+ von 40/) || [''])[0]);
      await page.click('a[href="#spiel/runde"]');
      await page.waitForSelector('.sp-paar[data-bereit="1"]');
      const tr = await text(page);
      const offen = await page.evaluate(() => { const l = window.__spiel.lauf(); return window.__spiel.ABLAUF.find((s) => s.art !== 'duell' && !l.antworten[s.id]).id; });
      const gezeigt = await page.$eval('.sp-paar', (x) => x.dataset.schritt);
      ok(gezeigt === offen && !/Weiter$|Erwischt|Richtig/.test(tr), 'alt halb (offene Kopfnuss-Auflösung): weiter bei der ersten offenen Wahl ' + gezeigt);
      await waehleBis(page, 2);
      const l = await page.evaluate(() => window.__spiel.lauf());
      ok(!l.aufl && l.antworten.n4, 'alt halb: alte Felder bleiben, offene Auflösung wird verworfen');
    }
    ok(page.fehler.length === 0, `keine Seitenfehler (alt ${name}) ` + page.fehler.slice(0, 3).join(' / '));
    await ctx.close();
  }

  console.log('5) Quer 926×428 und dunkel');
  {
    const { ctx, page } = await neu(b, { viewport: { width: 926, height: 428 }, colorScheme: 'dark' });
    await ctx.addInitScript((d) => { if (!sessionStorage.getItem('x')) { sessionStorage.setItem('x', '1'); localStorage.clear(); for (const [k, v] of Object.entries(d)) localStorage.setItem(k, v); } }, ALT.halb);
    await page.goto(U('spiel/runde'));
    await page.waitForSelector('.sp-paar[data-bereit="1"]');
    const q = await quer(page); ok(q.inhaltSW <= q.inhaltCW + 1 && q.zuBreit.length === 0, 'quer: Wählen passt ' + JSON.stringify(q));
    const r = await page.evaluate(() => { const a = document.querySelector('.sp-links').getBoundingClientRect(), u = document.querySelector('.sp-unten').getBoundingClientRect(), i = document.getElementById('inhalt').getBoundingClientRect(); return { knopfUnten: Math.round(a.bottom), untenUnten: Math.round(u.bottom), inhaltUnten: Math.round(i.bottom) }; });
    ok(r.untenUnten <= r.inhaltUnten + 400, 'quer: Bedienleiste erreichbar ' + JSON.stringify(r));
    await page.screenshot({ path: FOTO + 'spiel-7-quer-dunkel.png' });
    await page.goto(U('spiel/wahlen')); await page.waitForSelector('.sp-w');
    const q2 = await quer(page); ok(q2.inhaltSW <= q2.inhaltCW + 1 && q2.zuBreit.length === 0, 'quer: Wahlen passt');
    await page.screenshot({ path: FOTO + 'spiel-8-wahlen-quer-dunkel.png' });
    await page.goto(U('spiel/so')); await page.waitForSelector('.sp-f3');
    const ts = await text(page); ok(!VERBOTEN.test(ts), 'So funktioniert’s ohne Bewertungs-Wörter' + (VERBOTEN.test(ts) ? ' → ' + ts.match(VERBOTEN)[0] : ''));
    ok(await page.$$eval('#inhalt a[href^="http"],#inhalt a[target]', (x) => x.length) === 0, 'keine Links nach draußen');
    ok(page.fehler.length === 0, 'keine Seitenfehler (quer) ' + page.fehler.slice(0, 3).join(' / '));
    await ctx.close();
  }

  console.log('6) Ohne Merken (nur Arbeitsspeicher), Hochkant, Übersicht → Muster leer');
  {
    const { ctx, page } = await neu(b);
    await ctx.addInitScript(() => { if (!sessionStorage.getItem('x')) { sessionStorage.setItem('x', '1'); localStorage.clear(); } });
    await page.goto(U('spiel/ergebnis'));
    await page.waitForSelector('#inhalt h2');
    ok(/Noch kein Muster/.test(await text(page)), 'leeres Muster: freundlicher Hinweis');
    const mu = await page.evaluate(async () => (await import('./module/spiel/modul.js')).muster(window.__ticke));
    ok(Array.isArray(mu) && mu.length === 0, 'muster(k) = [] ohne Antworten');
    await page.goto(U('spiel/runde')); await page.waitForSelector('.sp-merk');
    ok(true, '„Nicht gemerkt“-Knopf da');
    ok(page.fehler.length === 0, 'keine Seitenfehler (ohne Merken) ' + page.fehler.slice(0, 3).join(' / '));
    await ctx.close();
  }
  console.log('Zeiten (ms):', JSON.stringify(zeiten));
  console.log(`\n${pruef - fehlerZahl} von ${pruef} Prüfungen ok${fehlerZahl ? ` – ${fehlerZahl} FEHLER` : ''}`);
  await b.close();
  process.exit(fehlerZahl ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
