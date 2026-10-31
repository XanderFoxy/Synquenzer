// S0 Bearbeiten: an/aus per place; other places untouched; own clips; mark.off through ×2, Kopie, Einfügen davor, Löschen; save/load
import {launch, open, sleep, deq, tally} from '../h.mjs';
import {songABA, roundTrip} from '../lib.mjs';
import {snap} from './fx.mjs';
const ok = tally(); const br = await launch();
const states = p => p.evaluate(() => { const s = S.song, o = []; for (let x = 0; x < s.bars; x++) o.push(songStateAt(s, x).lanes.map(l => l.slot < 0 ? -1 : l.slot + ':' + (+l.ph).toFixed(3) + (l.own ? ':' + JSON.stringify(Object.assign({}, s.own[l.own], {from: null})) : ''))); return o; });
const segs = (p, id) => p.evaluate(id => SYNQUENZER.markSegs(id), id);
async function tapSeg(p, id, t, b0) {
  await p.evaluate(id => { if (UI.pop) closePop(); SYNQUENZER.markEdit(id); }, id); await sleep(150);
  const sel = `.msheet .s0-c[data-t="${t}"][data-b="${b0}"]`;
  const el = await p.$(sel); if (!el) return false;
  await el.scrollIntoViewIfNeeded(); await el.tap(); await sleep(150); return true;
}
{
  const H = await open(br), p = H.p; await songABA(p);
  // own clip in M3 (track 0, bar 5 = 2nd bar) and a clip change on track 1 at bar 5
  await p.evaluate(() => { const D = SYNQUENZER; D.makeOwn(0, 5); const s = D.project().song; s.lanes[1].push({bar: 5, slot: 2, re: 1}); s.lanes[1].sort((a, b) => a.bar - b.bar); D.setSong(s); D.songView(true); });
  await sleep(200);
  const S0 = await states(p), b = await snap(p);
  console.log('segs M3', JSON.stringify(await segs(p, 'M3')));
  // track 1: switch off only the 2nd segment (T6)
  ok(await tapSeg(p, 'M3', 1, 1), 'Segment S? T6 da');
  let s1 = await states(p);
  ok(s1.every((r, x) => r.every((v, t) => (t === 1 && x === 5) ? v === -1 : v === S0[x][t])), 'Spur 1 aus nur in T6, alles andere je Takt gleich ' + JSON.stringify(s1.map(r => r[1])) + ' vorher ' + JSON.stringify(S0.map(r => r[1])));
  // track 0 (own clip in T6): off whole place? segments
  const sg0 = (await segs(p, 'M3')).filter(s => s.t === 0); console.log('t0 segs', JSON.stringify(sg0));
  for (const s of sg0) await tapSeg(p, 'M3', 0, s.b0);
  s1 = await states(p);
  ok(s1[4][0] === -1 && s1[5][0] === -1 && s1.every((r, x) => x === 4 || x === 5 || r[0] === S0[x][0]), 'Spur 0 aus in T5–6, sonst gleich');
  const offSong = await snap(p);
  // ×2
  await p.evaluate(() => SYNQUENZER.markAction('M3', 'rep', 2));
  const mk = await p.evaluate(() => SYNQUENZER.project().song.marks);
  console.log('marks after ×2', JSON.stringify(mk.map(m => [m.id, m.a, m.len, !!m.off])));
  const cp = mk.find(m => m.a === 6);
  ok(cp && cp.off && cp.off.length === 3, '×2: die Kopie hat mark.off (' + JSON.stringify(cp && cp.off && cp.off.length) + ')');
  // turn everything on again in the copy → like the original before „aus“
  if (cp) { for (const s of (await segs(p, cp.id)).filter(s => !s.on)) await tapSeg(p, cp.id, s.t, s.b0); }
  let s2 = await states(p);
  ok(deq(s2[6], S0[4]) && deq(s2[7], S0[5]), '×2-Kopie wieder an = Original T5–6 vorher (eigener Clip zurück) ' + JSON.stringify([s2[6], s2[7]]) + ' / ' + JSON.stringify([S0[4], S0[5]]));
  // Einfügen davor (Refrain at bar 0) → M3 moves to bar 6; on again there
  await p.evaluate(() => SYNQUENZER.placePart('P2', 0, 'insert'));
  const m3 = await p.evaluate(() => SYNQUENZER.project().song.marks.find(m => m.id === 'M3'));
  ok(m3 && m3.a === 6 && m3.off, 'Einfügen davor: M3 bei T7 mit off ' + JSON.stringify(m3 && [m3.a, !!m3.off]));
  // save / load
  const rt = await roundTrip(p); ok(deq(rt.a, rt.b), 'Speichern/Laden deep-equal mit off');
  // delete the first bar of M3 via range (Bereich-Leiste Löschen T7)
  await p.evaluate(() => SYNQUENZER.songRange('delete', 6, 6));
  const m3b = await p.evaluate(() => SYNQUENZER.project().song.marks.find(m => m.id === 'M3'));
  const sgb = await segs(p, 'M3');
  console.log('after deleting 1st bar of M3', JSON.stringify(m3b), JSON.stringify(sgb));
  for (const s of sgb.filter(s => !s.on)) await tapSeg(p, 'M3', s.t, s.b0);
  const s3 = await states(p);
  ok(deq(s3[6], S0[5]), 'nach Löschen des 1. Takts: alles wieder an → T7 klingt wie das Original-T6 ' + JSON.stringify(s3[6]) + ' / ' + JSON.stringify(S0[5]));
  ok(!H.errs.length, 'keine Fehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.ctx.close();
}
// split: Als Teil / Zusammenfassen over the 2nd half of a mark with off
{
  const H = await open(br), p = H.p; await songABA(p);
  await p.evaluate(() => { SYNQUENZER.markSeg('M3', 4, 0, false); });
  await p.evaluate(() => SYNQUENZER.songRange('asPart', 4, 4, 'X'));
  const mk = await p.evaluate(() => SYNQUENZER.project().song.marks);
  console.log('marks after asPart T5', JSON.stringify(mk));
  const r = mk.filter(m => m.off);
  ok(r.every(m => m.off.every(o => o.b0 < m.len)), 'nach Teilung hat keine Marke ein off außerhalb ihrer Länge ' + JSON.stringify(r));
  await H.ctx.close();
}
await br.close(); process.exit(ok.done() ? 1 : 0);
