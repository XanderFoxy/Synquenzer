// MTX3-P – Nachtest der Prüfer-Befunde S1–S4, M1, M3–M7, L1–L4, L6 (Render-Vergleiche mit fester Zufallszahl, Live-Lauf im Kopflos-Browser).
// Aufruf: node mtx3p-test.mjs <index.html>   (absoluter Pfad)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2]; if (!file) { console.log('Aufruf: node mtx3p-test.mjs <index.html>'); process.exit(2); }
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const res = []; const ok = (name, cond, info) => { res.push({name, ok: !!cond}); console.log((cond ? 'OK     ' : 'FEHLER ') + name + (info !== undefined ? ' · ' + JSON.stringify(info) : '')); };
async function run(label, fn, arg) {
  const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1600);
  await p.evaluate(() => {
    window.__W = ms => new Promise(r => setTimeout(r, ms));
    window.__R = async bars => { ensureAudio(); drumBufs(); const MR = Math.random; Math.random = () => .3125; try { VV.cancel = false; const r = await vvRenderAudio({range: {a: 0, b: bars || S.song.bars, sel: false}}); return {L: Float32Array.from(r.ch[0]), R: Float32Array.from(r.ch[1]), sr: r.sr || 44100}; } finally { Math.random = MR; } };
    window.__db = (X, Y, a, z) => { let e = 0, d = 0; const n0 = a || 0, n1 = Math.min(z || Infinity, X.L.length, Y.L.length); for (const c of ['L', 'R']) for (let k = n0; k < n1; k++) { e += X[c][k] * X[c][k]; const q = X[c][k] - Y[c][k]; d += q * q; } return Math.round(10 * Math.log10(d / Math.max(e, 1e-20) + 1e-30) * 10) / 10; };
    window.__heard = (s0, j) => LOG.buf.filter(e => e && !e.removed && e.seq > s0 && e.track === j).length;
  });
  const r = await p.evaluate(fn, arg).catch(e => ({err: String(e)}));
  r.errs = errs.slice(0, 3); await ctx.close(); return r;
}
// S1 – neue Spur stoppt beim Szenenwechsel der Quelle (Summe gleich, Takt 3/4 still)
{ const r = await run('S1', async () => {
    for (let i = 0; i < NT(); i++) if (i !== 0) S.tracks[i].clips = S.tracks[i].clips.map(() => null);
    SYNQUENZER.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]);
    const A = await __R(); const ns = S.tracks[0].clips[0].notes, ix = ns.map((n, k) => k).filter(k => ns[k].n >= 43);
    const j = SYNQUENZER.mtx3.out(0, 0, ix, 'new', false); const B = await __R(); const bar = Math.round(A.sr * 4 * 60 / S.bpm);
    return {j, src: JSON.stringify(S.song.lanes[0]), lane: JSON.stringify(S.song.lanes[j]), d34: __db(A, B, 2 * bar, 4 * bar), d: __db(A, B)};
  });
  ok('S1 Auslagern: Song-Zeile der neuen Spur mit Stopp beim Wechsel', /"slot":-1/.test(r.lane || ''), r);
  ok('S1 Takt 3/4 ohne fremde Noten (Differenz ≤ −40 dB)', r.d34 <= -40, r.d34); }
// S2 – Fill „ersetzt“ schweigt auch auf den Einzelspuren
{ const r = await run('S2', async () => {
    for (let i = 0; i < NT(); i++) if (i !== DRUM_T) S.tracks[i].clips = S.tracks[i].clips.map(() => null);
    SYNQUENZER.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]);
    const lib = SYNQUENZER.ueLib(), L = lib.find(l => (l.t == null || l.t === DRUM_T) && (l.k || 'fill') === 'fill' && (l.mode || 'ersetzt') === 'ersetzt');
    const m = S.song.marks.find(x => x.a > 0), ue = L && m ? SYNQUENZER.uePlace(L.id, m.id) : null;
    const A = await __R(); const ids = SYNQUENZER.mtx3.split(); const B = await __R(); return {fill: L ? L.name : null, ue, ids, d: __db(A, B)};
  });
  ok('S2 Fill „ersetzt“: Summe vorher ↔ aufgeteilt ≤ −60 dB', r.d <= -60, r); }
