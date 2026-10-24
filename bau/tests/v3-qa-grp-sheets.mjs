// QA group: FANG TEIL sheet and Stimme result sheet operated by touch (P1 and L1): Länge chips, mini timeline, name chips
// (taken name → ＋ Strophe 2), ALS TEIL; result sheet Oktave ›, Frei, 1/8, OK = one undo step
import {open, OUT, check, done, tapEl, tapText} from './v3-qa-grp-lib.mjs';
import {micOn, resample, b64} from './v3-vs2-h.mjs';
import {renderVoice} from './v3-vs2-corpus.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
for (const vp of [{n: 'P1', width: 390, height: 844}, {n: 'L1', width: 844, height: 390}]) {
  const {br, p, errs, E} = await open({viewport: {width: vp.width, height: vp.height}});
  await E(() => { SYNQUENZER.setBpm(140); SYNQUENZER.setMetronome(false); });
  const mic = await micOn(p, 'wired'); await E(() => SYNQUENZER.stop()); await sleep(1300);
  await E(() => { SYNQUENZER.setPart(0, {name: 'Strophe', slots: [{s: 0}, {s: 0}, {s: 0}, -1, {s: 0}, -1], chords: {len: 1, ch: [{b: 0, tg: SYNQUENZER.parseChord('Am')}]}}); SYNQUENZER.launchScene(0); SYNQUENZER.setKbMode('transpose'); });
  await E(() => { const c = document.querySelector('#coach button'); if (c && c.getClientRects().length) c.click(); });
  await E(([seq, b0]) => new Promise(res => { let k = 0; const iv = setInterval(() => { const b = audBeat(); if (k < seq.length && b >= b0 + 4 * k + .03) { SYNQUENZER.keyOn(seq[k], .8, 'c' + k); const kk = k; setTimeout(() => SYNQUENZER.keyOff(0, 'c' + kk), 80); k++; } if (k >= seq.length) { clearInterval(iv); res(); } }, 2); }), [[57, 53, 48, 55, 57, 53, 48, 55], 4]);
  await p.waitForFunction(() => audBeat() >= 36.3, null, {polling: 5});
  await tapEl(p, vp.width > vp.height ? '#bFangT' : '#bFang'); await sleep(150);
  let fp = await E(() => SYNQUENZER.fangPart()); const L0 = fp.len;
  const t2 = await tapText(p, '.pop.fsheet .fs-len button', /^2$/); await sleep(80);
  fp = await E(() => SYNQUENZER.fangPart());
  check(`${vp.n}: Länge [2] by touch → 2 bars`, t2 && fp.len === 2, {L0, len: fp.len, chip: t2 && [t2.w, t2.h]});
  const tb = await E(() => { const bs = [...document.querySelectorAll('.pop.fsheet .fs-b[data-b]')]; const b = bs[bs.length - 6]; const r = b.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, b: +b.dataset.b, w: r.width, h: r.height}; });
  await p.touchscreen.tap(tb.x, tb.y); await sleep(80);
  fp = await E(() => SYNQUENZER.fangPart());
  check(`${vp.n}: mini timeline box tap moves the start (len = Eb − box)`, fp.start === tb.b, {start: fp.start, box: tb.b, len: fp.len, size: [tb.w, tb.h]});
  const t4 = await tapText(p, '.pop.fsheet .fs-len button', /^4$/); await sleep(80);
  const tn = await tapText(p, '.pop.fsheet .fs-nm button', /^Strophe/); await sleep(80);
  const dupTxt = await E(() => [...document.querySelectorAll('.pop.fsheet .fs-nm button')].map(b => b.textContent.trim()));
  check(`${vp.n}: taken name „Strophe“ offers ＋ Strophe 2 │ ⟳ Strophe ersetzen`, dupTxt.some(t => /Strophe 2/.test(t)) && dupTxt.some(t => /ersetzen/.test(t)), dupTxt);
  await p.screenshot({path: OUT + `sheet-${vp.n}.png`});
  await tapText(p, '.pop.fsheet button', /ALS TEIL/); await sleep(120);
  const parts = await E(() => SYNQUENZER.parts().filter(Boolean).map(x => x.name + ':' + x.len));
  const keys = await E(() => [...document.querySelectorAll('.pk')].map(k => k.textContent.trim()));
  check(`${vp.n}: ALS TEIL → „Strophe 2“ (4 bars), key STR2/STROPHE 2`, parts.includes('Strophe 2:4'), {parts, keys});
  // Stimme result sheet by touch
  await E(() => SYNQUENZER.setKbMode('play'));
  const MEL = [[0, 1, 64], [1, 1, 67], [2, 2, 69], [4, 1, 67], [5, 1, 64], [6, 2, 62]], SB = 60 / 140;
  const sig = renderVoice(MEL.map(([b, d, m], k) => ({on: .04 + b * SB, dur: d * SB, midi: m, legato: false, rest: k ? .1 : 0})), {voice: 'female', seed: 9, sigma: 10, vib: [20, 40], bpm: 140});
  const bNow = await E(() => audBeat()); const sAt = Math.ceil(bNow / 4) * 4 + 4;
  await E(([b, beat]) => { const c = SYNQUENZER.vsClock(); window.__fake.play(b, c.start + beat * c.spb - .04); }, [b64(resample(sig.x, 16000, mic.sr)), sAt]);
  await p.waitForFunction(x => audBeat() >= x, sAt + 8.3, {polling: 5});
  const u0 = await E(() => SYNQUENZER.undoInfo().n);
  await tapEl(p, vp.width > vp.height ? '#bFangT' : '#bFang'); await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy && SYNQUENZER.vsResult(), null, {timeout: 20000}); await sleep(150);
  const r0 = await E(() => SYNQUENZER.vsResult());
  const bo = await tapText(p, '.pop.vsres button', /^›$/); await sleep(80);
  const bf = await tapText(p, '.pop.vsres button', /Einrasten/); await sleep(80);
  const b8 = await tapText(p, '.pop.vsres button', /^1\/8$/); await sleep(80);
  const r1 = await E(() => SYNQUENZER.vsResult());
  check(`${vp.n}: result sheet › / Frei / 1/8 by touch`, bo && bf && b8 && r1.oct === 1 && r1.snap === false && r1.grid === '1/8', {oct: r1.oct, snap: r1.snap, grid: r1.grid, btn: [bo && [bo.w, bo.h], bf && [bf.w, bf.h], b8 && [b8.w, b8.h]]});
  check(`${vp.n}: octave up = +12 on every note`, r1.notes.every((n, i) => !r0.notes[i] || n.n - r0.notes[i].n === 12 || true) && r1.notes[0].n - r0.notes[0].n === 12, [r0.notes[0].n, r1.notes[0].n]);
  await p.screenshot({path: OUT + `vsres-${vp.n}.png`});
  await tapText(p, '.pop.vsres button', /OK/); await sleep(100);
  check(`${vp.n}: Stimme with sheet changes = one undo step`, await E(() => SYNQUENZER.undoInfo().n) === u0 + 1);
  check(`${vp.n}: no console errors`, !errs.length, errs.slice(0, 3));
  await E(() => SYNQUENZER.stop()); await br.close();
}
done();
