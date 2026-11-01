// I2b Abnahme (Nachtrag 8 §B.2 I2b): Noten-Locks im Klang. Messart: ein Lock auf einer Note klingt Sample für Sample wie derselbe
// Klang mit diesem Grundwert (Gleichheit ≤ −90 dB), Nachbarnoten bitgleich zu ohne Lock; M-LOCK (Werte je Stimme aus dem Worklet).
// Aufruf: node i2b-abnahme.mjs [app.html]
import {open, ok, APP} from './lib.mjs';
const FILE = process.argv[2] || APP;
const {b, p, errs} = await open(FILE);
const res = {};
await p.evaluate(() => {
  window.__ren = async (sound, evs, o = {}) => {
    const sr = 48000, sec = o.sec || 1.2, snd = SQStore.normalizeSound(sound);
    const src = document.getElementById('sq-worklet-src').textContent, oc = new OfflineAudioContext(2, Math.round(sec * sr), sr);
    await oc.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src));
    const E = SynthHost.track(oc, oc.destination, wkFlat(snd), wkMods(snd), snd.engine === 'fm6' && snd.p.fm6 ? wkFmOf(snd.p) : null, snd.engine === 'mk' ? snd.p.mk : null);
    E.node.port.postMessage({mkSeed: 1}); if (snd.engine === 'mk') E.mkWheel({mw0: 0, reset: true});
    if (o.pre) E.node.port.postMessage(o.pre); E.lkReps = []; if (o.probe) E.node.port.postMessage({lkProbe: o.probe});
    E.tempo(120, null);
    for (const e of evs) {
      if (e.k === 'on') E.on(e.id, e.n, e.v == null ? .8 : e.v, e.t, null, e.d || 0, e.lk || null);
      else if (e.k === 'off') E.off(e.id, e.t);
      else if (e.k === 'lane') E.lane(e.t, e.c == null ? -1 : e.c, e.i, e.x, e.r || 0);
      else if (e.k === 'clr') E.laneClr(e.t, e.c == null ? -1 : e.c);
      else if (e.k === 'kill') E.kill(e.id);
      else if (e.k === 'raw') E.q.push(e.e);
    }
    E.flush(); await new Promise(r => setTimeout(r, 30));
    const bf = await oc.startRendering(); await new Promise(r => setTimeout(r, 120));
    let info = null; if (o.info) { E.lkInfo = null; E.node.port.postMessage({lkInfo: 1}); await new Promise(r => setTimeout(r, 80)); info = E.lkInfo; }
    return {l: bf.getChannelData(0), r: bf.getChannelData(1), reps: E.lkReps, info};
  };
  // max |a - b| relative to the peak of a, in dB (−Infinity = bit-identical); window [t0, t1) s
  window.__cmp = (A, B, t0 = 0, t1 = 1e9) => { const sr = 48000, i0 = Math.round(t0 * sr), i1 = Math.min(A.l.length, Math.round(t1 * sr)); let pk = 1e-12, d = 0;
    for (let i = i0; i < i1; i++) { pk = Math.max(pk, Math.abs(A.l[i]), Math.abs(A.r[i])); d = Math.max(d, Math.abs(A.l[i] - B.l[i]), Math.abs(A.r[i] - B.r[i])); } return d ? 20 * Math.log10(d / pk) : -Infinity; };
  window.__wi = path => SYNQUENZER.lkt(path).wi;
  window.__eu = (path, x) => SYNQUENZER.lkFromN(path, x);
  window.__snd = id => JSON.parse(JSON.stringify(FACTORY_BY_ID.get(id)));
  window.__va = () => { const s = __snd('f-init-analog'); Object.assign(s.p, {cutoff: 500, res: .3, fenv: 0, aA: .002, aD: .3, aS: .6, aR: .03, l1rate: 2, mode: 0}); s.mods = []; return s; };
});

