// QA VC2a-08: a real 2-s knob drag (CDP touch, ~60 Hz) on different control types -> exactly 1 data event WITH a curve (<= 50 values)
import { open, T, sleep } from './n5-h-qa-lib.mjs';
const VP = process.argv[2] || 'P1';
const out = [];
async function dragAt(t, x, y, ms = 2000, amp = 60) {
  await t.down(x, y); await sleep(30);
  const t0 = Date.now(); let n = 0;
  while (Date.now() - t0 < ms) { const k = (Date.now() - t0) / 1000; await t.move(x, y - amp * Math.sin(k * Math.PI)); n++; await sleep(16); }
  await t.up(); return {n, dur: Date.now() - t0};
}
async function run(name, setup, findXY) {
  const {b, p, errs, cdp} = await open(VP, {wait: 2000});
  const t = T(p, cdp), E = t.E;
  await E(setup); await sleep(2800); await t.drain(); await E(() => historyCheck()); await sleep(300);
  const xy = await E(findXY);
  if (!xy) { out.push({name, err: 'kein Regler gefunden'}); console.log(name, 'kein Regler gefunden'); await b.close(); return; }
  const n0 = await t.evN(); const u0 = await E(() => UNDO.length);
  const d = await dragAt(t, xy.x, xy.y);
  await sleep(2600); await t.drain(); await E(() => { if (HIST.dirty) histSweep(); });
  const evs = await t.evSince(n0), data = evs.filter(e => e.u !== 'ctx');
  const u1 = await E(() => UNDO.length);
  const r = {name, label: xy.l, moves: d.n, dur: d.dur, undoSteps: u1 - u0, dataEvents: data.length, kinds: data.map(e => e.u + (e.c ? '[c=' + e.c.length + ']' : '[keine Kurve]')).join(' '), check: await E(() => historyCheck())};
  r.ok = r.undoSteps === 1 && data.length === 1 && Array.isArray(data[0].c) && data[0].c.length >= 2 && data[0].c.length <= 50;
  out.push(r); console.log(JSON.stringify(r), errs.length ? errs.slice(0, 2) : '');
  await b.close();
}
// 1 synth editor knob (makeCtl)
await run('Synth-Editor Regler', () => { selectTrack(3); SYNQUENZER.openEditor(); },
  () => { const k = [...document.querySelectorAll('.knob.mctl')].find(x => { const r = x.getBoundingClientRect(); return r.width > 20 && r.top > 60 && r.bottom < innerHeight - 10; }); if (!k) return null; const r = k.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, l: k.getAttribute('aria-label')}; });
// 2 MS 2000 plate knob
await run('MS 2000 Platte Regler', () => { SYNQUENZER.setEngine(0, 'mk'); selectTrack(0); SYNQUENZER.openEditor(); },
  () => { const I = MKUI.panelInfo(); if (!I) return null; const k = I.elements.filter(e => e.art === 'k' && e.zone && !e.grau && e.zone.w > 30 && e.zone.y > 80 && e.zone.y + e.zone.h < innerHeight - 20); const e = k.find(x => /cut|freq|filt/i.test(x.id)) || k[0]; if (!e) return null; return {x: e.zone.x + e.zone.w / 2, y: e.zone.y + e.zone.h / 2, l: e.id}; });
// 3 drum editor knob (makeCtl)
await run('Drum-Editor Regler', () => { selectTrack(DRUM_T); SYNQUENZER.openEditor(); },
  () => { const k = [...document.querySelectorAll('.knob')].find(x => { const r = x.getBoundingClientRect(); return r.width > 20 && r.top > 60 && r.bottom < innerHeight - 10; }); if (!k) return null; const r = k.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, l: k.getAttribute('aria-label')}; });
const bad = out.filter(r => !r.ok);
console.log('BAD', JSON.stringify(bad));
