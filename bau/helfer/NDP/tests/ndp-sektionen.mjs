// Jede Sektion dreht den richtigen Wert: für jeden Parameter jeder Sektion (beide Reihen) Name antippen, Regler ziehen (echter Touch);
// der Wert im Projekt (slot.md bzw. p.md) ändert sich genau in diesem Schlüssel, die Anzeige der Platte = Anzeige der Zelle im North-Editor.
// Dazu: Zoom-Regler, Rad (WERT), SHIFT, Doppeltipp = INIT, Mittelraste, PITCH fein 0,1, KIT-Tasten RATE|BPM und TAP.
import {launch, open, openPlate, info, tap, ctr, drag, touch, line, md, kitMd, report} from './ndp-lib.mjs';
const b = await launch(), rows = [], p = await open(b, 'H');
await openPlate(p);
const STORE = {mode: ['mDm', 'mDd'], nmode: ['mNdm', 'mNdd'], 'k.dl': ['dlR', 'dlB']};
const SECS = await p.evaluate(() => NDP.SECS.map(s => ({id: s.id, cols: s.cols})));
const plateStr = {};
for (const S of SECS) {
  await p.evaluate(id => SYNQUENZER.ndpView({sec: id, zoom: false, shift: false}), S.id);
  for (let ci = 0; ci < S.cols.length; ci++) for (let r = 0; r < 2; r++) {
    const key = S.cols[ci][r];
    let I = await info(p); const lab = I.hits.find(h => h.a === 'lab' && h.k === key); await tap(p, ...ctr(lab)); await p.waitForTimeout(40);
    I = await info(p);
    const kn = I.knobs.find(k => k.key === key);
    if (!kn) { rows.push({n: S.id + ' ' + key + ': Regler zeigt den Parameter nach Tipp auf den Namen', ok: false}); continue; }
    const kit = key.startsWith('k.'), before = kit ? await kitMd(p) : await md(p, 'kick');
    const d = await p.evaluate(k => { const d = NDP.desc(k); return {min: d.min, max: d.max, v: d.get(), inert: d.inert()}; }, key);
    if (d.inert) { // ohne Wirkung (z. B. SPECTRA bei A1): erst WAVE ändern, dann prüfen wir den Regler trotzdem nicht (wie am Gerät grau)
      rows.push({n: S.id + ' ' + key + ': ohne Wirkung → grau, Ziehen ändert nichts', ok: true, d: 'inert'}); 
      await drag(p, ...ctr(kn), -80); const after = kit ? await kitMd(p) : await md(p, 'kick');
      rows.push({n: S.id + ' ' + key + ': grauer Regler schreibt nichts', ok: JSON.stringify(after) === JSON.stringify(before)}); continue; }
    const up = d.v < (d.min + d.max) / 2;
    await drag(p, ...ctr(kn), up ? -70 : 70);
    const after = kit ? await kitMd(p) : await md(p, 'kick');
    const ch = Object.keys(after).filter(k => JSON.stringify(after[k]) !== JSON.stringify(before[k]));
    const want = STORE[key] || [key.replace(/^k\./, '')];
    let ok;
    if (key === 'scl') { const sc = await p.evaluate(() => MDE.scl); ok = !!sc && ch.every(k => k === 'mPit'); }
    else ok = ch.length > 0 && ch.every(k => want.includes(k));
    rows.push({n: S.id + ' ' + key + (r ? ' (untere Reihe)' : '') + ': Ziehen ändert genau diesen Wert', ok, d: 'geändert: ' + ch.join(',')});
    plateStr[key] = (await info(p)).knobs.find(k => k.key === key).str;
    const seg = (await info(p)).strip[0];
    rows.push({n: S.id + ' ' + key + ': Display zeigt den Parameter', ok: seg.includes(await p.evaluate(k => NDP.desc(k).l, key)), d: seg});
  }
}
// Abgleich mit dem North-Editor: Platte zu, Editor-Seite jeder Sektion, Wert-Anzeige der Zelle mit gleichem Schlüssel
await p.evaluate(() => { MDE.scl = MDE.scl; });
const scl = await p.evaluate(() => MDE.scl);
await p.evaluate(() => SYNQUENZER.ndpClose()); await p.waitForTimeout(200);
await p.evaluate(s => { MDE.scl = s; }, scl);
const ED_ = {tone: 'tone', noise: 'noise', click: 'click', mix: 'mix', fx: 'fx'};
const edVals = await p.evaluate(async () => { const o = {}; for (const sub of ['tone', 'noise', 'click', 'mix', 'fx']) { MDE.sub = sub; ED.dTab = 'sound'; buildDrumEd(); for (const c of document.querySelectorAll('#drumSheet .mdc[data-key]')) o[c.dataset.key.slice(3)] = c.querySelector('.kn').textContent; }
  MDE.kitSub = 'md'; ED.dTab = 'kit'; buildDrumEd(); for (const c of document.querySelectorAll('#drumSheet .mdc[data-key]')) o['k.' + c.dataset.key.slice(3)] = c.querySelector('.kn').textContent; ED.dTab = 'sound'; buildDrumEd(); return o; });
const dlKey = (await kitMd(p)).dlM === 'b' ? 'k.dlB' : 'k.dlR';
for (const k in plateStr) { const ek = k === 'k.dl' ? dlKey : k; const e = edVals[ek]; if (e == null) continue; const pv = plateStr[k];
  rows.push({n: 'Abgleich ' + k + ': Platte „' + pv + '“ = Editor „' + e + '“', ok: SEG(pv) === SEG(e)}); }
