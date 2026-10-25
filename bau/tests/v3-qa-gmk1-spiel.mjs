// QA G-MK1: way back to SPIEL (performance knobs) and ORIGINAL LED after WRITE
import {open, sleep, OUT, check, done, eq} from './v3-qa-gmk1-tl.mjs';
const T = await open(); const {p, E, errs} = T;
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(500);
await T.tapTxt('button', /^MS ?2000$/); await sleep(600);
const sel = async () => (await T.panel()).sel;
// 1) fresh MS 2000 sound (not a program): EDIT-WAHL 1 → FILTER; every way back to SPIEL
await T.tapMk('w1', 250); await T.tapPop(/^6 FILTER/); await sleep(200);
const s0 = await sel();
const tries = {};
for (let k = 0; k < 8; k++) { await T.tapMk('n' + k, 120); } tries.numberKeys = (await sel()).wahl;
await T.tapMk('disp', 120); tries.display = (await sel()).wahl;
await T.tapMk('m1', 120); tries.matrix = (await sel()).wahl;
await T.tapMk('shift', 120); await T.tapMk('shift', 120); tries.shift2 = (await sel()).wahl;
await T.tapTxt('button', /^✕$/); await sleep(300); await E(() => SYNQUENZER.openEditor()); await sleep(500); tries.reopen = (await sel()).wahl;
const knobsNow = (await T.panel()).knobs.map(k => k && k.l);
check('P1 a fresh MS 2000 sound: after turning EDIT-WAHL 1 there is a touch way back to SPIEL (CUTOFF/RESO/ATTACK/RELEASE/TEMPO)', Object.values(tries).some(w => w === 0), {start: s0, tries, knobsNow});
// 2) a program loaded via the library / header › (not via the number keys) → MK1-34: both LEDs, knobs = SPIEL
await E(async () => { await SYNQUENZER.saveSound(0, 'Prog Eins', 'new'); SYNQUENZER.mkSet(0, 't.0.f.cut', 60); await SYNQUENZER.saveSound(0, 'Prog Zwei', 'new'); });
await E(() => { SYNQUENZER.closeEditor(); SYNQUENZER.openEditor(); }); await sleep(500);
await T.tapMk('w1', 250); await T.tapPop(/^8 AMP/); await sleep(200);
const before = await sel();
await E(() => SYNQUENZER.loadPreset(0, 'Prog Eins')); await sleep(500);
const viaLib = await sel(); const ledLib = await E(() => [...document.querySelectorAll('.mkx[data-k="w1"],.mkx[data-k="w2"]')].map(e => e.classList.contains('lit')));
check('P2 MK1-34: after loading a program from the library (Browser/‹ ›) both LEDs on, knobs = SPIEL', viaLib.wahl === 0, {before, after: viaLib, leds: ledLib, name: await E(() => SYNQUENZER.getSound(0).name)});
await T.tapMk('w1', 250); await T.tapPop(/^6 FILTER/); await sleep(200);
const nx = await T.rectText('button', /^›$/); if (nx) await T.tap(nx.cx, nx.cy, 500);
const viaArrow = await sel();
console.log('header › →', await E(() => SYNQUENZER.getSound(0).name), JSON.stringify(viaArrow));
// 3) ORIGINAL LED after WRITE: write with CUTOFF 79, move away and back → LED must light at 79 (the written value)
await E(() => { SYNQUENZER.closeEditor(); SYNQUENZER.selectTrack(2); SYNQUENZER.openEditor(); }); await sleep(500);
await T.tapTxt('button', /^MS ?2000$/); await sleep(600);
await T.tapMk('w1', 250); await T.tapPop(/^6 FILTER/); await sleep(200);
await E(() => SYNQUENZER.mkSet(2, 't.0.f.cut', 79)); 
await T.tapMk('write', 300); await E(() => { const i = document.querySelector('#popLayer .pop input'); i.value = 'Orig Test'; i.dispatchEvent(new Event('input', {bubbles: true})); }); await T.tapTxt('#popLayer .pop button', /^Sichern$/, 600);
const r = await T.mk('k1');
const origCut = await E(() => MKUI.P.orig && MKUI.P.orig.t[0].f.cut);
await T.down(r.cx, r.cy); await T.move(r.cx, r.cy + 6); await sleep(30); await T.move(r.cx, r.cy + 12); await sleep(30);
const awayCut = await E(() => SYNQUENZER.mkGet(2).t[0].f.cut); const ledAway = await E(() => document.querySelector('.mkx[data-k="orig"]').classList.contains('on'));
await T.move(r.cx, r.cy + 6); await sleep(30); await T.up(); await sleep(250);
const cut = await E(() => SYNQUENZER.mkGet(2).t[0].f.cut);
const led79 = await E(() => document.querySelector('.mkx[data-k="orig"]').classList.contains('on'));
check('P3 ORIGINAL LED after WRITE: reference = written value (79); drag away and back to 79 → LED on', cut === 79 && led79 && !ledAway && origCut === 79, {origRef: origCut, awayCut, ledAway, cutBack: cut, led79});
console.log('errs', errs);
await T.br.close(); done();
