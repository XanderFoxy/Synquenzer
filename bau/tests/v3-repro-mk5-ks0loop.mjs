// Independent repro: MS 2000 arp at INIT values (KEY SYNC off) through a looping chord clip; compare arp notes per pass.
// Usage: node v3-repro-mk5-ks0loop.mjs [index.html]
import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK5/index.html');
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (const [bars, notes, ks] of [[4, [60, 64, 67], null], [1, [60, 64, 67], null], [4, [60, 64, 67, 71], null], [4, [60, 64, 67], 1]]) {
  const ctx = await b.newContext({viewport: {width: 844, height: 390}}); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  const r = await p.evaluate(async ([bars, notes, ks]) => {
    const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); ensureAudio(); await sl(1200);
    Q.setEngine(0, 'mk'); Q.selectTrack(0);
    for (let t = 0; t < S.tracks.length; t++) for (let s = 0; s < 8; s++) if (S.tracks[t].clips[s]) S.tracks[t].clips[s] = null;
    // fresh INIT MS 2000 sound on track 0
    sndOf(0).p.mk = SQStore.normalizeSound(factorySound(INIT_IDS.mk)).p.mk; syncEngine(0, true);
    const initArp = JSON.parse(JSON.stringify(sndOf(0).p.mk.arp));
    mkSetP(0, 'arp.on', 1, false); if (ks != null) mkSetP(0, 'arp.ks', ks, false);
    Q.stop(); Q.panic(); ARPC.clearLog(); clearLog(); Q.setBpm(240);
    Q.setClip(0, 0, {len: bars, notes: notes.map(n => ({t: 0, d: bars * 4, n, v: .8}))});
    Q.launchScene(0); Q.play();
    const passSec = bars * 4 * 60 / 240; await sl((passSec * 3 + .3) * 1000); Q.stop(); await sl(150);
    const nl = Q.noteLog(5000).filter(e => e.src === 'arp' && e.track === 0);
    const per = bars * 16, byPass = [[], [], []];
    for (const e of nl) { const k = Math.round(e.beat / .25); const ps = Math.floor(k / per); if (ps < 3) byPass[ps].push(e.out); }
    return {initArp, arp: sndOf(0).p.mk.arp, counts: byPass.map(x => x.length), first8: byPass.map(x => x.slice(0, 8).join(',')),
      same12: byPass[0].join() === byPass[1].join(), same23: byPass[1].join() === byPass[2].join()};
  }, [bars, notes, ks]);
  console.log(JSON.stringify({bars, notes, ks: ks == null ? 'INIT' : ks, ...r, errs: errs.slice(0, 3)}));
  await ctx.close();
}
await b.close();
