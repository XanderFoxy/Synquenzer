// V2c′: main screen in a NEW project (Eine Skala on) with an e-minor scene under Träger C and F#m7b5, PLAY and TRANSPOSE;
// readout text, clipped / overflowing elements; base vs new; screenshots
import { open, APP } from './v3-v2d-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/VS2b-fix.html';
const res = {};
for (const [name, file] of [['base', BASE], ['new', APP]]) for (const [id, w, h] of [['P1', 390, 844], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375]]) for (const chord of [[60, 64, 67], [66, 69, 72, 76]]) {
  const {b, p, errs} = await open({width: w, height: h}, file, true);
  await p.evaluate(async ch => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120); const K = {root: 4, scale: 'aeolian'};
    Q.setClip(0, 0, {len: 1, key: K, notes: [64, 66, 67, 71].map((n, t) => ({t, d: .5, n, v: .8}))}); Q.setClip(1, 0, {len: 1, key: K, notes: [76, 78, 79, 74].map((n, t) => ({t, d: .5, n, v: .8}))});
    Q.setKbMode('transpose'); Q.launchScene(0); for (const n of ch) Q.keyOn(n, .8); await new Promise(r => setTimeout(r, 150)); for (const n of ch) Q.keyOff(n); }, chord);
  await p.waitForTimeout(800);
  const r = {};
  for (const mode of ['transpose', 'play']) {
    await p.evaluate(m => window.SYNQUENZER.setKbMode(m), mode); await p.waitForTimeout(400);
    r[mode] = await p.evaluate(() => { const Q = window.SYNQUENZER; const bad = [];
      for (const e of document.querySelectorAll('button, .chip, #lcd, .lcd, [id*=car], [class*=car], [class*=key]')) { const cs = getComputedStyle(e); if (!e.offsetParent || cs.visibility !== 'visible') continue; if (e.closest('#menu, .pop')) continue;
        const q = e.getBoundingClientRect(); if (q.width < 2) continue;
        if ((e.scrollWidth > e.clientWidth + 1 && cs.overflow !== 'visible') || q.right > innerWidth + 1 || q.left < -1) bad.push((e.id || e.className).toString().slice(0, 30) + ':' + e.textContent.trim().slice(0, 24) + ' ' + e.scrollWidth + '/' + e.clientWidth); }
      const cs = Q.carrierShown ? Q.carrierShown() : null; return {shown: cs && (cs.text || cs.label || JSON.stringify(cs).slice(0, 120)), car: Q.runtime().carrier && Q.runtime().carrier.name, bad, hs: document.documentElement.scrollWidth > innerWidth + 1}; });
  }
  if (name === 'new') await p.screenshot({path: `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2c2reg-lay2-${id}-${chord.length}.png`});
  r.errs = errs.slice(); res[name + id + chord.length] = r; await b.close();
}
for (const k of Object.keys(res).filter(k => k.startsWith('new'))) { const A = res[k.replace('new', 'base')], B = res[k];
  for (const m of ['transpose', 'play']) { const nb = B[m].bad.filter(x => !A[m].bad.includes(x)); console.log(k, m, 'car', B[m].car, 'shown', JSON.stringify(B[m].shown), '| base', JSON.stringify(A[m].shown), 'newBad', JSON.stringify(nb), 'hs', B[m].hs, 'errs', B.errs.length); } }
