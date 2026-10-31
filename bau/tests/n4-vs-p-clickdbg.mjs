import {open, sleep} from './v3-vs3-h.mjs';
const APP = process.argv[2];
const H = await open({file: APP}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject({init: true}); SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(120); }); await sleep(300);
const sr = await p.evaluate(() => window.__ctx.sampleRate);
const sine = f => { const x = []; for (let i = 0; i < sr * 2; i++) x.push(Math.round(Math.sin(2 * Math.PI * f * i / sr + 0.7) * 16000)); return x; };
await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 1}), [sine(440), sr]);
await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 1}), [sine(660), sr]);
await p.evaluate(() => { if (SYNQUENZER.vpInfo) { SYNQUENZER.vpInfo(); return SYNQUENZER.vpWait(); } });
await p.evaluate(() => { const ctx = window.__ctx, sp = ctx.createScriptProcessor(4096, 2, 2), buf = []; window.__t0 = null; for (const n of window.__outs) { try { n.connect(sp); } catch (e) {} } sp.onaudioprocess = e => { if (window.__t0 == null) window.__t0 = e.playbackTime; buf.push(new Float32Array(e.inputBuffer.getChannelData(0))); }; const z = ctx.createGain(); z.gain.value = 0; sp.connect(z); z.connect(ctx.destination); window.__cap = buf; });
await p.evaluate(() => { window.__log = []; const o0 = window.tkStartSrc; window.tkStartSrc = function (o) { const r = o0(o); window.__log.push({now: +window.__ctx.currentTime.toFixed(4), when: +o.when.toFixed(4), off: +o.off.toFixed(4), end: +o.end.toFixed(4), fi: o.fi, fo: o.fo, ok: !!r, G: r && r.G, key: o.key}); return r; }; const f0 = window.tkFadeAt; window.tkFadeAt = function (r, t, tau) { window.__log.push({fade: +t.toFixed(4), now: +window.__ctx.currentTime.toFixed(4), key: r.key}); return f0(r, t, tau); }; window.__L0 = window.__ctx.currentTime; SYNQUENZER.launchScene(0); });
await sleep(3300); const tp = await p.evaluate(() => { const t = window.__ctx.currentTime; SYNQUENZER.tkPick({t: SYNQUENZER.tkInfo().stimme, s: 0}, 1, false); return t; });
await sleep(1500); const ts = await p.evaluate(() => { const t = window.__ctx.currentTime; SYNQUENZER.stop(); return t; }); await sleep(600);
const r = await p.evaluate(() => { const b = window.__cap, n = b.reduce((a, x) => a + x.length, 0), y = new Float32Array(n); let o = 0; for (const x of b) { y.set(x, o); o += x.length; }
  const big = []; for (let i = 2; i < n; i++) { if (i % 4096 < 2) continue; const d = Math.abs(y[i] - 2 * y[i - 1] + y[i - 2]); if (d > 0.01) big.push([i, i % 128, +(window.__t0 + i / window.__ctx.sampleRate).toFixed(4), +d.toFixed(3), Array.from(y.subarray(i - 4, i + 3)).map(v => +v.toFixed(3))]); }
  return {log: window.__log, big: big.slice(0, 10), nb: big.length, src: SYNQUENZER.tkInfo().src, cs: R.cstart, v: SYNQUENZER.version, vp: SYNQUENZER.vpInfo ? SYNQUENZER.vpInfo() : null}; });
console.log(JSON.stringify({L0: await p.evaluate(() => window.__L0), tp, ts}), JSON.stringify(r, null, 0).slice(0, 3000));
await H.br.close();
