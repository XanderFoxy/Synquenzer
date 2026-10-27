// QA MK8b-03 vocoder levels vs. the microphone dummy: the builder's dummy (own vowel source, pre-emphasis x3, -20 dBFS RMS) against
// the same vowel source WITHOUT the triple pre-emphasis (natural spectral tilt of a voice) and a formant-synth vowel (WAV), all at
// -20 dBFS RMS. Same phrase (held chords), same offline render (mkRender, seed 1), same LUFS (MK8M).
import { chromium } from 'playwright';
import fs from 'fs';
const FILE = process.argv[2], WAV = process.argv[3];
const MESS = fs.readFileSync(new URL('./v3-mk8-mess.js', import.meta.url), 'utf8');
const wav = fs.readFileSync(WAV); const n = (wav.length - 44) / 2, vw = new Array(n); for (let i = 0; i < n; i++) vw[i] = wav.readInt16LE(44 + i * 2) / 32767;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const page = await browser.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
await page.evaluate(MESS); await page.evaluate(() => { mkLoad(); return MKK.decodeAll(); });
const res = await page.evaluate(async vw => {
  const sr = 48000;
  const norm = x => { let e = 0; for (const v of x) e += v * v; const g = Math.pow(10, -20 / 20) / Math.sqrt(e / x.length || 1); const y = new Float32Array(x.length); for (let i = 0; i < x.length; i++) y[i] = x[i] * g; return y; };
  const dummy = (sec, pre) => { const x0 = MKUI.mkVowel({f0: 110, v: ['a', 'e', 'i', 'o', 'u'], seg: .5, sec, sr, vib: 15}), x = new Float32Array(x0.length), z = [0, 0, 0];
    for (let i = 0; i < x0.length; i++) { let y = x0[i]; for (let k = 0; k < pre; k++) { const t = y - .95 * z[k]; z[k] = y; y = t; } x[i] = y; } return norm(x); };
  const wavIn = sec => { const n = Math.round(sec * sr), x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = vw[i % vw.length]; return norm(x); };
  const out = [];
  for (let s = 1; s <= 16; s++) {
    const rec = MKK.rec(8, s), snd = factorySound(rec.id), ph = MK8M.phrase('voc'), o = {name: rec.name};
    for (const [k, mic] of [['pre3', dummy(ph.sec, 3)], ['pre0', dummy(ph.sec, 0)], ['wav', wavIn(ph.sec)]]) {
      const r = await SYNQUENZER.mkRender(snd, MK8M.arpEv(snd.p.mk, ph.ev), {sec: ph.sec, seed: 1, inputs: {e2: mic}});
      o[k] = +MK8M.lufs(r.l, r.r).toFixed(1);
    }
    out.push(o);
  }
  // spectral tilt of the dummies: energy above 2 kHz / total
  const tilt = x => { let e = 0, h = 0, y1 = 0; const a = Math.exp(-2 * Math.PI * 2000 / sr); let lp = 0; for (const v of x) { lp = (1 - a) * v + a * lp; const hp = v - lp; e += v * v; h += hp * hp; } return 10 * Math.log10(h / e); };
  return {out, tilt: {pre3: tilt(dummy(2, 3)), pre0: tilt(dummy(2, 0)), wav: tilt(wavIn(2))}};
}, vw);
console.log('share of energy above ~2 kHz (dB):', JSON.stringify(Object.fromEntries(Object.entries(res.tilt).map(([k, v]) => [k, +v.toFixed(1)]))));
console.log('name          dummy×3  vowel(no pre)  formant-WAV   (LUFS, target -18 ± 3)');
for (const o of res.out) console.log(o.name.padEnd(13), String(o.pre3).padStart(7), String(o.pre0).padStart(12), String(o.wav).padStart(12), (Math.abs(o.pre0 + 18) > 3 || Math.abs(o.wav + 18) > 3) ? '  OUT' : '');
for (const k of ['pre3', 'pre0', 'wav']) { const v = res.out.map(o => o[k]); console.log(k, 'range', Math.min(...v), '…', Math.max(...v), 'outside ±3:', v.filter(x => Math.abs(x + 18) > 3).length); }
console.log('errs', errs);
await browser.close();
