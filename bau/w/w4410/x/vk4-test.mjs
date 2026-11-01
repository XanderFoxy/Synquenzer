// VK4 Video-Matrix: a small song (8 tracks), stills 16:9 + 9:16, probe of the cells, determinism, drawing time, a short real video
// node vk4-test.mjs <index.html> <out-dir> [prefix]
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
import { execSync } from 'child_process';
const APP = process.argv[2], DIR = (process.argv[3] || '.') + '/', PRE = process.argv[4] || 'vk4-';
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
// the 8th track (Synth 6): Synth 3's scene-1 clip, played from bar 5; drums: scene 2 from bar 7 (a second drum clip)
res.extra = await p.evaluate(() => {
  const A = SYNQUENZER, i = A.addTrack(); if (i < 0) return {i};
  A.setClip(i, 0, A.getClip(2, 0)); A.setClip(i, 2, A.getClip(1, 1));
  const L = S.song.lanes.map(l => (l || []).map(e => Object.assign({}, e))); while (L.length < NT()) L.push([]);
  L[i] = [{bar: 4, slot: 0}, {bar: 8, slot: 2}]; L[4] = [{bar: 0, slot: 1}, {bar: 2, slot: 0}, {bar: 6, slot: 1}, {bar: 8, slot: 0}];
  A.setSong({bars: S.song.bars, lanes: L, carrier: S.song.carrier, mel: S.song.mel, melodyTrack: S.song.melodyTrack, marks: S.song.marks});
  return {i, nt: NT(), ord: trackOrder(), clips: S.tracks.map(t => t.clips.map(c => c ? (c.audio ? 'A' : c.notes.length + '/' + c.len) : '-').slice(0, 4).join(' '))};
});
await p.waitForTimeout(500);
// render bars 5–9 (a = 4, b = 9)
const render = () => p.evaluate(async () => { const T0 = performance.now(); const r = await SYNQUENZER.vvRender({range: {a: 4, b: 9}}); return {dur: r.dur, ms: Math.round(performance.now() - T0), lead: VV.last.lead || 0, bpm: VV.last.bpm}; });
res.r1 = await render();
const spb = 60 / res.r1.bpm, T = (bars, beats) => res.r1.lead + (bars * 4 + (beats || 0)) * spb;
// stills (vvShot = the same path as the video frames)
const shots = [['16x9-a', T(1, 2.03), '16:9', 'kamera'], ['16x9-b', T(3, 0.02), '16:9', 'kamera'], ['16x9-c', T(4, 1.5), '16:9', 'kamera'],
  ['9x16-kamera', T(3, 0.02), '9:16', 'kamera'], ['9x16-balken', T(1, 2.03), '9:16', 'balken'], ['9x16-c', T(4, 1.5), '9:16', 'kamera']];
