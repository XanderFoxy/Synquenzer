// MK8 (Umfang 3): the hold spectra of the vocoder programs from OWN synthetic vowels (vowel source W-44 of MK7 as the
// modulator), captured by the app worklet's own analysis (E.mkHoldGet) in an OfflineAudioContext. Writes hold into v3-mk8-cal.json.
import { chromium } from 'playwright';
import fs from 'fs';
import {CAL_FILE} from './v3-mk8-bau.mjs';
const FILE = process.argv[2];
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'});
const page = await browser.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
const H = await page.evaluate(async () => {
  mkLoad();
  async function holdOf(v) {
    const sr = 48000, sec = 1.6, n = Math.round(sr * sec), oc = new OfflineAudioContext(2, n, sr);
    await oc.audioWorklet.addModule('data:application/javascript;base64,' + btoa(document.getElementById('sq-worklet-src').textContent));
    const pm = SQMK.init(); pm.mode = 3;
    const snd = SQStore.normalizeSound({engine: 'mk', name: 'x', p: {mk: pm}});
    const E = SynthHost.track(oc, oc.destination, wkFlat(snd), wkMods(snd), null, snd.p.mk);
    const x0 = MKUI.mkVowel({f0: 110, v: v, sec, sr, vib: 15}), x = new Float32Array(x0.length);
    // pre-emphasis three times (+18 dB/oct above ~400 Hz): the vowel source falls ~20 dB/oct above F1, a voice at a microphone far less as a voice in front of a microphone would bring; then -10 dBFS RMS
    const z = [0, 0, 0]; let e = 0; for (let i = 0; i < x0.length; i++) { let y = x0[i]; for (let k = 0; k < 3; k++) { const t = y - .95 * z[k]; z[k] = y; y = t; } x[i] = y; e += y * y; }
    const g = Math.pow(10, -10 / 20) / Math.sqrt(e / x.length); for (let i = 0; i < x.length; i++) x[i] *= g;
    const b = oc.createBuffer(2, n, sr); b.getChannelData(1).set(x.subarray(0, n)); const src = oc.createBufferSource(); src.buffer = b; src.connect(E.node); src.start(0);
    E.tempo(120, null); E.on(1, 48, .8, 0); E.flush();
    let res = null;
    oc.suspend(1.4).then(async () => { res = await Promise.race([E.mkHoldGet(), new Promise(r => setTimeout(() => r('timeout'), 2000))]); oc.resume(); });
    await new Promise(r => setTimeout(r, 20));
    await oc.startRendering(); return res;
  }
  const out = {}; for (const v of ['a', 'e', 'i', 'o', 'u']) out[v] = await holdOf(v); return out;
});
console.log(JSON.stringify(H), errs);
const cal = fs.existsSync(CAL_FILE) ? JSON.parse(fs.readFileSync(CAL_FILE, 'utf8')) : {};
cal._hold = H;
fs.writeFileSync(CAL_FILE, JSON.stringify(cal, null, 1));
await browser.close();
