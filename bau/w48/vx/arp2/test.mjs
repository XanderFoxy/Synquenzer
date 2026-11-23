// ARP2-Test: node test.mjs <alt|neu> [Abschnitte abcde]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
const which = process.argv[2] || 'neu', ONLY = process.argv[3] || 'abcde', URL = 'http://localhost:8762/' + which + '/index.html';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const out = {};
async function page(w = 428, h = 926) {
  const p = await b.newPage({viewport: {width: w, height: h}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  p.errs = []; p.on('pageerror', e => p.errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/abspann-logo/.test(m.text()) && !/404/.test(m.text())) p.errs.push(m.text()); });
  await p.goto(URL); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 60000}); await p.waitForTimeout(1000);
  await p.evaluate(() => { window.__W = ms => new Promise(r => setTimeout(r, ms));
    window.__host = async () => { ensureAudio(); for (let k = 0; k < 100 && SynthHost.state !== 'ready' && SynthHost.state !== 'failed'; k++) await __W(100); return SynthHost.state; };
    window.__va = () => S.tracks.findIndex(t => t.kind === 'synth' && t.sound.engine === 'analog');
    window.__solo = (i, clips) => { for (const t of S.tracks) t.clips = t.clips.map(() => null); clips.forEach((c, k) => { S.tracks[i].clips[k] = c ? normClip(Object.assign({key: Object.assign({}, S.key)}, c), 'synth', S.key) : null; }); };
    window.__spy = (i, src) => { const os = window.spawnVoice, L = []; window.spawnVoice = function (ti, out, vel, t0, o) { const v = os.apply(this, arguments); if (ti === i && (!src || (o && o.src) === src)) L.push({t: t0, b: t2b(t0) - (R.cstart[i] || 0), p: out, src: o && o.src}); return v; }; return {L, off: () => { window.spawnVoice = os; }}; };
  });
  return p;
}
const run = (p, fn, a) => p.evaluate(fn, a);