/* ---------- Gleichheit: Lock auf der Note = Klang mit diesem Grundwert (VA, FM DX, FELD, MS 2000), Nachbarnoten bitgleich ---------- */
const eqCases = [
  ['VA cutoff (I2-07)', 'va', 'cutoff', .62], ['VA res', 'va', 'res', .8], ['VA aD Hüllkurve (I2-12)', 'va', 'aD', .7], ['VA level', 'va', 'level', .3],
  ['VA Welle o1w Säge→Puls (I2-63)', 'va', 'o1w', 1 / 3], ['VA Filtertyp ftype (I2-63)', 'va', 'ftype', .4], ['VA Unison o1uni (I2-63)', 'va', 'o1uni', .5], ['VA fenv', 'va', 'fenv', .8],
  ['FM DX OP2 Pegel (I2-10)', 'fm', 'fm6.ops.1.ol', .8], ['FM DX OP1 Level 3 (Hk.)', 'fm', 'fm6.ops.0.l.2', .5], ['FM DX OP2 fein', 'fm', 'fm6.ops.1.fine', .5], ['FM Helligkeit fmBright (I2-10)', 'fm', 'fmBright', .8],
  ['FELD OP2 Pegel (I2-10)', 'fx', 'fmx.ops.1.ol', .8], ['FELD OP1 Hk. Level 3', 'fx', 'fmx.ops.0.amp.l.2', .5], ['FELD OP2 Feedback-Menge', 'fx', 'fmx.ops.1.fbAmt', .9],
  ['MS 2000 T1 CUTOFF (I2-11)', 'mk', 'mk.t.0.f.cut', .8], ['MS 2000 T1 EG2 DECAY', 'mk', 'mk.t.0.e2.d', .2], ['MS 2000 T1 PATCH 1 INT (I2-11)', 'mk', 'mk.t.0.p.0.i', .9], ['MS 2000 T1 LEVEL', 'mk', 'mk.t.0.a.lvl', .3],
];
for (const [nm, eng, path, x] of eqCases) {
  const r = await p.evaluate(async ([eng, path, x]) => {
    let s;
    if (eng === 'va') s = __va();
    else if (eng === 'fm') { s = SQStore.normalizeSound(__snd('f-init-fm')); s.p.fm6.ops[1].ol = 60; s.p.fm6.alg = 1; s.p.fmBright = 0; }
    else if (eng === 'fx') { s = SQStore.normalizeSound(__snd('f-init-fm')); s.p.fm6.ops[1].ol = 60; s.p.fmx = FMX.norm(FMX.fromFm6(s.p.fm6), false); s.p.fmx.ops[1].fbSrc = 2; s.p.fmx.ops[1].fbAmt = 2; }
    else { s = SQStore.normalizeSound(__snd('f-init-am')); SQMK.mkPathSet(s.p.mk, 't.0.f.cut', 50); SQMK.mkPathSet(s.p.mk, 't.0.p.0.s', 2); SQMK.mkPathSet(s.p.mk, 't.0.p.0.d', 4); SQMK.mkPathSet(s.p.mk, 't.0.e2.s', 30); SQMK.mkPathSet(s.p.mk, 't.0.e2.d', 90); }
    s = SQStore.normalizeSound(s);
    const e = SYNQUENZER.lkt(path), y = __eu(path, x), pair = [e.wi, y];
    // the same sound with the value as its base
    const s2 = JSON.parse(JSON.stringify(s));
    if (path.startsWith('fm6.')) { const q = path.split('.'); const o = s2.p.fm6.ops[+q[2]]; if (q.length > 4) o[q[3]][+q[4]] = y; else o[q[3]] = y; }
    else if (path.startsWith('fmx.')) { const q = path.split('.'); const o = s2.p.fmx.ops[+q[2]]; if (q[3] === 'amp') o.amp[q[4]][+q[5]] = y; else o[q[3]] = y; }
    else if (path.startsWith('mk.')) SQMK.mkPathSet(s2.p.mk, path.slice(3), y);
    else s2.p[path] = y;
    const one = [{k: 'on', id: 1, n: 57, v: .8, t: .05}, {k: 'off', id: 1, t: .35}];
    const A = await __ren(s, one.map(q => q.k === 'on' ? Object.assign({}, q, {lk: pair}) : q)), B = await __ren(s2, one);
    const C = await __ren(s, one);                                   // without lock (must differ from A)
    const three = [{k: 'on', id: 1, n: 57, t: .02}, {k: 'off', id: 1, t: .12}, {k: 'on', id: 2, n: 60, t: .5}, {k: 'off', id: 2, t: .6}, {k: 'on', id: 3, n: 64, t: 1.1}, {k: 'off', id: 3, t: 1.2}];
    const D = await __ren(s, three.map(q => (q.k === 'on' && q.id === 2 ? Object.assign({}, q, {lk: pair}) : q)), {sec: 1.7, info: true}), N = await __ren(s, three, {sec: 1.7});
    return {eq: __cmp(B, A), diff: __cmp(C, A), nb1: __cmp(N, D, 0, .48), nb3: __cmp(N, D, 1.08, 1.7), bad: D.info && D.info.bad, wi: e.wi, y};
  }, [eng, path, x]);
  res[path] = r;
  ok(r.eq <= -90 && r.diff > -60 && r.nb1 === -Infinity && r.nb3 <= -90 && !r.bad,
    `${nm}: Lock (Platz ${r.wi}, Wert ${+r.y.toFixed(3)}) = Grundwert-Klang ${r.eq === -Infinity ? 'bitgleich' : r.eq.toFixed(1) + ' dB'}; gegen ohne Lock ${r.diff.toFixed(1)} dB verschieden; Nachbarnote davor ${r.nb1 === -Infinity ? 'bitgleich' : r.nb1.toFixed(1)}, danach ${r.nb3 === -Infinity ? 'bitgleich' : r.nb3.toFixed(1) + ' dB'}; lkBad ${r.bad}`);
}

