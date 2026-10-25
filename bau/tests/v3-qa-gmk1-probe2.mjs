// Menü → Info → Leistungs-Probe by touch (Xander's iPhone check point 5)
import {open, sleep, OUT, check, done} from './v3-qa-gmk1-tl.mjs';
const T = await open(); const {p, E, errs} = T;
await T.tapSel('#bMenu, .menu-btn, button[aria-label="Menü"]') || await T.tapTxt('button', /^≡$/);
await sleep(400);
const btns = await E(() => [...document.querySelectorAll('#menu button')].filter(b => b.getClientRects().length).map(b => b.textContent.trim().slice(0, 30)));
console.log('menu', JSON.stringify(btns.slice(0, 40)));
await E(() => { const b = [...document.querySelectorAll('#menu button')].find(b => /Leistungs-Probe/.test(b.textContent)); b.scrollIntoView({block: 'center'}); }); await sleep(400);
const r = await T.rectText('#menu button', /Leistungs-Probe/); console.log('probe btn', JSON.stringify(r)); await T.tap(r.cx, r.cy, 500);
console.log('probe pop', JSON.stringify(await T.popTexts()));
await T.tapTxt('#popLayer .pop button', /Probe starten/);
await sleep(11500);
const pre = await E(() => { const e = document.querySelector('#popLayer .mkpr'); return e ? e.textContent : null; });
let j = null; try { j = JSON.parse(pre); } catch (e) {}
check('PR1 probe by touch: JSON result with load_med, frames_ok, voices 4, net 0', !!j && j.load_med > 0 && j.frames_ok === true && j.voices === 4 && j.net === 0, pre && pre.slice(0, 300));
const cp = await T.tapTxt('#popLayer .pop button', /Ergebnis kopieren/); await sleep(300); const t1 = await T.toast();
const dl = p.waitForEvent('download', {timeout: 5000}).catch(() => null); await T.tapTxt('#popLayer .pop button', /Als Datei/); const d = await dl;
check('PR2 Kopieren gives feedback; Als Datei delivers a file', !!t1 && !!d, {toast: t1, file: d && d.suggestedFilename()});
check('no console errors', errs.length === 0, errs.slice(0, 4));
await T.br.close(); done();
