// QA n5-v musiker: gmk8b regression with Song-Video jobs in between (state after the offline pass)
// QA MK8b regression: record a clip, FANG TEIL, scenes, song placePart (drag & drop path), transpose, MS 2000 Micro sound on track 2
// playing in a scene, save -> reload (Micro sound restored before the MS 2000 code is loaded), console, portrait + landscape layout
import {launch, open, mkOk, sleep, DIR} from './gmk8b-h.mjs';
const {ok, fails} = mkOk();
const br = await launch(false);
const ctx = await br.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});
let H = await open(br, {ctx}), p = H.page;
const waitB = b => p.waitForFunction(b => SYNQUENZER.runtime().beat >= b, b, {timeout: 30000, polling: 10});
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(120); });
await p.evaluate(() => window.__tap());

const VIDEO = async (tag) => { const r = await p.evaluate(async (tag) => { const Q = SYNQUENZER; Q.vvTest({opus: true});
  const u0 = Q.undoInfo(), pj0 = JSON.stringify(Q.serialize());
  if (!S.song) Q.setSong({bars: 4, lanes: [[{bar: 0, slot: 0}], [{bar: 0, slot: 0}], [{bar: 0, slot: 0}], [], [{bar: 0, slot: 0}], []], carrier: [], mel: {}, marks: [{id: 'v1', a: 0, len: 4, name: 'Strophe'}]});
  const u1 = Q.undoInfo(), pj1 = JSON.stringify(Q.serialize());
  const x = await Q.vvMake({fmt: '9:16', view: 'matrix'});
  const u2 = Q.undoInfo(), pj2 = JSON.stringify(Q.serialize());
  return {tag, how: x && x.how, dur: x && x.dur, undoSame: JSON.stringify(u1) === JSON.stringify(u2), projSame: pj1 === pj2, u1, u2, timer: !!AU.timer, ctx: AU.ctx && AU.ctx.constructor.name}; }, tag);
  ok('video job ' + tag + ' (project + undo unchanged, live ctx back)', r.how === 'webcodecs' && r.undoSame && r.projSame && r.timer && r.ctx !== 'OfflineAudioContext', JSON.stringify(r)); return r; };
