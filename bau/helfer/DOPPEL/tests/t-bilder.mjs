// DOPPEL C: Bildschirmfotos der Rollen-Aktionsleiste vorher (R-4300) / nachher (DOPPEL) in 428×926, 926×428, 428×650,
// die Leiste so gescrollt, dass Spiegeln am linken Rand steht (danach Achse, Umdrehen, Teilen, Verbinden, Tauschen); dazu das ganze Fenster
import {open, ok, sleep, clipRoll, OLD, APP, HERE} from './lib.mjs';
import path from 'path'; import fs from 'fs';
const DIR = path.join(HERE, 'bilder'); fs.mkdirSync(DIR, {recursive: true});
for (const [w, h] of [[428, 926], [926, 428], [428, 650]]) for (const [tag, file] of [['vorher', OLD], ['nachher', APP]]) {
  const H = await open(w, h, {file, dpr: 2});
  await clipRoll(H, null, {len: 1});
  const r = await H.E(() => { const acts = window.SYNQUENZER.rollApi().el.acts, m = [...acts.querySelectorAll('button')].find(b => b.textContent.trim() === 'Spiegeln');
    acts.scrollLeft = m.offsetLeft - 8; const q = acts.getBoundingClientRect(); return {x: q.left, y: q.top, w: q.width, h: q.height}; });
  await sleep(150);
  const f = `leiste-${w}x${h}-${tag}.png`;
  await H.p.screenshot({path: path.join(DIR, f), clip: {x: r.x, y: Math.max(0, r.y - 6), width: r.w, height: r.h + 12}});
  await H.p.screenshot({path: path.join(DIR, `rolle-${w}x${h}-${tag}.png`)});
  ok(true, `${f}: Leiste ${Math.round(r.w)}×${Math.round(r.h)} px`);
  await H.b.close();
}
