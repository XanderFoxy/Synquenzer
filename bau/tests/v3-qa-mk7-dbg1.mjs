import { chromium } from 'playwright';
import { INIT, EXE } from './v3-mk7-vsh.mjs';
const FILE = new URL('../mk-br-MK7/index.html', import.meta.url).pathname;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const br = await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await br.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.addInitScript(INIT);
await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
await p.evaluate(() => { ensureAudio(); }); await p.waitForFunction(() => SynthHost.state === 'ready', null, {timeout: 10000});
await p.evaluate(() => { const Q = SYNQUENZER; Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.openEditor(); }); await sleep(800);
await p.evaluate(() => { MKUI.setv(MKUI.KN.mode, 1, false); MKUI.render(); }); await sleep(300);
const info = await p.evaluate(() => ({tracks: S.tracks.map((t, i) => i + ':' + t.kind + ':' + (t.sound ? t.sound.engine : '-') + ':' + t.uid).join(' '), mode: SYNQUENZER.mkGet(0).mode}));
console.log(JSON.stringify(info));
for (const how of ['api1']) {
  await p.evaluate(() => SYNQUENZER.mkIn(0, 'e2', 1)); await sleep(200);
  await p.evaluate(() => { AU.synth[0].mkLed(true); const E = AU.synth[1]; E.on(9e6, 57, .8, AU.ctx.currentTime + .02); E.on(9e6 + 1, 64, .8, AU.ctx.currentTime + .02); E.flush();
    const A = AU.synth[0]; for (const [k, nt] of [[0, 48], [1, 52], [2, 55], [3, 59]]) A.on(8e6 + k, nt, .8, AU.ctx.currentTime + .02); A.flush(); });
  for (let k = 0; k < 4; k++) { await sleep(500); console.log(how, JSON.stringify(await p.evaluate(() => ({lv: AU.synth[0].mkLv, mkIn: S.tracks[0].mkIn, info: SYNQUENZER.mkInInfo().tracks.slice(0, 3), l0: AU.synth[0].load, l1: AU.synth[1].load, ledOn: AU.synth[0].mkLedOn})))); }
}
console.log('errs', errs);
await br.close();
