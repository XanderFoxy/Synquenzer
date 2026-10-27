// QA VS5b: embedded stretch core == vs-dsp/stretch.mjs (same output on the same input)
import {launch, open5, sleep, clickTone} from './gs7-v3-vs5b-h.mjs';
import * as X from '../vs-dsp/stretch.mjs';
const br = await launch(null); const H = await open5(br), p = H.p;
const x = clickTone([0.5, 0.77, 1.02, 1.21, 1.55, 1.74], 2.2, {f0: 220});
const src = [0, 0.496, 0.766, 1.016, 1.206, 1.546, 1.736, 2.2], dst = [0, 0.496, 0.746, 0.996, 1.246, 1.496, 1.746, 2.21];
const o = {lock: 0.024};
const a = X.stretch(x, 48000, {src, dst}, o).y;
const b = (await p.evaluate(([x, src, dst, o]) => SYNQUENZER.wpStretchCore(x, 48000, src, dst, o), [Array.from(x), src, dst, o])).y;
let md = 0; for (let i = 0; i < Math.max(a.length, b.length); i++) md = Math.max(md, Math.abs((a[i] || 0) - (b[i] || 0)));
console.log('node len', a.length, 'app len', b.length, 'max diff', md, X.VERSION);
await br.close();
