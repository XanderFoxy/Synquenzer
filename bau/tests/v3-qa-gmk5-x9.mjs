// main-thread stalls at scene switches by touch: arps on vs off (same project), and the tick cost around the switch
import {open, sleep, check, done} from './v3-qa-gmk5-tl.mjs';
import {setupProject} from './v3-qa-gmk5-setup.mjs';
const ARP = process.argv[2] !== 'off';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
await setupProject(E);
if (!ARP) await E(() => { SYNQUENZER.mkSet(2, 'arp.on', 0); SYNQUENZER.mkSet(3, 'arp.on', 0); });
await E(() => SYNQUENZER.setBpm(96));
await T.tapTxt('button.scn', /^▶\s*1/); await sleep(100);
if (!(await E(() => SYNQUENZER.runtime().playing))) await T.tapSel('#bPlay');
await sleep(2500);
await E(() => { const Q = window.__s = {stall: [], lt: [], late: [], ticks: []}; let last = performance.now(); Q.hb = setInterval(() => { const t = performance.now(); if (t - last > 40) Q.stall.push([Math.round(t - last), Math.round(last)]); last = t; }, 10);
  try { new PerformanceObserver(l => { for (const e of l.getEntries()) Q.lt.push([Math.round(e.duration), Math.round(e.startTime)]); }).observe({entryTypes: ['longtask']}); } catch (e) {}
  const o = window.logNote; window.logNote = function (e) { const r = o.apply(this, arguments); try { if (e && e.time != null) { const d = e.time - AU.ctx.currentTime; if (d < 0.003) Q.late.push([e.track, +(d * 1000).toFixed(1), e.src]); } } catch (_) {} return r; };
  const ot = window.tick; if (ot) window.tick = function () { const a = performance.now(); const r = ot.apply(this, arguments); const d = performance.now() - a; if (d > 8) Q.ticks.push([+d.toFixed(1), Math.round(a)]); return r; };
});
const marks = [];
for (const s of [2, 3, 4, 1, 2, 3, 4, 1]) { marks.push([s, await E(() => Math.round(performance.now()))]); await T.tapTxt('button.scn', new RegExp('^▶\\s*' + s)); await sleep(5200); }
const r = await E(() => { clearInterval(window.__s.hb); return window.__s; });
await E(() => SYNQUENZER.stop());
const rel = st => { const m = marks.filter(m => m[1] <= st + 5).pop(); return m ? 'scene ' + m[0] + ' +' + (st - m[1]) + 'ms' : '?'; };
console.log(ARP ? 'ARP ON' : 'ARP OFF');
console.log('stalls >40ms', r.stall.length, JSON.stringify(r.stall.map(([d, st]) => d + ' @' + rel(st))));
console.log('longtasks', JSON.stringify(r.lt.map(([d, st]) => d + ' @' + rel(st))));
console.log('slow ticks >8ms', r.ticks.length, JSON.stringify(r.ticks.slice(0, 20).map(([d, st]) => d + ' @' + rel(st))));
console.log('late notes', r.late.length, JSON.stringify(r.late.slice(0, 10)));
console.log('errs', JSON.stringify(errs));
await T.br.close();
