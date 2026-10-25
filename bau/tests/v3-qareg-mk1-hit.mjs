import { open, APP, BASE, OUT } from './v3-qareg-mk1-pw.mjs';
const SA = '#app{padding-left:47px!important;padding-right:47px!important}';
const VPS = {'L0SA': [926, 428, SA], 'L1SA': [844, 390, SA], P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180], L0: [926, 428]};
const which = (process.argv[2] || 'L1,L2').split(',');
for (const v of which) for (const eng of ['analog', 'fm', 'wt']) for (const [n, f] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open({width: VPS[v][0], height: VPS[v][1]}, f, true); if (VPS[v][2]) await p.addStyleTag({content: VPS[v][2]});
  const r = await p.evaluate(async (eng) => { const Q = window.SYNQUENZER; Q.selectTrack(0); Q.openEditor(); await new Promise(r => setTimeout(r, 400)); if (eng !== 'analog') { Q.setEngine(0, eng); await new Promise(r => setTimeout(r, 500)); }
    const sh = document.getElementById('synthSheet');
    const pv = sh.querySelector('button.pv'); const pa = [...sh.querySelectorAll('button.pa')].filter(e => e.getBoundingClientRect().width);
    const bb = pv.getBoundingClientRect(); const y = bb.top + bb.height / 2;
    // scan hit-test along the row: runs of the same element
    const runs = []; let last = null, start = 0;
    for (let x = 0; x < innerWidth; x++) { const e = document.elementFromPoint(x, y); const k = e ? (e.closest('button') || e) : null; const lab = k ? (k.className + ':' + (k.innerText || '').trim().slice(0, 10)) : 'none'; if (lab !== last) { if (last) runs.push([last, start, x - 1]); last = lab; start = x; } }
    runs.push([last, start, innerWidth - 1]);
    const vh = []; for (const a of pa) { const r = a.getBoundingClientRect(); let top = 9999, bot = -1; for (let yy = 0; yy < 200; yy++) { const e = document.elementFromPoint(r.left + r.width / 2, yy); if (e && (e === a || a.contains(e))) { top = Math.min(top, yy); bot = Math.max(bot, yy); } } vh.push([Math.round(r.width), bot - top + 1]); }
    const ht = [...sh.querySelectorAll('button')].filter(x => /Hören/.test(x.innerText) || x.querySelector('.ht')).map(x => { const s = x.querySelector('.ht'); return s ? getComputedStyle(s).display : 'n'; }); const nm = sh.querySelector('.pv .pn'); return {nameText: nm && Math.round(nm.getBoundingClientRect().width), ht, runs: runs.filter(r => /pa|pv/.test(r[0])).map(r => r[0].split(':')[1] + ' x' + r[1] + '-' + r[2] + ' (' + (r[2] - r[1] + 1) + 'px)'), arrowsWH: vh, pvText: pv.innerText, pvSW: pv.scrollWidth, pvCW: pv.clientWidth}; }, eng);
  console.log(v, eng, n, JSON.stringify(r));
  await b.close();
}
