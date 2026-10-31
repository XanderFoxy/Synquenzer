// VV1-fix probe: what in the end of the offline render costs main-thread time (completion, getChannelData, tail scan, fade/fill)
import { chromium } from 'playwright';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage();
await p.goto('file:///home/user/Synquenzer/bau/helfer/VIDSTAGE/tests/out/n5-v-blank.html');
const r = await p.evaluate(async () => {
  const out = [];
  for (let rep = 0; rep < 3; rep++) {
    const sr = 44100, len = Math.ceil(192 * sr), oc = new OfflineAudioContext(2, len, sr);
    const o = oc.createOscillator(); o.connect(oc.destination); o.start();
    const lt = []; const po = new PerformanceObserver(l => { for (const e of l.getEntries()) lt.push(Math.round(e.duration)); }); po.observe({entryTypes: ['longtask']});
    const buf = await oc.startRendering(); const T = performance.now();
    const L = buf.getChannelData(0), R = buf.getChannelData(1); const T1 = performance.now();
    let pk = 0; const sEnd = len - Math.round(10.4 * sr); for (let k = len - 512; k >= sEnd; k -= 512) { for (let j = k; j < k + 512; j++) { const v = Math.max(Math.abs(L[j]), Math.abs(R[j])); if (v > pk) pk = v; } } const T2 = performance.now();
    L.subarray(0, len).fill(0, len - 44100); R.fill(0, len - 44100); const T3 = performance.now();
    await new Promise(r => setTimeout(r, 300)); po.disconnect();
    out.push({gcd: Math.round(T1 - T), scan: Math.round(T2 - T1), fill: Math.round(T3 - T2), lt});
  }
  return out;
});
console.log(JSON.stringify(r)); await b.close();
