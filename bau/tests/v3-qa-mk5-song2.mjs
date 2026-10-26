// QA FP-SONG for MK5 (2): mute + live keys, parts switch, FANG with arp, overdub, save/load (storage) round trip.
import { chromium } from 'playwright';
const FILE = process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK5/index.html';
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

// mute + live keys: AM without arp vs AM with arp (stopped and running)
await T('mute-live', async page => {
  const r = await page.evaluate(async () => {
    const res = {};
    for (const arp of [0, 1]) for (const run of [false, true]) {
      H.Q.stop(); H.Q.panic(); ARPC.clearLog(); H.Q.clearLog(); H.arp({on: arp, res: 1}); H.Q.setMute(0, true);
      if (run) H.Q.play(); await H.sl(200);
      H.keys([60, 64, 67]); await H.sl(600);
      const v = H.Q.voices().filter(x => x.track === 0 && !x.dead).length;
      H.up([60, 64, 67]); await H.sl(150);
      res[(arp ? 'arp' : 'noArp') + (run ? '-play' : '-stop')] = {voicesWhileHeld: v, notes: H.Q.noteLog(200).filter(e => e.track === 0).length};
      H.Q.setMute(0, false);
    }
    H.Q.stop();
    return res;
  });
  out('mute-live', r);
});

// parts: two parts, switch between them while playing; notes over the bar line, hanging voices
await T('parts', async page => {
  const r = await page.evaluate(async () => {
    H.Q.stop(); H.Q.panic(); ARPC.clearLog(); H.Q.setBpm(180); H.arp({on: 1, res: 1, gate: 100, ks: 1, type: 0, range: 1});
    H.Q.setClip(0, 0, {len: 1, notes: [60, 64, 67].map(n => ({t: 0, d: 4, n, v: .8}))});
    H.Q.setClip(0, 1, {len: 1, notes: [62, 65, 69].map(n => ({t: 0, d: 4, n, v: .8}))});
    await H.sl(300);
    H.Q.launchScene(0); H.Q.play(); await H.sl(700);
    const pa = H.Q.partFromNow(0, 'A'); H.Q.launchScene(1); await H.sl(1600);
    const pb = H.Q.partFromNow(1, 'B');
    const parts = H.Q.parts().map(p => p && p.name);
    H.Q.clearLog(); ARPC.clearLog(0);
    H.Q.launchPart(0); await H.sl(2000); H.Q.launchPart(1); await H.sl(2000); H.Q.launchPart(0); await H.sl(1500);
    const nl = H.Q.noteLog(600).filter(e => e.src === 'arp' && e.track === 0).map(e => [+e.beat.toFixed(3), e.out, +(e.dur || 0).toFixed(3)]);
    const pi = H.Q.partInfo();
    H.Q.stop(); await H.sl(700);
    const live = VOICES.filter(v => !v.dead && v.track === 0 && v.end > AU.ctx.currentTime).length;
    return {pa: !!pa, pb: !!pb, parts, nl, live, wk: AU.synth[0] && AU.synth[0].info ? AU.synth[0].info() : null};
  });
  // per bar: which chord tones; a bar must hold only one chord's tones
  const bars = {}; for (const [b, n] of r.nl) { const k = Math.floor(b / 4 + 1e-6); (bars[k] = bars[k] || new Set()).add(n); }
  const mixed = Object.entries(bars).filter(([, s]) => { const a = [...s]; return !(a.every(n => [60, 64, 67].includes(n)) || a.every(n => [62, 65, 69].includes(n))); }).map(([k, s]) => k + ':' + [...s].join('/'));
  out('parts', {pa: r.pa, pb: r.pb, parts: r.parts, n: r.nl.length, mixedBars: mixed, bars: Object.fromEntries(Object.entries(bars).map(([k, s]) => [k, [...s].join('/')])), live: r.live});
});

// FANG with arp: the captured phrase = the keys (not the arp notes)
await T('fang', async page => {
  const r = await page.evaluate(async () => {
    H.Q.stop(); H.Q.panic(); H.Q.setBpm(120); H.arp({on: 1, res: 1, gate: 50, ks: 1});
    H.Q.play(); await H.sl(400);
    H.keys([60, 64, 67]); await H.sl(900); H.up([60, 64, 67]); await H.sl(200); H.keys([62, 65, 69]); await H.sl(900); H.up([62, 65, 69]); await H.sl(400);
    const cap = CAP.buf.filter(o => o.track === 0).map(o => [o.n, +o.b.toFixed(2), +o.d.toFixed(2)]);
    return {cap};
  });
  out('fang', r);
});

// save to storage and load back (the real path), arp fields + the arp still plays
await T('saveload', async page => {
  const r = await page.evaluate(async () => {
    const want = {on: 1, latch: 1, type: 4, range: 2, gate: 33, tgt: 1, ks: 1, res: 5, swing: 17, last: 3, steps: 5, tempo: 99};
    for (const k in want) mkSetP(0, 'arp.' + k, want[k], false);
    markDirty(); await H.Q.save(); await H.sl(500);
    const before = JSON.stringify(H.Q.mkGet(0).arp);
    return {before, id: S.id};
  });
  await page.reload(); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  const r2 = await page.evaluate(async () => { await new Promise(r => setTimeout(r, 500)); const s = sndOf(0); return {after: s && s.p && s.p.mk ? JSON.stringify(s.p.mk.arp) : null, eng: s && s.engine, id: S.id}; });
  out('saveload', {r, r2, same: r.before === r2.after});
});
console.log('done');
await browser.close();
