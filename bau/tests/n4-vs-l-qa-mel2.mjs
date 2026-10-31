// QA VS-L-03 (realistisch, Ausgang gemessen): Demo-Szene mit 4-Takt-MELODIE-Clip, MELODIE gewählt, ● kurz vor dem Taktstrich, 16 Takte singen, ● kurz danach.
// Prüft: STIMME 16 Takte, alle gesungenen Takte im Clip, Lage des Gesangs im Clip nach Neustart der Szene. node n4-vs-l-qa-mel.mjs [pb] [pa] [file]
import {start, sing, melN, prep, fire, waitBeat, idle, stInfo, sungBarHeard, NEW, sleep} from './n4-vs-l-qa-h.mjs';
const pb = +(process.argv[2] || 0.5), pa = +(process.argv[3] || 0.5), file = process.argv[4] || NEW, bars = 16;
const H = await start(file, 120, {demo: true}), p = H.p, spb = 0.5;
await p.evaluate(() => SYNQUENZER.setClip(5, 0, {len: 4, notes: [{t: 0, d: 1, n: 60, v: .8}, {t: 8, d: 1, n: 64, v: .8}]}));
const k = await prep(H, sing(melN(bars), 120, 7));
await p.evaluate(() => { SYNQUENZER.launchScene(0); SYNQUENZER.selectSlot(5, 0); SYNQUENZER.play(); });
const B = 16;
await waitBeat(p, B - pb - 0.05); await fire(H, k, B);
await waitBeat(p, B - pb); await p.evaluate(() => SYNQUENZER.rec()); await sleep(80);
const rs = await p.evaluate(() => { const r = SYNQUENZER.runtime().rec; return {state: r.state, startBeat: r.startBeat}; });
await waitBeat(p, B + 4 * bars + pa); await p.evaluate(() => SYNQUENZER.rec());
await waitBeat(p, B + 4 * bars + pa + 3); await idle(p);
const r = await stInfo(p, 0);
console.log('● bei', B - pb, JSON.stringify(rs));
console.log('STIMME:', JSON.stringify({len: r.len, audio: r.audio && {in: r.audio.in, out: r.audio.out, at: r.audio.at}, takeSec: r.takeSec, cstart: r.cstart, mel: r.mel}));
const rows = []; for (let j = 0; j < bars; j++) { const h = await sungBarHeard(p, r, r.cstart, B + 4 * j, B + 4 * j + 4, spb); rows.push([j + 1, h.played, h.db]); }
console.log('gesungene Takte [Takt, Anteil, dBFS]:', JSON.stringify(rows));
// Neustart der Szene, Ausgang im Audio-Faden mitschneiden (nur STIMME hörbar), Einsatz des Gesangs gegen den Taktstrich messen
await p.evaluate(async () => { SYNQUENZER.stop(); const st = SYNQUENZER.tkInfo().stimme; for (let t = 0; t < 8; t++) if (t !== st) try { SYNQUENZER.setMute(t, true); } catch (e) {}
  const ctx = window.__ctx, code = `class C extends AudioWorkletProcessor { process(i) { const x = i[0] && i[0][0]; if (x) this.port.postMessage([currentTime, x.slice()]); return true; } } registerProcessor('qacap', C);`;
  await ctx.audioWorklet.addModule('data:application/javascript;base64,' + btoa(code));
  const w = new AudioWorkletNode(ctx, 'qacap', {numberOfInputs: 1, numberOfOutputs: 0, channelCount: 1, channelCountMode: 'explicit'}); window.__cap = []; w.port.onmessage = e => window.__cap.push(e.data);
  for (const n of window.__outs) { try { n.connect(w); } catch (e) {} } window.__w = w; });
await sleep(300);
await p.evaluate(() => { SYNQUENZER.launchScene(0); SYNQUENZER.play(); });
await waitBeat(p, 6); 
const on = await p.evaluate(() => { const c = SYNQUENZER.vsClock(), st = SYNQUENZER.tkInfo().stimme, cs = SYNQUENZER.runtime().cstart[st], sr = window.__ctx.sampleRate, ol = c.outLat;
  const T0 = c.start + cs * c.spb; let t0 = null; const W = Math.round(sr * 0.005); let acc = [], tt = [];
  for (const [t, x] of window.__cap) { for (let i = 0; i < x.length; i++) { acc.push(x[i]); tt.push(t + i / sr); } }
  let onset = null; for (let i = 0; i + W < acc.length; i += W) { let s = 0; for (let j = 0; j < W; j++) s += acc[i + j] * acc[i + j]; const db = 10 * Math.log10(s / W + 1e-20); if (tt[i] >= T0 - 0.05 && db > -40) { onset = tt[i]; break; } }
  return {cs, barT: +T0.toFixed(4), onsetT: onset && +onset.toFixed(4), lateMs: onset != null ? Math.round((onset - T0) * 1000) : null}; });
console.log('Ausgang nach Neustart: Takt-Anfang', on.barT, 's, Gesang setzt ein', on.onsetT, 's → ' + on.lateMs + ' ms nach dem Taktstrich (gesungen auf dem Taktstrich)');
await p.evaluate(() => SYNQUENZER.stop());
console.log('Fehler:', JSON.stringify(H.errs.slice(0, 3)));
await H.close();
