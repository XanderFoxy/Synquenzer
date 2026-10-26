// the probe cases "kern" and "panel" a few times (frames_ok flakiness in the test browser)
import {launch, open} from './v3-mkp-lib.mjs';
const b = await launch(); const page = await open(b, process.argv[2], process.argv[3] || 'X');
for (let k = 0; k < +(process.argv[4] || 3); k++) for (const c of ['kern', 'panel']) {
  const r = await page.evaluate(async c => { const r = await SYNQUENZER.perfProbe([c]); const x = r.cases[0]; return [x.fall, x.frames_ok, x.quantum_max_ms, x.longtasks, x.fps_med, x.load_med]; }, c);
  console.log(JSON.stringify(r)); }
await b.close();
