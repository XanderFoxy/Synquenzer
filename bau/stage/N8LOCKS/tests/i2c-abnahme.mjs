// I2c Abnahme (Nachtrag 8 §B.2 I2c): freie Reihen mit Länge, Chance, Ratsche; Typ 11/12; Spur-Werte nativ.
// Zeitplan aus der App (scheduleLanes) mit einer mitschreibenden Engine; Klang über das Worklet offline (M-LOCK-Abfrage).
import {open, ok, APP} from './lib.mjs';
import fs from 'fs';
const FILE = process.argv[2] || APP;
const {b, p, errs} = await open(FILE);
const src = fs.readFileSync(new URL('./i2b-abnahme.mjs', import.meta.url), 'utf8');
await eval('(async () => {' + src.slice(src.indexOf('await p.evaluate(() => {'), src.indexOf('/* ---------- Gleichheit')) + '})()');
await p.evaluate(() => {
  window.__T = S.tracks.findIndex(x => x.kind === 'synth');
  // the lane events of clip c on track t in the window [a, b) beats (the app's scheduleLanes, a recording engine)
  window.__lanes = (c, a, bb, chunk) => {
    const t = __T, E0 = AU.synth[t], rec = [], st0 = R.startTime, cs0 = R.cstart[t];
    AU.synth[t] = {dead: false, lane: (tt, cc, i, x, r) => rec.push([+(tt - R.startTime).toFixed(7), cc, i, x, r]), laneClr: (tt, cc) => rec.push([+(tt - R.startTime).toFixed(7), 'clr', cc]), node: {port: {postMessage() {}}}};
    R.startTime = AU.ctx.currentTime + 5; R.cstart[t] = 0; LNS[t] = null;
    const clip = normClip(c, 'synth', S.key);
    try { const h = chunk || (bb - a); for (let x = a; x < bb - 1e-9; x += h) scheduleLanes(t, clip, x, Math.min(bb, x + h), false); }
    finally { LNS[t] = null; AU.synth[t] = E0; R.startTime = st0; R.cstart[t] = cs0; }
    return rec;
  };
});

/* ---------- I2-19 Polymeter: Länge 12 gegen Clip 16 Schritte ---------- */
{
  const r = await p.evaluate(() => {
    const st = []; for (let i = 0; i < 12; i++) st.push({i, v: Math.round(i / 11 * 1000) / 1000});
    const ev = __lanes({len: 1, notes: [], ln: [{p: 'cutoff', len: 12, g: '1/16', st}]}, 0, 13);
    const sp = spb(), step = e => Math.round(e[0] / (sp * .25)), byStep = new Map(ev.map(e => [step(e), e[3]]));
    let rep = true; for (let k = 12; k < 52; k++) if (byStep.get(k) !== byStep.get(k % 12)) rep = false;
    const d1 = [0, 5, 11, 12, 47, 48].map(k => d1Pos({Ls: 12, dir: 'fwd'}, k));
    return {n: ev.length, rep, s0: byStep.get(0), s48: byStep.get(48), d1, wi: ev[0] && ev[0][2]};
  });
  ok(r.n === 52 && r.rep && r.s0 === r.s48 && r.d1.join() === '0,5,11,0,11,0', `I2-19 Reihe Länge 12 (1/16) gegen Clip 16: ${r.n} Ereignisse in 52 Schritten, Muster alle 12 Schritte gleich ${r.rep}, Schritt 48 = Schritt 0 ${r.s0 === r.s48}; Index = d1Pos (${r.d1.join(' ')})`);
}

/* ---------- I2-20 Zeit: Soll ± 1 Sample, mit Swing wie die Noten ---------- */
{
  const r = await p.evaluate(() => {
    const sw0 = S.settings.swing; S.settings.swing = .6;
    const ev = __lanes({len: 1, notes: [], ln: [{p: 'cutoff', len: 16, g: '1/16', st: Array.from({length: 16}, (_, i) => ({i, v: (i % 2) * .5 + .2}))}]}, 0, 4);
    const sp = spb(); let worst = 0;
    for (const e of ev) { const k = Math.round(e[0] / (sp * .25) - .01), B = k * .25, want = B * sp + swingOffset(B) * sp; worst = Math.max(worst, Math.abs(e[0] - want) * 48000); }
    S.settings.swing = sw0; return {n: ev.length, worst};
  });
  ok(r.n === 16 && r.worst <= 1, `I2-20 ${r.n} Reihen-Ereignisse mit Swing 0,6: größte Abweichung zur Noten-Zeit ${r.worst.toFixed(3)} Samples (Soll ≤ 1)`);
}

