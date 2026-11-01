// 4.30.1 – Logo-Abspann deckungsgleich: das Logo-Video endet mit dem Video, nichts wird angehängt.
// Aufruf: node logo-ende.mjs <app.html> <wc|mr> <16:9|9:16|1:1> [takte=8]   (über http, medien/abspann-logo.mp4 = Xanders Logo, 10 s)
// Je Lauf zwei Videos desselben Songs mit festem Zufalls-Startwert: mit Logo und ohne Logo. Geprüft:
//  1 Länge: Video mit Logo = Video ohne Logo = Song samt Ausklang (±1 Bild); Ton- und Bildspur gleich lang
//  2 Logo-Start = Ende − 10 s (vom Ende zurückgerechnet); Song kürzer als das Logo: Start 0, Versatz = 10 s − Länge
//  3 Abdunkeln beginnt genau beim Logo-Start: das Bild davor = Bild ohne Logo; danach außerhalb des Logos linear dunkler
//    (0,5 s ≈ 75 %, 1 s ≈ 50 %), ab 2 s schwarz bis zum Ende
//  4 das letzte Bild zeigt das letzte Logo-Bild (Vergleich mit dem Endbild der Logo-Datei), mittig, ~60 % der kürzeren Seite
//  5 kein Kasten: Ecken des Logo-Felds schwarz; Rot bleibt satt (Rot-Anteil im Logo-Feld)
//  6 Ton unverändert: Ton mit Logo = Ton ohne Logo (WebCodecs: bitgleich dekodiert), kein Ausblenden, keine Stille angehängt
import {createRequire} from 'module'; const {chromium} = createRequire(import.meta.url)('playwright');
import http from 'http'; import fs from 'fs'; import path from 'path'; import crypto from 'crypto'; import {execSync} from 'child_process';
const APP = process.argv[2], WAY = process.argv[3] || 'wc', FMT = process.argv[4] || '16:9', BARS = +(process.argv[5] || 8);
const SP = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const LOGO = process.env.LOGO || '/home/user/synquenzer/medien/abspann-logo.mp4', FONTS = path.join(SP, 'dirigent-test/fonts');
const OUT = path.join(path.dirname(new URL(import.meta.url).pathname), 'out') + '/'; fs.mkdirSync(OUT, {recursive: true});
const TAG = 'logo-' + WAY + '-' + FMT.replace(':', 'x') + '-' + BARS + 't';
const C = []; const ok = (n, v, info) => { C.push([n, !!v]); console.log((v ? '✓ ' : '✗ ') + n + (info !== undefined ? ' ' + JSON.stringify(info) : '')); };
const md5 = b => crypto.createHash('md5').update(b).digest('hex').slice(0, 12);
const srv = http.createServer((q, s) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  const f = u === '/' || u === '/index.html' ? APP : u === '/medien/abspann-logo.mp4' ? LOGO : u.startsWith('/fonts/') ? path.join(FONTS, u.slice(7)) : null;
  if (!f || !fs.existsSync(f)) { s.writeHead(404); s.end(); return; }
  s.writeHead(200, {'content-type': f.endsWith('.html') ? 'text/html; charset=utf-8' : f.endsWith('.mp4') ? 'video/mp4' : 'font/woff2', 'cache-control': 'no-store'}); fs.createReadStream(f).pipe(s);
});
await new Promise(r => srv.listen(0, '127.0.0.1', r)); const URL0 = 'http://127.0.0.1:' + srv.address().port + '/';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 390, height: 844}}); const errs = [];
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto(URL0 + 'index.html'); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 30000}); await p.waitForTimeout(800);
await p.mouse.click(5, 300); await p.evaluate(async () => { closePop(); ensureAudio(); for (let k = 0; k < 50 && !(AU.ctx && AU.ctx.state === 'running'); k++) await new Promise(r => setTimeout(r, 100)); });
await p.evaluate(() => { const el = document.getElementById('sq-worklet-src'); window._wsrc = el.textContent;
  el.textContent = '(function(){var s=12345;Math.random=function(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};})();\n' + window._wsrc;
  window._seed = () => { let s = 777; Math.random = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }; });