function SEG(s) { return String(s).replace(/[−–]/g, '-').trim(); }
// Zoom: beide Reihen als Regler, der untere Regler dreht den unteren Wert
await p.evaluate(() => SYNQUENZER.ndpOpen({sec: 'noise', zoom: true})); await p.waitForTimeout(200);
let I = await info(p), kz = I.knobs.find(k => k.key === 'mNdyf'), b0 = await md(p, 'kick');
await drag(p, ...ctr(kz), -60); let a0 = await md(p, 'kick');
rows.push({n: 'ZOOM: unterer Regler NOISE DYN FILTER dreht mNdyf', ok: a0.mNdyf !== b0.mNdyf && Object.keys(a0).filter(k => a0[k] !== b0[k]).every(k => k === 'mNdyf'), d: b0.mNdyf + '→' + a0.mNdyf});
// Mittelraste: über 0 ziehen hält bei 0
await p.evaluate(() => { soundEdit(DRUM_T, 't', () => mdSet('mNdyf', 2)); });
I = await info(p); kz = I.knobs.find(k => k.key === 'mNdyf');
const [cx, cy] = ctr(kz); await touch(p, line(cx, cy, cx, cy + 34, 10), 16); a0 = await md(p, 'kick');
rows.push({n: 'Mittelraste bei zweipoligen Reglern (DYN FILTER hält bei 0)', ok: a0.mNdyf === 0, d: 'Wert ' + a0.mNdyf});
// Doppeltipp = INIT
await tap(p, cx, cy); await p.waitForTimeout(90); await tap(p, cx, cy); await p.waitForTimeout(150); a0 = await md(p, 'kick');
rows.push({n: 'Doppeltipp = INIT', ok: a0.mNdyf === 0});
// SHIFT gehalten: Regler zeigen die untere Reihe; Rad mit SHIFT: PITCH 0,1
await p.evaluate(() => SYNQUENZER.ndpView({sec: 'tone', zoom: false, shift: true})); I = await info(p);
rows.push({n: 'SHIFT (eingerastet): alle Regler auf der unteren Reihe', ok: ['mWav', 'mDyf', 'mode', 'mBt', 'scl'].every(k => I.knobs.some(x => x.key === k)), d: I.knobs.map(k => k.key).join(',')});
await p.evaluate(() => SYNQUENZER.ndpView({shift: true, focus: 'mPit', enc: 'val'})); I = await info(p);
const enc = I.hits.find(h => h.a === 'enc'); const [ex, ey] = ctr(enc), R_ = enc.w * .38; b0 = await md(p, 'kick');
const arc = []; for (let k = 0; k <= 10; k++) { const t = -Math.PI / 2 + k * (Math.PI / 6) / 10 * 1.1; arc.push([ex + R_ * Math.cos(t), ey + R_ * Math.sin(t)]); }
await touch(p, arc, 40); a0 = await md(p, 'kick');
const dp = Math.round((a0.mPit - b0.mPit) * 10) / 10;
rows.push({n: 'Rad mit SHIFT: PITCH in 0,1-Schritten (2 Rasten = +0,2)', ok: Math.abs(dp - .2) < 1e-6 || Math.abs(dp - .1) < 1e-6 || Math.abs(dp - .3) < 1e-6, d: b0.mPit + '→' + a0.mPit});
await p.evaluate(() => SYNQUENZER.ndpView({shift: false, focus: 'mDec', enc: 'val'})); I = await info(p); b0 = await md(p, 'kick');
await touch(p, arc, 40); a0 = await md(p, 'kick');
rows.push({n: 'Rad ohne SHIFT: DECAY in ganzen Schritten', ok: a0.mDec - b0.mDec >= 1 && Number.isInteger(a0.mDec), d: b0.mDec + '→' + a0.mDec});
// KIT: RATE|BPM-Taste, TAP 4× im Abstand 500 ms → 120 ♩
await p.evaluate(() => SYNQUENZER.ndpView({sec: 'kit', zoom: false})); I = await info(p);
const rk = I.hits.find(h => h.a === 'rate'); let k0 = await kitMd(p); await tap(p, ...ctr(rk)); await p.waitForTimeout(80); let k1 = await kitMd(p);
rows.push({n: 'KIT: RATE|BPM-Taste schaltet dlM', ok: k0.dlM !== k1.dlM, d: k0.dlM + '→' + k1.dlM});
const tk = I.hits.find(h => h.a === 'tap'); const T0 = Date.now(); for (let k = 0; k < 4; k++) { const w = T0 + k * 500 - Date.now(); if (w > 0) await p.waitForTimeout(w); await tap(p, ...ctr(tk)); }
k1 = await kitMd(p); const bt = await p.evaluate(i => mdBpmTxt(i), k1.dlB);
rows.push({n: 'KIT: TAP 4× (500 ms) → 120 ♩', ok: k1.dlM === 'b' && /^12[01] ♩$/.test(bt), d: bt});
rows.push({n: 'keine Konsolenfehler', ok: !p.errs.length, d: p.errs.join(' | ').slice(0, 300)});
await b.close();
process.exit(report(rows) ? 0 : 1);
