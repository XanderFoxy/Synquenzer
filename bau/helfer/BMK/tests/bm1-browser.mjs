// BM1 in Chromium (real AudioWorklet): the app boots without errors, the block sq-bm-src evaluates, two offline renders after
// reset are bit-exact (48 / 44.1 kHz), and the processor's load in the live AudioContext: idle, 1 and 12 Bit Mask voices
// against one VA voice of 'dirigent-analog' (the same page, same context). Run: node bau/helfer/BMK/tests/bm1-browser.mjs
import {createRequire} from 'module';
const {chromium} = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const HERE = new URL('.', import.meta.url).pathname, APP = HERE + '../index.html';
let fails = 0; const res = [];
const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + ' — ' + info); res.push({id, ok: !!c, info}); };
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await b.newContext({viewport: {width: 390, height: 844}}); const p = await ctx.newPage(); const errs = [];
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + APP); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.storage().booted, null, {timeout: 30000});
const r = await p.evaluate(async () => {
  const el = document.getElementById('sq-bm-src'), sc = document.createElement('script'); sc.textContent = el.textContent; document.head.appendChild(sc);
  const out = {};
  for (const sr of [48000, 44100]) {
    const msgs = [[0, {t: 'reset'}], [0, {t: 'prog', ab: 'a', p: {o1: {m: 78, e: {l: 99, a: 3, d: 8, s: 10, r: 6}}, o2: {m: 255, st: 7, ds: -40, dv: 15, e: {l: 70, a: 0, d: 9, s: 0, r: 4, lp: 1}}, n: {fr: 60, e: {l: 40, a: 2, d: 6, s: 4, r: 5}}}}]];
    for (let k = 0; k < 12; k++) msgs.push([0, {t: 'on', list: [{n: 48 + 3 * k, v: .5 + .04 * k, at: .01 + k * .0731, d: 0, id: k + 1}]}], [0, {t: 'off', list: [{n: 0, at: .3 + k * .05, id: k + 1}]}]);
    msgs.push([.4, {t: 'set', ab: 'a', k: 'o1.m', v: 300}]);
    const a = await bmkRender(msgs, {sr, sec: 1.2}), b = await bmkRender(msgs, {sr, sec: 1.2});
    let d = 0, e = 0; for (let i = 0; i < a.l.length; i++) { d = Math.max(d, Math.abs(a.l[i] - b.l[i]), Math.abs(a.r[i] - b.r[i])); e += a.l[i] * a.l[i]; }
    out['bit' + sr] = {d, rms: Math.sqrt(e / a.l.length)};
  }
  // live load: idle, 1 voice, 12 voices (Bit Mask); one VA voice ('dirigent-analog') in the same context
  ensureAudio(); const c = AU.ctx; const w0 = performance.now(); while (!wkReady() && performance.now() - w0 < 8000) await new Promise(r => setTimeout(r, 100));
  try { await c.resume(); } catch (e) {}
  out.idle = await bmkProbe({voices: 0, sec: 6}); out.bm1 = await bmkProbe({voices: 1, sec: 6}); out.bm12 = await bmkProbe({voices: 12, sec: 6});
  const va = async nv => {
    const sink = c.createGain(); sink.gain.value = 0; sink.connect(c.destination);
    const node = new AudioWorkletNode(c, 'dirigent-analog', {numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2], channelCount: 2, channelCountMode: 'explicit', channelInterpretation: 'discrete',
      processorOptions: {patch: {eng: 0, o1w: 0, o2w: 1, o3w: 0, o1lvl: 1, o2lvl: .8, o3lvl: .6, cutoff: 900, res: .6, poly: 8}, mods: []}});
    node.connect(sink); const rep = []; node.port.onmessage = ev => { if (ev.data && ev.data.load != null) rep.push(ev.data.load); };
    const t0 = c.currentTime + .05; node.port.postMessage({ev: [36, 43, 48, 52].slice(0, nv).map((n, k) => [t0, 1, k + 1, n, .8, -1])});
    await new Promise(r => setTimeout(r, 6300)); node.port.postMessage({ev: [[0, 6]]}); node.disconnect(); sink.disconnect();
    const v = rep.slice(1).sort((a, b) => a - b); return v[v.length >> 1];
  };
  out.va0 = await va(0); out.va1 = await va(1);
  return out;
});
for (const sr of [48000, 44100]) ok('BM1-12 Chromium: zwei Offline-Render nach reset bitgleich (' + sr / 1000 + ' kHz)', r['bit' + sr].d === 0 && r['bit' + sr].rms > 1e-3, 'Differenz ' + r['bit' + sr].d + ', Pegel ' + (20 * Math.log10(r['bit' + sr].rms)).toFixed(1) + ' dBFS');
const bv = r.bm1.load_med - r.idle.load_med, vv = r.va1 - r.va0;
ok('BM1-13 Chromium (echter AudioWorklet, nur Messwert): Bit-Mask-Stimme gegen VA-Stimme', true,
  (bv / Math.max(vv, 1e-9)).toFixed(2) + ' × (Bit Mask 1 Stimme ' + (bv * 100).toFixed(2) + ' %, 12 Stimmen ' + ((r.bm12.load_med - r.idle.load_med) * 100).toFixed(2) + ' % (max ' + (r.bm12.load_max * 100).toFixed(2) + ' %, Quantum max ' + r.bm12.quantum_max_ms + ' ms), Leerlauf ' + (r.idle.load_med * 100).toFixed(3) + ' %; VA-Stimme ' + (vv * 100).toFixed(2) + ' %)');
ok('BM1 Chromium: App startet ohne Konsolenfehler, Block sq-bm-src läuft', errs.length === 0, errs.length ? errs.slice(0, 3).join(' | ') : 'keine Fehler');
fs.writeFileSync(HERE + 'bm1-browser.out.json', JSON.stringify({res, raw: r}, null, 1));
await b.close(); process.exit(fails ? 1 : 0);
