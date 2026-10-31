// ND4-03 / ND4-04 / ND4-05 mit der Platzhalter-Engine (ND-STUB, TONE A1): Zeit, Lanes, Stopp/Panik, Abbruch geplanter Schläge.
// Offline über SYNQUENZER.mdRender, live über Transport + Hook auf MDX.node.port.postMessage + AnalyserNode am Engine-Ausgang.
// Aufruf: NODE_PATH=/opt/node-tools/node_modules node md4-int.mjs <neu.html>
import {createRequire} from 'module';
const {chromium} = createRequire(import.meta.url)('playwright');
const NEW = process.argv[2] || new URL('../index.html', import.meta.url).pathname;
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const checks = {}; const ok = (k, v, info) => { checks[k] = info === undefined ? !!v : {ok: !!v, ...info}; };
const p = await b.newPage({viewport: {width: 390, height: 844}}); const errs = [];
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + NEW); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version, null, {timeout: 30000}); await p.waitForTimeout(800);

// ---------- Offline (mdRender) ----------
const off = await p.evaluate(async () => {
  const Q = SYNQUENZER, sr = 48000;
  Q.newProject(); await new Promise(r => setTimeout(r, 200));
  Q.setPadSource('kick', 'md'); Q.setPadSource('snare', 'md');
  const setK = (id, o) => soundEdit(DRUM_T, 't', () => { Object.assign(drumSnd().p.slots[id], o); drumChanged(id); });
  const pk = (x, a, b2) => { let m = 0; for (let i = a; i < b2; i++) m = Math.max(m, Math.abs(x[i])); return m; };
  const db = (a, b2) => 20 * Math.log10(a / b2);
  const out = {};
  // ND4-03 Zeit: 16tel bei 120 BPM (0,125 s) mit krummen Versätzen; kurzer Ton (mTdec 0: T60 4 ms), damit jeder Einsatz frei steht
  setK('kick', {mTdec: 0, mBnd: 0, mDm: 'E1'});
  const ts = []; for (let k = 0; k < 16; k++) ts.push(0.05 + k * 0.125 + (k % 5) * 0.0000137 + (k % 3) / sr / 3);
  const r1 = await Q.mdRender(ts.map(t => [t, 'kick', 1]), {sec: 2.2, sr});
  out.onsets = ts.map(t => {
    const want = Math.round(t * sr); let i = want - 40; while (i < want + 200 && Math.abs(r1.l[i]) < 1e-9) i++;
    return i - 1 - want;     // Sinus beginnt mit Phase 0: erster Wert 0, erster ≠ 0 eine Stelle später
  });
  // gegen ein Drum-Pad auf demselben Schritt (DrumSynth offline, gleicher Zeitpunkt): Einsatz ± 1 ms
  {
    // Drum-Stimme ohne Drive (die WaveShaper-Kurve gibt bei 0 einen winzigen Gleichanteil)
    const t = ts[5], oc = new OfflineAudioContext(1, Math.round(1 * sr), sr), Bf = DrumSynth.buildBuffers(oc);
    DrumSynth.hit(oc, Bf, oc.destination, Object.assign({}, slotParams('rim'), {drv: 0}), 1, t, {accent: 0});
    const d = (await oc.startRendering()).getChannelData(0); let i = 0; while (i < d.length && Math.abs(d[i]) < 1e-9) i++;
    out.drumOnsetMs = ((i - 1) / sr - t) * 1000;
    out.mdOnsetMs = ((Math.round(t * sr) + out.onsets[5]) / sr - t) * 1000;
  }
  // ND4-04 Lanes – VEL (Li), Akzent, TUNE, DECAY
  setK('kick', {mTdec: 30, mBnd: 0, mDm: 'E1', mDcrv: 'Li', mPit: 45});
  const one = async (v, acc, tune, dec, sec) => (await Q.mdRender([[0.01, 'kick', v, acc, tune, dec]], {sec: sec || 0.4, sr})).l;
  const a1 = await one(1), a5 = await one(0.5), aa = await one(0.8, accentAmt(drumKit().accent)), a8 = await one(0.8);
  const W = [480, 480 + 9600];
  out.velDb = db(pk(a5, ...W), pk(a1, ...W));
  out.accDb = db(pk(aa, ...W), pk(a8, ...W)); out.accentAmt = accentAmt(drumKit().accent);
  // Frequenz über Nulldurchgänge (aufwärts, linear interpoliert) zwischen 30 und 230 ms
  const freq = x => { const c = []; for (let i = Math.round(0.04 * sr); i < Math.round(0.24 * sr); i++) if (x[i - 1] < 0 && x[i] >= 0) c.push(i - 1 + (-x[i - 1]) / (x[i] - x[i - 1])); return (c.length - 1) / ((c[c.length - 1] - c[0]) / sr); };
  const t0 = await one(1, 0, 0), t12 = await one(1, 0, 12);
  out.f0 = freq(t0); out.f12 = freq(t12); out.tuneCent = 1200 * Math.log2(out.f12 / out.f0);
  // T60 über die Hüllkurve: Spitzen je 10-ms-Fenster, lineare Regression dB über Zeit zwischen 20 ms und 300 ms
  const t60 = x => { const P = []; for (let s = 0.02; s < 0.3; s += 0.01) { const a = Math.round(s * sr), m = pk(x, a, a + 480); if (m > 1e-6) P.push([s, 20 * Math.log10(m)]); }
    const n = P.length, mx = P.reduce((s, q) => s + q[0], 0) / n, my = P.reduce((s, q) => s + q[1], 0) / n; let num = 0, den = 0; for (const [x2, y] of P) { num += (x2 - mx) * (y - my); den += (x2 - mx) ** 2; } return -60 / (num / den); };
  const d1 = await one(1, 0, 0, 1, 0.5), d2 = await one(1, 0, 0, 2, 0.5);
  out.t60a = t60(d1); out.t60b = t60(d2); out.decRatio = out.t60b / out.t60a;
  out.t60Soll = 0.004 * Math.pow(2500, 30 / 50);
  return out;
});
const onsetBad = off.onsets.filter(d => Math.abs(d) > 1);
ok('ND4-03_offline_onset_pm1_sample', !onsetBad.length, {onsets: off.onsets});
ok('ND4-03_vs_drum_pad_pm1ms', Math.abs(off.mdOnsetMs - off.drumOnsetMs) <= 1, {md: +off.mdOnsetMs.toFixed(3), drum: +off.drumOnsetMs.toFixed(3)});
ok('ND4-04_vel_half_m6dB', Math.abs(off.velDb + 6.02) <= 0.3, {dB: +off.velDb.toFixed(2)});
ok('ND4-04_accent_p3_7dB', Math.abs(off.accDb - 3.7) <= 0.2, {dB: +off.accDb.toFixed(2), amt: off.accentAmt});
ok('ND4-04_tune_p12_1200ct', Math.abs(off.tuneCent - 1200) <= 2, {cent: +off.tuneCent.toFixed(2), f0: +off.f0.toFixed(2), f12: +off.f12.toFixed(2)});
ok('ND4-04_decay_x2_T60x2', Math.abs(off.decRatio - 2) <= 0.2 && Math.abs(off.t60a / off.t60Soll - 1) <= 0.1, {ratio: +off.decRatio.toFixed(3), t60: +off.t60a.toFixed(3), soll: +off.t60Soll.toFixed(3)});

