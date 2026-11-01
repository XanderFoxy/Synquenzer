// VK2 Mäusekino: a small song with two ◆ glides, stills 16:9 + 9:16, probe values vs. the formula, determinism, a short real video
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
import { execSync } from 'child_process';
const DIR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4410/m/';
const APP = process.argv[2] || DIR + 'index.html';
const FD = 'file:///tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/fonts/';
const { buildSong } = await import('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/n5-v-qm-lib.mjs');
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 926, height: 428}});
const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + APP); await p.waitForTimeout(1500);
const ff = [['Barlow Semi Condensed', 'barlow-semi-condensed', [500, 600, 700]], ['JetBrains Mono', 'jetbrains-mono', [500, 700]]];
await p.addStyleTag({content: ff.map(([fam, file, ws]) => ws.map(wt => `@font-face{font-family:"${fam}";font-style:normal;font-weight:${wt};src:url(${FD}${file}-latin-${wt}-normal.woff2) format("woff2")}`).join('')).join('')});
await p.evaluate(async () => { await Promise.all(['700 12px "Barlow Semi Condensed"', '600 12px "JetBrains Mono"', '700 12px "JetBrains Mono"'].map(s => document.fonts.load(s))); await document.fonts.ready; });
await p.mouse.click(5, 300);
await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 15000}).catch(() => {});
const res = {};
res.song = await buildSong(p);
// ◆ glides: SYN 2 (flat engine) scene 1 → scene 2 at bar 7 over 2 bars (cutoff 4 kHz → 300 Hz, resonance up, envelopes longer);
// SYN 4 (MK) scene 1 → scene 2 at bar 7 over 1 bar (cutoff down, resonance up)
res.states = await p.evaluate(() => {
  const Q = SYNQUENZER, out = {eng1: S.tracks[1].sound.engine, eng3: S.tracks[3].sound.engine};
  // drum accents on the snare steps of the drum clip played in bars 3–12 (Schritt-Akzent = the engine's accent flag)
  const dc = S.tracks[4].clips[0]; out.akz = 0; if (dc && dc.notes) for (const n of dc.notes) if (n.n === 38 || n.n === 39) { n.a = 1; out.akz++; }
  if (dc && !out.akz && dc.notes.length) { dc.notes[0].a = 1; out.akz = 1; }
  Q.v6aSetState(1, 0, {p: {cutoff: 4000, res: .15}});
  Q.v6aSetState(1, 1, {p: {cutoff: 300, res: 1.0, aA: .25, aR: 1.4, fD: 1.2, fS: .6}, x: 'bar2'});
  if (S.tracks[3].sound.engine === 'mk') { Q.v6aSetState(3, 0, {p: {'mk.t.0.f.cut': 100, 'mk.t.0.f.res': 20}}); Q.v6aSetState(3, 1, {p: {'mk.t.0.f.cut': 35, 'mk.t.0.f.res': 118}, x: 'bar1'}); }
  // the Regie row: [Mäusekino] is there and a tap sets the entry
  const html = vvDirRow(4, 10, 'x'); out.btn = /data-a="vv-kino"/.test(html) && /Mäusekino/.test(html);
  out.tap = vvDirTap('vv-kino', null, 4, 10); out.of = Q.vvDirOf(4, 10); out.dir = Q.vvDirGet();
  out.cuts = Q.vvCuts({range: {a: 4, b: 10}}).shots.map(s => [s.a, s.b, s.v]);
  out.autoNoKino = (() => { const v = S.song.video; delete S.song.video; const c = Q.vvCuts({range: {a: 0, b: S.song.bars}}).shots.some(s => s.v === 'kino'); S.song.video = v; return !c; })();
  return out;
});
// render bars 5–10 (a = 4, b = 10) twice: the captured glides and the pictures must be equal
const render = () => p.evaluate(async () => { const T0 = performance.now(); const r = await SYNQUENZER.vvRender({range: {a: 4, b: 10}}); return {dur: r.dur, ms: Math.round(performance.now() - T0), lead: VV.last.lead || 0, bpm: VV.last.bpm}; });
res.r1 = await render();
const spb = 60 / res.r1.bpm, T = bars => res.r1.lead + bars * 4 * spb;   // video time of a bar (from bar 5 = index 4)
const times = {vor: T(1.5), mitte: T(3) , ende: T(3.95), nach: T(5.2)};   // bar 7 = 2 bars after the start: glide of SYN 2 over bars 7–8
res.runs = await p.evaluate(() => SYNQUENZER.vk2Runs().map(L => L.filter(x => x.mv.length).map(x => ({i: x.i, t0: x.t0, t1: x.t1, at: x.at, c: x.c, mv: x.mv, st: x.st0 + ' → ' + x.st1}))).filter(L => L.length));
res.probe = {};
for (const [k, t] of Object.entries(times)) res.probe[k] = await p.evaluate(t => { const q = SYNQUENZER.vk2At(t, '16:9'); return {ms: q.ms, bar: q.bar, step: q.step, morph: q.morph, rows: q.rows.map(r => ({i: r.i, kd: r.kd, rms: r.rms, lit: r.lit, held: r.held, cut: r.cut, res: r.res, glow: r.glow, acc: r.acc, morph: r.morph, steps: r.steps ? r.steps.filter(x => x > 0).length : 0, acc8: r.acc8 ? r.acc8.reduce((a, b) => a + b, 0) : 0}))}; }, t);
// the formula check: SYN 2 Ist cutoff during the glide = a·(b/a)^s (log law), s = smoothstep((τ − t0)/(t1 − t0))
res.formel = await p.evaluate(ts => {
  const r = VV.last, L = VK2.cap.get(r.tl)[1], out = [];
  for (const t of ts) {
    const q = SYNQUENZER.vk2At(t, '16:9'), tau = r.t0 + t, g = L.filter(x => x.s <= tau + 1e-9).pop(); if (!g || !q.morph || q.morph.i !== 1) { out.push({t, morph: q.morph}); continue; }
    const x = Math.min(1, Math.max(0, (tau - g.t0) / (g.t1 - g.t0))), s = g.c ? x : x * x * (3 - 2 * x), a = g.a.cutoff, b = g.b.cutoff, want = a * Math.pow(b / a, s);
    out.push({t: +t.toFixed(3), p: q.morph.p, ist: q.morph.ist.fc, want: Math.round(want), ziel: q.morph.ziel.fc, m: g.m.cutoff});
  }
  return out;
}, [0, .25, .5, .75, 1].map(f => T(2) + f * 2 * 4 * spb));
// the MK glide (SYN 4, linear in knob units, 1 bar): Ist cutoff = cutHz(100 + (35 − 100)·s)
res.formelMk = await p.evaluate(ts => {
  const r = VV.last, L = VK2.cap.get(r.tl)[3], out = [];
  for (const t of ts) { const tau = r.t0 + t, g = L.filter(x => x.s <= tau + 1e-9).pop(), K = vk2Knob(vk2Eff(3, g, tau, false)), x = Math.min(1, Math.max(0, (tau - g.t0) / (g.t1 - g.t0))), s = x * x * (3 - 2 * x);
    out.push({t: +t.toFixed(3), m: g.m['mk.t.0.f.cut'], ist: Math.round(K.fc), want: Math.round(vk2Cz(100 + (35 - 100) * s)), res: +K.res.toFixed(3), resWant: +(1.1 * (20 + (118 - 20) * s) / 127).toFixed(3)}); }
  return out;
}, [0, .5, 1].map(f => T(2) + f * 4 * spb));
// accents: hits with the flag in the captured notes, and a picture where one glows
res.akzent = await p.evaluate(() => { const r = VV.last, L = r.nt[4] || []; const a = L.filter(o => o.e.acc).map(o => +o.a.toFixed(3)); let best = null;
  for (const t0 of a.slice(0, 6)) { const q = SYNQUENZER.vk2At(t0 + .02, '16:9'), d = q.rows.find(x => x.i === 4); if (d && d.acc > 0) { best = {t: t0 + .02, acc: d.acc, acc8: d.acc8.reduce((x, y) => x + y, 0)}; break; } }
  return {n: a.length, first: a.slice(0, 4), best}; });
