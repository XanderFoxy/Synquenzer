// QA regression (V2d): synth editor (VA) and FM page via the real buttons, P1 and L1; base vs new; errors, clipping
import { open, APP } from './v3-v2d-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/V2d′-fix.html';
const res = {};
for (const [name, file] of [['base', BASE], ['new', APP]]) for (const [vp, w, h] of [['P1', 390, 844], ['L1', 844, 390]]) {
  const {b, p, errs} = await open({width: w, height: h}, file, true);
  await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.setBpm(120); Q.launchScene(0); Q.selectSlot(0, 0); });
  await p.waitForTimeout(500);
  await p.tap('#bKlang'); await p.waitForTimeout(500);
  const r = {ed: await p.evaluate(() => window.SYNQUENZER.runtime().editor)};
  // all visible tab-like buttons in the editor
  const tabs = await p.evaluate(() => { const ed = document.querySelector('#editor, .editor, #synthEd, .sheet.open') || document.body; return [...document.querySelectorAll('[data-tab], [data-page], .tab, .seg button')].filter(x => x.offsetParent && getComputedStyle(x).visibility === 'visible').map(x => (x.dataset.tab || x.dataset.page || '') + ':' + x.textContent.trim().slice(0, 12)); });
  r.tabs = tabs;
  const visited = [];
  for (const t of tabs.slice(0, 20)) {
    const ok = await p.evaluate(t => { const el = [...document.querySelectorAll('[data-tab], [data-page], .tab, .seg button')].find(x => x.offsetParent && ((x.dataset.tab || x.dataset.page || '') + ':' + x.textContent.trim().slice(0, 12)) === t); if (!el) return false; el.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, pointerId: 1, isPrimary: true})); el.dispatchEvent(new PointerEvent('pointerup', {bubbles: true, pointerId: 1, isPrimary: true})); el.click(); return true; }, t);
    await p.waitForTimeout(120); visited.push(t + (ok ? '' : '(x)'));
  }
  // switch to FM and open the FM page
  await p.evaluate(() => window.SYNQUENZER.setEngine(0, 'fm')); await p.waitForTimeout(400);
  r.fm = await p.evaluate(() => window.SYNQUENZER.fmUi());
  await p.screenshot({path: `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2ereg/ed-${name}-${vp}.png`});
  r.clipped = await p.evaluate(() => [...document.querySelectorAll('button')].filter(x => x.offsetParent && getComputedStyle(x).visibility === 'visible').filter(x => { const q = x.getBoundingClientRect(); return q.right > innerWidth + 1 || q.bottom > innerHeight + 1 || q.left < -1; }).map(x => x.textContent.trim().slice(0, 12)));
  await p.tap('#bKlang').catch(() => {}); await p.waitForTimeout(300);
  r.closed = await p.evaluate(() => window.SYNQUENZER.runtime().editor);
  r.errs = errs.slice(); r.visited = visited.length;
  res[name + vp] = r; await b.close();
}
for (const vp of ['P1', 'L1']) { const A = res['base' + vp], B = res['new' + vp]; for (const f of Object.keys(B)) { const s = JSON.stringify(A[f]) === JSON.stringify(B[f]); console.log(vp, f, s ? 'same' : 'DIFF', JSON.stringify(B[f]).slice(0, 400), s ? '' : ' base ' + JSON.stringify(A[f]).slice(0, 400)); } }
