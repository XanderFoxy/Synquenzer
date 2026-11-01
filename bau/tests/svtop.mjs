// Song-Leiste: Knöpfe messen (Breite/Höhe, Überlauf) in mehreren Größen
import { chromium } from 'playwright';
const file = process.argv[2], shot = process.argv[3];
const b = await chromium.launch();
for (const [w, h] of [[428, 926], [390, 844], [375, 667], [926, 428]]) {
  const p = await b.newPage({viewport: {width: w, height: h}, hasTouch: true, isMobile: true});
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + file); await p.waitForTimeout(1200);
  await p.evaluate(() => { try { SYNQUENZER.demo && SYNQUENZER.demo(); } catch (e) {} });
  await p.evaluate(() => { try { SYNQUENZER.songView(true); } catch (e) {} }); await p.waitForTimeout(500);
  const r = await p.evaluate(() => { 
    const top = document.querySelector('#songView .sv-top'); if (!top) return 'kein sv-top';
    const tr = top.getBoundingClientRect();
    return {top: [Math.round(tr.width), Math.round(tr.height), top.scrollWidth > top.clientWidth + 1 ? 'UEBERLAUF' : 'ok'],
      btn: [...top.children].filter(e => !e.hidden && getComputedStyle(e).display !== 'none').map(e => { const q = e.getBoundingClientRect(); return e.className.replace(/rb sv-b |rb /g, '') + ':' + Math.round(q.width) + 'x' + Math.round(q.height) + (q.right > tr.right + 1 || e.scrollWidth > e.clientWidth + 2 ? '!' : ''); }).join(' ')};
  });
  console.log(w + 'x' + h, JSON.stringify(r), errs.length ? errs : '');
  if (shot) await p.screenshot({path: shot.replace('.png', '-' + w + '.png')});
  await p.close();
}
await b.close();