/* ---------- I2-22 Chance 50 %: 200 Durchläufe, gleicher Startwert = gleiche Entscheidungen, Fenster egal ---------- */
{
  const r = await p.evaluate(() => {
    const c = {len: 1, notes: [], ln: [{p: 'cutoff', len: 4, g: '1/16', sd: 777, st: [{i: 1, v: .9, c: .5}]}]};
    const A = __lanes(c, 0, 200), B2 = __lanes(c, 0, 200), C = __lanes(c, 0, 200, .3), sp = spb();
    let hit = 0; const on = new Set(A.filter(e => e[3] === e[3]).map(e => Math.floor(e[0] / sp + 1e-6))); hit = on.size;
    return {hit, same: JSON.stringify(A) === JSON.stringify(B2), win: JSON.stringify(A) === JSON.stringify(C)};
  });
  ok(Math.abs(r.hit / 200 - .5) <= .1 && r.same && r.win, `I2-22 Chance 50 %: ${r.hit} Treffer in 200 Durchläufen (${(r.hit / 2).toFixed(1)} %); zweiter Lauf gleich ${r.same}; Planen in 0,3-Schlag-Fenstern gleich ${r.win}`);
}

/* ---------- I2-23 Ratsche 4 auf 1/16 bei 120 BPM ---------- */
{
  const r = await p.evaluate(() => {
    const b0 = S.bpm; S.bpm = 120;
    const ev = __lanes({len: 1, notes: [], ln: [{p: 'cutoff', len: 16, g: '1/16', st: [{i: 2, v: .8, r: 4}]}]}, 0, 1);
    S.bpm = b0; return ev.map(e => [+(e[0] * 1000).toFixed(4), e[3] === e[3] ? 'W' : 'G']);
  });
  const d = r.slice(1).map((e, k) => e[0] - r[k][0]);
  ok(r.length === 4 && d.every(x => Math.abs(x - 31.25) <= 1000 / 48000) && r.map(e => e[1]).join('') === 'WGWG', `I2-23 Ratsche 4: Teile bei ${r.map(e => e[0]).join(' / ')} ms (Abstand ${d.map(x => x.toFixed(3)).join(' ')} ms, Soll 31,25 ± 1 Sample), Folge ${r.map(e => e[1]).join('')} (Wert / Grundwert)`);
}

/* ---------- I2-24 Glätten: Rampe 3 ms (stetig), stufig springt; FELD OP-Pegel 0 ↔ 99 ---------- */
{
  const r = await p.evaluate(async () => {
    const ev = __lanes({len: 1, notes: [], ln: [{p: 'cutoff', len: 16, g: '1/32', st: [{i: 0, v: 0}, {i: 1, v: 1}]}, {p: 'o1w', len: 16, g: '1/16', st: [{i: 0, v: 1}]}]}, 0, .5);
    let s = SQStore.normalizeSound(__snd('f-init-fm')); s.p.fm6.ops[1].ol = 50; s.p.fmx = FMX.norm(FMX.fromFm6(s.p.fm6), false);
    const wi = __wi('fmx.ops.1.ol');
    const A = await __ren(s, [{k: 'on', id: 1, n: 60, t: .02}, {k: 'lane', t: .1, i: wi, x: 0, r: 144}, {k: 'lane', t: .2, i: wi, x: 99, r: 144}, {k: 'off', id: 1, t: .35}], {sec: .4, probe: 16});
    const pts = []; for (const m of A.reps) for (const v of m.lkRep) pts.push([m.f / 48000, v.ol ? v.ol[1] : null]);
    const up = pts.filter(q => q[0] >= .2 - 1e-4), a = up.find(q => q[1] > 0.5), z = up.find(q => q[1] >= 99);
    return {r: [...new Set(ev.map(e => e[4]))], want: Math.round(.003 * AU.ctx.sampleRate), sr: AU.ctx.sampleRate, dur: a && z ? (z[0] - .2) * 1000 : null};
  });
  ok(r.r.includes(r.want) && r.r.includes(0) && r.dur != null && Math.abs(r.dur - 3) <= .35, `I2-24 Rampe stetig (Cutoff) ${r.r.filter(x => x).join()} Samples (= 3 ms bei ${r.sr} Hz), stufig 0; FELD OP 2 Pegel 0 → 99 erreicht nach ${r.dur && r.dur.toFixed(2)} ms (Soll 3 ± 0,2; Abfrage je Steuer-Block 0,33 ms)`);
}

