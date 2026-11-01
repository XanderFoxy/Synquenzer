// Echte Fingertipps im Piano-Roll: neue Noten in leerem Clip (Synth 4, Szene 1) -> Ereignisse je Tipp
import { launch, nCur, since, short, OUT } from './n5-h-ab-lib.mjs';
const {b, p, errs} = await launch({mobile: true});
await p.evaluate(() => historyCheck());
const c = async sel => p.evaluate(sel => { const e = document.querySelector(sel); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, sel);
let n0 = await nCur(p);
let xy = await c('#bEdit'); await p.touchscreen.tap(xy[0], xy[1]); await p.waitForTimeout(1500);
console.log('nach ✎ :', JSON.stringify((await since(p, n0)).map(short)), await p.evaluate(() => ({ed: R.editor, rollAt: ED.rollAt, clip: JSON.stringify(S.tracks[3].clips[0])})));
await p.screenshot({path: OUT + '/n5-h-ab-roll.png'});
const info = await p.evaluate(() => [...document.querySelectorAll('canvas, svg')].filter(x => x.getBoundingClientRect().width > 150 && x.getBoundingClientRect().height > 100).map(x => { const r = x.getBoundingClientRect(); return [x.tagName, x.id, String(x.className && (x.className.baseVal ?? x.className)), Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; }));
console.log(JSON.stringify(info));
await b.close();