for (const [nm, t, fmt, cam] of shots) { const png = await p.evaluate(([t, fmt, cam]) => SYNQUENZER.vvShot(t, 'matrix', fmt, cam), [t, fmt, cam]); fs.writeFileSync(DIR + PRE + nm + '.png', Buffer.from(png, 'base64')); }
// the cells' probe (if the new drawing reports one): playing clips, phase, drum glow
res.probe = await p.evaluate(ts => ts.map(t => { if (!window.SYNQUENZER.vk4Probe) return null; const q = SYNQUENZER.vk4Probe(t, '16:9'); return q; }), [T(1, 2.03), T(3, 0.02), T(4, 1.5)]);
// determinism: with the meter off two renders give the same pictures
const h = s => { let x = 2166136261; for (let i = 0; i < s.length; i += 7) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; } return x.toString(16); };
const times = [T(1, 2.03), T(2, 0.01), T(3, 0.02), T(4, 1.5)];
const pics = async () => { const o = []; for (const t of times) for (const f of ['16:9', '9:16']) o.push(h(await p.evaluate(([t, f]) => SYNQUENZER.vvShot(t, 'matrix', f, 'kamera'), [t, f]))); return o; };
await p.evaluate(() => { VV.noMtr = true; });
await render(); const P1 = await pics(); await render(); const P2 = await pics();
await p.evaluate(() => { VV.noMtr = false; });
res.gleich = {bilderOhneMeter: P1.join() === P2.join()};
await render();
// drawing time per picture at full size (120 pictures), matrix and song
res.zeichnen = await p.evaluate(spb => {
  const r = VV.last, out = {};
  for (const [fmt, W, H] of [['16:9', 1920, 1080], ['9:16', 1080, 1920]]) for (const v of ['matrix', 'song']) {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d', {alpha: false}), rt = vvRun({range: {a: r.a, b: r.b}, bpm: r.bpm, cam: 'kamera'});
    vvDrawShot(g, W, H, rt, {k: 0, v, t: null}, vvStateAt(r, 0), 0);
    let mx = 0; const T0 = performance.now();
    for (let f = 0; f < 120; f++) { const t = (r.lead || 0) + 4 * spb + f / 30, a = performance.now(); vvDrawShot(g, W, H, rt, {k: 0, v, t: null}, vvStateAt(r, t), t); mx = Math.max(mx, performance.now() - a); }
    g.getImageData(0, 0, 1, 1);
    out[fmt + ' ' + v] = {avg: +((performance.now() - T0) / 120).toFixed(2), max: +mx.toFixed(1)};
  }
  return out;
}, spb);
// a short real video (WebCodecs; Opus because headless Chromium has no AAC), bars 6–8, matrix view
const make = async (fmt) => p.evaluate(async fmt => {
  const Q = SYNQUENZER; Q.vvTest({opus: true}); Q.vvPrefs({fmt, view: 'matrix', cam: 'kamera'}); Q.songSelect(5, 7); VV.useSel = true;
  const T0 = performance.now(); const m = await Q.vvMake({range: {a: 5, b: 8}}); const ms = Math.round(performance.now() - T0);
  return {fmt, ms, msAudio: m.msAudio, msVideo: m.msVideo, dur: m.dur, how: m.how, size: m.size, frame: VV.prof && VV.prof.frame ? {n: VV.prof.frame.n, avg: +(VV.prof.frame.sum / VV.prof.frame.n).toFixed(2), max: +VV.prof.frame.max.toFixed(1)} : null};
}, fmt);
try {
  res.video = [];
  for (const fmt of ['16:9', '9:16']) {
    res.video.push(await make(fmt));
    const bl = await p.evaluate(() => SYNQUENZER.vvBlob()); const f = DIR + PRE + 'video-' + fmt.replace(':', 'x') + '.' + bl.ext; fs.writeFileSync(f, Buffer.from(bl.b64, 'base64'));
    try { res.video[res.video.length - 1].ffprobe = execSync(`ffprobe -v error -show_entries stream=codec_name,width,height,nb_frames,duration -of compact ${f}`).toString().trim(); } catch (e) { res.video[res.video.length - 1].ffprobe = 'ffprobe fehlt'; }
    if (fmt === '16:9') try { execSync(`ffmpeg -v error -y -ss 2.6 -i ${f} -frames:v 1 ${DIR}${PRE}video-frame.png`); } catch (e) {}
  }
} catch (e) { res.videoErr = String(e && e.message || e); }
// live (▶ Vorschau): the matrix from the live state, no errors
res.live = await p.evaluate(async () => {
  const Q = SYNQUENZER; Q.songSelect(null); VV.useSel = false; Q.vvPrefs({fmt: '16:9', view: 'matrix', cam: 'kamera'});
  vvOpen(); await new Promise(r => setTimeout(r, 300)); vvPrevStart(); await new Promise(r => setTimeout(r, 2000));
  const pr = window.VK4 && VK4.probe ? JSON.parse(JSON.stringify(VK4.probe)) : null; vvPrevStop(); vvClose(); return pr;
});
res.errs = errs;
console.log(JSON.stringify(res, null, 1));
await b.close();
