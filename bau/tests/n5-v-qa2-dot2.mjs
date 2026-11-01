import { open } from './n5-v-lib.mjs';
const SONG16 = {bars: 16, lanes: [[{bar: 0, slot: 0}, {bar: 8, slot: 1}], [{bar: 0, slot: 0}], [{bar: 2, slot: 0}, {bar: 14, slot: -1}], [], [{bar: 0, slot: 0}, {bar: 8, slot: 1}], []],
  carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 8, name: 'Strophe'}, {id: 'm2', a: 8, len: 8, name: 'Refrain'}]};
const dot = p => p.evaluate(() => { const e = document.querySelector('.vvdr button[data-a="vv-spur"]'); if (!e) return null; const i = e.querySelector('i'), q = e.getBoundingClientRect(), qi = i && i.getBoundingClientRect(); return {btnW: +q.width.toFixed(1), dot: qi ? +qi.width.toFixed(1) + 'x' + +qi.height.toFixed(1) : 'none', sw: e.scrollWidth, cw: e.clientWidth, disp: getComputedStyle(e).display}; });
for (const [n, w, h] of [['P1', 390, 844], ['P3', 320, 568], ['L1', 844, 390], ['W', 926, 428]]) {
  const {b, p} = await open({w, h, touch: true, dpr: 2});
  await p.evaluate(s => { SYNQUENZER.setSong(s); setSongView(true); SYNQUENZER.vvDirSet(0, 8, 'spur', 2); SYNQUENZER.vvDirSet(8, 12, 'spur', 1); }, SONG16); await p.waitForTimeout(300);
  await p.evaluate(() => openMarkSheet(S.song.marks[0].id)); await p.waitForTimeout(300); const mk = await dot(p); await p.evaluate(() => closePop());
  await p.evaluate(() => SYNQUENZER.songSelect(8, 11)); await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelector('#rangeBar button[data-a="more"]').click()); await p.waitForTimeout(300); const mo = await dot(p);
  console.log(n, JSON.stringify({markenBlatt: mk, bereichMehr: mo}));
  await b.close();
}