/* ---------- I2-07 M-LOCK: Cutoff 500 Hz, Lock 2 kHz auf Schritt 3 (1/16, 120 BPM) ---------- */
{
  const r = await p.evaluate(async () => {
    const s = __va(), x = SYNQUENZER.lkToN('cutoff', 2000), y = __eu('cutoff', x), wi = __wi('cutoff'), ev = [];
    for (let k = 0; k < 4; k++) { ev.push({k: 'on', id: k + 1, n: 57, t: .02 + k * .125, lk: k === 2 ? [wi, y] : null}); ev.push({k: 'off', id: k + 1, t: .02 + k * .125 + .1}); }
    const A = await __ren(s, ev, {sec: .7, probe: 16});
    const by = {}; for (const m of A.reps) for (const v of m.lkRep) (by[v.id] || (by[v.id] = [])).push(v.cut);
    return {y, cut: Object.fromEntries(Object.entries(by).map(([k, a]) => [k, [Math.min(...a), Math.max(...a)]]))};
  });
  const c3 = r.cut[3], o = [1, 2, 4].map(k => r.cut[k]);
  ok(c3 && Math.abs(c3[0] / 2000 - 1) <= .005 && Math.abs(c3[1] / 2000 - 1) <= .005 && o.every(a => a && Math.abs(a[0] / 500 - 1) < .005 && Math.abs(a[1] / 500 - 1) < .005),
    `I2-07 M-LOCK: Schritt 3 Cutoff ${c3 && c3.map(v => v.toFixed(1)).join('–')} Hz (Soll 2000 ± 0,5 %), Schritte 1/2/4 ${o.map(a => a && a[0].toFixed(1)).join(' / ')} Hz (Soll 500); +${(Math.log2(c3[0] / 500)).toFixed(3)} Okt`);
}

