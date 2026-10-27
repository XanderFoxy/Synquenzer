// G-S7-merge: SÄUBERN (VS4) × Marken/Dehnen (VS5) – Kette je Take, Wechsel beim Spielen, Undo, Speichern/Laden
import {launch, open5, sleep, toI16, deq, clickTone} from './gs7-v3-vs5b-h.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const br = await launch(null);
const ctx = await br.newContext({viewport: {width: 390, height: 844}});
let H = await open5(br, {ctx}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); }); await sleep(300);
const T = [0.52, 0.77, 1.03, 1.24, 1.53, 1.71, 2.04, 2.27, 2.49, 2.78, 3.01, 3.26];
const x = clickTone(T, 4.2); let seed = 3; for (let i = 0; i < x.length; i++) { seed = (seed * 16807) % 2147483647; x[i] += 0.01 * ((seed / 2147483647) * 2 - 1); }
const r = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 2}), toI16(x)), id = r.id;
await p.evaluate(id => { SYNQUENZER.clSet(id, 60); }, id); await p.evaluate(id => SYNQUENZER.clWait(id), id);
const s1 = await p.evaluate(id => ({cl: CL.buf.get(id) && CL.buf.get(id).a, same: tkPlayBuf(id) === CL.buf.get(id).b}), id);
ok(s1.cl === 60 && s1.same, 'SÄUBERN 60 % fertig, gespielt wird die gesäuberte Fassung ' + JSON.stringify(s1));
const det = await p.evaluate(async id => { const d = await SYNQUENZER.wpDetect(id); return {n: d.length, tag: WP.detCl.get(id)}; }, id);
ok(det.n >= 8 && det.tag === 60, 'Marken auf dem gesäuberten Take erkannt ' + JSON.stringify(det));
await p.evaluate(id => SYNQUENZER.wpQuantize(id, {grid: '1/8', strength: 1, mode: 'stretch'}), id);
for (let n = 0; n < 200 && !(await p.evaluate(id => wpReady(id), id)); n++) { await p.evaluate(id => tkPlayBuf(id), id); await sleep(25); }
const s2 = await p.evaluate(id => { const c = WP.cache.get(id), cb = CL.buf.get(id).b; return {mode: c && c.mode, src: !!c && c.key.endsWith('@' + wpBid(cb)), plays: tkPlayBuf(id) === (c && c.buf)}; }, id);
ok(s2.mode === 'stretch' && s2.src && s2.plays, 'Dehnen rendert aus der gesäuberten Fassung (Kette: Säubern → Zeitkarte) ' + JSON.stringify(s2));
// A/B Roh │ Sauber mit Zeitkarte: Roh = Zeitkarte über dem Roh-Take
await p.evaluate(() => SYNQUENZER.clAB('roh'));
for (let n = 0; n < 200 && !(await p.evaluate(id => wpReady(id) && WP.cache.get(id).key.endsWith('@' + wpBid(tkBuffer(id))), id)); n++) { await p.evaluate(id => tkPlayBuf(id), id); await sleep(25); }
const s3 = await p.evaluate(id => ({src: WP.cache.get(id).key.endsWith('@' + wpBid(tkBuffer(id))), plays: tkPlayBuf(id) === WP.cache.get(id).buf}), id);
ok(s3.src && s3.plays, 'A/B „Roh“ bei Zeitkarte: Zeitkarte über dem Roh-Take ' + JSON.stringify(s3));
await p.evaluate(() => SYNQUENZER.clAB('sauber'));
// beim Spielen: SÄUBERN 60 → 100 → Fassung wechselt über wpSwitch (Zeitkarte bleibt), keine doppelten Stücke
await p.evaluate(() => SYNQUENZER.launchScene(0)); await sleep(900);
const sw0 = await p.evaluate(() => (SYNQUENZER.wpSwitchInfo(true) || []).length);
await p.evaluate(id => SYNQUENZER.clSet(id, 100), id); await p.evaluate(id => SYNQUENZER.clWait(id), id);
for (let n = 0; n < 200 && !(await p.evaluate(id => wpReady(id), id)); n++) await sleep(25);
await sleep(600);
const s4 = await p.evaluate(id => { const c = WP.cache.get(id), live = TK.src.filter(r => !r.dead && r.take === id), now = AU.ctx.currentTime;
  const at = live.filter(r => r.start <= now && r.end > now + .02);
  return {src100: c.key.endsWith('@' + wpBid(CL.buf.get(id).b)) && CL.buf.get(id).a === 100, sw: (SYNQUENZER.wpSwitchInfo(true) || []).length, overlap: at.length, buf: at.every(r => r.s.buffer === c.buf)}; }, id);
