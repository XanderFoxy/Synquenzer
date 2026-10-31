// BM6-02 (klingende Spur), BM6-04, BM6-05, BM6-06, BM6-07, BM6-10, BM6-11, BM6-12 – mit dem Platzhalter-Prozessor (Maske 031).
// Aufruf: node bm6-int.mjs [neu.html] [--kurz]   (--kurz: Live-Lauf 8 statt 32 Takte)
import {createRequire} from 'module';
const {chromium} = createRequire(import.meta.url)('playwright');
const NEW = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : new URL('../index.html', import.meta.url).pathname;
const BARS = process.argv.includes('--kurz') ? 8 : 32;
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const checks = {}; const ok = (k, v, info) => { checks[k] = info === undefined ? !!v : {ok: !!v, ...info}; };
const errs = [], net = [];
async function open(q) {
  const p = await b.newPage({viewport: {width: 390, height: 844}});
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('request', r => { if (/supabase/i.test(r.url())) net.push(r.url()); });
  await p.goto('file://' + NEW + (q || '')); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 30000}); await p.waitForTimeout(500);
  await p.evaluate(() => {
    // Mitschnitt hinter der Summe aller Spuren (vor dem Master): ScriptProcessor, nur für die Messung
    window.__tap = (on, src) => { if (on) { const c = AU.ctx, sp = c.createScriptProcessor(1024, 2, 2), z = c.createGain(); z.gain.value = 0; window.__rec = {l: [], t0: null, sr: c.sampleRate}; window.__src = src || AU.masterSum;
        sp.onaudioprocess = e => { if (window.__rec.t0 == null) window.__rec.t0 = e.playbackTime; window.__rec.l.push(new Float32Array(e.inputBuffer.getChannelData(0))); };
        window.__src.connect(sp); sp.connect(z); z.connect(c.destination); window.__sp = sp; }
      else { try { window.__src.disconnect(window.__sp); window.__sp.disconnect(); } catch (e) {} const n = window.__rec.l.reduce((a, x) => a + x.length, 0), o = new Float32Array(n); let k = 0; for (const x of window.__rec.l) { o.set(x, k); k += x.length; } return o; } };
    window.__db = (x, a, z) => { let s = 0, n = 0; for (let i = Math.max(0, a | 0); i < Math.min(x.length, z | 0); i++) { s += x[i] * x[i]; n++; } return n ? 10 * Math.log10(s / n + 1e-30) : -300; };
  });
  return p;
}
const P = await open();
await P.evaluate(async () => { ensureAudio(); await new Promise(r => setTimeout(r, 800)); });

// BM6-04 offline: 16tel bei 120 BPM, Einsatz ± 1 Sample (Platzhalter: Phase 0, erste Probe = 0 -> erstes Nicht-Null-Sample = Soll + 1)
const t1 = await P.evaluate(async () => {
  const sr = 48000, ev = []; for (let k = 0; k < 16; k++) { const at = .05 + k * .125; ev.push([at, 'on', 60 + (k % 5), .8, 'k' + k], [at + .06, 'off', 60 + (k % 5), 0, 'k' + k]); }
  const r = await SYNQUENZER.bmRender({o1: {m: 31, e: {l: 99, a: 0, d: 0, s: 15, r: 0}}}, ev, {sec: 2.2, sr});
  const dev = []; for (let k = 0; k < 16; k++) { const s = Math.round((.05 + k * .125) * sr); let f = -1; for (let i = s - 4; i < s + 20; i++) if (Math.abs(r.l[i]) > 1e-9 && Math.abs(r.l[i - 1]) <= 1e-9) { f = i; break; } dev.push(f - (s + 1)); }
  const r2 = await SYNQUENZER.bmRender({o1: {m: 31, e: {l: 99, a: 0, d: 0, s: 15, r: 0}}}, ev, {sec: 2.2, sr});
  let same = r.l.length === r2.l.length; for (let i = 0; same && i < r.l.length; i++) if (r.l[i] !== r2.l[i] || r.r[i] !== r2.r[i]) same = false;
  return {dev, bit: same};
});
ok('BM6-04_offline_onsets', t1.dev.every(d => Math.abs(d) <= 1), {abweichungSamples: t1.dev});
ok('BM6-06_offline_twice_bitgleich', t1.bit);

