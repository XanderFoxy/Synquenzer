// VV2-04 Zusatz: Matrix-Bild mit einem spielenden Clip → die Kamera zoomt (1–3×) weich auf ihn, nie außerhalb
import { open } from './n5-v-lib.mjs';
const {b, p, errs} = await open();
const r = await p.evaluate(async () => {
  SYNQUENZER.setSong({bars: 6, lanes: [[], [], [], [], [{bar: 0, slot: 0}, {bar: 3, slot: 1}], []], carrier: [], mel: {}, marks: []});
  await SYNQUENZER.vvRender({});
  const T = SYNQUENZER.vvCamTrace('matrix'), L = T.log; let worst = 0, out = 0;
  for (let k = 1; k < L.length; k++) { const a = L[k - 1], e = L[k], kk = 1080 / e.ww; const j = Math.max(Math.abs((e.cx - e.ww / 2) - (a.cx - a.ww / 2)), Math.abs((e.cx + e.ww / 2) - (a.cx + a.ww / 2)), Math.abs((e.cy - e.wh / 2) - (a.cy - a.wh / 2)), Math.abs((e.cy + e.wh / 2) - (a.cy + a.wh / 2))) * kk / 10.8; worst = Math.max(worst, j); }
  for (const e of L) if (e.cx - e.ww / 2 < -1e-6 || e.cx + e.ww / 2 > 640 + 1e-6 || e.cy - e.wh / 2 < -1e-6 || e.cy + e.wh / 2 > 360 + 1e-6) out++;
  const zs = L.map(e => e.z); return {n: L.length, zoom: [Math.min(...zs).toFixed(2), Math.max(...zs).toFixed(2)], zBar4: L[Math.round(3 * 4 * 60 / S.bpm * 30) + 30].z.toFixed(2), worstProzent: +worst.toFixed(2), ausserhalb: out};
});
console.log(JSON.stringify(r), errs); await b.close();
