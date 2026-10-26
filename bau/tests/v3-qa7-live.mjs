import * as Q from './v3-qa7-lib.mjs';
const {ok} = Q;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const T = async (id, f) => { if (ONLY && !ONLY.test(id)) return; try { await f(); } catch (e) { ok(id, false, 'Fehler ' + String(e.stack || e).slice(0, 600)); } };
const br = await Q.launch();
const ctx = await br.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});
let page = await ctx.newPage(); const errs = [];
page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
const boot = async () => { await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000}); await page.evaluate(() => ensureAudio()); await page.waitForFunction(() => SynthHost.state === 'ready', null, {timeout: 10000});
  await page.evaluate(() => {
    window.__mkAn = (node) => { const c = AU.ctx, an = c.createAnalyser(); an.fftSize = 4096; node.connect(an); return () => { const d = new Float32Array(4096); an.getFloatTimeDomainData(d); let s = 0; for (const x of d) s += x * x; const r = Math.sqrt(s / d.length); return r > 0 ? 20 * Math.log10(r) : -999; }; };
    window.__meas = () => ({src: window.__aSrc(), voc: window.__aVoc(), cutG: AU.tracks[1].cut.gain.value});
    window.__hook = () => { window.__aSrc = __mkAn(AU.tracks[1].cut); window.__aVoc = __mkAn(AU.tracks[0].post); };
  }); };
