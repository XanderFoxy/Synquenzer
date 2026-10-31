// I2-49 Hören (M-HÖR) und I2-51 (VEL-Leiste ROLLE, VEL-Reiter LAUF und SCHRITTE):
// erstes Audio ≤ 40 ms nach dem Zieh-Ereignis, das ≥ 2 Stufen ändert; ≤ 11 Anspiel-Noten/s; Pegel folgt dem Anschlag (± 1 dB);
// 1 s nach dem Loslassen keine klingende Vorhör-Stimme. Abgriff: Aufnahme-Worklet am Master (Einsatz) und am Spur-Ausgang (Pegel, Stille).
const L = require('./lib.cjs');
const rows = [], ok = (id, c, txt) => rows.push({id, ok: !!c, txt});
const REC = `class R extends AudioWorkletProcessor{process(i){const c=i[0]&&i[0][0];let pk=0,ss=0,fi=-1,n=0;if(c){n=c.length;for(let k=0;k<n;k++){const a=Math.abs(c[k]);if(a>pk)pk=a;ss+=c[k]*c[k];if(fi<0&&a>0.001)fi=k;}}this.port.postMessage([currentFrame,pk,ss,fi,n]);return true}}registerProcessor('i2f-rec',R);`;
async function setupRec(p, t) {
  await p.evaluate(async ([code, t]) => {
    ensureAudio(); const c = AU.ctx; if (c.state !== 'running') await c.resume();
    if (!window.__recOk) { await c.audioWorklet.addModule('data:application/javascript;charset=utf-8,' + encodeURIComponent(code)); window.__recOk = true; }
    window.__R = window.__R || {m: [], t: []};
    const mk = (src, arr) => { const n = new AudioWorkletNode(c, 'i2f-rec'); const z = c.createGain(); z.gain.value = 0; src.connect(n); n.connect(z); z.connect(c.destination); n.port.onmessage = e => arr.push(e.data); return n; };
    if (!window.__RM) window.__RM = mk(AU.M.ceil, __R.m);
    if (window.__RT) { try { window.__RT.disconnect(); } catch (e) {} }
    __R.t = []; window.__RT = mk(AU.tracks[t].cut, __R.t);
    // Spione: Vorhör-Stimmen (ROLLE/LAUF) und Drum-Schläge, Zieh-Ereignisse mit Kontext-Zeit
    window.__V = []; window.__EV = [];
    if (!window.__spy) { window.__spy = true;
      const vv = window.velVoice; window.velVoice = (...a) => { const r = vv(...a); __V.push({now: performance.now(), ctx: AU.ctx.currentTime, start: r && r.start, v: a[2], k: 'v'}); return r; };
      const dh = window.drumHit; window.drumHit = (...a) => { const r = dh(...a); if (a[3] === 'audition') __V.push({now: performance.now(), ctx: AU.ctx.currentTime, start: r && r.start, v: a[1], k: 'd'}); return r; };
      const rec = e => { if (!AU.ctx) return; const now = performance.now(); __EV.push({k: e.type, ts: e.timeStamp, now, ctx: AU.ctx.currentTime - (now - e.timeStamp) / 1000}); };
      window.addEventListener('pointermove', rec, true); window.addEventListener('pointerup', rec, true); }
  }, [REC, t]);
}
// Auswertung im Node: Einsatz nach dem ersten auslösenden Ereignis, Rate, Stille nach dem Loslassen
async function evalRun(p, name, id, trackCut = true) {
  const d = await p.evaluate(() => ({V: __V, EV: __EV, m: __R.m, t: __R.t, sr: AU.ctx.sampleRate}));
  const sr = d.sr, moves = d.EV.filter(e => e.k === 'pointermove'), up = d.EV.filter(e => e.k === 'pointerup').pop();
  if (!d.V.length) { ok(id, false, name + ': keine Vorhör-Note'); return; }
  const v0 = d.V[0], ev = moves.filter(e => e.now <= v0.now + .5).pop();
  // erster Block am Master mit Probe > −60 dBFS ab dem Ereignis
  let onset = null; for (const [f, pk, ss, fi] of d.m) { const tb = f / sr; if (tb + 128 / sr < ev.ctx - .003) continue; if (fi >= 0) { onset = (f + fi) / sr; break; } }
  const lat = onset == null ? null : (onset - ev.ctx) * 1000;
  console.log('   ' + name + ' Zerlegung: Ereignis→Handler ' + (ev.now - ev.ts).toFixed(1) + ' ms · Handler→Start geplant ' + ((v0.start - ev.ctx) * 1000).toFixed(1) + ' ms · Start→erstes Sample ' + (onset == null ? '–' : ((onset - v0.start) * 1000).toFixed(1)) + ' ms');
  const net = lat == null ? null : lat - (ev.now - ev.ts);
  ok(id, net != null && net <= 40 && net >= 0, `${name}: erstes Audio ${net == null ? '–' : net.toFixed(1)} ms nach Zustellung des Zieh-Ereignisses (Soll ≤ 40 ms; Kontext-Zeit, Ausgabe-Latenz nicht gezählt)`);
  INFO.push(`${name}: ab Zeitstempel des Ereignisses ${lat == null ? '–' : lat.toFixed(1)} ms, davon ${(ev.now - ev.ts).toFixed(1)} ms Zustellung durch Chromium (leere Seite: ${BASE.toFixed(1)} ms)`);
  // Rate: höchstens Noten in einem 1-s-Fenster
  const ts = d.V.map(x => x.now); let mx = 0; for (let i = 0; i < ts.length; i++) { let k = i; while (k < ts.length && ts[k] < ts[i] + 1000) k++; mx = Math.max(mx, k - i); }
  const gaps = ts.slice(1).map((x, i) => x - ts[i]), gmin = gaps.length ? Math.min(...gaps) : null;
  ok(id, mx <= 11, `${name}: ${d.V.length} Anspiel-Noten, höchstens ${mx} in einem 1-s-Fenster (Soll ≤ 11), kleinster Abstand ${gmin == null ? '–' : gmin.toFixed(1)} ms, ${moves.length} Zieh-Ereignisse`);
  // Stille: 1,0–1,4 s nach dem Loslassen am Spur-Ausgang (ohne Hall-/Echo-Rückweg)
  const A = trackCut ? d.t : d.m; let pk = 0, n = 0;
  for (const [f, p2] of A) { const tb = f / sr; if (tb >= up.ctx + 1.0 && tb <= up.ctx + 1.4) { pk = Math.max(pk, p2); n++; } }
  const db = pk > 0 ? 20 * Math.log10(pk) : -Infinity;
  ok(id, n > 50 && db < -60, `${name}: 1,0–1,4 s nach dem Loslassen Spitze ${isFinite(db) ? db.toFixed(1) : '−∞'} dBFS (${n} Blöcke, Soll < −60 dBFS)`);
}
const quiet = p => p.waitForTimeout(1600);
const INFO = []; let BASE = 0;
async function baseline(b) {   // Chromium-Zustellung von pointermove auf einer leeren Seite (gleiche Touch-Folge)
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true}), p = await ctx.newPage();
  await p.setContent('<div id=d style="width:300px;height:600px;touch-action:none"></div><script>window.E=[];d.addEventListener("pointermove",e=>E.push(performance.now()-e.timeStamp))</script>');
  const c = await ctx.newCDPSession(p); await c.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: 100, y: 300}]});
  for (let k = 0; k < 40; k++) { await p.waitForTimeout(16); await c.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: 100, y: 300 - k * 3}]}); }
  await c.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
  const e = await p.evaluate(() => E); await ctx.close(); return e.reduce((a, x) => a + x, 0) / e.length;
}
(async () => {
  const b = await L.launch(); BASE = await baseline(b); const p = await L.open(b, 'P1');
  // ---- ROLLE, Werkzeug ⇕ (Spur 4 „Mini-Lead“, VA) ----
  await L.rollWith(p, [{t: 0, n: 60, v: .2, d: 1}, {t: 1, n: 64, v: .5, d: 2}], {t: 3});
  await p.waitForTimeout(300); await setupRec(p, 3);
  await p.evaluate(() => { ED.roll.setTool('vel'); ED.roll.centerOn(62); }); await quiet(p);
  let a = await p.evaluate(() => ED.roll._xy(0.4, 60));
  await p.evaluate(() => { __V.length = 0; __EV.length = 0; });
  // langsam anfahren (1 px je Ereignis: die ersten Ereignisse ändern < 2 Stufen), dann 2 s auf und ab
  let pts = [[a.x, a.y]]; for (let k = 1; k <= 8; k++) pts.push([a.x, a.y - k]);
  for (let r = 0; r < 4; r++) { const y0 = pts[pts.length - 1][1]; pts = pts.concat(L.line(a.x, y0, a.x, y0 - 120, 16).slice(1), L.line(a.x, y0 - 120, a.x, y0, 16).slice(1)); }
  await L.touch(p, pts, 16); await p.waitForTimeout(1600);
  await evalRun(p, 'ROLLE ⇕', 'I2-49');
  // erstes auslösendes Ereignis: hat es ≥ 2 Stufen geändert? (1 px = 0,005 → 0,64 Stufen; erst das 4. px-Ereignis erreicht 2 Stufen)
  const firstV = await p.evaluate(() => __V[0] && __V[0].v);
  ok('I2-49', firstV != null && Math.abs(Math.round(firstV * 127) - Math.round(.2 * 127)) >= 2, `erste Vorhör-Note erst ab ≥ 2 Stufen: VEL ${Math.round(.2 * 127)} → ${Math.round(firstV * 127)}`);
  // Länge: min(Notenlänge, 350 ms) – Note 0 (1 Schlag bei 112 BPM = 536 ms) → 350 ms; höchstens 2 gleichzeitig
  const lens = await p.evaluate(() => VELV.map(x => +x.len.toFixed(3)));
  ok('I2-49', lens.length <= 2 && lens.every(x => x === .35), `Vorhör-Stimmen zuletzt: ${lens.length} (≤ 2), Länge ${lens.join(', ')} s (Soll 0,35 = min(536 ms, 350 ms))`);
  // ---- Pegel folgt dem Anschlag: Vorhören bei 0,3 und 0,9 gegen dieselbe Note direkt gespielt (Kennlinie des Klangs) ----
  async function rmsOf(fn) {
    await quiet(p);
    const t0 = await p.evaluate(fn);
    await p.waitForTimeout(700);
    return p.evaluate(t0 => { const sr = AU.ctx.sampleRate; let ss = 0, n = 0; for (const [f, pk, s2, fi, m] of __R.t) { const tb = f / sr; if (tb >= t0 + .02 && tb < t0 + .3) { ss += s2; n += m; } } return n ? 10 * Math.log10(ss / n) : null; }, t0);
  }
  for (const [t, nm] of [[3, 'Mini-Lead (VA)'], [1, 'FM-Pluck (FM)']]) {
    await setupRec(p, t);
    const hv = v => rmsOf(new Function(`const vo = velVoice(${t}, 60, ${v}, 1); return vo ? vo.start : AU.ctx.currentTime;`));
    const rv = v => rmsOf(new Function(`const vo = auditionStart(${t}, 60, ${v}); vo.release(vo.start + .35); return vo.start;`));
    const avg = async f => { let a2 = 0; for (let k = 0; k < 3; k++) a2 += await f(); return a2 / 3; };   // 3 Anschläge je Fall (analoges Driften)
    const h3 = await avg(() => hv(.3)), h9 = await avg(() => hv(.9)), r3 = await avg(() => rv(.3)), r9 = await avg(() => rv(.9));
    const P = await p.evaluate(t => { const s = S.tracks[t].sound.p; return {ampVel: s.ampVel, fvel: s.fvel}; }, t);
    const dH = h9 - h3, dR = r9 - r3, amp = 20 * Math.log10((1 - P.ampVel + P.ampVel * .9) / (1 - P.ampVel + P.ampVel * .3));
    ok('I2-49', Math.abs(dH - dR) <= 1 && Math.abs(dH) > .5, `${nm}: RMS 0,3 → 0,9 beim Vorhören ${dH.toFixed(2)} dB, Kennlinie des Klangs (gleiche Note gespielt) ${dR.toFixed(2)} dB, Abweichung ${Math.abs(dH - dR).toFixed(2)} dB (Soll ± 1)` + (P.fvel === 0 ? ` · nur Pegel-Kennlinie ${amp.toFixed(2)} dB` : ` · ampVel ${P.ampVel}, fvel ${P.fvel}`));
  }
  // ---- VEL-Leiste der ROLLE (I2-51) ----
  await L.rollWith(p, [{t: 0, n: 60, v: .2, d: 1}, {t: 2, n: 62, v: .4, d: 1}], {t: 3});
  await p.waitForTimeout(300); await setupRec(p, 3); await quiet(p);
  a = await p.evaluate(() => ED.roll._vel(0, .2));
  await p.evaluate(() => { __V.length = 0; __EV.length = 0; });
  pts = [[a.x, a.y]]; for (let r = 0; r < 4; r++) { const y0 = a.y; pts = pts.concat(L.line(a.x, y0, a.x, y0 - 40, 12).slice(1), L.line(a.x, y0 - 40, a.x, y0, 12).slice(1)); }
  await L.touch(p, pts, 16); await p.waitForTimeout(1600);
  await evalRun(p, 'ROLLE VEL-Leiste', 'I2-51');
  // ---- LAUF, VEL-Reiter (I2-51) ----
  await p.evaluate(() => { const t = 3; S.tracks[t].clips[1] = {len: 1, key: {root: 0, scale: 'ionian', src: 'auto'}, notes: [0, 1, 2, 3].map(k => ({t: k, d: .24, n: 60 + k, v: .3}))}; clipChanged(t, 1); ROLLP.view = 'lauf'; openRoll(t, 1); LAUF.lane = 'vel'; buildRoll(); });
  await p.waitForTimeout(400); await setupRec(p, 3); await quiet(p);
  const lv = await p.evaluate(() => ({lauf: !!ED.lauf, lane: LAUF.lane, cell: (() => { const r = ED.lauf.se.el.row.children[4].getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; })()}));
  await p.evaluate(() => { __V.length = 0; __EV.length = 0; });
  pts = [[lv.cell.x, lv.cell.y]]; for (let r = 0; r < 4; r++) { const y0 = lv.cell.y; pts = pts.concat(L.line(lv.cell.x, y0, lv.cell.x, y0 - 60, 14).slice(1), L.line(lv.cell.x, y0 - 60, lv.cell.x, y0, 14).slice(1)); }
  await L.touch(p, pts, 16); await p.waitForTimeout(1600);
  await evalRun(p, 'LAUF VEL-Reiter', 'I2-51');
  // ---- SCHRITTE, VEL-Reiter (I2-51) ----
  await p.evaluate(() => { const t = DRUM_T; S.tracks[t].clips[0] = {len: 1, key: {root: 0, scale: 'ionian', src: 'auto'}, notes: [0, 1, 2, 3].map(k => ({t: k, d: .1, n: 36, v: .3})), seed: 7}; clipChanged(t, 0); selectSlot(t, 0); ED.dVoice = 0; ED.sLane = 'vel'; openRoll(t, 0); });
  await p.waitForTimeout(500); await setupRec(p, await p.evaluate(() => DRUM_T)); await quiet(p);
  const sv = await p.evaluate(() => ({lane: ED.step && ED.step.lane, cell: (() => { const r = ED.step.el.row.children[4].getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; })()}));
  await p.evaluate(() => { __V.length = 0; __EV.length = 0; });
  pts = [[sv.cell.x, sv.cell.y]]; for (let r = 0; r < 4; r++) { const y0 = sv.cell.y; pts = pts.concat(L.line(sv.cell.x, y0, sv.cell.x, y0 - 60, 14).slice(1), L.line(sv.cell.x, y0 - 60, sv.cell.x, y0, 14).slice(1)); }
  await L.touch(p, pts, 16); await p.waitForTimeout(1600);
  await evalRun(p, 'SCHRITTE VEL-Reiter (Kick)', 'I2-51');
  ok('I2-49', !p.errs.length, 'Konsolenfehler: ' + p.errs.length + ' ' + p.errs.slice(0, 2).join(' | '));
  for (const x of INFO) console.log('INFO ' + x);
  await b.close(); process.exitCode = L.report('I2-49/I2-51', rows) ? 1 : 0;
})();
