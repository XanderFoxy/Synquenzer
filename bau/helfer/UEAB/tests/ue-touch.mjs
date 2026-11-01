// UE-B Bedienung mit Touch (CDP-Touch, iPhone 12 Pro Max 428 × 926): Leiste, Vorhören ≤ 50 ms, Ziehen auf die Kante (Einrasten sichtbar
// im selben Bild), daneben = zurück und 0 Änderungen, Chip verschieben, Chip aus dem Song = löschen + Toast „Rückgängig“, Griff = Länge,
// Toast [Überall] [Nur hier]
import { open, SONG16, OUT } from './lib.mjs';
import fs from 'fs';
const W = +(process.env.W || 428), H = +(process.env.H || 926);
const R = []; const ok = (name, pass, info) => { R.push({name, pass: !!pass, info}); console.log((pass ? 'OK  ' : 'FEHL') + ' ' + name + (info !== undefined ? ' ' + JSON.stringify(info) : '')); };
const {b, p, errs} = await open({w: W, h: H});
const cdp = await p.context().newCDPSession(p);
const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, id: 1, radiusX: 4, radiusY: 4, force: 1}]});
const frame = () => p.evaluate(() => new Promise(r => requestAnimationFrame(() => r())));
async function drag(x0, y0, x1, y1, o = {}) {
  await touch('touchStart', x0, y0); await p.waitForTimeout(o.hold || 60);
  const n = o.steps || 14; let mid = null;
  for (let k = 1; k <= n; k++) { const x = x0 + (x1 - x0) * k / n, y = y0 + (y1 - y0) * k / n; await touch('touchMove', x, y); await p.waitForTimeout(16); }
  if (o.atEnd) mid = await o.atEnd();
  await touch('touchEnd'); await p.waitForTimeout(300);
  return mid;
}
const tap = async (x, y) => { await touch('touchStart', x, y); await p.waitForTimeout(40); await touch('touchEnd'); await p.waitForTimeout(150); };
await p.evaluate(s => { SYNQUENZER.setSong(s); setSongView(true); }, SONG16);
await p.waitForTimeout(300);
// ---------- [◆ Übergänge] öffnet die Leiste; Tastatur bleibt sichtbar; nichts rollt
const bue = await p.evaluate(() => { const r = document.querySelector('.sv-top > .sv-ue').getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height}; });
await tap(bue.x, bue.y);
const bar = await p.evaluate(() => { const e = document.querySelector('.ue-bar'); const r = e.getBoundingClientRect(); const kb = document.querySelector('#keyboard, #keys, .keyboard, #kb'); const kr = kb ? kb.getBoundingClientRect() : null;
  return {open: !e.hidden, top: r.top, bottom: r.bottom, kbTop: kr ? kr.top : null, scroll: document.documentElement.scrollHeight > innerHeight + 1,
    tiles: [...e.querySelectorAll('.ue-tile, .ue-tab, .ue-x')].map(t => { const q = t.getBoundingClientRect(); return [t.textContent.trim().slice(0, 14), Math.round(q.width), Math.round(q.height)]; })}; });
