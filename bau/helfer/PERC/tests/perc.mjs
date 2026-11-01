// PERC – Perkussionsspur (North auf einer Synth-Spur): Funktionstests in Chromium.
// Aufruf: node perc.mjs [app.html] [base.html]  → druckt eine JSON-Zeile je Test und am Ende {ok, fail}
import { chromium } from 'playwright';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = process.argv[2] || path.resolve(HERE, '../index.html');
const BASE = process.argv[3] || path.resolve(HERE, '../../../snapshots/R-4300.html');
const res = []; const out = (name, ok, info) => { res.push({name, ok: !!ok}); console.log(JSON.stringify({test: name, ok: !!ok, info})); };

async function open(file, o = {}) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const p = await b.newPage({viewport: {width: o.w || 428, height: o.h || 926}});
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1500);
  await p.mouse.click(5, 300);
  await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 10000}).catch(() => {});
  await p.waitForTimeout(300);
  return {b, p, errs};
}
const {b, p, errs} = await open(APP);
const T6 = 5, T4 = 3;                         // Spur 6 (Index 5, MELODIE) und Synth 4 (Index 3, folgt)

// 1) North auf Spur 6 über die Bedienung (⋯ → North) wählen; Undo-Zähler +1; follow aus, gemerkt
{
  const r = await p.evaluate(async T => {
    const A = SYNQUENZER; A.selectTrack(T); A.openEditor(); await new Promise(r => setTimeout(r, 400));
    const n0 = A.undoInfo().n, f0 = S.tracks[T].follow;
    const more = [...document.querySelectorAll('#synthSheet .edm')].find(b => b.offsetParent);
    more.click(); await new Promise(r => setTimeout(r, 200));
    const nb = document.querySelector('.pop button[data-a="north"]'); const has = !!nb; if (nb) nb.click();
    await new Promise(r => setTimeout(r, 600));
    const tr = S.tracks[T];
    return {has, eng: tr.sound.engine, kit: tr.sound.p.nk && tr.sound.p.nk.kit, ch: tr.sound.p.nk && tr.sound.p.nk.ch.length, follow: tr.follow, percF: tr.percF, f0, undo: A.undoInfo().n - n0, top: A.undoInfo().top,
      tab: document.querySelector('#synthSheet .sh-tabs .on, #synthSheet .stab.on') ? document.querySelector('#synthSheet .sh-tabs .on, #synthSheet .stab.on').textContent : null, cells: document.querySelectorAll('#synthSheet .perccell').length,
      chip: (document.querySelector('#synthSheet .engchip button') || {}).textContent, info: A.percInfo()};
  }, T6);
  out('north-waehlen-spur6', r.has && r.eng === 'north' && r.ch === 12 && r.follow === false && r.percF && r.undo === 1 && r.cells === 12, r);
}
// 2) Noten lösen die richtigen Kanäle aus (Tastatur → Schlag-Log + Worklet-Abfrage)
{
  const r = await p.evaluate(async T => {
    const A = SYNQUENZER; A.selectTrack(T); A.percLogClear(); A.closeEditor();
    await new Promise(r => setTimeout(r, 300));
    for (const n of [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 49]) { A.keyOn(n); await new Promise(r => setTimeout(r, 25)); A.keyOff(n); }
    await new Promise(r => setTimeout(r, 120));
    const log = A.percLog(), q = await A.percQuery(T, 'state');
    return {log: log.map(e => [e.note, e.ch, e.tune]), voices: q && q.state && q.state.voices, info: A.percInfo().tracks};
  }, T6);
  const want = [[60, 0, 0], [61, 1, 0], [62, 2, 0], [63, 3, 0], [64, 4, 0], [65, 5, 0], [66, 6, 0], [67, 7, 0], [68, 8, 0], [69, 9, 0], [70, 10, 0], [71, 11, 0], [72, 0, 12], [49, 1, -12]];
  const okLog = JSON.stringify(r.log) === JSON.stringify(want);
  const sounding = r.voices ? r.voices.filter(v => v > 0).length : 0;
  out('noten-kanaele', okLog && sounding >= 6 && r.info[0] && r.info[0].connected, {log: r.log, voices: r.voices, sounding, info: r.info});
}
// 3) Clip auf der North-Spur spielt; Akkord-Transposition (Träger) + Eine Skala ändern die North-Spur nicht, Synth 4 schon
{
  const r = await p.evaluate(async ([T, T4]) => {
    const A = SYNQUENZER;
    A.setClip(T, 0, {len: 1, notes: [0, 1, 2, 3].map(k => ({t: k, d: .25, n: [60, 62, 64, 66][k], v: .9}))});
    const before = [60, 62, 64, 66].map(n => A.outPitch(T, n)), b4 = [60, 62, 64, 66].map(n => A.outPitch(T4, n));
    A.setKbMode('transpose'); A.keyOn(62); A.keyOn(65); A.keyOn(69); await new Promise(r => setTimeout(r, 200)); A.keyOff(62); A.keyOff(65); A.keyOff(69);
    await new Promise(r => setTimeout(r, 200));
    A.oneScale(true);
    const after = [60, 62, 64, 66].map(n => A.outPitch(T, n)), a4 = [60, 62, 64, 66].map(n => A.outPitch(T4, n));
    A.percLogClear(); A.launchClip(T, 0); A.play(); await new Promise(r => setTimeout(r, 2600)); A.stop();
    await new Promise(r => setTimeout(r, 300));
    const log = A.percLog().filter(e => e.track === T && e.src === 'clip').map(e => [e.note, e.ch, e.tune]);
    const tg = T.targetAt ? null : null; A.oneScale(false); A.setKbMode('play'); A.resetCarrier && A.resetCarrier();
    return {before, after, b4, a4, log: log.slice(0, 8)};
  }, [T6, T4]);
  const same = JSON.stringify(r.before) === JSON.stringify(r.after), moved = JSON.stringify(r.b4) !== JSON.stringify(r.a4);
  const chOk = r.log.length >= 4 && r.log.slice(0, 4).every((e, k) => e[1] === [0, 2, 4, 6][k] && e[2] === 0);
  out('akkord-transposition-north-unveraendert', same && moved && chOk, r);
}
// 4) Schild „folgt nicht“ am Spurkopf sichtbar und innerhalb des Kopfes
{
  const r = await p.evaluate(async T => {
    UI.dirty.all = true; await new Promise(r => setTimeout(r, 300));
    const h = document.querySelector('.th[data-t="' + T + '"]'), fb = h && h.querySelector('.fb'); if (!fb) return null;
    const a = h.getBoundingClientRect(), c = fb.getBoundingClientRect();
    return {txt: fb.textContent, cls: fb.className, w: c.width, h: c.height, inside: c.left >= a.left - .5 && c.right <= a.right + .5 && c.top >= a.top - .5 && c.bottom <= a.bottom + .5, vis: getComputedStyle(fb).display !== 'none' && c.width > 0, sb: h.querySelector('.sb').textContent};
  }, T6).catch(e => ({err: String(e)}));
  out('schild-folgt-nicht', r && r.txt === 'folgt nicht' && /percfb/.test(r.cls) && r.vis && r.inside, r);
}
// 5) Synth 4 (folgt): Wechsel auf North → follow aus; Schild abschalten = 1 Undo; zurück auf VA → follow wieder an; Undo je Wechsel
{
  const r = await p.evaluate(async T => {
    const A = SYNQUENZER, tr = () => S.tracks[T], st = () => ({eng: tr().sound.engine, follow: tr().follow, percF: tr().percF || null});
    const s0 = st(), u0 = A.undoInfo().n, snd0 = JSON.stringify(tr().sound);
    const sw = e => { const bf = soundSnapshot(T); setEngine(T, e); commitSound(T, bf, 'Klangerzeugung'); };   // wie die Engine-Wahl im Kopf (engChip / ⋯)
    sw('north'); const s1 = st(), u1 = A.undoInfo().n;
    A.percFollow(T, true); const s2 = st(), u2 = A.undoInfo().n;
    A.undo(); const s3 = st();
    sw('analog'); const s4 = st(), u4 = A.undoInfo().n, snd4 = JSON.stringify(tr().sound);
    A.undo(); const s5 = st(); A.undo(); const s6 = st(); const snd6 = JSON.stringify(tr().sound);
    A.redo(); const s7 = st(); A.redo(); const s8 = st();
    return {s0, s1, s2, s3, s4, s5, s6, s7, s8, du1: u1 - u0, du2: u2 - u1, du4: u4 - u2 + 1, lossless: snd0 === snd4, back: snd0 === snd6};
  }, T4);
  const ok = r.s0.follow === true && r.s1.eng === 'north' && r.s1.follow === false && r.s1.percF && r.s1.percF.f === true && r.du1 === 1 && r.s2.follow === true && r.du2 === 1 && r.s3.follow === false &&
    r.s4.eng === 'analog' && r.s4.follow === true && !r.s4.percF && r.s5.eng === 'north' && r.s5.follow === false && r.s6.eng === 'analog' && r.s6.follow === true && r.s7.eng === 'north' && r.s7.follow === false && r.s8.eng === 'analog' && r.s8.follow === true && r.lossless && r.back;
  out('zurueck-follow-undo', ok, r);
}
// 6) Speichern / Laden: deep-equal (Projekt-Datei), North-Block und percF bleiben
{
  const r = await p.evaluate(async ([T, T4]) => {
    const A = SYNQUENZER; const sw = (t, e) => { const bf = soundSnapshot(t); setEngine(t, e); commitSound(t, bf, 'Klangerzeugung'); }; sw(T4, 'north');
    A.percProgram(T4, 3, MDX.progs.find(x => x.mCat === 'Pc').mName);
    const j1 = A.serialize(); const o1 = JSON.parse(j1);
    await A.importJSON(j1); await new Promise(r => setTimeout(r, 500));
    const o2 = JSON.parse(A.serialize()); delete o1.saved; delete o2.saved;
    const deq = (a, b) => JSON.stringify(a, Object.keys(a).sort ? undefined : undefined) === JSON.stringify(b);
    const sortK = x => Array.isArray(x) ? x.map(sortK) : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().map(k => [k, sortK(x[k])])) : x;
    const t1 = o1.project.tracks[T4], t2 = o2.project.tracks[T4];
    return {deep: JSON.stringify(sortK(o1)) === JSON.stringify(sortK(o2)), str: JSON.stringify(o1) === JSON.stringify(o2), eng: t2.sound.engine, nk: !!t2.sound.p.nk, percF: t2.percF, follow: t2.follow, ch3: t2.sound.p.nk.ch[3].mName, live: S.tracks[T4].sound.engine};
  }, [T6, T4]);
  out('speichern-laden-deep-equal', r.deep && r.eng === 'north' && r.nk && r.percF && r.follow === false && r.live === 'north', r);
}
// 7) Bibliothek: sichern → auf VA → laden = derselbe North-Klang, follow wieder aus
{
  const r = await p.evaluate(async T => {
    const A = SYNQUENZER; await A.libraryReady();
    const nk0 = JSON.stringify(S.tracks[T].sound.p.nk);
    const s = await A.saveSound(T, 'Perc Probe', 'new');
    const sw = e => { const bf = soundSnapshot(T); setEngine(T, e); commitSound(T, bf, 'Klangerzeugung'); }; sw('analog');
    const f1 = S.tracks[T].follow;
    A.loadPreset(T, 'Perc Probe');
    const tr = S.tracks[T];
    const rec = A.library().find(x => x.name === 'Perc Probe');
    return {rec: rec && rec.engine, recNk: !!(rec && rec.p && rec.p.nk), eng: tr.sound.engine, same: JSON.stringify(tr.sound.p.nk) === nk0, f1, follow: tr.follow};
  }, T4);
  out('bibliothek', r.rec === 'north' && r.recNk && r.eng === 'north' && r.same && r.f1 === true && r.follow === false, r);
}
// 8) MIDI-Export: North-Spur (Synth 4) auf Kanal 10 mit den GM-Noten der Pad-Rolle
{
  const r = await p.evaluate(T => {
    const A = SYNQUENZER;
    A.setClip(T, 0, {len: 1, notes: [0, 1, 2, 3].map(k => ({t: k, d: .25, n: [60, 61, 64, 69][k], v: .9}))});
    const m = A.buildMidi({mode: 'scene', scene: 0}); const by = m.bytes;
    // MTrk-Blöcke zerlegen, Note-On-Ereignisse je Block
    let i = 14; const trk = [];
    while (i < by.length) { const len = (by[i + 4] << 24) | (by[i + 5] << 16) | (by[i + 6] << 8) | by[i + 7]; trk.push(by.slice(i + 8, i + 8 + len)); i += 8 + len; }
    const ons = d => { const o = []; for (let k = 0; k < d.length - 2; k++) if ((d[k] & 0xF0) === 0x90 && d[k + 2] > 0 && d[k + 1] < 128) o.push([d[k] & 15, d[k + 1]]); return o; };
    const pc = d => { for (let k = 0; k < d.length - 1; k++) if ((d[k] & 0xF0) === 0xC0 && (d[k] & 15) === T) return true; return false; };
    const t = trk[1 + T];
    return {n: trk.length, ons: ons(t).slice(0, 4), pc: pc(t), gm: [60, 61, 64, 69].map(n => A.percMap(n).gm)};
  }, T4);
  out('midi-kanal10-gm', JSON.stringify(r.ons) === JSON.stringify(r.gm.map(g => [9, g])) && !r.pc, r);
}
// 9) Video-Offline-Render: North-Spur hörbar (gegen stumm geschaltet), zweimal gleich; Live-Zustand danach unverändert
{
  const r = await p.evaluate(async T => {
    const A = SYNQUENZER; A.vvTest({});
    A.setClip(T, 0, {len: 1, notes: [0, .5, 1, 1.5, 2, 2.5, 3, 3.5].map((t, k) => ({t, d: .2, n: [60, 64, 62, 64, 60, 64, 62, 69][k], v: .95}))});
    for (let i = 0; i < NT(); i++) if (i !== T) S.tracks[i].mute = true;
    A.setSong({bars: 2, lanes: S.tracks.map((_, i) => i === T ? [{bar: 0, slot: 0}] : []), carrier: [], mel: {}, marks: []});
    const live0 = A.percInfo().tracks.find(x => x.i === T);
    const pcm = () => { const x = A.vvPcm(0, null); const u = Uint8Array.from(atob(x.b64), c => c.charCodeAt(0)); return new Int16Array(u.buffer); };
    const cmp = (a, b) => { let n = 0, mx = 0; for (let j = 0; j < Math.min(a.length, b.length); j++) { const d = Math.abs(a[j] - b[j]); if (d) n++; if (d > mx) mx = d; } return {n, mx, len: a.length === b.length}; };
    const r1 = await A.vvRender({range: {a: 0, b: 2}}); const p1 = pcm();
    const r2 = await A.vvRender({range: {a: 0, b: 2}}); const p2 = pcm(); const same = cmp(p1, p2);
    S.tracks[T].mute = true; const r3 = await A.vvRender({range: {a: 0, b: 2}}); S.tracks[T].mute = false;
    for (let i = 0; i < NT(); i++) S.tracks[i].mute = false;
    const live1 = A.percInfo().tracks.find(x => x.i === T);
    const hits = (r1.log || []).filter(e => e.track === T).length;
    return {rms1: r1.rms, peak1: r1.peak, rms2: r2.rms, rmsMute: r3.rms, same, hits, live0: live0 && live0.st, live1: live1 && live1.st, conn: live1 && live1.connected};
  }, T4);
  out('offline-render-hoerbar', r.rms1 > 4 * Math.max(r.rmsMute, 1e-5) && r.peak1 > .02 && r.same.len && r.same.mx <= 1 && r.same.n < 50 && r.hits >= 8 && r.live1 === 'ready' && r.conn, r);
}
// 10) Konsolidieren: der Bereich wird ein neuer Teil, die North-Spur klingt im Render gleich
{
  const r = await p.evaluate(async T => {
    const A = SYNQUENZER; for (let i = 0; i < NT(); i++) if (i !== T) S.tracks[i].mute = true;
    const pcm = () => { const x = A.vvPcm(0, null); const u = Uint8Array.from(atob(x.b64), c => c.charCodeAt(0)); return new Int16Array(u.buffer); };
    const cmp = (a, b) => { let n = 0, mx = 0; for (let j = 0; j < Math.min(a.length, b.length); j++) { const d = Math.abs(a[j] - b[j]); if (d) n++; if (d > mx) mx = d; } return {n, mx, len: a.length === b.length}; };
    await A.vvRender({range: {a: 0, b: 2}}); const a = pcm();
    let k = null; try { k = A.konsolidieren(0, 2, 'P'); } catch (e) { k = String(e); }
    await A.vvRender({range: {a: 0, b: 2}}); const b2 = pcm();
    for (let i = 0; i < NT(); i++) S.tracks[i].mute = false;
    return {k: k && typeof k === 'object' ? Object.keys(k) : k, same: cmp(a, b2), eng: S.tracks[T].sound.engine, follow: S.tracks[T].follow};
  }, T4);
  out('konsolidieren-gleich', r.same.len && r.same.mx <= 1 && r.same.n < 50 && r.eng === 'north' && r.follow === false, r);
}
// 10b) GarageBand-Export (Instrumental-WAV, derselbe Offline-Weg): die North-Spur ist im WAV, stumm geschaltet nicht
{
  const r = await p.evaluate(async T => {
    const A = SYNQUENZER; for (let i = 0; i < NT(); i++) if (i !== T) S.tracks[i].mute = true;
    const lvl = () => { const w = A.ggbWav(); if (!w) return null; const u = Uint8Array.from(atob(w.b64), c => c.charCodeAt(0)); const dv = new DataView(u.buffer); let o = 12, data = -1, len = 0, bits = 16;
      while (o < u.length - 8) { const id = String.fromCharCode(u[o], u[o + 1], u[o + 2], u[o + 3]), n = dv.getUint32(o + 4, true); if (id === 'fmt ') bits = dv.getUint16(o + 22, true); if (id === 'data') { data = o + 8; len = n; break; } o += 8 + n + (n & 1); }
      let pk = 0; const step = bits / 8; for (let k = data; k < data + len - step + 1; k += step) { const v = bits === 16 ? Math.abs(dv.getInt16(k, true)) / 32768 : bits === 24 ? Math.abs((dv.getUint8(k) | (dv.getUint8(k + 1) << 8) | (dv.getInt8(k + 2) << 16))) / 8388608 : Math.abs(dv.getFloat32(k, true)); if (v > pk) pk = v; }
      return {name: w.name, bits, peak: pk}; };
    let e1 = null, e2 = null;
    try { await A.ggbExport({range: {a: 0, b: 2}, pre: 0, remember: false}); e1 = lvl(); } catch (e) { e1 = 'ERR ' + e.message; }
    S.tracks[T].mute = true;
    try { await A.ggbExport({range: {a: 0, b: 2}, pre: 0, remember: false}); e2 = lvl(); } catch (e) { e2 = 'ERR ' + e.message; }
    for (let i = 0; i < NT(); i++) S.tracks[i].mute = false;
    return {on: e1, off: e2};
  }, T4);
  out('garageband-export', r.on && r.off && r.on.peak > .02 && r.off.peak < r.on.peak / 20, r);
}
// 11) CPU: Drum-Spur mit 12 North-Pads + eine North-Spur (16tel) live, Last aus den Berichten der Engine
{
  const r = await p.evaluate(async T => {
    const A = SYNQUENZER;
    for (const id of ['kick', 'snare', 'rim', 'clap', 'hatC', 'hatO', 'tomL', 'tomM', 'tomH', 'cym', 'perc', 'shaker']) A.setPadSource(id, 'md');
    const pat = []; for (let k = 0; k < 16; k++) pat.push({t: k / 4, d: .2, n: 60 + (k % 12), v: .8});
    A.setClip(T, 0, {len: 4, notes: pat.flatMap(n => [0, 1, 2, 3].map(b => Object.assign({}, n, {t: b + n.t})))});
    const dr = []; for (let k = 0; k < 16; k++) dr.push({t: k / 4, d: .25, n: [36, 42, 38, 42][k % 4], v: .8});
    A.setClip(4, 0, {len: 1, notes: dr});
    A.launchScene(0); A.play(); await new Promise(r => setTimeout(r, 1500));
    const S1 = []; for (let k = 0; k < 12; k++) { await new Promise(r => setTimeout(r, 500)); const m = A.mdInfo(), q = A.percInfo().tracks.find(x => x.i === T); S1.push({md: m.live ? m.live.load : 0, perc: q ? q.load : 0, all: MDX.cpu()}); }
    A.stop();
    const avg = k => S1.reduce((s, x) => s + x[k], 0) / S1.length, mx = k => Math.max(...S1.map(x => x[k]));
    return {drumAvg: +avg('md').toFixed(4), percAvg: +avg('perc').toFixed(4), allAvg: +avg('all').toFixed(4), allMax: +mx('all').toFixed(4), nodes: MDX.info().nodes, late: MDX.info().late};
  }, T4);
  out('cpu-messung', r.nodes >= 2 && r.allAvg < .5, r);
}
// 12) Rolle: Kanal-Namen statt Notennamen (rowName), Drum-Spur unverändert
{
  const r = await p.evaluate(async T => {
    const A = SYNQUENZER; A.closeEditor(); A.openRoll(T, 0); await new Promise(r => setTimeout(r, 500));
    const rn = [60, 61, 71, 72, 59, 47].map(n => A.percRow(n));
    const open = R.editor; A.closeRoll && A.closeRoll();
    return {rn, open, drum: S.tracks[4].kind, drumEng: S.tracks[4].sound.engine};
  }, T4);
  out('rolle-kanalnamen', r.rn[0] === 'KICK' && r.rn[1] === 'SNARE' && r.rn[2] === 'SHAK.' && r.rn[3] === 'KICK +1' && r.rn[4] === 'SHAK. −1' && r.rn[5] === 'SHAK. −2' && r.drum === 'drum' && r.drumEng === 'drum', r);
}
out('keine-js-fehler', errs.length === 0, errs.slice(0, 5));
await b.close();

