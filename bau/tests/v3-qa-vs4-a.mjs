// QA VS4 A: real fake-mic (sung WAV) on the SPEAKER route, with/without loopback echo of the app's music.
// node v3-qa-vs4-a.mjs <echo0|noecho|sat6|wired> [run]
import {launch, open, micOn, idle, sleep, writeWav, resample, measure, deq, DIR} from './v3-qa-vs4-h.mjs';
import {renderVoice} from './v3-vs2-corpus.mjs';
const MODE = process.argv[2] || 'echo0', RUN = process.argv[3] || '1';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const SR = 44100, BPM = 120, SB = 0.5;
// 4-bar period (8 s): one beat sung, one beat rest
const MEL = [[0, 1, 57], [2, 1, 60], [4, 1, 64], [6, 1, 62], [8, 1, 60], [10, 1, 64], [12, 1, 59], [14, 1, 57]];
const LEG = MODE.startsWith('legato'), v16 = renderVoice(LEG ? MEL.map(([b, d, m], k) => ({on: 0.05 + b * SB, dur: 2 * SB, midi: m, legato: k > 0, rest: 0})) : MEL.map(([b, d, m], k) => ({on: 0.05 + b * SB, dur: d * SB, midi: m, legato: false, rest: k ? 0.1 : 0})), {voice: 'male', seed: 11, sigma: 10, vib: [20, 40], bpm: BPM}).x;
const v = resample(v16, 16000, SR), P = SR * 8, y = new Float32Array(P);
let pk = 0; for (let i = 0; i < Math.min(P, v.length); i++) pk = Math.max(pk, Math.abs(v[i]));
for (let i = 0; i < Math.min(P, v.length); i++) y[i] = v[i] * 0.3 / pk;
let vs = 0, vc = 0, va = 0; for (const s of y) { va += s * s; if (Math.abs(s) > 0.015) { vs += s * s; vc++; } } const vRmsDb = 10 * Math.log10(vs / vc), vWholeDb = 10 * Math.log10(va / P);
let seed = 9; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 - 0.5; };
const nAmp = Math.sqrt(vs / vc) * 0.01 * 3.46, x = new Float32Array(P); for (let i = 0; i < P; i++) x[i] = y[i] + nAmp * rnd();   // SNR 40 dB
const WAV = DIR + `/a-${MODE}.wav`; writeWav(WAV, x, SR);
const br = await launch(WAV), H = await open(br), p = H.p;
const route = MODE === 'wired' || MODE === 'legato' ? 'wired' : 'speaker';
const mic = await micOn(p, route);
ok(mic.sr === SR && await p.evaluate(() => window.__gum === 1 && !!window.__mic), `real getUserMedia (fake device, WAV) running, sr ${mic.sr}, route ${route}, alignment D ${mic.D && mic.D.toFixed(2)} ms`);
await p.evaluate(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); window.__tap(); });
// music level at the output (scene 1 + 2 alternate) → loop gain for the wanted music-to-voice ratio
await p.evaluate(() => { SYNQUENZER.selectSlot(0, 3); SYNQUENZER.play(); });
const lv = []; for (let k = 0; k < 12; k++) { await sleep(250); lv.push(await p.evaluate(() => window.__lvl().rmsDb)); }
await p.evaluate(() => SYNQUENZER.stop()); await sleep(400);
const mRmsDb = lv.reduce((s, v) => s + v, 0) / lv.length;
const FANG = MODE.startsWith('fang') || MODE === 'sat6', tgt = MODE === 'echoM3' ? -3 : MODE === 'echo0' || MODE === 'fang0' ? 0 : MODE === 'sat6' ? 6 : MODE === 'fang6' ? 6 : null;
if (tgt != null) { const HP = process.env.HP ? +process.env.HP : 250, g = Math.pow(10, (vWholeDb + tgt - mRmsDb) / 20) * (HP ? (+process.env.HPC || 1.6) : 1); await p.evaluate(([g, sat, hp]) => window.__loop(0.012, g, sat, hp), [g, MODE === 'sat6' ? 1 : 0, HP]); console.log(`  loop gain ${g.toFixed(3)} (music ${mRmsDb.toFixed(1)} dB, voice whole ${vWholeDb.toFixed(1)} dB / voiced ${vRmsDb.toFixed(1)}, target ${tgt} dB, HP ${HP})`); }
const req0 = H.reqs.length;
let scene = 3, res = null;
if (FANG) {
  await p.evaluate(() => { SYNQUENZER.selectSlot(0, 3); SYNQUENZER.play(); });
  await p.waitForFunction(() => { const c = SYNQUENZER.vsClock(); return c.playing && (c.now - c.outLat - c.start) / c.spb >= 16.5; }, null, {timeout: 60000, polling: 20});
  ok(await p.evaluate(() => SYNQUENZER.vsFang({beat: 16.5})), 'Stimme-FANG accepted');
  await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy, null, {timeout: 60000});
  res = await p.evaluate(() => SYNQUENZER.vsResult()); scene = res && res.scene;
  const cn = await p.evaluate(() => SYNQUENZER.clNotesInfo());
  ok(cn && cn.way === '1E', 'N7V-25 notes path = 1E: ' + JSON.stringify(cn));
  const det = (res && res.notes || []).map(n => n.n), exp = MEL.map(m => m[2]);
  // LCS against the cyclic melody (any rotation), expected count = 2 notes per bar of the result
  const bars = res ? Math.round((res.len || res.bars || 4)) : 4; let bestL = 0;
  for (let r0 = 0; r0 < exp.length; r0++) { const e = []; for (let k = 0; k < bars * 2; k++) e.push(exp[(r0 + k) % exp.length]); const L = Array.from({length: det.length + 1}, () => new Array(e.length + 1).fill(0)); for (let i = 1; i <= det.length; i++) for (let j = 1; j <= e.length; j++) L[i][j] = det[i - 1] === e[j - 1] ? L[i - 1][j - 1] + 1 : Math.max(L[i - 1][j], L[i][j - 1]); bestL = Math.max(bestL, L[det.length][e.length]); }
  const Pr = det.length ? bestL / det.length : 0, Rc = bestL / (bars * 2), F = Pr + Rc ? 2 * Pr * Rc / (Pr + Rc) : 0;
  ok(F >= 0.85, `N7V-22 notes under +6 dB saturated speaker echo: detected [${det.join(',')}] bars ${bars}, F ${F.toFixed(3)} (>= 0.85)`);
  await p.evaluate(() => SYNQUENZER.vsResultOk());
} else {
  await p.evaluate(() => { SYNQUENZER.setRecOptions({countIn: 0, length: 4}); SYNQUENZER.selectSlot(0, 3); SYNQUENZER.play(); });
  await sleep(400); await p.evaluate(() => SYNQUENZER.rec()); await sleep(10500);
}
let sawQuiet = false;
for (let k = 0; k < 160; k++) { const q = await p.evaluate(() => ({q: SYNQUENZER.tkInfo().quiet, s: SYNQUENZER.tkInfo().stQuiet})); if (q.q.includes('clean') && q.s > 0) { sawQuiet = true; break; } await sleep(25); }
await p.waitForFunction(() => SYNQUENZER.tkInfo().stimme >= 0 && !SYNQUENZER.tkInfo().pend.length && SYNQUENZER.tkInfo().writes === 0, null, {timeout: 60000});
await p.evaluate(() => SYNQUENZER.stop()); await idle(p);
const st = await p.evaluate(() => SYNQUENZER.tkInfo().stimme), c = await p.evaluate(([t, s]) => SYNQUENZER.getClip(t, s), [st, scene]), id = c && c.audio && c.audio.take;
const meta = await p.evaluate(id => SYNQUENZER.takes()[id], id);
if (route === 'speaker') ok(meta && meta.route === 'speaker' && meta.cl === 60 && meta.rf === Math.round(0.02 * meta.sr), 'speaker take: cl 60, rf 20 ms: ' + JSON.stringify(meta));
else ok(meta && meta.route === 'wired' && !meta.cl && !meta.rf, 'headphone take raw 0 %: ' + JSON.stringify(meta));
if (route === 'speaker') { await p.evaluate(id => SYNQUENZER.clWait(id), id); ok(sawQuiet, 'N2-VS1-02: network quiet while cleaning'); }
const ref = route === 'speaker' ? await p.evaluate(id => SYNQUENZER.clRefRange(id), id) : null;
if (ref) { let e = 0; for (const r of ref) e += (r / 32767) ** 2; console.log('  reference RMS', (10 * Math.log10(e / ref.length)).toFixed(1), 'dBFS'); }
const pair = async () => p.evaluate(async id => { const r = await SYNQUENZER.tkPcmRange(id); return {raw: r.map(v => v / 32767), cl: SYNQUENZER.clPlayRange(id), info: SYNQUENZER.clInfo(id)}; }, id);
const doM = async lab => { const t = await pair(); const m = measure(t.raw, t.cl, y, SR); m.wholeEchoDb = +(-m.sdrRaw).toFixed(1); console.log(`  ${lab}:`, JSON.stringify(m), 'info', JSON.stringify(t.info.info)); return {m, info: t.info}; };
if (process.env.SLIP) { const t = await pair(); const m = measure(t.raw, t.cl, y, SR), off = Math.round(m.offMs / 1000 * SR), W = Math.round(0.5 * SR), L = Math.round(0.03 * SR), out = [];
  for (let a = 0; a + W <= t.raw.length; a += W) { let best = -1e30, bl = 0, e = 0; for (let i = a; i < a + W; i++) { let k = ((i - off) % P + P) % P; e += y[k] * y[k]; } if (e < 1) { out.push('-'); continue; } for (let l = -L; l <= L; l++) { let s2 = 0; for (let i = a; i < a + W; i += 2) { let k = ((i - off - l) % P + P) % P; s2 += y[k] * t.raw[i]; } if (s2 > best) { best = s2; bl = l; } } out.push(bl); }
  console.log('  local lag (samples) per 0.5 s:', out.join(' ')); }
