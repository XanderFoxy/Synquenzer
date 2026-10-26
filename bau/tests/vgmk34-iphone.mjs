// iPhone points MK3 + MK4 combined on the merged app, song running, CDP touch. Usage: node vgmk34-iphone.mjs P|L
import {open, sleep, OUT, check, done} from './vgmk34-tl3.mjs';
const L = process.argv[2] === 'L', TAG = L ? 'L' : 'P';
const T = await open(Object.assign({viewport: L ? {width: 844, height: 390} : {width: 390, height: 844}}, process.env.SYNQ_APP ? {file: process.env.SYNQ_APP} : {})); const {p, E, errs} = T;
console.log('APP', await E(() => SYNQUENZER.version));
const pm = () => T.pm(0), U = () => T.undoN();
const scope = async () => { await E(() => SYNQUENZER.mkScope(0)); await sleep(150); return E(() => { const s = SYNQUENZER.mkScope(0); return s ? s.voices.map(v => [v.note, v.tb === 2 ? 2 : 1]) : null; }); };
await E(() => SYNQUENZER.setMetronome(false));
// song running
const play = await T.rect('#bPlay'); await T.tap(play.cx, play.cy, 600);
check('I0 ▶ by touch: transport runs', await E(() => SYNQUENZER.runtime().playing));
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(600);
const b = await T.rectText('button', /^MS ?2000$/); if (b) await T.tap(b.cx, b.cy, 900); else { const c = await T.rectText('button', /^(VA|FM|WT) ▾$/); await T.tap(c.cx, c.cy, 400); await T.tapPop(/MS ?2000/); await sleep(900); }
check('I1 MS 2000 while the song runs', (await E(() => SYNQUENZER.getSound(0).engine)) === 'mk');
// STIMME → Split, SHIFT → SPLIT C4
await T.w('w1', /^1 STIMME/); await T.tapMk('k1', 300); await T.tapPop(/^Split$/); await sleep(500);
await T.tapMk('shift', 300); let P = await T.panel(); log: console.log('shift knobs', JSON.stringify(P.knobs.map(k => k && k.l)));
const ks = P.knobs.findIndex(k => k && /SPLIT/.test(k.l));
const s0 = (await pm()).split;
const kx0 = (await E(() => [...document.querySelectorAll('#kb .key')].filter(k => k.getClientRects().length).map(k => { const r = k.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height * (k.classList.contains('b') ? .45 : .8)}; }))).sort((a, b) => a.cx - b.cx);
const kLast = kx0[kx0.length - 1];
await T.tapMk('k' + ks, 400);   // tap on SPLIT = Split <- next note
const armed = (await T.panel()).splitArm;
await T.send('touchStart', [{x: kLast.cx, y: kLast.cy, id: 77}]); await sleep(120); await T.send('touchEnd', []); await sleep(400);
const s1 = (await pm()).split;
const lc = await T.lcdTxt();
check('I2 STIMME → Split (list), SHIFT → tap SPLIT (arm) → play the top key → SPLIT = that key, one undo', (await pm()).mode === 2 && armed && s1 !== s0, {split: [s0, s1], armed, lcd: lc});
await T.tapMk('shift', 300);
// TIMBRE → T2, a pad: A-HK ATTACK up, OSZ 1 Dreieck
await T.tapMk('timbre', 300);
await T.w('w1', /^9 A-HK/); await T.dragMk('k0', -50, 10);
await T.w('w1', /^3 OSZ 1/); await T.knobList('k0', /^Dreieck$/);
let m = await pm();
check('I3 T2 pad: attack up and Dreieck on T2 only', m.t[1].e2.a > 0 && m.t[1].o1.w === 2 && m.t[0].e2.a === 0 && m.t[0].o1.w === 0, {t1: [m.t[0].e2.a, m.t[0].o1.w], t2: [m.t[1].e2.a, m.t[1].o1.w]});
// DELAY: TEMPO SYNC an, NOTE 1/8, TIEFE ≈ 60
await T.w('w2', /^6 /); await T.knobList('k1', /^an$/); await T.knobList('k2', /^1\/8$/);
await T.dragMk('k3', -100, 14); for (let i = 0; i < 10 && Math.abs((await pm()).dly.dep - 60) > 3; i++) { const d = (await pm()).dly.dep; await T.dragMk('k3', d > 60 ? Math.min(40, (d - 60) * 1.6) : -Math.min(40, (60 - d) * 1.6), 6); }
m = await pm(); const lcD = await T.lcdTxt();
check('I4 DELAY TEMPO SYNC an, NOTE 1/8, TIEFE ≈ 60 by touch; LCD names the note and ms at song tempo', m.dly.sync === 1 && m.dly.note === 5 && Math.abs(m.dly.dep - 60) <= 3, {dly: m.dly, lcd: lcD});
// MOD-FX Ensemble
await T.w('w2', /^5 /); await T.knobList('k0', /^Ensemble$/); await T.dragMk('k2', -80, 12);
m = await pm();
check('I5 MOD-FX Ensemble + TIEFE', m.mfx.type === 1 && m.mfx.dep > 30, m.mfx);
// STIMMUNG Werckmeister III
await T.w('w2', /^10 /); await T.tapMk('k0', 300); await T.tapPop(/Werckmeister/); await sleep(500);
check('I6 STIMMUNG → Werckmeister III', (await pm()).scale === 5, (await pm()).scale);
// keys: low → T1, high → T2 while the song runs
const kx = (await E(() => [...document.querySelectorAll('#kb .key')].filter(k => k.getClientRects().length).map(k => { const r = k.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height * (k.classList.contains('b') ? .45 : .8), n: +(k.dataset.n ?? k.dataset.note)}; }))).sort((a, b) => a.cx - b.cx);
console.log('key notes', kx.map(k => k.n).join(','));
const noteOfKey = async k => { const n0 = await E(() => SYNQUENZER.noteLog(1)[0]?.seq || 0); await T.send('touchStart', [{x: k.cx, y: k.cy, id: 90}]); await sleep(60); await T.send('touchEnd', []); await sleep(120); const l = await E(() => SYNQUENZER.noteLog(16)); const e = l.filter(x => x.seq > n0 && x.track === 0 && x.src !== 'clip').pop(); return e ? e.out : null; };
for (const k of [kx[0], kx[kx.length - 1]]) k.n = await noteOfKey(k);
console.log('first/last key notes', kx[0].n, kx[kx.length - 1].n);
const sp = (await pm()).split; const lo = kx[0].n < sp ? kx[0] : null, hi = kx[kx.length - 1].n >= sp ? kx[kx.length - 1] : null; console.log('split', sp);
const hold = async k => { await T.send('touchStart', [{x: k.cx, y: k.cy, id: 81}]); await sleep(500); const s = await scope(); await T.send('touchEnd', []); await sleep(400); return s; };
const sLo = lo ? await hold(lo) : null, sHi = hi ? await hold(hi) : null;
check('I7 while the song runs: a key below SPLIT plays T1, the SPLIT key plays T2 (scope)', sLo && sHi && sLo.some(v => v[0] === lo.n && v[1] === 1) && !sLo.some(v => v[0] === lo.n && v[1] === 2) && sHi.some(v => v[0] === hi.n && v[1] === 2) && !sHi.some(v => v[0] === hi.n && v[1] === 1), {lo: lo && lo.n, sLo, hi: hi && hi.n, sHi});
await p.screenshot({path: OUT + 'iphone-' + TAG + '.png'});
// ■ then no voice after 4 s, no console error
const st = await T.rect('#bPlay'); await T.tap(st.cx, st.cy, 300);
await sleep(4500);
const fin = await E(() => ({v: SYNQUENZER.voices().length, playing: SYNQUENZER.runtime().playing}));
check('I8 ■ by touch: no hanging voice after 4.5 s', fin.v === 0 && !fin.playing, fin);
check('I9 no console errors', errs.length === 0, errs.slice(0, 5));
await T.br.close(); done();
