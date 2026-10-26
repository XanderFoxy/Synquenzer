// QA MK5-08: LATCH aus -> Stopp ≤ 1 Schritt, measured strictly from the moment LATCH goes off (no lookahead allowance)
import { chromium } from 'playwright';
const FILE = process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK5/index.html';
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await b.newContext({viewport: {width: 844, height: 390}}); const p = await ctx.newPage();
await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
const r = await p.evaluate(async () => {
  const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); ensureAudio(); await sl(1200); Q.setEngine(0, 'mk'); Q.selectTrack(0); for (let t = 0; t < 5; t++) for (let s = 0; s < 8; s++) if (S.tracks[t] && S.tracks[t].clips[s]) S.tracks[t].clips[s] = null;
  const out = [];
  for (const [bpm, res, play] of [[240, 0, false], [180, 0, false], [120, 0, false], [120, 1, false], [240, 0, true], [120, 0, true]]) for (let k = 0; k < 3; k++) {
    Q.stop(); Q.panic(); ARPC.clearLog(); Q.setBpm(bpm);
    for (const [kk, v] of Object.entries({on: 1, res, latch: 1, ks: 1, gate: 50})) mkSetP(0, 'arp.' + kk, v, false);
    if (play) Q.play(); await sl(150 + k * 37);
    for (const n of [60, 64, 67]) Q.keyOn(n, .8, 'k' + n); await sl(150); for (const n of [60, 64, 67]) Q.keyOff(n, 'k' + n); await sl(300 + k * 23);
    Q.mkSet(0, 'arp.latch', 0); const tOff = AU.ctx.currentTime; await sl(500);
    const step = ARPC.RES[res] * 4 * 60 / bpm, L = Q.arpLog(0), after = L.filter(x => x.t > tOff + 1e-4);
    out.push({bpm, res: ['1/24', '1/16'][res], play, stepMs: +(step * 1000).toFixed(1), notesAfterOff: after.length, lastAfterMs: after.length ? +((after[after.length - 1].t - tOff) * 1000).toFixed(1) : 0, beyondOneStep: after.filter(x => x.t > tOff + step + 1e-4).length, notes: after.map(x => x.note).join(',')});
    Q.stop();
  }
  return out;
});
for (const x of r) console.log(JSON.stringify(x));
await b.close();
