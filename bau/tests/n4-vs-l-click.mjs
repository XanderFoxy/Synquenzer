// VS-L FP-DSP: Overdub wird länger (4 → 16 Takte) während ▶ läuft – der Wechsel zum längeren Clip am nächsten Takt knackt nicht,
// setzt nicht aus; Mitschnitt aller Ausgänge (ScriptProcessor), Töne über die Mikro-Attrappe (330 Hz alt, 440 Hz neu)
import {chromium} from 'playwright';
import {INIT as INIT2} from './v3-vs2-h.mjs';
import {b64, sleep} from './n4-vs-l-h.mjs';
const file = process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-br-VSL/index.html';
const B2 = +(process.argv[3] || 16), E2 = 24 + B2 * 4;   // Länge der zweiten Aufnahme (16: Clip wächst; 4: wie 4.23.0)
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const OUT = () => { window.__outs = []; const oc = AudioNode.prototype.connect; AudioNode.prototype.connect = function (d, ...r) { try { if (d instanceof AudioDestinationNode) window.__outs.push(this); } catch (e) {} return oc.call(this, d, ...r); }; };
const br = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await (await br.newContext()).newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.addInitScript(INIT2); await p.addInitScript(OUT);
await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version); await sleep(400);
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); return SYNQUENZER.stimmeStart({route: 'wired', cal: false}); });
await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live' && SYNQUENZER.vsClock().ring.end > 0, null, {timeout: 8000}); await sleep(400);
const sr = await p.evaluate(() => SYNQUENZER.vsClock().sr), BPM = 120, SB = 60 / BPM;
await p.evaluate(() => { SYNQUENZER.newProject({init: true}); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); SYNQUENZER.setRecOptions({countIn: 0, length: 4, metroInRec: false}); SYNQUENZER.vsSet({mel: false}); });
const tone = (f, sec) => { const n = Math.round(sr * sec), y = new Float32Array(n); for (let i = 0; i < n; i++) y[i] = 0.3 * Math.sin(2 * Math.PI * f * i / sr) * Math.min(1, i / (0.01 * sr), (n - i) / (0.01 * sr)); return y; };
const put = async (x, k) => p.evaluate(([b, k]) => { const bin = atob(b), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); const x = new Float32Array(u.buffer), ctx = window.__ctx, buf = ctx.createBuffer(1, x.length, ctx.sampleRate); buf.getChannelData(0).set(x); (window.__pre = window.__pre || {})[k] = buf; }, [b64(x), k]);
const fire = (k, beat) => p.evaluate(([k, beat]) => { const c = SYNQUENZER.vsClock(), t = c.start + beat * c.spb, s = window.__ctx.createBufferSource(); s.buffer = window.__pre[k]; s.connect(window.__fake.bus); s.start(t); return t - c.now; }, [k, beat]);
const waitBeat = b => p.waitForFunction(b => { const c = SYNQUENZER.vsClock(); return c.playing && (c.now - c.outLat - c.start) / c.spb >= b; }, b, {timeout: 120000, polling: 20});
await put(tone(330, 17.5 * SB), 'a'); await put(tone(440, (E2 - 21) * SB), 'b');
await p.evaluate(e => { window.__E2 = e; SYNQUENZER.play(); }, E2);
await waitBeat(0.5); ok(await fire('a', 3.5) > 0, 'Ton 330 Hz geplant (Takt 2 … 5)'); await p.evaluate(() => { SYNQUENZER.selectSlot(3, 2); SYNQUENZER.rec(); });
await waitBeat(21); await p.evaluate(() => SYNQUENZER.setRecOptions({length: 'auto'}));
ok(await fire('b', 23.5) > 0, 'Ton 440 Hz geplant (Takt 7 … 22)'); await p.evaluate(() => { SYNQUENZER.selectSlot(3, 2); SYNQUENZER.rec(); });
const st = await p.evaluate(() => { SYNQUENZER.setMute(5, true); return SYNQUENZER.tkInfo().stimme; });   // MELODIE stumm (4.23.0 kennt „Aus“ nicht)
await waitBeat(E2 - 6);
await p.evaluate(async () => { const ctx = window.__ctx;   // Mitschnitt im Audio-Faden (AudioWorklet): keine Lücken durch einen beschäftigten Hauptfaden
  const code = `class R extends AudioWorkletProcessor { constructor() { super(); this.b = new Float32Array(4096); this.n = 0; this.t = -1; } process(i) { const x = i[0] && i[0][0]; if (x) { if (this.t < 0) this.t = currentTime; this.b.set(x, this.n); this.n += x.length; if (this.n >= 4096) { this.port.postMessage([this.t, this.b]); this.b = new Float32Array(4096); this.n = 0; this.t = -1; } } return true; } } registerProcessor('n4rec', R);`;
  await ctx.audioWorklet.addModule('data:application/javascript;base64,' + btoa(code));
  const w = new AudioWorkletNode(ctx, 'n4rec', {numberOfInputs: 1, numberOfOutputs: 0, channelCount: 1, channelCountMode: 'explicit'}); window.__cap = []; w.port.onmessage = e => window.__cap.push(e.data);
  for (const n of window.__outs) { try { n.connect(w); } catch (e) {} } window.__sp = w; });
