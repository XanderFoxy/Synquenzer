// KONUX: die Vorschau im Song erscheint mit dem Blatt, wechselt mit der Karte, folgt dem Namen und verschwindet beim Schließen
// (✕, Tipp in den Song daneben); Pixel im Song-Fenster: getönt mit Vorschau, wieder wie vorher ohne
import { open, buildSong, tapSel, selRange, blockTap, tapXY, li } from './lib.mjs';
const out = [], ok = (n, c, x) => { const r = {test: 'vorschau', fall: n, ok: !!c, ...(x ? {info: x} : {})}; out.push(r); console.log(JSON.stringify(r)); };
const {p, errs, close} = await open({w: 428, h: 926});
await buildSong(p);
// ein Pixel mitten im Bereich (Spur-Zeile 3, Takt 4) und eins daneben (Takt 9)
const px = () => p.evaluate(() => { svDraw(true); const g = SV.g, d = SV.dpr, y = Math.round((SV.rulerH + 2.5 * SV.rowH) * d), f = b => Array.from(g.getImageData(Math.round(((b + .5) * SV.cellW - SV.x) * d), y, 1, 1).data).join(','); return {in: f(3), out: f(8)}; });
await selRange(p, 2, 5); const p0 = await px();
await tapSel(p, '#rangeBar button[data-a="more"]', 450); await tapSel(p, '.pop button[data-a="konux"]', 450);
let I = await p.evaluate(() => SYNQUENZER.konuxInfo()); const p1 = await px();
ok('Blatt offen → Vorschau „Teil“ da', I.open && I.pv && I.pv.k === 'part' && I.pv.a === 2 && I.pv.e === 6, I.pv);
ok('Vorschau tönt den Bereich, daneben unverändert', p1.in !== p0.in && p1.out === p0.out, {vorher: p0, mit: p1});
await tapSel(p, '.pop .kx-c[data-k="blk"]'); I = await p.evaluate(() => SYNQUENZER.konuxInfo());
ok('Karte „Als Block“ → Vorschau wechselt sofort', I.pv && I.pv.k === 'blk' && /Block A/.test(I.pv.lab), I.pv);
await tapSel(p, '.pop .cp-c[data-n="Refrain"]'); I = await p.evaluate(() => SYNQUENZER.konuxInfo());
ok('Name gewählt → Vorschau und Hauptknopf folgen', I.pv.lab === 'Refrain' && /Refrain/.test(I.main) && I.pop === 'konux', {pv: I.pv.lab, main: I.main});
await tapSel(p, '.pop .kx-h .ms-x', 350); I = await p.evaluate(() => SYNQUENZER.konuxInfo()); const p2 = await px();
ok('✕ → Blatt und Vorschau weg, Song wie vorher', !I.open && (await p.evaluate(() => KX.pv)) === null && p2.in === p0.in, p2);
// Tipp in den Song daneben schließt nur (bearbeitet nichts darunter)
await tapSel(p, '#rangeBar button[data-a="more"]', 450); await tapSel(p, '.pop button[data-a="konux"]', 450);
const s0 = await p.evaluate(() => JSON.stringify(S.song)); const L = await li(p);
await tapXY(p, L.canvas.x + 7.5 * L.cellW - L.x0, L.canvas.y + L.rulerH + 1.5 * L.rowH, 450);
I = await p.evaluate(() => SYNQUENZER.konuxInfo());
ok('Tipp in den Song daneben → Blatt zu, Vorschau weg, nichts bearbeitet', !I.open && (await p.evaluate(() => KX.pv)) === null && s0 === await p.evaluate(() => JSON.stringify(S.song)));
// Block: Vorschau in Block-Farbe, beim Umbenennen mit dem neuen Namen
await p.evaluate(() => { SV.sel = null; rangeBarSync(); svButtons(); SYNQUENZER.blockMake(0, 1); }); await p.waitForTimeout(300);
await blockTap(p, 'B1'); I = await p.evaluate(() => SYNQUENZER.konuxInfo());
ok('Block-Tipp → geführtes Blatt mit Vorschau', I.open && I.pop === 'block' && I.pv && I.pv.a === 0 && I.pv.e === 2, I.pv);
await tapSel(p, '.pop .kx-w[data-kx="name"]'); await p.evaluate(() => SYNQUENZER.konuxName('Kern')); I = await p.evaluate(() => SYNQUENZER.konuxInfo());
ok('Umbenennen → Vorschau zeigt „Kern“, Hauptknopf „Umbenennen in „Kern““', I.pv.k === 'name' && I.pv.lab === 'Kern' && /Kern/.test(I.main), {pv: I.pv, main: I.main});
await p.evaluate(() => SYNQUENZER.konuxName(null)); I = await p.evaluate(() => SYNQUENZER.konuxInfo());
ok('Umbenennen ohne neuen Namen → Hauptknopf aus', await p.evaluate(() => KX.el.querySelector('.kx-go').disabled), I.main);
await p.evaluate(() => closePop()); ok('Schließen → keine Vorschau', (await p.evaluate(() => KX.pv)) === null);
ok('keine Konsolen-Fehler', !errs.length, errs);
await close();
process.exitCode = out.every(r => r.ok) ? 0 : 1;
