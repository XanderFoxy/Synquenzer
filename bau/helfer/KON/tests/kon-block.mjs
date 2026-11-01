// KON 1: Block anlegen / verschieben / kopieren / hineingehen / hinaus / umbenennen / auflösen — Daten, Undo/Redo, Gesten
import { open, buildSong, ok, summary, diff, state, canonCut } from './lib.mjs';
const {b, p, errs} = await open();
await buildSong(p);
await p.evaluate(() => { setSongView(true); });
await p.waitForTimeout(300);
const s0 = await state(p);
console.log('Block anlegen');
let r = await p.evaluate(() => SYNQUENZER.blockMake(2, 9));
ok(r && r.id === 'B1' && r.name === 'Block A', 'blockMake → B1 „Block A“', r);
let bl = await p.evaluate(() => SYNQUENZER.blocks());
ok(JSON.stringify(bl) === JSON.stringify([{id: 'B1', a: 2, len: 8, name: 'Block A'}]), 'song.blocks = [{B1, 2, 8}]', bl);
let li = await p.evaluate(() => SYNQUENZER.svLayoutInfo());
ok(li.blS > 0 && li.blocks.length === 1 && li.blocks[0].label.includes('BLOCK A'), 'Block-Zeile gezeichnet (' + li.blS + ' px)', li.blocks);
ok((await p.evaluate(() => S.song.marks.length)) === 4, 'Marken bleiben (4)');
const s1 = await state(p);
ok(diff({...s0.song, blocks: s1.song.blocks}, s1.song).length === 0, 'nur song.blocks kommt dazu', diff({...s0.song, blocks: s1.song.blocks}, s1.song));
r = await p.evaluate(() => SYNQUENZER.blockMake(5, 6));
ok(r === null, 'kein zweiter Block über einem Block (keine Überlappung)', r);
await p.evaluate(() => SYNQUENZER.undo());
{ const d = diff(s0, await state(p)); ok(d.length === 0, 'Undo „Block angelegt“ = Stand davor', d.slice(0, 5)); }
await p.evaluate(() => SYNQUENZER.redo());
ok(diff(s1, await state(p)).length === 0, 'Redo = Block wieder da');

console.log('Block verschieben (mit Nachrücken)');
const cutBefore = await canonCut(p, 2, 10);
r = await p.evaluate(() => SYNQUENZER.blockAction('B1', 'move', 0));
ok(r && r.a === 0, 'B1 → Takt 1', r);
let st = await state(p);
ok(st.song.blocks[0].a === 0 && st.song.blocks[0].len === 8 && st.song.bars === 12, 'Block bei 0, Länge 8, Song 12 Takte', st.song.blocks);
const cutAfter = await canonCut(p, 0, 8);
ok(diff(cutBefore, cutAfter).length === 0, 'Inhalt wandert mit (Clips, Akkorde, Transposition, Melodie, eigener Clip)', diff(cutBefore, cutAfter).slice(0, 4));
ok(st.song.marks.map(m => [m.a, markLabelOf(m)]).length >= 4, 'Marken da');
function markLabelOf(m) { return m.name || m.part; }
const mm = st.song.marks.map(m => (m.name || '') + '@' + m.a).join(' ');
ok(mm === 'Strophe@0 Refrain@4 Intro@8 Outro@10', 'Marken in neuer Reihenfolge: ' + mm);
await p.evaluate(() => SYNQUENZER.undo());
{ const d = diff(s1, await state(p)); ok(d.length === 0, 'Undo verschieben = exakt davor', d.slice(0, 4)); }
await p.evaluate(() => SYNQUENZER.redo());
ok(diff(st, await state(p)).length === 0, 'Redo verschieben');
await p.evaluate(() => SYNQUENZER.undo());
r = await p.evaluate(() => SYNQUENZER.blockAction('B1', 'move', 5));
ok(r === 'same', 'in sich selbst verschieben = nichts', r);

