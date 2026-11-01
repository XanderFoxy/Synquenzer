// B1 Bildschirmfotos + Maße der neuen Bedienstellen in 428x926, 926x428, 428x650 (Touch):
// Tempo-Fenster mit Taktart (T1), Marken-Blatt mit [Taktart ▾] (T1) und [Leicht][Voll][⧉][Einfügen] (SX11), Taktart aufgeklappt,
// LFO-Seite mit ✎ und Form-Blatt (N8I134). Jede Taste ≥ 44 px (Höhe; quer im Marken-Blatt wie die Nachbarn), im Bild, nicht abgeschnitten.
// node b1-shots.mjs <index.html> <Bildordner>
import {chromium} from 'playwright';
import path from 'path'; import fs from 'fs';
const FILE = path.resolve(process.argv[2]), DIR = process.argv[3] || '.';
fs.mkdirSync(DIR, {recursive: true});
let fails = 0, n = 0; const ok = (id, c, info) => { n++; if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const b = await chromium.launch();
const meas = (p, sel) => p.evaluate(sel => [...document.querySelectorAll(sel)].filter(e => e.offsetParent).map(e => { const r = e.getBoundingClientRect(); return {t: e.textContent.trim().slice(0, 14), w: Math.round(r.width), h: Math.round(r.height), cut: e.scrollWidth > e.clientWidth + 1, out: r.right > innerWidth + .5 || r.left < -.5 || r.bottom > innerHeight + .5 || r.top < -.5}; }), sel);
// zwei sichtbare Tasten, die sich überdecken (> 1 px), oder eine Taste, über der an ihrer Mitte etwas anderes liegt
const overlap = (p, sel) => p.evaluate(sel => { const bs = [...document.querySelectorAll(sel)].filter(e => e.offsetParent && !e.classList.contains('ms-x'))   /* ✕ ragt quer schon in 4.30.0 4 px in die erste Zeile */, R = bs.map(e => e.getBoundingClientRect()), out = [];
  for (let i = 0; i < bs.length; i++) { for (let j = i + 1; j < bs.length; j++) { const a = R[i], c = R[j]; if (Math.min(a.right, c.right) - Math.max(a.left, c.left) > 1 && Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top) > 1) out.push(bs[i].textContent.trim().slice(0, 10) + ' × ' + bs[j].textContent.trim().slice(0, 10)); }
    const e = document.elementFromPoint(R[i].left + R[i].width / 2, R[i].top + R[i].height / 2); if (R[i].top >= 0 && R[i].bottom <= innerHeight && !(e && (e === bs[i] || bs[i].contains(e)))) out.push(bs[i].textContent.trim().slice(0, 10) + ' verdeckt'); }
  return out; }, sel);
