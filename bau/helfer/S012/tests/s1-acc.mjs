// S1 Abnahme: S1-01 … S1-03 (Chromium, Touch auf Teil-Taste und FANG)
import {launch, open, sleep, deq, tally, OUT} from './h.mjs';
const ok = tally();
const br = await launch();
async function setup(p) {
  await p.evaluate(() => {
    const D = SYNQUENZER, nt = D.NT(); D.setBpm(240); D.setMetronome && D.setMetronome(false);
    D.setPart(0, {name: 'Strophe', slots: Array.from({length: nt}, (_, t) => D.getClip(t, 0) ? {s: 0} : -1), chords: {len: 4, ch: [{b: 0, tg: null}]}});
    selectTrack(3);
  });
}
const pass = p => p.evaluate(() => { const rp = R.part, L4 = partLen(S.parts[rp.i]) * 4; return {st: rp.startBeat, L4, k: Math.floor((audBeat() - rp.startBeat) / L4)}; });
const waitB = (p, b) => p.waitForFunction(b => audBeat() >= b, b, {timeout: 30000, polling: 5});
// ---------- S1-01 / S1-02 / S1-03 ----------
{
  const H = await open(br), p = H.p; await setup(p);
  await p.evaluate(() => { SYNQUENZER.play(); }); await sleep(300);
  await p.tap('#partBar .pk[data-i="0"]');                                   // Tipp auf den Teil (Teil-Leiste)
  await p.waitForFunction(() => R.part && R.part.i === 0, null, {timeout: 5000});
  const P0 = await p.evaluate(() => SYNQUENZER.parts()[0]);
  let q = await pass(p); const A = q.st + (q.k + 1) * q.L4;                 // the next pass
  await waitB(p, A + 1.0);
  await p.evaluate(() => { SYNQUENZER.keyOn(72, .8, 'n1'); setTimeout(() => SYNQUENZER.keyOff(72, 'n1'), 200); });   // play along (bar 1)
  await waitB(p, A + 5.0);
  await p.evaluate(() => { SYNQUENZER.keyOn(76, .7, 'n2'); setTimeout(() => SYNQUENZER.keyOff(76, 'n2'), 200); });   // bar 2
  await waitB(p, A + 7.9);
  await p.evaluate(() => SYNQUENZER.stopTrackNow(4));                       // Drums aus in Takt 3 (an seinem Taktstrich)
  const mid = await p.evaluate(() => SYNQUENZER.parts()[0]);
  ok(deq(mid, P0), 'S1 im Lauf: nichts überschrieben (Teil deep-equal während der Änderungen)');
  await waitB(p, A + q.L4 + 0.6);
  const fb = await p.$('#bFang:not([hidden])') && (await (await p.$('#bFang')).isVisible()) ? '#bFang' : '#bFangT';
  await p.tap(fb); await sleep(250);
  const inf = await p.evaluate(() => SYNQUENZER.s1Info()), sheet = await p.evaluate(() => !!document.querySelector('.s1sheet'));
  ok(sheet && inf, 'S1 FANG (' + fb + ') während der Teil läuft → Blatt „Teil überarbeitet“');
  await p.screenshot({path: OUT + '/s1-sheet-P1.png'});
  ok(inf && deq(inf.lanes[4], [{bar: 0, slot: 0}, {bar: 2, slot: -1}]), 'S1-01 Fassung: Drums ab Takt 3 aus ' + JSON.stringify(inf && inf.lanes[4]));
  ok(inf && deq(inf.lanes.filter((_, t) => t !== 4), P0.lanes.filter((_, t) => t !== 4)), 'S1-01 andere Spuren wie der Teil');
  const mel = inf && inf.mel && inf.mel[3];
  ok(mel && mel.length === 2 && Math.abs(mel[0].t - 1) < 0.08 && Math.abs(mel[1].t - 5) < 0.08 && mel[0].n === 72 && mel[1].n === 76, 'S1-02 dazugespielte Noten in der Fassung ' + JSON.stringify(mel));
  ok(deq(await p.evaluate(() => SYNQUENZER.parts()[0]), P0), 'S1-01 alter Teil unverändert bis [Teil ersetzen]');
  const btn = await p.$$eval('.s1sheet button', bs => bs.map(b => { const r = b.getBoundingClientRect(); return [b.textContent.trim(), Math.round(r.width), Math.round(r.height), b.scrollWidth <= b.clientWidth + 1]; }));
  ok(btn.filter(b => !/✕/.test(b[0])).every(b => b[1] >= 44 && b[2] >= 44 && b[3]) && btn.some(b => b[0] === 'Teil ersetzen') && btn.some(b => b[0] === 'Als neuen Teil') && btn.some(b => b[0] === 'Verwerfen'), 'S1 Blatt: [Teil ersetzen] [Als neuen Teil] [Verwerfen] ≥ 44 px ' + JSON.stringify(btn));
  await p.tap('.s1sheet button[data-s1="rep"]'); await sleep(150);
  const P1 = await p.evaluate(() => SYNQUENZER.parts()[0]);
  ok(deq(P1.lanes[4], [{bar: 0, slot: 0}, {bar: 2, slot: -1}]) && P1.name === 'Strophe' && P1.mel && P1.mel[3].length === 2, 'S1-01 [Teil ersetzen] → Teil hat die neue Fassung (Name bleibt)');
  // the new version sounds: in the next part start the melody plays at the same places
  await p.evaluate(() => { SYNQUENZER.clearLog(); }); 
  await p.tap('#partBar .pk[data-i="0"]');                                   // Teil neu starten (die Hand gibt die Drums zurück)
  await p.waitForFunction(() => R.part && R.part.i === 0 && R.part.from > audBeat() - 4, null, {timeout: 5000});
  const st2 = await p.evaluate(() => R.part.startBeat);
  await waitB(p, st2 + 16.3);
  const log = await p.evaluate(() => SYNQUENZER.noteLog(4096));
  const ml = log.filter(e => e.src === 'melody' && e.track === 3).map(e => [+(e.beat - st2).toFixed(3), e.out]);
  ok(ml.length >= 2 && Math.abs(ml[0][0] - mel[0].t) < 0.01 && ml[0][1] === 72 && Math.abs(ml[1][0] - mel[1].t) < 0.01 && ml[1][1] === 76, 'S1-02 die Noten klingen im Teil an denselben Stellen ' + JSON.stringify(ml.slice(0, 4)));
  const dr = log.filter(e => e.track === 4).map(e => e.beat - st2);
  ok(dr.some(b => b >= 0 && b < 8) && !dr.some(b => b >= 8.05 && b < 16), 'S1-01 hörbar: Drums in Takt 1–2, ab Takt 3 still (' + dr.length + ' Treffer)');
  // S1-03 undo / save / load
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(100);
  const rt = await p.evaluate(() => { const a = SYNQUENZER.project().parts; importProject(JSON.parse(serializeProject()), []); return {a, b: SYNQUENZER.project().parts}; });
  ok(deq(rt.a, rt.b) && rt.b[0].mel, 'S1-03 Speichern/Laden deep-equal (Part.mel bleibt)');
  ok(!H.errs.length && !H.reqs.length, 'keine Konsolenfehler, kein Netz ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.ctx.close();
}
// ---------- S1-03 Undo; [Als neuen Teil]; [Verwerfen]; Formate ----------
for (const [nm, w, h] of [['P1', 390, 844], ['P2', 375, 667], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375], ['W', 926, 428]]) {
  const H = await open(br, {viewport: {width: w, height: h}}), p = H.p; await setup(p);
  await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.partTap(0); });
  await p.waitForFunction(() => R.part && R.part.i === 0, null, {timeout: 5000});
  const P0 = await p.evaluate(() => SYNQUENZER.parts());
  let q = await pass(p); const A = q.st + (q.k + 1) * q.L4;
  await waitB(p, A + 3.9); await p.evaluate(() => SYNQUENZER.stopTrackNow(4));
  await waitB(p, A + q.L4 + 0.5);
  await p.evaluate(() => SYNQUENZER.s1Fang()); await sleep(200);
  const L = await p.evaluate(() => { const q = document.querySelector('.s1sheet'), r = q.getBoundingClientRect(), bad = []; for (const b of q.querySelectorAll('button')) { const k = b.getBoundingClientRect(); if (b.scrollWidth > b.clientWidth + 1 || k.right > innerWidth + .5 || k.bottom > innerHeight + .5) bad.push(b.textContent.trim()); if (!b.classList.contains('fs-x') && (k.height < 43.5 || k.width < 43.5)) bad.push(b.textContent.trim() + ' ' + Math.round(k.width) + '×' + Math.round(k.height)); } for (const d of q.querySelectorAll('.fs-cl,.fs-end,.fs-t,.fs-chip')) if (d.scrollWidth > d.clientWidth + 1) bad.push('text ' + d.textContent.slice(0, 20)); return {top: r.top, bottom: r.bottom, h: innerHeight, sw: document.scrollingElement.scrollWidth <= innerWidth, bad}; });
  await p.screenshot({path: OUT + `/s1-${nm}.png`});
  ok(!L.bad.length && L.sw && L.top >= 0 && L.bottom <= L.h + .5, `S1 ${nm}: Blatt im Bild, ≥ 44 px, nichts abgeschnitten ` + JSON.stringify(L));
  if (nm === 'P1') {
    await p.tap('.s1sheet button[data-s1="disc"]'); await sleep(100);
    ok(deq(await p.evaluate(() => SYNQUENZER.parts()), P0) && !(await p.$('.s1sheet')), 'S1 [Verwerfen] → nichts geändert, Blatt zu');
    await p.evaluate(() => SYNQUENZER.s1Fang()); await sleep(150);
    await p.tap('.s1sheet button[data-s1="new"]'); await sleep(150);
    const P2 = await p.evaluate(() => SYNQUENZER.parts());
    ok(deq(P2[0], P0[0]) && P2[1] && P2[1].name === 'Strophe 2' && P2[1].lanes[4].some(e => e.slot === -1), 'S1 [Als neuen Teil] → „Strophe 2“ mit der Fassung, Strophe unverändert');
    await p.evaluate(() => SYNQUENZER.undo()); await sleep(80);
    ok(deq(await p.evaluate(() => SYNQUENZER.parts()), P0), 'S1-03 ein Undo → deep-equal');
    await p.evaluate(() => SYNQUENZER.s1Fang()); await sleep(150);
    await p.tap('.s1sheet button[data-s1="rep"]'); await sleep(150);
    await p.evaluate(() => SYNQUENZER.undo()); await sleep(80);
    ok(deq(await p.evaluate(() => SYNQUENZER.parts()), P0), 'S1-03 [Teil ersetzen] + ein Undo → deep-equal');
  }
  ok(!H.errs.length, nm + ' keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.ctx.close();
}
await br.close();
process.exit(ok.done() ? 1 : 0);
