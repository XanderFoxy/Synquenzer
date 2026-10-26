// QA G-MK3: main-thread stall of the timbre tools while playing (SHIFT + 1 copy vs. SHIFT + 2 swap / SHIFT + 4 init)
import {open, sleep, OUT, check, done} from './v3-qa-gmk3-tl.mjs';
import {setupProject} from './v3-qa-gmk3-setup.mjs';
const T = await open(); const {p, E, errs} = T;
await setupProject(E);
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.launchScene(1); }); await sleep(1500);
await T.openEd(0);
await E(() => { window.__hb = []; let last = performance.now(); setInterval(() => { const t = performance.now(); if (t - last > 30) window.__hb.push([Math.round(t - last), Math.round(last)]); last = t; }, 5);
  const o = MKUI.timCopy; window.__tc = []; });
const shift = async () => { const pn = await T.panel(); if (!pn.shift) await T.tapMk('shift', 200); };
const measure = async (name, fn) => { await E(() => { window.__hb.length = 0; window.__t0 = performance.now(); }); await fn(); await sleep(1200); const r = await E(() => window.__hb.map(([d, t]) => [d, t - Math.round(window.__t0)])); console.log(name.padEnd(28), JSON.stringify(r)); return r; };
const res = {};
for (let k = 0; k < 3; k++) {
  res['copy' + k] = await measure('SHIFT+1 copy row tap', async () => { await shift(); await T.tapMk('n0', 500); await E(() => { window.__hb.length = 0; window.__t0 = performance.now(); }); const r = await E(() => { const r = [...document.querySelectorAll('#popLayer .mkcr')].find(r => /Layer Pad/.test(r.textContent)); const q = r.querySelector('button[data-t="1"]').getBoundingClientRect(); return {cx: q.x + q.width / 2, cy: q.y + q.height / 2}; }); await T.tap(r.cx, r.cy, 50); });
  res['copyApi' + k] = await measure('timCopy (API, no pop)', async () => { await E(() => { const s = SYNQUENZER.library().find(s => s.name === 'Split Bass'); const t0 = performance.now(); MKUI.timCopy(0, s, 0); window.__tc.push(performance.now() - t0); }); });
  res['swap' + k] = await measure('SHIFT+2 swap', async () => { await shift(); await E(() => { window.__hb.length = 0; window.__t0 = performance.now(); }); await T.tapMk('n1', 50); });
  res['init' + k] = await measure('SHIFT+4 init', async () => { await shift(); await E(() => { window.__hb.length = 0; window.__t0 = performance.now(); }); await T.tapMk('n3', 50); });
  res['pop' + k] = await measure('SHIFT+1 open pop only', async () => { await shift(); await E(() => { window.__hb.length = 0; window.__t0 = performance.now(); }); await T.tapMk('n0', 50); await sleep(600); await T.closePop(); });
}
console.log('timCopy sync ms', JSON.stringify(await E(() => window.__tc.map(x => +x.toFixed(1)))));
// profile one copy
const cdp = T.cdp; await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', {interval: 200}); await cdp.send('Profiler.start');
await shift(); await T.tapMk('n0', 500); const r = await E(() => { const r = [...document.querySelectorAll('#popLayer .mkcr')].find(r => /Layer Pad/.test(r.textContent)); const q = r.querySelector('button[data-t="1"]').getBoundingClientRect(); return {cx: q.x + q.width / 2, cy: q.y + q.height / 2}; }); await T.tap(r.cx, r.cy, 600);
const {profile} = await cdp.send('Profiler.stop');
const self = new Map(); const byId = new Map(profile.nodes.map(n => [n.id, n])); const dt = profile.timeDeltas; const cnt = new Map(); profile.samples.forEach((s, i) => cnt.set(s, (cnt.get(s) || 0) + (dt[i] || 0)));
for (const [id, us] of cnt) { const n = byId.get(id); const k = n.callFrame.functionName + ' ' + n.callFrame.lineNumber; self.set(k, (self.get(k) || 0) + us); }
console.log('top self ms', JSON.stringify([...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, v]) => [k, +(v / 1000).toFixed(1)])));
console.log('errs', JSON.stringify(errs));
await T.br.close();
