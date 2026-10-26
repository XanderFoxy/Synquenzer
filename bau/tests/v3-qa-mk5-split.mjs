// QA FP-SONG MK5: Split + ZIEL T1, a clip chord just below SPLIT, ⇅ +2 at bar 2 moves one note over SPLIT:
// the note must not vanish (decided at the strike: arp on T1, or held normally on T2)
import { chromium } from 'playwright';
const FILE = process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK5/index.html';
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await b.newContext({viewport: {width: 844, height: 390}}); const p = await ctx.newPage(); const errs = [];
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
const r = await p.evaluate(async () => {
  const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); ensureAudio(); await sl(1200);
  Q.setEngine(0, 'mk'); for (let t = 0; t < 5; t++) for (let s = 0; s < 8; s++) if (S.tracks[t] && S.tracks[t].clips[s]) S.tracks[t].clips[s] = null;
  mkSetP(0, 'mode', 2, false); mkSetP(0, 'split', 60, false);
  for (const [k, v] of Object.entries({on: 1, tgt: 1, res: 1, gate: 50, ks: 1, type: 0, range: 1})) mkSetP(0, 'arp.' + k, v, false);
  Q.setBpm(120); Q.setClip(0, 0, {len: 2, notes: [53, 55, 59].map(n => ({t: 0, d: 8, n, v: .8}))});
  await sl(300); Q.clearLog(); ARPC.clearLog();
  Q.launchScene(0); Q.play(); await sl(700);
  xpSet(4, 2);   // ⇅ +2 from bar 2 (beat 4)
  { const A = ARPC; A.carrier(Math.max(b2t(4), AU.ctx.currentTime + .005), true); }
  await sl(3600);
  const nl = Q.noteLog(400).filter(e => e.track === 0 && e.beat < 8).map(e => [e.src, +e.beat.toFixed(2), e.out]);
  const voicesNow = [];
  Q.stop();
  return {arp: nl.filter(x => x[0] === 'arp').map(x => x.slice(1)), other: nl.filter(x => x[0] !== 'arp'), mode: Q.mkGet(0).mode, xp: XP.tl};
});
const bar = (a, b0, b1) => [...new Set(r.arp.filter(x => x[0] >= b0 && x[0] < b1).map(x => x[1]))].sort((x, y) => x - y);
console.log(JSON.stringify({mode: r.mode, xp: r.xp, bar1: bar(r.arp, 0, 4), bar2: bar(r.arp, 4, 8), bar2seq: r.arp.filter(x => x[0] >= 4).map(x => x[1]).join(','), other: r.other}));
console.log('errs', errs.slice(0, 3));
await b.close();
