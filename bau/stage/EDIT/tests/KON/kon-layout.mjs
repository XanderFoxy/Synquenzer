// KON 4: Layout 428 × 926 hochkant und 926 × 428 quer — Block-Zeile, Pfad, Block-Blatt, Marken-Blatt, Bereich ⋯: Treffer ≥ 44 px,
// nichts abgeschnitten, keine Seitenhöhen-Änderung; Bilder nach tests/out/
import fs from 'fs';
import { open, buildSong, ok, summary, OUT } from './lib.mjs';
fs.mkdirSync(OUT, {recursive: true});
const btnCheck = (p, sel) => p.evaluate(sel => [...document.querySelectorAll(sel)].filter(x => x.offsetWidth).map(x => { const r = x.getBoundingClientRect(); return {t: x.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height), clip: x.scrollWidth > x.clientWidth + 1 || x.scrollHeight > x.clientHeight + 1, out: r.left < -0.5 || r.right > innerWidth + 0.5 || r.bottom > innerHeight + 0.5}; }), sel);
for (const [w, h, tag] of [[428, 926, 'hochkant'], [926, 428, 'quer']]) {
  console.log(tag + ' ' + w + '×' + h);
  const {b, p, errs} = await open({w, h, dpr: 2});
  await buildSong(p);
  await p.evaluate(() => { setSongView(true); }); await p.waitForTimeout(400);
  const H0 = await p.evaluate(() => ({doc: document.scrollingElement.scrollHeight, sv: document.getElementById('songView').getBoundingClientRect().height, cv: SV.cv.getBoundingClientRect().height, rows: SV.rows.length}));
  await p.evaluate(() => { SYNQUENZER.blockMake(2, 9); }); await p.waitForTimeout(300);
  const H1 = await p.evaluate(() => ({doc: document.scrollingElement.scrollHeight, sv: document.getElementById('songView').getBoundingClientRect().height, cv: SV.cv.getBoundingClientRect().height, rows: SV.rows.length}));
  ok(H0.doc === H1.doc && H0.sv === H1.sv && H0.cv === H1.cv && H0.rows === H1.rows, 'Block-Zeile: keine Höhen-Änderung, gleiche Spuren', {H0, H1});
  ok(H1.doc <= h + 1, 'kein Überlauf nach unten', H1.doc);
  const li = await p.evaluate(() => SYNQUENZER.svLayoutInfo());
  ok(li.blS >= 12 && li.blocks.length === 1, 'Block-Zeile ' + li.blS + ' px');
  const lab = await p.evaluate(() => { const x = document.querySelector('.sv-lr .kon-bl'), t = document.querySelector('.sv-lr .lbl'); return {bl: x && !x.hidden && x.textContent, tk: t && t.textContent, tr: t.getBoundingClientRect().top - x.getBoundingClientRect().top}; });
  ok(lab.bl === 'Block' && lab.tk === 'Takt' && lab.tr > 6, 'Etiketten „Block“ über „Takt“', lab);
  await p.screenshot({path: OUT + '/' + tag + '-1-blockzeile.png'});
  // Block-Blatt
  await p.evaluate(() => SYNQUENZER.blockSheet('B1')); await p.waitForTimeout(250);
  let bs = await btnCheck(p, '.pop.konsheet button.ms-b');
  ok(bs.length === 4 && bs.every(x => x.h >= 44 && !x.clip && !x.out), 'Block-Blatt: 4 Tasten ≥ 44 px, nichts abgeschnitten', bs);
  const tip = await p.evaluate(() => { const x = document.querySelector('.konsheet .kon-tip'); return x && x.scrollWidth <= x.clientWidth + 1 && x.getBoundingClientRect().bottom <= innerHeight; });
  ok(tip, 'Hinweiszeile sichtbar');
  await p.screenshot({path: OUT + '/' + tag + '-2-blockblatt.png'});
  await p.evaluate(() => closePop());
  // Pfad
  await p.evaluate(() => SYNQUENZER.blockEnter('B1')); await p.waitForTimeout(250);
  const pb = await p.evaluate(() => { const x = document.querySelector('.kon-path'), r = x.getBoundingClientRect(), a = getComputedStyle(x, '::after'), sp = [...x.children].map(c => c.scrollWidth <= c.clientWidth + 1);
    return {w: r.width, hit: r.height - parseFloat(a.top) - parseFloat(a.bottom), fit: sp.every(Boolean), txt: x.textContent}; });
  ok(pb.w >= 44 && pb.hit >= 44 && pb.fit, 'Pfad „← Song › Block A“ (Treffer ' + Math.round(pb.w) + ' × ' + Math.round(pb.hit) + ', Text passt)', pb);
  await p.screenshot({path: OUT + '/' + tag + '-3-im-block.png'});
  await p.evaluate(() => SYNQUENZER.blockExit());
  // Marken-Blatt with the KON row (after konsolidieren: two buttons)
  await p.evaluate(() => SYNQUENZER.konsolidieren(2, 9, 'Kern'));
  await p.evaluate(() => openMarkSheet(S.song.kons[0].mark)); await p.waitForTimeout(250);
  let ms = await btnCheck(p, '.pop.msheet button.ms-b');
  const kr = ms.filter(x => x.t === 'Als neuen Teil konsolidieren' || x.t === 'Zurückholen');
  ok(kr.length === 2 && kr.every(x => x.h >= 44 && !x.clip && !x.out), 'Marken-Blatt: [Als neuen Teil konsolidieren] [Zurückholen] ≥ 44 px', kr);
  ok(ms.every(x => !x.out), 'Marken-Blatt ganz im Bild', ms.filter(x => x.out));
  await p.screenshot({path: OUT + '/' + tag + '-4-markenblatt.png'});
  await p.evaluate(() => closePop());
  // Bereich ⋯
  await p.evaluate(() => { SYNQUENZER.songSelect(10, 11); svButtons(); }); await p.waitForTimeout(200);
  await p.evaluate(() => openRangeMore(document.querySelector('#rangeBar [data-a="more"]'))); await p.waitForTimeout(250);
  const rm = await btnCheck(p, '.pop button[data-a="konblk"], .pop button[data-a="konsol"]');
  ok(rm.length === 2 && rm.every(x => x.h >= 44 && !x.clip && !x.out), 'Bereich ⋯: [▣ Als Block] [Als neuen Teil konsolidieren] ≥ 44 px', rm);
  await p.screenshot({path: OUT + '/' + tag + '-5-bereich.png'});
  await p.evaluate(() => document.querySelector('.pop button[data-a="konblk"]').click()); await p.waitForTimeout(200);
  ok((await p.evaluate(() => SYNQUENZER.blocks())).length === 2, '[▣ Als Block] legt Block B an');
  await p.screenshot({path: OUT + '/' + tag + '-6-zwei-bloecke.png'});
  ok(errs.length === 0, 'keine Konsolenfehler', errs);
  await b.close();
}
process.exit(summary('KON-Layout') ? 1 : 0);
