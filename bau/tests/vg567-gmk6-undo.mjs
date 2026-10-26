// QA G-MK6: undo / redo (header ↶ ↷, touch) of every new SEQ action, then save → reload → deep-equal, library sound kept, seq sounds at once
import {open, sleep, check, done, eq, diff} from './vg567-gmk6-tl.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
T.knobList = async (k, re) => { await T.tapMk(k, 300); await E(src => { const rx = new RegExp(src); const b = [...document.querySelectorAll('#popLayer .pop button')].find(b => rx.test(b.textContent.trim())); b && b.scrollIntoView({block: 'center'}); }, re.source); await sleep(150); const r = await T.tapPop(re); await sleep(650); return r ? 'ok' : 'no ' + re; };
const TR = 2;
const snap = () => E(t => JSON.parse(JSON.stringify(SYNQUENZER.getSound(t))), TR);
const U = () => E(() => SYNQUENZER.undoInfo());
await T.openEd(TR);
const states = [], labels = [];
const step = async (name, fn) => { const u0 = (await U()).n; const r = await fn(); await sleep(250); const u = await U(); states.push(await snap()); labels.push(u.top && u.top.label); console.log(name.padEnd(40), 'undo +' + (u.n - u0), '“' + (u.top && u.top.label) + '”', String(r).slice(0, 60)); return u.n - u0; };
states.push(await snap()); labels.push(null);
const du = [];
du.push(await step('engine → MS 2000', () => T.toMk()));
await T.w2(/^11 SEQ/); await sleep(650);
du.push(await step('SEQ AN → an', () => T.knobList('k0', /^an$/)));
du.push(await step('ZIEL → CUTOFF', () => T.knobList('k2', /^CUTOFF/)));
du.push(await step('BEWEGUNG → Glatt', () => T.knobList('k3', /^Glatt$/)));
du.push(await step('LÄNGE drag down', () => T.sweep('k4', 40, 20, 25)));
const mrow = await E(() => [...document.querySelectorAll('#synthSheet .mrow2')].find(e => /SCHRITTE/.test(e.textContent)).dataset.k); await T.tapMk(mrow, 400);
let I = await T.steps();
du.push(await step('SCHRITTE paint 1–6', async () => { const a = I.cols[0], b = I.cols[5]; await T.down(a.x + 5, a.y + 12); await T.glide(a.x + 5, a.y + 12, b.x + b.w - 5, b.y + 12, 12, 20); await T.up(); return 'ok'; }));
du.push(await step('SCHRITTE drag col 8 down', async () => { const a = I.cols[7]; await T.down(a.x + a.w / 2, a.y + a.h / 2); await T.glide(a.x + a.w / 2, a.y + a.h / 2, a.x + a.w / 2, a.y + a.h - 3, 10, 20); await T.up(); return 'ok'; }));
du.push(await step('SCHRITTE tap col 7 above (+1)', async () => { const a = I.cols[6]; await T.tap(a.x + a.w / 2, a.y + 6, 250); return 'ok'; }));
await T.tapMk('s1', 300);
du.push(await step('SEQ 2: paint 9–16 low', async () => { I = await T.steps(); const a = I.cols[8], b = I.cols[15]; await T.down(a.x + 5, a.y + a.h - 10); await T.glide(a.x + 5, a.y + a.h - 10, b.x + b.w - 5, b.y + b.h - 10, 12, 20); await T.up(); return 'ok'; }));
await T.tapMk('back', 400); await sleep(300);
du.push(await step('SEQUENZ → SEQ 2, ZIEL → PAN', async () => { await T.knobList('k1', /^SEQ 2$/); return T.knobList('k2', /^PAN/); }));
await T.tapMk('shift', 300);
du.push(await step('TYP → Wechsel 2', () => T.knobList('k0', /^Wechsel 2$/)));
du.push(await step('LAUF → Einmal', () => T.knobList('k1', /^Einmal$/)));
du.push(await step('KEY SYNC → Stimme', () => T.knobList('k2', /^Stimme$/)));
du.push(await step('AUFLÖSUNG → 1/12', () => T.knobList('k3', /^1\/12$/)));
await T.tapMk('shift', 300); await sleep(700);
du.push(await step('Werkzeuge: Tauschen 1⇄2', async () => { await T.tapMk('shift', 250); await T.tapMk('n4', 400); await T.tapPop(/^1⇄2$/); await sleep(700); return 'ok'; }));
du.push(await step('Werkzeuge: Kopieren dieser T1 S1 → SEQ 2', async () => { await T.tapMk('shift', 250); await T.tapMk('n4', 400); const r = await E(() => { const row = [...document.querySelectorAll('#popLayer .pop .mkcr')].find(x => /dieser/.test(x.textContent) && /T1/.test(x.querySelector('b').textContent)); const b = row.querySelector('button[data-k="0"]'), q = b.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; }); await T.tap(r[0], r[1], 700); return 'ok'; }));
du.push(await step('Werkzeuge: Neu S1', async () => { await T.tapMk('shift', 250); await T.tapMk('n4', 400); await T.tapPop(/^S1$/); await sleep(700); return 'ok'; }));
du.push(await step('● AUFN. on SEQ 3 (held key + CUTOFF)', async () => { await E(() => { MKUI.viewOpen('schritte'); }); await sleep(300); await T.tapMk('s2', 300); await T.tapMk('rec', 400); const kA = await T.key(5); const kc = await T.mk('k0'); await T.send('touchStart', [{x: kA.cx, y: kA.cy, id: 7}]); await sleep(150); await T.send('touchStart', [{x: kA.cx, y: kA.cy, id: 7}, {x: kc.cx, y: kc.cy, id: 8}]); for (let s = 1; s <= 70; s++) { await T.send('touchMove', [{x: kA.cx, y: kA.cy, id: 7}, {x: kc.cx, y: kc.cy - s * 1.5, id: 8}]); await sleep(35); } await T.send('touchEnd', []); let n = 0; for (let k = 0; k < 40 && !n; k++) { await sleep(150); n = await E(t => AU.synth[t].mkRecN || 0, TR); } return n; }));
check('U1 every action = exactly one undo step', du.every(x => x === 1), du);
// ↶ all the way back (touch), check each state
const N = states.length - 1; let okU = [], okR = [];
for (let k = N; k >= 1; k--) { await T.tapTxt('#synthSheet .hb.ur', /^↶$/, 350); const s = await snap(); const good = eq(s.p, states[k - 1].p) && s.engine === states[k - 1].engine; okU.push(good); if (!good) console.log('undo mismatch at', k, labels[k], JSON.stringify(diff(s.p, states[k - 1].p).slice(0, 4))); }
check('U2 ↶ ×' + N + ' (header, touch): each step deep-equal to the state before that action', okU.every(Boolean), okU.map((g, i) => g ? '' : labels[N - i]).filter(Boolean));
for (let k = 1; k <= N; k++) { await T.tapTxt('#synthSheet .hb.ur', /^↷$/, 350); const s = await snap(); const good = eq(s.p, states[k].p) && s.engine === states[k].engine; okR.push(good); if (!good) console.log('redo mismatch at', k, labels[k], JSON.stringify(diff(s.p, states[k].p).slice(0, 4))); }
check('U3 ↷ ×' + N + ': each step deep-equal to the state after that action', okR.every(Boolean), okR.map((g, i) => g ? '' : labels[i + 1]).filter(Boolean));
check('U4 undo labels are named (German, MS 2000 …)', labels.slice(1).every(l => l && !/t\.0\.|undefined|null/.test(l)), labels.slice(1));
// save → reload
const before = await E(() => [0, 1, 2, 3, 4].map(t => JSON.parse(JSON.stringify(SYNQUENZER.getSound(t)))));
await E(() => SYNQUENZER.save()); await sleep(800);
await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage && SYNQUENZER.storage().booted, null, {timeout: 20000}); await sleep(800);
const after = await E(() => [0, 1, 2, 3, 4].map(t => JSON.parse(JSON.stringify(SYNQUENZER.getSound(t)))));
check('S1 save → reload: all sounds deep-equal (incl. p.mk.t[].seq)', eq(before.map(s => s.p), after.map(s => s.p)), diff(before.map(s => s.p), after.map(s => s.p)).slice(0, 6));
// the seq sounds right away after the reload (first note): SEQ 3 (recorded CUTOFF) — compare HF per step against a render
await E(t => { SYNQUENZER.selectTrack(t); SYNQUENZER.openEditor(); SYNQUENZER.keyOn(40, .05, 'w'); }, TR); await sleep(400); await E(() => SYNQUENZER.keyOff(0, 'w')); await p.waitForFunction(t => AU.synth[t] && AU.synth[t].node, TR); await sleep(600);
const cap = T.capT(TR, 1800); await sleep(50); await E(() => SYNQUENZER.keyOn(57, .8, 'r')); await sleep(1400); await E(() => SYNQUENZER.keyOff(0, 'r')); const c = await cap;
const x = c.l; let pk = 0; for (const v of x) pk = Math.max(pk, Math.abs(v));
check('S2 after reload the MS 2000 sound with SEQ plays (peak > −40 dBFS, no console errors)', 20 * Math.log10(pk + 1e-9) > -40 && !errs.length, {peakDb: +(20 * Math.log10(pk + 1e-9)).toFixed(1), errs});
// serialize → load (export/import path)
const ser = await E(() => SYNQUENZER.serialize());
const lr = await E(async s => { try { const r = await SYNQUENZER.load(s); return 'ok'; } catch (e) { return 'ERR ' + e.message; } }, ser); await sleep(800);
const after2 = await E(() => [0, 1, 2, 3, 4].map(t => JSON.parse(JSON.stringify(SYNQUENZER.getSound(t)))));
check('S3 serialize → load: deep-equal', lr === 'ok' && eq(after.map(s => s.p), after2.map(s => s.p)), {lr, d: diff(after.map(s => s.p), after2.map(s => s.p)).slice(0, 4)});
console.log('errs', JSON.stringify(errs));
await T.br.close(); done();
