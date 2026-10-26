import {launch, open} from './v3-qa8-lib.mjs';
const b = await launch(); const {page: p, errs} = await open(b, 'P1');
const r = await p.evaluate(async () => { const w = ms => new Promise(r => setTimeout(r, ms)); await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0);
  mkProg.select(4, 7); SYNQUENZER.mkSet(0, 't.0.f.cut', 33); const a = await mkProg.write(4, 7, 'Del D07');
  const o = {};
  let d; try { d = await SYNQUENZER.deleteSound(a.id); } catch (e) { d = 'ERR ' + e; } await w(200);
  o.afterDel = {prog: MKF.progRec(4, 7).id, cur: mkProg.current(), del: typeof d === 'object' ? !!d : d};
  // while deleted another WRITE takes the place
  SYNQUENZER.mkSet(0, 't.0.f.cut', 70); const b2 = await mkProg.write(4, 7, 'Neu D07'); await w(100);
  let rs; try { rs = await SYNQUENZER.restoreSound(d && d.id ? d : a); } catch (e) { rs = 'ERR ' + e; } await w(200);
  const back = SYNQUENZER.library().find(x => x.name === 'Del D07');
  o.afterRestore = {rs: String(rs), back: back && {bank: back.bank, slot: back.slot}, place: MKF.ownAt(4, 7) && MKF.ownAt(4, 7).name, n: SYNQUENZER.library().filter(x => x.bank === 4 && x.slot === 7).length};
  return o; });
console.log(JSON.stringify(r, null, 1)); console.log(errs);
await b.close();
