// Independent repro: is there a way back to SPIEL from EDIT-WAHL 1 for an unsaved MS 2000 sound?
import {open, sleep} from './v3-qa-gmk1-tl.mjs';
const T = await open(); const {E, errs} = T;
const sel = async () => (await T.panel()).sel;
const lcd = () => E(() => { const l = document.getElementById('lcd') || document.querySelector('.lcd'); return l ? l.textContent.replace(/\s+/g, ' ').trim().slice(0, 120) : null; });
const log = (...a) => console.log(...a);
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(500);
await T.tapTxt('button', /^MS ?2000$/); await sleep(700);
log('after engine switch', JSON.stringify(await sel()), 'knobs', (await T.panel()).knobs.map(k => k && k.l).join('|'), 'name', await E(() => SYNQUENZER.getSound(0).name));
log('progNum display', await E(() => { const d = document.querySelector('.mkx[data-k="disp"]'); return d && d.getAttribute('aria-label'); }));
// EDIT-WAHL 1 → FILTER by tap + list
await T.tapMk('w1', 300); await T.tapPop(/^6 FILTER/); await sleep(250);
log('after FILTER', JSON.stringify(await sel()), (await T.panel()).knobs.map(k => k && k.l).join('|'));
// each number key: confirm the tap lands (LCD text) and wahl stays
for (let k = 0; k < 8; k++) { await T.tapMk('n' + k, 150); log(' num', k + 1, 'wahl', (await sel()).wahl, 'lcd:', await lcd()); }
// drag the rotary down past position 1 (clamps at STIMME, there is no SPIEL position)
await T.dragMk('w1', 400, 20); log('drag w1 far down', JSON.stringify(await sel()), 'lcd:', await lcd());
await T.dragMk('w2', 400, 20); log('drag w2 far down', JSON.stringify(await sel()));
// tap w2 list: rows offered?
await T.tapMk('w1', 300); const rows = await E(() => [...document.querySelectorAll('#popLayer .pop button[data-v]')].map(b => b.textContent.trim().slice(0, 14))); log('w1 list rows', rows.length, rows.join(' / '));
await E(() => { const b = document.querySelector('#popLayer .pop button[data-v="5"]'); b && b.click(); }); await sleep(200);
// SHIFT + SEITE: other EDIT-WAHL (not SPIEL)
await T.tapMk('shift', 150); await T.tapMk('side', 200); log('SHIFT+SEITE', JSON.stringify(await sel()));
await T.tapMk('shift', 150); await T.tapMk('side', 200); log('SHIFT+SEITE again', JSON.stringify(await sel()));
// SHIFT twice, display, prog row (opens browser), matrix
await T.tapMk('shift', 150); await T.tapMk('shift', 150); log('SHIFT x2', JSON.stringify(await sel()));
await T.tapMk('m1', 150); log('matrix tap', JSON.stringify(await sel()), 'lcd:', await lcd());
// switch tracks and back, close and reopen
await E(() => { SYNQUENZER.closeEditor(); SYNQUENZER.selectTrack(1); SYNQUENZER.openEditor(); }); await sleep(500);
log('other track', await E(() => SYNQUENZER.getSound(1).engine), 'MKUI.P.wahl', await E(() => MKUI.P.wahl));
await E(() => { SYNQUENZER.closeEditor(); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(500);
log('back on track 0, reopened', JSON.stringify(await sel()), (await T.panel()).knobs.map(k => k && k.l).join('|'));
// try the FX tab and back to GERÄT
const fx = await T.rectText('button', /^FX$/); if (fx) { await T.tap(fx.cx, fx.cy, 300); const g = await T.rectText('button', /^GER(Ä|A)T$/); if (g) await T.tap(g.cx, g.cy, 400); }
log('FX→GERÄT', JSON.stringify(await sel()));
// edit a SPIEL-relevant value meanwhile: user turned CUTOFF in FILTER; edits must survive the way back
await E(() => SYNQUENZER.mkSet(0, 't.0.f.cut', 33)); const cutBefore = await E(() => SYNQUENZER.mkGet(0).t[0].f.cut);
// workaround 1: WRITE first, then tap the lit number key
await T.tapMk('write', 300);
await E(() => { const i = document.querySelector('#popLayer .pop input'); if (i) { i.value = 'Repro Eins'; i.dispatchEvent(new Event('input', {bubbles: true})); } });
await T.tapTxt('#popLayer .pop button', /^Sichern$/, 700);
const disp = await E(() => { const d = document.querySelector('.mkx[data-k="disp"]'); return d && d.getAttribute('aria-label'); });
const lit = await E(() => [...document.querySelectorAll('.mkx[data-k^="n"]')].filter(e => e.getClientRects().length).map(e => e.dataset.k + (e.classList.contains('lit') || e.classList.contains('on') ? '*' : '')).join(' '));
log('after WRITE: display', disp, 'num keys', lit, 'wahl', (await sel()).wahl);
const m = /b\.(\d)(\d)/.exec(disp || ''); if (m) { await T.tapMk('n' + (+m[2] - 1), 300); }
log('tap lit key', JSON.stringify(await sel()), 'cut kept', cutBefore, '→', await E(() => SYNQUENZER.mkGet(0).t[0].f.cut), 'knobs', (await T.panel()).knobs.map(k => k && k.l).join('|'));
// workaround 2 (destructive): SHIFT + 3 = Init
await T.tapMk('w1', 300); await T.tapPop(/^6 FILTER/); await sleep(200);
await T.tapMk('shift', 150); await T.tapMk('n2', 300); log('SHIFT+3', JSON.stringify(await sel()), 'cut now', await E(() => SYNQUENZER.mkGet(0).t[0].f.cut));
log('errs', JSON.stringify(errs));
await T.br.close();
