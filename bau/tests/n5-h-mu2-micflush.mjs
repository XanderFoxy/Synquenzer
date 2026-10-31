// QA musiker run 2: with SINGEN (mic live) on, are gestures written to IndexedDB at all (every <= 2 s), and are 'proj' changes caught?
import {chromium} from 'playwright';
import {writeWav, tone, sleep} from './v3-qa-vs3-h.mjs';
const APP = process.env.F || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/n5-br-H/index.html';
const DIR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/mu2';
const MIC = process.argv[2] !== 'nomic';
const wav = DIR + '/voc2.wav'; writeWav(wav, tone(330, 6, 48000), 48000);
const br = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--use-file-for-fake-audio-capture=' + wav]});
const ctx = await br.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + APP); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version); await sleep(3000);
const E = (f, a) => p.evaluate(f, a);
// what is in IndexedDB for this project (events persisted)
const idb = () => E(() => new Promise(res => { const op = indexedDB.open('synq-hist'); op.onsuccess = () => { const db = op.result; const tx = db.transaction('m', 'readonly'); const r = tx.objectStore('m').get(S.id); r.onsuccess = () => { const m = r.result; res(m ? {ne: m.ne, nk: m.nk, bytes: m.bytes} : null); db.close(); }; }; op.onerror = () => res('err'); }));
console.log(MIC ? 'SINGEN an' : 'SINGEN aus', 'start idb', JSON.stringify(await idb()));
if (MIC) { await E(() => { SYNQUENZER.play(); SYNQUENZER.stop(); return SYNQUENZER.stimmeStart({route: 'wired', cal: false}); }); await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live', null, {timeout: 10000}); }
console.log('stimme', JSON.stringify(await E(() => SYNQUENZER.stimme().phase)));
for (let i = 0; i < 6; i++) { await E(i => { SYNQUENZER.setClip(3, i % 4, {len: 1, notes: [{t: 0, d: .5, n: 60 + i, v: .8}]}); SYNQUENZER.setBpm(100 + i); }, i); await sleep(2500); }
await sleep(3000);
console.log('after 6 gestures + 6 bpm changes in 18 s: memory', JSON.stringify(await E(() => ({mem: HIST.cur.strs.length, kinds: HIST.cur.strs.map(s => JSON.parse(s).u).join(' ')}))), 'idb', JSON.stringify(await idb()));
// simulate Safari killing the tab (no pagehide): reload the page via a fresh context on the same storage is not possible; use reload after disabling pagehide/visibility handlers
await E(() => { const o = window.addEventListener; HIST.on = HIST.on; });
await p.evaluate(() => { window.stop(); });
await p.close({runBeforeUnload: false});
const p2 = await ctx.newPage(); await p2.goto('file://' + APP); await p2.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version); await sleep(3000);
console.log('after page close + reopen: history()', JSON.stringify(await p2.evaluate(() => SYNQUENZER.history())), 'bpm', await p2.evaluate(() => S.bpm));
console.log('errs', errs.slice(0, 3));
await br.close();