const bad = (a, minH) => a.filter(x => x.h < minH || x.w < 44 || x.cut || x.out);
const fmt = a => a.map(x => x.t + ' ' + x.w + '×' + x.h + (x.cut ? ' CUT' : '') + (x.out ? ' OUT' : '')).join(', ');
for (const [W, H] of [[428, 926], [926, 428], [428, 650]]) {
  const tag = W + 'x' + H;
  const ctx = await b.newContext({viewport: {width: W, height: H}, deviceScaleFactor: 2, hasTouch: true, isMobile: true}); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  await p.addStyleTag({content: '*{animation:none!important;transition:none!important;caret-color:transparent!important}'});
  await p.waitForTimeout(500);
  await p.evaluate(() => { const Q = SYNQUENZER; Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 4}, {scene: 2, bars: 2}]); S.song.marks = [{id: 'M1', a: 0, len: 2, part: null, name: 'Intro'}, {id: 'M2', a: 2, len: 4, part: null, name: 'Refrain'}, {id: 'M3', a: 6, len: 2, part: null, name: 'Outro'}]; tkBump(); Q.setSongTs('3/4', {quiet: true}); });
  // 1 Tempo-Fenster
  await p.evaluate(() => popBpm()); await p.waitForTimeout(250);
  const tb = await meas(p, '.t1ts button');
  ok(tag + ' Tempo-Fenster: 7 Taktart-Knöpfe ≥ 44, im Bild', tb.length === 7 && !bad(tb, 44).length, fmt(tb));
  { const o = await overlap(p, '.pop button'); ok(tag + ' Tempo-Fenster: keine Taste überdeckt eine andere', !o.length, o.slice(0, 4).join(', ')); }
  await p.screenshot({path: path.join(DIR, `b1-1-tempo-${tag}.png`)});
  await p.evaluate(() => closePop()); await p.waitForTimeout(150);
  // 2 Marken-Blatt (leicht im Refrain), dann Taktart aufgeklappt
  await p.evaluate(() => { setSongView(true); SYNQUENZER.markFassungSet('M2', 'l'); }); await p.waitForTimeout(200);
  await p.evaluate(() => openMarkSheet('M2')); await p.waitForTimeout(300);
  const mb = await meas(p, '.msheet .ms-b'), ref = Math.min(...mb.map(x => x.h));
  const sx = await meas(p, '.msheet button[data-sx]'), ts = await meas(p, '.msheet .ms-b[data-a="ts"]');
  ok(tag + ' Marken-Blatt: [Leicht][Voll][⧉][Einfügen] + [Taktart ▾] da', sx.length === 4 && ts.length === 1, fmt(sx.concat(ts)));
  ok(tag + ' Marken-Blatt: alle Tasten ≥ 44 (bzw. ≥ ' + ref + ' wie die Nachbarn), im Bild, nichts abgeschnitten', !bad(mb, Math.min(44, ref)).length && ref >= 44, fmt(bad(mb, 44)) + ' · min ' + ref);
  { const o = await overlap(p, '.msheet button'); ok(tag + ' Marken-Blatt: keine Taste überdeckt eine andere', !o.length, o.slice(0, 4).join(', ')); }
  await p.screenshot({path: path.join(DIR, `b1-2-marke-${tag}.png`)});
  await p.evaluate(() => { const pp = UI.pop && UI.pop.el; if (pp) { pp._ts = true; pp._paint(); popDock(pp); } }); await p.waitForTimeout(250);
  const mt = await meas(p, '.msheet .t1ts button'), sx2 = await meas(p, '.msheet button[data-sx]');
  ok(tag + ' Marken-Blatt Taktart aufgeklappt: 8 Knöpfe ≥ 44, Fassung-Zeile bleibt bedienbar', mt.length === 8 && !bad(mt, 44).length && sx2.length === 4 && !bad(sx2, 44).length, fmt(mt) + ' | ' + fmt(sx2));
  { const o = await overlap(p, '.msheet button'); ok(tag + ' Marken-Blatt Taktart aufgeklappt: keine Taste überdeckt eine andere', !o.length, o.slice(0, 4).join(', ')); }
  await p.screenshot({path: path.join(DIR, `b1-3-marke-taktart-${tag}.png`)});
  await p.evaluate(() => { closePop(); setSongView(false); }); await p.waitForTimeout(200);
  // 3 LFO-Seite mit ✎, dann Form-Blatt per Finger
  await p.evaluate(async () => { R.selT = 0; ED.tab = 'lfo'; openEditor(); await new Promise(r => setTimeout(r, 400)); });
  const lb = await meas(p, '[data-key="l1shape"] button');
  ok(tag + ' LFO-Form-Leiste: 6 Felder mit ✎, jedes ≥ 44 breit', lb.length === 6 && lb[5].t.includes('✎') && lb.every(x => x.w >= 44 && !x.cut && !x.out), fmt(lb));
  await p.screenshot({path: path.join(DIR, `b1-4-lfo-${tag}.png`)});
  const pen = await p.evaluate(() => { const q = document.querySelector('[data-key="l1shape"]').querySelectorAll('button')[5].getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; });
  await p.touchscreen.tap(pen[0], pen[1]); await p.waitForTimeout(600);
  const fs_ = await p.evaluate(() => { const el = [...document.querySelectorAll('.pop, .sheet, [class*="form"]')].find(e => e.offsetParent && /form|Form/.test(e.className + ' ' + (e.getAttribute('aria-label') || ''))); if (!el) return null; const r = el.getBoundingClientRect(); return {cls: el.className, top: Math.round(r.top), bottom: Math.round(r.bottom), right: Math.round(r.right), btn: [...el.querySelectorAll('button')].filter(x => x.offsetParent).map(x => { const q = x.getBoundingClientRect(); return {t: x.textContent.trim().slice(0, 10), w: Math.round(q.width), h: Math.round(q.height)}; })}; });
  ok(tag + ' ✎ per Finger öffnet das Form-Blatt, im Bild', fs_ && fs_.bottom <= H + .5 && fs_.top >= -.5 && fs_.right <= W + .5, fs_ ? fs_.cls + ' ' + fs_.top + '–' + fs_.bottom : 'kein Blatt');
  if (fs_) { const small = fs_.btn.filter(x => x.h < 44 || x.w < 44); ok(tag + ' Form-Blatt: Tasten ≥ 44', !small.length, small.map(x => x.t + ' ' + x.w + '×' + x.h).join(', ')); }
  await p.screenshot({path: path.join(DIR, `b1-5-form-${tag}.png`)});
  ok(tag + ' keine Seitenfehler', !errs.length, errs.slice(0, 2).join(' | '));
  await ctx.close();
}
await b.close();
console.log((fails ? 'FAIL' : 'OK') + ' b1-shots ' + (n - fails) + '/' + n);
process.exit(fails ? 1 : 0);