let r60 = null;
if (route === 'speaker') r60 = await doM('60 %');
await p.evaluate(id => SYNQUENZER.clSet(id, 100), id); await p.evaluate(id => SYNQUENZER.clWait(id), id);
const r100 = await doM('100 %');
if (process.env.CORE && ref) {
  const b64 = a => Buffer.from(new Float32Array(a).buffer).toString('base64'), unb = s => new Float32Array(Buffer.from(s, 'base64').buffer.slice(0));
  const t = await pair(), refF = ref.map(v => v / 32767);
  const hp = (a, fc) => { const RC = 1 / (2 * Math.PI * fc), dt = 1 / SR, al = RC / (RC + dt); let out = new Float32Array(a.length); for (let pass = 0; pass < 4; pass++) { const src = pass ? out.slice() : Float32Array.from(a); let yp = 0, xp = 0; const o = new Float32Array(a.length); for (let i = 0; i < a.length; i++) { const j = pass % 2 ? a.length - 1 - i : i; yp = al * (yp + src[j] - xp); xp = src[j]; o[j] = yp; } out = o; } return out; };
  for (const [lab, o] of [['notes 1E', {way: 'notes'}], ['hear 60', {amount: 0.6}], ['hear 100', {amount: 1}]]) {
    const r = await p.evaluate(([m, rf, o]) => SYNQUENZER.clCore(m, rf, 44100, o), [b64(t.raw), b64(refF), o]);
    const yv = unb(r.y), m = measure(t.raw, yv, y, SR);
    // SDR above 200 Hz (excludes the intentional 80 Hz HP): filter cleaned and aligned voice alike
    const yy = new Float32Array(t.raw.length); const off = Math.round(m.offMs / 1000 * SR); const reps = Math.ceil(t.raw.length / P) + 2; for (let i = 0; i < t.raw.length; i++) { let k = i - off; k = ((k % P) + P) % P; yy[i] = y[k]; }
    const a = hp(yv, 200), b = hp(yy, 200); let pa = 0, pb = 0; for (let i = 0; i < a.length; i++) { pa += a[i] * b[i]; pb += b[i] * b[i]; } const g = pa / pb; let s1 = 0, e1 = 0; for (let i = 0; i < a.length; i++) { s1 += (g * b[i]) ** 2; e1 += (a[i] - g * b[i]) ** 2; }
    console.log(`  core ${lab}: way ${r.info.way} sdr ${m.sdrClean} dB, sdr>200Hz ${(10 * Math.log10(s1 / e1)).toFixed(1)} dB, erle ${m.erleDb}, gain ${m.gClean}`);
  }
}
if (MODE === 'echo0') {
  ok(r60.m.erleDb >= 15, `N7V-21 (app, real mic, 0 dB echo) music in pauses at 60 %: -${r60.m.erleDb} dB (>= 15)`);
  ok(r100.m.erleDb >= 15, `N7V-21 at 100 %: -${r100.m.erleDb} dB (>= 15)`);
  ok(r60.m.sdrClean >= 15 && r100.m.sdrClean >= 15, `N7V-21 SDR vs original voice: 60 % ${r60.m.sdrClean} dB, 100 % ${r100.m.sdrClean} dB (>= 15; raw ${r60.m.sdrRaw})`);
  ok(Math.abs(r60.m.gClean - r60.m.gRaw) < 1 && Math.abs(r100.m.gClean - r100.m.gRaw) < 1, `voice level kept: raw ${r60.m.gRaw}, 60 % ${r60.m.gClean}, 100 % ${r100.m.gClean} dB`);
  ok(r60.m.gapMs <= 50 && r100.m.gapMs <= 50, `no gate: longest gap in sung notes 60 % ${r60.m.gapMs} ms, 100 % ${r100.m.gapMs} ms`);
}
if (MODE === 'noecho') {
  ok(r60.m.sdrClean >= 20 && r100.m.sdrClean >= 20, `speaker route WITHOUT echo: voice SDR 60 % ${r60.m.sdrClean} dB, 100 % ${r100.m.sdrClean} dB (>= 20, raw ${r60.m.sdrRaw})`);
  ok(Math.abs(r100.m.gClean - r100.m.gRaw) < 1, `voice level kept: raw ${r100.m.gRaw} / 100 % ${r100.m.gClean} dB`);
  ok(r60.m.gapMs <= 50 && r100.m.gapMs <= 50, `N7V-23 no gate (speaker, no echo): gaps 60 % ${r60.m.gapMs} ms, 100 % ${r100.m.gapMs} ms`);
  ok(!r60.info.info.hint && !r100.info.info.hint, 'no crosstalk hint without echo: ' + JSON.stringify(r100.info.info));
}
if (MODE === 'legatoS') ok(r60.m.sdrClean >= 20, `legato, SPEAKER route default 60 % (no echo): SDR ${r60.m.sdrClean} dB (>= 20), voice gain ${r60.m.gClean} dB; 100 %: ${r100.m.sdrClean} dB / ${r100.m.gClean} dB`);
if (MODE === 'legato') { ok(r100.m.sdrClean >= 20 && r100.m.gapMs <= 50, `N7V-23 legato phrase without rests (headphones, SNR 40, 100 %): SDR ${r100.m.sdrClean} dB (>= 20), voice gain ${r100.m.gClean} dB, longest gap ${r100.m.gapMs} ms`); await p.evaluate(id => SYNQUENZER.clSet(id, 60), id); await p.evaluate(id => SYNQUENZER.clWait(id), id); const r6 = await doM('60 %'); ok(r6.m.sdrClean >= 20, `legato at 60 %: SDR ${r6.m.sdrClean} dB, gain ${r6.m.gClean} dB`); }
if (MODE === 'wired') {
  ok(r100.m.sdrClean >= 20 && r100.m.gapMs <= 50, `N7V-23 (headphones, 100 %): SDR ${r100.m.sdrClean} dB (>= 20), gap ${r100.m.gapMs} ms`);
  await p.evaluate(id => SYNQUENZER.clSet(id, 0), id); await sleep(200);
  const h = await p.evaluate(id => SYNQUENZER.clPlayHash(id), id), rawH = await p.evaluate(id => { const f = Float32Array.from(SYNQUENZER.tkBufRange(id)), u = new Uint8Array(f.buffer); let h = 0x811c9dc5; for (let i = 0; i < u.length; i++) { h ^= u[i]; h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16) + ':' + f.length; }, id);
  ok(h === rawH, 'N7V-24: 0 % plays the raw take bit-identical');
}
if (MODE === 'sat6') {
  ok(r60.m.sdrClean >= 10, `N7V-22 SDR (+6 dB tanh) at 60 %: ${r60.m.sdrClean} dB (>= 10), 100 %: ${r100.m.sdrClean}`);
  ok(r60.info.info && r60.info.info.hint, 'crosstalk > 0 dB → hint flag set: ' + JSON.stringify(r60.info.info));
}
if (process.env.ZIP) {
  const hC = await p.evaluate(id => SYNQUENZER.clPlayHash(id), id), z = await p.evaluate(() => SYNQUENZER.tkZipInfo());
  ok(z.files.some(f => f.name === 'takes/' + id + '.ref.wav'), 'ZIP carries the reference: ' + JSON.stringify(z.files.map(f => f.name)));
  const arr = await p.evaluate(() => SYNQUENZER.tkZipBytes()), P0 = await p.evaluate(() => SYNQUENZER.project());
  const H2 = await open(br, {}), q2 = H2.p;
  const im = await q2.evaluate(a => SYNQUENZER.tkImportZip(a), arr); await sleep(1500);
  await q2.evaluate(id => { SYNQUENZER.tkLoadAll(); return SYNQUENZER.clEnsure(id); }, id); await q2.evaluate(id => SYNQUENZER.clWait(id), id);
  const r2 = await q2.evaluate(id => ({h: SYNQUENZER.clPlayHash(id), t: SYNQUENZER.takes()[id], ci: SYNQUENZER.clInfo(id)}), id);
  ok(im.ok && r2.h === hC && r2.t && r2.t.cl === 100 && r2.t.rf === 882, `ZIP round trip into a fresh profile: cleaned version bit-identical (${r2.h === hC}), take ${JSON.stringify(r2.t)}, info ${JSON.stringify(r2.ci.info)}`);
  ok(!H2.errs.length, 'fresh profile: no console errors ' + JSON.stringify(H2.errs.slice(0, 2)));
  // Claude app (sandboxed iframe): import the JSON project, sheet controls disabled, data deep-equal after save
  const fr = DIR + '/frame.html'; (await import('fs')).writeFileSync(fr, `<!doctype html><iframe id="f" src="file://${'/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-br-VS4/index.html'}" sandbox="allow-scripts allow-same-origin" style="width:390px;height:844px;border:0"></iframe>`);
  const J = await p.evaluate(() => SYNQUENZER.serialize()), T0 = await p.evaluate(() => SYNQUENZER.takes());
  const cB = await br.newContext({viewport: {width: 390, height: 844}}), qf = await cB.newPage(), e3 = []; qf.on('pageerror', e => e3.push(String(e))); qf.on('console', m => { if (m.type() === 'error') e3.push(m.text()); });
  await qf.goto('file://' + fr); await sleep(2500);
  const f = qf.frames().find(x => x.url().includes('index.html')); await f.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version);
  await f.evaluate(j => SYNQUENZER.importJSON(j), J); await sleep(600);
  await f.evaluate(() => SYNQUENZER.tkSheet({t: SYNQUENZER.tkInfo().stimme, s: 3})); await sleep(300);
  const sh = await f.evaluate(() => { const b = document.querySelector('.pop.tksheet .clbox'); return b ? {dis: b.querySelector('.clr').disabled, ab: [...b.querySelectorAll('button')].every(x => x.disabled), st: b.querySelector('.clst').textContent} : null; });
  await f.evaluate(() => SYNQUENZER.save()); await sleep(800);
  const J2 = await f.evaluate(() => SYNQUENZER.serialize()), T1 = await f.evaluate(() => SYNQUENZER.takes()), ci = await f.evaluate(id => SYNQUENZER.clInfo(id), id);
  ok(deq(T0, T1) && deq(JSON.parse(J2).takes || null, JSON.parse(J).takes || null) && sh && sh.dis && sh.ab && ci.runs === 0, 'Claude app: speaker take (cl, rf) deep-equal after import+save, controls disabled, no cleaning ' + JSON.stringify({sh, runs: ci.runs}));
  const zi = await f.evaluate(a => SYNQUENZER.tkImportZip(a), arr); await sleep(1200);
  const T2 = await f.evaluate(() => SYNQUENZER.takes()), toast = await f.evaluate(() => [...document.querySelectorAll('.toast, #toast, [class*=toast]')].map(e => e.textContent).join(' | '));
  ok(zi && zi.ok !== false && deq(T2, T0), 'Claude app: ZIP with .wav + .ref.wav imports, takes deep-equal: ' + JSON.stringify({zi, toast: toast.slice(0, 120)}));
  ok(!e3.length, 'Claude app: no console errors ' + JSON.stringify(e3.slice(0, 2)));

}
await sleep(2300);
const q = await p.evaluate(() => SYNQUENZER.tkInfo());
ok(!q.quiet.length && q.stQuiet === 0 && (!q.netLast || q.netLast.total === 0), 'N7V-35: quiet ended, counters 0: ' + JSON.stringify(q.netLast));
ok(H.reqs.slice(req0).every(r => /^(blob|data):/.test(r.u)), `no network requests during recording/cleaning: ${JSON.stringify(H.reqs.slice(req0))}`);
ok(!H.errs.length, 'no console errors ' + JSON.stringify(H.errs.slice(0, 3)));
await br.close();
console.log(fail ? `FAIL ${fail}` : 'ALL OK');