// ---------- Live ----------
await p.evaluate(async () => {
  ensureAudio(); for (let k = 0; k < 60 && !(AU.ctx && AU.ctx.state === 'running' && MDX.st === 'ready' && drumBufs() && AU.kit); k++) { mdBoot(); await new Promise(r => setTimeout(r, 100)); }
  // Nachrichten-Log und Abgriff am Engine-Ausgang
  const port = MDX.node.port, orig = port.postMessage.bind(port);
  window.__log = []; port.postMessage = m => { window.__log.push({m: JSON.parse(JSON.stringify(m)), now: AU.ctx.currentTime}); return orig(m); };
  const an = AU.ctx.createAnalyser(); an.fftSize = 2048; MDX.node.connect(an); window.__an = an;
  window.__peak = () => { const d = new Float32Array(an.fftSize); an.getFloatTimeDomainData(d); let m = 0; for (const x of d) m = Math.max(m, Math.abs(x)); return m; };
  // langer Ton, damit ■ die Stimmen wirklich beenden muss (T60 ≈ 10 s)
  soundEdit(DRUM_T, 't', () => { Object.assign(drumSnd().p.slots.kick, {mTdec: 50, mDm: 'E1', mBnd: 0}); drumChanged('kick'); });
});
const st0 = await p.evaluate(() => ({st: MDX.st, adds: MDX.adds, node: !!MDX.node}));
ok('live_engine_ready', st0.st === 'ready' && st0.node, st0);

