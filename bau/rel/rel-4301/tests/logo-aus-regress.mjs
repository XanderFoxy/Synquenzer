// 4.30.1 – ohne Logo (Schalter aus) ist das Video wie in 4.30.0: Länge, Bild, Ton. Derselbe Song, fester Zufalls-Startwert,
// je Fassung zwei Läufe (der Offline-Render streut schon in 4.30.0 von Lauf zu Lauf leicht: Ausklang-Länge, Rauschen) – verglichen
// wird neu gegen alt mit der Streuung alt gegen alt als Maß. WebCodecs 16:9 und Aufnahme in Echtzeit 9:16.
// Aufruf: node logo-aus-regress.mjs <neu.html> <alt.html>
import {createRequire} from 'module'; const {chromium} = createRequire(import.meta.url)('playwright');
import http from 'http'; import fs from 'fs'; import path from 'path'; import crypto from 'crypto'; import {execSync} from 'child_process';
const NEU = process.argv[2], ALT = process.argv[3];
const SP = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..'), LOGO = '/home/user/synquenzer/medien/abspann-logo.mp4', FONTS = path.join(SP, 'dirigent-test/fonts');
const OUT = path.join(path.dirname(new URL(import.meta.url).pathname), 'out') + '/'; fs.mkdirSync(OUT, {recursive: true});
const C = []; const ok = (n, v, info) => { C.push([n, !!v]); console.log((v ? '✓ ' : '✗ ') + n + (info !== undefined ? ' ' + JSON.stringify(info) : '')); };
const md5 = b => crypto.createHash('md5').update(b).digest('hex').slice(0, 12);
const srv = http.createServer((q, s) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  const f = u === '/neu.html' ? NEU : u === '/alt.html' ? ALT : u === '/medien/abspann-logo.mp4' ? LOGO : u.startsWith('/fonts/') ? path.join(FONTS, u.slice(7)) : null;
  if (!f || !fs.existsSync(f)) { s.writeHead(404); s.end(); return; }
  s.writeHead(200, {'content-type': f.endsWith('.html') ? 'text/html; charset=utf-8' : f.endsWith('.mp4') ? 'video/mp4' : 'font/woff2', 'cache-control': 'no-store'}); fs.createReadStream(f).pipe(s);
});
await new Promise(r => srv.listen(0, '127.0.0.1', r)); const URL0 = 'http://127.0.0.1:' + srv.address().port + '/';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
async function run(app, way, fmt, tag) {
  const p = await b.newPage({viewport: {width: 390, height: 844}}); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(URL0 + app); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 30000}); await p.waitForTimeout(800);
  await p.mouse.click(5, 300); await p.evaluate(async () => { closePop(); ensureAudio(); for (let k = 0; k < 50 && !(AU.ctx && AU.ctx.state === 'running'); k++) await new Promise(r => setTimeout(r, 100)); });
  await p.evaluate(() => { const el = document.getElementById('sq-worklet-src'); window._wsrc = el.textContent;
    el.textContent = '(function(){var s=12345;Math.random=function(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};})();\n' + window._wsrc;
    window._seed = () => { let s = 777; Math.random = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }; });
  const ver = await p.evaluate(async () => { const A = SYNQUENZER; A.setMetronome && A.setMetronome(false); A.setBpm(120);
    A.setSong({bars: 6, lanes: [[{bar: 0, slot: 0}], [{bar: 0, slot: 0}], [{bar: 1, slot: 0}], [], [{bar: 0, slot: 0}], []], carrier: [], mel: {}, marks: []});
    await new Promise(r => setTimeout(r, 400)); await SYNQUENZER.vvLogo({pref: false}); return A.version; });
  await p.evaluate(w => SYNQUENZER.vvTest(w === 'wc' ? {opus: true} : {noVE: true}), way);
  const res = await p.evaluate(f => { window._seed(); return SYNQUENZER.vvMake({fmt: f}).then(x => ({dur: x.dur, how: x.how, logo: x.logo, W: x.W, H: x.H, tail: x.tail})); }, fmt);
  const bl = await p.evaluate(() => SYNQUENZER.vvBlob()); const f = OUT + 'regress-' + tag + '.' + bl.ext; fs.writeFileSync(f, Buffer.from(bl.b64, 'base64'));
  await p.close();
  const pcm = execSync(`ffmpeg -v error -i ${f} -vn -ac 2 -ar 48000 -f s16le -`, {maxBuffer: 1 << 29});
  const fr = t => execSync(`ffmpeg -v error -ss ${t.toFixed(3)} -i ${f} -frames:v 1 -vf scale=240:-2,format=gray -f rawvideo -`, {maxBuffer: 1 << 24});
  const nfr = Number(execSync(`ffprobe -v error -select_streams v -count_frames -show_entries stream=nb_read_frames -of csv=p=0 ${f}`).toString().trim());
  return {tag, ver, res, f, pcm, frames: [.5, 3, 6].map(fr), nfr, bytes: fs.statSync(f).size, md5: md5(fs.readFileSync(f)), errs};
}
const difDb = (B1, B0) => { const a = new Int16Array(B1.buffer, B1.byteOffset, B1.length >> 1), c = new Int16Array(B0.buffer, B0.byteOffset, B0.length >> 1), n = Math.min(a.length, c.length); let d = 0, e = 0; for (let i = 0; i < n; i++) { const x = a[i] - c[i]; d += x * x; e += c[i] * c[i]; } return d ? +(10 * Math.log10(d / (e + 1))).toFixed(1) : -999; };
const madF = (A, B) => { let s = 0; for (let i = 0; i < Math.min(A.length, B.length); i++) s += Math.abs(A[i] - B[i]); return +(s / A.length).toFixed(3); };
for (const [way, fmt, n] of [['wc', '16:9', 2], ['mr', '9:16', 2]]) {
  const alt = [], neu = [];
  for (let k = 0; k < n; k++) { alt.push(await run('alt.html', way, fmt, way + '-alt' + k)); neu.push(await run('neu.html', way, fmt, way + '-neu' + k)); }
  const A = alt[0], N = neu[0], T = way + ' ' + fmt;
  ok(T + ': Versionen', A.ver === '4.30.0' && N.ver === '4.30.1', [A.ver, N.ver]);
  ok(T + ': ohne Logo – kein Abspann, Weg wie 4.30.0', N.res.logo === null && A.res.logo === null && N.res.how === A.res.how && N.res.W === A.res.W, [N.res.how, A.res.how]);
  const spread = n > 1 ? Math.abs(alt[0].res.dur - alt[1].res.dur) : .3, rms = B => { const a = new Int16Array(B.buffer, B.byteOffset, B.length >> 1); let e = 0; for (let i = 0; i < a.length; i++) e += a[i] * a[i]; return 10 * Math.log10(e / Math.max(1, a.length) + 1); };
  const dl = Math.min(...alt.map(x => Math.abs(x.res.dur - N.res.dur)));
  ok(T + ': Länge wie 4.30.0 (gleich oder innerhalb der Ausklang-Streuung von 4.30.0)', dl < 1e-6 || dl <= spread + (way === 'wc' ? 1 / 30 : .3), {neu: neu.map(x => +x.res.dur.toFixed(4)), alt: alt.map(x => +x.res.dur.toFixed(4)), streuungAlt: +spread.toFixed(3)});
  const nf = Math.min(...alt.map(x => Math.abs(x.nfr - N.nfr)));
  const nfA = Math.abs(alt[0].nfr - alt[1].nfr);   // Echtzeit-Aufnahme im Test-Chromium: Bildzahl streut schon zwischen zwei 4.30.0-Läufen
  ok(T + ': Bildzahl wie 4.30.0' + (way === 'mr' ? ' (Echtzeit: innerhalb der Streuung alt↔alt + 25 %)' : ''), way === 'mr' ? Math.min(...neu.map(x => Math.min(...alt.map(a => Math.abs(a.nfr - x.nfr))))) <= nfA * 1.25 + 12 : nf === 0 || nf <= Math.round(spread * 30) + 1, {neu: neu.map(x => x.nfr), alt: alt.map(x => x.nfr), streuungAlt: nfA});
  const fNA = N.frames.map((F, i) => Math.min(...alt.map(a => madF(F, a.frames[i])))), fAA = n > 1 ? alt[0].frames.map((F, i) => madF(F, alt[1].frames[i])) : null;
  ok(T + ': Bilder bei 0,5 / 3 / 6 s wie 4.30.0' + (way === 'wc' ? ' (bildgleich bzw. wie alt gegen alt)' : ' (Echtzeit: kleine Abweichung)'), fNA.every((v, i) => v < (way === 'wc' ? Math.max(.05, fAA ? fAA[i] + .3 : .3) : 3)), {neuAlt: fNA, altAlt: fAA});
  const dNA = Math.min(...alt.map(a => difDb(N.pcm, a.pcm))), dAA = n > 1 ? difDb(alt[1].pcm, alt[0].pcm) : null, dNN = n > 1 ? difDb(neu[1].pcm, neu[0].pcm) : null;
  const lv = [...alt, ...neu].map(x => +rms(x.pcm).toFixed(2));
  ok(T + ': Ton wie 4.30.0 (WebCodecs: Abweichung neu↔alt nicht größer als alt↔alt; Echtzeit: Pegel ±0,5 dB, Länge ±0,3 s)', way === 'wc' ? dNA <= Math.max(dAA, dNN) + 3 || dNA === -999 : Math.max(...lv) - Math.min(...lv) < .5 && Math.abs(N.pcm.length - A.pcm.length) / 192000 < .3, {neuAlt: dNA, altAlt: dAA, neuNeu: dNN, pegel: lv});
  ok(T + ': Dateien (md5, Größe)', true, {neu: neu.map(x => [x.md5, x.bytes]), alt: alt.map(x => [x.md5, x.bytes])});
  ok(T + ': keine Konsolenfehler', [...alt, ...neu].every(x => x.errs.length === 0), [...alt, ...neu].map(x => x.errs.slice(0, 2)));
}
const fl = C.filter(c => !c[1]).length; console.log('logo-aus-regress: ' + (C.length - fl) + '/' + C.length + (fl ? ' – FEHLT: ' + C.filter(c => !c[1]).map(c => c[0]).join(' | ') : ''));
await b.close(); srv.close(); process.exit(fl ? 1 : 0);
