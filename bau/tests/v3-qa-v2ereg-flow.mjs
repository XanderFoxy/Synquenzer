// QA regression (V2d′): touch flows base (V2c′-fix 4.5.3) vs new (4.6.0):
// A clip view top ● records a clip (song present) — no start sheet; B song view ● on an empty song = first take, ▶ SONG plays it;
// C song view ● on a song → Start-Blatt → START (default) → CLIPS take → ● ends; ▶ SONG; undo
import { open, APP } from './v3-v2d-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/V2d′-fix.html';
const VP = process.argv[2] === 'L1' ? [844, 390] : [390, 844];
const waitBeat = (p, b, to = 40000) => p.waitForFunction(x => window.SYNQUENZER.runtime().beat > x, b, {timeout: to, polling: 5});
const grab = (p, maxB) => p.evaluate(m => window.SYNQUENZER.noteLog(4000).filter(n => n.beat != null && n.beat >= 0 && (m == null || n.beat < m)).map(n => n.track + '@' + (Math.round(n.beat * 4) / 4) + ':' + n.out).sort(), maxB);
const setupClips = () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(160); const K = {root: 9, scale: 'aeolian'}, N = (t, n, d) => ({t, d: d || .4, n, v: .8});
  Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 57), N(1, 60), N(2, 64), N(3, 60)]}); Q.setClip(0, 1, {len: 2, key: K, notes: [N(0, 53), N(4, 55)]});
  Q.setClip(1, 0, {len: 1, key: K, notes: [N(0, 69, 1.5), N(2, 72, 1.5)]}); Q.setClip(1, 1, {len: 1, key: K, notes: [N(.5, 76, .3), N(2.5, 74, .3)]});
  Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 1, d: .1, n: 42, v: .7}, {t: 2, d: .1, n: 38, v: .9}, {t: 3, d: .1, n: 42, v: .7}]});
  Q.setClip(4, 1, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 2.5, d: .1, n: 36, v: .9}, {t: 3, d: .1, n: 38, v: .9}]}); return 1; };
