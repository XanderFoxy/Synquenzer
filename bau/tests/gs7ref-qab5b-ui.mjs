// QA VS5b (tester): typische-fehler on the new UI – labels/info line/toast cut (6 sizes), Text pop closes on every path,
// mode tap before quantize, lyrics safety + normalisation, copy/duplicate/save→reload with lyrics, close marks, undo after close
import {launch, open5, sleep, toI16, deq, SR, clickTone, OUTB} from './v3-vs5b-h.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const APPF = process.argv[2] || null;
const VP = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], XL: [926, 428]};
const br = await launch(null);
const T2 = [0.55, 0.67, 0.95, 1.27, 1.52, 1.74];
const x2 = clickTone(T2, 2.6, {toneFrom: 0.2});
async function setup(w, h) {
  const H = await open5(br, Object.assign({touch: true, viewport: {width: w, height: h}}, APPF ? {url: 'file://' + APPF} : {})), p = H.p;
  await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); }); await sleep(300);
  const r = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 1, len: 2}), toI16(x2));
  const det = await p.evaluate(id => SYNQUENZER.wpDetect(id), r.id);
  for (let k = det.length - 1; k >= 0; k--) if (!T2.some(t => Math.abs(t - det[k].t) < 0.005)) await p.evaluate(([id, k]) => SYNQUENZER.wpMark(id, 'del', k), [r.id, k]);
  return {H, p, r, id: r.id, ref: {t: r.track, s: 1}};
}
const cutInfo = p => p.evaluate(() => {
  const out = []; const sh = document.querySelector('#wpSheet'); if (!sh) return ['no sheet'];
  const S = sh.getBoundingClientRect();
  for (const e of sh.querySelectorAll('button, .wpinfo, .qh b, .lbl, .mval')) { const q = e.getBoundingClientRect(); if (!q.width) continue;
    const cut = e.scrollWidth > e.clientWidth + 1, outS = q.left < S.left - 0.5 || q.right > S.right + 0.5, outV = q.right > innerWidth + 0.5 || q.bottom > innerHeight + 0.5;
    const ell = getComputedStyle(e).textOverflow;
    if (cut || outS || outV) out.push(((e.className || e.tagName) + ':' + (e.textContent || '').trim().slice(0, 40)) + ` sw${e.scrollWidth}>cw${e.clientWidth}` + (outS ? ' outside sheet' : '') + (outV ? ' outside view' : '') + (ell === 'ellipsis' ? ' (ellipsis)' : '')); }
  return out;
});
const toastInfo = p => p.evaluate(() => [...document.querySelectorAll('.toast, #toast, .tst')].filter(e => e.getBoundingClientRect().width).map(e => { const q = e.getBoundingClientRect(); return {t: e.textContent.slice(0, 80), cut: e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1, l: Math.round(q.left), r: Math.round(q.right), vw: innerWidth}; }));
for (const [name, [w, h]] of Object.entries(VP)) {
  const {H, p, id, ref} = await setup(w, h);
  // quantize 1/8 Dehnen 100 % → factor 2.08 → warning
  await p.evaluate(r => SYNQUENZER.wpQuantize(r, {grid: '1/8', strength: 1, mode: 'stretch', t0: 0}), ref);
  await p.evaluate(id => SYNQUENZER.wpPlayed(id, 0, 1), id); await sleep(150);
  const ti = await toastInfo(p);
  ok(ti.some(t => /nur verschoben/.test(t.t)) && ti.every(t => !t.cut && t.l >= 0 && t.r <= t.vw), name + ': warning toast readable ' + JSON.stringify(ti));
  await p.evaluate(r => SYNQUENZER.wpOpen(r), ref); await sleep(400);
  const info = await p.evaluate(() => { const e = document.querySelector('#wpSheet .wpinfo'), q = e.getBoundingClientRect(), c = document.querySelector('#wpSheet canvas').getBoundingClientRect(); return {t: e.textContent, sw: e.scrollWidth, cw: e.clientWidth, sh: e.scrollHeight, ch: e.clientHeight, l: q.left, r: q.right, cl: c.left, cr: c.right, ws: getComputedStyle(e).whiteSpace, to: getComputedStyle(e).textOverflow}; });
  ok(/nur verschoben/.test(info.t) && info.sw <= info.cw + 1 && info.sh <= info.ch + 1 && info.r <= info.cr + 1, name + ': info line with warning fully readable ' + JSON.stringify(info));
  const cut = await cutInfo(p);
  ok(!cut.length, name + ': nothing cut in the editor ' + JSON.stringify(cut));
  await p.screenshot({path: OUTB + '/qa-' + name + '-warn.png'});
  // Text pop: open, then each closing path
  const paths = [['✕ editor', async () => { const q = await (await p.$('#wpSheet .sh-x')).boundingBox(); await p.touchscreen.tap(q.x + q.width / 2, q.y + q.height / 2); }], ['stop', async () => { await p.evaluate(() => { SYNQUENZER.play(); }); await sleep(200); await p.evaluate(() => SYNQUENZER.stop()); }], ['scene', async () => { await p.evaluate(() => SYNQUENZER.launchScene(0)); }]];
  for (const [pn, fn] of name === 'P1' ? paths : []) {
    if (!(await p.evaluate(() => !!document.querySelector('#wpSheet.open')))) { await p.evaluate(r => SYNQUENZER.wpOpen(r), ref); await sleep(300); }
    await (await p.$('#wpSheet .wptx')).tap(); await sleep(200);
    await fn(); await sleep(300);
    const st = await p.evaluate(() => ({pop: !!document.querySelector('.pop.wplyr'), ed: !!document.querySelector('#wpSheet.open')}));
    console.log('  text pop after ' + pn + ':', JSON.stringify(st));
    if (st.pop) { await p.touchscreen.tap(4, Math.round((await p.evaluate(() => innerHeight)) / 2)); await sleep(250); }
    if (pn === '✕ editor') ok(!st.pop, name + ': tap on ✕ with Text pop open closes the pop');
    else ok(!st.pop || st.ed, name + ': no orphaned Text pop after ' + pn);
  }
  await H.ctx.close();
}
// ---------- data paths (P1) ----------
{
  const {H, p, id, ref, r} = await setup(390, 844);
  const U = () => p.evaluate(() => SYNQUENZER.undoInfo().n);
  // mode tap before quantizing: no undo, then chip uses that mode with its default strength
  await p.evaluate(r => SYNQUENZER.wpOpen(r), ref); await sleep(300);
  const u0 = await U();
  await (await p.$('#wpSheet .wpmode button[data-m="slice"]')).tap(); await sleep(150);
  const sv = await p.evaluate(() => document.querySelector('#wpSheet .qrow input[type=range]').value);
  ok(await U() === u0 && sv === '100', '[Scheiben] before quantizing: no undo, slider 70 → 100 % (' + sv + ')');
  await (await p.$('#wpSheet .qchips button[data-v="1/8"]')).tap(); await sleep(300);
  let I = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
  ok(I.warp.mode === 'slice' && I.warp.strength === 1 && await U() === u0 + 1, 'then 1/8 → Scheiben 100 %, one undo');
  // XSS / normalisation
  await (await p.$('#wpSheet .wptx')).tap(); await sleep(200);
  await (await p.$('.pop.wplyr input')).fill('"><img src=x onerror="window.__x=1">'); await (await p.$('.pop.wplyr button[data-a="ok"]')).tap(); await sleep(250);
  await (await p.$('#wpSheet .wptx')).tap(); await sleep(200);
  const back = await p.evaluate(() => document.querySelector('.pop.wplyr input').value);
  ok(!(await p.evaluate(() => window.__x)) && back === '"><img src=x onerror="window.__x=1">', 'lyrics with markup: no injection, text comes back unchanged in the field');
  await (await p.$('.pop.wplyr input')).fill('Lie-be ist ein Feu-er'); await (await p.$('.pop.wplyr button[data-a="ok"]')).tap(); await sleep(250);
  const long = 'la-'.repeat(200);
  await p.evaluate(([id, t]) => SYNQUENZER.wpLyrics(id, t), [id, long]);
  const lg = await p.evaluate(id => SYNQUENZER.wpLyrics(id), id);
  ok(lg && lg.length <= 400, 'long text normalised to ≤ 400 chars (' + (lg && lg.length) + ')');
  await p.evaluate(() => SYNQUENZER.undo());
  ok(await p.evaluate(id => SYNQUENZER.wpLyrics(id), id) === 'Lie-be ist ein Feu-er', '↶ restores previous lyrics');
  // close editor, undo/redo of lyrics still works
  await (await p.$('#wpSheet .sh-x')).tap(); await sleep(200);
  await p.evaluate(() => SYNQUENZER.undo());
  const afterU = await p.evaluate(id => SYNQUENZER.wpLyrics(id), id);
  await p.evaluate(() => SYNQUENZER.redo());
  ok(afterU !== 'Lie-be ist ein Feu-er' && await p.evaluate(id => SYNQUENZER.wpLyrics(id), id) === 'Lie-be ist ein Feu-er', 'editor closed: ↶ removes, ↷ restores lyrics (' + afterU + ')');
  // copy / duplicate the clip: lyrics follow (same take)
  await p.evaluate(r => { SYNQUENZER.copyClip(r.track, 1); SYNQUENZER.pasteClip(r.track, 3); SYNQUENZER.duplicateClip(r.track, 1); }, r);
  const cl = await p.evaluate(r => [1, 2, 3].map(s => { const c = SYNQUENZER.getClip(r.track, s); return c && c.audio ? c.audio.take : null; }), r);
  const ly = await p.evaluate(ids => ids.map(t => t ? SYNQUENZER.wpLyrics(t) : null), cl);
  ok(cl.filter(Boolean).length >= 2 && ly.filter(Boolean).every(x => x === 'Lie-be ist ein Feu-er'), 'copy/paste and duplicate keep the take with its lyrics ' + JSON.stringify(cl) + ' ' + JSON.stringify(ly));
  // save → real reload
  const J = await p.evaluate(() => SYNQUENZER.project());
  const sv2 = await p.evaluate(() => SYNQUENZER.save());
  await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version); await sleep(1500);
  const J2 = await p.evaluate(() => SYNQUENZER.project());
  ok(sv2 && deq(J, J2) && J2.takes && J2.takes[id] && J2.takes[id].lyrics === 'Lie-be ist ein Feu-er', 'save → reload deep-equal incl. lyrics, mode, map (saved ' + sv2 + ')');
  const pl = await p.evaluate(id => SYNQUENZER.wpPlayed(id, 0, 10), id);
  ok(pl && !pl.raw, 'after reload the quantized version plays');
  ok(!H.errs.length, 'no console errors ' + JSON.stringify(H.errs.slice(0, 3)));
  await H.ctx.close();
}
// ---------- edge cases: marks very close / at the start / at the end ----------
{
  const {H, p, id, ref} = await setup(390, 844);
  await p.evaluate(id => { SYNQUENZER.wpMark(id, 'add', 0.958); SYNQUENZER.wpMark(id, 'add', 0.0015); SYNQUENZER.wpMark(id, 'add', 2.592); SYNQUENZER.wpMark(id, 'add', 1.281); }, id);
  const mk = (await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).marks.map(m => +m.t.toFixed(4));
  for (const [g, s] of [['1/16', 1], ['1/8', 0.7], ['1/32', 1]]) {
    await p.evaluate(([r, g, s]) => SYNQUENZER.wpQuantize(r, {grid: g, strength: s, mode: 'stretch', t0: 0}), [ref, g, s]);
    const Y = await p.evaluate(id => SYNQUENZER.wpPlayed(id), id), raw = await p.evaluate(id => SYNQUENZER.tkBufRange(id), id);
    let pk = 0, pr = 0, fin = true; for (const v of Y.data) { if (!Number.isFinite(v)) fin = false; pk = Math.max(pk, Math.abs(v)); } for (const v of raw) pr = Math.max(pr, Math.abs(v));
    const I = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
    ok(fin && pk <= pr * 1.05 && !Y.raw, `close marks (${mk.join(' ')}) ${g} ${s * 100} %: finite, peak ${pk.toFixed(3)} ≤ raw ${pr.toFixed(3)}, warn ${JSON.stringify(I.warn)}`);
  }
  ok(!H.errs.length, 'edge cases: no console errors ' + JSON.stringify(H.errs.slice(0, 3)));
  await H.ctx.close();
}
await br.close();
console.log(fail ? 'FAIL ' + fail : 'ALL OK');
