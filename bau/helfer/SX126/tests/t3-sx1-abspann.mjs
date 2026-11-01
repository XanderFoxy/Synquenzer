// SX1 + Abspann-Logo im fertigen Video: die Musik blendet bis zum Ende des Songs/der Auswahl aus (dort < −60 dBFS), der Abspann
// (Abdunkeln + Logo) schließt direkt an und ist still; Videolänge = Song + Abspann; ohne Ausblenden unverändert (Ausklang)
import { open, SONG8, OUT, APP, db } from './sx-lib.mjs';
import fs from 'fs'; import path from 'path'; import { execSync } from 'child_process';
const TMP = path.resolve(OUT, 'abspann-app'); fs.mkdirSync(TMP + '/medien', {recursive: true});
fs.copyFileSync(APP, TMP + '/index.html');
for (const f of ['fonts', 'vendor']) { const src = path.resolve(path.dirname(APP), '../../..', f); if (fs.existsSync(src) && !fs.existsSync(TMP + '/' + f)) fs.symlinkSync(src, TMP + '/' + f); }
const LOGO = TMP + '/medien/abspann-logo.mp4';
if (!fs.existsSync(LOGO)) execSync(`ffmpeg -v error -y -f lavfi -i "color=c=black:s=320x320:d=2:r=30,drawbox=x=100:y=100:w=120:h=120:color=red:t=fill" -c:v libx264 -pix_fmt yuv420p ${LOGO}`);
// das Logo kommt nur über http(s) (VV-LOGO): ein kleiner lokaler Server für den Testordner
import http from 'http';
const MIME = {'.html': 'text/html', '.mp4': 'video/mp4', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.json': 'application/json', '.png': 'image/png'};
const srv = http.createServer((q, s) => { const f = path.join(TMP, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); s.end(); return; } s.writeHead(200, {'content-type': MIME[path.extname(f)] || 'application/octet-stream'}); s.end(d); }); });
await new Promise(r => srv.listen(0, '127.0.0.1', r)); const PORT = srv.address().port;
const res = {}; let ok = true;
const {b, p, errs} = await open({url: `http://127.0.0.1:${PORT}/index.html`});
await p.evaluate(s => SYNQUENZER.setSong(s), SONG8);
const lg = await p.evaluate(() => SYNQUENZER.vvLogo({reload: true, pref: true})); res.logo = lg;
const probe = f => JSON.parse(execSync(`ffprobe -v error -show_entries stream=codec_type,duration:format=duration -of json ${f}`).toString());
const pcm = f => { const raw = execSync(`ffmpeg -v error -i ${f} -vn -ac 1 -ar 48000 -f f32le -`, {maxBuffer: 1 << 28}); return new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4); };
const peakAt = (x, t0, t1) => { let m = 0; for (let k = Math.max(0, Math.round(t0 * 48000)); k < Math.min(x.length, Math.round(t1 * 48000)); k++) m = Math.max(m, Math.abs(x[k])); return m; };
for (const [tag, bars, range] of [['ohne', 0, null], ['2takte', 2, null], ['auswahl-4takte', 4, {a: 0, b: 6}]]) {
  const m = await p.evaluate(async ([bars, range]) => { SYNQUENZER.sx1Fade(bars); SYNQUENZER.vvTest({opus: true}); const o = {fmt: '9:16', view: 'song'}; if (range) o.range = range; const r = await SYNQUENZER.vvMake(o); return r; }, [bars, range]);
  const bl = await p.evaluate(() => SYNQUENZER.vvBlob()); const f = OUT + '/abspann-' + tag + '.' + bl.ext; fs.writeFileSync(f, Buffer.from(bl.b64, 'base64'));
  const pr = probe(f), x = pcm(f), bs = await p.evaluate(() => spb());
  const song = m.songSec, tail = m.tail, total = +pr.format.duration;
  const r = {how: m.how, songSec: +song.toFixed(3), tail: +tail.toFixed(3), datei: +total.toFixed(3), soll: null,
    spitzeVorEnde1Schlag: +db(peakAt(x, song - 2 * bs, song - bs)).toFixed(1), spitzeLetzterSchlag: +db(peakAt(x, song - bs * .1, song)).toFixed(1),
    spitzeImAbspann: +db(peakAt(x, song + tail + .05, total)).toFixed(1), spitzeAnfang: +db(peakAt(x, 0, bs * 4)).toFixed(1)};
  const outro = lg.on ? Math.max(1, .5 + lg.dur) + .5 : 0; r.soll = +(song + tail + outro).toFixed(3);
  r.ok = Math.abs(total - r.soll) < .15 && r.spitzeImAbspann < -60 && r.spitzeAnfang > -20 && (bars ? tail === 0 && r.spitzeLetzterSchlag < -55 : tail > .5);
  res[tag] = r; ok = ok && r.ok;
}
await p.evaluate(() => { SYNQUENZER.sx1Fade(0); SYNQUENZER.vvTest({}); });
res.errors = errs.filter(e => !/favicon|ERR_FILE_NOT_FOUND/.test(e)); ok = ok && lg.on && !res.errors.length;
console.log(JSON.stringify(res, null, 1)); console.log(ok ? 'OK' : 'FEHLER');
fs.writeFileSync(OUT + '/t3-sx1-abspann.json', JSON.stringify(res, null, 1));
await b.close(); srv.close(); process.exit(ok ? 0 : 1);
