// SX6 Form-Vorlage: leerer Song → [Aus Vorlage …] → „Synthpop 84“ → 8 leere, benannte Marken (52 Takte), 1 Undo zurück zu leer;
// 3–5 Vorlagen; bei einem Song mit Inhalt keine Vorlage; Klang: leer (keine Noten)
import { open, OUT, PICS } from './sx-lib.mjs';
import fs from 'fs';
fs.mkdirSync(PICS, {recursive: true});
const res = {}; let ok = true;
const {b, p, errs} = await open();
await p.evaluate(() => { SYNQUENZER.setSong(null); setSongView(true); }); await p.waitForTimeout(400);
const tpl = await p.evaluate(() => SYNQUENZER.sx6Templates());
res.vorlagen = {n: tpl.length, namen: tpl.map(t => t.name + ' (' + t.bars + ')'), ok: tpl.length >= 3 && tpl.length <= 5}; ok = ok && res.vorlagen.ok;
const btn = await p.evaluate(() => { const x = document.querySelector('.sv-empty .sx6-b'); if (!x || x.offsetParent === null) return null; const r = x.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height}; });
await p.screenshot({path: PICS + '/sx6-leer-428x926.png'});
const s0 = await p.evaluate(() => songSnapshot()), u0 = await p.evaluate(() => UNDO.length);
if (btn) { await p.mouse.click(btn.x + btn.w / 2, btn.y + btn.h / 2); await p.waitForTimeout(350); }
const items = await p.evaluate(() => [...document.querySelectorAll('.sx6pop .sx6-t')].map(x => { const r = x.getBoundingClientRect(); return {k: x.dataset.sx6, x: r.left, y: r.top, w: r.width, h: r.height, t: x.textContent}; }));
await p.screenshot({path: PICS + '/sx6-vorlagen-428x926.png'});
const sp = items.find(i => i.k === 'synthpop84'); if (sp) { await p.mouse.click(sp.x + sp.w / 2, sp.y + sp.h / 2); await p.waitForTimeout(400); }
const got = await p.evaluate(() => ({bars: S.song && S.song.bars, marks: S.song ? S.song.marks.map(m => markLabel(m) + ' ' + m.len) : [], lanes: S.song ? S.song.lanes.map(l => l.length) : [], undo: UNDO.length, empty: SV.empty.hidden}));
await p.waitForTimeout(1500); await p.screenshot({path: PICS + '/sx6-synthpop84-428x926.png'});
res.knopf = btn; res.liste = items.map(i => ({k: i.k, h: i.h}));
res.synthpop84 = Object.assign(got, {undoSchritte: got.undo - u0});
res.synthpop84.ok = !!btn && btn.h >= 44 && items.length === tpl.length && items.every(i => i.h >= 44) && got.bars === 52 && got.marks.join(' · ') === 'Intro 4 · Strophe 8 · Refrain 8 · Strophe 8 · Refrain 8 · Bridge 4 · Refrain 8 · Outro 4' && got.lanes.every(n => n === 0) && got.undo - u0 === 1;
ok = ok && res.synthpop84.ok;
// leer = still: der Render hat keine Noten
const r = await p.evaluate(async () => { const x = await SYNQUENZER.vvRender({range: {a: 0, b: 4}}); return {peak: x.peak, noten: (VV.last.log || []).length}; });
res.klang = Object.assign(r, {ok: r.noten === 0}); ok = ok && res.klang.ok;
// 1 Undo → wieder leer
const back = await p.evaluate(s0 => { SYNQUENZER.undo(); return songSnapshot() === s0; }, s0); res.undo = {gleich: back, ok: back}; ok = ok && back;
// mit Inhalt: keine Vorlage (nichts ändert sich)
await p.evaluate(() => SYNQUENZER.sx6Apply('club'));
const deny = await p.evaluate(() => { const s1 = songSnapshot(); const r = SYNQUENZER.sx6Apply('ballade'); return {r, gleich: songSnapshot() === s1, bars: S.song.bars}; });
res.mitInhalt = Object.assign(deny, {ok: deny.r === false && deny.gleich && deny.bars === 72}); ok = ok && res.mitInhalt.ok;
res.errors = errs; ok = ok && !errs.length;
console.log(JSON.stringify(res, null, 1)); console.log(ok ? 'OK' : 'FEHLER');
fs.mkdirSync(OUT, {recursive: true}); fs.writeFileSync(OUT + '/t6-sx6.json', JSON.stringify(res, null, 1));
await b.close(); process.exit(ok ? 0 : 1);