// BM6-04 live: Demo, Spur 1 = Bit Mask, BARS Takte bei 240 BPM: late = 0, Notenplan gleich wie VA
const live = await P.evaluate(async bars => {
  const Q = SYNQUENZER; switchProject(demoProject(), {first: true}); await new Promise(r => setTimeout(r, 300));
  const t = synthTracks().find(i => S.tracks[i].clips.some(c => c && c.notes && c.notes.length)); Q.setBpm(240);
  const plan = async eng => { soundEdit(t, 'Klangerzeugung', () => setEngine(t, eng)); await new Promise(r => setTimeout(r, 500)); Q.clearLog(); Q.launchScene(0); Q.play();
    await new Promise(r => setTimeout(r, 2500)); const L = Q.noteLog().filter(e => e.track === t && e.src === 'clip').map(e => Math.round((e.time - R.startTime) * 1000) + ':' + e.out); Q.stop(); await new Promise(r => setTimeout(r, 400)); return L; };
  const va = await plan('analog'), bm = await plan('bm');
  const E = AU.synth[t], l0 = BMX.late; Q.clearLog(); Q.launchScene(0); Q.play();
  await new Promise(r => setTimeout(r, bars * 1000));   // 240 BPM: 1 Takt = 1 s
  const n = Q.noteLog().filter(e => e.track === t && e.src === 'clip').length; Q.stop(); await new Promise(r => setTimeout(r, 500));
  return {t, vaN: va.length, same: va.slice(0, 16).join() === bm.slice(0, 16).join(), vaHead: va.slice(0, 4), bmHead: bm.slice(0, 4), late: BMX.late - l0, notes: n, ends: E ? E.ends : -1, bm: !!(E && E.bm)};
}, BARS);
ok('BM6-04_live_late0', live.bm && live.late === 0 && live.ends > BARS * 4, {takte: BARS, late: live.late, notenEnde: live.ends, notizLog: live.notes});
ok('BM6-04_plan_wie_VA', live.same && live.vaN > 4, {va: live.vaHead, bm: live.bmHead});

// BM6-04 Tasten bei laufendem Transport, ●, FANG, Eine Skala: Noten, Mitschnitt und Aufnahme gleich wie VA
const keys = await P.evaluate(async t => {
  const Q = SYNQUENZER, out = {};
  const run = async (eng, os, noRec) => {
    switchProject(newProject(), {}); await new Promise(r => setTimeout(r, 300)); Q.selectTrack(t); Q.setBpm(120);
    soundEdit(t, 'Klangerzeugung', () => setEngine(t, eng)); if (os) Q.oneScale(true); await new Promise(r => setTimeout(r, 300));
    Q.clearLog(); Q.play(); await new Promise(r => setTimeout(r, 300)); if (!noRec) { Q.rec(); await new Promise(r => setTimeout(r, 2300)); }
    for (const nn of [60, 61, 63, 66, 68]) { Q.keyOn(nn, .8); await new Promise(r => setTimeout(r, 120)); Q.keyOff(nn); await new Promise(r => setTimeout(r, 120)); }
    const cap = CAP.buf.filter(e => e.track === t || e.t === t || e.i === t).length || CAP.buf.length;
    Q.stop(); await new Promise(r => setTimeout(r, 300)); if (os) Q.oneScale(false);
    const clipNotes = S.tracks[t].clips.reduce((a, c) => a + (c && c.notes ? c.notes.length : 0), 0);
    return {outs: Q.noteLog().filter(e => e.track === t && e.src !== 'clip').map(e => e.out).join(), cap, clipNotes};
  };
  out.va = await run('analog', true); out.bm = await run('bm', true); out.bmPlain = await run('bm', false);
  out.fangVa = (await run('analog', false, true)).cap; out.fangBm = (await run('bm', false, true)).cap;
  return out;
}, live.t);
ok('BM6-04_keys_rec_FANG_oneScale', keys.va.outs === keys.bm.outs && keys.va.outs.length > 0 && keys.fangVa === keys.fangBm && keys.fangBm > 0 && keys.va.clipNotes === keys.bm.clipNotes && keys.bm.clipNotes > 0, keys);
await P.evaluate(() => { switchProject(newProject(), {}); });
await P.waitForTimeout(400);

