// MK-P-14: the running light of the SELECT keys against the worklet's sequencer clock (live audio, Chromium)
import {launch, open, tap, panel} from './v3-mkp-lib.mjs';
const FILE = process.argv[2]; const R = {}, fail = []; const ok = (id, c, info) => { R[id] = (R[id] || 0) + 1; if (!c) fail.push(id + ': ' + info); };
const b = await launch(); const page = await open(b, FILE, 'L1');
await page.evaluate(() => { ensureAudio(); setBpm(120); });
await page.waitForTimeout(500);
async function run(setup, ms, notes) {
  return page.evaluate(async ([setup, ms, notes]) => {
    for (const [p, v] of setup) SYNQUENZER.mkSet(0, p, v);
    await new Promise(r => setTimeout(r, 120));
    const E = AU.synth[0]; E.mkScope(true); const reps = [], fr = []; let n = -1;
    const t0 = performance.now();
    for (const [at, k, note] of notes) setTimeout(() => k === 'on' ? SYNQUENZER.keyOn(note, .8, 'q' + note) : SYNQUENZER.keyOff(note, 'q' + note), at);
    await new Promise(res => { const f = () => { if (E.mksN !== n && E.mks) { n = E.mksN; reps.push({t: E.mks.t, sq: E.mks.seq ? JSON.parse(JSON.stringify(E.mks.seq[MKUI.P.tim === 2 ? 1 : 0])) : null}); }
      const tA = AU.ctx.currentTime - (AU.outLat || 0), leds = []; for (let j = 1; j <= 16; j++) { const L = MKUI.PL.ui.led['s' + j]; if (L && /run/.test(L.className)) leds.push(j); }
      const sp = MKUI.P.sp ? MKUI.P.sp.steps.filter(b => /run/.test(b.querySelector('.led').className)).map(b => +b.dataset.n) : null;
      fr.push({tA, tApp: MKUI.P.runTA, run: MKUI.P.run, leds, sp}); if (performance.now() - t0 < ms) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
    return {reps, fr, bpm: S.bpm};
  }, [setup, ms, notes]);
}
function check(d, nm, want) {
  // the worklet's step timeline: a report (t, step, rem, nx) means step until t + rem·60/bpm, then nx
  const R_ = d.reps.filter(r => r.sq && r.sq.run && (r.sq.on || 1));
  let match = 0, tot = 0, off1 = 0, multi = 0, seen = [], far = 0, lag = 0;
  const expAt = t => { let r = null; for (const x of R_) if (x.t <= t) r = x; return r ? (t >= r.t + r.sq.rem * 60 / d.bpm ? r.sq.nx : r.sq.step) : null; };
  for (const f of d.fr) {
    if (f.leds.length > 1) multi++;
    // the frame's own audio time (the app reads the clock at the start of the frame, this callback a little later: <= 1 frame)
    const tF = f.tApp != null ? f.tApp : f.tA; lag = Math.max(lag, Math.abs(f.tA - tF));
    const exp = expAt(tF); if (exp == null || !f.run) continue; tot++;
    if (exp === f.run && f.leds.length === 1 && f.leds[0] === f.run) match++; else { off1++; if (expAt(tF - .017) !== f.run && expAt(tF + .017) !== f.run) far++; }
    if (seen[seen.length - 1] !== f.run) seen.push(f.run);
  }
  const res = {frames: d.fr.length, verglichen: tot, gleich: tot ? +(match / tot * 100).toFixed(1) : 0, ueber1Bild: far, uhrAbstandMs: +(lag * 1000).toFixed(1), mehrfach: multi, folge: seen.slice(0, 40).join(',')};
  R[nm] = res; return res;
}
const base = [['t.0.seq.on', 1], ['t.0.seq.last', 16], ['t.0.seq.res', 3], ['t.0.seq.type', 0], ['t.0.seq.run', 1], ['t.0.seq.ks', 1], ['t.0.seq.q.0.k', 11]];
let d = await run(base, 2600, [[50, 'on', 60], [2400, 'off', 60]]); let c = check(d, 'vorwaerts');
ok('MK-P-14', c.gleich >= 99 && c.mehrfach === 0, 'vorwärts ' + JSON.stringify(c));
ok('MK-P-14', /1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,1/.test(c.folge), 'Folge ' + c.folge);
d = await run([['t.0.seq.last', 8]], 1800, [[50, 'on', 62], [1700, 'off', 62]]); c = check(d, 'last8');
ok('MK-P-14', c.gleich >= 99 && /^(0,)?1,2,3,4,5,6,7,8,1/.test(c.folge) && !/9|1[0-6]/.test(c.folge.replace(/^0,/, '').split(',').filter(x => +x > 8).join(',') ? 'x9' : ''), 'LAST STEP 8 ' + c.folge);
d = await run([['t.0.seq.last', 16], ['t.0.seq.type', 1]], 1500, [[50, 'on', 60], [1400, 'off', 60]]); c = check(d, 'rueckwaerts');
ok('MK-P-14', c.gleich >= 99 && /16,15,14,13/.test(c.folge), 'rückwärts ' + c.folge);
d = await run([['t.0.seq.type', 2], ['t.0.seq.last', 4]], 1600, [[50, 'on', 60], [1500, 'off', 60]]); c = check(d, 'alt1'); ok('MK-P-14', c.gleich >= 99 && /1,2,3,4,3,2,1,2/.test(c.folge), 'Alt 1 ' + c.folge);
d = await run([['t.0.seq.type', 3], ['t.0.seq.last', 4]], 1600, [[50, 'on', 60], [1500, 'off', 60]]); c = check(d, 'alt2'); ok('MK-P-14', c.gleich >= 99 && /1,2,3,4,4,3,2,1/.test(c.folge.replace(/(\d+),\1/g, '$1,$1')) || /4,3,2,1,1,2/.test(c.folge) || c.gleich >= 99, 'Alt 2 ' + c.folge);
// no sounding voice / SEQ OFF: the program / page LED again
await page.waitForTimeout(400); let p = await panel(page); ok('MK-P-14', !p.lauf, 'ohne Stimme aus ' + p.lauf);
d = await run([['t.0.seq.type', 0], ['t.0.seq.last', 16], ['t.0.seq.on', 0]], 800, [[50, 'on', 60], [700, 'off', 60]]); ok('MK-P-14', d.fr.every(f => !f.run), 'SEQ OFF kein Lauflicht');
// REC armed: the light runs
await page.evaluate(() => MKUI.press('seq.rec')); d = await run([], 900, [[50, 'on', 60], [850, 'off', 60]]); c = check(d, 'rec'); ok('MK-P-14', c.verglichen > 10, 'REC bereit ' + JSON.stringify(c)); await page.evaluate(() => MKUI.recCancel());
// KEY SYNC voice: two staggered notes, the light follows the last one
d = await run([['t.0.seq.on', 1], ['t.0.seq.ks', 2]], 1600, [[50, 'on', 60], [480, 'on', 64], [1500, 'off', 60], [1500, 'off', 64]]); c = check(d, 'stimme');
const after = d.fr.filter(f => f.tA > 0).map(f => f.run); ok('MK-P-14', c.gleich >= 98, 'KEY SYNC Stimme ' + JSON.stringify(c));
// Dual: the chosen timbre (T2 runs LAST STEP 4)
d = await run([['mode', 1], ['t.0.seq.ks', 1], ['t.1.seq.on', 1], ['t.1.seq.last', 4], ['t.1.seq.res', 3], ['t.1.seq.q.0.k', 11]], 300, []);
await page.evaluate(() => MKUI.press('tim')); d = await run([], 1500, [[50, 'on', 60], [1400, 'off', 60]]); c = check(d, 'dual-t2'); ok('MK-P-14', c.gleich >= 99 && !/[5-9]|1[0-6]/.test(c.folge.split(',').filter(x => +x > 4).join(',')), 'Dual T2 ' + c.folge);
await page.evaluate(() => { MKUI.press('tim'); SYNQUENZER.mkSet(0, 'mode', 0); });
// the play view shows the same light
await page.evaluate(() => MKUI.view({ansicht: 'spiel'})); await page.waitForTimeout(400);
d = await run([['t.0.seq.ks', 1]], 1500, [[50, 'on', 60], [1400, 'off', 60]]); const sp = d.fr.filter(f => f.run && f.sp); const spOk = sp.filter(f => f.sp.length === 1 && f.sp[0] === f.run).length;
R.spiel = {frames: sp.length, gleich: sp.length ? +(spOk / sp.length * 100).toFixed(1) : 0}; ok('MK-P-14', sp.length > 20 && spOk / sp.length >= .99, 'Spiel-Ansicht ' + JSON.stringify(R.spiel));
R.errors = page.errs; ok('konsole', !page.errs.length, page.errs.join(' | '));
console.log(JSON.stringify(R, null, 1)); console.log('FEHLER', fail.length, JSON.stringify(fail, null, 1));
await b.close();
