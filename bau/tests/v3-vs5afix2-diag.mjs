// VS5a-fix2 diag: QA-D tone, switches while playing; list every click/dip in the output with the nearest switch T and the TK.src events
import {launch, open5, sleep, toI16, hp} from './v3-qa-vs5a-h2.mjs';
const NSW = +(process.argv[2] || 12);
const br = await launch(null);
const H = await open5(br, {}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); }); await sleep(300);
const LEN = 4.6, n = Math.round(48000 * LEN), xs = new Float32Array(n); let ph = 0;
const TT = [0.5, 0.762, 0.98, 1.27, 1.49, 1.77, 2.01, 2.24, 2.52, 2.75, 3.03, 3.23, 3.52, 3.74, 4.03, 4.27];
for (let i = 0; i < n; i++) { const t = i / 48000; let k = 0; for (let j = 0; j < TT.length; j++) if (t >= TT[j]) k = j; ph += 2 * Math.PI * [220, 247, 262, 294][k % 4] / 48000; let v = 0; for (let h = 1; h <= 5; h++) v += Math.sin(h * ph) / h; xs[i] = 0.2 * v * Math.min(1, t / 0.02, (LEN - t) / 0.02); }
const id = (await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 2}), toI16(xs))).id;
await p.evaluate(id => SYNQUENZER.wpDetect(id), id);
// recorder with frame gap detection + source log
await p.evaluate(async () => {
  if (!window.__ctx) ensureAudio(); const ctx = window.__ctx; if (ctx.state !== 'running') await ctx.resume();
  const src = "class R extends AudioWorkletProcessor{process(i){const c=i[0]&&i[0][0];this.port.postMessage({f:currentFrame,d:c?c.slice(0):null});return true;}}registerProcessor('qarec2',R);";
  await ctx.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src));
  const nn = new AudioWorkletNode(ctx, 'qarec2', {numberOfInputs: 1, numberOfOutputs: 1, channelCount: 1, channelCountMode: 'explicit'});
  window.__qr = []; nn.port.onmessage = e => window.__qr.push(e.data);
  for (const o of window.__outs) { try { o.connect(nn); } catch (e) {} }
  const g = ctx.createGain(); g.gain.value = 0; nn.connect(g); g.connect(ctx.destination);
  window.__slog = []; const o = tkStartSrc; window.tkStartSrc = x => { const r = o(x); window.__slog.push({c: ctx.currentTime, when: x.when, end: x.end, off: x.off, xc: !!x.xc, fi: x.fi, fo: x.fo, ok: !!r}); return r; };
});
await p.evaluate(() => { window.__dbg = []; const o = wpSwitch; window.wpSwitch = () => { const now = AU.ctx.currentTime; window.__dbg.push({now, sched: b2t(R.schedBeat), playing: R.playing, xf: !!TK.xf, src: TK.src.map(r => { let nb = null; try { nb = tkPlayBuf(r.take, r.aud); } catch (e) {} return {st: +r.start.toFixed(3), en: +r.end.toFixed(3), dead: r.dead, vox: r.vox, hasAud: !!r.aud, same: nb === r.s.buffer, nb: !!nb}; })}); return o(); }; });
await p.evaluate(() => { const ctx = window.__ctx; window.__alog = []; const P = AudioParam.prototype;
  for (const m of ['setTargetAtTime', 'cancelAndHoldAtTime', 'cancelScheduledValues', 'setValueCurveAtTime', 'setValueAtTime', 'linearRampToValueAtTime', 'exponentialRampToValueAtTime']) { const o = P[m]; P[m] = function (...a) { const now = ctx.currentTime; const tt = m === 'setTargetAtTime' || m === 'setValueAtTime' || m === 'linearRampToValueAtTime' || m === 'exponentialRampToValueAtTime' || m === 'setValueCurveAtTime' ? a[1] : a[0]; if (Math.abs(tt - now) < .06 || tt < now) window.__alog.push([now.toFixed(4), m, (+tt).toFixed(4), String(a[0] && a[0].length ? 'curve' : a[0]).slice(0, 8), new Error().stack.split('\n').slice(2, 5).map(x => x.trim().split(' ')[1]).join('<')]); return o.apply(this, a); }; }
  const st = AudioScheduledSourceNode.prototype.stop; AudioScheduledSourceNode.prototype.stop = function (t) { const now = ctx.currentTime; if (t == null || t < now + .06) window.__alog.push([now.toFixed(4), 'stop', t == null ? 'now' : (+t).toFixed(4), '', new Error().stack.split('\n').slice(2, 5).map(x => x.trim().split(' ')[1]).join('<')]); return st.call(this, t); }; });