// Transport: 16tel-Kick (1 Takt) mit Lanes, ~2,3 s
const live = await p.evaluate(async () => {
  const Q = SYNQUENZER; Q.setBpm(120);
  const notes = []; for (let k = 0; k < 16; k++) notes.push({t: k * 0.25, d: .1, n: 36, v: .9});
  notes[1].v = .5; notes[2].a = 1; notes[3].lk = {tune: 12, dec: 2}; notes[5].r = 2;    // VEL, AKZENT, TUNE/DECAY, WIRBEL 1/32
  Q.setClip(4, 0, {len: 1, key: {root: 0, scale: 'ionian'}, notes}); Q.launchClip(4, 0);
  window.__log.length = 0; Q.play();
  await new Promise(r => setTimeout(r, 2300));
  const hits = window.__log.filter(x => x.m.t === 'hit'), list = hits.flatMap(x => x.m.list.map(h => ({...h, now: x.now})));
  const early = list.filter(h => h.at <= h.now).length, minLead = Math.min(...list.map(h => h.at - h.now));
  // Schläge im ersten Takt (Beat 0..4 relativ zum Start)
  const t0 = list.length ? list[0].at : 0, spb = 0.5;
  const bar1 = list.filter(h => h.at < t0 + 4 * spb - 1e-6).map(h => ({b: +((h.at - t0) / spb).toFixed(4), v: +h.v.toFixed(3), acc: +h.acc.toFixed(3), tune: h.tune, dec: h.dec}));
  const peakPlaying = window.__peak();
  return {n: list.length, early, minLead, bar1, late: MDX.late, peakPlaying, playing: R.playing, accentAmt: accentAmt(drumKit().accent)};
});
const lb = live.bar1, at = x => lb.filter(h => Math.abs(h.b - x) < 1e-3);
const laneOk = lb.length === 17 && at(0.25)[0] && Math.abs(at(0.25)[0].v - .5) < 1e-3 && at(0.5)[0] && Math.abs(at(0.5)[0].acc - live.accentAmt) < 1e-3
  && at(0.75)[0] && at(0.75)[0].tune === 12 && at(0.75)[0].dec === 2 && at(1.25).length === 1 && at(1.375).length === 1 && lb.filter(h => h.acc === 0 && h.tune === 0 && h.dec === 1).length === 15;
ok('ND4-04_live_lanes_in_hit_messages', laneOk, {bar1: lb.length, sample: lb.slice(0, 7)});
ok('ND4-03_live_no_late', live.late === 0 && live.early === 0 && live.n >= 16 && live.peakPlaying > 1e-3, {n: live.n, late: live.late, early: live.early, minLeadMs: +(live.minLead * 1000).toFixed(1), peak: +live.peakPlaying.toFixed(3)});

// ■: 'stop' an die Engine, geplante Schläge fallen weg (cancel), 200 ms später Ausgang ≤ −90 dBFS
const stop1 = await p.evaluate(async () => {
  window.__log.length = 0; const t = AU.ctx.currentTime; SYNQUENZER.stop();
  const msgs = window.__log.map(x => x.m.t), stopMsg = window.__log.find(x => x.m.t === 'stop');
  const pendAlive = MDX.pend.filter(h => !h.dead && h.start > t + .002).length;
  await new Promise(r => setTimeout(r, 240));
  const pk = window.__peak();
  return {msgs, stop: stopMsg ? stopMsg.m : null, pendAlive, peak: pk, dB: 20 * Math.log10(Math.max(pk, 1e-12)), afterLog: window.__log.filter(x => x.m.t === 'hit').length};
});
ok('ND4-05_stop_posts_stop_tau', stop1.stop && Math.abs(stop1.stop.tau - .02) < 1e-9 && stop1.pendAlive === 0 && !stop1.afterLog, {msgs: stop1.msgs, pendAlive: stop1.pendAlive});
ok('ND4-05_stop_silent_after_200ms', stop1.dB <= -90, {dBFS: +stop1.dB.toFixed(1)});
// ■■ (zweites ■ innerhalb 1 s): 'panic'
const stop2 = await p.evaluate(async () => { window.__log.length = 0; SYNQUENZER.stop(); return window.__log.map(x => x.m.t); });
ok('ND4-05_double_stop_posts_panic', stop2.includes('panic'), {msgs: stop2});
// Panik bei klingendem Ton: 'panic', nach 50 ms ≤ −90 dBFS
const pan = await p.evaluate(async () => {
  await new Promise(r => setTimeout(r, 1200));            // ■■-Fenster vorbei
  drumHit(36, 1, AU.ctx.currentTime + .02, 'pad'); await new Promise(r => setTimeout(r, 250));
  const before = window.__peak(); window.__log.length = 0; panic();
  const msgs = window.__log.map(x => x.m.t); await new Promise(r => setTimeout(r, 110));
  const pk = window.__peak(); return {before, msgs, dB: 20 * Math.log10(Math.max(pk, 1e-12))};
});
ok('ND4-05_panic_silent_50ms', pan.before > 1e-3 && pan.msgs.includes('panic') && pan.dB <= -90, {before: +pan.before.toFixed(3), msgs: pan.msgs, dBFS: +pan.dB.toFixed(1)});

