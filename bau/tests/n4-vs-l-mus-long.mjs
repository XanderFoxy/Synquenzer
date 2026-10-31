// Musiker-Ablauf über Touch: Demo, Groove, ● 4 Takte (An) → OK → Overdub ● 16 Takte (● nach dem Taktstrich) → Clip 16 Takte.
// Undo/Redo deep-equal, Speichern/Laden (serialize/importJSON) + Neuladen der Seite (Takes aus dem Speicher), dann 3 min Wiedergabe
// mit Szenenwechseln: Stimme in jedem gesungenen Takt hörbar, still in Szene 2, keine Klick-Spitze, keine Fehler.
import {start, sing, melN, prep, fire, waitBeat, idle, stInfo, sungBarHeard, NEW, sleep, tapSel, undoN, deq, snap, takeDb} from './n4-vs-l-mus-h.mjs';
const file = process.argv[2] || NEW, BPM = 112, spb = 60 / BPM;
const H = await start(file, BPM, {demo: true, touch: true}), p = H.p;
const k1 = await prep(H, sing(melN(4), BPM)), k2 = await prep(H, sing(melN(16, 2), BPM, 5));
await p.evaluate(() => { SYNQUENZER.launchScene(0); SYNQUENZER.selectSlot(5, 0); SYNQUENZER.play(); });
await waitBeat(p, 1.0); await tapSel(H, '#bRec'); await fire(H, k1, 4);
await waitBeat(p, 19.5); await tapSel(H, '#bRec'); await waitBeat(p, 23); await idle(p); await sleep(300);
await tapSel(H, '.vsres button[data-a="ok"]'); await sleep(300);
const s4 = await snap(p), u4 = await undoN(p);
await waitBeat(p, 39.3); await fire(H, k2, 40);
await waitBeat(p, 40.0); await tapSel(H, '#bRec');
await waitBeat(p, 104.1); await tapSel(H, '#bRec'); await waitBeat(p, 107); await idle(p); await sleep(400);
const r = await stInfo(p, 0), s16 = await snap(p), u16 = await undoN(p);
console.log('Overdub:', JSON.stringify({len: r.len, sec: +(r.audio.out - r.audio.in).toFixed(3), at: r.audio.at, alt: (r.audio.alt || []).length, cstart: r.cstart, mel: r.mel}), 'Undo', u4, '→', u16);
const sheet = await p.evaluate(() => !!document.querySelector('.vsres')); if (sheet) { await tapSel(H, '.vsres button[data-a="ok"]'); await sleep(300); }
await p.evaluate(() => SYNQUENZER.stop()); await sleep(300);
await p.evaluate(() => SYNQUENZER.undo()); const su = await snap(p);
await p.evaluate(() => SYNQUENZER.redo()); const sr = await snap(p);
console.log('Undo → 4-Takt-Stand deep-equal:', deq(su, s4), '| Redo → 16-Takt-Stand deep-equal:', deq(sr, s16));
// Undo per Touch-Knopf
const ub = await tapSel(H, '#bUndo'); await sleep(300); const su2 = await snap(p);
console.log('↶ getippt', ub, '→ deep-equal 4-Takt-Stand:', deq(su2, s4));
await p.evaluate(() => SYNQUENZER.redo()); await sleep(200);
const J = await p.evaluate(() => SYNQUENZER.serialize());
await p.evaluate(j => { SYNQUENZER.newProject(); SYNQUENZER.importJSON(j); }, J); await sleep(800);
const sl = await snap(p), rl = await stInfo(p, 0);
const dl = await takeDb(p, rl.audio.take, rl.audio.in + 15 * 4 * spb, rl.audio.in + 16 * 4 * spb);
console.log('Speichern/Laden deep-equal:', deq(sl, s16), '| Take nach Laden Takt 16:', dl, 'dBFS');
await sleep(2500);   // Autosave
console.log('Fehler bis hier:', JSON.stringify(H.errs.slice(0, 3)));
await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version); await sleep(2500);
const sR = await snap(p); const rR = await p.evaluate(() => { const st = SYNQUENZER.tkInfo().stimme; const c = st >= 0 ? SYNQUENZER.getClip(st, 0) : null; return c && c.audio ? {st, len: c.len, take: c.audio.take, in: c.audio.in} : null; });
const dR = rR ? await takeDb(p, rR.take, rR.in + 15 * 4 * spb, rR.in + 16 * 4 * spb) : null;
console.log('Neuladen deep-equal:', deq(sR, s16), JSON.stringify(rR), '| Take Takt 16 nach Neuladen:', dR, 'dBFS');
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); }); await sleep(1500);
// 3 min Wiedergabe mit Szenenwechseln; Mitschnitt: Spitzen der 2. Differenz je Block + Pegel (Analyser) an Notenmitten
await p.evaluate(() => { const ctx = window.__ctx; const sp = ctx.createScriptProcessor(1024, 2, 1); window.__cap = []; sp.onaudioprocess = e => { const a = e.inputBuffer.getChannelData(0), b = e.inputBuffer.getChannelData(1); let m = 0, q = 0, p1 = window.__cp1 || 0, p2 = window.__cp2 || 0; for (let i = 0; i < a.length; i++) { const v = (a[i] + b[i]) / 2; const d = Math.abs(v - 2 * p1 + p2); if (d > m) m = d; q += v * v; p2 = p1; p1 = v; } window.__cp1 = p1; window.__cp2 = p2; window.__cap.push([e.playbackTime, m, q / a.length]); }; for (const n of window.__outs) { try { n.connect(sp); } catch (e) {} } sp.connect(ctx.destination); window.__sp = sp; window.__tap(); });
await p.evaluate(() => { const st = SYNQUENZER.tkInfo().stimme; for (let t = 0; t < 8; t++) if (t !== st) try { SYNQUENZER.setMute(t, true); } catch (e) {} SYNQUENZER.setBpm(112); SYNQUENZER.launchScene(0); SYNQUENZER.play(); });
const plan = [[0, 16], [1, 4], [0, 8], [1, 4], [0, 16], [1, 2], [0, 12], [1, 4], [0, 16]];   // Szene, Takte
let bar = 0; const miss = [], leak = [], marks = [];
const t0 = Date.now();
for (const [sc, n] of plan) {
  if (bar > 0) { await waitBeat(p, bar * 4 - 2); await p.evaluate(s => SYNQUENZER.launchScene(s), sc); }
  const ls = bar * 4; marks.push(ls);
  for (let k = 0; k < n; k++) {
    for (const off of [0.8, 2.8]) { const B = (bar + k) * 4 + off; await waitBeat(p, B); const lv = await p.evaluate(() => window.__lvl()); if (sc === 0 && lv < -40) miss.push([+B.toFixed(1), +lv.toFixed(1)]); if (sc === 1 && lv > -60) leak.push([+B.toFixed(1), +lv.toFixed(1)]); }
  }
  bar += n;
}
const dur = (Date.now() - t0) / 1000;
await waitBeat(p, bar * 4 + 0.5); await p.evaluate(() => SYNQUENZER.stop()); await sleep(600);
const cap = await p.evaluate(() => { const st = SYNQUENZER.vsClock(); return {c: window.__cap.map(x => [+x[0].toFixed(3), x[1], x[2]]), start: st.start, spb: st.spb}; });
const d2 = cap.c.map(x => x[1]).sort((a, b) => a - b), med = d2[Math.floor(d2.length / 2)], p99 = d2[Math.floor(d2.length * 0.999)];
const top = cap.c.slice().sort((a, b) => b[1] - a[1]).slice(0, 6).map(x => [+(((x[0] - cap.start) / cap.spb)).toFixed(2), +x[1].toFixed(5)]);
console.log(`3 min (${dur.toFixed(0)} s, ${bar} Takte, ${plan.length - 1} Szenenwechsel): Stimme fehlt an Notenmitten in Szene 1:`, JSON.stringify(miss.slice(0, 12)), `(${miss.length})`, '| Stimme hörbar in Szene 2:', JSON.stringify(leak.slice(0, 6)), `(${leak.length})`);
console.log('2. Differenz: Median', med.toFixed(5), '99,9 %', p99.toFixed(5), '| größte (Schlag, Wert):', JSON.stringify(top), '| Szenen-Anfänge (Schlag):', JSON.stringify(marks));
console.log('Fehler:', JSON.stringify(H.errs.slice(0, 5)));
await H.close();
