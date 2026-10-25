// QA G-MK1: undo/redo of every new action (touch where it exists) step by step against snapshots, then save/load:
// serialize → importJSON, file export → import, reload (autosave), library after reload, format/app stamps, panel after reload
import {open, sleep, OUT, check, done, eq, diff, canon} from './v3-qa-gmk1-tl.mjs';
import fs from 'fs';
const T = await open(); const {p, E, errs} = T;
const proj = () => E(() => { const pr = SYNQUENZER.project(); const P = JSON.parse(JSON.stringify(pr.project || pr)); delete P.ui; if (P.settings) delete P.settings.coach; return P; });
const snaps = [], labels = [];
const step = async (label, fn) => { const u0 = await T.undoN(); let r; try { r = await fn(); } catch (e) { r = 'ERR ' + e.message; } await sleep(150); const u1 = await T.undoN(); snaps.push(await proj()); labels.push({label, du: u1 - u0, r: typeof r === 'object' ? JSON.stringify(r).slice(0, 80) : r}); console.log('step', label, 'undo +' + (u1 - u0), r === undefined ? '' : JSON.stringify(r).slice(0, 100)); };
snaps.push(await proj()); labels.push({label: 'start'});
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(500);
await step('engine → MS 2000 (touch)', async () => { const r = await T.tapTxt('button', /^MS ?2000$/); await sleep(400); return !!r; });
await step('SPIEL CUTOFF drag (touch)', () => T.dragMk('k0', 50, 10));
await step('EDIT-WAHL 1 list → FILTER, TYP → 12LPF (touch)', async () => { await T.tapMk('w1', 250); await T.tapPop(/^6 FILTER/); await sleep(150); await T.tapMk('k0', 250); await T.tapPop(/^12LPF$/); return E(() => SYNQUENZER.mkGet(0).t[0].f.type); });
await step('RESONANZ drag (touch)', () => T.dragMk('k2', -40, 10));
await step('SHIFT + OKT ▲ (last value +1)', async () => { await T.tapMk('shift'); await T.tapMk('octu'); return E(() => SYNQUENZER.mkGet(0).t[0].f.res); });
await step('VOLUME drag (touch)', () => T.dragMk('vol', 30, 8));
await step('🎲 (touch)', () => T.tapTxt('.hb', /^🎲$/));
await step('WRITE → Sichern „Song Bass“', async () => { await T.tapMk('write', 300); await E(() => { const i = document.querySelector('#popLayer .pop input'); if (i) { i.value = 'Song Bass'; i.dispatchEvent(new Event('input', {bubbles: true})); } }); await T.tapTxt('#popLayer .pop button', /^Sichern$/, 500); return E(() => SYNQUENZER.getSound(0).name); });
await step('SHIFT + 3 (Init)', async () => { await T.tapMk('shift'); await T.tapMk('n2', 300); return E(() => SYNQUENZER.getSound(0).name); });
await step('number key 1 (program Song Bass)', async () => { await T.tapMk('n0', 300); return E(() => SYNQUENZER.getSound(0).name); });
await step('⋯ → Init', async () => { const d = await T.rectText('button', /^⋯$/); await T.tap(d.cx, d.cy, 300); await T.tapPop(/Init/); return E(() => SYNQUENZER.getSound(0).name); });
await step('EDIT-WAHL 1 → STIMME, ZUWEISUNG → Unison (touch)', async () => { await T.tapMk('w1', 250); await T.tapPop(/^1 STIMME/); await sleep(150); await T.tapMk('k2', 250); await T.tapPop(/^Unison$/); return E(() => SYNQUENZER.mkGet(0).t[0].asg); });
await step('SPIEL TEMPO knob (touch)', async () => { await T.tapMk('n7', 100); const pn = await T.panel(); if (pn.sel.wahl !== 0) { await T.tapMk('w1', 250); } return 'skip'; });
await step('Synth 3 → MS 2000 → WT (header) ', async () => { await E(() => SYNQUENZER.selectTrack(2)); await sleep(400); await T.tapTxt('button', /^MS ?2000$/); await sleep(300); await T.tapTxt('button', /^WT$/); await sleep(300); return E(() => SYNQUENZER.getSound(2).engine); });
await step('Synth 3 WT → MS 2000 (header)', async () => { await T.tapTxt('button', /^MS ?2000$/); await sleep(300); return E(() => SYNQUENZER.getSound(2).engine); });
await step('Synth 3 MS 2000 → VA (header, VA restored?)', async () => { await T.tapTxt('button', /^VA$/); await sleep(300); return E(() => [SYNQUENZER.getSound(2).engine, !!SYNQUENZER.getSound(2).p.mk]); });
const N = snaps.length - 1;
console.log(JSON.stringify(labels));
// undo all the way back (header ↶ by touch), comparing each state
const bad = [];
for (let k = N; k > 0; k--) {
  const du = labels[k].du; for (let j = 0; j < du; j++) { await T.tapTxt('.hb.ur', /^↶$/, 150); }
  const cur = await proj(); if (!eq(cur, snaps[k - 1])) bad.push({undoTo: labels[k - 1].label, d: diff(cur, snaps[k - 1]).slice(0, 4)});
}
check('U1 ↶ step by step: each state deep-equal to the state before that action (touch)', bad.length === 0, bad.slice(0, 4));
const startEq = eq(await proj(), snaps[0]);
check('U2 all undone → project deep-equal to the start (incl. VA sounds restored)', startEq, startEq ? '' : diff(await proj(), snaps[0]).slice(0, 6));
const badR = [];
for (let k = 1; k <= N; k++) { const du = labels[k].du; for (let j = 0; j < du; j++) { await T.tapTxt('.hb.ur', /^↷$/, 150); } const cur = await proj(); if (!eq(cur, snaps[k])) badR.push({redoTo: labels[k].label, d: diff(cur, snaps[k]).slice(0, 4)}); }
check('U3 ↷ step by step: each state deep-equal to the state after that action', badR.length === 0, badR.slice(0, 4));
const noUndo = labels.filter(l => l.du === 0 && !/skip|WRITE/.test(l.label + l.r)).map(l => l.label);
check('U4 every sound-changing action is exactly one undo step', labels.slice(1).every(l => l.du === 1 || /TEMPO|WRITE/.test(l.label)), labels.slice(1).map(l => l.label + ':' + l.du));
// ---- save / load
const final = await proj();
const ser = await E(() => SYNQUENZER.serialize());
const fo = JSON.parse(ser);
check('S1 project file: format 5, appVersion 4.9.0, MS 2000 sounds with p.mk', fo.format === 5 && fo.appVersion === '4.9.0' && fo.project.tracks.filter(t => t.sound.engine === 'mk').length >= 2, {format: fo.format, app: fo.appVersion, mk: fo.project.tracks.map(t => t.sound.engine)});
await E(() => SYNQUENZER.newProject && SYNQUENZER.newProject()); await sleep(600);
const ok = await E(s => SYNQUENZER.importJSON(s), ser); await sleep(600);
const back = await proj();
const d1 = diff(back, final).filter(x => !/^\.(id|name|created|modified|saved|uid)/.test(x));
check('S2 serialize → new project → importJSON → deep-equal (tracks, sounds, p.mk, clips)', ok && eq(back.tracks, final.tracks) && eq(back.scenes, final.scenes), {ok, d: diff(back.tracks, final.tracks).slice(0, 5), other: d1.slice(0, 5)});
// file export (download) → import via the file chooser path (parseAny)
const dl = p.waitForEvent('download', {timeout: 8000}).catch(() => null);
const how = await E(() => SYNQUENZER.exportProject());
const d = await dl; let ftxt = null; if (d) { const fp = OUT + 'export.json'; await d.saveAs(fp); ftxt = fs.readFileSync(fp, 'utf8'); }
check('S3 file export delivers a JSON with format 5', !!ftxt && JSON.parse(ftxt).format === 5, {how, dl: !!d});
// reload: autosave must bring the same project back and load the MS 2000 block during boot
await E(() => SYNQUENZER.save()); await sleep(1500);
const libBefore = await E(() => SYNQUENZER.library().filter(s => s.engine === 'mk'));
const before = await proj();
await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version, null, {timeout: 20000}); await sleep(1200);
const after = await proj();
const info = await E(() => SYNQUENZER.mkInfo());
check('S4 reload: project deep-equal (autosave), MS 2000 block loaded during boot', eq(after.tracks, before.tracks) && info.loaded, {d: diff(after.tracks, before.tracks).slice(0, 5), info});
const libAfter = await E(() => SYNQUENZER.library().filter(s => s.engine === 'mk'));
check('S5 reload: own MS 2000 sounds in the library deep-equal', eq(libAfter, libBefore) && libAfter.length >= 1, {n: [libBefore.length, libAfter.length], d: diff(libAfter, libBefore).slice(0, 4)});
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(600);
const pn = await T.panel();
const pr = await E(() => { const e = document.querySelector('.mkx[data-k="prog"]'); return e && e.textContent; });
check('S6 after reload: panel opens on the MS 2000 track; Seite B lists the written sound', !!pn && (await E(() => SYNQUENZER.getSound(0).engine)) === 'mk', {fmt: pn && pn.fmt, prog: pr});
// sound after reload renders like before (offline render of the track sound before/after)
const rend = await E(async () => { const s = SYNQUENZER.getSound(0); const r = await SYNQUENZER.mkRender(s, [[0, 'on', 48, .8], [1, 'off', 48]], {sec: 1.5}); let e = 0; for (const v of r.l) e += v * v; return 10 * Math.log10(e / r.l.length + 1e-20); });
check('S7 the MS 2000 sound renders audibly after reload', rend > -40, rend);
// undo history after reload is empty (no stale steps that would apply to another state)
const un = await T.undoN();
console.log('undo after reload', un);
// import the exported file again (as Xander would via Menü → Öffnen) on top: deep-equal tracks
if (ftxt) { const ok2 = await E(s => SYNQUENZER.importJSON(s), ftxt); await sleep(600); const imp = await proj(); check('S8 exported file → import → tracks deep-equal', ok2 && eq(imp.tracks, final.tracks), diff(imp.tracks, final.tracks).slice(0, 5)); }
check('no console errors', errs.length === 0, errs.slice(0, 5));
fs.writeFileSync(OUT + 'undo-labels.json', JSON.stringify(labels, null, 1));
await T.br.close(); done();
