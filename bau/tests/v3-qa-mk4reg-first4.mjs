// QA MK4: which worklet nodes are created / which messages go to the track node around the first note
import { chromium } from 'playwright';
const APP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK4/index.html';
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await b.newContext({viewport: {width: 390, height: 844}});
await ctx.addInitScript(() => {
  window.__log = []; const t0 = performance.now();
  const O = window.AudioWorkletNode;
  window.AudioWorkletNode = class extends O { constructor(c, n, o) { super(c, n, o); const id = (window.__nid = (window.__nid || 0) + 1); this.__id = id; window.__log.push([Math.round(performance.now() - t0), 'new', id, n, o && o.processorOptions && o.processorOptions.patch ? o.processorOptions.patch.eng : null, o && o.processorOptions && o.processorOptions.mk && o.processorOptions.mk.dly ? o.processorOptions.mk.dly.dep : null]);
      const pm = this.port.postMessage.bind(this.port); this.port.postMessage = (m, tr) => { const k = Object.keys(m || {}); if (!(k.length === 1 && (k[0] === 'ev'))) window.__log.push([Math.round(performance.now() - t0), 'msg', id, JSON.stringify(m).slice(0, 160)]); else window.__log.push([Math.round(performance.now() - t0), 'ev', id, JSON.stringify(m.ev).slice(0, 100)]); return pm(m, tr); };
      const dc = this.disconnect.bind(this); this.disconnect = (...a) => { window.__log.push([Math.round(performance.now() - t0), 'disconnect', id]); return dc(...a); }; } };
});
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + APP); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime, null, {timeout: 20000}); await p.waitForTimeout(800);
await p.evaluate(async () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120); Q.setEngine(0, 'mk'); await new Promise(r => setTimeout(r, 600));
  Q.mkSet(0, 'dly.time', 110); Q.mkSet(0, 'dly.dep', 127); await new Promise(r => setTimeout(r, 1000)); window.__mark = performance.now();
  window.__log.push(['---- launch']);
  Q.setClip(0, 0, {len: 1, key: {root: 9, scale: 'aeolian'}, notes: [{t: 0, d: .25, n: 57, v: .9}]}); Q.launchClip(0, 0); });
await p.waitForTimeout(3000);
const log = await p.evaluate(() => window.__log);
const i = log.findIndex(x => x[0] === '---- launch');
for (const x of log.slice(Math.max(0, i - 12))) console.log(JSON.stringify(x));
console.log('nodes before launch:', log.slice(0, i).filter(x => x[1] === 'new').map(x => JSON.stringify(x)).join(' '));
console.log(errs); await b.close();
