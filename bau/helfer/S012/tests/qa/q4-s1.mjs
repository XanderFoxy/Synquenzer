// S1: scene launch during a pass, clip launch, re-FANG doubling, early downbeat note, melody count per pass
import {launch, open, sleep, deq, tally} from '../h.mjs';
const ok = tally(); const br = await launch();
async function setup(p) {
  await p.evaluate(() => { const D = SYNQUENZER, nt = D.NT(); D.setBpm(240); D.setMetronome && D.setMetronome(false);
    D.setPart(0, {name: 'Strophe', slots: Array.from({length: nt}, (_, t) => D.getClip(t, 0) ? {s: 0} : -1), chords: {len: 4, ch: [{b: 0, tg: null}]}}); selectTrack(3); });
}
const pass = p => p.evaluate(() => { const rp = R.part, L4 = partLen(S.parts[rp.i]) * 4; return {st: rp.startBeat, L4, k: Math.floor((audBeat() - rp.startBeat) / L4)}; });
const waitB = (p, b) => p.waitForFunction(b => audBeat() >= b, b, {timeout: 30000, polling: 5});
const note = (p, n, id, ms = 150) => p.evaluate(([n, id, ms]) => { SYNQUENZER.keyOn(n, .8, id); setTimeout(() => SYNQUENZER.keyOff(n, id), ms); }, [n, id, ms]);
async function start(p) {
  await p.evaluate(() => SYNQUENZER.play()); await sleep(300);
  await p.tap('#partBar .pk[data-i="0"]');
  await p.waitForFunction(() => R.part && R.part.i === 0, null, {timeout: 5000});
  const q = await pass(p); return {A: q.st + (q.k + 1) * q.L4, L4: q.L4, st: q.st};
}
const fangBtn = async p => { for (const s of ['#bFang', '#bFangT']) { const e = await p.$(s); if (e && await e.isVisible()) return s; } const v = await p.evaluate(() => [...document.querySelectorAll('#bFang,#bFangT,.fangb')].map(b => b.id + ':' + b.hidden + ':' + getComputedStyle(b).display + ':' + b.className)); const r = await p.evaluate(() => { const b = document.getElementById('bFang'), k = b.getBoundingClientRect(); let e = b, h = []; while (e) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') h.push(e.id || e.className); e = e.parentElement; } return {r: [k.x, k.y, k.width, k.height], h, partI: R.part && R.part.i, beat: audBeat()}; }); console.log('NO FANG BUTTON VISIBLE', JSON.stringify(v), JSON.stringify(r)); return null; };
const tapFang = async p => { const s = await fangBtn(p); if (s) await p.tap(s); else await p.evaluate(() => fangTap()); };
// (a) scene launch during the pass
{
  const H = await open(br), p = H.p; await setup(p);
  const {A, L4} = await start(p);
  await waitB(p, A + 7.9); await p.evaluate(() => SYNQUENZER.launchScene(1));
  await sleep(300);
  const rp = await p.evaluate(() => R.part && {i: R.part.i, tmp: R.part.tmp, caught: R.part.caught});
  await waitB(p, A + L4 + 0.6);
  const act = await p.evaluate(() => SYNQUENZER.s1Active());
  await tapFang(p); await sleep(250);
  const inf = await p.evaluate(() => SYNQUENZER.s1Info()), sh = await p.evaluate(() => ({s1: !!document.querySelector('.s1sheet'), f: !!document.querySelector('.fsheet:not(.s1sheet)')}));
  console.log('(a) R.part after scene launch', JSON.stringify(rp), 's1Active', act, 'sheet', JSON.stringify(sh), inf && JSON.stringify(inf.lanes));
  ok(sh.s1 && inf && inf.lanes.some(l => l.some(e => e.bar === 2 && e.slot === 1)), '(a) Szenenwechsel in Takt 3 im Lauf → FANG = Fassung mit Sz2 ab Takt 3');
  ok(!H.errs.length, '(a) keine Fehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.ctx.close();
}
// (b)+(f) replace with 2 notes, then count melody notes per pass over 3 passes; FANG again → not doubled
{
  const H = await open(br), p = H.p; await setup(p);
  const {A, L4} = await start(p);
  await waitB(p, A + 1); await note(p, 72, 'a');
  await waitB(p, A + 9); await note(p, 76, 'b');
  await waitB(p, A + L4 + 0.5);
  await tapFang(p); await sleep(250);
  await p.tap('.s1sheet button[data-s1="rep"]'); await sleep(150);
  // the part keeps running: count melody notes over the next 3 full passes
  const q = await pass(p); const B = q.st + (q.k + 1) * q.L4;
  await waitB(p, B - 0.5); await p.evaluate(() => SYNQUENZER.clearLog());
  // tempo change + scene clip tap mid-pass → partDue re-runs
  await waitB(p, B + 6); await p.evaluate(() => { SYNQUENZER.setBpm(241); });
  await waitB(p, B + 3 * L4 + 0.3);
  const log = await p.evaluate(() => SYNQUENZER.noteLog(4096));
  const ml = log.filter(e => e.src === 'melody').map(e => [e.out, +(e.beat - B).toFixed(3)]);
  ok(ml.length === 6, '(f) Melodie im Teil: 2 Noten je Durchlauf, 3 Durchläufe = 6, keine doppelten: ' + JSON.stringify(ml));
  // FANG again without playing anything: mel must stay 2 notes
  await p.evaluate(() => SYNQUENZER.setBpm(240));
  await tapFang(p); await sleep(250);
  const inf = await p.evaluate(() => SYNQUENZER.s1Info());
  ok(inf && inf.mel && inf.mel[3] && inf.mel[3].length === 2, '(b) zweites FANG ohne Dazuspielen: weiter 2 Noten ' + JSON.stringify(inf && inf.mel));
  ok(inf && /Letzter Durchlauf eingefangen$/.test(await p.$eval('.s1sheet .fs-end', e => e.textContent)), '(b) Blatt meldet 0 dazugespielte Noten');
  await p.evaluate(() => SYNQUENZER.s1Discard());
  ok(!H.errs.length, '(b) keine Fehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.ctx.close();
}
// (c) a downbeat note played slightly early (40 ms before the pass's bar 1) + a note in the middle; then the part into the song
{
  const H = await open(br), p = H.p; await setup(p);
  const {A, L4} = await start(p);
  await waitB(p, A + 4); await note(p, 74, 'm');
  // just before the next pass downbeat (A+L4): 0.15 beats early (37 ms at 240 bpm)
  await waitB(p, A + L4 - 0.15); await note(p, 72, 'e');
  await waitB(p, A + L4 + 0.5);
  // the early note belongs to pass k+1 musically; FANG is pressed in pass k+1: last complete = pass k (A..A+L4)
  await tapFang(p); await sleep(250);
  const inf = await p.evaluate(() => SYNQUENZER.s1Info());
  console.log('(c) mel', JSON.stringify(inf && inf.mel));
  await p.tap('.s1sheet button[data-s1="rep"]'); await sleep(150);
  await p.evaluate(() => { SYNQUENZER.stop(); SYNQUENZER.setSong(null); SYNQUENZER.placePart('P1', 0, 'insert'); });
  const sm = await p.evaluate(() => S.song.mel[3] ? S.song.mel[3].notes.map(n => [n.n, n.t]) : []);
  const pm = (inf && inf.mel && inf.mel[3]) || [];
  ok(sm.length === pm.length, '(c) alle Noten der Fassung landen beim Einsetzen im Song: Fassung ' + JSON.stringify(pm.map(n => [n.n, n.t])) + ' / Song ' + JSON.stringify(sm));
  ok(!H.errs.length, '(c) keine Fehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.ctx.close();
}
// (d) FANG before a complete pass → old behaviour (no S1 sheet)
{
  const H = await open(br), p = H.p; await setup(p);
  const {st} = await start(p);
  await waitB(p, st + 2);
  await tapFang(p); await sleep(250);
  const sh = await p.evaluate(() => ({s1: !!document.querySelector('.s1sheet'), pop: UI.pop && UI.pop.name}));
  ok(!sh.s1, '(d) FANG vor dem ersten vollständigen Durchlauf: kein S1-Blatt (' + JSON.stringify(sh) + ')');
  ok(!H.errs.length, '(d) keine Fehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.ctx.close();
}
await br.close(); process.exit(ok.done() ? 1 : 0);
