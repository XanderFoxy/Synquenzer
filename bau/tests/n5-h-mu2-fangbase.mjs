// FANG after REC: H vs base (same steps), plus what the 'proj' after REC holds
import {open, sleep} from './n5-h-mu2-lib.mjs';
const FILE = process.env.F;
const T = await open({vp: [390, 844], file: FILE}); const {p, E} = T;
const find = (sel, re) => E(([sel, src]) => { const rx = src ? new RegExp(src) : null; return [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (!rx || rx.test((e.textContent || '').trim())); }).map(e => { const r = e.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height / 2, t: (e.textContent || '').trim().slice(0, 40)}; }); }, [sel, re ? re.source : null]);
const waitB = b => p.waitForFunction(b => SYNQUENZER.runtime().beat >= b, b, {timeout: 60000, polling: 10});
await E(() => { SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(120); });
const b1 = (await find('button.scn', /^▶\s*1/))[0]; await T.tap(b1.cx, b1.cy, 300); await sleep(1000);
const isH = await E(() => typeof HIST !== 'undefined');
const n0 = isH ? await E(() => HIST.cur.strs.length) : 0;
await E(() => { SYNQUENZER.setRecOptions({countIn: 0, length: 1}); SYNQUENZER.selectSlot(0, 3); });
const b0 = Math.ceil(await E(() => SYNQUENZER.runtime().beat) / 4) * 4 + 4;
await waitB(b0 - .5); await E(() => SYNQUENZER.rec());
for (const [b, n] of [[b0 + .05, 60], [b0 + 1.05, 64], [b0 + 2.05, 67]]) { await waitB(b); await E(n => SYNQUENZER.keyOn(n), n); await sleep(200); await E(n => SYNQUENZER.keyOff(n), n); }
await waitB(b0 + 5); await sleep(3000);
if (isH) { await E(() => histDrainNow()); console.log(JSON.stringify(await E(n => HIST.cur.strs.slice(n).map(s => JSON.parse(s)).map(e => ({u: e.u, l: e.l, d: e.d})), n0)).slice(0, 1500)); }
console.log('rec clip', JSON.stringify(await E(() => SYNQUENZER.getClip(0, 3))).slice(0, 300));
const chords = [57, 53, 48, 55, 57, 53, 48, 55]; const c0 = Math.ceil((await E(() => audBeat())) / 4) * 4 + 4;
for (let k = 0; k < chords.length; k++) { await p.waitForFunction(b => audBeat() >= b, c0 + 4 * k + 0.05, {timeout: 60000, polling: 5}); await E(n => { SYNQUENZER.keyOn(n, .8, 'c'); setTimeout(() => SYNQUENZER.keyOff(0, 'c'), 120); }, chords[k]); }
await p.waitForFunction(b => audBeat() >= b, c0 + 32.3, {timeout: 60000, polling: 5});
const fb = (await find('#bFang, .fangb'))[0]; if (fb) await T.tap(fb.cx, fb.cy, 400);
console.log('fang btn', JSON.stringify(fb), 'fangPart', JSON.stringify(await E(() => SYNQUENZER.fangPart())).slice(0, 200), 'undo top', JSON.stringify(await E(() => SYNQUENZER.undoInfo())).slice(0, 200));
await T.b.close();
