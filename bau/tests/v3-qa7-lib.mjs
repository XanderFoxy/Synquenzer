import { chromium } from 'playwright';
export const FILE = process.env.QA_FILE || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK7/index.html';
export const SR = 48000;
export async function launch(args) {
  return chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required'].concat(args || [])});
}
export async function openApp(browser, o) {
  o = o || {};
  const ctx = await browser.newContext(Object.assign({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true}, o.ctx || {}));
  if (o.init) await ctx.addInitScript(o.init);
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto((o.url || 'file://' + (o.file || FILE)));
  await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  await page.evaluate(() => {
    window.__b64 = a => { const u = new Uint8Array(a.buffer, a.byteOffset, a.byteLength); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
    window.__qaRender = async (snd, ev, o) => { const r = await SYNQUENZER.mkRender(snd, ev, o); return {l: __b64(Float32Array.from(r.l)), r: __b64(Float32Array.from(r.r))}; };
  });
  return {ctx, page, errs};
}
export const dec = s => { const b = Buffer.from(s, 'base64'); return new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4).slice(); };
// render in the page; inputs as plain arrays (converted in page)
export async function render(page, snd, ev, o) {
  o = o || {};
  const oo = Object.assign({}, o); const ins = oo.inputs; delete oo.inputs;
  const enc = ins ? {e1: ins.e1 ? Buffer.from(Float32Array.from(ins.e1).buffer).toString('base64') : null, e2: ins.e2 ? Buffer.from(Float32Array.from(ins.e2).buffer).toString('base64') : null} : null;
  const r = await page.evaluate(async ([snd, ev, oo, enc]) => {
    const d = s => { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return new Float32Array(u.buffer); };
    if (enc) oo.inputs = {e1: enc.e1 ? d(enc.e1) : null, e2: enc.e2 ? d(enc.e2) : null};
    return __qaRender(snd, ev, oo);
  }, [snd, ev, oo, enc]);
  return {l: dec(r.l), r: dec(r.r)};
}
export async function baseMk(page) {
  return page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); return SYNQUENZER.getSound(0); });
}
export function vocSnd(base, voc, t0) {
  const s = JSON.parse(JSON.stringify(base)); s.p.mk.mode = 3; Object.assign(s.p.mk.voc, voc || {});
  const t = s.p.mk.t[0]; for (const k in t0 || {}) { if (typeof t0[k] === 'object' && t0[k] && !Array.isArray(t0[k])) Object.assign(t[k], t0[k]); else t[k] = t0[k]; }
  return s;
}
export const sine = (f, sec, a, sr) => { sr = sr || SR; const x = new Float32Array(Math.round(sec * sr)); for (let i = 0; i < x.length; i++) x[i] = (a == null ? .5 : a) * Math.sin(2 * Math.PI * f * i / sr); return x; };
export const noise = (sec, a, seed) => { let s = seed || 7; const x = new Float32Array(Math.round(sec * SR)); for (let i = 0; i < x.length; i++) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; x[i] = (a == null ? .5 : a) * (s / 2147483648 - 1); } return x; };
export const rms = (x, a, b) => { a = a || 0; b = b == null ? x.length : b; let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return Math.sqrt(s / Math.max(1, b - a)); };
export const peak = (x, a, b) => { a = a || 0; b = b == null ? x.length : b; let m = 0; for (let i = a; i < b; i++) m = Math.max(m, Math.abs(x[i])); return m; };
export const db = v => 20 * Math.log10(Math.max(1e-15, v));
export function spectrum(x, a, N) {
  const re = new Float64Array(N), im = new Float64Array(N);
  for (let i = 0; i < N; i++) { const w = .5 - .5 * Math.cos(2 * Math.PI * i / (N - 1)); re[i] = (x[a + i] || 0) * w; }
  for (let i = 1, j = 0; i < N; i++) { let b = N >> 1; for (; j & b; b >>= 1) j ^= b; j ^= b; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; } }
  for (let len = 2; len <= N; len <<= 1) { const h = len >> 1, ang = -2 * Math.PI / len; for (let i = 0; i < N; i += len) for (let k = 0; k < h; k++) { const c = Math.cos(ang * k), s = Math.sin(ang * k), u = i + k, v = u + h, tr = re[v] * c - im[v] * s, ti = re[v] * s + im[v] * c; re[v] = re[u] - tr; im[v] = im[u] - ti; re[u] += tr; im[u] += ti; } }
  const P = new Float64Array(N / 2); for (let k = 0; k < N / 2; k++) P[k] = re[k] * re[k] + im[k] * im[k]; return P;
}
// Welch average
export function welch(x, a, b, N) { const P = new Float64Array(N / 2); let n = 0; for (let s = a; s + N <= b; s += N / 2) { const Q = spectrum(x, s, N); for (let k = 0; k < N / 2; k++) P[k] += Q[k]; n++; } for (let k = 0; k < N / 2; k++) P[k] /= Math.max(1, n); return P; }
export const bandE = (P, N, f1, f2) => { let e = 0; for (let k = Math.max(1, Math.floor(f1 * N / SR)); k <= Math.min(P.length - 1, Math.ceil(f2 * N / SR)); k++) e += P[k]; return e; };
export const centroid = (P, N) => { let a = 0, b = 0; for (let k = 1; k < P.length; k++) { const f = k * SR / N; a += f * P[k]; b += P[k]; } return a / b; };
export function corr(a, b, s, e) { let ab = 0, aa = 0, bb = 0; for (let i = s; i < e; i++) { ab += a[i] * b[i]; aa += a[i] * a[i]; bb += b[i] * b[i]; } return ab / Math.sqrt(aa * bb); }
export const R = [39, 50, 65, 80, 125, 185, 270, 350, 430, 530, 630, 780, 950, 1150, 1380, 1680, 2070, 2780, 3800, 5000, 6400, 8100, 10510, 12600];
export const posHz = p => { const i = Math.min(22, Math.floor(p)), t = p - i; return R[i] * Math.pow(R[i + 1] / R[i], t); };
let fails = 0, n = 0; export const res = [];
export const ok = (id, c, info) => { n++; if (!c) fails++; res.push({id, c, info}); console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
export const summary = () => console.log(`== ${n - fails}/${n} PASS`);
