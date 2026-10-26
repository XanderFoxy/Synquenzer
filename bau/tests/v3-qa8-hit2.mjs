import {launch, open} from './v3-qa8-lib.mjs';
const b = await launch();
for (const f of ['P1', 'P3', 'L2']) {
  const {ctx, page: p} = await open(b, f);
  const r = await p.evaluate(async () => { await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); mkProg.select(3, 3); openBrowser(0); await new Promise(r => setTimeout(r, 400));
    return [...document.querySelectorAll('#sndSheet .brcats .chip')].filter(e => e.offsetWidth).map(e => { const q = e.getBoundingClientRect(); const cx = q.x + q.width / 2;
      // effective hit area: how far above / below the visual edge a point still lands on the chip
      let up = 0; for (let d = 1; d < 20; d++) { const h = document.elementFromPoint(cx, q.top - d); if (h && (h === e || e.contains(h))) up = d; else break; }
      let dn = 0; for (let d = 1; d < 20; d++) { const h = document.elementFromPoint(cx, q.bottom + d); if (h && (h === e || e.contains(h))) dn = d; else break; }
      return (e.dataset.c || e.dataset.scope) + ' ' + Math.round(q.width) + '×' + Math.round(q.height) + ' (+' + up + '/+' + dn + ')'; }); });
  console.log(f, r.join(' | '));
  await ctx.close();
}
await b.close();