// BM6-06 Offline = live (Echtzeit-Mitschnitt der Spur gegen bmRender, Korrelation)
const ol = await P.evaluate(async t => {
  const Q = SYNQUENZER, sr = AU.ctx.sampleRate; soundEdit(t, 'Klangerzeugung', () => setEngine(t, 'bm')); await new Promise(r => setTimeout(r, 400)); const E = AU.synth[t];
  const ev = [[.1, 'on', 69, .8], [.6, 'off', 69], [.7, 'on', 64, .8], [1.2, 'off', 64]];
  const off = await Q.bmRender(sndOf(t), ev, {sec: 1.6, sr});
  window.__tap(true, E.node); await new Promise(r => setTimeout(r, 150)); const T0 = AU.ctx.currentTime + .1; let id = 9e8;
  const ids = {}; for (const e of ev) { if (e[1] === 'on') { ids[e[2]] = ++id; E.on(id, e[2], e[3], T0 + e[0], -1, 0); } else E.off(ids[e[2]], T0 + e[0]); } E.flush();
  await new Promise(r => setTimeout(r, 1900)); const x = window.__tap(false), i0 = Math.round((T0 - window.__rec.t0) * sr);
  // Ausrichtung (der Mitschnitt hat eigene Verzögerung, ScriptProcessor): grob ± 8192 in 8er-Schritten, dann fein ± 8
  let best = -2, lag = 0; const n = off.l.length;
  const corr = d => { let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < n; i += 4) { const a = off.l[i], b_ = x[i0 + i + d] || 0; sxy += a * b_; sxx += a * a; syy += b_ * b_; } return sxy / Math.sqrt(sxx * syy + 1e-30); };
  for (let d = -8192; d <= 8192; d += 8) { const c = corr(d); if (c > best) { best = c; lag = d; } }
  const g = lag; for (let d = g - 8; d <= g + 8; d++) { const c = corr(d); if (c > best) { best = c; lag = d; } }
  window.__lag = lag;
  for (let d = lag; d <= lag; d += 1) { let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < n; i += 4) { const a = off.l[i], b_ = x[i0 + i + d] || 0; sxy += a * b_; sxx += a * a; syy += b_ * b_; } const c = sxy / Math.sqrt(sxx * syy + 1e-30); if (c > best) { best = c; lag = d; } }
  return {korrelation: +best.toFixed(4), lag};
}, live.t);
ok('BM6-06_offline_eq_live', ol.korrelation >= .99, ol);

// BM6-02 Wechsel auf klingender Spur: gehaltene Taste klingt weiter (wandert in den neuen Knoten), M-KLICK ≤ 6 dB
const swp = await P.evaluate(async t => {
  const Q = SYNQUENZER; soundEdit(t, 'Klangerzeugung', () => setEngine(t, 'analog')); await new Promise(r => setTimeout(r, 400));
  // gleiche Lautheit: VA-INIT-ähnlich, damit der Wechsel nicht nur ein Pegelsprung ist
  window.__tap(true); await new Promise(r => setTimeout(r, 100)); Q.keyOn(57, .8, 'h'); await new Promise(r => setTimeout(r, 600));
  const tSw = AU.ctx.currentTime; soundEdit(t, 'Klangerzeugung', () => setEngine(t, 'bm')); await new Promise(r => setTimeout(r, 600));
  const E = AU.synth[t], held = E && E.bm ? E.proxies.size : -1; Q.keyOff('h'); await new Promise(r => setTimeout(r, 500));
  const x = window.__tap(false), sr = window.__rec.sr, i0 = Math.round((tSw - window.__rec.t0) * sr) + (window.__lag || 0);
  // HF-Energie (2. Differenz) in 5-ms-Fenstern: größtes Fenster um den Wechsel gegen das größte davor
  const win = Math.round(.005 * sr), hf = []; for (let a = 0; a + win < x.length; a += win) { let s = 0; for (let i = a + 2; i < a + win; i++) { const d = x[i] - 2 * x[i - 1] + x[i - 2]; s += d * d; } hf.push(s); }
  const k0 = Math.floor(i0 / win), pre = Math.max(...hf.slice(Math.max(0, k0 - 60), k0 - 4)), at = Math.max(...hf.slice(k0 - 3, k0 + 30));
  return {held, klickDb: 10 * Math.log10(at / pre), afterDb: window.__db(x, i0 + .3 * sr, i0 + .5 * sr)};
}, live.t);
ok('BM6-02_switch_sounding', swp.held === 1 && swp.afterDb > -60 && swp.klickDb <= 6, swp);

