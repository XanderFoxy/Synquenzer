import {launch, open, FMT} from './v3-qa8-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await launch();
for (const f of Object.keys(FMT)) {
  const {ctx, page: p} = await open(b, f);
  const r = await p.evaluate(async () => { await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); mkProg.select(3, 3); await new Promise(r => setTimeout(r, 400));
    const sz = s => [...document.querySelectorAll(s)].filter(e => e.offsetWidth).map(e => { const q = e.getBoundingClientRect(); return Math.round(q.width) + '×' + Math.round(q.height); });
    const o = {pa: sz('#synthSheet .sh-head .preset .pa'), sv: sz('#synthSheet .sh-head .hb.sv')};
    openBrowser(0); await new Promise(r => setTimeout(r, 300)); o.bank = sz('#sndSheet .brbank'); o.more = sz('#sndSheet .brow .bmore').slice(0, 1); closeBrowser(false); return o; });
  console.log(f.padEnd(3), JSON.stringify(r));
  await ctx.close();
}
await b.close();
