// Prüfung SPK8: andere Bass-Linien mit dem App-Synth (Spur 0 der Demo) rendern – nur die Bass-Spur, Rest kommt aus spk/mess.
// Aufruf: node render2.mjs <abs. app.html> <abs. ausgabe-ordner>
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const file = path.resolve(process.argv[2]), out = path.resolve(process.argv[3]); fs.mkdirSync(out, {recursive: true});
const srv = http.createServer((q, r) => { const p = path.join(path.dirname(file), decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': 'text/html; charset=utf-8'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok));
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 428, height: 926}});
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto('http://127.0.0.1:' + srv.address().port + '/' + path.basename(file));
await p.waitForFunction(() => window.SYNQUENZER && window.__spk, null, {timeout: 60000}); await p.waitForTimeout(1000);
// Muster: [Schlag, Ton, Dauer (Schläge), Anschlag]; len = Takte des Clips
const PAT = JSON.parse(process.env.PATS || "{}"); const PAT_ALT = {
  walk: {len: 2, notes: [28, 31, 33, 35, 36, 38, 40, 43, 45, 43, 41, 40, 38, 36, 35, 31].map((m, i) => [i * 0.5, m, 0.4, 0.8])},
  okt: {len: 1, notes: [33, 45, 33, 45, 31, 43, 31, 43].map((m, i) => [i * 0.5, m, 0.2, 0.8])},
  lang: {len: 2, notes: [[0, 36, 3.8, 0.8], [4, 41, 3.8, 0.8]]},
  sech: {len: 1, notes: [36, 36, 48, 36, 36, 43, 36, 40, 36, 36, 48, 36, 38, 38, 50, 38].map((m, i) => [i * 0.25, m, 0.18, 0.8])},
};
const res = {};
for (const [name, P] of Object.entries(PAT)) {
  const r = await p.evaluate(async (P) => {
    SYNQUENZER.loadDemo(); SYNQUENZER.songFromChain([{scene: 0, bars: 4}, {scene: 1, bars: 4}]); ensureAudio(); await new Promise(r => setTimeout(r, 300));
    if (P.snd) Object.assign(S.tracks[0].sound.p, P.snd); S.tracks[0].clips[0] = {len: P.len, key: {root: 0, scale: 'ionian', src: 'auto'}, notes: P.notes.map(a => ({t: a[0], n: a[1], d: a[2], v: a[3]}))};
    const r = await va1Pass({tracks: new Set([0]), vox: 'none'}, true, () => {});
    const n = r.n, o = new Float32Array(n * 2); for (let i = 0; i < n; i++) { o[2 * i] = r.ch[0][i]; o[2 * i + 1] = r.ch[1][i]; }
    window.__last = o; return {n, sr: r.sr, bpm: S.bpm};
  }, P);
  const chunks = []; for (let a = 0; a < r.n * 2; a += 1 << 20) chunks.push(await p.evaluate(([a, b]) => Array.from(window.__last.subarray(a, b)), [a, Math.min(r.n * 2, a + (1 << 20))]));
  const f = new Float32Array(r.n * 2); let o = 0; for (const c of chunks) { f.set(c, o); o += c.length; }
  fs.mkdirSync(path.join(out, name), {recursive: true}); fs.writeFileSync(path.join(out, name, 'spur0.f32'), Buffer.from(f.buffer));
  fs.writeFileSync(path.join(out, name, 'pat.json'), JSON.stringify(P)); res[name] = r; console.log(name, JSON.stringify(r));
}
console.log('errs', errs);
await b.close(); srv.close();
