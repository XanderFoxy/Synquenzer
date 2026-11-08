import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const FILE = process.argv[2], OUT = process.argv[3];
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']}), errs = [];
const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, deviceScaleFactor: 2}); const p = await ctx.newPage();
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + FILE); await p.waitForTimeout(1500);
const res = {};
for (const dir of ['pend', 'rnd']) {
  await p.evaluate(dir => { stop(); SYNQUENZER.loadDemo(); ensureAudio(); GL1.hint = true;
    for (let t = 0; t < NT(); t++) if (S.tracks[t]) for (let s = 0; s < NS(); s++) S.tracks[t].clips[s] = null;
    S.tracks[0].clips[0] = {len: 1, key: {root: 0, scale: 'ionian', src: 'user'}, notes: [0, 2, 4, 5, 7, 9, 11, 12].map((d, k) => ({t: k * .5, d: .4, n: 60 + d, v: .8}))};
    for (let t = 0; t < NT(); t++) clipChanged(t, 0); R.selS = 0; SYNQUENZER.lf1Dir(0, 0, {dir, g: '1/8'}); }, dir);
  await p.waitForTimeout(300);
  const r = await p.evaluate(async (withRoll) => {
    const wait = ms => new Promise(r => setTimeout(r, ms)), c = S.tracks[0].clips[0];
    let lo = 127, hi = 0; for (const n of c.notes) { lo = Math.min(lo, n.n); hi = Math.max(hi, n.n); } const span = Math.max(hi - lo, 6);
    const mini = () => { const svg = UI.cells[0][0].mini.innerHTML, re = /<rect( class="g1g")? x="([-\d.]+)" y="([-\d.]+)"/g; let m; const out = []; while ((m = re.exec(svg))) if (!m[1]) out.push([+m[2], Math.round(lo + (1 - +m[3] / 86) * span) - 60]); return out.sort((a, b) => a[0] - b[0]).map(q => q[1]).join(' '); };
    if (withRoll) { SYNQUENZER.gl1RollMode('played'); ROLLP.view = 'roll'; openRoll(0, 0); await wait(600); }
    const rest = {mini: mini(), roll: withRoll ? SYNQUENZER.gl1Info().roll : null};
    SYNQUENZER.clearLog(); play(); launchScene(0);
    const seen = {}; const t0 = performance.now();
    while (performance.now() - t0 < 11000) {
      await wait(60);
      const bA = audBeat(), cs = audCstart(0, bA); if (!(bA >= cs)) continue;
      const k = Math.floor((bA - cs) / 4), ph = (bA - cs) - 4 * k; if (ph < .8 || ph > 3.2) continue;   // mitten im Durchlauf
      if (seen[k]) continue;
      const I = SYNQUENZER.gl1Info();
      seen[k] = {mini: mini(), roll: I.roll ? I.roll.rects.slice().sort((a, b) => a.t - b.t).map(q => q.n - 60).join(' ') : null, rollP: I.roll ? I.roll.p : null, next: I.roll ? I.roll.next : null, want: lf1Pass(c, k).map(n => n.n - 60).join(' ')};
    }
    stop(); await wait(250);
    const log = SYNQUENZER.noteLog(400).filter(e => e.track === 0).sort((a, b) => a.beat - b.beat), b0 = log.length ? log[0].beat : 0;
    for (const k of Object.keys(seen)) seen[k].heard = log.filter(e => e.beat >= b0 + 4 * k - 1e-6 && e.beat < b0 + 4 * k + 4 - 1e-6).map(e => e.out - 60).join(' ');
    await wait(200);
    const after = {mini: mini(), roll: withRoll ? SYNQUENZER.gl1Info().roll.p : null};
    if (withRoll) closeRoll();
    return {rest: {mini: rest.mini, rollP: rest.roll && rest.roll.p, next: rest.roll && rest.roll.next}, seen, after};
  }, dir === 'pend');
  res[dir] = r;
  if (dir === 'pend') { await p.evaluate(async () => { SYNQUENZER.gl1RollMode('played'); ROLLP.view = 'roll'; openRoll(0, 0); }); await p.waitForTimeout(700); await p.screenshot({path: OUT + '/rolle-pend-weiter.png'}); await p.evaluate(() => closeRoll()); }
}
console.log(JSON.stringify(res, null, 1));
console.log('errs', errs.slice(0, 5));
await b.close();
