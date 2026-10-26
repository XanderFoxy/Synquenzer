// QA group G-P2a (VS2b, V2c′, V2d′, V2e, V2e′): launcher with CDP touch + helpers
import {open as open0, check, done, eq, canon, diff, res} from './v3-qa-grp-lib.mjs';
export {check, done, eq, canon, diff, res};
export const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qmkp/reg/';
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export async function open(o = {}) {
  const O = await open0(o);
  const {p} = O; const cdp = await p.context().newCDPSession(p);
  const E = O.E;
  const send = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts});
  const down = (x, y) => send('touchStart', [{x, y, id: 1}]);
  const move = (x, y) => send('touchMove', [{x, y, id: 1}]);
  const up = () => send('touchEnd', []);
  const glide = async (x0, y0, x1, y1, n = 8, ms = 16) => { for (let k = 1; k <= n; k++) { await move(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n); await sleep(ms); } };
  const tap = async (x, y, wait = 200) => { await down(x, y); await sleep(40); await up(); await sleep(wait); };
  const rect = sel => E(s => { const e = [...document.querySelectorAll(s)].find(e => e.offsetWidth || e.getClientRects().length); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height, cx: r.x + r.width / 2, cy: r.y + r.height / 2, t: e.textContent.trim().slice(0, 60)}; }, sel);
  const rectText = (sel, re) => E(([s, src, fl]) => { const rx = new RegExp(src, fl); const e = [...document.querySelectorAll(s)].filter(e => (e.offsetWidth || e.getClientRects().length) && rx.test(e.textContent.trim()))[0]; if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height, cx: r.x + r.width / 2, cy: r.y + r.height / 2, t: e.textContent.trim().slice(0, 60), dis: !!e.disabled}; }, [sel, re.source, re.flags]);
  const tapSel = async (sel, wait) => { const r = await rect(sel); if (!r) return null; await tap(r.cx, r.cy, wait); return r; };
  const tapTxt = async (sel, re, wait) => { const r = await rectText(sel, re); if (!r) return null; await tap(r.cx, r.cy, wait); return r; };
  const pop = () => E(() => { const p = document.querySelector('#popLayer .pop'); return p ? p.className : null; });
  const popTexts = () => E(() => { const p = document.querySelector('#popLayer .pop'); return p ? [...p.querySelectorAll('button')].filter(b => b.offsetWidth).map(b => b.textContent.trim().replace(/\s+/g, ' ')) : null; });
  const tapPop = (re, wait) => tapTxt('#popLayer .pop button', re, wait);
  const info = () => E(() => SYNQUENZER.svLayoutInfo());
  const songOn = () => E(() => document.getElementById('gridArea').classList.contains('song'));
  const full = () => E(() => { const pr = SYNQUENZER.project(); const P = JSON.parse(JSON.stringify(pr.project || pr)); delete P.ui; if (P.settings) delete P.settings.coach; return JSON.stringify(P); });
  const clips = () => E(() => { const pr = SYNQUENZER.project(); const P = pr.project || pr; return JSON.stringify(P.tracks.map(t => t.clips)); });
  const undoN = () => E(() => SYNQUENZER.undoInfo().n);
  const undoTop = () => E(() => { const u = SYNQUENZER.undoInfo(); return u.top ? {kind: u.top.kind, label: u.top.label, items: u.top.items && u.top.items.map(i => i.kind)} : null; });
  const toast = () => E(() => { const t = document.getElementById('toast'); return t && t.offsetWidth ? t.textContent.trim().replace(/\s+/g, ' ') : null; });
  const lcd = () => E(() => { const t = document.querySelector('#lcd, .lcd'); return t ? t.textContent.trim().replace(/\s+/g, ' ') : null; });
  // canvas coordinate helpers for the song view: point in bar b (0-based) of row label r
  const cell = async (rowLabel, bar, fx = .5) => { const i = await info(); const ri = i.rows.indexOf(rowLabel); if (ri < 0) return null; const y = i.canvas.y + i.rulerH + (ri - 1) * i.rowH + i.rowH / 2; const x = i.canvas.x + (bar + fx) * 36 - i.x0; return {x, y, ri}; };
  const shot = n => p.screenshot({path: OUT + n + '.png'});
  return Object.assign(O, {cdp, send, down, move, up, glide, tap, rect, rectText, tapSel, tapTxt, pop, popTexts, tapPop, info, songOn, full, clips, undoN, undoTop, toast, lcd, cell, shot});
}
