// K2 in the app: the limiter at level 3 caps poly to 4 and sends polyH (the stored poly) for held notes; back at level 0 polyH = 0
import { chromium } from 'playwright';
const FILE = process.argv[2] || new URL('../index.html', import.meta.url).pathname;
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']}); const p = await b.newPage({viewport: {width: 390, height: 844}});
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + FILE); await p.waitForTimeout(2000);
await p.mouse.click(200, 400); await p.waitForTimeout(300);
const r = await p.evaluate(async () => { const S = window.SYNQUENZER; S.keyOn && S.keyOn(60); await new Promise(r => setTimeout(r, 1500)); S.keyOff && S.keyOff(60);
  const st = () => { const E = AU.synth[1]; return E ? {poly: E.sent.poly, polyH: E.sent.polyH, lvl: LIM.level} : {none: true, state: SynthHost.state}; };
  const a = st(); S.cpuInject(.9, 2); const b_ = st(); LIM.level = 0; applyLimiter(); const c = st();
  return {a, b: b_, c}; });
console.log(JSON.stringify(r), errs.length ? errs : 'no errors');
const pass = r.b.poly === 4 && r.b.polyH === 8 && r.c.polyH === 0 && r.c.poly === 8;
console.log(pass ? 'OK   K2-02 App: Begrenzer Stufe 3 → poly 4 + polyH 8; zurück → polyH 0' : 'FAIL K2-02 App');
await b.close();
