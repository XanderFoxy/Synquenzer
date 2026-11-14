// SPK5 A1: Fehler nachstellen – Auswahl ziehen → Zerlegen (Touch), hochkant + quer
import path from 'node:path';
import fs from 'node:fs';
import {start, page, box, btn, info, mixWav, openSpk} from './lib.mjs';
const file = path.resolve(process.argv[2]), out = path.resolve(process.argv[3] || path.join(path.dirname(file), 'fotos'));
fs.mkdirSync(out, {recursive: true});
const E = await start(file), errs = [], wav = mixWav(E.dir, 8);
for (const [w, h, tag] of [[428, 926, 'hoch'], [926, 428, 'quer']]) {
  const P = await page(E, w, h, errs); const {p, drag, tap} = P;
  await openSpk(P, wav);
  const mn = await box(p, '#spk1Sheet .spk1-mn');
  await drag([mn.x + mn.w * 0.3, mn.y + mn.h * 0.3], [mn.x + mn.w * 0.6, mn.y + mn.h * 0.8]);
  const a = await info(p);
  await p.screenshot({path: path.join(out, 'repro-' + tag + '-0-auswahl.png')});
  const zb = await btn(p, 'Zerlegen');
  const zbTxt = await p.evaluate(() => [...document.querySelectorAll('#spk1Sheet .spk1-ac button')].map(b => b.textContent + (b.disabled ? '(aus)' : '')));
  await tap(zb); await p.waitForTimeout(400);
  const ddOpen = await p.evaluate(() => { const d = document.querySelector('#spk1Sheet .spk1-dd'); return d && d.offsetParent ? d.textContent.slice(0, 120) : null; });
  await p.screenshot({path: path.join(out, 'repro-' + tag + '-1-nach-tipp.png')});
  if (ddOpen) { const z2 = await btn(p, 'Zerlegen (schnell'); await tap(z2); }
  let t0 = Date.now(), stats = [];
  for (let i = 0; i < 200; i++) { const s = (await info(p)).stat; if (stats[stats.length - 1] !== s) stats.push(s); if (/^Zerlegt|abgebrochen|Zerlegen:/.test(s)) break; await p.waitForTimeout(100); }
  await p.waitForTimeout(400);
  const b = await info(p);
  const ly = await p.evaluate(() => [...document.querySelectorAll('#spk1Sheet .spk1-lr')].map(r => { const q = r.getBoundingClientRect(); return r.dataset.l + ':' + r.textContent.replace(/\s+/g, ' ').slice(0, 30) + '@' + Math.round(q.top) + (q.bottom > innerHeight ? '(unsichtbar)' : ''); }));
  const lyBox = await box(p, '#spk1Sheet .spk1-ly');
  await p.screenshot({path: path.join(out, 'repro-' + tag + '-2-ergebnis.png')});
  console.log(JSON.stringify({tag, selVorher: a.sel, knoepfe: zbTxt, klappfenster: ddOpen, stats, ms: Date.now() - t0, selNachher: b.sel, layers: b.layers, tint: b.tint, ly, lyBox}, null, 1));
  await P.ctx.close();
}
console.log('errs', JSON.stringify(errs));
await E.b.close(); E.srv.close();
