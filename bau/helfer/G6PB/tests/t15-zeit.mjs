// G6P-15: Zeit/Speicher – Gospel 8 Takte 120 BPM: erster vollständiger Chor ≤ 4 s (Analyse vorhanden) bzw. ≤ 6 s kalt;
// Mischungs-Wechsel ohne Rechnen; 2 Kopien ≤ 1,6 × eine; ≤ 48 MB bei 6 Chor-Stellen (LRU); Barbershop-Stelle ≤ 14 MB; keine langen Tasks > 50 ms
import {open, sing, melody, inject, report} from './h.mjs';
import {chorOf} from './styles.mjs';
const rows = [], LT = () => { window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({entryTypes: ['longtask']}); };
const y = sing(melody(32), {beats: 32});
for (const warm of [false, true]) {
  const {br, p, errs} = await open();
  const tk = await inject(p, y, {bars: 8}), r = {t: tk.track, s: 0};
  if (warm) await p.evaluate(id => SYNQUENZER.g2Analyse(id), tk.id);   // Takes-Blatt war offen (g2Pre)
  await p.evaluate(LT);
  const ms = await p.evaluate(async ([r, c]) => { const t0 = performance.now(); SYNQUENZER.g6pbSet(r, c); await SYNQUENZER.g6pbWait(r, 30000); return Math.round(performance.now() - t0); }, [r, chorOf('gospel')]);
  const lt = await p.evaluate(() => window.__lt), I = await p.evaluate(() => SYNQUENZER.g6pbInfo());
  rows.push({id: 'G6P-15 ' + (warm ? 'warm' : 'kalt'), ok: ms <= (warm ? 4000 : 6000), msg: `Gospel 3 × 3 Kopien, 16 s: ${ms} ms bis fertig inkl. Lautheit (≤ ${warm ? 4 : 6} s) · Rechengänge ${I.renders} · ${(I.bytes / 1048576).toFixed(1)} MB · Worker-Gänge ${I.lastMs.join('/')} ms`});
  rows.push({id: 'G6P-15 Tasks ' + (warm ? 'warm' : 'kalt'), ok: !lt.some(d => d > 50), msg: `lange Tasks im Haupt-Faden: ${lt.length ? lt.join(', ') + ' ms' : 'keine'}`});
  if (warm) {
    // Mischungs-Wechsel (Pegel, Pan, Breite, Versatz, Gruppen-Klang, Abstand): kein neuer Rechengang
    const r0 = I.renders;
    await p.evaluate(r => { const a = SYNQUENZER.g6pbSet; return true; }, r);
    const after = await p.evaluate(async r => { const c = SYNQUENZER.g6pbInfo(); const x = SYNQUENZER.getClip(r.t, r.s); return c; }, r);
    const r1 = await p.evaluate(async r => { const t0 = performance.now(); const ch = window.__g6pbChor = window.__g6pbChor || null; return 0; }, r);
    const res = await p.evaluate(async ([r, c]) => { c.voices[0].db = -4; c.voices[1].pan = .2; c.voices[2].w = .8; c.voices[0].dbl[1].ms = 30; c.grp.hp = 300; c.grp.below = 12; SYNQUENZER.g6pbSet(r, c); SYNQUENZER.g6pbMixChanged(r); await SYNQUENZER.g6pbWait(r, 20000); return SYNQUENZER.g6pbInfo(); }, [r, chorOf('gospel')]);
    rows.push({id: 'G6P-15 Mischung', ok: res.renders === r0, msg: `Pegel/Pan/Breite/Versatz/Klang/Abstand geändert: Rechengänge ${r0} → ${res.renders} (gleich), neu gemessen in ${res.lu && res.lu.ms} ms`});
    const ct = await p.evaluate(r => SYNQUENZER.g6pbCopyTime(r, 0, [-6, 8]), r), ct3 = await p.evaluate(r => SYNQUENZER.g6pbCopyTime(r, 0, [-10, 5, 12]), r);
    rows.push({id: 'G6P-15 Kopien', ok: ct.ratio <= 1.6, msg: `Stimme mit 2 Kopien ${ct.all} ms gegen eine ${ct.one} ms = ${ct.ratio}× (≤ 1,6); 3 Kopien ${ct3.ratio}×`});
  }
  rows.push({id: 'Fehler', ok: !errs.length, msg: errs.slice(0, 3).join(' | ') || 'keine Seitenfehler'});
  await br.close();
}
// Speicher: 6 Chor-Stellen (Szenen 1–6, je 8 Takte) mit Gospel → LRU hält ≤ 48 MB; eine Barbershop-Stelle ≤ 14 MB
{
  const {br, p, errs} = await open(); let mx = 0;
  for (let s = 0; s < 6; s++) {
    const tk = await inject(p, sing(melody(32), {beats: 32, seed: 3 + s}), {bars: 8, scene: s}), r = {t: tk.track, s};
    await p.evaluate(([r, c]) => { SYNQUENZER.g6pbSet(r, c); return SYNQUENZER.g6pbBufs(r, 30000); }, [r, chorOf('gospel')]);
    const I = await p.evaluate(() => SYNQUENZER.g6pbInfo()); mx = Math.max(mx, I.bytes + I.v1bytes);
  }
  const I = await p.evaluate(() => SYNQUENZER.g6pbInfo());
  rows.push({id: 'G6P-15 48 MB', ok: mx <= 48 * 1048576 && I.evict > 0, msg: `6 Gospel-Stellen: höchstens ${(mx / 1048576).toFixed(1)} MB Chor-Puffer, ${I.evict} verdrängt (LRU)`});
  await p.evaluate(() => SYNQUENZER.g6pbClear());
  const r = {t: (await p.evaluate(() => SYNQUENZER.tkInfo().stimme)), s: 0};
  await p.evaluate(([r, c]) => { SYNQUENZER.g6pbSet(r, c); return SYNQUENZER.g6pbBufs(r, 30000); }, [r, chorOf('barber')]);
  const B = await p.evaluate(() => SYNQUENZER.g6pbInfo());
  rows.push({id: 'G6P-15 Barbershop', ok: B.bytes <= 14 * 1048576, msg: `Barbershop-Stelle (8 Takte): ${(B.bytes / 1048576).toFixed(1)} MB (≤ 14)`});
  rows.push({id: 'Fehler', ok: !errs.length, msg: errs.slice(0, 3).join(' | ') || 'keine Seitenfehler'});
  await br.close();
}
report('G6P-15', rows);
