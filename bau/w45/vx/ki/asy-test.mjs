// Vergleich CPU-Zeit eines Stücks (320 Frames, ein Modell): WASM-Bündel (simd) gegen WebGPU-Bündel (asyncify) mit EP wasm
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const { chromium } = createRequire('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vx/spk/')('playwright');
const WEB = process.argv[2], ORT = process.argv[3], MOD = process.argv[4];
const ty = f => f.endsWith('.wasm') ? 'application/wasm' : /m?js$/.test(f) ? 'text/javascript' : f.endsWith('.html') ? 'text/html' : 'application/octet-stream';
const srv = http.createServer((q, s) => { let u = decodeURIComponent(q.url.split('?')[0]); if (u === '/') u = '/index.html'; const f = u.startsWith('/m/') ? path.join(MOD, u.slice(3)) : u.startsWith('/ort/') ? path.join(ORT, u.slice(5)) : path.join(WEB, u); fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); s.end(); return; } s.writeHead(200, {'content-type': ty(f)}); s.end(d); }); });
await new Promise(ok => srv.listen(0, ok));
const b = await chromium.launch(); const p = await b.newPage();
await p.goto('http://127.0.0.1:' + srv.address().port + '/');
for (const o of [{bundle: 'ort.wasm.min.mjs', ep: 'wasm'}, {bundle: 'ort.webgpu.min.mjs', ep: 'wasm'}, {bundle: 'ort.wasm.min.mjs', ep: 'wasm'}]) console.log(JSON.stringify(await p.evaluate(o => window.runIt(o), o)));
await b.close(); srv.close();
