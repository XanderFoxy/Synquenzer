// QA K1 regression: FANG of freely played chords (Akkord mode keys via API 'c', FANG by finger) -> part
import {open, sleep, OUT} from './n5-k-qa-lib.mjs';
const FILE = process.env.F; const TAG = FILE ? 'base' : 'K';
const T = await open({vp: [390, 844], file: FILE}); const {p, E} = T;
await E(() => { SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(120); });
const s1 = (await T.find('button.scn', /^▶\s*1/))[0]; await T.tap(s1.cx, s1.cy, 300);
await p.waitForFunction(() => SYNQUENZER.runtime().playing, null, {timeout: 10000});
const chords = [57, 53, 48, 55, 57, 53, 48, 55]; const b0 = Math.ceil((await E(() => audBeat())) / 4) * 4 + 4;
for (let k = 0; k < chords.length; k++) { await p.waitForFunction(b => audBeat() >= b, b0 + 4 * k + 0.05, {timeout: 60000, polling: 5}); await E(n => { SYNQUENZER.keyOn(n, .8, 'c'); setTimeout(() => SYNQUENZER.keyOff(0, 'c'), 120); }, chords[k]); }
await p.waitForFunction(b => audBeat() >= b, b0 + 32.3, {timeout: 60000, polling: 5});
const fb = (await T.find('#bFang, .fangb'))[0]; await T.tap(fb.cx, fb.cy, 700);
await T.shot('fang-' + TAG);
console.log('after tap', JSON.stringify(await E(() => ({fp: SYNQUENZER.fangPart(), pops: [...document.querySelectorAll('.pop, .sheet, [class*=sheet]')].filter(e => e.offsetWidth).map(e => e.className + ':' + e.textContent.trim().slice(0, 80)).slice(0, 5), mem: SYNQUENZER.memory && JSON.stringify(SYNQUENZER.memory()).slice(0, 300)}))));
const tf = await E(() => { try { return JSON.stringify(SYNQUENZER.fangTeil({})).slice(0, 300); } catch (e) { return 'ERR ' + e.message; } });
console.log('fangTeil', tf);
await sleep(500);
console.log('fangPart now', JSON.stringify(await E(() => SYNQUENZER.fangPart())).slice(0, 300));
console.log('errors', JSON.stringify(T.errs.slice(0, 3)));
await T.b.close();