const ctr = (p, sel) => p.evaluate(s => { const e = s === 'SVREC' ? SV.btn.bRec : document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }, sel);
const tap = async (p, sel) => { const c = await ctr(p, sel); if (!c) throw new Error('no ' + sel); await p.touchscreen.tap(c.x, c.y); };
const songOf = p => p.evaluate(() => { const s = window.SYNQUENZER.song(); return s && {bars: s.bars, lanes: s.lanes, carrier: s.carrier.map(c => c.beat + ':' + (c.target ? c.target.name : '-')), marks: (s.marks || []).length}; });
const res = {};
for (const [name, file] of [['base', BASE], ['new', APP]]) {
  const r = res[name] = {};
  // ---- A
  { const {b, p, errs} = await open({width: VP[0], height: VP[1]}, file, true);
    await p.evaluate(setupClips); await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); Q.setRecOptions({countIn: 1, length: 'auto', quantize: '1/16'}); });
    await p.waitForTimeout(200);
    await tap(p, '.slot[data-t="2"][data-s="0"]'); await p.waitForTimeout(200);
    r.Asel = await p.evaluate(() => window.SYNQUENZER.runtime().selected);
    await tap(p, '#bRec'); await p.waitForTimeout(150);
    r.Apop = await p.evaluate(() => !!document.querySelector('.pop.rstart'));
    await p.waitForFunction(() => /rec/.test(window.SYNQUENZER.runtime().rec.state), null, {timeout: 10000, polling: 10}).catch(() => {});
    r.Ast = await p.evaluate(() => ({rec: window.SYNQUENZER.runtime().rec.state, song: window.SYNQUENZER.runtime().song.rec}));
    const sb = await p.evaluate(() => window.SYNQUENZER.runtime().beat);
    const at = [0, 1, 2, 3, 4, 5, 6, 7].map(k => Math.ceil(sb) + k), ns = [60, 62, 64, 65, 67, 65, 64, 62];
    for (let k = 0; k < 8; k++) { await waitBeat(p, at[k] - .02); await p.evaluate(n => window.SYNQUENZER.tap(n, 120), ns[k]); }
    await waitBeat(p, at[7] + .6); await tap(p, '#bRec');
    await waitBeat(p, at[7] + 6);
    r.Aclip = await p.evaluate(() => { const c = window.SYNQUENZER.getClip(2, 0); return c && {len: c.len, n: c.notes.map(x => x.n), t: c.notes.map(x => Math.round(x.t * 4) / 4)}; });
    r.Aafter = await p.evaluate(() => ({rec: window.SYNQUENZER.runtime().rec.state, slots: window.SYNQUENZER.runtime().slots}));
    await p.evaluate(() => window.SYNQUENZER.undo()); r.Aundo = await p.evaluate(() => !!window.SYNQUENZER.getClip(2, 0));
    r.Asong = await songOf(p);
    r.Aerrs = errs.slice(); r.Ate = await p.evaluate(() => window.SYNQUENZER.tickErrors()); await b.close(); }
  // ---- B
  { const {b, p, errs} = await open({width: VP[0], height: VP[1]}, file, true);
    await p.evaluate(setupClips); await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songView(true); Q.launchScene(0); });
    await waitBeat(p, 1); await tap(p, 'SVREC'); await p.waitForTimeout(100);
    r.Bpop = await p.evaluate(() => !!document.querySelector('.pop.rstart'));
    r.Brec = await p.evaluate(() => window.SYNQUENZER.runtime().song.rec);
    // take starts at beat 4 (next bar line): scene 2 at take bar 2, F chord at take bar 3
    await waitBeat(p, 11); await p.evaluate(() => window.SYNQUENZER.launchScene(1));
    await waitBeat(p, 15.5); await p.evaluate(() => { window.SYNQUENZER.setKbMode('transpose'); return window.SYNQUENZER.chord([65, 69, 72], 200); });
    await waitBeat(p, 20.05); await tap(p, 'SVREC'); await p.waitForTimeout(300);
    r.Bend = await p.evaluate(() => window.SYNQUENZER.runtime().song.lastEnd || null);
    r.Bsong = await songOf(p);
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.stop(); Q.setKbMode('play'); }); await p.waitForTimeout(400);
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.clearLog(); Q.songPlay(0); }); await waitBeat(p, 15.8).catch(e => r.timeout = (r.timeout || 0) + 1); await p.waitForTimeout(300);
    r.Blog = await grab(p, 16);
    await p.evaluate(() => window.SYNQUENZER.stop()); await p.waitForTimeout(200);
    r.Berrs = errs.slice(); r.Bte = await p.evaluate(() => window.SYNQUENZER.tickErrors()); await b.close(); }
  // ---- C
  { const {b, p, errs} = await open({width: VP[0], height: VP[1]}, file, true);
    await p.evaluate(setupClips); await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 4}]); Q.songView(true); Q.songPos(1); Q.songRecTargets({clips: true, chords: false, notes: false, mel: false}); });
    await p.waitForTimeout(300);
    await tap(p, 'SVREC'); await p.waitForTimeout(300);
    r.Cpop = await p.evaluate(() => { const s = document.querySelector('.pop.rstart'); return s && {head: s.querySelector('.rs-h b').textContent, modes: [...s.querySelectorAll('.rs-m')].map(x => x.dataset.m + (x.classList.contains('on') ? '*' : '')), tg: [...s.querySelectorAll('.rs-t')].map(x => x.textContent.trim() + (x.classList.contains('on') ? '*' : ''))}; });
    await tap(p, '.pop.rstart .rs-go'); await p.waitForTimeout(200);
    const st = await p.evaluate(() => { const s = window.SYNQUENZER.runtime().song; return {rec: s.rec, from: s.recFrom, to: s.recTo, mode: s.recMode || null}; });
    r.Cst = st; r.Csel = await p.evaluate(() => [window.SYNQUENZER.runtime().selected, window.SYNQUENZER.song().melodyTrack]);
    // preroll 1 bar → the take begins at song bar 1 (beat 4); launch scene 1 at song bar 2, end at bar line 3 + 0.1 beat
    await p.waitForFunction(() => { const s = window.SYNQUENZER.runtime().song; return s.beat != null && s.beat >= 8.6; }, null, {timeout: 30000, polling: 5});
    await p.evaluate(() => window.SYNQUENZER.launchScene(0));
    await p.waitForFunction(() => { const s = window.SYNQUENZER.runtime().song; return s.beat != null && s.beat >= 16.05; }, null, {timeout: 30000, polling: 5});
    await tap(p, 'SVREC'); await p.waitForTimeout(300);
    r.Csong = await songOf(p);
    r.Cend = await p.evaluate(() => window.SYNQUENZER.runtime().song.lastEnd || null);
    await p.evaluate(() => window.SYNQUENZER.stop()); await p.waitForTimeout(300);
    await p.evaluate(() => { const Q = window.SYNQUENZER; Q.clearLog(); Q.songPlay(0); }); await waitBeat(p, 23.8).catch(e => r.timeout = (r.timeout || 0) + 1); await p.waitForTimeout(300);
    r.Clog = await grab(p, 24);
    await p.evaluate(() => window.SYNQUENZER.stop());
    await p.evaluate(() => window.SYNQUENZER.undo()); r.Cundo = await songOf(p);
    r.Cerrs = errs.slice(); r.Cte = await p.evaluate(() => window.SYNQUENZER.tickErrors()); await b.close(); }
}
for (const f of Object.keys(res.new)) {
  const A = res.base[f], B = res.new[f];
  if (/log$/i.test(f)) { const miss = A.filter(x => !B.includes(x)), extra = B.filter(x => !A.includes(x)); console.log(f, A.length, B.length, miss.length || extra.length ? 'DIFF miss=' + JSON.stringify(miss.slice(0, 14)) + ' extra=' + JSON.stringify(extra.slice(0, 14)) : 'same'); continue; }
  const s = JSON.stringify(A) === JSON.stringify(B); console.log(f, s ? 'same' : 'DIFF', JSON.stringify(B), s ? '' : '\n   base ' + JSON.stringify(A));
}
