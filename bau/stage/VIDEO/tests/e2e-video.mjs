// Stage VIDEO 4.28.0 – Ende-zu-Ende: kurzer Song mit Melodie-Clip, Drum-Clip, Transposition (song.xp + Träger) und Chor-Gruppe
// (STIMME-Take + Chor-Stil) → Video 16:9 und 9:16 [Ganze App], beide mit Auto-Regie und Abspann-Logo (das echte Logo
// medien/abspann-logo.mp4, 952×952, 10 s). Geprüft: Einzelbilder (echte Noten in der Piano-Roll, Kick/Snare-Wechsel im
// Drum-Sequenzer, Pegel, Logo einmal mittig gekeyt über dem abdunkelnden Bild), Ton vorhanden, Abspann still, keine Konsolenfehler.
// Aufruf (Repo-Wurzel): node bau/stage/VIDEO/tests/e2e-video.mjs [wc|mr]   – APP=… für eine andere Datei
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path'; import { execSync } from 'child_process';
const HERE = path.dirname(new URL(import.meta.url).pathname), ROOT = path.resolve(HERE, '../../../..');
const APP = process.env.APP || path.resolve(HERE, '../index.html'), OUT = path.join(HERE, 'out', 'e2e') + '/', BILD = path.resolve(HERE, '../bilder') + '/';
const WAY = process.argv[2] || 'wc';
fs.mkdirSync(OUT, {recursive: true}); fs.mkdirSync(BILD, {recursive: true});
const LOGO = path.join(ROOT, 'medien/abspann-logo.mp4');
if (!fs.existsSync(LOGO)) { console.log('medien/abspann-logo.mp4 fehlt: git show origin/main:medien/abspann-logo.mp4 > medien/abspann-logo.mp4'); process.exit(2); }
// http: the app at /, the fonts, the logo
const srv = http.createServer((q, s) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  const f = u === '/' || u === '/index.html' ? APP : u.startsWith('/fonts/') ? path.join(ROOT, 'fonts', u.slice(7)) : u.startsWith('/medien/') ? path.join(ROOT, 'medien', u.slice(8)) : null;
  if (!f || !fs.existsSync(f)) { s.writeHead(404); s.end(); return; }
  s.writeHead(200, {'content-type': f.endsWith('.html') ? 'text/html; charset=utf-8' : f.endsWith('.mp4') ? 'video/mp4' : f.endsWith('.woff2') ? 'font/woff2' : 'application/octet-stream', 'cache-control': 'no-store'});
  fs.createReadStream(f).pipe(s);
});
await new Promise(r => srv.listen(0, '127.0.0.1', r));
const URL0 = `http://127.0.0.1:${srv.address().port}/`;
const C = []; const ok = (id, c, info) => { C.push([id, !!c, info]); console.log((c ? 'PASS ' : 'FAIL ') + id + (info != null ? ' — ' + JSON.stringify(info).slice(0, 400) : '')); };
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 428, height: 926}, deviceScaleFactor: 1});
const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e)); p.on('console', m => { if (m.type() === 'error' && !/status of 404/.test(m.text())) errs.push(m.text()); });
await p.goto(URL0); await p.waitForTimeout(1500); await p.mouse.click(5, 300);
await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 15000}).catch(() => {});
await p.waitForTimeout(300);
ok('Version 4.28.0', await p.evaluate(() => SYNQUENZER.version || (typeof VERSION !== 'undefined' && VERSION)) === '4.28.0');

