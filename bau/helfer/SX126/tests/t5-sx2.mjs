// SX2 Klinge: geöffnete Marke → Tipp auf einen inneren Taktstrich → Messer (≥ 44 px) → Tipp teilt („Refrain A | Refrain B“);
// [Bei Takt …] im Marken-Blatt; klingt gleich (Noten-Log + Pegel je Schlag vorher = nachher); 1 Undo; kein Messer an der Teilkante
import { open, SONG8, OUT, PICS } from './sx-lib.mjs';
import fs from 'fs';
fs.mkdirSync(PICS, {recursive: true});
const res = {}; let ok = true;
const {b, p, errs} = await open();
await p.evaluate(s => { SYNQUENZER.setSong(s); setSongView(true); }, SONG8);
await p.waitForTimeout(400);
const geo = () => p.evaluate(() => { const r = SV.cv.getBoundingClientRect(); return {x: r.left, y: r.top, cw: SV.cellW, sx: SV.x, ru: SV.rulerH}; });
const tapBar = async (bar, dx) => { const g = await geo(); await p.mouse.click(g.x + bar * g.cw - g.sx + (dx == null ? g.cw / 2 : dx), g.y + g.ru / 2); await p.waitForTimeout(420); };
const render = () => p.evaluate(async () => { await SYNQUENZER.vvRender(); const r = VV.last, bs = spb(), n = Math.round(bs * r.sr), w = [];
  for (let k = 0; k + n <= r.n; k += n) { let ss = 0; for (let j = k; j < k + n; j++) ss += r.ch[0][j] * r.ch[0][j] + r.ch[1][j] * r.ch[1][j]; w.push(10 * Math.log10(ss / (2 * n) + 1e-20)); }
  return {dur: r.dur, log: JSON.stringify((r.log || []).map(e => [e.track, e.src, e.clipNote, e.out, e.beat, e.dur, e.vel])), w}; });
