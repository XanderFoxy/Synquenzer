// VC2a-fix (Befund 4): Geste mit automatischer Tonart – ein Daten-Ereignis, historyState(k) dort = Projekt nach der Geste
import { launch } from './n5-h-ab-lib.mjs';
for (let run = 1; run <= 2; run++) {
  const {b, p, errs} = await launch({mobile: true});
  await p.evaluate(() => historyCheck());
  const out = [];
  for (const [t, ns] of [[1, [66, 70, 73, 78]], [2, [61, 65, 68, 73]], [1, [60, 64, 67, 72]]]) {
    await p.waitForTimeout(2500);
    const r = await p.evaluate(async ([t, ns]) => {
      const k0 = (await SYNQUENZER.history()).events, keys0 = JSON.stringify(S.tracks.map(x => x.clips[0] && x.clips[0].key));
      SYNQUENZER.setClip(t, 0, {len: 1, notes: ns.map((n, i) => ({t: i, d: 1, n, v: .8}))});
      await new Promise(r => setTimeout(r, 3000));
      histDrainNow();
      const evs = HIST.cur.strs.slice(-((await SYNQUENZER.history()).events - k0)).map(s => JSON.parse(s)).filter(e => e.u !== 'ctx');
      const st = await historyState((await SYNQUENZER.history()).events);
      const now = JSON.parse(serializeProject());
      return {nData: evs.length, u: evs.map(e => e.u + '/' + e.l + ' d' + e.d.length), keyChanged: keys0 !== JSON.stringify(S.tracks.map(x => x.clips[0] && x.clips[0].key)),
        stateEqNow: histEq(histStrip(st), histStrip(now))};
    }, [t, ns]);
    out.push(r); console.log('Lauf', run, JSON.stringify(r));
  }
  console.log('Lauf', run, 'check', JSON.stringify(await p.evaluate(() => historyCheck({detail: true}))), errs.slice(0, 2));
  await b.close();
}
