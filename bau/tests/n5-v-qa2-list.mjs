// the [Spur …] list: where it opens (vs. the button tapped) – compared with the existing „Ersetzen durch ▾“ list of the same sheet
import { open } from './n5-v-lib.mjs';
const SONG16 = {bars: 16, lanes: [[{bar: 0, slot: 0}, {bar: 8, slot: 1}], [{bar: 0, slot: 0}], [{bar: 2, slot: 0}, {bar: 14, slot: -1}], [], [{bar: 0, slot: 0}, {bar: 8, slot: 1}], []],
  carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 8, name: 'Strophe'}, {id: 'm2', a: 8, len: 8, name: 'Refrain'}]};
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/n5-v-qa2-out/';
const ctr = (p, sel) => p.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const q = e.getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height / 2]; }, sel);
const popRect = p => p.evaluate(() => { const e = document.querySelector('.pop'); if (!e) return null; const q = e.getBoundingClientRect(); return {r: [q.left, q.top, q.right, q.bottom].map(Math.round), h4: (e.querySelector('h4') || {}).textContent, dock: e.classList.contains('dock')}; });
for (const [n, w, h] of [['P1', 390, 844], ['L1', 844, 390]]) {
  const {b, p, errs} = await open({w, h, touch: true, dpr: 2});
  await p.evaluate(s => { SYNQUENZER.setSong(s); setSongView(true); }, SONG16); await p.waitForTimeout(400);
  const res = {};
  // Marken-Blatt: header tap
  const L0 = await p.evaluate(() => { UI.dirty.song = true; return svLayoutInfo(); });
  await p.touchscreen.tap(L0.canvas.x + 30, L0.canvas.y + 10); await p.waitForTimeout(400);
  const bs = await ctr(p, '.msheet .vvdr button[data-a="vv-spur"]'); res.markeSpurBtn = bs && bs.map(Math.round);
  await p.touchscreen.tap(bs[0], bs[1]); await p.waitForTimeout(400);
  res.markeSpurList = await popRect(p);
  await p.screenshot({path: OUT + `list-${n}-marke.png`});
  await p.evaluate(() => closePop()); await p.waitForTimeout(250);
  // the existing „Ersetzen durch ▾“ of the same sheet
  await p.touchscreen.tap(L0.canvas.x + 30, L0.canvas.y + 10); await p.waitForTimeout(400);
  const br = await ctr(p, '.msheet button[data-a="repl"]'); res.replBtn = br && br.map(Math.round);
  await p.touchscreen.tap(br[0], br[1]); await p.waitForTimeout(400);
  res.replList = await popRect(p);
  await p.evaluate(() => closePop()); await p.waitForTimeout(250);
  // ⋯ of the Bereich-Leiste
  await p.evaluate(() => SYNQUENZER.songSelect(8, 11)); await p.waitForTimeout(300);
  const mo = await ctr(p, '#rangeBar button[data-a="more"]'); await p.touchscreen.tap(mo[0], mo[1]); await p.waitForTimeout(400);
  const bs2 = await ctr(p, '.pop .vvdr button[data-a="vv-spur"]'); res.moreSpurBtn = bs2 && bs2.map(Math.round);
  await p.touchscreen.tap(bs2[0], bs2[1]); await p.waitForTimeout(400);
  res.moreSpurList = await popRect(p);
  await p.screenshot({path: OUT + `list-${n}-more.png`});
  console.log(n, JSON.stringify(res), errs);
  await b.close();
}
