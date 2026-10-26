// QA FP-SONG for MK5 (independent): loops with INIT settings, transport start with a held chord, song MIDI, REC/FANG with arp,
// part switch, clips invariants, hanging notes. Usage: node v3-qa-mk5-song.mjs [index.html]  (ONLY=<regex>)
import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK5/index.html');
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const J = x => JSON.stringify(x);
const out = (id, info) => console.log('== ' + id + ' :: ' + (typeof info === 'string' ? info : J(info)));
async function open() {
  const ctx = await browser.newContext({viewport: {width: 844, height: 390}});
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(async () => {
    const Q = SYNQUENZER; ensureAudio(); await new Promise(r => setTimeout(r, 1200));
    Q.setEngine(0, 'mk');
    for (let t = 0; t < 4; t++) for (let s = 0; s < 8; s++) if (S.tracks[t].clips[s]) S.tracks[t].clips[s] = null;
    Q.selectTrack(0);
    const sl = ms => new Promise(r => setTimeout(r, ms));
    window.H = {sl, Q,
      arp(o, t) { for (const k in o) mkSetP(t || 0, 'arp.' + k, o[k], false); },
      keys(ns, vel) { const t = AU.ctx.currentTime, p0 = performance.now(); while (AU.ctx.currentTime === t && performance.now() - p0 < 40) {} for (const n of ns) Q.keyOn(n, vel || .8, 'k' + n); return AU.ctx.currentTime; },
      up(ns) { for (const n of ns) Q.keyOff(n, 'k' + n); },
      log: t => Q.arpLog(t || 0),
    };
  });
  return {ctx, page, errs};
}
const T = async (id, f) => { if (ONLY && !ONLY.test(id)) return; const o = await open(); try { await f(o.page, o); } catch (e) { out(id, 'EXC ' + String(e.stack || e).slice(0, 500)); } out(id + ' console', o.errs.slice(0, 4)); await o.ctx.close(); };

// 1. MK5-13 with INIT arp settings (KEY SYNC off = INIT, Up, 1 octave, 1/16): a 1-bar and a 4-bar C-E-G clip, two passes
await T('loop-INIT', async page => {
  const r = await page.evaluate(async () => {
    const res = {};
    for (const bars of [1, 4]) {
      H.Q.stop(); H.Q.panic(); ARPC.clearLog(); H.Q.setBpm(240);
      H.arp({on: 1});
      H.Q.setClip(0, 0, {len: bars, key: {root: 0, scale: 'ionian'}, notes: [60, 64, 67].map(n => ({t: 0, d: bars * 4, n, v: .8}))});
      const a = JSON.parse(JSON.stringify(SQMK ? sndOf(0).p.mk.arp : {}));
      H.Q.launchScene(0); H.Q.play();
      const passSec = bars * 4 * 60 / 240; await H.sl((passSec * 2 + .4) * 1000 + 300); H.Q.stop(); await H.sl(100);
      const L = H.log(0), nl = H.Q.noteLog(2000).filter(e => e.src === 'arp');
      const per = bars * 4 / .25;
      const byPass = [[], []];
      for (const e of nl) { const k = Math.round(e.beat / .25); const p = Math.floor(k / per); if (p < 2) byPass[p].push(e.out); }
      res[bars] = {arp: a, n: L.length, p1: byPass[0].join(','), p2: byPass[1].join(','), same: byPass[0].join() === byPass[1].join(), len: [byPass[0].length, byPass[1].length]};
    }
    return res;
  });
  out('loop-INIT', r);
});

// 2. transport start while a live chord is held (free grid -> song grid): gaps / doubles at the switch
await T('start-held', async page => {
  const r = await page.evaluate(async () => {
    const res = [];
    for (const delay of [190, 310, 455]) {
      H.Q.stop(); H.Q.panic(); ARPC.clearLog(); H.Q.setBpm(120); H.arp({on: 1, res: 1, gate: 50, ks: 1});
      H.keys([60, 64, 67]); await H.sl(delay); const tPlay = AU.ctx.currentTime; H.Q.play(); await H.sl(900); H.up([60, 64, 67]); await H.sl(100);
      const L = H.log(0); const dts = L.slice(1).map((x, k) => +((x.t - L[k].t) * 1000).toFixed(1));
      res.push({delay, tPlay: +tPlay.toFixed(3), times: L.map(x => +x.t.toFixed(3)).slice(0, 14), notes: L.map(x => x.note).slice(0, 14), dts: dts.slice(0, 14), minDt: Math.min(...dts), maxDt: Math.max(...dts)});
      H.Q.stop();
    }
    return res;
  });
  out('start-held', r);
});