// ---- der Song: Melodie (Spur 2), Bass (Spur 1), Drums (Spur 4, zwei Clips), STIMME mit Chor-Gruppe, song.xp und Träger ----
const setup = await p.evaluate(async () => {
  const A = SYNQUENZER; A.setMetronome && A.setMetronome(false); S.bpm = 120;
  // a sung take: 2 bars (4 s), a vowel-like tone (harmonics + vibrato) C4 – E4 – G4 – E4
  const sr = 48000, n = sr * 4, pcm = new Int16Array(n), f0s = [261.63, 329.63, 392, 329.63];
  let ph = 0; for (let i = 0; i < n; i++) { const t = i / sr, f = f0s[Math.min(3, Math.floor(t))] * (1 + .004 * Math.sin(2 * Math.PI * 5.5 * t)); ph += 2 * Math.PI * f / sr;
    const env = Math.min(1, t * 20, (4 - t) * 20) * (.6 + .4 * Math.min(1, (t % 1) * 8)); let v = 0; for (let h = 1; h <= 8; h++) v += Math.sin(h * ph) / (h * (h > 2 ? 1.6 : 1)); pcm[i] = Math.round(v * env * 9000); }
  const tk = await A.tkInject({pcm: Array.from(pcm), sr, scene: 0, len: 2});
  const st = tk.track, r = {t: st, s: 0};
  let style = null; for (const id of ['pop', '80', 'gospel']) { try { if (await A.g6pStyle(r, id)) { style = id; break; } } catch (e) {} }
  // second drum clip (slot 1): snare on 2 and 4 together with the kick (VV4-C: the shown voice switches only on a hit of the other)
  const D = DRUM_T, nt = NT(), lanes = Array.from({length: nt}, () => []);
  lanes[1] = [{bar: 0, slot: 0}]; lanes[2] = [{bar: 2, slot: 0}]; lanes[D] = [{bar: 0, slot: 1}, {bar: 4, slot: 0}]   /* Clip 2 (ohne Snare) zuerst, Clip 1 mit Snare neu ab Takt 5 */; lanes[st] = [{bar: 0, slot: 0}, {bar: 4, slot: 0}];
  A.setSong({bars: 8, lanes, carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 4, name: 'Strophe'}, {id: 'm2', a: 4, len: 4, name: 'Refrain'}]});
  S.song.xp = [{beat: 24, semi: 2}];                                  // Teil-Transposition +2 ab Takt 7
  const info = A.g6pInfo(r);
  return {st, D, style, chorV: info.v, voices: info.chor && info.chor.voices ? info.chor.voices.length : 0, lanes: info.lanes ? info.lanes.lanes.length : 0,
    mel: (S.tracks[2].clips[0] || {notes: []}).notes.length, drum1: !!S.tracks[D].clips[1], bars: S.song.bars};
});
ok('Song aufgebaut (Melodie, Drums 2 Clips, STIMME)', setup.mel > 0 && setup.drum1 && setup.st >= 0, setup);
ok('Chor-Gruppe (G6+, v2) an der STIMME', setup.style && setup.chorV === 2 && setup.voices >= 1, setup);
const logo = await p.evaluate(async () => { const x = await SYNQUENZER.vvLogo({reload: true}); return x; });
ok('Abspann-Logo geladen (echtes Logo 952×952, 10 s)', logo.st === 'ok' && logo.on && logo.w === 952 && Math.abs(logo.dur - 10) < .2, logo);

