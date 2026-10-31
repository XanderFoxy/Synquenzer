// G9U T7: F3 (Tipp bei laufendem ▶: ▶ hält an, dann spielt der Abschnitt; der Text-Modus bleibt) und Fokus im Dock (Tasten behalten den Fokus)
import {launch, open, clickTake, sleep, report, SET} from './h.mjs';
const ok = report(), br = await launch(); const {p, errs} = await open(br);
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
const tk = await clickTake(p, Array.from({length: 16}, (_, k) => 0.3 + k * 0.22), 4);
await SET(p, tk.id, {op: 'text', text: 'a b c d e f g h', lang: 'de'});
await p.evaluate(r => { SYNQUENZER.wpOpen(r); SYNQUENZER.g9Text(r, true); }, tk.ref); await sleep(200);
await p.evaluate(() => SYNQUENZER.play()); await sleep(400);
ok(await p.evaluate(() => R.playing), '▶ läuft');
let g = await p.evaluate(() => SYNQUENZER.g9Geom());
await p.touchscreen.tap((g.sx[3][0] + g.sx[3][1]) / 2, g.bar.y + 22); await sleep(80);
const st = await p.evaluate(() => ({playing: R.playing, g9: !!(WP.ed && WP.ed.g9), pl: SYNQUENZER.g9PlayLog().pop()}));
ok(!st.playing && st.g9 && st.pl.k === 3, 'F3: Tipp bei ▶ → ▶ hält an, Abschnitt 4 spielt, Text-Modus bleibt');
// Dock: Tasten behalten den Fokus, Tipp auf die Leiste auch
await p.evaluate(() => { WP.ed.g9.field.focus({preventScroll: true}); SYNQUENZER.g9KbSim(440); }); await sleep(200);
let n = 0, tot = 0;
for (const key of ['next', 'prev', 'sr', 'sl', 'next']) { g = await p.evaluate(() => SYNQUENZER.g9Geom()); const b = g.btn[key]; tot++; await p.touchscreen.tap(b.x + b.w / 2, b.y + b.h / 2 + 6); await sleep(60);
  const i = await p.evaluate(() => SYNQUENZER.g9Info()); if (i.ed.focus && i.ed.dock) n++; }
g = await p.evaluate(() => SYNQUENZER.g9Geom()); tot++; await p.touchscreen.tap(g.bar.x + g.bar.w * .6, g.bar.y + 22); await sleep(60);
{ const i = await p.evaluate(() => SYNQUENZER.g9Info()); if (i.ed.focus && i.ed.dock) n++; }
ok(n === tot, 'Dock: nach jedem Tipp (◀ ▶ ‹ › Leiste) Fokus im Feld, Dock bleibt (' + n + '/' + tot + ')');
ok(errs.length === 0, 'keine Fehler ' + errs.join('|'));
process.exitCode = ok.done(); await br.close();
