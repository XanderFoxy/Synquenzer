// Clipped-label scan over many UI states (touch), 390x844 / 844x390. Usage: node vgmk34-clip.mjs P|L  (SYNQ_APP = other build)
import {open, sleep} from './vgmk34-tl3.mjs';
import fs from 'fs';
const L = process.argv[2] === 'L', TAG = L ? 'L' : 'P';
const T = await open(Object.assign({viewport: L ? {width: 844, height: 390} : {width: 390, height: 844}}, process.env.SYNQ_APP ? {file: process.env.SYNQ_APP} : {})); const {p, E, errs} = T;
const ver = await E(() => SYNQUENZER.version); console.log('APP', ver);
const scan = () => E(() => {
  const out = [];
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth && getComputedStyle(e).visibility !== 'hidden'; };
  for (const e of document.querySelectorAll('body *')) {
    if (e.closest('.mqi, svg, canvas, script, style, input, textarea, select')) continue;
    const own = [...e.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim());
    if (!own.length || !vis(e)) continue;
    const cs = getComputedStyle(e);
    const rg = document.createRange(); rg.selectNodeContents(e); const tr = rg.getBoundingClientRect();
    const txt = e.textContent.trim().replace(/\s+/g, ' ').slice(0, 32), id = (e.id ? '#' + e.id : '') + '.' + String(e.className || '').split(' ').filter(Boolean).slice(0, 2).join('.');
    if (/hidden|clip/.test(cs.overflowX) && e.scrollWidth > e.clientWidth + 1) { out.push((cs.textOverflow === 'ellipsis' ? 'ELLIPSIS ' : 'CUT-X ') + e.tagName + id + ' "' + txt + '" ' + e.scrollWidth + '>' + e.clientWidth); continue; }
    if (/hidden|clip/.test(cs.overflowY) && e.scrollHeight > e.clientHeight + 2 && cs.overflowY !== 'auto' && cs.overflowY !== 'scroll') { out.push('CUT-Y ' + e.tagName + id + ' "' + txt + '" ' + e.scrollHeight + '>' + e.clientHeight); continue; }
    for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) {
      const as = getComputedStyle(a); if (!/hidden|clip/.test(as.overflowX + as.overflowY)) continue;
      if (/auto|scroll/.test(as.overflowX + as.overflowY)) break;   // a scroller: content may continue
      const ar = a.getBoundingClientRect();
      if (tr.width && (tr.left < ar.left - 1 || tr.right > ar.right + 1 || tr.top < ar.top - 2 || tr.bottom > ar.bottom + 2)) { out.push('OUT ' + e.tagName + id + ' "' + txt + '" in ' + a.tagName + '.' + String(a.className || '').split(' ')[0]); }
      break;
    }
    if (tr.width && (tr.right > innerWidth + 1 || tr.left < -1)) out.push('VIEWPORT ' + e.tagName + id + ' "' + txt + '"');
  }
  return [...new Set(out)];
});
const R = {}; const st = async lab => { await sleep(250); R[lab] = await scan(); };
await E(() => SYNQUENZER.setMetronome(false));
await st('grid');
// song view
const songBtn = await T.rectText('button', /^SONG$/); if (songBtn) { await T.tap(songBtn.cx, songBtn.cy, 600); await st('song'); await T.tap(songBtn.cx, songBtn.cy, 600); }
// editor + MS 2000
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(600);
const b = await T.rectText('button', /^MS ?2000$/); if (b) await T.tap(b.cx, b.cy, 900); else { const c = await T.rectText('button', /^(VA|FM|WT) ▾$/); if (c) { await T.tap(c.cx, c.cy, 400); await T.tapPop(/MS ?2000/); await sleep(900); } }
await st('mk-spiel');
const hasT = !!(await E(() => document.querySelector('.mkx[data-k="timbre"]')));
// Layer + T2 when the build has MK3
if (hasT) { await T.w('w1', /^1 STIMME/); await T.tapMk('k1', 300); await T.tapPop(/^Schicht$/); await sleep(500); await T.tapMk('timbre', 300); }
for (let k = 0; k < 11; k++) { await T.w('w1', new RegExp('^' + (k + 1) + ' ')); await st('W1-' + (k + 1)); await T.tapMk('shift', 250); await st('W1-' + (k + 1) + '-shift'); await T.tapMk('shift', 250); }
for (let k = 0; k < 11; k++) { const r = await T.w('w2', new RegExp('^' + (k + 1) + ' ')); await st('W2-' + (k + 1)); }
// a few knob LCD lines: tap knobs on DELAY (k0..k3) and EQ
for (const [pos, n] of [[/^6 /, 4], [/^7 /, 4], [/^5 /, 3], [/^1 /, 3]]) { await T.w('w2', pos); for (let k = 0; k < n; k++) { await T.tapMk('k' + k, 350); if (await T.pop()) { await st('list-' + pos.source + '-k' + k); await T.closePop(); await sleep(450); } else await st('lcd-' + pos.source + '-k' + k); } }
// EDIT-WAHL lists open
await T.tapMk('w1', 350); await st('pop-w1'); await T.closePop(); await sleep(450);
await T.tapMk('w2', 350); await st('pop-w2'); await T.closePop(); await sleep(450);
// FX tab
const fx = await T.rectText('.tab, button', /^FX/); if (fx) { await T.tap(fx.cx, fx.cy, 500); await st('fx-tab'); const g = await T.rectText('.tab, button', /^GERÄT$/); if (g) await T.tap(g.cx, g.cy, 500); }
// library
await E(() => SYNQUENZER.openBrowser && SYNQUENZER.openBrowser(0)); await sleep(700); await st('browser');
await E(() => SYNQUENZER.closeBrowser && SYNQUENZER.closeBrowser()); await sleep(400);
fs.writeFileSync(process.env.OUTJ || ('/tmp/clip-' + TAG + '.json'), JSON.stringify(R, null, 1));
const all = {}; for (const k in R) for (const x of R[k]) (all[x] || (all[x] = [])).push(k);
for (const x in all) console.log(x, ' @ ', all[x].slice(0, 4).join(',') + (all[x].length > 4 ? ' +' + (all[x].length - 4) : ''));
console.log('errs', JSON.stringify(errs));
await T.br.close();
