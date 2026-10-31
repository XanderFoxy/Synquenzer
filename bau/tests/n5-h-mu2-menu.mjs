// Menü → Projekt → Verlauf as Xander (P 390x844 and L 844x390): find the rows, read size, Aus/An, mit Verlauf + Als Datei sichern,
// delete two-step; screenshots; rects of the buttons (>= 44), clipped text
import {open, sleep, OUT} from './n5-h-mu2-lib.mjs';
import fs from 'fs';
const VP = (process.argv[2] || '390x844').split('x').map(Number), TAG = VP.join('x');
const T = await open({vp: VP}); const {p, E} = T;
const find = (sel, re) => E(([sel, src]) => { const rx = src ? new RegExp(src) : null; return [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (!rx || rx.test((e.textContent || '').trim())); }).map(e => { const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height, cx: r.x + r.width / 2, cy: r.y + r.height / 2, t: (e.textContent || '').trim().slice(0, 50)}; }); }, [sel, re ? re.source : null]);
// a few gestures first so there is a history
await E(() => { for (let i = 0; i < 6; i++) SYNQUENZER.setClip(3, i % 4, {len: 1, notes: [{t: 0, d: .5, n: 60 + i, v: .8}]}); });
await sleep(2600);
const m = (await find('button', /^≡$/))[0] || (await find('#bMenu'))[0]; await T.tap(m.cx, m.cy, 700);
const scrollTo = async re => E(src => { const rx = new RegExp(src); const r = [...document.querySelectorAll('#menu .mhist, #menu button')].find(e => rx.test(e.textContent.trim())); if (r) r.scrollIntoView({block: 'center'}); return !!r; }, re.source);
await scrollTo(/^Verlauf dieses Projekts löschen$/); await sleep(400);
await p.screenshot({path: `${OUT}/menu-${TAG}-a.png`});
const rows = await E(() => [...document.querySelectorAll('#menu .mhist')].map(r => { const b = r.getBoundingClientRect(); return {t: r.textContent.trim(), y: Math.round(b.y), h: Math.round(b.height), w: Math.round(b.width), sw: r.scrollWidth, cw: r.clientWidth}; }));
console.log('rows', JSON.stringify(rows));
const btns = await E(() => [...document.querySelectorAll('#menu .mhist button')].concat([...document.querySelectorAll('#menu button')].filter(b => /Verlauf dieses/.test(b.textContent))).map(b => { const r = b.getBoundingClientRect(); return {t: b.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height), clip: b.scrollWidth > b.clientWidth + 1}; }));
console.log('buttons', JSON.stringify(btns));
const sizeTxt = () => E(() => { const r = [...document.querySelectorAll('#menu .mhist')][0]; return r ? r.textContent.trim() : null; });
console.log('size text', await sizeTxt(), JSON.stringify(await E(() => SYNQUENZER.history())));
// Aus
let b = (await find('#menu .mhist button', /^Aus$/))[0]; await T.tap(b.cx, b.cy, 500);
console.log('after Aus', await sizeTxt(), JSON.stringify(await E(() => SYNQUENZER.history())));
await E(() => SYNQUENZER.setClip(3, 5, {len: 1, notes: [{t: 0, d: .5, n: 72, v: .8}]})); await sleep(2600);
console.log('gesture while Aus', JSON.stringify(await E(() => SYNQUENZER.history())));
b = (await find('#menu .mhist button', /^An$/))[0]; await T.tap(b.cx, b.cy, 500);
console.log('after An', await sizeTxt(), JSON.stringify(await E(() => SYNQUENZER.history())), 'check', await E(() => historyCheck()));
// mit Verlauf + Als Datei sichern
b = (await find('#menu .mhist button', /^mit Verlauf$/))[0]; await T.tap(b.cx, b.cy, 400);
await scrollTo(/^Als Datei sichern/); await sleep(300);
const dlP = p.waitForEvent('download', {timeout: 15000}).catch(e => null);
b = (await find('#menu button', /^Als Datei sichern/))[0]; await T.tap(b.cx, b.cy, 600);
const dl = await dlP; let fileInfo = null;
if (dl) { const path = `${OUT}/menu-${TAG}.json`; await dl.saveAs(path); const o = JSON.parse(fs.readFileSync(path, 'utf8')); fileInfo = {name: dl.suggestedFilename(), bytes: fs.statSync(path).size, history: !!o.history, chunks: o.history && o.history.chunks.length, format: o.format}; }
console.log('download', JSON.stringify(fileInfo));
await sleep(800); await p.screenshot({path: `${OUT}/menu-${TAG}-b.png`});
// delete two-step
await E(() => { if (!document.querySelector('#menu')) openMenu(); });
await scrollTo(/^Verlauf dieses Projekts löschen$/); await sleep(300);
b = (await find('#menu button', /^Verlauf dieses Projekts löschen$/))[0]; await T.tap(b.cx, b.cy, 300);
const armed = (await find('#menu button', /Wirklich löschen/))[0];
await p.screenshot({path: `${OUT}/menu-${TAG}-c-armed.png`});
console.log('armed', JSON.stringify(armed));
if (armed) await T.tap(armed.cx, armed.cy, 1200);
console.log('after delete', await sizeTxt(), JSON.stringify(await E(() => SYNQUENZER.history())), 'check', await E(() => historyCheck()));
await p.screenshot({path: `${OUT}/menu-${TAG}-d.png`});
const L = await E(() => ({sw: document.documentElement.scrollWidth, cw: innerWidth}));
console.log('page overflow', JSON.stringify(L), 'errs', T.errs.slice(0, 3));
await T.b.close();
