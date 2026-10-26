// QA G-MK4: undo/redo of every new effect action (touch) step by step against snapshots, live engine + panel follow undo,
// then save/load: serialize → importJSON, file export, reload (autosave), library after reload, echo after reload
import {open, sleep, OUT, check, done, eq, diff} from './vgmk34-tl4.mjs';
import fs from 'fs';
const L = process.argv[2] === 'L';
const T = await open({viewport: L ? {width: 844, height: 390} : {width: 390, height: 844}}); const {p, E, errs} = T;
T.knobList = async (k, re) => { await T.tapMk(k, 300); const r = await T.tapPop(re); await sleep(600); return r ? 'ok' : 'no list item ' + re + ' ' + JSON.stringify(await T.popTexts()); };
const proj = () => E(() => { const pr = SYNQUENZER.project(); const P = JSON.parse(JSON.stringify(pr.project || pr)); delete P.ui; if (P.settings) delete P.settings.coach; return P; });
const fx = () => E(() => { const m = SYNQUENZER.mkGet(0); return m ? {mfx: m.mfx, dly: m.dly, eq: m.eq} : null; });
const echo = () => E(async () => { const c = AU.ctx, node = AU.tracks[0].trackIn, sp = c.createScriptProcessor(1024, 2, 2), z = c.createGain(); z.gain.value = 0; const Lb = [], Rb = []; sp.onaudioprocess = e => { Lb.push(Float32Array.from(e.inputBuffer.getChannelData(0))); Rb.push(Float32Array.from(e.inputBuffer.getChannelData(1))); }; node.connect(sp); sp.connect(z); z.connect(c.destination);
  await new Promise(r => setTimeout(r, 100)); SYNQUENZER.keyOn(60, .8); await new Promise(r => setTimeout(r, 40)); SYNQUENZER.keyOff(60); await new Promise(r => setTimeout(r, 1400)); try { node.disconnect(sp); } catch (e) {} sp.disconnect();
  const cat = A => { const N = A.reduce((a, b) => a + b.length, 0), x = new Float32Array(N); let o = 0; for (const b of A) { x.set(b, o); o += b.length; } return x; }; const l = cat(Lb), r = cat(Rb);
  let mx = 0; for (const v of l) mx = Math.max(mx, Math.abs(v)); let i0 = 0; while (i0 < l.length && Math.abs(l[i0]) < .1 * mx) i0++; i0 = Math.max(0, i0 - 64);
  const m = SYNQUENZER.mkGet(0), bpm = SYNQUENZER.runtime().bpm, D = m.dly.sync ? [1/32, 1/24, 1/16, 1/12, 3/32, 1/8, 1/6, 3/16, 1/4, 1/3, 3/8, 1/2, 2/3, 3/4, 1][m.dly.note] * 240 / bpm : Math.pow(2, 10.45 * m.dly.time / 127) / 1000;
  const sr = c.sampleRate, Dn = Math.round(D * sr), W = Math.round(.02 * sr); let a = 0, e = 0, f = 0; for (let i = 0; i < W; i++) { a += l[i0 + i] ** 2 + r[i0 + i] ** 2; e += l[i0 + Dn + i] ** 2 + r[i0 + Dn + i] ** 2; }
  return {mx: +mx.toFixed(3), echo: +(10 * Math.log10(e / a + 1e-30)).toFixed(1), D: +D.toFixed(4)}; });
