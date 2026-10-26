import {launch, open} from './v3-mkp-lib.mjs';
const b = await launch();
const p0 = await open(b, 'v3-mkp-vorg.html', 'P1', {noMk: true});
const txt = await p0.evaluate(() => { const Q = SYNQUENZER; Q.newProject({init: true}); Q.setEngine(0, 'mk'); Q.setEngine(1, 'mk'); Q.mkSet(1, 't.0.f.cut', 33); return serializeProject(); });
await p0.ctx.close();
for (const f of ['v3-mkp-vorg.html', '../mk-br-MKP/index.html']) for (const ed of [false, true]) {
  const p = await open(b, f, 'L1', {noMk: true}); if (ed) { await p.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await p.waitForTimeout(800); }
  const r = await p.evaluate(async t => { const before = R.selT; await SYNQUENZER.importJSON(t); await new Promise(r => setTimeout(r, 300)); return [before, JSON.parse(serializeProject()).ui.selT, JSON.parse(t).ui.selT]; }, txt);
  console.log(f, 'editor', ed, r); await p.ctx.close(); }
await b.close();