ok('Leiste geht mit [◆ Übergänge] auf', bar.open, {knopf: [Math.round(bue.w), Math.round(bue.h)]});
ok('UE-07 Kacheln/Reiter ≥ 44 × 44', bar.tiles.every(t => t[1] >= 44 && t[2] >= 44), bar.tiles);
ok('UE-07 Tastatur bleibt sichtbar, nichts rollt', (bar.kbTop == null || bar.bottom <= bar.kbTop + 1) && !bar.scroll, {barUnten: Math.round(bar.bottom), tastaturOben: bar.kbTop && Math.round(bar.kbTop)});
await p.screenshot({path: OUT + `/touch-leiste-${W}x${H}.png`});
// ---------- UE-08 Vorhören ≤ 50 ms nach dem Tipp
const tile = await p.evaluate(() => { const r = document.querySelector('.ue-tile[data-id="p-tom-kurz"]').getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
const lat = [];
for (let k = 0; k < 5; k++) {
  await p.evaluate(() => { window.__t0 = null; document.addEventListener('pointerup', () => { window.__t0 = {perf: performance.now(), ctx: AU.ctx.currentTime}; }, {once: true, capture: true}); });
  await tap(tile.x, tile.y);
  const r = await p.evaluate(() => { const L = UE.lastPrev, t = window.__t0; return L && t ? {ms: (L.first - t.ctx) * 1000, perf: L.tap - t.perf} : null; });
  if (r) lat.push(+r.ms.toFixed(1));
  await p.waitForTimeout(600);
}
ok('UE-08 Vorhören startet ≤ 50 ms nach dem Tipp', lat.length === 5 && Math.max(...lat) <= 50, {ms: lat});
// ---------- UE-09 Ziehen: Einrasten im selben Bild sichtbar (amber Kante + Schraffur), Fangbereich ±½ Takt
const geo = await p.evaluate(() => { const r = SV.wrap.getBoundingClientRect(); return {l: r.left, t: r.top, w: r.width, h: r.height, cw: SV.cellW, x0: SV.x, ru: SV.rulerH, rh: SV.rowH, dr: SV.rows.indexOf(4)}; });
const xOfBar = bar => geo.l + bar * geo.cw - geo.x0;
const yDrum = geo.t + geo.ru + geo.dr * geo.rh + geo.rh / 2;
// 0,4 Takt neben der Kante bei Takt 4 (Strophe → Refrain) → rastet ein; Pixel an der Kante ist amber im selben Bild
const snapInfo = await drag(tile.x, tile.y, xOfBar(4) + .4 * geo.cw, yDrum, {atEnd: async () => {
  const st = await p.evaluate(() => ({m: UE.drag && UE.drag.m, over: UE.drag && UE.drag.over}));
  await frame();
  const px = await p.evaluate(([x, y]) => { const c = SV.cv, g = c.getContext('2d'), d = SV.dpr; const q = g.getImageData(Math.round(x * d), Math.round(y * d), 1, 1).data; return [...q]; }, [4 * geo.cw - geo.x0, geo.ru + geo.dr * geo.rh + 3]);
  return {st, px};
}});
const amber = snapInfo.px[0] > 200 && snapInfo.px[1] > 130 && snapInfo.px[1] < 210 && snapInfo.px[2] < 120;
ok('UE-09 Einrasten (±½ Takt) sichtbar: Kante amber', snapInfo.st.m === 'M2' && amber, snapInfo);
const l1 = await p.evaluate(() => SYNQUENZER.ueList());
ok('Ablegen auf der Kante: Übergang liegt an Takt 4|5', l1.length === 1 && l1[0].m === 'M2' && l1[0].src === 'p-tom-kurz');
const toast1 = await p.evaluate(() => ({txt: EL.toast.textContent, btn: [...EL.toast.querySelectorAll('button')].map(b => b.textContent)}));
ok('Toast fragt [Überall] [Nur hier]', /anderen Kante/.test(toast1.txt) && toast1.btn.join() === 'Überall,Nur hier', toast1);
await p.screenshot({path: OUT + `/touch-abgelegt-${W}x${H}.png`});
// ---------- daneben ablegen (0,8 Takt neben der Kante, außerhalb des Fangbereichs) → zurück, 0 Änderungen
const s0 = await p.evaluate(() => JSON.stringify(S.song)), u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
const off = await drag(tile.x, tile.y, xOfBar(5) + .5 * geo.cw, yDrum, {atEnd: () => p.evaluate(() => UE.drag && UE.drag.m)});
ok('UE-09 Ablegen daneben: zurück, 0 Änderungen im Song', off === null && s0 === await p.evaluate(() => JSON.stringify(S.song)) && u0 === await p.evaluate(() => SYNQUENZER.undoInfo().n));
// ---------- Seitlich wischen in der Leiste = rollen, kein Ziehen
await drag(tile.x, tile.y, tile.x - 120, tile.y + 4);
ok('seitlich wischen in der Leiste startet kein Ziehen', s0 === await p.evaluate(() => JSON.stringify(S.song)));
// ---------- Leiste schließen, Chip verschieben (auf Kante 8|9) und aus dem Song ziehen
await p.evaluate(() => SYNQUENZER.ueBar(false)); await p.waitForTimeout(200);
const geo2 = await p.evaluate(() => ({cw: SV.cellW, x0: SV.x, ru: SV.rulerH, rh: SV.rowH, dr: SV.rows.indexOf(4)}));
const chip = () => p.evaluate(() => { const c = document.querySelector('.ue-chip'); if (!c) return null; const r = c.getBoundingClientRect(), q = c.querySelector('.ue-cl').getBoundingClientRect(); return {x: q.left + q.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, gx: r.left + 6}; });
let c1 = await chip();
ok('UE-07 Chip ≥ 44 × 44', c1 && c1.w >= 44 && c1.h >= 44, c1);
const yD2 = geo.t + geo2.ru + geo2.dr * geo2.rh + geo2.rh / 2, xB = bar => geo.l + bar * geo2.cw - geo2.x0;
await drag(c1.x, c1.y, xB(8) - .2 * geo2.cw, yD2);
const l2 = await p.evaluate(() => SYNQUENZER.ueList());
ok('Chip halten und ziehen = verschieben auf Kante 8|9', l2.length === 1 && l2[0].m === 'M3', l2.map(e => e.m));
// Griff links: ziehen bis 1 Takt vor die Kante → Länge 1 T (rastet auf ¼ · ½ · 1 · 2)
c1 = await chip();
await drag(c1.gx, c1.y, xB(7), c1.y, {steps: 10});
const l3 = await p.evaluate(() => SYNQUENZER.ueList());
ok('Griff links: Länge rastet auf 1 Takt', l3[0].len === 4 && l3[0].a === -4, {len: l3[0].len, a: l3[0].a});
await p.evaluate(() => SYNQUENZER.undo());
// aus dem Song ziehen (nach oben über die Knopfzeile) = löschen + Toast „Rückgängig“; Rückgängig bit-gleich
const s4 = await p.evaluate(() => JSON.stringify(S.song));
c1 = await chip();
await drag(c1.x, c1.y, c1.x, 30);
const del = await p.evaluate(() => ({n: SYNQUENZER.ueList().length, toast: EL.toast.textContent, btn: [...EL.toast.querySelectorAll('button')].map(b => b.getAttribute('aria-label') || b.textContent)}));
ok('UE-11 Chip aus dem Song = löschen + Toast Rückgängig', del.n === 0 && /entfernt/.test(del.toast) && del.btn.some(x => /Rückgängig/.test(x)), del);
const tb = await p.evaluate(() => { const bt = EL.toast.querySelector('button'); const r = bt.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
await tap(tb.x, tb.y);
ok('UE-11 Rückgängig stellt bit-gleich her', s4 === await p.evaluate(() => JSON.stringify(S.song)));
// ---------- Tipp auf den Chip öffnet das Blatt; [Überall] verknüpft
c1 = await chip(); await tap(c1.x, c1.y);
const sh = await p.evaluate(() => ({name: UI.pop && UI.pop.name, txt: UI.pop && UI.pop.el.textContent.slice(0, 80), btn: UI.pop ? [...UI.pop.el.querySelectorAll('button')].map(b => { const r = b.getBoundingClientRect(); return [b.textContent.trim(), Math.round(r.width), Math.round(r.height)]; }) : []}));
ok('Tipp auf den Chip öffnet das Blatt (Knöpfe ≥ 44)', sh.name === 'uechip' && sh.btn.every(x => x[1] >= 44 && x[2] >= 44), sh);
await p.screenshot({path: OUT + `/touch-blatt-${W}x${H}.png`});
ok('keine Fehler in der Konsole', errs.length === 0, errs.slice(0, 5));
fs.writeFileSync(OUT + `/ue-touch-${W}x${H}.json`, JSON.stringify(R, null, 1));
console.log('ERGEBNIS', R.filter(x => x.pass).length + '/' + R.length);
await b.close();
