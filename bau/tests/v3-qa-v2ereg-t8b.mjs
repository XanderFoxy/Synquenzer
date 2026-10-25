// QA (V2e): selection behind the end after undo shortens the song: Bereich-Leiste state and its buttons
import { open, APP } from './v3-v2d-pw.mjs';
const st = () => { const c = document.getElementById('carrier'), r = document.getElementById('rangeBar'); const s = window.SYNQUENZER.song(); return {car: !!(c && c.offsetWidth && c.offsetHeight), rng: !!(r && r.offsetWidth && r.offsetHeight), sel: window.SYNQUENZER.songSelect(), bars: s && s.bars, lanes: s && JSON.stringify(s.lanes[0])}; };
const {b, p, errs} = await open({width: 390, height: 844}, APP, true);
const cdp = await p.context().newCDPSession(p);
const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, id: 1}]});
const tap = async (x, y, wait = 400) => { await touch('touchStart', x, y); await p.waitForTimeout(40); await touch('touchEnd', x, y); await p.waitForTimeout(wait); };
const tapSel = async s => { const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e || !e.offsetWidth) return null; const q = e.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; }, s); if (r) await tap(r[0], r[1]); return !!r; };
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'};
  Q.setClip(0, 0, {len: 1, key: K, notes: [{t: 0, d: .4, n: 57, v: .8}]}); Q.setClip(0, 1, {len: 1, key: K, notes: [{t: 0, d: .4, n: 60, v: .8}]}); Q.launchScene(0); Q.songRec(true); });
await p.waitForFunction(() => window.SYNQUENZER.runtime().beat > 8.5, null, {timeout: 20000, polling: 20});
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songRec(false); Q.stop(); Q.songView(true); }); await p.waitForTimeout(400);
console.log('take          ', JSON.stringify(await p.evaluate(st)));
// grow: ⧉ Kopie of bars 1-2 via the range bar (one undo)
const cv = await p.evaluate(() => { const q = document.querySelector('.sv-cv').getBoundingClientRect(); return [q.x, q.y]; });
await tap(cv[0] + 36 * .5, cv[1] + 8); await tap(cv[0] + 36 * 1.5, cv[1] + 8);
console.log('sel 1-2       ', JSON.stringify(await p.evaluate(st)));
await tapSel('#rangeBar [data-a="copy"]');
console.log('after copy    ', JSON.stringify(await p.evaluate(st)));
// the selection now is the copy (bars 3-4); undo the copy
await p.evaluate(() => window.SYNQUENZER.undo()); await p.waitForTimeout(400);
console.log('after undo    ', JSON.stringify(await p.evaluate(st)));
await tapSel('#rangeBar [data-a="del"]');
console.log('✕ after undo  ', JSON.stringify(await p.evaluate(st)));
await tapSel('#songView .sv-play'); await p.waitForTimeout(800);
console.log('▶ SONG        ', JSON.stringify(await p.evaluate(st)), JSON.stringify(await p.evaluate(() => window.SYNQUENZER.runtime().playing)));
await tapSel('#songView .sv-play'); await p.waitForTimeout(500);
await p.screenshot({path: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2ereg/t8-P1-undo.png'});
console.log('after stop    ', JSON.stringify(await p.evaluate(st)));
console.log('errs', JSON.stringify(errs));
await b.close();
