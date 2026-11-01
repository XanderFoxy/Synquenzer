import { chromium } from 'playwright';
import { SONG8, PCM_FN, BASE, APP } from './sx-lib.mjs';
const SEED = `(() => { let s = 12345; Math.random = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; })();`;
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
for (const q of ['?engine=native', '']) for (const app of [BASE, APP, BASE, APP]) {
  const p = await b.newPage({viewport: {width: 428, height: 926}});
  await p.addInitScript(SEED);
  await p.goto('file://' + app + q); await p.waitForTimeout(1500); await p.mouse.click(5, 300);
  await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 10000}).catch(() => {});
  await p.waitForTimeout(800);
  await p.evaluate(s => SYNQUENZER.setSong(s), SONG8); await p.evaluate(PCM_FN);
  const x = await p.evaluate(async () => { await SYNQUENZER.vvRender(); return Object.assign(__sxHash(), {log: JSON.stringify(VV.last.log).length}); });
  console.log(q, app.split('/').slice(-2).join('/'), JSON.stringify(x));
  await p.close();
}
await b.close();
