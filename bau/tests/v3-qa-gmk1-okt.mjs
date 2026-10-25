import {open, sleep, OUT, check, done} from './v3-qa-gmk1-tl.mjs';
import {setupProject} from './v3-qa-gmk1-setup.mjs';
const T = await open(); const {p, E, errs} = T;
await setupProject(E);
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(500);
const st = async l => { const s = await E(() => ({name: SYNQUENZER.getSound(0).name, oct: (SYNQUENZER.project().project || SYNQUENZER.project()).tracks[0].kbOct, u: SYNQUENZER.undoInfo().n, shift: SYNQUENZER.mkPanel().shift, sel: SYNQUENZER.mkPanel().sel, toast: (document.getElementById('toast') && document.getElementById('toast').offsetWidth) ? document.getElementById('toast').textContent : null})); console.log(l.padEnd(28), JSON.stringify(s)); };
await st('start');
await T.tapMk('n0', 300); await st('n0');
await T.tapMk('n1', 300); await st('n1');
await T.tapTxt('.hb.ur', /^↶$/, 200); await st('header undo');
await T.tapMk('shift'); await st('shift');
await T.tapMk('n2', 200); await st('n2 (SHIFT+3)');
await sleep(2000);
await T.tapTxt('.hb.ur', /^↶$/, 200); await st('header undo');
for (const k of ['octu', 'octu', 'octd']) { const r = await T.mk(k); const hit = await E(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.closest('[data-k]') ? e.closest('[data-k]').dataset.k : e.tagName + '.' + e.className + ':' + e.textContent.trim().slice(0, 30)) : null; }, [r.cx, r.cy]); await T.tap(r.cx, r.cy, 200); await st(k + ' (hit ' + hit + ')'); }
await p.screenshot({path: OUT + 'okt.png'});
console.log('errs', errs);
await T.br.close();
