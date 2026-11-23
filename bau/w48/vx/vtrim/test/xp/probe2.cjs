const {chromium, sleep, open, setupX, openEdUI, geo, clipA} = require('./xlib.cjs');
(async () => {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const {ctx, p, errs, T} = await open(b, process.argv[2], 'neu', 428, 926);
  const s = await setupX(p, {pre: .5, post: 1.2});
  await openEdUI(p, T, s.st);
  // ohne Schnitt: Song live – klingt der Nachlauf hinter dem Song-Ende (g3p)?
  await p.evaluate(() => { const o0 = tkStartSrc; window.__c = []; tkStartSrc = function (o) { if (o.take && !o.ctx) __c.push(String(o.key) + ' off' + o.off.toFixed(3) + ' dur' + (o.end - o.when).toFixed(3)); return o0.apply(this, arguments); }; SYNQUENZER.songFromChain([{scene: 0, bars: 2}]); songPlayStart(0); });
  await sleep(7000); console.log('song ohne Schnitt', await p.evaluate(() => { stop(); return {c: __c, loop: S.song.loop}; }));
  await p.evaluate(() => ED.roll.fitView('clip')); await sleep(500);
  let g = await geo(p);
  await T.drag((g.eF.l + g.eF.r) / 2, (g.eF.t + g.eF.b) / 2, g.cM.l + 2, 20); g = await geo(p);
  console.log(JSON.stringify({eF: g.eF, eH: g.eH, f: g.f}), await p.evaluate(({x, y}) => { const e = document.elementFromPoint(x, y); return e && (e.className && e.className.baseVal !== undefined ? 'svg:' + e.closest('button').className : e.className) + ' ' + e.tagName; }, {x: (g.eF.l + g.eF.r) / 2, y: (g.eF.t + g.eF.b) / 2}));
  await p.screenshot({path: __dirname + '/probe2.png'});
  await ctx.close(); await b.close();
})();