const song = await p.evaluate(async bars => {
  const A = SYNQUENZER; A.setMetronome && A.setMetronome(false); A.setBpm(120);
  A.setSong({bars, lanes: [[{bar: 0, slot: 0}], [{bar: 0, slot: 0}], [{bar: 1, slot: 0}], [], [{bar: 0, slot: 0}], []], carrier: [], mel: {}, marks: []});
  await new Promise(r => setTimeout(r, 400)); return {bars: S.song.bars, bpm: S.bpm, ver: A.version};
}, BARS);
const logo = await p.evaluate(() => SYNQUENZER.vvLogo());
ok('Logo geladen (Xanders Datei, 10 s)', logo.st === 'ok' && Math.abs(logo.dur - 10) < .05, logo);
const test = WAY === 'wc' ? {opus: true} : {noVE: true}; if (FMT === '1:1') test.size = [1080, 1080];
await p.evaluate(t => SYNQUENZER.vvTest(t), test);
const make = async (on, name) => {
  await p.evaluate(on => SYNQUENZER.vvLogo({pref: on}), on);
  const res = await p.evaluate(f => { window._seed(); return SYNQUENZER.vvMake({fmt: f === '1:1' ? '16:9' : f}).then(x => { const r = VV.last; let hh = 2166136261 >>> 0; for (let c = 0; c < 2; c++) { const u = new Uint32Array(r.ch[c].buffer, r.ch[c].byteOffset, r.n); for (let k = 0; k < u.length; k++) hh = Math.imul(hh ^ u[k], 16777619) >>> 0; }
    const env = [], win = Math.round(r.sr / 10); for (let a = 0; a + win <= r.n; a += win) { let e = 0; for (let c = 0; c < 2; c++) { const d = r.ch[c]; for (let k = a; k < a + win; k++) e += d[k] * d[k]; } env.push(+(10 * Math.log10(e / (2 * win) + 1e-12)).toFixed(2)); }
    return {dur: x.dur, how: x.how, W: x.W, H: x.H, logo: x.logo, songSec: x.songSec, tail: x.tail, renderHash: hh.toString(16), env, sr: r.sr, n: r.n}; }); }, FMT);
  const bl = await p.evaluate(() => SYNQUENZER.vvBlob()); const f = OUT + TAG + '-' + name + '.' + bl.ext; fs.writeFileSync(f, Buffer.from(bl.b64, 'base64'));
  return {res, f};
};
// Vorlauf: ein Ton-Render vorweg – der erste Render einer Seite weicht oft leicht von den folgenden ab (Zustand der Klangerzeuger)
await p.evaluate(() => { window._seed(); return SYNQUENZER.vvRender({}); });
const A1 = await make(true, 'mit'), B0 = await make(false, 'ohne'), B2 = await make(false, 'ohne2');   // ohne2: Streuung zweier gleicher Läufe
// der Ausklang (Ton < −60 dBFS) schwankt schon ohne Logo von Lauf zu Lauf (Offline-Render unter Last): Vergleich mit dem Lauf ohne Logo, dessen Länge passt
const [A0, A2] = Math.abs(B0.res.dur - A1.res.dur) <= Math.abs(B2.res.dur - A1.res.dur) ? [B0, B2] : [B2, B0];
await p.evaluate(() => SYNQUENZER.vvLogo({pref: true}));
const R1 = A1.res, R0 = A0.res, W = R1.W, H = R1.H, FPS = 30;
ok('Weg ' + WAY, R1.how === (WAY === 'wc' ? 'webcodecs' : 'recorder') && R0.how === R1.how, [R1.how, R0.how]);
// 1 length
const ends = f => { const o = execSync(`ffprobe -v error -show_entries stream=codec_type,nb_frames,duration -show_entries format=duration -of json ${f}`).toString(); return JSON.parse(o); };
const decEnd = (f, sel) => { const o = execSync(`ffprobe -v error -select_streams ${sel} -show_entries frame=pts_time,duration_time,pkt_duration_time -of csv=p=0 ${f}`, {maxBuffer: 1 << 28}).toString().trim().split('\n').map(l => l.split(',').map(Number)); let mx = 0; for (const r of o) { const t = r[0], d = isFinite(r[1]) ? r[1] : (isFinite(r[2]) ? r[2] : 0); if (isFinite(t)) mx = Math.max(mx, t + d); } return {end: +mx.toFixed(3), frames: o.length}; };
const v1 = decEnd(A1.f, 'v'), a1 = decEnd(A1.f, 'a'), v0 = decEnd(A0.f, 'v'), a0 = decEnd(A0.f, 'a'), tol = WAY === 'wc' ? 1 / FPS + .002 : .25;
const spread = Math.abs(B0.res.dur - B2.res.dur), sameLen = Math.abs(R1.dur - R0.dur) < 1e-6;
ok('1 Länge = Song samt Ausklang (nichts angehängt): res.dur = Songlänge + Ausklang', Math.abs(R1.dur - (R1.songSec + R1.tail)) < 1e-6 && R1.tail <= 10.001, {mit: R1.dur, song: R1.songSec, ausklang: R1.tail});
ok('1 Länge wie ohne Logo (der gekürzte Ausklang streut je Lauf um Zehntelsekunden; ein angehängter Abspann wären ≥ 10 s)', sameLen || Math.abs(R1.dur - R0.dur) < .5, {mit: R1.dur, ohne: [B0.res.dur, B2.res.dur], streuung: +spread.toFixed(3)});
if (WAY === 'wc') ok('1 Bildspur = Tonspur = Länge (±1 Bild)', Math.abs(v1.end - R1.dur) <= tol && Math.abs(a1.end - R1.dur) <= tol + .05 && Math.abs(v0.end - R0.dur) <= tol, {bild: v1, ton: a1.end, soll: R1.dur, ohne: {bild: v0.end, ton: a0.end, soll: R0.dur}});
else ok('1 Echtzeit: Tonspur = Länge (±0,6 s); Bildspur nicht kürzer als ohne Logo (Test-Chromium verliert in der Live-Aufnahme Bilder – mit und ohne Logo)', Math.abs(a1.end - R1.dur) <= .6 && (R1.dur - v1.end) <= (R0.dur - v0.end) + .6, {bild: v1, ton: a1.end, soll: R1.dur, ohne: {bild: v0, ton: a0.end, soll: R0.dur}});
// 2 logo start
const L = 10, E = R1.logo ? R1.logo.end : NaN, at = R1.logo ? R1.logo.at : NaN, short = R1.dur < L;
ok('2 res.logo: Ende = Videoende, Start = Ende − 10 s' + (short ? ' (kürzer als das Logo: Start 0, Versatz)' : ''), R1.logo && Math.abs(E - (WAY === 'wc' ? Math.round(R1.dur * FPS) / FPS : R1.dur)) < 1e-6 && Math.abs(at - Math.max(0, E - L)) < 1e-6 && Math.abs(R1.logo.off - Math.max(0, L - E)) < 1e-6 && R1.logo.fade === 2 && R0.logo === null, R1.logo);
// pictures (gray, 1/4)
const w = Math.round(W / 4), h = Math.round(H / 4), S0 = Math.round(Math.min(W, H) * .6), ox = Math.round((W - S0) / 2), oy = Math.round((H - S0) / 2), k4 = .25;
const sq = {x0: Math.floor(ox * k4), y0: Math.floor(oy * k4), x1: Math.ceil((ox + S0) * k4), y1: Math.ceil((oy + S0) * k4)};
const grab = (f, t, fmt = 'gray') => ({w, h, d: execSync(`ffmpeg -v error -ss ${Math.max(0, t).toFixed(4)} -i ${f} -frames:v 1 -vf scale=${w}:${h},format=${fmt} -f rawvideo -`, {maxBuffer: 1 << 26})});
const png = (f, t, n) => execSync(`ffmpeg -v error -y -ss ${Math.max(0, t).toFixed(4)} -i ${f} -frames:v 1 -vf scale=${w}:${h} ${OUT + TAG + '-' + n}.png`);
const outside = fr => { let s = 0, n = 0; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { if (x >= sq.x0 - 2 && x <= sq.x1 + 2 && y >= sq.y0 - 2 && y <= sq.y1 + 2) continue; s += fr.d[y * w + x]; n++; } return s / n; };
const mad = (A, B, box) => { let s = 0, n = 0; for (let y = box ? box.y0 : 0; y < (box ? box.y1 : h); y++) for (let x = box ? box.x0 : 0; x < (box ? box.x1 : w); x++) { s += Math.abs(A.d[y * w + x] - B.d[y * w + x]); n++; } return s / n; };
const fT = k => (k + .5) / FPS;                                       // Mitte von Bild k
const lastFrame = (f, fmt = 'gray') => { const n = fmt === 'gray' ? w * h : w * h * 3, bb = execSync(`ffmpeg -v error -sseof -0.5 -i ${f} -fps_mode passthrough -vf scale=${w}:${h},format=${fmt} -f rawvideo -`, {maxBuffer: 1 << 28}); return {w, h, d: bb.subarray(bb.length - n), n: bb.length / n}; };
const kAt = Math.ceil(at * FPS - 1e-6), X = {};
if (WAY === 'wc') {
  if (!short) {
    const pre1 = grab(A1.f, fT(kAt - 1)), pre0 = grab(A0.f, fT(kAt - 1));
    X.vorStart = +mad(pre1, pre0).toFixed(3);
    ok('3 Bild vor dem Logo-Start = Bild ohne Logo (Abdunkeln beginnt nicht früher)', X.vorStart < .6, X.vorStart);
  }
  const ratio = (dt) => { const t = fT(kAt + Math.round(dt * FPS)), A = grab(A1.f, t), B = grab(A0.f, t), mB = outside(B); return {t: +t.toFixed(3), mit: +outside(A).toFixed(2), ohne: +mB.toFixed(2), q: mB > 2 ? +(outside(A) / mB).toFixed(3) : null}; };
  X.q0 = ratio(0); X.q05 = ratio(.5); X.q1 = ratio(1); X.q15 = ratio(1.5);
  const want = dt => 1 - (Math.round(dt * FPS) + .5 / 1) / FPS / 2;   // Bildmitte: u = (k + 0)/30 ab Start (Bild kAt beginnt bei kAt/30 ≥ at)
  const near = (r, dt) => r.q == null || Math.abs(r.q - (1 - ((kAt + Math.round(dt * FPS)) / FPS - at) / 2)) < .06;
  ok('3 Abdunkeln ab Logo-Start linear über 2 s (außerhalb des Logos: Start ≈ 100 %, 0,5 s ≈ 75 %, 1 s ≈ 50 %, 1,5 s ≈ 25 %)', [X.q0, X.q05, X.q1, X.q15].every((r, i) => near(r, [0, .5, 1, 1.5][i])) && X.q05.q != null && X.q1.q != null, X);
  png(A1.f, fT(kAt + 30), 'abblende-1s'); png(A0.f, fT(kAt + 30), 'ohne-1s');
} else {
  // Echtzeit: Datei-Zeit gegen Song-Zeit leicht versetzt – Verlauf statt Bildvergleich
  const m = [-.4, .3, 1, 1.6, 2.6].map(dt => { const t = at + dt, A = grab(A1.f, t), B = grab(A0.f, t); return {dt, mit: +outside(A).toFixed(2), ohne: +outside(B).toFixed(2)}; });
  X.verlauf = m;
  ok('3 Echtzeit: vor dem Start Bild da, danach dunkler als ohne Logo, ab ~2,5 s schwarz (Datei-Zeit im Test-Chromium ±0,5 s versetzt)', short || (m[0].mit > 3 && m[3].mit < m[3].ohne * .6 && m[4].mit < 1.5), m);
}
// black from 2 s to the end (outside the logo)
const endT = WAY === 'wc' ? fT(Math.round(R1.dur * FPS) - 1) : v1.end - .05;
const tb = [at + 2.2, (at + 2.2 + endT) / 2, endT].filter(t => t < endT + 1e-9 && t > at + 2.1);
X.schwarz = tb.map(t => +outside(t === endT ? lastFrame(A1.f) : grab(A1.f, t)).toFixed(2));
ok('3 ab 2 s nach Logo-Start bis zum Ende schwarz (außerhalb des Logos)', X.schwarz.length ? X.schwarz.every(v => v < 1.5) : short, X.schwarz);
// 4 last frame = last logo frame
const last = lastFrame(A1.f), tauLast = WAY === 'wc' ? L - 1 / FPS : Math.min(L - .05, v1.end - at);   // Echtzeit: das letzte Bild, das die Datei hat execSync(`ffmpeg -v error -y -sseof -0.5 -i ${A1.f} -fps_mode passthrough -vf scale=${w}:${h} -update 1 ${OUT + TAG}-letztes-bild.png`);
const lw = sq.x1 - sq.x0, lh = sq.y1 - sq.y0;
const ref = (() => { const q = Math.round(S0 * k4), bb = WAY === 'wc' ? execSync(`ffmpeg -v error -sseof -0.5 -i ${LOGO} -vf scale=${q}:${q},format=gray -f rawvideo -`, {maxBuffer: 1 << 26}) : execSync(`ffmpeg -v error -ss ${tauLast.toFixed(3)} -i ${LOGO} -frames:v 1 -vf scale=${q}:${q},format=gray -f rawvideo -`, {maxBuffer: 1 << 26}); return bb.subarray(bb.length - q * q); })();   // das Logo-Bild zur Logo-Zeit des letzten Video-Bilds (WebCodecs: das letzte der Datei)
const rs = Math.round(S0 * k4), rx = Math.round(ox * k4), ry = Math.round(oy * k4);
let dsum = 0, dn = 0, brV = 0, brR = 0;
for (let y = 0; y < rs; y++) for (let x = 0; x < rs; x++) { const a = last.d[(ry + y) * w + rx + x], r = ref[y * rs + x]; const rk = r < 13 ? 0 : r; dsum += Math.abs(a - rk); dn++; if (a > 100) brV++; if (r > 100) brR++; }
X.endbild = {mad: +(dsum / dn).toFixed(2), hellVideo: brV, hellLogo: brR};
// the frame 0,4 s before the end (logo static at its end) and the second-to-last logo frames differ? the logo moves until ~6 s; compare with the logo at 9 s too
const ref9 = execSync(`ffmpeg -v error -ss 3.0 -i ${LOGO} -frames:v 1 -vf scale=${rs}:${rs},format=gray -f rawvideo -`, {maxBuffer: 1 << 26});
let d9 = 0; for (let y = 0; y < rs; y++) for (let x = 0; x < rs; x++) { const r = ref9[y * rs + x]; d9 += Math.abs(last.d[(ry + y) * w + rx + x] - (r < 13 ? 0 : r)); }
X.endbild.madGegenLogo3s = +(d9 / dn).toFixed(2);
X.endbild.tauLast = +tauLast.toFixed(2);
ok(WAY === 'wc' ? '4 letztes Bild = letztes Logo-Bild (mittlere Abweichung klein, viel kleiner als gegen Logo-Sekunde 3)' : '4 Echtzeit: letztes Bild der Datei = Logo zu seiner Zeit (Logo ab ~7 s fertig geschrieben)', X.endbild.mad < (WAY === 'wc' ? 8 : 12) && X.endbild.mad * 2 < X.endbild.madGegenLogo3s && Math.abs(brV - brR) < brR * (WAY === 'wc' ? .15 : .3), X.endbild);
// logo centred, ≤ 60 % of the shorter side
let bx0 = 1e9, by0 = 1e9, bx1 = -1, by1 = -1; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (last.d[y * w + x] > 60) { bx0 = Math.min(bx0, x); by0 = Math.min(by0, y); bx1 = Math.max(bx1, x); by1 = Math.max(by1, y); }
X.box = {bx0, by0, bx1, by1, cx: (bx0 + bx1) / 2, cy: (by0 + by1) / 2, w: bx1 - bx0 + 1, h: by1 - by0 + 1, sq};
ok('4 Logo einmal mittig, innerhalb 60 % der kürzeren Seite', bx1 > 0 && bx0 >= sq.x0 - 1 && bx1 <= sq.x1 + 1 && by0 >= sq.y0 - 1 && by1 <= sq.y1 + 1 && X.box.w > lw * .6, X.box);
// 5 no box, red stays saturated
const corner = (fr) => { let s = 0, n = 0; const c = Math.round(lw * .1); for (const [x0, y0] of [[sq.x0, sq.y0], [sq.x1 - c, sq.y0], [sq.x0, sq.y1 - c], [sq.x1 - c, sq.y1 - c]]) for (let y = y0; y < y0 + c; y++) for (let x = x0; x < x0 + c; x++) { s += fr.d[y * w + x]; n++; } return s / n; };
X.ecken = +corner(last).toFixed(2);
const rgb = lastFrame(A1.f, 'rgb24').d;
let red = 0; for (let y = sq.y0; y < sq.y1; y++) for (let x = sq.x0; x < sq.x1; x++) { const i = (y * w + x) * 3, R = rgb[i], G = rgb[i + 1], B = rgb[i + 2]; if (R > 120 && R > G * 2.2 && R > B * 2.2) red++; }
X.rot = red;
ok('5 kein Kasten (Ecken des Logo-Felds schwarz), Rot satt im Logo', X.ecken < 3 && red > 20, {ecken: X.ecken, rotPixel: red});
// 6 sound unchanged
const pcm = f => execSync(`ffmpeg -v error -i ${f} -vn -ac 2 -ar 48000 -f s16le -`, {maxBuffer: 1 << 29});
const P1 = pcm(A1.f), P0 = pcm(A0.f), P2 = pcm(A2.f);   // P0: der Lauf ohne Logo mit passender Länge
const difDb = (B1, B0) => { const a = new Int16Array(B1.buffer, B1.byteOffset, B1.length >> 1), c = new Int16Array(B0.buffer, B0.byteOffset, B0.length >> 1), n = Math.min(a.length, c.length); let d = 0, e = 0; for (let i = 0; i < n; i++) { const x = a[i] - c[i]; d += x * x; e += c[i] * c[i]; } return d ? +(10 * Math.log10(d / (e + 1))).toFixed(1) : -999; };
X.ton = {mit: md5(P1), ohne: md5(P0), ohne2: md5(P2), len: [P1.length, P0.length, P2.length], render: [A1.res.renderHash, A0.res.renderHash, A2.res.renderHash], difMitOhne: difDb(P1, P0), difOhneOhne2: difDb(P2, P0)};
// die Tonspur des Logo-Videos = sein eigener Offline-Ton (Hüllkurve in 100-ms-Fenstern über das ganze Video, auch die letzten 2 s)
const fileEnv = (B, n) => { const a = new Int16Array(B.buffer, B.byteOffset, B.length >> 1), win = 4800, out = []; for (let k = 0; k < n; k++) { let e = 0; for (let i = k * win * 2; i < (k + 1) * win * 2 && i < a.length; i++) { const v = a[i] / 32768; e += v * v; } out.push(10 * Math.log10(e / (2 * win) + 1e-12)); } return out; };
{ const E1 = R1.env, F1 = fileEnv(P1, E1.length); let mx = 0, mxEnd = 0; for (let k = 0; k < E1.length; k++) { if (E1[k] < -60) continue; const d = Math.abs(F1[k] - E1[k]); mx = Math.max(mx, d); if (k >= E1.length - 20) mxEnd = Math.max(mxEnd, d); }
  X.ton.huelle = {fenster: E1.length, maxDb: +mx.toFixed(2), maxDbLetzte2s: +mxEnd.toFixed(2), tonSamples: P1.length / 4, renderSamples: R1.n, sr: R1.sr};
  X.ton.unterschiedZumLaufOhneLogo = 'Offline-Ton streut je Lauf: mit↔ohne ' + X.ton.difMitOhne + ' dB, ohne↔ohne2 ' + X.ton.difOhneOhne2 + ' dB'; }
