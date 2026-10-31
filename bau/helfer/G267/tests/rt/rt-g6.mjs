// RETEST G6 (unabhängig): G-Dur-Szene MIT Begleitung (Synth-Clip G-Dur → D-Dur, Bass), Melodie mit Fis; Terz/Dreistimmig/Barbershop,
// Lautheit Terz 80er + Pop am Ausgang (Synths stumm), Selbst singen, Song-Wiedergabe, Solo, Layout 320×568 und 844×390.
import {launch, openG, sleep, toI16, deq, hz, ct, median, notePitch, errsOf, longTasks, ltGet} from './h.mjs';
import {singer} from './sig.mjs';
import {rec2Start, rec2Stop, lufs} from '../rec2.mjs';
import fs from 'fs';
const SR = 48000, OUT = [];
let fail = 0; const ok = (c, m) => { const s = (c ? '✓ ' : '✗ ') + m; console.log(s); OUT.push(s); if (!c) fail++; };
const NN = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'H'], nm = q => NN[((q % 12) + 12) % 12] + (Math.floor(q / 12) - 1);
const MEL = [67, 71, 74, 71, 69, 66, 62, 66];   // Takt 1 (G-Dur-Akkord): G4 H4 D5 H4 | Takt 2 (D-Dur): A4 Fis4 D4 Fis4
const ph = MEL.map((m, k) => ({t0: 0.04 + k * 0.5, cons: k % 3 === 1 ? 's' : null, vib: 12, segs: [{m, off: 0, d: k % 3 === 1 ? 0.36 : 0.43, vowel: 'aeoua'[k % 5], f0: hz(m)}]}));
const {x, truth} = singer(SR, 4.3, ph, {seed: 33, amp: 1.3});
const TERZ_G = {67: 71, 71: 74, 74: 78, 69: 72, 66: 69, 62: 66};
const DREI = [[71, 74], [74, 79], [79, 83], [74, 79], [74, 78], [69, 74], [66, 69], [69, 74]];
const br = await launch(null), H = await openG(br, {touch: true}), p = H.p, errs = errsOf(p);
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); }); await sleep(300);
// Begleitung: Synth 1 = Akkorde (G H D | D Fis A), Synth 2 = Bass (G2 | D2)
await p.evaluate(() => {
  SYNQUENZER.setClip(0, 0, {len: 2, notes: [55, 59, 62].map(n => ({t: 0, d: 4, n, v: .5})).concat([62, 66, 69].map(n => ({t: 4, d: 4, n, v: .5})))});
  SYNQUENZER.setClip(1, 0, {len: 2, notes: [{t: 0, d: 4, n: 43, v: .6}, {t: 4, d: 4, n: 38, v: .6}]});
});
await sleep(300);
const sk = await p.evaluate(() => SYNQUENZER.sceneKey(0)); ok(sk.root === 7 && sk.scale === 'ionian', 'Szene 0 erkannt als ' + JSON.stringify(sk) + ' (Soll G-Dur)');
await p.evaluate(() => SYNQUENZER.play()); await sleep(200); await p.evaluate(() => SYNQUENZER.stop()); await sleep(200);
const r1 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 2}), toI16(x));
const R = {t: r1.track, s: 0};
await p.evaluate(R => SYNQUENZER.tkSheet(R), R); await sleep(900);
// echter Weg: Tipp [Chor] → Blatt, Tipp [Terz]
await longTasks(p);
await p.tap('.pop button[data-a=g6]'); await sleep(400);
const sheetOk = await p.evaluate(() => !!document.querySelector('.pop.g6sheet'));
ok(sheetOk, 'Tipp [Chor] im Takes-Blatt öffnet das Blatt „Chor“');
const tT = Date.now();
await p.tap('.pop.g6sheet button[data-rec=terz]');
await p.waitForFunction(R => { const i = SYNQUENZER.g6Info(R); return i && i.chor; }, R, {timeout: 20000});
const okW = await p.evaluate(R => SYNQUENZER.g6Wait(R), R); const tTerz = Date.now() - tT;
let inf = await p.evaluate(R => SYNQUENZER.g6Info(R), R);
{ const V = inf.chor.voices[0], rows = []; let bad = 0; V.n.forEach((n, k) => { const p0 = Math.round(n.m), q = p0 + n.iv; rows.push(nm(p0) + '→' + nm(q)); if (q !== TERZ_G[MEL[k]] || p0 !== MEL[k]) bad++; });
  ok(okW && V.n.length === 8 && !bad, `G6-01 G-Dur Terz oben (Tipp): ${rows.join(' ')} – ${bad} falsch (Fis leitereigen: D→Fis, Fis→A) [fertig nach ${tTerz} ms]`); }