/* ---------- I2-08 Nachricht: 8 Locks + 8 Reihen-Startwerte = 41 Zahlen; NaN / Platz außerhalb → verworfen ---------- */
{
  const r = await p.evaluate(async () => {
    const s = __va(), ks = ['cutoff', 'res', 'level', 'aD', 'aS', 'fenv', 'o1pw', 'noise'], ls = ['o1lvl', 'o2lvl', 'o3lvl', 'subLvl', 'kt', 'bass', 'drive', 'uniDet'], lk = [];
    for (const k of ks) lk.push(__wi(k), __eu(k, .4)); for (const k of ls) lk.push(-1 - __wi(k), __eu(k, .3));
    let msg = null; const E0 = SynthHost.track;
    const A = await __ren(s, [{k: 'on', id: 1, n: 60, t: .02, lk}, {k: 'off', id: 1, t: .3}], {sec: .4, probe: 256, info: true});
    const rp = A.reps.find(m => m.lkRep.length), n = rp ? rp.lkRep[0].n : -1;
    const B = await __ren(s, [{k: 'on', id: 1, n: 60, t: .02, lk: [__wi('cutoff'), NaN, 9999, 1, __wi('res'), .5]}, {k: 'off', id: 1, t: .3}], {sec: .4, info: true});
    void msg; void E0;
    return {len: 9 + lk.length, n, badA: A.info.bad, badB: B.info.bad};
  });
  ok(r.len === 41 && r.n === 16 && r.badA === 0 && r.badB === 2, `I2-08 Note-an mit ${r.len} Zahlen kommt ganz an (Stimme hat ${r.n} Werte, lkBad ${r.badA}); NaN-Paar und Platz 9999 verworfen: lkBad ${r.badB} (Soll 2), das gültige Paar wirkt`);
}

/* ---------- I2-09 (a) LFO auf Cutoff schwankt auf dem gelockten Schritt weiter ---------- */
{
  const r = await p.evaluate(async () => {
    const s = __va(); s.p.l1rate = 8; s.p.l1retrig = 1; s.mods = [{src: 'lfo1', dst: 'cutoff', amt: .3}];
    const lk = [__wi('cutoff'), __eu('cutoff', SYNQUENZER.lkToN('cutoff', 2000))], one = [{k: 'on', id: 1, n: 57, t: .02, lk}, {k: 'off', id: 1, t: .9}];
    const s0 = __va(); s0.p.l1rate = 8; s0.p.l1retrig = 1; s0.mods = []; const A = await __ren(s, one), B = await __ren(s0, one);
    // the lock's value with the LFO as base: same sound with cutoff 2000 and the LFO = A
    const s2 = JSON.parse(JSON.stringify(s)); s2.p.cutoff = lk[1]; const C = await __ren(s2, one.map(q => Object.assign({}, q, {lk: null})));
    return {lfo: __cmp(B, A), same: __cmp(C, A)};
  });
  ok(r.lfo > -40 && r.same <= -90, `I2-09 (a) LFO 1 → Cutoff rechnet auf dem Lock obendrauf: mit/ohne LFO ${r.lfo.toFixed(1)} dB verschieden; = Klang mit Cutoff 2 kHz + LFO ${r.same === -Infinity ? 'bitgleich' : r.same.toFixed(1) + ' dB'}`);
}

/* ---------- I2-13 Mono-Legato: neuer Lock-Wert gleitet in 5 ms ---------- */
{
  const r = await p.evaluate(async () => {
    const s = __va(); s.p.mode = 2; s.p.glide = 0;
    const wi = __wi('cutoff'), a = [wi, 500], b2 = [wi, 2000];
    const A = await __ren(s, [{k: 'on', id: 1, n: 57, t: .02, lk: a}, {k: 'on', id: 2, n: 60, t: .2, lk: b2}, {k: 'off', id: 1, t: .25}, {k: 'off', id: 2, t: .4}], {sec: .5, probe: 16});
    const pts = []; for (const m of A.reps) for (const v of m.lkRep) pts.push([m.f / 48000, v.cut]);
    const t0 = .2, up = pts.filter(q => q[0] >= t0 - .001), first = up.find(q => q[1] > 520), full = up.find(q => q[1] >= 1999);
    return {start: first ? (first[0] - t0) * 1000 : null, dur: first && full ? (full[0] - t0) * 1000 : null, n: pts.length};
  });
  ok(r.dur != null && Math.abs(r.dur - 5) <= 1, `I2-13 Legato-Wechsel 500 Hz → 2 kHz: Übergang ${r.dur && r.dur.toFixed(2)} ms (Soll 5 ± 1, gemessen je Steuer-Block 0,33 ms)`);
}

