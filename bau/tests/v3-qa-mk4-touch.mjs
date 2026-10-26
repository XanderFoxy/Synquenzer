// QA MK4 (FP-IPHONE / touch): CDP touch on the effect positions of EDIT-WAHL 2 at 390x844 and 844x390 while the demo plays;
// values, one undo per gesture, no page scroll/zoom, ZEIT|NOTE swap without jump, LCD texts, rAF median / longtasks (PE1).
import {open, sleep} from './v3-qa-gp2a-lib.mjs';
const FILE = process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK4/index.html';
const R = [];
const ok = (id, c, info) => { R.push({id, c}); console.log((c ? 'PASS ' : 'FAIL ') + id + (info !== undefined ? ' — ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); };
for (const [W, H] of [[390, 844], [844, 390]]) {
  const T = await open({mic: false, file: FILE, viewport: {width: W, height: H}});
  const {E, p, errs} = T; const F = W + 'x' + H;
  await p.addInitScript(() => {});
  await E(() => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({entryTypes: ['longtask']}); } catch (e) {} });
  await E(async () => { const Q = SYNQUENZER; await Q.loadDemo(); Q.setBpm(120); Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.launchScene(0); });
  await sleep(800);
  await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await sleep(600);
  // rAF recorder
  await E(() => { const Q = window.__rf = {fr: [], gaps: [], on: true, last: performance.now(), w0: performance.now(), wn: 0, t0: performance.now()}; const f = () => { const n = performance.now(); Q.gaps.push(n - Q.last); Q.last = n; Q.wn++; if (n - Q.w0 >= 1000) { Q.fr.push(Q.wn * 1000 / (n - Q.w0)); Q.w0 = n; Q.wn = 0; } if (Q.on) requestAnimationFrame(f); }; requestAnimationFrame(f); });
  const mkR = k => E(k => { const e = [...document.querySelectorAll('#synthSheet .mkx[data-k="' + k + '"]')].find(e => e.getClientRects().length); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height, cx: r.x + r.width / 2, cy: r.y + r.height / 2, txt: e.textContent.replace(/\s+/g, ' ').trim()}; }, k);
  const undoN = () => E(() => SYNQUENZER.undoInfo().n);
  const lcd = async () => LCDG;
  const view = () => E(() => ({sx: scrollX, sy: scrollY, sc: visualViewport ? visualViewport.scale : 1, sw: document.documentElement.scrollWidth, iw: innerWidth, de: document.documentElement.scrollTop, bd: document.body.scrollTop}));
  const sel = () => E(() => SYNQUENZER.mkPanel().sel);
  const fx = () => E(() => { const m = SYNQUENZER.mkGet(0); return {mfx: m.mfx, dly: m.dly, eq: m.eq}; });
  const tapK = async k => { const r = await mkR(k); if (!r) return null; await T.tap(r.cx, r.cy, 250); return r; };
  let LCDG = ''; const dragK = async (k, dy, n = 16) => { const r = await mkR(k); if (!r) return null; await T.down(r.cx, r.cy); await sleep(40); await T.glide(r.cx, r.cy, r.cx, r.cy - dy, n, 30); await sleep(40); LCDG = await E(() => { const l = document.querySelector('#synthSheet .mklcd, #synthSheet .lcd, #synthSheet [class*=lcd]'); return (l ? l.innerText : '').replace(/\s+/g, ' ') + ' | ED.lcd: ' + (window.ED && ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ') : '-') + ' | disp: ' + ([...document.querySelectorAll('#synthSheet [class*=disp], #synthSheet [class*=led]')].filter(e=>e.getClientRects().length).map(e => e.textContent.trim()).filter(Boolean).slice(0,3).join(','));}); await T.up(); await sleep(200); return r; };
  const pick = async (k, re) => { await tapK(k); const t = await T.popTexts(); const b = await T.tapPop(re, 250); return b ? 'ok' : 'no row ' + re + ' in ' + JSON.stringify(t); };
  // MOD-FX
  let u0 = await undoN();
  const pm = await pick('w2', /MOD-FX/); const s1 = await sel();
  ok(F + ' EDIT-WAHL 2 list → MOD-FX', pm === 'ok' && s1.wahl === 2 && s1.pos === 4, pm + ' sel ' + JSON.stringify(s1));
  u0 = await undoN(); await dragK('k2', 90); let f1 = await fx(); let u1 = await undoN();
  ok(F + ' MOD-FX TIEFE drag (touch) raises dep, one undo', f1.mfx.dep > 0 && u1 - u0 === 1, 'dep ' + f1.mfx.dep + ', undo +' + (u1 - u0) + ', LCD ' + await lcd());
  u0 = await undoN(); const pt = await pick('k0', /Phaser/); f1 = await fx(); u1 = await undoN();
  ok(F + ' MOD-FX TYP list → Phaser, one undo', pt === 'ok' && f1.mfx.type === 2 && u1 - u0 === 1, pt + ' type ' + f1.mfx.type + ' undo +' + (u1 - u0));
  u0 = await undoN(); await dragK('k1', 50); f1 = await fx(); u1 = await undoN();
  ok(F + ' MOD-FX TEMPO drag', f1.mfx.spd !== 64 && u1 - u0 === 1, 'spd ' + f1.mfx.spd + ' LCD ' + await lcd());
  // DELAY
  const pd = await pick('w2', /DELAY/); const s2 = await sel();
  ok(F + ' EDIT-WAHL 2 list → DELAY', pd === 'ok' && s2.pos === 5, pd + ' ' + JSON.stringify(s2));
  const zRect = await mkR('k2'); const allBefore = await E(() => [...document.querySelectorAll('#synthSheet .mkx')].filter(e => e.getClientRects().length).map(e => { const r = e.getBoundingClientRect(); return [e.dataset.k, r.x, r.y, r.width, r.height]; }));
  u0 = await undoN(); const ps = await pick('k1', /^an/); f1 = await fx(); u1 = await undoN();
  const nRect = await mkR('k2'); const allAfter = await E(() => [...document.querySelectorAll('#synthSheet .mkx')].filter(e => e.getClientRects().length).map(e => { const r = e.getBoundingClientRect(); return [e.dataset.k, r.x, r.y, r.width, r.height]; }));
  let mv = 0; for (const a of allBefore) { const b = allAfter.find(x => x[0] === a[0]); if (b) for (let i = 1; i < 5; i++) mv = Math.max(mv, Math.abs(a[i] - b[i])); }
  ok(F + ' TEMPO SYNC an (list), ZEIT→NOTE at the same place (≤ 2 px), one undo', ps === 'ok' && f1.dly.sync === 1 && mv <= 2 && u1 - u0 === 1, ps + ' sync ' + f1.dly.sync + ' move ' + mv.toFixed(2) + ' px, k2 "' + (zRect && zRect.txt) + '" → "' + (nRect && nRect.txt) + '" undo +' + (u1 - u0));
  const fb0 = await E(() => SYNQUENZER.mkInfo().fxBytes);
  u0 = await undoN(); await dragK('k3', 70); f1 = await fx(); u1 = await undoN(); await sleep(300);
  const fb1 = await E(() => SYNQUENZER.mkInfo().fxBytes);
  ok(F + ' DELAY TIEFE drag → dep > 0, buffer allocated, one undo', f1.dly.dep > 0 && fb1 > 0 && u1 - u0 === 1, 'dep ' + f1.dly.dep + ' fxBytes ' + fb0 + ' → ' + fb1 + ' undo +' + (u1 - u0) + ' LCD ' + await lcd());
  u0 = await undoN(); await dragK('k2', -40); f1 = await fx(); u1 = await undoN(); const l2 = await lcd(); const k2t = (await mkR('k2')).txt;
  ok(F + ' DELAY NOTE drag: integer note, LCD "NOTE 1/…", one undo', Number.isInteger(f1.dly.note) && /NOTE/.test(l2) && u1 - u0 === 1, 'note ' + f1.dly.note + ' LCD "' + l2 + '" knob "' + k2t + '" undo +' + (u1 - u0));
  // EQ
  const pe = await pick('w2', /^7?\s*EQ|EQ/); const s3 = await sel();
  ok(F + ' EDIT-WAHL 2 list → EQ', pe === 'ok' && s3.pos === 6, pe + ' ' + JSON.stringify(s3));
  u0 = await undoN(); await dragK('k1', 60); f1 = await fx(); u1 = await undoN(); const l3 = await lcd();
  ok(F + ' EQ TIEF-GAIN drag: 0.5 dB steps, LCD dB, one undo', f1.eq.lg !== 0 && Math.round(f1.eq.lg * 2) === f1.eq.lg * 2 && /dB/.test(l3) && u1 - u0 === 1, 'lg ' + f1.eq.lg + ' LCD "' + l3 + '" undo +' + (u1 - u0));
  u0 = await undoN(); await dragK('k2', -60); f1 = await fx(); u1 = await undoN(); const l4 = await lcd();
  ok(F + ' EQ HOCH-FREQ drag: Hz/kHz in LCD, one undo', f1.eq.hf !== 6000 && /Hz/.test(l4) && u1 - u0 === 1, 'hf ' + f1.eq.hf + ' LCD "' + l4 + '" undo +' + (u1 - u0));
  const v = await view();
  ok(F + ' no page scroll / zoom after the gestures', v.sx === 0 && v.sy === 0 && v.sc === 1 && v.sw <= v.iw && !v.de && !v.bd, v);
  await sleep(2500);
  const pr = await E(() => { const Q = window.__rf; Q.on = false; const fr = Q.fr.slice().sort((a, b) => a - b); const lt = window.__lt.filter(x => x[0] >= Q.t0); const g = Q.gaps.slice().sort((a, b) => b - a); return {sec: +((performance.now() - Q.t0) / 1000).toFixed(1), fpsMed: +(fr[fr.length >> 1] || 0).toFixed(1), fpsMin: +(fr[0] || 0).toFixed(1), lt: lt.map(x => x[1]), worstGaps: g.slice(0, 4).map(Math.round), playing: SYNQUENZER.runtime().playing, tick: SYNQUENZER.tickStats ? SYNQUENZER.tickStats() : null}; });
  ok(F + ' PE1 during the touch gestures (demo playing, effects on): rAF median ≥ 55, no longtask > 50 ms', pr.fpsMed >= 55 && !pr.lt.some(x => x > 50), pr);
  ok(F + ' no console errors', !errs.length, errs.slice(0, 3));
  await T.br.close();
}
console.log(R.filter(r => !r.c).length + ' FAIL of ' + R.length);
