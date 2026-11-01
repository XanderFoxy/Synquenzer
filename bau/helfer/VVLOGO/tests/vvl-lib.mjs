// VV-LOGO tests: shared helpers — a local http server (the app + medien/ mapped to the test animation), the page, a short song,
// ffmpeg/ffprobe measurements. The test animation lives in tests/ (no file in medien/ of the repository).
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path'; import { execSync } from 'child_process';
export const DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
export const OUT = path.join(DIR, 'tests', 'out') + '/';
const FONTS = path.resolve(DIR, '../../../fonts');
fs.mkdirSync(OUT, {recursive: true});
const TYPES = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.woff2': 'font/woff2', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json'};
// mode: 'mp4' (medien/abspann-logo.mp4), 'mov' (only .mov), 'none' (both 404), 'bad' (.mp4 is not a video, .mov missing)
export function serve(mode, app = 'index.html') {
  const hits = [];
  const srv = http.createServer((q, s) => {
    let u = decodeURIComponent(q.url.split('?')[0]); hits.push(u);
    let f = null;
    if (u.startsWith('/medien/')) {
      const nm = u.slice(8);
      if (mode === 'mp4' && nm === 'abspann-logo.mp4') f = path.join(DIR, 'tests', 'test-logo.mp4');
      if (mode === 'mov' && nm === 'abspann-logo.mov') f = path.join(DIR, 'tests', 'test-logo.mov');
      if (mode === 'bad' && nm === 'abspann-logo.mp4') { s.writeHead(200, {'content-type': 'video/mp4'}); s.end('kein video'); return; }
    } else if (u.startsWith('/fonts/')) f = path.join(FONTS, u.slice(7));
    else if (u === '/R-4261.html') f = path.resolve(DIR, '../../snapshots/R-4261.html');   // the base for comparisons
    else f = path.join(DIR, u === '/' ? app : u.slice(1));
    if (!f || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { s.writeHead(404, {'content-type': 'text/plain'}); s.end('404'); return; }
    s.writeHead(200, {'content-type': TYPES[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-store'}); fs.createReadStream(f).pipe(s);
  });
  return new Promise(res => srv.listen(0, '127.0.0.1', () => res({srv, hits, url: `http://127.0.0.1:${srv.address().port}/`, close: () => new Promise(r => srv.close(r))})));
}
export async function open(url, o = {}) {
  const b = o.browser || await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = o.ctx || await b.newContext({viewport: {width: o.w || 390, height: o.h || 844}, deviceScaleFactor: 1, hasTouch: !!o.touch, isMobile: !!o.touch});
  const p = await ctx.newPage();
  const errs = [], net404 = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + String(e)));
  p.on('console', m => { if (m.type() !== 'error') return; const t = m.text(); if (/Failed to load resource: the server responded with a status of 404/.test(t)) net404.push(t); else errs.push(t); });
  await p.goto(url + (o.app || 'index.html')); await p.waitForTimeout(1200);
  if (o.touch) await p.touchscreen.tap(5, 300); else await p.mouse.click(5, 300);
  await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 15000}).catch(() => {});
  await p.waitForTimeout(300);
  return {b, ctx, p, errs, net404};
}
// a short song with sound (4 bars, the default clips)
export async function song(p, bars = 4) {
  return p.evaluate(async bars => {
    const A = SYNQUENZER; A.setMetronome && A.setMetronome(false);
    A.setSong({bars, lanes: [[{bar: 0, slot: 0}], [{bar: 0, slot: 0}], [{bar: 1, slot: 0}], [], [{bar: 0, slot: 0}], []], carrier: [], mel: {}, marks: []});
    await new Promise(r => setTimeout(r, 400));
    return {bars: S.song.bars, bpm: S.bpm};
  }, bars);
}
export const saveBlob = async (p, name) => { const bl = await p.evaluate(() => SYNQUENZER.vvBlob()); const f = OUT + name + '.' + bl.ext; fs.writeFileSync(f, Buffer.from(bl.b64, 'base64')); return f; };
export const probe = f => JSON.parse(execSync(`ffprobe -v error -show_entries stream=codec_type,codec_name,width,height,duration:format=duration -of json ${f}`).toString());
// decoded end times of a stream (last pts + duration)
export const decEnd = (f, sel) => { const o = execSync(`ffprobe -v error -select_streams ${sel} -show_entries frame=pts_time,duration_time,pkt_duration_time -of csv=p=0 ${f}`, {maxBuffer: 1 << 28}).toString().trim().split('\n').map(l => l.split(',').map(Number)); let mx = 0; for (const r of o) { const t = r[0], d = isFinite(r[1]) ? r[1] : (isFinite(r[2]) ? r[2] : 0); if (isFinite(t)) mx = Math.max(mx, t + d); } return {end: +mx.toFixed(3), frames: o.length}; };
// one decoded frame at time t as gray pixels (scaled to w × h) + PNG
export function frame(f, t, w, h, png) {
  if (png) execSync(`ffmpeg -v error -y -ss ${t.toFixed(3)} -i ${f} -frames:v 1 -vf scale=${w}:${h} ${png}`);
  const buf = execSync(`ffmpeg -v error -ss ${t.toFixed(3)} -i ${f} -frames:v 1 -vf scale=${w}:${h},format=gray -f rawvideo -`, {maxBuffer: 1 << 26});
  return {w, h, d: buf};
}
export const mean = (fr, x0 = 0, y0 = 0, x1 = fr.w, y1 = fr.h) => { let s = 0, n = 0; for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { s += fr.d[y * fr.w + x]; n++; } return n ? s / n : 0; };
// bounding box of pixels brighter than thr
export const bbox = (fr, thr = 60) => { let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; for (let y = 0; y < fr.h; y++) for (let x = 0; x < fr.w; x++) if (fr.d[y * fr.w + x] > thr) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return x1 < 0 ? null : {x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: x1 - x0 + 1, h: y1 - y0 + 1}; };
// the audio as mono float (abs max of both channels) at 8 kHz, peak dBFS per window
export function audio(f) { const b = execSync(`ffmpeg -v error -i ${f} -vn -ac 2 -ar 8000 -f f32le -`, {maxBuffer: 1 << 28}); const a = new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4); return {sr: 8000, a}; }
export const peakDb = (au, t0, t1) => { let pk = 0; const i0 = Math.max(0, Math.round(t0 * au.sr) * 2), i1 = Math.min(au.a.length, Math.round(t1 * au.sr) * 2); for (let i = i0; i < i1; i++) pk = Math.max(pk, Math.abs(au.a[i])); return pk > 0 ? +(20 * Math.log10(pk)).toFixed(1) : -200; };
export const rmsDb = (au, t0, t1) => { let s = 0, n = 0; const i0 = Math.max(0, Math.round(t0 * au.sr) * 2), i1 = Math.min(au.a.length, Math.round(t1 * au.sr) * 2); for (let i = i0; i < i1; i++) { s += au.a[i] * au.a[i]; n++; } return n && s > 0 ? +(10 * Math.log10(s / n)).toFixed(1) : -200; };
export function report(name, checks, extra) {
  const ok = checks.filter(c => c[1]).length, all = checks.length;
  const o = {name, ok, all, fail: checks.filter(c => !c[1]).map(c => c[0] + (c[2] !== undefined ? ' → ' + JSON.stringify(c[2]) : '')), checks: checks.map(c => [c[0], !!c[1], c[2]]), extra};
  fs.writeFileSync(OUT + name + '.json', JSON.stringify(o, null, 1));
  console.log(name + ': ' + ok + '/' + all + (o.fail.length ? '\n  FEHLT: ' + o.fail.join('\n  FEHLT: ') : ''));
  return o;
}
