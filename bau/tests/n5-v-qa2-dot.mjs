import { open } from './n5-v-lib.mjs';
const SONG16 = {bars: 16, lanes: [[{bar: 0, slot: 0}, {bar: 8, slot: 1}], [{bar: 0, slot: 0}], [{bar: 2, slot: 0}, {bar: 14, slot: -1}], [], [{bar: 0, slot: 0}, {bar: 8, slot: 1}], []],
  carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 8, name: 'Strophe'}, {id: 'm2', a: 8, len: 8, name: 'Refrain'}]};
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/n5-v-qa2-out/';
for (const [n, w, h] of [['P3', 320, 568], ['P1', 390, 844]]) {
  const {b, p} = await open({w, h, touch: true, dpr: 3});
  await p.evaluate(s => { SYNQUENZER.setSong(s); setSongView(true); SYNQUENZER.vvDirSet(8, 12, 'spur', 2); SYNQUENZER.songSelect(8, 11); }, SONG16); await p.waitForTimeout(400);
  const m = await p.evaluate(() => { const e = document.querySelector('#rangeBar button[data-a="more"]'); const q = e.getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height / 2]; });
  await p.touchscreen.tap(m[0], m[1]); await p.waitForTimeout(400);
  const r = await p.evaluate(() => { const e = document.querySelector('.pop .vvdr button[data-a="vv-spur"]'), i = e.querySelector('i'), q = e.getBoundingClientRect(), qi = i ? i.getBoundingClientRect() : null;
    const rg = document.createRange(); rg.selectNodeContents(e); const tr = rg.getBoundingClientRect();
    return {btn: [q.left, q.right, q.width].map(v => +v.toFixed(1)), dot: qi && [qi.left, qi.right].map(v => +v.toFixed(1)), dotVisible: qi && qi.left >= q.left + 1 && qi.right <= q.right - 1, content: [tr.left, tr.right, tr.width].map(v => +v.toFixed(1)), sw: e.scrollWidth, cw: e.clientWidth, sl: e.scrollLeft, html: e.innerHTML}; });
  console.log(n, JSON.stringify(r));
  const q = await p.evaluate(() => { const e = document.querySelector('.pop .vvdr button[data-a="vv-spur"]').getBoundingClientRect(); return [e.left, e.top, e.width, e.height]; });
  await p.screenshot({path: OUT + `dot-${n}.png`, clip: {x: q[0] - 4, y: q[1] - 4, width: q[2] + 8, height: q[3] + 8}});
  await b.close();
}
