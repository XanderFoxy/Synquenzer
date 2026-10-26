// QA G-MK6 flow part 2 (touch): SHIFT level 2 (TYP, LAUF, KEY SYNC, AUFLÖSUNG), SEQUENZ, "*", LÄNGE, SHIFT + 5 tools, WRITE + copy from a saved sound
import {open, sleep, OUT, check, done, eq, diff} from './v3-qa-gmk6-tl.mjs';
const L = process.argv[2] === 'L', TAG = L ? 'L' : 'P';
const T = await open({viewport: L ? {width: 844, height: 390} : {width: 390, height: 844}}); const {p, E, errs} = T;
const log = (...a) => console.log(...a);
T.knobList = async (k, re, scroll) => { await T.tapMk(k, 300); if (scroll) { await E(src => { const rx = new RegExp(src); const b = [...document.querySelectorAll('#popLayer .pop button')].find(b => rx.test(b.textContent.trim())); b && b.scrollIntoView({block: 'center'}); }, re.source); await sleep(200); } const r = await T.tapPop(re); await sleep(600); return r ? 'ok' : 'no list item ' + re + ' ' + JSON.stringify(await T.popTexts()); };
const U = () => T.undoN();
const TR = 2;
await E(() => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); });
await T.openEd(TR);
await T.toMk();
const half = async want => { const pn = await T.panel(); if (pn.half && pn.half !== 'beide' && pn.half !== want) { await T.tapTxt('.tab, button', want === 'B' ? /^RECHTS$/ : /^LINKS$/); await sleep(350); } };
await half('B');
await E(t => { const Q = SYNQUENZER; Q.mkSet(t, 't.0.f.cut', 40); Q.mkSet(t, 't.0.f.res', 50); Q.mkSet(t, 't.0.e2.a', 0); Q.mkSet(t, 't.0.e2.s', 127); Q.mkSet(t, 't.0.e1.s', 0); Q.mkSet(t, 't.0.f.eg', 0);
  Q.mkSet(t, 't.0.seq.on', 1); Q.mkSet(t, 't.0.seq.q.0.k', 11); for (let s = 0; s < 16; s++) Q.mkSet(t, 't.0.seq.q.0.v.' + s, s * 8 - 60); MKUI.setWahl(2, 10); }, TR);
await sleep(300);
const kA = await T.key(L ? 10 : 5), kB = await T.key(L ? 14 : 9);
const bpm = await E(() => SYNQUENZER.runtime().bpm);
// running-step trace while holding a key (touch)
const trace = async (ms, keys = [kA], gapMs = 0) => { const out = []; await T.send('touchStart', [{x: keys[0].cx, y: keys[0].cy, id: 7}]); const t0 = Date.now();
  let second = false; while (Date.now() - t0 < ms) { if (keys[1] && !second && Date.now() - t0 >= gapMs) { second = true; await T.send('touchStart', [{x: keys[0].cx, y: keys[0].cy, id: 7}, {x: keys[1].cx, y: keys[1].cy, id: 9}]); }
    const sc = await E(t => { const E_ = AU.synth[t]; const m = E_ && E_.mks; return m ? {seq: m.seq && m.seq[0] && m.seq[0].step, v: (m.voices || []).map(v => v.seqStep)} : null; }, TR); out.push([Date.now() - t0, sc]); await sleep(60); }
  await T.send('touchEnd', []); await sleep(400); return out; };
