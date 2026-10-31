// VV1-05 "Abbrechen wirkt ≤ 300 ms" through the sheet: finger tap on [Abbrechen] (event timeStamp) → sheet not busy (MutationObserver), WebCodecs path, 9:16
import { open, OUT } from './n5-v-abn-lib.mjs';
import fs from 'fs'; import os from 'os';
const tag = process.argv[2] || 'r1';
const waits = (process.argv[3] || '3000,30000').split(',').map(Number);
const bars = +(process.argv[4] || 84);
const res = [];
for (const wt of waits) {
  const {b, p, errs} = await open({w: 390, h: 844, touch: true, dpr: 2});
  await p.evaluate(bars => {
    const lanes = [[], [], [], [], [], []], marks = [];
    for (let k = 0; k < bars; k += 8) { lanes[0].push({bar: k, slot: 0}); lanes[1].push({bar: k, slot: (k / 8) % 2}); lanes[2].push({bar: k + 2, slot: 0}, {bar: k + 6, slot: -1}); lanes[4].push({bar: k, slot: 0}, {bar: k + 4, slot: 1}); marks.push({id: 'm' + k, a: k, len: Math.min(8, bars - k), name: k % 16 ? 'Refrain' : 'Strophe'}); }
    SYNQUENZER.setSong({bars, lanes, carrier: [], mel: {}, marks}); SYNQUENZER.vvTest({opus: true}); SYNQUENZER.vvOpen();
  }, bars);
  await p.waitForTimeout(6000);   // the setSong toast is gone
  await p.tap('.vvacts .go');
  await p.waitForTimeout(wt);
  await p.evaluate(() => {
    const sh = document.getElementById('vvSheet'), bt = sh.querySelector('.vvprog .vvbtn'); window.__c = {};
    bt.addEventListener('pointerup', e => { window.__c.ts = e.timeStamp; window.__c.run = performance.now(); }, true);
    new MutationObserver(() => { if (!sh.classList.contains('busy') && window.__c.ts && !window.__c.done) window.__c.done = performance.now(); }).observe(sh, {attributes: true});
    const q = bt.getBoundingClientRect(); window.__c.box = [q.left + q.width / 2, q.top + q.height / 2]; window.__c.phase = VV.off ? 'audio+frames' : 'frames/encode'; window.__c.prog = sh.querySelector('.vvprog span').textContent;
  });
  const box = await p.evaluate(() => window.__c.box);
  await p.touchscreen.tap(box[0], box[1]);
  await p.waitForFunction(() => window.__c.done, null, {timeout: 10000}).catch(() => {});
  const c = await p.evaluate(() => Object.assign({}, window.__c, {busy: VV.busy, off: !!VV.off}));
  const r = {waitMs: wt, bars, phase: c.phase, prog: c.prog, inputDelay: Math.round(c.run - c.ts), tapToIdle: c.done ? Math.round(c.done - c.ts) : null, busyAfter: c.busy, load: os.loadavg()[0], errs};
  console.log(JSON.stringify(r)); res.push(r);
  await b.close();
}
fs.writeFileSync(OUT + tag + '-05c.json', JSON.stringify(res, null, 1));
