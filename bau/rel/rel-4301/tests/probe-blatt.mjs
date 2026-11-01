// Probe: Chor-/Takes-Blatt bei kleiner Höhe – wo liegt OK/✕, ist Platz für den Tipp außerhalb?
import {createRequire} from 'module'; const {chromium} = createRequire(import.meta.url)('playwright');
import {setup} from './g6ph-lib.mjs';
const APP = process.argv[2], W = +(process.argv[3] || 428), H = +(process.argv[4] || 650), TAG = process.argv[5] || 'neu';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await b.newContext({viewport: {width: W, height: H}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
const p = await ctx.newPage(); const errs = [];
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + APP); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 30000}); await p.waitForTimeout(800);
await p.evaluate(() => closePop());
await p.evaluate(async () => { ensureAudio(); for (let k = 0; k < 50 && !(AU.ctx && AU.ctx.state === 'running'); k++) await new Promise(r => setTimeout(r, 100)); });
await setup(p, {bars: 8, at: [4]});
console.log('stil', JSON.stringify(await p.evaluate(async () => { const Q = SYNQUENZER; const a = await Q.g6pStyle({vox: 'V1'}, '80'); const w = await Q.g6pWaitAll(null, null, {timeout: 60000}); return {a, w: w.ok, toast: document.getElementById('toast').textContent, ok: tkAudioOk()}; })));
const geo = async (nm) => p.evaluate(nm => {
  const pp = UI.pop && UI.pop.el; if (!pp) return {nm, pop: null};
  const r = pp.getBoundingClientRect(), bs = [...pp.querySelectorAll('button')].filter(x => /^(OK|✕|×)$/.test(x.textContent.trim()) || x.dataset.a === 'x' || x.dataset.pe === 'x');
  return {nm, name: UI.pop.name, vw: innerWidth, vh: innerHeight, pop: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], sh: pp.scrollHeight, ch: pp.clientHeight,
    ok: bs.map(x => { const q = x.getBoundingClientRect(); return [x.textContent.trim(), Math.round(q.top), Math.round(q.bottom), q.bottom <= innerHeight && q.top >= 0 && q.bottom <= r.bottom]; })};
}, nm);
await p.evaluate(() => SYNQUENZER.g6Sheet({vox: 'V1'})); await p.waitForTimeout(500);
console.log(JSON.stringify(await geo('chor')));
await p.screenshot({path: 'out/probe-chor-' + TAG + '-' + W + 'x' + H + '.png'});
await p.evaluate(() => closePop());
await p.evaluate(() => SYNQUENZER.tkSheet({vox: 'V1'})); await p.waitForTimeout(500);
console.log(JSON.stringify(await geo('takes')));
await p.screenshot({path: 'out/probe-takes-' + TAG + '-' + W + 'x' + H + '.png'});
console.log('errs', errs);
await b.close();