await VIDEO('start'); await p.evaluate(() => SYNQUENZER.setSong(null));
// 1 record a clip
await p.evaluate(() => { SYNQUENZER.setRecOptions({countIn: 0, length: 1}); SYNQUENZER.selectSlot(0, 3); SYNQUENZER.play(); });
await waitB(3.5); await p.evaluate(() => SYNQUENZER.rec());
for (const [b, n] of [[4.05, 60], [5.05, 64], [6.05, 67]]) { await waitB(b); await p.evaluate(n => SYNQUENZER.keyOn(n), n); await sleep(200); await p.evaluate(n => SYNQUENZER.keyOff(n), n); }
await waitB(9); await sleep(300);
const rc = await p.evaluate(() => SYNQUENZER.getClip(0, 3));
ok('record a clip with REC', rc && rc.notes.length === 3, rc && rc.notes.map(n => n.n + '@' + n.t.toFixed(2)).join(' '));
await p.evaluate(() => SYNQUENZER.stop()); await sleep(200);
// 2 FANG TEIL
await p.evaluate(() => { SYNQUENZER.launchScene(0); SYNQUENZER.setKbMode('transpose'); });
for (const [b, n] of [[0.05, 57], [4.05, 53], [8.05, 48], [12.05, 55]]) { await waitB(b); await p.evaluate(n => SYNQUENZER.keyOn(n, 0.8, 'c'), n); await sleep(120); await p.evaluate(() => SYNQUENZER.keyOff(0, 'c')); }
await waitB(16.3); await p.evaluate(() => SYNQUENZER.fangTeil({})); await sleep(150);
const fp = await p.evaluate(() => { const f = SYNQUENZER.fangPart(); return f && {len: f.len}; });
const fa = await p.evaluate(() => SYNQUENZER.fangAccept('part'));
ok('FANG TEIL captures a part', fp && fp.len >= 1 && fa !== false, JSON.stringify(fp));
await p.evaluate(() => { SYNQUENZER.setKbMode('play'); SYNQUENZER.resetCarrier(); SYNQUENZER.stop(); }); await sleep(300);
// 3 Micro sound on track 2 (engine MS 2000), scene 1 plays it
const k = await p.evaluate(async () => { SYNQUENZER.setEngine(1, 'mk'); mkLoad(); await MKK.decodeAll(); SYNQUENZER.selectTrack(1); SYNQUENZER.browserTap(window.__SID || 'f-mk-k115'); closeBrowser(false); return {o: S.tracks[1].sound.origin, ed: soundEdited(S.tracks[1].sound), name: S.tracks[1].sound.name}; });
ok('Micro sound on track 2', k.o === 'f-mk-k115' && !k.ed, JSON.stringify(k));
await p.evaluate(() => SYNQUENZER.launchScene(0)); await sleep(1500);
const sc = await p.evaluate(() => ({lvl: window.__lvl(), playing: SYNQUENZER.runtime().playing}));
ok('scene 1 plays (with the Micro arp track)', sc.lvl.rmsDb > -45, JSON.stringify(sc));
await p.evaluate(() => SYNQUENZER.launchScene(1)); await sleep(1200);
const sc2 = await p.evaluate(() => window.__lvl()); ok('scene switch 1 → 2 keeps sounding', sc2.rmsDb > -50, JSON.stringify(sc2));
await p.evaluate(() => { SYNQUENZER.selectTrack(1); SYNQUENZER.keyOn(48, .8, 'z'); }); await sleep(800);
const kl = await p.evaluate(() => window.__lvl()); await p.evaluate(() => SYNQUENZER.keyOff(48, 'z'));
ok('Micro arp sound plays live on track 2 while the scene runs', kl.rmsDb > -40, JSON.stringify(kl));
await p.evaluate(() => SYNQUENZER.stop()); await sleep(300);
await VIDEO('after MS 2000'); await p.evaluate(() => window.__tap());
await p.evaluate(() => SYNQUENZER.launchScene(0)); await sleep(1500);
const scV = await p.evaluate(() => ({lvl: window.__lvl(), playing: SYNQUENZER.runtime().playing}));
ok('after the video: scene 1 plays (Micro arp track)', scV.lvl.rmsDb > -45, JSON.stringify(scV));
await p.evaluate(() => { SYNQUENZER.selectTrack(1); SYNQUENZER.keyOn(48, .8, 'z'); }); await sleep(800);
const klV = await p.evaluate(() => window.__lvl()); await p.evaluate(() => SYNQUENZER.keyOff(48, 'z'));
ok('after the video: Micro arp key plays live', klV.rmsDb > -40, JSON.stringify(klV));
await p.evaluate(() => SYNQUENZER.stop()); await sleep(300);
// 4 song: placePart (drag & drop path)
await p.evaluate(() => SYNQUENZER.setSong(null));
const a1 = await p.evaluate(() => SYNQUENZER.placePart('S1', 0, 'insert')), a2 = await p.evaluate(() => SYNQUENZER.placePart('S4', 1, 'insert'));
const sg = await p.evaluate(() => SYNQUENZER.project().song);
ok('song: scenes placed by placePart', a1 && a2 && sg && sg.bars >= 2, 'bars ' + (sg && sg.bars));
await p.evaluate(() => SYNQUENZER.songPlay(0)); await sleep(1500);
const l2 = await p.evaluate(() => window.__lvl()); ok('song plays', l2.rmsDb > -50, JSON.stringify(l2));
await p.evaluate(() => SYNQUENZER.stop()); await sleep(300);
// 5 transpose
const op0 = await p.evaluate(() => SYNQUENZER.outPitch(0, 60));
await p.evaluate(() => { SYNQUENZER.setKbMode('transpose'); SYNQUENZER.keyOn(62); }); await sleep(150); await p.evaluate(() => SYNQUENZER.keyOff(62));
const op1 = await p.evaluate(() => SYNQUENZER.outPitch(0, 60)), op1k = await p.evaluate(() => SYNQUENZER.outPitch(1, 60));
await p.evaluate(() => { SYNQUENZER.setKbMode('play'); SYNQUENZER.resetCarrier(); });
ok('transpose changes the out pitch (track 1 and Micro track 2)', JSON.stringify(op0) !== JSON.stringify(op1), JSON.stringify([op0, op1, op1k]));
// 6 save -> reload
await p.evaluate(() => SYNQUENZER.save()); await sleep(1500);
const P0 = await p.evaluate(() => SYNQUENZER.project()); const errs1 = H.errs.slice(); await p.close();
H = await open(br, {ctx}); p = H.page; await sleep(1200);
const boot = await p.evaluate(() => ({loaded: typeof mkLoaded === 'function' ? mkLoaded() : null, o: S.tracks[1].sound.origin, ed: soundEdited(S.tracks[1].sound), name: S.tracks[1].sound.name,
  head: [...document.querySelectorAll('.trname, .tname, .thead, [class*=trk] b')].slice(0, 4).map(e => e.textContent.trim()).join(' | ')}));