// Abbruch geplanter Schläge: cancelTrackFrom und silenceAll (gesendet -> 'cancel' mit ids; noch in der Warteschlange -> nie gesendet)
const canc = await p.evaluate(async () => {
  const c = AU.ctx, res = {};
  // a) gesendet, dann cancelTrackFrom
  window.__log.length = 0; const h1 = drumHit(36, .9, c.currentTime + .6, 'clip'); await Promise.resolve(); await new Promise(r => setTimeout(r, 0));
  const sent1 = window.__log.some(x => x.m.t === 'hit' && x.m.list.some(it => it.id === h1.md));
  cancelTrackFrom(DRUM_T, c.currentTime);
  const cm1 = window.__log.find(x => x.m.t === 'cancel');
  res.a = {sent: sent1, dead: h1.dead, cancelIds: cm1 ? cm1.m.ids : null, md: h1.md};
  // b) noch in der Warteschlange (gleicher Tick), dann cancelTrackFrom
  window.__log.length = 0; const h2 = drumHit(36, .9, c.currentTime + .6, 'clip'); cancelTrackFrom(DRUM_T, c.currentTime);
  await new Promise(r => setTimeout(r, 30));
  res.b = {dead: h2.dead, posted: window.__log.some(x => x.m.t === 'hit' && x.m.list.some(it => it.id === h2.md)), q: MDX.q.length};
  // c) gesendet, dann silenceAll (■-Weg)
  window.__log.length = 0; const h3 = drumHit(36, .9, c.currentTime + .6, 'pad'); await new Promise(r => setTimeout(r, 10));
  silenceAll(c.currentTime, .02);
  const cm3 = window.__log.find(x => x.m.t === 'cancel');
  res.c = {dead: h3.dead, cancelIds: cm3 ? cm3.m.ids : null, md: h3.md, stop: window.__log.some(x => x.m.t === 'stop')};
  // nichts davon klingt
  await new Promise(r => setTimeout(r, 750));
  res.peak = window.__peak();
  res.pendAlive = MDX.pend.filter(h => !h.dead && h.start > c.currentTime).length;
  return res;
});
ok('cancelTrackFrom_drops_sent_hit', canc.a.sent && canc.a.dead && canc.a.cancelIds && canc.a.cancelIds.includes(canc.a.md), canc.a);
ok('cancelTrackFrom_drops_queued_hit', canc.b.dead && !canc.b.posted && canc.b.q === 0, canc.b);
ok('silenceAll_drops_pending_hit', canc.c.dead && canc.c.cancelIds && canc.c.cancelIds.includes(canc.c.md) && canc.c.stop, canc.c);
ok('dropped_hits_silent', canc.peak < 1e-5 && canc.pendAlive === 0, {peak: canc.peak, pendAlive: canc.pendAlive});

const q = await p.evaluate(() => SYNQUENZER.mdQuery());
ok('mdQuery_answers', q && q.t === 'info', {q});
ok('no_page_errors', !errs.length, {errs: errs.slice(0, 4)});
const pass = Object.values(checks).every(v => v === true || (v && v.ok === true));
console.log(JSON.stringify({test: 'md4-int', ids: ['ND4-03', 'ND4-04', 'ND4-05'], pass, checks}));
await b.close();
process.exit(pass ? 0 : 1);