// ---- render + check, per format ----
const frameRgb = (f, t, w, h) => ({w, h, d: execSync(`ffmpeg -v error -ss ${t.toFixed(3)} -i ${f} -frames:v 1 -vf scale=${w}:${h} -f rawvideo -pix_fmt rgb24 -`, {maxBuffer: 1 << 27})});
const png = (f, t, name, w) => execSync(`ffmpeg -v error -y -ss ${t.toFixed(3)} -i ${f} -frames:v 1 -vf scale=${w}:-2 ${name}`);
const px = (fr, x, y) => { const i = (Math.round(y) * fr.w + Math.round(x)) * 3; return [fr.d[i], fr.d[i + 1], fr.d[i + 2]]; };
const lum = c => .299 * c[0] + .587 * c[1] + .114 * c[2];
const meanL = (fr, x0, y0, x1, y1) => { let s = 0, n = 0; for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) { s += lum(px(fr, x, y)); n++; } return n ? s / n : 0; };
const audio = f => { const bb = execSync(`ffmpeg -v error -i ${f} -vn -ac 1 -ar 8000 -f f32le -`, {maxBuffer: 1 << 28}); return new Float32Array(bb.buffer, bb.byteOffset, bb.byteLength / 4); };
const pk = (a, t0, t1) => { let m = 0; for (let i = Math.max(0, Math.round(t0 * 8000)); i < Math.min(a.length, Math.round(t1 * 8000)); i++) m = Math.max(m, Math.abs(a[i])); return m > 0 ? +(20 * Math.log10(m)).toFixed(1) : -200; };
// Echtzeit-Weg (WebM im Test-Chromium): dunkle Flächen werden reines Schwarz → Vergleich mit Ausgleich des mittleren Helligkeits-Versatzes
const diffN = (A_, B_) => { const m = [0, 0, 0]; let n = 0; for (let i = 0; i < A_.length; i += 21) { for (let k = 0; k < 3; k++) m[k] += A_[i + k] - B_[i + k]; n++; } for (let k = 0; k < 3; k++) m[k] /= n;
  let s = 0; for (let i = 0; i < A_.length; i += 21) for (let k = 0; k < 3; k++) s += Math.abs(A_[i + k] - B_[i + k] - m[k]); return s / n / 3; };
const diff = (A_, B_) => WAY === 'mr' ? diffN(A_, B_) : diffW(A_, B_);
const diffW = (A_, B_) => { let s = 0; for (let i = 0; i < A_.length; i += 3 * 7) s += Math.abs(A_[i] - B_[i]) + Math.abs(A_[i + 1] - B_[i + 1]) + Math.abs(A_[i + 2] - B_[i + 2]); return s / (A_.length / 21) / 3; };

