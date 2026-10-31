import {chromium} from 'playwright';
const file = process.argv[2];
const b = await chromium.launch(); const p = await b.newPage();
await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version);
const r = await p.evaluate(async () => {
  mkLoad(); for (let i = 0; i < 50 && !mkLoaded(); i++) await new Promise(r => setTimeout(r, 100));
  if (window.MKK && MKK.load) try { await MKK.load(); } catch (e) {}
  const out = {n: 0, vib: 0, vibmw: 0, pitchPatch: 0, seqPitch: 0, tune: 0, o2tune: 0, ex: []};
  for (const [id, f] of FACTORY_BY_ID) if (f.engine === 'mk') {
    const p = f.p, mk = p.mk; out.n++;
    for (const t of mk.t.slice(0, mk.mode === 1 || mk.mode === 2 ? 2 : 1)) {
      if (t.vib) { out.vib++; if (p.mw > 0) { out.vibmw++; if (out.ex.length < 6) out.ex.push([id, f.name, 'vib', t.vib, 'mw', p.mw]); } }
      if (t.p.some(q => q.d === 0 && q.i)) out.pitchPatch++;
      if (t.seq.on && t.seq.q.some(q => q.k === 1 || q.k === 6 || q.k === 7)) out.seqPitch++;
      if (t.tune) out.tune++; if (t.o2.tune) out.o2tune++;
    }
  }
  const va = {n: 0, drift: 0, lfoPitch: 0};
  for (const [id, f] of FACTORY_BY_ID) if (f.engine === 'analog' || f.engine === 'wt' || f.engine === 'fm6') { va.n++; const s = soundCopy(f); if (s.p.analog > 0) va.drift++; if (s.mods.some(m => m.dst === 'pitch')) va.lfoPitch++; }
  return {out, va};
});
console.log(JSON.stringify(r));
await b.close();
