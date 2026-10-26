import {open, sleep} from './vgmk34-tl3.mjs';
const L = process.argv[2] === 'L';
const T = await open(Object.assign({viewport: L ? {width: 844, height: 390} : {width: 390, height: 844}}, process.env.SYNQ_APP ? {file: process.env.SYNQ_APP} : {})); const {p, E, errs} = T;
console.log('APP', await E(() => SYNQUENZER.version));
await E(() => SYNQUENZER.setMetronome(false));
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(600);
const b = await T.rectText('button', /^MS ?2000$/); if (b) await T.tap(b.cx, b.cy, 900); else { const c = await T.rectText('button', /^(VA|FM|WT) ▾$/); await T.tap(c.cx, c.cy, 400); await T.tapPop(/MS ?2000/); await sleep(900); }
const info = () => E(() => SYNQUENZER.mkInfo());
const kx = (await E(() => [...document.querySelectorAll('#kb .key')].filter(k => k.getClientRects().length).map(k => { const r = k.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height * (k.classList.contains('b') ? .45 : .8)}; }))).sort((a, b) => a.cx - b.cx);
const hold = async (n = 7, ms = 400) => { await T.send('touchStart', [{x: kx[n].cx, y: kx[n].cy, id: 70}]); await sleep(150); const a = await T.lvl(ms); await T.send('touchEnd', []); await sleep(500); return a; };
console.log('info0', JSON.stringify(await info()));
await T.w('w1', /^1 STIMME/); await T.tapMk('k1', 300); await T.tapPop(/^Schicht$/); await sleep(500);
// T1 silent (PEGEL 0 via list? use drag down hard)
await T.w('w1', /^8 AMP/); await T.dragMk('k0', 300, 20); console.log('T1 lvl', (await T.pm(0)).t[0].a.lvl);
await T.tapMk('timbre', 300); console.log('timbre', (await T.panel()).timbre);
await T.w('w1', /^3 OSZ 1/); await T.tapMk('k0', 300); console.log('wave list', JSON.stringify((await T.popTexts() || []).slice(0, 8))); await T.tapPop(/^Speicherwelle/); await sleep(600);
console.log('t1.o1', JSON.stringify((await T.pm(0)).t[1].o1), 'info', JSON.stringify(await info()));
console.log('T2 Speicherwelle level', await hold());
await T.tapMk('k2', 400); const wl = await T.popTexts(); console.log('wave rows', wl && wl.length, JSON.stringify((wl || []).slice(40, 44)));
await E(() => { const b = [...document.querySelectorAll('#popLayer .pop button')].find(b => /^43\b/.test(b.textContent.trim())); b.scrollIntoView({block: 'center'}); }); await sleep(300); const r = await T.tapPop(/^43\b/); await sleep(700);
console.log('picked', !!r, 't1.o1', JSON.stringify((await T.pm(0)).t[1].o1), 'info', JSON.stringify(await info()), 'lcd', await T.lcdTxt());
console.log('T2 wave 43 level', await hold());
const mm = await T.pm(0); console.log('after pick t0.o1', JSON.stringify(mm.t[0].o1), 't1.o1', JSON.stringify(mm.t[1].o1), 'mode', mm.mode, 'undo', JSON.stringify(await T.undoTop()), 'panel', JSON.stringify((await T.panel()).timbre), 'voices', JSON.stringify(await E(() => SYNQUENZER.voices())));
await sleep(1000); console.log('again', await hold(), 'scope', JSON.stringify(await E(() => SYNQUENZER.mkScope(0))).slice(0, 300));
// T1 level back; T1 SINGLE? check swap: T1 <-> T2 then play T1 only
console.log('errs', JSON.stringify(errs)); await T.br.close();