// SHIFT → level 2
await T.tapMk('shift', 300);
let pn = await T.panel();
check('G1 SHIFT: level 2 TYP · LAUF · KEY SYNC · AUFLÖSUNG', pn.knobs.map(k => k && k.l).join(',') === 'TYP,LAUF,KEY SYNC,AUFLÖSUNG,', {knobs: pn.knobs.map(k => k && k.l), matrix: pn.matrix, shift: pn.shift});
await p.screenshot({path: OUT + TAG + '-g1-eb2.png'});
let u0 = await U();
log('AUFLÖSUNG list', await T.knobList('k3', /^1\/8$/, true));
let S = await T.seq(TR);
check('G2 AUFLÖSUNG (list) → 1/8: one undo', S.res === 6 && (await U()) === u0 + 1, {res: S.res, du: (await U()) - u0, lcd: await T.lcd2()});
// step period at 1/8: capture + scope
await E(t => AU.synth[t].mkScope(true), TR);
let tr = await trace(2400);
const stepsSeen = tr.map(([t, s]) => [t, s && s.seq]); log('1/8 trace', JSON.stringify(stepsSeen.filter((_, i) => i % 2 === 0)));
// expected step time 0.5*60/bpm*1000 ms
const chg = []; for (let k = 1; k < stepsSeen.length; k++) if (stepsSeen[k][1] !== stepsSeen[k - 1][1]) chg.push(stepsSeen[k][0]);
const per = chg.length > 2 ? (chg[chg.length - 1] - chg[1]) / (chg.length - 2) : 0;
check('G3 1/8 at ' + bpm + ' BPM: the running step changes every ≈ ' + (30000 / bpm).toFixed(0) + ' ms', Math.abs(per - 30000 / bpm) < 60, {per: per.toFixed(0), chg});
// TYP → Rückwärts
u0 = await U();
log('TYP', await T.knobList('k0', /^Rückwärts$/));
S = await T.seq(TR);
tr = await trace(1800); const rev = tr.map(([, s]) => s && s.seq).filter(x => x);
const dec = rev.filter((x, k) => k && x !== rev[k - 1]).every((x, k, a) => true);
log('rev trace', rev.join(','));
check('G4 TYP Rückwärts: one undo, steps run 16, 15, 14 …', S.type === 1 && (await U()) === u0 + 1 && rev[1] >= 14 && rev.slice(1).every((x, k, a) => !k || x <= a[k - 1]), {type: S.type, rev: rev.join(',')});
// LAUF → Einmal (with 1/16 for speed)
log('AUFL back to 1/16', await T.knobList('k3', /^1\/16$/, true));
log('TYP back to Vorwärts', await T.knobList('k0', /^Vorwärts$/));
u0 = await U();
log('LAUF', await T.knobList('k1', /^Einmal$/));
S = await T.seq(TR);
tr = await trace(3600); const one = tr.map(([, s]) => s && s.seq);
log('einmal trace', one.join(','));
check('G5 LAUF Einmal: one undo; runs 1…16 once and stays on 16', S.run === 0 && (await U()) === u0 + 1 && one.slice(-8).every(x => x === 16) && one.slice(0, 3).some(x => x <= 3), {run: S.run, trace: one.join(',')});
log('LAUF back', await T.knobList('k1', /^Schleife$/));
// KEY SYNC → Stimme, two notes 0.3 s apart are on different steps
u0 = await U();
log('KEY SYNC', await T.knobList('k2', /^Stimme$/));
S = await T.seq(TR);
tr = await trace(1200, [kA, kB], 300);
const lastV = [null, null], vs = []; for (const [t, s] of tr) { if (!s || !s.v || s.v.length < 2) continue; s.v.forEach((x, j) => { if (x && x.length) lastV[j] = x[x.length - 1]; }); if (t > 500) vs.push(lastV.slice()); }
log('stimme voices', JSON.stringify(vs.slice(0, 6)));
check('G6 KEY SYNC Stimme: one undo; two notes 0.3 s apart stand on different steps', S.ks === 2 && (await U()) === u0 + 1 && vs.length && vs.some(v => v[0] != null && v[1] != null && v[0] !== v[1]), {ks: S.ks, vs: vs.slice(0, 4)});
// back to level 1
await T.tapMk('shift', 300); pn = await T.panel();
check('G7 SHIFT again: level 1', pn.knobs.map(k => k && k.l).join(',') === 'SEQ AN,SEQUENZ,ZIEL,BEWEGUNG,LÄNGE', pn.knobs.map(k => k && k.l));
// SEQUENZ → SEQ 3 (list), ZIEL CUTOFF → "*" on SEQ 1
log('SEQUENZ', await T.knobList('k1', /^SEQ 3$/));
pn = await T.panel(); log('sq', pn.sq);
u0 = await U();
await T.tapMk('k2', 300); await E(() => { const b = [...document.querySelectorAll('#popLayer .pop button')].find(b => /^CUTOFF/.test(b.textContent.trim())); b && b.scrollIntoView({block: 'center'}); }); await sleep(200); await T.tapPop(/^CUTOFF/); await sleep(600);
S = await T.seq(TR); let l3 = await T.lcd2();
log('SEQUENZ 1', await T.knobList('k1', /^SEQ 1$/));
await T.tapMk('k2', 300); const zl1 = await E(() => { const p = document.querySelector('#popLayer .pop h4'); return p && p.textContent; }); await T.closePop(); await sleep(400);
let l1 = await T.lcd2(); const mx = (await T.panel()).matrix.join(' | ');
check('G8 SEQ 3 → CUTOFF too: SEQ 3 wins, LCD shows "*" when SEQ 1 is shown', S.q[2].k === 11 && /\*/.test(l1 || ''), {k: S.q.map(q => q.k), lcd3: l3, lcd1: l1, mx, h4: zl1});
// audible: SEQ 3 (all 0) overrides SEQ 1 (ramp) → no cutoff movement
const cap = await (async () => { const pr = T.capT(TR, 1800); await sleep(50); await T.send('touchStart', [{x: kA.cx, y: kA.cy, id: 7}]); await sleep(1500); await T.send('touchEnd', []); return pr; })();
const hfOf = cap => { const x = cap.l.map((v, i) => (v + cap.r[i]) / 2), W = Math.round(cap.sr * .02), out = []; let i0 = x.findIndex(v => Math.abs(v) > 1e-3); for (let i = Math.max(1, i0 + W * 3); i + W < x.length; i += W) { let h = 0, s = 0; for (let k = i; k < i + W; k++) { const d = x[k] - x[k - 1]; h += d * d; s += x[k] * x[k]; } if (s > 1e-6) out.push(10 * Math.log10(h / s)); } return out; };
const hfS3 = hfOf(cap), rng = a => +(Math.max(...a) - Math.min(...a)).toFixed(1);
check('G9 SEQ 3 (all 0) on CUTOFF masks SEQ 1 (ramp): HF ratio flat (≤ 3 dB range)', hfS3.length > 20 && rng(hfS3) < 3, {range: rng(hfS3), n: hfS3.length});
// SHIFT + 5 → tools
u0 = await U();
await sleep(700); await T.tapMk('shift', 250); await T.tapMk('n4', 400);
const pop = await T.popTexts(); log('tools', JSON.stringify(pop && pop.slice(0, 12)));
const S0 = await T.seq(TR);
let r = await T.tapPop(/^1⇄3$/); await sleep(400); S = await T.seq(TR);
check('G10 SHIFT + 5 → Tauschen 1⇄3: one undo, deep-equal swap', !!r && eq(S.q[0], S0.q[2]) && eq(S.q[2], S0.q[0]) && (await U()) === u0 + 1, {du: (await U()) - u0, k: S.q.map(q => q.k), lcd: await T.lcd2()});
// copy SEQ 3 (now the ramp) of this sound T1 → SEQ 2: SEQUENZ = 2 first
log('SEQUENZ 2', await T.knobList('k1', /^SEQ 2$/));
u0 = await U(); await sleep(700); await T.tapMk('shift', 250); await T.tapMk('n4', 400);
const S1 = await T.seq(TR);
r = await E(() => { const rows = [...document.querySelectorAll('#popLayer .pop .mkcr')]; const row = rows.find(x => /dieser/.test(x.textContent) && /T1/.test(x.querySelector('b').textContent)); if (!row) return null; const b = row.querySelector('button[data-k="2"]'); const q = b.getBoundingClientRect(); return {x: q.x + q.width / 2, y: q.y + q.height / 2, h: q.height, w: q.width}; });
if (r) await T.tap(r.x, r.y, 400); S = await T.seq(TR);
check('G11 Kopieren (dieser T1 S3 → SEQ 2): deep-equal, one undo; buttons ≥ 44 px', r && eq(S.q[1], S1.q[2]) && eq(S.q[0], S1.q[0]) && (await U()) === u0 + 1 && r.h >= 44 && r.w >= 44, {r, du: (await U()) - u0, q1: S.q[1], lcd: await T.lcd2()});
// Neu S2
u0 = await U(); await sleep(700); await T.tapMk('shift', 250); await T.tapMk('n4', 400); await T.tapPop(/^S2$/); await sleep(400); S = await T.seq(TR);
check('G12 Neu S2: INIT, one undo', eq(S.q[1], {k: 0, m: 1, v: new Array(16).fill(0)}) && (await U()) === u0 + 1, {q1: S.q[1], du: (await U()) - u0});
// LÄNGE drag down to 5 (touch, continuous knob)
u0 = await U();
let lk = await T.mk('k4'); await T.down(lk.cx, lk.cy); await sleep(30); let len = 16; for (let s = 1; s <= 40 && len > 5; s++) { await T.move(lk.cx, lk.cy + s * 2); await sleep(25); len = (await T.seq(TR)).last; } await T.up(); await sleep(200);
S = await T.seq(TR);
log('LÄNGE', S.last);
log('KEY SYNC back to Timbre (level 2)', await (async () => { await T.tapMk('shift', 250); const r = await T.knobList('k2', /^Timbre$/); await T.tapMk('shift', 250); return r; })());
log('SEQUENZ 3', await T.knobList('k1', /^SEQ 3$/));
tr = await trace(1800); const l5 = tr.map(([, s]) => s && s.seq).filter(x => x);
check('G13 LÄNGE drag → ' + S.last + ': running step stays in 1…' + S.last, S.last < 16 && l5.every(x => x <= S.last) && new Set(l5).size >= S.last - 1, {last: S.last, trace: l5.join(','), du: (await U()) - u0});
// WRITE → save as own sound, then copy ALLE from it into track 0 (also MS 2000) via SHIFT + 5
const ws = await T.tapMk('write', 400); await sleep(300);
const inp = await E(() => { const i = document.querySelector('#popLayer .pop input'); return i && i.value; }); log('save name', inp);
await E(() => { const i = document.querySelector('#popLayer .pop input'); i.value = 'Seq Fläche'; });
await T.tapPop(/^Sichern$/); await sleep(1200);
const lib = await E(() => SYNQUENZER.library().filter(s => s.engine === 'mk').map(s => s.name));
check('G14 WRITE → saved "Seq Fläche"', lib.includes('Seq Fläche'), lib);
const saved = await E(() => SYNQUENZER.library().find(s => s.name === 'Seq Fläche'));
check('G15 the saved sound keeps the sequences (deep-equal p.mk.t[0].seq)', saved && eq(saved.p.mk.t[0].seq, await T.seq(TR)), saved && diff(saved.p.mk.t[0].seq, await T.seq(TR)).slice(0, 4));
// track 0 → MS 2000, copy ALLE from Seq Fläche T1
await T.closePop(); await E(() => { SYNQUENZER.closeEditor && SYNQUENZER.closeEditor(); }); await sleep(300);
await T.openEd(0); await T.toMk(); await half('B');
await E(() => MKUI.setWahl(2, 10)); await sleep(200);
u0 = await U(); await sleep(700); await T.tapMk('shift', 250); await T.tapMk('n4', 400);
r = await E(() => { const rows = [...document.querySelectorAll('#popLayer .pop .mkcr')]; const row = rows.find(x => /Seq Fläche/.test(x.textContent) && /T1/.test(x.querySelector('b').textContent)); if (!row) return null; row.scrollIntoView({block: 'center'}); const b = row.querySelector('button[data-k="all"]'); const q = b.getBoundingClientRect(); return {x: q.x + q.width / 2, y: q.y + q.height / 2}; });
await sleep(200); if (r) await T.tap(r.x, r.y, 400);
const s0 = await T.seq(0);
check('G16 track 0: Kopieren ALLE from "Seq Fläche" T1: deep-equal, one undo', r && eq(s0, saved.p.mk.t[0].seq) && (await U()) === u0 + 1, {r, d: saved && diff(s0, saved.p.mk.t[0].seq).slice(0, 4), du: (await U()) - u0});
await p.screenshot({path: OUT + TAG + '-g16.png'});
log('errs', errs);
check('G17 no console errors', !errs.length, errs);
await T.br.close(); done();
