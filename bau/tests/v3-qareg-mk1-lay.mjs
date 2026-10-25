// layout diff base (4.8.1) vs new (4.9.0): element rects per state and viewport
import { open, APP, BASE, OUT } from './v3-qareg-mk1-pw.mjs';
import fs from 'fs';
const VPS = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180]};
const which = (process.argv[2] || 'P1,P2,P3,L1,L2,W').split(',');
const stOnly = process.argv[3] ? process.argv[3].split(',') : null;
const W = ms => new Promise(r => setTimeout(r, ms));
const STATES = {
  main: async () => {},
  demo: async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); await W(400); },
  va: async () => { const Q = window.SYNQUENZER; Q.selectTrack(0); Q.openEditor(); await W(500); },
  vaFilter: async () => { const Q = window.SYNQUENZER; Q.selectTrack(0); Q.openEditor(); await W(400); const t = [...document.querySelectorAll('#synthSheet button.tab')].find(b => /FILTER/.test(b.innerText)); t && t.click(); await W(300); },
  vaFx: async () => { const Q = window.SYNQUENZER; Q.selectTrack(0); Q.openEditor(); await W(400); const t = [...document.querySelectorAll('#synthSheet button.tab')].find(b => /^FX$/.test(b.innerText.trim())); t && t.click(); await W(300); },
  fm: async () => { const Q = window.SYNQUENZER; Q.selectTrack(0); Q.openEditor(); await W(400); Q.setEngine(0, 'fm'); await W(500); },
  wt: async () => { const Q = window.SYNQUENZER; Q.selectTrack(0); Q.openEditor(); await W(400); Q.setEngine(0, 'wt'); await W(500); },
  drum: async () => { const Q = window.SYNQUENZER; Q.selectTrack(4); Q.openEditor(); await W(500); },
  menu: async () => { document.getElementById('bMenu').click(); await W(500); },
  info: async () => { document.getElementById('bMenu').click(); await W(500); const t = [...document.querySelectorAll('button')].filter(b => b.offsetParent).find(b => /^Info/.test(b.innerText.trim()) || /ⓘ Info|Info$/.test(b.innerText.trim())); if (t) t.click(); else window.__noinfo = 1; await W(500); },
  browser: async () => { const Q = window.SYNQUENZER; Q.selectTrack(0); Q.openEditor(); await W(400); const t = [...document.querySelectorAll('#synthSheet button.pv')][0]; t && t.click(); await W(600); },
};
const snap = () => {
  const out = {}; const vw = innerWidth, vh = innerHeight;
  const keyOf = e => { const parts = []; let x = e; while (x && x !== document.body) { if (x.id) { parts.unshift('#' + x.id); break; } const par = x.parentElement; const i = par ? [...par.children].indexOf(x) : 0; parts.unshift(x.tagName.toLowerCase() + (x.classList[0] ? '.' + x.classList[0] : '') + ':' + i); x = par; } return parts.join('>'); };
  const issues = [];
  for (const e of document.querySelectorAll('body *')) {
    if (e.closest('svg') && e.tagName !== 'svg') continue;
    const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue;
    const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
    if (r.right < 0 || r.bottom < 0 || r.left > vw || r.top > vh) continue;
    const k = keyOf(e);
    const txt = [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim().slice(0, 24);
    out[k] = [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height), txt];
    if (txt && e.scrollWidth > e.clientWidth + 1 && cs.overflow !== 'visible' && cs.textOverflow !== 'ellipsis') issues.push('ovf ' + k + ' "' + txt + '" ' + e.scrollWidth + '/' + e.clientWidth);
    if ((e.tagName === 'BUTTON') && (r.left < -0.5 || r.right > vw + 0.5 || r.bottom > vh + 0.5)) issues.push('outside ' + k + ' "' + (e.innerText || '').trim().slice(0, 20) + '" ' + [r.left, r.top, r.right, r.bottom].map(Math.round).join(','));
  }
  const de = document.documentElement; if (de.scrollWidth > vw + 0.5) issues.push('docScrollX ' + de.scrollWidth); if (de.scrollHeight > vh + 0.5) issues.push('docScrollY ' + de.scrollHeight);
  return {out, issues};
};
const all = {};
for (const v of which) for (const st of Object.keys(STATES)) {
  if (stOnly && !stOnly.includes(st)) continue;
  const R = {};
  for (const [n, f] of [['base', BASE], ['new', APP]]) {
    const {b, p, errs} = await open({width: VPS[v][0], height: VPS[v][1]}, f, true);
    await p.evaluate('(async () => { const W = ms => new Promise(r => setTimeout(r, ms)); await (' + STATES[st].toString() + ')(); })()');
    R[n] = await p.evaluate(snap); R[n].errs = errs.slice();
    await p.screenshot({path: OUT + `lay-${v}-${st}-${n}.png`});
    await b.close();
  }
  const A = R.base.out, B = R.new.out; const moved = [], gone = [], added = [];
  for (const k of Object.keys(A)) { if (!B[k]) { gone.push(k + ' ' + JSON.stringify(A[k])); continue; } const a = A[k], c = B[k]; if (Math.abs(a[0] - c[0]) > 2 || Math.abs(a[1] - c[1]) > 2 || Math.abs(a[2] - c[2]) > 2 || Math.abs(a[3] - c[3]) > 2 || a[4] !== c[4]) moved.push(k + ' ' + JSON.stringify(a) + ' -> ' + JSON.stringify(c)); }
  for (const k of Object.keys(B)) if (!A[k]) added.push(k + ' ' + JSON.stringify(B[k]));
  const newIss = R.new.issues.filter(x => !R.base.issues.includes(x));
  all[v + ':' + st] = {moved, gone, added, newIss, baseIss: R.base.issues, errsB: R.base.errs, errsN: R.new.errs};
  console.log('==', v, st, 'moved', moved.length, 'gone', gone.length, 'added', added.length, 'newIssues', JSON.stringify(newIss).slice(0, 600), 'errs', JSON.stringify(R.new.errs).slice(0, 300));
}
fs.writeFileSync(OUT + 'lay-' + which.join('_') + (stOnly ? '-' + stOnly.join('_') : '') + '.json', JSON.stringify(all, null, 1));
