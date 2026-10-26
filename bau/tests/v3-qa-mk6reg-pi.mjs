import { open } from './v3-qa-mk6reg-pw.mjs';
const {b, p} = await open({width: 390, height: 844});
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.openEditor(); }); await p.waitForTimeout(1500);
const r = await p.evaluate(() => { const M = window.MKUI; Q = window.SYNQUENZER; Q.mkSet(0, 'dly.sync', 1); M.setWahl(2, 5); return [...document.querySelectorAll('.mkk')].map(e => e.outerHTML.slice(0, 200) + ' @' + JSON.stringify(e.getBoundingClientRect())).join('\n'); });
console.log(r);
await b.close();
