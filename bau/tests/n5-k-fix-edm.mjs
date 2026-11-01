// K1-fix: ⋯ (.edm / .mkqmore) and toast button hit areas, and what lies around them (elementFromPoint, 1 px grid), all 6 formats
import {launch, OUT} from './n5-k-blib.mjs';
const VPS = [[390, 844], [375, 667], [320, 568], [844, 390], [667, 375], [926, 428]];
const fn = () => {
  window.__hit = (e) => { const r = e.getBoundingClientRect(), cx = r.x + r.width / 2, cy = r.y + r.height / 2; let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (let y = Math.floor(cy - 40); y <= cy + 40; y++) for (let x = Math.floor(cx - 40); x <= cx + 40; x++) { const h = document.elementFromPoint(x, y); if (h && (h === e || e.contains(h))) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }
    return x1 < 0 ? [0, 0] : [x1 - x0 + 1, y1 - y0 + 1]; };
  window.__near = (e) => { const r = e.getBoundingClientRect(), cx = r.x + r.width / 2, cy = r.y + r.height / 2, S = new Map();
    for (let y = Math.floor(cy - 26); y <= cy + 26; y += 2) for (let x = Math.floor(cx - 26); x <= cx + 26; x += 2) { const h = document.elementFromPoint(x, y); if (!h || h === e || e.contains(h)) continue; const b = h.closest('button,[data-k],.knob,.kn,canvas,a') || h; const k = (b.tagName + '.' + String(b.className).replace(/\s+/g, '.')).slice(0, 50); if (!S.has(k)) { const q = b.getBoundingClientRect(); S.set(k, [q.x, q.y, q.width, q.height].map(Math.round).join(',')); } }
    return [...S].filter(([k]) => /BUTTON|knob|kn|CANVAS/.test(k)); };
};
const which = process.argv[2] || 'edm';
for (const [w, h] of VPS) {
  const {b, p, errs} = await launch({viewport: {width: w, height: h}, touch: true, mobile: true, dpr: 2});
  await p.evaluate(fn);
  await p.evaluate(async () => { mkLoad(); for (let i = 0; i < 60 && !mkLoaded(); i++) await new Promise(r => setTimeout(r, 100)); });
  for (const [t, id] of [[3, 'f-moog-bass'], [2, 'f-dx-tines'], [1, 'f-init-tabelle'], [0, 'f-mk-d05']]) {
    await p.evaluate(([t, id]) => { loadPreset(t, id); selectTrack(t); ED.tab = id.startsWith('f-mk') ? 'geraet' : 'osc'; openEditor(); }, [t, id]); await p.waitForTimeout(500);
    if (which === 'edm') {
      const r = await p.evaluate(() => { const x = [...EL.synthSheet.querySelectorAll('.edm, .mkqmore')].find(x => { const q = x.getBoundingClientRect(); return q.width > 0 && q.height > 0 && getComputedStyle(x).visibility !== 'hidden'; }); if (!x) return null; const q = x.getBoundingClientRect();
        return {cls: x.className.replace('hb rb ', ''), box: [q.x, q.y, q.width, q.height].map(Math.round).join(','), hit: __hit(x).join('x'), near: __near(x)}; });
      console.log(JSON.stringify({vp: w + 'x' + h, id, ...r}));
    } else {
      const r = await p.evaluate(() => { const L = SYNQUENZER.k1Mods(R.selT); if (!L.length) return null; SYNQUENZER.k1Open(R.selT); const x = document.querySelector('.pop.k1pop .k1x'); x.click(); return true; });
      await p.waitForTimeout(150);
      const q = await p.evaluate(() => [...document.querySelectorAll('#toast button')].filter(x => x.getBoundingClientRect().width > 0).map(x => { const q = x.getBoundingClientRect(); return {t: x.textContent, cls: document.getElementById('toast').className, box: [q.x, q.y, q.width, q.height].map(Math.round).join(','), hit: __hit(x).join('x'), near: __near(x)}; }));
      console.log(JSON.stringify({vp: w + 'x' + h, id, toast: q}));
      await p.evaluate(() => { closePop(); undo(); });
    }
  }
  if (errs.length) console.log('errs', errs.slice(0, 3));
  await b.close();
}