const before = await render(), snap0 = await p.evaluate(() => songSnapshot()), u0 = await p.evaluate(() => UNDO.length);
// Refrain (Takte 5–8) öffnen: 1. Tipp = Marken-Blatt, 2. Tipp = Takt in der Marke gewählt (Taktnummern sichtbar)
await tapBar(5); const sheet1 = await p.evaluate(() => !!(UI.pop && UI.pop.name === 'mark'));
await tapBar(5); const open1 = await p.evaluate(() => svMarkOpen(S.song.marks.find(m => m.id === 'M2')));
// an der Teilkante (Strich vor Takt 5) erscheint kein Messer
await tapBar(4, 3); const edge = await p.evaluate(() => SYNQUENZER.sx2Knife());
await p.evaluate(() => { SV.sel = {a: 5, b: 5}; UI.dirty.song = true; }); await p.waitForTimeout(100);
// Strich vor Takt 7 (Index 6), 3 px daneben
await tapBar(6, 3); const kn = await p.evaluate(() => SYNQUENZER.sx2Knife());
await p.screenshot({path: PICS + '/sx2-messer-428x926.png'});
res.messer = {blatt: sheet1, offen: open1, kanteOhneMesser: edge === null, messer: kn};
res.messer.ok = sheet1 && open1 && edge === null && kn && kn.shown && kn.n === 6 && kn.rect.w >= 44 && kn.rect.h >= 44; ok = ok && res.messer.ok;
if (kn && kn.rect) { await p.mouse.click(kn.rect.x + kn.rect.w / 2, kn.rect.y + kn.rect.h / 2); await p.waitForTimeout(400); }
const after = await p.evaluate(() => ({marks: S.song.marks.map(m => ({id: m.id, a: m.a, len: m.len, name: markLabel(m), part: m.part})), undo: UNDO.length, toast: (document.querySelector('#toast') || {}).textContent || ''}));
await p.screenshot({path: PICS + '/sx2-geteilt-428x926.png'});
const r2 = await render();
let md = 0; for (let k = 0; k < Math.min(before.w.length, r2.w.length); k++) if (before.w[k] > -80) md = Math.max(md, Math.abs(before.w[k] - r2.w[k]));
res.teilen = {marken: after.marks, undoSchritte: after.undo - u0, toast: after.toast.slice(0, 80), notenGleich: before.log === r2.log, durGleich: before.dur === r2.dur, maxPegelDiffDb: +md.toFixed(2)};
const ma = after.marks.find(m => m.a === 4), mb = after.marks.find(m => m.a === 6);
res.teilen.ok = !!ma && !!mb && ma.len === 2 && mb.len === 2 && ma.name === 'Refrain A' && mb.name === 'Refrain B' && after.marks.length === 3 && res.teilen.undoSchritte === 1 && res.teilen.notenGleich && res.teilen.durGleich && md < .5;
ok = ok && res.teilen.ok;
// 1 Undo → genau der Stand davor
const back = await p.evaluate(s0 => { SYNQUENZER.undo(); return songSnapshot() === s0; }, snap0); res.undo = {gleich: back, ok: back}; ok = ok && back;
await p.evaluate(() => SYNQUENZER.redo());
// „Refrain B“ noch einmal geteilt → „Refrain B“ | „Refrain C“
const again = await p.evaluate(() => { const m = S.song.marks.find(x => markLabel(x) === 'Refrain B'); return SYNQUENZER.sx2Split(m.id, m.a + 1) && S.song.marks.map(x => markLabel(x)); });
res.nochmal = {namen: again, ok: JSON.stringify(again) === JSON.stringify(['Strophe', 'Refrain A', 'Refrain B', 'Refrain C'])}; ok = ok && res.nochmal.ok;
// Marken-Blatt der Strophe: [Bei Takt …] → Takte → „3“ teilt bei Takt 3
await p.evaluate(() => { SV.sel = null; SV.mark = null; UI.dirty.song = true; }); await p.waitForTimeout(150);
await tapBar(1);
const sb = await p.evaluate(() => { const x = document.querySelector('.msheet .sx2-sb'); if (!x) return null; const r = x.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height, t: x.textContent}; });
if (sb) { await p.mouse.click(sb.x + sb.w / 2, sb.y + sb.h / 2); await p.waitForTimeout(300); }
await p.screenshot({path: PICS + '/sx2-blatt-takte-428x926.png'});
const chips = await p.evaluate(() => [...document.querySelectorAll('.msheet .sx2-n')].map(x => { const r = x.getBoundingClientRect(); return {t: x.textContent, w: r.width, h: r.height, x: r.left, y: r.top}; }));
const c3 = chips.find(c => c.t === '3'); if (c3) { await p.mouse.click(c3.x + c3.w / 2, c3.y + c3.h / 2); await p.waitForTimeout(300); }
const names2 = await p.evaluate(() => S.song.marks.map(x => markLabel(x) + '@' + (x.a + 1)));
res.blatt = {knopf: sb, chips: chips.map(c => c.t), chipMin: Math.min(...chips.map(c => Math.min(c.w, c.h))), namen: names2};
res.blatt.ok = !!sb && sb.h >= 44 && JSON.stringify(res.blatt.chips) === JSON.stringify(['2', '3', '4']) && res.blatt.chipMin >= 44 && names2[0] === 'Strophe A@1' && names2[1] === 'Strophe B@3';
ok = ok && res.blatt.ok;
// API-Grenzen: Kante / außerhalb → false, nichts geändert
const lim = await p.evaluate(() => { const s0 = songSnapshot(), m = S.song.marks[0]; return {kante: SYNQUENZER.sx2Split(m.id, m.a), aussen: SYNQUENZER.sx2Split(m.id, m.a + m.len), gleich: songSnapshot() === s0}; });
res.grenzen = Object.assign(lim, {ok: lim.kante === false && lim.aussen === false && lim.gleich}); ok = ok && res.grenzen.ok;
res.errors = errs; ok = ok && !errs.length;
console.log(JSON.stringify(res, null, 1)); console.log(ok ? 'OK' : 'FEHLER');
fs.mkdirSync(OUT, {recursive: true}); fs.writeFileSync(OUT + '/t5-sx2.json', JSON.stringify(res, null, 1));
await b.close(); process.exit(ok ? 0 : 1);
