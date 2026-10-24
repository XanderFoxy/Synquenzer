// QA regression VS2: piano roll layout (P1 P2 P3 L1 L2) base vs new; action bar reachable; old actions unchanged; Teilen/Verbinden + undo
import { open, APP } from './v3-v2d-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/G-P1b-gruppe-fix.html';
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/';
const VPS = [['P1', 390, 844], ['P2', 375, 667], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375]];
const res = {};
for (const [name, file] of [['base', BASE], ['new', APP]]) for (const [vp, w, h] of VPS) {
  const {b, p, errs} = await open({width: w, height: h}, file, true);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); const K = {root: 9, scale: 'aeolian'}, N = (t, n, d) => ({t, d: d || .5, n, v: .8});
    Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 57), N(1, 60), N(2, 64, 1), N(3, 60)]}); Q.openRoll(0, 0); });
  await p.waitForTimeout(700);
  const L = await p.evaluate(() => {
    const ed = window.SYNQUENZER.rollApi(); const acts = ed.el.acts, bar = ed.el.bar; const vw = innerWidth, vh = innerHeight;
    const info = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return {r: [r.left, r.top, r.width, r.height].map(Math.round), sw: el.scrollWidth, cw: el.clientWidth, ox: cs.overflowX, ta: cs.touchAction}; };
    const bs = [...acts.querySelectorAll('button')].filter(x => getComputedStyle(x).display !== 'none').map(x => { const r = x.getBoundingClientRect(); return {t: x.textContent.trim(), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), cut: x.scrollWidth > x.clientWidth + 1}; });
    const tbs = [...bar.querySelectorAll('button')].filter(x => getComputedStyle(x).display !== 'none').map(x => { const r = x.getBoundingClientRect(); return {t: x.textContent.trim(), x: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height), cut: x.scrollWidth > x.clientWidth + 1}; });
    // overlap check between visible buttons of both bars + main canvas
    const all = [...acts.querySelectorAll('button'), ...bar.querySelectorAll('button')].filter(x => x.offsetParent);
    const ov = []; for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) { const a = all[i].getBoundingClientRect(), c = all[j].getBoundingClientRect(); const ix = Math.min(a.right, c.right) - Math.max(a.left, c.left), iy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top); if (ix > 1 && iy > 1) ov.push(all[i].textContent + ' X ' + all[j].textContent); }
    const main = ed.el.main.getBoundingClientRect();
    const pageOver = document.documentElement.scrollWidth > vw + 1 || document.body.scrollWidth > vw + 1;
    return {acts: info(acts), bar: info(bar), bs, tbs, ov, main: [main.left, main.top, main.width, main.height].map(Math.round), pageOver, vw, vh};
  });
  await p.screenshot({path: D + `v3-qa-vs2breg-roll-${name}-${vp}.png`});
  // scroll the action bar to the end, make sure the last button can be reached and lies inside the viewport
  const end = await p.evaluate(() => { const a = window.SYNQUENZER.rollApi().el.acts; a.scrollLeft = a.scrollWidth; const bs = [...a.querySelectorAll('button')].filter(x => x.offsetParent); const last = bs[bs.length - 1].getBoundingClientRect(); return {last: bs[bs.length - 1].textContent, right: Math.round(last.right), vw: innerWidth, sl: a.scrollLeft}; });
  // old actions: select all, ▲ Stufe, +12, Legato, Dupl. ; then the clip
  const acts = await p.evaluate(async () => { const Q = window.SYNQUENZER, ed = Q.rollApi(); const click = t => { const x = [...ed.el.acts.querySelectorAll('button')].find(b => b.textContent.trim() === t); if (!x) return false; x.click(); return true; };
    const out = {};
    for (const t of ['▲ Stufe', '+12', '−12', 'Legato', 'Dupl.']) { out[t] = click(t); await new Promise(r => setTimeout(r, 80)); }
    out.clip = Q.getClip(0, 0).notes.map(n => n.n + '@' + n.t + '/' + n.d).sort().join(' '); out.len = Q.getClip(0, 0).len;
    for (let i = 0; i < 5; i++) Q.undo(); await new Promise(r => setTimeout(r, 80));
    out.undone = Q.getClip(0, 0).notes.map(n => n.n + '@' + n.t + '/' + n.d).sort().join(' ');
    return out; });
  // new actions
  let nw = null;
  if (name === 'new') nw = await p.evaluate(async () => { const Q = window.SYNQUENZER, ed = Q.rollApi(); const click = t => { const x = [...ed.el.acts.querySelectorAll('button')].find(b => b.textContent.trim() === t); x.click(); };
    const o = {}; ed.selectIdx([2]); click('Teilen'); await new Promise(r => setTimeout(r, 80)); o.split = Q.getClip(0, 0).notes.map(n => n.n + '@' + n.t + '/' + n.d).sort().join(' '); Q.undo(); await new Promise(r => setTimeout(r, 80)); o.splitUndo = Q.getClip(0, 0).notes.length;
    ed.selectIdx([0, 1]); click('Verbinden'); await new Promise(r => setTimeout(r, 80)); o.join = Q.getClip(0, 0).notes.map(n => n.n + '@' + n.t + '/' + n.d).sort().join(' '); Q.undo(); await new Promise(r => setTimeout(r, 80)); o.joinUndo = Q.getClip(0, 0).notes.map(n => n.n + '@' + n.t + '/' + n.d).sort().join(' ');
    return o; });
  res[name + vp] = {L, end, acts, nw, errs: errs.slice()};
  await b.close();
}
for (const [vp] of VPS) { const A = res['base' + vp], B = res['new' + vp];
  console.log('==', vp, 'errs', JSON.stringify(B.errs));
  console.log('  acts base', JSON.stringify(A.L.acts), 'new', JSON.stringify(B.L.acts));
  console.log('  bar  base', JSON.stringify(A.L.bar), 'new', JSON.stringify(B.L.bar));
  console.log('  main base', JSON.stringify(A.L.main), 'new', JSON.stringify(B.L.main), 'pageOver', B.L.pageOver);
  console.log('  visible acts new', B.L.bs.filter(x => x.x + x.w <= B.L.vw && x.x >= 0).map(x => x.t + ' ' + x.w + 'x' + x.h + (x.cut ? ' CUT' : '')).join(' | '));
  console.log('  visible acts base', A.L.bs.filter(x => x.x + x.w <= A.L.vw && x.x >= 0).map(x => x.t).join(' | '));
  console.log('  cut new', B.L.bs.filter(x => x.cut).map(x => x.t), B.L.tbs.filter(x => x.cut).map(x => x.t), 'overlap', B.L.ov);
  console.log('  small (<36) new', B.L.bs.filter(x => x.h < 36 || x.w < 36).map(x => x.t + ' ' + x.w + 'x' + x.h).join(', '), '| base', A.L.bs.filter(x => x.h < 36 || x.w < 36).length);
  console.log('  end', JSON.stringify(B.end), 'base', JSON.stringify(A.end));
  console.log('  acts', JSON.stringify(A.acts) === JSON.stringify(B.acts) ? 'same' : 'DIFF ' + JSON.stringify(B.acts) + ' base ' + JSON.stringify(A.acts));
  console.log('  new', JSON.stringify(B.nw));
}
