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
      const c = Q.v6aInfo().cur[2]; return {beat: +rt.beat.toFixed(2), slot: rt.slots[2], cur: c ? (c.sig.match(/cutoff":(\d+)/) || [0, 'G'])[1] : '∅', wk: last ? Math.round(last.v[0]) + '/' + last.n : '-'}; }));
    await p.waitForTimeout(200);
  }
  console.log(label, out.map(o => `${o.beat}:${o.slot}:${o.cur}:${o.wk}`).join(' | '));
};
const mode = process.argv[3] || 'song';
await p.evaluate((mode) => { const Q = window.SYNQUENZER; Q.v6aSetState(2, 0, mode === 'none0' ? null : {p: {cutoff: 300}}); Q.v6aSetState(2, 1, {p: {cutoff: 8000}}); Q.v6aSetGlide(2, 1, {x: 'bar1'}); if (mode !== 'none0') Q.v6aSetGlide(2, 0, {x: 'bar1'});
  Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); }, mode);
const kon = await p.evaluate(() => JSON.stringify(window.SYNQUENZER.konsolidieren(0, 3, 'Test')));
console.log('kon', kon, await p.evaluate(() => JSON.stringify(window.SYNQUENZER.parts().filter(Boolean).map(x => ({name: x.name, lanes: x.lanes[2], gl: x.gl})))));
if (mode === 'part') {
  await p.evaluate(() => { const Q = window.SYNQUENZER; const k = Q.parts().findIndex(x => x && x.name === 'Test'); Q.launchPart(k); });
  await p.waitForTimeout(400);
  await p.evaluate(() => window.SYNQUENZER.v6aProbe(2, ['cutoff']));
  await sample('part', 10000);
} else {
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songPlay(0); });
  await p.waitForTimeout(300);
  await p.evaluate(() => window.SYNQUENZER.v6aProbe(2, ['cutoff']));
  await sample('song', 10000);
}
console.log('errors', JSON.stringify(errs));
await b.close();
