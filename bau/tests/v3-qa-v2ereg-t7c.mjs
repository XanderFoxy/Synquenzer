// QA (V2e): after „Demo laden“ with bars selected in the song view: which later actions bring the Träger bar back?
import { open, APP } from './v3-v2d-pw.mjs';
const st = () => { const c = document.getElementById('carrier'), r = document.getElementById('rangeBar'); return {car: !!(c && c.offsetWidth && c.offsetHeight), rng: !!(r && r.offsetWidth && r.offsetHeight), sel: window.SYNQUENZER.songSelect(), song: !!window.SYNQUENZER.song(), playing: window.SYNQUENZER.runtime().playing}; };
const {b, p, errs} = await open({width: 390, height: 844}, APP, true);
const cdp = await p.context().newCDPSession(p);
const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, id: 1}]});
const tap = async (x, y, wait = 400) => { await touch('touchStart', x, y); await p.waitForTimeout(40); await touch('touchEnd', x, y); await p.waitForTimeout(wait); };
const tapSel = async s => { const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e || !e.offsetWidth) return null; const q = e.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; }, s); if (r) await tap(r[0], r[1]); return !!r; };
const tapText = async t => { const r = await p.evaluate(t => { const bb = [...document.querySelectorAll('button')].find(x => x.offsetWidth && x.textContent.trim().startsWith(t)); if (!bb) return null; const q = bb.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; }, t); if (r) await tap(r[0], r[1]); return !!r; };
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'};
  Q.setClip(0, 0, {len: 1, key: K, notes: [{t: 0, d: .4, n: 57, v: .8}]}); Q.launchScene(0); Q.songRec(true); });
await p.waitForFunction(() => window.SYNQUENZER.runtime().beat > 12.5, null, {timeout: 20000, polling: 20});
await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songRec(false); Q.stop(); Q.songView(true); }); await p.waitForTimeout(400);
const cv = await p.evaluate(() => { const q = document.querySelector('.sv-cv').getBoundingClientRect(); return [q.x, q.y]; });
await tap(cv[0] + 36 * 1.5, cv[1] + 8);
console.log('selected      ', JSON.stringify(await p.evaluate(st)));
await tapText('≡'); await tapText('Demo laden'); await tapText('Projekt ersetzen?'); await p.waitForTimeout(1200);
console.log('demo loaded   ', JSON.stringify(await p.evaluate(st)));
await tapSel('#songView .sv-play'); await p.waitForTimeout(600);
console.log('▶ SONG tapped ', JSON.stringify(await p.evaluate(st)));
// piano key
const k = await p.evaluate(() => { const e = [...document.querySelectorAll('#kb .key, .kb .key, [data-note]')].find(x => x.offsetWidth); if (!e) return null; const q = e.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height - 20]; });
if (k) await tap(k[0], k[1]);
console.log('key tapped    ', JSON.stringify(await p.evaluate(st)));
// launch a scene from the clip view and come back
await tapSel('#songView .sv-sw'); await p.waitForTimeout(300);
console.log('CLIPS ⇄       ', JSON.stringify(await p.evaluate(st)));
await tapText('SONG'); await p.waitForTimeout(300);
console.log('back to SONG  ', JSON.stringify(await p.evaluate(st)));
console.log('errs', JSON.stringify(errs));
await b.close();
