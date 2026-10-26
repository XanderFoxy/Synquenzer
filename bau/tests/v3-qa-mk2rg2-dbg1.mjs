import { open, APP } from './v3-mk0reg-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-base-A.html';
for (const [name, file] of [['base', BASE], ['new', APP]]) for (const mk of [false, true]) {
const {b, p, errs} = await open({width: 390, height: 844}, file);
const waitBeat = (x, to = 30000) => p.waitForFunction(x => window.SYNQUENZER.runtime().beat > x, x, {timeout: to, polling: 20});
await p.evaluate(async (mk) => { const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
  Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'}, N = (t, n, d) => ({t, d: d || .8, n, v: .8});
  for (let t = 0; t < 4; t++) { Q.setClip(t, 0, {len: 1, key: K, notes: [N(0, 57 + t * 2), N(1, 60 + t * 2), N(2, 64 + t * 2), N(3, 60 + t * 2)]}); }
  if (mk) { for (let t = 0; t < 4; t++) Q.setEngine(t, 'mk'); await sl(300); }
  Q.clearLog(); Q.launchScene(0); }, mk);
await waitBeat(+process.argv[2] || 4.5);
const q = await p.evaluate(() => { window.SYNQUENZER.tapSlot(0, 0); const r = window.SYNQUENZER.runtime(); return {beat: r.beat, stopQ: r.stopQ, queued: r.queued}; });
await waitBeat(9.5);
const log = await p.evaluate(() => window.SYNQUENZER.noteLog(4000).filter(n => n.track === 0 && n.beat != null).map(n => n.beat.toFixed(2)));
console.log(name, 'mk', mk, JSON.stringify(q), log.join(' '), errs);
await b.close(); }
