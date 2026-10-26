// QA regression MK2: ECO fallback (forceNative) with the new waves; sound paths (setSound, library load, undo, A/B import)
// bring the stored wave to the context; demo + MK tracks keep playing, no console errors
import { open, APP } from './v3-mk0reg-pw.mjs';
// 1) ECO: forceNative before the audio start
{ const {b, p, errs} = await open({width: 390, height: 844}, APP);
  const r = await p.evaluate(async () => { const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); const eng0 = Q.forceNative(true);
    Q.newProject({init: true}); Q.setBpm(120); const K = {root: 9, scale: 'aeolian'};
    for (let t = 0; t < 4; t++) Q.setClip(t, 0, {len: 1, key: K, notes: [0, 1, 2, 3].map(x => ({t: x, d: .8, n: 57 + x * 2 + t, v: .8}))});
    for (let t = 0; t < 4; t++) Q.setEngine(t, 'mk'); await sl(200);
    Q.mkSet(0, 't.0.o1.w', 5); Q.mkSet(1, 't.0.o1.w', 3); Q.mkSet(1, 't.0.o1.c1', 90); Q.mkSet(2, 't.0.o1.w', 4); Q.mkSet(3, 't.0.o1.w', 6); Q.mkSet(0, 't.0.p.1.i', 50);
    Q.launchScene(0); await sl(1200); const o = {eng0, info: JSON.stringify(Q.engineInfo()).slice(0, 260)};
    for (let t = 0; t < 4; t++) { for (let u = 0; u < 4; u++) Q.setMute(u, u !== t); await sl(500); const xs = []; for (let k = 0; k < 12; k++) { xs.push(Q.meter().rmsDb); await sl(40); } o['t' + t] = +Math.max(...xs.filter(isFinite)).toFixed(1); }
    for (let u = 0; u < 4; u++) Q.setMute(u, false); Q.stop(); o.te = Q.tickErrors(); return o; });
  console.log('ECO', JSON.stringify(r), 'errs', JSON.stringify(errs)); await b.close(); }
// 2) sound paths: does the octave wave 62 reach the context without a played note?
{ const {b, p, errs} = await open({width: 390, height: 844}, APP);
  const r = await p.evaluate(async () => { const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)), o = {};
    const sent = n => { try { const c = MKUI.wv.WV.ctx.get(AU.ctx); return !!(c && c.sent.has(n)); } catch (e) { return 'err ' + e; } };
    Q.newProject({init: true}); Q.setEngine(0, 'mk'); Q.setEngine(1, 'mk'); Q.setEngine(2, 'mk'); Q.setEngine(3, 'mk'); await Q.audition(0, 60, 100); await sl(400);
    // setSound
    let s = Q.getSound(1); s.p.mk.t[0].o1.w = 5; s.p.mk.t[0].o1.c2 = 2 * 62 - 2; Q.setSound(1, s); await sl(300); o.setSound62 = sent(62);
    // undo back to INIT and redo: wave 63 via setSound, then undo/redo
    s = Q.getSound(2); s.p.mk.t[0].o1.w = 5; s.p.mk.t[0].o1.c2 = 2 * 63 - 2; Q.setSound(2, s); await sl(300); o.setSound63 = sent(63);
    // library: save a sound with wave 64 (without sending: build it from the saved data), load it on track 3
    s = Q.getSound(3); s.p.mk.t[0].o1.w = 5; s.p.mk.t[0].o1.c2 = 2 * 35 - 2; s.name = 'QA Endlos';
    let id = null; try { Q.setSound(0, s); await sl(100); const rec = await Q.saveSound(0, 'QA Endlos'); id = rec && (rec.id || rec); o.rec = JSON.stringify(rec).slice(0, 120); MKUI.wv.WV.built.delete(35); const c = MKUI.wv.WV.ctx.get(AU.ctx); c && c.sent.delete(35); } catch (e) { o.saveErr = String(e); }
    o.libId = typeof id === 'string' ? id.slice(0, 8) : JSON.stringify(id).slice(0, 60);
    if (typeof id === 'string') { try { await Q.loadPreset(3, id); } catch (e) { o.loadErr = String(e); } await sl(400); o.lib35 = sent(35); o.lib35w = JSON.stringify(Q.mkGet(3).t[0].o1); }
    // undo of the library load, redo
    Q.undo(); await sl(100); o.afterUndo = JSON.stringify(Q.mkGet(3).t[0].o1); Q.redo(); await sl(300); o.afterRedo = JSON.stringify(Q.mkGet(3).t[0].o1);
    // play every track once (a note each): no errors, meter
    for (let t = 0; t < 4; t++) await Q.audition(t, 57 + t, 200);
    await sl(300); o.info = Q.mkInfo(); return o; });
  console.log('PATHS', JSON.stringify(r), 'errs', JSON.stringify(errs)); await b.close(); }
