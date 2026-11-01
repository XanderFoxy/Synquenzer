import {launch, open, sleep, VP, APP} from './lib.mjs';
const br = await launch(); const out = process.argv[2]; const only = (process.argv[3] || 'XW,P1').split(',');
for (const nm of only) { const [w, h] = VP[nm]; const p = await open(br, w, h, APP);
  await p.evaluate(async () => { SYNQUENZER.newProject(); SYNQUENZER.setEngine(0, 'bm'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(1200);
  await p.screenshot({path: out + '/bm-' + nm + '.png'});
  console.log(nm, JSON.stringify(await p.evaluate(() => { const i = SYNQUENZER.bmPanel(); return i && {W: i.W, H: i.H, disp: i.disp, mode: i.mode, ov: i.ov}; })), p.errs.slice(0, 5));
  await p.context().close(); }
await br.close();
