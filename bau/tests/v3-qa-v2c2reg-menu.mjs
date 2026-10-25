// QA regression V2c′: Menü (all sections, esp. Harmonie with the new rows) in P1 P2 P3 L1 L2 — overflow, clipped text,
// overlaps between controls, horizontal scroll; base vs new
import { open, APP } from './v3-v2d-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/VS2b-fix.html';
const VPS = [['P1', 390, 844], ['P2', 375, 667], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375]];
const res = {};
for (const [name, file] of [['base', BASE], ['new', APP]]) for (const [id, w, h] of VPS) {
  const {b, p, errs} = await open({width: w, height: h}, file, true);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); });
  await p.tap('#bMenu'); await p.waitForTimeout(500);
  const m = await p.evaluate(() => {
    const menu = document.getElementById('menu'); const mr = menu.getBoundingClientRect();
    const ctr = [...menu.querySelectorAll('button, input, select, .seg, .row, .lbl, label, .small')].filter(e => e.offsetParent && getComputedStyle(e).visibility === 'visible');
    const issues = [];
    const hscroll = document.documentElement.scrollWidth > innerWidth + 1 || document.body.scrollWidth > innerWidth + 1;
    // horizontal scroll inside the menu's scroll containers
    const scrollers = [...menu.querySelectorAll('*')].filter(e => e.scrollWidth > e.clientWidth + 2 && /(auto|scroll)/.test(getComputedStyle(e).overflowX));
    for (const e of ctr) {
      const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
      // inside the horizontal bounds of the menu panel
      if (r.left < mr.left - 1 || r.right > mr.right + 1) issues.push('outX ' + (e.textContent || '').trim().slice(0, 20) + ' ' + Math.round(r.left) + '-' + Math.round(r.right) + ' menu ' + Math.round(mr.left) + '-' + Math.round(mr.right));
      if (e.tagName === 'BUTTON' && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 2)) issues.push('clipText ' + e.textContent.trim().slice(0, 24) + ' ' + e.scrollWidth + '>' + e.clientWidth + ' / ' + e.scrollHeight + '>' + e.clientHeight);
    }
    const bt = ctr.filter(e => e.tagName === 'BUTTON' || e.tagName === 'INPUT');
    for (let i = 0; i < bt.length; i++) for (let j = i + 1; j < bt.length; j++) {
      const a = bt[i].getBoundingClientRect(), c = bt[j].getBoundingClientRect();
      const ix = Math.min(a.right, c.right) - Math.max(a.left, c.left), iy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
      if (ix > 1 && iy > 1 && !bt[i].contains(bt[j]) && !bt[j].contains(bt[i])) issues.push('overlap ' + bt[i].textContent.trim().slice(0, 14) + ' X ' + bt[j].textContent.trim().slice(0, 14));
    }
    // the Harmonie section: rows and their sizes
    const harm = [...menu.querySelectorAll('button')].filter(x => /^(An|Aus|Einrasten|Erlauben|Projekt-Tonart|Automatisch|Bleiben|Mittransponieren|S\d|MEL.*)$/.test(x.textContent.trim()) && x.offsetParent).map(x => { const r = x.getBoundingClientRect(); return x.textContent.trim() + ' ' + Math.round(r.width) + 'x' + Math.round(r.height); });
    return {hscroll, scrollers: scrollers.map(e => e.className + ' ' + e.scrollWidth + '>' + e.clientWidth), issues, harm, menuW: Math.round(mr.width)};
  });
  // scroll the Harmonie section into view and screenshot
  await p.evaluate(() => { const e = [...document.querySelectorAll('#menu button')].find(x => x.textContent.trim() === 'Mittransponieren' || x.textContent.trim() === 'Tonart sperren'); if (e) e.scrollIntoView({block: 'center'}); });
  await p.waitForTimeout(200);
  await p.screenshot({path: `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2c2reg-menu-${name}-${id}.png`});
  m.errs = errs.slice(); res[name + id] = m; await b.close();
}
for (const [id] of VPS) { const A = res['base' + id], B = res['new' + id];
  const newIss = B.issues.filter(x => !A.issues.includes(x));
  console.log('==', id, 'menuW', B.menuW, 'hscroll', B.hscroll, 'scrollers', JSON.stringify(B.scrollers), 'base scrollers', JSON.stringify(A.scrollers), 'errs', JSON.stringify(B.errs));
  console.log('  issues new', B.issues.length, 'base', A.issues.length, 'NEW ONLY:', JSON.stringify(newIss.slice(0, 20)));
  console.log('  harm', JSON.stringify(B.harm));
}
