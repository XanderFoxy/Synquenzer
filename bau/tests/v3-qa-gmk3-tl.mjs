// QA G-MK3: launcher on the mk-br-MK3 copy (re-uses the G-MK2a/G-MK1 helpers) + MK3 panel helpers
import * as G from './v3-qa-gmk2a-tl.mjs';
export const {check, done, eq, canon, diff, res, sleep} = G;
export const APP3 = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK3/index.html';
export const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-gmk3/';
export async function open(o = {}) {
  const T = await G.open(Object.assign({file: APP3, viewport: {width: 390, height: 844}}, o));
  const {E} = T;
  T.mkk = () => E(() => [...document.querySelectorAll('.mkx[data-k]')].filter(e => e.getClientRects().length).map(e => e.dataset.k));
  T.lcdAll = () => E(() => [...document.querySelectorAll('.lcd, #lcd, .edlcd, .lx')].filter(e => e.getClientRects().length).map(e => e.className + ': ' + e.textContent.replace(/\s+/g, ' ').trim()));
  T.tim = () => E(() => { const e = document.querySelector('.mkx[data-k="timbre"]'); if (!e) return null; return {cls: e.className, leds: [...e.querySelectorAll('.mled')].map(l => l.className)}; });
  // a key of the on-screen keyboard by MIDI note
  T.keyN = n => E(n => { const k = [...document.querySelectorAll('#kb .key')].find(k => +k.dataset.n === n || +k.dataset.note === n); if (!k) return null; const r = k.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height * (k.classList.contains('b') ? .5 : .8), w: r.width}; }, n);
  T.keys = () => E(() => [...document.querySelectorAll('#kb .key')].filter(k => k.getClientRects().length).map(k => ({n: k.dataset.n ?? k.dataset.note, b: k.classList.contains('b'), x: Math.round(k.getBoundingClientRect().x)})));
  // the tap-through shield (UI.shield, 500 ms / 30 px after a pop item tap) is by design: wait past it after list choices
  const w0 = T.w, kl0 = T.knobList; T.w = async (a, b) => { const r = await w0(a, b); await sleep(450); return r; }; T.knobList = async (a, b) => { const r = await kl0(a, b); await sleep(450); return r; };
  return T;
}