/* ---------- I2-25 Ende: Typ 12 zuerst, dann die Grundwerte; verspätete Werte entfallen ---------- */
{
  const r = await p.evaluate(async () => {
    const t = __T, E0 = AU.synth[t], rec = []; R.cstart[t] = 0;
    const clip = normClip({len: 1, notes: [], ln: [{p: 'cutoff', len: 16, g: '1/16', st: [{i: 0, v: .8}, {i: 6, v: .2}]}]}, 'synth', S.key);
    AU.synth[t] = {dead: false, lane: (tt, cc, i, x, r) => rec.push(['L', x]), laneClr: (tt, cc) => rec.push(['C', cc]), node: {port: {postMessage() {}}}};
    const st0 = R.startTime; R.startTime = AU.ctx.currentTime + 5; LNS[t] = null;
    try { scheduleLanes(t, clip, 0, 1); lnEnd(t, AU.ctx.currentTime + 5.3); } finally { AU.synth[t] = E0; R.startTime = st0; LNS[t] = null; }
    // worklet: a value queued for 0.5 s is dropped by type 12 at 0.3 s; NaN goes back to the base
    const s = __va(), wi = __wi('cutoff');
    const A = await __ren(s, [{k: 'on', id: 1, n: 57, t: .02}, {k: 'lane', t: .1, i: wi, x: 3000}, {k: 'lane', t: .5, i: wi, x: 6000}, {k: 'clr', t: .3}, {k: 'lane', t: .3, i: wi, x: NaN}, {k: 'off', id: 1, t: .7}], {sec: .8, probe: 128});
    const cut = tt => { let c = null; for (const m of A.reps) if (m.f / 48000 <= tt && m.lkRep[0]) c = m.lkRep[0].cut; return c; };
    return {seq: rec.map(e => e[0] + (e[1] === e[1] ? '' : 'NaN')).join(' '), c2: cut(.25), c4: cut(.45), c6: cut(.65)};
  });
  ok(/C LNaN$/.test(r.seq) && Math.abs(r.c2 - 3000) < 1 && Math.abs(r.c4 - 500) < 1 && Math.abs(r.c6 - 500) < 1, `I2-25 Ende: Folge „${r.seq}“ (Typ 12 vor den Grundwerten); Worklet: 3 kHz → nach Ende ${r.c4 && r.c4.toFixed(0)} Hz, der für 0,5 s geplante Wert kommt nicht (${r.c6 && r.c6.toFixed(0)} Hz)`);
}

/* ---------- I2-27 Drum-Spur: Reihe drum.hatC.nFrq am Schritt des Schlags; Noten-Lock gewinnt ---------- */
{
  const r = await p.evaluate(() => {
    const clip = {ln: [{p: 'drum.hatC.nFrq', len: 16, g: '1/16', sd: 1, st: [{i: 3, v: .6}, {i: 4, v: .2}]}]}, DL = clip.ln;
    const a = lnDrumEx(clip, DL, 42, .75 - .3 * .25, null), b2 = lnDrumEx(clip, DL, 42, 1 + .1 * .25, null), c = lnDrumEx(clip, DL, 42, .75, {lk: {v: {'drum.hatC.nFrq': .9}}}), d = lnDrumEx(clip, DL, 36, .75, null);
    const P = DrumSeq.lockParams(slotParams('hatC'), a.lk, 'hatC'), want = SYNQUENZER.lkFromN('drum.hatC.nFrq', .6);
    return {a: a && a.lk.v['drum.hatC.nFrq'], b: b2 && b2.lk.v['drum.hatC.nFrq'], c: c.lk.v['drum.hatC.nFrq'], d: d === null, f: P.nFrq, want};
  });
  ok(r.a === .6 && r.b === .2 && r.c === .9 && r.d && Math.abs(r.f / r.want - 1) <= .03, `I2-27 Schlag mit m = −0,3 an Schritt 4: Reihe ${r.a} (Schritt 4), nächster Schritt ${r.b}; Noten-Lock gewinnt (${r.c}); anderes Pad unberührt ${r.d}; Filterfrequenz ${r.f.toFixed(0)} Hz (Soll ${r.want.toFixed(0)} ± 3 %)`);
}