for (const [fmt, cam] of [['16:9', null], ['9:16', 'app']]) {
  const tag = fmt.replace(':', 'x') + (cam ? '-app' : '') + '-' + WAY;
  await p.evaluate(w => SYNQUENZER.vvTest(w === 'mr' ? {noVE: true} : {opus: true}), WAY);
  const res = await p.evaluate(o => SYNQUENZER.vvMake(o), {fmt, view: 'auto', cam: cam || undefined, range: {a: 0, b: 8}});
  const bl = await p.evaluate(() => SYNQUENZER.vvBlob()), f = OUT + 'e2e-' + tag + '.' + bl.ext; fs.writeFileSync(f, Buffer.from(bl.b64, 'base64'));
  const W = res.W, H = res.H, at = res.logo ? res.logo.at : NaN;
  ok(`${tag}: Video gebaut (${res.how})`, W && H && res.dur > 8, {W, H, dur: res.dur, how: res.how, cam: res.cam, logo: res.logo});
  const log = await p.evaluate(() => SYNQUENZER.vvRunLog()), shots = log.shots.map(s => ({a: s.a, v: s.v, t: s.t, f: s.f, why: s.why}));
  ok(`${tag}: Auto-Regie 2 – Schnittliste mit neuen Bildern`, shots.some(s => ['roll', 'drum', 'app', 'tast', 'mod'].includes(s.v)), shots);
  const sp = 60 / 120, T = s => s.a * 4 * sp;                        // shot start (bar) → video time (range starts at bar 0)
  const W4 = Math.round(W / 2), H4 = Math.round(H / 2);
  // 1) Piano-Roll: the video frame = the drawer with the real notes (vv4Pic of the same moment), and the drawer shows clip.notes
  const sr = shots.find(s => s.v === 'roll');
  if (sr) {
    const t = T(sr) + 2.5 * sp + .3 / 1 + .02;                        // behind the 2-beat cell focus and the 300 ms blend
    const fr = frameRgb(f, t, W4, H4); png(f, t, BILD + `e2e-${tag}-roll.png`, 540);
    const ref = await p.evaluate(([t, tr, fmt, W4, H4]) => { const b64 = SYNQUENZER.vv4Pic(t, 'roll', tr, fmt); return b64; }, [t, sr.t, fmt, W4, H4]);
    fs.writeFileSync(OUT + 'ref.png', Buffer.from(ref, 'base64')); const rf = {w: W4, h: H4, d: execSync(`ffmpeg -v error -i ${OUT}ref.png -vf scale=${W4}:${H4} -f rawvideo -pix_fmt rgb24 -`, {maxBuffer: 1 << 27})};
    // Echtzeit-Weg (mr): die Datei-Zeit liegt im Test-Chromium bis ~0,3 s neben der Zeichen-Zeit → bestes Bild in ±0,4 s
    let mad = diff(fr.d, rf.d);
    if (WAY === 'mr') for (let dt = -.4; dt <= .401; dt += .1) { const q = frameRgb(f, Math.max(0, t + dt), W4, H4); mad = Math.min(mad, diff(q.d, rf.d)); }
    const pr = await p.evaluate(([t, tr, fmt]) => SYNQUENZER.vv4Probe('roll', tr, t, fmt), [t, sr.t, fmt]);
    const notes = await p.evaluate(tr => { const sh = SYNQUENZER.vv3Notes(tr); return S.tracks[tr].clips[0].notes.length; }, sr.t);
    ok(`${tag}: Piano-Roll im Video = Zeichner (echte Noten)`, mad < 12 && pr && pr.roll && pr.roll.rows.length > 0, {mad: +mad.toFixed(2), rows: pr && pr.roll && pr.roll.rows.length, clipNotes: notes, t: +t.toFixed(2), track: sr.t});
  } else ok(`${tag}: Piano-Roll in der Auto-Regie`, false, shots);
  // 2) Drum-Sequenzer: shown voice switches Kick ↔ Snare only on a hit of the other, ≤ 1 per beat
  const sd = shots.find(s => s.v === 'drum');
  if (sd) {
    const t0 = T(sd), t1 = Math.min(res.dur - 1, t0 + 8 * sp);
    const V = await p.evaluate(([t0, t1, D, fmt]) => { const o = []; for (let t = t0; t < t1; t += 1 / 30) { const pr = SYNQUENZER.vv4Probe('drum', D, t, fmt); o.push([+t.toFixed(3), pr.drum.voice]); } return o; }, [t0, t1, setup.D, fmt]);
    const sw = []; for (let k = 1; k < V.length; k++) if (V[k][1] !== V[k - 1][1]) sw.push(V[k]);
    const perBeat = {}; for (const s of sw) { const bt = Math.floor(s[0] / sp); perBeat[bt] = (perBeat[bt] || 0) + 1; }
    const tm = t0 + 2 * sp + .05; png(f, tm, BILD + `e2e-${tag}-drum.png`, 540);
    ok(`${tag}: Drum-Sequenzer – Kick/Snare-Wechsel (≤ 1 je Schlag)`, sw.length >= 1 && Object.values(perBeat).every(n => n <= 1) && new Set(V.map(x => x[1])).size >= 2, {wechsel: sw.slice(0, 8), stimmen: [...new Set(V.map(x => x[1]))]});
  } else ok(`${tag}: Drum-Sequenzer in der Auto-Regie`, false, shots);
  // 3) Pegel (VV4-F): the meters of the render are there and the drawer puts bars into the Song/Matrix picture
  const mt = await p.evaluate(() => { const r = VV.last; return {mtr: !!(r && r.mtr), n: r && r.mtr && r.mtr.Q ? r.mtr.Q.cnt : (r && r.mtr ? 1 : 0)}; });
  const mp = await p.evaluate(([fmt]) => { const [W, H] = VV_SIZE[fmt], c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    const st = vvStateAt(VV.last, 1.5); vvDraw(g, W, H, 'song', st, vvRun({view: 'song', range: {a: 0, b: 8}})); const d = g.getImageData(0, 0, W, H).data; let gr = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i + 1] > 150 && d[i] < 120 && d[i + 2] < 150) gr++; return {gruen: gr}; }, [fmt]);
  ok(`${tag}: Pegel – Meter-Fenster im Render, Balken im Song-Bild`, mt.mtr && mp.gruen > 50, {mt, mp});
  // 4) Abspann: logo once, centred, keyed over the darkening picture (0.75 s after the song end = 75 % dark), then on black
  if (res.logo) {
    const S0 = Math.min(W4, H4) * .6 / 2, cx = W4 / 2, cy = H4 / 2;
    const fA = frameRgb(f, at - .2, W4, H4), fM = frameRgb(f, at + (WAY === 'mr' ? .95 : .8), W4, H4), fL = frameRgb(f, at + .5 + 8, W4, H4);
    png(f, at + (WAY === 'mr' ? .95 : .8), BILD + `e2e-${tag}-logo-ueber-abblende.png`, 540); png(f, at + .5 + 8, BILD + `e2e-${tag}-logo.png`, 540);
    const outside = fr => { let s = 0, n = 0; for (let y = 0; y < fr.h; y += 3) for (let x = 0; x < fr.w; x += 3) { if (Math.abs(x - cx) < S0 + 2 && Math.abs(y - cy) < S0 + 2) continue; s += lum(px(fr, x, y)); n++; } return s / n; };
    let bx0 = 1e9, by0 = 1e9, bx1 = -1, by1 = -1, red = 0, redSat = 0;
    for (let y = 0; y < fL.h; y++) for (let x = 0; x < fL.w; x++) { const c = px(fL, x, y); if (lum(c) > 50 || c[0] > 120) { bx0 = Math.min(bx0, x); by0 = Math.min(by0, y); bx1 = Math.max(bx1, x); by1 = Math.max(by1, y); }
      if (c[0] > 120 && c[1] < 90 && c[2] < 90) { red++; redSat += (c[0] - Math.max(c[1], c[2])) / c[0]; } }
    const bcx = (bx0 + bx1) / 2, bcy = (by0 + by1) / 2;
    ok(`${tag}: Logo einmal mittig (nicht gekachelt)`, Math.abs(bcx - cx) < W4 * .05 && Math.abs(bcy - cy) < H4 * .05 && bx1 - bx0 <= 2 * S0 + 4 && by1 - by0 <= 2 * S0 + 4, {bbox: [bx0, by0, bx1, by1], mitte: [cx, cy], feld: 2 * S0});
    ok(`${tag}: Logo gekeyt – kein Kasten, außen schwarz`, outside(fL) < 2, {aussen: +outside(fL).toFixed(2)});
    // the source logo at the same logo time (8 s), scaled like in the video: its red pixels → the video keeps their colour
    const sz = Math.round(2 * S0), src = {w: sz, h: sz, d: execSync(`ffmpeg -v error -ss 8 -i ${LOGO} -frames:v 1 -vf scale=${sz}:${sz} -f rawvideo -pix_fmt rgb24 -`, {maxBuffer: 1 << 27})};
    let sr_ = 0, srS = 0, sv = [0, 0, 0], vv = [0, 0, 0], nv = 0;
    for (let y = 0; y < sz; y++) for (let x = 0; x < sz; x++) { const c = px(src, x, y); if (c[0] > 90 && c[0] > 2 * Math.max(c[1], c[2])) { sr_++; srS += (c[0] - Math.max(c[1], c[2])) / c[0];
      const q = px(fL, Math.round(cx - S0) + x, Math.round(cy - S0) + y); for (let k = 0; k < 3; k++) { sv[k] += c[k]; vv[k] += q[k]; } nv++; } }
    sv = sv.map(v => Math.round(v / Math.max(1, nv))); vv = vv.map(v => Math.round(v / Math.max(1, nv)));
    ok(`${tag}: Rot satt (Luma-Key, Farbe wie in der Logo-Datei)`, nv > 20 && Math.abs(vv[0] - sv[0]) < 30 && vv[1] < sv[1] + 25 && vv[2] < sv[2] + 25, {rotPixel: nv, datei: sv, video: vv});
    let oA = outside(fA), oM = outside(fM), lM = meanL(fM, cx - S0, cy - S0, cx + S0, cy + S0);
    if (WAY === 'mr') for (let d = .5; d <= 1.2 && !(oM > .3 && lM > 1); d += .05) { const q = frameRgb(f, at + d, W4, H4); oM = outside(q); lM = meanL(q, cx - S0, cy - S0, cx + S0, cy + S0); }   // Echtzeit: Datei-Zeit versetzt
    ok(`${tag}: Logo blendet schon während des Abdunkelns ein`, WAY === 'mr' ? oM > .3 && oM < oA * .5 && lM > 1 : oM > .5 && oM < oA * .5 && lM > 3, {songEnde: +oA.toFixed(1), bei08s: +oM.toFixed(1), logoFeld08s: +lM.toFixed(1)});
  } else ok(`${tag}: Abspann-Logo im Video`, false, res.logo);
  // 5) Ton
  const a = audio(f), songPk = pk(a, 0, isNaN(at) ? res.dur : at - .5), abs = isNaN(at) ? -200 : pk(a, at + .1, res.dur);
  ok(`${tag}: Ton vorhanden, Abspann still`, songPk > -30 && abs < -50, {song: songPk, abspann: abs});
  // sample frames of the song for the report
  for (const s of shots.slice(0, 6)) png(f, T(s) + 1.2, OUT + `shot-${tag}-${s.a}-${s.v}.png`, 360);
}
// 6) der Chor ist im Video-Ton: Offline-Render (derselbe Weg wie das Video) mit Chor zweimal (Rauschen: der Render ist nicht
// bit-gleich reproduzierbar) und einmal ohne Chor-Gruppe; die Differenz mit/ohne (= der Chor) muss klar über dem Rauschen liegen
const grab = async () => { await p.evaluate(() => SYNQUENZER.vvRender({range: {a: 0, b: 8}})); return p.evaluate(() => { const r = VV.last, d = r.buf.getChannelData(0), o = Math.round((r.off || 0) * r.buf.sampleRate), n = Math.round(4 * r.buf.sampleRate);
  window.__cb = window.__cb || []; window.__cb.push(d.slice(o, o + n)); return window.__cb.length - 1; }); };
