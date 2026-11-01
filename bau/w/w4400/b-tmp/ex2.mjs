import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2];
const b = await chromium.launch();
const p = await b.newPage({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true});
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + file); await p.waitForTimeout(1500);
await p.evaluate(async () => { const D = window.SYNQUENZER; D.selectTrack(0); D.setParam(0, 'engine', 'north'); D.openEditor(); await new Promise(r => setTimeout(r, 300)); D.ndpOpen({perc: 0, c: 2}); await new Promise(r => setTimeout(r, 800)); });
const box = async sel => (await p.$(sel)).boundingBox();
const tap = async (sel, fy) => { const r = await box(sel); await p.touchscreen.tap(r.x + r.width / 2, r.y + r.height * (fy == null ? .5 : fy)); await p.waitForTimeout(150); };
const drag = async (sel, dy) => { const r = await box(sel), x = r.x + r.width / 2, y = r.y + r.height / 2; await p.mouse.move(x, y); await p.mouse.down(); for (let k = 1; k <= 12; k++) { await p.mouse.move(x, y - dy * k / 12); await p.waitForTimeout(16); } await p.mouse.up(); await p.waitForTimeout(150); };
const nk = () => p.evaluate(() => deep(S.tracks[0].sound.p.nk));
const log = [];
let a = await nk(); log.push(['src', await p.evaluate(() => NDP.src())]);
// ALLE KAN. + drag NOISE? use mLvl in MIX
await tap('#ndp [data-a="all"]');
await p.evaluate(() => SYNQUENZER.ndpView({sec: 'mix'}));
const u0 = await p.evaluate(() => UNDO.length);
await drag('#ndp .ndpk[data-k="mNlv"]', 40);
let b2 = await nk(); log.push(['all', b2.ch.map(c => c.mNlv).join(','), 'undo+', await p.evaluate(() => UNDO.length) - u0]);
await tap('#ndp [data-a="all"]');
// SOLO
await tap('#ndp [data-a="solo"]'); log.push(['solo', await p.evaluate(() => SYNQUENZER.percQuery(0, 'state').then(r => r && JSON.stringify(r).slice(0, 120)))]);
await tap('#ndp [data-a="solo"]');
// LISTE: WAVE in TONE
await p.evaluate(() => SYNQUENZER.ndpView({sec: 'tone', focus: 'mWav'}));
await tap('#ndp [data-a="enter"]'); await p.waitForTimeout(200);
const hasPop = await p.evaluate(() => !!document.querySelector('.mdpop button[data-v="F2"]'));
if (hasPop) await tap('.mdpop button[data-v="F2"]');
log.push(['wave', hasPop, (await nk()).ch[2].mWav]);
await p.evaluate(() => { if (PK.open) closePop(); });
// MODE list (dyn)
await p.evaluate(() => SYNQUENZER.ndpView({sec: 'tone', focus: 'mode'}));
await tap('#ndp [data-a="enter"]'); await p.waitForTimeout(200);
if (await p.$('.mdpop button[data-v="L"]')) await tap('.mdpop button[data-v="L"]');
log.push(['mode', (await nk()).ch[2].mDm]);
// ⋯ copy, then select ch 3, paste
await tap('#ndp .ndpm'); await p.waitForTimeout(150); await tap('.edmore button[data-a="copy"]');
await tap('#ndp [data-a="ch:3"]', .3);
await tap('#ndp .ndpm'); await p.waitForTimeout(150); await tap('.edmore button[data-a="paste"]');
let c = await nk(); log.push(['paste', c.ch[3].mWav, c.ch[3].mDm, c.ch[3].mName]);
await tap('#ndp .ndpm'); await p.waitForTimeout(150); await tap('.edmore button[data-a="init"]');
c = await nk(); log.push(['init', c.ch[3].mWav, c.ch[3].mDec]);
// PROG mode: encoder steps via PROG key + LISTE
await tap('#ndp [data-a="prog"]'); await tap('#ndp [data-a="enter"]'); await p.waitForTimeout(400);
const pp = await p.evaluate(() => !!document.querySelector('.mdpop .mdpl button[data-k]'));
if (pp) await tap('.mdpop .mdpl button[data-k="1"]');
log.push(['prog', pp, (await nk()).ch[3].mName]);
await p.evaluate(() => { if (PK.open) closePop(); });
// KIT mode list
await tap('#ndp [data-a="kit"]'); await tap('#ndp [data-a="enter"]'); await p.waitForTimeout(200);
const kp = await p.evaluate(() => [...document.querySelectorAll('.pop button[data-k], #pop button[data-k]')].map(b => b.textContent).slice(0, 4));
log.push(['kitpop', kp]);
const k1 = await p.$$('button[data-k="1"]'); if (k1.length) await tap('button[data-k="1"]');
c = await nk(); log.push(['kit', c.kit, await p.evaluate(() => NDP.info().seg)]);
// encoder in KIT mode: drag around the wheel
await tap('#ndp [data-a="kit"]');
// TAP x4 in HALL ECHO
await p.evaluate(() => SYNQUENZER.ndpView({sec: 'kit'}));
for (let k = 0; k < 4; k++) { await tap('#ndp [data-a="tap"]'); await p.waitForTimeout(350); }
c = await nk(); log.push(['tap', c.md.dlM, c.md.dlB]);
// rate toggle
await tap('#ndp [data-a="rate"]'); c = await nk(); log.push(['rate', c.md.dlM]);
// header kit name edited dot
log.push(['title', await p.evaluate(() => document.querySelector('#ndp .ndpkitn').textContent)]);
// SHIFT + channel: no source switch on perc
await tap('#ndp [data-a="shift"]'); await tap('#ndp [data-a="ch:5"]', .3); await tap('#ndp [data-a="shift"]');
log.push(['shiftch', await p.evaluate(() => NDP.src())]);
// zoom in TONE
await tap('#ndp [data-a="sec:tone"]'); await tap('#ndp [data-a="sec:tone"]');
log.push(['zoom', await p.evaluate(() => NDP.info().zoom)]);
await p.screenshot({path: 'ex2-zoom.png'});
// Undo of engine switch while plate open -> plate closes
await p.evaluate(() => { while (UNDO.length) undo(); }); await p.waitForTimeout(300);
log.push(['undoAll', await p.evaluate(() => ({open: SYNQUENZER.ndpInfo().open, eng: S.tracks[0].sound.engine, src: NDP.src()}))]);
// drum plate after
await p.evaluate(() => { SYNQUENZER.ndpChoose(); SYNQUENZER.ndpOpen(); }); await p.waitForTimeout(600);
log.push(['drum', await p.evaluate(() => ({open: SYNQUENZER.ndpInfo().open, src: NDP.src(), title: document.querySelector('#ndp .ndpkitn').textContent, sub: MDE.sub}))]);
await p.screenshot({path: 'ex2-drum.png'});
for (const l of log) console.log(JSON.stringify(l));
console.log('errs', errs);
await b.close();
