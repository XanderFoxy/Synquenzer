import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2];
const b = await chromium.launch();
const p = await b.newPage({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER, null, {timeout: 60000});
await p.waitForTimeout(600);
const r = await p.evaluate(async () => {
  await SYNQUENZER.newProject();
  const ch = [[48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50]];   // C Am F G
  const pad = []; ch.forEach((c, k) => c.forEach(n => pad.push({t: k * 4, d: 4, n: n + 12, v: .7})));
  SYNQUENZER.setClip(2, 0, {len: 4, notes: pad});
  SYNQUENZER.setClip(0, 0, {len: 4, notes: []});
  const B = SYNQUENZER.bb1;
  const out = {figs: B.figs().length, ctx: B.ctx(0, 0), key: S.tracks[0].clips[0].key, roles: B.roles()};
  out.res = {};
  for (const f of B.figs()) {
    const t = f.r === 'drum' ? 4 : 0;
    if (f.r === 'drum' && !S.tracks[4].clips[0]) SYNQUENZER.setClip(4, 0, {len: 4, notes: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(i => ({t: i, d: .1, n: i % 2 ? 38 : 36, v: .8})).concat([...Array(32)].map((_, i) => ({t: i * .5, d: .1, n: 42, v: .6})))});
    const x = B.build(t, 0, f.id);
    out.res[f.id] = x ? {n: x.notes.length, gen: x.gen, len: x.len, how: x.how, first: x.notes.slice(0, 6).map(n => [n.t, n.n, n.d, n.v])} : null;
  }
  out.targets = B.targets(0, 0);
  return out;
});
console.log(JSON.stringify(r, null, 0).slice(0, 9000));
console.log('errs', errs);
await b.close();
