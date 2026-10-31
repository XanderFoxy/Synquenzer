// QA musiker: warum setzt das neu geplante Stück spät ein? tkStartSrc / vpLim / start() zeitlich vermessen
import {open, sleep, APP} from './n4-vs-p-qa-h.mjs';
const FILE = process.argv[2] || APP;
const H = await open({file: FILE}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject({init: true}); SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(120); });
await sleep(300);
const sr = await p.evaluate(() => window.__ctx.sampleRate), N = 8 * sr, y = new Float32Array(N);
for (let i = 0; i < N; i++) y[i] = 0.02 * Math.sin(2 * Math.PI * 1000 * i / sr);
for (let k = 0; k < 8; k++) { const i0 = Math.round((0.75 + k) * sr); for (let j = 0; j < 176; j++) y[i0 + j] += 0.95 * Math.sin(Math.PI * j / 176) * Math.sin(2 * Math.PI * 900 * j / sr); }
const pcm = Array.from(y, v => Math.max(-32768, Math.min(32767, Math.round(v * 32767))));
await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 4}), [pcm, sr]);
await p.evaluate(() => { if (SYNQUENZER.vpInfo) { SYNQUENZER.vpInfo(); return SYNQUENZER.vpWait(); } });
await p.evaluate(() => {
  const c = window.__ctx; window.__log = [];
  const o0 = window.tkStartSrc; window.tkStartSrc = function (o) { const t0 = performance.now(), ct0 = c.currentTime, w = o.when; const r = o0(o); window.__log.push({ms: +(performance.now() - t0).toFixed(2), whenIn: +(w - ct0).toFixed(4), whenUsed: r ? +(r.start - ct0).toFixed(4) : null, lim: !!(r && r.lim), ctAfter: +(c.currentTime - ct0).toFixed(4)}); return r; };
  if (window.vpLim) { const l0 = window.vpLim; window.vpLim = function (...a) { const t0 = performance.now(); const r = l0(...a); window.__log.push({vpLimMs: +(performance.now() - t0).toFixed(2), segsUsed: r ? 1 : 0}); return r; }; }
});
for (let run = 0; run < 3; run++) {
  await p.evaluate(() => { window.__log = []; SYNQUENZER.launchScene(0); });
  await sleep(1700 + run * 300);
  await p.evaluate(() => { window.__log.push('— Neu-Planung'); const t0 = performance.now(); tkTrackResync(SYNQUENZER.tkInfo().stimme); window.__log.push({resyncMs: +(performance.now() - t0).toFixed(2)}); });
  await sleep(500);
  console.log(await p.evaluate(() => SYNQUENZER.version), 'Lauf', run, JSON.stringify(await p.evaluate(() => window.__log)));
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(400);
}
await H.br.close();