console.log('Block kopieren');
r = await p.evaluate(() => SYNQUENZER.blockAction('B1', 'copy', 10));
st = await state(p);
ok(r && r.id === 'B2' && st.song.bars === 20 && st.song.blocks.length === 2 && st.song.blocks[1].name === 'Block B' && st.song.blocks[1].a === 10, 'Kopie B2 „Block B“ bei Takt 11, Song 20 Takte', st.song.blocks);
const cutCopy = await canonCut(p, 10, 18);
ok(diff(cutBefore, cutCopy).length === 0, 'Kopie hat denselben Inhalt', diff(cutBefore, cutCopy).slice(0, 4));
ok(st.song.marks.some(m => m.name === 'Outro' && m.a === 18), 'Outro rückt nach (Takt 19)');
r = await p.evaluate(() => SYNQUENZER.blockAction('B1', 'copy', 4));
ok(r === 'self', 'Kopie nicht in den Block selbst', r);
r = await p.evaluate(() => SYNQUENZER.blockAction('B1', 'copy', 12));
ok(r === 'in', 'Kopie nicht in einen anderen Block', r);
await p.evaluate(() => SYNQUENZER.undo());
ok(diff(s1, await state(p)).length === 0, 'Undo kopieren = exakt davor');

console.log('Löschen/Einfügen im Song halten die Blöcke');
await p.evaluate(() => SYNQUENZER.songRange('insertEmpty', 4, 5));
ok((await p.evaluate(() => SYNQUENZER.blocks()))[0].len === 10, 'Einfügen im Block → Block wächst (10)');
await p.evaluate(() => SYNQUENZER.undo());
await p.evaluate(() => SYNQUENZER.songRange('insertEmpty', 0, 0));
ok((await p.evaluate(() => SYNQUENZER.blocks()))[0].a === 3, 'Einfügen davor → Block rückt (Takt 4)');
await p.evaluate(() => SYNQUENZER.undo());
await p.evaluate(() => SYNQUENZER.songRange('delete', 8, 10));
bl = await p.evaluate(() => SYNQUENZER.blocks());
ok(bl[0].a === 2 && bl[0].len === 6, 'Löschen am Block-Ende → Block kürzer (6)', bl);
await p.evaluate(() => SYNQUENZER.undo());
ok(diff(s1, await state(p)).length === 0, 'alles zurück');

console.log('Hineingehen / hinaus');
const loop0 = await p.evaluate(() => Object.assign({}, S.song.loop));
await p.evaluate(() => SYNQUENZER.blockEnter('B1'));
let lp = await p.evaluate(() => ({loop: Object.assign({}, S.song.loop), in: SYNQUENZER.blockIn(), path: (() => { const x = document.querySelector('.kon-path'); return x && !x.hidden ? x.textContent : null; })()}));
ok(lp.loop.on && lp.loop.a === 2 && lp.loop.b === 10 && lp.in === 'B1', 'Schleife auf dem Block (Takt 3–10)', lp);
ok(lp.path && lp.path.includes('Song ›') && lp.path.includes('Block A'), 'Pfad „← Song › Block A“ oben links', lp.path);
const pb = await p.evaluate(() => { const r = document.querySelector('.kon-path').getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height}; });
ok(pb.w >= 44 && pb.h + 16 >= 44, 'Pfad-Taste ≥ 44 px Trefferfläche (' + pb.w.toFixed(0) + ' × ' + (pb.h + 16).toFixed(0) + ')');
await p.touchscreen.tap(pb.x, pb.y); await p.waitForTimeout(200);
lp = await p.evaluate(() => ({loop: Object.assign({}, S.song.loop), in: SYNQUENZER.blockIn(), hid: document.querySelector('.kon-path').hidden}));
ok(!lp.in && lp.hid && JSON.stringify(lp.loop) === JSON.stringify(loop0), '← führt hinaus, Schleife wie vorher', lp);

