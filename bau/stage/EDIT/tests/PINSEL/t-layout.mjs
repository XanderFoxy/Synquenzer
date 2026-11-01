// PINSEL D: Layout 428×926 hoch und quer (Touch-Ziele ≥ 44 px, Beschriftung nicht abgeschnitten, keine Seitenhöhen-Änderung,
// keine Emoji-Grafik), Bildrate beim Malen (4 Takte 1/16, CPU ×2 gedrosselt; ×4 nur berichtet), Bildschirmfotos
import {open, ok, sleep, clipRoll, done, failed, HERE} from './lib.mjs';
import path from 'path';
const SHOT = process.env.SHOTS || path.join(HERE, 'shots');
import fs from 'fs'; fs.mkdirSync(SHOT, {recursive: true});
const run = Array.from({length: 64}, (_, i) => ({t: i * .25, d: .25, n: [60, 62, 64, 65, 67, 69, 71, 72][(i * 3) % 8], v: .8}));
for (const [w, h, name] of [[428, 926, 'hoch'], [926, 428, 'quer']]) {
  const H = await open(w, h);
  await clipRoll(H, run, {len: 4});
  const page = () => H.E(() => ({sh: document.documentElement.scrollHeight, ih: innerHeight, sw: document.documentElement.scrollWidth, iw: innerWidth, mh: Math.round(window.SYNQUENZER.rollApi().el.main.getBoundingClientRect().height)}));
  const p0 = await page();
  const check = async (what) => {
    const r = await H.E(() => [...document.querySelectorAll('.pr-bar button.mpb')].filter(b => b.offsetWidth).map(b => { const q = b.getBoundingClientRect(), a = getComputedStyle(b, '::after');
      return {t: b.textContent, w: q.width, h: q.height + (a.content !== 'none' ? -parseFloat(a.top) - parseFloat(a.bottom) : 0), cut: b.scrollWidth > b.clientWidth + 1, emoji: /\p{Extended_Pictographic}/u.test(b.textContent.replace(/[↕↔⇆]/g, ''))}; }));
    ok(r.length > 0, `${name} ${what}: ${r.length} Knöpfe sichtbar`);
    const small = r.filter(b => b.w < 44 || b.h < 44), cut = r.filter(b => b.cut), em = r.filter(b => b.emoji);
    ok(!small.length, `${name} ${what}: Touch-Ziele ≥ 44 px` + (small.length ? ' ' + JSON.stringify(small.slice(0, 3)) : ''));
    ok(!cut.length, `${name} ${what}: keine Beschriftung abgeschnitten` + (cut.length ? ' ' + JSON.stringify(cut.slice(0, 3)) : ''));
    ok(!em.length, `${name} ${what}: keine Emoji-Grafik`);
    const p = await page();
    ok(p.sh <= p.ih && p.sw <= p.iw && p.sh === p0.sh && p.mh === p0.mh, `${name} ${what}: Seite ${p.iw}×${p.ih}, kein Überlauf, keine Höhenänderung (Notenfeld ${p.mh} px)`);
  };
  await check('Grundzustand');
  if (name === 'quer') { const tw = await H.E(() => document.querySelector('#rollSheet .rht').getBoundingClientRect().width); ok(Math.abs(tw - 108) <= 1, `quer: Kopf-Titel so breit wie in R-4261 (108 px; ist ${tw.toFixed(1)})`); }
  await H.tapBtn('.pr-bar button', 'Pinsel'); await check('Pinsel');
  await H.p.screenshot({path: path.join(SHOT, `pinsel-${name}.png`)});
  await H.tapBtn('.pr-bar button', 'Tonart: Auto'); await check('Tonart-Leiste');
  await H.tapBtn('.pr-bar button', 'Fertig');
  await H.tapBtn('.pr-bar button', 'Mithören'); await check('Mithören-Leiste');
  await H.p.screenshot({path: path.join(SHOT, `mithoeren-${name}.png`)});
  await H.tapBtn('.pr-bar button', 'Fertig');
  // Bildrate beim Malen: Zug über 4 Takte hin und her, 2 s, Bewegung alle 16 ms; CPU ×2 (Prüfgrenze) und ×4 (nur Bericht)
  await H.tapBtn('.pr-bar button', 'Pinsel'); await H.tapBtn('.pr-bar button', 'breit');
  await H.E(() => window.SYNQUENZER.rollApi().fitView('clip'));
  await sleep(200);
  const R = await H.E(() => { const r = window.SYNQUENZER.rollApi().el.main.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height}; });
  await H.E(() => { let t0 = 0; window.addEventListener('pointermove', () => { t0 = performance.now(); }, true); window.addEventListener('pointermove', () => { if (window.__hc) window.__hc.push(performance.now() - t0); }, false); });
  for (const rate of [2, 4]) {
    await H.cdp.send('Emulation.setCPUThrottlingRate', {rate});
    await H.E(() => { window.__fr = []; window.__hc = []; const f = t => { window.__fr.push(t); if (window.__fr.length < 2000 && !window.__stop) requestAnimationFrame(f); }; window.__stop = false; requestAnimationFrame(f); });
    await H.down(R.x + 10, R.y + R.h / 2);
    const T0 = Date.now(); let k = 0;
    while (Date.now() - T0 < 2000) { k++; const f = (k % 120) / 120, x = R.x + 10 + (R.w - 20) * (f < .5 ? 2 * f : 2 - 2 * f), y = R.y + R.h / 2 + Math.sin(k / 6) * R.h * .3; await H.move(x, y); await sleep(16); }
    await H.up(); await sleep(100);
    const st = await H.E(() => { window.__stop = true; const fr = window.__fr, d = []; for (let i = 1; i < fr.length; i++) d.push(fr[i] - fr[i - 1]); d.sort((a, b) => a - b); const hc = window.__hc.slice().sort((a, b) => a - b);
      return {fps: 1000 / (d.reduce((a, b) => a + b, 0) / d.length), p95: d[Math.floor(d.length * .95)], hc50: hc[hc.length >> 1], hc95: hc[Math.floor(hc.length * .95)], moves: hc.length}; });
    await H.cdp.send('Emulation.setCPUThrottlingRate', {rate: 1});
    const txt = `${name}: Bildrate beim Malen ${st.fps.toFixed(1)} fps (CPU ×${rate}; 95 % der Bilder ≤ ${st.p95.toFixed(1)} ms; Pinsel-Verarbeitung je Bewegung Median ${st.hc50.toFixed(2)} ms, 95 % ${st.hc95.toFixed(2)} ms, ${st.moves} Bewegungen)`;
    if (rate === 2) ok(st.fps >= 55, txt); else console.log('  (Bericht) ' + txt);
    await sleep(200);
  }
  ok(await H.E(() => window.SYNQUENZER.getClip(0, 0).notes.length) === 64, `${name}: Pinsel löscht und erzeugt keine Noten`);
  await done(H, 'Layout ' + name);
}
process.exit(failed() ? 1 : 0);
