import { chromium } from 'playwright';
const f = process.argv[2];
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 428, height: 926}, hasTouch: true});
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + f); await p.waitForTimeout(1500);
const sample = async (label, ms) => {
  const out = [];
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    out.push(await p.evaluate(() => { const Q = window.SYNQUENZER, rt = Q.state().runtime; const pd = Q.v6aProbeData(2) || []; const last = pd.length ? pd[pd.length - 1] : null;
      return {beat: +rt.beat.toFixed(2), slot: rt.slots[2], q: rt.queued && rt.queued[2], cur: (Q.v6aInfo().cur[2] || {}).sig, wk: last ? Math.round(last.v[0]) + '/' + last.n : '-'}; }));
    await p.waitForTimeout(150);
  }
  console.log(label, out.map(o => `${o.beat}:${o.slot}${o.q != null ? '>' + JSON.stringify(o.q) : ''}:${o.cur ? o.cur.slice(0, 22) : '∅'}:${o.wk}`).join(' | '));
};
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.v6aSetState(2, 0, {p: {cutoff: 300}}); Q.v6aSetState(2, 1, {p: {cutoff: 8000}}); Q.v6aSetGlide(2, 0, {x: 'bar1'}); Q.v6aSetGlide(2, 1, {x: 'bar1'}); });
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.launchScene(0); });
await p.waitForTimeout(1200);
await p.evaluate(() => window.SYNQUENZER.v6aProbe(2, ['cutoff']));
await p.evaluate(() => window.SYNQUENZER.launchScene(1));
await sample('scene0->1', 5000);
await p.evaluate(() => window.SYNQUENZER.v6aProbe(2, ['cutoff']));
await p.evaluate(() => window.SYNQUENZER.launchScene(0));
await sample('scene1->0', 5000);
console.log('errors', JSON.stringify(errs));
await b.close();
