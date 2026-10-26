// QA FP-SONG MK5 stress: 60 s of random actions (scene switches, ARP/LATCH/mute toggles, tempo, resolution, live chords,
// ■■ per track, ⇅) on two arp tracks and one normal track; afterwards: no hanging voice (proxy or worklet), no errors.
import { chromium } from 'playwright';
const FILE = process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK5/index.html';
const SEED = +(process.argv[3] || 7), DUR = +(process.argv[4] || 60);
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await b.newContext({viewport: {width: 844, height: 390}}); const p = await ctx.newPage(); const errs = [];
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
const r = await p.evaluate(async ([SEED, DUR]) => {
  const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); ensureAudio(); await sl(1200);
  let s = SEED >>> 0; const rnd = () => { s = (Math.imul(s ^ (s >>> 15), 0x2c1b3c6d) + 0x6d2b79f5) >>> 0; return s / 4294967296; }; const pick = a => a[Math.floor(rnd() * a.length)];
  Q.setEngine(0, 'mk'); Q.setEngine(1, 'mk');
  for (let t = 0; t < 5; t++) for (let k = 0; k < 8; k++) if (S.tracks[t] && S.tracks[t].clips[k]) S.tracks[t].clips[k] = null;
  const A = (o, t) => { for (const k in o) mkSetP(t, 'arp.' + k, o[k], false); };
  A({on: 1, res: 1, gate: 100, type: 3, range: 2, ks: 1}, 0); A({on: 1, res: 0, gate: 60, type: 4, latch: 1}, 1);
  const CH = [[60, 64, 67], [57, 60, 64], [62, 65, 69], [55, 59, 62]];
  for (let sc = 0; sc < 3; sc++) for (const t of [0, 1, 2]) Q.setClip(t, sc, {len: 1 + (sc % 2), notes: CH[(sc + t) % 4].map((n, j) => ({t: (j * sc) % 3, d: 1 + 2 * ((sc + j) % 3), n: n - 12 * (t === 1), v: .8}))});
  await sl(300); Q.setBpm(130); Q.launchScene(0); Q.play();
  const acts = []; const held = new Set(); const t0 = performance.now();
  while (performance.now() - t0 < DUR * 1000) {
    const a = pick(['scene', 'scene', 'arp', 'latch', 'mute', 'bpm', 'res', 'keys', 'keys', 'keys', 'up', 'stopNow', 'xp', 'type', 'gate', 'steps', 'play']);
    try {
      if (a === 'scene') Q.launchScene(Math.floor(rnd() * 3));
      else if (a === 'arp') { const t = pick([0, 1]); Q.mkSet(t, 'arp.on', Q.mkGet(t).arp.on ? 0 : 1); }
      else if (a === 'latch') { const t = pick([0, 1]); Q.mkSet(t, 'arp.latch', Q.mkGet(t).arp.latch ? 0 : 1); }
      else if (a === 'mute') { const t = pick([0, 1, 2]); Q.setMute(t, !S.tracks[t].mute); }
      else if (a === 'bpm') Q.setBpm(pick([90, 120, 150, 200]));
      else if (a === 'res') Q.mkSet(pick([0, 1]), 'arp.res', Math.floor(rnd() * 6));
      else if (a === 'type') Q.mkSet(pick([0, 1]), 'arp.type', Math.floor(rnd() * 6));
      else if (a === 'gate') Q.mkSet(pick([0, 1]), 'arp.gate', pick([0, 30, 75, 100]));
      else if (a === 'steps') Q.mkSet(pick([0, 1]), 'arp.steps', Math.floor(rnd() * 256));
      else if (a === 'keys') { const t = pick([0, 1]); Q.selectTrack(t); for (const n of pick(CH)) { const id = 'q' + t + '_' + n; if (!held.has(id)) { Q.keyOn(n + 12, .8, id); held.add(id); } } }
      else if (a === 'up') { for (const id of [...held]) { if (rnd() < .7) { Q.keyOff(null, id); held.delete(id); } } }
      else if (a === 'stopNow') Q.stopTrackNow(pick([0, 1]));
      else if (a === 'xp') { if (R.playing) { const b = Math.ceil(t2b(AU.ctx.currentTime) + 1); xpSet(b, pick([0, 2, -3, 5])); } }
      else if (a === 'play') { if (R.playing) Q.stop(); else { Q.play(); Q.launchScene(Math.floor(rnd() * 3)); } }
      acts.push(a);
    } catch (e) { acts.push('ERR ' + a + ' ' + e.message); }
    await sl(120 + rnd() * 300);
  }
  for (const id of [...held]) Q.keyOff(null, id);
  for (const t of [0, 1, 2]) Q.setMute(t, false);
  Q.stop(); await sl(2500);
  const wk = [0, 1].map(t => { const x = mkScopeOf(t); return x ? x.voices.length : -1; }); await sl(150);
  const wk2 = [0, 1].map(t => { const x = mkScopeOf(t); return x ? x.voices.map(v => v.note) : null; });
  const vv = Q.voices().filter(v => v.track <= 2).map(v => [v.track, v.src, v.state, +(v.end - AU.ctx.currentTime).toFixed(2)]);
  return {n: acts.length, errA: acts.filter(a => a.startsWith('ERR')).slice(0, 5), counts: acts.reduce((m, a) => (m[a] = (m[a] || 0) + 1, m), {}), wk2, vv, tickErr: TICKERR.n, arp: [0, 1].map(t => Q.arpLog(t).length), info: [0, 1].map(t => Q.arpInfo(t))};
}, [SEED, DUR]);
console.log(JSON.stringify(r));
console.log('errs', errs.slice(0, 5));
await b.close();
