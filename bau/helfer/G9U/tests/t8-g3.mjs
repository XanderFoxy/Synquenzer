// G9U T8: G3-Anlauf im Text-Modus (§7.2): Ansicht beginnt bei a.in − Anlauf, Silben davor wählbar und spielbar, heller als „außerhalb“
import {launch, open, clickTake, sleep, report, SET} from './h.mjs';
const ok = report(), br = await launch(); const {p, errs} = await open(br);
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
const tk = await clickTake(p, Array.from({length: 16}, (_, k) => 0.3 + k * 0.22), 4);
// Stück beginnt bei 1,0 s im Take, hörbarer Anlauf 0,6 s (wie G3 ihn ablegt)
await p.evaluate(([r, id]) => { const c = S.tracks[r.t].clips[r.s]; c.audio.in = 1.0; S.takes[id].pre = {in: 1.0, sec: 0.6}; }, [tk.ref, tk.id]);
await SET(p, tk.id, {op: 'text', text: 'Auf-takt Lie-be ist ein Feu-er', lang: 'de'});
await p.evaluate(r => { SYNQUENZER.wpOpen(r); SYNQUENZER.g9Text(r, true); }, tk.ref); await sleep(250);
const va = await p.evaluate(() => WP.ed.va);
ok(Math.abs(va - 0.4) < 0.02, 'Ansicht beginnt bei a.in − Anlauf = 0,4 s (' + va.toFixed(3) + ')');
const g = await p.evaluate(() => SYNQUENZER.g9Geom());
const k = 1; await p.touchscreen.tap((g.sx[k][0] + g.sx[k][1]) / 2, g.bar.y + 22); await sleep(80);
const pl = await p.evaluate(() => SYNQUENZER.g9PlayLog().pop()), i = await p.evaluate(() => SYNQUENZER.g9Info());
ok(i.ed.sel === k && pl.k === k && pl.a < 1.0, 'Auftakt-Silbe vor dem Clip-Anfang wählbar und spielbar (Abschnitt ' + (k + 1) + ', ' + pl.a.toFixed(3) + ' s)');
const lum = await p.evaluate(([xa, xb]) => { const cv = WP.ed.cv, c = cv.getContext('2d'), d = window.devicePixelRatio || 1, r = cv.getBoundingClientRect(); const L = x => { const px = c.getImageData(Math.round((x - r.left) * d), 2 * d, 1, 1).data; return px[0] + px[1] + px[2]; }; return [L(xa), L(xb)]; }, [g.wave.x + (g.sx[0][0] - 6 > 0 ? g.sx[0][0] - 6 : 2), g.wave.x + (g.sx[0][0] + g.sx[0][1]) / 2 + 3]);
ok(lum[1] > lum[0], 'G3-Anlauf heller als „außerhalb“: ' + lum[0] + ' / im Anlauf ' + lum[1]);
ok(errs.length === 0, 'keine Fehler ' + errs.join('|'));
process.exitCode = ok.done(); await br.close();