for (const c of [0, 1]) {
  const b = await p.evaluate(([R, c]) => SYNQUENZER.g6Buf(R, 0, c), [R, c]), y = Float32Array.from(b.data), want = [-6, 8][c], e = [];
  truth.forEach((n, k) => { const f = notePitch(y, SR, n.t0 + 0.06 + [0.012, 0.024][c], n.t1 - 0.05); e.push(ct(f, hz(TERZ_G[MEL[k]]))); });
  const w = Math.max(...e.map(v => Math.abs(v - want)));
  ok(w <= 5 && Math.max(...e.map(Math.abs)) <= 10, `G6-01 Kopie ${c + 1}: Tonhöhe je Chornote (Soll Terz ${want > 0 ? '+' : ''}${want} Cent Doppel-Verstimmung) max ${w.toFixed(1)} Cent neben Soll; gegen reine Terz max ${Math.max(...e.map(Math.abs)).toFixed(1)} Cent (±10)`);
}
// Dreistimmig mit Begleitung: Akkord der Stelle aus den anderen Spuren
await p.tap('.pop.g6sheet button[data-rec=drei]'); await sleep(200); await p.evaluate(R => SYNQUENZER.g6Wait(R), R);
inf = await p.evaluate(R => SYNQUENZER.g6Info(R), R);
{ const got = MEL.map((m, k) => inf.chor.voices.map(v => Math.round(v.n[k].m) + v.n[k].iv)); const bad = got.filter((g, k) => !deq(g, DREI[k])).length;
  ok(inf.chor.voices.length === 2 && !bad, `G6 Dreistimmig mit Begleitung (G | D): ${got.map((g, k) => nm(MEL[k]) + ':' + g.map(nm).join('/')).join(' ')} – ${bad} anders als Akkordtöne der Begleitung (D4 über D-Dur → Fis4/A4)`); }
// Barbershop
await p.tap('.pop.g6sheet button[data-rec=barber]'); await sleep(200); await p.evaluate(R => SYNQUENZER.g6Wait(R), R);
inf = await p.evaluate(R => SYNQUENZER.g6Info(R), R);
{ const tri = k => k < 4 ? [7, 11, 2] : [2, 6, 9], got = MEL.map((m, k) => inf.chor.voices.map(v => Math.round(v.n[k].m) + v.n[k].iv)); let bad = [];
  got.forEach((g, k) => { const [t, b, s] = g, T = tri(k), pc = q => ((q % 12) + 12) % 12; if (!(t > MEL[k] && b < MEL[k] && s < b && T.includes(pc(t)) && T.includes(pc(b)) && pc(s) === T[0] && t - MEL[k] <= 5 && MEL[k] - b <= 5)) bad.push(nm(MEL[k])); });
  ok(inf.chor.voices.length === 3 && !bad.length, `G6 Barbershop (Tenor/Bariton/Bass nach Akkord der Begleitung): ${got.map((g, k) => nm(MEL[k]) + ':' + g.map(nm).join('/')).join(' ')}${bad.length ? ' – falsch bei ' + bad.join(',') : ''}`); }
