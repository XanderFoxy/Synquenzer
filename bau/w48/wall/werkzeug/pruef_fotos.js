// Prüfung: Fotos (DPR 2), Sprung-Stichproben, Fehler – lokal, fremde Anfragen abgefangen, Senden wird NIE gedrückt
const { chromium } = require('playwright');
const PORT = process.env.PORT || 9163, URL = `http://localhost:${PORT}/the-wall/werkstatt2/index.html`;
const W = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const erg = { fehler: [], fremd: [], senden: 0 };
async function seite(browser, vp) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.route('**/*', r => { const u = r.request().url(); if (u.startsWith(`http://localhost:${PORT}/`)) return r.continue(); erg.fremd.push(u); return r.abort(); });
  page.on('pageerror', e => erg.fehler.push(vp.width + ' pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') erg.fehler.push(vp.width + ' console: ' + m.text()) });
  await page.goto(URL);
  await page.waitForFunction(() => document.getElementById('laden').hidden && window.__ws2 && window.__ws2.PRUEF && window.__ws2.AEND, null, { timeout: 30000 });
  await page.evaluate(() => { document.getElementById('bSenden').addEventListener('click', e => { window.__SENDEN = (window.__SENDEN || 0) + 1; e.stopImmediatePropagation(); e.preventDefault() }, true) });
  return { ctx, page };
}
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  let { ctx, page } = await seite(browser, { width: 428, height: 926 });
  // Foto oben: Kopf + neue Zeile
  const fb = await page.evaluate(() => { scrollTo(0, 0); const r = document.getElementById('fassung').getBoundingClientRect(); return { y: r.bottom } });
  await page.screenshot({ path: W + '/foto-oben.png', clip: { x: 0, y: 0, width: 428, height: Math.ceil(fb.y + 12) } });
  erg.oben = await page.evaluate(async () => { const a = document.getElementById('lMaster'); return { text: document.getElementById('fassung').innerText.replace(/\s+/g, ' '), href: a.getAttribute('href'), status: (await fetch(a.href, { method: 'HEAD' })).status } });
  // Sprung-Stichproben: 2× „Was geändert wurde“, 1× Prüfstelle
  await page.click('#tabA'); await sleep(100); await page.click('#listeA .filter button[data-f="v11"]'); await sleep(100);
  erg.spruenge = [];
  for (const k of [0, 2]) {
    const r = await page.evaluate(k => { const b = document.querySelectorAll('#listeA button[data-hin]')[k]; const z = b.closest('.zeile'); const eintrag = +b.dataset.hin; b.click(); const w = window.__ws2, Z = w.Z;
      return { liste: 'Was geändert wurde', eintrag, zeile: z.querySelector('.wann').innerText.replace(/\s+/g, ' '), pos: +Z.pos.toFixed(3), anzeige: document.getElementById('zeit') ? document.getElementById('zeit').innerText : null, sichtbar: [+Z.t0.toFixed(2), +(Z.t0 + Z.dur).toFixed(2)], bereich: Z.bereich } }, k);
    r.abw = +(r.pos - r.eintrag).toFixed(3); erg.spruenge.push(r); await sleep(300);
  }
  await page.click('#tabP'); await sleep(100);
  const rp = await page.evaluate(() => { const z = document.querySelectorAll('#listeP .zeile')[1], p = window.__ws2.PRUEF.stellen.find(x => x.id === z.dataset.p); z.querySelector('button[data-tu="hin"]').click(); const Z = window.__ws2.Z;
    return { liste: 'Prüfstellen', eintrag: p.zeit_s, bis: p.bis_s, zeile: z.querySelector('.wann').innerText.replace(/\s+/g, ' '), pos: +Z.pos.toFixed(3), mitte: +(Z.t0 + Z.dur / 2).toFixed(2), bereich: Z.bereich, spielt: Z.spielt } });
  rp.abw = +(rp.pos - rp.eintrag).toFixed(3); erg.spruenge.push(rp);
  await sleep(900); rp.nach900ms = await page.evaluate(() => +window.__ws2.laufPos().toFixed(3));
  await page.click('#bSpiel'); await sleep(200);
  // Foto Prüfstellen-Liste
  await page.evaluate(() => document.querySelector('.tabs').scrollIntoView({ block: 'start' })); await sleep(300);
  await page.screenshot({ path: W + '/foto-pruefstellen.png' });
  // Foto Zwiebel: alle Schichten an, Staffelung mittel
  await page.evaluate(() => { for (const s of ['original', 'gereinigt', 'timing', 'ende']) { const b = document.querySelector('.zAug[data-s="' + s + '"]'); if (b && b.getAttribute('aria-pressed') !== 'true') b.click() } window.__ws2.staffelSetzen(.5); window.__ws2.ansicht(30.5, 6) });
  await sleep(600);
  const zr = await page.evaluate(() => { scrollTo(0, 0); const b = document.getElementById('buehne').getBoundingClientRect(), s = document.getElementById('staffelLeiste').getBoundingClientRect(), z = document.querySelector('.zw') ? document.querySelector('.zw').closest('.leiste').getBoundingClientRect() : s; return { y0: b.top + scrollY, y1: Math.max(s.bottom, z.bottom) + scrollY, staffel: document.getElementById('staffel').value, lanes: Object.fromEntries(Object.entries(window.__ws2.lanes()).map(([k, v]) => [k, [Math.round(v.yc), Math.round(v.top)]])) } });
  erg.zwiebel = zr;
  await page.evaluate(() => document.getElementById('sende').style.visibility = 'hidden');
  await page.screenshot({ path: W + '/foto-zwiebel.png', fullPage: true, clip: { x: 0, y: Math.max(0, zr.y0 - 8), width: 428, height: Math.ceil(zr.y1 - zr.y0 + 16) } });
  await page.evaluate(() => document.getElementById('sende').style.visibility = '');
  erg.senden = await page.evaluate(() => window.__SENDEN || 0);
  await ctx.close();
  // Quer: Bild nach Korrektur
  ({ ctx, page } = await seite(browser, { width: 926, height: 428 }));
  erg.quer = await page.evaluate(() => [...document.querySelectorAll('#segHoeren button')].map(b => b.textContent + ':' + (b.scrollWidth > b.clientWidth + 1 ? 'ABGESCHNITTEN' : 'ok') + ':' + Math.round(b.getBoundingClientRect().width)));
  await page.screenshot({ path: W + '/pruef/quer-nach.png' });
  await ctx.close(); await browser.close();
  console.log(JSON.stringify(erg, null, 1));
})().catch(e => { console.error('TESTFEHLER', e); process.exit(1) });
