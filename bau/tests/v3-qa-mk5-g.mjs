// QA MK5 probe G: arp fields round trip (serializeProject -> importProject, and save -> reload -> load), undo of ARP settings
import { browser, T, ok, J, open } from './v3-qa-mk5-lib.mjs';
await T('Daten arp', async (page, o) => {
  const r = await page.evaluate(async () => {
    H.reset(); const want = {on: 1, latch: 1, type: 3, range: 3, gate: 33, tgt: 2, ks: 1, res: 4, swing: -40, last: 5, steps: 22, tempo: 120};
    for (const k in want) mkSetP(0, 'arp.' + k, want[k], false);
    const p1 = H.Q.project(); const a1 = (p1.project || p1).tracks[0].sound.p.mk.arp;
    importProject(JSON.parse(serializeProject()), []); await H.sl(200);
    const a2 = deep(sndOf(0).p.mk.arp);
    await H.Q.save(); return {want, a1, a2};
  });
  ok('Daten: Arp-Felder in project() und nach importProject gleich', J(r.a1) === J(r.want) && J(r.a2) === J(r.want), J(r));
  await page.reload(); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000}); await page.waitForTimeout(800);
  const a3 = await page.evaluate(async () => { try { await SYNQUENZER.load(); } catch (e) {} await new Promise(r => setTimeout(r, 300)); const s = S.tracks[0].sound; return s && s.p && s.p.mk ? s.p.mk.arp : null; });
  ok('Daten: nach Speichern + Neuladen sind die Arp-Felder gleich', J(a3) === J(r.want), J(a3));
});
await browser.close();
