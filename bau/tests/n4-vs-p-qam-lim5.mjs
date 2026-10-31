// QA musiker: vpLim offline nachrechnen – Gain-Verlauf (Konstante 1 → lim) gegen die Hüllkurve bei Versatz off
import {open, sleep, APP} from './n4-vs-p-qa-h.mjs';
import {sung} from './n4-vs-p-lib.mjs';
const H = await open({file: process.argv[2] || APP}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject({init: true}); SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setBpm(120); });
await sleep(300);
const sr = await p.evaluate(() => window.__ctx.sampleRate);
const y = sung(8, sr, -36, {seed: 5}).y;
const CL = (() => { let s = 7, z = 0, m = 0; const n = Math.round(0.004 * sr), a = new Float32Array(n); for (let j = 0; j < n; j++) { s = (s * 16807) % 2147483647; const w = s / 2147483647 * 2 - 1; z = z + 0.5 * (w - z); a[j] = z; m = Math.max(m, Math.abs(z)); } for (let j = 0; j < n; j++) a[j] /= m; return a; })();
for (let k = 0; k < 8; k++) { const i0 = Math.round((0.75 + k) * sr); for (let j = 0; j < CL.length; j++) y[i0 + j] = 0.98 * Math.sin(Math.PI * j / CL.length) * CL[j]; }
const pcm = Array.from(y, v => Math.max(-32768, Math.min(32767, Math.round(v * 32767))));
const r = await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 4}), [pcm, sr]);
await p.evaluate(() => { SYNQUENZER.vpInfo(); return SYNQUENZER.vpWait(); });
const out = await p.evaluate(async ([id, sr]) => {
  const b = tkPlayBuf(id, null), V = VP.m.get(b), res = [];
  for (const off of [0, 1.946, 3.3, 3.946, 0.5, 2.7]) {
    const dur = 8 - off, oc = new OfflineAudioContext(1, Math.round((dur + 0.2) * sr), sr), when = 0.1;
    // Quelle = der Take selbst, über lim und Gain V.g wie tkStartSrc → wahre Spitze des Ergebnisses
    const s = oc.createBufferSource(); s.buffer = b; const g = oc.createGain(); g.gain.value = V.g;
    const lim = vpLim(oc, V, b.sampleRate, when, off, when + dur);
    if (lim) { s.connect(lim); lim.connect(g); } else s.connect(g); g.connect(oc.destination); s.start(when, off);
    // zweite Messung: Konstante 1 durch dieselbe Hüllkurve
    const oc2 = new OfflineAudioContext(1, Math.round((dur + 0.2) * sr), sr), cs = oc2.createConstantSource(); const lim2 = vpLim(oc2, V, b.sampleRate, when, off, when + dur); cs.connect(lim2 || oc2.destination); if (lim2) lim2.connect(oc2.destination); cs.start(when);
    const [ra, rb] = await Promise.all([oc.startRendering(), oc2.startRendering()]);
    const d = ra.getChannelData(0), e = rb.getChannelData(0);
    // erwartete Hüllkurve an jedem Ausgangs-Sample: env[(off + (t - when)) / T]
    const T = V.K / b.sampleRate; let maxErr = 0, at = 0, worstLag = 0;
    for (let i = Math.round(when * sr) + 2; i < e.length - 2; i++) { const u = off + (i / sr - when), x = u / T, k = Math.floor(x), f = x - k; if (k + 1 >= V.env.length) break; const ex = V.env[k] * (1 - f) + V.env[k + 1] * f; const er = e[i] - ex; if (Math.abs(er) > Math.abs(maxErr)) { maxErr = er; at = u; } }
    // Verschiebung schätzen: um die Stelle des größten Fehlers
    let best = null; for (let lag = -400; lag <= 400; lag += 4) { let s2 = 0; const ic = Math.round((at - off + when) * sr); for (let i = ic - 400; i < ic + 400; i++) { const u = off + ((i + lag) / sr - when), x = u / T, k = Math.floor(x), f = x - k; if (k < 0 || k + 1 >= V.env.length) continue; const ex = V.env[k] * (1 - f) + V.env[k + 1] * f; s2 += (e[i] - ex) ** 2; } if (!best || s2 < best.s2) best = {lag, s2}; }
    let pk = 0; for (const v of d) pk = Math.max(pk, Math.abs(v));
    res.push({off, segs: V.segs.length, peakDb: +(20 * Math.log10(pk)).toFixed(2), maxErr: +maxErr.toFixed(3), at: +at.toFixed(4), lagSamples: best.lag});
  }
  return res;
}, [r.id, sr]);
for (const o of out) console.log(JSON.stringify(o));
console.log('Konsole', JSON.stringify(H.errs.slice(0, 2)));
await H.br.close();