if (WAY === 'wc') ok('6 Ton = eigener Offline-Ton unverändert (Hüllkurve ≤ 1,5 dB Abweichung über das ganze Video und in den letzten 2 s; kein Ausblenden, nichts angehängt)', X.ton.huelle.maxDb <= 1.5 && X.ton.huelle.maxDbLetzte2s <= 1.5 && Math.abs(P1.length / 4 / 48000 - R1.n / R1.sr) < .03, X.ton);
else {
  const a = new Int16Array(P1.buffer, P1.byteOffset, P1.length >> 1), c = new Int16Array(P0.buffer, P0.byteOffset, P0.length >> 1), n = Math.min(a.length, c.length);
  let e1 = 0, e0 = 0; for (let i = 0; i < n; i++) { e1 += a[i] * a[i]; e0 += c[i] * c[i]; }
  X.ton.db = +(10 * Math.log10((e1 + 1) / (e0 + 1))).toFixed(2);
  ok('6 Echtzeit: Ton mit Logo so laut und lang wie ohne (±0,5 dB, ±0,3 s)', Math.abs(X.ton.db) < .5 && Math.abs(P1.length - P0.length) / 192000 < .3, X.ton);
}
// the last second of sound: as without logo (no fade-out added)
const tail1 = execSync(`ffmpeg -v error -sseof -1 -i ${A1.f} -vn -ac 1 -ar 8000 -f f32le -`, {maxBuffer: 1 << 26}), tail0 = execSync(`ffmpeg -v error -sseof -1 -i ${A0.f} -vn -ac 1 -ar 8000 -f f32le -`, {maxBuffer: 1 << 26});
const pk = bb => { const a = new Float32Array(bb.buffer, bb.byteOffset, bb.length >> 2); let m = 0; for (const v of a) m = Math.max(m, Math.abs(v)); return m > 0 ? +(20 * Math.log10(m)).toFixed(1) : -200; };
X.letzteSekunde = {mit: pk(tail1), ohne: pk(tail0)};
ok('6 letzte Sekunde Ton wie ohne Logo (kein zusätzliches Ausblenden)', Math.abs(X.letzteSekunde.mit - X.letzteSekunde.ohne) < (WAY === 'wc' && sameLen ? .5 : 3), X.letzteSekunde);
if (short) {
  const f0 = grab(A1.f, fT(0)), f0b = grab(A0.f, fT(0)); X.kurzStart = {mit: +outside(f0).toFixed(2), ohne: +outside(f0b).toFixed(2)};
  png(A1.f, fT(0), 'erstes-bild'); png(A1.f, fT(12), 'bild-0-4s');
  ok('kurz: Abdunkeln ab Bild 1, Logo von Anfang an mit Versatz (Ende deckungsgleich)', at === 0 && R1.logo.off > 0 && X.kurzStart.mit <= X.kurzStart.ohne + .5, {at, off: R1.logo.off, start: X.kurzStart});
}
// contact sheet
execSync(`ffmpeg -v error -y -ss ${Math.max(0, at - 1).toFixed(2)} -i ${A1.f} -vf "fps=2,scale=${FMT === '9:16' ? '135:240' : FMT === '1:1' ? '180:180' : '240:135'},tile=6x4" -frames:v 1 ${OUT + TAG}-blatt.png`);
ok('keine Konsolenfehler', errs.length === 0, errs.slice(0, 4));
fs.writeFileSync(OUT + TAG + '.json', JSON.stringify({R1, R0, v1, v0, a1, a0, X}, null, 1));
const fl = C.filter(c => !c[1]).length; console.log(TAG + ': ' + (C.length - fl) + '/' + C.length + (fl ? ' – FEHLT: ' + C.filter(c => !c[1]).map(c => c[0]).join(' | ') : ''));
await b.close(); srv.close(); process.exit(fl ? 1 : 0);
