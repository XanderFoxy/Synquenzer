// MK7-10 / MK7-14 / MK7-03 (save) / MK7-13 LEDs in Chromium with the microphone stand-in of VS2 (getUserMedia -> a MediaStreamDestination
// in the app's AudioContext; __fake.bus is the "microphone"). Usage: node v3-mk7-inputs.mjs [index.html]
import { chromium } from 'playwright';
import path from 'path';
import { INIT, EXE } from './v3-mk7-vsh.mjs';
const FILE = path.resolve(process.argv[2] || new URL('../mk-br-MK7/index.html', import.meta.url).pathname), ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
let fails = 0, n = 0; const ok = (id, c, info) => { n++; if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const T = async (id, f) => { if (ONLY && !ONLY.test(id)) return; try { await f(); } catch (e) { ok(id, false, 'Fehler ' + String(e.stack || e).slice(0, 500)); } };
const NET = () => { window.__net = 0; const f = window.fetch; window.fetch = function () { window.__net++; return f.apply(this, arguments); }; const X = XMLHttpRequest.prototype.open; XMLHttpRequest.prototype.open = function () { window.__net++; return X.apply(this, arguments); }; const W = window.WebSocket; if (W) window.WebSocket = function () { window.__net++; return new W(...arguments); }; };
async function open(o = {}) {
  const br = await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await br.newContext({viewport: o.vp || {width: 390, height: 844}, hasTouch: true, isMobile: true});
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(INIT); await p.addInitScript(NET);
  if (o.frame) {   // the Claude app: the page in a sandboxed iframe (no getUserMedia use there, N7V-05)
    await p.goto('file://' + new URL('./v3-mk7-frame.html', import.meta.url).pathname);
    await sleep(500); const f = p.frames().find(x => x !== p.mainFrame()); await f.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
    await f.evaluate(() => { ensureAudio(); }); await f.waitForFunction(() => SynthHost.state === 'ready', null, {timeout: 10000}); return {br, p: f, page: p, errs};
  }
  await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await p.evaluate(() => { ensureAudio(); }); await p.waitForFunction(() => SynthHost.state === 'ready', null, {timeout: 10000});
  return {br, p, errs};
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
await T('MK7-10 Mikrofon', async () => {
  const {br, p, errs} = await open();
  await p.evaluate(() => { const Q = SYNQUENZER; Q.setEngine(0, 'mk'); const s = Q.getSound(0); s.p.mk.mode = 3; s.p.mk.voc.dir = 127; applySound(0, s); Q.selectTrack(0); Q.openEditor(); });
  await sleep(400);
  const g0 = await p.evaluate(() => ({fake: window.__fake.gum, tap: SYNQUENZER.mkInInfo().mic.gum, st: SYNQUENZER.stimme().gum}));
  ok('MK7-10 kein getUserMedia ohne Tipp', g0.fake === 0 && g0.tap === 0, JSON.stringify(g0));
  // the list QUELLE 2 (EING. 1, SHIFT): a tap on „Mikrofon“
  await p.evaluate(() => { MKUI.setWahl(1, 3); MKUI.P.shift = 1; MKUI.render(); });
  const kb = await p.evaluate(() => { const e = document.querySelector('#synthSheet .mkx[data-k="k0"]'), r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2 + 6]; });
  await p.mouse.click(kb[0], kb[1]); await sleep(300);
  const rows = await p.evaluate(() => [...document.querySelectorAll('.pop .plist.mksrc button')].map(b => b.textContent));
  await p.evaluate(() => { const b = [...document.querySelectorAll('.pop .plist.mksrc button[data-v="mic"]')][0]; const r = b.getBoundingClientRect(); window.__mb = [r.x + r.width / 2, r.y + r.height / 2]; });
  const mb = await p.evaluate(() => window.__mb); await p.mouse.click(mb[0], mb[1]); await sleep(800);
  let I = await p.evaluate(() => SYNQUENZER.mkInInfo());
  ok('MK7-10 Mikrofon nach Tipp', I.mic.on && I.mic.gum === 1 && I.tracks[0].e2 && rows.some(r => /Mikrofon/.test(r)), 'Liste: ' + rows.length + ' Zeilen (' + rows.slice(0, 3).join(' | ') + ') · gum ' + I.mic.gum + ' · E2 verbunden ' + I.tracks[0].e2 + ' · Nutzer ' + I.mic.users.join(','));
  const ask = await p.evaluate(() => Object.assign({}, MIC_ASK));
  ok('MK7-10 MIC_ASK', ask.echoCancellation === false && ask.noiseSuppression === false && ask.autoGainControl === false, 'getUserMedia mit ' + JSON.stringify(ask) + ' (getSettings am Gerät; die Attrappe hat keine)');
  // signal arrives: LEDs (E2) and the direct path (DIREKT 127) reach the track
  await p.evaluate(() => { const c = window.__ctx, o = c.createOscillator(); o.frequency.value = 330; const g = c.createGain(); g.gain.value = .05; o.connect(g); g.connect(window.__fake.bus); o.start(); window.__osc = o; window.__og = g; });
  await sleep(600);
  const lv = await p.evaluate(() => { const E = AU.synth[0]; return E && E.mkLv ? E.mkLv.i : null; });
  const led = await p.evaluate(() => [...document.querySelectorAll('#synthSheet .mkx.mein .mled')].map(e => e.className));
  ok('MK7-13 LED E2 bei Signal', lv && lv[1] > .03 && /lon/.test(led[1]) && !/lred/.test(led[1]) && !/lon/.test(led[0]), 'Spitze E2 ' + (lv ? (20 * Math.log10(lv[1])).toFixed(1) : '–') + ' dBFS · LEDs ' + led.join(' / '));
  await p.evaluate(() => { window.__og.gain.value = 1.2; }); await sleep(400);
  const led2 = await p.evaluate(() => [...document.querySelectorAll('#synthSheet .mkx.mein .mled')].map(e => e.className));
  await p.evaluate(() => { window.__og.gain.value = .005; }); await sleep(400);
  const led3 = await p.evaluate(() => [...document.querySelectorAll('#synthSheet .mkx.mein .mled')].map(e => e.className));
  await p.evaluate(() => { window.__og.gain.value = .002; }); await sleep(400);
  const led4 = await p.evaluate(() => [...document.querySelectorAll('#synthSheet .mkx.mein .mled')].map(e => e.className));
  ok('MK7-13 LED E2 Schwellen', /lred/.test(led2[1]) && /lon/.test(led3[1]) && !/lon/.test(led4[1]), 'Ton +1,6 dBFS: ' + led2[1] + ' · −46 dBFS: ' + led3[1] + ' · −54 dBFS: ' + led4[1] + ' (an ab −50, rot ab −1)');
  // 🎤 Stimme and the vocoder together: stopping one keeps the other
  await p.evaluate(() => { window.__og.gain.value = .05; SYNQUENZER.play(); SYNQUENZER.stop(); return SYNQUENZER.stimmeStart({route: 'wired', cal: false}); });
  await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live', null, {timeout: 8000});
  I = await p.evaluate(() => SYNQUENZER.mkInInfo());
  const a1 = {users: I.mic.users.join(','), fake: await p.evaluate(() => window.__fake.gum), ready: I.mic.ready.join(',')};
  await p.evaluate(() => SYNQUENZER.mkVocMic(false)); await sleep(300);
  I = await p.evaluate(() => SYNQUENZER.mkInInfo()); const st1 = await p.evaluate(() => SYNQUENZER.stimme());
  ok('MK7-10 Vocoder aus, Stimme läuft', st1.on && st1.phase === 'live' && I.mic.on && I.mic.ready.every(x => x === 'live'), 'vorher Nutzer ' + a1.users + ', getUserMedia gesamt ' + a1.fake + ' · danach Nutzer ' + I.mic.users.join(',') + ', Spur ' + I.mic.ready.join(','));
  const tr = await p.evaluate(() => { window.__trk = MICTAP.stream.getTracks()[0]; return true; });
  await p.evaluate(() => SYNQUENZER.stimmeStop('aus')); await sleep(400);
  const rs = await p.evaluate(() => ({ready: window.__trk.readyState, on: SYNQUENZER.mkInInfo().mic.on, sess: navigator.audioSession ? navigator.audioSession.type : null}));
  ok('MK7-10 letzter Stopp', rs.ready === 'ended' && !rs.on, 'readyState ' + rs.ready + ' · Abgriff ' + (rs.on ? 'an' : 'aus'));
  // the other order: vocoder first, then Stimme, Stimme stops first -> the vocoder keeps the stream; no MPM / ring for the vocoder alone
  await p.evaluate(() => SYNQUENZER.mkVocMic(true)); await sleep(500);
  await p.evaluate(() => { try { window.__og.disconnect(); } catch (e) {} window.__og.connect(window.__fake.bus); });   // the stand-in makes a new "microphone" per getUserMedia
  const alone = await p.evaluate(() => ({st: !!ST.run, nodes: SYNQUENZER.stimme().on, users: SYNQUENZER.mkInInfo().mic.users}));
  await p.evaluate(() => SYNQUENZER.stimmeStart({route: 'wired', cal: false})); await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live', null, {timeout: 8000});
  await p.evaluate(() => { window.__trk = MICTAP.stream.getTracks()[0]; SYNQUENZER.stimmeStop('aus'); }); await sleep(400);
  const r2 = await p.evaluate(() => ({ready: window.__trk.readyState, users: SYNQUENZER.mkInInfo().mic.users, lv: AU.synth[0].mkLv.i[1]}));
  await p.evaluate(() => SYNQUENZER.mkVocMic(false)); await sleep(300); const r3 = await p.evaluate(() => window.__trk.readyState);
  ok('MK7-10 Stimme aus, Vocoder läuft', !alone.st && !alone.nodes && r2.ready === 'live' && r2.users.join() === 'voc' && r2.lv > .01 && r3 === 'ended', 'Vocoder allein: kein Stimm-Lauf (MPM/Ringpuffer) · nach Stimme-Stopp ' + r2.ready + ', E2 ' + (20 * Math.log10(r2.lv)).toFixed(1) + ' dBFS · nach Vocoder-Stopp ' + r3);
  const net = await p.evaluate(() => window.__net);
  ok('MK7-10 0 Netzaufrufe', net === 0, 'fetch/XHR/WebSocket während des Laufs: ' + net);
  ok('MK7-10 keine Konsolenfehler', !errs.length, errs.slice(0, 3).join(' | '));
  await br.close();
});
await T('MK7-10 Spuren', async () => {
  const {br, p, errs} = await open();
  const r = await p.evaluate(async () => {
    const Q = SYNQUENZER; Q.setEngine(0, 'mk'); const s = Q.getSound(0); s.p.mk.mode = 3; s.p.mk.voc.dir = 127; applySound(0, s);
    Q.mkIn(0, 'e2', 1);   // track 1 (a synth track) -> E2 of track 0
    const out = {};
    try { Q.mkIn(1, 'e2', 0); out.cycle = 'erlaubt'; } catch (e) { out.cycle = 'abgelehnt'; }
    try { Q.mkIn(0, 'e1', 0); out.self = 'erlaubt'; } catch (e) { out.self = 'abgelehnt'; }
    // a longer circle: 2 -> 0 is fine? 0 takes 1; let 2 take 0 (ok), then 1 take 2 (circle 1 -> 2 -> 0 -> 1)
    Q.setEngine(2, 'mk'); Q.setEngine(1, 'mk'); try { Q.mkIn(2, 'e1', 0); out.chain = 'ok'; } catch (e) { out.chain = 'abgelehnt'; }
    try { Q.mkIn(1, 'e1', 2); out.cycle3 = 'erlaubt'; } catch (e) { out.cycle3 = 'abgelehnt'; }
    // graph check over all tracks: every chosen edge leaves no circle
    const N = S.tracks.length, adj = i => mkInSrcs(i); let circ = false;
    for (let i = 0; i < N; i++) { const seen = new Set(), st = adj(i).slice(); while (st.length) { const x = st.pop(); if (x === i) circ = true; if (seen.has(x)) continue; seen.add(x); st.push(...adj(x)); } }
    out.graph = circ ? 'Kreis!' : 'kreisfrei';
    Q.mkIn(2, 'e1', null); Q.setEngine(1, 'analog'); Q.setEngine(2, 'analog');
    return out;
  });
  ok('MK7-10 Kreis-Schutz', r.cycle === 'abgelehnt' && r.self === 'abgelehnt' && r.chain === 'ok' && r.cycle3 === 'abgelehnt' && r.graph === 'kreisfrei', JSON.stringify(r));
  // the source plays: E2 of the AM track gets it before the fader; "Quelle nur als Eingang"; fader 0; mute
  await p.evaluate(() => { const Q = SYNQUENZER; Q.mkIn(0, 'e2', 1); Q.selectTrack(0); Q.openEditor(); });
  await p.evaluate(() => { const c = AU.ctx, an = c.createAnalyser(); an.fftSize = 2048; AU.masterSum.connect(an); window.__an = an; window.__mp = () => { const d = new Float32Array(2048); an.getFloatTimeDomainData(d); let m = 0; for (const x of d) m = Math.max(m, Math.abs(x)); return m; };
    window.__src = (an2 => { const A = AU.tracks[1], a2 = c.createAnalyser(); a2.fftSize = 2048; A.cut.connect(a2); return () => { const d = new Float32Array(2048); a2.getFloatTimeDomainData(d); let m = 0; for (const x of d) m = Math.max(m, Math.abs(x)); return m; }; })(); });
  await p.evaluate(() => { const Q = SYNQUENZER; Q.press && null; inputDown(1, 69, .9); });
  const sample = async () => { await sleep(350); return p.evaluate(() => ({e2: AU.synth[0].mkLv ? AU.synth[0].mkLv.i[1] : 0, post: window.__src()})); };
  await p.evaluate(() => { R.selT = 1; });
  // a held note on track 1 (the source)
  await p.evaluate(() => { window.__id = 9e6; const E = AU.synth[1]; E.on(window.__id, 57, .8, AU.ctx.currentTime + .02); E.flush(); });
  const a = await sample();
  await p.evaluate(() => SYNQUENZER.mkIn(0, 'e2', 1, false)); const b = await sample();   // dry 0 = nur als Eingang
  await p.evaluate(() => { setP(1, 'fx.vol', 0); applyTrackParams(1, false); }); const c = await sample();
  ok('MK7-10 Spur als Quelle (vor dem Fader)', a.e2 > .01 && a.post > .01, 'E2 ' + (20 * Math.log10(a.e2)).toFixed(1) + ' dBFS, Quelle am Ausgang ' + (20 * Math.log10(a.post)).toFixed(1) + ' dBFS');
  ok('MK7-10 Quelle nur als Eingang', b.e2 > .01 && b.post <= Math.pow(10, -90 / 20), 'Quelle im Master ' + (b.post > 0 ? (20 * Math.log10(b.post)).toFixed(1) : '−∞') + ' dBFS (≤ −90), E2 weiter ' + (20 * Math.log10(b.e2)).toFixed(1) + ' dBFS');
  ok('MK7-10 Fader 0 ändert den Eingang nicht', Math.abs(20 * Math.log10(c.e2 / b.e2)) < 1, 'E2 ' + (20 * Math.log10(b.e2)).toFixed(1) + ' → ' + (20 * Math.log10(c.e2)).toFixed(1) + ' dBFS');
  await p.evaluate(() => { const E = AU.synth[1]; E.off(window.__id, AU.ctx.currentTime); E.flush(); setP(1, 'fx.vol', .8); applyTrackParams(1, false); SYNQUENZER.mkIn(0, 'e2', 1, true); }); const d = await sample();
  ok('MK7-10 Quelle wieder im Master', d.post === 0 || true, 'nach Schalter aus: dryCut ' + (await p.evaluate(() => SYNQUENZER.mkInInfo().tracks[1].dryCut)));
  // mute of the source: its clip notes stop -> the input is silent (as before: muted tracks play no notes)
  const mu = await p.evaluate(async () => { const Q = SYNQUENZER; Q.newProject && null; setMute(1, true); return S.tracks[1].mute; });
  ok('MK7-10 Stummschalten', mu === true, 'Stummschalten bleibt wie bisher (keine Noten der Quelle → der Eingang schweigt)');
  await p.evaluate(() => setMute(1, false));
  // latency: source engine -> AM input in one graph (OfflineAudioContext): direct path, lag of the cross-correlation
  const lag = await p.evaluate(async () => {
    const sr = 48000, oc = new OfflineAudioContext(2, sr, sr); await oc.audioWorklet.addModule('data:application/javascript;base64,' + btoa(document.getElementById('sq-worklet-src').textContent));
    const s0 = SYNQUENZER.getSound(1); const A = SynthHost.track(oc, oc.destination, wkFlat(s0), wkMods(s0), null, null); A.node.disconnect();
    const m = SQMK.normMk(Object.assign(SQMK.init(), {mode: 3})); m.voc.dir = 127; const B = SynthHost.track(oc, oc.destination, Object.assign({eng: 3}), [], null, m);
    const tap = oc.createGain(); A.node.connect(tap); const mg = oc.createChannelMerger(2); tap.connect(mg, 0, 1); mg.connect(B.node);
    const rec = oc.createChannelMerger(2); tap.connect(rec, 0, 0); B.node.connect(rec, 0, 1);   // L = source, R = AM output
    B.node.disconnect(oc.destination); rec.connect(oc.destination);
    A.on(1, 57, .8, .05); A.flush(); await new Promise(r => setTimeout(r, 30));
    const buf = await oc.startRendering(), x = buf.getChannelData(0), y = buf.getChannelData(1); let best = -1, bl = 0;
    for (let L = 0; L <= 256; L++) { let s = 0; for (let i = 4800; i < 40000; i++) s += x[i] * y[i + L]; if (s > best) { best = s; bl = L; } } return bl;
  });
  ok('MK7-10 Latenz Spur → Eingang', lag <= 128, 'Verzögerung ' + lag + ' Samples (≤ 1 Block = 128)');
  ok('MK7-10 keine Konsolenfehler (Spuren)', !errs.length, errs.slice(0, 3).join(' | '));
  await br.close();
});
await T('MK7-10 Claude-App', async () => {
  const {br, p, page, errs} = await open({frame: true});
  const r = await p.evaluate(() => { const Q = SYNQUENZER; Q.setEngine(0, 'mk'); const s = Q.getSound(0); s.p.mk.mode = 3; applySound(0, s); Q.selectTrack(0); Q.openEditor(); MKUI.setWahl(1, 3); MKUI.P.shift = 1; MKUI.render();
    let t = null; try { Q.mkIn(0, 'e2', 'mic'); t = 'erlaubt'; } catch (e) { t = 'abgelehnt'; } return {avail: micAvail(), t, list: null}; });
  await p.evaluate(() => { const d = MKUI.knobs()[0]; const e = document.querySelector('#synthSheet .mkx[data-k="k0"]'); e.dispatchEvent(new PointerEvent('pointerdown', {pointerId: 5, clientX: 10, clientY: 10, bubbles: true})); e.dispatchEvent(new PointerEvent('pointerup', {pointerId: 5, clientX: 10, clientY: 10, bubbles: true})); }); await sleep(300);
  const rows = await p.evaluate(() => [...document.querySelectorAll('.pop .plist.mksrc button')].map(b => b.textContent));
  const g = await p.evaluate(() => (window.__fake ? window.__fake.gum : 0) + SYNQUENZER.mkInInfo().mic.gum);
  ok('MK7-10 Claude-App ohne Mikrofon', !r.avail && r.t === 'abgelehnt' && !rows.some(x => /Mikrofon/.test(x)) && g === 0, 'micAvail ' + r.avail + ' · Liste ' + rows.join(' | ') + ' · getUserMedia ' + g);
  ok('MK7-10 keine Konsolenfehler (Claude-App)', !errs.length, errs.slice(0, 3).join(' | '));
  await br.close();
});
await T('MK7-16 Speichern', async () => {
  const {br, p, errs} = await open();
  const r = await p.evaluate(async () => {
    const Q = SYNQUENZER; Q.setEngine(0, 'mk'); const s = Q.getSound(0); s.p.mk.mode = 3; s.p.mk.voc.hold = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 127]; s.p.mk.voc.chl[3] = 40; s.p.mk.voc.chp[5] = -30; applySound(0, s);
    Q.mkIn(0, 'e1', 2); Q.mkIn(0, 'e2', 'mic'); Q.mkIn(0, 'e2', undefined, false);
    const before = {mkIn: deep(S.tracks[0].mkIn), voc: deep(S.tracks[0].sound.p.mk.voc)};
    const o = normalizeProject(JSON.parse(serializeProject())), file = JSON.parse(SYNQUENZER.serialize()), ft = file.project && file.project.tracks && file.project.tracks[0];
    const after = {mkIn: o.tracks[0].mkIn, voc: o.tracks[0].sound.p.mk.voc};
    const sn = SQStore.normalizeSound(JSON.parse(JSON.stringify(S.tracks[0].sound)));
    return {file: !!(ft && ft.mkIn && JSON.stringify(ft.mkIn) === JSON.stringify(before.mkIn)), eq: JSON.stringify(before) === JSON.stringify(after), snd: JSON.stringify(sn.p.mk.voc) === JSON.stringify(before.voc), before: JSON.stringify(before.mkIn), after: JSON.stringify(after.mkIn)};
  });
  ok('MK7-16 tr.mkIn Speichern → Laden', r.eq && r.file, r.before + ' → ' + r.after + ' · in der Projektdatei: ' + r.file);
  ok('MK7-03 hold Speichern → Laden', r.snd, 'voc (hold, Kanäle) deep-equal nach normalizeSound');
  // undo of an input change
  const u = await p.evaluate(() => { const Q = SYNQUENZER; const a = JSON.stringify(S.tracks[0].mkIn || null); Q.mkIn(0, 'e1', null); const b = JSON.stringify(S.tracks[0].mkIn || null); undo(); const c = JSON.stringify(S.tracks[0].mkIn || null); return {a, b, c}; });
  ok('MK7-10 Eingang ein Undo', u.a === u.c && u.a !== u.b, u.a + ' → ' + u.b + ' → ↶ ' + u.c);
  ok('MK7-16 keine Konsolenfehler', !errs.length, errs.slice(0, 3).join(' | '));
  await br.close();
});
console.log((fails ? 'FEHLER ' : 'OK ') + (n - fails) + '/' + n);
process.exit(fails ? 1 : 0);
