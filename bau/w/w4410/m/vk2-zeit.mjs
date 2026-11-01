// the same short video (bars 6–8, 16:9, Auto-Regie without entries) in a given file: time of the job and of the pictures
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const { buildSong } = await import('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/n5-v-qm-lib.mjs');
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 926, height: 428}});
const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + String(e)));
await p.goto('file://' + process.argv[2]); await p.waitForTimeout(1500); await p.mouse.click(5, 300);
await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 15000}).catch(() => {});
await buildSong(p);
const out = [];
for (const v of (process.argv[3] || 'auto').split(',')) out.push(await p.evaluate(async v => {
  const Q = SYNQUENZER; delete S.song.video; if (v !== 'auto') Q.vvDirSet(5, 8, v);
  Q.vvTest({opus: true}); Q.vvPrefs({fmt: '16:9', view: 'auto', cam: 'kamera'}); Q.songSelect(5, 7); VV.useSel = true;
  const T0 = performance.now(); const m = await Q.vvMake({range: {a: 5, b: 8}}); const ms = Math.round(performance.now() - T0);
  return {v, ms, msAudio: m.msAudio, msVideo: m.msVideo, cuts: VV.lastRt.shots.map(s => s.v).join(','), frame: VV.prof && VV.prof.frame ? {n: VV.prof.frame.n, avg: +(VV.prof.frame.sum / VV.prof.frame.n).toFixed(2), max: +VV.prof.frame.max.toFixed(1)} : null};
}, v));
console.log(JSON.stringify({file: process.argv[2].split('/').slice(-2).join('/'), out, errs}));
await b.close();