/* ---------- I2-17 Stimmenklau / gleiche Stimme: der Lock geht nicht an die nächste Note ---------- */
{
  const r = await p.evaluate(async () => {
    const s = __va(), lk = [__wi('cutoff'), 3000, __wi('o1w'), 1];
    const ev = l => [{k: 'on', id: 1, n: 57, t: .02, lk: l}, {k: 'off', id: 1, t: .15}, {k: 'on', id: 2, n: 57, t: .5}, {k: 'off', id: 2, t: .7}];
    const A = await __ren(s, ev(lk), {sec: .9}), B = await __ren(s, ev(null), {sec: .9});
    s.p.poly = 1; const C = await __ren(s, [{k: 'on', id: 1, n: 57, t: .02, lk}, {k: 'on', id: 2, n: 60, t: .2}, {k: 'off', id: 1, t: .3}, {k: 'off', id: 2, t: .5}], {sec: .7, probe: 64});
    const v2 = C.reps.flatMap(m => m.lkRep.filter(v => v.id === 2)), own2 = v2.some(v => v.own || v.n || Math.abs(v.cut - 500) > .01 || v.o1w !== 0);
    const D = await __ren(s, [{k: 'on', id: 1, n: 57, t: .02}, {k: 'on', id: 2, n: 60, t: .2}, {k: 'off', id: 1, t: .3}, {k: 'off', id: 2, t: .5}], {sec: .7});
    return {next: __cmp(B, A, .45, .9), steal: __cmp(D, C, .5, .7), own2, n2: v2.length};
  });
  ok(r.next <= -90 && r.steal <= -90 && !r.own2 && r.n2 > 3, `I2-17 nächste Note derselben Stimme ohne Lock: ${r.next === -Infinity ? 'bitgleich' : r.next.toFixed(1) + ' dB'}; nach Stimmenklau (Poly 1) hat die neue Note keinen Wert der alten (M-LOCK, ${r.n2} Blöcke: Cutoff 500 Hz, Säge), Render ${r.steal.toFixed(1)} dB gegen ohne Lock (ab 0,5 s; davor klingt der 5-Hz-Gleichspannungs-Filter des Ausgangs aus)`);
}

/* ---------- I2-11 Mod-Sequenz auf Cutoff rechnet obendrauf; Arp-Töne tragen den Lock (Übergabe im Haupt-Faden) ---------- */
{
  const r = await p.evaluate(async () => {
    let s = SQStore.normalizeSound(__snd('f-init-am')); SQMK.mkPathSet(s.p.mk, 't.0.f.cut', 40); s.p.mk.t[0].seq.on = 1; s.p.mk.t[0].seq.q[0].k = 11; for (let j = 0; j < 16; j++) s.p.mk.t[0].seq.q[0].v[j] = j % 2 ? 30 : -30;
    s = SQStore.normalizeSound(s); const wi = SYNQUENZER.lkt('mk.t.0.f.cut').wi, one = l => [{k: 'on', id: 1, n: 57, t: .02, lk: l}, {k: 'off', id: 1, t: .8}];
    const A = await __ren(s, one([wi, 90])), s2 = JSON.parse(JSON.stringify(s)); SQMK.mkPathSet(s2.p.mk, 't.0.f.cut', 90); const B = await __ren(s2, one(null));
    const src = document.getElementById('sq-mk-src').textContent, arp = /if \(r\.arp\) add\(i, lk \?/.test(src) && /lk: n\.x\.lk\}/.test(src);
    return {seq: __cmp(B, A), arp};
  });
  ok(r.seq <= -90 && r.arp, `I2-11 MS 2000 mit Mod-Sequenz auf CUTOFF: Lock = Grundwert-Klang mit derselben Sequenz ${r.seq === -Infinity ? 'bitgleich' : r.seq.toFixed(1) + ' dB'}; Arp übernimmt lk der gehaltenen Clip-Note: ${r.arp}`);
}

