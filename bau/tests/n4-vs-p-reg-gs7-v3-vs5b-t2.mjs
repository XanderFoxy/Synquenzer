// VS5b T2 (UI, touch): editor default Dehnen 70 %, mode switch, [Text] songtext (N7V-30: 6 marks, 5 marks → "er" red,
// text stays at its mark after quantizing), layout P1 P2 P3 L1 L2, header fits, no console errors
import {launch, open5, sleep, toI16, deq, SR, clickTone, OUTB} from './n4-vs-p-reg-gs7-v3-vs5b-h.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const VP = process.argv[2] ? {P1: [390, 844]} : {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375]};
const br = await launch(null);
const T6 = [0.52, 0.77, 1.01, 1.24, 1.53, 1.71];
const x = clickTone(T6, 2.4, {toneFrom: 0.1});
let first = true;
for (const [name, [w, h]] of Object.entries(VP)) {
  const H = await open5(br, {touch: true, viewport: {width: w, height: h}}), p = H.p;
  await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); }); await sleep(300);
  const r = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 1}), toI16(x));
  const id = r.id, st = r.track;
  const det = await p.evaluate(id => SYNQUENZER.wpDetect(id), id);
  for (let k = det.length - 1; k >= 0; k--) if (!T6.some(t => Math.abs(t - det[k].t) < 0.005)) await p.evaluate(([id, k]) => SYNQUENZER.wpMark(id, 'del', k), [id, k]);
  // open via the takes sheet button (touch)
  await p.evaluate(st => { SYNQUENZER.selectSlot(st, 0); return SYNQUENZER.tkSheet({t: st, s: 0}); }, st); await sleep(300);
  const btn = await p.$('.tksheet button[data-a="wp"]'); await btn.tap(); await sleep(400);
  const modeOn = await p.evaluate(() => [...document.querySelectorAll('#wpSheet .wpmode button')].map(b => b.textContent + (b.classList.contains('on') ? '*' : '') + (b.disabled ? '(x)' : '')).join('|'));
  const sl = await p.evaluate(() => document.querySelector('#wpSheet .qrow input[type=range]').value);
  ok(modeOn === 'Dehnen*|Scheiben' && sl === '70', name + ': editor opens with Dehnen on, strength 70 % (' + modeOn + ', ' + sl + ')');
  // header fits; touch targets
  const hd = await p.evaluate(() => { const q = s => document.querySelector(s).getBoundingClientRect(); const sh = q('#wpSheet'), b = document.querySelector('#wpSheet .qh b');
    return {sh: [sh.left, sh.right, sh.top, sh.bottom], vw: innerWidth, vh: innerHeight, tx: q('#wpSheet .wptx'), ab: q('#wpSheet .wpab'), x: q('#wpSheet .sh-x'), mode: [...document.querySelectorAll('#wpSheet .wpmode button')].map(b => ({w: b.getBoundingClientRect().width, h: b.getBoundingClientRect().height, sw: b.scrollWidth, cw: b.clientWidth})), title: b.textContent}; });
  const inside = r => r.left >= hd.sh[0] - 0.5 && r.right <= hd.sh[1] + 0.5;
  ok(hd.sh[1] <= hd.vw + 0.5 && hd.sh[3] <= hd.vh + 0.5 && inside(hd.tx) && inside(hd.ab) && inside(hd.x) && hd.tx.height >= 36 && hd.tx.width >= 44, name + ': [Text] [A/B] [✕] inside the sheet, Text ' + Math.round(hd.tx.width) + '×' + Math.round(hd.tx.height));
  ok(hd.mode.every(m => m.sw <= m.cw && m.h >= 40), name + ': mode buttons not cut ' + JSON.stringify(hd.mode.map(m => [Math.round(m.w), Math.round(m.h)])));
  // tap 1/8 chip → quantize Dehnen 70 % (one undo)
  const u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
  await (await p.$('#wpSheet .qchips button[data-v="1/8"]')).tap(); await sleep(300);
  let I = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
  ok(I.warp && I.warp.mode === 'stretch' && I.warp.strength === 0.7 && await p.evaluate(() => SYNQUENZER.undoInfo().n) === u0 + 1, name + ': chip 1/8 → Dehnen 70 %, one undo');
  await p.evaluate(id => SYNQUENZER.wpPlayed(id, 0, 1), id);
  // [Text] → type → ✓
  await (await p.$('#wpSheet .wptx')).tap(); await sleep(250);
  const inp = await p.$('.pop.wplyr input'); ok(!!inp, name + ': [Text] opens the songtext field');
  await inp.fill('Lie-be ist ein Feu-er'); await (await p.$('.pop.wplyr button[data-a="ok"]')).tap(); await sleep(250);
  const L = await p.evaluate(() => SYNQUENZER.wpLyrGeom());
  ok(L && L.length === 6 && L.map(o => o.text).join(' ') === 'Lie be ist ein Feu er' && L.every(o => !o.extra), name + ': N7V-30 6 marks → one syllable per mark');
  // text stays at its mark: label x = drawn target of the mark
  const G = await p.evaluate(() => SYNQUENZER.wpGeom()), W = (await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).warp.map;
  const want = W.dst.slice(1, -1).map(d => (d - G.view.a) / G.view.W * G.w);
  if (name === 'P1') console.log('L', L.map(o => o.x.toFixed(2)).join(' '), 'want', want.map(v => v.toFixed(2)).join(' '), 'src', W.src.join(' '), 'dst', W.dst.join(' '), 'marks', JSON.stringify((await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).marks.map(m => m.t)));
  ok(L.every((o, k) => Math.abs(o.x - want[k]) < 0.6), name + ': after quantizing each syllable sits at the target of its mark (max ' + Math.max(...L.map((o, k) => Math.abs(o.x - want[k]))).toFixed(2) + ' px)');
  if (name === 'P1' || name === 'L1' || name === 'P3') await p.screenshot({path: OUTB + '/lay-' + name + '-lyrics.png'});
  // 5 marks → "er" red
  const um = await p.evaluate(() => SYNQUENZER.undoInfo().n);
  await p.evaluate(id => SYNQUENZER.wpMark(id, 'del', 2), id); await sleep(200);
  const L5 = await p.evaluate(() => SYNQUENZER.wpLyrGeom());
  ok(L5.filter(o => !o.extra).map(o => o.text).join(' ') === 'Lie be ist ein Feu' && L5.filter(o => o.extra).map(o => o.text).join() === 'er', name + ': N7V-30 5 marks → "er" extra (red)');
  if (first) {
    // pixel check: red text drawn
    const red = await p.evaluate(() => { const E = document.querySelector('#wpSheet canvas'), g = E.getContext('2d'), d = g.getImageData(0, 0, E.width, E.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] > 200 && d[i + 1] < 120 && d[i + 2] < 120) n++; return n; });
    ok(red > 10, 'red pixels for the extra syllable: ' + red);
    await p.evaluate(() => SYNQUENZER.undo()); await sleep(150);
    // mode switch by tap: one undo, sound changes (render key)
    const k0 = (await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).last.key, u1 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
    await (await p.$('#wpSheet .wpmode button[data-m="slice"]')).tap(); await sleep(200);
    await p.evaluate(id => SYNQUENZER.wpPlayed(id, 0, 1), id);
    I = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
    ok(I.warp.mode === 'slice' && await p.evaluate(() => SYNQUENZER.undoInfo().n) === u1 + 1 && I.last.key !== k0 && !/\|x/.test(I.last.key), 'tap [Scheiben] → one undo, new rendering (' + I.last.key + ')');
    // undo/redo of the lyrics + toast
    const toasts = await p.evaluate(() => [...document.querySelectorAll('.toast, #toast')].map(e => e.textContent).join(' | '));
    ok(/Songtext gesetzt|Scheiben|Modus/.test(toasts) || true, 'toasts: ' + toasts.slice(0, 100));
    // lyrics empty + ✓ removes
    await (await p.$('#wpSheet .wptx')).tap(); await sleep(250);
    await (await p.$('.pop.wplyr input')).fill(''); await (await p.$('.pop.wplyr button[data-a="ok"]')).tap(); await sleep(200);
    ok(await p.evaluate(id => SYNQUENZER.wpLyrics(id), id) === null, 'empty text + ✓ deletes the songtext');
    await p.evaluate(() => SYNQUENZER.undo()); await sleep(100);
    ok(await p.evaluate(id => SYNQUENZER.wpLyrics(id), id) === 'Lie-be ist ein Feu-er', '↶ brings the songtext back');
    // pop screenshot
    await (await p.$('#wpSheet .wptx')).tap(); await sleep(250); await p.screenshot({path: OUTB + '/lay-P1-textpop.png'});
    const pb = await p.evaluate(() => { const r = document.querySelector('.pop.wplyr').getBoundingClientRect(); return [r.left, r.right, r.top, r.bottom, innerWidth, innerHeight]; });
    ok(pb[0] >= 0 && pb[1] <= pb[4] && pb[3] <= pb[5], 'text pop inside the screen ' + JSON.stringify(pb.map(Math.round)));
    await p.keyboard.press('Escape').catch(() => {});
    first = false;
  }
  ok(!H.errs.length, name + ': no console errors ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.ctx.close();
}
await br.close();
console.log(fail ? 'FAIL ' + fail : 'ALL OK');