// BM6-05 ■ (Ausklang mit τ der App), ■■/Panik (≤ 50 ms still), Mute – neues Projekt, nur die Bit-Mask-Spur
const stp = await P.evaluate(async t => {
  const Q = SYNQUENZER, sr = AU.ctx.sampleRate, out = {};
  switchProject(newProject(), {}); await new Promise(r => setTimeout(r, 300)); Q.selectTrack(t);
  soundEdit(t, 'Klangerzeugung', () => setEngine(t, 'bm')); await new Promise(r => setTimeout(r, 400));
  const E = AU.synth[t];
  window.__tap(true, E.node); await new Promise(r => setTimeout(r, 100)); Q.keyOn(60, .9, 'a'); Q.keyOn(64, .9, 'b'); await new Promise(r => setTimeout(r, 400));
  const tp = AU.ctx.currentTime; Q.panic(); await new Promise(r => setTimeout(r, 300));
  let x = window.__tap(false), i0 = Math.round((tp - window.__rec.t0) * sr) + window.__lag;
  out.vorPanik = window.__db(x, i0 - .2 * sr, i0); out.nachPanik50ms = window.__db(x, i0 + .05 * sr, i0 + .25 * sr);
  // ■ bei laufendem Transport und gehaltenen Tasten: Stimmen klingen mit τ 0,02 aus (nicht hart)
  Q.play(); await new Promise(r => setTimeout(r, 300)); window.__tap(true, E.node); Q.keyOn(60, .9, 'c'); Q.keyOn(67, .9, 'd'); await new Promise(r => setTimeout(r, 500));
  const ts = AU.ctx.currentTime; Q.stop(); await new Promise(r => setTimeout(r, 600));
  x = window.__tap(false); i0 = Math.round((ts - window.__rec.t0) * sr) + window.__lag;
  out.vorStopp = window.__db(x, i0 - .3 * sr, i0); out.stopp0bis5ms = window.__db(x, i0, i0 + .005 * sr); out.nachStopp300ms = window.__db(x, i0 + .3 * sr, i0 + .5 * sr);
  Q.keyOff('c'); Q.keyOff('d'); out.proxies = E.proxies.size;
  // Mute wie bisher (betrifft die Clip-Noten der Spur): Demo, Spur stumm -> keine Clip-Note, Knoten still; wieder an -> klingt
  switchProject(demoProject(), {first: true}); await new Promise(r => setTimeout(r, 300)); soundEdit(t, 'Klangerzeugung', () => setEngine(t, 'bm')); await new Promise(r => setTimeout(r, 400));
  const E2 = AU.synth[t]; Q.setMute(t, true); Q.clearLog(); window.__tap(true, E2.node); Q.launchScene(0); Q.play(); await new Promise(r => setTimeout(r, 1500));
  x = window.__tap(false); out.muteDb = window.__db(x, 0, x.length); out.muteClipNotes = Q.noteLog().filter(e => e.track === t && e.src === 'clip').length;
  Q.setMute(t, false); window.__tap(true, E2.node); await new Promise(r => setTimeout(r, 1500)); x = window.__tap(false); out.unmuteDb = window.__db(x, 0, x.length); Q.stop(); await new Promise(r => setTimeout(r, 300));
  Q.panic(); return out;
}, live.t);
ok('BM6-05_stop_panic_mute', stp.vorPanik > -40 && stp.nachPanik50ms < -90 && stp.vorStopp > -40 && stp.stopp0bis5ms > stp.vorStopp - 12 && stp.nachStopp300ms < -60 && stp.muteDb < -90 && stp.muteClipNotes === 0 && stp.unmuteDb > -40, stp);

