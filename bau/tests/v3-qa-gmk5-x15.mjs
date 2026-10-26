// idle playback 40 s (no taps): main-thread stalls / long tasks / late notes, arps on vs off; editor open (panel LEDs) or closed
import {open, sleep} from './v3-qa-gmk5-tl.mjs';
import {setupProject} from './v3-qa-gmk5-setup.mjs';
const ARP = process.argv[2] !== 'off', ED = process.argv[3] === 'ed';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
await setupProject(E);
if (!ARP) await E(() => { SYNQUENZER.mkSet(2, 'arp.on', 0); SYNQUENZER.mkSet(3, 'arp.on', 0); });
await E(() => SYNQUENZER.launchScene(3));
if (ED) { await T.openEd(2); await T.w2(/^\d+ ARP A/); }
await E(() => SYNQUENZER.play()); await sleep(2000);
await E(() => { const Q = window.__s = {stall: [], lt: [], late: [], gc: 0}; let last = performance.now(); Q.hb = setInterval(() => { const t = performance.now(); if (t - last > 40) Q.stall.push(Math.round(t - last)); last = t; }, 10);
  try { new PerformanceObserver(l => { for (const e of l.getEntries()) Q.lt.push(Math.round(e.duration)); }).observe({entryTypes: ['longtask']}); } catch (e) {}
  const o = window.logNote; window.logNote = function (e) { const r = o.apply(this, arguments); try { if (e && e.time != null) { const d = e.time - AU.ctx.currentTime; if (d < 0.003) Q.late.push([e.track, +(d * 1000).toFixed(1), e.src]); } } catch (_) {} return r; }; });
await sleep(+(process.env.SECS || 40) * 1000);
const r = await E(() => { clearInterval(window.__s.hb); return Object.assign({}, window.__s, {voices: VOICES.length, mem: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1e6) : null}); });
await E(() => SYNQUENZER.stop());
console.log((ARP ? 'ARP ON ' : 'ARP OFF') + (ED ? ' editor' : ' no editor'), 'stalls>40', r.stall.length, JSON.stringify(r.stall), 'lt', JSON.stringify(r.lt), 'late', r.late.length, JSON.stringify(r.late.slice(0, 6)), 'VOICES', r.voices, 'heapMB', r.mem, 'errs', errs.length);
await T.br.close();