if (B2 < 16) { await waitBeat(E2 + 0.1); await p.evaluate(() => SYNQUENZER.rec()); }
const SRC = []; for (let k = 0; k < 40; k++) { await sleep(60); SRC.push(await p.evaluate(() => { const c = SYNQUENZER.vsClock(), b = t => +((t - c.start) / c.spb).toFixed(3); return {now: b(c.now), src: SYNQUENZER.tkInfo().src.map(r => [r.take.slice(0, 3), b(r.start), b(r.end), +r.off.toFixed(3)]), cs: SYNQUENZER.state().runtime.cstart[6], q: SYNQUENZER.state().runtime.queued[6], pend: SYNQUENZER.tkInfo().pend.length}; })); }
let lastS = ''; for (const x of SRC) { const k = JSON.stringify([x.src, x.cs, x.q, x.pend]); if (k !== lastS) { console.log(JSON.stringify(x)); lastS = k; } }
await waitBeat(E2 + 12);
const q = await p.evaluate(st => ({c: SYNQUENZER.getClip(st, 2), cs: SYNQUENZER.state().runtime.cstart[st], start: SYNQUENZER.vsClock().start, spb: SYNQUENZER.vsClock().spb}), st);
await p.evaluate(() => { window.__sp.disconnect(); });
const res = await p.evaluate(({start, spb}) => { const b = window.__cap, n = b.reduce((a, x) => a + x[1].length, 0), y = new Float32Array(n); let o = 0; for (const x of b) { y.set(x[1], o); o += x[1].length; }
  const t0 = b[0][0], sr = window.__ctx.sampleRate, beatAt = i => (t0 + i / sr - start) / spb;
  let pk = 0, d2 = 0, at = 0, d2all = 0; for (let i = 2; i < n; i++) { const v = Math.abs(y[i]); if (v > pk) pk = v; const d = Math.abs(y[i] - 2 * y[i - 1] + y[i - 2]); if (d > d2all) d2all = d; const bb = beatAt(i); if (bb < window.__E2 + 0.2 || bb > beatAt(n) - 0.5) continue; if (d > d2) { d2 = d; at = i; } }
  // Pegel je 2,5 ms; Lücke = Fenster unter −40 dB unter dem Median
  const W = Math.round(sr * 0.0025), lv = []; for (let i = 0; i + W <= n; i += W) { let s = 0; for (let j = 0; j < W; j++) s += y[i + j] * y[i + j]; lv.push(10 * Math.log10(s / W + 1e-20)); }
  const med = lv.slice().sort((a, b) => a - b)[lv.length >> 1]; let gap = 0, cur = 0, gapAt = null; for (let k = 0; k < lv.length; k++) { const bk = beatAt(k * W); if (bk < beatAt(0) + 1 || bk > beatAt(n) - 0.5) { cur = 0; continue; } if (lv[k] < med - 20) { cur++; if (cur > gap) { gap = cur; gapAt = beatAt(k * W); } } else cur = 0; }
  // Frequenz vor und nach Schlag 92 (Nulldurchgänge)
  const fz = (b0, b1) => { const i0 = Math.max(0, Math.round((b0 * spb + start - t0) * sr)), i1 = Math.min(n, Math.round((b1 * spb + start - t0) * sr)); let z = 0; for (let i = i0 + 1; i < i1; i++) if (y[i - 1] < 0 && y[i] >= 0) z++; return Math.round(z / ((i1 - i0) / sr)); };
  const big = []; for (let i = 2; i < n; i++) { const d = Math.abs(y[i] - 2 * y[i - 1] + y[i - 2]); if (d > 0.01) big.push([+beatAt(i).toFixed(4), i % 4096, +d.toFixed(3)]); }
  const env = []; for (let k = 0; k < lv.length; k++) { const bb = beatAt(k * W); if (bb > window.__E2 + 0.4 && bb < window.__E2 + 1.6 && k % 4 === 0) env.push([+bb.toFixed(3), +lv[k].toFixed(0)]); }
  window.__dbg = {big: big.slice(0, 20), nb: big.length, env};
  return {n, pk: +pk.toFixed(4), d2: +d2.toFixed(5), d2all: +d2all.toFixed(5), d2Beat: +beatAt(at).toFixed(3), med: +med.toFixed(1), gapMs: gap * 2.5, gapAt: gapAt && +gapAt.toFixed(3), f86: fz(window.__E2 - 3.7, window.__E2 + 0.5), f94: fz(window.__E2 + 3, window.__E2 + 10), switchBeat: window.__swb, from: +beatAt(0).toFixed(2), to: +beatAt(n).toFixed(2)}; }, q);
console.log(JSON.stringify(res)); console.log(JSON.stringify(await p.evaluate(() => window.__dbg)));
const curv = res.pk * (Math.pow(2 * Math.PI * 440 / sr, 2) + (B2 >= 16 ? Math.pow(2 * Math.PI * 330 / sr, 2) : 0));   // beim Wechsel 330 → 440 Hz klingen in der Blende beide Töne
ok(B2 < 16 || (q.c.len === 16 && q.cs === 24), `Clip ${q.c.len} Takte, läuft ab Schlag ${q.cs}`);
ok(res.f86 > 300 && res.f86 < 360 && res.f94 > 410 && res.f94 < 470, `vor dem Wechsel der alte Take (${res.f86} Hz), danach der neue (${res.f94} Hz) – Mitschnitt Schlag ${res.from} … ${res.to}`);
ok(res.d2 <= 1.5 * curv, `M-KLICK ab dem Ende der Aufnahme (Wechsel): größte 2. Differenz ${res.d2} (bei Schlag ${res.d2Beat}; im ganzen Mitschnitt ${res.d2all}) ≤ 1,5 × Krümmung der Töne ${(1.5 * curv).toFixed(5)}`);
ok(res.gapMs <= 10, `kein Aussetzer: längste Lücke ${res.gapMs} ms (bei Schlag ${res.gapAt}; Blende 3 + 5 ms)`);
await p.evaluate(() => SYNQUENZER.stop());
ok(!errs.length, 'keine Seitenfehler ' + JSON.stringify(errs.slice(0, 2)));
await br.close();
console.log(fail ? `FEHLER: ${fail}` : 'ALLE OK');
