// G-MK8b-merge (5d): the 16 vocoder programs of the collection „Micro“ calibrated against a NATURAL voice spectrum instead of the
// bright dummy (pre-emphasis x3): input = the own vowel source (a e i o u, 110 Hz, vibrato) WITHOUT pre-emphasis and the formant
// WAV (v3-qa-mk8b-vowelwav.mjs), both -20 dBFS RMS; same phrase (held chords), offline render (mkRender, seed 1), LUFS (MK8M).
// Target: the mean of both = -18 LUFS, so both lie within -18 +- 3; true peak <= -1 dBTP with both. --cal N: N rounds (writes
// v3-mk8b-cal.json and the data block via v3-mk8b-bau.mjs, only f-mk-k8xx change). Usage: node gmk8b-vocal.mjs <index.html> <vowel.wav> [--cal N]
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import {programs, encode, blockText, inject, CAL_FILE} from './v3-mk8b-bau.mjs';
const FILE = path.resolve(process.argv[2]), WAV = process.argv[3], CAL = process.argv.includes('--cal') ? +process.argv[process.argv.indexOf('--cal') + 1] || 1 : 0;
const MESS = fs.readFileSync(new URL('./v3-mk8-mess.js', import.meta.url), 'utf8');
const wav = fs.readFileSync(WAV); const n = (wav.length - 44) / 2, vw = new Array(n); for (let i = 0; i < n; i++) vw[i] = wav.readInt16LE(44 + i * 2) / 32767;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
async function run() {
  const page = await browser.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  await page.evaluate(MESS); await page.evaluate(() => { mkLoad(); return MKK.decodeAll(); });
  const out = await page.evaluate(async vw => {
    const sr = 48000;
    const norm = x => { let e = 0; for (const v of x) e += v * v; const g = Math.pow(10, -20 / 20) / Math.sqrt(e / x.length || 1); const y = new Float32Array(x.length); for (let i = 0; i < x.length; i++) y[i] = x[i] * g; return y; };
    const dummy = (sec, pre) => { const x0 = MKUI.mkVowel({f0: 110, v: ['a', 'e', 'i', 'o', 'u'], seg: .5, sec, sr, vib: 15}), x = new Float32Array(x0.length), z = [0, 0, 0];
      for (let i = 0; i < x0.length; i++) { let y = x0[i]; for (let k = 0; k < pre; k++) { const t = y - .95 * z[k]; z[k] = y; y = t; } x[i] = y; } return norm(x); };
    const wavIn = sec => { const n = Math.round(sec * sr), x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = vw[i % vw.length]; return norm(x); };
    const o = [];
    for (let s = 1; s <= 16; s++) {
      const rec = MKK.rec(8, s), snd = factorySound(rec.id), ph = MK8M.phrase('voc'), r0 = {id: rec.id, name: rec.name};
      for (const [k, mic] of [['pre0', dummy(ph.sec, 0)], ['wav', wavIn(ph.sec)], ['pre3', dummy(ph.sec, 3)]]) {
        const r = await SYNQUENZER.mkRender(snd, MK8M.arpEv(snd.p.mk, ph.ev), {sec: ph.sec, seed: 1, inputs: {e2: mic}});
        r0[k] = MK8M.lufs(r.l, r.r); r0[k + 'tp'] = Math.max(MK8M.tp(r.l), MK8M.tp(r.r));
      }
      o.push(r0);
    }
    return o;
  }, vw);
  await page.close(); return {out, errs};
}
for (let round = 0; round <= CAL; round++) {
  const {out, errs} = await run();
  if (errs.length) console.log('Konsolenfehler', errs.slice(0, 3));
  if (round === CAL) {
    let bad = 0;
    console.log('name          vowel(nat) formant-WAV  mean   TP max   (dummy×3 for reference)');
    for (const o of out) { const m = (o.pre0 + o.wav) / 2, tp = Math.max(o.pre0tp, o.wavtp), f = Math.abs(o.pre0 + 18) > 3 || Math.abs(o.wav + 18) > 3 || tp > -1; if (f) bad++;
      console.log((f ? 'FAIL ' : 'ok   ') + o.name.padEnd(13) + o.pre0.toFixed(1).padStart(7) + o.wav.toFixed(1).padStart(12) + m.toFixed(1).padStart(8) + tp.toFixed(1).padStart(8) + ' [' + o.pre0tp.toFixed(1) + ' / ' + o.wavtp.toFixed(1) + ']   (' + o.pre3.toFixed(1) + ' LUFS, TP ' + o.pre3tp.toFixed(1) + ')'); }
    const A = out.map(o => o.pre0), B = out.map(o => o.wav);
    console.log((bad ? 'FAIL' : 'PASS') + ' 16 Vocoder mit natürlichem Stimmspektrum −18 ± 3 LUFS — Vokal ' + Math.min(...A).toFixed(1) + ' … ' + Math.max(...A).toFixed(1) + ', Formant-WAV ' + Math.min(...B).toFixed(1) + ' … ' + Math.max(...B).toFixed(1) + ' LUFS, TP ≤ ' + Math.max(...out.map(o => Math.max(o.pre0tp, o.wavtp))).toFixed(1) + ' dBTP');
    break;
  }
  const cal = JSON.parse(fs.readFileSync(CAL_FILE, 'utf8')), progs = programs(FILE, cal);
  let worst = 0;
  for (const o of out) {
    const P = progs.find(p => p.id === o.id), d = -18 - (o.pre0 + o.wav) / 2; worst = Math.max(worst, Math.abs(d));
    const c = cal[o.id] = cal[o.id] || {}; if (c.g == null) c.g = 40 * Math.log10(P.pm.voc.lvl / 127);
    c.g = Math.min(12, Math.round((Math.min(12, c.g) + d) * 100) / 100);
  }
  fs.writeFileSync(CAL_FILE, JSON.stringify(cal, null, 1));
  inject(FILE, blockText(encode(FILE, programs(FILE, cal))));
  console.log('Runde', round + 1, 'größte Abweichung', worst.toFixed(1), 'dB');
}
await browser.close();