// BM6-10 K1-Routen: jede Quelle genau einmal, [✕] mit Undo; INIT ohne Route
const rt = await P.evaluate(t => {
  const Q = SYNQUENZER; Q.bmInit(t); const out = {init: Q.bmRoutes(t).length};
  const set = [['a.mo.va', 30], ['a.mo.ma', 20], ['a.mo.aa', -15], ['a.l1.am', 40], ['a.l2.am', 10], ['a.o1.ds', 24], ['a.o2.ds', -8], ['a.pe.ds', 6], ['a.pe.de', -6], ['a.f.e.l', 30], ['a.g.ps', 8]];
  for (const [p, v] of set) Q.bmSet(t, p, v);
  const R_ = Q.bmRoutes(t); out.n = R_.length; out.src = R_.map(r => r.src + '>' + r.dst).join(' | ');
  const keys = R_.map(r => r.path); out.unique = new Set(keys).size === keys.length;
  const k = R_.findIndex(r => r.src === 'Δ TONHÖHE'), b0 = JSON.stringify(Q.bmGet(t)), u = UNDO.length;
  Q.bmRouteClear(t, k); out.cleared = Q.bmGet(t).a.pe.ds === 0 && Q.bmGet(t).a.pe.de === 0 && Q.bmRoutes(t).length === R_.length - 1 && UNDO.length - u === 1;
  Q.undo(); out.undo = JSON.stringify(Q.bmGet(t)) === b0;
  Q.bmSet(t, 'ly.md', 'sch'); Q.bmSet(t, 'b.l1.am', 50); out.layerB = Q.bmRoutes(t).filter(r => r.ab === 'b').length;
  return out;
}, live.t);
ok('BM6-10_routes', rt.init === 0 && rt.n === 10 && rt.unique && rt.cleared && rt.undo && rt.layerB >= 1, rt);

// BM6-11 perfProbe mit Bit-Mask-Probe
const pp = await P.evaluate(async () => { const r = await SYNQUENZER.perfProbe(['bm']); return r; });
const c = pp && pp.cases && pp.cases.find(x => x.fall === 'bm');
ok('BM6-11_perfProbe', !!c && ['voices', 'fx', 'load_med', 'load_max', 'reports', 'frames_ok', 'fps_med'].every(k => k in c) && c.voices === 10 && c.reports >= 8, {fall: c});

// BM6-12 Hilfe-Zeilen, Marke, kein Supabase
const help = await P.evaluate(() => { const h = document.documentElement.outerHTML; return {zeilen: (h.match(/\n {4}BM_NAME \+ ' · /g) || []).length, name: BM_NAME, ms: (h.match(/MS 2000/g) || []).length}; });
ok('BM6-12_help_brand', help.zeilen === 8 && help.ms === 1, help);

// BM6-07 ohne Worklet: ?engine=native
const N = await open('?engine=native');
const nat = await N.evaluate(async () => {
  ensureAudio(); await new Promise(r => setTimeout(r, 600)); const t = synthTracks()[0], Q = SYNQUENZER;
  soundEdit(t, 'Klangerzeugung', () => setEngine(t, 'bm')); Q.selectTrack(t); Q.openEditor(); await new Promise(r => setTimeout(r, 400));
  window.__tap(true); Q.keyOn(57, .9, 'n'); await new Promise(r => setTimeout(r, 500)); Q.keyOff('n'); const x = window.__tap(false);
  const eco = ED.eco && !ED.eco.hidden ? ED.eco.title : null, key = ED.ecoB ? ED.ecoB.classList.contains('eco') : false;
  return {rms: window.__db(x, 0, x.length) / 2 * 2, eco, key, toast: document.body.innerText.includes('braucht AudioWorklet'), node: !!(AU.synth[t] && AU.synth[t].bm), info: Q.bmInfo()};
});
ok('BM6-07_native', nat.rms > -40 && !nat.node && (nat.eco || nat.key || nat.toast), nat);

ok('BM6-12_no_supabase', net.length === 0, {requests: net});
ok('no_page_errors', !errs.length, {errs: errs.slice(0, 5)});
const pass = Object.values(checks).every(v => v === true || (v && v.ok === true));
console.log(JSON.stringify({test: 'bm6-int', pass, checks}, null, 1));
await b.close();
process.exit(pass ? 0 : 1);
