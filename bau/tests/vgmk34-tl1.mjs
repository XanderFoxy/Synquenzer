// QA G-MK1: touch launcher on the mk-wt copy + panel helpers + master recorder
import {open as openT, check, done, eq, canon, diff, res} from './v3-qa-gp2a-lib.mjs';
export {check, done, eq, canon, diff, res};
export const APPMK = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html';
export const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vgmk34/qa1/';
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export async function open(o = {}) {
  const T = await openT(Object.assign({mic: false, file: process.env.SYNQ_APP || APPMK, viewport: {width: 428, height: 926}}, o));
  const {E} = T;
  T.mk = k => E(k => { const e = [...document.querySelectorAll('.mkx[data-k="' + k + '"]')].find(e => e.getClientRects().length); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height, cx: r.x + r.width / 2, cy: r.y + r.height / 2, cls: e.className}; }, k);
  T.tapMk = async (k, wait = 200) => { const r = await T.mk(k); if (!r) return null; await T.tap(r.cx, r.cy, wait); return r; };
  T.dragMk = async (k, dy, steps = 12, dx = 0) => { const r = await T.mk(k); if (!r) return null; await T.down(r.cx, r.cy); await sleep(30); await T.glide(r.cx, r.cy, r.cx + dx, r.cy + dy, steps, 16); await sleep(30); await T.up(); await sleep(120); return r; };
  T.panel = () => E(() => SYNQUENZER.mkPanel());
  T.pm = t => E(t => SYNQUENZER.mkGet(t), t);
  T.lcdTxt = () => E(() => { const l = document.querySelector('.lcd, #lcd, .edlcd'); return l ? l.textContent.replace(/\s+/g, ' ').trim() : null; });
  T.key = async n => E(n => { const ks = [...document.querySelectorAll('#kb .key')]; const k = ks[n]; if (!k) return null; const r = k.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height * (k.classList.contains('b') ? .5 : .8), w: r.width}; }, n);
  T.touchMulti = (type, pts) => T.send(type, pts);
  return T;
}
// master recorder (AU.M.ceil) – analysis copied from v3-qa-gp2a-long.mjs
export async function recStart(E, secs = 240) {
  return E(async secs => {
    if (!AU.ctx) SYNQUENZER.play && 0;
    const c = AU.ctx;
    const src = `class R extends AudioWorkletProcessor{process(i){const x=i[0]&&i[0][0];this.port.postMessage({f:currentFrame,d:x?x.slice(0):null,nc:i[0]?i[0].length:-1});return true;}}registerProcessor('qa-rec-mk',R);`;
    try { await c.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src)); } catch (e) { await c.audioWorklet.addModule(URL.createObjectURL(new Blob([src], {type: 'application/javascript'}))); }
    const n = new AudioWorkletNode(c, 'qa-rec-mk'); const Q = window.__q = {buf: new Float32Array(c.sampleRate * secs), n: 0, f0: null, sr: c.sampleRate, node: n, notes: new Map(), acts: [], vc: [], lt: [], frames: 0};
    Q.nulls = []; Q.gaps = []; Q.lastF = null; Q.k = 0;
    n.port.onmessage = e => { const {f, d, nc} = e.data; if (Q.f0 == null) Q.f0 = f; if (Q.lastF != null && f !== Q.lastF + 128) Q.gaps.push([Q.lastF, f]); Q.lastF = f; Q.k++; const i = f - Q.f0;
      if (!d) { Q.nulls.push({f, nc}); return; }
      if (i >= 0 && i + d.length <= Q.buf.length) { Q.buf.set(d, i); Q.n = Math.max(Q.n, i + d.length); } };
    AU.M.ceil.connect(n); const g = c.createGain(); g.gain.value = 0; n.connect(g); g.connect(c.destination);
    Q.poll = setInterval(() => { for (const x of SYNQUENZER.noteLog(4096)) Q.notes.set(x.seq, x); Q.vc.push([+c.currentTime.toFixed(2), SYNQUENZER.voices().length]); }, 1000);
    try { new PerformanceObserver(l => { for (const e of l.getEntries()) Q.lt.push([Math.round(e.duration), Math.round(e.startTime)]); }).observe({entryTypes: ['longtask']}); } catch (e) {}
    const raf = () => { Q.frames++; Q.raf = requestAnimationFrame(raf); }; raf();
    return c.sampleRate;
  }, secs);
}
