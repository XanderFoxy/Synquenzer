// QA group G-P1b (V2d, VS2): shared launcher with fake mic (from v3-vs2-h.mjs) + master recorder
import {chromium} from 'playwright';
export const EXE = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
export const APP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-wt/index.html';
export const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-grp/';
export const INIT = () => {
  const O = window.AudioContext;
  window.AudioContext = class extends O { constructor(o) { super(o); window.__ctx = this; } };
  window.webkitAudioContext = window.AudioContext;
  const F = window.__fake = {gum: 0, srcs: []};
  if (!navigator.mediaDevices) return;
  navigator.mediaDevices.getUserMedia = async () => {
    F.gum++;
    const ctx = window.__ctx, dest = ctx.createMediaStreamDestination(); dest.channelCount = 1;
    const g = ctx.createGain(); g.connect(dest); F.dest = dest; F.bus = g;
    const nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = nb.getChannelData(0); let s = 12345;
    for (let i = 0; i < d.length; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 2147483647 - 0.5) * 0.0008; }
    const ns = ctx.createBufferSource(); ns.buffer = nb; ns.loop = true; ns.connect(g); ns.start();
    return dest.stream;
  };
  F.play = (b64, when, sr) => {
    const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    const x = new Float32Array(u.buffer), ctx = window.__ctx, b = ctx.createBuffer(1, x.length, sr || ctx.sampleRate); b.getChannelData(0).set(x);
    const src = ctx.createBufferSource(); src.buffer = b; src.connect(F.bus); src.start(when); F.srcs.push(src); return when;
  };
};
export async function open(o = {}) {
  const br = await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await br.newContext({viewport: o.viewport || {width: 390, height: 844}, hasTouch: o.touch !== false, isMobile: o.touch !== false, deviceScaleFactor: 1});
  const p = await ctx.newPage(); const errs = [], logs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); else if (o.log) logs.push(m.type() + ': ' + m.text()); });
  if (o.mic !== false) await p.addInitScript(INIT);
  await p.goto('file://' + (o.file || process.env.SYNQ_APP || APP)); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version, null, {timeout: 20000});
  await p.waitForTimeout(600);
  const E = (f, a) => p.evaluate(f, a);
  return {br, ctx, p, errs, logs, E, waitBeat: (x, ms = 60000) => p.waitForFunction(x => window.SYNQUENZER.runtime().beat > x, x, {timeout: ms, polling: 20})};
}
export const b64 = x => Buffer.from(new Float32Array(x).buffer).toString('base64');
export const res = [];
export function check(id, ok, info) { res.push({id, ok: !!ok, info}); console.log((ok ? 'PASS ' : 'FAIL ') + id + (info !== undefined ? ' ' + (typeof info === 'string' ? info : JSON.stringify(info)).slice(0, 600) : '')); }
export function done() { const f = res.filter(r => !r.ok); console.log(`\n${res.length - f.length}/${res.length} passed` + (f.length ? ' FAILED: ' + f.map(r => r.id).join(' | ') : '')); }
export const canon = o => JSON.stringify(o, (k, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.keys(v).sort().reduce((a, k2) => (a[k2] = v[k2], a), {}) : v));
export const eq = (a, b) => canon(a) === canon(b);
export function diff(a, b, path = '') { if (canon(a) === canon(b)) return []; if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return [path + ': ' + String(JSON.stringify(a)).slice(0, 160) + ' != ' + String(JSON.stringify(b)).slice(0, 160)]; const ks = new Set([...Object.keys(a), ...Object.keys(b)]); let out = []; for (const k of ks) out = out.concat(diff(a[k], b[k], path + '.' + k)); return out; }
// tap a DOM element via touch (CDP) at its centre
export async function tapEl(p, sel, idx = 0) {
  const box = await p.evaluate(([s, i]) => { const els = typeof s === 'string' ? [...document.querySelectorAll(s)] : []; const e = els.filter(e => e.offsetParent !== null || e.getClientRects().length)[i]; if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height, t: e.textContent.trim().slice(0, 40)}; }, [sel, idx]);
  if (!box) return null;
  await p.touchscreen.tap(box.x, box.y); return box;
}
export async function tapText(p, sel, re, o = {}) {
  const box = await p.evaluate(([s, src, flags]) => { const rx = new RegExp(src, flags); const e = [...document.querySelectorAll(s)].filter(e => (e.offsetParent !== null || e.getClientRects().length) && rx.test(e.textContent.trim())).pop(); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height, t: e.textContent.trim().slice(0, 50)}; }, [sel, re.source, re.flags]);
  if (!box) return null;
  await p.touchscreen.tap(box.x, box.y); return box;
}
