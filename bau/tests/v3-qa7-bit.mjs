import * as Q from './v3-qa7-lib.mjs';
const PRE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/G-MK34-merge.html';
const br = await Q.launch();
const A = await Q.openApp(br), B = await Q.openApp(br, {file: PRE});
const sounds = await A.page.evaluate(() => {
  const S = SYNQUENZER, out = [];
  out.push(['VA default', S.getSound(0)]);
  S.setEngine(1, 'fm6'); out.push(['FM6 default', S.getSound(1)]);
  S.setEngine(0, 'mk'); const b = S.getSound(0); out.push(['AM INIT', JSON.parse(JSON.stringify(b))]);
  const c = JSON.parse(JSON.stringify(b)); c.p.mk.mode = 1; c.p.mk.t[1].o1.w = 1; c.p.mk.t[0].f.cut = 70; c.p.mk.t[0].f.res = 90; c.p.mk.mfx.dep = 80; c.p.mk.dly.dep = 60; c.p.mk.eq.hg = 6; out.push(['AM Dual+FX', c]);
  const d = JSON.parse(JSON.stringify(b)); d.p.mk.mode = 2; d.p.mk.t[1].mix = {o1: 0, o2: 0, n: 127}; d.p.mk.t[0].o1.w = 3; d.p.mk.t[0].o1.c1 = 90; d.p.mk.t[0].l1.f = 90; d.p.mk.t[0].p[1].i = 40; out.push(['AM Split+Sin+Noise', d]);
  const e = JSON.parse(JSON.stringify(b)); e.p.mk.t[0].o1.w = 4; e.p.mk.t[0].o1.c1 = 60; e.p.mk.t[0].a.dist = 1; e.p.mk.t[0].asg = 2; out.push(['AM Vox Unison Dist', e]);
  const f = JSON.parse(JSON.stringify(b)); f.p.mk.t[0].o1.w = 5; f.p.mk.t[0].o1.c2 = 20; f.p.mk.t[0].o2.mod = 2; f.p.mk.t[0].mix.o2 = 100; out.push(['AM DWGS Sync', f]);
  return out;
});
const ev = [[0, 'on', 48, .8], [.1, 'on', 60, .7], [.2, 'on', 64, .9], [.3, 'on', 72, .6], [.9, 'off', 48], [1.0, 'off', 60], [1.2, 'off', 64], [1.4, 'off', 72], [1.5, 'on', 84, .8], [1.9, 'off', 84]];
for (const [nm, s] of sounds) {
  const ra = await Q.render(A.page, s, ev, {sec: 2.5}), rb = await Q.render(B.page, s, ev, {sec: 2.5});
  let md = 0; for (let i = 0; i < ra.l.length; i++) md = Math.max(md, Math.abs(ra.l[i] - rb.l[i]), Math.abs(ra.r[i] - rb.r[i]));
  Q.ok('MK7-12 bitgleich ' + nm, md === 0, 'max |Δ| ' + md + ' rms ' + Q.db(Q.rms(ra.l)).toFixed(1));
}
console.log('errs', A.errs.slice(0, 3), B.errs.slice(0, 3));
Q.summary(); await br.close();