// 3. ● REC with arp: clip = keys, one undo; noteLog during REC; MIDI log vs arpLog; song MIDI export clip notes only
await T('rec', async page => {
  const r = await page.evaluate(async () => {
    H.Q.stop(); H.Q.panic(); ARPC.clearLog(); H.Q.setBpm(120); H.arp({on: 1, res: 1, gate: 50, ks: 1});
    if (H.Q.setRecOptions) H.Q.setRecOptions({countIn: false, bars: 1});
    H.Q.selectSlot && H.Q.selectSlot(0, 1);
    const u0 = H.Q.undoInfo().n;
    H.Q.rec(); await H.sl(300);
    const st1 = H.Q.state().runtime.rec;
    H.keys([60, 64, 67]); await H.sl(700); H.up([60, 64, 67]); await H.sl(300); H.keys([62, 65, 69]); await H.sl(600); H.up([62, 65, 69]);
    await H.sl(3500);
    const st2 = H.Q.state().runtime.rec;
    H.Q.stop(); await H.sl(200);
    const clips = [0, 1, 2].map(s => H.Q.getClip(0, s));
    return {u: H.Q.undoInfo().n - u0, top: H.Q.undoInfo().top, st1, st2: st2 && st2.state, clips: clips.map(c => c && {len: c.len, notes: c.notes.map(n => [n.t.toFixed(2), n.n, n.d.toFixed(2)])})};
  });
  out('rec', r);
});

// 4. Clip invariants + hanging notes at a scene switch and at a part switch, two arp tracks, latch on one
await T('scene-part', async page => {
  const r = await page.evaluate(async () => {
    H.Q.setEngine(1, 'mk');
    H.Q.stop(); H.Q.panic(); ARPC.clearLog(); H.Q.setBpm(160);
    H.arp({on: 1, res: 0, gate: 100, type: 3, range: 2}, 0); H.arp({on: 1, res: 2, gate: 80, latch: 1, type: 4}, 1);
    H.Q.setClip(0, 0, {len: 1, notes: [60, 64, 67].map(n => ({t: 0, d: 4, n, v: .8}))});
    H.Q.setClip(0, 1, {len: 1, notes: [57, 60, 64].map(n => ({t: 0, d: 2, n, v: .8}))});
    H.Q.setClip(1, 0, {len: 2, notes: [48, 55].map(n => ({t: 0, d: 1, n, v: .8}))});
    H.Q.setClip(1, 1, {len: 1, notes: [50, 57].map(n => ({t: 2, d: 1, n, v: .8}))});
    const c0 = JSON.stringify(S.tracks.map(t => t.clips));
    H.Q.launchScene(0); H.Q.play(); await H.sl(2400); H.Q.launchScene(1); await H.sl(3000);
    const v1 = H.Q.voices().filter(v => v.src === 'arp').map(v => [v.track, v.out]);
    H.Q.launchScene(0); await H.sl(2200);
    const same = JSON.stringify(S.tracks.map(t => t.clips)) === c0;
    // notes of track 0 that span the scene switch bar lines
    const nl = H.Q.noteLog(3000).filter(e => e.src === 'arp');
    H.Q.stop(); await H.sl(600);
    const after = H.Q.voices().filter(v => v.track <= 1);
    const wk = [0, 1].map(i => AU.synth[i] && AU.synth[i].info ? AU.synth[i].info() : null);
    return {same, n: nl.length, t1: nl.filter(e => e.track === 1).slice(0, 40).map(e => [+e.beat.toFixed(2), e.out]), voicesAfterStop: after.length, v1};
  });
  out('scene-part', r);
});

console.log('done');
await browser.close();
