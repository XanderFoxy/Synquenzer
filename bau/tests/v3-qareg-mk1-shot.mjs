import { open, APP, BASE, OUT } from './v3-qareg-mk1-pw.mjs';
const VPS = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180]};
const which = (process.argv[2] || 'P1,L1').split(',');
for (const v of which) for (const [n, f] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open({width: VPS[v][0], height: VPS[v][1]}, f, true);
  await p.screenshot({path: OUT + `shot-${v}-${n}-main.png`});
  await p.evaluate(async () => { const Q = window.SYNQUENZER; Q.selectTrack ? Q.selectTrack(0) : Q.selectSlot(0, 0); Q.openEditor(); await new Promise(r => setTimeout(r, 500)); });
  await p.screenshot({path: OUT + `shot-${v}-${n}-va.png`});
  await p.evaluate(async () => { const Q = window.SYNQUENZER; Q.setEngine(0, 'fm'); await new Promise(r => setTimeout(r, 500)); });
  await p.screenshot({path: OUT + `shot-${v}-${n}-fm.png`});
  await p.evaluate(async () => { const Q = window.SYNQUENZER; Q.setEngine(0, 'wt'); await new Promise(r => setTimeout(r, 500)); });
  await p.screenshot({path: OUT + `shot-${v}-${n}-wt.png`});
  console.log(v, n, errs);
  await b.close();
}
