// G10e E: Layout (428×926, 926×428, 428×650 + 390×844, 375×667, 320×568), ✕ immer erreichbar, Ziele ≥ 44 px, kein Layout-Sprung (G10-43),
// Bildrate beim Pinch/Schwenken auf einem 32-s-Take mit 4× CPU-Bremse (G10-35: p95 ≤ 16,7 ms), Regel-Prüfungen der Datei
import {launch, open, take, sleep, ok, fails, pinch, drag, geom, info, openEd, OUT, APP} from './h.mjs';
import fs from 'fs';
fs.mkdirSync(OUT, {recursive: true});
const br = await launch();
const T = Array.from({length: 12}, (_, k) => 0.5 + k * 0.3 + [0, .018, -.022, .031][k % 4]);
// treffbare Höhe/Breite durch Abtasten (die App verlängert Tasten teils unsichtbar, auch einseitig)
const hit = (p, sel) => p.evaluate(sel => {
  const b = document.querySelector(sel); if (!b) return {ok: false, why: 'fehlt'};
  const r = b.getBoundingClientRect(), cx = r.x + r.width / 2, cy = r.y + r.height / 2, vw = innerWidth, vh = innerHeight;
  const on = (x, y) => { const e = document.elementFromPoint(x, y); return !!e && (e === b || b.contains(e)); };
  const span = (f, lo, hi) => { let best = 0, run = 0; for (let v = lo; v <= hi; v += .5) { if (f(v)) { run += .5; best = Math.max(best, run); } else run = 0; } return best; };
  const hh = span(y => on(cx, y), cy - 40, cy + 40), ww = span(x => on(x, cy), cx - 60, cx + 60);
  const inV = r.x >= 0 && r.y >= 0 && r.right <= vw + .5 && r.bottom <= vh + .5;
  return {ok: inV && hh >= 43.5 && ww >= 43.5, w: Math.round(r.width), h: Math.round(r.height), hitH: hh, hitW: ww, inV};
}, sel);
const sizes = [[428, 926], [926, 428], [428, 650], [390, 844], [375, 667], [320, 568]];
for (const [w, h] of sizes) {
  const H = await open(br, {width: w, height: h}), p = H.p, c = H.cdp, tag = w + '×' + h, must = (w === 428 || w === 926);
  const {id, ref} = await take(p, T);
  await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
  await p.evaluate(r => SYNQUENZER.wpQuantize(r, {grid: '1/16', strength: 1, mode: 'stretch'}), ref);
  await openEd(p, ref, id);
  await p.evaluate(id => SYNQUENZER.wpPlayed(id, 0, 1), id);
  const x = await hit(p, '#wpSheet .sh-x');
  ok(x.ok, tag + ': ✕ sichtbar und ganz zu treffen ' + JSON.stringify(x));
  const bad = [];
  for (const sel of ['#wpSheet .g10add', '#wpSheet .g10more', '#wpSheet .wpz', '#wpSheet .wpab', '#wpSheet .wptx', '#wpSheet .wpchips button:nth-child(1)', '#wpSheet .wpchips button:nth-child(6)', '#wpSheet .wpmode button']) {
    const r = await hit(p, sel); if (!r.ok) bad.push(sel.replace('#wpSheet ', '') + JSON.stringify(r));
  }
  ok(!bad.length, tag + ': Ziele ≥ 44 px und frei (Werkzeuge, Zoom, A/B, Text, Raster, Modus) ' + bad.join(' '));
  const lay = await p.evaluate(() => { const sh = document.querySelector('#wpSheet'), cut = [...sh.querySelectorAll('button')].filter(b => b.offsetParent && b.scrollWidth > b.clientWidth + .5).map(b => b.textContent.trim());
    const m = sh.querySelector('.g10map').getBoundingClientRect(), cv = sh.querySelector('.wpcv').getBoundingClientRect();
    return {cut, map: Math.round(m.height), wave: Math.round(cv.height), sheet: JSON.stringify(sh.getBoundingClientRect()), body: document.documentElement.scrollHeight, bw: document.documentElement.scrollWidth, vw: innerWidth}; });
  ok(!lay.cut.length && lay.bw <= lay.vw, tag + ': nichts abgeschnitten, kein seitliches Scrollen ' + JSON.stringify(lay.cut));
  const port = h > w;
  ok(lay.wave >= (port && h <= 700 ? 55 : 100) && (port && h <= 600 ? lay.map === 0 : lay.map >= (port && h <= 700 ? 32 : 48)), tag + ': Welle ' + lay.wave + ' px, Mini-Karte ' + lay.map + ' px');
  // kein Layout-Sprung beim Zoomen, Pinch, Mini-Karte, ⋯-Blatt
  const g = await geom(p);
  await pinch(c, g.x + g.w / 2, g.y + g.h * .7, 60, 220, 8);
  await p.evaluate(() => SYNQUENZER.g10Zoom()); await p.evaluate(() => SYNQUENZER.g10View(0.3, 2.0));
  const mp = await p.evaluate(() => { const r = document.querySelector('#wpSheet .g10map').getBoundingClientRect(); return {x: r.x, y: r.y + r.height / 2, w: r.width, h: r.height}; });
  if (mp.h) await drag(c, mp.x + mp.w * .3, mp.y, mp.x + mp.w * .7, mp.y, 6); else await p.evaluate(() => SYNQUENZER.g10View(2.3, null));
  await sleep(150);
  const lay2 = await p.evaluate(() => ({sheet: JSON.stringify(document.querySelector('#wpSheet').getBoundingClientRect()), body: document.documentElement.scrollHeight}));
  ok(lay2.sheet === lay.sheet && lay2.body === lay.body, tag + ': kein Layout-Sprung (Pinch, Zoom-Taste, Mini-Karte)');
  const v = await info(p);
  ok(v.ed.va > .3, tag + ': Mini-Karte wischen springt dorthin (Sicht ab ' + v.ed.va.toFixed(2) + ' s)');
  if (must) {
    await p.evaluate(() => SYNQUENZER.g10View(0.4, 2.0)); await sleep(100);
    await p.screenshot({path: `${OUT}/e-${w}x${h}.png`});
    const mo = await p.evaluate(() => { const r = document.querySelector('#wpSheet .g10more').getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; });
    await (await import('./h.mjs')).tap(c, mo.x, mo.y); await sleep(200);
    const pop = await p.evaluate(() => { const q = document.querySelector('.pop.g10opt'); if (!q) return null; const r = q.getBoundingClientRect(); const small = [...q.querySelectorAll('button')].filter(b => b.getBoundingClientRect().height < 44).length; return {in: r.x >= 0 && r.y >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, small}; });
    ok(pop && pop.in && !pop.small, tag + ': ⋯-Blatt ganz im Bild, Tasten ≥ 44 px ' + JSON.stringify(pop));
    await p.screenshot({path: `${OUT}/e-${w}x${h}-opt.png`});
    await p.evaluate(() => SYNQUENZER.g10Pop());
  }
  ok(!H.errs.length, tag + ': keine Konsolen-Fehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.ctx.close();
}
// ---------- Bildrate: 32-s-Take, 4× CPU-Bremse ----------
{
  const H = await open(br, {width: 428, height: 926}), p = H.p, c = H.cdp;
  const TT = Array.from({length: 100}, (_, k) => 0.5 + k * 0.31 + [0, .018, -.022, .031][k % 4]);
  const {id, ref} = await take(p, TT, 32, 17);
  await p.evaluate(r => SYNQUENZER.wpQuantize(r, {grid: '1/16', strength: 1, mode: 'stretch'}), ref);
  await openEd(p, ref, id);
  await p.evaluate(id => SYNQUENZER.wpPlayed(id, 0, 1), id);
  await p.evaluate(() => SYNQUENZER.g10View(0, 0)); await sleep(200);
  await c.send('Emulation.setCPUThrottlingRate', {rate: 4});
  const g = await geom(p);
  await p.evaluate(() => { window.__raf = []; let l = performance.now(); const f = t => { window.__raf.push(t - l); l = t; if (window.__raf.length < 4000) requestAnimationFrame(f); }; requestAnimationFrame(f); SYNQUENZER.g10Perf(true); });
  for (let n = 0; n < 6; n++) { await pinch(c, g.x + g.w * (.3 + n * .08), g.y + g.h * .7, 50, 260, 20, 16); await pinch(c, g.x + g.w * .5, g.y + g.h * .7, 260, 50, 20, 16); }
  for (let n = 0; n < 4; n++) await drag(c, g.x + 300, g.y + 80, g.x + 60, g.y + 80, 20, 16);
  const fr = await p.evaluate(() => SYNQUENZER.g10Perf(false));
  await c.send('Emulation.setCPUThrottlingRate', {rate: 1});
  const s = fr.slice().sort((a, b) => a - b), q = x => s[Math.min(s.length - 1, Math.floor(x * s.length))];
  ok(s.length > 100 && q(.95) <= 16.7, 'G10-35 Bildzeit beim Pinch/Schwenken (32-s-Take, 4× CPU-Bremse): ' + s.length + ' Bilder, Median ' + q(.5).toFixed(2) + ' ms, p95 ' + q(.95).toFixed(2) + ' ms, max ' + s[s.length - 1].toFixed(2) + ' ms');
  const raf = await p.evaluate(() => window.__raf.slice(5)), rs = raf.slice().sort((a, b) => a - b);
  console.log('  rAF-Abstand (Chromium headless, nur Hinweis): Median ' + rs[rs.length >> 1].toFixed(1) + ' ms, p95 ' + rs[Math.floor(rs.length * .95)].toFixed(1) + ' ms');
  ok(!H.errs.length, 'Bildrate: keine Konsolen-Fehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.ctx.close();
}
// ---------- Regel-Prüfungen der Datei ----------
{
  const s = fs.readFileSync(APP, 'utf8'), base = fs.readFileSync(new URL('../../../snapshots/R-4300.html', import.meta.url), 'utf8');
  const cnt = (x, re) => (x.match(re) || []).length;
  ok(cnt(s, /MS 2000/g) === 1, '„MS 2000“ genau 1×');
  ok(s.split('\n').filter(l => l.startsWith('  live: true,')).length === 1, 'Zeile „  live: true,“ genau 1×');
  ok(!/korg|microkorg|radias|dwgs|kodamo|mask1/i.test(s) && cnt(s, /Nord/g) === cnt(base, /Nord/g) && cnt(s, /Kompakt/g) === 0, 'keine verbotenen Namen');
  ok(/const VERSION = '4\.30\.0'/.test(s), 'VERSION unverändert 4.30.0');
  const add = fs.readFileSync(new URL('../src/g10e.js', import.meta.url), 'utf8');
  ok(!/supabase|fetch\(|XMLHttpRequest|\.rpc\(/i.test(add) && cnt(s, /supabase/gi) === cnt(base, /supabase/gi), 'kein neuer Datenbank- oder Netz-Zugriff');
}
await br.close();
console.log(fails() ? 'FEHLER: ' + fails() : 'ALLES GRÜN');
process.exit(fails() ? 1 : 0);
