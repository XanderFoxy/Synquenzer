import {launch, open, J} from './v3-qa-mk3-lib.mjs';
const b = await launch();
for (const fresh of [true, false]) {
const {ctx, page, errs} = await open('L1');
if (!fresh) await page.evaluate(async () => { ensureAudio(); await new Promise(q => setTimeout(q, 2500)); });
const r = await page.evaluate(async () => {
  const lvl = r => { let e = 0; for (let i = 24000; i < 48000; i++) e += r.l[i] * r.l[i]; return +(10 * Math.log10(e / 24000 + 1e-30)).toFixed(1); };
  const base = () => { const s = deep(sndOf(0)); s.p.mk = SQMK.normMk(s.p.mk); return s; };
  const out = {};
  for (const [lab, f] of [['Single T1 wave30', m => { m.t[0].o1.w = 5; m.t[0].o1.c2 = 58; }], ['Dual T1 PEGEL0, T2 saw', m => { m.mode = 1; m.t[0].a.lvl = 0; }], ['Dual T1 PEGEL0, T2 wave30', m => { m.mode = 1; m.t[0].a.lvl = 0; m.t[1].o1.w = 5; m.t[1].o1.c2 = 58; }],
    ['Dual T1 PEGEL0, T2 wave12', m => { m.mode = 1; m.t[0].a.lvl = 0; m.t[1].o1.w = 5; m.t[1].o1.c2 = 22; }], ['Split T2 wave30 (note above)', m => { m.mode = 2; m.split = 40; m.t[1].o1.w = 5; m.t[1].o1.c2 = 58; }],
    ['Dual T1 wave12, T2 wave30, T1 PEGEL0', m => { m.mode = 1; m.t[0].a.lvl = 0; m.t[0].o1.w = 5; m.t[0].o1.c2 = 22; m.t[1].o1.w = 5; m.t[1].o1.c2 = 58; }]]) {
    const s = base(); f(s.p.mk); const rr = await SYNQUENZER.mkRender(s, [[0, 'on', 57, .9]], {sec: 1}); out[lab] = lvl(rr); }
  out.info = SYNQUENZER.mkInfo(); return out; });
console.log(fresh ? 'fresh page (no audio context):' : 'after ensureAudio:', J(r));
await ctx.close(); }
await b.close();
