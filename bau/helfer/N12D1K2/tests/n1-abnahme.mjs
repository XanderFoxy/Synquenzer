// N1 Abnahme (real touch taps on [Spiegeln] / [Umdrehen]): N1-01 C-D-E-G mirrored in the key, all in the scale; N1-02 reverse:
// starts mirrored in the range, velocity / length per note kept; N1-03 twice = start (deep-equal), one undo per tap; selection; formats
import {app, report} from './touch-lib.mjs';
const res = [], add = (id, pass, info) => res.push({id, pass, info});
const FORMATS = [[390, 844], [375, 667], [320, 568], [844, 390], [667, 375], [926, 428]];
const notesOf = c => c.notes.map(n => ({t: +n.t.toFixed(4), d: +n.d.toFixed(4), n: n.n, v: n.v, ...(n.o != null ? {o: n.o} : {})})).sort((a, b) => a.t - b.t || a.n - b.n);
for (const [w, h] of FORMATS) {
  const A = await app({width: w, height: h}), {p, tap} = A, main = w === 390;
  const C0 = {len: 1, key: {root: 0, scale: 'ionian', src: 'manual'}, notes: [{t: 0, d: .5, n: 60, v: .9}, {t: 1, d: .25, n: 62, v: .5}, {t: 2, d: .75, n: 64, v: .7, o: 2.03}, {t: 3, d: 1, n: 67, v: .3}]};
  await p.evaluate(c => { const S = window.SYNQUENZER; S.setClip(0, 0, c); S.openRoll(0, 0); }, C0); await p.waitForTimeout(500);
  const btn = async label => { const r = await p.evaluate(l => { const b = [...ED.roll.el.acts.querySelectorAll('button')].find(x => x.textContent.trim() === l); if (!b) return null; b.scrollIntoView({inline: 'center', block: 'nearest'}); const q = b.getBoundingClientRect();
      const svg = b.querySelector('svg'); return {x: q.left + q.width / 2, y: q.top + q.height / 2, w: q.width, h: q.height, svg: !!svg, vis: q.right <= innerWidth + .5 && q.left >= -.5 && q.bottom <= innerHeight + .5, clip: b.scrollWidth > b.clientWidth + 1}; }, label); await p.waitForTimeout(150);
    return r; };
  const clip = () => p.evaluate(() => window.SYNQUENZER.getClip(0, 0));
  const undoN = () => p.evaluate(() => window.SYNQUENZER.undoInfo().n);
  const bm = await btn('Spiegeln'), bu = await btn('Umdrehen');
  add(`N1-B ${w}×${h}`, bm && bu && bm.svg && bu.svg && bm.vis && bu.vis && !bm.clip && !bu.clip && bm.w >= 44 && bu.w >= 44,
    `Knöpfe sichtbar, gezeichnetes Symbol, nicht abgeschnitten: Spiegeln ${bm && Math.round(bm.w)}×${bm && Math.round(bm.h)}, Umdrehen ${bu && Math.round(bu.w)}×${bu && Math.round(bu.h)}`);
  if (!main) { await A.b.close(); continue; }
  const before = notesOf(await clip()), u0 = await undoN();
  let b = await btn('Spiegeln'); await tap(b.x, b.y);
  const m1 = notesOf(await clip()), u1 = await undoN();
  const scale = [0, 2, 4, 5, 7, 9, 11];
  add('N1-01', JSON.stringify(m1.map(n => n.n)) === JSON.stringify([67, 65, 64, 60]) && m1.every(n => scale.includes(n.n % 12)) && JSON.stringify(m1.map(n => [n.t, n.d, n.v])) === JSON.stringify(before.map(n => [n.t, n.d, n.v])),
    `C-D-E-G → ${m1.map(n => ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'][n.n % 12]).join('-')} (Stufen gespiegelt, alle in C-Dur, Zeit/Länge/Anschlag gleich)`);
  add('N1-U1', u1 === u0 + 1, `ein Undo je Tipp (Spiegeln): ${u1 - u0}`);
  b = await btn('Spiegeln'); await tap(b.x, b.y);
  add('N1-03a', JSON.stringify(notesOf(await clip())) === JSON.stringify(before), 'Spiegeln zweimal = Ausgangslage (deep-equal)');
  b = await btn('Umdrehen'); await tap(b.x, b.y);
  const r1 = notesOf(await clip()), u2 = await undoN();
  // whole clip 0..4: t' = 4 - t - d
  const exp = before.map(n => ({n: n.n, t: +(4 - n.t - n.d).toFixed(4), d: n.d, v: n.v})).sort((a, b) => a.t - b.t);
  add('N1-02', JSON.stringify(r1.map(n => [n.n, n.t, n.d, n.v])) === JSON.stringify(exp.map(n => [n.n, n.t, n.d, n.v])),
    `Umdrehen ganzer Clip: Starts ${r1.map(n => n.t).join(', ')} (Soll ${exp.map(n => n.t).join(', ')}), Länge/Anschlag je Note erhalten`);
  add('N1-U2', u2 === u1 + 2, `ein Undo je Tipp (Umdrehen): ${u2 - u1 - 1}`);
  b = await btn('Umdrehen'); await tap(b.x, b.y);
  add('N1-03b', JSON.stringify(notesOf(await clip())) === JSON.stringify(before), 'Umdrehen zweimal = Ausgangslage (deep-equal, auch Roh-Einsatz o)');
  // both together, then undo x2 -> start
  b = await btn('Spiegeln'); await tap(b.x, b.y); b = await btn('Umdrehen'); await tap(b.x, b.y);
  const both = notesOf(await clip());
  add('N1-03c', JSON.stringify(both.map(n => n.n)) === JSON.stringify([60, 64, 65, 67]), `beide zusammen: Töne ${both.map(n => n.n).join(',')} (rückwärts gespiegelt)`);
  await p.evaluate(() => { window.SYNQUENZER.undo(); window.SYNQUENZER.undo(); }); await p.waitForTimeout(100);
  add('N1-U3', JSON.stringify(notesOf(await clip())) === JSON.stringify(before), 'zwei Undo = Ausgangslage');
  // selection: notes 2 and 3 (D, E) only, Umdrehen within their range 1 .. 2.75; Spiegeln D<->E
  await p.evaluate(() => { ED.roll.selectIdx([1, 2]); }); await p.waitForTimeout(80);
  b = await btn('Umdrehen'); await tap(b.x, b.y);
  const s1 = notesOf(await clip());
  add('N1-02s', JSON.stringify(s1.map(n => [n.n, n.t])) === JSON.stringify([[60, 0], [64, 1], [62, 2.5], [67, 3]]), `Auswahl D,E umgedreht im Bereich 1…2,75: ${JSON.stringify(s1.map(n => [n.n, n.t]))}; der Rest bleibt`);
  b = await btn('Spiegeln'); await tap(b.x, b.y);
  const s2 = notesOf(await clip());
  add('N1-01s', JSON.stringify(s2.map(n => n.n)) === JSON.stringify([60, 62, 64, 67]), `Auswahl gespiegelt (D↔E): ${s2.map(n => n.n).join(',')}`);
  // out-of-scale notes: twice = start
  await p.evaluate(() => { const S = window.SYNQUENZER; S.setClip(0, 0, {len: 1, key: {root: 9, scale: 'aeolian', src: 'manual'}, notes: [{t: 0, d: .5, n: 57, v: .8}, {t: 1, d: .5, n: 61, v: .8}, {t: 2, d: .5, n: 66, v: .8}, {t: 3, d: .5, n: 72, v: .8}]}); S.openRoll(0, 0); }); await p.waitForTimeout(400);
  const o0 = notesOf(await clip());
  b = await btn('Spiegeln'); await tap(b.x, b.y); const o1 = notesOf(await clip()); b = await btn('Spiegeln'); await tap(b.x, b.y);
  add('N1-03d', JSON.stringify(notesOf(await clip())) === JSON.stringify(o0), `A-Moll mit leiterfremden Tönen (C♯, F♯): ${o0.map(n => n.n)} → ${o1.map(n => n.n)} → zurück gleich`);
  // save / load keeps the clip
  add('N1-E', A.errs.length === 0, 'keine Fehler in der Konsole: ' + JSON.stringify(A.errs.slice(0, 3)));
  await A.b.close();
}
report('N1', res);
