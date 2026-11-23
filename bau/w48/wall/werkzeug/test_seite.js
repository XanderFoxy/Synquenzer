// Test der Werkstatt 2 (Lauf 6) – lokal, nichts geht ins Netz (fremde Anfragen werden abgefangen, Senden wird NIE gedrückt)
const { chromium } = require('playwright');
const PORT = process.env.PORT || 9123;
const URL = `http://localhost:${PORT}/the-wall/werkstatt2/index.html`;
const OUT = process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall/test';
const fs = require('fs'); fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const erg = { fehler: [], fremd: [] };

async function seite(browser, vp) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.route('**/*', r => { const u = r.request().url(); if (u.startsWith(`http://localhost:${PORT}/`)) return r.continue(); erg.fremd.push(u); return r.abort(); });
  page.on('pageerror', e => erg.fehler.push(vp.width + 'x' + vp.height + ' pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') erg.fehler.push(vp.width + 'x' + vp.height + ' console: ' + m.text()) });
  await page.goto(URL);
  await page.waitForFunction(() => document.getElementById('laden').hidden && window.__ws2 && window.__ws2.PRUEF && window.__ws2.AEND, null, { timeout: 30000 });
  return { ctx, page };
}
// Überlappung / Abschneiden / Touch-Ziele in einem Container prüfen
async function layoutCheck(page, name) {
  return await page.evaluate((name) => {
    const vw = innerWidth, out = { name, klein: [], ueber: [], ausserhalb: [] };
    const els = [...document.querySelectorAll('#fassung button,#fassung a,#steuer button,#steuer input,#info button,.tabs button')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' });
    const R = els.map(e => ({ e, r: e.getBoundingClientRect(), id: e.id || e.dataset.h || e.dataset.s || e.dataset.m || e.dataset.r || e.dataset.z || e.textContent.trim().slice(0, 14) }));
    for (const a of R) {
      if (a.r.height < 32 || a.r.width < 32) out.klein.push(a.id + ' ' + Math.round(a.r.width) + 'x' + Math.round(a.r.height));
      const sc = a.e.closest('.tabs,#steuer');   // im Querformat darf die Spalte scrollen
      if ((a.r.right > vw + .5 || a.r.left < -.5) && !(sc && sc.scrollWidth > sc.clientWidth)) out.ausserhalb.push(a.id + ' ' + Math.round(a.r.left) + '-' + Math.round(a.r.right));
    }
    for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) {
      const a = R[i].r, b = R[j].r; const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left), oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (ox > 1 && oy > 1 && !R[i].e.contains(R[j].e) && !R[j].e.contains(R[i].e)) out.ueber.push(R[i].id + ' / ' + R[j].id);
    }
    out.seiteBreit = document.documentElement.scrollWidth > vw + 1;
    out.tabsScroll = document.querySelector('.tabs').scrollWidth > document.querySelector('.tabs').clientWidth + 1;
    return out;
  }, name);
}

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  // ---------- Hochkant 428×926
  let { ctx, page } = await seite(browser, { width: 428, height: 926 });
  erg.hoch = {};
  erg.hoch.layout = await layoutCheck(page, 'hochkant');
  await page.screenshot({ path: OUT + '/hoch-start.png' });
  // Listen
  erg.hoch.listen = await page.evaluate(() => {
    const w = window.__ws2; const A = w.AEND, v11 = A.filter(a => a.fassung === 'v11');
    return { aend: A.length, v11: v11.length, pruef: w.PRUEF.stellen.length, anzP: document.getElementById('anzP').textContent, anzA: document.getElementById('anzA').textContent,
      lMaster: document.getElementById('lMaster').href, lDownload: document.getElementById('lMaster').getAttribute('download') };
  });
  erg.hoch.download_status = await page.evaluate(async () => (await fetch(document.getElementById('lMaster').href, { method: 'HEAD' })).status);
  await page.click('#tabA'); await sleep(100);
  await page.click('#listeA .filter button[data-f="v11"]'); await sleep(100);
  erg.hoch.filterV11 = await page.evaluate(() => document.querySelectorAll('#listeA .zeile').length);
  await page.screenshot({ path: OUT + '/hoch-liste-a.png', fullPage: true });
  await page.click('#tabP'); await sleep(100);
  erg.hoch.listeP = await page.evaluate(() => [...document.querySelectorAll('#listeP .zeile')].map(z => z.querySelector('.wann small').textContent + ' ' + z.querySelector('b').textContent));
  await page.screenshot({ path: OUT + '/hoch-liste-p.png', fullPage: true });
  // Prüfstelle antippen -> springt hin, spielt v11 im Kreis
  await page.click('#listeP .zeile:first-of-type button[data-tu="hin"]');
  await sleep(2500);
  erg.hoch.pruefHin = await page.evaluate(() => { const w = window.__ws2, Z = w.Z; return { spielt: Z.spielt, hoeren: Z.hoeren, ab: Z.ab, bereich: Z.bereich, pos: +Z.pos.toFixed(3), laufPos: w.laufPos(), info: document.getElementById('infoText').textContent.slice(0, 80) } });
  await page.click('#listeP .zeile:first-of-type button[data-tu="ab"]'); await sleep(400);
  erg.hoch.pruefAB = await page.evaluate(() => ({ hoeren: window.__ws2.Z.hoeren, spielt: window.__ws2.Z.spielt }));
  await page.click('#bSpiel'); await sleep(200);
  // Zwiebel: alle vier Schichten an, Staffelung ganz
  await page.evaluate(() => { for (const s of ['gereinigt', 'timing']) { const b = document.querySelector('.zAug[data-s="' + s + '"]'); if (b.getAttribute('aria-pressed') !== 'true') b.click() } });
  const h0 = await page.evaluate(() => document.getElementById('buehne').getBoundingClientRect().height);
  await page.evaluate(() => window.__ws2.staffelSetzen(1)); await sleep(400);
  const h1 = await page.evaluate(() => document.getElementById('buehne').getBoundingClientRect().height);
  erg.hoch.zwiebel = await page.evaluate(() => { const l = window.__ws2.lanes(); return Object.fromEntries(Object.entries(l).map(([k, v]) => [k, [Math.round(v.yc), Math.round(v.half)]])) });
  erg.hoch.buehneHoehe = [Math.round(h0), Math.round(h1)];
  await page.evaluate(() => window.__ws2.ansicht(30.5, 6)); await sleep(500);
  await page.screenshot({ path: OUT + '/hoch-zwiebel-getrennt.png' });
  await page.evaluate(() => window.__ws2.staffelSetzen(.5)); await sleep(300);
  await page.screenshot({ path: OUT + '/hoch-zwiebel-halb.png' });
  await page.evaluate(() => window.__ws2.ansicht(216, 8)); await sleep(500);
  await page.screenshot({ path: OUT + '/hoch-zwiebel-sprechstelle.png' });
  erg.hoch.diffAnteil = await page.evaluate(() => { const w = window.__ws2, r = {}; for (const [a, b] of [['original', 'gereinigt'], ['gereinigt', 'timing'], ['timing', 'ende']]) { const I = w.diffI(a, b); let n = 0; for (const v of I) if (v) n++; r[a + '>' + b] = +(100 * n / I.length).toFixed(1) + ' %' } return r });
  // Spur antippen (getrennt) -> diese Schicht hören
  await page.evaluate(() => window.__ws2.staffelSetzen(1)); await sleep(300);
  const lane = await page.evaluate(() => { const w = window.__ws2, l = w.lanes().timing, r = document.getElementById('buehne').getBoundingClientRect(); return { x: r.left + r.width * .5, y: r.top + l.yc } });
  await page.touchscreen.tap(lane.x, lane.y); await sleep(600);
  erg.hoch.spurTippen = await page.evaluate(() => ({ hoeren: window.__ws2.Z.hoeren, vor: !!(window.__ws2.VOR && window.__ws2.VOR.an) }));
  // Legende: Name antippen -> hören
  await page.click('.zHoer[data-h="gereinigt"]'); await sleep(500);
  erg.hoch.legendeHoeren = await page.evaluate(() => ({ hoeren: window.__ws2.Z.hoeren, pressed: document.querySelector('.zHoer[data-h="gereinigt"]').getAttribute('aria-pressed') }));
  await page.evaluate(() => window.__ws2.staffelSetzen(0)); await sleep(200);
  erg.hoch.layout2 = await layoutCheck(page, 'hochkant nach Bedienung');

  // ---------- Dehnen: offline rendern (gleicher Weg wie beim Abspielen)
  erg.dehnen = await page.evaluate(async () => {
    const w = window.__ws2, S = w.SIL, ORD = w.ORD;
    // „hyp“ (Strophe 2) um +80 ms
    const i = ORD.find(j => S[j].text.toLowerCase().startsWith('hyp')), dT = { [i]: .08 }, a = S[i].a;
    const P = w.plan(dT), ged = P.filter(p => p.k && p.k !== 1).map(p => ({ d0: +p.d0.toFixed(3), d1: +p.d1.toFixed(3), k: +p.k.toFixed(4) }));
    const r = await w.renderOffline(a - 1, a + 1, dT, false);
    const x = r.x; let nan = 0, maxSprung = 0; for (let j = 1; j < x.length; j++) { if (!isFinite(x[j])) nan++; const d = Math.abs(x[j] - x[j - 1]); if (d > maxSprung) maxSprung = d }
    // Pegel in 10-ms-Rahmen um den Anker: gedehnt vs. ohne Dehnen (Lücke)
    const rms = (y, t0, t1) => { let s = 0, n = 0; for (let j = Math.floor(t0 * 48000); j < Math.floor(t1 * 48000); j++) { s += y[j] * y[j]; n++ } return 10 * Math.log10(s / n + 1e-12) };
    // Zum Vergleich: ohne Dehnen (alte Vorschau)
    document.getElementById('bDehnen').click();
    const P2 = w.plan(dT); const r2 = await w.renderOffline(a - 1, a + 1, dT, false);
    document.getElementById('bDehnen').click();
    return { silbe: S[i].text, anker: +a.toFixed(3), gedehnteStuecke: ged, nan, maxSprung: +maxSprung.toFixed(4), stueckeOhne: P2.length,
      luecke_db_gedehnt: +rms(x, 1.0, 1.08).toFixed(1), luecke_db_ohne: +rms(r2.x, 1.0, 1.08).toFixed(1), wsola_ms: (w.MESS.dehn || []).slice(-6) };
  });
  // WSOLA-Qualität: reiner Ton 220 Hz um 25 % gedehnt -> Frequenz bleibt
  erg.wsolaTon = await page.evaluate(() => {
    const w = window.__ws2, sr = 48000, n = sr, x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = Math.sin(2 * Math.PI * 220 * i / sr) * .5;
    const y = w.wsola(x, 4800, .8, 24000, sr);   // k=0,8 -> 25 % länger
    let z = 0; for (let i = 2001; i < 22000; i++) if (y[i - 1] < 0 && y[i] >= 0) z++;
    let mx = 0, mn = 9; for (let i = 2000; i < 22000; i++) { const v = Math.abs(y[i]); if (v > mx) mx = v }
    let env = []; for (let b = 2000; b < 22000; b += 480) { let m = 0; for (let i = b; i < b + 480; i++) m = Math.max(m, Math.abs(y[i])); env.push(m) }
    return { hz: +(z / (20000 / sr)).toFixed(1), spitze: +mx.toFixed(3), huelle_min: +Math.min(...env).toFixed(3), huelle_max: +Math.max(...env).toFixed(3) };
  });
  // Ziehen mit dem Finger: Silbe „hyp“ fassen und 60 px nach rechts
  await page.evaluate(() => { window.__ws2.ansicht(110.5, 7) }); await sleep(500);
  const box = await page.evaluate(() => { const w = window.__ws2, i = w.ORD.find(j => w.SIL[j].text.toLowerCase().startsWith('hyp')), b = w.sylBox().find(s => s.i === i), r = document.getElementById('buehne').getBoundingClientRect(); return b ? { x: r.left + b.x + b.w / 2, y: r.top + b.y + b.h / 2 } : null });
  if (box) {
    const cdp = await ctx.newCDPSession(page);
    const tp = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
    await tp('touchStart', box.x, box.y); for (let k = 1; k <= 12; k++) { await tp('touchMove', box.x + k * 5, box.y); await sleep(40) } await sleep(300);
    erg.ziehen_waehrend = await page.evaluate(() => ({ vor: !!(window.__ws2.VOR && window.__ws2.VOR.an), musik: window.__ws2.VOR ? window.__ws2.VOR.spuren.map(s => s.art) : null }));
    await page.screenshot({ path: OUT + '/hoch-ziehen.png' });
    await tp('touchEnd'); await sleep(700);
    erg.ziehen = await page.evaluate(() => ({ zuege: Object.keys(window.__ws2.ZG.d).length, letzt: !!window.__ws2.LETZT, vorherKnopf: !document.getElementById('bVorher').hidden, vorspiel: !!(window.__ws2.VOR), status: document.getElementById('sendeStatus').textContent }));
    await page.click('#bVorher'); await sleep(400);
    erg.vorherAB = await page.evaluate(() => ({ zeig: window.__ws2.LETZT.zeig, knopf: document.getElementById('bVorher').textContent, vor: !!(window.__ws2.VOR && window.__ws2.VOR.an) }));
    await page.screenshot({ path: OUT + '/hoch-nach-zug.png' });
    erg.sendung = await page.evaluate(() => { const s = window.__ws2.bauSendung('test')[0].daten; return { vorschau: s.vorschau, text: s.text, z: s.zuege.map(z => ({ v: z.versatz_ms, d: z.dehnung_davor_pct, a: z.dehnung_ab_silbe_pct })) } });
    await page.click('#bUndo'); await sleep(200);
  }
  // ---------- Raster gegen Musik (im Browser dekodiert, gleicher Weg wie beim Abspielen)
  erg.raster = await page.evaluate(async () => {
    const w = window.__ws2, sr = 48000, out = [];
    function anschlaege(y, minAbst) { // Hochpass (Differenz), 0,5-ms-Hülle, Anstieg gegen 10 ms davor
      const h = 24, n = Math.floor(y.length / h), env = new Float32Array(n);
      for (let i = 0; i < n; i++) { let m = 0; for (let j = i * h + 1; j < (i + 1) * h; j++) { const v = Math.abs(y[j] - y[j - 1]); if (v > m) m = v } env[i] = m }
      const s = [...env].sort((a, b) => a - b), ref = s[Math.floor(s.length * .995)]; const res = []; let last = -1e9;
      for (let i = 20; i < n - 30; i++) { let pv = 0; for (let j = i - 20; j < i; j++) if (env[j] > pv) pv = env[j]; if (env[i] - pv > .25 * ref && i * h / sr - last > minAbst) {
          let pk = 0, jp = i; for (let j = i; j < i + 30; j++) if (env[j] > pk) { pk = env[j]; jp = j } let k = jp; while (k > i - 20 && env[k] > pv + .2 * (pk - pv)) k--; res.push((k + 1) * h / sr); last = i * h / sr } }
      return res }
    for (const [von, bis] of [[40, 52], [100, 112], [176, 188], [232, 244]]) {
      const m = await w.renderOfflineMusik(von, bis, false), k = await w.renderOfflineMusik(von, bis, true);
      const am = anschlaege(m, .08), ak = anschlaege(k, .2);
      // Klick-Anschläge gegen Raster (Konstruktion) und Musik-Anschläge gegen nächsten Klick
      const kdev = ak.map(t => { const g = Math.round((t + von) / .5) * .5; return (t + von - g) * 1000 });
      const mdev = am.map(t => { let b = 1e9; for (const c of ak) if (Math.abs(t - c) < Math.abs(b)) b = t - c; return b * 1000 }).filter(v => Math.abs(v) < 60);
      const med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null };
      const absmax = a => a.length ? Math.max(...a.map(Math.abs)) : null;
      out.push({ von, bis, klicks: ak.length, klick_gegen_raster_med_ms: +(med(kdev) || 0).toFixed(2), musik_anschlaege: mdev.length, musik_gegen_klick_med_ms: +(med(mdev) || 0).toFixed(2),
        musik_gegen_klick_p90_ms: mdev.length ? +[...mdev].map(Math.abs).sort((a, b) => a - b)[Math.floor(mdev.length * .9)].toFixed(2) : null, versatz_mix_ms: Object.entries(w.MESS.versatz).filter(([k]) => k.startsWith('mix')).map(([k, v]) => k + ':' + v.ms + '/' + v.korr) });
    }
    return out;
  });
  erg.uhr = await page.evaluate(() => { const c = window.__ws2.AE.ctx; return c ? { hoerZeit: +window.__ws2.hoerZeit().toFixed(4), currentTime: +c.currentTime.toFixed(4), outputLatency: c.outputLatency, baseLatency: c.baseLatency, ts: !!c.getOutputTimestamp } : null });
  // Master-Zeile
  await page.click('#bMaster'); await sleep(1500);
  erg.master = await page.evaluate(() => ({ spielt: window.__ws2.MW.spielt, t: window.__ws2.MA.v11.currentTime, paused: window.__ws2.MA.v11.paused, zeit: document.getElementById('masterZeit').textContent }));
  await page.click('#segMaster button[data-m="v10"]'); await sleep(1500);
  erg.masterAB = await page.evaluate(() => ({ wahl: window.__ws2.MW.wahl, v10: +window.__ws2.MA.v10.currentTime.toFixed(2), v10paused: window.__ws2.MA.v10.paused, v11paused: window.__ws2.MA.v11.paused, v11: +window.__ws2.MA.v11.currentTime.toFixed(2) }));
  await page.click('#bMaster'); await sleep(200);
  erg.prof = await page.evaluate(() => Object.fromEntries(Object.entries(window.__ws2.PROF).map(([k, v]) => [k, { n: v.n, max: +v.max.toFixed(1), mittel: +(v.sum / v.n).toFixed(2) }])));
  await ctx.close();

  // ---------- Quer 926×428
  ({ ctx, page } = await seite(browser, { width: 926, height: 428 }));
  erg.quer = {};
  erg.quer.layout = await layoutCheck(page, 'quer');
  erg.quer.fassungIn = await page.evaluate(() => document.getElementById('fassung').parentNode.id);
  await page.screenshot({ path: OUT + '/quer-start.png' });
  await page.evaluate(() => { for (const s of ['gereinigt', 'timing']) { const b = document.querySelector('.zAug[data-s="' + s + '"]'); if (b.getAttribute('aria-pressed') !== 'true') b.click() } window.__ws2.staffelSetzen(1); window.__ws2.ansicht(107, 6) });
  await sleep(500);
  await page.screenshot({ path: OUT + '/quer-zwiebel.png' });
  erg.quer.layout2 = await layoutCheck(page, 'quer Zwiebel');
  await ctx.close();
  await browser.close();
  fs.writeFileSync(OUT + '/ergebnis.json', JSON.stringify(erg, null, 1));
  console.log(JSON.stringify(erg, null, 1));
})().catch(e => { console.error('TESTFEHLER', e); process.exit(1) });
