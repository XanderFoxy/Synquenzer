// S2 edge cases: range partly covering marks, > 16 bars, Teil-Leiste full, redo, own clip at range start, xp in range
import {launch, open, sleep, deq, tally} from '../h.mjs';
import {songABA} from '../lib.mjs';
import {snap} from './fx.mjs';
const ok = tally(); const br = await launch();
const strip = s => { const o = JSON.parse(JSON.stringify(s)); delete o.marks; return o; };
const cutData = (p, a, e) => p.evaluate(([a, e]) => {
  const song = S.song, st = [];
  for (let x = a; x < e; x++) { const z = songStateAt(song, x); st.push(z.lanes.map(l => l.slot < 0 ? -1 : [l.slot, l.ph, l.own ? JSON.stringify(Object.assign({}, song.own[l.own], {from: null})) : null]).concat([z.xp])); }
  const mel = {}; for (const k in song.mel) { const ns = song.mel[k].notes.filter(n => n.t >= a * 4 - .25 - 1e-9 && n.t < e * 4 - .25 - 1e-9).map(n => [+(n.t - a * 4).toFixed(4), n.d, n.n, n.v]); if (ns.length) mel[k] = ns; }
  return {st, mel};
}, [a, e]);
// A: T2–T3 (half Strophe, half Refrain), clip phases mid-clip, own clip at T2, melody pickup before T2
{
  const H = await open(br), p = H.p; await songABA(p);
  await p.evaluate(() => { const D = SYNQUENZER, s = D.project().song; s.mel[3] = {len: s.bars, key: {root: 0, scale: 'ionian'}, notes: [{t: 3.8, d: .5, n: 72, v: .8}, {t: 9, d: .5, n: 76, v: .8}]}; D.setSong(s); D.makeOwn(1, 1); D.songView(true); });
  const b = await snap(p);
  const d0 = await cutData(p, 1, 3);
  await p.evaluate(() => SYNQUENZER.songSelect(1, 2)); await sleep(200);
  await p.tap('#rangeBar button[data-a="more"]'); await sleep(200);
  await p.tap('.pop button[data-a="s2sum"]'); await sleep(200);
  await p.tap('.s2sum button[data-a="ok"]'); await sleep(200);
  const a = await snap(p), mk = await p.evaluate(() => SYNQUENZER.songMarks());
  console.log('A marks', JSON.stringify(mk.map(m => [m.a, m.len, m.name, m.dev])), 'part', JSON.stringify(a.parts[2] && {name: a.parts[2].name, len: a.parts[2].len, mel: a.parts[2].mel, own: a.parts[2].own && Object.keys(a.parts[2].own)}));
  ok(a.parts[2] && a.parts[2].len === 2 && deq(strip(a.song), strip(b.song)), 'A: Teil 2 Takte, Song selbst unverändert');
  await p.evaluate(() => SYNQUENZER.placePart('P3', 99, 'insert'));
  const d1 = await cutData(p, 6, 8);
  ok(deq(d0, d1), 'A: eingesetzt an T7–8 = T2–3 (Clip, Phase, eigener Clip, Melodie inkl. Auftakt) ' + (deq(d0, d1) ? '' : JSON.stringify(d0) + ' / ' + JSON.stringify(d1)));
  await p.evaluate(() => SYNQUENZER.undo()); await p.evaluate(() => SYNQUENZER.undo());
  ok(deq(await snap(p), b), 'A: zwei Undo → deep-equal');
  if (await p.evaluate(() => typeof SYNQUENZER.redo === 'function')) { await p.evaluate(() => SYNQUENZER.redo()); const r = await snap(p); ok(deq(r.parts, a.parts) && deq(r.song, a.song), 'A: Redo → wie nach Zusammenfassen'); }
  ok(!H.errs.length, 'A keine Fehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.ctx.close();
}
// B: > 16 bars and Teil-Leiste full
{
  const H = await open(br), p = H.p; await songABA(p);
  await p.evaluate(() => { for (let k = 0; k < 6; k++) SYNQUENZER.placePart('P1', 99, 'insert'); SYNQUENZER.songView(true); });
  const b = await snap(p);
  const r = await p.evaluate(() => SYNQUENZER.sumRange(0, 17));
  ok(!r && deq(await snap(p), b), 'B: 18 Takte → abgelehnt, nichts geändert');
  await p.evaluate(() => { const nt = SYNQUENZER.NT(); for (let k = 2; k < 8; k++) SYNQUENZER.setPart(k, {name: 'X' + k, slots: Array.from({length: nt}, () => -1)}); });
  const b2 = await snap(p);
  await p.evaluate(() => SYNQUENZER.songSelect(0, 3)); await sleep(200);
  await p.tap('#rangeBar button[data-a="more"]'); await sleep(200);
  await p.tap('.pop button[data-a="s2sum"]'); await sleep(200);
  const nameOpen = await p.evaluate(() => !!document.querySelector('.s2sum'));
  if (nameOpen) { await p.tap('.s2sum button[data-a="ok"]'); await sleep(200); }
  const t = await p.evaluate(() => [...document.querySelectorAll('.toast, #toast')].map(e => e.textContent).join('|'));
  ok(deq(await snap(p), b2) && /voll/.test(t), 'B: Teil-Leiste voll → nichts geändert, Hinweis: ' + t + ' (Namens-Blatt geöffnet: ' + nameOpen + ')');
  ok(!H.errs.length, 'B keine Fehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.ctx.close();
}
// C: Teil-Transposition (song.xp) inside the range
{
  const H = await open(br), p = H.p; await songABA(p);
  await p.evaluate(() => { const D = SYNQUENZER, s = D.project().song; s.xp = [{beat: 0, semi: 0}, {beat: 4, semi: 2}, {beat: 8, semi: 0}]; D.setSong(s); });
  const d0 = await cutData(p, 0, 2);
  await p.evaluate(() => SYNQUENZER.sumMark('M1'));
  await p.evaluate(() => SYNQUENZER.placePart('P3', 99, 'insert'));
  const d1 = await cutData(p, 6, 8);
  ok(deq(d0, d1), 'C: Teil-Transposition im Bereich (T2 +2) geht mit (klingt gleich) ' + JSON.stringify(d0.st.map(r => r[r.length - 1])) + ' / ' + JSON.stringify(d1.st.map(r => r[r.length - 1])));
  await H.ctx.close();
}
await br.close(); process.exit(ok.done() ? 1 : 0);
