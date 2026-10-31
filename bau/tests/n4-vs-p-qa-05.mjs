// QA VS-P-05: Knacken? Take (über das Mikro) = 220-Hz-Ton −30 dBFS mit 4 Spitzen-Stößen (0,99) → Spitzen-Schutz arbeitet.
// Abläufe: Schleife (3 Durchgänge), Neu-Planung mitten in einem begrenzten Stoß (wie Take-Wechsel), Stopp mitten in einem Stoß.
// Maß: |2. Differenz| / (lokale Amplitude · (2πf/sr)²) – ein glatter, langsam gepegelter Sinus bleibt bei ≈ 1; ein Knacks springt weit darüber.
import {open, micOn, sleep, APP, recMic, i16} from './n4-vs-p-qa-h.mjs';
const H = await open({file: process.argv[2] || APP}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject({init: true}); SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(120); }); await sleep(300);
const sr = await p.evaluate(() => window.__ctx.sampleRate);
const n = Math.round(9.5 * sr), y = new Float32Array(n), F = 220, bursts = [1.3, 3.05, 5.2, 7.1];
for (let i = 0; i < n; i++) { const t = i / sr; let a = 0.0316; for (const b of bursts) { const u = (t - b) / 0.012; if (Math.abs(u) < 1) a += (0.99 - 0.0316) * (0.5 + 0.5 * Math.cos(Math.PI * u)); } y[i] = a * Math.sin(2 * Math.PI * F * t); }
const r0 = await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 2, len: 4}), [i16(y), sr]); const tk = {id: r0.id, st: r0.track};
const inf = await p.evaluate(async id => { if (!SYNQUENZER.vpEnv) return null; SYNQUENZER.vpEnv(id); await SYNQUENZER.vpWait(); return SYNQUENZER.vpInfo().takes[id].heard; }, tk.id);
console.log('Take', JSON.stringify(inf));
// Wiedergabe mitschneiden (Ausgang STIMME, links), Ereignisse zu festen Zeiten
const r = await p.evaluate(async ([st, bursts]) => {
  const c = window.__ctx;
  // Mitschnitt: links STIMME (mono), rechts ein Bezugston 330 Hz aus demselben Kontext (Aussetzer der Test-Umgebung treffen beide)
  const mg = c.createChannelMerger(2), mono = c.createGain(); mono.channelCount = 1; mono.channelCountMode = 'explicit'; mono.channelInterpretation = 'speakers';
  AU.tracks[st].cut.connect(mono); mono.connect(mg, 0, 0); const osc = c.createOscillator(), og = c.createGain(); osc.frequency.value = 330; og.gain.value = 0.1; osc.connect(og); og.connect(mg, 0, 1); osc.start();
  const g0 = c.createGain(); mg.connect(g0); window.__cap('v', g0);
  SYNQUENZER.launchScene(2); for (let i = 0; i < NT(); i++) if (i !== st) R.slot[i] = -1;
  await new Promise(r => setTimeout(r, 300));
  const a = S.tracks[st].clips[2].audio, sp = spb(), L = S.tracks[st].clips[2].len * 4 * sp, c0 = b2t(R.cstart[st] + a.at), T0 = c0 - a.in;   // T0 + t = Zeitpunkt von Take-Sekunde t im 1. Durchgang
  const ev = [];
  // Durchgang 2: Neu-Planung mitten im 2. Stoß
  const tRe = T0 + L + bursts[1] + 0.002; while (c.currentTime < tRe - 0.012) await new Promise(r => setTimeout(r, 1));
  tkTrackResync(st); ev.push(['resync', c.currentTime]);
  // Durchgang 3: Stopp mitten im 3. Stoß
  const tSt = T0 + 2 * L + bursts[2]; while (c.currentTime < tSt - 0.012) await new Promise(r => setTimeout(r, 1));
  SYNQUENZER.stop(); ev.push(['stop', c.currentTime]);
  await new Promise(r => setTimeout(r, 600));
  const cap = window.__capGet('v'), d = cap.L, w = 2 * Math.PI * 220 / c.sampleRate, k2 = w * w;
  // lokale Amplitude: gleitendes Maximum über ±1 Periode
  const P = Math.ceil(c.sampleRate / 220), N = d.length, amp = new Float32Array(N);
  for (let i = 0; i < N; i++) { let m = 0; for (let j = Math.max(0, i - P); j < Math.min(N, i + P); j += 1) { const v = Math.abs(d[j]); if (v > m) m = v; } amp[i] = m; }
  const e = cap.R, w2 = 2 * Math.PI * 330 / c.sampleRate, k3 = w2 * w2 * 0.1, bad = new Uint8Array(N);
  for (let i = 2; i < N; i++) if (Math.abs(e[i] - 2 * e[i - 1] + e[i - 2]) > 3 * k3) for (let j = Math.max(0, i - 96); j < Math.min(N, i + 96); j++) bad[j] = 1;
  let worst = 0, wi = 0, excl = 0; const top = [];
  for (let i = 2; i < N; i++) { const dd = Math.abs(d[i] - 2 * d[i - 1] + d[i - 2]), ref = Math.max(amp[i], 1e-3) * k2, q = dd / ref; if (q > 3 && bad[i]) { excl++; continue; } if (q > worst) { worst = q; wi = i; } if (q > 3 && top.length < 200) top.push([+(cap.t0 + i / c.sampleRate - T0).toFixed(4), +q.toFixed(2)]); }
  const det = []; for (let i = wi - 6; i <= wi + 6; i++) det.push([+(d[i] || 0).toFixed(5), +(amp[i] || 0).toFixed(4)]);
  const pcs = TK.src.map(x => ({s: +(x.start - T0).toFixed(4), e: +(x.end - T0).toFixed(4), off: +x.off.toFixed(4), lim: !!x.lim}));
  osc.stop(); return {det, excl, worst: +worst.toFixed(2), at: +(cap.t0 + wi / c.sampleRate - T0).toFixed(4), ev: ev.map(([k, t]) => [k, +(t - T0).toFixed(4)]), n: top.length, top: top.slice(0, 12), L, gaps: null};
}, [tk.st, bursts]);
console.log(JSON.stringify(r));
console.log(r.worst <= 3 ? 'VS-P-05 ✓ (Faktor ' + r.worst + ')' : 'VS-P-05 ✗ Faktor ' + r.worst + ' bei ' + r.at + ' s');
if (H.errs.length) console.log('Konsole', H.errs.slice(0, 3));
await H.br.close();