console.log('Gesten: Tipp = Block-Blatt, Doppeltipp = hineingehen, Halten+Ziehen = verschieben');
await p.evaluate(() => { SV.x = 0; UI.dirty.song = true; svDraw(true); });
const cv = await p.evaluate(() => { const r = SV.cv.getBoundingClientRect(); return {x: r.left, y: r.top, cw: SV.cellW, bS: SV.blS, ru: SV.rulerH}; });
const bx = cv.x + 4.5 * cv.cw, by = cv.y + cv.bS / 2;
await p.touchscreen.tap(bx, by); await p.waitForTimeout(120);
ok(await p.evaluate(() => UI.pop && UI.pop.name === 'block'), 'Tipp → Block-Blatt');
await p.touchscreen.tap(bx, by); await p.waitForTimeout(250);
ok(await p.evaluate(() => SYNQUENZER.blockIn() === 'B1' && !(UI.pop && UI.pop.name === 'block')), 'Doppeltipp → hineingegangen');
await p.evaluate(() => SYNQUENZER.blockExit());
await p.waitForTimeout(500);
// mark tap below the Block-Zeile still opens the Marken-Blatt
await p.touchscreen.tap(cv.x + 0.5 * cv.cw, cv.y + cv.bS + (cv.ru - cv.bS) / 2); await p.waitForTimeout(150);
ok(await p.evaluate(() => UI.pop && UI.pop.name === 'mark'), 'Tipp auf Marke unter der Block-Zeile → Marken-Blatt');
await p.evaluate(() => closePop());
// hold + drag the block to bar line 1 (= before Intro)
const cdp = await p.context().newCDPSession(p);
const tp = (type, x, y) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, id: 1}]});
await p.evaluate(() => { SV.x = 0; FOL.page.song = null; UI.dirty.song = true; svDraw(true); });
await tp('touchStart', bx, by); await p.waitForTimeout(550);
const lifted = await p.evaluate(() => SV.blk);
for (let k = 1; k <= 12; k++) { await tp('touchMove', bx + k * ((cv.x + 0.3 * cv.cw) - bx) / 12, by + 60); await p.waitForTimeout(30); }
await p.waitForTimeout(100);
const dr = await p.evaluate(() => DRG ? {src: DRG.src, n: DRG.n, st: DRG.st} : null);
await tp('touchEnd'); await p.waitForTimeout(400);
st = await state(p);
ok(lifted === 'B1' && dr && dr.src === 'block' && dr.n === 0, 'Halten hebt den Block, Ziehen zeigt die Einfügelinie', {lifted, dr});
ok(st.song.blocks[0].a === 0 && st.song.marks.map(m => (m.name || '') + '@' + m.a).join(' ') === 'Strophe@0 Refrain@4 Intro@8 Outro@10', 'abgelegt: Block vor Intro, der Rest rückt', st.song.marks.map(m => (m.name || '') + '@' + m.a));
await p.evaluate(() => SYNQUENZER.undo());
ok(diff(s1, await state(p)).length === 0, 'Undo der Geste = ein Schritt');

console.log('Umbenennen / Auflösen');
await p.evaluate(() => SYNQUENZER.blockAction('B1', 'rename', 'Kern'));
ok((await p.evaluate(() => SYNQUENZER.blocks()))[0].name === 'Kern', 'umbenannt „Kern“');
await p.evaluate(() => SYNQUENZER.blockAction('B1', 'dissolve'));
st = await state(p);
ok(!('blocks' in st.song) && diff(s0.song, st.song).length === 0, 'aufgelöst: Inhalt bleibt, song.blocks fällt weg (Song wie ohne Block)', diff(s0.song, st.song).slice(0, 3));
await p.evaluate(() => SYNQUENZER.undo());
ok((await p.evaluate(() => SYNQUENZER.blocks()))[0].name === 'Kern', 'Undo Auflösen');
await p.evaluate(() => SYNQUENZER.undo());
ok(diff(s1, await state(p)).length === 0, 'Undo Umbenennen');
ok(errs.length === 0, 'keine Konsolenfehler', errs);
await b.close();
process.exit(summary('KON-Block') ? 1 : 0);
