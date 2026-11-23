const {chromium, sleep, open, setup, render} = require('./lib2.cjs');
const port = process.argv[2];
(async () => {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const {ctx, p, errs} = await open(b, port, 'neu', 428, 926);
  const s = await setup(p); await render(p, false);
  const gn = await p.evaluate(async ({st}) => {
      const a0 = S.tracks[st].clips[0].audio, id = a0.take, mt = MEL_T; a0.vt = {k: id, e: a0.out - 1.5};
      S.tracks[mt].clips[0] = {len: 2, key: S.key, notes: [{t: 1, d: .5, n: 60, v: .8}, {t: 6, d: .5, n: 64, v: .8}], take: id};
      clipChanged(mt, 0); SYNQUENZER.songFromChain([{scene: 0, bars: 2}]);
      const log = []; const sv0 = spawnClipVoice; spawnClipVoice = function (i, out, v, t) { if (i === mt) log.push(+(t).toFixed(3)); return sv0.apply(this, arguments); };
      try {
        VV.cancel = false; await vvRenderAudio({range: {a: 0, b: S.song.bars, sel: false}});
        const mit = log.slice(); log.length = 0;
        const keep = a0.vt; delete a0.vt;
        await vvRenderAudio({range: {a: 0, b: S.song.bars, sel: false}}); a0.vt = keep;
        return {mit, ohne: log.slice(), notes: S.tracks[mt].clips[0].notes.length};
      } finally { spawnClipVoice = sv0; S.tracks[mt].clips[0] = null; clipChanged(mt, 0); delete a0.vt; }
  }, {st: s.st}).catch(e => ({err: String(e)}));
  console.log(JSON.stringify(gn), JSON.stringify(errs));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
