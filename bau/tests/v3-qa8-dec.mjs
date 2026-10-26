import {launch, open} from './v3-qa8-lib.mjs';
const b = await launch();
for (let k = 0; k < 2; k++) {
  const {ctx, page: p} = await open(b, 'P1');
  const r = await p.evaluate(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); await w(300);
    const s0 = MKF.stat(); const t = performance.now(); openBrowser(0); const ms = performance.now() - t; const s1 = MKF.stat();
    // scroll the whole list (virtual rows) and see what gets decoded
    const sc = (() => { let e = document.querySelector('#sndSheet .brow').parentElement; while (e && e.scrollHeight <= e.clientHeight) e = e.parentElement; return e; })();
    const t2 = performance.now(); sc.scrollTop = sc.scrollHeight; await w(200); const s2 = MKF.stat();
    // "Alle Engines"
    closeBrowser(false); await w(100);
    // soundHash with/without bank/slot
    const a = SQStore.normalizeSound(Object.assign(factorySound('f-mk-c04'), {bank: 3, slot: 4})), bb = SQStore.normalizeSound(factorySound('f-mk-c04'));
    return {openMs: +ms.toFixed(1), decodedBefore: s0.loaded.filter(Boolean).length, decodedAfterOpen: s1.loaded.filter(Boolean).length, msPerBank: s1.ms.map(x => +x.toFixed(1)), afterScroll: s2.loaded.filter(Boolean).length,
      hashEq: SQStore.soundHash(a) === SQStore.soundHash(bb), keptBank: a.bank}; });
  console.log(JSON.stringify(r));
  await ctx.close();
}
await b.close();
