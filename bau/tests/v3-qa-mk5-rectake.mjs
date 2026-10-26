// QA MK5-14 realistic: ● REC (fixed 1 bar), the chord pressed when beat 2 of the take is HEARD; live arp vs playback arp
import { chromium } from 'playwright';
const FILE = process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK5/index.html';
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (const [ks, q] of [[1, 'off'], [0, 'off'], [1, null], [0, null]]) {
  const ctx = await b.newContext({viewport: {width: 844, height: 390}}); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  const r = await p.evaluate(async ([ks, q]) => {
    const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); ensureAudio(); await sl(1200);
    Q.setEngine(0, 'mk'); Q.selectTrack(0); for (let t = 0; t < 5; t++) for (let s = 0; s < 8; s++) if (S.tracks[t] && S.tracks[t].clips[s]) S.tracks[t].clips[s] = null;
    for (const [k, v] of Object.entries({on: 1, res: 1, ks, gate: 50, type: 0})) mkSetP(0, 'arp.' + k, v, false);
    Q.setBpm(120); Q.setRecOptions(Object.assign({length: 1, countIn: false}, q ? {quantize: q} : {}));
    R.selS = 0; Q.rec(); while (rec.state !== 'recording') await sl(10);
    const sb = rec.startBeat, B = sb + 1, target = b2t(B) + AU.outLat;
    while (AU.ctx.currentTime < target - .03) await sl(5); while (AU.ctx.currentTime < target) {}
    for (const n of [60, 64, 67]) Q.keyOn(n, .8, 'k' + n); await sl(1100); for (const n of [60, 64, 67]) Q.keyOff(n, 'k' + n);
    await sl(2600); const st = rec.state; Q.stop(); await sl(200);
    const L = Q.noteLog(600).filter(e => e.src === 'arp' && e.track === 0).map(e => [+(e.beat - sb).toFixed(2), e.out]);
    const clip = Q.getClip(0, 0);
    return {q: S.settings.inQuant, sb, st, clip: clip && clip.notes.map(n => [n.n, +n.t.toFixed(3), +n.d.toFixed(2)]), pass1: L.filter(x => x[0] < 4), pass2: L.filter(x => x[0] >= 4 && x[0] < 8).map(x => [+(x[0] - 4).toFixed(2), x[1]])};
  }, [ks, q]);
  console.log(JSON.stringify({ks, quant: r.q, clip: r.clip, live: r.pass1.map(x => x.join(':')).join(' '), playback: r.pass2.map(x => x.join(':')).join(' ')}));
  await ctx.close();
}
await b.close();