if (ONLY.includes('a')) { // Key Sync aus in 3/4 (und 6/8), 4/4 als Gegenprobe
  const p = await page();
  out.a = await run(p, async () => {
    await __host(); const i = __va(), A = SYNQUENZER.arp1, r = {};
    for (const ts of ['3/4', '6/8', null]) {
      S.ts = ts; if (typeof tkBump === 'function') tkBump(); S.bpm = 240; setSongView(false);
      const BB = ts ? tsBeats(ts) : 4, st = 2 * BB;   // Akkord ab Takt 3
      __solo(i, [{len: 4, ts: ts || undefined, notes: [60, 64, 67].map(n => ({t: st, d: BB, n, v: .8}))}]);
      A.set(i, {on: 1, m: 'auf', r: 16, ks: 0, o: 1, g: 50, fig: 0});
      const sp = __spy(i, 'arp'); launchScene(0);
      const t0 = performance.now(); while (performance.now() - t0 < 9000 && !(R.playing && audBeat() > st + 1.2)) await __W(20);
      SYNQUENZER.stop(); await __W(300); sp.off();
      const L = sp.L.filter(x => x.b > st - .01 && x.b < st + 1.01).map(x => x.p);
      const bk = A.bakeNotes(i, 0).filter(n => n.t > st - .01 && n.t < st + 1.01).map(n => n.p);
      r[ts || '4/4'] = {live: L.slice(0, 4), bake: bk.slice(0, 4), clipTs: S.tracks[i].clips[0].ts || null};
      A.set(i, null);
    }
    S.ts = null; if (typeof tkBump === 'function') tkBump();
    return r;
  });
  out.a.errs = p.errs; await p.close();
}
if (ONLY.includes('b')) { // Arp aus während Tasten/Clip-Akkord halten
  const p = await page();
  out.b = await run(p, async () => {
    await __host(); const i = __va(), A = SYNQUENZER.arp1, r = {}; R.selT = i; S.bpm = 120;
    const alive = src => VOICES.filter(v => !v.dead && v.track === i && v.src === src && !(v.relT < AU.ctx.currentTime)).length;
    __solo(i, [{len: 2, notes: [60, 64, 67].map(n => ({t: 0, d: 8, n, v: .8}))}]);
    // 1) Stillstand, Live-Tasten
    A.set(i, {on: 1, m: 'auf', r: 16, o: 1, g: 50});
    [60, 64, 67].forEach((n, k) => inputDown(n, 'k' + k, .8)); await __W(400);
    A.set(i, null); await __W(120);
    r.liveStill = alive('live');
    [0, 1, 2].forEach(k => inputUp('k' + k)); await __W(300); r.liveUp = alive('live');
    // 2) Lauf, langer Clip-Akkord
    A.set(i, {on: 1, m: 'auf', r: 16, o: 1, g: 50}); setSongView(false); launchScene(0); await __W(1200);
    A.set(i, null); await __W(150);
    r.clipRun = alive('clip'); r.arpLeft = alive('arp');
    SYNQUENZER.stop(); await __W(400); r.afterStop = VOICES.filter(v => !v.dead && v.track === i && v.relT === Infinity).length;
    return r;
  });
  out.b.errs = p.errs; await p.close();
}
if (ONLY.includes('c')) { // ◆-Zustand eines Clips während einer Klangschul-Lektion
  const p = await page();
  out.c = await run(p, async () => {
    await __host(); const i = __va(), r = {}; R.selT = i; S.bpm = 160;
    const one = async lesson => {
      __solo(i, [{len: 1, notes: [{t: 0, d: 1, n: 60, v: .8}]}, {len: 1, notes: [{t: 0, d: 1, n: 64, v: .8}]}]);
      S.tracks[i].clips[1].st = {p: {cut: .12, res: .7}, eng: S.tracks[i].sound.engine};
      if (lesson) { ksLoad(); const K = KSX.api; r.les = K.lessons()[0].id; r.started = K.start(r.les, 0); await __W(400); r.ksT = KS_L ? KS_L.t : null; }
      const E = AU.synth[i]; let n = 0; const ov = E.v6a; E.v6a = function (o) { n++; return ov.apply(this, arguments); };
      setSongView(false); launchScene(0); await __W(900); launchScene(1); await __W(2200);
      SYNQUENZER.stop(); await __W(300); E.v6a = ov;
      if (lesson) KSX.api.close(); await __W(200);
      return n;
    };
    r.ohne = await one(false); r.mit = await one(true);
    return r;
  });
  out.c.errs = p.errs; await p.close();
}
if (ONLY.includes('d')) { // Band: Drum-Ziel im Lauf von aus auf DRUMS (6 Wechsel)
  const p = await page();
  out.d = await run(p, async () => {
    ensureAudio(); await __W(500); SYNQUENZER.setBpm(150); const r = {sw: []};
    const sp = SYNQUENZER.mtx3.split(); const hh = sp.find(j => S.tracks[j].dvx.v === 'hatC'); r.hh = hh;
    setSongView(false); launchScene(0); await __W(1200);
    const B = SYNQUENZER.beg1; BEG1.tgo.dr = -1; B.open(); await __W(300); beg1TgSync(true); clearLog();
    [60, 64, 67].forEach((n, k) => inputDown(n, 'bk' + k, .8)); await __W(90); [0, 1, 2].forEach(k => inputUp('bk' + k));
    await __W(2500); r.run = !!(BEG1.run && BEG1.run.id === R.runId);
    for (let k = 0; k < 6; k++) {
      await __W(37 + k * 29);
      const sw = AU.ctx.currentTime; delete BEG1.tgo.dr; beg1TgSync(true);
      await __W(700);
      const L = noteLog(4096).filter(e => !e.removed && e.time != null);
      r.sw.push({clip: L.filter(e => e.track === hh && e.src !== 'beg' && e.time > sw + .007 && e.time < sw + .6).length, beg: L.filter(e => e.src === 'beg' && e.out === 42 && e.time > sw + .007 && e.time < sw + .6).length, vor: L.filter(e => e.track === hh && e.src !== 'beg' && e.time > sw - .6 && e.time < sw).length});
      BEG1.tgo.dr = -1; beg1TgSync(true); await __W(600);
    }
    const L = noteLog(4096).filter(e => !e.removed); r.by = {}; for (const e of L) { const q = e.track + ':' + e.src; r.by[q] = (r.by[q] || 0) + 1; }
    r.doppelt = r.sw.reduce((m, x) => m + x.clip, 0);
    SYNQUENZER.stop(); await __W(300); B.close();
    return r;
  });
  out.d.errs = p.errs; await p.close();
}
if (ONLY.includes('e')) { // erste Note an der Clip-Schleifengrenze
  const p = await page();
  out.e = await run(p, async () => {
    await __host(); const i = __va(), r = {}; S.bpm = 240; setSongView(false);
    __solo(i, [{len: 1, notes: [0, 1, 2, 3.9].map((t, k) => ({t, d: .08, n: 60 + k, v: .8}))}]);
    const sp = __spy(i, 'clip'); launchScene(0); await __W(8000); SYNQUENZER.stop(); await __W(300); sp.off();
    let inv = 0; for (let k = 1; k < sp.L.length; k++) if (sp.L[k].t < sp.L[k - 1].t - 1e-6) inv++;
    r.n = sp.L.length; r.falsch = inv;
    return r;
  });
  out.e.errs = p.errs; await p.close();
}
if (ONLY.includes('f')) { // MS-2000-Arp (Platte): ARP aus während Tasten und Clip-Akkord halten
  const p = await page();
  out.f = await run(p, async () => {
    await __host(); const i = __va(), r = {}; R.selT = i; S.bpm = 120;
    const id = Object.keys(INIT_IDS).find(k => /mk|ms/i.test(k)); r.id = id; applySound(i, factorySound(INIT_IDS[id])); await __W(600);
    r.eng = S.tracks[i].sound.engine; const m = S.tracks[i].sound.p.mk; if (!m) return r;
    const alive = src => VOICES.filter(v => !v.dead && v.track === i && v.src === src && !(v.relT < AU.ctx.currentTime)).length;
    m.arp.on = 1; arpOn(i, true);
    [60, 64, 67].forEach((n, k) => inputDown(n, 'k' + k, .8)); await __W(400); r.arpVor = alive('arp');
    m.arp.on = 0; await __W(150); r.liveStill = alive('live'); [0, 1, 2].forEach(k => inputUp('k' + k)); await __W(400); r.liveUp = alive('live');
    __solo(i, [{len: 2, notes: [60, 64, 67].map(n => ({t: 0, d: 8, n, v: .8}))}]);
    m.arp.on = 1; setSongView(false); launchScene(0); await __W(1200); r.arpRun = alive('arp');
    m.arp.on = 0; await __W(150); r.clipRun = alive('clip');
    SYNQUENZER.stop(); await __W(400); r.afterStop = VOICES.filter(v => !v.dead && v.track === i && v.relT === Infinity).length;
    return r;
  });
  out.f.errs = p.errs; await p.close();
}
await b.close();
console.log(which, JSON.stringify(out));