// S3 – North-Kit: Aufteilen gesperrt (mit Grund), DrumSynth-Kit gleich
{ const r = await run('S3', async () => {
    const o = {};
    for (let i = 0; i < NT(); i++) if (i !== DRUM_T) S.tracks[i].clips = S.tracks[i].clips.map(() => null);
    SYNQUENZER.songFromChain([{scene: 0, bars: 2}]);
    SYNQUENZER.loadKit('Schräg'); await __W(250); o.why = SYNQUENZER.mtx3.okWhy().split; o.split = SYNQUENZER.mtx3.split(['hatC']);
    SYNQUENZER.loadKit('909'); await __W(250); const A = await __R(); o.split909 = SYNQUENZER.mtx3.split(); const B = await __R(); o.d909 = __db(A, B);
    return o;
  });
  ok('S3 North-Kit: Aufteilen gesperrt mit Grund', r.split == null && /bleiben auf DRUMS/.test(r.why || ''), r);
  ok('S3 DrumSynth-Kit (909): Summe gleich ≤ −100 dB', r.d909 <= -100, r.d909); }
// S4 – In vorhandene Spur ohne Clip: Ziel startet (Matrix) und bekommt die Song-Zeile; ↶ ohne Stopp
{ const r = await run('S4', async () => {
    const o = {}; ensureAudio(); SYNQUENZER.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); setSongView(false); launchScene(0); play(); await __W(600);
    const ns = S.tracks[0].clips[0].notes, ix = ns.map((n, k) => k).filter(k => ns[k].n >= 43); o.had = !!S.tracks[3].clips[0];
    SYNQUENZER.mtx3.out(0, 0, ix, 3, false); o.slot3 = R.slot[3]; o.lane3 = JSON.stringify(S.song.lanes[3]);
    const s0 = LOG.seq; await __W(2200); o.heard = __heard(s0, 3);
    undo(); await __W(200); o.undo = {clip: !!S.tracks[3].clips[0], lane3: JSON.stringify(S.song.lanes[3]), playing: R.playing}; stop(); return o;
  });
  ok('S4 Ziel ohne Clip startet mit der Quelle und klingt', !r.had && r.slot3 === 0 && r.heard >= 1, r);
  ok('S4 Song-Zeile des Ziels ergänzt (Start + Stopp)', /"slot":0/.test(r.lane3 || '') && /"slot":-1/.test(r.lane3 || ''), r.lane3);
  ok('S4 ↶ holt Clip und Song-Zeile zurück, Wiedergabe läuft', r.undo && !r.undo.clip && r.undo.lane3 === '[]' && r.undo.playing, r.undo); }
// M1 / L3 / M5 – ↶/↷ ohne Stopp, Spuren spielen mit, keine Faltungs-Lecks, keine leere Synth-Engine
{ const r = await run('M1', async () => {
    const o = {}; ensureAudio(); setSongView(false); launchScene(0); play(); await __W(600);
    const m = SYNQUENZER.mtx3.split(); o.m = m; o.eng = m.map(j => (AU.synth[j] ? 1 : 0)); await __W(500);
    undo(); await __W(300); o.u = {nt: NT(), playing: R.playing}; redo(); await __W(300); o.r = {nt: NT(), playing: R.playing, slot: m.map(j => R.slot[j])};
    const s0 = LOG.seq; await __W(1800); o.heard = m.map(j => __heard(s0, j));
    const n0 = (() => { let k = 0; const L = MTX3.bx.get(AU.ctx) || []; for (const X of L) if (X) k++; return k; })();
    for (let k = 0; k < 2; k++) await __R(2); await __W(300); o.busLive = (MTX3.bx.get(AU.ctx) || []).filter(Boolean).length; o.bus0 = n0;
    const ns = S.tracks[0].clips[0].notes, ix = ns.map((n, k) => k).filter(k => ns[k].n >= 43);
    SYNQUENZER.mtx3.merge(); await __W(200); const j = SYNQUENZER.mtx3.out(0, 0, ix, 'new', false); undo(); await __W(200); redo(); await __W(300); o.outRedo = {j, slot: R.slot[j], playing: R.playing};
    stop(); return o;
  });
  ok('M1 ↶/↷ Aufteilen: Wiedergabe läuft weiter', r.u && r.u.playing && r.r && r.r.playing && r.u.nt === 6 && r.r.nt === 8, r);
  ok('M1 nach ↷ spielen die Einzelspuren gleich mit', r.heard && r.heard.every(x => x > 0), r.heard);
  ok('M5 aktive Einzelspur ohne Synth-Engine', r.eng && r.eng.every(x => x === 0), r.eng);
  ok('M5 Offline-Render baut keine neuen Live-Busse', r.busLive === r.bus0, {vorher: r.bus0, nachher: r.busLive});
  ok('L3 ↷ Auslagern im Lauf: neue Spur startet', r.outRedo && r.outRedo.slot === 0 && r.outRedo.playing, r.outRedo); }
