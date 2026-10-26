// MK-P-03 / MK-P-04 audible: each sound element of the plate, moved by a real touch gesture, changes the rendered sound (mkRender)
// argv: mode synth|voc|dual2
import {launch, open, openMk, touch, tap, line, panel, ctr} from './v3-qmkp-lib.mjs';
const MODE = process.argv[2] || 'synth';
const b = await launch(); const page = await open(b, 'X'); await openMk(page); await page.waitForTimeout(300);
await page.evaluate(MODE => {
  const t = 0, S_ = (p, v) => SYNQUENZER.mkSet(t, p, v);
  // a base where the LFO waves, patches, effects and the sequence are audible
  for (const k of [0, 1]) { S_(`t.${k}.f.cut`, 70); S_(`t.${k}.f.res`, 40); S_(`t.${k}.p.0.s`, 2); S_(`t.${k}.p.0.d`, 4); S_(`t.${k}.p.0.i`, 40); S_(`t.${k}.p.1.s`, 3); S_(`t.${k}.p.1.d`, 0); S_(`t.${k}.p.1.i`, 20);
    S_(`t.${k}.p.2.s`, 0); S_(`t.${k}.p.2.d`, 6); S_(`t.${k}.p.2.i`, 30); S_(`t.${k}.p.3.s`, 1); S_(`t.${k}.p.3.d`, 2); S_(`t.${k}.p.3.i`, 30); S_(`t.${k}.l1.f`, 90); S_(`t.${k}.l2.f`, 80);
    S_(`t.${k}.mix.o2`, 60); S_(`t.${k}.mix.n`, 10); S_(`t.${k}.e1.s`, 60); S_(`t.${k}.f.eg`, 30); S_(`t.${k}.a.pan`, 10); S_(`t.${k}.o1.c1`, 40); S_(`t.${k}.o1.c2`, 40); S_(`t.${k}.porta`, 30); S_(`t.${k}.e2.s`, 90); S_(`t.${k}.e2.r`, 40);
    S_(`t.${k}.seq.q.0.k`, 11); for (let n = 0; n < 16; n++) S_(`t.${k}.seq.q.0.v.${n}`, (n % 4) * 12 - 18); }
  S_('mfx.dep', 60); S_('dly.dep', 60); S_('dly.time', 60);
  if (MODE === 'voc') S_('mode', 3); if (MODE === 'dual2') { S_('mode', 1); MKUI.P.tim = 2; }
  MKUI.view({ansicht: 'ganz'}); MKUI.renderSoon();
}, MODE);
await page.waitForTimeout(500);
const P0 = await panel(page);
const els = P0.elements.filter(e => e.bind && e.px && !/^(prog:|lcd:|view:|track:)/.test(e.bind) && e.id !== 'lcd' && !/^(trim|bpm)/.test(e.bind) && e.bind !== 'bpm');
const render = (snd, vocIn) => page.evaluate(async ([snd, vocIn]) => {
  const ev = [[0.05, 'on', 48, .8], [0.05, 'on', 55, .8], [0.05, 'on', 60, .8], [0.05, 'on', 64, .8], [1.1, 'off', 48, 0], [1.1, 'off', 55, 0], [1.1, 'off', 60, 0], [1.1, 'off', 64, 0], [1.3, 'on', 67, .6], [1.6, 'off', 67, 0]];
  const sr = 48000, sec = 2.0, o = {sec, sr, seed: 7};
  if (vocIn) { const n = sec * sr, a = new Float32Array(n), c = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { const f = 140 + 30 * Math.sin(i / sr * 3); ph += f / sr; const s = (ph % 1) * 2 - 1; a[i] = .3 * s * (1 + .5 * Math.sin(i / sr * 11)); c[i] = .3 * Math.sin(2 * Math.PI * 220 * i / sr); } o.inputs = {e2: a, e1: c}; }
  const r = await SYNQUENZER.mkRender(JSON.parse(snd), ev, o); return [Array.from(r.l), Array.from(r.r)];
}, [snd, vocIn]);
const diffDb = (A, B) => { let e = 0, d = 0; for (const ch of [0, 1]) for (let i = 0; i < A[ch].length; i++) { e += B[ch][i] * B[ch][i]; const x = A[ch][i] - B[ch][i]; d += x * x; } return {rel: 10 * Math.log10(d / Math.max(1e-30, e) + 1e-30), lvl: 10 * Math.log10(e / A[0].length / 2 + 1e-30)}; };
const res = [];
for (const e of els) {
  await page.evaluate(x => { MKUI.view({ansicht: 'ganz'}); MKUI.P.mode = 'spiel'; MKUI.renderSoon(); }, e.x); await page.waitForTimeout(150);
  const E = (await panel(page)).elements.find(x => x.id === e.id); const [x, y] = ctr(E);
  const before = await page.evaluate(() => JSON.stringify(S.tracks[0].sound));
  const rg = await page.evaluate(id => { const d = MKUI.defOf(id); return d ? [MKUI.get(d), ...MKUI.range(d)] : null; }, e.id);
  const up = !rg || rg[0] < (rg[1] + rg[2]) / 2;
  if (E.art === 'k') await touch(page, line(x, y, x, up ? y - 60 : y + 60, 12), 16); else await tap(page, x, y);
  await page.waitForTimeout(150);
  const after = await page.evaluate(() => JSON.stringify(S.tracks[0].sound));
  if (after === before) { res.push([e.id, e.bind, 'NO CHANGE']); continue; }
  const A = await render(after, MODE === 'voc'), B = await render(before, MODE === 'voc'); const d = diffDb(A, B);
  res.push([e.id, e.bind, d.rel.toFixed(1) + ' dB', 'lvl ' + d.lvl.toFixed(1), E.grau ? 'GRAU' : '']);
  await page.evaluate(() => SYNQUENZER.undo()); await page.waitForTimeout(150);
}
for (const r of res) console.log(MODE, r.join('  '));
console.log('errs', JSON.stringify(page.errs).slice(0, 300));
await b.close();
