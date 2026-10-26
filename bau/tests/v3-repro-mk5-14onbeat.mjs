// Independent repro (MK5-14 finding): chord pressed on the HEARD beat while the transport runs -> where does the first
// arp note land, and where does ● REC store the same press? Then: live arp of the take vs. the playback arp.
import { chromium } from 'playwright';
const FILE = process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK5/index.html';
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
async function open() {
  const ctx = await b.newContext({viewport: {width: 844, height: 390}}); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await p.evaluate(async () => {
    const Q = SYNQUENZER; ensureAudio(); await new Promise(r => setTimeout(r, 1200));
    Q.setEngine(0, 'mk'); Q.selectTrack(0);
    for (let t = 0; t < S.tracks.length; t++) for (let s = 0; s < 8; s++) if (S.tracks[t].clips[s]) S.tracks[t].clips[s] = null;
  });
  return {ctx, p, errs};
}
// ---- A: live, transport running, arp on, KEY SYNC on, Up
{
  const {ctx, p, errs} = await open();
  for (const forceLat of [null, 0.02]) {
    const r = await p.evaluate(async ([forceLat]) => {
      const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)), out = [];
      for (const res of [1, 5]) for (const off of [-20, -5, 0, 10]) {
        Q.stop(); Q.panic(); ARPC.clearLog(); Q.setBpm(120);
        for (const [k, v] of Object.entries({on: 1, res, ks: 1, gate: 50, type: 0, latch: 0})) mkSetP(0, 'arp.' + k, v, false);
        Q.play(); await sl(250);
        if (forceLat != null) AU.outLat = forceLat;
        const lat = AU.outLat, B = Math.ceil(t2b(AU.ctx.currentTime) + 1.5), target = b2t(B) + lat + off / 1000;
        while (AU.ctx.currentTime < target - .03) await sl(4);
        while (AU.ctx.currentTime < target) {}
        const press = AU.ctx.currentTime;
        for (const n of [60, 64, 67]) Q.keyOn(n, .8, 'k' + n);
        const stored = t2b(press - AU.outLat);
        await sl(1200); for (const n of [60, 64, 67]) Q.keyOff(n, 'k' + n); await sl(80);
        const L = Q.arpLog(0), sb = ARPC.RES[res] * 4;
        const f = L[0];
        out.push({res: ['1/24', '1/16', '1/12', '1/8', '1/6', '1/4'][res], outLatMs: +(lat * 1000).toFixed(1), offMs: off,
          pressAfterGridMs: +((press - b2t(B)) * 1000).toFixed(1), storedBeatRel: +(stored - B).toFixed(3),
          firstArpBeatRel: f ? +(t2b(f.t) - B).toFixed(3) : null, lateSteps: f ? +((t2b(f.t) - B) / sb).toFixed(2) : null,
          firstArpAfterPressMs: f ? +((f.t - press) * 1000).toFixed(1) : null, firstNote: f ? f.note : null, n: L.length});
        Q.stop();
      }
      return out;
    }, [forceLat]);
    console.log('--- A live, outLat ' + (forceLat == null ? 'native' : 'forced ' + forceLat));
    for (const t of r) console.log(JSON.stringify(t));
  }
  console.log('errs A', errs.slice(0, 3));
  await ctx.close();
}
// ---- B: ● REC 1 bar, chord pressed when beat 2 of the take is heard; live arp (pass 1) vs playback arp (pass 2)
for (const [ks, q] of [[1, null], [1, 'off']]) {
  const {ctx, p, errs} = await open();
  const r = await p.evaluate(async ([ks, q]) => {
    const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
    for (const [k, v] of Object.entries({on: 1, res: 1, ks, gate: 50, type: 0, latch: 0})) mkSetP(0, 'arp.' + k, v, false);
    Q.setBpm(120); Q.setRecOptions(Object.assign({length: 1, countIn: false}, q ? {quantize: q} : {}));
    R.selS = 0; ARPC.clearLog(); Q.rec(); let w = 0; while (rec.state !== 'recording' && w++ < 400) await sl(10);
    const sb = rec.startBeat, B = sb + 1, target = b2t(B) + AU.outLat;
    while (AU.ctx.currentTime < target - .03) await sl(4); while (AU.ctx.currentTime < target) {}
    const press = AU.ctx.currentTime;
    for (const n of [60, 64, 67]) Q.keyOn(n, .8, 'k' + n); await sl(1100); for (const n of [60, 64, 67]) Q.keyOff(n, 'k' + n);
    await sl(2700); Q.stop(); await sl(150);
    const L = Q.arpLog(0).map(e => [+(t2b(e.t) - sb).toFixed(2), e.note]);
    const clip = Q.getClip(0, 0);
    return {state: rec.state, quant: S.settings.inQuant, outLat: AU.outLat, pressRel: +(t2b(press) - sb).toFixed(3),
      clip: clip && clip.notes.map(n => [n.n, +n.t.toFixed(3), +n.d.toFixed(2)]),
      live: L.filter(x => x[0] < 4).map(x => x.join(':')).join(' '),
      playback: L.filter(x => x[0] >= 4 && x[0] < 8).map(x => (+(x[0] - 4).toFixed(2)) + ':' + x[1]).join(' ')};
  }, [ks, q]);
  console.log('--- B REC ks=' + ks + ' quantize=' + (q || 'default'));
  console.log(JSON.stringify(r));
  console.log('errs B', errs.slice(0, 3));
  await ctx.close();
}
await b.close();