/* ---------- I2-14 nativer Weg: Sicht PL beim Notenstart, LFO-Anschluss bleibt am Spur-Klang ---------- */
{
  const {b: b2, p: p2, errs: e2} = await open(FILE, {q: '?engine=native'});
  const r = await p2.evaluate(async () => {
    const i = S.tracks.findIndex(t => t.kind === 'synth'); const tr = S.tracks[i]; tr.sound = SQStore.normalizeSound(Object.assign(JSON.parse(JSON.stringify(FACTORY_BY_ID.get('f-init-analog'))), {}));
    tr.sound.p.cutoff = 500; tr.sound.p.aD = .3; applySound && applySound(i);
    const wk = !!AU.synth[i];
    const v = spawnVoice(i, 60, .8, AU.ctx.currentTime + .05, {src: 'clip', lkP: {cutoff: 2000, aD: 1.2, level: .3}});
    const out = v ? {wk: !!v.wk, aD: v.aenv.d, lvl0: v.lvl0, fA: v.fA ? v.fA.frequency.value : null, P: v.P === tr.sound.p, tapC: !!v.tapC || true} : null;
    if (v) v.release(AU.ctx.currentTime + .2);
    return {wk, out};
  }).catch(e => ({err: String(e)}));
  await b2.close();
  ok(r.out && !r.out.wk && r.out.aD === 1.2 && r.out.lvl0 === .3 && r.out.P, `I2-14 nativ: Stimme mit Lock-Sicht (Hk. Decay ${r.out && r.out.aD} s, Pegel ${r.out && r.out.lvl0}), v.P bleibt der Spur-Klang (LFO-/Legato-Prüfungen unverändert): ${r.out && r.out.P}; Konsole ${e2.length}`);
}

/* ---------- I2-15 Drum-Stimme: absoluter Lock vor TUNE / DECAY relativ ---------- */
{
  const r = await p.evaluate(() => {
    const P = slotParams('snare'), x = .7, e = SYNQUENZER.lkt('drum.snare.tDec'), y = SYNQUENZER.lkFromN('drum.snare.tDec', x);
    const Q = DrumSeq.lockParams(P, {v: {'drum.snare.tDec': x}}, 'snare');
    const K = slotParams('kick'), fx = SYNQUENZER.lkFromN('drum.kick.frq', .5), Q2 = DrumSeq.lockParams(K, {v: {'drum.kick.frq': .5}, tune: 12}, 'kick');
    const Q3 = DrumSeq.lockParams(K, {tune: 12}, 'kick'), Q4 = DrumSeq.lockParams(K, {v: {'drum.snare.frq': .5}}, 'kick');
    return {tDec: Q.tDec, y, frq: Q2.frq, want: fx * 2, old: Q3.frq === K.frq * 2, other: Q4.frq === K.frq, cls: e.cls};
  });
  ok(Math.abs(r.tDec - r.y) < 1e-9 && Math.abs(1200 * Math.log2(r.frq / r.want)) <= 5 && r.old && r.other,
    `I2-15 Drum: drum.snare.tDec-Lock → tDec ${r.tDec.toFixed(3)} (Soll ${r.y.toFixed(3)}); drum.kick.frq-Lock + TUNE +12 → ${r.frq.toFixed(2)} Hz = Lock × 2 (${(1200 * Math.log2(r.frq / r.want)).toFixed(2)} ct); TUNE allein wie bisher ${r.old}; Lock eines anderen Pads wirkt nicht ${r.other}`);
}

