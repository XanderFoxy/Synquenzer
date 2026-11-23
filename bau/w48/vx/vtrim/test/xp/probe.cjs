const {chromium, sleep, open, setupX, openEdUI, geo, clipA} = require('./xlib.cjs');
(async () => {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const {ctx, p, errs, T} = await open(b, process.argv[2], 'neu', 428, 926);
  const s = await setupX(p, {pre: .5, post: 1.2});
  await openEdUI(p, T, s.st);
  console.log(await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => /↶|✕/.test(b.textContent) && b.offsetParent).map(b => { const r = b.getBoundingClientRect(); return [b.textContent.trim().slice(0, 20), b.className, b.id, Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height), b.disabled]; })));
  const close = await p.evaluate(() => { const b = [...document.querySelectorAll('button')].filter(b => b.textContent.trim() === '✕' && b.offsetParent); const r = b.length ? b[0].getBoundingClientRect() : null; return r ? {x: r.left + r.width / 2, y: r.top + r.height / 2} : null; });
  console.log('close', close); await T.tap(close); await sleep(500);
  console.log(await p.evaluate(() => ({ed: vx1rOpenNow(), song: !!S.song, sv: UI.songView, playing: R.playing})));
  const pb = await p.evaluate(() => { const r = document.querySelector('#bPlay').getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
  await T.tap(pb); await sleep(1500);
  console.log(await p.evaluate(() => ({playing: R.playing, ctx: AU.ctx && AU.ctx.state, slot: R.slot, reg: TK.reg && TK.reg.size})));
  await p.evaluate(() => { SYNQUENZER.songFromChain([{scene: 0, bars: 2}]); });
  console.log(await p.evaluate(() => ({song: S.song && S.song.bars, playing: R.playing})));
  await ctx.close(); await b.close();
})();