await page.goto('file://' + Q.FILE); await boot();
await T('live', async () => {
  await page.evaluate(() => { const S_ = SYNQUENZER; S_.setEngine(0, 'mk'); const s = S_.getSound(0); s.p.mk.mode = 3; s.p.mk.voc.dir = 127; S_.setSound(0, s); S_.setEngine(1, 'analog'); __hook(); });
  await page.evaluate(() => { window.__id = 9e6; const E = AU.synth[1]; E.on(window.__id, 57, .8, AU.ctx.currentTime + .02); E.flush(); });
  await sleep(400); const m0 = await page.evaluate(() => __meas());
  await page.evaluate(() => SYNQUENZER.mkIn(0, 'e2', 1)); await sleep(400); const m1 = await page.evaluate(() => __meas());
  ok('Quelle → E2 (DIREKT 127 hörbar)', m0.voc < -90 && m1.voc > -40, `Vocoder-Spur vorher ${m0.voc.toFixed(1)}, nachher ${m1.voc.toFixed(1)} dBFS; Quelle ${m1.src.toFixed(1)}`);
  const u = await page.evaluate(async () => { SYNQUENZER.mkIn(0, 'e2', undefined, 0); const a = JSON.stringify(S.tracks[0].mkIn); SYNQUENZER.undo(); const b = JSON.stringify(S.tracks[0].mkIn || null); SYNQUENZER.redo(); const c = JSON.stringify(S.tracks[0].mkIn); return {a, b, c}; });
  ok('mkIn Undo/Redo je ein Schritt', u.a === u.c && JSON.parse(u.b).e2Dry === 1 && JSON.parse(u.b).e2 === JSON.parse(u.a).e2 && JSON.parse(u.a).e2Dry === 0, JSON.stringify(u));
  await sleep(400); const m2 = await page.evaluate(() => __meas());
  ok('MK7-10 Quelle nur als Eingang: Quelle im Master ≤ −90', m2.src <= -90 && Math.abs(m2.voc - m1.voc) < 1, `Quelle ${m2.src.toFixed(1)}, Vocoder ${m2.voc.toFixed(1)}`);
  await page.evaluate(() => SYNQUENZER.setTrackFx(1, 'vol', 0)); await sleep(400); const m3 = await page.evaluate(() => __meas());
  ok('MK7-10 Fader 0 ändert den Eingang nicht', Math.abs(m3.voc - m2.voc) < 1, `Vocoder ${m2.voc.toFixed(1)} → ${m3.voc.toFixed(1)}`);
  await page.evaluate(() => SYNQUENZER.setTrackFx(1, 'vol', .8)); await sleep(300);
  // undo / redo of mkIn
  await sleep(300); const m3b = await page.evaluate(() => __meas());
  ok('nach Redo wieder geschnitten', m3b.src <= -90, `Quelle ${m3b.src.toFixed(1)}`);
  // vocoder track back to VA: the source must return to the master
  await page.evaluate(() => SYNQUENZER.setEngine(0, 'analog')); await sleep(400); const m4 = await page.evaluate(() => __meas());
  ok('Vocoder-Spur → VA: Quelle wieder im Master', m4.src > -40, `Quelle ${m4.src.toFixed(1)} (cut ${m4.cutG})`);
  await page.evaluate(() => SYNQUENZER.setEngine(0, 'mk')); await sleep(400); const m5 = await page.evaluate(() => __meas());
  ok('zurück auf MS 2000 (Vocoder): Quelle wieder geschnitten', m5.src <= -90, `Quelle ${m5.src.toFixed(1)} mode ${await page.evaluate(() => S.tracks[0].sound.p.mk.mode)}`);
  // vocoder mode -> synth mode (mode 0): does the source stay cut? (spec: cut while the source feeds an AM input)
  await page.evaluate(() => SYNQUENZER.mkSet(0, 'mode', 0)); await sleep(400); const m6 = await page.evaluate(() => __meas());
  console.log('Info: Synth-Modus (Welle Säge, Eingang ungenutzt): Quelle', m6.src.toFixed(1), 'dBFS, Vocoder-Spur', m6.voc.toFixed(1));
  await page.evaluate(() => SYNQUENZER.mkSet(0, 'mode', 3)); await sleep(300);
  // stop the source note
  await page.evaluate(() => { const E = AU.synth[1]; E.off(window.__id, AU.ctx.currentTime); E.flush(); });
  // save -> reload
  const before = await page.evaluate(async () => { const s = SYNQUENZER.getSound(0); s.p.mk.voc.hold = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 127]; SYNQUENZER.setSound(0, s); SYNQUENZER.mkIn(0, 'e1', 2); await SYNQUENZER.save(); return {mkIn: S.tracks[0].mkIn, hold: S.tracks[0].sound.p.mk.voc.hold, uid1: S.tracks[1].uid, uid2: S.tracks[2].uid}; });
  await sleep(500);
  await page.reload(); await boot();
  const after = await page.evaluate(() => ({mkIn: S.tracks[0].mkIn || null, hold: S.tracks[0].sound.p.mk.voc.hold, uid1: S.tracks[1].uid, uid2: S.tracks[2].uid}));
  ok('MK7-16 tr.mkIn Speichern → Neuladen deep-equal', JSON.stringify(before.mkIn) === JSON.stringify(after.mkIn) && before.uid1 === after.uid1, JSON.stringify(before.mkIn) + ' → ' + JSON.stringify(after.mkIn));
  ok('MK7-03 hold Speichern → Neuladen deep-equal', JSON.stringify(before.hold) === JSON.stringify(after.hold), JSON.stringify(after.hold));
  await page.evaluate(() => __hook());
  await page.evaluate(() => { window.__id = 9e6 + 1; const E = AU.synth[1]; E.on(window.__id, 57, .8, AU.ctx.currentTime + .02); E.flush(); });
  await sleep(1500); const m7 = await page.evaluate(() => __meas());
  ok('nach Neuladen: Quelle nur als Eingang wieder aktiv, E2 verbunden', m7.src <= -90 && m7.voc > -40, `Quelle ${m7.src.toFixed(1)}, Vocoder ${m7.voc.toFixed(1)}`);
  await page.evaluate(() => { const E = AU.synth[1]; E.off(window.__id, AU.ctx.currentTime); E.flush(); });
  // new project: all chains open again
  await page.evaluate(() => SYNQUENZER.newProject()); await sleep(600);
  const np = await page.evaluate(() => ({cut: AU.tracks.map(A => A && A.cut ? +A.cut.gain.value.toFixed(3) : null), dry: AU.tracks.map(A => A ? !!A.dryCut : null), mkIn: S.tracks.map(t => t.mkIn || null)}));
  ok('Neues Projekt: keine Spur bleibt geschnitten', np.cut.every(x => x == null || x === 1) && np.dry.every(x => !x), JSON.stringify(np));
});
console.log('errs', errs.slice(0, 5));
Q.summary(); await br.close();
