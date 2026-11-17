// CMD1 – Werks-Kit „Elektro-Maschine“: lädt, spielt (alle 12 Pads, Offline-Render), Speichern/Laden (Projekt-JSON + Neuladen der
// Seite), MIDI (Export Kanal 10 = Pad-Noten, Live-Note → Pad, Pedal-Hat schließt offene Hat), Klänge im Instrument-Browser, Fotos.
// Aufruf: node cmd1-test.mjs <index.html (absolut)> [fotos-ordner]
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2]; if (!file) { console.log('Aufruf: node cmd1-test.mjs <index.html> [fotos]'); process.exit(2); }
const FOT = process.argv[3] || null;
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const res = []; const ok = (name, cond, info) => { res.push({name, ok: !!cond}); console.log((cond ? 'OK     ' : 'FEHLER ') + name + (info !== undefined ? ' · ' + JSON.stringify(info) : '')); };
const N = 'Elektro-Maschine';
async function page(vp) {
  const ctx = await b.newContext({viewport: vp || {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1800);
  await p.evaluate(() => {
    window.__W = ms => new Promise(r => setTimeout(r, ms));
    window.__R = async bars => { ensureAudio(); drumBufs(); const MR = Math.random; Math.random = () => .3125; try { VV.cancel = false; const r = await vvRenderAudio({range: {a: 0, b: bars || 2, sel: false}}); return {L: Float32Array.from(r.ch[0]), R: Float32Array.from(r.ch[1]), sr: r.sr || 44100}; } finally { Math.random = MR; } };
    window.__same = (A, B) => { const bad = []; for (const k in B) { const a = A[k], v = B[k]; if (typeof v === 'number' ? Math.abs(a - v) > 1e-9 : a !== v) bad.push(k + ':' + a + '≠' + v); } return bad; };
  });
  return {ctx, p, errs};
}

// T1 – Kit-Eintrag, Name, Vorbild-Zeile, Browser-Liste, 12 Klänge
{ const {ctx, p, errs} = await page();
  const r = await p.evaluate((N) => ({
    names: KIT_NAMES.length, once: KIT_NAMES.filter(n => n === N).length, ref: KIT_REF[N] || null,
    fac: DRUM_FACTORY.filter(f => f.name === N).map(f => f.id), byId: FACTORY_BY_ID.has('f-kit-elektro-maschine'),
    list: kitList().some(k => k.name === N && !k.off), data: Object.keys(KIT_DATA()[N] || {}).length,
    voices: (typeof slotSources === 'function' ? slotSources('kick') : []).filter(x => x.kit === N).length,
    others: ['808', '909', 'Rom Pop', 'Disko 85'].every(n => KIT_NAMES.includes(n)),
    brand: /micro|sonic|classic|machine|electro kit|sin v|roland|korg/i.test(JSON.stringify(cmdKitData()) + (KIT_REF[N] || '') + DRUM_FACTORY.find(f => f.name === N).tip)}), N);
  ok('T1a Kit genau einmal in der Werksliste (jetzt 8 Werks-Kits)', r.once === 1 && r.names === 8 && r.others, r);
  ok('T1b Kit-Eintrag im Reiter Kits + ladbar per id + Vorbild-Zeile', r.fac.length === 1 && r.byId && r.list && !!r.ref, r);
  ok('T1c 12 Stimmen-Daten + Klang im Instrument-Browser (Elektro-Maschine · KICK)', r.data === 12 && r.voices === 1, r);
  ok('T1d keine Marken-/Gerätenamen in Kit-Daten, Tipp und Vorbild', !r.brand, r);
  ok('T1e Start ohne Fehler', errs.length === 0, errs.slice(0, 3));
  await ctx.close(); }

// T2/T3/T5 – laden, spielen, MIDI
{ const {ctx, p, errs} = await page();
  const r = await p.evaluate(async (N) => {
    const o = {}; ensureAudio(); drumBufs(); await __W(300);
    o.name = SYNQUENZER.loadKit(N); await __W(200);
    o.origin = drumSnd().origin;
    const K = cmdKitData(); o.bad = [];
    for (const sl of DRUM_VOICES) { const P = slotParams(sl.id), want = Object.assign({}, K[sl.id]); o.bad.push(...__same(P, want).map(x => sl.id + '.' + x)); }
    // spielt: jedes Pad erzeugt Quellen (Audition über die echte drumHit-Kette)
    o.pads = DRUM_VOICES.map(sl => { const h = drumHit(sl.gm, .8, AU.ctx.currentTime + .05, 'audition'); return h && h.srcs && h.srcs.length ? 1 : 0; });
    // Pedal-Hat (SHAKER, Choke 1) schließt die offene Hat
    const t = AU.ctx.currentTime + .1; drumHit(46, .8, t, 'audition'); const h2 = drumHit(70, .8, t + .05, 'audition'); o.choke = h2 && h2.chokes ? h2.chokes.length : -1;
    // Live-MIDI: Noten der Pads landen auf demselben Pad
    o.live = DRUM_VOICES.every(sl => padGmForNote(sl.gm) === sl.gm);
    // Offline-Render: Demo-Szene mit diesem Kit vs. 909
    const A = await __R(2); let e = 0, nan = 0; for (const c of ['L', 'R']) for (const v of A[c]) { if (!isFinite(v)) nan++; e += v * v; }
    o.rmsDb = Math.round(10 * Math.log10(e / (2 * A.L.length) + 1e-30) * 10) / 10; o.nan = nan;
    o.peak = Math.round(20 * Math.log10(Math.max(...A.L.map(Math.abs), 1e-9)) * 10) / 10;
    SYNQUENZER.loadKit('909'); await __W(200); const B = await __R(2); let d = 0, eb = 0; for (let k = 0; k < Math.min(A.L.length, B.L.length); k++) { const q = A.L[k] - B.L[k]; d += q * q; eb += B.L[k] * B.L[k]; }
    o.diff909 = Math.round(10 * Math.log10(d / Math.max(eb, 1e-20)) * 10) / 10;
    SYNQUENZER.loadKit(N); await __W(200);
    // MIDI-Export: Drum-Spur auf Kanal 10, nur Pad-Noten
    const m = buildMidi({mode: 'scene', scene: R.selS}); const by = m && m.bytes ? m.bytes : null; const ns = new Set();
    if (by) for (let i = 0; i + 2 < by.length; i++) if (by[i] === 0x99 && by[i + 2] > 0 && by[i + 1] < 128) ns.add(by[i + 1]);
    o.midiNotes = [...ns].sort((a, b) => a - b); o.midiOk = o.midiNotes.length > 0 && o.midiNotes.every(n => DRUM_GMS.includes(n));
    o.drumNotes = (S.tracks[DRUM_T].clips[R.selS] || {notes: []}).notes.length;
    return o;
  }, N);
  ok('T2a Kit lädt (Name + Herkunft)', r.name === N && r.origin === 'f-kit-elektro-maschine', {name: r.name, origin: r.origin});
  ok('T2b alle 12 Pads tragen genau die Kit-Werte', r.bad.length === 0, r.bad.slice(0, 6));
  ok('T3a jedes der 12 Pads spielt', r.pads.every(x => x === 1), r.pads);
  ok('T3b Demo-Szene klingt (Pegel, keine NaN) und anders als 909', r.nan === 0 && r.rmsDb > -45 && r.peak < 0 && r.diff909 > -20, {rms: r.rmsDb, peak: r.peak, d909: r.diff909, nan: r.nan});
  ok('T3c Pedal-Hat (SHAKER) schließt die offene Hat', r.choke >= 1, r.choke);
  ok('T5a MIDI-Export: Drum-Spur auf Kanal 10, nur Pad-Noten', r.midiOk || r.drumNotes === 0, {notes: r.midiNotes, clip: r.drumNotes});
  ok('T5b Live-MIDI: Pad-Note spielt dasselbe Pad', r.live);
  ok('T2c ohne Fehler', errs.length === 0, errs.slice(0, 3));
  await ctx.close(); }

// T4 – Speichern/Laden: Projekt-JSON hin und zurück, und Seite neu laden (Autosave)
{ const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + file); await p.waitForTimeout(1800);
  const r1 = await p.evaluate(async (N) => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    SYNQUENZER.loadKit(N); await w(200); drumSet('kick', 'frq', 61.5);   // eigene Änderung muss mit
    const j = serializeProject(), P = JSON.parse(j), d = P.tracks[DRUM_T].sound;
    SYNQUENZER.loadKit('808'); await w(150); const mid = drumSnd().name;
    applyProject(JSON.parse(j), {}); await w(300);
    const back = drumSnd().name, kf = slotParams('kick').frq, hc = slotParams('hatC').mDec;
    try { if (autosave && autosave.flush) await autosave.flush(); } catch (e) {}
    await w(800);
    return {jsonName: d.name, jsonKick: d.p.slots.kick.frq, mid, back, kf, hc, want: cmdKitData().hatC.mDec};
  }, N).catch(e => ({err: String(e)}));
  ok('T4a Projekt-JSON trägt Kit + eigene Änderung, Laden stellt es wieder her', r1.jsonName === N && r1.jsonKick === 61.5 && r1.mid === '808' && r1.back === N && r1.kf === 61.5 && Math.abs(r1.hc - r1.want) < 1e-9, r1);
  await p.reload(); await p.waitForTimeout(2200);
  const r2 = await p.evaluate(() => ({name: drumSnd().name, kf: slotParams('kick').frq, origin: drumSnd().origin})).catch(e => ({err: String(e)}));
  ok('T4b nach Neuladen der Seite: Kit + Änderung noch da', r2.name === N && r2.kf === 61.5, r2);
  ok('T4c ohne Fehler', errs.length === 0, errs.slice(0, 3));
  await ctx.close(); }

// Fotos: Kit-Browser (Reiter Kits) und Drum-Editor Seite KIT, hochkant + quer
if (FOT) for (const [w, h, tag] of [[428, 926, 'hoch'], [926, 428, 'quer']]) {
  const {ctx, p} = await page({width: w, height: h});
  await p.evaluate((N) => { SYNQUENZER.loadKit(N); }, N); await p.waitForTimeout(300);
  await p.evaluate(() => { try { openBrowser(DRUM_T); } catch (e) {} }); await p.waitForTimeout(700);
  await p.evaluate((N) => { const el = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && e.textContent.trim() === N && e.offsetParent); if (el) el.scrollIntoView({block: 'center'}); }, N);
  await p.waitForTimeout(300); await p.screenshot({path: FOT + '/cmd1-browser-' + tag + '.png'});
  await ctx.close();
}
const bad = res.filter(x => !x.ok);
console.log(bad.length ? 'FEHLER: ' + bad.length + ' von ' + res.length : 'ALLE OK: ' + res.length);
await b.close();
process.exit(bad.length ? 1 : 0);
