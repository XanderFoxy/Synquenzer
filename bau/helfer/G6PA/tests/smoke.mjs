import {launch, open, ok, done, OLD} from './lib.mjs';
const b = await launch();
for (const vp of [{width: 320, height: 568}, {width: 390, height: 844}, {width: 844, height: 390}]) {
  const p = await open(b, null, vp);
  const m = await p.evaluate(() => ({ver: VERSION, sw: document.scrollingElement.scrollWidth, iw: innerWidth, api: typeof SYNQUENZER.g6pInfo, fmt: SYNQUENZER.g6pFmt()}));
  ok('smoke ' + vp.width + 'x' + vp.height, !p.errs.length && m.ver === '4.25.2' && m.api === 'function' && m.fmt === 5 && m.sw <= m.iw, Object.assign(m, {errs: p.errs}));
  await p.ctx.close();
}
await b.close();
// v2-Chor ohne G6+c: Blatt öffnet, Abspielen über die v1-Näherung aus den Rückfall-Feldern, keine Fehler
{
  const b2 = await launch(); const p = await open(b2);
  const r = await p.evaluate(async () => {
    const x = Array.from({length: 57600}, (_, i) => Math.round(9000 * Math.sin(2 * Math.PI * 220 * i / 48000)));
    const a = await SYNQUENZER.tkInject({pcm: x, sr: 48000, scene: 0, len: 1}), st = a.track;
    SYNQUENZER.g6pSet({t: st, s: 0}, {v: 2, style: 'pop', grp: {}, voices: [{lane: 'c1', rule: 'st+2', n: [{t0: .1, t1: .9, m: 57, d: 2, iv: 4}], db: 0, pan: -.3, w: .6, dbl: [{ms: 10, ct: -5, p: -1}]}]});
    SYNQUENZER.g6Sheet({t: st, s: 0}); await sleep(200); const sheet = !!document.querySelector('.g6sheet'); closePop();
    SYNQUENZER.launchScene(0); await sleep(2500); const nodes = G6.nodes.size, src = TK.src.filter(r => !r.dead && r.ch).length; SYNQUENZER.stop();
    return {sheet, nodes, src, lanes: deep(S.tracks[st].chor)};
  });
  ok('v2 ohne G6+c: Blatt offen, spielt (v1-Näherung), Spur angelegt', r.sheet && r.nodes > 0 && r.lanes.lanes[0].name === 'Chor Terz oben' && !p.errs.length, Object.assign(r, {errs: p.errs}));
  await b2.close();
}
done();