ok(s4.src100 && s4.sw > sw0 && s4.overlap <= 1 && s4.buf, 'beim Spielen SÄUBERN 100 %: neue Fassung (gesäubert + gedehnt) per wpSwitch, nur ein klingendes Stück ' + JSON.stringify(s4));
// Undo (SÄUBERN 100 → 60) beim Spielen: clSync + wpUndone zusammen, kein Doppel-Tausch
await p.evaluate(() => SYNQUENZER.undo()); await sleep(80);
const s5a = await p.evaluate(id => { const now = AU.ctx.currentTime; const live = TK.src.filter(r => !r.dead && r.take === id && r.end > now + .05 && r.start < now + .05); return live.length; }, id);
await p.evaluate(id => SYNQUENZER.clWait(id), id); for (let n = 0; n < 200 && !(await p.evaluate(id => wpReady(id), id)); n++) await sleep(25); await sleep(600);
const s5 = await p.evaluate(id => { const c = WP.cache.get(id), now = AU.ctx.currentTime, at = TK.src.filter(r => !r.dead && r.take === id && r.start <= now && r.end > now + .02);
  return {cl: SYNQUENZER.takes()[id].cl, src60: CL.buf.get(id).a === 60 && c.key.endsWith('@' + wpBid(CL.buf.get(id).b)), overlap: at.length, buf: at.every(r => r.s.buffer === c.buf), xfErr: TK.xfErr | 0}; }, id);
ok(s5.cl === 60 && s5.src60 && s5.overlap <= 1 && s5.buf && s5a <= 2 && !s5.xfErr, '↶ beim Spielen → 60 %, Fassung folgt, keine doppelten Stücke ' + JSON.stringify(Object.assign({justAfter: s5a}, s5)));
// Undo der Zeitkarte beim Spielen → gesäuberter Take ohne Karte
await p.evaluate(() => SYNQUENZER.undo()); await sleep(700);
const s6 = await p.evaluate(id => { const now = AU.ctx.currentTime, at = TK.src.filter(r => !r.dead && r.take === id && r.start <= now && r.end > now + .02), m = SYNQUENZER.takes()[id];
  return {warp: !!m.warp, plays: tkPlayBuf(id) === CL.buf.get(id).b, overlap: at.length, buf: at.every(r => r.s.buffer === CL.buf.get(id).b)}; }, id);
ok(!s6.warp && s6.plays && s6.overlap <= 1 && s6.buf, '↶ Quantisieren beim Spielen → gesäuberter Take ohne Zeitkarte ' + JSON.stringify(s6));
await p.evaluate(() => SYNQUENZER.redo()); await sleep(200);
await p.evaluate(() => SYNQUENZER.stop());
// Speichern → Laden: cl + warp + marks deep-equal
const P1 = await p.evaluate(() => SYNQUENZER.takes()); await p.evaluate(() => SYNQUENZER.save()); await sleep(1500);
await p.close(); H = await open5(br, {ctx}); p = H.p; await sleep(1500);
const P2 = await p.evaluate(() => SYNQUENZER.takes());
ok(deq(P1, P2) && P2[id].cl === 60 && P2[id].warp && P2[id].warp.mode === 'stretch', 'Speichern → Laden deep-equal (cl, warp) ' + JSON.stringify({cl: P2[id] && P2[id].cl, mode: P2[id] && P2[id].warp && P2[id].warp.mode}));
await p.evaluate(id => { SYNQUENZER.tkLoadAll && SYNQUENZER.tkLoadAll(); return SYNQUENZER.clEnsure(id); }, id); await p.evaluate(id => SYNQUENZER.clWait(id), id);
for (let n = 0; n < 300 && !(await p.evaluate(id => wpReady(id), id)); n++) { await p.evaluate(id => tkPlayBuf(id), id); await sleep(25); }
const s7 = await p.evaluate(id => { const c = WP.cache.get(id); return {src: !!c && !!CL.buf.get(id) && c.key.endsWith('@' + wpBid(CL.buf.get(id).b))}; }, id);
ok(s7.src, 'nach dem Laden: Dehnen wieder aus der gesäuberten Fassung ' + JSON.stringify(s7));
ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 3)));
await br.close();
console.log(fail ? 'FAIL ' + fail : 'ALL OK');
