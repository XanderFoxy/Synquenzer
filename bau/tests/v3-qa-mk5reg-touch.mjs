// QA MK5 regression via real touch: on-screen keyboard chord on an MS 2000 track (arp off: base vs new), ARP key tap + chord (new)
import { open, APP } from './v3-qa-mk5reg-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk5-base-4.12.0.html';
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-mk5reg/';
for (const [vp, w, h] of [['P1', 390, 844], ['L1', 844, 390]]) for (const [name, file] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open({width: w, height: h}, file, true);
  const cdp = await p.context().newCDPSession(p);
  await p.evaluate(async () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setEngine(0, 'mk'); Q.selectTrack(0); await new Promise(r => setTimeout(r, 600)); Q.openEditor(); await new Promise(r => setTimeout(r, 900)); Q.clearLog(); });
  // chord C E G on the on-screen keyboard (three fingers)
  const pts = await p.evaluate(() => { const r = document.getElementById('kb').getBoundingClientRect(); const ks = [...document.querySelectorAll('#kb .key.w')].slice(0, 5).map(e => e.getBoundingClientRect());
    return [0, 2, 4].map(k => ({x: Math.round(ks[k].left + ks[k].width / 2), y: Math.round(r.top + r.height * .85)})); });
  const chord = async ms => { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: pts.map((q, k) => ({x: q.x, y: q.y, id: k + 1}))}); await p.waitForTimeout(ms); await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); };
  await chord(500); await p.waitForTimeout(400);
  const off = await p.evaluate(() => window.SYNQUENZER.noteLog(100).map(n => n.src + ':' + n.out).sort().join(' '));
  let on = null, tap = null;
  if (name === 'new') {
    // tap the ARP key of the panel (P2/P3 halves: LINKS)
    const has = await p.evaluate(() => { const e = document.querySelector('.mkx[data-k="arp"]'); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, top: document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) === e || e.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2))}; });
    tap = has;
    if (has) { await p.touchscreen.tap(has.x, has.y); await p.waitForTimeout(300); }
    const st = await p.evaluate(() => ({arp: window.SYNQUENZER.mkGet(0).arp.on, led: document.querySelector('.mkx[data-k="arp"]').classList.contains('on'), lcd: (document.querySelector('.lcd') || {}).textContent}));
    await p.evaluate(() => window.SYNQUENZER.clearLog()); await chord(900); await p.waitForTimeout(500);
    const L = await p.evaluate(() => window.SYNQUENZER.noteLog(200));
    on = {st, srcs: [...new Set(L.map(n => n.src))], arpNotes: L.filter(n => n.src === 'arp').map(n => n.out).join(','), voices: await p.evaluate(async () => { await new Promise(r => setTimeout(r, 1500)); return window.SYNQUENZER.voices().length; })};
    await p.screenshot({path: OUT + 'touch-' + vp + '-arpon.png'});
  }
  console.log(vp, name, 'arpOff:', off, on ? '\n   tap ' + JSON.stringify(tap) + '\n   on ' + JSON.stringify(on) : '', 'errs', JSON.stringify(errs));
  await b.close();
}
