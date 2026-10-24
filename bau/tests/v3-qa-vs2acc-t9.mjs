// T9: Rolle Teilen/Verbinden per Tipp (P1, P3, L1, L2): Knöpfe erreichbar und groß genug, je ein Undo, hörbar (noteLog)
import {open, sleep, waitBeat} from './v3-qa-vs2acc-h.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
for (const vp of ['P1', 'P3', 'L1', 'L2']) {
  const H = await open({vp}), p = H.p;
  await p.evaluate(() => { const Q = SYNQUENZER; Q.stop(); Q.newProject({init: true}); Q.setBpm(120);
    Q.setClip(5, 0, {len: 1, key: {root: 0, scale: 'ionian'}, notes: [{t: 0, d: 2, n: 60, v: 0.8}, {t: 2, d: 1, n: 64, v: 0.6}, {t: 3, d: 1, n: 65, v: 0.9}]}); Q.openRoll(5, 0); });
  await sleep(400);
  await p.evaluate(() => SYNQUENZER.rollApi().selectIdx([0])); await sleep(100);
  const geo = await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.textContent === 'Teilen' || b.textContent === 'Verbinden').map(b => { const r = b.getBoundingClientRect(); return {t: b.textContent, x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), vis: !!b.offsetParent}; }));
  console.log(' ', vp, JSON.stringify(geo));
  const minW = vp[0] === 'L' ? 36 : 36, minH = vp[0] === 'L' ? 34 : 34;
  ok(geo.length === 2 && geo.every(g => g.vis && g.w >= minW && g.h >= minH), vp + ' Teilen/Verbinden sichtbar, ≥ 36×34');
  const u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
  // Knopf ins Bild rollen (Aktionsleiste ist eine Liste), dann Tipp
  const tapBtn = async t => { await p.evaluate(t => { const b = [...document.querySelectorAll('button')].find(x => x.textContent === t); b.scrollIntoView({block: 'nearest', inline: 'nearest'}); }, t); await sleep(150); const r = await p.evaluate(t => { const q = [...document.querySelectorAll('button')].find(x => x.textContent === t).getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height / 2, q.left >= 0 && q.right <= innerWidth && q.top >= 0 && q.bottom <= innerHeight]; }, t); const hit = await p.evaluate(([x, y, t]) => { const e = document.elementFromPoint(x, y); return e && (e.textContent === t || (e.closest('button') && e.closest('button').textContent === t)); }, [r[0], r[1], t]); await p.touchscreen.tap(r[0], r[1]); return {inView: r[2], hit}; };
  let tr = await tapBtn('Teilen'); await sleep(200);
  let c = await p.evaluate(() => SYNQUENZER.getClip(5, 0));
  ok(tr.inView && tr.hit && c.notes.length === 4 && c.notes.filter(n => n.n === 60).length === 2, vp + ' Tipp Teilen: ' + JSON.stringify(c.notes.map(n => [n.t, n.d, n.n])) + ' ' + JSON.stringify(tr));
  await p.evaluate(() => { const ns = SYNQUENZER.getClip(5, 0).notes; SYNQUENZER.rollApi().selectIdx(ns.map((n, i) => (n.n === 64 || n.n === 65) ? i : -1).filter(i => i >= 0)); }); await sleep(100);
  tr = await tapBtn('Verbinden'); await sleep(200);
  c = await p.evaluate(() => SYNQUENZER.getClip(5, 0));
  const j = c.notes.find(n => n.t === 2);
  ok(tr.hit && c.notes.length === 3 && j && j.d === 2 && j.v === 0.9, vp + ' Tipp Verbinden: ' + JSON.stringify(c.notes.map(n => [n.t, n.d, n.n, n.v])));
  ok(await p.evaluate(() => SYNQUENZER.undoInfo().n) === u0 + 2, vp + ' je ein Undo-Schritt');
  // hörbar
  await p.evaluate(() => { SYNQUENZER.clearLog(); SYNQUENZER.launchClip ? SYNQUENZER.launchClip(5, 0) : 0; SYNQUENZER.play(); });
  await waitBeat(p, 4.5);
  const lg = await p.evaluate(() => SYNQUENZER.noteLog(500).filter(e => e.track === 5 && e.beat < 4).map(e => [e.beat, e.out]));
  ok(lg.length === 3 && lg[0][0] === 0 && lg[1][0] === 1 && lg[1][1] === 60, vp + ' hörbar: 60 zweimal angeschlagen, 64/65 als eine Note ' + JSON.stringify(lg));
  await p.evaluate(() => SYNQUENZER.stop());
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 3)));
  await p.screenshot({path: 'v3-qa-vs2acc-t9-' + vp + '.png'});
  await H.br.close();
}
console.log(fail ? 'FAIL ' + fail : 'ALLE OK');