const snaps = [], labels = [];
const step = async (label, fn) => { const u0 = await T.undoN(); let r; try { r = await fn(); } catch (e) { r = 'ERR ' + e.message; } await sleep(150); const u1 = await T.undoN(); snaps.push(await proj()); labels.push({label, du: u1 - u0, r: typeof r === 'object' ? JSON.stringify(r).slice(0, 100) : r, fx: await fx(), k2: (await T.panel() || {knobs: []}).knobs.map(k => k && k.l).join('|')}); console.log('step', label, 'undo +' + (u1 - u0), r === undefined ? '' : JSON.stringify(r).slice(0, 120)); };
await E(() => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); ensureAudio(); });
snaps.push(await proj()); labels.push({label: 'start'});
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(500);
await step('engine → MS 2000 (touch)', async () => { const r = await T.tapTxt('button', /^MS ?2000$/); await sleep(500); return !!r; });
await step('EDIT-WAHL 2 list → 5 MOD-FX (navigation, no undo)', () => T.w2(/^5 MOD-FX/));
await step('MOD-FX TYP list → Ensemble', () => T.knobList('k0', /^Ensemble$/));
await step('MOD-FX TIEFE drag up', () => T.sweep('k2', -80, 15, 20));
await step('MOD-FX TEMPO drag up', () => T.sweep('k1', -30, 10, 20));
await step('EDIT-WAHL 2 → 6 DELAY', () => T.w2(/^6 DELAY/));
await step('DELAY TYP list → Kreuz', () => T.knobList('k0', /^Kreuz$/));
await step('DELAY TEMPO SYNC list → an', () => T.knobList('k1', /^an$/));
await step('DELAY NOTE list → 1/4', () => T.knobList('k2', /^1\/4$/));
await step('DELAY NOTE drag down (1/4 → shorter)', () => T.sweep('k2', 30, 10, 20));
await step('DELAY TIEFE drag up', () => T.sweep('k3', -90, 15, 20));
await step('DELAY TEMPO SYNC list → aus', () => T.knobList('k1', /^aus$/));
await step('DELAY ZEIT drag up', () => T.sweep('k2', -40, 10, 20));
await step('EDIT-WAHL 2 → 7 EQ', () => T.w2(/^7 EQ/));
await step('EQ TIEF-FREQ drag', () => T.sweep('k0', -40, 10, 20));
await step('EQ TIEF-GAIN drag up', () => T.sweep('k1', -50, 10, 20));
await step('EQ HOCH-FREQ drag down', () => T.sweep('k2', 40, 10, 20));
await step('EQ HOCH-GAIN drag down', () => T.sweep('k3', 60, 10, 20));
await step('SHIFT + OKT ▼ (HOCH-GAIN −0.5 dB)', async () => { await T.tapMk('shift'); await T.tapMk('octd'); return (await fx()).eq.hg; });
await step('WRITE → Sichern „FX Test“', async () => { await T.tapMk('write', 400); await E(() => { const i = document.querySelector('#popLayer .pop input'); if (i) { i.value = 'FX Test'; i.dispatchEvent(new Event('input', {bubbles: true})); } }); await T.tapTxt('#popLayer .pop button', /^Sichern$/, 600); return E(() => SYNQUENZER.getSound(0).name); });
await step('SHIFT + 3 (Init)', async () => { await T.tapMk('shift'); await T.tapMk('n2', 300); return fx(); });
await step('number key → "FX Test"', async () => { let nm = null; for (let k = 0; k < 8 && nm !== 'FX Test'; k++) { await T.tapMk('n' + k, 300); nm = await E(() => SYNQUENZER.getSound(0).name); } return nm; });
await step('engine MS 2000 → VA (header)', async () => { await T.tapTxt('button', /^VA$/); await sleep(400); return E(() => SYNQUENZER.getSound(0).engine); });
await step('engine VA → MS 2000 (header): effects kept?', async () => { await T.tapTxt('button', /^MS ?2000$/); await sleep(400); return fx(); });
const N = snaps.length - 1;
fs.writeFileSync(OUT + 'undo-labels-' + (L ? 'L' : 'P') + '.json', JSON.stringify(labels, null, 1));
check('U0 every effect action = exactly one undo step; navigation and WRITE none', labels.slice(1).every(l => /navigation|→ \d+ (DELAY|EQ)|WRITE/.test(l.label) ? l.du === 0 : l.du === 1), labels.slice(1).map(l => l.label.slice(0, 30) + ':' + l.du));
check('U0b engine VA → MS 2000 keeps the effects of "FX Test"', eq(labels[N].fx, labels[N - 2].fx), {before: labels[N - 2].fx, after: labels[N].fx});
const eFull = await echo(); console.log('echo full', JSON.stringify(eFull));
// undo all the way back (header ↶ by touch), comparing each state; check the panel knob labels follow (ZEIT | NOTE)
const bad = [], badK = []; let liveChecked = null;
await E(() => SYNQUENZER.selectTrack(0));
for (let k = N; k > 0; k--) {
  const du = labels[k].du; for (let j = 0; j < du; j++) { await T.tapTxt('.hb.ur', /^↶$/, 200); }
  const cur = await proj(); if (!eq(cur, snaps[k - 1])) bad.push({undoTo: labels[k - 1].label, d: diff(cur, snaps[k - 1]).slice(0, 4)});
  if (labels[k].label === 'DELAY TIEFE drag up') { liveChecked = await echo(); }
}
check('U1 ↶ step by step: each state deep-equal to the state before that action (touch)', bad.length === 0, bad.slice(0, 4));
check('U1b live engine follows undo: after undoing DELAY TIEFE the echo is gone', liveChecked && liveChecked.echo < -40, {full: eFull, afterUndo: liveChecked});
check('U2 all undone → project deep-equal to the start', eq(await proj(), snaps[0]), diff(await proj(), snaps[0]).slice(0, 6));
const badR = []; let liveR = null;
for (let k = 1; k <= N; k++) { const du = labels[k].du; for (let j = 0; j < du; j++) { await T.tapTxt('.hb.ur', /^↷$/, 200); } const cur = await proj(); if (!eq(cur, snaps[k])) badR.push({redoTo: labels[k].label, d: diff(cur, snaps[k]).slice(0, 4)});
  if (labels[k].label === 'DELAY TIEFE drag up') { liveR = await echo(); }
  if (labels[k].label === 'DELAY TEMPO SYNC list → aus' || labels[k].label === 'DELAY TEMPO SYNC list → an') { const pn = await T.panel(); if (pn && pn.sel && pn.sel.wahl === 2 && pn.sel.pos === 5) { const want = labels[k].label.endsWith('aus') ? 'ZEIT' : 'NOTE'; if (!pn.knobs[2] || pn.knobs[2].l !== want) badK.push({at: labels[k].label, k2: pn.knobs[2] && pn.knobs[2].l, want}); } } }
