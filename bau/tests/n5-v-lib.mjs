import { chromium } from 'playwright';
export const APP = process.env.APP || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/n5-br-V/index.html';
export async function open(o = {}) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required'].concat(o.args || [])});
  const p = await b.newPage({viewport: {width: o.w || 390, height: o.h || 844}, deviceScaleFactor: o.dpr || 1, hasTouch: !!o.touch, isMobile: !!o.touch});
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + APP + (o.q || '')); await p.waitForTimeout(o.wait || 1500);
  await p.mouse.click(5, 300); // unlock audio
  await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 10000}).catch(() => {});
  await p.waitForTimeout(300);
  return {b, p, errs};
}
// a test song: 8 bars, parts, carrier, melody, lanes over the demo clips
export const SONG8 = {bars: 8, lanes: [[{bar: 0, slot: 0}, {bar: 4, slot: 1}], [{bar: 0, slot: 0}], [{bar: 2, slot: 0}, {bar: 6, slot: -1}], [], [{bar: 0, slot: 0}, {bar: 4, slot: 1}], []],
  carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 4, name: 'Strophe'}, {id: 'm2', a: 4, len: 4, name: 'Refrain'}]};