if (res.akzent.best) fs.writeFileSync(DIR + 'vk2-16x9-akzent.png', Buffer.from(await p.evaluate(t => SYNQUENZER.vvShot(t, 'kino', '16:9'), res.akzent.best.t), 'base64'));
// stills (vvShot = the same path as the video frames), 16:9 and 9:16
const shots = [['16x9-vor', times.vor, '16:9'], ['16x9-morph', T(2.9), '16:9'], ['16x9-morph-mk', T(2.45), '16:9'], ['9x16-vor', times.vor, '9:16'], ['9x16-morph', T(2.9), '9:16'], ['9x16-nach', times.nach, '9:16']];
for (const [nm, t, fmt] of shots) { const png = await p.evaluate(([t, fmt]) => SYNQUENZER.vvShot(t, 'kino', fmt), [t, fmt]); fs.writeFileSync(DIR + 'vk2-' + nm + '.png', Buffer.from(png, 'base64')); }
// determinism: a second render, the same probes and the same pictures
const h = s => { let x = 2166136261; for (let i = 0; i < s.length; i += 7) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; } return x.toString(16); };
const pics = async () => { const o = []; for (const t of Object.values(times)) o.push(h(await p.evaluate(t => SYNQUENZER.vvShot(t, 'kino', '16:9'), t))); return o; };
// (the offline sound itself varies a little from render to render – also in the base file, see the Song view – so the meter values
// differ; everything the Mäusekino computes itself must be equal, and with the meter off the pictures must be identical)
const probes = async () => { const o = []; for (const t of Object.values(times)) o.push(await p.evaluate(t => JSON.stringify(SYNQUENZER.vk2At(t, '16:9'), (k, v) => (k === 'ms' || k === 'rms' ? undefined : v)), t)); return o.join('|'); };
const Q1 = await probes(), J1 = JSON.stringify(await p.evaluate(() => SYNQUENZER.vk2Runs()));
res.r2 = await render();
const Q2 = await probes(), J2 = JSON.stringify(await p.evaluate(() => SYNQUENZER.vk2Runs()));
await p.evaluate(() => { VV.noMtr = true; });
await render(); const P1 = await pics(); await render(); const P2 = await pics();
await p.evaluate(() => { VV.noMtr = false; });
res.gleich = {fahrten: J1 === J2, werteOhnePegel: Q1 === Q2, bilderOhneMeter: P1.join() === P2.join(), P1, P2};
await render();
// drawing time per picture at full size (1920 × 1080 and 1080 × 1920), 120 pictures through the glide, against the Song view
res.zeichnen = await p.evaluate(spb => {
  const r = VV.last, out = {};
  for (const [fmt, W, H] of [['16:9', 1920, 1080], ['9:16', 1080, 1920]]) for (const v of ['kino', 'song', 'matrix']) {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d', {alpha: false}), rt = vvRun({range: {a: r.a, b: r.b}, bpm: r.bpm, cam: 'kamera'});
    vvDrawShot(g, W, H, rt, {k: 0, v, t: null}, vvStateAt(r, 0), 0);
    const T0 = performance.now(); let mx = 0;
    for (let f = 0; f < 120; f++) { const t = (r.lead || 0) + 2 * 4 * spb + f / 30, a = performance.now(); vvDrawShot(g, W, H, rt, {k: 0, v, t: null}, vvStateAt(r, t), t); mx = Math.max(mx, performance.now() - a); }
    g.getImageData(0, 0, 1, 1);
    out[fmt + ' ' + v] = {avg: +((performance.now() - T0) / 120).toFixed(2), max: +mx.toFixed(1)};
  }
  return out;
}, spb);
// a short real video (WebCodecs; Opus because headless Chromium has no AAC), bars 6–8 with the Mäusekino, against the same
// range without an entry (Auto-Regie)
const make = async kino => p.evaluate(async kino => {
  const Q = SYNQUENZER; delete S.song.video; if (kino) Q.vvDirSet(5, 8, 'kino');
  Q.vvTest({opus: true}); Q.vvPrefs({fmt: '16:9', view: 'auto', cam: 'kamera'}); SYNQUENZER.songSelect(5, 7); VV.useSel = true;
  const T0 = performance.now(); const m = await Q.vvMake({range: {a: 5, b: 8}}); const ms = Math.round(performance.now() - T0);
  return {ms, msAudio: m.msAudio, msVideo: m.msVideo, dur: m.dur, how: m.how, size: m.size, cuts: VV.lastRt.shots.map(s => [s.a, s.b, s.v]), frame: VV.prof && VV.prof.frame ? {n: VV.prof.frame.n, avg: +(VV.prof.frame.sum / VV.prof.frame.n).toFixed(2), max: +VV.prof.frame.max.toFixed(1)} : null};
}, kino);
try {
  res.videoOhne = await make(false);
  res.videoMit = await make(true);
  const bl = await p.evaluate(() => SYNQUENZER.vvBlob()); const f = DIR + 'vk2-video-16x9.' + bl.ext; fs.writeFileSync(f, Buffer.from(bl.b64, 'base64')); res.videoFile = f;
  try { res.ffprobe = execSync(`ffprobe -v error -show_entries stream=codec_name,width,height,nb_frames,duration -of compact ${f}`).toString().trim(); } catch (e) { res.ffprobe = 'ffprobe fehlt'; }
  try { execSync(`ffmpeg -v error -y -ss 2.2 -i ${f} -frames:v 1 ${DIR}vk2-video-frame.png`); res.videoFrame = DIR + 'vk2-video-frame.png'; } catch (e) { res.videoFrame = 'ffmpeg fehlt'; }
} catch (e) { res.videoErr = String(e && e.message || e); }
// live (▶ Vorschau in the video sheet): the Mäusekino from the live notes, meter and glides
res.live = await p.evaluate(async () => {
  const Q = SYNQUENZER; delete S.song.video; Q.vvDirSet(0, S.song.bars, 'kino'); Q.songSelect(null); Q.vvPrefs({fmt: '9:16', view: 'auto', cam: 'kamera'});
  vvOpen(); await new Promise(r => setTimeout(r, 300)); VK2.probe = null; vvPrevStart(); await new Promise(r => setTimeout(r, 2500));
  const pr = VK2.probe; vvPrevStop(); vvClose();
  return pr ? {bar: pr.bar, step: pr.step, held: pr.held, voices: pr.voices, rms: pr.rows.map(x => x.rms), lit: pr.rows.map(x => x.lit)} : null;
});
res.errs = errs;
console.log(JSON.stringify(res, null, 1));
await b.close();
