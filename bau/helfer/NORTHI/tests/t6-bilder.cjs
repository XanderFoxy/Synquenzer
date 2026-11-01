// T6: Bildschirmfotos 428×926, 926×428, 428×650 (Drum-Kopf mit Drums | North, Reiter North, Menü-Zeile, Engine-Liste, Hinweis) + Überlauf-Prüfung
const H = require('./h.cjs');
const SIZES = [[428, 926, 'p428'], [926, 428, 'l926'], [428, 650, 'p650']];
const over = p => p.evaluate(() => { const hd = document.querySelector('.sheet.open .sh-head') || document.querySelector('#drumSheet .sh-head'); if (!hd) return 'kein Kopf';
  const r = hd.getBoundingClientRect(); return [...hd.querySelectorAll('button')].filter(b => b.offsetParent && (b.getBoundingClientRect().right > r.right + .5 || b.getBoundingClientRect().left < r.left - .5)).map(b => b.textContent).concat(hd.scrollWidth > hd.clientWidth + 1 ? ['scroll'] : []); });
(async () => {
  const b = await H.browser();
  for (const [w, h, tag] of SIZES) {
    const p = await H.page(b, {w, h, url: 'http://localhost:8766/Synquenzer/'});
    await p.evaluate(() => { const D = window.SYNQUENZER; D.loadKit('Fell & Holz'); D.selectTrack(4); D.openEditor(); }); await p.waitForTimeout(400);
    const seg = await p.evaluate(() => { const s = document.querySelector('#drumSheet .ndiinst'); if (!s) return null; const r = s.getBoundingClientRect(); return {w: r.width, vis: r.width > 0 && r.height > 0, on: [...s.querySelectorAll('button.on')].map(b => b.textContent)}; });
    H.ok(seg && seg.vis && seg.on.join() === 'North', tag + ': Kopf zeigt [Drums | North], North an (Kit Fell & Holz)', seg);
    const o1 = await over(p); H.ok(Array.isArray(o1) && o1.length === 0, tag + ': Drum-Kopf ohne Überlauf', o1);
    await H.shot(p, tag + '-drum-north');
    await p.evaluate(() => window.SYNQUENZER.openBrowser(4)); await p.waitForTimeout(400);
    const rows = await p.evaluate(() => [...document.querySelectorAll('.brlist .brow .bmain b')].map(x => x.textContent));
    H.ok(rows.join('|') === 'Fell & Holz|Modell-Analog|Gestimmt|Schräg|North leer', tag + ': Browser öffnet Reiter North mit 5 Zeilen', rows);
    const chipH = await p.evaluate(() => { const c = document.querySelector('.brcats .chip[data-c="north"]').getBoundingClientRect(); return [Math.round(c.width), Math.round(c.height)]; });
    H.ok(chipH[0] >= 44, tag + ': Reiter-Chip North >= 44 px breit', chipH);
    await H.shot(p, tag + '-kits-north');
    await p.evaluate(() => window.SYNQUENZER.openMenu('info')); await p.waitForTimeout(400);
    await p.evaluate(() => { const r = [...document.querySelectorAll('.irow')].find(r => r.querySelector('.lbl').textContent === 'North'); if (r) r.scrollIntoView({block: 'center'}); }); await p.waitForTimeout(200);
    await H.shot(p, tag + '-menu-north');
    await p.evaluate(() => window.SYNQUENZER.closeMenu());
    await p.evaluate(async () => { const txt = "<script>const VERSION = '4.31.0';</script>"; const ca = await caches.open('synq-app-1'); await ca.put(new URL('./', location.href).href, new Response(txt, {headers: {etag: '"x"'}})); await window.SYNQUENZER.ndiUpdCheck(true); });
    await p.waitForTimeout(200);
    const box = await p.evaluate(() => { const e = document.querySelector('.ndiupd'); if (!e) return null; const r = e.getBoundingClientRect(); return {l: r.left, r: r.right, vw: innerWidth}; });
    H.ok(box && box.l >= 0 && box.r <= box.vw, tag + ': Update-Hinweis im Bild', box);
    await H.shot(p, tag + '-update');
    H.ok(p.errs.length === 0, tag + ': keine Seitenfehler', p.errs);
    await H.closePage(p);
  }
  await b.close(); H.done('T6 Bilder');
})().catch(e => { console.error(e); process.exit(2); });
