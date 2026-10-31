// QA musiker VV1: the sheet by touch like Xander (P1 / L1): Menü → Video, format/view, Vorschau, Erstellen, Abbrechen, Sichern, ✕, play
import { open, buildSong, OUTQ } from './n5-v-qm-lib.mjs';
import fs from 'fs';
const [W, H, N] = process.argv[2] === 'L' ? [844, 390, 'L1'] : [390, 844, 'P1'];
const OPUS = process.argv[3] === 'opus';
const {b, p, errs} = await open({w: W, h: H, touch: true, dpr: 3});
const res = {N, OPUS};
res.setup = await buildSong(p);
if (OPUS) await p.evaluate(() => SYNQUENZER.vvTest({opus: true}));
const tap = async (sel, wait = 300) => { const e = await p.$(sel); if (!e) throw new Error('fehlt ' + sel); await e.scrollIntoViewIfNeeded(); await e.tap(); await p.waitForTimeout(wait); };
const tapText = async (root, txt, wait = 300) => { const e = await p.$(`${root} button:text-is("${txt}")`); if (!e) throw new Error('fehlt ' + txt); const q = await e.boundingBox(); await p.touchscreen.tap(q.x + q.width / 2, q.y + q.height / 2); await p.waitForTimeout(wait); return q; };
const shot = n => p.screenshot({path: OUTQ + 'ui-' + N + (OPUS ? '-opus' : '') + '-' + n + '.png'});
const cvHash = () => p.evaluate(() => { const c = document.querySelector('#vvSheet canvas'); const g = c.getContext('2d'); const d = g.getImageData(0, 0, c.width, c.height).data; let h = 0, nz = 0; for (let k = 0; k < d.length; k += 97) { h = (h * 31 + d[k]) >>> 0; } return {h, w: c.width, h2: c.height}; });
const live = () => p.evaluate(() => ({playing: R.playing, song: !!R.songPlay, voices: VOICES.filter(v => !v.dead).length, hits: HITS.filter(x => !x.dead).length, tk: TK.src.length, busy: SYNQUENZER.vvInfo().busy, prev: SYNQUENZER.vvInfo().prev, toast: EL.toast ? EL.toast.textContent : ''}));
await tap('#bMenu', 500);
const mb = await p.$('#menu button[aria-label="Video des Songs erstellen"]'); res.menuBtn = !!mb;
await mb.scrollIntoViewIfNeeded(); await mb.tap(); await p.waitForTimeout(700);
await shot('1-open');
res.open = await p.evaluate(() => ({way: document.querySelector('#vvSheet .vvway').innerText, rng: document.querySelector('#vvSheet .vvrow.txt').innerText, info: SYNQUENZER.vvInfo().prefs}));
res.still0 = await cvHash();
// 16:9 + Matrix
await tapText('#vvSheet', '16:9'); await tapText('#vvSheet', 'Matrix', 500);
await shot('2-16x9-matrix');
res.still1 = await cvHash();
// back to 9:16 Song
await tapText('#vvSheet', '9:16'); await tapText('#vvSheet', 'Song', 500);
// Vorschau
await tapText('#vvSheet', '▶ Vorschau', 1500);
const h1 = await cvHash(); await p.waitForTimeout(1000); const h2 = await cvHash();
res.prev = {state: await live(), moving: h1.h !== h2.h};
await shot('3-preview');
await tapText('#vvSheet', '■ Stopp', 1200);
res.prevStop = await live();
// Erstellen, then Abbrechen at ~25 %
await tapText('#vvSheet', 'Video erstellen', 100);
await p.waitForFunction(() => { const s = document.querySelector('#vvSheet .vvprog span'); return s && /(\d+) %/.test(s.textContent) && +s.textContent.match(/(\d+) %/)[1] >= 20; }, null, {timeout: 120000, polling: 50}).catch(() => {});
await shot('4-busy');
res.busyTxt = await p.evaluate(() => document.querySelector('#vvSheet .vvprog span').textContent);
const tc0 = Date.now(); await tapText('#vvSheet', 'Abbrechen', 0);
await p.waitForFunction(() => !SYNQUENZER.vvInfo().busy, null, {timeout: 20000, polling: 10}); res.cancelMs = Date.now() - tc0;
await p.waitForTimeout(300);
res.afterCancel = await live(); res.afterCancelInfo = await p.evaluate(() => ({cls: document.getElementById('vvSheet').className, mk: document.querySelector('#vvSheet .vvacts .go').disabled}));
await shot('5-cancelled');
// Erstellen to the end
const t0 = Date.now(); await tapText('#vvSheet', 'Video erstellen', 100);
await p.waitForFunction(() => !SYNQUENZER.vvInfo().busy, null, {timeout: 300000, polling: 100}); res.makeMs = Date.now() - t0;
await p.waitForTimeout(500);
await shot('6-done');
res.done = await p.evaluate(() => ({info: SYNQUENZER.vvInfo().res, txt: document.querySelector('#vvSheet .vvway').innerText, cls: document.getElementById('vvSheet').className, toast: EL.toast ? EL.toast.textContent : ''}));
// Sichern → a download
const dlP = p.waitForEvent('download', {timeout: 8000}).catch(() => null);
await tapText('#vvSheet', 'Sichern', 300); const dl = await dlP;
if (dl) { const f = OUTQ + 'ui-' + N + (OPUS ? '-opus' : '') + '.' + (dl.suggestedFilename().split('.').pop()); await dl.saveAs(f); res.download = {name: dl.suggestedFilename(), f, size: fs.statSync(f).size}; } else res.download = null;
// ✕ and play in the app
await tap('#vvSheet .sh-x', 500);
res.closed = await p.evaluate(() => ({open: SYNQUENZER.vvInfo().open}));
await p.evaluate(() => SYNQUENZER.play()); await p.waitForTimeout(2000); res.appPlay = await live(); await p.evaluate(() => SYNQUENZER.stop()); await p.waitForTimeout(1500); res.appStop = await live();
await shot('7-app');
res.errs = errs;
console.log(JSON.stringify(res, null, 1));
fs.writeFileSync(OUTQ + 'ui-' + N + (OPUS ? '-opus' : '') + '.json', JSON.stringify(res, null, 1));
await b.close();
