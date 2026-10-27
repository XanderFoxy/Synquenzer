// QA VS5b (tester): real fake-mic sung take → editor via touch (default Dehnen 70 %) → chip 1/8 → heard output captured;
// N7V-28 on the recording (20 ms bit-identical, slice length ±1 ms found independently), heard == rendered, pitch kept,
// no dropouts inside stretched slices, M-KLICK heard vs. heard original, lyrics via [Text] on the sung take
import {launch, open5, sleep, writeWav, micOn, waitBeat, idle, OUT, SR, mKlick, findBlock, rmsDbR} from './v3-vs5b-h.mjs';
import {recStart, recStop} from './v3-qa-vs5a-h2.mjs';
import {voice} from '../vs-dsp/test-signals.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const seed = +(process.argv[2] || 5);
// sung phrase: near-legato syllables on eighths at 120 bpm with human offsets ±10…45 ms
const notes = []; const F = [196, 220, 247, 262, 294, 262, 247, 220];
const OFF = [22, -31, 14, 40, -18, 27, -42, 11, 35, -25, 19, -12, 44, -36, 9, 30];
for (let k = 0; k < 64; k++) { const t = 0.25 + k * 0.25 + OFF[(k + seed) % 16] / 1000; notes.push({t, d: 0.215, f0: F[k % 8], vowel: 'aeiou'[k % 5], cons: k % 4 === 0}); }
const v = voice(SR, 16.5, notes, {seed}).x;
const wav = OUT + '/qab5b-sung-' + seed + '.wav'; writeWav(wav, v, SR);
const br = await launch(wav);
const H = await open5(br, {touch: true}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); });
await sleep(300);
await micOn(p);
await p.evaluate(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); SYNQUENZER.setRecOptions({countIn: 0, length: 2}); SYNQUENZER.selectSlot(0, 2); });
await p.evaluate(() => SYNQUENZER.play());
await waitBeat(p, 3.5); await p.evaluate(() => SYNQUENZER.rec());
await waitBeat(p, 12.8); await idle(p);
await p.evaluate(() => SYNQUENZER.stop());
await p.evaluate(() => SYNQUENZER.stimmeStop && SYNQUENZER.stimmeStop());
const I0 = await p.evaluate(() => SYNQUENZER.tkInfo()), st = I0.stimme;
const c = st >= 0 ? await p.evaluate(t => SYNQUENZER.getClip(t, 2), st) : null;
ok(c && c.audio, 'take recorded from the fake mic: ' + JSON.stringify(c && c.audio));
const id = c.audio.take;
// open the editor by touch
await p.evaluate(st => { SYNQUENZER.selectSlot(st, 2); return SYNQUENZER.tkSheet({t: st, s: 2}); }, st); await sleep(300);
await (await p.$('.tksheet button[data-a="wp"]')).tap(); await sleep(600);
await p.waitForFunction(id => ((SYNQUENZER.wpInfo(id).marks || SYNQUENZER.wpInfo(id).det) || []).length > 0, id, {timeout: 20000});
const md = await p.evaluate(() => [...document.querySelectorAll('#wpSheet .wpmode button')].map(b => b.dataset.m + (b.classList.contains('on') ? '*' : '')).join('|'));
const sl = await p.evaluate(() => document.querySelector('#wpSheet .qrow input[type=range]').value);
ok(/stretch\*/.test(md) && sl === '70', 'editor opens on the sung take with Dehnen on, 70 % (' + md + ', ' + sl + ')');
const u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
await (await p.$('#wpSheet .qchips button[data-v="1/8"]')).tap(); await sleep(300);
const Y = await p.evaluate(id => SYNQUENZER.wpPlayed(id), id);
const I = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
ok(I.warp && I.warp.mode === 'stretch' && Math.abs(I.warp.strength - 0.7) < 1e-9 && await p.evaluate(() => SYNQUENZER.undoInfo().n) === u0 + 1 && !Y.raw, 'tap 1/8 → Dehnen 70 %, one undo, played = rendered: ' + JSON.stringify(I.last));
const TSR = Y.sr || SR;
const raw = Float32Array.from(await p.evaluate(id => SYNQUENZER.tkBufRange(id), id)), y = Float32Array.from(Y.data);
const src = I.warp.map.src.slice(1, -1), dst = I.warp.map.dst.slice(1, -1);
console.log('  sr', TSR, 'marks', src.length, 'raw', raw.length, 'y', y.length, 'warn', JSON.stringify(I.warn));
// N7V-28: 20 ms bit-identical after each mark + slice length ±1 ms (block search)
const L20 = Math.round(0.02 * TSR); let bit = 0; const pos = [];
src.forEach((s, k) => { const S0 = Math.round(s * TSR), D0 = Math.round(dst[k] * TSR); let same = true; for (let j = 0; j < L20; j++) if (y[D0 + j] !== raw[S0 + j]) { same = false; break; } if (same) bit++; pos.push(findBlock(y, raw, S0, D0, L20, 9600)); });
ok(bit === src.length, 'N7V-28 (fake mic): first 20 ms after each mark bit-identical ' + bit + '/' + src.length);
let worst = 0; for (let k = 1; k < pos.length; k++) { if (pos[k] < 0 || pos[k - 1] < 0) { worst = 1e9; continue; } const want = Math.round(dst[k] * TSR) - Math.round(dst[k - 1] * TSR); worst = Math.max(worst, Math.abs(pos[k] - pos[k - 1] - want)); }
ok(worst <= TSR * 0.001, 'N7V-28 (fake mic): length per slice ±1 ms (independent block search): worst ' + (worst / TSR * 1000).toFixed(3) + ' ms');
// pitch kept + no dropout in the middle of stretched slices
function acPitch(x, a, n) { let best = -1, bl = 0; for (let l = Math.floor(TSR / 400); l < Math.floor(TSR / 150); l++) { let s = 0, e1 = 0, e2 = 0; for (let i = a; i < a + n; i++) { s += x[i] * x[i + l]; e1 += x[i] * x[i]; e2 += x[i + l] * x[i + l]; } const r = s / Math.sqrt(e1 * e2 + 1e-20); if (r > best) { best = r; bl = l; } } return {f: TSR / bl, r: best}; }
let pW = 0, dW = 0, nS = 0; const devs = [];
for (let k = 0; k + 1 < src.length; k++) {
  const ls = src[k + 1] - src[k], ld = dst[k + 1] - dst[k]; if (ls < 0.12) continue;
  for (const u of [0.35, 0.5, 0.65]) {
    const ts = src[k] + 0.04 + u * (ls - 0.09), td = dst[k] + 0.04 + u * (ld - 0.09);
    const lr = rmsDbR(raw, Math.round(ts * TSR), Math.round((ts + 0.01) * TSR)), lyv = rmsDbR(y, Math.round(td * TSR), Math.round((td + 0.01) * TSR));
    if (lr < -40) continue;
    nS++; dW = Math.min(dW, lyv - lr); devs.push(+(lyv - lr).toFixed(2));
    const pr = acPitch(raw, Math.round(ts * TSR), 1024), py = acPitch(y, Math.round(td * TSR), 1024);
    if (pr.r > 0.8) pW = Math.max(pW, Math.abs(1200 * Math.log2(py.f / pr.f)));
  }
}
ok(nS > 10 && dW >= -3, 'no dropout inside stretched slices (10-ms level vs. source position): worst ' + dW.toFixed(2) + ' dB over ' + nS + ' points');
ok(pW < 20, 'pitch kept in stretched slices: worst ' + pW.toFixed(1) + ' cent');
// heard: capture output (Dehnen and A/B original), align with rendered/raw, residual
async function heard(sec) {
  await recStart(p);
  await p.evaluate(st => { const P = SYNQUENZER.project(); P.tracks.forEach((t, i) => { if (i !== st) for (let s = 0; s < 8; s++) { try { SYNQUENZER.setClip(i, s, null); } catch (e) {} } }); SYNQUENZER.launchScene(2); SYNQUENZER.play(); }, st);
  await sleep(sec * 1000);
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(150);
  const r = await recStop(p); return {y: Float32Array.from(r.y), sr: r.sr};
}
function align(cap, ref, from, len) {
  // coarse: 1-ms envelope correlation; fine: sample level ±3 ms; gain by least squares; residual dB
  const ms = Math.round(TSR / 1000), env = (x) => { const n = Math.floor(x.length / ms), e = new Float32Array(n); for (let k = 0; k < n; k++) { let s = 0; for (let i = k * ms; i < (k + 1) * ms; i++) s += x[i] * x[i]; e[k] = Math.sqrt(s / ms); } return e; };
  const ec = env(cap), er = env(ref), f0 = Math.round(from * 1000), L = Math.round(len * 1000);
  let bl = 0, bs = -1; for (let lag = -200; lag <= 4000; lag++) { let s = 0; for (let k = f0; k < f0 + L; k++) { const j = k + lag; if (j >= 0 && j < ec.length) s += er[k] * ec[j]; } if (s > bs) { bs = s; bl = lag; } }
  let best = null; for (let d = bl * ms - 3 * ms; d <= bl * ms + 3 * ms; d++) { let xy = 0, xx = 0; for (let i = Math.round(from * TSR); i < Math.round((from + len) * TSR); i++) { const j = i + d; if (j < 0 || j >= cap.length) continue; xy += ref[i] * cap[j]; xx += ref[i] * ref[i]; } const gn = xy / (xx + 1e-20); let e = 0, er2 = 0; for (let i = Math.round(from * TSR); i < Math.round((from + len) * TSR); i++) { const j = i + d; if (j < 0 || j >= cap.length) continue; const r = cap[j] - gn * ref[i]; e += r * r; er2 += cap[j] * cap[j]; } const res = 10 * Math.log10(e / (er2 + 1e-20)); if (!best || res < best.res) best = {d, gn, res}; }
  return best;
}
const inn = c.audio.in || 0;
console.log('  pos', pos.map((v,k)=>v-Math.round(dst[k]*TSR)).join(' '));
console.log('  devs', devs.join(' '));
const e100 = x => { const o = []; for (let i = 0; i + 4410 <= x.length; i += 4410) o.push(rmsDbR(x, i, i + 4410).toFixed(0)); return o.join(' '); };
console.log('  y env', e100(y));
const hs = await heard(4.6);
console.log('  heard env', e100(hs.y));
const A1 = align(hs.y, y, inn + 0.1, 3.6);
ok(hs.sr === TSR && A1 && A1.res < -25, 'heard Dehnen output = rendered version (residual ' + (A1 && A1.res.toFixed(1)) + ' dB, gain ' + (A1 && A1.gn.toFixed(3)) + ', lag ' + (A1 && A1.d) + ')');
await p.evaluate(() => SYNQUENZER.wpAB(true)); await sleep(100);
const ho = await heard(4.6);
const A0 = align(ho.y, raw, inn + 0.1, 3.6);
ok(A0 && A0.res < -25, 'heard A/B original = raw take (residual ' + (A0 && A0.res.toFixed(1)) + ' dB)');
await p.evaluate(() => SYNQUENZER.wpAB(false));
// M-KLICK on heard signals; attacks = consonant/vowel onsets (marks) at their heard positions
const atS = dst.map(t => (t - inn) + A1.d / TSR + inn), atO = src.map(t => (t - inn) + A0.d / TSR + inn);
const ex = a => a.flatMap(t => [t, t + 0.003, t + 0.006, t + 0.009, t + 0.012, t + 0.015, t + 0.018, t + 0.021, t + 0.024, t + 0.027, t + 0.030, t + 0.033, t + 0.036, t + 0.039, t + 0.042]);
const k1 = mKlick(hs.y, ex(dst.map(t => t + A1.d / TSR)), TSR), k0 = mKlick(ho.y, ex(src.map(t => t + A0.d / TSR)), TSR);
ok(k1.worst <= Math.max(6, k0.worst + 1), 'M-KLICK heard Dehnen ' + JSON.stringify(k1) + ' vs heard original ' + JSON.stringify(k0));
// lyrics via [Text] on the sung take
await (await p.$('#wpSheet .wptx')).tap(); await sleep(250);
await (await p.$('.pop.wplyr input')).fill('Lie-be ist ein Feu-er'); await (await p.$('.pop.wplyr button[data-a="ok"]')).tap(); await sleep(250);
const LG = await p.evaluate(() => SYNQUENZER.wpLyrGeom()), mk = await p.evaluate(id => { const i = SYNQUENZER.wpInfo(id); return (i.marks || i.det).length; }, id);
ok(LG && LG.filter(o => !o.extra).length === mk && LG.slice(0, 6).map(o => o.text).join(' ') === 'Lie be ist ein Feu er' && LG.slice(6).every(o => o.text === '·'), 'lyrics on the sung take: 6 syllables then "·" for the other ' + (mk - 6) + ' marks');
ok(!H.errs.length, 'no console errors ' + JSON.stringify(H.errs.slice(0, 3)));
const nw = H.reqs.filter(r => !/^(blob|data|file):/.test(r.u));
ok(!nw.length, 'no network requests (' + nw.length + ')');
await br.close();
console.log(fail ? 'FAIL ' + fail : 'ALL OK');
