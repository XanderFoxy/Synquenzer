// offline: run the core on the captured sat6 data, measure SDR vs the known voice + residual echo by band
import fs from 'fs';
import {measure, DIR} from './v3-qa-vs4-h.mjs';
const core = await import(process.env.CORE || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-dsp/clean.mjs');
const rd = f => { const b = fs.readFileSync(f); return new Float32Array(b.buffer, b.byteOffset, b.length / 4); };
const M = process.argv[2] || 'sat6', mic = rd(DIR + `/cap-${M}-0-mic.f32`), ref = rd(DIR + `/cap-${M}-0-ref.f32`), y = rd(DIR + '/cap-voice.f32'), sr = 44100;
let em = 0, er = 0; for (let i = 0; i < mic.length; i++) { em += mic[i] ** 2; er += ref[i] ** 2; }
console.log('mic', (10 * Math.log10(em / mic.length)).toFixed(1), 'ref', (10 * Math.log10(er / ref.length)).toFixed(1));
for (const o of JSON.parse(process.argv[3] || '[{"way":"notes"}]')) {
  const info = {}, t0 = Date.now(), out = core.clean(mic, ref, sr, Object.assign({info}, o));
  const m = measure(mic, out, y, sr);
  console.log(JSON.stringify(o), 'ms', Date.now() - t0, JSON.stringify(m), JSON.stringify(info));
}
