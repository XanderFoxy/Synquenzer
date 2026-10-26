// QA FP-SONG MK5: a chord pressed in time with what is HEARD (beat + output latency, as ● REC / FANG compensate):
// where does the first arp note land (transport running, KEY SYNC on)? And where does ● REC put the same chord?
import { chromium } from 'playwright';
const FILE = process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK5/index.html';
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await b.newContext({viewport: {width: 844, height: 390}}); const p = await ctx.newPage(); const errs = [];
p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
const r = await p.evaluate(async () => {
  const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); ensureAudio(); await sl(1200);
  Q.setEngine(0, 'mk'); Q.selectTrack(0); for (let t = 0; t < 5; t++) for (let s = 0; s < 8; s++) if (S.tracks[t] && S.tracks[t].clips[s]) S.tracks[t].clips[s] = null;
  const out = {outLat: AU.outLat, devLat: AU.devLat, graphLat: AU.graphLat, LIVE_LEAD, trials: []};
  for (const res of [1, 5]) for (const dms of [-25, -12, -5, 0, 8, 20]) {
    Q.stop(); Q.panic(); ARPC.clearLog(); Q.clearLog(); Q.setBpm(120);
    for (const [k, v] of Object.entries({on: 1, res, ks: 1, gate: 50, type: 0})) mkSetP(0, 'arp.' + k, v, false);
    Q.play(); await sl(300);
    const B = Math.ceil(t2b(AU.ctx.currentTime) + 1.5);           // a beat ahead
    const target = b2t(B) + AU.outLat + dms / 1000;               // the moment the beat is HEARD (+ the player's offset)
    while (AU.ctx.currentTime < target - .03) await sl(5);
    while (AU.ctx.currentTime < target) {}
    const tp = AU.ctx.currentTime;
    for (const n of [60, 64, 67]) Q.keyOn(n, .8, 'k' + n);
    const heardB = t2b(tp - AU.outLat);                           // what ● REC / FANG store for this press
    await sl(1300); for (const n of [60, 64, 67]) Q.keyOff(n, 'k' + n); await sl(100);
    const L = Q.noteLog(200).filter(e => e.src === 'arp'), sb = ARPC.RES[res] * 4;
    const first = L.length ? L[0].beat : null;
    out.trials.push({res: ['1/24', '1/16', '1/12', '1/8', '1/6', '1/4'][res], playerMs: dms, heardOffMs: +((heardB - B) * 500).toFixed(1), firstArpBeat: first, beat: B, lateSteps: first == null ? null : +((first - B) / sb).toFixed(2), firstNote: L.length ? L[0].out : null});
    Q.stop();
  }
  return out;
});
console.log(JSON.stringify({outLat: r.outLat, devLat: r.devLat, graphLat: r.graphLat, LIVE_LEAD: r.LIVE_LEAD}));
for (const t of r.trials) console.log(JSON.stringify(t));
console.log('errs', errs.slice(0, 3));
await b.close();
