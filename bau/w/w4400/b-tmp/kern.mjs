import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const f = process.argv[2];
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 428, height: 926}, hasTouch: true});
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + f); await p.waitForTimeout(1500);
const r = await p.evaluate(async () => {
  const Q = window.SYNQUENZER, out = {};
  const T = async ms => new Promise(r => setTimeout(r, ms));
  try { Q.selectTrack(Q.DRUM_T != null ? Q.DRUM_T : 5); } catch (e) {}
  try { out.inst0 = Q.ndiInstrument(); } catch (e) { out.inst0 = 'ERR ' + e.message; }
  try { Q.openEditor && Q.openEditor(); } catch (e) {}
  await T(400);
  out.headKey0 = !!document.querySelector('#drumSheet .ndpk');
  try { out.set = Q.ndiInstrument('md'); out.inst1 = Q.ndiInstrument(); } catch (e) { out.set = 'ERR ' + e.message; }
  await T(500);
  out.headKey1 = !!document.querySelector('#drumSheet .ndpk');
  const hk = document.querySelector('#drumSheet .ndpk'); if (hk) { const r = hk.getBoundingClientRect(); out.hkBox = [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; }
  try { out.open = Q.ndpOpen(); await T(600); const i = Q.ndpInfo(); out.ndp = {open: i.open, view: i.view, sec: i.sec, scrollW: i.scrollW, clientW: i.clientW}; } catch (e) { out.open = 'ERR ' + e.message; }
  try { out.close = Q.ndpClose(); } catch (e) { out.close = 'ERR ' + e.message; }
  await T(400);
  out.sheetOpen = document.getElementById('drumSheet').classList.contains('open');
  const hk2 = document.querySelector('#drumSheet .ndpk'); out.headKey2 = !!hk2; if (hk2) { const r = hk2.getBoundingClientRect(); out.hkBox = [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; out.hkTxt = hk2.textContent; }
  const sg = document.querySelector('#drumSheet .ndiinst'); if (sg) { const r = sg.getBoundingClientRect(); out.segBox = [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; }
  const r1 = document.querySelector('#drumSheet .ndpk') && document.querySelector('#drumSheet .ndpk').parentElement; if (r1) out.r1 = [r1.scrollWidth, r1.clientWidth];
  try { out.lkt = Q.lkt().n; out.need0 = Q.needOf(); } catch (e) { out.lkt = 'ERR ' + e.message; }
  try { const s = Q.serialize(); const o = typeof s === 'string' ? JSON.parse(s) : s; out.serNeed = o.need || null; } catch (e) { out.ser = 'ERR ' + e.message; }
  return out;
});
console.log(JSON.stringify(r));
await p.screenshot({path: 'kern.png'});
console.log('errors', JSON.stringify(errs));
await b.close();
