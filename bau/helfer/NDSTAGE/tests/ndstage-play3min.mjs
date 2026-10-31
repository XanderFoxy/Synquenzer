// NDSTAGE: 3 Minuten Abspiel mit North-Kit über den Transport (Echtzeit, Chromium). Prüft:
//  - keine Konsolen-/Seitenfehler, Engine-Zähler late = 0, keine 'err'-Meldung, Warteschlange ohne Überlauf
//  - Aussetzer: Engine-Last (Berichte je Sekunde) < 1, Kontext-Uhr läuft mit der Wanduhr (Drift), playbackStats falls vorhanden
//  - Knackser: Mitschnitt des Engine-Ausgangs (Abgriff-Worklet) gegen Offline-Render derselben Schläge (MDX.render):
//    Differenz (M-NULL) und Knack-Suche (Hochpass 5 kHz, 2-ms-Fenster gegen den Median der Referenz an derselben Stelle)
// Aufruf: node ndstage-play3min.mjs <index.html> [sek=180] [kit=Schräg]
import {createRequire} from 'module'; const {chromium} = createRequire(import.meta.url)('playwright');
const [file, secArg, kitArg] = process.argv.slice(2); const SEC = +(secArg || 180), KIT = kitArg || 'Schräg';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 390, height: 844}}); const errs = [];
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 30000}); await p.waitForTimeout(600);
await p.evaluate(s => { window.__SEC = s; }, SEC);
const setup = await p.evaluate(async kit => {
  const Q = SYNQUENZER; ensureAudio(); Q.loadKit(kit);
  for (let k = 0; k < 80 && !(AU.ctx && AU.ctx.state === 'running' && MDS.st === 'ready'); k++) { mdBoot(); await new Promise(r => setTimeout(r, 100)); }
  if (MDS.st !== 'ready') return {err: 'engine ' + MDS.st};
  for (let k = 0; k < 60 && MDX.info().warm === 'on'; k++) await new Promise(r => setTimeout(r, 100));   // Aufwärmen fertig (Kit laden, dann ▶)
  const c = AU.ctx, sr = c.sampleRate, N = Math.ceil((window.__SEC + 4) * sr);
  window.__L = new Float32Array(N); window.__R = new Float32Array(N); window.__n = 0; window.__f0 = -1;
  const src = `class Cap extends AudioWorkletProcessor { constructor() { super(); this.on = true; this.port.onmessage = e => { this.on = false; }; }
    process(inp) { const i = inp[0]; if (this.on && i && i.length) { const L = i[0].slice(), R = (i[1] || i[0]).slice(); this.port.postMessage({f: currentFrame, L, R}, [L.buffer, R.buffer]); } return true; } }
    registerProcessor('nd-cap', Cap);`;
  await c.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src));
  const cap = new AudioWorkletNode(c, 'nd-cap', {numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2], channelCount: 2, channelCountMode: 'explicit'});
  const z = c.createGain(); z.gain.value = 0; cap.connect(z); z.connect(c.destination); MDS.node.connect(cap); window.__cap = cap;
  window.__gaps = []; window.__nf = -1;
  cap.port.onmessage = e => { const d = e.data; if (window.__f0 < 0) window.__f0 = d.f; if (window.__nf >= 0 && d.f !== window.__nf) window.__gaps.push([+(d.f / sr).toFixed(3), d.f - window.__nf]); window.__nf = d.f + d.L.length; const o = d.f - window.__f0; if (o + d.L.length <= window.__L.length) { window.__L.set(d.L, o); window.__R.set(d.R, o); window.__n = o + d.L.length; } };
  // Nachrichten an die Engine mitschreiben (hit, lim, ch, kit, stop …)
  const port = MDS.node.port, orig = port.postMessage.bind(port); window.__log = [];
  port.postMessage = m => { window.__log.push({m: JSON.parse(JSON.stringify(m)), now: c.currentTime}); return orig(m); };
  window.__err = []; const f = port.onmessage; port.onmessage = e => { f(e); if (e.data && e.data.t === 'err') window.__err.push(e.data); };
  // 16tel-Muster, 1 Takt, alle 12 Pads, Velocity-Wechsel, ein Akzent
  const G = DRUM_VOICES.map(v => v.gm), PAT = [[0, 4, 8, 11], [4, 12], [7, 15], [12], [0, 2, 4, 6, 8, 10, 12, 14], [14], [9], [10], [11, 13], [0], [3, 7, 11, 15], [1, 5, 9, 13]];
  const notes = []; PAT.forEach((P, i) => P.forEach(s => notes.push({t: s * 0.25, d: .1, n: G[i], v: s % 4 ? .7 : .95, a: s === 12 && i === 1 ? 1 : 0})));
  Q.setBpm(120); Q.setClip(DRUM_T, 0, {len: 1, key: {root: 0, scale: 'ionian'}, notes}); Q.launchClip(DRUM_T, 0);
  return {sr, kit, md: DRUM_VOICES.filter(v => mdIsSrc(v.id)).length, lim: LIM.level, ps: !!c.playbackStats, warm: MDX.info().warm};
}, KIT).catch(e => ({err: String(e)}));
if (setup.err) { console.log(JSON.stringify({test: 'ndstage-play3min', pass: false, setup, errs})); await b.close(); process.exit(1); }
const run = await p.evaluate(async sec => {
  const Q = SYNQUENZER, c = AU.ctx, w0 = performance.now(), t0 = c.currentTime, loads = [], lims = new Set([LIM.level]);
  const ps0 = c.playbackStats ? JSON.parse(JSON.stringify({u: c.playbackStats.underrunEvents, d: c.playbackStats.underrunDuration, fr: c.playbackStats.fallbackFramesEvents})) : null;
  Q.play();
  const tk = setInterval(() => { if (MDS.E) loads.push(MDS.E.load); lims.add(LIM.level); }, 1000);
  await new Promise(r => setTimeout(r, sec * 1000));
  clearInterval(tk); Q.stop(); await new Promise(r => setTimeout(r, 1500)); window.__cap.port.postMessage('stop'); await new Promise(r => setTimeout(r, 300));
  const wall = (performance.now() - w0) / 1000, ctxT = c.currentTime - t0;
  const ps1 = c.playbackStats ? {u: c.playbackStats.underrunEvents, d: c.playbackStats.underrunDuration, fr: c.playbackStats.fallbackFramesEvents} : null;
  const st = await MDS.E.test({q: 'state'});
  return {wall, ctxT, drift: ctxT - wall, loads, loadMax: Math.max(...loads), loadMed: loads.slice().sort((a, b) => a - b)[loads.length >> 1], lims: [...lims], late: MDS.E.late, ps0, ps1,
    state: st && st.state, gaps: window.__gaps.slice(0, 10), nGaps: window.__gaps.length, errMsgs: window.__err.length, hits: window.__log.filter(x => x.m.t === 'hit').reduce((n, x) => n + x.m.list.length, 0), captured: window.__n / c.sampleRate};
}, SEC);
// Offline-Render derselben Schläge und Vergleich (im Browser)
const cmp = await p.evaluate(async () => {
  const c = AU.ctx, sr = c.sampleRate, f0 = window.__f0, T0 = f0 / sr, n = window.__n, L = window.__L.subarray(0, n), R = window.__R.subarray(0, n);
  const snd = drumSnd(), chans = {}; for (const v of DRUM_VOICES) { const st = mdSlot(v.id); if (st && st.src === 'md') chans[v.idx] = MDN.spec(st); }
  const log = window.__log, hits = [], msgs = [];
  for (const x of log) { if (x.m.t === 'hit') for (const h of x.m.list) hits.push(Object.assign({}, h, {at: (Math.round((+h.at || 0) * sr) - f0) / sr}));   // dieselbe Sample-Stelle wie live (16tel bei 44,1 kHz liegen auf halben Samples)
    else if (x.m.t === 'lim' || x.m.t === 'stop' || x.m.t === 'cancel' || x.m.t === 'mute' || x.m.t === 'panic') msgs.push([Math.max(0, x.now - T0), x.m.t === 'stop' ? Object.assign({}, x.m, {at: x.m.at - T0}) : x.m]); }
  const ref = await MDX.render({sr, sec: n / sr, chans, kit: Object.assign(MDN.kitInit(), snd.p.md || {}), hits, msgs});
  // Vergleich bis zur ersten Stopp-Nachricht (sie wirkt live erst nach der Port-Laufzeit, offline am Block davor)
  const stopM = log.find(x => x.m.t === 'stop'), nCmp = stopM ? Math.min(n, Math.floor((stopM.now - T0) * sr)) : n;
  // M-NULL und Knack-Suche
  let e = 0, d = 0, pk = 0, dmax = 0, imax = 0; for (let i = 0; i < nCmp; i++) { const a = ref.l[i], b2 = L[i]; e += a * a; const q = b2 - a; d += q * q; pk = Math.max(pk, Math.abs(b2)); if (Math.abs(q) > dmax) { dmax = Math.abs(q); imax = i; } }
  // Hochpass 2. Ordnung 5 kHz auf beide, 2-ms-Fenster: live-Fenster > Referenz-Fenster + 6 dB (und > -60 dBFS) = Knack
  const hp = x => { const w = Math.tan(Math.PI * 5000 / sr), k = Math.SQRT2, nn = 1 / (1 + k * w + w * w), a0 = nn, a1 = -2 * nn, a2 = nn, b1 = 2 * (w * w - 1) * nn, b2 = (1 - k * w + w * w) * nn; const y = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const o = a0 * x[i] + a1 * x1 + a2 * x2 - b1 * y1 - b2 * y2; x2 = x1; x1 = x[i]; y2 = y1; y1 = o; y[i] = o; } return y; };
  const hl = hp(L), hr = hp(ref.l), W = Math.round(0.002 * sr); let clicks = 0, worst = -999;
  for (let s = 0; s + W <= nCmp; s += W) { let a = 0, r = 0; for (let i = s; i < s + W; i++) { a = Math.max(a, Math.abs(hl[i])); r = Math.max(r, Math.abs(hr[i])); }
    const dd = 20 * Math.log10((a + 1e-9) / (r + 1e-9)); if (a > 1e-3 && dd > 6) clicks++; if (a > 1e-3) worst = Math.max(worst, dd); }
  let first = -1; for (let i = 0; i < nCmp; i++) if (Math.abs(ref.l[i] - L[i]) > 1e-4) { first = i; break; }
  const prof = []; for (let s0 = 0; s0 < n; s0 += sr) { let ee = 0, dd2 = 0; for (let i = s0; i < Math.min(n, s0 + sr); i++) { ee += ref.l[i] * ref.l[i]; const q = L[i] - ref.l[i]; dd2 += q * q; } prof.push(+(10 * Math.log10((dd2 + 1e-30) / (ee + 1e-30))).toFixed(1)); }
  window.__dbg = {first: first / sr, prof, msgList: msgs.map(m => [+m[0].toFixed(3), m[1].t]), firstHit: hits.length ? hits[0].at : null, nearFirst: hits.filter(h => Math.abs(h.at - first / sr) < 0.05)};
  return {dbg: window.__dbg, cmpSec: +(nCmp / sr).toFixed(3), sec: n / sr, hits: hits.length, msgs: msgs.length, mnull: 10 * Math.log10((d + 1e-30) / (e + 1e-30)), diffMax: dmax, diffAt: +(imax / sr).toFixed(3), peakDb: 20 * Math.log10(pk + 1e-12), clicks, worstDb: +worst.toFixed(2)};
});
const pass = !errs.length && run.late === 0 && !run.errMsgs && run.loadMax < 1 && Math.abs(run.drift) < 0.25 && run.captured >= SEC && (!run.ps1 || !run.ps0 || run.ps1.u === run.ps0.u) && cmp.clicks === 0 && cmp.mnull < -60;
console.log(JSON.stringify({test: 'ndstage-play3min', pass, setup, run: Object.assign({}, run, {loads: undefined}), cmp, errs: errs.slice(0, 4)}));
await b.close(); process.exit(pass ? 0 : 1);
