// V2e′ fix checks: SONG ⇄ label comes back after a lift; hidden page (call/app switch) aborts a drag, deep-equal
import { openVp, mk2, SETUP, PREP, sleep } from './v3-v2e2-lib.mjs';
import { mkCheck } from './v3-v2d-lib.mjs';
const {check, done} = mkCheck();
for (const VP of ['P1', 'L1', 'P3']) {
  const {b, p, errs, cdp} = await openVp(VP);
  const T = mk2(p, cdp), {E} = T;
  await E(SETUP(false)); await E(() => window.SYNQUENZER.songView(false)); await sleep(200); await E(PREP);
  const P0 = await T.full(), k0 = await T.key(0);
  const lbl0 = (await T.corner()).txt;
  await T.down(k0.x, k0.y); await sleep(500);
  const l1 = (await T.corner()).txt;
  await T.up(); await sleep(250);
  if (await T.pop()) await T.tapSel('#popLayer .pop .ps-x');
  const l2 = (await T.corner()).txt;
  check(`${VP} SONG ⇄ zeigt beim Anheben „↖ …“ und danach wieder „${lbl0}“`, /↖/.test(l1) && l2 === lbl0, [lbl0, l1, l2]);
  await T.down(k0.x, k0.y); await sleep(500); await T.glide(k0.x, k0.y, k0.x + 30, k0.y - 30, 4);
  await sleep(700);
  const st0 = await T.drag();
  await E(() => { Object.defineProperty(document, 'hidden', {configurable: true, get: () => true}); document.dispatchEvent(new Event('visibilitychange')); delete document.hidden; });
  await sleep(300);
  const st1 = await T.drag(); await T.up(); await sleep(250);
  check(`${VP} Seite verdeckt (Anruf) während des Ziehens → Abbruch, Clip-Ansicht, deep-equal`, st0 && !st1 && !(await T.songOn()) && (await T.full()) === P0 && !(await E(() => !!document.querySelector('.drg-ghost:not(.gone):not(.fly)'))), [st0, st1]);
  check(`${VP} SONG ⇄ wieder normal`, (await T.corner()).txt === lbl0);
  check(`${VP} 0 Konsolenfehler`, !errs.length, errs);
  await b.close();
}
done();
