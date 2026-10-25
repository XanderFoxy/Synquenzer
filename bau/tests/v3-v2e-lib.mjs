// V2e test helpers: touch driving of the song view (CDP), geometry, pixels
import { open } from './v3-v2d-pw.mjs';
import { SETUP } from './v3-v2d2-lib.mjs';
export { SETUP };
export const VPS = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [1280, 800]};
export async function openVp(vp) { const [w, h] = VPS[vp]; const o = await open({width: w, height: h}, undefined, true); o.cdp = await o.p.context().newCDPSession(o.p); return o; }
export function mk(p, cdp) {
  const E = (f, a) => p.evaluate(f, a);
  const info = () => E(() => window.SYNQUENZER.svLayoutInfo());
  const touch = async (type, x, y) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, id: 1}]});
  const tap = async (x, y, wait = 220) => { await touch('touchStart', x, y); await p.waitForTimeout(40); await touch('touchEnd', x, y); await p.waitForTimeout(wait); };
  const hold = async (x, y, ms, moveTo) => { await touch('touchStart', x, y); await p.waitForTimeout(ms); if (moveTo) { for (let k = 1; k <= 5; k++) { await touch('touchMove', x + (moveTo[0] - x) * k / 5, y + (moveTo[1] - y) * k / 5); await p.waitForTimeout(16); } } await touch('touchEnd', moveTo ? moveTo[0] : x, moveTo ? moveTo[1] : y); await p.waitForTimeout(250); };
  const tapCv = async (x, y, wait) => { const i = await info(); await tap(i.canvas.x + x, i.canvas.y + y, wait); };
  const rect = sel => E(s => { const e = typeof s === 'string' ? document.querySelector(s) : null; if (!e || !e.offsetWidth) return null; const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height}; }, sel);
  const tapSel = async (sel, wait) => { const r = await rect(sel); if (!r) throw new Error('no ' + sel); await tap(r.x + r.w / 2, r.y + r.h / 2, wait); };
  // a button inside the open popover by its text (first that includes it)
  const popBtn = txt => E(t => { const p = document.querySelector('#popLayer .pop'); if (!p) return null; const b = [...p.querySelectorAll('button')].find(x => x.offsetWidth && x.textContent.includes(t)); if (!b) return null; const r = b.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, dis: b.disabled, txt: b.textContent}; }, txt);
  const tapPop = async (txt, wait) => { const b = await popBtn(txt); if (!b) throw new Error('no pop button ' + txt); await tap(b.x, b.y, wait); };
  const toastBtn = txt => E(t => { const b = [...document.querySelectorAll('#toast button')].find(x => x.textContent.includes(t)); if (!b || !b.offsetWidth) return null; const r = b.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; }, txt);
  const pop = () => E(() => { const p = document.querySelector('#popLayer .pop'); return p ? p.className : null; });
  const px = (x, y) => E(([x, y]) => { const c = document.querySelector('.sv-cv'), d = c.width / c.getBoundingClientRect().width; const v = c.getContext('2d').getImageData(Math.round(x * d), Math.round(y * d), 1, 1).data; return [v[0], v[1], v[2]]; }, [x, y]);
  // how many pixels in a canvas box look like the grey bar-number text (#8b919c ±30)
  const grey = (x0, y0, w, h) => E(([x0, y0, w, h]) => { const c = document.querySelector('.sv-cv'), d = c.width / c.getBoundingClientRect().width; const v = c.getContext('2d').getImageData(Math.round(x0 * d), Math.round(y0 * d), Math.round(w * d), Math.round(h * d)).data; let n = 0; for (let i = 0; i < v.length; i += 4) if (Math.abs(v[i] - 139) < 30 && Math.abs(v[i + 1] - 145) < 30 && Math.abs(v[i + 2] - 156) < 30) n++; return n; }, [x0, y0, w, h]);
  const proj = () => E(() => { const pr = window.SYNQUENZER.project(); const P = pr.project || pr; return JSON.stringify({song: P.song, parts: P.parts}); });
  const clips = () => E(() => { const pr = window.SYNQUENZER.project(); const P = pr.project || pr; return JSON.stringify(P.tracks.map(t => t.clips)); });
  const undoTop = () => E(() => { const u = window.SYNQUENZER.undoInfo(); return u.top ? u.top.kind + ':' + u.top.label : null; });
  const undoN = () => E(() => window.SYNQUENZER.undoInfo().n != null ? window.SYNQUENZER.undoInfo().n : (window.SYNQUENZER.undoInfo().stack || []).length);
  return {E, info, tap, hold, tapCv, rect, tapSel, popBtn, tapPop, toastBtn, pop, px, grey, proj, clips, undoTop, undoN, touch};
}
// per bar and track: the slot that plays (from the lanes; own clips as 'o')
export const STATES = `(() => { const s = window.SYNQUENZER.song(); const out = []; for (let b = 0; b < s.bars; b++) { out.push(s.lanes.map(l => { let x = -1; for (const e of l) { if (e.bar > b) break; x = e.own ? 'o' : e.slot; } return x; })); } return out; })()`;
