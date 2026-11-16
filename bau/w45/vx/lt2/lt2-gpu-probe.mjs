// LT2 Ursachen-Probe: Grafik-Kosten je Teil im Kopflos-Chromium (SwiftShader): Zeichnen der Vollfläche, Hochladen + Mipmaps einer Kachel, Zurücklesen.
// Aufruf: node lt2-gpu-probe.mjs <html> [WxH]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const F = path.resolve(process.argv[2]); const [W, H] = (process.argv[3] || '926x428').split('x').map(Number);
const srv = http.createServer((q, r) => { r.writeHead(200, {'content-type': 'text/html; charset=utf-8'}); fs.createReadStream(F).pipe(r); }); await new Promise(ok => srv.listen(0, ok));
const b = await chromium.launch({args: ['--disable-renderer-backgrounding']}); const ctx = await b.newContext({viewport: {width: W, height: H}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}); const p = await ctx.newPage();
await p.goto('http://127.0.0.1:' + srv.address().port + '/x.html'); await p.waitForFunction(() => window.SYNQUENZER && window.__spk, null, {timeout: 90000}); await p.waitForTimeout(500);
await p.evaluate(async () => { await __spk.page.open({}); const sr = 44100, n = 90 * sr, x = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / sr; x[i] = 0.15 * Math.sin(2 * Math.PI * 440 * t) * (1 + Math.sin(t)) + 0.1 * Math.sin(2 * Math.PI * (220 + 30 * Math.sin(t * 0.7)) * t); } const r = await __spk.load({name: 'P', sr, ch: [x]}); await __spk.page.open({id: r.meta.id}); });
await p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc && i.chunks > 0 && !/Spektrum \d/.test(i.stat) && !__spk.page.ui().specQ; }, null, {timeout: 300000}); await p.waitForTimeout(1500);
const r = await p.evaluate(() => { const U = __spk.page.ui(), G = U.gl, gl = G.gl, c = U.spec.chunks.find(Boolean), out = {cw: U.cw, ch: U.ch, chunk: [c.w, c.R], draw: [], drawTint0: [], up: [], upNoMip: [], mip: [], read: [], upFlushThenDraw: []};
  const fin = () => { const px = new Uint8Array(4); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); };
  const T = f => { fin(); const t = performance.now(); f(); fin(); return +(performance.now() - t).toFixed(1); };
  for (let i = 0; i < 6; i++) {
    out.draw.push(T(() => spk1GlDraw(U)));
    out.up.push(T(() => { const t = G.tex(c.w, c.R, 'r', c.data, true); gl.deleteTexture(t); }));
    out.upNoMip.push(T(() => { const t = G.tex(c.w, c.R, 'r', c.data, false); gl.deleteTexture(t); }));
    out.read.push(T(() => { const px = new Uint8Array(U.cw * U.ch * 4); gl.readPixels(0, 0, U.cw, U.ch, gl.RGBA, gl.UNSIGNED_BYTE, px); }));
  }
  // Shader-Varianten: gleiche Uniforms/Vierecke, nur anderes Programm (Messung, wo die Zeit liegt)
  const mkP = fs => { const mk = (t, src) => { const o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }; const q = gl.createProgram(); gl.attachShader(q, mk(gl.VERTEX_SHADER, SPK1_VS)); gl.attachShader(q, mk(gl.FRAGMENT_SHADER, fs)); gl.bindAttribLocation(q, gl.getAttribLocation(G.p, 'a'), 'a'); gl.linkProgram(q); return q; };
  const H = '#version 300 es\nprecision highp float;in vec2 uv;in vec2 px;uniform sampler2D sp;uniform sampler2D lut;uniform sampler2D ta;uniform sampler2D tb;uniform vec2 db;uniform vec4 tv;uniform vec3 lc[8];uniform int nl;out vec4 o;';
  const V = {flat: H + 'void main(){o=vec4(uv,0.0,1.0);}', sp: H + 'void main(){float v=texture(sp,uv).r;o=vec4(v,v,v,1.0);}', spLut: H + 'void main(){float v=texture(sp,uv).r;float t=clamp((v-db.x)/max(0.001,db.y-db.x),0.0,1.0);vec3 c=texture(lut,vec2(t*0.996+0.002,0.5)).rgb;o=vec4(c,1.0);}', orig: SPK1_FS};
  const p0 = G.p, u0 = G.u; out.var = {};
  for (const k in V) { const q = mkP(V[k]); G.p = q; G.u = {}; for (const n of ['r', 'sz', 'sp', 'lut', 'ta', 'tb', 'db', 'tv', 'lc', 'nl']) G.u[n] = gl.getUniformLocation(q, n); spk1GlDraw(U); const a = []; for (let i = 0; i < 6; i++) a.push(T(() => spk1GlDraw(U))); out.var[k] = a; }
  G.p = p0; G.u = u0;
  return out; });
console.log(JSON.stringify(r), 'last', os.loadavg()[0].toFixed(2));
await b.close(); srv.close();
