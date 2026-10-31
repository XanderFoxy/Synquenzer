// S0 chooser edge cases (touch)
import {launch, open, sleep, deq, tally} from '../h.mjs';
import {songABA} from '../lib.mjs';
import {snap, cut, fangNoDrums, texts} from './fx.mjs';
const ok = tally(); const br = await launch();
// A: M3 renamed "Vers" nur hier → FANG, Strophe ▾ → ⟳ Strophe ersetzen
{
  const H = await open(br), p = H.p; await songABA(p);
  await p.evaluate(() => SYNQUENZER.markAction('M3', 'rename', {name: 'Vers', all: false}));
  const b = await snap(p);
  await fangNoDrums(p);
  await p.tap('.fsheet button[data-n="Strophe"]'); await sleep(120);
  await p.tap('.fsheet button[data-dup="replace"]'); await sleep(120);
  const ch = await texts(p, '.fsheet button[data-s0c]');
  console.log('A chooser:', JSON.stringify(ch));
  if (!ch.length) { await p.tap('.fsheet button[data-a="ok"]'); await sleep(200); }
  const a = await snap(p);
  ok(deq(cut(a.song, 4, 6), cut(b.song, 4, 6)), 'A: die nur-hier umbenannte Stelle „Vers“ (T5–6) bleibt beim Ersetzen von „Strophe“ unverändert' + (ch.length ? '' : ' (kein Wahl-Blatt; Vers DR: ' + JSON.stringify(cut(a.song, 4, 6)[4]) + ')'));
  await H.ctx.close();
}
// B: M3 renamed "Strophe 2" nur hier; pick it, then "+ Ans Song-Ende"
{
  const H = await open(br), p = H.p; await songABA(p);
  await p.evaluate(() => SYNQUENZER.markAction('M3', 'rename', {name: 'Strophe 2', all: false}));
  const b = await snap(p);
  await fangNoDrums(p);
  await p.tap('.fsheet button[data-n="Strophe"]'); await sleep(120);
  await p.tap('.fsheet button[data-dup="replace"]'); await sleep(120);
  const ch = await texts(p, '.fsheet button[data-s0c]');
  ok(ch.length === 3 && /Strophe \(Takt 1\)/.test(ch[0]) && /Strophe 2 \(Takt 5\)/.test(ch[1]), 'B chooser ' + JSON.stringify(ch));
  await p.tap('.fsheet button[data-s0c="1"]'); await sleep(120);
  const ub = await p.evaluate(() => SYNQUENZER.undoInfo ? SYNQUENZER.undoInfo() : (typeof UNDO !== 'undefined' ? UNDO.stack.length : null));
  await p.tap('.fsheet button[data-a="end"]'); await sleep(250);
  const a = await snap(p), mk = await p.evaluate(() => SYNQUENZER.songMarks());
  console.log('B marks after end', JSON.stringify(mk.map(m => [m.id, m.a, m.len, m.name, m.part, m.dev])));
  ok(deq(cut(a.song, 0, 4), cut(b.song, 0, 4)) && deq(a.parts, b.parts), 'B: T1–4 und Vorlagen unverändert');
  ok(mk.find(m => m.a === 4 && m.name === 'Strophe 2') && a.song.lanes[4].some(e => e.bar === 4 && e.slot === -1), 'B: T5–6 ersetzt, Name bleibt');
  ok(a.song.bars === 8 && mk.some(m => m.a === 6), 'B: ＋ Ans Song-Ende hängt die Stelle an (bars ' + a.song.bars + ')');
  ok(await p.evaluate(() => SV.mark == null), 'B: Markierung im Song nach dem Ersetzen weg (SV.mark ' + await p.evaluate(() => SV.mark) + ')');
  await p.evaluate(() => SYNQUENZER.undo()); await sleep(100);
  const u = await snap(p);
  ok(deq(u, b), 'B: ein Undo → deep-equal');
  ok(!H.errs.length, 'B keine Fehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.ctx.close();
}
// C: highlight cleared by Verwerfen / ‹ / ✕ ; pick switching
for (const how of ['disc', 'back', 'x', 'outside']) {
  const H = await open(br), p = H.p; await songABA(p);
  await p.evaluate(() => SYNQUENZER.songView(true)); await sleep(200);
  const b = await snap(p);
  await fangNoDrums(p);
  await p.tap('.fsheet button[data-n="Strophe"]'); await sleep(120);
  await p.tap('.fsheet button[data-dup="replace"]'); await sleep(120);
  await p.tap('.fsheet button[data-s0c="1"]'); await sleep(120);
  const m1 = await p.evaluate(() => SV.mark);
  await p.tap('.fsheet button[data-s0c="0"]'); await sleep(120);
  const m2 = await p.evaluate(() => SV.mark);
  if (how === 'disc') await p.tap('.fsheet button[data-a="disc"]');
  else if (how === 'back') await p.tap('.fsheet button[data-s0c="back"]');
  else if (how === 'x') await p.tap('.fsheet button[data-a="x"]');
  else { const r = await p.evaluate(() => { const q = document.querySelector('.fsheet').getBoundingClientRect(); return {x: 10, y: q.top > 100 ? 60 : innerHeight - 10}; }); await p.touchscreen.tap(r.x, r.y); }
  await sleep(200);
  const st = await p.evaluate(() => ({mark: SV.mark, open: !!document.querySelector('.fsheet'), row: [...document.querySelectorAll('.fsheet button[data-dup]')].map(b => b.textContent)}));
  ok(m1 === 'M3' && m2 === 'M1' && st.mark == null, `C ${how}: Markierung M3→M1→null (${m1},${m2},${st.mark}) open=${st.open} row=${JSON.stringify(st.row)}`);
  if (how === 'back') {
    // after ‹ the dup row is back; ALS TEIL ✓ = new part „Strophe 2“, nothing replaced
    await p.tap('.fsheet button[data-a="ok"]'); await sleep(200);
    const a = await snap(p);
    ok(deq(a.song, b.song) && a.parts[2] && a.parts[2].name === 'Strophe 2' && deq(a.parts[0], b.parts[0]), 'C back: danach ALS TEIL ✓ = neuer Teil, nichts ersetzt ' + (a.parts[2] && a.parts[2].name));
  }
  ok(!H.errs.length, 'C keine Fehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.ctx.close();
}
// D: no song, parts Strophe and Strophe 2 (nicht im Song)
{
  const H = await open(br), p = H.p; await songABA(p, {two: true});
  await p.evaluate(() => SYNQUENZER.setSong(null));
  const b = await snap(p);
  await fangNoDrums(p);
  await p.tap('.fsheet button[data-n="Strophe"]'); await sleep(120);
  await p.tap('.fsheet button[data-dup="replace"]'); await sleep(120);
  const ch = await texts(p, '.fsheet button[data-s0c]');
  ok(ch.length === 3 && /Strophe \(nicht im Song\)/.test(ch[0]) && /Strophe 2 \(nicht im Song\)/.test(ch[1]), 'D chooser ' + JSON.stringify(ch));
  await p.tap('.fsheet button[data-s0c="1"]'); await sleep(120);
  await p.tap('.fsheet button[data-a="ok"]'); await sleep(200);
  const a = await snap(p);
  ok(deq(a.parts[0], b.parts[0]) && !deq(a.parts[2].lanes, b.parts[2].lanes) && a.parts[2].name === 'Strophe 2', 'D: nur Strophe 2 ersetzt');
  ok(!H.errs.length, 'D keine Fehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.ctx.close();
}
// E: 3 places of one part (A B A A): pick the middle one, undo
{
  const H = await open(br), p = H.p; await songABA(p);
  await p.evaluate(() => SYNQUENZER.placePart('P1', 99, 'insert'));
  const b = await snap(p);
  await fangNoDrums(p);
  await p.tap('.fsheet button[data-n="Strophe"]'); await sleep(120);
  await p.tap('.fsheet button[data-dup="replace"]'); await sleep(120);
  const ch = await texts(p, '.fsheet button[data-s0c]');
  ok(ch.length === 4, 'E chooser 3 Stellen ' + JSON.stringify(ch));
  await p.tap('.fsheet button[data-s0c="1"]'); await sleep(120);
  await p.tap('.fsheet button[data-a="ok"]'); await sleep(200);
  const a = await snap(p);
  ok(deq(cut(a.song, 0, 4), cut(b.song, 0, 4)) && deq(cut(a.song, 6, 8), cut(b.song, 6, 8)) && !deq(cut(a.song, 4, 6), cut(b.song, 4, 6)) && deq(a.parts, b.parts), 'E: nur T5–6 geändert');
  await p.evaluate(() => SYNQUENZER.undo());
  ok(deq(await snap(p), b), 'E: Undo deep-equal');
  ok(!H.errs.length, 'E keine Fehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.ctx.close();
}
await br.close(); process.exit(ok.done() ? 1 : 0);
