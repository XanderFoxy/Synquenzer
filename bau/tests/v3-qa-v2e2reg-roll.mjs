// QA regression V2e′: ROLLE on a scene clip and on the song melody (actions, step input, undo) base vs new, P1 + L1
import { open, NEW, BASE, OUT } from './v3-qa-v2e2reg-pw.mjs';
const res = {};
for (const [name, file] of [['base', BASE], ['new', NEW]]) for (const [vp, w, h] of [['P1', 390, 844], ['L1', 844, 390]]) {
  const {b, p, errs} = await open({width: w, height: h}, file, true);
  const r = await p.evaluate(async () => { const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); Q.newProject({init: true}); const K = {root: 9, scale: 'aeolian'}, N = (t, n, d) => ({t, d: d || .5, n, v: .8});
    Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 57), N(1, 60), N(2, 64, 1), N(3, 60)]}); Q.selectSlot(0, 0); Q.openRoll(0, 0); await sl(500);
    const ed = Q.rollApi(), o = {};
    const click = t => { const x = [...ed.el.acts.querySelectorAll('button'), ...ed.el.bar.querySelectorAll('button')].find(b => b.textContent.trim() === t); if (!x) return false; x.click(); return true; };
    const cs = () => Q.getClip(0, 0).notes.map(n => n.n + '@' + n.t + '/' + n.d).sort().join(' ');
    for (const t of ['▲ Stufe', '+12', 'Legato', 'Dupl.']) { o[t] = click(t); await sl(80); }
    o.after = cs(); o.len = Q.getClip(0, 0).len;
    for (let i = 0; i < 4; i++) Q.undo(); await sl(80); o.undone = cs();
    // step input: Schritt on, tap 3 keys
    o.step = click('Schritt'); await sl(100);
    for (const n of [62, 65, 69]) { Q.tap(n, 80); await sl(120); }
    await sl(200); o.stepped = cs(); Q.undo(); await sl(80); o.stepUndo = cs();
    Q.closeRoll(); await sl(300); o.ed = Q.runtime().editor;
    // song melody roll
    Q.songFromChain([{scene: 0, bars: 2}]); Q.songView(true); await sl(300);
    try { Q.openMelody(); await sl(500); o.mel = Q.runtime().editor; const e2 = Q.rollApi(); o.melHead = e2 && e2.el ? (document.querySelector('#rollSheet .sh-title, .rhead .sh-title') || {}).textContent : null; Q.closeRoll(); await sl(200); } catch (e) { o.melErr = String(e); }
    o.te = Q.tickErrors(); return o; });
  r.errs = errs.slice(); res[name + vp] = r; await b.close();
}
for (const vp of ['P1', 'L1']) { const A = res['base' + vp], B = res['new' + vp]; for (const f of Object.keys(B)) { const s = JSON.stringify(A[f]) === JSON.stringify(B[f]); console.log(vp, f, s ? 'same' : 'DIFF', JSON.stringify(B[f]).slice(0, 300), s ? '' : ' base ' + JSON.stringify(A[f]).slice(0, 300)); } }
