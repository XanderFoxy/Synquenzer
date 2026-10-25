// after ✕ (editor close) — what is under the scene keys ▶1…▶4 over time? (4.9.0 vs 4.8.1, VA and MS 2000)
import {open, sleep, OUT} from './v3-qa-gmk1-tl.mjs';
const file = process.argv[2], eng = process.argv[3] || 'va';
const T = await open(file ? {file} : {}); const {p, E, errs} = T;
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(500);
if (eng === 'mk') { await T.tapTxt('button', /^MS ?2000$/); await sleep(500); }
const x = await T.rectText('button', /^✕$/);
const scn = await E(() => [...document.querySelectorAll('button.scn')].filter(b => b.getClientRects().length).slice(0, 4).map(b => { const r = b.getBoundingClientRect(); return [b.textContent.trim().slice(0, 3), r.x + r.width / 2, r.y + r.height / 2]; }));
await T.tap(x.cx, x.cy, 0);
const t0 = Date.now(); const rows = [];
for (const ms of [50, 150, 250, 400, 600, 1000, 2000]) { while (Date.now() - t0 < ms) await sleep(5); rows.push(ms + 'ms: ' + (await E(sc => sc.map(([n, x, y]) => { const e = document.elementFromPoint(x, y); const b = e && e.closest('button'); return n + '→' + (b ? (b.classList.contains('scn') ? 'scene' : b.className + ' "' + b.textContent.trim().slice(0, 6) + '"') : e && e.tagName); }).join(' | '), scn))); }
console.log(await E(() => SYNQUENZER.version), eng, '\n' + rows.join('\n'));
const sh = await E(() => { const s = document.querySelector('#sheet, .sheet'); if (!s) return null; const cs = getComputedStyle(s); const r = s.getBoundingClientRect(); return {cls: s.className, vis: cs.visibility, disp: cs.display, pe: cs.pointerEvents, op: cs.opacity, tr: cs.transform, y: r.y, h: r.height}; });
console.log('sheet', JSON.stringify(sh));
const hb = await E(() => [...document.querySelectorAll('.hb.ur, .sh-x')].map(b => { const r = b.getBoundingClientRect(); const cs = getComputedStyle(b); return [b.textContent, Math.round(r.x), Math.round(r.y), cs.visibility, cs.pointerEvents, b.closest('[id]') && b.closest('[id]').id]; }));
console.log('header buttons', JSON.stringify(hb));
await T.br.close();
