// QA G-MK5: undo / redo (header ↶ ↷, touch) of every new ARP action, then save → reload → deep-equal, the arp plays at once;
// serialize → load; a reload followed by an immediate ▶ arpeggiates the clip from beat 1
import {open, sleep, check, done, eq, diff} from './v3-qa-gmk5-tl.mjs';
const L = process.argv[2] === 'L';
const T = await open({viewport: L ? {width: 844, height: 390} : {width: 390, height: 844}}); const {p, E, errs} = T;
const TR = 2;
const snap = () => E(t => JSON.parse(JSON.stringify(SYNQUENZER.getSound(t))), TR);
const U = () => E(() => SYNQUENZER.undoInfo());
await E(() => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); });
await T.openEd(TR);
const states = [], labels = [];
const step = async (name, fn) => { const u0 = (await U()).n; const r = await fn(); await sleep(250); const u = await U(); states.push(await snap()); labels.push(u.top && u.top.label); console.log(name.padEnd(36), 'undo +' + (u.n - u0), '“' + (u.top && u.top.label) + '”', String(r).slice(0, 60)); return u.n - u0; };
states.push(await snap()); labels.push(null);
const du = [];
du.push(await step('engine → MS 2000', () => T.toMk()));
du.push(await step('ARP key → an', () => T.tapMk('arp', 300).then(() => 'ok')));
await T.w2(/^\d+ ARP A/); await sleep(500);
du.push(await step('AUFLÖSUNG → 1/8', () => T.knobList('k1', /^1\/8$/)));
du.push(await step('GATE drag down', () => T.dragMk('k2', 30, 10).then(() => 'ok')));
du.push(await step('TYP → Wechsel 1', () => T.knobList('k3', /^Wechsel 1$/)));
du.push(await step('OKTAVEN drag up', () => T.dragMk('k4', -40, 10).then(() => 'ok')));
du.push(await step('step key 3 → Pause (ARP A)', () => T.tapMk('n2', 300).then(() => 'ok')));
await T.w2(/^\d+ ARP B/); await sleep(500);
du.push(await step('LATCH → an', () => T.knobList('k0', /^an$/)));
du.push(await step('SWING drag up', () => T.dragMk('k1', -30, 10).then(() => 'ok')));
du.push(await step('KEY SYNC → an', () => T.knobList('k2', /^an$/)));
du.push(await step('LÄNGE drag down', () => T.dragMk('k3', 25, 10).then(() => 'ok')));
du.push(await step('ZIEL → Timbre 2', () => T.knobList('k4', /^Timbre 2$/)));
du.push(await step('step key 5 → Pause', () => T.tapMk('n4', 300).then(() => 'ok')));
du.push(await step('step key 5 → an again', () => T.tapMk('n4', 300).then(() => 'ok')));
du.push(await step('ARP key → aus', () => T.tapMk('arp', 300).then(() => 'ok')));
du.push(await step('ARP key → an', () => T.tapMk('arp', 300).then(() => 'ok')));
check('U1 every arp action = exactly one undo step', du.every(x => x === 1), du);
const N = states.length - 1; const okU = [], okR = [];
for (let k = N; k >= 1; k--) { await T.tapTxt('#synthSheet .hb.ur', /^↶$/, 350); const s = await snap(); const good = eq(s.p, states[k - 1].p) && s.engine === states[k - 1].engine; okU.push(good); if (!good) console.log('undo mismatch at', k, labels[k], JSON.stringify(diff(s.p, states[k - 1].p).slice(0, 4))); }
check('U2 ↶ ×' + N + ' (header, touch): each step deep-equal to the state before that action', okU.every(Boolean), okU.map((g, i) => g ? '' : labels[N - i]).filter(Boolean));
// panel follows undo: ARP LED off after undoing ARP an (state 1 = engine MS 2000, arp off)
for (let k = 1; k <= N; k++) { await T.tapTxt('#synthSheet .hb.ur', /^↷$/, 350); const s = await snap(); const good = eq(s.p, states[k].p) && s.engine === states[k].engine; okR.push(good); if (!good) console.log('redo mismatch at', k, labels[k], JSON.stringify(diff(s.p, states[k].p).slice(0, 4))); }
check('U3 ↷ ×' + N + ': each step deep-equal to the state after that action', okR.every(Boolean), okR.map((g, i) => g ? '' : labels[i + 1]).filter(Boolean));
check('U4 undo labels are named (German, MS 2000 …)', labels.slice(1).every(l => l && !/arp\.|undefined|null/.test(l)), labels.slice(1));
const pi = await T.pinfo(); const A = await T.arp(TR);
check('U5 after redo the panel shows the restored state (ARP LED on, step keys per mask/LÄNGE)', pi.arp.on === !!A.on && pi.arp.keys.length === 8, {pi: pi.arp, A});
// after ↶ to "ARP an" undone mid-chord? arp undo while a latched chord runs: undo of LATCH an → arp stops ≤ 1 step
await E(t => { SYNQUENZER.mkSet(t, 'arp.ks', 0); SYNQUENZER.mkSet(t, 'arp.tgt', 0); }, TR);
// save → reload
const before = await E(() => [0, 1, 2, 3, 4].map(t => JSON.parse(JSON.stringify(SYNQUENZER.getSound(t)))));
await E(() => SYNQUENZER.save()); await sleep(800);
await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage && SYNQUENZER.storage().booted, null, {timeout: 20000}); await sleep(800);
const after = await E(() => [0, 1, 2, 3, 4].map(t => JSON.parse(JSON.stringify(SYNQUENZER.getSound(t)))));
check('S1 save → reload: all sounds deep-equal (incl. p.mk.arp)', eq(before.map(s => s.p), after.map(s => s.p)), diff(before.map(s => s.p), after.map(s => s.p)).slice(0, 6));
// the arp plays right away after the reload: hold C-E-G (touch) in the editor
await E(t => { SYNQUENZER.selectTrack(t); SYNQUENZER.openEditor(); }, TR); await sleep(600);
const tk = await E(() => AU.ctx ? AU.ctx.currentTime : null);
await T.holdKeys([0, 4, 7]); await sleep(1500); await T.releaseKeys(); await sleep(400);
const lg = await T.alog(TR); const A2 = await T.arp(TR);
console.log('after reload arp', JSON.stringify(A2), 'log', JSON.stringify(lg.map(x => [x.note, x.step])));
check('S2 after reload the latched arp plays at the first touch (arpLog notes, LÄNGE/steps respected)', lg.length >= 4 && lg.every(x => x.step <= A2.last && ((A2.steps >> (x.step - 1)) & 1)), {n: lg.length, last: A2.last, steps: A2.steps.toString(2)});
await E(t => { SYNQUENZER.mkSet(t, 'arp.latch', 0); SYNQUENZER.panic(); }, TR); await sleep(300);
// serialize → importJSON (export / import path)
const ser = await E(() => SYNQUENZER.serialize());
const lr = await E(async s => { try { const r = await SYNQUENZER.importJSON(s); return r === false ? 'refused' : 'ok'; } catch (e) { return 'ERR ' + e.message; } }, ser); await sleep(800);
const s1 = JSON.parse(ser);
const after2 = await E(() => [0, 1, 2, 3, 4].map(t => JSON.parse(JSON.stringify(SYNQUENZER.getSound(t)))));
const exp2 = await E(() => 0);
check('S3 serialize → importJSON: arp fields survive', lr === 'ok' && eq(after2[TR].p.mk.arp, Object.assign({}, A2, {latch: 0})), {lr, got: after2[TR].p.mk.arp});
// reload, then ▶ at once: the pad clip must be arpeggiated from beat 1 (no plain chord first)
await E(() => SYNQUENZER.save()); await sleep(600);
await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage && SYNQUENZER.storage().booted, null, {timeout: 20000});
await E(() => { SYNQUENZER.launchScene(0); SYNQUENZER.play(); });
await sleep(2500);
const nl = await E(t => SYNQUENZER.noteLog(300).filter(e => e.track === t).map(e => [e.beat == null ? null : +e.beat.toFixed(2), e.src, e.out]), TR);
await E(() => SYNQUENZER.stop());
console.log('after reload ▶', JSON.stringify(nl.slice(0, 12)));
check('S4 reload → ▶ at once: the pad clip is arpeggiated from the first beat (no plain clip chord)', nl.length > 3 && nl.every(x => x[1] === 'arp') && nl[0][0] < .3, nl.slice(0, 8));
console.log('errs', JSON.stringify(errs));
check('S5 no console errors', !errs.length, errs.slice(0, 4));
await T.br.close(); done();