// M4 / M6 / M7 / L4 / L6 / M3 (Tastatur, Kit folgt)
{ const r = await run('M', async () => {
    const o = {}; ensureAudio(); await __W(500);
    const m = SYNQUENZER.mtx3.split(); o.roles = mx2Roles().slice(); o.groups = jam2Groups(); o.gen4 = m.map(j => gen4Roles(j)); o.gr2 = m.map(j => gr2Role(j, S.tracks[j].clips.find(Boolean)));
    o.ch = m.map(j => midiCh(j)); o.short = m.map(j => svShort(j)); o.full = SYNQUENZER.mtx3.okWhy().split;
    const H0 = HITS.length; spawnVoice(m[0], 60, .8, AU.ctx.currentTime + .05, {src: 'live'}); o.live = HITS.slice(H0).map(h => h.track + ':' + h.voice);
    const hh0 = S.tracks[DRUM_T].clips.reduce((a, c) => a + (c ? c.notes.filter(n => n.n === 42).length : 0), 0) + S.tracks[m[0]].clips.reduce((a, c) => a + (c ? c.notes.length : 0), 0);
    SYNQUENZER.mtx3.merge(); o.hh = [hh0, S.tracks[DRUM_T].clips.reduce((a, c) => a + (c ? c.notes.filter(n => n.n === 42).length : 0), 0)];
    return o;
  });
  ok('M6 Mix-Rollen und Perform-Gruppen: Einzelspuren = Drums', r.roles && r.roles[6] === 'drums' && r.roles[7] === 'drums' && r.groups.dr.includes(6) && r.groups.dr.includes(7), {roles: r.roles, dr: r.groups && r.groups.dr});
  ok('M6 Remix/GEN4: keine Synth-Rollen für Einzelspuren', JSON.stringify(r.gen4) === '[["off"],["off"]]' && r.gr2.every(x => x == null), {gen4: r.gen4, gr2: r.gr2});
  ok('M7 MIDI-Kanal 10 für Einzelspuren', r.ch && r.ch.every(x => x === 9), r.ch);
  ok('M4 volle Spuren: Grund statt stummem Grau', /Spur-Plätze belegt|Zusatzspur/.test(r.full || ''), r.full);
  ok('L6 Song-Ansicht: Name statt SYN n', r.short && r.short[0] === 'HH ZU', r.short);
  ok('M3 Tastatur auf der Einzelspur spielt den Drum-Ton', r.live && r.live.length === 1 && r.live[0] === '6:hatC', r.live);
  ok('L4 Zusammenführen verdoppelt nichts', r.hh && r.hh[0] === r.hh[1], r.hh); }
{ const r = await run('Kit', async () => {
    for (let i = 0; i < NT(); i++) if (i !== DRUM_T) S.tracks[i].clips = S.tracks[i].clips.map(() => null);
    SYNQUENZER.songFromChain([{scene: 0, bars: 2}]); SYNQUENZER.mtx3.split(['hatC']); S.tracks[DRUM_T].mute = true;
    const A = await __R(); SYNQUENZER.loadKit('909'); await __W(250); const B = await __R(); return {d: __db(A, B)};
  });
  ok('M3 Kit-Wechsel auf DRUMS: Einzelspur folgt (HH klingt anders)', r.d > -20, r); }
const bad = res.filter(x => !x.ok);
console.log('\nERGEBNIS ' + (res.length - bad.length) + '/' + res.length + (bad.length ? ' – offen: ' + bad.map(x => x.name).join(' | ') : ''));
await b.close();