// zurück auf Terz (80er), Lautheit am Ausgang: Lead allein vs Chor allein, Begleitung stumm
await p.tap('.pop.g6sheet button[data-rec=terz]'); await sleep(200); await p.evaluate(R => SYNQUENZER.g6Wait(R), R);
const ltA = await ltGet(p); ok(!ltA.filter(d => d > 50).length, `keine langen Tasks > 50 ms bei Tipp Chor/Terz/Dreistimmig/Barbershop: [${ltA.join(',') || '–'}]`);
await p.evaluate(() => { SYNQUENZER.setMute(0, true); SYNQUENZER.setMute(1, true); });
const meas = async solo => { await p.evaluate(k => { while (SYNQUENZER.g6Info().solo != null) SYNQUENZER.g6Solo(SYNQUENZER.g6Info().solo); if (k != null) SYNQUENZER.g6Solo(k); }, solo);
  await p.evaluate(() => SYNQUENZER.launchScene(0)); await rec2Start(p); await p.evaluate(() => SYNQUENZER.play()); await sleep(4400); await p.evaluate(() => SYNQUENZER.stop()); await sleep(900); const rr = await rec2Stop(p); await sleep(200);
  let pk = 0; for (const v of rr.l) pk = Math.max(pk, Math.abs(v)); for (const v of rr.r) pk = Math.max(pk, Math.abs(v)); return {L: lufs(rr.l, rr.r, rr.sr), pk, rr}; };
await p.evaluate(() => SYNQUENZER.closePop && SYNQUENZER.closePop());
for (const mix of ['80', 'pop']) {
  if (mix === 'pop') { await p.evaluate(R => SYNQUENZER.g6Mix(R, 'pop'), R); await p.evaluate(R => SYNQUENZER.g6Wait(R), R); }
  const A = await meas(-2), B = await meas(-1), Cc = await meas(null), d = A.L - B.L;
  ok(d >= 6 && d <= 10, `G6-02 Terz ${mix === '80' ? '80er' : 'Pop'}: Lead ${A.L.toFixed(1)} LUFS, Chor ${B.L.toFixed(1)} LUFS → Chor ${d.toFixed(1)} LU unter dem Lead (Soll 6…10; Ziel laut Bau ${mix === '80' ? 8 : 9}); Summe ${Cc.L.toFixed(1)} LUFS, Spitze ${(20 * Math.log10(Cc.pk)).toFixed(1)} dBFS`);
  if (mix === '80') { const LL = B.rr.l.reduce((s, v) => s + v * v, 0), RR = B.rr.r.reduce((s, v) => s + v * v, 0); console.log('  Terz-Chor L/R-Balance ' + (10 * Math.log10(LL / RR)).toFixed(1) + ' dB (eine Stimme → links)'); }
}
await p.evaluate(() => { SYNQUENZER.setMute(0, false); SYNQUENZER.setMute(1, false); while (SYNQUENZER.g6Info().solo != null) SYNQUENZER.g6Solo(SYNQUENZER.g6Info().solo); });
// Selbst singen (API): Dreistimmig, Stimme 2 = Akkordton 2 selbst singen
await p.evaluate(R => SYNQUENZER.g6Make(R, 'drei', 'up', '80'), R); await p.evaluate(R => SYNQUENZER.g6Wait(R), R);
const before = (await p.evaluate(R => SYNQUENZER.g6Info(R), R)).chor;
await p.evaluate(R => SYNQUENZER.g6Arm(R, 1), R);
const armI = await p.evaluate(R => SYNQUENZER.g6Info(R), R);
// Führung: Solo der Stimme, Lead schweigt → Ausgang = Stimme 2 (Pitch = Akkordton 2)
await p.evaluate(() => { SYNQUENZER.setMute(0, true); SYNQUENZER.setMute(1, true); SYNQUENZER.launchScene(0); });
await rec2Start(p); await p.evaluate(() => SYNQUENZER.play()); await sleep(4300); await p.evaluate(() => SYNQUENZER.stop()); await sleep(300); const G = await rec2Stop(p);
{ const L = Float32Array.from(G.l), R2 = Float32Array.from(G.r), mono = L.map((v, i) => v + R2[i]); let on = 0; for (let i = 0; i < mono.length; i++) if (Math.abs(mono[i]) > 0.003) { on = i; break; }
  const f = notePitch(mono, G.sr, on / G.sr + 0.1, on / G.sr + 0.35), want = hz(DREI[0][1]);
  ok(armI.arm && armI.solo === 1 && Math.abs(ct(f, want)) < 30, `G6 Selbst singen: Führung spielt Stimme 2 solo (gemessen ${f.toFixed(1)} Hz, Soll ${nm(DREI[0][1])} ${want.toFixed(1)} Hz, ${ct(f, want).toFixed(1)} Cent inkl. Doppel)`); }
