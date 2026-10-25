// QA (V2e): Kette menu (empty song and from the MELODIE label): parts listed, tap = part at the song end; Kette of scenes still builds a song; undo
import { open, NEW as APP, BASE as BASE0 } from './v3-qa-v2e2reg-pw.mjs';
const {b, p, errs} = await open({width: 390, height: 844}, APP, true);
const cdp = await p.context().newCDPSession(p);
const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, id: 1}]});
const tap = async (x, y, wait = 400) => { await touch('touchStart', x, y); await p.waitForTimeout(40); await touch('touchEnd', x, y); await p.waitForTimeout(wait); };
const tapSel = async s => { const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e || !e.offsetWidth) return null; const q = e.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; }, s); if (r) await tap(r[0], r[1]); return !!r; };
const tapPop = async t => { const r = await p.evaluate(t => { const pp = document.querySelector('#popLayer .pop'); const bb = pp && [...pp.querySelectorAll('button')].find(x => x.offsetWidth && x.textContent.includes(t)); if (!bb) return null; const q = bb.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; }, t); if (r) await tap(r[0], r[1]); return !!r; };
const popTxt = () => p.evaluate(() => { const pp = document.querySelector('#popLayer .pop'); return pp ? [...pp.querySelectorAll('button')].filter(x => x.offsetWidth).map(x => x.textContent).join(' | ') : null; });
const song = () => p.evaluate(() => { const s = window.SYNQUENZER.song(); return s ? {bars: s.bars, marks: s.marks.map(m => m.a + '+' + m.len + ':' + m.part), l0: JSON.stringify(s.lanes[0])} : null; });
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'};
  Q.setClip(0, 0, {len: 1, key: K, notes: [{t: 0, d: .4, n: 57, v: .8}]}); Q.setClip(0, 1, {len: 1, key: K, notes: [{t: 0, d: .4, n: 60, v: .8}]});
  Q.setPart(0, {name: 'Strophe', slots: [{s: 0}, -1, -1, -1, -1, -1]}); Q.setPart(1, {name: 'Refrain', slots: [{s: 1}, -1, -1, -1, -1, -1]}); Q.songView(true); });
await p.waitForTimeout(400);
await tapSel('#songView .sv-empty .kbtn');
console.log('kette pop (empty):', await popTxt());
await tapPop('STROPHE'); console.log('after STROPHE   ', JSON.stringify(await song()));
// MELODIE label → Kette … → Refrain at the end
await tapSel('#songView .sv-lm'); console.log('mel pop:', await popTxt());
await tapPop('Kette'); console.log('kette pop (song):', await popTxt());
await tapPop('REFRAIN'); console.log('after REFRAIN   ', JSON.stringify(await song()));
await p.evaluate(() => window.SYNQUENZER.undo()); await p.waitForTimeout(200); console.log('undo            ', JSON.stringify(await song()));
// Kette of scenes from the Kette menu (old path): + Szene 1, + Szene 2 … then build
await tapSel('#songView .sv-lm'); await tapPop('Kette'); console.log('kette pop:', await popTxt());
console.log('errs', JSON.stringify(errs));
await p.screenshot({path: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2e2reg/t10-kette.png'});
await b.close();
