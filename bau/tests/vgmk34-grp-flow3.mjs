// QA group G-P1b, step 3: song from step 2 plays (▶ SONG, loop); Xander sings 4 bars over the Strophe (wired, fake mic) and taps
// FANG 🎤 (touch) → MELODIE clip, result sheet → OK; the song keeps playing; then undo/redo; then ● REC with 🎤 on an empty scene.
import {open, OUT, check, done, tapEl, tapText, eq} from './vgmk34-grp-lib.mjs';
import {micOn, resample, b64} from './v3-vs2-h.mjs';
import {renderVoice} from './v3-vs2-corpus.mjs';
import fs from 'fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const route = process.argv[2] || 'wired';
const {br, p, errs, E} = await open();
const proj = JSON.parse(fs.readFileSync(OUT + 'flow2-project.json', 'utf8'));
await E(pj => SYNQUENZER.importJSON(JSON.stringify({app: 'SYNQUENZER', kind: 'project', format: 4, project: pj})), proj);
await sleep(400);
await E(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); });
const mic = await micOn(p, route); console.log('mic', JSON.stringify(mic), route);
await E(() => SYNQUENZER.stop()); await sleep(1200);
const BPM = 120, SB = 0.5, LEAD = 0.04;
const MEL4 = [[0, 1, 57], [1, 1, 60], [2, 2, 64], [4, 1, 65], [5, 1, 64], [6, 2, 62], [8, 1, 60], [9, 1, 64], [10, 2, 67], [12, 1, 59], [13, 1, 62], [14, 1.5, 67]];
const sig = renderVoice(MEL4.map(([b, d, m], k) => ({on: LEAD + b * SB, dur: d * SB, midi: m, legato: false, rest: k ? 0.1 : 0})), {voice: 'male', seed: 3, sigma: 12, vib: [20, 40], bpm: BPM});
const y = resample(sig.x, 16000, mic.sr);
// ▶ SONG (song view, its own ▶ SONG button), loop on
await E(() => SYNQUENZER.songLoop(true));
await E(() => SYNQUENZER.songView(true)); await sleep(200);
await tapEl(p, '.sv-play'); await sleep(50);
const st = await E(() => ({play: SYNQUENZER.runtime().song.play, off: R.songPlay && R.songPlay.off, beat: audBeat()}));
console.log('song', JSON.stringify(st));
check('▶ SONG from the song view', st.play);
// sing over song bars 1–4 (Strophe) of the 2nd pass: song beat 32 = abs beat off + 32
const off = st.off, sAbs = off + 32;
const dt = await E(([b, beat, lead]) => { const c = SYNQUENZER.vsClock(); const t = c.start + beat * c.spb - lead; window.__fake.play(b, t); return t - window.__ctx.currentTime; }, [b64(y), sAbs, LEAD]);
check('voice scheduled ahead', dt > 0, dt);
// back to the clip view while singing (FANG lives in the mode bar)
await E(() => SYNQUENZER.songView(false));
await p.waitForFunction(x => audBeat() >= x, sAbs + 12, {timeout: 60000, polling: 20});
const lit = await E(() => ({lit: SYNQUENZER.vsInfo().lit, key: SYNQUENZER.vsInfo().litKey, mode: SYNQUENZER.vsInfo().fangMode}));
console.log('while singing', JSON.stringify(lit));
await p.waitForFunction(x => audBeat() >= x, sAbs + 16.4, {timeout: 60000, polling: 5});
const lab = await E(() => ({t: document.getElementById('bFang').textContent, vis: getComputedStyle(document.getElementById('bFang')).visibility, mode: SYNQUENZER.vsInfo().fangMode}));
check('FANG 🎤 visible after singing', /🎤/.test(lab.t) && lab.vis === 'visible', lab);
const u0 = await E(() => SYNQUENZER.undoInfo().n);
const pBefore = await E(() => SYNQUENZER.project());
await tapEl(p, '#bFang');
await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy && SYNQUENZER.vsResult(), null, {timeout: 20000});
await sleep(150);
const r = await E(() => SYNQUENZER.vsResult());
const want = (cl, mel, from = 0) => { let hit = 0; for (const [b, , m] of mel) if (cl.notes.some(n => n.n === m && Math.abs((n.o != null ? n.o : n.t) - (b - from)) <= 0.1)) hit++; return hit; };
const hit = r ? want(r, MEL4) : 0;
console.log('result', JSON.stringify(r && {kind: r.kind, track: r.track, scene: r.scene, len: r.len, start: r.start, n: r.notes.length, notes: r.notes.map(n => [+(n.o != null ? n.o : n.t).toFixed(2), n.n])}));
check('Stimme-FANG over ▶ SONG: MELODIE clip 4 bars, ≥ 10/12 notes', r && r.track === 5 && r.len === 4 && hit >= 10, {hit, len: r && r.len, start: r && r.start});
await p.screenshot({path: OUT + 'flow3-vsres.png'});
const rt = await E(() => ({song: SYNQUENZER.runtime().song, slots: SYNQUENZER.runtime().slots, q: SYNQUENZER.runtime().queued}));
console.log('after FANG 🎤', JSON.stringify({play: rt.song.play, override: rt.song.override, slots: rt.slots, q: rt.q}));
// OK ✓ by touch
const ok = await tapText(p, '.pop.vsres button', /OK/); console.log('tap OK', ok && ok.t);
await sleep(200);
check('result sheet closed after OK', !(await E(() => !!document.querySelector('.pop.vsres'))));
const ui = await E(() => SYNQUENZER.undoInfo());
check('one undo step „Stimme“', ui.n === u0 + 1 && ui.top.label === 'Stimme', ui);
// the MELODIE clip plays while the song runs: melody notes in the noteLog in the next bars
await p.waitForFunction(x => audBeat() >= x, sAbs + 34, {timeout: 60000, polling: 20});
const melLog = await E(x => SYNQUENZER.noteLog(3000).filter(n => n.track === 5 && n.beat >= x).map(n => [+n.beat.toFixed(2), n.out]), sAbs + 18);
console.log('MELODIE notes heard after the FANG', JSON.stringify(melLog.slice(0, 16)));
check('the sung clip is heard while the song plays on', melLog.length >= 8, melLog.length);
const rt2 = await E(() => ({song: SYNQUENZER.runtime().song.play, ov: SYNQUENZER.runtime().song.override}));
console.log('song after', JSON.stringify(rt2));
// undo / redo of the Stimme step while playing
const pAfter = await E(() => SYNQUENZER.project());
await E(() => SYNQUENZER.undo()); await sleep(100);
const pU = await E(() => SYNQUENZER.project());
const strip = o => { const c = JSON.parse(JSON.stringify(o)); delete c.saved; delete c.modified; delete c.updated; return c; };
check('undo Stimme → project deep-equal to before', eq(strip(pU).tracks, strip(pBefore).tracks), null);
await E(() => SYNQUENZER.redo()); await sleep(100);
const pR = await E(() => SYNQUENZER.project());
check('redo Stimme → project deep-equal to after', eq(strip(pR).tracks, strip(pAfter).tracks));
{ const d = (a, b, path = '') => { if (JSON.stringify(a) === JSON.stringify(b)) return []; if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return [path + ': ' + JSON.stringify(a).slice(0, 200) + ' != ' + JSON.stringify(b).slice(0, 200)]; const ks = new Set([...Object.keys(a), ...Object.keys(b)]); let out = []; for (const k of ks) out = out.concat(d(a[k], b[k], path + '.' + k)); return out; };
  console.log('redo diff', JSON.stringify(d(strip(pR).tracks, strip(pAfter).tracks).slice(0, 10), null, 1)); }
fs.writeFileSync(OUT + 'flow3-project.json', JSON.stringify(pR));
console.log('errs', errs);
await E(() => SYNQUENZER.stop()); await br.close(); done();
