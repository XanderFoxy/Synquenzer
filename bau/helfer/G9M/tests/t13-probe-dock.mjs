// G9M T13: Probe-Ergebnis G9-61 – Tastatur offen (g9KbSim 394 = iPhone hoch): keine Haptik-Labels, auf iOS kein Label-Klick per Code;
// Tastatur zu: Labels sichtbar, Tipp → Label-Klick (Tick vom echten Tipp)
import {launch, open, clickTake, sleep, report, SET} from './h.mjs';
const ok = report(), br = await launch(); const {p, errs} = await open(br, {viewport: {width: 428, height: 733}});
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
const tk = await clickTake(p, Array.from({length: 16}, (_, k) => 0.3 + k * 0.22), 4);
await SET(p, tk.id, {op: 'text', text: 'a b c d e f g h', lang: 'de'});
await p.evaluate(r => { SYNQUENZER.wpOpen(r); SYNQUENZER.g9Text(r, true); }, tk.ref); await sleep(200);
await p.evaluate(() => { HAP.ios = true; window.__hc = 0; const o = HAP.lbl.click.bind(HAP.lbl); HAP.lbl.click = () => { window.__hc++; o(); }; });
await p.evaluate(() => { WP.ed.g9.field.focus({preventScroll: true}); SYNQUENZER.g9KbSim(394); }); await sleep(250);
const d = await p.evaluate(() => ({dock: SYNQUENZER.g9Info().ed.dock, hap: EL.wpSheet.classList.contains('hap'), vis: [...document.querySelectorAll('#wpSheet .g9hl')].filter(n => getComputedStyle(n).display !== 'none').length}));
ok(d.dock && d.dock.H === 300 && !d.hap && d.vis === 0, 'Tastatur offen (394 px): Dock 300 px, keine Haptik-Labels ' + JSON.stringify(d));
let g = await p.evaluate(() => SYNQUENZER.g9Geom());
for (const key of ['next', 'prev', 'sr']) { g = await p.evaluate(() => SYNQUENZER.g9Geom()); const b = g.btn[key]; await p.touchscreen.tap(b.x + b.w / 2, b.y + b.h / 2 + 6); await sleep(80); }
g = await p.evaluate(() => SYNQUENZER.g9Geom()); await p.touchscreen.tap(g.bar.x + g.bar.w * .6, g.bar.y + 22); await sleep(80);
const r1 = await p.evaluate(() => ({hc: window.__hc, foc: SYNQUENZER.g9Info().ed.focus, dock: !!SYNQUENZER.g9Info().ed.dock}));
ok(r1.hc === 0 && r1.foc && r1.dock, 'im Dock (iOS): 0 Label-Klicks per Code, Fokus + Dock bleiben ' + JSON.stringify(r1));
await p.evaluate(() => { SYNQUENZER.g9KbSim(null); WP.ed.g9.field.blur(); SYNQUENZER.g9KbSim(null); }); await sleep(250);
const d2 = await p.evaluate(() => ({dock: SYNQUENZER.g9Info().ed.dock, vis: [...document.querySelectorAll('#wpSheet .g9hl')].filter(n => getComputedStyle(n).display !== 'none').length}));
ok(!d2.dock && d2.vis > 0, 'Tastatur zu: Haptik-Labels wieder da ' + JSON.stringify(d2));
const hl0 = await p.evaluate(() => SYNQUENZER.g9HapLog().length);
g = await p.evaluate(() => SYNQUENZER.g9Geom()); await p.touchscreen.tap((g.sx[2][0] + g.sx[2][1]) / 2, g.bar.y + 22); await sleep(100);
const hl = await p.evaluate(() => SYNQUENZER.g9HapLog());
ok(hl.length === hl0 + 1 && !hl[hl.length - 1].dock, 'Tastatur zu: echter Tipp trifft das Label (Tick vom Label) ' + JSON.stringify(hl.slice(-1)));
ok(errs.length === 0, 'keine Fehler ' + errs.join('|'));
process.exitCode = ok.done(); await br.close();
