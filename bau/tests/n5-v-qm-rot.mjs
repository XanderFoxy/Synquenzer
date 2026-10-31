// QA musiker VV1: turning the phone during „Video erstellen“; ✕ during the job, reopen, again
import { open, buildSong, OUTQ } from './n5-v-qm-lib.mjs';
import fs from 'fs'; import { execSync } from 'child_process';
const {b, p, errs} = await open({w: 390, h: 844, touch: true, dpr: 3});
await buildSong(p, {take: false});
await p.evaluate(() => { SYNQUENZER.vvTest({opus: true}); SYNQUENZER.vvOpen(); }); await p.waitForTimeout(500);
const tapTxt = async t => { const e = await p.$(`#vvSheet button:text-is("${t}")`); const q = await e.boundingBox(); await p.touchscreen.tap(q.x + q.width / 2, q.y + q.height / 2); };
await tapTxt('Video erstellen'); await p.waitForTimeout(4000);
await p.setViewportSize({width: 844, height: 390}); await p.waitForTimeout(1500);
await p.screenshot({path: OUTQ + 'rot-busy-L.png'});
const mid = await p.evaluate(() => { const c = document.querySelector('#vvSheet canvas'), r = c.getBoundingClientRect(); return {cw: c.width, ch: c.height, css: [Math.round(r.width), Math.round(r.height)], busy: SYNQUENZER.vvInfo().busy}; });
await p.waitForFunction(() => !SYNQUENZER.vvInfo().busy, null, {timeout: 200000});
const res = await p.evaluate(() => SYNQUENZER.vvInfo().res);
const bl = await p.evaluate(() => SYNQUENZER.vvBlob()); const f = OUTQ + 'rot.mp4'; fs.writeFileSync(f, Buffer.from(bl.b64, 'base64'));
const pr = execSync(`ffprobe -v error -show_entries stream=codec_type,width,height,nb_frames -of compact ${f}`).toString().trim().replace(/\n/g, ' | ');
await p.screenshot({path: OUTQ + 'rot-done-L.png'});
// ✕ while creating, reopen, create again
await tapTxt('Video erstellen'); await p.waitForTimeout(3000);
const x = await p.$('#vvSheet .sh-x'); await x.tap(); await p.waitForTimeout(800);
const afterX = await p.evaluate(() => ({open: SYNQUENZER.vvInfo().open, busy: SYNQUENZER.vvInfo().busy, off: SYNQUENZER.vvInfo().off, ctx: AU.ctx.constructor.name, timer: !!AU.timer}));
await p.evaluate(() => SYNQUENZER.vvOpen()); await p.waitForTimeout(500);
const reopened = await p.evaluate(() => ({cls: document.getElementById('vvSheet').className, way: document.querySelector('#vvSheet .vvway').innerText, mkDisabled: document.querySelector('#vvSheet .vvacts .go').disabled}));
await tapTxt('Video erstellen'); await p.waitForFunction(() => !SYNQUENZER.vvInfo().busy, null, {timeout: 200000}); const res2 = await p.evaluate(() => SYNQUENZER.vvInfo().res);
console.log(JSON.stringify({mid, res: res && [res.W, res.H, res.dur], pr, afterX, reopened, res2: res2 && [res2.W, res2.H, res2.dur, res2.how], errs}));
await b.close();
