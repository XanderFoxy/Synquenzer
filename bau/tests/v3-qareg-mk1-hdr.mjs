import { open, APP, BASE, OUT } from './v3-qareg-mk1-pw.mjs';
const VPS = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180], L0: [926, 428]};
const which = (process.argv[2] || 'L1').split(',');
for (const v of which) for (const [n, f] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open({width: VPS[v][0], height: VPS[v][1]}, f, true); await p.evaluate(e => { window.__ENG = e; }, process.argv[3] || '');
  await p.evaluate(async () => { const Q = window.SYNQUENZER; Q.selectTrack ? Q.selectTrack(0) : Q.selectSlot(0, 0); Q.openEditor(); await new Promise(r => setTimeout(r, 500)); if (window.__ENG) { Q.setEngine(0, window.__ENG); await new Promise(r => setTimeout(r, 500)); } });
  const r = await p.evaluate(() => {
    const sh = document.getElementById('synthSheet');
    const out = [];
    const rows = sh.querySelectorAll('button, .chip, input, [class*=name]');
    for (const e of rows) { const bb = e.getBoundingClientRect(); if (!bb.width || bb.top > 130) continue; out.push([e.tagName + (e.id ? '#' + e.id : '') + '.' + String(e.className).split(' ').slice(0, 2).join('.'), (e.innerText || '').replace(/\s+/g, ' ').slice(0, 20), Math.round(bb.left), Math.round(bb.top), Math.round(bb.width), Math.round(bb.height), e.scrollWidth > e.clientWidth + 1 ? 'OVF' + e.scrollWidth + '/' + e.clientWidth : '']); }
    return out; });
  console.log('==', v, n); for (const x of r) console.log('  ', x.join(' | '));
  await b.close();
}
