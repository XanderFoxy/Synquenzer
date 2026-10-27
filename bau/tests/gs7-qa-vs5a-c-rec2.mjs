// QA VS5a C: persistence (save → reload from storage) and the FIRST playback after reload: is the quantized version heard from the first click?
// plus: switch while playing on a continuous tone (drop-out), M-KLICK
import {launch, open5, sleep, clicks, toI16, mKlick, onsets20, deq} from './gs7-v3-qa-vs5a-h2.mjs';
import {recStart, recStop} from './v3-vs5afix2-rec.mjs';
import require_fs from 'fs'; const QO = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/gs7/qa-vs5a';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const br = await launch(null);
const ctx = await br.newContext({viewport: {width: 390, height: 844}});
let H = await open5(br, {ctx}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); }); await sleep(300);
const OFF = [12, -18, 30, -8, 45, -40, 20, 0, 22, -26, 15, -5, 35, -12, 8, -30];
const T = OFF.map((o, k) => 0.5 + k * 0.25 + o / 1000), x = clicks(T, 4.6);
const r = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 2}), toI16(x));
const id = r.id;
await p.evaluate(id => SYNQUENZER.wpQuantize(id, {grid: '1/16', strength: 1}), id);
const W = (await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).warp;
console.log('t0', W.t0, 'dst', W.map.dst.slice(1, 5).join(' '));
const P1 = await p.evaluate(() => SYNQUENZER.project());
const sv = await p.evaluate(() => SYNQUENZER.save()); await sleep(1500);
ok(sv, 'save() → ' + sv);
// first play in this session (render is cached) – reference
const play = async () => {
  await recStart(p);
  await p.evaluate(() => SYNQUENZER.launchScene(0)); await sleep(1800);
  const clk = await p.evaluate(() => SYNQUENZER.vsClock());
  const R = await recStop(p); await p.evaluate(() => SYNQUENZER.stop()); await sleep(400);
  const y = Float32Array.from(R.y), on = onsets20(y, R.sr).map(t => t + R.f0 / R.sr);
  return on.map(t => +(((t - clk.start) - 0) * 1000).toFixed(1)).filter(v => v > 0 && v < 1700);
};
const ref = await play();
console.log('same session, onsets after scene start (ms):', ref.join(' '));
// reload (same browser context = same IndexedDB)
await p.close();
H = await open5(br, {ctx}); p = H.p; await sleep(1500);
const P2 = await p.evaluate(() => SYNQUENZER.project());
ok(deq(P1, P2), 'reload from storage: project deep-equal (marks + warp kept)');
await p.waitForFunction(id => SYNQUENZER.tkBufRange(id, 0, 1), id, {timeout: 20000}).catch(() => {});
const I = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
console.log('after reload: cached', I.cached, 'ready', I.ready, 'renders', I.renders);
const first = await play();
console.log('after reload, FIRST play, onsets (ms):', first.join(' '));
const dev = first.slice(0, 6).map((v, k) => +(v - (ref[k] || NaN)).toFixed(1));
console.log('first play − reference (ms):', dev.join(' '));
ok(dev.length >= 4 && dev.every(d => Math.abs(d) <= 1), 'first playback after reload is already the quantized version (first 6 clicks within 1 ms of the reference)');
const second = await play();
console.log('after reload, second play (ms):', second.join(' '));
// ---- switch while playing on a continuous tone
const n = Math.round(48000 * 4.6), xs = new Float32Array(n); let ph = 0;
const TT = [0.5, 0.762, 0.98, 1.27, 1.49, 1.77, 2.01, 2.24, 2.52, 2.75, 3.03, 3.23];
for (let i = 0; i < n; i++) { const t = i / 48000; let k = 0; for (let j = 0; j < TT.length; j++) if (t >= TT[j]) k = j; ph += 2 * Math.PI * [220, 247, 262, 294][k % 4] / 48000; let v = 0; for (let h = 1; h <= 5; h++) v += Math.sin(h * ph) / h; xs[i] = 0.2 * v * Math.min(1, t / 0.02, (4.6 - t) / 0.02); }
const r2 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 1, len: 2}), toI16(xs));
await p.evaluate(id => SYNQUENZER.wpDetect(id), r2.id);
await recStart(p);
await p.evaluate(() => SYNQUENZER.launchScene(1)); await sleep(1300);
const tSw = await p.evaluate(async id => { const t = window.__ctx.currentTime; await SYNQUENZER.wpQuantize(id, {grid: '1/8', strength: 1}); return t; }, r2.id);
await sleep(1500);
const R = await recStop(p); await p.evaluate(() => SYNQUENZER.stop());
const y = Float32Array.from(R.y), sr = R.sr, i0 = Math.round(tSw * sr) - R.f0, W5 = Math.round(0.005 * sr);
const lv = c => { let s = 0; for (let i = c; i < c + W5; i++) s += (y[i] || 0) ** 2; return 10 * Math.log10(s / W5 + 1e-14); };
const base = []; for (let d = -800; d < -20; d++) base.push(lv(i0 + Math.round(d * sr / 1000))); base.sort((a, b) => a - b);
let worst = 99, at = 0; for (let d = -20; d < 600; d++) { const v = lv(i0 + Math.round(d * sr / 1000)) - base[Math.floor(base.length * 0.02)]; if (v < worst) { worst = v; at = d; } }
console.log('continuous tone: level 2 % quantile before', base[Math.floor(base.length * 0.02)].toFixed(1), 'dB; worst after switch', worst.toFixed(1), 'dB at +' + at, 'ms');
ok(worst >= -3, 'switch while playing (continuous tone): no drop-out deeper than 3 dB below the quietest 2 % before');
const ks = mKlick(y.subarray(i0 - Math.round(0.2 * sr), i0 + Math.round(0.6 * sr)), [], sr), kr = mKlick(y.subarray(i0 - Math.round(1.0 * sr), i0 - Math.round(0.2 * sr)), [], sr);
ok(ks.worst <= Math.max(6, kr.worst + 1), 'switch while playing: M-KLICK ' + JSON.stringify(ks) + ' vs before ' + JSON.stringify(kr));
{ const a = i0 - Math.round(0.2 * sr) + Math.round(ks.at * sr); let mj = 0, mi = 0; for (let i = a - 600; i < a + 600; i++) { const d = Math.abs(y[i] - y[i - 1]); if (d > mj) { mj = d; mi = i; } }
  let typ = 0; for (let i = i0 - Math.round(0.5 * sr); i < i0 - Math.round(0.1 * sr); i++) typ = Math.max(typ, Math.abs(y[i] - y[i - 1]));
  console.log('largest sample step near the click', mj.toFixed(4), 'at', ((mi - i0) / sr * 1000).toFixed(2), 'ms after the switch call; largest step in steady tone before', typ.toFixed(4));
  console.log('samples around it:', Array.from(y.subarray(mi - 8, mi + 8)).map(v => v.toFixed(3)).join(' '));
  require_fs.writeFileSync(QO + '/c-switch.json', JSON.stringify({sr, i0, y: Array.from(y.subarray(i0 - sr, i0 + sr))})); }
ok(!H.errs.length, 'no console errors ' + JSON.stringify(H.errs.slice(0, 3)));
await br.close();
console.log(fail ? 'FAIL ' + fail : 'ALL OK');