await p.evaluate(() => SYNQUENZER.launchScene(0)); await sleep(900);
const G0 = ['1/8', 'off', '1/16', '1/8', 'off', '1/16T', '1/4', 'off', '1/8', '1/16', 'off', '1/8T', '1/16', '1/8', 'off', '1/4', '1/16T', 'off', '1/8', '1/32', '1/8T', 'off', '1/16', '1/8'];
for (let k = 0; k < NSW; k++) { await p.evaluate(async ([id, g]) => { await SYNQUENZER.wpQuantize(id, {grid: g, strength: 1}); }, [id, G0[k % 24]]); if (k < 2) { await sleep(400); console.log(JSON.stringify(await p.evaluate(id => { const I = SYNQUENZER.wpInfo(id); return {ready: I.ready, warp: !!I.warp, n: I.warp && I.warp.map.dst.length, wsrc: I.warp && I.warp.map.src.slice(0,5), wdst: I.warp && I.warp.map.dst.slice(0,5), cache: WP.cache.size, src: TK.src.map(r => [r.start.toFixed(3), r.s.buffer === tkBuffer(r.take), r.s.buffer === (WP.cache.get(r.take)||{}).buf])}; }, id))); } await sleep(700 + 137 * k % 300); }
await sleep(300);
await sleep(+(process.argv[3] || 0));
const D = await p.evaluate(() => { const R = window.__qr; const f0 = R[0].f; let gaps = 0, nul = 0; for (let k = 1; k < R.length; k++) { if (R[k].f !== R[k - 1].f + 128) { gaps++; (window.__gp || (window.__gp = [])).push([R[k - 1].f / window.__ctx.sampleRate, R[k].f - R[k - 1].f]); } if (!R[k].d) nul++; }
  const y = new Float32Array(R[R.length - 1].f + 128 - f0); for (const r of R) if (r.d) y.set(r.d, r.f - f0); const y2 = new Float32Array(R.length * 128); R.forEach((r, k) => { if (r.d) y2.set(r.d, k * 128); }); window.__y2 = Array.from(y2);
  return {y2: window.__y2, gp: window.__gp || [], f0, sr: window.__ctx.sampleRate, gaps, nul, y: Array.from(y), sw: SYNQUENZER.wpSwitchInfo(true), alog: window.__alog, dbg: window.__dbg, slog: window.__slog}; });
await p.evaluate(() => SYNQUENZER.stop());
const sr = D.sr;
console.log(D.dbg.map(x => JSON.stringify(x)).join('\n')); console.log('gaps at', JSON.stringify(D.gp)); console.log(D.sw.map(s => JSON.stringify(s)).join('\n')); console.log('frames gaps', D.gaps, 'null quanta', D.nul, 'switches', D.sw.length, D.sw.map(s => s.at.toFixed(3) + '/' + s.kind + '/' + s.bad).join(' '));
for (const MODE of ['f', 'seq']) { const y = Float32Array.from(MODE === 'seq' ? D.y2 : D.y); console.log('--- recorder placement', MODE);
const T = i => (i + D.f0) / sr;
// steady step reference
let typ = 0; for (let i = Math.round(.2 * sr); i < Math.round(.8 * sr); i++) typ = Math.max(typ, Math.abs(y[i] - y[i - 1]));
const ev = [];
for (let i = Math.round(.1 * sr); i < y.length; i++) { const d = Math.abs(y[i] - y[i - 1]); if (d > 2 * typ) { ev.push({t: T(i), what: 'step ' + d.toFixed(3)}); i += Math.round(.01 * sr); } }
const W5 = Math.round(.005 * sr), lv = a => { let s = 0; for (let i = a; i < a + W5; i++) s += (y[i] || 0) ** 2; return 10 * Math.log10(s / W5 + 1e-14); };
for (let a = Math.round(.15 * sr); a < y.length - 2 * sr / 10; a += Math.round(sr / 1000)) { const ref = Math.min(lv(a - Math.round(.04 * sr)), lv(a + Math.round(.04 * sr))); const v = lv(a); if (v < ref - 3) { ev.push({t: T(a), what: 'dip ' + (v - ref).toFixed(1)}); a += Math.round(.02 * sr); } }
ev.sort((a, b) => a.t - b.t);
for (const e of ev) { if (!D.sw.length) { console.log(e.t.toFixed(4), e.what); continue; } const s = D.sw.reduce((b, x) => Math.abs(x.at - e.t) < Math.abs(b.at - e.t) ? x : b, D.sw[0]); const sl = D.slog.filter(x => Math.abs(x.when - e.t) < .03 || Math.abs(x.end - e.t) < .03).map(x => `[${x.when.toFixed(4)}-${x.end.toFixed(4)} c${x.c.toFixed(3)} xc${+x.xc} fi${x.fi} fo${x.fo}]`).join(' ');
  if (MODE === 'f') console.log('   alog:', D.alog.filter(x => Math.abs(+x[0] - e.t) < .03 || Math.abs(+x[2] - e.t) < .03).map(x => x.join(' ')).join('\n      '));
  console.log(e.t.toFixed(4), e.what, '| nearest switch T', s.at.toFixed(4), 'Δ', ((e.t - s.at) * 1000).toFixed(1), 'ms call', s.call.toFixed(3), '|', sl); }
}
await br.close();
