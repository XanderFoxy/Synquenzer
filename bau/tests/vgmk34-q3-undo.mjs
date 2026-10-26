// QA G-MK3: undo/redo of every new MK3 action (touch) step by step against snapshots, then save/load roundtrip:
// serialize → importJSON, file export, reload (autosave), library (WRITE / exportSounds → importSounds), panel state after reload
import {open, sleep, OUT, check, done, eq, diff, canon} from './vgmk34-tl3.mjs';
import fs from 'fs';
const L = process.argv[2] === 'L';
const T = await open({viewport: L ? {width: 844, height: 390} : {width: 390, height: 844}}); const {p, E, errs} = T;
const log = (...a) => console.log(...a);
const snd = () => E(() => SYNQUENZER.getSound(0));
const pm = t => E(t => SYNQUENZER.mkGet(t), t);
const proj = () => E(() => { const P = JSON.parse(SYNQUENZER.serialize()); return P.project || P; });
await E(() => SYNQUENZER.setMetronome(false));
// a second MS 2000 sound in the library as the copy source (track 2, distinct timbres)
await E(async () => { const Q = SYNQUENZER; Q.setEngine(2, 'mk'); Q.mkSet(2, 'mode', 1); Q.mkSet(2, 't.0.o1.w', 2); Q.mkSet(2, 't.0.f.cut', 33); Q.mkSet(2, 't.1.o1.w', 3); Q.mkSet(2, 't.1.o1.c1', 77); Q.mkSet(2, 't.1.e2.a', 50); await Q.saveSound(2, 'Quelle Duo', 'new'); });
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(600);
const b0 = await T.rectText('button', /^MS ?2000$/); if (b0) await T.tap(b0.cx, b0.cy, 900); else { const c = await T.rectText('button', /^(VA|FM|WT) ▾$/); await T.tap(c.cx, c.cy, 400); await T.tapPop(/MS ?2000/); await sleep(900); }
const keyRects = await E(() => [...document.querySelectorAll('#kb .key')].filter(k => k.getClientRects().length).map(k => { const r = k.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height * (k.classList.contains('b') ? .45 : .8)}; }).sort((a, b) => a.cx - b.cx));
const keyTap = async i => { const k = keyRects[i]; await T.send('touchStart', [{x: k.cx, y: k.cy, id: 44}]); await sleep(150); await T.send('touchEnd', []); await sleep(250); };
const shift = async on => { const pn = await T.panel(); if (!!pn.shift !== !!on) await T.tapMk('shift', 200); };
const steps = [{label: 'start', s: await snd(), u: await T.undoN()}];
const A = async (label, fn) => { let r; try { r = await fn(); } catch (e) { r = 'ERR ' + e.message; } await sleep(150); const s = await snd(), u = await T.undoN(); const prev = steps[steps.length - 1]; steps.push({label, s, u, du: u - prev.u, r}); log(label.padEnd(44), 'Δundo', u - prev.u, 'r', JSON.stringify(r).slice(0, 80), 'mk', JSON.stringify({mode: s.p.mk.mode, tv: s.p.mk.tv, split: s.p.mk.split, scale: s.p.mk.scale, skey: s.p.mk.skey, usc: s.p.mk.usc && s.p.mk.usc.join(','), w: s.p.mk.t.map(t => t.o1.w), cut: s.p.mk.t.map(t => t.f.cut), r: s.p.mk.t.map(t => t.e2.r)})); return r; };
await A('EINZELN → Schicht', async () => { await T.w('w1', /^1 STIMME/); return T.knobList('k1', /^Schicht$/); });
await A('SHIFT · STIMMEN → 1+3', async () => { await shift(1); return T.knobList('k1', /^1\+3$/); });
await A('EINZELN → Split', async () => { await shift(0); return T.knobList('k1', /^Split$/); });
await A('LCD Split ← nächste Note + key 9', async () => { const lx = await T.rect('.lx.lsplit'); if (!lx) return 'no lsplit'; await T.tap(lx.cx, lx.cy, 250); await keyTap(9); return (await pm(0)).split; });
await A('SHIFT · SPLIT drag up', async () => { await shift(1); await T.dragMk('k2', -30, 8); return (await pm(0)).split; });
await A('TIMBRE → T2 + FILTER CUTOFF drag', async () => { await shift(0); await T.tapMk('timbre', 250); await T.w('w1', /^6 FILTER/); await T.dragMk('k1', 70, 14); return (await T.panel()).timbre; });
await A('T2 OSZ 1 WELLE → Puls', async () => { await T.w('w1', /^3 OSZ 1/); return T.knobList('k0', /^Puls$/); });
await A('TIMBRE → beide + A-HK RELEASE drag', async () => { await T.tapMk('timbre', 250); await T.w('w1', /^9 A-HK/); await T.dragMk('k3', -40, 10); return (await T.panel()).timbre; });
await A('TIMBRE → T1 (no undo)', async () => { await T.tapMk('timbre', 250); return (await T.panel()).timbre; });
await A('SHIFT + TIMBRE solo, tap off (no undo)', async () => { await shift(1); await T.tapMk('timbre', 250); const s = (await T.panel()).solo; await T.tapMk('timbre', 250); return [s, (await T.panel()).solo || 0]; });
await A('STIMMUNG → Eigene', async () => { await T.w('w2', /^10 STIMMUNG/); return T.knobList('k0', /^Eigene$/); });
await A('EIGENE knob 3 drag up', async () => { await T.tapMk('m2', 400); await T.dragMk('u2', -50, 10); return (await pm(0)).usc; });
await A('EIGENE knob 10 drag down', async () => { await T.dragMk('u9', 40, 10); await T.tapMk('back', 300); return (await pm(0)).usc; });
await A('GRUNDTON → E', async () => { await T.w('w2', /^10 STIMMUNG/); return T.knobList('k1', /^E$/); });
await A('SHIFT + 2 swap', async () => { await shift(1); await T.tapMk('n1', 400); return 1; });
await A('SHIFT + 4 init T1', async () => { await shift(1); await T.tapMk('n3', 400); return 1; });
await A('SHIFT + 1 copy "Quelle Duo" T2 → T1', async () => { await shift(1); await T.tapMk('n0', 500); const r = await E(() => { const r = [...document.querySelectorAll('#popLayer .mkcr')].find(r => /Quelle Duo/.test(r.textContent)); if (!r) return null; const q = r.querySelector('button[data-t="1"]').getBoundingClientRect(); return {cx: q.x + q.width / 2, cy: q.y + q.height / 2}; }); if (!r) return 'no row'; await T.tap(r.cx, r.cy, 500); return (await pm(0)).t[0].o1; });
await A('⋯ → Timbre tauschen', async () => { const d = await T.rectText('button', /^⋯$/); await T.tap(d.cx, d.cy, 400); const r = await T.tapPop(/Timbre tauschen/); await sleep(300); return !!r; });
await A('STIMMUNG → Werckmeister III (usc dropped)', async () => { await T.w('w2', /^10 STIMMUNG/); return T.knobList('k0', /^Werckmeister III$/); });
const N = steps.length - 1;
const want1 = l => /no undo/.test(l) ? 0 : 1;
check('U1 every MK3 action = exactly one undo step; TIMBRE key / solo = none', steps.slice(1).every(s => s.du === want1(s.label)), steps.slice(1).map(s => s.label + ':' + s.du));
check('U1b TIMBRE key / solo leave the sound deep-equal (nothing stored)', steps.filter(s => /no undo/.test(s.label)).every(s => eq(s.s, steps[steps.indexOf(s) - 1].s)), null);
check('U1c all actions ran', !steps.some(s => /ERR|no /.test(JSON.stringify(s.r))), steps.filter(s => /ERR|no /.test(JSON.stringify(s.r))).map(s => s.label + ' ' + s.r));
check('U1d usc was set (Eigene) and is dropped by the switch to Werckmeister (documented)', !!steps[12].s.p.mk.usc && steps[N].s.p.mk.usc === null, [steps[12].s.p.mk.usc, steps[N].s.p.mk.usc]);
// ↶ step by step (header), compare with the state before each action that made a step
const undoTargets = steps.slice(0, N).filter((s, k) => steps[k + 1].du === 1).reverse();
const badU = []; let k = 0;
for (let j = N; j >= 1; j--) { if (steps[j].du !== 1) continue; await T.tapTxt('.hb.ur', /^↶$/, 250); const s = await snd(); if (!eq(s.p, steps[j - 1].s.p) || s.engine !== steps[j - 1].s.engine) badU.push({after: steps[j].label, d: diff(s.p, steps[j - 1].s.p).slice(0, 3)}); }
check('U2 ↶ step by step: each state deep-equal to the state before that action (p incl. p.mk)', badU.length === 0, badU.slice(0, 4));
const badR = [];
for (let j = 1; j <= N; j++) { if (steps[j].du !== 1) continue; await T.tapTxt('.hb.ur', /^↷$/, 250); const s = await snd(); if (!eq(s.p, steps[j].s.p)) badR.push({redo: steps[j].label, d: diff(s.p, steps[j].s.p).slice(0, 3)}); }
check('U3 ↷ step by step: each state deep-equal to the state after that action', badR.length === 0, badR.slice(0, 4));
// the usc values come back with ↶ after the switch away from Eigene
await T.tapTxt('.hb.ur', /^↶$/, 300); const uscBack = (await pm(0)).usc; await T.tapTxt('.hb.ur', /^↷$/, 300);
check('U4 ↶ after leaving „Eigene“ restores the 12 own values', eq(uscBack, steps[13].s.p.mk.usc), uscBack);
fs.writeFileSync(OUT + 'undo-steps-' + (L ? 'L' : 'P') + '.json', JSON.stringify(steps.map(s => ({label: s.label, du: s.du, mk: s.s.p.mk})), null, 1));
// ---- save / load: give t0 an own scale again (scale 9 + usc), then roundtrips
await E(() => { SYNQUENZER.mkSet(0, 'scale', 9); SYNQUENZER.mkSet(0, 'usc.3', -37); SYNQUENZER.mkSet(0, 'usc.10', 62); SYNQUENZER.mkSet(0, 'tv', 2); });
const final = await proj(); const mkF = await pm(0);
const ser = await E(() => SYNQUENZER.serialize()); const fo = JSON.parse(ser);
check('S1 project file: format 5, appVersion 4.11.0, p.mk with mode/tv/split/scale/usc/t[1]', fo.format === 5 && fo.appVersion === '4.11.0' && eq((fo.project || fo).tracks[0].sound.p.mk, mkF), {format: fo.format, app: fo.appVersion, d: diff((fo.project || fo).tracks[0].sound.p.mk, mkF).slice(0, 3)});
await E(() => SYNQUENZER.newProject && SYNQUENZER.newProject()); await sleep(600);
const ok = await E(s => SYNQUENZER.importJSON(s), ser); await sleep(600);
const back = await proj();
check('S2 serialize → new project → importJSON → tracks deep-equal (p.mk of all tracks)', ok && eq(back.tracks, final.tracks), {ok, d: diff(back.tracks, final.tracks).slice(0, 5)});
const dl = p.waitForEvent('download', {timeout: 8000}).catch(() => null);
const how = await E(() => SYNQUENZER.exportProject());
const d = await dl; let ftxt = null; if (d) { const fp = OUT + 'export-' + (L ? 'L' : 'P') + '.json'; await d.saveAs(fp); ftxt = fs.readFileSync(fp, 'utf8'); }
check('S3 file export: JSON format 5 with the split / own-scale block', !!ftxt && JSON.parse(ftxt).format === 5 && eq((JSON.parse(ftxt).project || JSON.parse(ftxt)).tracks[0].sound.p.mk, mkF), {how, dl: !!d});
// WRITE the split sound (touch) → library; exportSounds → importSounds
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(600);
await T.tapMk('write', 500);
await E(() => { const i = document.querySelector('#popLayer .pop input'); if (i) { i.value = 'Split Eigen'; i.dispatchEvent(new Event('input', {bubbles: true})); } });
const sv = await T.rectText('#popLayer .pop button', /Sichern|Speichern|Als neu|Neu/); if (sv) await T.tap(sv.cx, sv.cy, 700);
const libS = await E(() => SYNQUENZER.library().find(s => s.name === 'Split Eigen'));
check('S4 WRITE → library entry p.mk deep-equal (mode, split, tv, usc, T2)', libS && eq(libS.p.mk, mkF), libS ? diff(libS.p.mk, mkF).slice(0, 4) : 'missing');
const dl2 = p.waitForEvent('download', {timeout: 8000}).catch(() => null);
await E(id => SYNQUENZER.exportSounds([id]), libS && libS.id);
const d2 = await dl2; let expTxt = null; if (d2) { const fp = OUT + 'sound-' + (L ? 'L' : 'P') + '.json'; await d2.saveAs(fp); expTxt = fs.readFileSync(fp, 'utf8'); }
await E(id => SYNQUENZER.deleteSound(id), libS.id); await sleep(300);
const imp = await E(t => SYNQUENZER.importSounds(t), expTxt); await sleep(500);
const libS2 = await E(() => SYNQUENZER.library().find(s => s.name === 'Split Eigen'));
check('S5 exportSounds → delete → importSounds → p.mk deep-equal', libS2 && eq(libS2.p.mk, mkF), {imp: JSON.stringify(imp).slice(0, 120), d: libS2 ? diff(libS2.p.mk, mkF).slice(0, 4) : 'missing'});
// load the library sound onto track 3 via the API setSound (as the browser does) → deep-equal
await E(() => { const x = SYNQUENZER.library().find(s => s.name === 'Split Eigen'); if (x) SYNQUENZER.setSound(3, x); }); await sleep(400);
check('S6 library sound on another track: p.mk deep-equal', eq(await pm(3), mkF), diff(await pm(3), mkF).slice(0, 4));
// reload (autosave)
await E(() => SYNQUENZER.save()); await sleep(1500);
const before = await proj(); const libB = await E(() => SYNQUENZER.library().filter(s => s.engine === 'mk'));
await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version, null, {timeout: 20000}); await sleep(1500);
const after = await proj(); const libA = await E(() => SYNQUENZER.library().filter(s => s.engine === 'mk'));
check('S7 reload: project deep-equal (autosave)', eq(after.tracks, before.tracks), diff(after.tracks, before.tracks).slice(0, 5));
check('S8 reload: library MS 2000 sounds deep-equal', eq(libA, libB) && libA.length >= 2, {n: [libB.length, libA.length], d: diff(libA, libB).slice(0, 3)});
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(800);
const pn = await T.panel();
check('S9 after reload: panel on T1, no solo, not armed', pn && pn.timbre === 1 && !pn.solo && !pn.splitArm, pn && {timbre: pn.timbre, solo: pn.solo, arm: pn.splitArm});
// render after reload: below split → T1 only, above → T2 only, both audible, different
const rr = await E(async () => { const s = SYNQUENZER.getSound(0), sp = s.p.mk.split; const lv = async (n, solo) => { const r = await SYNQUENZER.mkRender(s, [[0, 'on', n, .8], [.8, 'off', n]], {sec: 1.2, solo}); let e = 0; for (let i = 0; i < r.l.length; i++) e += r.l[i] * r.l[i] + r.r[i] * r.r[i]; return +(10 * Math.log10(e / r.l.length + 1e-30)).toFixed(1); };
  return {sp, below: await lv(sp - 3), belowT2: await lv(sp - 3, 2), above: await lv(sp + 3), aboveT1: await lv(sp + 3, 1)}; });
check('S10 after reload the split renders: below audible from T1 only, above audible from T2 only', rr.below > -40 && rr.above > -40 && rr.belowT2 < -90 && rr.aboveT1 < -90, rr);
// play a held key on each side after reload (live engine): split respected
const kr = await E(() => [...document.querySelectorAll('#kb .key')].filter(k => k.getClientRects().length).length);
check('no console errors', errs.length === 0, errs.slice(0, 5));
await T.br.close(); done();