check('U3 ↷ step by step: each state deep-equal to the state after that action', badR.length === 0, badR.slice(0, 4));
check('U3b live engine follows redo: after redoing DELAY TIEFE the echo is back', liveR && liveR.echo > -12, liveR);
check('U3c panel ZEIT │ NOTE follows undo/redo of TEMPO SYNC', badK.length === 0, badK);
const eEnd = await echo();
check('U4 after redo of everything the sound plays as before (echo level and time)', Math.abs(eEnd.echo - eFull.echo) < 1.5 && eEnd.D === eFull.D, {eFull, eEnd});
// ---- save / load
const final = await proj();
const ser = await E(() => SYNQUENZER.serialize());
const fo = JSON.parse(ser);
check('S1 project file: format 5, appVersion 4.12.0, track 0 MS 2000 with mfx/dly/eq', fo.format === 5 && fo.appVersion === '4.12.0' && fo.project.tracks[0].sound.p.mk && fo.project.tracks[0].sound.p.mk.dly && fo.project.tracks[0].sound.p.mk.eq, {format: fo.format, app: fo.appVersion, fx: fo.project.tracks[0].sound.p.mk ? [fo.project.tracks[0].sound.p.mk.mfx, fo.project.tracks[0].sound.p.mk.dly, fo.project.tracks[0].sound.p.mk.eq] : null});
await E(() => SYNQUENZER.newProject && SYNQUENZER.newProject()); await sleep(600);
const ok = await E(s => SYNQUENZER.importJSON(s), ser); await sleep(800);
const back = await proj();
check('S2 serialize → new project → importJSON → tracks deep-equal (incl. effects)', ok && eq(back.tracks, final.tracks) && eq(back.scenes, final.scenes), {ok, d: diff(back.tracks, final.tracks).slice(0, 5)});
const eImp = await echo();
check('S2b after import the echo plays as before', Math.abs(eImp.echo - eFull.echo) < 1.5, {eFull, eImp});
const dl = p.waitForEvent('download', {timeout: 8000}).catch(() => null);
const how = await E(() => SYNQUENZER.exportProject());
const d = await dl; let ftxt = null; if (d) { const fp = OUT + 'export.json'; await d.saveAs(fp); ftxt = fs.readFileSync(fp, 'utf8'); }
check('S3 file export: JSON with format 5 and the effect blocks', !!ftxt && JSON.parse(ftxt).format === 5 && eq(JSON.parse(ftxt).project.tracks[0].sound.p.mk.dly, final.tracks[0].sound.p.mk.dly), {how, dl: !!d});
await E(() => SYNQUENZER.save()); await sleep(1500);
const libBefore = await E(() => SYNQUENZER.library().filter(s => s.engine === 'mk'));
const before = await proj();
await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version, null, {timeout: 20000}); await sleep(1500);
const after = await proj();
check('S4 reload: project deep-equal (autosave) incl. effects', eq(after.tracks, before.tracks), diff(after.tracks, before.tracks).slice(0, 5));
const libAfter = await E(() => SYNQUENZER.library().filter(s => s.engine === 'mk'));
check('S5 reload: own MS 2000 sound "FX Test" in the library with effects', eq(libAfter, libBefore) && libAfter.some(s => s.name === 'FX Test' && s.p.mk.dly.dep > 0), {n: [libBefore.length, libAfter.length]});
await E(() => { ensureAudio(); SYNQUENZER.selectTrack(0); }); await sleep(1500);
const eRel = await echo();
check('S6 after reload (first sound, no edit): the echo plays as before (delay buffer allocated on load)', Math.abs(eRel.echo - eFull.echo) < 1.5, {eFull, eRel, fxBytes: await E(() => SYNQUENZER.mkInfo().fxBytes)});
check('no console errors', errs.length === 0, errs.slice(0, 5));
await T.br.close(); done();