const P1 = await p.evaluate(() => SYNQUENZER.project());
const strip = P => { const c = JSON.parse(JSON.stringify(P)); delete c.ui; return c; };
const diff = (a, b, path = '') => { if (JSON.stringify(a) === JSON.stringify(b)) return []; if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return [path + ': ' + JSON.stringify(a).slice(0, 80) + ' → ' + JSON.stringify(b).slice(0, 80)]; const o = []; for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) o.push(...diff(a[k], b[k], path + '.' + k)); return o; };
const canon = x => Array.isArray(x) ? x.map(canon) : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().map(k => [k, canon(x[k])])) : x;
ok('save → reload deep-equal (key order ignored)', JSON.stringify(canon(strip(P0))) === JSON.stringify(canon(strip(P1))), diff(strip(P0), strip(P1)).slice(0, 8).join(' ; '));
ok('reload: Micro sound on track 2, not "geändert"', boot.o === 'f-mk-k115' && !boot.ed, JSON.stringify(boot));
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); }); await sleep(300); await p.evaluate(() => window.__tap());
await p.evaluate(() => { SYNQUENZER.selectTrack(1); SYNQUENZER.keyOn(48, .8, 'z'); }); await sleep(900);
const kl2 = await p.evaluate(() => window.__lvl()); await p.evaluate(() => SYNQUENZER.keyOff(48, 'z'));
const boot2 = await p.evaluate(() => ({o: S.tracks[1].sound.origin, ed: soundEdited(S.tracks[1].sound), loaded: mkLoaded()}));
ok('after reload the Micro sound plays', kl2.rmsDb > -40, JSON.stringify([kl2, boot2]));
// 7 layout
for (const [w, h, n] of [[390, 844, 'P1'], [320, 568, 'P3'], [844, 390, 'L1'], [926, 428, 'XL']]) {
  await p.setViewportSize({width: w, height: h}); await sleep(500);
  const L = await p.evaluate(() => ({sw: document.documentElement.scrollWidth, cw: innerWidth, sh: document.documentElement.scrollHeight, ch: innerHeight}));
  ok(n + ' no page overflow', L.sw <= L.cw && L.sh <= L.ch, JSON.stringify(L));
  await p.screenshot({path: '/home/user/Synquenzer/bau/helfer/VIDSTAGE/tests/out/n5-v-qm-out/reg-' + n + '.png'});
}
ok('no console errors', !errs1.length && !H.errs.length, JSON.stringify(errs1.concat(H.errs).slice(0, 3)));
const te = await p.evaluate(() => SYNQUENZER.tickErrors()); ok('no tick errors', !te || !te.length, JSON.stringify(te).slice(0, 100));
await br.close();
console.log(fails() ? 'FAIL ' + fails() : 'ALL PASS');
