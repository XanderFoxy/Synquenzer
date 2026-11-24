// End-to-end: Werkstatt 3 mit echtem Refrain (33 s), hochkant + quer
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w3';
const E2E = S + '/e2e';
const URL = 'http://127.0.0.1:' + (process.env.PORT || 9850) + '/the-wall/werkstatt3/index.html';
const DATEI = E2E + '/Refrain1.wav';
const NUR = process.env.NUR || '';
let ok = 0, fehl = 0;
const pruef = (b, t) => { if (b) { ok++; console.log('  ok  ', t); } else { fehl++; console.log('  FEHL', t); } };
const lagenZahl = (page) => page.evaluate(() => document.querySelectorAll('.lage').length);
const warteNeu = (page, n, ms = 20000) => page.waitForFunction((n) => document.querySelectorAll('.lage').length > n && !window.werkstatt3.Z.beschaeftigt, n, { timeout: ms });
(async () => {
  const browser = await chromium.launch();
  const messung = {};
  for (const [name, vw, vh] of [['hoch', 428, 926], ['quer', 926, 428]]) {
    if (NUR && NUR !== name) continue;
    console.log('==', name, vw + 'x' + vh);
    const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, acceptDownloads: true });
    const page = await ctx.newPage();
    const fehler = [];
    page.on('pageerror', (e) => fehler.push('pageerror ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error') fehler.push('console ' + m.text()); });
    page.on('requestfailed', (r) => fehler.push('requestfailed ' + r.url()));
    const fremd = [];
    page.on('request', (r) => { if (!r.url().startsWith('http://127.0.0.1') && !r.url().startsWith('blob:') && !r.url().startsWith('data:')) fremd.push(r.url()); });
    const tLaden = Date.now();
    await page.goto(URL);
    await page.waitForFunction(() => window.werkstatt3);
    console.log('  Seite bereit', Date.now() - tLaden, 'ms');
    pruef(await page.isVisible('#leer'), 'Anleitung ohne Datei sichtbar');
    pruef((await page.$$eval('#leer li', (l) => l.length)) === 3, 'Anleitung in 3 Schritten');
    pruef(await page.isVisible('#zurueck') && (await page.getAttribute('#zurueck', 'href')) === '../werkstatt2/', 'Link ← Werkstatt 2');
    pruef((await page.textContent('.privat')).includes('bleibt auf dem Gerät'), 'Hinweis „Deine Datei bleibt auf dem Gerät.“');
    // Takt-Felder: Versatz 1 s (Refrain-Ausschnitt ab 63 s → Takt beginnt bei 1 s)
    await page.locator('#einst summary').tap();
    await page.fill('#fVersatz', '1'); await page.locator('#fVersatz').dispatchEvent('change');
    pruef((await page.textContent('#einstKurz')).includes('120 BPM'), 'Takt-Felder: ' + await page.textContent('#einstKurz'));
    await page.locator('#einst summary').tap();
    // zu kleine Touch-Ziele?
    const klein = await page.$$eval('button, a.knopf, label.knopf, summary, select, input', (els) => els.filter((e) => { const r = e.getBoundingClientRect(); return r.width && r.height && e.offsetParent !== null && (r.height < 43.5 || r.width < 43.5) && e.type !== 'file' && e.type !== 'range'; }).map((e) => (e.id || e.textContent.trim().slice(0, 12)) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height)));
    pruef(!klein.length, 'Touch-Ziele ≥ 44 px' + (klein.length ? ': ' + klein.join(', ') : ''));
    const tU = Date.now();
    await page.setInputFiles('#dateiEingabe', DATEI);
    await page.waitForFunction(() => window.werkstatt3.Z.v && document.querySelectorAll('.lage').length === 1 && !window.werkstatt3.Z.beschaeftigt, null, { timeout: 30000 });
    console.log('  Datei geladen', Date.now() - tU, 'ms');
    pruef(await page.isVisible('#buehne'), 'Pianorolle sichtbar nach Upload');
    pruef((await page.textContent('#dateiInfo')).includes('Refrain1.wav'), 'Datei-Zeile: ' + await page.textContent('#dateiInfo'));
    pruef(!(await page.isDisabled('#bAuto')), 'Auto-Knopf bereit');
    await page.waitForTimeout(300);
    const t0 = Date.now();
    await page.locator('#bAuto').tap();
    const staende = [];
    const iv = setInterval(async () => { try { staende.push(await page.evaluate(() => ['spReinigen', 'spTiming', 'spTon'].map((i) => document.getElementById(i).textContent).join('/'))); } catch (e) { /* egal */ } }, 150);
    await page.waitForFunction(() => !document.getElementById('bericht').hidden && !window.werkstatt3.Z.beschaeftigt, null, { timeout: 180000 });
    clearInterval(iv);
    const dauerAuto = Date.now() - t0;
    const bericht = await page.textContent('#bericht');
    console.log('  Bericht:', bericht, '(' + dauerAuto + ' ms)');
    console.log('  Fortschritt (Stichproben):', [...new Set(staende)].slice(0, 12).join(' | '));
    messung[name] = { autoMs: dauerAuto, bericht };
    pruef(/Klicks \d+/.test(bericht) && /Anschläge auf dem Raster/.test(bericht) && /Noten (gestimmt|erkannt)/.test(bericht), 'Bericht plausibel');
    pruef([...new Set(staende)].length >= 3, 'Fortschritt je Schritt sichtbar');
    await page.waitForTimeout(500);
    const lagen = await page.$$eval('.lage', (els) => els.map((e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, vorne: e.classList.contains('vorne'), t: e.querySelector('.fahne').textContent }; }));
    console.log('  Lagen:', lagen.map((l) => `${l.t} @${Math.round(l.x)},${Math.round(l.y)}`).join(' | '));
    pruef(lagen.length === 3 && lagen.some((l) => /Original/.test(l.t)) && lagen.some((l) => /Gereinigt/.test(l.t)), '3 Versionen (Original, Gereinigt, Auto-Durchlauf) – ' + lagen.length);
    const nach = lagen.slice().sort((a, b) => a.y - b.y);
    pruef(nach.every((l, i) => i === 0 || l.y - nach[i - 1].y >= 40), 'Staffelung senkrecht (nichts auf 0)');
    pruef(nach.every((l, i) => i === 0 || l.x > nach[i - 1].x), 'Staffelung schräg nach rechts');
    pruef(nach[0].t.includes('Auto-Durchlauf') && /\d\d:\d\d/.test(nach[0].t), 'neueste oben/vorne mit Fähnchen „' + nach[0].t + '“');
    const info = await page.evaluate(() => { const v = window.werkstatt3.Z.v; return { n: v.noten.length, peaks: v.noten.filter((n) => n.peak != null).length, dauer: v.dauer }; });
    pruef(info.n > 30, 'Noten-Blobs: ' + info.n + ' (mit Spitze ' + info.peaks + ')');
    const vielfalt = await page.evaluate(() => { const c = document.getElementById('rolle'), g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data, s = new Set(); for (let i = 0; i < d.length; i += 4 * 97) s.add(d[i] + ',' + d[i + 1] + ',' + d[i + 2]); return s.size; });
    pruef(vielfalt > 12, 'Pianorolle zeichnet (Farben ' + vielfalt + ')');
    // Export der Auto-Fassung + Zwischenstufen
    for (const [knopf, zusatz] of [['#bExport', 'fertig'], ['#bExportRein', 'gereinigt'], ['#bExportTim', 'getimed']]) {
      await page.locator(knopf).scrollIntoViewIfNeeded();
      const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), page.locator(knopf).tap()]);
      const ziel = `${E2E}/export-${name}-${zusatz}.wav`;
      await dl.saveAs(ziel);
      const gr = fs.statSync(ziel).size, kopf = fs.readFileSync(ziel).subarray(0, 44);
      pruef(dl.suggestedFilename() === 'Refrain1_' + zusatz + '.wav' && Math.abs(gr - (44 + 1584000 * 3)) < 64 && kopf.readUInt16LE(34) === 24 && kopf.readUInt32LE(24) === 48000, `Export ${dl.suggestedFilename()} 24 bit 48 kHz ${gr} B`);
    }
    // Fotos (hochkant): oben, Rolle
    if (name === 'hoch') {
      await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200);
      await page.screenshot({ path: S + '/final-oben.png' });
      await page.evaluate(() => { const w = window.werkstatt3, N = w.Z.v.noten; const i = N.findIndex((n) => n.t0 > 8); w.zeige(N[Math.max(0, i)].t0 - 0.3); });
      await page.locator('#werk').scrollIntoViewIfNeeded(); await page.waitForTimeout(250);
      await page.locator('#werk').screenshot({ path: S + '/final-rolle.png' });
    } else {
      await page.screenshot({ path: E2E + '/quer-rolle.png' });
    }
    // ältere Version nach vorne (Fähnchen antippen), Hören spielt sie
    const alt = page.locator('.lage', { hasText: 'Gereinigt' });
    await alt.scrollIntoViewIfNeeded();
    const fb = await alt.locator('.fahne').boundingBox();
    await page.touchscreen.tap(fb.x + fb.width / 2, fb.y + fb.height / 2);
    await page.waitForTimeout(400);
    pruef(await page.evaluate(() => window.werkstatt3.Z.v.name) === 'Gereinigt', 'Fähnchen antippen holt „Gereinigt“ nach vorne');
    const obenTxt = await page.$$eval('.lage', (els) => els.map((e) => [e.getBoundingClientRect().top, e.querySelector('.fahne').textContent, e.classList.contains('vorne')]).sort((a, b) => a[0] - b[0])[0]);
    pruef(obenTxt[1].includes('Gereinigt') && obenTxt[2], 'gewählte Lage liegt vorne oben (Marke)');
    await page.locator('#bSpiel').tap(); await page.waitForTimeout(350);
    pruef(await page.evaluate(() => window.werkstatt3.hoertGerade()) === 'Gereinigt', 'Hören spielt die vorne gewählte Version');
    await page.locator('#bSpiel').tap();
    pruef(!(await page.isDisabled('#bAktuell')), '„Aktuell“ aktiv');
    await page.locator('#bAktuell').tap(); await page.waitForTimeout(300);
    pruef(await page.evaluate(() => window.werkstatt3.Z.v.name) === 'Auto-Durchlauf', '„Aktuell“ holt neueste zurück');
    // Note senkrecht ziehen (+1 Halbton)
    const idx = await page.evaluate(() => { const w = window.werkstatt3, N = w.Z.v.noten; let i = N.findIndex((n) => n.t1 - n.t0 > 0.25 && n.t0 > 3 && n.peak != null); if (i < 0) i = 0; w.zeige(N[i].t0 - 0.6); return i; });
    await page.locator('#werk').scrollIntoViewIfNeeded(); await page.waitForTimeout(150);
    let o = await page.evaluate((i) => window.werkstatt3.ort(i), idx);
    const pph = await page.evaluate(() => window.werkstatt3.Z.sicht.pph);
    let n0 = await lagenZahl(page);
    const midiVor = await page.evaluate((i) => window.werkstatt3.Z.v.noten[i].midi, idx);
    await page.mouse.move(o.x, o.y); await page.mouse.down(); await page.mouse.move(o.x, o.y - pph * 0.5, { steps: 4 }); await page.mouse.move(o.x, o.y - pph * 1.1, { steps: 4 }); await page.mouse.up();
    await warteNeu(page, n0);
    const vt = await page.evaluate(() => window.werkstatt3.Z.v.name);
    const midiNach = await page.evaluate((i) => window.werkstatt3.Z.v.noten[i].midi, idx);
    pruef(/\+1 Halbton/.test(vt) && midiNach === midiVor + 1, 'Senkrecht ziehen → „' + vt + '“, MIDI ' + midiVor + '→' + midiNach);
    pruef(await page.evaluate(() => window.werkstatt3.hoertGerade()) !== null, 'Zug sofort hörbar (Vorhören)');
    // Note waagrecht ziehen (Timing, rastet auf der nächsten 1/16 ein)
    o = await page.evaluate((i) => window.werkstatt3.ort(i), idx);
    const pps = await page.evaluate(() => window.werkstatt3.Z.sicht.pps);
    n0 = await lagenZahl(page);
    const vorlaufVor = await page.evaluate((i) => { const n = window.werkstatt3.Z.v.noten[i]; return n.peak - n.onset; }, idx);
    await page.mouse.move(o.x, o.y); await page.mouse.down(); await page.mouse.move(o.x + 20, o.y, { steps: 3 }); await page.mouse.move(o.x + pps * 0.13, o.y, { steps: 4 }); await page.mouse.up();
    await warteNeu(page, n0).catch(() => {});
    const vz = await page.evaluate(() => window.werkstatt3.Z.v.name);
    pruef(/ms/.test(vz), 'Waagrecht ziehen → „' + vz + '“');
    const lage = await page.evaluate((i) => { const w = window.werkstatt3, n = w.Z.v.noten[i], E = w.E, g = 60 / E.bpm / 4; const l = E.versatz + Math.round((n.peak - E.versatz) / g) * g; return { ab: Math.abs(n.peak - l) * 1000, vorlauf: n.peak - n.onset }; }, idx);
    pruef(lage.ab < 1, 'Spitze nach dem Ziehen auf dem Strich (' + lage.ab.toFixed(2) + ' ms)');
    pruef(Math.abs(lage.vorlauf - vorlaufVor) < 0.002, 'Vorlauf links erhalten (' + (vorlaufVor * 1000).toFixed(1) + ' → ' + (lage.vorlauf * 1000).toFixed(1) + ' ms)');
    // Spitze im neuen Audio wirklich auf dem Strich? (Transienten im Fenster neu suchen)
    const echt = await page.evaluate(async (i) => { const w = window.werkstatt3, v = w.Z.v, n = v.noten[i], m = await import(new URL('js/timing.js', location.href).href); const a = Math.max(0, Math.round((n.peak - 0.6) * v.sr)), b = Math.round((n.peak + 0.6) * v.sr); const tr = m.transienten(v.x.subarray(a, b), v.sr).map((t) => t.peak + a / v.sr); let best = 1e9; for (const t of tr) if (Math.abs(t - n.peak) < Math.abs(best - n.peak)) best = t; const g = 60 / w.E.bpm / 4, l = w.E.versatz + Math.round((best - w.E.versatz) / g) * g; return Math.abs(best - l) * 1000; }, idx);
    pruef(echt < 3, 'im Audio neu erkannte Spitze ' + echt.toFixed(2) + ' ms neben dem Strich');
    // Fein: +30 Cent
    await page.locator('#bFein').tap();
    o = await page.evaluate((i) => window.werkstatt3.ort(i), idx);
    n0 = await lagenZahl(page);
    await page.mouse.move(o.x, o.y); await page.mouse.down(); await page.mouse.move(o.x, o.y - 12, { steps: 3 }); await page.mouse.move(o.x, o.y - pph * 0.3, { steps: 3 }); await page.mouse.up();
    await warteNeu(page, n0).catch(() => {});
    const vc = await page.evaluate(() => window.werkstatt3.Z.v.name);
    pruef(/Cent/.test(vc), 'Fein ziehen → „' + vc + '“');
    await page.locator('#bFein').tap();
    // Doppeltipp → zurück auf die Stufe
    o = await page.evaluate((i) => window.werkstatt3.ort(i), idx);
    n0 = await lagenZahl(page);
    await page.touchscreen.tap(o.x, o.y); await page.waitForTimeout(120); await page.touchscreen.tap(o.x, o.y);
    await warteNeu(page, n0).catch(() => {});
    const vd = await page.evaluate(() => window.werkstatt3.Z.v.name);
    const cent = await page.evaluate((i) => window.werkstatt3.Z.v.noten[i].cent, idx);
    pruef(/auf Stufe/.test(vd) && Math.abs(cent) <= 5, 'Doppeltipp → „' + vd + '“, Abweichung ' + cent + ' Cent');
    // ältere Version vorne weiterbearbeiten (Basis = Getimed)
    const g = page.locator('.lage', { hasText: 'Gereinigt' });
    await g.scrollIntoViewIfNeeded();
    const gb = await g.locator('.fahne').boundingBox();
    await page.touchscreen.tap(gb.x + gb.width / 2, gb.y + gb.height / 2); await page.waitForTimeout(400);
    const gid = await page.evaluate(() => window.werkstatt3.Z.v.name === 'Gereinigt' && window.werkstatt3.Z.v.id);
    pruef(!!gid, 'Gereinigt vorne');
    await page.locator('#werk').scrollIntoViewIfNeeded();
    o = await page.evaluate((i) => window.werkstatt3.ort(i), idx);
    n0 = await lagenZahl(page);
    await page.mouse.move(o.x, o.y); await page.mouse.down(); await page.mouse.move(o.x, o.y + pph * 0.5, { steps: 4 }); await page.mouse.move(o.x, o.y + pph * 1.1, { steps: 4 }); await page.mouse.up();
    await warteNeu(page, n0).catch(() => {});
    const vb = await page.evaluate(() => ({ name: window.werkstatt3.Z.v.name, basis: window.werkstatt3.Z.v.basis }));
    pruef(/−1 Halbton/.test(vb.name) && vb.basis === gid, 'ältere Version weiterbearbeitet → „' + vb.name + '“ (Basis Gereinigt)');
    // Zwiebel-Foto
    await page.waitForTimeout(500);
    const zl = await page.$$eval('.lage', (els) => els.map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), e.querySelector('.fahne').textContent]; }).sort((a, b) => a[1] - b[1]));
    console.log('  Zwiebel:', zl.map((l) => l[2] + '@' + l[0] + ',' + l[1]).join(' | '));
    pruef(zl.every((l, i) => i === 0 || (l[1] - zl[i - 1][1] >= 40 && l[0] > zl[i - 1][0])), 'Zwiebel mit ' + zl.length + ' Lagen schräg gestaffelt');
    // eine ältere nach vorne für das Foto
    const o2 = page.locator('.lage', { hasText: 'Original' });
    await o2.scrollIntoViewIfNeeded();
    if (name === 'hoch') {
      const ob = await page.locator('.lage', { hasText: 'Auto-Durchlauf' }).locator('.fahne').boundingBox();
      await page.touchscreen.tap(ob.x + ob.width / 2, ob.y + ob.height / 2); await page.waitForTimeout(500);
      await page.locator('#zwiebel').scrollIntoViewIfNeeded(); await page.waitForTimeout(200);
      await page.locator('#zwiebel').screenshot({ path: S + '/final-zwiebel.png' });
      await page.screenshot({ path: E2E + '/hoch-ganz.png', fullPage: true });
      await page.locator('#bAktuell').tap(); await page.waitForTimeout(300);
    } else {
      await page.locator('#zwiebel').scrollIntoViewIfNeeded(); await page.waitForTimeout(200);
      await page.screenshot({ path: E2E + '/quer-zwiebel.png' });
    }
    // Export der weiterbearbeiteten neuesten Version
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), page.locator('#bExport').tap()]);
    await dl.saveAs(`${E2E}/export-${name}-nachbearbeitet.wav`);
    pruef(dl.suggestedFilename() === 'Refrain1_fertig.wav', 'Export nach Nachbessern: ' + dl.suggestedFilename());
    if (name === 'hoch') {
      const n1 = await lagenZahl(page);
      await page.evaluate(() => window.werkstatt3.verlauf.bereit());
      await page.reload();
      await page.waitForFunction((n) => document.querySelectorAll('.lage').length === n && window.werkstatt3.Z.v, n1, { timeout: 30000 }).catch(() => {});
      pruef(await lagenZahl(page) === n1, 'Verlauf nach Neuladen wieder da (' + n1 + ')');
    }
    pruef(fremd.length === 0, 'keine Anfrage nach außen' + (fremd.length ? ': ' + fremd.join(' ') : ''));
    pruef(fehler.length === 0, '0 Seitenfehler' + (fehler.length ? ': ' + fehler.join(' | ') : ''));
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(E2E + '/messung-ui.json', JSON.stringify(messung, null, 1));
  console.log(`\n${ok} ok, ${fehl} Fehler`);
  process.exit(fehl ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