/* ---------- I2-16 neunter Lock wird abgewiesen ---------- */
{
  const r = await p.evaluate(() => {
    const t = S.tracks.findIndex(x => x.kind === 'synth'), s = 0; SYNQUENZER.setClip(t, s, {len: 1, notes: [{t: 0, d: .25, n: 60, v: .8}]});
    const ks = ['cutoff', 'res', 'level', 'aD', 'aS', 'fenv', 'o1pw', 'noise', 'kt'], rs = ks.map(k => SYNQUENZER.lkSet(t, s, 0, k, .5));
    return {ok8: rs.slice(0, 8).every(x => x.ok), r9: rs[8], n: Object.keys(S.tracks[t].clips[s].notes[0].lk.v).length};
  });
  ok(r.ok8 && !r.r9.ok && r.r9.why === 'voll' && r.n === 8, `I2-16 neunter Lock abgewiesen (${r.r9.why}), Note hat ${r.n} Locks`);
}

/* ---------- I2-64 Schritt-Zuordnung: Note 10 ms vor Schritt 5 hört Schritt 5 ab dem ersten Sample ---------- */
{
  const r = await p.evaluate(async () => {
    const t = S.tracks.findIndex(x => x.kind === 'synth'), sp = spb(), early = .010 / sp;    // 10 ms in Schlägen
    SYNQUENZER.setClip(t, 0, {len: 1, notes: [{t: 1 - early, d: .2, n: 60, v: .8}], ln: [{p: 'cutoff', len: 16, g: '1/16', st: [{i: 3, v: .3}, {i: 4, v: .8}]}]});
    const X = SYNQUENZER.lkNoteX(t, 0, 0, 1 - early), wi = __wi('cutoff');
    // worklet: start value from the pair, then the step's lane event takes over (same value: no jump)
    const s = __va(), y5 = __eu('cutoff', .8), y4 = __eu('cutoff', .3), t5 = .3;
    const A = await __ren(s, [{k: 'lane', t: .05, i: wi, x: y4, r: 0}, {k: 'on', id: 1, n: 57, t: t5 - .01, lk: [-1 - wi, y5]}, {k: 'lane', t: t5, i: wi, x: y5, r: 144}, {k: 'off', id: 1, t: .5}], {sec: .6, probe: 16});
    const cuts = []; for (const m of A.reps) for (const v of m.lkRep) cuts.push([m.f / 48000, v.cut]);
    const dr = SYNQUENZER.lkNoteX;
    void dr;
    return {pair: X && X.lk, wi, y5, cuts: cuts.filter(q => q[0] > t5 - .012 && q[0] < t5 + .01)};
  });
  const pr = r.pair || [], c = r.cuts.map(q => q[1]), y5 = r.y5;
  ok(pr[0] === -1 - r.wi && Math.abs(pr[1] - y5) < 1e-6 && c.length > 3 && c.every(v => Math.abs(v / y5 - 1) < .001),
    `I2-64 Note 10 ms vor Schritt 5: Paar Reihen-Startwert (Platz ${pr[0]} = −1 − ${r.wi}, ${pr[1] && pr[1].toFixed(1)} Hz); Cutoff vom ersten Block an ${c.length ? c[0].toFixed(1) : '?'} Hz bis nach dem Reihen-Ereignis ${c.length ? c[c.length - 1].toFixed(1) : '?'} Hz (kein Sprung)`);
}

ok(!errs.length, 'Konsole ohne Fehler: ' + errs.slice(0, 3).join(' | '));
await b.close();
import fs from 'fs'; fs.writeFileSync(new URL('./i2b-ergebnis.json', import.meta.url), JSON.stringify(res, null, 1));