/* ---------- I2-65 Kill-Sicherheit: wartende Reihen-Ereignisse überstehen kill der Stimmen 1–3 ---------- */
{
  const r = await p.evaluate(async () => {
    const s = __va(), wi = __wi('cutoff');
    const A = await __ren(s, [{k: 'on', id: 1, n: 57, t: .02}, {k: 'on', id: 2, n: 60, t: .02}, {k: 'on', id: 4, n: 64, t: .02}, {k: 'lane', t: .3, i: wi, x: 2500}, {k: 'lane', t: .3, c: 0, i: wi, x: 2500}, {k: 'kill', id: 1}, {k: 'kill', id: 2}, {k: 'kill', id: 3}, {k: 'off', id: 4, t: .6}], {sec: .7, probe: 128, info: true});
    let c = null; for (const m of A.reps) if (m.f / 48000 > .35 && m.f / 48000 < .55) for (const v of m.lkRep) if (v.id === 4) c = v.cut;
    return {c, lanes: A.info && A.info.lanes};
  });
  ok(r.c != null && Math.abs(r.c - 2500) < 1, `I2-65 kill 1, 2, 3 vor den Reihen-Ereignissen: Wert kommt zur Soll-Zeit (Stimme 4 Cutoff ${r.c && r.c.toFixed(0)} Hz)`);
}

/* ---------- I2-66 Nur-Reihe-Ziele: fx.rev nativ, Mod-Tiefe im Worklet; Ende → Grundwert ---------- */
{
  const r = await p.evaluate(async () => {
    const t = __T, A = AU.tracks[t]; if (!A) return {err: 'keine Spur'};
    const want = SYNQUENZER.lkFromN('fx.rev', .7), base = trackFx(S.tracks[t]).rev, now = AU.ctx.currentTime;
    LNS[t] = {clip: null, last: new Map(), on: new Map(), fx: new Set(['fx.rev']), md: false};
    lnFx(t, 'fx.rev', want, now + .05); await new Promise(r => setTimeout(r, 250)); const g1 = A.revSend.gain.value;
    lnEnd(t, AU.ctx.currentTime + .02); await new Promise(r => setTimeout(r, 250)); const g2 = A.revSend.gain.value;
    // mod depth: lane on mods.lfo1-cutoff.amt in the worklet (lkMd mapping, slot amt)
    const s = __va(); s.mods = [{src: 'lfo1', dst: 'cutoff', amt: .1}]; const wi = __wi('mods.lfo1-cutoff.amt'), em = SQF.toEngineMods([{src: 'lfo1', dst: 'cutoff', amt: 1}])[0];
    const R2 = await __ren(s, [{k: 'on', id: 1, n: 57, t: .02}, {k: 'lane', t: .1, i: wi, x: .6, r: 0}, {k: 'off', id: 1, t: .3}], {sec: .4, info: true, pre: {lkMd: {[wi]: [em.src, em.dst]}}});
    return {want, g1, g2, base, mods: R2.info && R2.info.mods, wi};
  });
  ok(r.g1 != null && Math.abs(r.g1 / r.want - 1) <= .01 && Math.abs(r.g2 - r.base) <= .01 && r.mods && Math.abs(r.mods[0] - .6) < 1e-6, `I2-66 fx.rev: Send ${r.g1 && r.g1.toFixed(3)} (Soll ${r.want && r.want.toFixed(3)} ± 1 %), nach Ende ${r.g2 && r.g2.toFixed(3)} (Grundwert ${r.base}); Reihe auf LFO 1 → Cutoff: Mod-Tiefe im Worklet ${r.mods && r.mods[0]} (Soll 0,6)`);
}
ok(!errs.length, 'Konsole ohne Fehler: ' + errs.slice(0, 3).join(' | '));
await b.close();