const sung = singer(SR, 4.3, MEL.map((m, k) => ({t0: 0.04 + k * 0.5, vib: 20, segs: [{m: DREI[k][1], off: 0, d: 0.43, vowel: 'o', f0: hz(DREI[k][1] + 0.1)}]})), {seed: 9}).x;
const r2 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 2}), toI16(sung)); await sleep(600);
const after = (await p.evaluate(R => SYNQUENZER.g6Info(R), R)), au = (await p.evaluate(R => SYNQUENZER.getClip(R.t, 0).audio, R));
ok(after.chor.voices[1].take && after.chor.voices[1].take.take === r2.id && au.take === r1.id && !au.alt && after.solo == null && ['pan', 'rev', 'dly', 'db'].every(k => after.chor.voices[1][k] === before.voices[1][k]),
  `G6-04 Selbst gesungen: Stimme 2 = neuer Take (${after.chor.voices[1].take && after.chor.voices[1].take.take === r2.id}), Lead bleibt (${au.take === r1.id}), kein alt-Eintrag (${!au.alt}), Solo aus (${after.solo}), Pan/Sends gleich`);
await p.evaluate(() => { SYNQUENZER.setMute(0, false); SYNQUENZER.setMute(1, false); });
// Song mit der Szene: Chor spielt mit (Quellen zählen + Chor-Solo hörbar)
await p.evaluate(() => { window.__src = 0; const o = AudioBufferSourceNode.prototype.start; if (!window.__hooked) { window.__hooked = 1; AudioBufferSourceNode.prototype.start = function (...a) { if (this.buffer && this.buffer.duration > 1) window.__src++; return o.apply(this, a); }; } });
const bars = await p.evaluate(() => SYNQUENZER.songFromChain([{scene: 0, bars: 2}, {scene: 0, bars: 2}]));
await p.evaluate(() => { SYNQUENZER.setMute(0, true); SYNQUENZER.setMute(1, true); SYNQUENZER.g6Solo(-1); window.__src = 0; });
await longTasks(p);
await rec2Start(p); await p.evaluate(() => SYNQUENZER.songPlay(0)); await sleep(5000); const nS = await p.evaluate(() => window.__src); await p.evaluate(() => SYNQUENZER.songPlay(false)); await sleep(300); const SG = await rec2Stop(p);
const ltS = await ltGet(p);
await p.evaluate(() => SYNQUENZER.g6Solo(-1));
{ const Ls = lufs(SG.l, SG.r, SG.sr); ok(bars === 4 && nS >= 4 && Ls > -50, `G6 Song (Szene 0 ×2): Chor spielt mit – ${nS} lange Puffer-Quellen gestartet (Lead + Stimme 1 ×2 + selbst gesungen), Chor-Solo im Song ${Ls.toFixed(1)} LUFS; lange Tasks [${ltS.join(',') || '–'}]`); }
await p.evaluate(() => { SYNQUENZER.setMute(0, false); SYNQUENZER.setMute(1, false); });
// Speichern/Laden
const c0 = (await p.evaluate(R => SYNQUENZER.g6Info(R), R)).chor;
await p.evaluate(() => SYNQUENZER.save()); await sleep(500); await p.reload(); await sleep(1500); await p.evaluate(() => SYNQUENZER.load()); await sleep(1200);
ok(deq((await p.evaluate(R => SYNQUENZER.g6Info(R), R)).chor, c0), 'G6-05 Speichern/Laden: Chor (mit selbst gesungener Stimme) deep-equal');
// Layout 320×568 und 844×390: Blatt Chor + Noten-Editor einer Stimme
for (const [w, h] of [[320, 568], [844, 390]]) {
  await p.setViewportSize({width: w, height: h}); await sleep(300);
  await p.evaluate(R => SYNQUENZER.g6Sheet(R), R); await sleep(500);
  const lay = await p.evaluate(() => { const pop = document.querySelector('.pop.g6sheet'); if (!pop) return null; const pr = pop.getBoundingClientRect(), out = [];
    for (const e of pop.querySelectorAll('button, b, small, h4, .small')) { const q = e.getBoundingClientRect(); if (q.width === 0) continue; out.push({t: e.textContent.trim().slice(0, 18), l: q.left, r: q.right, tp: q.top, b: q.bottom, ov: e.scrollWidth > e.clientWidth + 1 && e.tagName === 'BUTTON', h: q.height, w: q.width, btn: e.tagName === 'BUTTON', vis: q.bottom > pr.top && q.top < pr.bottom}); }
    return {out, W: innerWidth, H: innerHeight, pt: pr.top, pb: pr.bottom, sh: pop.scrollHeight, ch: pop.clientHeight, docW: document.documentElement.scrollWidth}; });
  const cut = lay.out.filter(e => e.l < -0.5 || e.r > lay.W + 0.5 || e.ov), small = lay.out.filter(e => e.btn && (e.h < 43.5 || e.w < 43.5));
  await p.screenshot({path: `/home/user/Synquenzer/bau/helfer/G267/tests/rt/out/g6-${w}x${h}.png`});
  ok(lay && !cut.length && !small.length && lay.pb <= lay.H + 0.5 && lay.docW <= w, `Layout Blatt Chor ${w}×${h}: Blatt ${lay.pt.toFixed(0)}–${lay.pb.toFixed(0)} (Fenster ${lay.H}), Scroll ${lay.sh}/${lay.ch}, Seitenbreite ${lay.docW}; abgeschnitten [${cut.map(e => e.t).join(',') || '–'}]; Tasten < 44 [${small.map(e => e.t + ' ' + e.w.toFixed(0) + '×' + e.h.toFixed(0)).join(',') || '–'}]`);
  await p.evaluate(() => SYNQUENZER.closePop && SYNQUENZER.closePop()); await sleep(150);
  await p.evaluate(R => SYNQUENZER.g2Open(R, {voice: 0}), R); await sleep(500);
  const e2 = await p.evaluate(() => { const sh = document.querySelector('#wpSheet.open'); if (!sh) return null; const out = []; for (const e of sh.querySelectorAll('button, canvas, .qh b, .wpinfo')) { const q = e.getBoundingClientRect(); if (!q.width) continue; out.push({t: (e.textContent || e.tagName).trim().slice(0, 14), l: q.left, r: q.right, tp: q.top, b: q.bottom, ov: e.tagName === 'BUTTON' && e.scrollWidth > e.clientWidth + 1}); } return {out, W: innerWidth, H: innerHeight}; });
  const cut2 = e2 ? e2.out.filter(e => e.l < -0.5 || e.r > e2.W + 0.5 || e.b > e2.H + 0.5 || e.tp < -0.5 || e.ov) : [{t: 'fehlt'}];
  await p.screenshot({path: `/home/user/Synquenzer/bau/helfer/G267/tests/rt/out/g6-voice-${w}x${h}.png`});
  ok(!cut2.length, `Layout Noten-Editor einer Chor-Stimme ${w}×${h}: abgeschnitten [${cut2.map(e => e.t + '@' + e.l.toFixed(0) + ',' + e.tp.toFixed(0) + '–' + e.r.toFixed(0) + ',' + e.b.toFixed(0)).join(' ') || '–'}]`);
  await p.evaluate(() => SYNQUENZER.g2Close());
}
ok(!errs.length, 'keine Seitenfehler ' + errs.join(' | '));
await br.close();
fs.writeFileSync('/home/user/Synquenzer/bau/helfer/G267/tests/rt/out/rt-g6.out', OUT.join('\n') + '\n');
console.log(fail ? fail + ' FEHLER' : 'ALLE GRÜN'); process.exit(fail ? 1 : 0);