const dif = (i, j) => p.evaluate(([i, j]) => { const a = window.__cb[i], b = window.__cb[j]; let s = 0, e = 0; for (let k = 0; k < Math.min(a.length, b.length); k++) { const x = a[k] - b[k]; s += x * x; e += a[k] * a[k]; } return +(10 * Math.log10((s + 1e-20) / (e + 1e-20))).toFixed(1); }, [i, j]);
const muted = await p.evaluate(st => { const m = S.tracks.map(t => !!(t && t.mute)); S.tracks.forEach((t, i) => { if (t && i !== st) t.mute = true; }); return m; }, setup.st);   // nur die STIMME (Lead + Chor) hörbar
const i1 = await grab(), i2 = await grab();
const chor = await p.evaluate(st => { const r = {t: st, s: 0}, c = JSON.parse(JSON.stringify(SYNQUENZER.g6pInfo(r).chor)); SYNQUENZER.g6pSet(r, null); return c; }, setup.st);
const i3 = await grab();
await p.evaluate(([st, c]) => SYNQUENZER.g6pSet({t: st, s: 0}, c), [setup.st, chor]);
await p.evaluate(m => S.tracks.forEach((t, i) => { if (t) t.mute = m[i]; }), muted);
const rausch = await dif(i1, i2), chorDb = await dif(i1, i3);
ok('Chor im Video-Ton (Differenz mit/ohne Chor-Gruppe klar über dem Render-Rauschen)', chorDb > rausch + 6 && chorDb > -40, {chorDb, rausch});
ok('keine Konsolenfehler', errs.length === 0, errs.slice(0, 5));
const nOk = C.filter(c => c[1]).length;
fs.writeFileSync(OUT + 'e2e-' + WAY + '.json', JSON.stringify({ok: nOk, all: C.length, checks: C}, null, 1));
console.log(`e2e-video ${WAY}: ${nOk}/${C.length}`);
await b.close(); srv.close(); process.exit(nOk === C.length ? 0 : 1);