// 13) Alte Projekte Zeichen für Zeichen gleich: feste Projekt-Dateien (Demo; jede Engine; Drum-Spur mit North-Pads) in R-4300 und hier
//     geladen, gespeichert, Engines gewechselt, wieder geladen – jede Zwischenstufe als Zeichenkette verglichen
{
  const mk = async file => { const {b, p} = await open(file); const r = await p.evaluate(async () => {
    const A = SYNQUENZER; const o = [A.serialize()];
    for (const [t, e] of [[0, 'fm6'], [1, 'wt'], [2, 'mk'], [3, 'analog']]) setEngine(t, e);
    A.setPadSource('kick', 'md'); A.setPadSource('hatC', 'md');
    o.push(A.serialize()); return o; }); await b.close(); return r; };
  const files = await mk(BASE);
  const job = async file => { const {b, p} = await open(file); const r = await p.evaluate(async files => {
    const A = SYNQUENZER, o = [];
    for (const j of files) {
      await A.importJSON(j); await new Promise(r => setTimeout(r, 400)); o.push(A.serialize());
      for (const [t, e] of [[0, 'analog'], [1, 'fm6'], [2, 'wt'], [3, 'mk']]) setEngine(t, e);
      o.push(A.serialize()); o.push(JSON.stringify(Object.fromEntries([0, 1, 2, 3, 5].map(t => [t, soundSnapshot(t)]))));
    }
    return o.map(s => { try { const x = JSON.parse(s); if (x && x.saved) delete x.saved; return JSON.stringify(x); } catch (e) { return s; } });
  }, files); await b.close(); return r; };
  const a = await job(BASE), c = await job(APP);
  out('alte-projekte-gleich', a.length === c.length && a.every((s, k) => s === c[k]), {n: a.length, len: a.map(s => s.length), eq: a.map((s, k) => s === c[k])});
}
const fail = res.filter(x => !x.ok).map(x => x.name);
console.log(JSON.stringify({ok: res.length - fail.length, fail}));
process.exit(fail.length ? 1 : 0);
