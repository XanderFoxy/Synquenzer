// QA (V2e): the Bereich-Leiste replaces the Träger bar only while bars are selected in the song view — never leaves the
// Träger hidden: switch to CLIPS, ● record from the selection, undo the song away, load another project, ▶ SONG playing
import { open, APP } from './v3-v2d-pw.mjs';
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2ereg/';
const VPS = {P1: [390, 844], L1: [844, 390]};
const st = () => { const c = document.getElementById('carrier'), r = document.getElementById('rangeBar'); return {car: !!(c && c.offsetWidth && c.offsetHeight), rng: !!(r && r.offsetWidth && r.offsetHeight), app: document.getElementById('app').classList.contains('rangebar'), sv: !!window.SYNQUENZER.runtime().songView, sel: window.SYNQUENZER.songSelect(), rec: !!window.SYNQUENZER.runtime().song.rec}; };
for (const vp of Object.keys(VPS)) {
  const [w, h] = VPS[vp];
  const {b, p, errs} = await open({width: w, height: h}, APP, true);
  const cdp = await p.context().newCDPSession(p);
  const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, id: 1}]});
  const tap = async (x, y, wait = 300) => { await touch('touchStart', x, y); await p.waitForTimeout(40); await touch('touchEnd', x, y); await p.waitForTimeout(wait); };
  const tapEl = async sel => { const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e || !e.offsetWidth) return null; const q = e.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; }, sel); if (!r) return false; await tap(r[0], r[1]); return true; };
  const tapPop = async t => { const r = await p.evaluate(t => { const pp = document.querySelector('#popLayer .pop'); const bb = pp && [...pp.querySelectorAll('button')].find(x => x.offsetWidth && x.textContent.includes(t)); if (!bb) return null; const q = bb.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; }, t); if (r) await tap(r[0], r[1]); return !!r; };
  const setup = () => p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'}, N = (t, n) => ({t, d: .4, n, v: .8});
    Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 57), N(2, 60)]}); Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}]});
    Q.launchScene(0); Q.songRec(true); return 1; });
  const mkSong = async () => { await setup(); await p.waitForFunction(() => window.SYNQUENZER.runtime().beat > 12.5, null, {timeout: 20000, polling: 20}); await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songRec(false); Q.stop(); Q.songView(true); }); await p.waitForTimeout(400); };
  const selBar = async bar => { const i = await p.evaluate(() => window.SYNQUENZER.svLayoutInfo()); await tap(i.canvas.x + i.cellW * (bar + .5), i.canvas.y + 8); };
  const out = {};
  // A) selection → CLIPS ⇄ → Träger visible in the clip view; back to SONG
  await mkSong(); await selBar(1); out.A0 = await p.evaluate(st);
  await tapEl('#songView .sv-sw'); out.A1 = await p.evaluate(st);
  await p.screenshot({path: D + `t6-${vp}-A1.png`});
  // B) ● Aufnehmen from the range bar → start sheet → START: while ● SONG records, the Träger bar must show
  await p.evaluate(() => window.SYNQUENZER.songView(true)); await p.waitForTimeout(300);
  if (!(await p.evaluate(st)).sel) await selBar(1);
  out.B0 = await p.evaluate(st);
  out.Brec = await tapEl('#rangeBar [data-a="rec"]');
  out.Bpop = await p.evaluate(() => { const pp = document.querySelector('#popLayer .pop'); return pp ? pp.className + ' | ' + pp.textContent.slice(0, 80) : null; });
  out.Bstart = await p.evaluate(() => { const pp = document.querySelector('#popLayer .pop'); const bb = pp && [...pp.querySelectorAll('button')].filter(x => x.offsetWidth).map(x => x.textContent); return bb; });
  out.Bgo = await tapPop('START');
  await p.waitForTimeout(600);
  out.B1 = await p.evaluate(st);
  await p.screenshot({path: D + `t6-${vp}-B1.png`});
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songRec(false); Q.stop(); }); await p.waitForTimeout(400);
  out.B2 = await p.evaluate(st);
  // C) selection, then undo until the song is gone → Träger back
  await p.evaluate(() => window.SYNQUENZER.songView(true)); await p.waitForTimeout(200);
  await selBar(0); out.C0 = await p.evaluate(st);
  for (let k = 0; k < 6; k++) { await p.evaluate(() => window.SYNQUENZER.undo()); await p.waitForTimeout(120); }
  out.C1 = await p.evaluate(() => ({...(() => { const c = document.getElementById('carrier'); return {car: !!(c && c.offsetWidth && c.offsetHeight)}; })(), app: document.getElementById('app').classList.contains('rangebar'), song: !!window.SYNQUENZER.song()}));
  // D) selection, then load the demo (another project)
  await mkSong(); await selBar(1); out.D0 = await p.evaluate(st);
  await p.evaluate(async () => { await window.SYNQUENZER.loadDemo(); }); await p.waitForTimeout(600);
  out.D1 = await p.evaluate(st);
  await p.evaluate(() => window.SYNQUENZER.songView(false)); await p.waitForTimeout(300);
  out.D2 = await p.evaluate(st);
  await p.screenshot({path: D + `t6-${vp}-D2.png`});
  out.errs = errs.slice();
  console.log('==', vp); for (const k of Object.keys(out)) console.log('  ' + k, JSON.stringify(out[k]));
  await b.close();
}
