// T7: copy/paste/duplicate STIMME clip, cross-track paste, save/load deep-equal, MIDI export, scene duplicate
import {launch, open, sleep, deq, DIR} from './v3-qa-vs3-h.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const sine = (sr, sec, f, a = 0.3) => { const n = Math.round(sr * sec), x = new Array(n); for (let i = 0; i < n; i++) x[i] = Math.round(Math.sin(2 * Math.PI * f * i / sr) * a * 32767); return x; };
const br = await launch(null);
const ctx = await br.newContext({viewport: {width: 390, height: 844}});
let H = await open(br, {ctx}), p = H.p;
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); });
const r = await p.evaluate(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 7, len: 1}), sine(48000, 2.2, 440));
const st = r.track;
const c0 = await p.evaluate(([t]) => SYNQUENZER.getClip(t, 7), [st]);
// duplicate within STIMME track
const k = await p.evaluate(t => SYNQUENZER.duplicateClip(t, 7), st);
const cd = await p.evaluate(([t, k]) => SYNQUENZER.getClip(t, k), [st, k]);
ok(k >= 0 && deq(cd, c0), 'duplicate STIMME clip keeps audio (slot ' + k + ')');
// copy STIMME clip → paste into Synth 1 (track 0) slot 6
ok(await p.evaluate(t => SYNQUENZER.copyClip(t, 7), st), 'copy STIMME clip');
const toasts = []; await p.evaluate(() => { const t = document.getElementById('toast'); window.__toasts = []; new MutationObserver(() => window.__toasts.push(t.textContent)).observe(t, {childList: true, subtree: true, characterData: true}); });
const pr = await p.evaluate(() => SYNQUENZER.pasteClip(0, 6));
const c06 = await p.evaluate(() => SYNQUENZER.getClip(0, 6));
const tz = await p.evaluate(() => window.__toasts.join(' | '));
console.log('paste STIMME → Synth 1:', pr, JSON.stringify(c06), 'toast:', tz);
const cell = await p.evaluate(() => { const e = document.querySelector('.slot[data-t="0"][data-s="6"]') || document.querySelector('[data-t="0"][data-s="6"]'); return e ? {cls: e.className, svg: !!e.querySelector('svg'), txt: e.textContent.trim().slice(0, 30)} : null; });
console.log('  Synth 1 cell:', JSON.stringify(cell));
ok(!(pr && c06 && c06.audio), 'STIMME (audio) clip is not pasted as a silent audio clip into a normal synth track');
// paste a MELODIE clip with notes into the STIMME track
await p.evaluate(() => SYNQUENZER.setClip(5, 6, {len: 1, notes: [{t: 0, d: 1, n: 60, v: .8}, {t: 1, d: 1, n: 64, v: .8}]}));
await p.evaluate(() => SYNQUENZER.copyClip(5, 6));
const pr2 = await p.evaluate(t => SYNQUENZER.pasteClip(t, 5), st);
const c5 = await p.evaluate(t => SYNQUENZER.getClip(t, 5), st);
console.log('paste MELODIE → STIMME:', pr2, JSON.stringify(c5).slice(0, 160));
ok(!(pr2 && c5 && c5.notes.length && !c5.audio), 'note clip is not pasted into the STIMME track (would be inaudible)');
// MIDI export with STIMME
const mid = await p.evaluate(() => { try { const m = SYNQUENZER.buildMidi({mode: 'all'}); return m ? (m.length || m.byteLength || 1) : 0; } catch (e) { return 'ERR ' + e; } });
ok(typeof mid === 'number' && mid > 0, 'MIDI export (all scenes) with STIMME track works: ' + mid);
// save + reload deep-equal
const P0 = await p.evaluate(() => SYNQUENZER.project());
await sleep(2500); await p.close();
H = await open(br, {ctx}); p = H.p; await sleep(1200);
const P1 = await p.evaluate(() => SYNQUENZER.project());
const strip = P => { const c = JSON.parse(JSON.stringify(P)); delete c.ui; return c; };
ok(deq(strip(P0), strip(P1)), 'save/reload deep-equal with duplicated STIMME clip');
ok(!H.errs.length, 'no console errors ' + JSON.stringify(H.errs.slice(0, 3)));
await br.close();
console.log(fail ? fail + ' FAIL' : 'all ok');
