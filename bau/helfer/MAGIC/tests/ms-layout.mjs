// MAGIC Layout 428×926 hoch / 926×428 quer (+ 390×844, 320×568): Zeile sichtbar, Knöpfe ≥ 44 px, kein Seiten-Überlauf, Tonart-Wahl; Bildrate beim Wischen
import { open, roll, swipe, line, xy, ok, done } from './lib.mjs';
const SHOT = process.env.SHOT || '/tmp/ms-shots/';
import fs from 'fs'; fs.mkdirSync(SHOT, {recursive: true});
for (const [name, w, h] of [['P428', 428, 926], ['L926', 926, 428], ['P390', 390, 844], ['P320', 320, 568]]) {
  const {b, p, errs} = await open({width: w, height: h});
  await roll(p, {root: 9, scale: 'aeolian'}, [{t: 0, d: 1, n: 57, v: .8}, {t: 0, d: 1, n: 60, v: .8}, {t: 0, d: 1, n: 64, v: .8}]);
  const H0 = await p.evaluate(() => [document.documentElement.scrollHeight, document.documentElement.scrollWidth]);
  const L = await p.evaluate(() => {
    const ed = window.SYNQUENZER.rollApi(); ed.ms.setOn(true); ed.ms.setTool('msWipe');
    const vis = el => { const r = el.getBoundingClientRect(); return el.offsetParent && r.width > 0; };
    const row = ed.ms.el.row, rr = row.getBoundingClientRect(), main = ed.el.main.getBoundingClientRect(), mg = ed.ms.el.magic.getBoundingClientRect(), pen = [...ed.el.bar.querySelectorAll('button')].find(b => b.title === 'Zeichnen').getBoundingClientRect();
    const bs = [...row.querySelectorAll('button')].filter(vis).map(b => { const r = b.getBoundingClientRect(); return {t: b.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height), cut: b.scrollWidth > b.clientWidth + 1}; });
    return {row: [rr.left, rr.top, rr.width, rr.height].map(Math.round), inView: rr.top >= 0 && rr.bottom <= innerHeight + 1, main: Math.round(main.height), magic: [Math.round(mg.width), Math.round(mg.height), Math.round(pen.height)], bs,
      sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight, vw: innerWidth, vh: innerHeight};
  });
  await p.waitForTimeout(100);
  console.log('==', name, JSON.stringify({row: L.row, main: L.main, magic: L.magic}));
  ok(L.inView && L.row[3] >= 44, name + ': Magic-Zeile im Bild, ' + L.row[3] + ' px hoch');
  ok(L.bs.every(x => x.h >= 44 && x.w >= 44 && !x.cut), name + ': Knöpfe ≥ 44 px, nichts abgeschnitten ' + L.bs.map(x => x.t + ' ' + x.w + '×' + x.h + (x.cut ? ' CUT' : '')).join(' | '));
  ok(L.magic[1] === L.magic[2] && L.magic[0] >= 44, name + ': [Magic] in der Werkzeugleiste so hoch wie ✎ (' + L.magic.join('/') + ')');
  ok(L.sw <= L.vw && L.sh === H0[0], name + ': kein Seiten-Überlauf / Seitenhöhe gleich (' + L.sh + ' / ' + H0[0] + ')');
  ok(L.main >= 120, name + ': Notenfläche bleibt nutzbar (' + L.main + ' px)');
  await p.screenshot({path: SHOT + 'ms-' + name + '-wischen.png'});
  // Tonart-Auswahl
  const kp = await p.evaluate(async () => { const ed = window.SYNQUENZER.rollApi(); const b = [...ed.ms.el.row.querySelectorAll('button')].find(x => x.textContent.includes('▾')); b.click(); await new Promise(r => setTimeout(r, 50));
    const k = ed.ms.el.kp, r = k.getBoundingClientRect(), bs = [...k.querySelectorAll('button')].map(x => { const q = x.getBoundingClientRect(); return [Math.round(q.width), Math.round(q.height), x.scrollWidth > x.clientWidth + 1]; });
    return {open: !k.hidden, inView: r.top >= 0 && r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1, n: bs.length, small: bs.filter(x => x[1] < 44 || x[0] < 40 || x[2])}; });
  await p.screenshot({path: SHOT + 'ms-' + name + '-tonart.png'});
  ok(kp.open && kp.inView && kp.n === 15 && !kp.small.length, name + ': Tonart-Wahl offen, 15 Knöpfe, alle ≥ 44 hoch ' + JSON.stringify(kp.small));
  const pick = await p.evaluate(async () => { const ed = window.SYNQUENZER.rollApi(), k = ed.ms.el.kp; [...k.querySelectorAll('button')].find(x => x.textContent === 'D').click(); await new Promise(r => setTimeout(r, 30));
    [...k.querySelectorAll('button')].find(x => x.textContent === 'Dur').click(); await new Promise(r => setTimeout(r, 30)); return [ed.ms.state.manual, k.hidden, ed.ms.state.keyLabel]; });
  ok(pick[0] && pick[0].root === 2 && pick[0].scale === 'ionian' && pick[1] && /D-Dur/.test(pick[2]), name + ': Tonart D-Dur gewählt → ' + pick[2]);
  // Akkorde-Ansicht
  await p.evaluate(() => { const ed = window.SYNQUENZER.rollApi(); ed.ms.setTool('msChord'); ed.centerOn(60); });
  await p.waitForTimeout(100); await p.screenshot({path: SHOT + 'ms-' + name + '-akkorde.png'});
  const chk = await p.evaluate(() => { const ed = window.SYNQUENZER.rollApi(); return [...ed.ms.el.row.querySelectorAll('button')].filter(b => b.offsetParent).map(b => b.textContent.trim()); });
  ok(chk.includes('Umk. ▲') && chk.includes('Umk. ▼') && chk.includes('Glatt'), name + ': Akkord-Knöpfe sichtbar');
  // Bildrate beim Wischen (rAF-Abstände während eines 2-s-Zugs)
  if (name === 'P428' || name === 'L926') {
    await p.evaluate(() => { const ed = window.SYNQUENZER.rollApi(); ed.ms.setTool('msWipe'); ed.centerOn(64); ed.setLen(4); ed.fitView('clip'); window.__fr = []; let last = performance.now(); const f = t => { window.__fr.push(t - last); last = t; if (window.__fr.length < 2000 && !window.__frStop) requestAnimationFrame(f); }; requestAnimationFrame(f); });
    const a = await xy(p, .05, 60), c = await xy(p, 15.9, 72);
    await p.evaluate(() => { window.__fr.length = 0; });
    await swipe(p, line(a, c, 120), {stepMs: 16});
    const fr = await p.evaluate(() => { window.__frStop = true; const f = window.__fr.slice(2); const avg = f.reduce((s, x) => s + x, 0) / f.length; const s = f.slice().sort((x, y) => x - y); return {n: f.length, fps: Math.round(1000 / avg), p95: Math.round(s[Math.floor(s.length * .95)]), max: Math.round(s[s.length - 1]), notes: window.SYNQUENZER.getClip(0, 0).notes.length}; });
    console.log('   Bildrate', JSON.stringify(fr));
    ok(fr.fps >= 50 && fr.p95 <= 34, name + `: Wischen flüssig (${fr.fps} fps, p95 ${fr.p95} ms, max ${fr.max} ms, ${fr.notes} Noten)`);
  }
  ok(errs.length === 0, name + ': keine Konsolenfehler ' + JSON.stringify(errs));
  await b.close();
}
done();
