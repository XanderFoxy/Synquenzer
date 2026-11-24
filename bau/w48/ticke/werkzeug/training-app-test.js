// Test des Training-Moduls in der App (Arbeitskopie). Aufruf: node training-app-test.js <port> <altdaten.json> [fotos-ordner]
// iPhone 428×926 hochkant (hasTouch, isMobile), Service Worker blockiert, nur erfundene Daten.
const { chromium, devices } = require('playwright');
const fs = require('fs');
const [port, altPfad, fotos] = process.argv.slice(2);
const ALT = JSON.parse(fs.readFileSync(altPfad, 'utf8'));
const U = `http://127.0.0.1:${port}/ticke/?test=1`;
let pruef = 0; const fehlschlag = [];
const ok = (b, m) => { pruef++; if (!b) fehlschlag.push(m); };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 12 Pro Max'], viewport: { width: 428, height: 926 }, hasTouch: true, isMobile: true, serviceWorkers: 'block', acceptDownloads: true });
  await ctx.addInitScript((alt) => { if (!sessionStorage.getItem('geladen')) { sessionStorage.setItem('geladen', '1'); for (const [k, v] of Object.entries(alt)) localStorage.setItem(k, v); } }, ALT);
  const p = await ctx.newPage(); const err = [], extern = [];
  p.on('pageerror', (e) => err.push('pageerror ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error') err.push('console ' + m.text()); });
  p.on('request', (r) => { if (!r.url().startsWith(`http://127.0.0.1:${port}/`) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) extern.push(r.url()); });
  const geh = async (h) => { await p.evaluate((x) => { location.hash = x; }, h).catch(() => {}); await p.waitForTimeout(250); await p.waitForSelector('#inhalt h2'); };
  const text = () => p.$eval('#inhalt', (e) => e.innerText);
  const pruefSeite = async (name) => {
    const r = await p.evaluate(() => {
      const el = document.getElementById('inhalt'), W = document.documentElement.clientWidth;
      const breit = document.documentElement.scrollWidth > W + 1;
      const raus = [...el.querySelectorAll('[href]')].filter((a) => !/^(#|tel:)/.test(a.getAttribute('href'))).map((a) => a.getAttribute('href'));
      const blank = el.querySelectorAll('[target=_blank]').length;
      const klein = [...el.querySelectorAll('a.knopf, button, a.zeile, .chip, a.karte, a.link, summary')].filter((x) => { const q = x.getBoundingClientRect(); return q.width && q.height && x.offsetParent !== null && (q.height < 43.5 || q.width < 43.5); }).map((x) => (x.className || x.tagName) + ':' + Math.round(x.getBoundingClientRect().height) + 'x' + Math.round(x.getBoundingClientRect().width) + ' ' + (x.textContent || '').trim().slice(0, 20));
      const ueber = [...el.querySelectorAll('*')].filter((x) => x.getBoundingClientRect().right > W + 1 && x.offsetParent !== null).map((x) => x.tagName + '.' + x.className).slice(0, 5);
      return { breit, raus, blank, klein, ueber, t: el.innerText };
    });
    ok(!r.breit && !r.ueber.length, `${name}: läuft quer über (${r.ueber.join(', ')})`);
    ok(!r.raus.length && !r.blank, `${name}: Link nach draußen ${r.raus.join(' ')}`);
    ok(!r.klein.length, `${name}: Tippfläche < 44 px: ${r.klein.slice(0, 6).join(' | ')}`);
    ok(!/in Folge|von 7|\d+\s*%|\d+-mal|Punkte|Serie|Streak|Level|Abzeichen|geschafft/i.test(r.t.replace(/Ein Ding, zehn Minuten/g, '')), `${name}: Bewertungs-/Zähl-Wort: ${(r.t.match(/.{0,30}(in Folge|von 7|\d+\s*%|\d+-mal|Punkte|Serie|Streak|Level|Abzeichen|geschafft).{0,20}/i) || [''])[0]}`);
    return r.t;
  };
  const foto = async (n) => { if (fotos) await p.screenshot({ path: `${fotos}/training-${n}.png`, fullPage: true }); };

  // 1) Heute mit alten Daten der Vorlage
  await p.goto(U + '#training'); await p.waitForSelector('#inhalt h2');
  ok(await p.evaluate(() => window.__ticke.speicher.einwilligung()), 'Einwilligung aus Alt-Daten geladen');
  let t = await pruefSeite('Heute');
  ok(/Heute gemacht:.*Ein Ding, zehn Minuten/.test(t), 'Alt-Daten: heute gemacht sichtbar');
  ok(/Dein Tagebuch/.test(t) && /Gedanken-Parkplatz/.test(t), 'Tagebuch zeigt alte Einträge');
  ok(/Wenn ich nach Hause komme, dann spiele ich zehn Minuten Gitarre\./.test(t), 'alter Plan sichtbar');
  ok(await p.$eval('[data-sp=fokus]', (e) => e.getAttribute('aria-checked')) === 'true', 'alter Schwerpunkt aktiv');
  ok(!(await p.$('a[href="../atem/"]')), 'kein Link zur Atem-App');
  await foto('heute');

  // 2) Bereich mit zwei Polen und Sprung zum Ast
  await geh('#training/gruppe/fokus'); t = await pruefSeite('Bereich');
  ok(/Zwei Seiten/.test(t) && /Eine Sache in der Tiefe/.test(t) && /Beweglich zwischen vielem/.test(t), 'Pole sichtbar');
  ok(await p.$('a[href="#muster/ast/training.fokus"]'), 'Sprung zum Ast');
  await foto('bereich');

  // 3) Übung: Gefühl ändern → vorher, Muster ändert sich
  const imp = (f) => p.evaluate(f);
  const vorherM = await imp(async () => { const m = await import('./module/training/modul.js'); return m.muster(window.__ticke); });
  ok(vorherM.length >= 3 && vorherM.every((x) => x.ast && x.titel && x.richtung && x.woher && ['klar', 'leicht', 'beides'].includes(x.deutlich)), 'muster() Vertrag');
  const fokus0 = vorherM.find((x) => x.ast === 'training.fokus');
  ok(fokus0 && fokus0.deutlich === 'klar', 'Fokus vorher klar (zwei „tat mir gut“): ' + JSON.stringify(fokus0));
  await geh('#training/uebung/f-ein-ding'); t = await pruefSeite('Übung');
  ok(/Heute gemacht/.test(t) && await p.$eval('[data-gut="2"]', (e) => e.getAttribute('aria-checked')) === 'true', 'altes Gefühl angezeigt');
  await p.click('[data-gut="0"]'); await p.waitForTimeout(150);
  const nachM = await imp(async () => { const m = await import('./module/training/modul.js'); return m.muster(window.__ticke); });
  const fokus1 = nachM.find((x) => x.ast === 'training.fokus');
  ok(fokus1 && fokus1.deutlich === 'beides' && fokus1.richtung !== fokus0.richtung, 'Muster rechnet neu nach Änderung: ' + JSON.stringify(fokus1));
  const vor = await imp(() => window.__ticke.speicher.lies('training', 'vorher', {}));
  ok(vor['gefuehl.f-ein-ding'] && vor['gefuehl.f-ein-ding'][0].wert === 2 && vor['gefuehl.f-ein-ding'][0].anzeige === 'tat mir gut', '„vorher“ gepflegt: ' + JSON.stringify(vor));
  await foto('uebung');

  // 4) antwortListe / antwortSetzen
  const L = await imp(async () => { const m = await import('./module/training/modul.js'); return m.antwortListe(window.__ticke); });
  const by = Object.fromEntries(L.map((a) => [a.id, a]));
  ok(L.every((a) => a.id && a.gruppe && a.frage && ['wahl', 'text', 'zahl', 'zeit'].includes(a.art) && 'wert' in a && typeof a.anzeige === 'string'), 'antwortListe Vertrag');
  ok(new Set(L.map((a) => a.id)).size === L.length, 'IDs eindeutig');
  ok(by.schwerpunkt.wert === 'fokus' && by.zeit.wert === 5 && by['gefuehl.f-ein-ding'].wert === 0 && by['gefuehl.k-benennen'].wert === 0 && by['gefuehl.h-gehen'].wert === 1, 'Werte aus Alt-Daten');
  ok(by['gefuehl.f-ein-ding'].vorher && by['gefuehl.f-ein-ding'].vorher.length === 1, 'vorher in antwortListe');
  const planId = Object.keys(by).find((k) => k.startsWith('plan.') && k.endsWith('.dann'));
  ok(planId && by[planId].wert === 'spiele ich zehn Minuten Gitarre', 'Plan-Feld in antwortListe');
  ok(by['notiz.2026-W48'] && by['notiz.2026-W48'].wert === 'Morgens Gitarre tut mir gut.', 'Wochen-Notiz in antwortListe');
  ok(L.every((a) => !a.route || !a.route.startsWith('#')), 'route ohne #');
  const r1 = await imp(async (pid) => { const m = await import('./module/training/modul.js'), k = window.__ticke;
    const a = await m.antwortSetzen(k, pid, 'übe ich Akkorde'); const b2 = await m.antwortSetzen(k, 'zeit', 10); const c = await m.antwortSetzen(k, 'notiz.2026-W48', null);
    const d = await m.antwortSetzen(k, 'gibtsnicht', 1); const e = await m.antwortSetzen(k, 'zeit', 7); const f = await m.antwortSetzen(k, 'schwerpunkt', null);
    const g = await m.antwortSetzen(k, 'gefuehl.h-gehen', 2);
    return { a, b2, c, d, e, f, g, liste: m.antwortListe(k), daten: k.speicher.modulDaten('training'), muster: m.muster(k) }; }, planId);
  ok(r1.a && r1.b2 && r1.c && !r1.d && !r1.e && r1.f && r1.g, 'antwortSetzen Rückgaben ' + JSON.stringify([r1.a, r1.b2, r1.c, r1.d, r1.e, r1.f, r1.g]));
  ok(r1.daten.plaene[0].felder.dann === 'übe ich Akkorde' && r1.daten.zeit === 10 && !r1.daten.rueckblick['2026-W48'] && !('schwerpunkt' in r1.daten), 'gespeichert');
  console.log("VORHER", JSON.stringify(r1.daten.vorher)); ok(r1.daten.vorher.zeit && r1.daten.vorher.zeit[0].wert === 5 && r1.daten.vorher[planId] && r1.daten.vorher[planId][0].wert === 'spiele ich zehn Minuten Gitarre' && r1.daten.vorher['notiz.2026-W48'] && r1.daten.vorher['notiz.2026-W48'][0].wert === 'Morgens Gitarre tut mir gut.', 'vorher für Zeit/Plan/Notiz');
  ok(r1.muster.find((x) => x.ast === 'training.gesundheit').deutlich === 'leicht' && /Klar|Leicht/.test(r1.muster.find((x) => x.ast === 'training.gesundheit').richtung), 'Muster Gesundheit nach Änderung');
  ok(!r1.muster.some((x) => /\d/.test(x.richtung + x.woher)), 'Muster ohne Zahl');
  const ls = await imp(() => JSON.parse(localStorage.getItem('ticke.v1.m.training')));
  ok(ls.zeit === 10 && ls.vorher && ls.tage['2026-11-15'][0].gut === 2, 'auf dem Gerät geschrieben (Format der Vorlage + vorher)');
  const A = await imp(async () => { const m = await import('./module/training/modul.js'); return m.aeste(); });
  ok(A.length === 8 && A.every((a) => a.bereich === 'Üben' && a.ueben.every((x) => /^training\//.test(x.route))), 'aeste()');

  // 5) Pläne zeigen das geänderte Feld, ohne Zähler
  await geh('#training/plaene'); t = await pruefSeite('Pläne');
  ok(/Wenn ich nach Hause komme, dann übe ich Akkorde\./.test(t), 'geänderter Plan sichtbar');

  // 6) Woche: Tagebuch ohne Zählung
  await geh('#training/woche'); t = await pruefSeite('Woche');
  ok(/Was hat dir gutgetan\?/.test(t) && /abgehakt: /.test(t) && !/Woche davor: an/.test(t), 'Woche als Tagebuch');
  await p.fill('#tr-rb', 'Neue Notiz zum Test.'); await p.click('[data-tr=rb]'); await p.waitForTimeout(100);
  ok((await imp(() => window.__ticke.speicher.lies('training', 'rueckblick', {})))['2026-W48'].text === 'Neue Notiz zum Test.', 'Notiz über UI gespeichert');
  await geh('#training/woche?w=-1'); await pruefSeite('Woche davor');
  await foto('woche');

  // 7) Atem-Übung: Takt in der App
  await geh('#training/uebung/h-atem'); t = await pruefSeite('Atem');
  ok(await p.$('[data-atem]') && /Bereit/.test(t), 'Atem-Kreis da');
  await p.click('[data-tr=t-start]'); await p.waitForTimeout(1200);
  const at1 = await p.$eval('[data-atem]', (e) => ({ c: e.className, w: e.textContent.trim(), s: getComputedStyle(e.querySelector('.tr-atem-kreis')).transform }));
  ok(/\bein\b/.test(at1.c) && at1.w === 'Einatmen', 'Einatmen nach Start: ' + JSON.stringify(at1));
  // Zeit vorspulen: 4,5 s später muss „Ausatmen“ kommen
  await p.waitForTimeout(3600);
  const at2 = await p.$eval('[data-atem]', (e) => ({ c: e.className, w: e.textContent.trim() }));
  ok(/\baus\b/.test(at2.c) && at2.w === 'Ausatmen', 'Ausatmen nach 4 s: ' + JSON.stringify(at2));
  await foto('atem');
  await p.click('[data-tr=t-pause]'); await p.waitForTimeout(100);
  ok((await p.$eval('[data-atem-wort]', (e) => e.textContent)) === 'Pause', 'Pause-Wort');
  await p.click('[data-tr=t-stopp]');

  // 8) Herausforderungen und Wachsen (mit erfundener Richtung)
  await imp(() => window.__ticke.speicher.speichere ? 0 : 0);
  await p.evaluate(() => { const k = window.__ticke; const fn = k.speicher.speichere || k.speicher.ergebnisSpeichern || k.speicher.neuesErgebnis; if (fn) fn.call(k.speicher, 'passt.wachstum', { id: 'gelassener', titel: 'Gelassener werden', aufgaben: ['Einmal am Tag drei ruhige Atemzüge', 'Abends einen Ärger aufschreiben'] }); });
  const hatW = await p.evaluate(() => !!window.__ticke.speicher.ergebnis('passt.wachstum'));
  await geh('#training/wachsen'); t = await pruefSeite('Wachsen');
  if (hatW) {
    ok(/noch offen/.test(t), 'Herausforderungen ohne Zähler');
    await geh('#training/herausforderung/0'); await pruefSeite('Herausforderung');
    await p.click('[data-tr=geschafft]'); await p.waitForTimeout(100); await p.click('[data-gut="2"]'); await p.waitForTimeout(100);
    const L2 = await imp(async () => { const m = await import('./module/training/modul.js'); return m.antwortListe(window.__ticke); });
    const hf = L2.find((a) => a.id === 'gefuehl.hf-gelassener-0');
    ok(hf && hf.wert === 2 && hf.route === 'training/herausforderung/0', 'Herausforderung in antwortListe: ' + JSON.stringify(hf));
    await geh('#training'); t = await pruefSeite('Heute mit Richtung');
  }

  // 9) Erinnerung: Datei nur mit eigener Adresse
  await geh('#training/erinnerung'); await pruefSeite('Erinnerung');
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 5000 }).catch(() => null), p.click('[data-tr=ics]')]);
  if (dl) { const pfad = await dl.path(); const ics = fs.readFileSync(pfad, 'utf8').replace(/\r\n /g, ''); const urls = ics.match(/https?:\/\/[^\s\\]+/g) || [];
    ok(urls.length && urls.every((x) => x.startsWith(`http://127.0.0.1:${port}/ticke/`)), 'ics nur eigene Adresse: ' + urls.join(' ')); } else ok(false, 'kein Download der .ics');

  // 10) Herkunft: Marke öffnet Blatt mit Quelle als Text, kein Link
  await geh('#training/uebung/f-ein-ding');
  await p.click('.marke[data-quellen="rubinstein2001"]'); await p.waitForTimeout(400);
  const blatt = await p.evaluate(() => { const d = document.querySelector('dialog[open], .blatt'); return d ? { t: d.innerText, links: [...d.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')) } : null; });
  ok(blatt && /Rubinstein/.test(blatt.t), 'Quelle im Blatt');
  const blattLinks = blatt ? blatt.links.filter((h) => !/^(#|tel:)/.test(h)) : [];
  const blattErkl = blatt && /Versuchsreihe zum Wechseln/.test(blatt.t);
  await p.keyboard.press('Escape');

  // 11) quer 926×428
  await p.setViewportSize({ width: 926, height: 428 });
  for (const h of ['#training', '#training/uebung/h-atem', '#training/gruppe/andere', '#training/woche']) { await geh(h); await pruefSeite('quer ' + h); }
  await foto('quer');
  await p.setViewportSize({ width: 428, height: 926 });
  // alle Übungen einmal öffnen
  const alleIds = await imp(async () => (await import('./module/training/uebungen.js')).UEBUNGEN.map((u) => u.id));
  for (const id of alleIds) { await geh('#training/uebung/' + id); await pruefSeite('Übung ' + id); }
  for (const g of ['fokus', 'ziele', 'gewohnheiten', 'lernen', 'gefuehle', 'gesundheit', 'andere', 'wachsen']) { await geh('#training/gruppe/' + g); await pruefSeite('Bereich ' + g); }

  ok(!err.length, 'Seitenfehler/console.error: ' + err.join(' | '));
  ok(!extern.length, 'Anfragen nach draußen: ' + extern.join(' '));
  console.log(JSON.stringify({ pruefungen: pruef, fehlschlaege: fehlschlag, seitenfehler: err.length, extern: extern.length, blattLinksFremd: blattLinks, blattZeigtErklaerung: !!blattErkl, wachstumGesetzt: hatW, uebungenGeoeffnet: alleIds.length }, null, 1));
  await b.close();
  process.exit(fehlschlag.length ? 1 : 0);
})().catch((e) => { console.error('ABBRUCH', e); process.exit(2); });
