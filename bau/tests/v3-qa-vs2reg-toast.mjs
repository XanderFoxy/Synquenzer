// QA VS2: ● REC with keys while 🎤 is on (headphones/wired, no singing): what toasts does the player see?
import { open, micOn } from './v3-vs2-h.mjs';
const H = await open({viewport: {width: 390, height: 844}}); const p = H.p;
await micOn(p, 'wired');
await p.evaluate(() => { const Q = SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120); Q.play(); Q.setRecOptions({countIn: 0, length: 1, quantize: '1/16'}); Q.selectSlot(3, 0); });
await p.waitForTimeout(600);
await p.evaluate(() => { window.__toasts = []; const t = document.querySelector('#toast'); new MutationObserver(() => { const s = t.textContent; if (s && window.__toasts[window.__toasts.length - 1] !== s) window.__toasts.push(Math.round(performance.now()) + ' ' + s + (t.offsetParent ? '' : ' (hidden)')); }).observe(t, {childList: true, subtree: true, characterData: true, attributes: true}); SYNQUENZER.rec(); });
const rs = await p.evaluate(() => SYNQUENZER.runtime().rec);
const b0 = rs.startBeat;
const wb = b => p.waitForFunction(x => SYNQUENZER.runtime().beat > x, b, {timeout: 20000, polling: 10});
for (let k = 0; k < 4; k++) { await wb(b0 + k - .02); await p.evaluate(n => SYNQUENZER.tap(n, 200), 60 + 2 * k); }
const tEnd = await p.evaluate(() => Math.round(performance.now()));
await wb(b0 + 4.2);
const snaps = [];
for (let i = 0; i < 12; i++) { await p.waitForTimeout(250); snaps.push(await p.evaluate(() => { const t = document.querySelector('#toast'); return Math.round(performance.now()) + ' ' + (t.offsetParent && getComputedStyle(t).opacity !== '0' ? t.textContent : '(none)') + ' btns:' + [...t.querySelectorAll('button')].map(b => b.textContent).join('/'); })); }
console.log('rec clip', await p.evaluate(() => { const c = SYNQUENZER.getClip(3, 0); return c && c.notes.map(n => n.n).join(','); }));
console.log('toasts', JSON.stringify(await p.evaluate(() => window.__toasts), null, 1));
console.log('snaps', JSON.stringify(snaps, null, 1));
console.log('vs', JSON.stringify(await p.evaluate(() => SYNQUENZER.vsInfo())).slice(0, 300));
console.log('errs', JSON.stringify(H.errs));
await H.br.close();
