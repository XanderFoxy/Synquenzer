// SX11 4: Layout des Marken-Blatts mit der Zeile „Fassung“ – 428×926, 926×428, 428×650 (Touch): Ziele ≥ 44 px, keine abgeschnittene
// Beschriftung, das Blatt passt in den Bildschirm, die Seitenhöhe springt nicht; Tipp per Finger schaltet; Bilder nach out/
import { open, buildSong, ok, summary, OUT } from './lib.mjs';
let fail = 0;
for (const [w, h, tag] of [[428, 926, 'hochkant'], [926, 428, 'quer'], [428, 650, 'kurz']]) {
  console.log(tag + ' ' + w + '×' + h);
  const {b, p, errs} = await open({w, h, dpr: 2});
  await buildSong(p, {cats: true});
  await p.evaluate(() => { setSongView(true); });
  await p.waitForTimeout(300);
  const H0 = await p.evaluate(() => [document.documentElement.scrollHeight, document.body.scrollHeight, window.innerHeight]);
  const meas = () => p.evaluate(() => {
    const el = UI.pop && UI.pop.el; if (!el) return null;
    const r = el.getBoundingClientRect(), row = el.querySelector('.sx-r');
    const bs = [...row.querySelectorAll('button')].map(x => { const q = x.getBoundingClientRect(), sm = x.querySelector('small'); return {t: x.textContent, w: Math.round(q.width), h: Math.round(q.height), cut: x.scrollWidth > x.clientWidth + 1 || (sm ? sm.scrollWidth > sm.clientWidth + 1 : false), y: q.y, b: q.bottom}; });
    const all = [...el.querySelectorAll('button')].filter(x => x.offsetParent && !x.classList.contains('ms-x'))   // ✕: Trefferfläche per ::before 44 px (wie bisher)
     .map(x => { const q = x.getBoundingClientRect(); return {t: x.textContent.slice(0, 20), w: q.width, h: q.height}; });
    return {top: r.top, bottom: r.bottom, vh: window.innerHeight, bs, small: all.filter(x => x.w < 44 - .5 || x.h < 44 - .5)};
  });
  await p.evaluate(() => openMarkSheet('M3')); await p.waitForTimeout(250);
  let m = await meas();
  ok(m && m.bs.length === 4 && m.bs.every(x => x.w >= 44 && x.h >= 44), tag + ': [Leicht] [Voll] [⧉ Variante] [Einfügen] ≥ 44 px', m && m.bs);
  ok(m && m.bs.every(x => !x.cut), tag + ': keine Beschriftung abgeschnitten', m && m.bs.filter(x => x.cut));
  ok(m && m.small.length === 0, tag + ': alle Knöpfe im Blatt ≥ 44 px', m && m.small);
  ok(m && m.top >= 0 && m.bottom <= m.vh + .5, tag + ': Blatt im Bild (' + Math.round(m.top) + '–' + Math.round(m.bottom) + ' von ' + m.vh + ')', m && {top: m.top, bottom: m.bottom});
  await p.screenshot({path: `${OUT}/${tag}-1-voll.png`});
  // Tipp mit dem Finger auf [Leicht]
  const L = m.bs[0]; await p.touchscreen.tap(L.y ? (await p.evaluate(() => { const q = UI.pop.el.querySelector('button[data-sx="l"]').getBoundingClientRect(); return q.x + q.width / 2; })) : 0, (L.y + L.b) / 2);
  await p.waitForTimeout(250);
  ok(await p.evaluate(() => SYNQUENZER.markFassung('M3')) === 'l', tag + ': Tipp auf [Leicht] → leicht');
  m = await meas();
  ok(m && m.bs[0].t.startsWith('Leicht') && /S3 S4 aus · DR dünn/.test(m.bs[0].t) && m.bs.every(x => !x.cut), tag + ': Leicht zeigt, was aus ist: „' + (m && m.bs[0].t) + '“', m && m.bs);
  ok(await p.evaluate(() => UI.pop.el.querySelector('button[data-sx="l"]').getAttribute('aria-pressed')) === 'true', tag + ': [Leicht] gedrückt (aria-pressed)');
  await p.screenshot({path: `${OUT}/${tag}-2-leicht.png`});
  await p.evaluate(() => { const q = UI.pop.el.querySelector('button[data-sx="cp"]').getBoundingClientRect(); window.__q = [q.x + q.width / 2, q.y + q.height / 2]; });
  const q = await p.evaluate(() => window.__q); await p.touchscreen.tap(q[0], q[1]); await p.waitForTimeout(150);
  await p.evaluate(() => { closePop(); }); await p.waitForTimeout(150);
  await p.evaluate(() => openMarkSheet('M2')); await p.waitForTimeout(250);
  const pe = await p.evaluate(() => { const x = UI.pop.el.querySelector('button[data-sx="pa"]'); const r = x.getBoundingClientRect(); return {dis: x.disabled, x: r.x + r.width / 2, y: r.y + r.height / 2, aria: x.getAttribute('aria-label')}; });
  ok(!pe.dis && /Refrain leicht/.test(pe.aria), tag + ': in der Strophe [Einfügen] bereit (' + pe.aria + ')');
  await p.touchscreen.tap(pe.x, pe.y); await p.waitForTimeout(250);
  ok(await p.evaluate(() => SYNQUENZER.markFassung('M2')) === 'l', tag + ': Tipp auf [Einfügen] → Strophe leicht');
  await p.screenshot({path: `${OUT}/${tag}-3-eingefuegt.png`});
  // Bearbeiten-Ansicht in der leichten Fassung
  { const e = await p.evaluate(() => { const r = UI.pop.el.querySelector('button[data-s012="edit"]').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }); await p.touchscreen.tap(e[0], e[1]); await p.waitForTimeout(250); }
  const ed = await p.evaluate(() => ({h: UI.pop.el.querySelector('.ms-h').textContent, cs: [...UI.pop.el.querySelectorAll('.s0-c')].map(x => x.textContent), cut: [...UI.pop.el.querySelectorAll('.s0-c, .ms-h span')].filter(x => x.scrollWidth > x.clientWidth + 1).map(x => x.textContent)}));
  ok(/Leicht/.test(ed.h) && ed.cs.some(x => /^Dünn/.test(x)) && ed.cs.filter(x => /aus$/.test(x)).length === 2, tag + ': Bearbeiten zeigt „Leicht“, Drums „Dünn“, zwei Spuren aus', ed);
  await p.screenshot({path: `${OUT}/${tag}-4-bearbeiten.png`});
  await p.evaluate(() => closePop()); await p.waitForTimeout(200);
  const H1 = await p.evaluate(() => [document.documentElement.scrollHeight, document.body.scrollHeight, window.innerHeight]);
  ok(JSON.stringify(H0) === JSON.stringify(H1), tag + ': Seitenhöhe unverändert', {H0, H1});
  await p.screenshot({path: `${OUT}/${tag}-5-song.png`});
  ok(errs.length === 0, tag + ': keine Konsolenfehler', errs);
  await b.close();
}
process.exit(summary('SX11-Layout') ? 1 : 0);
