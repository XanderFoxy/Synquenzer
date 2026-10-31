import { open } from './n5-v-lib.mjs';
const {b, p} = await open();
console.log(await p.evaluate(async () => { const oc = new OfflineAudioContext(2, 44100 * 80, 44100), o = oc.createOscillator(); o.connect(oc.destination); o.start(); const t0 = performance.now(); const buf = await oc.startRendering(); const t1 = performance.now(); const a = buf.getChannelData(0); const t2 = performance.now(); const c = buf.getChannelData(1); const t3 = performance.now(); let pk = 0; for (let k = a.length - 441000; k < a.length; k++) { const v = Math.max(Math.abs(a[k]), Math.abs(c[k])); if (v > pk) pk = v; } const t4 = performance.now(); return {render: t1 - t0, gcd0: t2 - t1, gcd1: t3 - t2, scan: t4 - t3}; }));
await b.close();
