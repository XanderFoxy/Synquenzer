// G9U T6: Geräte-Probe M-PROBE (A.8 H4): 7 Knöpfe ≥ 88 × 88, Anzeigen, Antworten, Label-Klick
import {launch, sleep, report, DIR} from './h.mjs';
import path from 'path';
const ok = report(), br = await launch();
for (const vp of [{width: 428, height: 926}, {width: 926, height: 428}, {width: 320, height: 568}]) {
  const ctx = await br.newContext({viewport: vp, hasTouch: true}), p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.join(DIR, '../probe.html')); await sleep(300);
  const pads = await p.evaluate(() => [...document.querySelectorAll('.pad,.bar7')].map(n => { const r = n.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; }));
  ok(pads.length === 7 && pads.every(([w, h]) => w >= 88 && h >= 88), vp.width + '×' + vp.height + ': 7 Knöpfe ≥ 88 × 88 ' + JSON.stringify(pads));
  const small = await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().height < 44).length);
  ok(small === 0, 'Antwort-Tasten ≥ 44 px hoch');
  // Label-Tipp 3: der Klick geht an das Label (Schalter wechselt)
  const r3 = await p.evaluate(() => { const r = document.querySelectorAll('.pad')[2].getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await p.evaluate(() => document.querySelectorAll('.pad')[2].scrollIntoView()); const r3b = await p.evaluate(() => { const r = document.querySelectorAll('.pad')[2].getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await p.touchscreen.tap(r3b[0], r3b[1]); await sleep(50);
  ok(await p.evaluate(() => document.querySelectorAll('.pad')[2].querySelector('input').checked), 'Knopf 3: echter Tipp schaltet das Kästchen im Label um');
  await p.evaluate(() => { document.querySelectorAll('.ans .y')[0].click(); document.querySelectorAll('.ans .n')[4].click(); });
  const t = await p.evaluate(() => document.getElementById('info').textContent);
  ok(/iOS:/.test(t) && /Ansicht:/.test(t) && /sichtbare Höhe mit Tastatur hoch/.test(t) && /crossOriginIsolated/.test(t) && /WebGPU-Adapter/.test(t) && /1=ja/.test(t) && /5=nein/.test(t), 'Anzeigen + Antworten im Kopier-Text');
  ok(errs.length === 0, 'keine Fehler ' + errs.join('|'));
  await ctx.close();
}
process.exitCode = ok.done(); await br.close();
