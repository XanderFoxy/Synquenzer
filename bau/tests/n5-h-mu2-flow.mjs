// QA musiker run 2 (VC2a): Xander's song flow by finger + API where the K regression did, and per step: which history events came
import {open, sleep, OUT, summ} from './n5-h-mu2-lib.mjs';
const VP = (process.argv[2] || '390x844').split('x').map(Number), TAG = VP.join('x');
let fail = 0; const ok = (c, m) => { console.log((c ? 'OK  ' : 'BAD ') + m); if (!c) fail++; };
const T = await open({vp: VP}); let {p, E} = T;
const find = (sel, re) => E(([sel, src]) => { const rx = src ? new RegExp(src) : null; return [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (!rx || rx.test((e.textContent || '').trim())); }).map(e => { const r = e.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height / 2, t: (e.textContent || '').trim().slice(0, 40)}; }); }, [sel, re ? re.source : null]);
const lvl = () => E(() => new Promise(r => { const a = AU.ctx.createAnalyser(); a.fftSize = 8192; AU.M.ceil.connect(a); setTimeout(() => { const b = new Float32Array(a.fftSize); a.getFloatTimeDomainData(b); let s = 0; for (const v of b) s += v * v; const f = new Float32Array(a.frequencyBinCount); a.getFloatFrequencyData(f); let mi = 1; for (let i = 2; i < f.length; i++) if (f[i] > f[mi]) mi = i; try { AU.M.ceil.disconnect(a); } catch (e) {} r({rmsDb: 10 * Math.log10(s / b.length + 1e-20), peakHz: mi * AU.ctx.sampleRate / a.fftSize}); }, 400); }));
const waitB = b => p.waitForFunction(b => SYNQUENZER.runtime().beat >= b, b, {timeout: 60000, polling: 10});
let n0 = await T.evN(); const ALL = [];
const step = async (name, fn, wait = 2600) => { let r; try { r = await fn(); } catch (e) { r = 'ERR ' + e.message; } await sleep(wait); await T.drain(); const evs = await T.evSince(n0); n0 += evs.length; ALL.push(...evs.map(e => Object.assign(e, {step: name}))); console.log(`## ${name} → ${String(JSON.stringify(r)).slice(0, 160)}\n   ${summ(evs).join('\n   ') || '(keine)'}`); return {r, evs}; };
await E(() => { SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(120); });
await sleep(2600); await T.drain(); n0 = await T.evN();
console.log('start', JSON.stringify(await E(() => SYNQUENZER.history())));
// 1 scene 1 by finger
await step('▶1 Szene per Finger', async () => { const b = (await find('button.scn', /^▶\s*1/))[0]; await T.tap(b.cx, b.cy, 300); return b.t; });
await step('läuft 4 s, nichts angefasst', () => sleep(4000));
// 2 record a clip (REC on Synth 1, scene 4)
await step('REC Clip Synth 1 Szene 4', async () => {
  await E(() => { SYNQUENZER.setRecOptions({countIn: 0, length: 1}); SYNQUENZER.selectSlot(0, 3); });
  const b0 = Math.ceil(await E(() => SYNQUENZER.runtime().beat) / 4) * 4 + 4;
  await waitB(b0 - .5); await E(() => SYNQUENZER.rec());
  for (const [b, n] of [[b0 + .05, 60], [b0 + 1.05, 64], [b0 + 2.05, 67]]) { await waitB(b); await E(n => SYNQUENZER.keyOn(n), n); await sleep(200); await E(n => SYNQUENZER.keyOff(n), n); }
  await waitB(b0 + 5); await sleep(300);
  const c = await E(() => SYNQUENZER.getClip(0, 3)); return c && c.notes.length;
});
// 3 FANG chords → part
await step('FANG 8 Takte Akkorde → Teil', async () => {
  const chords = [57, 53, 48, 55, 57, 53, 48, 55]; const b0 = Math.ceil((await E(() => audBeat())) / 4) * 4 + 4;
  for (let k = 0; k < chords.length; k++) { await p.waitForFunction(b => audBeat() >= b, b0 + 4 * k + 0.05, {timeout: 60000, polling: 5}); await E(n => { SYNQUENZER.keyOn(n, .8, 'c'); setTimeout(() => SYNQUENZER.keyOff(0, 'c'), 120); }, chords[k]); }
  await p.waitForFunction(b => audBeat() >= b, b0 + 32.3, {timeout: 60000, polling: 5});
  const fb = (await find('#bFang, .fangb'))[0]; if (fb) await T.tap(fb.cx, fb.cy, 400);
  const fp = await E(() => SYNQUENZER.fangPart());
  await E(() => SYNQUENZER.fangAccept('part')); await sleep(400);
  return {fang: !!fb, len: fp && fp.len, parts: await E(() => SYNQUENZER.parts().filter(Boolean).length)};
});
await step('■ per Finger', async () => { const b = (await find('#bStop'))[0] || (await find('button', /^■$/))[0]; if (!b) return 'no stop'; await T.tap(b.cx, b.cy, 300); return b.t; });
// 4 vocal take in scene 8
const sine = (sr, sec, f, a = .3) => { const n = Math.round(sr * sec), x = new Array(n); for (let i = 0; i < n; i++) x[i] = Math.round(Math.sin(2 * Math.PI * f * i / sr) * a * 32767); return x; };
let tk;
await step('Gesangs-Take (440 Hz) in Szene 8', async () => { tk = await E(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 7, len: 2}), sine(48000, 4.2, 440)); return tk; });
await step('Szene 8 spielt den Take', async () => { await E(() => SYNQUENZER.launchScene(7)); await sleep(1300); const l = await lvl(); await E(() => SYNQUENZER.stop()); return l; });
// 5 song via placePart (drag & drop path)
await step('Song: S4 und S8 einsetzen (Ziehen)', async () => { await E(() => SYNQUENZER.setSong(null)); const a = await E(() => SYNQUENZER.placePart('S4', 0, 'insert')); const b = await E(() => SYNQUENZER.placePart('S8', 1, 'insert')); return [a, b, await E(() => SYNQUENZER.project().song.bars)]; });
await step('Song ▶ Takt 2', async () => { await E(() => SYNQUENZER.songPlay(1)); await sleep(1300); const l = await lvl(); await E(() => SYNQUENZER.stop()); return l; });
// 6 transpose
await step('Transponieren +2 (Hand)', async () => { await E(() => SYNQUENZER.play()); await sleep(300); const o0 = await E(() => SYNQUENZER.outPitch(0, 60)); await E(() => { SYNQUENZER.setKbMode('transpose'); SYNQUENZER.keyOn(62); }); await sleep(150); await E(() => SYNQUENZER.keyOff(62)); const o1 = await E(() => SYNQUENZER.outPitch(0, 60)); await E(() => SYNQUENZER.setKbMode('play')); return [o0, o1]; });
await step('Träger zurück + ■', async () => { await E(() => { SYNQUENZER.resetCarrier(); SYNQUENZER.stop(); }); });
// 7 MS 2000 on Synth 2
await step('Synth 2 → MS 2000, Programm Hauchlead', async () => { await E(async () => { mkLoad(); for (let i = 0; i < 80 && !mkLoaded(); i++) await new Promise(r => setTimeout(r, 100)); SYNQUENZER.setEngine(1, 'mk'); loadPreset(1, 'f-mk-d05'); }); await sleep(500); await E(() => { SYNQUENZER.selectSlot(1, 0); SYNQUENZER.keyOn(69); }); await sleep(700); const l = await lvl(); await E(() => SYNQUENZER.keyOff(69)); return l; });
// 8 undo all / redo all
let nU;
await step('↶ alles', async () => { nU = await E(() => SYNQUENZER.undoInfo().n); await E(n => { for (let i = 0; i < n; i++) undo(); }, nU); return nU; });
await step('↷ alles', async () => { await E(n => { for (let i = 0; i < n; i++) redo(); }, nU); return nU; });
const hc1 = await T.hc(); ok(hc1, 'historyCheck nach dem Ablauf');
const H1 = await E(() => SYNQUENZER.history());
console.log('history', JSON.stringify(H1));
// 9 save → reload
await E(() => SYNQUENZER.save()); await sleep(2500);
const P0 = await E(() => JSON.stringify(SYNQUENZER.project()));
await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.runtime, null, {timeout: 30000}); await sleep(3000);
const P1 = await E(() => JSON.stringify(SYNQUENZER.project()));
const sk = s => { const o = JSON.parse(s); delete o.ui; const so = x => Array.isArray(x) ? x.map(so) : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().map(k => [k, so(x[k])])) : x; return JSON.stringify(so(o)); };
ok(sk(P0) === sk(P1), 'save → reload deep-equal');
const H2 = await E(() => SYNQUENZER.history());
console.log('history after reload', JSON.stringify(H2));
ok(H2.events >= H1.events && H2.keyframes === H1.keyframes + 1, 'events kept after reload (' + H1.events + ' → ' + H2.events + ', kf ' + H1.keyframes + ' → ' + H2.keyframes + ')');
ok(await E(() => historyCheck()), 'historyCheck after reload');
await E(() => SYNQUENZER.launchScene(7)); await sleep(1500);
const l4 = await lvl(); ok(Math.abs(l4.peakHz - 440) < 12 && l4.rmsDb > -30, 'after reload scene 8 plays the take: ' + l4.peakHz.toFixed(0) + ' Hz ' + l4.rmsDb.toFixed(1));
await E(() => SYNQUENZER.stop()); await sleep(300);
// summary of data events per step
const by = {}; for (const e of ALL) { const k = e.step; by[k] = by[k] || {}; by[k][e.u] = (by[k][e.u] || 0) + 1; }
console.log(JSON.stringify(by, null, 0));
const te = await E(() => SYNQUENZER.tickErrors()); ok(!te || !te.length, 'no tick errors');
ok(!T.errs.length, 'no console errors ' + JSON.stringify(T.errs.slice(0, 3)));
await T.b.close();
console.log(fail ? fail + ' BAD' : 'all ok');
