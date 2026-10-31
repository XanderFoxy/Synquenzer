// SINGEN on, gestures, then a normal reload (pull to refresh / new version): does the history of the singing session survive?
import {chromium} from 'playwright';
import {writeWav, tone, sleep} from './v3-qa-vs3-h.mjs';
const APP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/n5-br-H/index.html';
const DIR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/mu2';
const MIC = process.argv[2] !== 'nomic', WAIT = +(process.argv[3] || 20000);
const wav = DIR + '/voc3.wav'; writeWav(wav, tone(330, 6, 48000), 48000);
const br = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--use-file-for-fake-audio-capture=' + wav]});
const ctx = await br.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + APP); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version); await sleep(3000);
const E = (f, a) => p.evaluate(f, a);
if (MIC) { await E(() => { SYNQUENZER.play(); SYNQUENZER.stop(); return SYNQUENZER.stimmeStart({route: 'wired', cal: false}); }); await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live', null, {timeout: 10000}); }
for (let i = 0; i < 10; i++) { await E(i => { SYNQUENZER.setClip(3, i % 4, {len: 1, notes: [{t: 0, d: .5, n: 60 + i, v: .8}]}); }, i); await sleep(300); }
await sleep(WAIT);
const before = await E(() => ({mem: SYNQUENZER.history(), proj: S.tracks[3].clips[1] && S.tracks[3].clips[1].notes[0].n}));
await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version); await sleep(3000);
const after = await E(() => ({hist: SYNQUENZER.history(), proj: S.tracks[3].clips[1] && S.tracks[3].clips[1].notes[0].n}));
console.log(MIC ? 'SINGEN an' : 'SINGEN aus', 'wait', WAIT, 'before reload', JSON.stringify(before), '→ after reload', JSON.stringify(after), 'errs', errs.slice(0, 2));
await br.close();
