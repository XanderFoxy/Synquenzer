// QA G-MK5 (branch mk-br-MK5): launcher re-using the G-MK2a/G-MK1 touch helpers, own OUT dir, arp helpers
import * as G from './v3-qa-gmk2a-tl.mjs';
export const {check, done, eq, canon, diff, res, sleep} = G;
export const APP5 = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK5/index.html';
export const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-gmk5/';
export async function open(o = {}) {
  const T = await G.open(Object.assign({file: process.env.SYNQ_APP || APP5}, o));
  const {E} = T;
  T.lcd2 = () => E(() => { const l = document.querySelector('#synthSheet .lcd'); return l ? l.innerText.replace(/\s+/g, ' ').trim() : null; });
  T.edLcd = () => E(() => (typeof ED !== 'undefined' && ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ').trim() : null));
  T.w2 = async re => T.w('w2', re);
  T.w1 = async re => T.w('w1', re);
  T.arp = (t = 0) => E(t => SYNQUENZER.mkGet(t).arp, t);
  T.alog = (t = 0) => E(t => SYNQUENZER.arpLog(t), t);
  T.pinfo = () => E(() => MKUI.panelInfo ? MKUI.panelInfo() : null);
  T.keyCls = () => E(() => [...document.querySelectorAll('#synthSheet .mkx[data-k^="n"]')].filter(e => /^n\d$/.test(e.dataset.k)).map(e => e.dataset.k + ':' + e.className.replace(/\bmkx\b/, '').trim()));
  T.arpCls = () => E(() => { const e = document.querySelector('#synthSheet .mkx[data-k="arp"]'); return e ? e.className + ' | ' + [...e.querySelectorAll('*')].map(x => x.className && typeof x.className === 'string' ? x.className : '').filter(Boolean).join(',') : null; });
  T.capT = (t, ms) => E(([t, ms]) => new Promise(r => { const c = AU.ctx, n = AU.synth[t].node; const sp = c.createScriptProcessor(2048, 2, 2), z = c.createGain(); z.gain.value = 0; const L = []; sp.onaudioprocess = e => { L.push(Float32Array.from(e.inputBuffer.getChannelData(0))); }; n.connect(sp); sp.connect(z); z.connect(c.destination); setTimeout(() => { try { n.disconnect(sp); } catch (e) {} sp.disconnect(); const N = L.reduce((a, b) => a + b.length, 0), x = new Float32Array(N); let o = 0; for (const b of L) { x.set(b, o); o += b.length; } r({sr: c.sampleRate, l: Array.from(x)}); }, ms); }), [t, ms]);
  T.toMk = async () => { const m = await T.rectText('#synthSheet button', /^MS ?2000$/); if (m) { await T.tap(m.cx, m.cy, 1200); return 'chip'; } const c = await T.rectText('#synthSheet button', /^(VA|FM|WT) ▾$/); if (!c) return 'no engine button'; await T.tap(c.cx, c.cy, 400); const r = await T.tapPop(/MS ?2000/); await sleep(1200); return r ? 'list' : 'no MS 2000 item'; };
  // hold piano keys by touch (indices into #kb .key), returns key rects
  T.holdKeys = async (idx, id0 = 20) => { const ks = []; for (const n of idx) ks.push(await T.key(n)); const pts = []; for (let j = 0; j < ks.length; j++) { pts.push({x: ks[j].cx, y: ks[j].cy, id: id0 + j}); await T.send('touchStart', pts.slice()); await sleep(8); } return {ks, pts}; };
  T.releaseKeys = async () => { await T.send('touchEnd', []); };
  T.knobList = async (k, re) => { await T.tapMk(k, 300); await E(src => { const rx = new RegExp(src); const b = [...document.querySelectorAll('#popLayer .pop button')].find(b => rx.test(b.textContent.trim())); b && b.scrollIntoView({block: 'center'}); }, re.source); await sleep(150); const r = await T.tapPop(re); await sleep(500); return r ? 'ok' : 'no list item ' + re + ' ' + JSON.stringify(await T.popTexts()); };
  return T;
}
