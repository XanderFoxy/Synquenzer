// QA G-MK2a: save/load roundtrip of a project with MK2 sounds (serialize → importJSON, autosave → reload, fresh context import,
// sound export/import) incl. "does the first note after loading sound like before" (harmonic fingerprint)
import {open, sleep, OUT, check, done, eq, diff} from './v3-qa-gmk2a-tl.mjs';
import {setupProject} from './v3-qa-gmk2a-setup.mjs';
import {chromium} from 'playwright';
import fs from 'fs';
const T = await open(); const {p, E, errs, br} = T;
console.log('setup', JSON.stringify(await setupProject(E)));
await E(() => { const Q = SYNQUENZER; Q.mkSet(3, 't.0.o1.w', 5); Q.mkSet(3, 't.0.o1.c2', 68); Q.mkSet(1, 't.0.o1.w', 4); Q.mkSet(1, 't.0.o1.c1', 90); Q.mkSet(1, 't.0.o1.c2', 0); Q.mkSet(1, 't.0.e2.s', 127); Q.mkSet(2, 't.0.p.2.i', 0); Q.mkSet(2, 't.0.p.0.s', 4); Q.mkSet(2, 't.0.p.0.d', 5); Q.mkSet(2, 't.0.p.0.i', 20); });
await E(() => SYNQUENZER.saveSound(3, 'Lead Endlos', 'new'));
// fingerprint: audition a note on track t, harmonic levels 1..8
const FP = `async (t, note) => { const Q = SYNQUENZER; if (!AU.ctx) ensureAudio(); for (let k = 0; k < 100 && !(SynthHost.state === 'ready' && AU.synth[t]); k++) await new Promise(r => setTimeout(r, 20)); const a = AU.ctx.createAnalyser(); a.fftSize = 16384; a.smoothingTimeConstant = 0; AU.M.ceil.connect(a); const f = new Float32Array(a.frequencyBinCount), acc = new Float64Array(f.length); let n = 0; const pr = Q.audition(t, note, 700); await new Promise(r => setTimeout(r, 200)); const iv = setInterval(() => { a.getFloatFrequencyData(f); for (let i = 0; i < f.length; i++) acc[i] += Math.pow(10, f[i] / 10); n++; }, 40); await new Promise(r => setTimeout(r, 400)); clearInterval(iv); await pr; AU.M.ceil.disconnect(a); const f0 = 440 * Math.pow(2, (note - 69) / 12), bw = AU.ctx.sampleRate / a.fftSize; const h = []; for (let k = 1; k <= 8; k++) { const c = Math.round(k * f0 / bw); let m = 0; for (let q = c - 2; q <= c + 2; q++) m = Math.max(m, acc[q] / n); h.push(+(10 * Math.log10(m + 1e-30)).toFixed(1)); } await new Promise(r => setTimeout(r, 300)); return h; }`;
const fps = async E => { const out = {}; for (const [t, n] of [[0, 48], [1, 55], [2, 60], [3, 64]]) out[t] = await E(([src, t, n]) => (0, eval)('(' + src + ')')(t, n), [FP, t, n]); return out; };
const close = (a, b) => Object.keys(a).every(t => a[t].every((v, i) => Math.abs(v - b[t][i]) < 3 || (v < -75 && b[t][i] < -75)));
const fpA = await fps(E); console.log('fp A', JSON.stringify(fpA));
const projA = await E(() => { const P = JSON.parse(SYNQUENZER.serialize()); return P; });
const sndA = await E(() => [0, 1, 2, 3].map(t => SYNQUENZER.getSound(t)));
const editedA = await E(() => [0, 1, 2, 3].map(t => SYNQUENZER.soundEdited(t)));
const libA = await E(() => SYNQUENZER.library().filter(s => s.engine === 'mk').map(s => ({name: s.name, mk: s.p.mk})));
const txt = await E(() => SYNQUENZER.serialize());
fs.writeFileSync(OUT + 'rt-project.json', txt);
// R1 importJSON in the same page
const ok1 = await E(t => SYNQUENZER.importJSON(t), txt); await sleep(800);
const snd1 = await E(() => [0, 1, 2, 3].map(t => SYNQUENZER.getSound(t)));
const fp1 = await fps(E);
check('R1 serialize → importJSON (same page): MS 2000 sounds deep-equal (p.mk incl. waves/patches), sound the same', ok1 && snd1.every((s, i) => eq(s.p.mk, sndA[i].p.mk) && s.engine === 'mk') && close(fpA, fp1), {ok1, d: snd1.map((s, i) => diff(s.p.mk, sndA[i].p.mk).slice(0, 2)), fp1});
// R2 autosave → reload in the same context
const saved = await E(() => SYNQUENZER.save()); await sleep(500);
const p2 = await T.ctx.newPage(); const errs2 = []; p2.on('pageerror', e => errs2.push(String(e))); p2.on('console', m => { if (m.type() === 'error') errs2.push(m.text()); });
await p.close();
await p2.goto('file://' + (process.env.SYNQ_APP || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html'));
await p2.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version, null, {timeout: 20000});
const E2 = (f, a) => p2.evaluate(f, a);
await p2.waitForFunction(() => SYNQUENZER.storage().booted, null, {timeout: 20000}).catch(() => {});
const tBoot = Date.now();
const info2a = await E2(() => SYNQUENZER.mkInfo());
// first note right after the reload (no wait): the stored wave must sound (not the placeholder saw)
await E2(() => { try { SYNQUENZER.setMetronome(false); } catch (e) {} });
const fp2 = await fps(E2);
const snd2 = await E2(() => [0, 1, 2, 3].map(t => SYNQUENZER.getSound(t)));
const edited2 = await E2(() => [0, 1, 2, 3].map(t => SYNQUENZER.soundEdited(t)));
const lib2 = await E2(() => SYNQUENZER.library().filter(s => s.engine === 'mk').map(s => ({name: s.name, mk: s.p.mk})));
console.log('reload: saved', saved, 'mkInfo right after boot', JSON.stringify(info2a), 'fp', JSON.stringify(fp2));
check('R2 autosave → reload: MS 2000 sounds deep-equal, library has the 3 own MK2 programs equal, edited flags kept', snd2.every((s, i) => s.engine === 'mk' && eq(s.p.mk, sndA[i].p.mk)) && libA.every(a => lib2.some(b => b.name === a.name && eq(a.mk, b.mk))) && eq(edited2, editedA), {d: snd2.map((s, i) => diff(s.p.mk, sndA[i].p.mk).slice(0, 2)), lib2: lib2.map(x => x.name), edited: [editedA, edited2]});
check('R3 reload: first notes sound like before the save (stored waves incl. octave waves, ±3 dB)', close(fpA, fp2), {fpA, fp2});
check('R3b no console errors after reload', errs2.length === 0, errs2.slice(0, 4));
// R4 fresh browser context (no storage, no tables): import the file, play at once
const br3 = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const c3 = await br3.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true}); const p3 = await c3.newPage(); const errs3 = []; p3.on('pageerror', e => errs3.push(String(e))); p3.on('console', m => { if (m.type() === 'error') errs3.push(m.text()); });
await p3.goto('file:///tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html'); await p3.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version, null, {timeout: 20000}); await p3.waitForTimeout(600);
const E3 = (f, a) => p3.evaluate(f, a);
const ok3 = await E3(t => { SYNQUENZER.setMetronome(false); return SYNQUENZER.importJSON(t); }, txt);
const fp3 = await fps(E3);
const snd3 = await E3(() => [0, 1, 2, 3].map(t => SYNQUENZER.getSound(t)));
const lib3 = await E3(() => SYNQUENZER.library().filter(s => s.engine === 'mk').map(s => s.name));
check('R4 fresh device: import the project file → MS 2000 sounds equal and the first notes sound right', ok3 && snd3.every((s, i) => eq(s.p.mk, sndA[i].p.mk)) && close(fpA, fp3), {ok3, fp3, lib3});
// R5 sound export → import on the fresh device
const sx = await E2(async () => { const ids = SYNQUENZER.library().filter(s => s.engine === 'mk').map(s => s.id); const r = await SYNQUENZER.exportSounds(ids); return typeof r === 'string' ? r : JSON.stringify(r); });
const imp = await E3(async t => { try { return await SYNQUENZER.importSounds(t); } catch (e) { return 'ERR ' + e.message; } }, sx);
const lib3b = await E3(() => SYNQUENZER.library().filter(s => s.engine === 'mk').map(s => ({name: s.name, mk: s.p.mk})));
check('R5 exportSounds → importSounds: MK2 programs arrive equal', libA.every(a => lib3b.some(b => b.name === a.name && eq(a.mk, b.mk))), {imp: JSON.stringify(imp).slice(0, 200), names: lib3b.map(x => x.name), sx: sx.slice(0, 120)});
check('R4b no console errors (fresh device)', errs3.length === 0 && errs.length === 0, [errs3.slice(0, 3), errs.slice(0, 3)]);
await br3.close(); await br.close(); done();
