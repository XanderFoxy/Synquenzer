import {open, micOn, g10demo, closeAll, sleep, log, ovlStart, ovlStop, waitBeat} from './h-lib.mjs';
const H = await open(process.argv[2]); const p = H.p;
console.log(await g10demo(p));
await micOn(p);
await p.evaluate(() => SYNQUENZER.g10OutRms());
await ovlStart(p);
await p.evaluate(() => { SYNQUENZER.selectSlot(SYNQUENZER.tkInfo().stimme, 0); SYNQUENZER.rec(); });
await waitBeat(p, 16.3);
await p.evaluate(() => SYNQUENZER.rec());
await sleep(3000);
const L = await log(p), ov = await ovlStop(p);
const st = await p.evaluate(() => ({takes: Object.keys(SYNQUENZER.takes()).length, clip: SYNQUENZER.getClip(SYNQUENZER.tkInfo().stimme, 0), rms: SYNQUENZER.g10OutRms(0, 16), slot: R.slot.slice(), toasts: window.__toasts}));
const per = {}; for (const e of L) { if (e.src === 'click') continue; const k = e.track + ':' + Math.floor(e.beat / 4); per[k] = (per[k] || 0) + 1; }
console.log(JSON.stringify(per)); console.log('clicks', L.filter(e => e.src === 'click').map(e => e.beat.toFixed(2) + (e.out ? '!' : '')).join(' '));
console.log(JSON.stringify(st).slice(0, 800));
console.log(JSON.stringify(ov.filter(x => x.show).slice(0, 3)), H.errs);
await closeAll();
